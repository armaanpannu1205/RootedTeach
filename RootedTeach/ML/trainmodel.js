// trainModel.js
// Trains Naive Bayes on the full dataset (no random split waste)
// Uses k-fold cross validation for honest accuracy reporting
//
// Usage: node trainModel.js
require('dotenv').config();
const fs = require('fs');
const NaiveBayesClassifier = require('./naiveBayes');

function loadDataset() {
  if (!fs.existsSync('dataset.json')) {
    throw new Error('dataset.json not found. Run buildDataset.js and fetchGithubSamples.js first.');
  }
  return JSON.parse(fs.readFileSync('dataset.json', 'utf-8'));
}

// K-fold cross validation — gives a stable accuracy estimate
// regardless of how the data happens to be shuffled
function kFoldEvaluate(dataset, k = 5) {
  const shuffled = [...dataset].sort(() => Math.random() - 0.5);
  const foldSize = Math.floor(shuffled.length / k);

  let totalTP = 0, totalTN = 0, totalFP = 0, totalFN = 0;

  for (let i = 0; i < k; i++) {
    const testStart = i * foldSize;
    const testEnd = testStart + foldSize;
    const testFold = shuffled.slice(testStart, testEnd);
    const trainFold = [
      ...shuffled.slice(0, testStart),
      ...shuffled.slice(testEnd),
    ];

    const clf = new NaiveBayesClassifier();
    clf.train(trainFold);

    for (const sample of testFold) {
      const { probAI } = clf.predict(sample.code);
      const predicted = probAI >= 0.5 ? 1 : 0;
      if (predicted === 1 && sample.label === 1) totalTP++;
      else if (predicted === 0 && sample.label === 0) totalTN++;
      else if (predicted === 1 && sample.label === 0) totalFP++;
      else totalFN++;
    }
  }

  const total = totalTP + totalTN + totalFP + totalFN;
  const accuracy  = (totalTP + totalTN) / total;
  const precision = totalTP / Math.max(totalTP + totalFP, 1);
  const recall    = totalTP / Math.max(totalTP + totalFN, 1);
  const f1        = 2 * (precision * recall) / Math.max(precision + recall, 0.001);

  return { accuracy, precision, recall, f1, totalTP, totalTN, totalFP, totalFN };
}

function train() {
  console.log('Loading dataset...');
  const dataset = loadDataset();
  const aiCount    = dataset.filter(s => s.label === 1).length;
  const humanCount = dataset.filter(s => s.label === 0).length;
  console.log(`Loaded ${dataset.length} samples (${aiCount} AI, ${humanCount} human)`);

  if (Math.abs(aiCount - humanCount) > 10) {
    console.warn(`\nWARNING: Dataset is imbalanced (${aiCount} AI vs ${humanCount} human).`);
    console.warn('Run buildDataset.js to generate more AI samples, or fetchGithubSamples.js for more human samples.\n');
  }

  // Step 1: k-fold cross validation for honest accuracy reporting
  const k = Math.min(5, Math.floor(dataset.length / 10));
  console.log(`Running ${k}-fold cross validation...`);
  const metrics = kFoldEvaluate(dataset, k);

  console.log('\n--- Cross-Validation Results ---');
  console.log(`Accuracy:  ${(metrics.accuracy  * 100).toFixed(1)}%`);
  console.log(`Precision: ${(metrics.precision * 100).toFixed(1)}%`);
  console.log(`Recall:    ${(metrics.recall    * 100).toFixed(1)}%`);
  console.log(`F1 Score:  ${(metrics.f1        * 100).toFixed(1)}%`);
  console.log(`\nConfusion Matrix (across all folds):`);
  console.log(`  TP: ${metrics.totalTP}  FP: ${metrics.totalFP}`);
  console.log(`  FN: ${metrics.totalFN}  TN: ${metrics.totalTN}`);

  // Step 2: Train final model on ALL data for best real-world performance
  console.log(`\nTraining final model on all ${dataset.length} samples...`);
  const finalClassifier = new NaiveBayesClassifier();
  finalClassifier.train(dataset);

  finalClassifier.save('nbModel.json');
  console.log('NB model saved to nbModel.json');
}

train();