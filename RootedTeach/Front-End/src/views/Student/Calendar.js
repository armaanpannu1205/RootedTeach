/* Calendar.js - Displays a monthly view of all assignment deadlines. */
/* Aggregates assignments from all courses the student is enrolled in. */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar, { COURSE_COLORS } from '../../components/Sidebar/Sidebar';
import { api } from '../../utils/api';
import './StudentDashboard.css';
import './Calendar.css';

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

function Calendar() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [events, setEvents]   = useState([]); // Replaced static ALL_EVENTS
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0-indexed
  const studentId = localStorage.getItem('userId');

  // Fetch real data from the backend
  useEffect(() => {
    const fetchEverything = async () => {
      if (!studentId) return;
      setLoading(true);
      try {
        // 1. Get student's courses
        const cRes = await api.get(`/api/classes/student/${studentId}`);
        const courseData = await cRes.json();
        const classList = Array.isArray(courseData) ? courseData : [];
        setCourses(classList);

        // 2. Fetch assignments for every course simultaneously
        const allAssignments = await Promise.all(
          classList.map(async (c) => {
            try {
              const aRes = await api.get(`/api/assignments/class/${c.id || c._id}`);
              const aData = await aRes.json();
              return (Array.isArray(aData) ? aData : []).map(a => ({
                id: a.id || a._id,
                date: a.dueDate ? a.dueDate.split('T')[0] : null, // Ensure YYYY-MM-DD format
                title: `${c.classCode || c.className} – ${a.title}`,
                type: 'assignment',
                courseColor: c.color || 0
              }));
            } catch { return []; }
          })
        );

        // 3. Flatten and filter assignments that have a due date
        const flatEvents = allAssignments.flat().filter(e => e.date !== null);
        setEvents(flatEvents);
      } catch (err) {
        console.error('Failed to load calendar data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEverything();
  }, [studentId]);

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  function eventsForDay(d) {
    if (!d) return [];
    const key = `${year}-${String(month + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    return events.filter(e => e.date === key);
  }

  const isToday = (d) =>
    d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const nowMs = today.getTime();
  const upcoming = events
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
              {loading ? (
                <div className="cal-loading-overlay">Loading deadlines...</div>
              ) : (
                cells.map((d, i) => {
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
                            style={{ background: COURSE_COLORS[e.courseColor % COURSE_COLORS.length]?.accent || '#667eea' }}
                            title={e.title}
                          />
                        ))}
                        {evs.length > 2 && (
                          <div className="cal-event-more">+{evs.length - 2}</div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: upcoming events */}
          <div className="cal-sidebar">
            <h3 className="cal-sidebar-title">Upcoming (30 days)</h3>
            {loading ? (
              <p>Fetching deadlines...</p>
            ) : upcoming.length === 0 ? (
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
                        style={{ background: COURSE_COLORS[e.courseColor % COURSE_COLORS.length]?.accent || '#667eea' }}
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