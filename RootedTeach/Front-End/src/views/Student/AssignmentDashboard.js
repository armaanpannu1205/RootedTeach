import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import { api } from '../../utils/api';
import './AssignmentDashboard.css';

const DEFAULT_COURSE = { code: 'CS 35L', name: 'Software Construction' };

function getDaysLeft(due) {
  const d = new Date(due) - new Date();
  const days = Math.ceil(d / 86400000);
  if (days < 0) return 'closed';
  if (days === 0) return 'Due today';
  return `${days} days left`;
}

function AiScoreBadge({ score }) {
  if (score == null) return null;
  const isHigh = score >= 70, isMid = score >= 40;
  const color  = isHigh ? '#e53e3e' : isMid ? '#e8a040' : '#38a169';
  const bg     = isHigh ? 'rgba(229,62,62,.08)' : isMid ? 'rgba(232,160,64,.08)' : 'rgba(56,161,105,.08)';
  const border = isHigh ? '#e53e3e33' : isMid ? '#e8a04033' : '#38a16933';
  const label  = isHigh ? 'Likely AI-generated' : isMid ? 'Mixed signals' : 'Likely human-written';
  const icon   = isHigh ? '🤖' : isMid ? '⚠️' : '✅';
  const r = 22, circ = 2 * Math.PI * r;
  const fill = circ - (circ * score / 100);

  return (
    <div style={{background:bg,border:`1px solid ${border}`,borderRadius:12,padding:'12px 16px',marginBottom:16}}>
      <div style={{display:'flex',alignItems:'center',gap:12}}>
        <div style={{position:'relative',width:54,height:54,flexShrink:0}}>
          <svg width="54" height="54" style={{transform:'rotate(-90deg)'}}>
            <circle cx="27" cy="27" r={r} fill="none" stroke="#e2e8f0" strokeWidth={5}/>
            <circle cx="27" cy="27" r={r} fill="none" stroke={color} strokeWidth={5}
              strokeDasharray={circ} strokeDashoffset={fill} strokeLinecap="round"/>
          </svg>
          <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800,color}}>{score}%</div>
        </div>
        <div>
          <div style={{fontWeight:700,fontSize:14,color,marginBottom:2}}>{icon} AI Detection Score: {score}/100</div>
          <div style={{fontSize:12,color:'#4a5568'}}>{label}</div>
          <div style={{fontSize:11,color:'#8a8fa8',marginTop:2}}>
            {isHigh ? 'Your submission shows patterns common in AI-generated code.' :
             isMid  ? 'Some AI-like patterns detected alongside human indicators.' :
                      'Your submission shows natural human coding patterns.'}
          </div>
        </div>
      </div>
    </div>
  );
}

function AssignmentDashboard() {
  const navigate = useNavigate();
  const course = (() => { try { return JSON.parse(localStorage.getItem('currentCourse')) || DEFAULT_COURSE; } catch { return DEFAULT_COURSE; } })();

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedId, setSelectedId] = useState(null);
  const [file, setFile] = useState(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState('');
  const studentId = localStorage.getItem('userId');

  useEffect(() => {
    const classId = course.id || course._id;
    if (!classId) { setLoading(false); return; }
    api.get(`/api/assignments/class/${classId}`)
      .then(r => r.json())
      .then(data => {
        const mapped = data.map(a => {
          const sub = (a.submissions||[]).find(s => s.student?._id === studentId || s.student === studentId);
          return {
            id: a.id, title: a.title,
            due: a.dueDate ? new Date(a.dueDate).toLocaleString() : 'No due date',
            points: a.points || 100,
            status: sub ? 'submitted' : 'pending',
            desc: a.description || 'No description provided.',
            submittedFile: sub?.fileName || null,
            submittedAt: sub?.submittedAt ? new Date(sub.submittedAt).toLocaleString() : null,
            grade: sub?.score ?? null,
            feedback: sub?.feedback ?? null,
            aiScore: sub?.aiScore ?? null,
          };
        });
        setAssignments(mapped);
        const savedId = localStorage.getItem('selectedAssignmentId');
        if (savedId) { localStorage.removeItem('selectedAssignmentId'); setSelectedId(savedId); }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [course.id, course._id, studentId]);

  const filtered = assignments.filter(a => {
    if (filter === 'pending')   return a.status === 'pending';
    if (filter === 'submitted') return a.status === 'submitted';
    return true;
  });

  const currentSel = assignments.find(a => a.id === selectedId) || null;

  async function handleSubmit() {
    if (!file) { alert('Please select a file.'); return; }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('studentId', studentId);
      const res = await api.postForm(`/api/assignments/${currentSel.id}/submit`, fd);
      const result = await res.json();
      if (!res.ok) { setToast(`❌ ${result.message||'Submission failed'}`); setTimeout(()=>setToast(''),4000); return; }
      setAssignments(prev => prev.map(a => a.id === currentSel.id
        ? { ...a, status:'submitted', submittedFile:file.name, submittedAt:new Date().toLocaleString(), aiScore:result.aiScore }
        : a));
      setFile(null); setComment('');
      setToast(`✅ Submitted!${result.aiScore!=null?` AI score: ${result.aiScore}/100`:''}`);
      setTimeout(()=>setToast(''),4000);
    } catch { setToast('❌ Could not connect.'); setTimeout(()=>setToast(''),4000); }
    finally { setSubmitting(false); }
  }

  return (
    <div className="app-layout">
      <Sidebar course={course} activePage="assignments" onPageChange={p => { if (p !== 'assignment') navigate('/course'); }}/>
      <div className="assign-main">
        <div className="assign-list-panel">
          <div className="panel-header">
            <h2>📝 Assignments</h2>
            <p>{loading ? 'Loading…' : `${assignments.length} assignments · ${assignments.filter(a=>a.status==='submitted').length} submitted`}</p>
          </div>
          <div className="filter-tabs">
            {['all','pending','submitted'].map(f => (
              <button key={f} className={`filter-tab ${filter===f?'active':''}`} onClick={()=>setFilter(f)}>
                {f==='all'?'All':f==='pending'?'Pending':'Submitted'}
              </button>
            ))}
          </div>
          <div className="assign-list">
            {loading && <div style={{padding:24,textAlign:'center',color:'var(--muted)',fontSize:13}}>Loading…</div>}
            {!loading && filtered.length === 0 && <div style={{padding:24,textAlign:'center',color:'var(--muted)',fontSize:13}}>No assignments here yet.</div>}
            {filtered.map(a => (
              <div key={a.id} className={`assign-item ${currentSel?.id===a.id?'selected':''}`} onClick={()=>setSelectedId(a.id)}>
                <div className="assign-item-top">
                  <div className="assign-title">{a.title}</div>
                  <span className={`status-pill ${a.status}`}>{a.status==='submitted'?'Submitted':'Not submitted'}</span>
                </div>
                <div className="assign-item-meta">
                  <span>📅 {a.due.split(',')[0]}</span>
                  <span>🏆 {a.points} pts</span>
                  {a.aiScore != null && <span style={{color:a.aiScore>=70?'#e53e3e':a.aiScore>=40?'#e8a040':'#38a169',fontSize:11}}>🤖 {a.aiScore}%</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="assign-detail-panel">
          {!currentSel ? (
            <div className="empty-detail">
              <div style={{fontSize:'3rem'}}>📄</div>
              <div style={{fontSize:'1rem',fontWeight:600}}>Select an assignment</div>
              <div style={{fontSize:'.85rem',color:'var(--muted)'}}>Click an assignment on the left to see details</div>
            </div>
          ) : (
            <>
              <div className="detail-top">
                <div className="detail-title">{currentSel.title}</div>
                <span className={`status-pill ${currentSel.status}`} style={{fontSize:'.8rem',padding:'5px 14px'}}>
                  {currentSel.status==='submitted'?'✅ Submitted':'⏳ Not submitted'}
                </span>
              </div>
              <div className="detail-meta">
                <div className="meta-chip">📅 Due <b>{currentSel.due}</b></div>
                <div className="meta-chip">🏆 Points <b>{currentSel.points}</b></div>
                {currentSel.status==='pending' && getDaysLeft(currentSel.due) !== 'closed' && (
                  <div className="meta-chip">⏰ <b>{getDaysLeft(currentSel.due)}</b></div>
                )}
              </div>

              <div className="description-box"><h4>Description</h4><p>{currentSel.desc}</p></div>
              <div className="divider"/>

              {currentSel.status==='submitted' && currentSel.grade !== null && (
                <div className="grade-result-section" style={{marginBottom:20}}>
                  <h4 style={{marginBottom:12,fontFamily:'Fraunces, serif'}}>Grade</h4>
                  <div className="grade-score-box">
                    <span className="grade-score-num">{currentSel.grade}</span>
                    <span className="grade-score-max"> / {currentSel.points}</span>
                    <span className="grade-score-pct">{Math.round((currentSel.grade/currentSel.points)*100)}%</span>
                  </div>
                  <div className="grade-bar-wrap" style={{margin:'10px 0'}}>
                    <div className="grade-bar-fill" style={{width:`${(currentSel.grade/currentSel.points)*100}%`}}/>
                  </div>
                  {currentSel.feedback && <div className="feedback-box"><b>💬 Feedback</b><p>{currentSel.feedback}</p></div>}
                </div>
              )}

              {currentSel.status === 'submitted' && <AiScoreBadge score={currentSel.aiScore}/>}

              <div className="submit-section">
                <h4>Submission</h4>
                {currentSel.status==='submitted' && (
                  <div className="submitted-banner">✅ <div><b>Submitted {currentSel.submittedAt}</b>{currentSel.submittedFile&&<> · <b>{currentSel.submittedFile}</b></>}</div></div>
                )}
                <div className="file-drop">
                  <input type="file" onChange={e => e.target.files[0] && setFile(e.target.files[0])}/>
                  <div className="file-drop-icon">📂</div>
                  <div className="file-drop-text">Drag a file or <b>click to select</b></div>
                  <div style={{fontSize:'.72rem',color:'var(--muted)',marginTop:6}}>PDF, ZIP, PY, JAVA, CPP, JS, TS etc.</div>
                </div>
                {file && <div className="selected-file">📎 {file.name} <span style={{color:'var(--muted)',fontSize:'.75rem'}}>({(file.size/1024).toFixed(1)} KB)</span><button onClick={()=>setFile(null)}>✕</button></div>}
                <textarea className="text-area" placeholder="Comments (optional)" value={comment} onChange={e=>setComment(e.target.value)}/>
                <button className={`submit-btn ${currentSel.status==='submitted'?'resubmit':''}`} onClick={handleSubmit} disabled={submitting}>
                  {submitting?'⏳ Submitting…':currentSel.status==='submitted'?'🔄 Resubmit':'📤 Submit'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

export default AssignmentDashboard;
