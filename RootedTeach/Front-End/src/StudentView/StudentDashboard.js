import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar, { COURSE_COLORS } from './components/Sidebar';
import './StudentDashboard.css';

//const SAMPLE_COURSES = [
//  { id: 'cs35l', code: 'CS 35L', name: 'Software Construction', prof: 'Eggert', color: 0, assignments: 3, upcoming: 1 },
//  { id: 'math161', code: 'MATH 161', name: 'Applied Numerical Methods', prof: 'Clifton', color: 1, assignments: 5, upcoming: 2 },
//  { id: 'cs180', code: 'CS 180', name: 'Introduction to Algorithms and Complexity', prof: 'Park', color: 2, assignments: 2, upcoming: 0 },
//];

function StudentDashboard() {
  const navigate = useNavigate();
/*  const [courses, setCourses] = useState(() => {
    try {
      const saved = localStorage.getItem('courses');
      return saved ? JSON.parse(saved) : SAMPLE_COURSES;
    } catch {
      return SAMPLE_COURSES;
    }
  }); */

const [courses, setCourses] = useState([]);

useEffect(() => {
  const fetchCourses = async () => {
    try {
      const studentId = localStorage.getItem('userId');
      const res = await fetch(`http://localhost:5001/api/classes/student/${studentId}`);
      const data = await res.json();
      setCourses(data);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    }
  };
  fetchCourses();
}, []);

  const [showModal, setShowModal] = useState(false);
  const [code, setCode] = useState('');
  const [toast, setToast] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    localStorage.setItem('courses', JSON.stringify(courses));
  }, [courses]);

  function addCourse() {
    if (!code.trim()) return;
    const newCourse = {
      id: code.toLowerCase().replace(/\s/g, '_') + '_' + Date.now(),
      code: code.trim().toUpperCase(),
      name: `${code.trim().toUpperCase()} class`,
      prof: 'Professor',
      color: courses.length % COURSE_COLORS.length,
      assignments: 0,
      upcoming: 0,
    };
    setCourses([...courses, newCourse]);
    setCode('');
    setShowModal(false);
    setToast('added the class');
    setTimeout(() => setToast(''), 3000);
  }

  function deleteCourse(id) 
  {
    setCourses(courses.filter((c) => c.id !== id));
    setDeleteTarget(null);
    setToast('🗑️ Class removed.');
    setTimeout(() => setToast(''), 3000);
  }

  function openCourse(course) {
    localStorage.setItem('currentCourse', JSON.stringify(course));
    navigate('/course');
  }

  return (
    <div className="app-layout">
      <Sidebar courses={courses} activePage="dashboard" />

      <div className="main">
        <div className="topbar">
          <div>
            <h1>Dashboard</h1>
            <p className="greeting">Welcome to RootedTeach 👋</p>
          </div>
          <button className="add-btn" onClick={() => setShowModal(true)}>
            + Add class
          </button>
        </div>

        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-val">{courses.length}</div>
            <div className="stat-label">already taking</div>
          </div>
          <div className="stat-card">
            {Array.isArray(courses) ? courses.reduce((a, c) => a + c.assignments, 0) : 0}
            <div className="stat-label">Assignments</div>
          </div>  
          <div className="stat-card">
            {Array.isArray(courses) ? courses.reduce((a, c) => a + c.upcoming, 0) : 0}
            <div className="stat-label">Due upcoming</div>
          </div>
        </div>

        <div className="section-title">My classes ({courses.length})</div>
        <div className="courses-grid">
          {(!Array.isArray(courses) || courses.length === 0) && (
            <div className="empty-state">
              <div className="empty-icon">📚</div>
              <div>You have no class yet.<br />Please enter the code to add the class.</div>
            </div>
          )}
          {Array.isArray(courses) && courses.map((c) => (
            <div className="course-card" key={c._id}>
            <div
              className="card-header"
              style={{ backgroundColor: c.color || '#0f1646' }}
              onClick={() => openCourse(c)}
            >
              <div className="card-code">{c.className}</div>
              <button
                className="card-delete-btn"
                onClick={(e) => { e.stopPropagation(); setDeleteTarget(c); }}
                title="Remove class"
              >
                ✕
              </button>
            </div>
            <div className="card-body" onClick={() => openCourse(c)}>
              <div className="card-title">{c.className}</div>
              <div className="card-prof">{c.teacher?.username}</div>
              <div className="card-meta">
                <span className="badge">{c.assignments} Assignment</span>
                {c.upcoming > 0 && (
                  <span className="badge warn">{c.upcoming} Due is coming</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <h2>Add class</h2>
            <p>Enter the code that you got from the professor.</p>
            <input
              placeholder="Example: CS 35L"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCourse()}
              autoFocus
            />
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="add-btn" onClick={addCourse}>Add</button>
            </div>
          </div>
        </div>
      )}

{deleteTarget && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setDeleteTarget(null)}>
          <div className="modal modal--danger">
            <div className="modal-danger-icon">🗑️</div>
            <h2>Remove class?</h2>
            <p>
              <strong>{deleteTarget.code}</strong> — {deleteTarget.name}<br />
              This will remove the class from your dashboard.
            </p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="btn-danger" onClick={() => deleteCourse(deleteTarget.id)}>Remove</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>

  );
}

export default StudentDashboard;