import React, { useState, useEffect} from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ClassTile from './ClassTile.js';
import AddClassModal from './AddClassModal';
import './Teacher.css';

function Teacher() {
  const [classes, setClasses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const teacherId = localStorage.getItem('userId');
  const location = useLocation();

  useEffect(() => {
    const fetchClasses = async () => {
      const res = await fetch('http://localhost:5000/api/classes');
      const data = await res.json();
      setClasses(data);
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
      const res = await fetch('http://localhost:5000/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          className: newClass.title,
          courseName: newClass.courseName,
          quarter: newClass.quarter,
          color: newClass.color,
          teacherId: teacherId,
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

  const handleDelete = (index) => {
    setClasses((prev) => prev.filter((_, i) => i !== index));
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
      <aside className="teacher-sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🎓</div>
          <span className="sidebar-logo-text">EduTrack</span>
        </div>

        <nav className="sidebar-nav">
          <Link
            to="/teacher"
            className={`sidebar-nav-item ${location.pathname === '/teacher' ? 'active' : ''}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9,22 9,12 15,12 15,22"/>
            </svg>
            Dashboard
          </Link>
        </nav>

        <div className="sidebar-section-label">My Classes</div>
        <div className="sidebar-class-list">
          {classes.length === 0 && (
            <div className="sidebar-no-classes">No classes yet</div>
          )}
          {classes.map((cls, index) => (
            <Link
              key={cls._id || index}
              to="/class"
              state={{ title: cls.className, courseName: cls.courseName, quarter: cls.quarter, color: cls.color, classId: cls._id }}
              className="sidebar-class-item"
            >
              <div className="sidebar-class-dot" style={{ background: cls.color || '#764ba2' }} />
              <div className="sidebar-class-info">
                <div className="sidebar-class-name">{cls.className}</div>
                <div className="sidebar-class-quarter">{cls.quarter}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Spacer pushes profile to bottom */}
        <div style={{ flex: 1 }} />

        {/* Logout */}
        <button onClick={handleLogout} className="sidebar-logout-btn">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16,17 21,12 16,7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Log Out
        </button>

        <div className="sidebar-profile">
          <div className="sidebar-avatar">T</div>
          <div>
            <div className="sidebar-profile-name">Teacher</div>
            <div className="sidebar-profile-role">Instructor</div>
          </div>
        </div>
      </aside>

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
                  onDelete={() => handleDelete(index)}
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