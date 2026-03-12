/* Account.js - Student profile management page. */
/* Handles displaying and updating user info, and fetching real enrolled course counts. */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar, { COURSE_COLORS } from '../../components/Sidebar/Sidebar';
import { api } from '../../utils/api';
import './StudentDashboard.css';
import './Account.css';

// Fallback user data pulled from the initial login session
const DEFAULT_USER = {
  name:      localStorage.getItem('username') || '',
  email:     localStorage.getItem('email')    || '',
  studentId: localStorage.getItem('userId')   || '—',
  major:     '',
  year:      '',
};

function Account() {
  const navigate = useNavigate();

  // Pull real enrolled courses count from student's class list
  const [enrolledCount, setEnrolledCount] = useState(0);

  // Fetch the actual number of classes the student is enrolled in
  useEffect(() => {
    const studentId = localStorage.getItem('userId');
    if (!studentId) return;
    
    // Using the api helper so we don't need to manually attach the token
    api.get(`/api/classes/student/${studentId}`)
      .then(r => r.json())
      .then(data => setEnrolledCount(Array.isArray(data) ? data.length : 0))
      .catch(() => {});
  }, []);

  // Utility to build user from real localStorage fields set at login
  const buildUserFromStorage = () => {
    const saved = (() => { try { return JSON.parse(localStorage.getItem('userProfile')) || {}; } catch { return {}; } })();
    return {
      name:      saved.name      || localStorage.getItem('username') || 'Unknown',
      email:     saved.email     || localStorage.getItem('email')    || '',
      studentId: saved.studentId || localStorage.getItem('userId')   || '—',
      major:     saved.major     || '',
      year:      saved.year      || '',
    };
  };

  // Load saved courses from localStorage for the Sidebar
  const [courses] = useState(() => {
    try { return JSON.parse(localStorage.getItem('courses')) || []; }
    catch { return []; }
  });

  // Load saved profile or fall back to session defaults
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('userProfile')) || DEFAULT_USER; }
    catch { return DEFAULT_USER; }
  });

  // State for toggling between view and edit modes
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState(user); // Holds pending changes before saving
  const [toast, setToast]     = useState('');

  // Save editable fields while keeping student ID locked securely
  function saveProfile() {
    const saved = { ...draft, studentId: user.studentId };
    setUser(saved);
    localStorage.setItem('userProfile', JSON.stringify(saved));
    setEditing(false);
    setToast('Profile updated!');
    setTimeout(() => setToast(''), 3000);
  }

  // Clear local session data and return to the public landing page
  function handleLogout() {
    localStorage.clear();
    navigate('/');
  }

  return (
    <div className="app-layout">
      {/* Main navigation sidebar */}
      <Sidebar activePage="account" />

      <div className="main">
        <div className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button className="account-back-btn" onClick={() => navigate(-1)}>
                ←
            </button>
            <div>
                <h1>Account</h1>
                <p className="greeting">Manage your profile</p>
            </div>
          </div>
        </div>

        <div className="account-card">
          <div className="account-avatar">🎓</div>

          {/* --- VIEW MODE --- */}
          {!editing ? (
            <>
                <div className="account-name">{user.name}</div>
                <div className="account-email">{user.email}</div>

                {/* Display grid for user metadata */}
                <div className="account-grid">
                {[
                    { label: 'Student ID',       value: user.studentId, locked: true },
                    { label: 'Major',             value: user.major     },
                    { label: 'Year',              value: user.year      },
                    { label: 'Enrolled courses',  value: enrolledCount },
                ].map(({ label, value, locked }) => (
                    <div className="account-field" key={label}>
                    <label>{label}{locked && <span className ="account-locked-badge">🔒</span>}</label>
                    <span>{value}</span>
                    </div>
                ))}
                </div>

                <div className="account-actions">
                  <button className="account-btn-edit" onClick={() => { setDraft(user); setEditing(true); }}>
                      ✏️ Edit Profile
                  </button>
                  <button className="account-btn-logout" onClick={handleLogout}>
                      🚪 Log out
                  </button>
                </div>
            </>
          ) : (
            <>
              {/* --- EDIT MODE --- */}
              <div className="account-edit-form">
                  <div className="account-edit-field">
                    <label>Student ID <span className="account-locked-badge">🔒</span></label>
                    {/* Prevent users from tampering with their ID */}
                    <input value={user.studentId} disabled className="account-input--locked" />
                  </div>
                  {[
                    { label: 'Name',  key: 'name'  },
                    { label: 'Email', key: 'email' },
                    { label: 'Major', key: 'major' },
                    { label: 'Year',  key: 'year'  },
                  ].map(({ label, key }) => (
                    <div className="account-edit-field" key={key}>
                      <label>{label}</label>
                      <input value={draft[key]} onChange={e => setDraft({ ...draft, [key]: e.target.value })} />
                    </div>
                  ))}
                </div>
                <div className="account-actions">
                  <button className="account-btn-edit" onClick={saveProfile}>💾 Save</button>
                  <button className="account-btn-cancel" onClick={() => setEditing(false)}>Cancel</button>
                </div>
            </>
          )}
        </div>
      </div>

      {/* Temporary toast notification for successful saves */}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

export default Account;