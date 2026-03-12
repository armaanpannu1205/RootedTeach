require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { detectAICode } = require('./detector');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

app.post('/analyze', upload.single('file'), async (req, res) => {
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
    console.log('SCORE:', result.score);
    console.log('AI signals:', result.aiSignals);
    console.log('Human signals:', result.humanSignals);

    res.json({
      score: result.score,
      label: result.score >= 50 ? 'Likely AI-written' : 'Likely Human-written',
      probAI: result.probAI,
      probHuman: result.probHuman,
      nbScore: result.nbScore,
      tfScore: result.tfScore,
      aiSignals: result.aiSignals,
      humanSignals: result.humanSignals,
    });
    

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3001, () => console.log('ML API running on http://localhost:3001'));