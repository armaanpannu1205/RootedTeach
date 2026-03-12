// mlServer.js
// Express server that exposes our AI detection model as a REST API
// Runs on port 3001, called by the main backend when a student submits code
// Usage: node mlServer.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { detectAICode } = require('./detector');

const app = express();

// store uploaded files in memory so we don't litter the disk
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

// POST /analyze
// accepts either a file upload or raw code in the request body
// returns a score 0-100, a label, and the signals dat influenced the result
app.post('/analyze', upload.single('file'), async (req, res) => {
  try {
    let code = '';

    // prefer file upload, fall back to raw code string in body
    if (req.file) {
      code = req.file.buffer.toString('utf-8');
    } else if (req.body.code) {
      code = req.body.code;
    } else {
      return res.status(400).json({ error: 'No code provided' });
    }

    const result = await detectAICode(code);

    // log to terminal so we can sanity-check during dev
    console.log('SCORE:', result.score);
    console.log('AI signals:', result.aiSignals);
    console.log('Human signals:', result.humanSignals);

    res.json({
      score: result.score,
      label: result.score >= 50 ? 'Likely AI-written' : 'Likely Human-written',
      probAI: result.probAI,
      probHuman: result.probHuman,
      nbScore: result.nbScore,
      tfScore: result.tfScore,       // null for now, TF model is disabled // fixed 
      aiSignals: result.aiSignals,
      humanSignals: result.humanSignals,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3001, () => console.log('ML API running on http://localhost:3001'));