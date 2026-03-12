import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ClassTile from './ClassTile.js';
import Sidebar from '../../components/Sidebar/Sidebar';
import AddClassModal from './AddClassModal';
import { api } from '../../utils/api';
import './Teacher.css';

function Teacher() {
  const [classes, setClasses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const teacherId = localStorage.getItem('userId');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await api.get(`/api/classes/teacher/${teacherId}`);
        const data = await res.json();
        setClasses(Array.isArray(data) ? data : []);
      } catch (err) { console.error('Failed to fetch classes:', err); }
      finally { setLoading(false); }
    };
    fetchClasses();
  }, [teacherId]);

  const handleLogout = () => { localStorage.clear(); navigate('/'); };

  const handleAddClass = async (newClass) => {
    try {
      const res = await api.post('/api/classes', {
        className: newClass.title,
        quarter: newClass.quarter,
        color: newClass.color,
      });
      const saved = await res.json();
      if (res.ok) setClasses(prev => [...prev, saved]);
    } catch (err) { console.error('Failed to save class:', err); }
    setIsModalOpen(false);
    setEditingIndex(null);
  };

  const handleDelete = async (classId, index) => {
    try {
      await api.del(`/api/classes/${classId}`);
      setClasses(prev => prev.filter((_, i) => i !== index));
    } catch (err) { console.error(err); }
  };

  const totalAssignments = classes.reduce((a, c) => a + (c.assignmentCount || 0), 0);
  const totalUpcoming    = classes.reduce((a, c) => a + (c.upcomingCount   || 0), 0);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="teacher-container">
      <AddClassModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingIndex(null); }}
        onSave={handleAddClass}
        initialData={editingIndex !== null ? { ...classes[editingIndex], title: classes[editingIndex].className } : null}
      />

      <Sidebar role="teacher" classes={classes} />

      <main className="teacher-main">
        <div className="teacher-main-header">
          <div>
            <h1>Dashboard</h1>
            <p className="teacher-page-sub">Hi {localStorage.getItem('username') || 'Teacher'} 👋 &nbsp;{today}</p>
          </div>
          <button onClick={() => { setEditingIndex(null); setIsModalOpen(true); }} className="add-class-button">
            + Add Class
          </button>
        </div>

        <div className="teacher-stats-row">
          <div className="teacher-stat-card"><div className="teacher-stat-num">{classes.length}</div><div className="teacher-stat-label">Classes</div></div>
          <div className="teacher-stat-card"><div className="teacher-stat-num">{totalAssignments}</div><div className="teacher-stat-label">Assignments</div></div>
          <div className="teacher-stat-card"><div className="teacher-stat-num">{totalUpcoming}</div><div className="teacher-stat-label">Due upcoming</div></div>
        </div>

        <div className="teacher-section-header"><h2>My classes ({classes.length})</h2></div>

        <div className="teacher-class-list">
          {loading && <div className="teacher-empty-state"><div className="teacher-empty-icon">⏳</div><p>Loading your classes…</p></div>}
          {!loading && classes.length === 0 && (
            <div className="teacher-empty-state"><div className="teacher-empty-icon">📚</div><p>Your dashboard is empty now.</p><span>Create your first class to get started.</span></div>
          )}
          {!loading && classes.length > 0 && (
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
                  onDelete={() => handleDelete(cls.id, index)}
                  onEdit={() => { setEditingIndex(index); setIsModalOpen(true); }}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Teacher;
