// src/class_page/AddStudentsModal.jsx

import React, { useState } from 'react';
import './ClassPageModal.css';

const AddStudentsModal = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: handle saving student
    console.log('Student added:', { name, email });
    setName('');
    setEmail('');
    onClose();
  };

  return (
    <div className="cp-modal-overlay" onClick={onClose}>
      <div className="cp-modal-content" onClick={e => e.stopPropagation()}>
        <h2>Add Students</h2>
        <form onSubmit={handleSubmit} className="cp-modal-form">
          <label>
            <div className="cp-modal-label-text">Student Name</div>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Jane Doe"
              className="cp-modal-input"
              required
            />
          </label>
          <label>
            <div className="cp-modal-label-text">Email</div>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="e.g. jane@example.com"
              className="cp-modal-input"
              required
            />
          </label>
          <div className="cp-modal-actions">
            <button type="button" onClick={onClose} className="cp-modal-btn-cancel">Cancel</button>
            <button type="submit" className="cp-modal-btn-save">Add</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStudentsModal;