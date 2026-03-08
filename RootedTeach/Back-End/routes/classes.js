const express = require('express');
const router = express.Router();
const Class = require('../models/Class');

router.post('/', async (req, res) => {
  try {
    const { className, teacherId } = req.body;
    const newClass = new Class({ className, teacher: teacherId });
    await newClass.save();
    res.status(201).json(newClass);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

router.get('/', async (req, res) => {
  try {
    const classes = await Class.find()
      .populate('teacher', 'username email')
      .populate('students', 'username email');
    res.json(classes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const foundClass = await Class.findById(req.params.id)
      .populate('teacher', 'username email')
      .populate('students', 'username email');
    if (!foundClass) return res.status(404).json({ message: 'Class not found' });
    res.json(foundClass);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

router.post('/:id/students', async (req, res) => {
  try {
    const { studentId } = req.body;
    const foundClass = await Class.findById(req.params.id);
    if (!foundClass) return res.status(404).json({ message: 'Class not found' });
    if (foundClass.students.includes(studentId)) {
      return res.status(400).json({ message: 'Student already in class' });
    }
    foundClass.students.push(studentId);
    await foundClass.save();
    res.json(foundClass);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;