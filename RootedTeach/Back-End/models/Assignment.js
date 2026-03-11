const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  score: { type: Number, default: null },
  filePath: { type: String, default: null },
  fileName: { type: String, default: null },
  aiScore: { type: Number, default: null },   // 0-100, higher = more likely AI
  aiLabel: { type: String, default: null },   // 'Likely AI-written' or 'Likely Human-written'
  submittedAt: { type: Date, default: Date.now },
});

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  dueDate: { type: Date },
  class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  submissions: [submissionSchema],
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);