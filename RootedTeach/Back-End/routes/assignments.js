const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');

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

router.post('/:id/submit', async (req, res) => {
  try {
    const { studentId, score } = req.body;
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    const existing = assignment.submissions.find(
      s => s.student.toString() === studentId
    );
    if (existing) {
      existing.score = score;
      existing.submittedAt = Date.now();
    } else {
      assignment.submissions.push({ student: studentId, score });
    }
    await assignment.save();
    res.json(assignment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;