// src/class_page/CreateAssignmentModal.jsx

import React, { useState } from 'react';
import './ClassPageModal.css';

const CreateAssignmentModal = ({ isOpen, onClose, classId }) => {
  const [assignmentName, setAssignmentName] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const teacherId = localStorage.getItem('userId');
      const res = await fetch('http://localhost:5000/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: assignmentName,
          description: description,
          dueDate: dueDate,
          classId: classId,
          teacherId: teacherId,
        }),
      });
      const saved = await res.json();
      console.log('Assignment saved:', saved);
    } catch (err) {
      console.error('Failed to save assignment:', err);
    }
    setAssignmentName('');
    setDueDate('');
    setDescription('');
    onClose();
  };

  return (
    <div className="cp-modal-overlay" onClick={onClose}>
      <div className="cp-modal-content" onClick={e => e.stopPropagation()}>
        <h2>Create Assignment</h2>
        <form onSubmit={handleSubmit} className="cp-modal-form">
          <label>
            <div className="cp-modal-label-text">Assignment Name</div>
            <input
              type="text"
              value={assignmentName}
              onChange={e => setAssignmentName(e.target.value)}
              placeholder="e.g. Homework 1"
              className="cp-modal-input"
              required
            />
          </label>
          <label>
            <div className="cp-modal-label-text">Due Date</div>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="cp-modal-input"
              required
            />
          </label>
          <label>
            <div className="cp-modal-label-text">Description</div>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Optional details..."
              className="cp-modal-input cp-modal-textarea"
            />
          </label>
          <div className="cp-modal-actions">
            <button type="button" onClick={onClose} className="cp-modal-btn-cancel">Cancel</button>
            <button type="submit" className="cp-modal-btn-save">Create</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAssignmentModal;