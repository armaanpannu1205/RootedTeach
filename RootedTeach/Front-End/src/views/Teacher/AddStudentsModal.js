// src/class_page/AddStudentsModal.jsx

import React, { useState } from 'react';
import './ClassPageModal.css';

const AddStudentsModal = ({ isOpen, onClose, classId }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  if (!isOpen) return null; //a performance guard: render nothing if modal is not open

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // search for Students via email, specifically, connects to the backend to look up a user by email before adding them
      const searchRes = await fetch(`http://localhost:5001/api/auth/user?email=${email}`);
      const userData = await searchRes.json();
  
      if (!userData._id) {
        alert('Student not found. Please check the email.');
        return;
      }
  
      // Add the found student to this class by their MongoDB _id
      const res = await fetch(`http://localhost:5001/api/classes/${classId}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: userData._id }),
      });
  
      if (res.ok) {
        alert('Student added successfully!');
      } else {
        const data = await res.json();
        alert(data.message);
      }
    } catch (err) {
      console.error('Failed to add student:', err);
    }
    //reset form fields and close modal regardless of the outcome 
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