const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// make uploads folder if it doesn't exist
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// Create assignment
router.post('/', async (req, res) => {
  try {
    const { title, description, dueDate, classId, teacherId } = req.body;
    const newAssignment = new Assignment({
      title, description, dueDate,
      class: classId,
      createdBy: teacherId,
    });
    await newAssignment.save();
    res.status(201).json(newAssignment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get assignments by class
router.get('/class/:classId', async (req, res) => {
  try {
    const assignments = await Assignment.find({ class: req.params.classId })
      .populate('createdBy', 'username')
      .populate('submissions.student', 'username email');
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
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

    let aiScore = null;
    let aiLabel = null;
    let filePath = null;
    let fileName = null;

    // if a file was uploaded, read it and run AI detection
    if (req.file) {
      filePath = req.file.path;
      fileName = req.file.originalname;
      const ext = path.extname(fileName).toLowerCase();
      const codeExtensions = ['.js', '.py', '.java', '.cpp', '.c', '.ts', '.cs', '.go', '.rb'];

      if (codeExtensions.includes(ext)) {
        try {
          // call ML service
          const code = fs.readFileSync(filePath, 'utf-8');
          const response = await fetch('http://localhost:3001/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code })
          });
          const result = await response.json();
          aiScore = result.score;
          aiLabel = result.label;
        } catch (mlErr) {
          console.warn('ML service unavailable:', mlErr.message);
        }
      }
    }

    const existing = assignment.submissions.find(
      s => s.student.toString() === studentId
    );

    if (existing) {
      existing.submittedAt = Date.now();
      existing.filePath = filePath;
      existing.fileName = fileName;
      existing.aiScore = aiScore;
      existing.aiLabel = aiLabel;
    } else {
      assignment.submissions.push({
        student: studentId,
        filePath,
        fileName,
        aiScore,
        aiLabel,
      });
    }

    await assignment.save();
    res.json({
      assignment,
      aiScore,
      aiLabel,
      fileName,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;