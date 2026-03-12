// trainTF.js
// Trains the TensorFlow neural network on dataset.json
// Saves model to ./model/ and normalization params to normParams.json
//
// Usage: node trainTF.js
require('dotenv').config();

const tf = require('@tensorflow/tfjs-node');
const fs = require('fs');
const { extractFeatures } = require('./featureExtractor');

const NUM_FEATURES = 7;
const EPOCHS = 80;
const BATCH_SIZE = 8;

function loadDataset() {
  if (!fs.existsSync('dataset.json')) {
    throw new Error('dataset.json not found. Run buildDataset.js first.');
  }
  const raw = JSON.parse(fs.readFileSync('dataset.json', 'utf-8'));

  const features = [];
  const labels = [];

  for (const sample of raw) {
    try {
      const f = extractFeatures(sample.code);
      features.push(f);
      labels.push(sample.label);
    } catch (e) {
      console.warn('Skipping sample:', e.message);
    }
  }

  return { features, labels };
}

function normalizeFeatures(features) {
  const mins = Array(NUM_FEATURES).fill(Infinity);
  const maxs = Array(NUM_FEATURES).fill(-Infinity);

  for (const row of features) {
    for (let i = 0; i < NUM_FEATURES; i++) {
      if (row[i] < mins[i]) mins[i] = row[i];
      if (row[i] > maxs[i]) maxs[i] = row[i];
    }
  }

  const normalized = features.map(row =>
    row.map((val, i) => {
      const range = maxs[i] - mins[i];
      return range === 0 ? 0 : (val - mins[i]) / range;
    })
  );

  return { normalized, mins, maxs };
}

function buildModel() {
  const model = tf.sequential();

  model.add(tf.layers.dense({
    inputShape: [NUM_FEATURES],
    units: 32,
    activation: 'relu',
  }));

  model.add(tf.layers.dropout({ rate: 0.3 }));

  model.add(tf.layers.dense({
    units: 16,
    activation: 'relu',
  }));

  model.add(tf.layers.dropout({ rate: 0.2 }));

  model.add(tf.layers.dense({
    units: 8,
    activation: 'relu',
  }));

  model.add(tf.layers.dense({
    units: 1,
    activation: 'sigmoid',
  }));

  model.compile({
    optimizer: tf.train.adam(0.001),
    loss: 'binaryCrossentropy',
    metrics: ['accuracy'],
  });

  return model;
}

async function train() {
  console.log('Loading dataset...');
  const { features, labels } = loadDataset();
  console.log(`Loaded ${features.length} samples`);

  const { normalized, mins, maxs } = normalizeFeatures(features);

  const xs = tf.tensor2d(normalized);
  const ys = tf.tensor2d(labels, [labels.length, 1]);

  const model = buildModel();
  model.summary();

  console.log('\nTraining TF model...');
  await model.fit(xs, ys, {
    epochs: EPOCHS,
    batchSize: BATCH_SIZE,
    validationSplit: 0.2,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        if ((epoch + 1) % 10 === 0) {
          console.log(`Epoch ${epoch + 1}/${EPOCHS} — loss: ${logs.loss.toFixed(4)}, acc: ${logs.acc.toFixed(4)}, val_acc: ${logs.val_acc.toFixed(4)}`);
        }
      }
    }
  });

  await model.save('file://./model');
  console.log('\nTF model saved to ./model/');

  fs.writeFileSync('normParams.json', JSON.stringify({ mins, maxs }, null, 2));
  console.log('Normalization params saved to normParams.json');

  xs.dispose();
  ys.dispose();
}

train();