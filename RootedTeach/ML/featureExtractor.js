// featureExtractor.js
// Pulls out 7 numerical features from a code string for the TensorFlow model
// These are lower-level style metrics — things like avg line length and comment
// density — as opposed to the token-based signals Naive Bayes uses

require('dotenv').config();

function extractFeatures(code) {
  const lines = code.split('\n');
  const nonEmpty = lines.filter(l => l.trim().length > 0);

  // return a fixed-length feature vector — order matters, matches the TF model input
  return [
    getAvgLineLength(nonEmpty),
    getCommentDensity(lines),
    getBlankLineRatio(lines),
    getIndentConsistency(nonEmpty),
    getAvgVarNameLength(code),
    getUniqueVarRatio(code),
    getLineLengthVariance(nonEmpty),
  ];
}

// average characters per non-empty line — AI tends to write longer, more descriptive lines
function getAvgLineLength(nonEmpty) {
  if (nonEmpty.length === 0) return 0;
  return nonEmpty.reduce((s, l) => s + l.length, 0) / nonEmpty.length;
}

// fraction of lines that are comments — AI heavily over-comments
function getCommentDensity(lines) {
  if (lines.length === 0) return 0;
  const comments = lines.filter(l => {
    const t = l.trim();
    return t.startsWith('//') || t.startsWith('#') || t.startsWith('*') || t.startsWith('/*');
  });
  return comments.length / lines.length;
}

// fraction of lines that are blank — AI loves visual spacing between sections
function getBlankLineRatio(lines) {
  if (lines.length === 0) return 0;
  return lines.filter(l => l.trim().length === 0).length / lines.length;
}

// returns 1 if all indentation levels are multiples of the base indent, 0 otherwise
// humans are messier with indentation
function getIndentConsistency(nonEmpty) {
  const indents = nonEmpty.map(l => (l.match(/^(\s*)/) || ['', ''])[1].length);
  const nonZero = indents.filter(i => i > 0);
  if (nonZero.length === 0) return 1;
  const min = Math.min(...nonZero);
  if (min === 0) return 0;
  return nonZero.every(i => i % min === 0) ? 1 : 0;
}

// average length of identifier names — AI uses longer, more descriptive names
function getAvgVarNameLength(code) {
  const vars = code.match(/\b[a-z][a-zA-Z0-9_]{1,}\b/g);
  if (!vars || vars.length === 0) return 0;
  return vars.reduce((s, v) => s + v.length, 0) / vars.length;
}

// ratio of unique identifiers to total — humans reuse short names more
function getUniqueVarRatio(code) {
  const vars = code.match(/\b[a-z][a-zA-Z0-9_]{1,}\b/g);
  if (!vars || vars.length === 0) return 0;
  return new Set(vars).size / vars.length;
}

// standard deviation of line lengths — humans write more inconsistently
function getLineLengthVariance(nonEmpty) {
  if (nonEmpty.length === 0) return 0;
  const lengths = nonEmpty.map(l => l.length);
  const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const variance = lengths.reduce((s, l) => s + Math.pow(l - avg, 2), 0) / lengths.length;
  return Math.sqrt(variance);
}

module.exports = { extractFeatures };