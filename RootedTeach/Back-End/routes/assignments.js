const express = require('express');
const router = express.Router();
const { db } = require('../firebase');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');
const { computeStudentGrade, computeClassStats, getUpcomingDeadlines, explainSignals } = require('../utils/gradeUtils');

if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');
const storage = multer.diskStorage({ destination: (req, file, cb) => cb(null,'uploads/'), filename: (req, file, cb) => cb(null,`${Date.now()}-${file.originalname}`) });
const upload = multer({ storage, limits: { fileSize: 10*1024*1024 } });

// POST / — create assignment (Teacher only)
router.post('/', authMiddleware, requireRole('Teacher'), async (req, res) => {
  try {
    const { title, description, dueDate, classId, points } = req.body;
    if (!title || !classId) return res.status(400).json({ message: 'title and classId required.' });

    const classDoc = await db.collection('classes').doc(classId).get();
    if (!classDoc.exists) return res.status(404).json({ message: 'Class not found.' });
    if (classDoc.data().teacher !== req.user.id) return res.status(403).json({ message: 'You do not own this class.' });

    const newAssignment = { title: title.trim(), description: description?.trim() || null, dueDate: dueDate || null, class: classId, createdBy: req.user.id, points: points ? Number(points) : 100, submissions: [], createdAt: new Date().toISOString() };
    const ref = await db.collection('assignments').add(newAssignment);
    res.status(201).json({ id: ref.id, ...newAssignment });
  } catch (e) { console.error(e); res.status(500).json({ message: 'Server Error' }); }
});

// GET /class/:classId — get assignments with populated student info
router.get('/class/:classId', authMiddleware, async (req, res) => {
  try {
    const snap = await db.collection('assignments').where('class','==',req.params.classId).get();
    const assignments = [];

    for (const doc of snap.docs) {
      const data = doc.data();
      let teacher = null;
      if (data.createdBy) {
        const tDoc = await db.collection('users').doc(data.createdBy).get();
        teacher = tDoc.exists ? { _id: tDoc.id, username: tDoc.data().username } : null;
      }
      const submissions = [];
      for (const sub of data.submissions || []) {
        const sDoc = await db.collection('users').doc(sub.student).get();
        const student = sDoc.exists ? { _id: sDoc.id, username: sDoc.data().username, email: sDoc.data().email } : { _id: sub.student };
        // Enrich AI signals with explanations
        const explainedAi = explainSignals(sub.aiSignals || []);
        const explainedHuman = explainSignals(sub.humanSignals || []);
        submissions.push({ ...sub, student, explainedAiSignals: explainedAi, explainedHumanSignals: explainedHuman });
      }
      assignments.push({ id: doc.id, ...data, createdBy: teacher, submissions });
    }
    res.json(assignments);
  } catch (e) { console.error(e); res.status(500).json({ message: 'Server Error' }); }
});

// GET /class/:classId/stats — server-side computation for teacher dashboard
router.get('/class/:classId/stats', authMiddleware, requireRole('Teacher'), async (req, res) => {
  try {
    const classDoc = await db.collection('classes').doc(req.params.classId).get();
    if (!classDoc.exists) return res.status(404).json({ message: 'Class not found.' });
    if (classDoc.data().teacher !== req.user.id) return res.status(403).json({ message: 'Access denied.' });

    const studentIds = classDoc.data().students || [];
    const snap = await db.collection('assignments').where('class','==',req.params.classId).get();
    const assignments = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    // All computation here on the server
    const stats = computeClassStats(assignments, studentIds);
    const upcoming = getUpcomingDeadlines(assignments);

    const studentGrades = [];
    for (const sid of studentIds) {
      const sDoc = await db.collection('users').doc(sid).get();
      if (!sDoc.exists) continue;
      const grade = computeStudentGrade(assignments, sid);
      // Collect all AI scores for this student across submissions
      const aiScores = assignments.flatMap(a =>
        (a.submissions||[]).filter(s => s.student === sid).map(s => s.aiScore).filter(v => v != null)
      );
      const avgAi = aiScores.length ? Math.round(aiScores.reduce((a,b)=>a+b,0)/aiScores.length) : null;
      studentGrades.push({ studentId: sid, username: sDoc.data().username, email: sDoc.data().email, ...grade, avgAiScore: avgAi });
    }
    studentGrades.sort((a,b) => b.pct - a.pct);
    res.json({ ...stats, upcoming, studentGrades });
  } catch (e) { console.error(e); res.status(500).json({ message: 'Server Error' }); }
});

// GET /class/:classId/my-grade — student's own grade summary
router.get('/class/:classId/my-grade', authMiddleware, requireRole('Student'), async (req, res) => {
  try {
    const classDoc = await db.collection('classes').doc(req.params.classId).get();
    if (!classDoc.exists) return res.status(404).json({ message: 'Class not found.' });
    if (!(classDoc.data().students||[]).includes(req.user.id)) return res.status(403).json({ message: 'Not enrolled.' });

    const snap = await db.collection('assignments').where('class','==',req.params.classId).get();
    const assignments = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    const grade = computeStudentGrade(assignments, req.user.id);
    const upcoming = getUpcomingDeadlines(assignments);
    res.json({ ...grade, upcoming });
  } catch (e) { console.error(e); res.status(500).json({ message: 'Server Error' }); }
});

// POST /:id/submit — file upload + AI detection + ACID transaction
router.post('/:id/submit', authMiddleware, requireRole('Student'), upload.single('file'), async (req, res) => {
  try {
    const studentId = req.user.id; // Always from JWT, never from body

    const assignmentRef = db.collection('assignments').doc(req.params.id);
    const assignmentDoc = await assignmentRef.get();
    if (!assignmentDoc.exists) return res.status(404).json({ message: 'Assignment not found.' });
    const aData = assignmentDoc.data();

    // Verify student is enrolled
    const classDoc = await db.collection('classes').doc(aData.class).get();
    if (!classDoc.exists) return res.status(404).json({ message: 'Class not found.' });
    if (!(classDoc.data().students||[]).includes(studentId)) return res.status(403).json({ message: 'Not enrolled in this class.' });

    // Check due date server-side
    if (aData.dueDate && new Date() > new Date(aData.dueDate)) {
      return res.status(400).json({ message: 'This assignment is past its due date.' });
    }

    let aiScore = null, aiLabel = null, aiSignals = [], humanSignals = [], filePath = null, fileName = null;

    if (req.file) {
      filePath = req.file.path;
      fileName = req.file.originalname;
      const codeExts = ['.js','.py','.java','.cpp','.c','.ts','.cs','.go','.rb','.swift','.kt'];
      if (codeExts.includes(path.extname(fileName).toLowerCase())) {
        try {
          const code = fs.readFileSync(filePath, 'utf-8');
          const mlRes = await fetch('http://localhost:3001/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code }),
          });
          const result = await mlRes.json();
          aiScore = result.score;
          aiLabel = result.label;
          aiSignals = result.aiSignals || [];
          humanSignals = result.humanSignals || [];
        } catch (mlErr) { console.warn('ML service unavailable:', mlErr.message); }
      }
    }

    // ACID transaction — prevents race conditions on concurrent submits
    await db.runTransaction(async (transaction) => {
      const fresh = await transaction.get(assignmentRef);
      const submissions = [...(fresh.data().submissions||[])];
      const idx = submissions.findIndex(s => s.student === studentId);
      const newSub = { student: studentId, filePath, fileName, aiScore, aiLabel, aiSignals, humanSignals, score: null, feedback: null, submittedAt: new Date().toISOString() };
      if (idx >= 0) {
        submissions[idx] = { ...newSub, score: submissions[idx].score, feedback: submissions[idx].feedback };
      } else {
        submissions.push(newSub);
      }
      transaction.update(assignmentRef, { submissions });
    });

    res.json({ message: 'Submitted successfully', aiScore, aiLabel, aiSignals, humanSignals, fileName });
  } catch (e) { console.error(e); res.status(500).json({ message: 'Server Error' }); }
});

// POST /:id/grade/:studentId — Teacher grades a submission
router.post('/:id/grade/:studentId', authMiddleware, requireRole('Teacher'), async (req, res) => {
  try {
    const { score, feedback } = req.body;
    if (score === undefined || score === null) return res.status(400).json({ message: 'Score required.' });

    const assignmentRef = db.collection('assignments').doc(req.params.id);
    const assignmentDoc = await assignmentRef.get();
    if (!assignmentDoc.exists) return res.status(404).json({ message: 'Assignment not found.' });

    const classDoc = await db.collection('classes').doc(assignmentDoc.data().class).get();
    if (classDoc.data().teacher !== req.user.id) return res.status(403).json({ message: 'Access denied.' });

    await db.runTransaction(async (transaction) => {
      const fresh = await transaction.get(assignmentRef);
      const submissions = [...(fresh.data().submissions||[])];
      const idx = submissions.findIndex(s => s.student === req.params.studentId);
      if (idx === -1) throw new Error('Submission not found.');
      submissions[idx] = { ...submissions[idx], score: Number(score), feedback: feedback?.trim()||null, gradedAt: new Date().toISOString(), gradedBy: req.user.id };
      transaction.update(assignmentRef, { submissions });
    });

    res.json({ message: 'Graded.', score, feedback });
  } catch (e) {
    if (e.message === 'Submission not found.') return res.status(404).json({ message: e.message });
    console.error(e); res.status(500).json({ message: 'Server Error' });
  }
});

// DELETE /:id — Teacher deletes assignment
router.delete('/:id', authMiddleware, requireRole('Teacher'), async (req, res) => {
  try {
    const doc = await db.collection('assignments').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ message: 'Assignment not found.' });
    const classDoc = await db.collection('classes').doc(doc.data().class).get();
    if (classDoc.data().teacher !== req.user.id) return res.status(403).json({ message: 'Access denied.' });
    await db.collection('assignments').doc(req.params.id).delete();
    res.json({ message: 'Assignment deleted.' });
  } catch (e) { console.error(e); res.status(500).json({ message: 'Server Error' }); }
});

module.exports = router;
