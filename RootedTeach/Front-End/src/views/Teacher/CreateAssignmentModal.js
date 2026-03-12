// this is modal form for creating a new assignment under a specific class
//calls onCreated() with the saved assignment data after a successful POST
import React, { useState } from 'react';
import { api } from '../../utils/api';
import './ClassPageModal.css';

const CreateAssignmentModal = ({ isOpen, onClose, classId, onCreated }) => {
  const [form, setForm] = useState({ title: '', dueDate: '', description: '', points: 100 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    //Lock the form and clear any previous error before submitting
    setSaving(true); setError('');
    try {

      //post a new assignment to the backend, attaching classID and converting points to a numebr
      const res = await api.post('/api/assignments', { ...form, classId, points: Number(form.points) });
      const saved = await res.json();
      
      // if server returned error status, it would show message ands stop
      if (!res.ok) { setError(saved.message || 'Failed to create.'); setSaving(false); return; }
      onCreated?.(saved);
      setForm({ title:'', dueDate:'', description:'', points:100 });
      onClose();
    } catch { setError('Could not connect to server.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="cp-modal-overlay" onClick={onClose}>
      <div className="cp-modal-content" onClick={e => e.stopPropagation()}>
        <h2>Create Assignment</h2>
        <form onSubmit={handleSubmit} className="cp-modal-form">
          <label><div className="cp-modal-label-text">Assignment Name</div>
            <input type="text" value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} placeholder="e.g. Homework 1" className="cp-modal-input" required/>
          </label>
          <label><div className="cp-modal-label-text">Due Date</div>
            <input type="date" value={form.dueDate} onChange={e=>setForm(p=>({...p,dueDate:e.target.value}))} className="cp-modal-input" required/>
          </label>
          <label><div className="cp-modal-label-text">Points</div>
            <input type="number" value={form.points} onChange={e=>setForm(p=>({...p,points:e.target.value}))} className="cp-modal-input" min={1}/>
          </label>
          <label><div className="cp-modal-label-text">Description</div>
            <textarea value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} placeholder="Optional details..." className="cp-modal-input cp-modal-textarea"/>
          </label>
          {error && <p style={{color:'#e53e3e',fontSize:13}}>{error}</p>}
          <div className="cp-modal-actions">
            <button type="button" onClick={onClose} className="cp-modal-btn-cancel">Cancel</button>
            <button type="submit" className="cp-modal-btn-save" disabled={saving}>{saving?'Creating…':'Create'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAssignmentModal;
