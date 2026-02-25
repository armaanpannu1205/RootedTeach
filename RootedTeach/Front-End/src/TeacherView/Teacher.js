import React, { useState } from 'react';
import ClassTile from './ClassTile.js';
import AddClassModal from './AddClassModal';
import './Teacher.css';

function Teacher({ teacher }) {
  const [classes, setClasses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);

  const handleAddClass = (newClass) => {
    if (editingIndex !== null) {
      // Update existing class
      setClasses((prev) =>
        prev.map((cls, i) => (i === editingIndex ? newClass : cls))
      );
      setEditingIndex(null);
    } else {
      setClasses((prev) => [...prev, newClass]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (index) => {
    setClasses((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
    setIsModalOpen(true);
  };

  return (
    <div className="teacher-container">
      <AddClassModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingIndex(null); }}
        onSave={handleAddClass}
        initialData={editingIndex !== null ? classes[editingIndex] : null}
      />

      <div className="teacher-main">
        <div className="teacher-main-header">
          <h1>Classes</h1>
          <button
            onClick={() => { setEditingIndex(null); setIsModalOpen(true); }}
            className="add-class-button"
          >
            + Add Class
          </button>
        </div>

        <div className="teacher-class-list">
          {classes.length > 0 ? (
            <div className="teacher-class-grid">
              {classes.map((cls, index) => (
                <ClassTile
                  key={index}
                  title={cls.title}
                  quarter={cls.quarter}
                  color={cls.color}
                  onDelete={() => handleDelete(index)}
                  onEdit={() => handleEdit(index)}
                />
              ))}
            </div>
          ) : (
            <div className="teacher-empty-state">
              <p>Your dashboard is empty now.</p>
            </div>
          )}
        </div>
      </div>

      <div className="teacher-sidebar">
        <h2>Profile? </h2>
        <h2>Calender? </h2>
        <h2>Schedule timelines?</h2>
        <h2>Announcements?</h2>
      </div>
    </div>
  );
}

export default Teacher;