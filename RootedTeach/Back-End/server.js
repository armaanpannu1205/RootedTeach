const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Initialize Firebase first
require('./firebase');

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use('/uploads', express.static('uploads')); // serve submitted + attached files

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const classRoutes = require('./routes/classes');
app.use('/api/classes', classRoutes);

const assignmentRoutes = require('./routes/assignments');
app.use('/api/assignments', assignmentRoutes);

// ── Claude AI proxy ────────────────────────────────────────
const fs_server = require('fs');
app.post('/api/claude', async (req, res) => {
  try {
    const { prompt, filePath } = req.body;
    if (!prompt) return res.status(400).json({ message: 'prompt required' });
    if (!process.env.ANTHROPIC_API_KEY) return res.status(500).json({ message: 'ANTHROPIC_API_KEY not set in .env' });

    // Read submitted code file if path provided
    let codeContent = null;
    if (filePath) {
      try {
        const safePath = filePath.replace(/\.\./g, ''); // prevent path traversal
        codeContent = fs_server.readFileSync(safePath, 'utf-8');
      } catch (e) { codeContent = null; }
    }

    const fullPrompt = codeContent
      ? `${prompt}\n\nHere is the actual submitted code:\n\`\`\`\n${codeContent.slice(0, 6000)}\n\`\`\``
      : prompt;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-6',
        max_tokens: 1500,
        messages: [{ role: 'user', content: fullPrompt }],
      }),
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json(data);
    const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('');
    res.json({ text });
  } catch (err) {
    console.error('Claude proxy error:', err);
    res.status(500).json({ message: 'Failed to reach Claude API' });
  }
});

app.get('/', (req, res) => {
  res.send('RootedTeach API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});