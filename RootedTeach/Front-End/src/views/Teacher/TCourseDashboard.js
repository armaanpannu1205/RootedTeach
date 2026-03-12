import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';
import './Teacher.css';
import './TCourseDashboard.css';

// ── Helpers ────────────────────────────────────────────────
const today = new Date();
const ymd = (d) => d.toISOString().slice(0, 10);
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const WDAYS  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function letterGrade(pct) {
  if (pct >= 93) return { letter: 'A',  color: '#38a169', bg: '#f0fff4' };
  if (pct >= 90) return { letter: 'A-', color: '#38a169', bg: '#f0fff4' };
  if (pct >= 87) return { letter: 'B+', color: '#4299e1', bg: '#ebf8ff' };
  if (pct >= 83) return { letter: 'B',  color: '#4299e1', bg: '#ebf8ff' };
  if (pct >= 80) return { letter: 'B-', color: '#4299e1', bg: '#ebf8ff' };
  if (pct >= 77) return { letter: 'C+', color: '#e8a040', bg: '#fff8ee' };
  if (pct >= 73) return { letter: 'C',  color: '#e8a040', bg: '#fff8ee' };
  if (pct >= 70) return { letter: 'C-', color: '#e8a040', bg: '#fff8ee' };
  return           { letter: 'D/F', color: '#e53e3e', bg: '#fff5f5' };
}

function aiMeta(score) {
  if (score == null) return null;
  if (score >= 70) return { label: 'Likely AI-generated', color: '#e53e3e', bg: 'rgba(229,62,62,0.08)', icon: '🤖', border: '#e53e3e40' };
  if (score >= 40) return { label: 'Mixed signals',       color: '#e8a040', bg: 'rgba(232,160,64,0.08)', icon: '⚠️', border: '#e8a04040' };
  return                   { label: 'Likely human-written', color: '#38a169', bg: 'rgba(56,161,105,0.08)', icon: '✅', border: '#38a16940' };
}

const NAV_ICONS = {
  back:     "M19 12H5M12 5l-7 7 7 7",
  assign:   "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2",
  grades:   "M3 3h18v18H3zM3 9h18M3 15h18M9 3v18",
  cal:      "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z",
  students: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
};

// ── AI Score Ring ──────────────────────────────────────────
function AiRing({ score, size = 56 }) {
  if (score == null) return <div style={{width:size,height:size,borderRadius:'50%',background:'#f4f4f8',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,color:'#aaa'}}>N/A</div>;
  const meta = aiMeta(score);
  const r = (size-6)/2, circ = 2*Math.PI*r;
  const fill = circ - (circ * score / 100);
  return (
    <div style={{position:'relative',width:size,height:size}}>
      <svg width={size} height={size} style={{transform:'rotate(-90deg)'}}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={5}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={meta.color} strokeWidth={5}
          strokeDasharray={circ} strokeDashoffset={fill} strokeLinecap="round"/>
      </svg>
      <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:size>48?12:10,fontWeight:800,color:meta.color}}>{score}%</div>
    </div>
  );
}

// ── AI Detail Panel ────────────────────────────────────────
function AiDetailPanel({ sub, assignmentPoints }) {
  const [open, setOpen] = useState(false);
  const meta = aiMeta(sub.aiScore);
  if (sub.aiScore == null) return <div style={{fontSize:12,color:'#aaa',padding:'4px 0'}}>No AI analysis (non-code file)</div>;

  return (
    <div style={{marginTop:8}}>
      <button onClick={() => setOpen(!open)} style={{
        display:'flex',alignItems:'center',gap:8,background:meta.bg,border:`1px solid ${meta.border}`,
        borderRadius:8,padding:'7px 12px',cursor:'pointer',fontSize:13,fontWeight:600,color:meta.color,width:'100%',justifyContent:'space-between'
      }}>
        <span>{meta.icon} AI Score: {sub.aiScore}/100 — {meta.label}</span>
        <span style={{fontSize:11,opacity:.7}}>{open?'▲ hide':'▼ details'}</span>
      </button>
      {open && (
        <div style={{background:'#fafbff',border:'1px solid #e8eaf0',borderRadius:8,padding:12,marginTop:6}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
            <div>
              <div style={{fontSize:11,fontWeight:700,color:'#e53e3e',letterSpacing:.5,marginBottom:6}}>🤖 AI INDICATORS ({(sub.explainedAiSignals||[]).length})</div>
              {(sub.explainedAiSignals||[]).length === 0
                ? <div style={{fontSize:12,color:'#aaa'}}>None detected</div>
                : (sub.explainedAiSignals||[]).map((s,i) => (
                  <div key={i} style={{fontSize:12,color:'#4a5568',padding:'3px 0',borderBottom:'1px solid #f0f0f4',lineHeight:1.4}}>
                    <span style={{color:'#e53e3e',fontWeight:600}}>• </span>{s.explanation}
                  </div>
                ))
              }
            </div>
            <div>
              <div style={{fontSize:11,fontWeight:700,color:'#38a169',letterSpacing:.5,marginBottom:6}}>👤 HUMAN INDICATORS ({(sub.explainedHumanSignals||[]).length})</div>
              {(sub.explainedHumanSignals||[]).length === 0
                ? <div style={{fontSize:12,color:'#aaa'}}>None detected</div>
                : (sub.explainedHumanSignals||[]).map((s,i) => (
                  <div key={i} style={{fontSize:12,color:'#4a5568',padding:'3px 0',borderBottom:'1px solid #f0f0f4',lineHeight:1.4}}>
                    <span style={{color:'#38a169',fontWeight:600}}>• </span>{s.explanation}
                  </div>
                ))
              }
            </div>
          </div>
          <div style={{fontSize:11,color:'#8a8fa8',borderTop:'1px solid #e8eaf0',paddingTop:8,lineHeight:1.5}}>
            ⚙️ Score is computed by our Naive Bayes ML model trained on real code samples.
            High AI score means the code shows patterns common in AI-generated output (structured comments, 
            consistent formatting, algorithm explanations) and lacks typical human patterns 
            (debug logs, informal comments, var usage). This is an indicator, not proof.
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// ASSIGNMENTS TAB (real Firebase data)
// ══════════════════════════════════════════════════════════
function TabAssignments({ color, classId, teacherId }) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);
  const [subView, setSubView] = useState('details');
  const [showCreate, setShowCreate] = useState(false);
  const [grading, setGrading] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', dueDate: '', points: 100 });

  const fetchAssignments = useCallback(async () => {
    try {
      const res = await api.get(`/api/assignments/class/${classId}`);
      const data = await res.json();
      setAssignments(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [classId]);

  useEffect(() => { fetchAssignments(); }, [fetchAssignments]);

  // Sync active assignment with fresh data
  useEffect(() => {
    if (active) setActive(prev => assignments.find(a => a.id === prev.id) || prev);
  }, [assignments]);

  const create = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    try {
      const res = await api.post('/api/assignments', { title: form.title, description: form.description, dueDate: form.dueDate, classId, points: Number(form.points) });
      const saved = await res.json();
      if (res.ok) { setAssignments(prev => [saved, ...prev]); setForm({ title:'', description:'', dueDate:'', points:100 }); setShowCreate(false); }
    } catch (e) { console.error(e); }
  };

  const del = async (id) => {
    try {
      await api.del(`/api/assignments/${id}`);
      setAssignments(prev => prev.filter(a => a.id !== id));
      if (active?.id === id) setActive(null);
    } catch (e) { console.error(e); }
  };

  const saveGrade = async (assignmentId, studentId) => {
    setSaving(true);
    try {
      const res = await api.post(`/api/assignments/${assignmentId}/grade/${studentId}`, { score: Number(grading.grade), feedback: grading.feedback });
      if (res.ok) { await fetchAssignments(); setGrading(null); }
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  return (
    <div className="tab-layout">
      <div className="tab-list-col">
        <button className="add-class-button" style={{width:'100%',marginBottom:14}} onClick={() => setShowCreate(true)}>+ New Assignment</button>
        {loading && <div className="tcd-empty"><div style={{fontSize:28,opacity:.4}}>⏳</div><p>Loading…</p></div>}
        {!loading && assignments.length === 0 && <div className="tcd-empty"><div style={{fontSize:36,opacity:.4}}>📋</div><p>No assignments yet</p></div>}
        {assignments.map(a => {
          const graded = (a.submissions||[]).filter(s => s.score !== null).length;
          const flagged = (a.submissions||[]).filter(s => s.aiScore >= 70).length;
          const isActive = active?.id === a.id;
          return (
            <div key={a.id} className={`asgn-card ${isActive?'asgn-card--active':''}`} style={isActive?{borderColor:color}:{}}
              onClick={() => { setActive(a); setSubView('details'); setGrading(null); }}>
              <div className="asgn-card-stripe" style={{background:color}}/>
              <div className="asgn-card-body">
                <div className="asgn-card-title">{a.title}</div>
                <div className="asgn-card-meta">Due {a.dueDate||'—'} · {a.points} pts</div>
                <div className="asgn-card-stats">
                  <span className="asgn-stat-pill asgn-stat-submitted">{(a.submissions||[]).length} submitted</span>
                  <span className="asgn-stat-pill asgn-stat-graded">{graded} graded</span>
                  {flagged > 0 && <span className="asgn-stat-pill" style={{background:'rgba(229,62,62,.1)',color:'#e53e3e'}}>🤖 {flagged} flagged</span>}
                </div>
              </div>
              <button className="asgn-delete-btn" onClick={e=>{e.stopPropagation();del(a.id);}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>
              </button>
            </div>
          );
        })}
      </div>

      <div className="tab-detail-col">
        {!active ? (
          <div className="tcd-empty" style={{flex:1}}><div style={{fontSize:40,opacity:.35}}>📄</div><p style={{fontWeight:700}}>Select an assignment</p><span>Click one on the left to view details or submissions.</span></div>
        ) : (
          <>
            <div className="asgn-tabs">
              <button className={`asgn-tab ${subView==='details'?'active':''}`} onClick={()=>setSubView('details')}>Details</button>
              <button className={`asgn-tab ${subView==='submissions'?'active':''}`} onClick={()=>setSubView('submissions')}>
                Submissions <span className="asgn-tab-count">{(active.submissions||[]).length}</span>
              </button>
            </div>

            {subView === 'details' && (
              <div className="asgn-detail-panel">
                <div className="asgn-detail-header" style={{borderLeft:`4px solid ${color}`}}>
                  <div className="asgn-detail-title">{active.title}</div>
                </div>
                <div className="asgn-detail-grid">
                  <div className="asgn-detail-item"><div className="asgn-detail-label">Due Date</div><div className="asgn-detail-val">{active.dueDate||'—'}</div></div>
                  <div className="asgn-detail-item"><div className="asgn-detail-label">Points</div><div className="asgn-detail-val">{active.points}</div></div>
                  <div className="asgn-detail-item"><div className="asgn-detail-label">Submitted</div><div className="asgn-detail-val">{(active.submissions||[]).length}</div></div>
                  <div className="asgn-detail-item"><div className="asgn-detail-label">Graded</div><div className="asgn-detail-val">{(active.submissions||[]).filter(s=>s.score!==null).length} / {(active.submissions||[]).length}</div></div>
                  <div className="asgn-detail-item"><div className="asgn-detail-label">AI Flagged</div><div className="asgn-detail-val" style={{color:'#e53e3e'}}>{(active.submissions||[]).filter(s=>s.aiScore>=70).length}</div></div>
                </div>
                <div className="asgn-detail-label" style={{marginTop:16,marginBottom:8}}>Instructions</div>
                <div className="asgn-description">{active.description||'No description provided.'}</div>
              </div>
            )}

            {subView === 'submissions' && (
              <div className="asgn-detail-panel">
                {(active.submissions||[]).length === 0 && <div className="tcd-empty"><div style={{fontSize:32,opacity:.4}}>📭</div><p>No submissions yet</p></div>}
                {(active.submissions||[]).map((sub, idx) => {
                  const name = sub.student?.username || sub.student?._id || 'Unknown';
                  const initial = name.charAt(0).toUpperCase();
                  const isGrading = grading?.subIndex === idx;
                  const meta = aiMeta(sub.aiScore);
                  return (
                    <div key={sub.student?._id || idx} className="sub-card">
                      <div className="sub-card-top">
                        <div className="sub-avatar" style={{background:color+'22',color}}>{initial}</div>
                        <div className="sub-info">
                          <div className="sub-name">{name}</div>
                          <div className="sub-meta">
                            Submitted {sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : '—'}
                            {sub.fileName && <> · <b>{sub.fileName}</b></>}
                          </div>
                        </div>
                        <div style={{display:'flex',alignItems:'center',gap:10}}>
                          {/* AI ring */}
                          <AiRing score={sub.aiScore} size={50}/>
                          {/* Grade badge */}
                          <div className="sub-grade-badge" style={{background:sub.score!==null?'#f0fff4':'#fff8ee',color:sub.score!==null?'#38a169':'#e8a040'}}>
                            {sub.score !== null ? `${sub.score}/${active.points}` : 'Ungraded'}
                          </div>
                        </div>
                      </div>

                      {/* AI breakdown */}
                      <AiDetailPanel sub={sub} assignmentPoints={active.points}/>

                      {sub.feedback && !isGrading && <div className="sub-feedback">💬 {sub.feedback}</div>}

                      {isGrading ? (
                        <div className="sub-grade-form">
                          <div style={{display:'flex',gap:8,marginBottom:8}}>
                            <input type="number" className="modal-input" placeholder={`/ ${active.points}`}
                              value={grading.grade} onChange={e=>setGrading(p=>({...p,grade:e.target.value}))} style={{width:120}}/>
                            <input className="modal-input" placeholder="Feedback (optional)"
                              value={grading.feedback} onChange={e=>setGrading(p=>({...p,feedback:e.target.value}))}/>
                          </div>
                          <div style={{display:'flex',gap:8}}>
                            <button className="modal-button-cancel" onClick={()=>setGrading(null)}>Cancel</button>
                            <button className="modal-button-save" disabled={saving} onClick={()=>saveGrade(active.id, sub.student?._id||sub.student)}>
                              {saving?'Saving…':'Save Grade'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button className="sub-grade-btn" onClick={()=>setGrading({subIndex:idx,grade:sub.score??'',feedback:sub.feedback??''})}>
                          {sub.score!==null?'Edit Grade':'Grade'}
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

      {showCreate && (
        <div className="modal-overlay" onClick={()=>setShowCreate(false)}>
          <div className="modal-content" onClick={e=>e.stopPropagation()}>
            <h2>New Assignment</h2>
            <form className="modal-form" onSubmit={create}>
              <label><div className="modal-form-label-text">Title</div><input className="modal-input" placeholder="e.g. Problem Set 4" value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} required/></label>
              <label><div className="modal-form-label-text">Instructions</div><textarea className="modal-input" rows={3} value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} style={{resize:'vertical'}}/></label>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <label><div className="modal-form-label-text">Due Date</div><input type="date" className="modal-input" value={form.dueDate} onChange={e=>setForm(p=>({...p,dueDate:e.target.value}))}/></label>
                <label><div className="modal-form-label-text">Points</div><input type="number" className="modal-input" value={form.points} onChange={e=>setForm(p=>({...p,points:e.target.value}))}/></label>
              </div>
              <div className="modal-actions">
                <button type="button" className="modal-button-cancel" onClick={()=>setShowCreate(false)}>Cancel</button>
                <button type="submit" className="modal-button-save">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// GRADES TAB (real Firebase data + server-computed grades)
// ══════════════════════════════════════════════════════════
function TabGrades({ color, classId }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    api.get(`/api/assignments/class/${classId}/stats`)
      .then(r => r.json()).then(data => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [classId]);

  if (loading) return <div className="tcd-empty" style={{flex:1,marginTop:40}}><div style={{fontSize:32,opacity:.4}}>⏳</div><p>Loading grades…</p></div>;
  if (!stats || stats.totalStudents === 0) return <div className="tcd-empty" style={{flex:1,marginTop:40}}><div style={{fontSize:40,opacity:.35}}>📊</div><p style={{fontWeight:700}}>No students yet</p></div>;

  const { studentGrades = [], totalAssignments, totalStudents, avgSubmissionRate, avgAiScore, flaggedSubmissions } = stats;

  return (
    <div className="grades-layout">
      <div className="grades-table-wrap">
        <div className="grades-summary-strip">
          <div className="grades-summary-item"><span className="grades-summary-num">{totalStudents}</span><span>Students</span></div>
          <div className="grades-summary-item"><span className="grades-summary-num">{totalAssignments}</span><span>Assignments</span></div>
          <div className="grades-summary-item"><span className="grades-summary-num" style={{color}}>{avgSubmissionRate}%</span><span>Avg Submission Rate</span></div>
          {avgAiScore != null && <div className="grades-summary-item"><span className="grades-summary-num" style={{color: avgAiScore>=70?'#e53e3e':'#38a169'}}>{avgAiScore}%</span><span>Avg AI Score</span></div>}
          {flaggedSubmissions > 0 && <div className="grades-summary-item"><span className="grades-summary-num" style={{color:'#e53e3e'}}>{flaggedSubmissions}</span><span>🤖 AI Flagged</span></div>}
        </div>

        <table className="grades-table">
          <thead>
            <tr>
              <th className="grades-th grades-th-student">Student</th>
              <th className="grades-th">Submitted</th>
              <th className="grades-th">AI Score</th>
              <th className="grades-th">Average</th>
            </tr>
          </thead>
          <tbody>
            {studentGrades.map(sg => {
              const lg = sg.pct > 0 && sg.gradedCount > 0 ? letterGrade(sg.pct) : null;
              const aiM = aiMeta(sg.avgAiScore);
              const isSel = selectedStudent?.studentId === sg.studentId;
              return (
                <tr key={sg.studentId} className={`grades-tr ${isSel?'grades-tr--selected':''}`}
                  style={isSel?{background:color+'10'}:{}} onClick={()=>setSelectedStudent(isSel?null:sg)}>
                  <td className="grades-td grades-td-student">
                    <div className="grades-student-row">
                      <div className="sub-avatar" style={{background:color+'22',color,width:32,height:32,fontSize:13}}>{sg.username?.charAt(0)?.toUpperCase()}</div>
                      <span>{sg.username}</span>
                    </div>
                  </td>
                  <td className="grades-td grades-td-grade">{sg.submitted||0} / {sg.totalCount}</td>
                  <td className="grades-td grades-td-grade">
                    {sg.avgAiScore != null
                      ? <span style={{background:aiM.bg,color:aiM.color,padding:'2px 8px',borderRadius:6,fontSize:12,fontWeight:700}}>{aiM.icon} {sg.avgAiScore}%</span>
                      : <span style={{color:'#aaa',fontSize:12}}>—</span>
                    }
                  </td>
                  <td className="grades-td grades-td-avg">
                    {lg ? <div className="grades-avg-row"><span className="grades-avg-pct">{sg.pct}%</span><span className="grades-letter" style={{background:lg.bg,color:lg.color}}>{lg.letter}</span></div>
                        : <span className="grades-cell-empty">No grades</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="grades-hint">Click a student row to view their breakdown</div>
      </div>

      {selectedStudent && (
        <div className="grades-student-panel">
          <div className="grades-panel-header">
            <div className="sub-avatar" style={{width:44,height:44,fontSize:18,background:color+'22',color}}>{selectedStudent.username?.charAt(0)?.toUpperCase()}</div>
            <div><div style={{fontWeight:800,fontSize:16,color:'#1a1f36'}}>{selectedStudent.username}</div><div style={{fontSize:12,color:'#8a8fa8'}}>{selectedStudent.email}</div></div>
          </div>

          {/* AI Score summary */}
          {selectedStudent.avgAiScore != null && (() => {
            const aiM = aiMeta(selectedStudent.avgAiScore);
            return (
              <div style={{background:aiM.bg,border:`1px solid ${aiM.border}`,borderRadius:10,padding:'10px 14px',marginBottom:12,display:'flex',alignItems:'center',gap:10}}>
                <AiRing score={selectedStudent.avgAiScore} size={44}/>
                <div><div style={{fontWeight:700,color:aiM.color,fontSize:14}}>{aiM.icon} {aiM.label}</div><div style={{fontSize:11,color:'#8a8fa8'}}>avg across all submissions</div></div>
              </div>
            );
          })()}

          {selectedStudent.gradedCount > 0 && (() => {
            const lg = letterGrade(selectedStudent.pct);
            return (
              <div className="grades-panel-avg" style={{background:lg.bg}}>
                <div style={{fontSize:36,fontWeight:800,color:lg.color}}>{selectedStudent.pct}%</div>
                <div style={{fontSize:22,fontWeight:800,color:lg.color}}>{lg.letter}</div>
                <div style={{fontSize:12,color:'#8a8fa8',marginTop:4}}>Current Average</div>
              </div>
            );
          })()}

          <div className="grades-panel-list">
            {(selectedStudent.breakdown||[]).map(b => {
              const pct = b.score != null ? Math.round((b.score/b.maxPoints)*100) : null;
              const lg = pct != null ? letterGrade(pct) : null;
              const aiM = aiMeta(b.aiScore);
              return (
                <div key={b.assignmentId} className="grades-panel-row">
                  <div className="grades-panel-row-info">
                    <div className="grades-panel-row-title">{b.title}</div>
                    <div className="grades-panel-row-pts">{b.maxPoints} pts {b.aiScore!=null&&<span style={{color:aiM.color,fontSize:11}}>· {aiM.icon} AI:{b.aiScore}%</span>}</div>
                  </div>
                  <div className="grades-panel-row-grade">
                    {b.score != null
                      ? <><span style={{fontWeight:700,color:'#1a1f36'}}>{b.score}/{b.maxPoints}</span><span className="grades-letter" style={{background:lg.bg,color:lg.color,fontSize:11}}>{lg.letter}</span></>
                      : <span style={{color:'#8a8fa8',fontSize:13}}>{b.submitted?'Ungraded':'Not submitted'}</span>
                    }
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

// ══════════════════════════════════════════════════════════
// STUDENTS TAB (real Firebase data)
// ══════════════════════════════════════════════════════════
function TabStudents({ color, classId }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/api/assignments/class/${classId}/stats`)
      .then(r => r.json()).then(d => { setStats(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [classId]);

  if (loading) return <div className="tcd-empty"><div style={{fontSize:28,opacity:.4}}>⏳</div><p>Loading…</p></div>;
  const students = stats?.studentGrades || [];

  return (
    <div className="students-tab">
      <div className="students-header-row"><div className="students-count">{students.length} enrolled students</div></div>
      <div className="students-list">
        {students.length === 0 && <div className="tcd-empty"><div style={{fontSize:32,opacity:.4}}>👥</div><p>No students yet</p></div>}
        {students.map(s => {
          const aiM = aiMeta(s.avgAiScore);
          const lg = s.gradedCount > 0 ? letterGrade(s.pct) : null;
          return (
            <div key={s.studentId} className="student-row-card">
              <div className="sub-avatar" style={{width:42,height:42,fontSize:16,background:color+'22',color}}>{s.username?.charAt(0)?.toUpperCase()}</div>
              <div className="student-row-info">
                <div className="student-row-name">{s.username}</div>
                <div className="student-row-id">{s.email}</div>
              </div>
              <div style={{display:'flex',gap:10,alignItems:'center'}}>
                {s.avgAiScore != null && <span style={{background:aiM.bg,color:aiM.color,padding:'3px 8px',borderRadius:6,fontSize:12,fontWeight:700}}>{aiM.icon} {s.avgAiScore}%</span>}
                {lg && <span className="grades-letter" style={{background:lg.bg,color:lg.color}}>{lg.letter}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// CALENDAR TAB (kept as-is from original)
// ══════════════════════════════════════════════════════════
const TYPE_META = {
  assignment: { label:'Assignment', color:'#7C6FE0', bg:'#f3f1ff' },
  exam:       { label:'Exam',       color:'#E06F6F', bg:'#fef2f2' },
  quiz:       { label:'Quiz',       color:'#E8A040', bg:'#fff8ee' },
  other:      { label:'Other',      color:'#4FBDBA', bg:'#edfafa' },
};
const uid = () => Math.random().toString(36).slice(2, 8).toUpperCase();

function TabCalendar({ color, assignments }) {
  const [viewDate, setViewDate] = useState(new Date());
  const [events, setEvents] = useState(() =>
    assignments.filter(a=>a.dueDate).map(a => ({ id:'e'+a.id, title: a.title+' Due', date: a.dueDate, type:'assignment' }))
  );
  const [showAdd, setShowAdd] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [form, setForm] = useState({ title:'', type:'assignment', date:'' });

  const vY = viewDate.getFullYear(), vM = viewDate.getMonth();
  const firstDay = new Date(vY,vM,1).getDay();
  const daysInMonth = new Date(vY,vM+1,0).getDate();
  const cells = Array(firstDay).fill(null).concat(Array.from({length:daysInMonth},(_,i)=>i+1));
  const eventsOn = (day) => events.filter(e => { const d=new Date(e.date+'T12:00:00'); return d.getFullYear()===vY&&d.getMonth()===vM&&d.getDate()===day; });
  const isToday = (day) => { const t=new Date(); return t.getFullYear()===vY&&t.getMonth()===vM&&t.getDate()===day; };
  const upcoming = events.filter(e=>new Date(e.date+'T12:00:00')>=new Date()).sort((a,b)=>new Date(a.date)-new Date(b.date)).slice(0,5);

  return (
    <div className="cal-layout">
      <div className="cal-grid-wrap">
        <div className="cal-nav">
          <button className="cal-nav-btn" onClick={()=>setViewDate(new Date(vY,vM-1,1))}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15,18 9,12 15,6"/></svg></button>
          <span className="cal-month-label">{MONTHS[vM]} {vY}</span>
          <button className="cal-nav-btn" onClick={()=>setViewDate(new Date(vY,vM+1,1))}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9,18 15,12 9,6"/></svg></button>
          <button className="add-class-button" style={{marginLeft:'auto',padding:'7px 16px',fontSize:13}} onClick={()=>setShowAdd(true)}>+ Add Event</button>
        </div>
        <div className="cal-day-headers">{WDAYS.map(d=><div key={d} className="cal-day-header">{d}</div>)}</div>
        <div className="cal-grid">
          {cells.map((day,i) => {
            const dayEvs = day?eventsOn(day):[];
            return (
              <div key={i} className={`cal-cell ${day?'cal-cell--active':''} ${isToday(day)?'cal-cell--today':''}`}>
                {day && (<><span className="cal-cell-num">{day}</span>
                  <div className="cal-cell-events">
                    {dayEvs.slice(0,3).map(ev=>(
                      <div key={ev.id} className="cal-event-pill"
                        style={{background:color+'22',color,borderLeft:`3px solid ${color}`}}
                        onClick={e=>{e.stopPropagation();setSelectedEvent(ev);}}>{ev.title}</div>
                    ))}
                    {dayEvs.length>3&&<div className="cal-event-more">+{dayEvs.length-3} more</div>}
                  </div></>)}
              </div>
            );
          })}
        </div>
      </div>
      <div className="cal-sidebar">
        <div className="cal-panel">
          <div className="cal-panel-title">Event Types</div>
          {Object.entries(TYPE_META).map(([k,v])=>(<div key={k} className="cal-legend-row"><div className="cal-legend-dot" style={{background:v.color}}/>{v.label}</div>))}
        </div>
        <div className="cal-panel">
          <div className="cal-panel-title">Upcoming</div>
          {upcoming.length===0&&<div className="cal-empty">Nothing upcoming</div>}
          {upcoming.map(ev=>{const meta=TYPE_META[ev.type]||TYPE_META.other;const d=new Date(ev.date+'T12:00:00');return(<div key={ev.id} className="cal-upcoming-row" onClick={()=>setSelectedEvent(ev)}><div className="cal-upcoming-dot" style={{background:color}}/><div className="cal-upcoming-info"><div className="cal-upcoming-title">{ev.title}</div><div className="cal-upcoming-meta">{d.toLocaleDateString('en-US',{month:'short',day:'numeric'})}</div></div><div className="cal-upcoming-type" style={{background:meta.bg,color:meta.color}}>{meta.label}</div></div>);})}
        </div>
      </div>
      {showAdd&&(<div className="modal-overlay" onClick={()=>setShowAdd(false)}><div className="modal-content" onClick={e=>e.stopPropagation()}><h2>Add Event</h2><form className="modal-form" onSubmit={e=>{e.preventDefault();if(!form.title.trim())return;setEvents(prev=>[...prev,{id:'e'+uid(),...form}]);setShowAdd(false);}}><label><div className="modal-form-label-text">Title</div><input className="modal-input" value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} required/></label><label><div className="modal-form-label-text">Type</div><select className="modal-select" value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))}>{Object.entries(TYPE_META).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}</select></label><label><div className="modal-form-label-text">Date</div><input type="date" className="modal-input" value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))} required/></label><div className="modal-actions"><button type="button" className="modal-button-cancel" onClick={()=>setShowAdd(false)}>Cancel</button><button type="submit" className="modal-button-save">Save</button></div></form></div></div>)}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════
function TCourseDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state || {};
  const className  = state.title      || 'Untitled Class';
  const courseName = state.courseName || '';
  const quarter    = state.quarter    || '';
  const color      = state.color      || '#7C6FE0';
  const classId    = state.classId    || '';
  const teacherId  = localStorage.getItem('userId');

  const [activeTab, setActiveTab] = useState('assignments');
  const [codeCopied, setCodeCopied] = useState(false);
  const [classCode] = useState(state.classCode || '');
  const [assignments, setAssignments] = useState([]);

  // Fetch assignments for calendar
  useEffect(() => {
    if (classId) {
      api.get(`/api/assignments/class/${classId}`)
        .then(r => r.json()).then(d => setAssignments(Array.isArray(d)?d:[]))
        .catch(console.error);
    }
  }, [classId]);

  const handleCopy = () => {
    navigator.clipboard.writeText(classCode).then(() => { setCodeCopied(true); setTimeout(()=>setCodeCopied(false),2000); });
  };

  const tabs = [
    { id:'assignments', label:'Assignments', iconPath:NAV_ICONS.assign },
    { id:'grades',      label:'Grades',      iconPath:NAV_ICONS.grades },
    { id:'calendar',    label:'Calendar',    iconPath:NAV_ICONS.cal    },
    { id:'students',    label:'Students',    iconPath:NAV_ICONS.students },
  ];

  return (
    <div className="teacher-container">
      <aside className="teacher-sidebar">
        <div className="sidebar-logo"><div className="sidebar-logo-icon">🎓</div><span className="sidebar-logo-text">RootedTeach</span></div>
        <Link to="/teacher" className="sidebar-back-btn">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d={NAV_ICONS.back}/></svg>
          All Classes
        </Link>
        <div className="sidebar-class-badge" style={{borderLeft:`4px solid ${color}`}}>
          <div className="sidebar-class-badge-name">{className}</div>
          <div className="sidebar-class-badge-quarter">{quarter}</div>
        </div>
        <div className="sidebar-section-label">Navigation</div>
        <nav className="sidebar-nav">
          {tabs.map(tab=>(
            <button key={tab.id} className={`sidebar-nav-item ${activeTab===tab.id?'active':''}`}
              style={activeTab===tab.id?{borderLeftColor:color}:{}} onClick={()=>setActiveTab(tab.id)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={tab.iconPath}/></svg>
              {tab.label}
            </button>
          ))}
        </nav>
        <div style={{flex:1}}/>
        <button onClick={()=>{localStorage.clear();navigate('/');}} className="sidebar-logout-btn" style={{background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:8,padding:'10px 16px',color:'#8a8fa8',fontSize:13,width:'100%',textAlign:'left'}}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Log Out
        </button>
        <div className="sidebar-profile">
          <div className="sidebar-avatar">T</div>
          <div><div className="sidebar-profile-name">{localStorage.getItem('username')||'Teacher'}</div><div className="sidebar-profile-role">Instructor</div></div>
        </div>
      </aside>

      <main className="teacher-main">
        <div className="tcd-page-header">
          <div className="tcd-header-top">
            <div className="tcd-header-banner" style={{borderLeft:`5px solid ${color}`}}>
              <div className="tcd-class-title">{className}</div>
              {courseName&&<div className="tcd-class-course-name">{courseName}</div>}
              <div className="tcd-class-quarter">{quarter}</div>
            </div>
            <div className="tcd-class-code" onClick={handleCopy} title="Click to copy class code">
              <div className="tcd-class-code-label">Class Code</div>
              <div className="tcd-class-code-value" style={{color}}>{classCode}</div>
              <div className="tcd-class-code-hint">{codeCopied?'✓ Copied!':'Click to copy'}</div>
            </div>
          </div>
          <div className="tcd-tab-bar">
            {tabs.map(tab=>(
              <button key={tab.id} className={`tcd-tab ${activeTab===tab.id?'active':''}`}
                style={activeTab===tab.id?{borderBottomColor:color,color}:{}} onClick={()=>setActiveTab(tab.id)}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="tcd-tab-content">
          {activeTab==='assignments' && <TabAssignments color={color} classId={classId} teacherId={teacherId}/>}
          {activeTab==='grades'      && <TabGrades      color={color} classId={classId}/>}
          {activeTab==='calendar'    && <TabCalendar    color={color} assignments={assignments}/>}
          {activeTab==='students'    && <TabStudents    color={color} classId={classId}/>}
        </div>
      </main>
    </div>
  );
}

export default TCourseDashboard;
