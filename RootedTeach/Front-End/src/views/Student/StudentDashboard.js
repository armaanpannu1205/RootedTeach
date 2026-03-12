import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar, { COURSE_COLORS } from '../../components/Sidebar/Sidebar';
import { api } from '../../utils/api';
import './StudentDashboard.css';

function StudentDashboard() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [code, setCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [toast, setToast] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const studentId = localStorage.getItem('userId');

  useEffect(() => {
    api.get(`/api/classes/student/${studentId}`)
      .then(r => r.json())
      .then(data => setCourses(Array.isArray(data) ? data : []))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, [studentId]);

  useEffect(() => { localStorage.setItem('courses', JSON.stringify(courses)); }, [courses]);

  async function joinCourse() {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    setJoining(true); setJoinError('');
    try {
      const res = await api.post('/api/classes/join', { classCode: trimmed });
      const data = await res.json();
      if (!res.ok) { setJoinError(data.message || 'Failed to join class.'); return; }
      setCourses(prev => [...prev, data.class]);
      setCode(''); setShowModal(false);
      setToast(`✅ Joined ${data.class.className}!`);
      setTimeout(() => setToast(''), 3000);
    } catch { setJoinError('Could not connect to server.'); }
    finally { setJoining(false); }
  }

  function openCourse(course) {
    localStorage.setItem('currentCourse', JSON.stringify(course));
    navigate('/course');
  }

  const totalAssignments = courses.reduce((a, c) => a + (c.assignments || 0), 0);
  const totalUpcoming    = courses.reduce((a, c) => a + (c.upcoming    || 0), 0);

  return (
    <div className="app-layout">
      <Sidebar courses={courses} activePage="dashboard"/>

      <div className="main">
        <div className="topbar">
          <div>
            <h1>Dashboard</h1>
            <p className="greeting">Welcome back, {localStorage.getItem('username') || 'Student'} 👋</p>
          </div>
          <button className="add-btn" onClick={() => { setShowModal(true); setJoinError(''); setCode(''); }}>
            + Join class
          </button>
        </div>

        <div className="stats-row">
          <div className="stat-card"><div className="stat-val">{loading ? '…' : courses.length}</div><div className="stat-label">Enrolled classes</div></div>
          <div className="stat-card"><div className="stat-val">{totalAssignments}</div><div className="stat-label">Assignments</div></div>
          <div className="stat-card"><div className="stat-val">{totalUpcoming}</div><div className="stat-label">Due upcoming</div></div>
        </div>

        <div className="section-title">My classes ({courses.length})</div>
        <div className="courses-grid">
          {loading && <div className="empty-state"><div className="empty-icon">⏳</div><div>Loading your classes…</div></div>}
          {!loading && courses.length === 0 && (
            <div className="empty-state"><div className="empty-icon">📚</div><div>You have no classes yet.<br/>Ask your professor for the 6-letter class code.</div></div>
          )}
          {courses.map(c => {
            const id = c.id || c._id;
            const colorIndex = typeof c.color === 'number' ? c.color % COURSE_COLORS.length : null;
            const bgColor = colorIndex !== null ? COURSE_COLORS[colorIndex].gradient : (c.color || '#0f1646');
            return (
              <div className="course-card" key={id}>
                <div className="card-header" style={{ background: bgColor }} onClick={() => openCourse(c)}>
                  <div className="card-code">{c.className}</div>
                  <button className="card-delete-btn" onClick={e => { e.stopPropagation(); setDeleteTarget(c); }} title="Leave class">✕</button>
                </div>
                <div className="card-body" onClick={() => openCourse(c)}>
                  <div className="card-title">{c.className}</div>
                  <div className="card-prof">{c.teacher?.username ? `Prof. ${c.teacher.username}` : 'No teacher assigned'}</div>
                  <div className="card-meta">
                    {c.quarter && <span className="badge">{c.quarter}</span>}
                    <span className="badge">{c.assignments || 0} assignments</span>
                    {c.upcoming > 0 && <span className="badge warn">{c.upcoming} due soon</span>}
                    {c.classCode && <span className="badge" style={{fontFamily:'monospace',letterSpacing:'.08em'}}>{c.classCode}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <h2>Join a class</h2>
            <p>Enter the 6-letter code your professor gave you.</p>
            <input placeholder="e.g. A3BF9K" value={code}
              onChange={e => { setCode(e.target.value.toUpperCase()); setJoinError(''); }}
              onKeyDown={e => e.key === 'Enter' && joinCourse()}
              autoFocus maxLength={6}
              style={{ textTransform:'uppercase', letterSpacing:'.12em', fontWeight:600 }}/>
            {joinError && <p style={{color:'#e05f5f',fontSize:13,marginTop:-12,marginBottom:16}}>⚠️ {joinError}</p>}
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="add-btn" onClick={joinCourse} disabled={joining}>{joining ? 'Joining…' : 'Join'}</button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setDeleteTarget(null)}>
          <div className="modal modal--danger">
            <div className="modal-danger-icon">🗑️</div>
            <h2>Leave class?</h2>
            <p><strong>{deleteTarget.className}</strong><br/>This will remove the class from your dashboard.</p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="btn-danger" onClick={() => {
                setCourses(prev => prev.filter(c => (c.id||c._id) !== (deleteTarget.id||deleteTarget._id)));
                setDeleteTarget(null);
                setToast('🗑️ Left class.'); setTimeout(()=>setToast(''),3000);
              }}>Leave</button>
            </div>
          </div>
        </div>
      )}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

export default StudentDashboard;
