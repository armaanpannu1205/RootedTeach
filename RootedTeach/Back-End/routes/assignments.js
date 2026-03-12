/* assignments.js - API file for managing assignments, submissions, and grading. */
/* SECURITY UPDATE: All routes are now protected with authMiddleware and requireRole! 🔒 */

const express = require('express');
const router = express.Router();
const { db } = require('../firebase');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Import our security bouncers
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');

if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

// Only allow code file types to prevent malicious uploads
const CODE_EXTENSIONS = ['.js', '.py', '.java', '.cpp', '.c', '.ts', '.cs', '.go', '.rb', '.swift', '.kt', '.rs', '.php'];

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// For student submissions: strict filter for code files only
const uploadCodeOnly = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (CODE_EXTENSIONS.includes(ext)) cb(null, true);
    else cb(new Error(`Only code files allowed: ${CODE_EXTENSIONS.join(', ')}`));
  },
});


// ════════════════════════════
//   TEACHER ONLY ROUTES
// ════════════════════════════

// Create assignment and save to Firebase
// PROTECTED: Only Teachers can create assignments
router.post('/', authMiddleware, requireRole('Teacher'), upload.single('file'), async (req, res) => {
  try {
    const { title, description, dueDate, classId, teacherId, points } = req.body;
    const newAssignment = {
      title,
      class: classId,
      // Fallback to the authenticated user's ID if teacherId isn't provided
      createdBy: teacherId || req.user._id || 'unknown',
      points: points ? Number(points) : 100,
      submissions: [],
      createdAt: new Date().toISOString(),
    };
    if (description) newAssignment.description = description;
    if (dueDate) newAssignment.dueDate = dueDate;
    if (req.file) {
      newAssignment.attachedFilePath = req.file.path;
      newAssignment.attachedFileName = req.file.originalname;
    }
    const ref = await db.collection('assignments').add(newAssignment);
    res.status(201).json({ id: ref.id, ...newAssignment });
  } catch (error) { 
    console.error(error); 
    res.status(500).json({ message: 'Server Error' }); 
  }
});

// Student submissions with scores and feedback
// PROTECTED: Only Teachers can assign grades
router.post('/:id/grade/:studentId', authMiddleware, requireRole('Teacher'), async (req, res) => {
  try {
    const { score, feedback } = req.body;
    if (score === undefined || score === null) return res.status(400).json({ message: 'score is required' });
    const assignmentRef = db.collection('assignments').doc(req.params.id);

    // Using transaction to prevent race conditions when updating grades
    await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(assignmentRef);
      if (!doc.exists) throw new Error('Assignment not found');
      
      const submissions = [...(doc.data().submissions || [])];
      const idx = submissions.findIndex(s => s.student === req.params.studentId);
      if (idx === -1) throw new Error('Submission not found');
      
      submissions[idx] = { 
        ...submissions[idx], 
        score: Number(score), 
        feedback: feedback || null, 
        gradedAt: new Date().toISOString() 
      };
      transaction.update(assignmentRef, { submissions });
    });

    res.json({ message: 'Graded successfully' });
  } catch (error) {
    console.error(error);
    if (error.message === 'Assignment not found') return res.status(404).json({ message: error.message });
    if (error.message === 'Submission not found') return res.status(404).json({ message: error.message });
    res.status(500).json({ message: 'Server Error' });
  }
});

// Delete the assignment
// PROTECTED: Only Teachers can delete assignments
router.delete('/:id', authMiddleware, requireRole('Teacher'), async (req, res) => {
  try {
    await db.collection('assignments').doc(req.params.id).delete();
    res.json({ message: 'Assignment deleted' });
  } catch (error) { 
    console.error(error); 
    res.status(500).json({ message: 'Server Error' }); 
  }
});

// Get grade statistics for the specified class
// PROTECTED: Only Teachers should see full class stats
router.get('/class/:classId/stats', authMiddleware, requireRole('Teacher'), async (req, res) => {
  try {
    const classId = req.params.classId;

    // Get enrolled students
    const classDoc = await db.collection('classes').doc(classId).get();
    if (!classDoc.exists) return res.status(404).json({ message: 'Class not found' });
    const studentIds = classDoc.data().students || [];
    
    // If no students, return empty stats immediately
    if (studentIds.length === 0) return res.json({ totalStudents: 0, totalAssignments: 0, studentGrades: [], avgSubmissionRate: 0 });

    // Get all assignments for this class
    const snap = await db.collection('assignments').where('class', '==', classId).get();
    const assignments = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    // Get student info (usernames, emails)
    const studentDocs = await Promise.all(studentIds.map(id => db.collection('users').doc(id).get()));
    const studentMap = {};
    studentDocs.forEach(d => { 
      if (d.exists) studentMap[d.id] = { username: d.data().username, email: d.data().email }; 
    });

    // Build per-student grades
    const studentGrades = studentIds.map(studentId => {
      const info = studentMap[studentId] || { username: studentId, email: '' };
      let totalPoints = 0, earnedPoints = 0, gradedCount = 0, submitted = 0;
      let aiScores = [];
      
      const breakdown = assignments.map(a => {
        const sub = (a.submissions || []).find(s => s.student === studentId);
        if (sub) {
          submitted++;
          if (sub.score !== null && sub.score !== undefined) {
            earnedPoints += sub.score;
            totalPoints  += a.points || 100;
            gradedCount++;
          }
          if (sub.aiScore != null) aiScores.push(sub.aiScore);
        }
        return {
          assignmentId: a.id, title: a.title, maxPoints: a.points || 100,
          submitted: !!sub, score: sub?.score ?? null,
          aiScore: sub?.aiScore ?? null,
        };
      });
      
      const pct = gradedCount > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
      const avgAiScore = aiScores.length > 0 ? Math.round(aiScores.reduce((a,b)=>a+b,0) / aiScores.length) : null;
      
      return { 
        studentId, username: info.username, email: info.email, 
        submitted, totalCount: assignments.length, gradedCount, pct, avgAiScore, breakdown 
      };
    });

    // Calculate Class-level stats
    const totalSubs = studentGrades.reduce((s, sg) => s + sg.submitted, 0);
    const maxSubs   = studentIds.length * assignments.length;
    const avgSubmissionRate = maxSubs > 0 ? Math.round((totalSubs / maxSubs) * 100) : 0;
    const allAiScores = studentGrades.flatMap(sg => sg.breakdown.filter(b => b.aiScore != null).map(b => b.aiScore));
    const avgAiScore = allAiScores.length > 0 ? Math.round(allAiScores.reduce((a,b)=>a+b,0) / allAiScores.length) : null;
    const flaggedSubmissions = studentGrades.flatMap(sg => sg.breakdown).filter(b => b.aiScore >= 70).length;

    res.json({ totalStudents: studentIds.length, totalAssignments: assignments.length, avgSubmissionRate, avgAiScore, flaggedSubmissions, studentGrades });
  } catch (error) { 
    console.error(error); 
    res.status(500).json({ message: 'Server Error' }); 
  }
});


// ════════════════════════════
//   STUDENT ONLY ROUTES
// ════════════════════════════

// Submit files for assignments and save AI detection scores to Firestore
// PROTECTED: Only Students can submit their work
router.post('/:id/submit', authMiddleware, requireRole('Student'), (req, res, next) => {
  // Handle file upload first
  uploadCodeOnly.single('file')(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message });
    next();
  });
}, async (req, res) => {
  try {
    const { studentId } = req.body;
    if (!studentId) return res.status(400).json({ message: 'studentId is required' });
    
    const assignmentRef = db.collection('assignments').doc(req.params.id);
    const assignmentDoc = await assignmentRef.get();
    if (!assignmentDoc.exists) return res.status(404).json({ message: 'Assignment not found' });

    let aiScore = null, aiLabel = null, aiSignals = [], humanSignals = [];
    let filePath = null, fileName = null;

    if (req.file) {
      filePath = req.file.path;
      fileName = req.file.originalname;
      try {
        // Send the code to our ML service for AI detection
        const code = fs.readFileSync(filePath, 'utf-8');
        const mlRes = await fetch('http://localhost:3001/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        });
        const result = await mlRes.json();
        aiScore = result.score; aiLabel = result.label;
        aiSignals = result.aiSignals || []; humanSignals = result.humanSignals || [];
      } catch (mlErr) { 
        console.warn('ML service unavailable:', mlErr.message); 
      }
    }

    // Save the submission to Firestore safely
    await db.runTransaction(async (transaction) => {
      const freshDoc = await transaction.get(assignmentRef);
      const submissions = [...(freshDoc.data().submissions || [])];
      
      const existingIndex = submissions.findIndex(s => s.student === studentId);
      const newSubmission = { 
        student: studentId, filePath, fileName, aiScore, aiLabel, 
        aiSignals, humanSignals, score: null, feedback: null, 
        submittedAt: new Date().toISOString() 
      };
      
      if (existingIndex >= 0) {
        // Keep the old score/feedback if they resubmit
        submissions[existingIndex] = { 
          ...newSubmission, 
          score: submissions[existingIndex].score, 
          feedback: submissions[existingIndex].feedback 
        };
      } else {
        submissions.push(newSubmission);
      }
      transaction.update(assignmentRef, { submissions });
    });

    res.json({ message: 'Submitted successfully', aiScore, aiLabel, fileName });
  } catch (error) { 
    console.error(error); 
    res.status(500).json({ message: 'Server Error' }); 
  }
});


// ════════════════════════════
//   GENERAL AUTHENTICATED ROUTES
// ════════════════════════════

// Get the list of class assignments with Teacher and Student information
// PROTECTED: Anyone logged in (Teacher or Student) can view this
router.get('/class/:classId', authMiddleware, async (req, res) => {
  try {
    const snapshot = await db.collection('assignments').where('class', '==', req.params.classId).get();
    const assignments = [];
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      let teacher = null;
      
      if (data.createdBy && data.createdBy !== 'unknown') {
        const teacherDoc = await db.collection('users').doc(data.createdBy).get();
        teacher = teacherDoc.exists ? { _id: teacherDoc.id, username: teacherDoc.data().username } : null;
      }
      
      const submissions = [];
      for (const sub of data.submissions || []) {
        const studentDoc = await db.collection('users').doc(sub.student).get();
        const student = studentDoc.exists
          ? { _id: studentDoc.id, username: studentDoc.data().username, email: studentDoc.data().email }
          : { _id: sub.student, username: 'Unknown' };

        // Build explained signals for the AI detection panel on the frontend
        const SIGNAL_EXPLANATIONS = {
          '__HAS_JSDOC__':           'Has JSDoc-style comments (structured documentation typical of AI)',
          '__COMPLEXITY_ANALYSIS__': 'Contains Big-O complexity comments (rare in human code)',
          '__LOGS_REMOVED__':        'No console.log statements (humans usually leave debug logs)',
          '__PERFECT_FORMATTING__':  'Perfectly consistent indentation and spacing',
          '__HANDLES_EDGE_CASES__':  'Explicitly handles edge cases with comments',
          '__FUNCTIONAL_STYLE__':    'Uses functional programming patterns throughout',
          '__HAS_CONSOLE_LOG__':     'Contains console.log debug statements (human habit)',
          '__CASUAL_COMMENT__':      'Has casual/informal comments (human writing style)',
          '__USES_VAR__':            'Uses var instead of let/const (older human habit)',
          '__COMMENTED_OUT_CODE__':  'Contains commented-out code blocks (human debugging)',
          '__SHORT_VAR_NAMES__':     'Uses short variable names like i, x, tmp (human shortcuts)',
        };
        
        const explainedAiSignals    = (sub.aiSignals    || []).map(s => ({ signal: s, explanation: SIGNAL_EXPLANATIONS[s] || s }));
        const explainedHumanSignals = (sub.humanSignals || []).map(s => ({ signal: s, explanation: SIGNAL_EXPLANATIONS[s] || s }));
        
        submissions.push({ ...sub, student, explainedAiSignals, explainedHumanSignals });
      }
      
      assignments.push({ id: doc.id, ...data, createdBy: teacher, submissions });
    }
    res.json(assignments);
  } catch (error) { 
    console.error(error); 
    res.status(500).json({ message: 'Server Error' }); 
  }
});

// Search for assignments by keyword
// PROTECTED: Anyone logged in can search their assignments
router.get('/search', authMiddleware, async (req, res) => {
  try {
    const { q = '', classId, studentId } = req.query;
    if (!classId) return res.status(400).json({ message: 'classId required.' });
    if (!q.trim()) return res.status(400).json({ message: 'Search query required.' });
    
    const snap = await db.collection('assignments').where('class', '==', classId).get();
    const query = q.toLowerCase().trim();
    const results = [];
    
    for (const doc of snap.docs) {
      const data = doc.data();
      const titleMatch = data.title?.toLowerCase().includes(query);
      const descMatch  = data.description?.toLowerCase().includes(query);
      const dateMatch  = data.dueDate?.toLowerCase().includes(query);
      const fileMatch  = (data.submissions || []).some(s => s.fileName?.toLowerCase().includes(query));
      
      if (titleMatch || descMatch || dateMatch || fileMatch) {
        const sub = studentId ? (data.submissions || []).find(s => s.student === studentId) : null;
        results.push({
          id: doc.id, 
          title: data.title, 
          description: data.description,
          dueDate: data.dueDate, 
          points: data.points,
          matchedOn: titleMatch ? 'title' : descMatch ? 'description' : dateMatch ? 'due date' : 'file name',
          status: sub ? 'submitted' : 'pending',
          grade: sub?.score ?? null, 
          aiScore: sub?.aiScore ?? null,
        });
      }
    }
    res.json({ query: q, count: results.length, results });
  } catch (e) { 
    console.error(e); 
    res.status(500).json({ message: 'Server Error' }); 
  }
});

module.exports = router;