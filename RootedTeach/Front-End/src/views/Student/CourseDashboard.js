import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import { api } from '../../utils/api';
import './CourseDashboard.css';

const DEFAULT_COURSE = { code: 'CS 35L', name: 'Software Construction', prof: 'Eggert' };

const SYLLABUS_WEEKS = [
  { week: 'Week 1', topic: 'Orientation' },
  { week: 'Week 2', topic: 'Ch 1 & Ch 2' },
  { week: 'Week 3', topic: 'Ch 5, Ch 6' },
  { week: 'Week 4', topic: 'Ch 9, Ch 10' },
  { week: 'Week 5', topic: 'Midterm' },
  { week: 'Week 6', topic: 'Ch 3, Ch 4' },
  { week: 'Week 7', topic: 'Ch 11, Ch 12' },
  { week: 'Week 8', topic: 'Ch 7, Ch 8' },
  { week: 'Week 9', topic: 'Ch 13, Ch 14' },
  { week: 'Week 10', topic: 'Final Exam' },
];

const ANNOUNCEMENTS = [
  { id: 1, date: '2025.11.20', title: 'Midterm Grade', preview: 'Midterm grades have been released.', body: 'Midterm grades have been released on the portal. The class average was 84/100.\n\nIf you have any questions about your grade or want to request a regrade, please come to office hours by November 27th.' },
  { id: 2, date: '2025.11.15', title: 'Extension: Assignment 2 due date', preview: 'Due date extended to November 22.', body: 'Due to several requests, the due date for Assignment 2 has been extended to November 22nd at 11:59 PM.\n\nNo further extensions will be granted.' },
  { id: 3, date: '2025.11.10', title: 'Office Hours', preview: 'Office hours schedule updated for the rest of the quarter.', body: 'Office hours have been updated:\n\n• Monday: 1:00 PM – 3:00 PM\n• Wednesday: 2:00 PM – 4:00 PM (Zoom)' },
];

function getDaysLeft(due) {
  const d = new Date(due) - new Date();
  const days = Math.ceil(d / 86400000);
  if (days < 0) return 'closed';
  if (days === 0) return 'Due today';
  return `${days} days left`;
}

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

function CourseDashboard() {
  const navigate = useNavigate();
  const course = (() => {
    try { return JSON.parse(localStorage.getItem('currentCourse')) || DEFAULT_COURSE; }
    catch { return DEFAULT_COURSE; }
  })();

  const [page, setPage] = useState('syllabus');
  const [selectedAnnounce, setSelectedAnnounce] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const studentId = localStorage.getItem('userId');

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [page]);
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, []);

  // Fetch real assignments from backend
  useEffect(() => {
    const classId = course.id || course._id;
    if (!classId) { setLoadingAssignments(false); return; }
    api.get(`/api/assignments/class/${classId}`)
      .then(r => r.json())
      .then(data => {
        const mapped = (Array.isArray(data) ? data : []).map(a => {
          const sub = (a.submissions || []).find(
            s => s.student?._id === studentId || s.student === studentId
          );
          return {
            id: a.id,
            title: a.title,
            due: a.dueDate || null,
            points: a.points || 100,
            status: sub ? 'submitted' : 'pending',
            grade: sub?.score ?? null,
            aiScore: sub?.aiScore ?? null,
            desc: a.description || '',
          };
        });
        setAssignments(mapped);
      })
      .catch(console.error)
      .finally(() => setLoadingAssignments(false));
  }, [course.id, course._id, studentId]);

  function openAssignment(assignment) {
    localStorage.setItem('selectedAssignmentId', String(assignment.id));
    navigate('/assignment');
  }

  // Grade summary computed server-side from real assignments
  const gradedItems = assignments.filter(a => a.grade !== null);
  const earnedPts   = gradedItems.reduce((s, a) => s + a.grade, 0);
  const totalPts    = gradedItems.reduce((s, a) => s + a.points, 0);
  const currentPct  = totalPts > 0 ? Math.round((earnedPts / totalPts) * 100) : 0;
  const progressPct = assignments.length > 0 ? Math.round((gradedItems.length / assignments.length) * 100) : 0;

  return (
    <div className="app-layout">
      <Sidebar course={course} activePage={page}
        onPageChange={(p) => { setPage(p); setSelectedAnnounce(null); }} />

      <div className="main">

        {page === 'syllabus' && (
          <>
            <div className="page-header"><h1>📋 Syllabus</h1><p>Syllabus and Professor Information</p></div>
            <div className="section-card">
              <h3>Class Information</h3>
              <div className="info-grid">
                <div className="info-item"><label>Class Name</label><span>{course.className || course.name}</span></div>
                <div className="info-item"><label>Class Code</label><span>{course.classCode || course.code || '—'}</span></div>
                <div className="info-item"><label>Professor</label><span>{course.teacher?.username || course.prof || '—'}</span></div>
                <div className="info-item"><label>Quarter</label><span>{course.quarter || '—'}</span></div>
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
            <div className="page-header"><h1>📊 Grades</h1><p>Your current grades</p></div>
            <div className="section-card grade-summary">
              <div>
                <div className="grade-label">Current Grade</div>
                <div className="total-grade">
                  {totalPts > 0 ? `${letterGrade(currentPct)} (${currentPct}%)` : 'No grades yet'}
                </div>
              </div>
              <div className="progress-section">
                <div className="grade-label" style={{ marginBottom: 6 }}>Progress</div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
                </div>
                <div className="progress-text">{gradedItems.length} / {assignments.length} Graded</div>
              </div>
            </div>
            <div className="section-card">
              <h3>Grade Detail</h3>
              {assignments.length === 0
                ? <div style={{ textAlign: 'center', padding: 32, color: 'var(--muted)' }}>No assignments yet.</div>
                : (
                  <table className="grade-table">
                    <thead>
                      <tr><th>Assignment</th><th>Points</th><th>Grade</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                      {assignments.map(a => (
                        <tr key={a.id}>
                          <td style={{ fontWeight: 500 }}>{a.title}</td>
                          <td style={{ color: 'var(--muted)' }}>{a.points} pts</td>
                          <td>{a.grade !== null ? `${a.grade} / ${a.points}` : '—'}</td>
                          <td>
                            {a.grade !== null
                              ? <span className="grade-pill done">Graded</span>
                              : <span className="grade-pill pending">Pending</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              }
            </div>
          </>
        )}

        {page === 'announce' && (
          <>
            {selectedAnnounce ? (
              <>
                <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <button className="account-back-btn" onClick={() => setSelectedAnnounce(null)}>←</button>
                  <div><h1>📢 {selectedAnnounce.title}</h1><p>{selectedAnnounce.date}</p></div>
                </div>
                <div className="section-card announce-detail-card">
                  <p style={{ whiteSpace: 'pre-line', lineHeight: 1.75, color: 'var(--text-primary)' }}>{selectedAnnounce.body}</p>
                </div>
              </>
            ) : (
              <>
                <div className="page-header"><h1>📢 Announcements</h1><p>Announcements</p></div>
                <div className="section-card">
                  {ANNOUNCEMENTS.map(a => (
                    <div className="announce-item announce-item--clickable" key={a.id} onClick={() => setSelectedAnnounce(a)}>
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
            <div className="page-header">
              <h1>📝 Assignments</h1>
              <p>{loadingAssignments ? 'Loading…' : `${assignments.length} assignments · ${assignments.filter(a => a.status === 'submitted').length} submitted`}</p>
            </div>
            <div className="section-card">
              {loadingAssignments && (
                <div style={{ textAlign: 'center', padding: 32, color: 'var(--muted)' }}>Loading assignments…</div>
              )}
              {!loadingAssignments && assignments.length === 0 && (
                <div style={{ textAlign: 'center', padding: 32, color: 'var(--muted)' }}>No assignments yet.</div>
              )}
              {!loadingAssignments && assignments.map(a => (
                <div className="assignment-tile" key={a.id} onClick={() => openAssignment(a)}>
                  <div className="tile-left">
                    <div className="tile-icon">📄</div>
                    <div>
                      <div className="tile-title">{a.title}</div>
                      <div className="tile-meta">
                        {a.due && <span>📅 {new Date(a.due).toLocaleDateString()}</span>}
                        <span>🏆 {a.points} pts</span>
                        {a.due && a.status === 'pending' && (
                          <span style={{ color: getDaysLeft(a.due) === 'closed' ? 'var(--danger)' : 'var(--muted)' }}>
                            ⏰ {getDaysLeft(a.due)}
                          </span>
                        )}
                        {a.aiScore != null && (
                          <span style={{ color: a.aiScore >= 70 ? '#e53e3e' : a.aiScore >= 40 ? '#e8a040' : '#38a169', fontSize: 11 }}>
                            🤖 {a.aiScore}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="tile-right">
                    <span className={`status-pill ${a.status}`}>
                      {a.status === 'submitted' ? '✅ Submitted' : '⏳ Pending'}
                    </span>
                    {a.grade !== null && <span className="tile-grade">{a.grade}/{a.points}</span>}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  );
}

export default CourseDashboard;
