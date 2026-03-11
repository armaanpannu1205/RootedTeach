import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from "react";
import Sidebar from './components/Sidebar';
import './CourseDashboard.css';

const DEFAULT_COURSE = { code: 'CS 35L', name: 'Software Construction', prof: 'Eggert' };

const COURSE_ASSIGNMENTS = {
    'CS 35L': [
      { id: 1, title: 'Assignment 1',  due: '2025-11-05 23:59', points: 100, type: 'Submit the file', status: 'submitted', grade: 92,   feedback: 'Great work! Clean and well-structured.' },
      { id: 2, title: 'Assignment 2',  due: '2025-11-19 23:59', points: 100, type: 'Submit the file', status: 'submitted', grade: 88,   feedback: 'Good effort. Minor edge-case issues.' },
      { id: 3, title: 'Assignment 3',  due: '2025-11-28 23:59', points: 100, type: 'Submit the file', status: 'pending',   grade: null, feedback: null },
      { id: 4, title: 'Quiz 1',        due: '2025-11-10 14:00', points: 50,  type: 'Online Test',     status: 'submitted', grade: 45,   feedback: 'Well done.' },
      { id: 5, title: 'Final Project', due: '2025-12-20 23:59', points: 200, type: 'Submit the file', status: 'pending',   grade: null, feedback: null },
    ],
    'MATH 161': [
      { id: 1, title: 'HW 1',       due: '2025-11-01 23:59', points: 50,  type: 'Submit the file', status: 'submitted', grade: 47,   feedback: 'Excellent.' },
      { id: 2, title: 'HW 2',       due: '2025-11-08 23:59', points: 50,  type: 'Submit the file', status: 'submitted', grade: 43,   feedback: 'Good work.' },
      { id: 3, title: 'HW 3',       due: '2025-11-15 23:59', points: 50,  type: 'Submit the file', status: 'pending',   grade: null, feedback: null },
      { id: 4, title: 'Midterm',    due: '2025-11-25 10:00', points: 150, type: 'Online Test',     status: 'pending',   grade: null, feedback: null },
      { id: 5, title: 'Final Exam', due: '2025-12-10 10:00', points: 200, type: 'Online Test',     status: 'pending',   grade: null, feedback: null },
    ],
    'CS 180': [
      { id: 1, title: 'HW 1',               due: '2025-11-03 23:59', points: 80,  type: 'Submit the file', status: 'submitted', grade: 76,   feedback: 'Solid solution.' },
      { id: 2, title: 'Project Checkpoint', due: '2025-11-20 23:59', points: 100, type: 'Submit the file', status: 'pending',   grade: null, feedback: null },
    ],
  };

  function getAssignments(courseCode) {
    return COURSE_ASSIGNMENTS[courseCode] || COURSE_ASSIGNMENTS['CS 35L'];
  }
  
  function getDaysLeft(due) {
    const d = new Date(due) - new Date();
    const days = Math.ceil(d / 86400000);
    if (days < 0) return 'closed';
    if (days === 0) return 'Due today';
    return `${days} days left`;
  }

const SYLLABUS_WEEKS = [
  { week: 'Week 1', topic: 'Orientation' },
  { week: 'Week 2', topic: 'Ch 1 & Ch 2' },
  { week: 'Week 3', topic: 'Ch 5, Ch 6' },
  { week: 'Week 4', topic: 'Ch 9, Ch 10' },
  { week: 'Week 5', topic: 'Midterm' },
  { week: 'Week 6', topic: 'Ch 3, Ch 4,' },
  { week: 'Week 7', topic: 'Ch 11, Ch 12' },
  { week: 'Week 8', topic: 'Ch 7, Ch 8' },
  { week: 'Week 9', topic: 'Ch 13, Ch 14' },
  { week: 'Week 10', topic: 'Final Exam' },
];

const GRADES = [
  { name: 'Assignment 1', type: 'Assignment', weight: '10%', score: '92', max: '100' },
  { name: 'Assignment 2', type: 'Assignment', weight: '10%', score: '88', max: '100' },
  { name: 'Quiz 1', type: 'Quiz', weight: '5%', score: '85', max: '100' },
  { name: 'Midterm', type: 'Exam', weight: '30%', score: '91', max: '100' },
  { name: 'Assignment 3', type: 'Assignment', weight: '10%', score: '-', max: '100' },
  { name: 'Final project', type: 'Project', weight: '35%', score: '-', max: '100' },
];

const ANNOUNCEMENTS = [
  { date: '2025.11.20', title: 'Midterm Grade', body: 'Midterm grades have been posted. Please check your score on the Grades page.' },
  { date: '2025.11.15', title: 'Extention: Due date of Assignment 2', body: 'The due date for Assignment 2 has been extended to November 19 at 11:59 PM.' },
  { date: '2025.11.10', title: 'Office Hours', body: 'Office hours this week will be held on Monday 1:00–3:00 PM in Boelter 4428.' },
];

function CourseDashboard() {
  const navigate = useNavigate();
  const course = (() => {
    try { return JSON.parse(localStorage.getItem('currentCourse')) || DEFAULT_COURSE; }
    catch { return DEFAULT_COURSE; }
  })();

  const [page, setPage] = useState('syllabus');

useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
}, [page]);

const assignments = getAssignments(course.code);
const submittedCount = assignments.filter(a => a.status === 'submitted').length;

function openAssignment(assignment) {
    localStorage.setItem('selectedAssignmentId', String(assignment.id));
    navigate('/assignment');
}

useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
}, []);

const gradeRows = assignments.map(a => ({
    name:   a.title,
    type:   a.type === 'Online Test' ? 'Quiz/Exam' : 'Assignment',
    score:  a.grade,
    max:    a.points,
    status: a.grade !== null ? 'graded' : 'pending',
    raw:    a,
}));

const gradedItems   = gradeRows.filter(g => g.status === 'graded');
const earnedPts     = gradedItems.reduce((s, g) => s + g.score, 0);
const totalPts      = gradedItems.reduce((s, g) => s + g.max,   0);
const currentPct    = totalPts > 0 ? Math.round((earnedPts / totalPts) * 100) : 0;
const progressPct   = Math.round((gradedItems.length / gradeRows.length) * 100);

function letterGrade(pct) {
    if (pct >= 93) return 'A';
    if (pct >= 90) return 'A-';
    if (pct >= 87) return 'B+';
    if (pct >= 83) return 'B';
    if (pct >= 80) return 'B-';
    if (pct >= 77) return 'C+';
    if (pct >= 70) return 'C';
    return 'D';
}


return (
    <div className="app-layout">
    <Sidebar course={course} activePage={page} onPageChange={setPage} />

      <div className="main">
        
        {page === 'syllabus' && (
          <>
            <div className="page-header">
              <h1>📋 Syllabus</h1>
              <p>Syllabus and Professor Information</p>
            </div>
            <div className="section-card">
              <h3>Class Information</h3>
              <div className="info-grid">
                <div className="info-item"><label>Class Name</label><span>{course.name}</span></div>
                <div className="info-item"><label>Class Code</label><span>{course.code}</span></div>
                <div className="info-item"><label>Professor</label><span>{course.prof}</span></div>
                <div className="info-item"><label>Unit</label><span>3unit</span></div>
                <div className="info-item"><label>Lecture Time</label><span>T, R 14:00–15:30</span></div>
                <div className="info-item"><label>Class Room</label><span>MS 3012</span></div>
                <div className="info-item"><label>Email</label><span>professor@ucla.edu</span></div>
                <div className="info-item"><label>Office Hour</label><span>M 13:00–15:00</span></div>
              </div>
            </div>
            <div className="section-card">
              <h3>Grade Calculation</h3>
              <div className="info-grid">
                <div className="info-item"><label>Assignment</label><span>30%</span></div>
                <div className="info-item"><label>Quiz</label><span>5%</span></div>
                <div className="info-item"><label>Midterm</label><span>30%</span></div>
                <div className="info-item"><label>Final Project</label><span>35%</span></div>
              </div>
            </div>
            <div className="section-card">
              <h3>Weekly Schedule</h3>
              <ul className="week-list">
                {SYLLABUS_WEEKS.map((w) => (
                  <li className="week-item" key={w.week}>
                    <span className="week-num">{w.week}</span>
                    <span className="week-topic">{w.topic}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {page === 'grade' && (
          <>
            <div className="page-header">
              <h1>📊 Grades</h1>
              <p>Check your grade</p>
            </div>
            <div className="section-card grade-summary">
              <div>
                <div className="grade-label">Current Grade</div>
                <div className="total-grade">
                    {totalPts > 0 ? `${letterGrade(currentPct)} (${currentPct})` : 'No grades yet'}
                </div>
              </div>
              <div className="progress-section">
                <div className="grade-label" style={{ marginBottom: 6 }}>progress</div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: '${progressPct}%' }} />
                </div>
                <div className="progress-text">{gradedItems.length} / {gradeRows.length} Completed</div>
              </div>
            </div>
            <div className="section-card">
              <h3>Grade Detail</h3>
              <table className="grade-table">
                <thead>
                  <tr>
                    <th>Assignment</th>
                    <th>Type</th>
                    <th>Grade</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {gradeRows.map((g) => (
                    <tr
                        key={g.name}
                        className="grade-table__row--clickable"
                        onClick={() => openAssignment(g.raw)}
                        title={`Open ${g.name}`}
                    >
                    <td style={{ fontWeight: 500 }}>{g.name}</td>
                    <td style={{ color: 'var(--muted)' }}>{g.type}</td>
                    <td>{g.score !== null ? `${g.score} / ${g.max}` : '—'}</td>
                    <td>
                      {g.status === 'graded'
                        ? <span className="grade-pill done">Graded</span>
                        : <span className="grade-pill pending">Pending</span>}
                    </td>
                  </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {page === 'announce' && (
          <>
            <div className="page-header">
              <h1>📢 Announcements</h1>
              <p>{ANNOUNCEMENTS.length} announcements</p>
            </div>
            <div className="section-card">
              {ANNOUNCEMENTS.map((a) => (
                <div className="announce-item" key={a.title}>
                  <div className="announce-date">{a.date}</div>
                  <div className="announce-title">{a.title}</div>
                  <div className="announce-body">{a.body}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {page === 'assignments' && (
          <>
            <div className="page-header">
              <h1>📝 Assignments</h1>
              <p>{assignments.length} assignments · {submittedCount} submitted</p>
            </div>
            <div className="assignment-tiles">
              {assignments.map((a) => {
                const daysLeft = getDaysLeft(a.due);
                const urgency = 
                    daysLeft === 'closed' ? 'danger' : 
                    daysLeft === 'Due today' ? 'warning' : '';
                return (
                  <div className={`assignment-tile ${a.status}`}
                    key={a.id} 
                    onClick={() => openAssignment(a)}>
                    <div className="tile-left">
                      <div className="tile-icon">{a.type === 'Online Test' ? '📋' : '📄'}</div>
                    </div>
                    <div className="tile-body">
                      <div className="tile-title">{a.title}</div>
                      <div className="tile-meta">
                        <span>📅 {a.due.split(' ')[0]}</span>
                        <span>🏆 {a.points}pts</span>
                        <span>{a.type}</span>
                      </div>
                    </div>
                    <div className="tile-right">
                      <span className={`status-pill ${a.status}`}>
                        {a.status === 'submitted' ? '✅ Submitted' : '⏳ Not submitted'}
                      </span>
                      {a.status === 'submitted' && a.grade !== null && (
                        <span className="tile-grade">{a.grade} / {a.points}</span>
                      )}
                      {a.status === 'pending' && daysLeft && (
                        <span className={`days-left ${urgency}`}>⏰ {daysLeft}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

      </div>
    </div>
  );
}
export default CourseDashboard;