// fetchGithubSamples.js
// Fetches real JavaScript code from GitHub as human-written training samples
// Targets student projects, homework, and casual code — NOT polished libraries
// Usage: node fetchGithubSamples.js

const fs = require('fs');
require('dotenv').config();
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const HEADERS = {
  Accept: 'application/vnd.github.v3+json',
  'User-Agent': 'ai-code-detector-trainer',
  ...(GITHUB_TOKEN ? { Authorization: `Bearer ${GITHUB_TOKEN}` } : {}),
};

// Target messy, real student/hobbyist code — NOT utility libraries
// Avoid searching for function names that appear in polished libraries
const SEARCH_QUERIES = [
  // Student homework / CS assignments
  'homework javascript function user:student size:<800',
  'cs101 javascript function size:<800',
  'assignment javascript TODO console.log size:<600',
  'practice javascript function size:<600',
  'leetcode javascript solution size:<800',
  'javascript console.log var function size:<500',
  // Casual personal projects
  'script.js function var console.log size:<600',
  'helper.js javascript function size:<500',
  'utils.js javascript var function size:<600',
  'index.js javascript function console.log size:<500',
  // Beginner patterns — var, no semicolons, debug logs
  'javascript var function TODO size:<500',
  'javascript function FIXME console.log size:<500',
];

async function searchCode(query) {
  const url = `https://api.github.com/search/code?q=${encodeURIComponent(query)}&per_page=8`;
  const res = await fetch(url, { headers: HEADERS });

  if (!res.ok) {
    console.error(`Search failed: ${res.status} ${res.statusText}`);
    return [];
  }

  const data = await res.json();
  return data.items || [];
}

async function fetchRawContent(rawUrl) {
  const res = await fetch(rawUrl, { headers: HEADERS });
  if (!res.ok) return null;
  return res.text();
}

function looksPolished(code) {
  // Reject code that looks like a library — too clean, has JSDoc, no debug logs
  const hasJsdoc = /\/\*\*[\s\S]*?\*\//.test(code);
  const hasConsoleLog = /console\.log/.test(code);
  const hasVar = /\bvar\s+/.test(code);
  const hasTodo = /\/\/\s*(TODO|FIXME|lol|idk|wtf)/i.test(code);
  const hasBigO = /O\([nN1log\s]+\)/.test(code);
  const hasComplexityComment = /time complexity|space complexity/i.test(code);

  // If it has JSDoc or complexity comments and no human signals — skip it
  if ((hasJsdoc || hasBigO || hasComplexityComment) && !hasConsoleLog && !hasVar && !hasTodo) {
    return true;
  }
  return false;
}

function extractFunctions(code) {
  const chunks = [];
  const funcRegex = /(?:function\s+\w+|const\s+\w+\s*=\s*(?:function|\([^)]*\)\s*=>))[^}]*\{[^{}]*(?:\{[^{}]*\}[^{}]*)?\}/g;
  let match;
  while ((match = funcRegex.exec(code)) !== null) {
    const chunk = match[0].trim();
    if (chunk.length > 60 && chunk.length < 800) {
      // Skip chunks that look too polished / library-like
      if (!looksPolished(chunk)) {
        chunks.push(chunk);
      }
    }
  }
  return chunks;
}

async function fetchGithubSamples() {
  const humanSamples = [];
  let skipped = 0;

  for (const query of SEARCH_QUERIES) {
    console.log(`\nSearching: ${query}`);

    const items = await searchCode(query);
    console.log(`  Found ${items.length} files`);

    for (const item of items) {
      try {
        const rawUrl = item.html_url
          .replace('github.com', 'raw.githubusercontent.com')
          .replace('/blob/', '/');

        const code = await fetchRawContent(rawUrl);
        if (!code) continue;

        const functions = extractFunctions(code);
        skipped += (code.match(/function/g) || []).length - functions.length;

        for (const fn of functions) {
          humanSamples.push({ code: fn, label: 0 });
        }

        if (functions.length > 0) {
          console.log(`  ✓ ${item.repository.full_name} — kept ${functions.length} functions`);
        }

        await new Promise(r => setTimeout(r, 400));
      } catch (err) {
        console.error(`  ✗ Failed: ${err.message}`);
      }
    }

    await new Promise(r => setTimeout(r, 1200));
  }

  console.log(`\nTotal human samples collected: ${humanSamples.length}`);
  console.log(`Polished/library samples filtered out: ~${skipped}`);

  // Merge with existing dataset — keep AI samples, replace human samples
  let existing = [];
  if (fs.existsSync('dataset.json')) {
    existing = JSON.parse(fs.readFileSync('dataset.json', 'utf-8'));
  }

  const aiSamples = existing.filter(s => s.label === 1);
  const merged = [...aiSamples, ...humanSamples];

  fs.writeFileSync('dataset.json', JSON.stringify(merged, null, 2));
  console.log(`\nDataset saved: ${aiSamples.length} AI + ${humanSamples.length} human = ${merged.length} total`);

  if (humanSamples.length < aiSamples.length) {
    console.warn(`WARNING: Still need more human samples. Try running again or broadening queries.`);
  }
}

fetchGithubSamples();