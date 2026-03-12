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

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const classRoutes = require('./routes/classes');
app.use('/api/classes', classRoutes);

const assignmentRoutes = require('./routes/assignments');
app.use('/api/assignments', assignmentRoutes);

app.get('/', (req, res) => {
  res.send('RootedTeach API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});