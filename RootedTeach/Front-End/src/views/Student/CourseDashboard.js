import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from "react";
import Sidebar from '../../components/Sidebar/Sidebar';
import './CourseDashboard.css';

const DEFAULT_COURSE = { code: 'CS 35L', name: 'Software Construction', prof: 'Eggert' };

const COURSE_ASSIGNMENTS = {
    'CS 35L': [
      { id: 101, title: 'Assignment 1',  due: '2025-11-05 23:59', points: 100, type: 'Submit the file', status: 'submitted', grade: 92 },
      { id: 102, title: 'Assignment 2',  due: '2025-11-19 23:59', points: 100, type: 'Submit the file', status: 'submitted', grade: 88 },
      { id: 103, title: 'Assignment 3',  due: '2025-11-28 23:59', points: 100, type: 'Submit the file', status: 'pending',   grade: null },
      { id: 104, title: 'Quiz 1',        due: '2025-11-10 14:00', points: 50,  type: 'Online Test',     status: 'submitted', grade: null },
      { id: 105, title: 'Final Project', due: '2025-12-20 23:59', points: 200, type: 'Submit the file', status: 'pending',   grade: null },
    ],
    'MATH 161': [
      { id: 201, title: 'HW 1',         due: '2025-11-01 23:59', points: 50,  type: 'Submit the file', status: 'submitted', grade: 48  },
      { id: 202, title: 'HW 2',         due: '2025-11-08 23:59', points: 50,  type: 'Submit the file', status: 'submitted', grade: 45  },
      { id: 203, title: 'HW 3',         due: '2025-11-15 23:59', points: 50,  type: 'Submit the file', status: 'pending',   grade: null },
      { id: 204, title: 'Midterm Exam', due: '2025-11-25 10:00', points: 150, type: 'Online Test',     status: 'pending',   grade: null },
      { id: 205, title: 'Final Exam',   due: '2025-12-10 10:00', points: 200, type: 'Online Test',     status: 'pending',   grade: null },
    ],
    'CS 180': [
      { id: 301, title: 'HW 1',               due: '2025-11-03 23:59', points: 80,  type: 'Submit the file', status: 'submitted', grade: 76  },
      { id: 302, title: 'Project Checkpoint', due: '2025-11-20 23:59', points: 100, type: 'Submit the file', status: 'pending',   grade: null },
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
    {
      id: 1,
      date: '2025.11.20',
      title: 'Midterm Grade',
      preview: 'Midterm grades have been released.',
      body: `Midterm grades have been released on the portal. The class average was 84/100.\n\nIf you have any questions about your grade or want to request a regrade, please come to office hours by November 27th.\n\nGreat work this quarter — keep it up for the final!`,
    },
    {
      id: 2,
      date: '2025.11.15',
      title: 'Extension: Assignment 2 due date',
      preview: 'Due date extended to November 22.',
      body: `Due to several requests, the due date for Assignment 2 has been extended to November 22nd at 11:59 PM.\n\nNo further extensions will be granted. Please make sure to submit on time.\n\nIf you have already submitted, you may resubmit until the new deadline.`,
    },
    {
      id: 3,
      date: '2025.11.10',
      title: 'Office Hours',
      preview: 'Office hours schedule updated for the rest of the quarter.',
      body: `Office hours have been updated for the remainder of the quarter:\n\n• Monday: 1:00 PM – 3:00 PM (Boelter 3531)\n• Wednesday: 2:00 PM – 4:00 PM (Zoom, link on CCLE)\n\nFeel free to drop in with any questions about lectures, assignments, or the upcoming project.`,
    },
  ];

function CourseDashboard() {
  const navigate = useNavigate();
  const course = (() => {
    try { return JSON.parse(localStorage.getItem('currentCourse')) || DEFAULT_COURSE; }
    catch { return DEFAULT_COURSE; }
  })();

  const [page, setPage] = useState('syllabus');
  const [selectedAnnounce, setSelectedAnnounce] = useState(null);
  const courseAssignments = COURSE_ASSIGNMENTS[course.code] || [];


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
    <Sidebar course={course} activePage={page}
        onPageChange={(p) => { setPage(p); setSelectedAnnounce(null); }} />

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
                  {GRADES.map((g) => (
                    <tr key={g.name}>
                    <td style={{ fontWeight: 500 }}>{g.name}</td>
                    <td style={{ color: 'var(--muted)' }}>{g.type}</td>
                    <td> {g.weight}</td>
                    <td>{g.score !== '-' ? `${g.score} / ${g.max}` : '—'}</td>
                    <td>
                      {g.status === '-'
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
            {selectedAnnounce ? (
              <>
                <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <button className="account-back-btn" onClick={() => setSelectedAnnounce(null)}>←</button>
                  <div>
                    <h1>📢 {selectedAnnounce.title}</h1>
                    <p>{selectedAnnounce.date}</p>
                  </div>
                </div>
                <div className="section-card announce-detail-card">
                  <p style={{ whiteSpace: 'pre-line', lineHeight: 1.75, color: 'var(--text-primary)' }}>
                    {selectedAnnounce.body}
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="page-header"><h1>📢 Announcements</h1><p>Announcements</p></div>
                <div className="section-card">
                  {ANNOUNCEMENTS.map((a) => (
                    /* FIX 3: each announcement is clickable */
                    <div
                      className="announce-item announce-item--clickable"
                      key={a.id}
                      onClick={() => setSelectedAnnounce(a)}
                    >
                      <div className="announce-date">{a.date}</div>
                      <div className="announce-title">{a.title}</div>
                      <div className="announce-body">{a.preview}</div>
                      <span className="announce-arrow">›</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {page === 'assignments' && (
          <>
            <div className="page-header"><h1>📝 Assignments</h1><p>{courseAssignments.length} assignments</p></div>
            <div className="section-card">
              {courseAssignments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px', color: 'var(--muted)' }}>No assignments yet.</div>
              ) : (
                courseAssignments.map((a) => (
                  <div
                    className="assignment-tile"
                    key={a.id}
                    onClick={() => openAssignment(a)}
                  >
                    <div className="tile-left">
                      <div className="tile-icon">{a.type === 'Online Test' ? '📋' : '📄'}</div>
                      <div>
                        <div className="tile-title">{a.title}</div>
                        <div className="tile-meta">
                          <span>📅 {a.due.split(' ')[0]}</span>
                          <span>🏆 {a.points}pts</span>
                          <span>{a.type}</span>
                        </div>
                      </div>
                    </div>
                    <div className="tile-right">
                      <span className={`status-pill ${a.status}`}>
                        {a.status === 'submitted' ? '✅ Submitted' : '⏳ Pending'}
                      </span>
                      {a.grade !== null && (
                        <span className="tile-grade">{a.grade}/{a.points}</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
}

export default CourseDashboard;