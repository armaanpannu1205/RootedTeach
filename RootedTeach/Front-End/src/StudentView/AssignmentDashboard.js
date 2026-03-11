import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import './AssignmentDashboard.css';

const DEFAULT_COURSE = { code: 'CS 35L', name: 'Software Construction', prof: 'Eggert' };

/*
const INITIAL_ASSIGNMENTS = [
    { id: 1,
     title: 'Assignment 1',
     due: '2025-11-05 23:59',
     points: 100,
     type: 'Submit the file',
     status: 'submitted',
     desc: 'Description',
     requirements: '1. requirement 1\n2. requirement 2\n3. requirement 3',
     submittedFile: 'assignment1_NAME.py',
     submittedAt: '2025-11-04 20:31',
     grade: 92,
     feddback: 'Great' },
  
    { id: 2,
     title: 'Assignment 2',
     due: '2025-11-19 23:59',
     points: 100,
     type: 'Submit the file',
     status: 'submitted',
     desc: 'Description',
     requirements: '1. requirement 1\n2. requirement 2\n3. requirement 3',
     submittedFile: 'assignment2_NAME.py',
     submittedAt: '2025-11-18 15:44',
     grade: 88,
     feedback: 'Good' },
  
    { id: 3,
     title: 'Assignment 3',
     due: '2025-11-28 23:59',
     points: 100,
     type: 'Submit the file',
     status: 'pending',
     desc: 'Description',
     requirements: '1. requirement 1\n2. requirement 2\n3. requirement 3' },
  
    { id: 4,
     title: 'Quiz 1',
     due: '2025-11-10 14:00',
     points: 50,
     type: 'Online Test',
     status: 'submitted',
     desc: 'Description',
     requirements: 'Time Limit: 60min, Open Book',
     submittedFile: 'Submitted',
     submittedAt: '2025-11-10 13:55' },
    
    { id: 5,
     title: 'Final Project',
     due: '2025-12-20 23:59',
     points: 200,
     type: 'Submit the file',
     status: 'pending',
     desc: 'Description',
     requirements: '1. requirement 1\n2. requirement 2\n3. requirement 3\n4. requirement 4' },
];
*/

function getDaysLeft(due) {
  const d = new Date(due) - new Date();
  const days = Math.ceil(d / 86400000);
  if (days < 0) return 'closed';
  if (days === 0) return 'Due today';
  return `${days} day left`;
}

function AssignmentDashboard() {
  const navigate = useNavigate();
  const course = (() => {
    try { return JSON.parse(localStorage.getItem('currentCourse')) || DEFAULT_COURSE; }
    catch { return DEFAULT_COURSE; }
  })();

  const [assignments, setAssignments] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [file, setFile] = useState(null);
  const [comment, setComment] = useState('');
  const [toast, setToast] = useState('');
  const [aiResult, setAiResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const studentId = localStorage.getItem('userId');
        const classId = course.id;
        const res = await fetch(`http://localhost:5000/api/assignments/class/${classId}`);
        const data = await res.json();
        const mapped = data.map(a => {
          const submission = a.submissions?.find(s => s.student?._id === studentId);
          return {
            id: a.id,
            title: a.title,
            due: a.dueDate ? new Date(a.dueDate).toLocaleString() : 'No due date',
            points: a.points || 100,
            type: 'Submit the file',
            status: submission ? 'submitted' : 'pending',
            desc: a.description || '',
            requirements: '',
            submittedFile: submission?.fileName || null,
            submittedAt: submission?.submittedAt || null,
          };
        });
        setAssignments(mapped);
      } catch (err) {
        console.error('Failed to fetch assignments:', err);
      }
    };
    fetchAssignments();
  }, [course.id]);

  const filtered = assignments.filter((a) => {
    if (filter === 'pending') return a.status === 'pending';
    if (filter === 'submitted') return a.status === 'submitted';
    return true;
  });

  const currentSel = assignments.find((a) => a.id === selectedId) || null;

  function handleFileChange(e) {
    if (e.target.files[0])
      setFile(e.target.files[0]);
  }

  function handleSubmit() {
    if (!currentSel) return;
    if (!file && currentSel.type === 'Submit the file') {
      alert('Please select a file first.');
      return;
    }
    const now = new Date().toLocaleString();
    setAssignments((prev) =>
      prev.map((a) =>
        a.id === currentSel.id
          ? { ...a, status: 'submitted', submittedFile: file ? file.name : 'Submitted', submittedAt: now }
          : a
      )
    );
    setFile(null);
    setComment('');
    setToast('Submitted successfully!');
    setTimeout(() => setToast(''), 3000);
  }

  return (
    <div className="app-layout">
      <Sidebar
        course={course}
        activePage="assignments"
        onPageChange={(p) => { if (p !== 'assignment') navigate('/course'); }}
      />

      <div className="assign-main">
        <div className="assign-list-panel">
          <div className="panel-header">
            <h2>📝 Assignments</h2>
            <p>{assignments.length} assignments · {assignments.filter(a => a.status === 'submitted').length} submitted</p>
          </div>
          <div className="filter-tabs">
            {['all', 'pending', 'submitted'].map((f) => (
              <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                {f === 'all' ? 'All' : f === 'pending' ? 'Pending' : 'Submitted'}
              </button>
            ))}
          </div>
          <div className="assign-list">
            {filtered.map((a) => (
              <div
                key={a.id}
                className={`assign-item ${currentSel?.id === a.id ? 'selected' : ''}`}
                onClick={() => { setSelectedId(a.id); setAiResult(null); }}
              >
                <div className="assign-item-top">
                  <div className="assign-title">{a.title}</div>
                  <span className={`status-pill ${a.status}`}>
                    {a.status === 'submitted' ? 'Submitted' : 'Not submitted'}
                  </span>
                </div>
                <div className="assign-item-meta">
                  <span>📅 {a.due.split(' ')[0]}</span>
                  <span>🏆 {a.points} pts</span>
                  {a.status === 'pending' && (
                    <span style={{ color: getDaysLeft(a.due) === 'closed' ? 'var(--danger)' : getDaysLeft(a.due) === 'Due today' ? 'var(--warning)' : 'var(--muted)' }}>
                      ⏰ {getDaysLeft(a.due)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="assign-detail-panel">
          {!currentSel ? (
            <div className="empty-detail">
              <div style={{ fontSize: '3rem' }}>📄</div>
              <div style={{ fontSize: '1rem', fontWeight: 600 }}>Select an assignment</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Click an assignment to see details</div>
            </div>
          ) : (
            <>
              <div className="detail-top">
                <div className="detail-title">{currentSel.title}</div>
                <span className={`status-pill ${currentSel.status}`} style={{ fontSize: '0.8rem', padding: '5px 14px' }}>
                  {currentSel.status === 'submitted' ? '✅ Submitted' : '⏳ Not submitted'}
                </span>
              </div>

              <div className="detail-meta">
                <div className="meta-chip">📅 Due <b>{currentSel.due}</b></div>
                <div className="meta-chip">🏆 Points <b>{currentSel.points}</b></div>
                <div className="meta-chip">📎 Type <b>{currentSel.type}</b></div>
                {currentSel.status === 'pending' && (
                  <div className="meta-chip" style={{ color: getDaysLeft(currentSel.due) === 'closed' ? 'var(--danger)' : getDaysLeft(currentSel.due) === 'Due today' ? 'var(--warning)' : 'var(--muted)' }}>
                    ⏰ <b>{getDaysLeft(currentSel.due)}</b>
                  </div>
                )}
              </div>

              <div className="description-box">
                <h4>Description</h4>
                <p>{currentSel.desc}</p>
              </div>

              {currentSel.requirements && (
                <div className="description-box">
                  <h4>Rubric</h4>
                  <p style={{ whiteSpace: 'pre-line' }}>{currentSel.requirements}</p>
                </div>
              )}

              <div className="divider" />

              <div className="submit-section">
                <h4>Submission</h4>

                {currentSel.status === 'submitted' && (
                  <div className="submitted-banner">
                    ✅
                    <div><b>Submitted at {currentSel.submittedAt}</b> · <b>{currentSel.submittedFile}</b></div>
                  </div>
                )}

                {currentSel.type === 'Submit the file' && (
                  <div className="file-drop">
                    <input type="file" accept=".js,.py,.java,.cpp,.c,.ts,.cs,.go,.rb" onChange={handleFileChange} />
                    <div className="file-drop-icon">📂</div>
                    <div className="file-drop-text">Drag a file or <b>click to select</b></div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: 6 }}>
                      .js .py .java .cpp .ts .cs .go .rb accepted
                    </div>
                  </div>
                )}

                {file && (
                  <div className="selected-file">
                    📎 {file.name}
                    <span style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>({(file.size / 1024).toFixed(1)} KB)</span>
                    <button onClick={() => { setFile(null); setAiResult(null); }}>✕</button>
                  </div>
                )}

                <textarea
                  className="text-area"
                  placeholder="Comments (optional)"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />

                {/* AI Detection Result */}
                {analyzing && (
                  <div style={{ padding: '12px 16px', background: 'rgba(26,26,46,0.05)', borderRadius: '10px', marginBottom: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    🔍 Analyzing code for AI detection...
                  </div>
                )}

                {aiResult && (
                  <div style={{
                    padding: '16px 18px',
                    borderRadius: '10px',
                    marginBottom: '16px',
                    background: aiResult.score >= 60 ? 'rgba(224, 95, 95, 0.1)' : 'rgba(46, 204, 139, 0.1)',
                    border: `1px solid ${aiResult.score >= 60 ? 'rgba(224, 95, 95, 0.3)' : 'rgba(46, 204, 139, 0.3)'}`,
                  }}>
                    <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>
                      {aiResult.score >= 60 ? '⚠️ Likely AI-written' : '✅ Likely Human-written'}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                      AI Score: <b>{aiResult.score}%</b> — {aiResult.score >= 60 ? 'This submission may have been AI-generated.' : 'This submission appears to be human-written.'}
                    </div>
                    <div style={{ height: '8px', background: 'rgba(26,26,46,0.1)', borderRadius: '100px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${aiResult.score}%`,
                        background: aiResult.score >= 40 ? '#e05f5f' : '#2ecc8b',
                        borderRadius: '100px',
                        transition: 'width 0.8s ease',
                      }} />
                    </div>
                  </div>
                )}

                <button
                  className={`submit-btn ${currentSel.status === 'submitted' ? 'resubmit' : ''}`}
                  onClick={handleSubmit}
                  disabled={analyzing}
                  style={{ opacity: analyzing ? 0.6 : 1 }}
                >
                  {analyzing ? '⏳ Analyzing...' : currentSel.status === 'submitted' ? '🔄 Resubmit' : '📤 Submit'}
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