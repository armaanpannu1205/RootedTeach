import React, { useState, useEffect} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ClassTile from './ClassTile.js';
import Sidebar from '../../components/Sidebar/Sidebar';
import AddClassModal from './AddClassModal';
import './Teacher.css';

function Teacher() {
  const [classes, setClasses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const teacherId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchClasses = async () => {
      const teacherId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5001/api/classes/teacher/${teacherId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      setClasses(Array.isArray(data) ? data : []);
    };
    fetchClasses();
  }, []);

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const handleAddClass = async (newClass) => {
    try {
      const res = await fetch('http://localhost:5001/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          className: newClass.title,
          courseName: newClass.courseName,
          quarter: newClass.quarter,
          color: newClass.color,
          teacherId: teacherId,
          syllabus: newClass.syllabus || null,
        }),
      });
      const saved = await res.json();
      setClasses((prev) => [...prev, saved]);
    } catch (err) {
      console.error('Failed to save class:', err);
    }
    setIsModalOpen(false);
    setEditingIndex(null);
  };

  const handleDelete = async (classId) => {
    if (!classId) { console.error('No classId to delete'); return; }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5001/api/classes/${classId}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      console.log('Delete response:', res.status);
    } catch (e) { console.error('Delete failed:', e); }
    setClasses((prev) => prev.filter(c => (c.id || c._id) !== classId));
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
    setIsModalOpen(true);
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  return (
    <div className="teacher-container">
      <AddClassModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingIndex(null); }}
        onSave={handleAddClass}
        initialData={editingIndex !== null ? { ...classes[editingIndex], title: classes[editingIndex].className } : null}
      />

      {/* ── Sidebar ── */}
      <Sidebar role="teacher" classes={classes} />

      {/* ── Main ── */}
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