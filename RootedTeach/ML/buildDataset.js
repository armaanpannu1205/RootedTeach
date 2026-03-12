// buildDataset.js
// Generates AI-labeled training samples using Claude API ONLY
// Human samples come from fetchGithubSamples.js — NOT generated here
//
// Usage: node buildDataset.js
// Output: dataset.json (AI samples merged with existing human samples)
require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const PROBLEMS = [
  'Write a function that reverses a string',
  'Write a function that checks if a number is prime',
  'Write a function that finds the maximum value in an array',
  'Write a function that flattens a nested array',
  'Write a function that counts word frequency in a string',
  'Write a function that implements binary search',
  'Write a function that removes duplicates from an array',
  'Write a function that deep clones an object',
  'Write a function that debounces another function',
  'Write a function that implements a simple stack',
  'Write a function that merges two sorted arrays',
  'Write a function that checks if a string is a palindrome',
  'Write a function that converts celsius to fahrenheit',
  'Write a function that capitalizes the first letter of each word',
  'Write a function that finds all pairs that sum to a target',
  'Write a quick function to check if two strings are anagrams',
  'Write a function to chunk an array into groups of size n',
  'Write a function to throttle another function',
  'Write a function to get the intersection of two arrays',
  'Write a function to convert a number to roman numerals',
  'Write a function to validate an email address with regex',
  'Write a function to shuffle an array randomly',
  'Write a function to group array elements by a key',
  'Write a function to pipe multiple functions together',
  'Write a function to memoize another function',
];

// Varied AI styles so the model doesn't just learn "JSDoc = AI"
const AI_STYLES = [
  'Write clean, well-commented, professional code with full JSDoc documentation.',
  'Write it concisely and efficiently with minimal comments.',
  'Write it with some inline comments but no JSDoc blocks.',
  'Write it professionally but skip the documentation — just clean readable code.',
  'Write it with brief comments explaining the key steps only.',
];

async function generateAICode(problem) {
  const style = AI_STYLES[Math.floor(Math.random() * AI_STYLES.length)];
  const res = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 400,
    messages: [{
      role: 'user',
      content: `${problem} in JavaScript. ${style} Return only the code, no markdown.`
    }]
  });

  const text = res.content[0].text;
  const match = text.match(/```(?:javascript|js)?\n([\s\S]*?)```/);
  return match ? match[1].trim() : text.trim();
}

async function buildDataset() {
  // Load existing dataset if it exists
  let existing = [];
  if (fs.existsSync('dataset.json')) {
    existing = JSON.parse(fs.readFileSync('dataset.json', 'utf-8'));
    console.log(`Loaded existing dataset: ${existing.length} samples`);
  }

  // Keep ALL label=0 samples (real GitHub human code only)
  // Discard ALL label=1 samples and regenerate fresh AI ones
  const humanSamples = existing.filter(s => s.label === 0);
  const existingAI   = existing.filter(s => s.label === 1);

  console.log(`Human samples (from GitHub): ${humanSamples.length}`);
  console.log(`Existing AI samples (discarding): ${existingAI.length}`);
  console.log(`\nGenerating ${PROBLEMS.length} fresh AI samples...\n`);

  const aiSamples = [...existingAI];
  let count = 0;

  for (const problem of PROBLEMS) {
    try {
      const aiCode = await generateAICode(problem);
      aiSamples.push({ code: aiCode, label: 1 });
      count++;
      console.log(`[${count}/${PROBLEMS.length}] AI — "${problem.slice(0, 50)}"`);
      await new Promise(r => setTimeout(r, 500));
    } catch (err) {
      console.error(`Failed on: ${problem}`, err.message);
    }
  }

  // Merge: real human samples + fresh AI samples only
  const dataset = [...humanSamples, ...aiSamples];
  fs.writeFileSync('dataset.json', JSON.stringify(dataset, null, 2));

  const finalAI    = dataset.filter(s => s.label === 1).length;
  const finalHuman = dataset.filter(s => s.label === 0).length;

  console.log(`\nDone! Saved ${dataset.length} samples to dataset.json`);
  console.log(`AI: ${finalAI}, Human: ${finalHuman}`);

  if (Math.abs(finalAI - finalHuman) > 10) {
    console.warn(`\nWARNING: Still imbalanced. Run fetchGithubSamples.js to add more human samples.`);
  }
}

buildDataset();