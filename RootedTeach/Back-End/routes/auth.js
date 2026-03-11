const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../firebase');
const admin = require('firebase-admin');

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    const existing = await db.collection('users').where('email', '==', email).get();
    if (!existing.empty) {
      return res.status(400).json({ message: 'This email has already been used.' });
    }

    if (!['Teacher', 'Student'].includes(role)) {
      return res.status(400).json({ message: 'Role must be Teacher or Student.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      username,
      email,
      password: hashedPassword,
      role,
      createdAt: new Date().toISOString(),
    };

    const userRef = await db.collection('users').add(newUser);
    res.status(201).json({ message: 'Account Created.', id: userRef.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error Occurred.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const snapshot = await db.collection('users').where('email', '==', email).get();
    if (snapshot.empty) {
      return res.status(400).json({ message: 'Cannot find the email.' });
    }

    const userDoc = snapshot.docs[0];
    const user = userDoc.data();

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect Password.' });
    }

    const token = jwt.sign(
      { id: userDoc.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        _id: userDoc.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error Occurred.' });
  }
});

// Google OAuth
// Frontend sends the Google ID token, we verify it server-side with firebase-admin
// then create or find the user in Firestore and return our own JWT
router.post('/google', async (req, res) => {
  try {
    const { idToken, role } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: 'No ID token provided.' });
    }

    // Use firebase-admin to verify the token — this is the server-side check
    const decoded = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decoded;

    // See if this Google user already has a profile in our users collection
    const snapshot = await db.collection('users').where('email', '==', email).get();

    let userId;
    let userRole;

    if (snapshot.empty) {
      // First time — save them with the role they picked on the signup page
      const newUser = {
        username: name,
        email,
        role: role || 'Student',
        avatar: picture,
        googleUid: uid,
        createdAt: new Date().toISOString(),
      };
      const userRef = await db.collection('users').add(newUser);
      userId = userRef.id;
      userRole = newUser.role;
    } else {
      // Returning user — use their existing role
      const userDoc = snapshot.docs[0];
      userId = userDoc.id;
      userRole = userDoc.data().role;
    }

    // Sign our own JWT so the frontend works exactly the same as email login
    const token = jwt.sign(
      { id: userId, role: userRole },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        _id: userId,
        username: name,
        email,
        role: userRole,
      },
    });
  } catch (error) {
    console.error('Google auth error:', error.message);
    res.status(401).json({ message: 'Google sign-in failed. Please try again.' });
  }
});

router.get('/user', async (req, res) => {
  try {
    const { email } = req.query;
    const snapshot = await db.collection('users').where('email', '==', email).get();
    if (snapshot.empty) {
      return res.status(404).json({ message: 'User not found' });
    }
    const userDoc = snapshot.docs[0];
    const user = userDoc.data();
    res.json({ _id: userDoc.id, username: user.username, email: user.email, role: user.role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;