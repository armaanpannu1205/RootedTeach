/* CreateAssignmentModal.jsx - A modal form for teachers to create a new assignment under a specific class. */
/* Calls onCreated() with the saved assignment data after a successful POST to the backend. */

import React, { useState } from 'react';
import { api } from '../../utils/api';
import './ClassPageModal.css';

const CreateAssignmentModal = ({ isOpen, onClose, classId, onCreated }) => {
  // Grouping form fields into a single state object keeps the code much cleaner
  const [form, setForm] = useState({ title: '', dueDate: '', description: '', points: 100 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Performance guard: Don't render anything to the DOM if the modal is hidden
  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Lock the form and clear any previous error before submitting
    setSaving(true); 
    setError('');
    
    try {
      // Post a new assignment to the backend, attaching classId and ensuring points is cast to a Number
      const res = await api.post('/api/assignments', { ...form, classId, points: Number(form.points) });
      const saved = await res.json();
      
      // If server returned an error status, show the message and stop the submission flow
      if (!res.ok) { 
        setError(saved.message || 'Failed to create.'); 
        setSaving(false); 
        return; 
      }
      
      // Success! Pass the new data back up to the parent component so it can update the UI
      onCreated?.(saved);
      
      // Reset the form state for the next time this modal is opened
      setForm({ title: '', dueDate: '', description: '', points: 100 });
      onClose();
    } catch { 
      setError('Could not connect to server.'); 
    } finally { 
      // Always unlock the form, even if the request fails
      setSaving(false); 
    }
  };

  return (
    // Clicking the dark background overlay closes the modal...
    <div className="cp-modal-overlay" onClick={onClose}>
      {/* ...but e.stopPropagation() ensures clicking inside the white modal box doesn't trigger the close event */}
      <div className="cp-modal-content" onClick={e => e.stopPropagation()}>
        <h2>Create Assignment</h2>
        <form onSubmit={handleSubmit} className="cp-modal-form">
          <label>
            <div className="cp-modal-label-text">Assignment Name</div>
            <input 
              type="text" 
              value={form.title} 
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))} 
              placeholder="e.g. Homework 1" 
              className="cp-modal-input" 
              required
            />
          </label>
          <label>
            <div className="cp-modal-label-text">Due Date</div>
            <input 
              type="date" 
              value={form.dueDate} 
              onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} 
              className="cp-modal-input" 
              required
            />
          </label>
          <label>
            <div className="cp-modal-label-text">Points</div>
            <input 
              type="number" 
              value={form.points} 
              onChange={e => setForm(p => ({ ...p, points: e.target.value }))} 
              className="cp-modal-input" 
              min={1}
            />
          </label>
          <label>
            <div className="cp-modal-label-text">Description</div>
            <textarea 
              value={form.description} 
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))} 
              placeholder="Optional details..." 
              className="cp-modal-input cp-modal-textarea"
            />
          </label>
          
          {/* Conditional error rendering - only takes up space if an error exists */}
          {error && <p style={{ color: '#e53e3e', fontSize: 13 }}>{error}</p>}
          
          <div className="cp-modal-actions">
            <button type="button" onClick={onClose} className="cp-modal-btn-cancel">Cancel</button>
            <button type="submit" className="cp-modal-btn-save" disabled={saving}>
              {saving ? 'Creating…' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAssignmentModal;