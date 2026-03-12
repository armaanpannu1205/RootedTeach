const express = require('express');
const router = express.Router();
const { db } = require('../firebase');

router.post('/', async (req, res) => {
  try {
    const { className, teacherId, quarter, color, syllabus } = req.body;
    const classCode = Math.random().toString(36).slice(2, 8).toUpperCase();
    const newClass = { className, teacher: teacherId, quarter: quarter || null, color: color || '#0f1646', classCode, students: [], syllabus: syllabus || null, createdAt: new Date().toISOString() };
    const classRef = await db.collection('classes').add(newClass);
    res.status(201).json({ id: classRef.id, ...newClass });
  } catch (error) { console.error(error); res.status(500).json({ message: 'Server Error' }); }
});

router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('classes').get();
    const classes = [];
    for (const doc of snapshot.docs) {
      const data = doc.data();
      const teacherDoc = await db.collection('users').doc(data.teacher).get();
      const teacher = teacherDoc.exists ? { _id: teacherDoc.id, ...teacherDoc.data() } : null;
      classes.push({ id: doc.id, ...data, teacher });
    }
    res.json(classes);
  } catch (error) { console.error(error); res.status(500).json({ message: 'Server Error' }); }
});

router.get('/teacher/:teacherId', async (req, res) => {
  try {
    const snapshot = await db.collection('classes').where('teacher', '==', req.params.teacherId).get();
    const classes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(classes);
  } catch (error) { console.error(error); res.status(500).json({ message: 'Server Error' }); }
});

router.get('/student/:studentId', async (req, res) => {
  try {
    const snapshot = await db.collection('classes').where('students', 'array-contains', req.params.studentId).get();
    const classes = [];
    for (const doc of snapshot.docs) {
      const data = doc.data();
      const teacherDoc = await db.collection('users').doc(data.teacher).get();
      const teacher = teacherDoc.exists ? { _id: teacherDoc.id, username: teacherDoc.data().username } : null;
      classes.push({ id: doc.id, ...data, teacher });
    }
    res.json(classes);
  } catch (error) { console.error(error); res.status(500).json({ message: 'Server Error' }); }
});

router.post('/join', async (req, res) => {
  try {
    const { classCode, studentId } = req.body;
    if (!classCode || !studentId) return res.status(400).json({ message: 'classCode and studentId are required' });
    const snapshot = await db.collection('classes').where('classCode', '==', classCode.toUpperCase()).get();
    if (snapshot.empty) return res.status(404).json({ message: 'Invalid class code. Please check with your professor.' });
    const classDoc = snapshot.docs[0];
    const data = classDoc.data();
    if ((data.students || []).includes(studentId)) return res.status(400).json({ message: 'You are already enrolled in this class.' });
    await db.collection('classes').doc(classDoc.id).update({ students: [...(data.students || []), studentId] });
    const teacherDoc = await db.collection('users').doc(data.teacher).get();
    const teacher = teacherDoc.exists ? { _id: teacherDoc.id, username: teacherDoc.data().username } : null;
    res.json({ message: 'Joined class successfully', class: { id: classDoc.id, ...data, teacher } });
  } catch (error) { console.error(error); res.status(500).json({ message: 'Server Error' }); }
});

router.post('/:id/students', async (req, res) => {
  try {
    const { studentId } = req.body;
    const classDoc = await db.collection('classes').doc(req.params.id).get();
    if (!classDoc.exists) return res.status(404).json({ message: 'Class not found' });
    const data = classDoc.data();
    if ((data.students || []).includes(studentId)) return res.status(400).json({ message: 'Student already in class' });
    await db.collection('classes').doc(req.params.id).update({ students: [...(data.students || []), studentId] });
    res.json({ message: 'Student added successfully' });
  } catch (error) { console.error(error); res.status(500).json({ message: 'Server Error' }); }
});

router.get('/:id', async (req, res) => {
  try {
    const classDoc = await db.collection('classes').doc(req.params.id).get();
    if (!classDoc.exists) return res.status(404).json({ message: 'Class not found' });
    const data = classDoc.data();
    const teacherDoc = await db.collection('users').doc(data.teacher).get();
    const teacher = teacherDoc.exists ? { _id: teacherDoc.id, ...teacherDoc.data() } : null;
    res.json({ id: classDoc.id, ...data, teacher });
  } catch (error) { console.error(error); res.status(500).json({ message: 'Server Error' }); }
});

// ── PUT /:id — update class name, quarter, color, syllabus ─
router.put('/:id', async (req, res) => {
  try {
    const { className, quarter, color, syllabus } = req.body;
    const updateData = {};
    if (className !== undefined) updateData.className = className;
    if (quarter   !== undefined) updateData.quarter   = quarter;
    if (color     !== undefined) updateData.color     = color;
    if (syllabus  !== undefined) updateData.syllabus  = syllabus;
    await db.collection('classes').doc(req.params.id).update(updateData);
    res.json({ message: 'Class updated', ...updateData });
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
});

// ── POST /:id/announcements — post announcement ──────────────────────────
router.post('/:id/announcements', async (req, res) => {
  try {
    const { title, body, teacherName } = req.body;
    if (!title || !body) return res.status(400).json({ message: 'Title and body required' });
    const classRef = db.collection('classes').doc(req.params.id);
    const classDoc = await classRef.get();
    if (!classDoc.exists) return res.status(404).json({ message: 'Class not found' });
    const existing = classDoc.data().announcements || [];
    const newAnn = { id: Date.now().toString(), title, body, teacherName: teacherName || 'Instructor', createdAt: new Date().toISOString() };
    await classRef.update({ announcements: [...existing, newAnn] });
    res.json(newAnn);
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
});

// ── DELETE /:id/announcements/:annId — delete announcement ───────────────
router.delete('/:id/announcements/:annId', async (req, res) => {
  try {
    const classRef = db.collection('classes').doc(req.params.id);
    const classDoc = await classRef.get();
    if (!classDoc.exists) return res.status(404).json({ message: 'Class not found' });
    const filtered = (classDoc.data().announcements || []).filter(a => a.id !== req.params.annId);
    await classRef.update({ announcements: filtered });
    res.json({ success: true });
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;