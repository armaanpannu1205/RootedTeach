import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import './CourseDashboard.css';

const DEFAULT_COURSE = { code: 'CS 101', name: '컴퓨터 과학 개론', prof: '김교수' };

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
  { date: '2025.11.20', title: 'Midterm Grade', body: '...' },
  { date: '2025.11.15', title: 'Extention the due date of assignment 2', body: '...' },
  { date: '2025.11.10', title: 'Office Hours', body: '...' },
];

function CourseDashboard() {
  const navigate = useNavigate();
  const course = (() => {
    try { return JSON.parse(localStorage.getItem('currentCourse')) || DEFAULT_COURSE; }
    catch { return DEFAULT_COURSE; }
  })();
  const [page, setPage] = useState('syllabus');

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
              <h3>Calendar</h3>
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
                <div className="grade-label">현재 평점</div>
                <div className="total-grade">A (91.0)</div>
              </div>
              <div className="progress-section">
                <div className="grade-label" style={{ marginBottom: 6 }}>progress</div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: '60%' }} />
                </div>
                <div className="progress-text">4/6 Completed</div>
              </div>
            </div>
            <div className="section-card">
              <h3>Grade</h3>
              <table className="grade-table">
                <thead>
                  <tr>
                    <th>Assignment</th><th>Type</th><th>percentage</th><th>Grade</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {GRADES.map((g) => (
                    <tr key={g.name}>
                      <td style={{ fontWeight: 500 }}>{g.name}</td>
                      <td style={{ color: 'var(--muted)' }}>{g.type}</td>
                      <td>{g.weight}</td>
                      <td>{g.score !== '-' ? `${g.score} / ${g.max}` : '-'}</td>
                      <td>
                        {g.score !== '-'
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
              <p>Announcements</p>
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
      </div>
    </div>
  );
}

export default CourseDashboard;