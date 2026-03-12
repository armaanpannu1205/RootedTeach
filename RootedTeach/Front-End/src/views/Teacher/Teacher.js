/* Teacher.js - The main teacher dashboard, shown immediately after login. */
/* Displays all classes the teacher created, with options to add, edit, and delete. */

import React, { useState, useEffect} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ClassTile from './ClassTile.js';
import Sidebar from '../../components/Sidebar/Sidebar';
import AddClassModal from './AddClassModal';
import { api } from '../../utils/api';
import './Teacher.css';

function Teacher() {
  const [classes, setClasses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const teacherId = localStorage.getItem('userId');
  const navigate = useNavigate();

  // Load the teacher's classes as soon as the dashboard mounts
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await api.get(`/api/classes/teacher/${teacherId}`);
        const data = await res.json();
        setClasses(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch classes:', err);
      }
    };
    if (teacherId) fetchClasses();
  }, [teacherId]);

  // Clears the session and boots the user back to the landing page
  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  // POST new class to the backend, then append it to local state
  // TODO: If we are editing an existing class, this should probably be a PUT request later!

const handleAddClass = async (newClass) => {
  try {
    if (editingIndex !== null) {
      const classId = classes[editingIndex].id;
      const res = await api.put(`/api/classes/${classId}`, {
        className: newClass.title,
        courseName: newClass.courseName,
        quarter: newClass.quarter,
        color: newClass.color,
        syllabus: newClass.syllabus || null,
      });
      const updated = await res.json();
      setClasses((prev) => prev.map((c, i) => i === editingIndex ? { ...c, ...updated } : c));
    } else {
      const res = await api.post('/api/classes', {
        className: newClass.title,
        courseName: newClass.courseName,
        quarter: newClass.quarter,
        color: newClass.color,
        teacherId: teacherId,
        syllabus: newClass.syllabus || null,
      });
      const saved = await res.json();
      setClasses((prev) => [...prev, saved]);
    }
  } catch (err) {
    console.error('Failed to save class:', err);
  }
  setIsModalOpen(false);
  setEditingIndex(null);
};

  // DELETE class from backend, then remove it from local state
  const handleDelete = async (classId) => {
    if (!classId) { console.error('No classId to delete'); return; }
    try {
      const res = await api.del(`/api/classes/${classId}`);
      console.log('Delete response:', res.status);
    } catch (e) { 
      console.error('Delete failed:', e); 
    }
    
    // Filter the deleted class out of the UI instantly
    setClasses((prev) => prev.filter(c => (c.id || c._id) !== classId));
  };

  // Opens the AddClassModal in edit mode by passing in the index of the selected class
  const handleEdit = (index) => {
    setEditingIndex(index);
    setIsModalOpen(true);
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  return (
    <div className="teacher-container">
      {/* ── Modal handles both creating and editing classes ── */}
      <AddClassModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingIndex(null); }}
        onSave={handleAddClass}
        initialData={editingIndex !== null ? { ...classes[editingIndex], title: classes[editingIndex].className } : null}
      />

      {/* ── Sidebar Navigation ── */}
      <Sidebar role="teacher" classes={classes} />

      {/* ── Main Dashboard Content ── */}
      <main className="teacher-main">
        <div className="teacher-main-header">
          <div>
            <h1>Dashboard</h1>
            <p className="teacher-page-sub">Hi Teacher 👋 &nbsp;{today}</p>
          </div>
          <button
            onClick={() => { setEditingIndex(null); setIsModalOpen(true); }}
            className="add-class-button"
          >
            + Add Class
          </button>
        </div>

        {/* ── High-level summary metrics ── */}
        <div className="teacher-stats-row">
          <div className="teacher-stat-card">
            <div className="teacher-stat-num">{classes.length}</div>
            <div className="teacher-stat-label">already teaching</div>
          </div>
          <div className="teacher-stat-card">
            <div className="teacher-stat-num">0</div>
            <div className="teacher-stat-label">Assignments</div>
          </div>
          <div className="teacher-stat-card">
            <div className="teacher-stat-num">0</div>
            <div className="teacher-stat-label">Due upcoming</div>
          </div>
        </div>

        <div className="teacher-section-header">
          <h2>My classes ({classes.length})</h2>
        </div>

        {/* ── Dynamic grid of ClassTiles ── */}
        <div className="teacher-class-list">
          {classes.length > 0 ? (
            <div className="teacher-class-grid">
              {classes.map((cls, index) => (
                <ClassTile
                  key={cls.id || index}
                  title={cls.className}
                  courseName={cls.courseName}
                  quarter={cls.quarter}
                  color={cls.color}
                  classId={cls.id}
                  classCode={cls.classCode}
                  onDelete={() => handleDelete(cls.id || cls._id)}
                  onEdit={() => handleEdit(index)}
                />
              ))}
            </div>
          ) : (
            <div className="teacher-empty-state">
              <div className="teacher-empty-icon">📚</div>
              <p>Your dashboard is empty now.</p>
              <span>Create your first class to get started.</span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Teacher;