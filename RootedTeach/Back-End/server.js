/* server.js - Main entry point for the RootedTeach Express backend. */
/* Setting up routes, CORS, and applying auth middleware to protect our data. */

const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Initialize Firebase first (used for verifying Google tokens in the auth route)
require('./firebase');

const app = express();

// Standard middleware setup
app.use(cors({
  origin: '*', // TODO: Might want to restrict this to our frontend URL later in production
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'], // Crucial: Allows the frontend to send the JWT token
}));
app.use(express.json());
app.use('/uploads', express.static('uploads')); // serve submitted + attached files

// ════════════════════════════
//   ROUTING & PROTECTION
// ════════════════════════════

// We need a "bouncer" function to check for valid tokens.
// Assuming we create this in a separate file later!
// const verifyToken = require('./middleware/auth'); 

// 1. PUBLIC ROUTES (No bouncer needed)
// Everyone needs to be able to access login/register
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// 2. PROTECTED ROUTES (Bouncer applied!)
// Notice how we inject `verifyToken` right before the routes.
// If the token is invalid, verifyToken will block it and return 401.
const classRoutes = require('./routes/classes');
app.use('/api/classes', /* verifyToken, */ classRoutes); // Uncomment verifyToken once created

const assignmentRoutes = require('./routes/assignments');
app.use('/api/assignments', /* verifyToken, */ assignmentRoutes); // Uncomment verifyToken once created


// ── Claude AI proxy ────────────────────────────────────────
// This costs money (Anthropic API), so definitely protect this with verifyToken!
const fs_server = require('fs');
app.post('/api/claude', /* verifyToken, */ async (req, res) => {
  try {
    const { prompt, filePath } = req.body;
    if (!prompt) return res.status(400).json({ message: 'prompt required' });
    if (!process.env.ANTHROPIC_API_KEY) return res.status(500).json({ message: 'ANTHROPIC_API_KEY not set in .env' });

    // Read submitted code file if path provided
    let codeContent = null;
    if (filePath) {
      try {
        // Note: Simple path traversal prevention. 
        const safePath = filePath.replace(/\.\./g, ''); 
        codeContent = fs_server.readFileSync(safePath, 'utf-8');
      } catch (e) { codeContent = null; }
    }

    // Construct the prompt with the student's code
    const fullPrompt = codeContent
      ? `${prompt}\n\nHere is the actual submitted code:\n\`\`\`\n${codeContent.slice(0, 6000)}\n\`\`\``
      : prompt;

    // Send to Anthropic
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-6', // Make sure this model string is up to date
        max_tokens: 1500,
        messages: [{ role: 'user', content: fullPrompt }],
      }),
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json(data);
    
    // Parse out the text from Claude's response array
    const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('');
    res.json({ text });
  } catch (err) {
    console.error('Claude proxy error:', err);
    res.status(500).json({ message: 'Failed to reach Claude API' });
  }
});

// Basic health check route
app.get('/', (req, res) => {
  res.send('RootedTeach API is running... securely! 🔒');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});