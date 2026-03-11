import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar, { COURSE_COLORS } from './components/Sidebar';
import './StudentDashboard.css';
import './AllAssignment.css';

const SAMPLE_COURSES = [
  { id: 'cs35l',   code: 'CS 35L',   name: 'Software Construction',                    prof: 'Eggert',  color: 0, assignments: 3, upcoming: 1 },
  { id: 'math161', code: 'MATH 161', name: 'Applied Numerical Methods',                 prof: 'Clifton', color: 1, assignments: 5, upcoming: 2 },
  { id: 'cs180',   code: 'CS 180',   name: 'Introduction to Algorithms and Complexity', prof: 'Park',    color: 2, assignments: 2, upcoming: 0 },
];

const ALL_ASSIGNMENTS = [
    { id: 101, courseId: 'cs35l',   courseCode: 'CS 35L',   title: 'Assignment 1',       due: '2025-11-05 23:59', points: 100, status: 'submitted', type: 'Submit the file' },
    { id: 102, courseId: 'cs35l',   courseCode: 'CS 35L',   title: 'Assignment 2',       due: '2025-11-19 23:59', points: 100, status: 'submitted', type: 'Submit the file' },
    { id: 103, courseId: 'cs35l',   courseCode: 'CS 35L',   title: 'Assignment 3',       due: '2025-11-28 23:59', points: 100, status: 'pending',   type: 'Submit the file' },
    { id: 104, courseId: 'cs35l',   courseCode: 'CS 35L',   title: 'Quiz 1',             due: '2025-11-10 14:00', points: 50,  status: 'submitted', type: 'Online Test'     },
    { id: 105, courseId: 'cs35l',   courseCode: 'CS 35L',   title: 'Final Project',      due: '2025-12-20 23:59', points: 200, status: 'pending',   type: 'Submit the file' },
    { id: 201, courseId: 'math161', courseCode: 'MATH 161', title: 'HW 1',               due: '2025-11-01 23:59', points: 50,  status: 'submitted', type: 'Submit the file' },
    { id: 202, courseId: 'math161', courseCode: 'MATH 161', title: 'HW 2',               due: '2025-11-08 23:59', points: 50,  status: 'submitted', type: 'Submit the file' },
    { id: 203, courseId: 'math161', courseCode: 'MATH 161', title: 'HW 3',               due: '2025-11-15 23:59', points: 50,  status: 'pending',   type: 'Submit the file' },
    { id: 204, courseId: 'math161', courseCode: 'MATH 161', title: 'Midterm Exam',        due: '2025-11-25 10:00', points: 150, status: 'pending',   type: 'Online Test'     },
    { id: 205, courseId: 'math161', courseCode: 'MATH 161', title: 'Final Exam',          due: '2025-12-10 10:00', points: 200, status: 'pending',   type: 'Online Test'     },
    { id: 301, courseId: 'cs180',   courseCode: 'CS 180',   title: 'HW 1',               due: '2025-11-03 23:59', points: 80,  status: 'submitted', type: 'Submit the file' },
    { id: 302, courseId: 'cs180',   courseCode: 'CS 180',   title: 'Project Checkpoint', due: '2025-11-20 23:59', points: 100, status: 'pending',   type: 'Submit the file' },
  ];

const COURSE_BY_ID = {
    'cs35l':   { id: 'cs35l',   code: 'CS 35L',   name: 'Software Construction',                    prof: 'Eggert',  color: 0 },
    'math161': { id: 'math161', code: 'MATH 161', name: 'Applied Numerical Methods',                 prof: 'Clifton', color: 1 },
    'cs180':   { id: 'cs180',   code: 'CS 180',   name: 'Introduction to Algorithms and Complexity', prof: 'Park',    color: 2 },
  };

function getDaysLeft(due) {
  const d = new Date(due) - new Date();
  const days = Math.ceil(d / 86400000);
  if (days < 0) return 'closed';
  if (days === 0) return 'Due today';
  return `${days} days left`;
}

function AllAssignment() {
  const navigate = useNavigate();
  const [courses] = useState(() => {
    try { return JSON.parse(localStorage.getItem('courses')) || SAMPLE_COURSES; }
    catch { return SAMPLE_COURSES; }
  });

  const [filter, setFilter] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState('all');


  const filtered = ALL_ASSIGNMENTS.filter(a => {
    const statusOk = filter === 'all' || a.status === filter;
    const courseOk = selectedCourse === 'all' || a.courseId === selectedCourse;
    return statusOk && courseOk;
  });

  const pendingCount   = ALL_ASSIGNMENTS.filter(a => a.status === 'pending').length;
  const submittedCount = ALL_ASSIGNMENTS.filter(a => a.status === 'submitted').length;

  function openAssignment(a) {
    const course = COURSE_BY_ID[a.courseId];
    if (course) localStorage.setItem('currentCourse', JSON.stringify(course));
    navigate('/assignment', { state: { assignmentId: a.id } });
  }

  return (
    <div className="app-layout">
      <Sidebar courses={courses} activePage="assignments" />

      <div className="main">
        <div className="topbar">
          <div>
            <h1>Assignments</h1>
            <p className="greeting">
              {pendingCount} pending · {submittedCount} submitted
            </p>
          </div>
        </div>

        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-val">{ALL_ASSIGNMENTS.length}</div>
            <div className="stat-label">Total assignments</div>
          </div>
          <div className="stat-card">
            <div className="stat-val">{pendingCount}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-card">
            <div className="stat-val">{submittedCount}</div>
            <div className="stat-label">Submitted</div>
          </div>
        </div>

        <div className="aa-filters">
          <div className="aa-filter-group">
            {['all', 'pending', 'submitted'].map(f => (
              <button
                key={f}
                className={`aa-filter-btn ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}>
                {f === 'all' ? 'All' : f === 'pending' ? '⏳ Pending' : '✅ Submitted'}
              </button>
            ))}
          </div>
          <div className="aa-filter-group">
            <button
              className={`aa-filter-btn ${selectedCourse === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedCourse('all')}>
              All classes
            </button>
            {courses.map(c => (
              <button
                key={c.id}
                className={`aa-filter-btn ${selectedCourse === c.id ? 'active' : ''}`}
                onClick={() => setSelectedCourse(c.id)}
                style={selectedCourse === c.id ? {
                  background: COURSE_COLORS[c.color % COURSE_COLORS.length].accent,
                  borderColor: 'transparent',
                  color: '#fff',
                } : {}}
              >
                {c.code}
              </button>
            ))}
          </div>
        </div>

        <div className="aa-list">
          {filtered.length === 0 && (
            <div className="aa-empty">
              <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>📭</div>
              <div>No assignments match this filter.</div>
            </div>
          )}
          {filtered.map(a => {
            const course = courses.find(c => c.id === a.courseId);
            const accent = course ? COURSE_COLORS[course.color % COURSE_COLORS.length].accent : '#e07a5f';
            const daysLeft = getDaysLeft(a.due);
            const urgency  = daysLeft === 'closed' ? 'danger' : daysLeft === 'Due today' ? 'warning' : '';


            return (
              <div
                key={a.id}
                className={`aa-item ${a.status}`}
                onClick={() => openAssignment(a)}
                style={{ borderLeftColor: accent, cursor: 'pointer' }}
              >
                <div className="aa-item-icon">{a.type === 'Online Test' ? '📋' : '📄'}</div>
                <div className="aa-item-body">
                  <div className="aa-item-title">{a.title}</div>
                  <div className="aa-item-meta">
                    <span className="aa-course-tag" style={{ background: accent + '22', color: accent }}>{a.courseCode}</span>
                    <span>📅 {a.due.split(' ')[0]}</span>
                    <span>🏆 {a.points} pts</span>
                    <span>{a.type}</span>
                  </div>
                </div>
                <div className="aa-item-right">
                  <span className={`status-pill ${a.status}`}>{a.status === 'submitted' ? '✅ Submitted' : '⏳ Not submitted'}</span>
                  {a.status === 'pending' && daysLeft && (
                    <span className={`aa-days-left ${urgency}`}>⏰ {daysLeft}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default AllAssignment;