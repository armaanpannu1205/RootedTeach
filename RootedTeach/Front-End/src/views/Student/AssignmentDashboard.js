import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import './AssignmentDashboard.css';

// MUI Icons
import AssignmentIcon        from '@mui/icons-material/Assignment';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import CalendarTodayIcon     from '@mui/icons-material/CalendarToday';
import EmojiEventsIcon       from '@mui/icons-material/EmojiEvents';
import AccessTimeIcon        from '@mui/icons-material/AccessTime';
import CheckCircleIcon       from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon    from '@mui/icons-material/HourglassEmpty';
import SmartToyIcon          from '@mui/icons-material/SmartToy';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import AttachFileIcon        from '@mui/icons-material/AttachFile';
import CloudUploadIcon       from '@mui/icons-material/CloudUpload';
import GradeIcon             from '@mui/icons-material/Grade';
import ErrorOutlineIcon      from '@mui/icons-material/ErrorOutline';
import InfoOutlinedIcon      from '@mui/icons-material/InfoOutlined';
import UploadFileIcon        from '@mui/icons-material/UploadFile';
import CloseIcon             from '@mui/icons-material/Close';

const DEFAULT_COURSE = { code: 'CS 35L', name: 'Software Construction', prof: 'Eggert' };

function getDaysLeft(due) {
  const days = Math.ceil((new Date(due) - new Date()) / 86400000);
  if (days < 0)   return { label: 'Past due',     color: 'var(--danger)' };
  if (days === 0) return { label: 'Due today',    color: 'var(--warning)' };
  if (days <= 3)  return { label: `${days}d left`, color: 'var(--warning)' };
  return               { label: `${days}d left`, color: 'var(--muted)' };
}

function AssignmentDashboard() {
  const navigate = useNavigate();

  const course = (() => {
    try { return JSON.parse(localStorage.getItem('currentCourse')) || DEFAULT_COURSE; }
    catch { return DEFAULT_COURSE; }
  })();

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [filter, setFilter]           = useState('all');
  const [selectedId, setSelectedId]   = useState(null);
  const [file, setFile]               = useState(null);
  const [comment, setComment]         = useState('');
  const [submitting, setSubmitting]   = useState(false);
  const [toast, setToast]             = useState('');
  const [dragOver, setDragOver]       = useState(false);

  const studentId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchAssignments = async () => {
      const classId = course.id || course._id;
      if (!classId) { setLoading(false); return; }
      try {
        const res  = await fetch(`http://localhost:5001/api/assignments/class/${classId}`);
        const data = await res.json();
        const mapped = data.map(a => {
          const submission = a.submissions?.find(s => s.student?._id === studentId || s.student === studentId);
          return {
            id: a.id,
            title: a.title,
            due: a.dueDate ? new Date(a.dueDate).toLocaleString() : 'No due date',
            dueRaw: a.dueDate,
            points: a.points || 100,
            status: submission ? 'submitted' : 'pending',
            desc: a.description || 'No description provided.',
            submittedFile: submission?.fileName || null,
            submittedFilePath: submission?.filePath || null,
            submittedAt: submission?.submittedAt ? new Date(submission.submittedAt).toLocaleString() : null,
            grade: submission?.score ?? null,
            feedback: submission?.feedback ?? null,
            aiScore: submission?.aiScore ?? null,
            attachedFileName: a.attachedFileName || null,
            attachedFilePath: a.attachedFilePath || null,
          };
        });
        setAssignments(mapped);
        const savedId = localStorage.getItem('selectedAssignmentId');
        if (savedId) { localStorage.removeItem('selectedAssignmentId'); setSelectedId(savedId); }
      } catch (err) {
        console.error('Failed to fetch assignments:', err);
      } finally { setLoading(false); }
    };
    fetchAssignments();
  }, [course.id, course._id, studentId]);

  const filtered = assignments.filter(a => {
    if (filter === 'pending')   return a.status === 'pending';
    if (filter === 'submitted') return a.status === 'submitted';
    return true;
  });

  const currentSel = assignments.find(a => a.id === selectedId) || null;

  async function handleSubmit() {
    if (!file) { setToast('Select a file first'); setTimeout(() => setToast(''), 3000); return; }
    if (!studentId) { setToast('Not logged in'); setTimeout(() => setToast(''), 3000); return; }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('studentId', studentId);
      const res    = await fetch(`http://localhost:5001/api/assignments/${currentSel.id}/submit`, { method: 'POST', body: fd });
      const result = await res.json();
      if (!res.ok) { setToast(result.message || 'Submission failed'); setTimeout(() => setToast(''), 4000); return; }
      const now = new Date().toLocaleString();
      setAssignments(prev => prev.map(a =>
        a.id === currentSel.id ? { ...a, status: 'submitted', submittedFile: file.name, submittedAt: now, aiScore: result.aiScore } : a
      ));
      setFile(null); setComment('');
      setToast(`Submitted successfully!${result.aiScore != null ? ` AI score: ${result.aiScore}/100` : ''}`);
      setTimeout(() => setToast(''), 4000);
    } catch (err) {
      console.error(err); setToast('Could not connect to server.'); setTimeout(() => setToast(''), 4000);
    } finally { setSubmitting(false); }
  }

  function handleDrop(e) {
    e.preventDefault(); setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  }

  return (
    <div className="app-layout">
      <Sidebar
        course={course}
        activePage="assignments"
        onPageChange={p => { if (p !== 'assignment') navigate('/course'); }}
      />

      <div className="assign-main">
        {/* ── Left panel ── */}
        <div className="assign-list-panel">
          <div className="list-panel-header">
            <div>
              <h2 className="list-panel-title">Assignments</h2>
              <p className="list-panel-sub">
                {loading ? 'Loading…' : `${assignments.length} total · ${assignments.filter(a => a.status === 'submitted').length} submitted`}
              </p>
            </div>
          </div>

          <div className="filter-tabs">
            {['all', 'pending', 'submitted'].map(f => (
              <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                {f === 'all' ? 'All' : f === 'pending' ? 'Pending' : 'Submitted'}
              </button>
            ))}
          </div>

          <div className="assign-list">
            {loading && <div className="list-empty">Loading assignments…</div>}
            {!loading && filtered.length === 0 && <div className="list-empty">No assignments here.</div>}
            {filtered.map(a => {
              const dl       = a.dueRaw ? getDaysLeft(a.dueRaw) : null;
              const isActive = currentSel?.id === a.id;
              return (
                <div key={a.id} className={`assign-item ${isActive ? 'selected' : ''}`} onClick={() => setSelectedId(a.id)}>
                  <div className="assign-item-icon" style={{ background: a.status === 'submitted' ? 'rgba(56,161,105,.12)' : 'rgba(114,105,224,.1)' }}>
                    {a.status === 'submitted'
                      ? <AssignmentTurnedInIcon style={{ color: '#38a169', fontSize: 18 }}/>
                      : <AssignmentIcon style={{ color: '#e07a5f', fontSize: 18 }}/>}
                  </div>
                  <div className="assign-item-body">
                    <div className="assign-item-title">{a.title}</div>
                    <div className="assign-item-meta">
                      {a.dueRaw && (
                        <span className="meta-tag">
                          <CalendarTodayIcon style={{ fontSize: 11 }}/> {new Date(a.dueRaw).toLocaleDateString()}
                        </span>
                      )}
                      <span className="meta-tag">
                        <EmojiEventsIcon style={{ fontSize: 11 }}/> {a.points} pts
                      </span>
                      {dl && a.status === 'pending' && (
                        <span className="meta-tag" style={{ color: dl.color }}>
                          <AccessTimeIcon style={{ fontSize: 11 }}/> {dl.label}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`item-status-dot ${a.status}`}/>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right panel */}
        <div className="assign-detail-panel">
          {!currentSel ? (
            <div className="empty-detail">
              <AssignmentIcon style={{ fontSize: 48, color: '#d1d5db' }}/>
              <div className="empty-detail-title">Select an assignment</div>
              <div className="empty-detail-sub">Click an assignment on the left to view details and submit</div>
            </div>
          ) : (
            <div className="detail-scroll">
              {/* Title row */}
              <div className="detail-header">
                <div>
                  <div className="detail-title">{currentSel.title}</div>
                  <div className="detail-chips">
                    {currentSel.dueRaw && (
                      <span className="detail-chip">
                        <CalendarTodayIcon style={{ fontSize: 13 }}/> Due {new Date(currentSel.dueRaw).toLocaleDateString()}
                      </span>
                    )}
                    <span className="detail-chip">
                      <EmojiEventsIcon style={{ fontSize: 13 }}/> {currentSel.points} pts
                    </span>
                    {currentSel.status === 'pending' && currentSel.dueRaw && (() => {
                      const dl = getDaysLeft(currentSel.dueRaw);
                      return <span className="detail-chip" style={{ color: dl.color, borderColor: dl.color + '44' }}><AccessTimeIcon style={{ fontSize: 13 }}/> {dl.label}</span>;
                    })()}
                  </div>
                </div>
                <span className={`status-badge ${currentSel.status}`}>
                  {currentSel.status === 'submitted'
                    ? <><CheckCircleIcon style={{ fontSize: 14 }}/> Submitted</>
                    : <><HourglassEmptyIcon style={{ fontSize: 14 }}/> Pending</>}
                </span>
              </div>

              {/* Description */}
              <div className="detail-section">
                <div className="section-label"><InfoOutlinedIcon style={{ fontSize: 14 }}/> Description</div>
                <p className="detail-desc">{currentSel.desc}</p>
                {currentSel.attachedFileName && currentSel.attachedFilePath && (
                  <a href={`http://localhost:5001/${currentSel.attachedFilePath.replace(/\\\\/g, '/')}`}
                    target="_blank" rel="noreferrer" className="attach-link">
                    <AttachFileIcon style={{ fontSize: 14 }}/> {currentSel.attachedFileName}
                  </a>
                )}
              </div>

              {/* Grade */}
              {currentSel.grade !== null && (
                <div className="detail-section grade-section">
                  <div className="section-label"><GradeIcon style={{ fontSize: 14 }}/> Grade</div>
                  <div className="grade-row">
                    <div className="grade-score">
                      <span className="grade-num">{currentSel.grade}</span>
                      <span className="grade-denom">/ {currentSel.points}</span>
                      <span className="grade-pct">{Math.round((currentSel.grade / currentSel.points) * 100)}%</span>
                    </div>
                    <div className="grade-bar-bg">
                      <div className="grade-bar-fill" style={{ width: `${(currentSel.grade / currentSel.points) * 100}%` }}/>
                    </div>
                  </div>
                  {currentSel.feedback && (
                    <div className="feedback-box">
                      <ChatBubbleOutlineIcon style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}/>
                      <span>{currentSel.feedback}</span>
                    </div>
                  )}
                </div>
              )}

              {/* AI Detection */}
              {currentSel.status === 'submitted' && currentSel.aiScore !== null && (() => {
                const score  = currentSel.aiScore;
                const isHigh = score >= 70, isMid = score >= 40;
                const color  = isHigh ? '#e53e3e' : isMid ? '#d97706' : '#059669';
                const bg     = isHigh ? '#fef2f2' : isMid ? '#fffbeb' : '#f0fdf4';
                const border = isHigh ? '#fecaca' : isMid ? '#fde68a' : '#bbf7d0';
                const label  = isHigh ? 'Likely AI-generated' : isMid ? 'Mixed signals' : 'Looks human-written';
                const desc   = isHigh
                  ? 'Strong patterns associated with AI-generated code were detected.'
                  : isMid ? 'Some AI-like patterns were found mixed with human signals.'
                  : 'This submission looks like it was written by a human.';
                const circ = 2 * Math.PI * 20; const offset = circ - (circ * score / 100);
                return (
                  <div className="detail-section" style={{ background: bg, border: `1px solid ${border}`, borderRadius: 12, padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ position: 'relative', width: 48, height: 48, flexShrink: 0 }}>
                        <svg width={48} height={48} style={{ transform: 'rotate(-90deg)' }}>
                          <circle cx={24} cy={24} r={20} fill="none" stroke={border} strokeWidth={5}/>
                          <circle cx={24} cy={24} r={20} fill="none" stroke={color} strokeWidth={5}
                            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"/>
                        </svg>
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color }}>{score}%</div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
                          <SmartToyIcon style={{ fontSize: 14, color }}/>
                          <span style={{ fontSize: 12, fontWeight: 700, color }}>AI Detection</span>
                          <span style={{ fontSize: 10, fontWeight: 600, background: color + '18', color, padding: '2px 8px', borderRadius: 20 }}>{label}</span>
                        </div>
                        <p style={{ fontSize: 11, color: '#6b7280', margin: 0 }}>{desc}</p>
                      </div>
                    </div>
                    <div style={{ marginTop: 10, background: border, borderRadius: 999, height: 5, overflow: 'hidden' }}>
                      <div style={{ width: `${score}%`, height: '100%', background: color, borderRadius: 999 }}/>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#9ca3af', marginTop: 3, textTransform: 'uppercase', letterSpacing: .5 }}>
                      <span>Human</span><span>AI</span>
                    </div>
                  </div>
                );
              })()}

              {/* Submission section */}
              <div className="detail-section submit-section">
                <div className="section-label"><UploadFileIcon style={{ fontSize: 14 }}/> Submission</div>

                {currentSel.status === 'submitted' && (
                  <div className="submitted-banner">
                    <CheckCircleIcon style={{ fontSize: 16, color: '#38a169', flexShrink: 0 }}/>
                    <div>
                      <span style={{ fontWeight: 600 }}>Submitted {currentSel.submittedAt}</span>
                      {currentSel.submittedFile && (
                        currentSel.submittedFilePath
                          ? <> &middot; <a href={`http://localhost:5001/${currentSel.submittedFilePath.replace(/\\\\/g, '/')}`}
                              target="_blank" rel="noreferrer" style={{ color: '#e07a5f', fontWeight: 600 }}>
                              {currentSel.submittedFile}
                            </a></>
                          : <> &middot; <strong>{currentSel.submittedFile}</strong></>
                      )}
                    </div>
                  </div>
                )}

                {/* Drop zone */}
                <div
                  className={`file-drop ${dragOver ? 'drag-over' : ''}`}
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('file-input').click()}
                >
                  <input id="file-input" type="file" style={{ display: 'none' }}
                    onChange={e => e.target.files[0] && setFile(e.target.files[0])}/>
                  <CloudUploadIcon style={{ fontSize: 28, color: file ? '#7269e0' : '#d1d5db', marginBottom: 6 }}/>
                  {file ? (
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#e07a5f' }}>{file.name}</div>
                  ) : (
                    <>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>Drop file here or <span style={{ color: '#e07a5f' }}>browse</span></div>
                      <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>PDF, ZIP, PY, JS, JAVA, CPP, TS and more</div>
                    </>
                  )}
                </div>

                {file && (
                  <div className="selected-file">
                    <AttachFileIcon style={{ fontSize: 14, color: '#e07a5f' }}/>
                    <span>{file.name}</span>
                    <span style={{ color: '#9ca3af', fontSize: 11, marginLeft: 4 }}>({(file.size / 1024).toFixed(1)} KB)</span>
                    <button className="remove-file-btn" onClick={() => setFile(null)}><CloseIcon style={{ fontSize: 13 }}/></button>
                  </div>
                )}

                <textarea className="text-area" placeholder="Add a comment (optional)" value={comment} onChange={e => setComment(e.target.value)}/>

                <button className={`submit-btn ${currentSel.status === 'submitted' ? 'resubmit' : ''}`} onClick={handleSubmit} disabled={submitting}>
                  <UploadFileIcon style={{ fontSize: 16 }}/>
                  {submitting ? 'Submitting…' : currentSel.status === 'submitted' ? 'Resubmit' : 'Submit Assignment'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {toast && (
        <div className="toast">
          <CheckCircleIcon style={{ fontSize: 15 }}/> {toast}
        </div>
      )}
    </div>
  );
}

export default AssignmentDashboard;