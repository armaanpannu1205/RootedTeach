const express = require('express');
const cors = require('cors');
require('dotenv').config();
require('./firebase');

const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Server-side rate limiter — no external package
const hits = {};
app.use((req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  if (!hits[ip] || now - hits[ip].start > 60000) hits[ip] = { count: 1, start: now };
  else { hits[ip].count++; if (hits[ip].count > 200) return res.status(429).json({ message: 'Too many requests.' }); }
  next();
});

app.use('/api/auth',        require('./routes/auth'));
app.use('/api/classes',     require('./routes/classes'));
app.use('/api/assignments', require('./routes/assignments'));

app.get('/', (req, res) => res.json({ message: 'RootedTeach API is running.', ts: new Date().toISOString() }));
app.use((req, res) => res.status(404).json({ message: `Route ${req.method} ${req.path} not found.` }));
app.use((err, req, res, next) => { console.error(err); res.status(500).json({ message: 'Internal server error.' }); });

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
