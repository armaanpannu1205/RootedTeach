const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../firebase');
const admin = require('firebase-admin');
const { authMiddleware } = require('../middleware/authMiddleware');

function signToken(id, role) {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password) return res.status(400).json({ message: 'All fields required.' });
    if (!['Teacher','Student'].includes(role)) return res.status(400).json({ message: 'Role must be Teacher or Student.' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters.' });

    const existing = await db.collection('users').where('email','==',email.toLowerCase()).get();
    if (!existing.empty) return res.status(400).json({ message: 'This email has already been used.' });

    const hashed = await bcrypt.hash(password, 10);
    const newUser = { username: username.trim(), email: email.toLowerCase(), password: hashed, role, createdAt: new Date().toISOString() };
    const ref = await db.collection('users').add(newUser);

    res.status(201).json({ message: 'Account Created.', token: signToken(ref.id, role), user: { _id: ref.id, username: newUser.username, email: newUser.email, role } });
  } catch (e) { console.error(e); res.status(500).json({ message: 'Server Error.' }); }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required.' });

    const snap = await db.collection('users').where('email','==',email.toLowerCase()).get();
    if (snap.empty) return res.status(400).json({ message: 'Cannot find the email.' });

    const doc = snap.docs[0];
    const user = doc.data();
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Incorrect Password.' });

    res.json({ token: signToken(doc.id, user.role), user: { _id: doc.id, username: user.username, email: user.email, role: user.role } });
  } catch (e) { console.error(e); res.status(500).json({ message: 'Server Error.' }); }
});

// Google OAuth — verifies ID token server-side with firebase-admin, issues our own JWT
router.post('/google', async (req, res) => {
  try {
    const { idToken, role } = req.body;
    if (!idToken) return res.status(400).json({ message: 'No ID token provided.' });

    const decoded = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decoded;

    const snap = await db.collection('users').where('email','==',email.toLowerCase()).get();
    let userId, userRole, username;

    if (snap.empty) {
      const assignedRole = ['Teacher','Student'].includes(role) ? role : 'Student';
      const newUser = { username: name || email.split('@')[0], email: email.toLowerCase(), role: assignedRole, avatar: picture || null, googleUid: uid, createdAt: new Date().toISOString() };
      const ref = await db.collection('users').add(newUser);
      userId = ref.id; userRole = assignedRole; username = newUser.username;
    } else {
      const doc = snap.docs[0];
      userId = doc.id; userRole = doc.data().role; username = doc.data().username;
    }

    res.json({ token: signToken(userId, userRole), user: { _id: userId, username, email: email.toLowerCase(), role: userRole } });
  } catch (e) { console.error('Google auth error:', e.message); res.status(401).json({ message: 'Google sign-in failed.' }); }
});

// Get user by email
router.get('/user', authMiddleware, async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: 'Email required.' });
    const snap = await db.collection('users').where('email','==',email.toLowerCase()).get();
    if (snap.empty) return res.status(404).json({ message: 'User not found.' });
    const doc = snap.docs[0], u = doc.data();
    res.json({ _id: doc.id, username: u.username, email: u.email, role: u.role });
  } catch (e) { console.error(e); res.status(500).json({ message: 'Server Error.' }); }
});

// Get current user from token
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const doc = await db.collection('users').doc(req.user.id).get();
    if (!doc.exists) return res.status(404).json({ message: 'User not found.' });
    const u = doc.data();
    res.json({ _id: doc.id, username: u.username, email: u.email, role: u.role });
  } catch (e) { console.error(e); res.status(500).json({ message: 'Server Error.' }); }
});

module.exports = router;
