import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar, { COURSE_COLORS } from '../../components/Sidebar/Sidebar';
import './StudentDashboard.css';
import './Calendar.css';

const SAMPLE_COURSES = [
  { id: 'cs35l',   code: 'CS 35L',   name: 'Software Construction',                    prof: 'Eggert',  color: 0, assignments: 3, upcoming: 1 },
  { id: 'math161', code: 'MATH 161', name: 'Applied Numerical Methods',                 prof: 'Clifton', color: 1, assignments: 5, upcoming: 2 },
  { id: 'cs180',   code: 'CS 180',   name: 'Introduction to Algorithms and Complexity', prof: 'Park',    color: 2, assignments: 2, upcoming: 0 },
];

const ALL_EVENTS = [
  { id: 1, date: '2025-11-05', title: 'CS 35L – Assignment 1 Due',   type: 'assignment', courseColor: 0 },
  { id: 2, date: '2025-11-10', title: 'CS 35L – Quiz 1',             type: 'quiz',       courseColor: 0 },
  { id: 3, date: '2025-11-15', title: 'MATH 161 – HW 3 Due',         type: 'assignment', courseColor: 1 },
  { id: 4, date: '2025-11-19', title: 'CS 35L – Assignment 2 Due',   type: 'assignment', courseColor: 0 },
  { id: 5, date: '2025-11-20', title: 'CS 180 – Project Checkpoint',  type: 'assignment', courseColor: 2 },
  { id: 6, date: '2025-11-25', title: 'MATH 161 – Midterm Exam',      type: 'exam',       courseColor: 1 },
  { id: 7, date: '2025-11-28', title: 'CS 35L – Assignment 3 Due',   type: 'assignment', courseColor: 0 },
  { id: 8, date: '2025-12-05', title: 'CS 180 – Final Exam',          type: 'exam',       courseColor: 2 },
  { id: 9, date: '2025-12-20', title: 'CS 35L – Final Project Due',  type: 'assignment', courseColor: 0 },
];

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

function Calendar() {
  const navigate = useNavigate();
  const [courses] = useState(() => {
    try {
      const saved = localStorage.getItem('courses');
      return saved ? JSON.parse(saved) : SAMPLE_COURSES;
    } catch { return SAMPLE_COURSES; }
  });

  const today = new Date();
  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0-indexed

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  // Build grid: leading blanks + days
  const firstDow = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  function eventsForDay(d) {
    if (!d) return [];
    const key = `${year}-${String(month + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    return ALL_EVENTS.filter(e => e.date === key);
  }

  const isToday = (d) =>
    d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  // Upcoming events (next 30 days)
  const nowMs = today.getTime();
  const upcoming = ALL_EVENTS
    .filter(e => {
      const ms = new Date(e.date).getTime();
      return ms >= nowMs && ms <= nowMs + 30 * 86400000;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="app-layout">
      <Sidebar courses={courses} activePage="calendar" />

      <div className="main cal-main">
        <div className="cal-layout">

          {/* Left: calendar grid */}
          <div className="cal-grid-section">
            <div className="cal-header">
              <button className="cal-nav-btn" onClick={prevMonth}>‹</button>
              <h2 className="cal-title">{MONTH_NAMES[month]} {year}</h2>
              <button className="cal-nav-btn" onClick={nextMonth}>›</button>
            </div>

            <div className="cal-dow-row">
              {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                <div key={d} className="cal-dow">{d}</div>
              ))}
            </div>

            <div className="cal-grid">
              {cells.map((d, i) => {
                const evs = eventsForDay(d);
                return (
                  <div
                    key={i}
                    className={`cal-cell ${!d ? 'cal-cell--empty' : ''} ${isToday(d) ? 'cal-cell--today' : ''}`}
                  >
                    {d && <span className="cal-day-num">{d}</span>}
                    <div className="cal-cell-events">
                      {evs.slice(0, 2).map(e => (
                        <div
                          key={e.id}
                          className="cal-event-dot"
                          style={{ background: COURSE_COLORS[e.courseColor % COURSE_COLORS.length].accent }}
                          title={e.title}
                        />
                      ))}
                      {evs.length > 2 && (
                        <div className="cal-event-more">+{evs.length - 2}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: upcoming events */}
          <div className="cal-sidebar">
            <h3 className="cal-sidebar-title">Upcoming (30 days)</h3>
            {upcoming.length === 0 ? (
              <div className="cal-empty">No upcoming events 🎉</div>
            ) : (
              <div className="cal-event-list">
                {upcoming.map(e => {
                  const dt = new Date(e.date);
                  const diffDays = Math.ceil((dt.getTime() - nowMs) / 86400000);
                  return (
                    <div className="cal-event-item" key={e.id}>
                      <div
                        className="cal-event-bar"
                        style={{ background: COURSE_COLORS[e.courseColor % COURSE_COLORS.length].accent }}
                      />
                      <div className="cal-event-info">
                        <div className="cal-event-title">{e.title}</div>
                        <div className="cal-event-date">
                          {MONTH_NAMES[dt.getMonth()]} {dt.getDate()} ·{' '}
                          <span className={diffDays <= 3 ? 'cal-urgent' : ''}>
                            {diffDays === 0 ? 'Today' : diffDays === 1 ? 'Tomorrow' : `${diffDays} days left`}
                          </span>
                        </div>
                      </div>
                      <span className={`cal-type-pill cal-type-pill--${e.type}`}>
                        {e.type}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default Calendar;