import React, { useState, useEffect } from 'react';
import './AddClassModal.css';

const AddClassModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [title, setTitle] = useState('');
  const [season, setSeason] = useState('Winter');
  const [year, setYear] = useState('2026');
  const [color, setColor] = useState('#B3F5FF');

  const years = Array.from({ length: 11 }, (_, i) => 2020 + i);
  const seasons = ['Fall', 'Winter', 'Spring', 'Summer'];

  useEffect(() => {
    if (!isOpen) return;
    if (initialData) {
      setTitle(initialData.title || '');
      setColor(initialData.color || '#B3F5FF');
      const [s, y] = (initialData.quarter || 'Winter 2026').split(' ');
      setSeason(s || 'Winter');
      setYear(y || '2026');
    } else {
      setTitle('');
      setSeason('Winter');
      setYear('2026');
      setColor('#B3F5FF');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const quarter = `${season} ${year}`;
    onSave({ title, quarter, color });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>{initialData ? 'Edit Class' : 'Add New Class'}</h2>

        <form onSubmit={handleSubmit} className="modal-form">
          <label>
            <div className="modal-form-label-text">Class Title</div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. CS101"
              className="modal-input"
              required
            />
          </label>

          <label>
            <div className="modal-form-label-text">Quarter</div>
            <div className="modal-quarter-row">
              <select
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                className="modal-select"
              >
                {seasons.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="modal-select"
              >
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </label>

          <label>
            <div className="modal-form-label-text">Theme Color</div>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="modal-color-input"
            />
          </label>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="modal-button-cancel">
              Cancel
            </button>
            <button type="submit" className="modal-button-save">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddClassModal;