// detector.js
// AI code detector: Naive Bayes only
// TF disabled — needs 500+ samples to be useful, currently overfits
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const NaiveBayesClassifier = require('./naiveBayes');

let nbClassifier = null;

// ─── Loader ───────────────────────────────────────────────────────────────────

function loadNaiveBayes() {
  if (nbClassifier) return;
  const modelPath = path.join(__dirname, 'nbModel.json');
  if (!fs.existsSync(modelPath)) {
    throw new Error('No Naive Bayes model found. Run trainModel.js first.');
  }
  nbClassifier = new NaiveBayesClassifier();
  nbClassifier.load(modelPath);
  console.log('NB model loaded.');
}

// ─── Main Detector ────────────────────────────────────────────────────────────

async function detectAICode(codeString) {
  if (!codeString || codeString.trim().length === 0) {
    throw new Error('No code provided');
  }

  loadNaiveBayes();

  const { probAI } = nbClassifier.predict(codeString);
  const score = Math.round(probAI * 100);

  // Explainability
  const tokens = nbClassifier.tokenize(codeString);

  const AI_SIGNALS = new Set([
    '__HAS_JSDOC__', '__HEAVY_COMMENTS__', '__VERY_HEAVY_COMMENTS__',
    '__LONG_VAR_NAMES__', '__VERY_LONG_VAR_NAMES__',
    '__STEP_COMMENTS__', '__EDGE_CASE_MENTION__', '__BIG_O_NOTATION__',
    '__TIME_COMPLEXITY_COMMENT__', '__SPACE_COMPLEXITY_COMMENT__',
    '__JSDOC_PARAMS__', '__PROTOTYPE_CALL__', '__NUMBER_GUARDS__', '__THROWS_ERRORS__',
  ]);

  const HUMAN_SIGNALS = new Set([
    '__USES_VAR__', '__HAS_CONSOLE_LOG__', '__TODO_COMMENT__',
    '__CASUAL_COMMENT__', '__MIXED_NAMING__', '__NO_COMMENTS__',
    '__SHORT_VAR_NAMES__', '__VARIED_LINE_LENGTHS__', '__NO_SEMICOLONS__',
  ]);

  const aiSignals = [...new Set(tokens.filter(t => AI_SIGNALS.has(t)))]
    .map(s => s.replace(/__/g, '').replace(/_/g, ' ').toLowerCase());

  const humanSignals = [...new Set(tokens.filter(t => HUMAN_SIGNALS.has(t)))]
    .map(s => s.replace(/__/g, '').replace(/_/g, ' ').toLowerCase());

  return {
    score,
    probAI: Math.round(probAI * 100) / 100,
    probHuman: Math.round((1 - probAI) * 100) / 100,
    nbScore: score,
    tfScore: null,
    aiSignals,
    humanSignals,
  };
}

module.exports = { detectAICode };