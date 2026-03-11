import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css';

export const COURSE_COLORS = [
  { gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', accent: '#667eea' },
  { gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', accent: '#f5576c' },
  { gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', accent: '#4facfe' },
  { gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', accent: '#43e97b' },
  { gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', accent: '#fa709a' },
  { gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', accent: '#a18cd1' },
  { gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', accent: '#fcb69f' },
  { gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)', accent: '#ff9a9e' },
];

function Sidebar({ courses = [], course = null, activePage = 'dashboard', onPageChange }) {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const isCourseMode = course !== null && course !== undefined;
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    function handleOutsideClick(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  function openCourse(c) {
    localStorage.setItem('currentCourse', JSON.stringify(c));
    navigate('/course');
  }

  function handleLogout() {
    localStorage.clear();
    navigate('/');
  }

  function ProfilePopup() {
    if (!showProfileMenu) return null;
    return (
      <div className="sidebar__profile-popup">
        <button
          className="sidebar__profile-item"
          onClick={() => { setShowProfileMenu(false); navigate('/account'); }}
        >
          <span>🪪</span> Account
        </button>
        <hr className="sidebar__profile-divider" />
        <button
          className="sidebar__profile-item sidebar__profile-item--danger"
          onClick={handleLogout}
        >
          <span>🚪</span> Log out
        </button>
      </div>
    );
  }

  if (isCourseMode) {
    return (
      <aside className="sidebar">
        <div className="sidebar__header">
        <button className="sidebar__back" 
                onClick={() => navigate('/dashboard')}
                title="Back to Dashboard">
            ←
        </button>
          <div className="sidebar__course-header">
            <div className="sidebar__course-code-label">{course.code}</div>
            <div className="sidebar__course-name-label">{course.name}</div>
          </div>
        </div>

        <nav className="sidebar__nav">
          {[
            { key: 'syllabus', icon: '📋', label: 'Syllabus' },
            { key: 'grade',    icon: '📊', label: 'Grades' },
            { key: 'announce', icon: '📢', label: 'Announcements' },
            { key: 'assignments', icon: '📝', label: 'Assignments'},
          ].map(({ key, icon, label }) => (
            <button
              key={key}
              className={`sidebar__nav-item ${activePage === key ? 'active' : ''}`}
              onClick={() => onPageChange && onPageChange(key)}
            >
              <span className="sidebar__nav-icon">{icon}</span>
              <span className="sidebar__nav-label">{label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar__footer" style={{ position: 'relative' }}>
          <button
            className="sidebar__nav-item"
            onClick={() => setShowProfileMenu(v => !v)}
          >
            <span className="sidebar__nav-icon">👤</span>
            <span className="sidebar__nav-label">Profile</span>
          </button>
          {showProfileMenu && (
            <div className="sidebar__profile-menu">
              <button className="sidebar__profile-item" onClick={() => navigate('/account')}>
                <span>🪪</span> Account
              </button>
              <button className="sidebar__profile-item sidebar__profile-item--danger" onClick={handleLogout}>
                <span>🚪</span> Log out
              </button>
            </div>
          )}
        </div>
      </aside>
    );
  }

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
      <div className="sidebar__header">
        {!collapsed && (
          <div className="sidebar__brand">
            <span className="sidebar__logo">🌱</span>
            <span className="sidebar__brand-name">RootedTeach</span>
          </div>
        )}
        <button className="sidebar__toggle" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? '→' : '←'}
        </button>
      </div>

      <nav className="sidebar__nav">
        {[
          { key: 'dashboard',   path: '/dashboard',   icon: '🏠', label: 'Dashboard' },
          { key: 'calendar',    path: '/calendar',    icon: '📅', label: 'Calendar' },
          { key: 'assignments', path: '/assignments', icon: '📝', label: 'Assignments' },
          { key: 'grades',      path: '/grades',      icon: '📊', label: 'Grades' },
        ].map(({ key, path, icon, label }) => (
          <button
            key={key}
            className={`sidebar__nav-item ${activePage === key ? 'active' : ''}`}
            onClick={() => navigate(path)}
          >
            <span className="sidebar__nav-icon">{icon}</span>
            {!collapsed && <span className="sidebar__nav-label">{label}</span>}
          </button>
        ))}
      </nav>
      
      {!collapsed && courses.length > 0 && (
        <div className="sidebar__courses">
          <div className="sidebar__section-title">My Classes</div>
          {courses.map((c) => (
            <button key={c.id} className="sidebar__course-item" onClick={() => openCourse(c)}>
              <span className="sidebar__course-dot" 
                    style={{ background: COURSE_COLORS[c.color % COURSE_COLORS.length].accent }} />
              <div className="sidebar__course-info">
                <span className="sidebar__course-code">{c.code}</span>
                <span className="sidebar__course-name">{c.name}</span>
              </div>
              {c.upcoming > 0 &&  (
                <span className="sidebar__course-badge">{c.upcoming}</span>
              )}
            </button>
          ))}
        </div>
      )}
      
      <div className="sidebar__footer" style={{ position: 'relative' }}>
        <button
          className="sidebar__nav-item"
          onClick={() => setShowProfileMenu(v => !v)}
        >
          <span className="sidebar__nav-icon">👤</span>
          {!collapsed && <span className="sidebar__nav-label">Profile</span>}
        </button>
        {showProfileMenu && (
          <div className="sidebar__profile-menu">
            <button className="sidebar__profile-item" onClick={() => navigate('/account')}>
              <span>🪪</span> Account
            </button>
            <button
              className="sidebar__profile-item sidebar__profile-item--danger"
              onClick={handleLogout}
            >
              <span>🚪</span> Log out
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;