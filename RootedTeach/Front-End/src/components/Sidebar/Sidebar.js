import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
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

function Sidebar({
  role = 'student',
  course = null,
  courses = [],
  classes = [],
  activePage = 'dashboard',
  onPageChange,
  username = null,
}) {
  const navigate   = useNavigate();
  const location   = useLocation();
  const isCourse   = course !== null && course !== undefined;
  const isTeacher  = role === 'teacher';

  // First letter of username, otherwise T/S
  const avatarLetter = username
    ? username[0].toUpperCase()
    : isTeacher ? 'T' : 'S';

  const displayName = username || (isTeacher ? 'Teacher' : 'Student');
  const roleLabel   = isTeacher ? 'Instructor' : 'Student';

  function handleLogout() {
    localStorage.clear();
    navigate('/');
  }

  function openCourse(c) {
    localStorage.setItem('currentCourse', JSON.stringify(c));
    navigate('/course');
  }

  // Course mode (CourseDashboard or AssignmentDashboard)
  if (isCourse) {
    return (
      <aside className="sidebar">
        <div className="sidebar__header">
          <button
            className="sidebar__back"
            onClick={() => navigate(-1)}
            title="Go back"
          >
            ←
          </button>
          <div className="sidebar__course-header">
            <div className="sidebar__course-name">{course.name || course.className || 'Class'}</div>
            <div className="sidebar__course-code">{course.code || course.classCode || ''}</div>
          </div>
        </div>

        <nav className="sidebar__nav">
          {[
            { key: 'assignments',   label: 'Assignments'   },
            { key: 'grade',         label: 'Grades'        },
            { key: 'syllabus',      label: 'Syllabus'      },
            { key: 'announcements', label: 'Announcements' },
            { key: 'search',        label: 'Search'        },
          ].map(({ key, label }) => (
            <button
              key={key}
              className={`sidebar__nav-item ${activePage === key ? 'active' : ''}`}
              onClick={() => onPageChange && onPageChange(key)}
            >
              <span className="sidebar__nav-label">{label}</span>
            </button>
          ))}
        </nav>

        <div style={{ flex: 1 }} />

        <SidebarFooter
          avatarLetter={avatarLetter}
          displayName={displayName}
          roleLabel={roleLabel}
          onLogout={handleLogout}
          onProfile={() => navigate('/account')}
        />
      </aside>
    );
  }

  // Teacher dashboard mode: 
  if (isTeacher) {
    return (
      <aside className="sidebar">
        <div className="sidebar__header">
          <span className="sidebar__logo-icon">🌱</span>
          <span className="sidebar__logo-text">RootedTeach</span>
        </div>

        <nav className="sidebar__nav">
          <Link
            to="/teacher"
            className={`sidebar__nav-item ${location.pathname === '/teacher' ? 'active' : ''}`}
          >
            <span className="sidebar__nav-icon">🏠</span>
            <span className="sidebar__nav-label">Dashboard</span>
          </Link>
        </nav>

        {/* My Classes: Display classes the teacher is teaching */}
        <div className="sidebar__section-label">My Classes</div>
        <div className="sidebar__class-list">
          {classes.length === 0 ? (
            <div className="sidebar__no-classes">No classes yet</div>
          ) : (
            classes.map((cls, index) => (
              <Link
                key={cls.id || index}
                to="/class"
                state={{
                  title: cls.className,
                  courseName: cls.courseName,
                  quarter: cls.quarter,
                  color: cls.color,
                  classId: cls.id,
                }}
                className="sidebar__class-item"
              >
                <div
                  className="sidebar__class-dot"
                  style={{ background: cls.color || '#764ba2' }}
                />
                <div className="sidebar__class-info">
                  <div className="sidebar__class-name">{cls.className}</div>
                  <div className="sidebar__class-quarter">{cls.quarter}</div>
                </div>
              </Link>
            ))
          )}
        </div>

        <div style={{ flex: 1 }} />
        {/* Footer: Logout and Profile */}
        <SidebarFooter
          avatarLetter={avatarLetter}
          displayName={displayName}
          roleLabel={roleLabel}
          onLogout={handleLogout}
          onProfile={() => navigate('/account')}
        />
      </aside>
    );
  }

  // ── Student dashboard mode ──
  return (
    <aside className="sidebar">
      <div className="sidebar__header">
        <span className="sidebar__logo-icon">🌱</span>
        <span className="sidebar__logo-text">RootedTeach</span>
      </div>

      <nav className="sidebar__nav">
        {[
          { key: 'dashboard',   path: '/dashboard',   icon: '🏠', label: 'Dashboard'   },
          { key: 'calendar',    path: '/calendar',    icon: '📅', label: 'Calendar'    },
          { key: 'assignments', path: '/assignments', icon: '📝', label: 'Assignments' },
          { key: 'grades',      path: '/grades',      icon: '📊', label: 'Grades'      },
        ].map(({ key, path, icon, label }) => (
          <button
            key={key}
            className={`sidebar__nav-item ${activePage === key ? 'active' : ''}`}
            onClick={() => navigate(path)}
          >
            <span className="sidebar__nav-icon">{icon}</span>
            <span className="sidebar__nav-label">{label}</span>
          </button>
        ))}
      </nav>

      {/* My Classes: Display classes the student is in */}
      {courses.length > 0 && (
        <>
          <div className="sidebar__section-label">My Classes</div>
          <div className="sidebar__class-list">
            {courses.map((c) => (
              <button
                key={c.id}
                className="sidebar__class-item"
                onClick={() => openCourse(c)}
              >
                <div
                  className="sidebar__class-dot"
                  style={{ background: COURSE_COLORS[c.color % COURSE_COLORS.length]?.accent || '#667eea' }}
                />
                <div className="sidebar__class-info">
                  <div className="sidebar__class-name">{c.code || c.className}</div>
                  <div className="sidebar__class-quarter">{c.name || c.courseName}</div>
                </div>
                {c.upcoming > 0 && (
                  <span className="sidebar__class-badge">{c.upcoming}</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}

      <div style={{ flex: 1 }} />

      <SidebarFooter
        avatarLetter={avatarLetter}
        displayName={displayName}
        roleLabel={roleLabel}
        onLogout={handleLogout}
        onProfile={() => navigate('/account')}
      />
    </aside>
  );
}

// Shared footer: logout and profile
function SidebarFooter({ avatarLetter, displayName, roleLabel, onLogout, onProfile }) {
  return (
    <div className="sidebar__footer">
      <button className="sidebar__logout-btn" onClick={onLogout}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16,17 21,12 16,7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        Log Out
      </button>
      <button
        className="sidebar__profile"
        onClick={onProfile}
        style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
      >
        <div className="sidebar__avatar">{avatarLetter}</div>
        <div>
          <div className="sidebar__profile-name">{displayName}</div>
          <div className="sidebar__profile-role">{roleLabel}</div>
        </div>
      </button>
    </div>
  );
}

export default Sidebar;