import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar, { COURSE_COLORS } from './components/Sidebar';
import './StudentDashboard.css';
import './Account.css';

const DEFAULT_USER = {
  name: 'Student Name',
  email: 'student@ucla.edu',
  studentId: '123456789',
  major: 'Computer Science',
  year: '3rd Year',
  avatar: '🎓',
};

function Account() {
  const navigate = useNavigate();
  const [courses] = useState(() => {
    try {
      const saved = localStorage.getItem('courses');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('userProfile');
      return saved ? JSON.parse(saved) : DEFAULT_USER;
    } catch { return DEFAULT_USER; }
  });

  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState(user);
  const [toast, setToast]     = useState('');

  function saveProfile() {
    setUser(draft);
    localStorage.setItem('userProfile', JSON.stringify(draft));
    setEditing(false);
    setToast('Profile updated!');
    setTimeout(() => setToast(''), 3000);
  }

  function handleLogout() {
    localStorage.clear();
    navigate('/');
  }

  return (
    <div className="app-layout">
      <Sidebar courses={courses} activePage="account" />

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

        {!editing ? (
        <>
            <div className="account-name">{user.name}</div>
            <div className="account-email">{user.email}</div>

            <div className="account-grid">
            {[
                { label: 'Student ID',       value: user.studentId },
                { label: 'Major',             value: user.major     },
                { label: 'Year',              value: user.year      },
                { label: 'Enrolled courses',  value: courses.length },
            ].map(({ label, value }) => (
                <div className="account-field" key={label}>
                <label>{label}</label>
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
            <div className="account-edit-form">
            {[
                { label: 'Name',       key: 'name'      },
                { label: 'Email',      key: 'email'     },
                { label: 'Student ID', key: 'studentId' },
                { label: 'Major',      key: 'major'     },
                { label: 'Year',       key: 'year'      },
            ].map(({ label, key }) => (
                <div className="account-edit-field" key={key}>
                <label>{label}</label>
                <input
                    value={draft[key]}
                    onChange={e => setDraft({ ...draft, [key]: e.target.value })}
                />
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

    {toast && <div className="toast">{toast}</div>}
    </div>
    );
}

export default Account;