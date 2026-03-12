const express = require('express');
const router = express.Router();
const { db } = require('../firebase');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');

async function enrichClass(doc, includeStats = false) {
  const data = doc.data();
  const teacherDoc = await db.collection('users').doc(data.teacher).get();
  const teacher = teacherDoc.exists ? { _id: teacherDoc.id, username: teacherDoc.data().username } : null;

  let assignmentCount = 0, upcomingCount = 0;
  if (includeStats) {
    const aSnap = await db.collection('assignments').where('class','==',doc.id).get();
    const now = new Date();
    assignmentCount = aSnap.size;
    upcomingCount = aSnap.docs.filter(a => a.data().dueDate && new Date(a.data().dueDate) > now).length;
  }

  return { id: doc.id, ...data, teacher, assignmentCount, upcomingCount };
}

// POST / — create class (Teacher only)
router.post('/', authMiddleware, requireRole('Teacher'), async (req, res) => {
  try {
    const { className, quarter, color } = req.body;
    if (!className) return res.status(400).json({ message: 'Class name required.' });
    const teacherId = req.user.id;

    // Unique 6-char class code — server generates it
    let classCode, attempts = 0;
    do {
      classCode = Math.random().toString(36).slice(2, 8).toUpperCase();
      const ex = await db.collection('classes').where('classCode','==',classCode).get();
      if (ex.empty) break;
    } while (++attempts < 5);

    const newClass = { className: className.trim(), teacher: teacherId, quarter: quarter?.trim() || null, color: color || '#0f1646', classCode, students: [], createdAt: new Date().toISOString() };
    const ref = await db.collection('classes').add(newClass);
    res.status(201).json({ id: ref.id, ...newClass });
  } catch (e) { console.error(e); res.status(500).json({ message: 'Server Error' }); }
});

// GET /teacher/:teacherId — BEFORE /:id
router.get('/teacher/:teacherId', authMiddleware, requireRole('Teacher'), async (req, res) => {
  try {
    if (req.params.teacherId !== req.user.id) return res.status(403).json({ message: 'Access denied.' });
    const snap = await db.collection('classes').where('teacher','==',req.params.teacherId).get();
    const classes = await Promise.all(snap.docs.map(doc => enrichClass(doc, true)));
    res.json(classes);
  } catch (e) { console.error(e); res.status(500).json({ message: 'Server Error' }); }
});

// GET /student/:studentId — BEFORE /:id
router.get('/student/:studentId', authMiddleware, async (req, res) => {
  try {
    if (req.params.studentId !== req.user.id) return res.status(403).json({ message: 'Access denied.' });
    const snap = await db.collection('classes').where('students','array-contains',req.params.studentId).get();
    const classes = [];
    for (const doc of snap.docs) {
      const data = doc.data();
      const teacherDoc = await db.collection('users').doc(data.teacher).get();
      const teacher = teacherDoc.exists ? { _id: teacherDoc.id, username: teacherDoc.data().username } : null;

      // Server-side compute submitted + upcoming counts for this student
      const aSnap = await db.collection('assignments').where('class','==',doc.id).get();
      const now = new Date();
      let submitted = 0, upcoming = 0;
      for (const aDoc of aSnap.docs) {
        const aData = aDoc.data();
        const hasSub = (aData.submissions||[]).some(s => s.student === req.params.studentId);
        if (hasSub) submitted++;
        if (aData.dueDate && new Date(aData.dueDate) > now && !hasSub) upcoming++;
      }
      classes.push({ id: doc.id, ...data, teacher, assignments: aSnap.size, submitted, upcoming });
    }
    res.json(classes);
  } catch (e) { console.error(e); res.status(500).json({ message: 'Server Error' }); }
});

// POST /join — BEFORE /:id
router.post('/join', authMiddleware, requireRole('Student'), async (req, res) => {
  try {
    const { classCode } = req.body;
    const studentId = req.user.id;
    if (!classCode) return res.status(400).json({ message: 'Class code is required.' });

    const snap = await db.collection('classes').where('classCode','==',classCode.toUpperCase().trim()).get();
    if (snap.empty) return res.status(404).json({ message: 'Invalid class code. Please check with your professor.' });

    const classDoc = snap.docs[0];
    const data = classDoc.data();
    if ((data.students||[]).includes(studentId)) return res.status(400).json({ message: 'You are already enrolled in this class.' });

    await db.collection('classes').doc(classDoc.id).update({ students: [...(data.students||[]), studentId] });
    const teacherDoc = await db.collection('users').doc(data.teacher).get();
    const teacher = teacherDoc.exists ? { _id: teacherDoc.id, username: teacherDoc.data().username } : null;

    res.json({ message: 'Joined class successfully', class: { id: classDoc.id, ...data, teacher, assignments: 0, upcoming: 0, submitted: 0 } });
  } catch (e) { console.error(e); res.status(500).json({ message: 'Server Error' }); }
});

// DELETE /:id/students/:studentId — Teacher removes student
router.delete('/:id/students/:studentId', authMiddleware, requireRole('Teacher'), async (req, res) => {
  try {
    const classDoc = await db.collection('classes').doc(req.params.id).get();
    if (!classDoc.exists) return res.status(404).json({ message: 'Class not found.' });
    if (classDoc.data().teacher !== req.user.id) return res.status(403).json({ message: 'Access denied.' });
    const students = (classDoc.data().students||[]).filter(s => s !== req.params.studentId);
    await db.collection('classes').doc(req.params.id).update({ students });
    res.json({ message: 'Student removed.' });
  } catch (e) { console.error(e); res.status(500).json({ message: 'Server Error' }); }
});

// POST /:id/students
router.post('/:id/students', authMiddleware, requireRole('Teacher'), async (req, res) => {
  try {
    const { studentId } = req.body;
    if (!studentId) return res.status(400).json({ message: 'studentId required.' });
    const classDoc = await db.collection('classes').doc(req.params.id).get();
    if (!classDoc.exists) return res.status(404).json({ message: 'Class not found.' });
    if (classDoc.data().teacher !== req.user.id) return res.status(403).json({ message: 'Access denied.' });
    const data = classDoc.data();
    if ((data.students||[]).includes(studentId)) return res.status(400).json({ message: 'Student already in class.' });
    await db.collection('classes').doc(req.params.id).update({ students: [...(data.students||[]), studentId] });
    res.json({ message: 'Student added.' });
  } catch (e) { console.error(e); res.status(500).json({ message: 'Server Error' }); }
});

// DELETE /:id — delete class + all its assignments
router.delete('/:id', authMiddleware, requireRole('Teacher'), async (req, res) => {
  try {
    const classDoc = await db.collection('classes').doc(req.params.id).get();
    if (!classDoc.exists) return res.status(404).json({ message: 'Class not found.' });
    if (classDoc.data().teacher !== req.user.id) return res.status(403).json({ message: 'Access denied.' });
    const aSnap = await db.collection('assignments').where('class','==',req.params.id).get();
    const batch = db.batch();
    aSnap.docs.forEach(d => batch.delete(d.ref));
    batch.delete(db.collection('classes').doc(req.params.id));
    await batch.commit();
    res.json({ message: 'Class deleted.' });
  } catch (e) { console.error(e); res.status(500).json({ message: 'Server Error' }); }
});

// GET /:id — LAST so it doesn't swallow named routes
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const classDoc = await db.collection('classes').doc(req.params.id).get();
    if (!classDoc.exists) return res.status(404).json({ message: 'Class not found.' });
    const data = classDoc.data();
    const isTeacher = data.teacher === req.user.id;
    const isStudent = (data.students||[]).includes(req.user.id);
    if (!isTeacher && !isStudent) return res.status(403).json({ message: 'Access denied.' });
    const teacherDoc = await db.collection('users').doc(data.teacher).get();
    const teacher = teacherDoc.exists ? { _id: teacherDoc.id, username: teacherDoc.data().username } : null;
    res.json({ id: classDoc.id, ...data, teacher });
  } catch (e) { console.error(e); res.status(500).json({ message: 'Server Error' }); }
});

module.exports = router;
