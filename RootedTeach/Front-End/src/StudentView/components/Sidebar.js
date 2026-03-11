import React, { useState, useRef, useEffect } from 'react';
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

function Sidebar({ courses = [], course = null, activePage = 'dashboard', onPageChange, logoSrc = null }) {
  const navigate = useNavigate();
  const [collapsed, setCollapsed]         = useState(false);
  //const [showLogout, setShowLogout]        = useState(false); // FIX 1: inline logout toggle
  //const profileRef                         = useRef(null);

  // isCourseMode = true  → CourseDashboard, AssignmentDashboard  (← back button shown)
  // isCourseMode = false → everything else                        (NO back button, EVER)
  const isCourseMode = course !== null && course !== undefined;

  /*
  useEffect(() => {
    function handleOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowLogout(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);
  */

  function openCourse(c) {
    localStorage.setItem('currentCourse', JSON.stringify(c));
    navigate('/course');
  }

  function handleLogout() {
    localStorage.clear();
    navigate('/');
  }

  // ── Logo: use real image if provided, else emoji fallback ──
  function LogoImg() {
    if (logoSrc) return <img src={logoSrc} alt="logo" className="sidebar__logo-img" />;
    return <span className="sidebar__logo">🌱</span>;
  }

  function SidebarFooter({ showLabel }) {
    return (
      <div className="sidebar__footer-fixed">
        <button
          className={`sidebar__nav-item ${activePage === 'account' ? 'active' : ''}`}
          onClick={() => navigate('/account')}
        >
          <span className="sidebar__nav-icon">👤</span>
          {showLabel && <span className="sidebar__nav-label">Profile</span>}
        </button>
        <button
          className="sidebar__nav-item sidebar__nav-item--logout"
          onClick={handleLogout}
        >
          <span className="sidebar__nav-icon">🚪</span>
          {showLabel && <span className="sidebar__nav-label">Log out</span>}
        </button>
      </div>
    );
  }

  if (isCourseMode) {
    return (
      <aside className="sidebar sidebar--course">
        <div className="sidebar__header">
          <button className="sidebar__back" onClick={() => navigate(-1)} title="Go back to the previous page">
            ←
          </button>
          <div className="sidebar__course-header">
            <div className="sidebar__course-code-label">{course.code}</div>
            <div className="sidebar__course-name-label">{course.name}</div>
          </div>
        </div>

        <nav className="sidebar__nav">
          {[
            { key: 'syllabus',    icon: '📋', label: 'Syllabus'       },
            { key: 'grade',       icon: '📊', label: 'Grades'         },
            { key: 'announce',    icon: '📢', label: 'Announcements'  },
            { key: 'assignments', icon: '📝', label: 'Assignments'    },
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

        <SidebarFooter showLabel />
      </aside>
    );
  }

  return (
    <aside className="sidebar sidebar--dashboard">
      {/* FIX 1: plain brand header — zero buttons */}
      <div className="sidebar__header sidebar__header--brand-only">
        <div className="sidebar__brand">
          <LogoImg />
          <span className="sidebar__brand-name">RootedTeach</span>
        </div>
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

      {courses.length > 0 && (
        <div className="sidebar__courses">
          <div className="sidebar__section-title">My Classes</div>
          {courses.map((c) => (
            <button key={c.id} className="sidebar__course-item" onClick={() => openCourse(c)}>
              <span
                className="sidebar__course-dot"
                style={{ background: COURSE_COLORS[c.color % COURSE_COLORS.length].accent }}
              />
              <div className="sidebar__course-info">
                <span className="sidebar__course-code">{c.code}</span>
                <span className="sidebar__course-name">{c.name}</span>
              </div>
              {c.upcoming > 0 && <span className="sidebar__course-badge">{c.upcoming}</span>}
            </button>
          ))}
        </div>
      )}

      <SidebarFooter showLabel />
    </aside>
  );
}


export default Sidebar;