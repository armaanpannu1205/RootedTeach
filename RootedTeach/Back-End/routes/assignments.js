const express = require('express');
const router = express.Router();
const { db } = require('../firebase');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Make uploads folder if it doesn't exist
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// Create assignment
router.post('/', async (req, res) => {
  try {
    const { title, description, dueDate, classId, teacherId } = req.body;

    const newAssignment = {
      title,
      description: description || null,
      dueDate: dueDate || null,
      class: classId,
      createdBy: teacherId,
      submissions: [],
      createdAt: new Date().toISOString(),
    };

    const ref = await db.collection('assignments').add(newAssignment);
    res.status(201).json({ id: ref.id, ...newAssignment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get assignments by class
router.get('/class/:classId', async (req, res) => {
  try {
    const snapshot = await db.collection('assignments')
      .where('class', '==', req.params.classId)
      .get();

    const assignments = [];
    for (const doc of snapshot.docs) {
      const data = doc.data();

      // Populate createdBy username
      const teacherDoc = await db.collection('users').doc(data.createdBy).get();
      const teacher = teacherDoc.exists ? { _id: teacherDoc.id, username: teacherDoc.data().username } : null;

      // Populate student info in submissions
      const submissions = [];
      for (const sub of data.submissions || []) {
        const studentDoc = await db.collection('users').doc(sub.student).get();
        const student = studentDoc.exists
          ? { _id: studentDoc.id, username: studentDoc.data().username, email: studentDoc.data().email }
          : null;
        submissions.push({ ...sub, student });
      }

      assignments.push({ id: doc.id, ...data, createdBy: teacher, submissions });
    }

    res.json(assignments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Submit assignment with file + AI detection
router.post('/:id/submit', upload.single('file'), async (req, res) => {
  try {
    const { studentId } = req.body;
    const assignmentRef = db.collection('assignments').doc(req.params.id);
    const assignmentDoc = await assignmentRef.get();

    if (!assignmentDoc.exists) return res.status(404).json({ message: 'Assignment not found' });

    const assignment = assignmentDoc.data();

    let aiScore = null;
    let aiLabel = null;
    let filePath = null;
    let fileName = null;

    if (req.file) {
      filePath = req.file.path;
      fileName = req.file.originalname;
      const ext = path.extname(fileName).toLowerCase();
      const codeExtensions = ['.js', '.py', '.java', '.cpp', '.c', '.ts', '.cs', '.go', '.rb'];

      if (codeExtensions.includes(ext)) {
        try {
          const code = fs.readFileSync(filePath, 'utf-8');
          const res = await fetch('http://localhost:3001/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code }),
          });
          const result = await response.json();
          aiScore = result.score;
          aiLabel = result.label;
        } catch (mlErr) {
          console.warn('ML service unavailable:', mlErr.message);
        }
      }
    }

    const submissions = assignment.submissions || [];
    const existingIndex = submissions.findIndex(s => s.student === studentId);

    const newSubmission = {
      student: studentId,
      filePath,
      fileName,
      aiScore,
      aiLabel,
      score: null,
      submittedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      submissions[existingIndex] = { ...submissions[existingIndex], ...newSubmission };
    } else {
      submissions.push(newSubmission);
    }

    await assignmentRef.update({ submissions });

    res.json({ message: 'Submitted successfully', aiScore, aiLabel, fileName });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;