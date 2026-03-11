import React, { useState, useEffect } from 'react';
import './AddClassModal.css';

const AddClassModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [title, setTitle]       = useState('');   // e.g. CS 101
  const [courseName, setCourseName] = useState(''); // e.g. Software Construction
  const [season, setSeason]     = useState('Winter');
  const [year, setYear]         = useState('');
  const [color, setColor]       = useState('#7C6FE0');

  const currentYear = new Date().getFullYear();
  const years   = Array.from({ length: 10 }, (_, i) => currentYear + i);
  const seasons = ['Fall', 'Winter', 'Spring', 'Summer'];

  useEffect(() => {
    if (!isOpen) return;
    setYear(String(currentYear));
    if (initialData) {
      setTitle(initialData.title || initialData.className || '');
      setCourseName(initialData.courseName || '');
      setColor(initialData.color || '#7C6FE0');
      const quarter = initialData.quarter || `Winter ${currentYear}`;
      const parts   = quarter.split(' ');
      setSeason(parts[0] || 'Winter');
      setYear(parts[1]   || String(currentYear));
    } else {
      setTitle('');
      setCourseName('');
      setSeason('Winter');
      setColor('#7C6FE0');
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({ title, courseName, quarter: `${season} ${year}`, color });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>{initialData ? 'Edit Class' : 'Add New Class'}</h2>

        <form onSubmit={handleSubmit} className="modal-form">

          <label>
            <div className="modal-form-label-text">Class Code</div>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. CS 101"
              className="modal-input"
              required
            />
          </label>

          <label>
            <div className="modal-form-label-text">Course Name</div>
            <input
              type="text"
              value={courseName}
              onChange={e => setCourseName(e.target.value)}
              placeholder="e.g. Software Construction"
              className="modal-input"
            />
          </label>

          <label>
            <div className="modal-form-label-text">Quarter</div>
            <div className="modal-quarter-row">
              <select value={season} onChange={e => setSeason(e.target.value)} className="modal-select">
                {seasons.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={year} onChange={e => setYear(e.target.value)} className="modal-select">
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </label>

          <label>
            <div className="modal-form-label-text">Theme Color</div>
            <input
              type="color"
              value={color}
              onChange={e => setColor(e.target.value)}
              className="modal-color-input"
            />
          </label>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="modal-button-cancel">Cancel</button>
            <button type="submit" className="modal-button-save">
              {initialData ? 'Save Changes' : 'Create Class'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddClassModal;