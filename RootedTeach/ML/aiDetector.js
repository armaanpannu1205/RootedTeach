require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { detectAICode } = require('./detector');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

// POST /analyze with raw code in body
app.post('/analyze', async (req, res) => {
  try {
    let code = '';

    if (req.file) {
      code = req.file.buffer.toString('utf-8');
    } else if (req.body.code) {
      code = req.body.code;
    } else {
      return res.status(400).json({ error: 'No code provided' });
    }

    const result = await detectAICode(code);

    res.json({
      score: result.score,
      label: result.score >= 60 ? 'Likely AI-written' : 'Likely Human-written',
      features: result.features,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3001, () => console.log('ML API running on http://localhost:3001'));