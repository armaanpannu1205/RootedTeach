/* classes.js - API file for managing class creation, enrollment, and announcements. */
/* SECURITY UPDATE: Added strict RBAC (Role-Based Access Control) to protect class data! 🔒 */

const express = require('express');
const router = express.Router();
const { db } = require('../firebase');

// Bring in our security bouncers
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');

// ════════════════════════════
//   TEACHER ONLY ROUTES
// ════════════════════════════

// Create a new class
// PROTECTED: Only Teachers can create classes
router.post('/', authMiddleware, requireRole('Teacher'), async (req, res) => {
  try {
    const { className, teacherId, quarter, color, syllabus } = req.body;
    // Generate a random 6-character class code
    const classCode = Math.random().toString(36).slice(2, 8).toUpperCase();
    
    const newClass = { 
      className, 
      // Safely use the token's user ID if teacherId isn't passed
      teacher: teacherId || req.user._id, 
      quarter: quarter || null, 
      color: color || '#0f1646', 
      classCode, 
      students: [], 
      syllabus: syllabus || null, 
      createdAt: new Date().toISOString() 
    };
    
    const classRef = await db.collection('classes').add(newClass);
    res.status(201).json({ id: classRef.id, ...newClass });
  } catch (error) { 
    console.error(error); 
    res.status(500).json({ message: 'Server Error' }); 
  }
});

// Get the Teacher's class list
// PROTECTED: Only Teachers should be querying by teacherId
router.get('/teacher/:teacherId', authMiddleware, requireRole('Teacher'), async (req, res) => {
  try {
    const snapshot = await db.collection('classes').where('teacher', '==', req.params.teacherId).get();
    const classes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(classes);
  } catch (error) { 
    console.error(error); 
    res.status(500).json({ message: 'Server Error' }); 
  }
});

// Update class information (name, color, syllabus, etc.)
// PROTECTED: Only Teachers
router.put('/:id', authMiddleware, requireRole('Teacher'), async (req, res) => {
  try {
    const { className, quarter, color, syllabus } = req.body;
    const updateData = {};
    if (className !== undefined) updateData.className = className;
    if (quarter   !== undefined) updateData.quarter   = quarter;
    if (color     !== undefined) updateData.color     = color;
    if (syllabus  !== undefined) updateData.syllabus  = syllabus;
    
    await db.collection('classes').doc(req.params.id).update(updateData);
    res.json({ message: 'Class updated', ...updateData });
  } catch (err) { 
    console.error(err); 
    res.status(500).json({ message: 'Server error' }); 
  }
});

// Delete Class and cascade delete all its assignments
// PROTECTED: Only Teachers
router.delete('/:id', authMiddleware, requireRole('Teacher'), async (req, res) => {
  try {
    const classRef = db.collection('classes').doc(req.params.id);
    const classDoc = await classRef.get();
    if (!classDoc.exists) return res.status(404).json({ message: 'Class not found' });
    
    // Cleanup: Delete all assignments tied to this class
    const assignments = await db.collection('assignments').where('class', '==', req.params.id).get();
    const batch = db.batch();
    assignments.docs.forEach(doc => batch.delete(doc.ref));
    batch.delete(classRef);
    await batch.commit();

    res.json({ message: 'Class and assignments deleted' });
  } catch (err) { 
    console.error(err); 
    res.status(500).json({ message: 'Server error' }); 
  }
});

// Post an announcement to the class
// PROTECTED: Only Teachers
router.post('/:id/announcements', authMiddleware, requireRole('Teacher'), async (req, res) => {
  try {
    const { title, body, teacherName } = req.body;
    if (!title || !body) return res.status(400).json({ message: 'Title and body required' });
    
    const classRef = db.collection('classes').doc(req.params.id);
    const classDoc = await classRef.get();
    if (!classDoc.exists) return res.status(404).json({ message: 'Class not found' });
    
    const existing = classDoc.data().announcements || [];
    const newAnn = { 
      id: Date.now().toString(), 
      title, 
      body, 
      teacherName: teacherName || req.user.username || 'Instructor', 
      createdAt: new Date().toISOString() 
    };
    
    await classRef.update({ announcements: [...existing, newAnn] });
    res.json(newAnn);
  } catch (err) { 
    console.error(err); 
    res.status(500).json({ message: 'Server error' }); 
  }
});

// Delete an announcement
// PROTECTED: Only Teachers
router.delete('/:id/announcements/:annId', authMiddleware, requireRole('Teacher'), async (req, res) => {
  try {
    const classRef = db.collection('classes').doc(req.params.id);
    const classDoc = await classRef.get();
    if (!classDoc.exists) return res.status(404).json({ message: 'Class not found' });
    
    const filtered = (classDoc.data().announcements || []).filter(a => a.id !== req.params.annId);
    await classRef.update({ announcements: filtered });
    res.json({ success: true });
  } catch (err) { 
    console.error(err); 
    res.status(500).json({ message: 'Server error' }); 
  }
});

// Manually add students to the class
// PROTECTED: Only Teachers should be able to force-add a student
router.post('/:id/students', authMiddleware, requireRole('Teacher'), async (req, res) => {
  try {
    const { studentId } = req.body;
    const classDoc = await db.collection('classes').doc(req.params.id).get();
    if (!classDoc.exists) return res.status(404).json({ message: 'Class not found' });
    
    const data = classDoc.data();
    if ((data.students || []).includes(studentId)) return res.status(400).json({ message: 'Student already in class' });
    
    await db.collection('classes').doc(req.params.id).update({ students: [...(data.students || []), studentId] });
    res.json({ message: 'Student added successfully' });
  } catch (error) { 
    console.error(error); 
    res.status(500).json({ message: 'Server Error' }); 
  }
});


// ════════════════════════════
//   STUDENT ONLY ROUTES
// ════════════════════════════

// Get a list of classes the student is enrolled in
// PROTECTED: Only Students (though technically a teacher could have a student view, sticking to Student for now)
router.get('/student/:studentId', authMiddleware, requireRole('Student'), async (req, res) => {
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
  } catch (error) { 
    console.error(error); 
    res.status(500).json({ message: 'Server Error' }); 
  }
});

// Attend a class using a class code
// PROTECTED: Only Students should be using class codes to join
router.post('/join', authMiddleware, requireRole('Student'), async (req, res) => {
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
  } catch (error) { 
    console.error(error); 
    res.status(500).json({ message: 'Server Error' }); 
  }
});


// ════════════════════════════
//   GENERAL AUTHENTICATED ROUTES
// ════════════════════════════

// Get class details
// PROTECTED: Anyone logged in can view class details (if they have the ID)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const classDoc = await db.collection('classes').doc(req.params.id).get();
    if (!classDoc.exists) return res.status(404).json({ message: 'Class not found' });
    
    const data = classDoc.data();
    const teacherDoc = await db.collection('users').doc(data.teacher).get();
    const teacher = teacherDoc.exists ? { _id: teacherDoc.id, ...teacherDoc.data() } : null;
    
    res.json({ id: classDoc.id, ...data, teacher });
  } catch (error) { 
    console.error(error); 
    res.status(500).json({ message: 'Server Error' }); 
  }
});

// Remove a student from the class (either the student leaving, or teacher kicking them)
// PROTECTED: Anyone logged in (Validation of WHO is making the request could be added here later)
router.delete('/:id/students/:studentId', authMiddleware, async (req, res) => {
  try {
    const classRef = db.collection('classes').doc(req.params.id);
    const classDoc = await classRef.get();
    if (!classDoc.exists) return res.status(404).json({ message: 'Class not found' });
    
    const students = (classDoc.data().students || []).filter(s => s !== req.params.studentId);
    await classRef.update({ students });
    
    res.json({ message: 'Left class successfully' });
  } catch (err) { 
    console.error(err); 
    res.status(500).json({ message: 'Server error' }); 
  }
});

// Get a list of ALL classes in the system
// PROTECTED: Currently just authMiddleware, but consider restricting to Admin/Teacher later!
router.get('/', authMiddleware, async (req, res) => {
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
  } catch (error) { 
    console.error(error); 
    res.status(500).json({ message: 'Server Error' }); 
  }
});

module.exports = router;