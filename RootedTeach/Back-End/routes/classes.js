const express = require('express');
const router = express.Router();
const { db } = require('../firebase');

// Create a class
router.post('/', async (req, res) => {
  try {
    const { className, teacherId, quarter, color } = req.body;

    // Generate a random 6-char class code
    const classCode = Math.random().toString(36).slice(2, 8).toUpperCase();

    const newClass = {
      className,
      teacher: teacherId,
      quarter: quarter || null,
      color: color || '#0f1646',
      classCode,
      students: [],
      createdAt: new Date().toISOString(),
    };

    const classRef = await db.collection('classes').add(newClass);
    res.status(201).json({ id: classRef.id, ...newClass });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get all classes
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('classes').get();
    const classes = [];

    for (const doc of snapshot.docs) {
      const data = doc.data();

      // Get teacher info
      const teacherDoc = await db.collection('users').doc(data.teacher).get();
      const teacher = teacherDoc.exists ? { _id: teacherDoc.id, ...teacherDoc.data() } : null;

      // Get students info
      const students = [];
      for (const studentId of data.students || []) {
        const studentDoc = await db.collection('users').doc(studentId).get();
        if (studentDoc.exists) {
          const s = studentDoc.data();
          students.push({ _id: studentDoc.id, username: s.username, email: s.email });
        }
      }

      classes.push({ id: doc.id, ...data, teacher, students });
    }

    res.json(classes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get class by ID
router.get('/:id', async (req, res) => {
  try {
    const classDoc = await db.collection('classes').doc(req.params.id).get();
    if (!classDoc.exists) return res.status(404).json({ message: 'Class not found' });

    const data = classDoc.data();

    // Get teacher info
    const teacherDoc = await db.collection('users').doc(data.teacher).get();
    const teacher = teacherDoc.exists ? { _id: teacherDoc.id, ...teacherDoc.data() } : null;

    // Get students info
    const students = [];
    for (const studentId of data.students || []) {
      const studentDoc = await db.collection('users').doc(studentId).get();
      if (studentDoc.exists) {
        const s = studentDoc.data();
        students.push({ _id: studentDoc.id, username: s.username, email: s.email });
      }
    }

    res.json({ id: classDoc.id, ...data, teacher, students });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get classes by teacher ID
router.get('/teacher/:teacherId', async (req, res) => {
  try {
    const snapshot = await db.collection('classes')
      .where('teacher', '==', req.params.teacherId)
      .get();

    const classes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(classes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Join class by class code (student)
router.post('/join', async (req, res) => {
  try {
    const { classCode, studentId } = req.body;

    const snapshot = await db.collection('classes').where('classCode', '==', classCode).get();
    if (snapshot.empty) return res.status(404).json({ message: 'Class not found' });

    const classDoc = snapshot.docs[0];
    const data = classDoc.data();

    if (data.students.includes(studentId)) {
      return res.status(400).json({ message: 'Student already in class' });
    }

    await db.collection('classes').doc(classDoc.id).update({
      students: [...data.students, studentId],
    });

    res.json({ message: 'Joined class successfully', classId: classDoc.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Add student by ID directly
router.post('/:id/students', async (req, res) => {
  try {
    const { studentId } = req.body;
    const classDoc = await db.collection('classes').doc(req.params.id).get();
    if (!classDoc.exists) return res.status(404).json({ message: 'Class not found' });

    const data = classDoc.data();
    if (data.students.includes(studentId)) {
      return res.status(400).json({ message: 'Student already in class' });
    }

    await db.collection('classes').doc(req.params.id).update({
      students: [...data.students, studentId],
    });

    res.json({ message: 'Student added successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

router.get('/student/:studentId', async (req, res) => {
  try {
    const snapshot = await db.collection('classes')
      .where('students', 'array-contains', req.params.studentId)
      .get();
    const classes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(classes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;