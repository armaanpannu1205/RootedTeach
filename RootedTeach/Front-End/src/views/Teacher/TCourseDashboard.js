import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Teacher.css';
import './TCourseDashboard.css';

// ── Helpers ────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 8).toUpperCase();
const today = new Date();
const ymd = (d) => d.toISOString().slice(0, 10);

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const WDAYS  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function letterGrade(pct) {
  if (pct >= 93) return { letter: 'A',  color: '#38a169', bg: '#f0fff4' };
  if (pct >= 90) return { letter: 'A−', color: '#38a169', bg: '#f0fff4' };
  if (pct >= 87) return { letter: 'B+', color: '#4299e1', bg: '#ebf8ff' };
  if (pct >= 83) return { letter: 'B',  color: '#4299e1', bg: '#ebf8ff' };
  if (pct >= 80) return { letter: 'B−', color: '#4299e1', bg: '#ebf8ff' };
  if (pct >= 77) return { letter: 'C+', color: '#e8a040', bg: '#fff8ee' };
  if (pct >= 73) return { letter: 'C',  color: '#e8a040', bg: '#fff8ee' };
  if (pct >= 70) return { letter: 'C−', color: '#e8a040', bg: '#fff8ee' };
  return { letter: 'D/F', color: '#e53e3e', bg: '#fff5f5' };
}

// ── Mock seed data ─────────────────────────────────────────
const MOCK_STUDENTS = [
  { id: 's1', name: 'Alex Martinez',  avatar: 'A' },
  { id: 's2', name: 'Jordan Lee',     avatar: 'J' },
  { id: 's3', name: 'Sam Kim',        avatar: 'S' },
  { id: 's4', name: 'Taylor Chen',    avatar: 'T' },
  { id: 's5', name: 'Riley Johnson',  avatar: 'R' },
];

const SEED_ASSIGNMENTS = [
  {
    id: 'a1', title: 'Lab 1: Introduction',
    description: 'Complete the introductory lab exercises and submit your report.',
    dueDate: ymd(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5)),
    points: 100,
    submissions: [
      { studentId: 's1', studentName: 'Alex Martinez',  submittedAt: ymd(today), note: 'Completed all parts.', grade: 92,   feedback: 'Great work!' },
      { studentId: 's2', studentName: 'Jordan Lee',     submittedAt: ymd(today), note: 'See attached.',        grade: null, feedback: '' },
    ],
  },
  {
    id: 'a2', title: 'Project 1',
    description: 'Build a small project using the techniques covered in class.',
    dueDate: ymd(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14)),
    points: 200,
    submissions: [],
  },
  {
    id: 'a3', title: 'Midterm Exam',
    description: 'In-class midterm covering weeks 1–5.',
    dueDate: ymd(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 10)),
    points: 150,
    submissions: [
      { studentId: 's3', studentName: 'Sam Kim',       submittedAt: ymd(today), note: 'Done.',  grade: 138, feedback: 'Excellent.' },
      { studentId: 's4', studentName: 'Taylor Chen',   submittedAt: ymd(today), note: 'Done.',  grade: 112, feedback: 'Review ch.3.' },
      { studentId: 's5', studentName: 'Riley Johnson', submittedAt: ymd(today), note: 'Done.',  grade: null, feedback: '' },
    ],
  },
];

const SEED_GRADES = (() => {
  const g = {};
  const seed = {
    s1_a1: 92, s1_a2: null, s1_a3: null,
    s2_a1: null, s2_a2: null, s2_a3: null,
    s3_a1: null, s3_a2: null, s3_a3: 138,
    s4_a1: null, s4_a2: null, s4_a3: 112,
    s5_a1: null, s5_a2: null, s5_a3: null,
  };
  return seed;
})();

const SEED_EVENTS = [
  { id: 'e1', title: 'Lab 1 Due',    date: ymd(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5)),  type: 'assignment' },
  { id: 'e2', title: 'Midterm Exam', date: ymd(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 10)), type: 'exam' },
  { id: 'e3', title: 'Project 1 Due',date: ymd(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14)), type: 'assignment' },
  { id: 'e4', title: 'Office Hours', date: ymd(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2)),  type: 'other' },
];

const TYPE_META = {
  assignment: { label: 'Assignment', color: '#7C6FE0', bg: '#f3f1ff' },
  exam:       { label: 'Exam',       color: '#E06F6F', bg: '#fef2f2' },
  quiz:       { label: 'Quiz',       color: '#E8A040', bg: '#fff8ee' },
  other:      { label: 'Other',      color: '#4FBDBA', bg: '#edfafa' },
};

// ── Sidebar icon paths ─────────────────────────────────────
const NAV_ICONS = {
  back:    "M19 12H5M12 5l-7 7 7 7",
  assign:  "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2",
  grades:  "M3 3h18v18H3zM3 9h18M3 15h18M9 3v18",
  cal:     "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z",
  students:"M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
};

// ══════════════════════════════════════════════════════════
// TABS
// ══════════════════════════════════════════════════════════

// ── Assignments Tab ────────────────────────────────────────
function TabAssignments({ color, assignments, setAssignments }) {
  const [active, setActive]       = useState(null);
  const [subView, setSubView]     = useState('details'); // 'details' | 'submissions'
  const [showCreate, setShowCreate] = useState(false);
  const [grading, setGrading]     = useState(null);
  const [form, setForm] = useState({ title: '', description: '', dueDate: '', points: 100 });

  const create = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    const a = { id: 'a' + uid(), ...form, points: +form.points, submissions: [] };
    setAssignments(prev => [a, ...prev]);
    setForm({ title: '', description: '', dueDate: '', points: 100 });
    setShowCreate(false);
  };

  const del = (id) => {
    setAssignments(prev => prev.filter(a => a.id !== id));
    if (active?.id === id) setActive(null);
  };

  const saveGrade = (assignmentId, subIndex) => {
    setAssignments(prev => prev.map(a => {
      if (a.id !== assignmentId) return a;
      const subs = a.submissions.map((s, i) =>
        i === subIndex ? { ...s, grade: +grading.grade, feedback: grading.feedback } : s
      );
      return { ...a, submissions: subs };
    }));
    setActive(prev => {
      const subs = prev.submissions.map((s, i) =>
        i === subIndex ? { ...s, grade: +grading.grade, feedback: grading.feedback } : s
      );
      return { ...prev, submissions: subs };
    });
    setGrading(null);
  };

  return (
    <div className="tab-layout">
      {/* ── Left list ── */}
      <div className="tab-list-col">
        <button className="add-class-button" style={{ width: '100%', marginBottom: 14 }} onClick={() => setShowCreate(true)}>
          + New Assignment
        </button>

        {assignments.length === 0 && (
          <div className="tcd-empty"><div style={{fontSize:36,opacity:.4}}>📋</div><p>No assignments yet</p></div>
        )}

        {assignments.map(a => {
          const graded = a.submissions.filter(s => s.grade !== null).length;
          const isActive = active?.id === a.id;
          return (
            <div
              key={a.id}
              className={`asgn-card ${isActive ? 'asgn-card--active' : ''}`}
              style={isActive ? { borderColor: color } : {}}
              onClick={() => { setActive(a); setSubView('details'); setGrading(null); }}
            >
              <div className="asgn-card-stripe" style={{ background: color }} />
              <div className="asgn-card-body">
                <div className="asgn-card-title">{a.title}</div>
                <div className="asgn-card-meta">Due {a.dueDate || '—'} · {a.points} pts</div>
                <div className="asgn-card-stats">
                  <span className="asgn-stat-pill asgn-stat-submitted">{a.submissions.length} submitted</span>
                  <span className="asgn-stat-pill asgn-stat-graded">{graded} graded</span>
                </div>
              </div>
              <button className="asgn-delete-btn" onClick={e => { e.stopPropagation(); del(a.id); }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>
              </button>
            </div>
          );
        })}
      </div>

      {/* ── Right detail ── */}
      <div className="tab-detail-col">
        {!active ? (
          <div className="tcd-empty" style={{flex:1}}>
            <div style={{fontSize:40,opacity:.35}}>📄</div>
            <p style={{fontWeight:700}}>Select an assignment</p>
            <span>Click one on the left to view details or submissions.</span>
          </div>
        ) : (
          <>
            <div className="asgn-tabs">
              <button className={`asgn-tab ${subView==='details'?'active':''}`} onClick={() => setSubView('details')}>Details</button>
              <button className={`asgn-tab ${subView==='submissions'?'active':''}`} onClick={() => setSubView('submissions')}>
                Submissions <span className="asgn-tab-count">{active.submissions.length}</span>
              </button>
            </div>

            {subView === 'details' && (
              <div className="asgn-detail-panel">
                <div className="asgn-detail-header" style={{ borderLeft: `4px solid ${color}` }}>
                  <div className="asgn-detail-title">{active.title}</div>
                </div>
                <div className="asgn-detail-grid">
                  <div className="asgn-detail-item"><div className="asgn-detail-label">Due Date</div><div className="asgn-detail-val">{active.dueDate || '—'}</div></div>
                  <div className="asgn-detail-item"><div className="asgn-detail-label">Points</div><div className="asgn-detail-val">{active.points}</div></div>
                  <div className="asgn-detail-item"><div className="asgn-detail-label">Submitted</div><div className="asgn-detail-val">{active.submissions.length}</div></div>
                  <div className="asgn-detail-item"><div className="asgn-detail-label">Graded</div><div className="asgn-detail-val">{active.submissions.filter(s=>s.grade!==null).length} / {active.submissions.length}</div></div>
                </div>
                <div className="asgn-detail-label" style={{marginTop:16,marginBottom:8}}>Instructions</div>
                <div className="asgn-description">{active.description || 'No description provided.'}</div>
              </div>
            )}

            {subView === 'submissions' && (
              <div className="asgn-detail-panel">
                {active.submissions.length === 0 && (
                  <div className="tcd-empty"><div style={{fontSize:32,opacity:.4}}>📭</div><p>No submissions yet</p></div>
                )}
                {active.submissions.map((sub, idx) => {
                  const isGrading = grading?.subIndex === idx;
                  return (
                    <div key={sub.studentId} className="sub-card">
                      <div className="sub-card-top">
                        <div className="sub-avatar" style={{ background: color + '22', color }}>
                          {sub.studentName.charAt(0)}
                        </div>
                        <div className="sub-info">
                          <div className="sub-name">{sub.studentName}</div>
                          <div className="sub-meta">Submitted {sub.submittedAt} · {sub.note}</div>
                        </div>
                        <div className="sub-grade-badge" style={{
                          background: sub.grade !== null ? '#f0fff4' : '#fff8ee',
                          color: sub.grade !== null ? '#38a169' : '#e8a040',
                        }}>
                          {sub.grade !== null ? `${sub.grade}/${active.points}` : 'Ungraded'}
                        </div>
                      </div>
                      {sub.feedback && !isGrading && (
                        <div className="sub-feedback">💬 {sub.feedback}</div>
                      )}
                      {isGrading ? (
                        <div className="sub-grade-form">
                          <div style={{ display:'flex', gap:8, marginBottom:8 }}>
                            <input type="number" className="modal-input" placeholder={`/ ${active.points}`}
                              value={grading.grade} onChange={e => setGrading(p=>({...p,grade:e.target.value}))} style={{width:120}} />
                            <input className="modal-input" placeholder="Feedback (optional)"
                              value={grading.feedback} onChange={e => setGrading(p=>({...p,feedback:e.target.value}))} />
                          </div>
                          <div style={{display:'flex',gap:8}}>
                            <button className="modal-button-cancel" onClick={() => setGrading(null)}>Cancel</button>
                            <button className="modal-button-save" onClick={() => saveGrade(active.id, idx)}>Save Grade</button>
                          </div>
                        </div>
                      ) : (
                        <button className="sub-grade-btn" onClick={() => setGrading({ subIndex: idx, grade: sub.grade ?? '', feedback: sub.feedback ?? '' })}>
                          {sub.grade !== null ? 'Edit Grade' : 'Grade'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>New Assignment</h2>
            <form className="modal-form" onSubmit={create}>
              <label><div className="modal-form-label-text">Title</div>
                <input className="modal-input" placeholder="e.g. Problem Set 4" value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} required />
              </label>
              <label><div className="modal-form-label-text">Instructions</div>
                <textarea className="modal-input" rows={3} value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} style={{resize:'vertical'}} />
              </label>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <label><div className="modal-form-label-text">Due Date</div>
                  <input type="date" className="modal-input" value={form.dueDate} onChange={e=>setForm(p=>({...p,dueDate:e.target.value}))} />
                </label>
                <label><div className="modal-form-label-text">Points</div>
                  <input type="number" className="modal-input" value={form.points} onChange={e=>setForm(p=>({...p,points:e.target.value}))} />
                </label>
              </div>
              <div className="modal-actions">
                <button type="button" className="modal-button-cancel" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="modal-button-save">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Grades Tab ─────────────────────────────────────────────
function TabGrades({ color, assignments }) {
  const [grades, setGrades]           = useState(SEED_GRADES);
  const [editingCell, setEditingCell] = useState(null);
  const [editVal, setEditVal]         = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  const getGrade = (sid, aid) => grades[`${sid}_${aid}`] ?? null;

  const studentAvg = (sid) => {
    const scored = assignments.filter(a => getGrade(sid, a.id) !== null);
    if (!scored.length) return null;
    const earned   = scored.reduce((s, a) => s + getGrade(sid, a.id), 0);
    const possible = scored.reduce((s, a) => s + a.points, 0);
    return Math.round((earned / possible) * 100);
  };

  const assignmentAvg = (aid) => {
    const a = assignments.find(x => x.id === aid);
    if (!a) return null;
    const scored = MOCK_STUDENTS.filter(s => getGrade(s.id, aid) !== null);
    if (!scored.length) return null;
    const avg = scored.reduce((s, stu) => s + getGrade(stu.id, aid), 0) / scored.length;
    return Math.round((avg / a.points) * 100);
  };

  const startEdit = (sid, aid) => {
    setEditingCell({ sid, aid });
    setEditVal(getGrade(sid, aid) !== null ? String(getGrade(sid, aid)) : '');
  };

  const commitEdit = (aid) => {
    if (!editingCell) return;
    const a = assignments.find(x => x.id === aid);
    const val = editVal === '' ? null : Math.min(+editVal, a.points);
    setGrades(prev => ({ ...prev, [`${editingCell.sid}_${editingCell.aid}`]: val }));
    setEditingCell(null);
  };

  const classAvg = () => {
    const avgs = MOCK_STUDENTS.map(s => studentAvg(s.id)).filter(v => v !== null);
    if (!avgs.length) return null;
    return Math.round(avgs.reduce((a, b) => a + b, 0) / avgs.length);
  };

  if (assignments.length === 0) return (
    <div className="tcd-empty" style={{flex:1,marginTop:40}}>
      <div style={{fontSize:40,opacity:.35}}>📊</div>
      <p style={{fontWeight:700}}>No assignments yet</p>
      <span>Create assignments first to track grades.</span>
    </div>
  );

  return (
    <div className="grades-layout">
      <div className="grades-table-wrap">
        {/* Summary strip */}
        <div className="grades-summary-strip">
          <div className="grades-summary-item"><span className="grades-summary-num">{MOCK_STUDENTS.length}</span><span>Students</span></div>
          <div className="grades-summary-item"><span className="grades-summary-num">{assignments.length}</span><span>Assignments</span></div>
          <div className="grades-summary-item"><span className="grades-summary-num" style={{color}}>{classAvg() !== null ? `${classAvg()}%` : '—'}</span><span>Class Avg</span></div>
        </div>

        <table className="grades-table">
          <thead>
            <tr>
              <th className="grades-th grades-th-student">Student</th>
              {assignments.map(a => (
                <th key={a.id} className="grades-th">
                  <div className="grades-th-title" title={a.title}>{a.title}</div>
                  <div className="grades-th-pts">{a.points} pts</div>
                  {assignmentAvg(a.id) !== null && <div className="grades-th-avg">avg {assignmentAvg(a.id)}%</div>}
                </th>
              ))}
              <th className="grades-th">Average</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_STUDENTS.map(student => {
              const avg = studentAvg(student.id);
              const lg  = avg !== null ? letterGrade(avg) : null;
              const isSel = selectedStudent?.id === student.id;
              return (
                <tr key={student.id} className={`grades-tr ${isSel ? 'grades-tr--selected' : ''}`}
                  style={isSel ? { background: color + '10' } : {}}
                  onClick={() => setSelectedStudent(isSel ? null : student)}
                >
                  <td className="grades-td grades-td-student">
                    <div className="grades-student-row">
                      <div className="sub-avatar" style={{ background: color + '22', color, width:32, height:32, fontSize:13 }}>{student.avatar}</div>
                      <span>{student.name}</span>
                    </div>
                  </td>
                  {assignments.map(a => {
                    const g = getGrade(student.id, a.id);
                    const isEditing = editingCell?.sid === student.id && editingCell?.aid === a.id;
                    return (
                      <td key={a.id} className="grades-td grades-td-grade"
                        onClick={e => { e.stopPropagation(); startEdit(student.id, a.id); }}
                      >
                        {isEditing ? (
                          <input className="grades-cell-input" type="number" value={editVal} autoFocus
                            onChange={e => setEditVal(e.target.value)}
                            onBlur={() => commitEdit(a.id)}
                            onKeyDown={e => { if (e.key==='Enter') commitEdit(a.id); if (e.key==='Escape') setEditingCell(null); }}
                            onClick={e => e.stopPropagation()} />
                        ) : (
                          <span className={`grades-cell-val ${g===null?'grades-cell-empty':''}`}>
                            {g !== null ? g : '—'}
                          </span>
                        )}
                      </td>
                    );
                  })}
                  <td className="grades-td grades-td-avg">
                    {lg ? (
                      <div className="grades-avg-row">
                        <span className="grades-avg-pct">{avg}%</span>
                        <span className="grades-letter" style={{ background: lg.bg, color: lg.color }}>{lg.letter}</span>
                      </div>
                    ) : <span className="grades-cell-empty">—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="grades-hint">Click any grade cell to edit · Click a student row to view breakdown</div>
      </div>

      {/* Student detail panel */}
      {selectedStudent && (
        <div className="grades-student-panel">
          <div className="grades-panel-header">
            <div className="sub-avatar" style={{ width:44, height:44, fontSize:18, background: color + '22', color }}>{selectedStudent.avatar}</div>
            <div>
              <div style={{ fontWeight:800, fontSize:16, color:'#1a1f36' }}>{selectedStudent.name}</div>
              <div style={{ fontSize:12, color:'#8a8fa8' }}>Student</div>
            </div>
          </div>
          {(() => {
            const avg = studentAvg(selectedStudent.id);
            const lg  = avg !== null ? letterGrade(avg) : null;
            return lg ? (
              <div className="grades-panel-avg" style={{ background: lg.bg }}>
                <div style={{ fontSize:36, fontWeight:800, color:lg.color }}>{avg}%</div>
                <div style={{ fontSize:22, fontWeight:800, color:lg.color }}>{lg.letter}</div>
                <div style={{ fontSize:12, color:'#8a8fa8', marginTop:4 }}>Current Average</div>
              </div>
            ) : (
              <div className="grades-panel-avg">
                <div style={{ fontSize:22, fontWeight:700, color:'#8a8fa8' }}>No grades yet</div>
              </div>
            );
          })()}
          <div className="grades-panel-list">
            {assignments.map(a => {
              const g   = getGrade(selectedStudent.id, a.id);
              const pct = g !== null ? Math.round((g / a.points) * 100) : null;
              const lg  = pct !== null ? letterGrade(pct) : null;
              return (
                <div key={a.id} className="grades-panel-row">
                  <div className="grades-panel-row-info">
                    <div className="grades-panel-row-title">{a.title}</div>
                    <div className="grades-panel-row-pts">{a.points} pts</div>
                  </div>
                  <div className="grades-panel-row-grade">
                    {g !== null ? (
                      <><span style={{fontWeight:700,color:'#1a1f36'}}>{g}/{a.points}</span>
                      <span className="grades-letter" style={{background:lg.bg,color:lg.color,fontSize:11}}>{lg.letter}</span></>
                    ) : <span style={{color:'#8a8fa8',fontSize:13}}>Not graded</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Calendar Tab ───────────────────────────────────────────
function TabCalendar({ color }) {
  const [viewDate, setViewDate]     = useState(new Date());
  const [events, setEvents]         = useState(SEED_EVENTS);
  const [showAdd, setShowAdd]       = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [clickedDay, setClickedDay] = useState(null);
  const [form, setForm] = useState({ title:'', type:'assignment', date:'' });

  const vY = viewDate.getFullYear();
  const vM = viewDate.getMonth();
  const firstDay     = new Date(vY, vM, 1).getDay();
  const daysInMonth  = new Date(vY, vM + 1, 0).getDate();
  const cells = Array(firstDay).fill(null).concat(Array.from({length:daysInMonth},(_,i)=>i+1));

  const eventsOn = (day) =>
    events.filter(e => {
      const d = new Date(e.date + 'T12:00:00');
      return d.getFullYear()===vY && d.getMonth()===vM && d.getDate()===day;
    });

  const isToday = (day) => {
    const t = new Date();
    return t.getFullYear()===vY && t.getMonth()===vM && t.getDate()===day;
  };

  const openAdd = (day) => {
    const dateStr = `${vY}-${String(vM+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    setForm({ title:'', type:'assignment', date:dateStr });
    setClickedDay(day);
    setShowAdd(true);
  };

  const saveEvent = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setEvents(prev => [...prev, { id:'e'+uid(), ...form }]);
    setShowAdd(false);
  };

  const upcoming = events
    .filter(e => new Date(e.date+'T12:00:00') >= new Date())
    .sort((a,b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);

  return (
    <div className="cal-layout">
      <div className="cal-grid-wrap">
        <div className="cal-nav">
          <button className="cal-nav-btn" onClick={() => setViewDate(new Date(vY, vM-1, 1))}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15,18 9,12 15,6"/></svg>
          </button>
          <span className="cal-month-label">{MONTHS[vM]} {vY}</span>
          <button className="cal-nav-btn" onClick={() => setViewDate(new Date(vY, vM+1, 1))}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9,18 15,12 9,6"/></svg>
          </button>
          <button className="add-class-button" style={{marginLeft:'auto',padding:'7px 16px',fontSize:13}} onClick={() => openAdd(today.getDate())}>
            + Add Event
          </button>
        </div>
        <div className="cal-day-headers">
          {WDAYS.map(d => <div key={d} className="cal-day-header">{d}</div>)}
        </div>
        <div className="cal-grid">
          {cells.map((day, i) => {
            const dayEvs = day ? eventsOn(day) : [];
            return (
              <div key={i} className={`cal-cell ${day?'cal-cell--active':''} ${isToday(day)?'cal-cell--today':''}`}
                onClick={() => day && openAdd(day)}
              >
                {day && (
                  <>
                    <span className="cal-cell-num">{day}</span>
                    <div className="cal-cell-events">
                      {dayEvs.slice(0,3).map(ev => {
                        const meta = TYPE_META[ev.type] || TYPE_META.other;
                        return (
                          <div key={ev.id} className="cal-event-pill"
                            style={{ background: color + '22', color, borderLeft: `3px solid ${color}` }}
                            onClick={e => { e.stopPropagation(); setSelectedEvent(ev); }}
                          >{ev.title}</div>
                        );
                      })}
                      {dayEvs.length > 3 && <div className="cal-event-more">+{dayEvs.length-3} more</div>}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right panel */}
      <div className="cal-sidebar">
        <div className="cal-panel">
          <div className="cal-panel-title">Event Types</div>
          {Object.entries(TYPE_META).map(([k,v]) => (
            <div key={k} className="cal-legend-row">
              <div className="cal-legend-dot" style={{ background: v.color }} />{v.label}
            </div>
          ))}
        </div>
        <div className="cal-panel">
          <div className="cal-panel-title">Upcoming</div>
          {upcoming.length === 0 && <div className="cal-empty">Nothing upcoming</div>}
          {upcoming.map(ev => {
            const meta = TYPE_META[ev.type] || TYPE_META.other;
            const d = new Date(ev.date + 'T12:00:00');
            return (
              <div key={ev.id} className="cal-upcoming-row" onClick={() => setSelectedEvent(ev)}>
                <div className="cal-upcoming-dot" style={{ background: color }} />
                <div className="cal-upcoming-info">
                  <div className="cal-upcoming-title">{ev.title}</div>
                  <div className="cal-upcoming-meta">{d.toLocaleDateString('en-US',{month:'short',day:'numeric'})}</div>
                </div>
                <div className="cal-upcoming-type" style={{ background: meta.bg, color: meta.color }}>{meta.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add event modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Add Event</h2>
            <form className="modal-form" onSubmit={saveEvent}>
              <label><div className="modal-form-label-text">Title</div>
                <input className="modal-input" placeholder="e.g. Quiz 2" value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} required />
              </label>
              <label><div className="modal-form-label-text">Type</div>
                <select className="modal-select" value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))}>
                  {Object.entries(TYPE_META).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </label>
              <label><div className="modal-form-label-text">Date</div>
                <input type="date" className="modal-input" value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))} required />
              </label>
              <div className="modal-actions">
                <button type="button" className="modal-button-cancel" onClick={() => setShowAdd(false)}>Cancel</button>
                <button type="submit" className="modal-button-save">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Event detail modal */}
      {selectedEvent && (
        <div className="modal-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>{selectedEvent.title}</h2>
            <div className="modal-form" style={{gap:12}}>
              {(() => {
                const meta = TYPE_META[selectedEvent.type] || TYPE_META.other;
                const d = new Date(selectedEvent.date + 'T12:00:00');
                return (
                  <>
                    <div className="ev-detail-row"><span className="ev-detail-label">Type</span>
                      <span className="cal-upcoming-type" style={{background:meta.bg,color:meta.color}}>{meta.label}</span>
                    </div>
                    <div className="ev-detail-row"><span className="ev-detail-label">Date</span>
                      <span>{d.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}</span>
                    </div>
                  </>
                );
              })()}
              <div className="modal-actions" style={{marginTop:8}}>
                <button className="modal-button-cancel" onClick={() => setSelectedEvent(null)}>Close</button>
                <button className="modal-button-save" style={{background:'#e53e3e'}}
                  onClick={() => { setEvents(prev => prev.filter(e => e.id !== selectedEvent.id)); setSelectedEvent(null); }}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Students Tab ───────────────────────────────────────────
function TabStudents({ color }) {
  return (
    <div className="students-tab">
      <div className="students-header-row">
        <div className="students-count">{MOCK_STUDENTS.length} enrolled students</div>
      </div>
      <div className="students-list">
        {MOCK_STUDENTS.map((s, i) => (
          <div key={s.id} className="student-row-card">
            <div className="sub-avatar" style={{ width:42, height:42, fontSize:16, background: color + '22', color }}>{s.avatar}</div>
            <div className="student-row-info">
              <div className="student-row-name">{s.name}</div>
              <div className="student-row-id">Student ID: {s.id.toUpperCase()}</div>
            </div>
            <div className="student-row-status">Active</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════
// ── Class Code Generator ───────────────────────────────────
// TODO: Replace this function with your actual code generator.
// It should return a unique 6-character alphanumeric string.
function generateClassCode() {
  // PLACEHOLDER — swap this line with your real generator:
  return 'ABC123';
}

function TCourseDashboard() {
  const location  = useLocation();
  const state     = location.state || {};
  const className  = state.title      || 'Untitled Class';
  const courseName = state.courseName || '';
  const quarter   = state.quarter  || '';
  const color     = state.color    || '#7C6FE0';

  const [activeTab, setActiveTab]     = useState('assignments');
  const [assignments, setAssignments] = useState(SEED_ASSIGNMENTS);
  const [classCode]                   = useState(generateClassCode);
  const [codeCopied, setCodeCopied]   = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(classCode).then(() => {
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    });
  };

  const tabs = [
    { id: 'assignments', label: 'Assignments', iconPath: NAV_ICONS.assign },
    { id: 'grades',      label: 'Grades',      iconPath: NAV_ICONS.grades },
    { id: 'calendar',    label: 'Calendar',    iconPath: NAV_ICONS.cal    },
    { id: 'students',    label: 'Students',    iconPath: NAV_ICONS.students },
  ];

  return (
    <div className="teacher-container">
      {/* ── Sidebar ── */}
      <aside className="teacher-sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🎓</div>
          <span className="sidebar-logo-text">EduTrack</span>
        </div>

        {/* Back to dashboard */}
        <Link to="/teacher" className="sidebar-back-btn">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d={NAV_ICONS.back}/>
          </svg>
          All Classes
        </Link>

        {/* Class badge */}
        <div className="sidebar-class-badge" style={{ borderLeft: `4px solid ${color}` }}>
          <div className="sidebar-class-badge-name">{className}</div>
          <div className="sidebar-class-badge-quarter">{quarter}</div>
        </div>

        <div className="sidebar-section-label">Navigation</div>
        <nav className="sidebar-nav">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`sidebar-nav-item ${activeTab === tab.id ? 'active' : ''}`}
              style={activeTab === tab.id ? { borderLeftColor: color } : {}}
              onClick={() => setActiveTab(tab.id)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={tab.iconPath}/>
              </svg>
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Spacer pushes profile to bottom */}
        <div style={{ flex: 1 }} />

        {/* Logout button */}
        <Link to="/" className="sidebar-logout-btn">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16,17 21,12 16,7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Log Out
        </Link>


        <div className="sidebar-profile">
          <div className="sidebar-avatar">T</div>
          <div>
            <div className="sidebar-profile-name">Teacher</div>
            <div className="sidebar-profile-role">Instructor</div>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="teacher-main">
        {/* Header */}
        <div className="tcd-page-header">
          <div className="tcd-header-top">
            <div className="tcd-header-banner" style={{ borderLeft: `5px solid ${color}` }}>
              <div className="tcd-class-title">{className}</div>
              {courseName && <div className="tcd-class-course-name">{courseName}</div>}
              <div className="tcd-class-quarter">{quarter}</div>
            </div>
            <div
              className="tcd-class-code"
              onClick={handleCopyCode}
              title="Click to copy class code"
            >
              <div className="tcd-class-code-label">Class Code</div>
              <div className="tcd-class-code-value" style={{ color }}>
                {classCode}
              </div>
              <div className="tcd-class-code-hint">
                {codeCopied ? '✓ Copied!' : 'Click to copy'}
              </div>
            </div>
          </div>

          {/* Tab bar */}
          <div className="tcd-tab-bar">

            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`tcd-tab ${activeTab === tab.id ? 'active' : ''}`}
                style={activeTab === tab.id ? { borderBottomColor: color, color } : {}}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="tcd-tab-content">
          {activeTab === 'assignments' && <TabAssignments color={color} assignments={assignments} setAssignments={setAssignments} />}
          {activeTab === 'grades'      && <TabGrades      color={color} assignments={assignments} />}
          {activeTab === 'calendar'    && <TabCalendar    color={color} />}
          {activeTab === 'students'    && <TabStudents    color={color} />}
        </div>
      </main>
    </div>
  );
}

export default TCourseDashboard;