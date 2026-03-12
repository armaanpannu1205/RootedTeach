// detector.js
// Main entry point for AI code detection — ties together the Naive Bayes model
// and produces an explainability report (which signals fired and why)
//
// Note: TensorFlow model is disabled — it needs 500+ balanced samples to be
// useful and currently overfits badly on our smaller dataset. NB works fine.

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const NaiveBayesClassifier = require('./naiveBayes');

// keep the classifier in memory so we don't reload from disk on every request
let nbClassifier = null;

// ─── Loader 

function loadNaiveBayes() {
  if (nbClassifier) return; // already loaded, skip
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

  // run the classifier — probAI is a value from 0.0 to 1.0
  const { probAI } = nbClassifier.predict(codeString);
  const score = Math.round(probAI * 100);

  // tokenize again so we can report which signals fired for explainability
  const tokens = nbClassifier.tokenize(codeString);

  // subset of tokens that are meaningful enough to show to the teacher
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

  // convert internal token names to readable strings for the UI
  const aiSignals = [...new Set(tokens.filter(t => AI_SIGNALS.has(t)))]
    .map(s => s.replace(/__/g, '').replace(/_/g, ' ').toLowerCase());

  const humanSignals = [...new Set(tokens.filter(t => HUMAN_SIGNALS.has(t)))]
    .map(s => s.replace(/__/g, '').replace(/_/g, ' ').toLowerCase());

  return {
    score,
    probAI: Math.round(probAI * 100) / 100,
    probHuman: Math.round((1 - probAI) * 100) / 100,
    nbScore: score,
    tfScore: null,   // TF disabled
    aiSignals,
    humanSignals,
  };
}

module.exports = { detectAICode };