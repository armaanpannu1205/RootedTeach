import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import './CourseDashboard.css';

// MUI Icons
import MenuBookIcon           from '@mui/icons-material/MenuBook';
import GradeIcon              from '@mui/icons-material/Grade';
import AssignmentIcon         from '@mui/icons-material/Assignment';
import SearchIcon             from '@mui/icons-material/Search';
import CheckCircleIcon        from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon     from '@mui/icons-material/HourglassEmpty';
import CalendarTodayIcon      from '@mui/icons-material/CalendarToday';
import EmojiEventsIcon        from '@mui/icons-material/EmojiEvents';
import AccessTimeIcon         from '@mui/icons-material/AccessTime';
import SmartToyIcon           from '@mui/icons-material/SmartToy';
import PersonIcon             from '@mui/icons-material/Person';
import SchoolIcon             from '@mui/icons-material/School';
import CloseIcon              from '@mui/icons-material/Close';
import TrendingUpIcon         from '@mui/icons-material/TrendingUp';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import EmailIcon              from '@mui/icons-material/Email';
import RoomIcon               from '@mui/icons-material/Room';
import AccessAlarmIcon        from '@mui/icons-material/AccessAlarm';
import StarIcon               from '@mui/icons-material/Star';
import PeopleIcon             from '@mui/icons-material/People';
import ViewWeekIcon           from '@mui/icons-material/ViewWeek';
import CampaignIcon           from '@mui/icons-material/Campaign';

const BASE = 'http://localhost:5001';

function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiFetch(path, opts = {}) {
  return fetch(`${BASE}${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...authHeaders(), ...(opts.headers || {}) },
  });
}

function getDaysLeft(due) {
  const days = Math.ceil((new Date(due) - new Date()) / 86400000);
  if (days < 0)  return { label: 'Past due',   color: '#e53e3e' };
  if (days === 0) return { label: 'Due today',  color: '#e8a040' };
  if (days <= 3)  return { label: `${days}d left`, color: '#e8a040' };
  return { label: `${days}d left`, color: 'var(--muted)' };
}

function letterGrade(pct) {
  if (pct >= 93) return { letter: 'A',  color: '#38a169' };
  if (pct >= 90) return { letter: 'A-', color: '#38a169' };
  if (pct >= 87) return { letter: 'B+', color: '#4299e1' };
  if (pct >= 83) return { letter: 'B',  color: '#4299e1' };
  if (pct >= 80) return { letter: 'B-', color: '#4299e1' };
  if (pct >= 77) return { letter: 'C+', color: '#e8a040' };
  if (pct >= 73) return { letter: 'C',  color: '#e8a040' };
  if (pct >= 70) return { letter: 'C-', color: '#e8a040' };
  if (pct >= 67) return { letter: 'D+', color: '#e53e3e' };
  if (pct >= 63) return { letter: 'D',  color: '#e53e3e' };
  if (pct >= 60) return { letter: 'D-', color: '#e53e3e' };
  return           { letter: 'F',  color: '#c53030' };
}

function aiMeta(score) {
  if (score == null) return null;
  if (score >= 70) return { color: '#e53e3e', bg: 'rgba(229,62,62,.1)' };
  if (score >= 40) return { color: '#e8a040', bg: 'rgba(232,160,64,.1)' };
  return                   { color: '#38a169', bg: 'rgba(56,161,105,.1)' };
}

// ── Shared assignment tile ──────────────────────────────────────────────────
function AssignmentTile({ a, onClick }) {
  const ai = aiMeta(a.aiScore);
  const dl = a.dueDate ? getDaysLeft(a.dueDate) : null;
  return (
    <div className="assignment-tile" onClick={() => onClick && onClick(a)}>
      <div className="tile-left">
        <div className="tile-icon-wrap"
          style={{ background: a.status === 'submitted' ? 'rgba(56,161,105,.1)' : 'rgba(114,105,224,.1)' }}>
          {a.status === 'submitted'
            ? <AssignmentTurnedInIcon style={{ color: '#38a169', fontSize: 22 }}/>
            : <AssignmentIcon style={{ color: '#7269e0', fontSize: 22 }}/>}
        </div>
        <div>
          <div className="tile-title">{a.title}</div>
          <div className="tile-meta">
            {a.dueDate && <span className="tile-meta-chip"><CalendarTodayIcon style={{ fontSize: 12 }}/> {new Date(a.dueDate).toLocaleDateString()}</span>}
            <span className="tile-meta-chip"><EmojiEventsIcon style={{ fontSize: 12 }}/> {a.points} pts</span>
            {dl && a.status === 'pending' && <span className="tile-meta-chip" style={{ color: dl.color }}><AccessTimeIcon style={{ fontSize: 12 }}/> {dl.label}</span>}
            {a.matchedOn && <span className="tile-meta-chip" style={{ color: '#7269e0', background: 'rgba(114,105,224,.08)' }}><SearchIcon style={{ fontSize: 12 }}/> matched: {a.matchedOn}</span>}
          </div>
        </div>
      </div>
      <div className="tile-right">
        {a.status === 'submitted'
          ? <span className="status-pill submitted"><CheckCircleIcon style={{ fontSize: 13 }}/> Submitted</span>
          : <span className="status-pill pending"><HourglassEmptyIcon style={{ fontSize: 13 }}/> Pending</span>}
        {a.grade != null && <span className="tile-grade">{a.grade}/{a.points}</span>}
        {ai && (
          <span style={{ background: ai.bg, color: ai.color, padding: '2px 7px', borderRadius: 6, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>
            <SmartToyIcon style={{ fontSize: 12 }}/> {a.aiScore}%
          </span>
        )}
      </div>
    </div>
  );
}

// ── Search Tab ──────────────────────────────────────────────────────────────
function SearchTab({ classId, onOpen }) {
  const [query, setQuery]       = useState('');
  const [results, setResults]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError]       = useState('');

  const doSearch = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true); setError(''); setSearched(true);
    try {
      const res = await apiFetch(`/api/assignments/search?q=${encodeURIComponent(query)}&classId=${classId}`);
      const data = await res.json();
      if (!res.ok) { setError(data.message || 'Search failed'); setResults([]); }
      else setResults(data.results || []);
    } catch { setError('Could not connect to server.'); }
    finally { setLoading(false); }
  }, [query, classId]);

  return (
    <div>
      <div className="page-header">
        <h1><SearchIcon style={{ fontSize: 26 }}/> Search Assignments</h1>
        <p>Search by title, description, due date, or file name</p>
      </div>

      <div className="section-card">
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <SearchIcon style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#aaa', fontSize: 20 }}/>
            <input className="search-input" placeholder="e.g. homework, 2026-03, java, midterm…"
              value={query} onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && doSearch()} autoFocus/>
            {query && (
              <button onClick={() => { setQuery(''); setResults([]); setSearched(false); }}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', display: 'flex' }}>
                <CloseIcon style={{ fontSize: 18 }}/>
              </button>
            )}
          </div>
          <button className="search-btn" onClick={doSearch} disabled={loading || !query.trim()}>
            {loading ? 'Searching…' : 'Search'}
          </button>
        </div>
        <p style={{ marginTop: 8, fontSize: 12, color: 'var(--muted)' }}>
          Search across titles, descriptions, due dates, and file names
        </p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {searched && !loading && (
        <div className="section-card" style={{ marginTop: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 14, fontSize: 14 }}>
            {results.length === 0
              ? `No results for "${query}"`
              : `${results.length} result${results.length !== 1 ? 's' : ''} for "${query}"`}
          </div>
          {results.length === 0
            ? <div className="empty-state"><SearchIcon style={{ fontSize: 40 }}/>Try a different keyword</div>
            : results.map(a => <AssignmentTile key={a.id} a={a} onClick={onOpen}/>)}
        </div>
      )}

      {!searched && (
        <div className="empty-state" style={{ marginTop: 40 }}>
          <SearchIcon style={{ fontSize: 48, opacity: .2 }}/>
          <strong>Start typing to search</strong>
          <span>Find assignments by name, date, or file</span>
        </div>
      )}
    </div>
  );
}

// ── Main ────────────────────────────────────────────────────────────────────
// ── Announcements Tab ──────────────────────────────────────────────────────
function AnnouncementsTab({ classId, classInfo }) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading]             = useState(true);

  useEffect(() => {
    if (!classId) { setLoading(false); return; }
    apiFetch(`/api/classes/${classId}`)
      .then(r => r.json())
      .then(data => setAnnouncements((data.announcements || []).slice().reverse()))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [classId]);

  return (
    <>
      <div className="page-header">
        <h1><CampaignIcon style={{ fontSize: 22 }}/> Announcements</h1>
        <p>{(classInfo || {}).className || 'Class'} updates from your instructor</p>
      </div>
      <div className="section-card">
        {loading && <div className="loading-state">Loading...</div>}
        {!loading && announcements.length === 0 && (
          <div className="empty-state">
            <CampaignIcon style={{ fontSize: 44, opacity: .2 }}/>
            No announcements yet.
          </div>
        )}
        {announcements.map(ann => (
          <div key={ann.id} style={{
            padding: '16px 20px', marginBottom: 10,
            borderLeft: '4px solid var(--accent)',
            borderRadius: '0 10px 10px 0',
            background: 'var(--bg-card)',
            border: '1px solid rgba(26,26,46,0.07)',
          }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 6 }}>{ann.title}</div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>{ann.body}</p>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 10 }}>
              {ann.teacherName} &middot; {new Date(ann.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default function CourseDashboard() {
  const navigate  = useNavigate();
  const course    = (() => { try { return JSON.parse(localStorage.getItem('currentCourse')) || {}; } catch { return {}; } })();
  const classId   = course.id || course._id;
  const studentId = localStorage.getItem('userId');

  const [page, setPage]               = useState('assignments');
  const [assignments, setAssignments] = useState([]);
  const [loadingA, setLoadingA]       = useState(true);
  const [classInfo, setClassInfo]     = useState(null);

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [page]);

  // Fetch assignments
  useEffect(() => {
    if (!classId) { setLoadingA(false); return; }
    apiFetch(`/api/assignments/class/${classId}`)
      .then(r => r.json())
      .then(data => {
        setAssignments((Array.isArray(data) ? data : []).map(a => {
          const sub = (a.submissions || []).find(s => s.student?._id === studentId || s.student === studentId);
          return {
            id: a.id || a._id,
            title: a.title,
            dueDate: a.dueDate,
            points: a.points || 100,
            status: sub ? 'submitted' : 'pending',
            grade: sub?.score ?? null,
            aiScore: sub?.aiScore ?? null,
          };
        }));
      })
      .catch(console.error)
      .finally(() => setLoadingA(false));
  }, [classId, studentId]);

  // Fetch class info (includes syllabus)
  useEffect(() => {
    if (!classId) return;
    apiFetch(`/api/classes/${classId}`).then(r => r.json()).then(setClassInfo).catch(console.error);
  }, [classId]);

  function openAssignment(a) {
    localStorage.setItem('selectedAssignmentId', String(a.id));
    navigate('/assignment');
  }

  const gradedItems = assignments.filter(a => a.grade != null);
  const earnedPts   = gradedItems.reduce((s, a) => s + a.grade, 0);
  const maxPts      = gradedItems.reduce((s, a) => s + a.points, 0);
  const currentPct  = maxPts > 0 ? Math.round((earnedPts / maxPts) * 100) : 0;
  const lg          = gradedItems.length > 0 ? letterGrade(currentPct) : null;
  const submitted   = assignments.filter(a => a.status === 'submitted').length;
  const pending     = assignments.filter(a => a.status === 'pending').length;

  const info     = classInfo || course;
  const syllabus = info.syllabus || {};

  const infoRows = [
    { icon: <SchoolIcon style={{ fontSize: 16 }}/>,       label: 'Class Code',   val: info.classCode,              mono: true },
    { icon: <PersonIcon style={{ fontSize: 16 }}/>,       label: 'Professor',    val: info.teacher?.username },
    { icon: <CalendarTodayIcon style={{ fontSize: 16 }}/>,label: 'Quarter',      val: info.quarter },
    { icon: <StarIcon style={{ fontSize: 16 }}/>,         label: 'Units',        val: syllabus.units },
    { icon: <AccessAlarmIcon style={{ fontSize: 16 }}/>,  label: 'Lecture Time', val: syllabus.lectureTime },
    { icon: <RoomIcon style={{ fontSize: 16 }}/>,         label: 'Location',     val: syllabus.location },
    { icon: <AccessTimeIcon style={{ fontSize: 16 }}/>,   label: 'Office Hours', val: syllabus.officeHours },
    { icon: <EmailIcon style={{ fontSize: 16 }}/>,        label: 'Email',        val: syllabus.email },
    { icon: <PeopleIcon style={{ fontSize: 16 }}/>,       label: 'Enrolled',     val: (info.students || []).length ? `${info.students.length} students` : null },
  ].filter(r => r.val);

  return (
    <div className="app-layout">
      <Sidebar course={course} activePage={page} onPageChange={setPage}/>
      <div className="main">

        {/* ── ASSIGNMENTS ── */}
        {page === 'assignments' && (<>
          <div className="page-header">
            <h1><AssignmentIcon style={{ fontSize: 22 }}/> Assignments</h1>
            <p>{loadingA ? 'Loading…' : `${assignments.length} total · ${submitted} submitted · ${pending} pending`}</p>
          </div>
          <div className="section-card">
            {loadingA && <div className="loading-state">Loading assignments…</div>}
            {!loadingA && assignments.length === 0 && <div className="empty-state"><AssignmentIcon style={{ fontSize: 40, color: "#d1d5db" }}/>No assignments yet.</div>}
            {!loadingA && assignments.map(a => <AssignmentTile key={a.id} a={a} onClick={openAssignment}/>)}
          </div>
        </>)}

        {/* ── GRADES ── */}
        {page === 'grade' && (<>
          <div className="page-header">
            <h1><GradeIcon style={{ fontSize: 22 }}/> Grades</h1>
            <p>Your performance in {info.className || info.name}</p>
          </div>

          <div className="section-card grade-summary">
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div className="grade-circle" style={{ background: lg ? `${lg.color}18` : '#f4f4f8' }}>
                {lg ? <span style={{ fontSize: 26, fontWeight: 900, color: lg.color }}>{lg.letter}</span>
                     : <GradeIcon style={{ fontSize: 30, color: '#ccc' }}/>}
              </div>
              <div>
                <div className="grade-label">Current Grade</div>
                <div className="total-grade" style={{ color: lg?.color || '#aaa' }}>
                  {lg ? `${currentPct}%` : 'No grades yet'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
                  {earnedPts} / {maxPts} pts · {gradedItems.length} of {assignments.length} graded
                </div>
              </div>
            </div>
            {assignments.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>
                  <span>Grading progress</span><span>{gradedItems.length}/{assignments.length}</span>
                </div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: `${assignments.length > 0 ? Math.round((gradedItems.length / assignments.length) * 100) : 0}%` }}/>
                </div>
              </div>
            )}
          </div>

          <div className="section-card">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}><TrendingUpIcon style={{ fontSize: 20 }}/> Breakdown</h3>
            {assignments.length === 0
              ? <div className="empty-state"><GradeIcon style={{ fontSize: 36, opacity: .2 }}/>No assignments yet.</div>
              : <table className="grade-table">
                  <thead><tr><th>Assignment</th><th>Points</th><th>Grade</th><th>AI Score</th><th>Status</th></tr></thead>
                  <tbody>
                    {assignments.map(a => {
                      const pct = a.grade != null ? Math.round((a.grade / a.points) * 100) : null;
                      const glg = pct != null ? letterGrade(pct) : null;
                      const ai  = aiMeta(a.aiScore);
                      return (
                        <tr key={a.id}>
                          <td style={{ fontWeight: 500 }}>{a.title}</td>
                          <td style={{ color: 'var(--muted)' }}>{a.points}</td>
                          <td>{a.grade != null
                            ? <span style={{ fontWeight: 700, color: glg?.color }}>{a.grade}/{a.points} <small>({glg?.letter})</small></span>
                            : <span style={{ color: 'var(--muted)' }}>—</span>}
                          </td>
                          <td>{ai
                            ? <span style={{ background: ai.bg, color: ai.color, padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 3 }}><SmartToyIcon style={{ fontSize: 12 }}/> {a.aiScore}%</span>
                            : <span style={{ color: 'var(--muted)' }}>—</span>}
                          </td>
                          <td>{a.grade != null
                            ? <span className="grade-pill done"><CheckCircleIcon style={{ fontSize: 12 }}/> Graded</span>
                            : <span className="grade-pill pending"><HourglassEmptyIcon style={{ fontSize: 12 }}/> Pending</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
            }
          </div>
        </>)}

        {/* ── SYLLABUS — real data from Firebase ── */}
        {page === 'syllabus' && (<>
          <div className="page-header">
            <h1><MenuBookIcon style={{ fontSize: 22 }}/> Syllabus</h1>
            <p>{info.className || info.name}</p>
          </div>

          {/* Class info */}
          <div className="section-card">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}><SchoolIcon style={{ fontSize: 20 }}/> Class Information</h3>
            {syllabus.description && (
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: 20, fontSize: 14, borderLeft: '3px solid #7269e0', paddingLeft: 14 }}>
                {syllabus.description}
              </p>
            )}
            {infoRows.length > 0
              ? <div className="info-grid">
                  {infoRows.map(item => (
                    <div className="info-item" key={item.label}>
                      <label>{item.label}</label>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: item.mono ? 'monospace' : 'inherit', fontWeight: item.mono ? 700 : 400, letterSpacing: item.mono ? 2 : 0 }}>
                        {item.icon}{item.val}
                      </span>
                    </div>
                  ))}
                </div>
              : <div className="empty-state"><SchoolIcon style={{ fontSize: 36, opacity: .2 }}/>No course info added yet.</div>
            }
          </div>

          {/* Grading breakdown */}
          {syllabus.grading?.some(g => g.category && g.weight) && (
            <div className="section-card">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}><TrendingUpIcon style={{ fontSize: 20 }}/> Grading Breakdown</h3>
              <div style={{ border: '1px solid #e8eaf0', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', padding: '8px 16px', background: '#f8f9ff', fontSize: 11, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '.5px' }}>
                  <span>Category</span><span>Weight</span>
                </div>
                {syllabus.grading.filter(g => g.category && g.weight).map((g, i, arr) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto', padding: '12px 16px', borderTop: '1px solid #f0f0f6', background: i % 2 === 0 ? '#fff' : '#fafbff', alignItems: 'center' }}>
                    <span style={{ fontWeight: 500 }}>{g.category}</span>
                    <span style={{ fontWeight: 700, color: '#7269e0', fontSize: 15 }}>{g.weight}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Weekly schedule */}
          {syllabus.weeks?.some(w => w.topic) && (
            <div className="section-card">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}><ViewWeekIcon style={{ fontSize: 20 }}/> Weekly Schedule</h3>
              <ul className="week-list">
                {syllabus.weeks.map((w, i) => (
                  <li key={i} className="week-item">
                    <span className="week-num">{w.week}</span>
                    <span className="week-topic">{w.topic || <em style={{ color: 'var(--muted)' }}>TBD</em>}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* No syllabus at all */}
          {!syllabus.description && infoRows.length === 0 && !syllabus.grading?.some(g => g.category) && !syllabus.weeks?.some(w => w.topic) && (
            <div className="section-card">
              <div className="empty-state"><MenuBookIcon style={{ fontSize: 44, opacity: .2 }}/>No syllabus posted yet.<span style={{ fontSize: 13 }}>Your professor hasn't added syllabus details yet.</span></div>
            </div>
          )}
        </>)}

        {/* ── SEARCH ── */}
        {page === 'search' && <SearchTab classId={classId} onOpen={openAssignment}/>}

        {/* ── ANNOUNCEMENTS ── */}
        {page === 'announcements' && (
          <AnnouncementsTab classId={classId} classInfo={classInfo}/>
        )}

      </div>
    </div>
  );
}