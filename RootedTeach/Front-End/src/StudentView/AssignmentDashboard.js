import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import './AssignmentDashboard.css';

const DEFAULT_COURSE = { code: 'CS 35L', name: 'Software Construction', prof: 'Eggert' };

const INITIAL_ASSIGNMENTS = [
  {
    id: 1,
    title: 'Assignment 1',
    due: '2025-11-05 23:59',
    points: 100,
    type: 'Submit the file',
    status: 'submitted',
    desc: 'Description',
    requirements: '1. requirement 1\n2. requirement 2\n3. requirement 3',
    submittedFile: 'assignment1_NAME.py',
    submittedAt: '2025-11-04 20:31',
  },
  {
    id: 2,
    title: 'Assignment 2',
    due: '2025-11-19 23:59',
    points: 100,
    type: 'Submit the file',
    status: 'submitted',
    desc: 'Description',
    requirements: '1. requirement 1\n2. requirement 2\n3. requirement 3',
    submittedFile: 'assignment2_NAME.py',
    submittedAt: '2025-11-18 15:44',
  },
  {
    id: 3,
    title: 'Assignment 3',
    due: '2025-11-28 23:59',
    points: 100,
    type: 'Submit the file',
    status: 'pending',
    desc: 'Description',
    requirements: '1. requirement 1\n2. requirement 2\n3. requirement 3',
  },
  {
    id: 4,
    title: 'Quiz 1',
    due: '2025-11-10 14:00',
    points: 50,
    type: 'Online Test',
    status: 'submitted',
    desc: 'Description',
    requirements: 'Time Limit: 60분, Open Book',
    submittedFile: 'Submitted',
    submittedAt: '2025-11-10 13:55',
  },
  {
    id: 5,
    title: 'Final Project',
    due: '2025-12-20 23:59',
    points: 200,
    type: 'Submit the file',
    status: 'pending',
    desc: 'Description',
    requirements: '1. requirement 1\n2. requirement 2\n3. requirement 3\n4. requirement 4',
  },
];

function getDaysLeft(due) {
  const d = new Date(due) - new Date();
  const days = Math.ceil(d / 86400000);
  if (days < 0) return 'closed';
  if (days === 0) return 'Due today';
  return `${days}day left`;
}

function AssignmentDashboard() {
  const navigate = useNavigate();
  const course = (() => {
    try { return JSON.parse(localStorage.getItem('currentCourse')) || DEFAULT_COURSE; }
    catch { return DEFAULT_COURSE; }
  })();

  const [assignments, setAssignments] = useState(INITIAL_ASSIGNMENTS);
  const [selectedId, setSelectedId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [file, setFile] = useState(null);
  const [comment, setComment] = useState('');
  const [toast, setToast] = useState('');

  const filtered = assignments.filter((a) => {
    if (filter === 'pending') return a.status === 'pending';
    if (filter === 'submitted') return a.status === 'submitted';
    return true;
  });

  const sel = assignments.find((a) => a.id === selectedId) || null;

  function handleFileChange(e) {
    if (e.target.files[0]) setFile(e.target.files[0]);
  }

  function handleSubmit() {
    if (!file && sel.type === 'Submit the file') {
      alert('Select the file');
      return;
    }
    const now = new Date().toLocaleString('ko-KR');
    setAssignments((prev) =>
      prev.map((a) =>
        a.id === sel.id
          ? { ...a, status: 'submitted', submittedFile: file ? file.name : 'Submitted', submittedAt: now }
          : a
      )
    );
    setFile(null);
    setComment('');
    setToast('Submitted successfully');
    setTimeout(() => setToast(''), 3000);
  }

  function handlePageChange(p) {
    if (p === 'assignments') return;
    navigate('/course');
  }

  const currentSel = assignments.find((a) => a.id === selectedId) || null;

  return (
    <div className="app-layout">
      <Sidebar
        course={course}
        activePage="assignments"
        onPageChange={(p) => {
          if (p !== 'assignment') navigate('/course');
        }}
      />

      <div className="assign-main">
        {/* Left: list */}
        <div className="assign-list-panel">
          <div className="panel-header">
            <h2>📝 Assignments</h2>
            <p>
              {assignments.length} assignments · {assignments.filter((a) => a.status === 'submitted').length} assignments subbmitted
            </p>
          </div>
          <div className="filter-tabs">
            {['all', 'pending', 'submitted'].map((f) => (
              <button
                key={f}
                className={`filter-tab ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? '전체' : f === 'pending' ? '미제출' : '제출 완료'}
              </button>
            ))}
          </div>
          <div className="assign-list">
            {filtered.map((a) => (
              <div
                key={a.id}
                className={`assign-item ${currentSel?.id === a.id ? 'selected' : ''}`}
                onClick={() => setSelectedId(a.id)}
              >
                <div className="assign-item-top">
                  <div className="assign-title">{a.title}</div>
                  <span className={`status-pill ${a.status}`}>
                    {a.status === 'submitted' ? 'Submitted' : 'not submitted'}
                  </span>
                </div>
                <div className="assign-item-meta">
                  <span>📅 {a.due.split(' ')[0]}</span>
                  <span>🏆 {a.points}점</span>
                  {a.status === 'pending' && (
                    <span
                      style={{
                        color:
                          getDaysLeft(a.due) === 'closed'
                            ? 'var(--danger)'
                            : getDaysLeft(a.due) === 'Due today'
                            ? 'var(--warning)'
                            : 'var(--muted)',
                      }}
                    >
                      ⏰ {getDaysLeft(a.due)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: detail */}
        <div className="assign-detail-panel">
          {!currentSel ? (
            <div className="empty-detail">
              <div style={{ fontSize: '3rem' }}>📄</div>
              <div style={{ fontSize: '1rem', fontWeight: 600 }}>과제를 선택하세요</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                If you cleck the assignment, you can see the details
              </div>
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
                <div className="meta-chip">🏆 Grade <b>{currentSel.points}</b></div>
                <div className="meta-chip">📎 Type <b>{currentSel.type}</b></div>
                {currentSel.status === 'pending' && (
                  <div
                    className="meta-chip"
                    style={{
                      color:
                        getDaysLeft(currentSel.due) === 'Closed'
                          ? 'var(--danger)'
                          : getDaysLeft(currentSel.due) === 'Due today'
                          ? 'var(--warning)'
                          : 'var(--muted)',
                    }}
                  >
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
                    ✅ <div><b>Submitted at {currentSel.submittedAt}</b> · <b>{currentSel.submittedFile}</b></div>
                  </div>
                )}

                {currentSel.type === '파일 제출' && (
                  <div className="file-drop">
                    <input type="file" onChange={handleFileChange} />
                    <div className="file-drop-icon">📂</div>
                    <div className="file-drop-text">
                      Drag a file or <b>click to select</b>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: 6 }}>
                      PDF, ZIP, PY, JAVA, CPP 등
                    </div>
                  </div>
                )}

                {file && (
                  <div className="selected-file">
                    📎 {file.name}
                    <span style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                    <button onClick={() => setFile(null)}>✕</button>
                  </div>
                )}

                <textarea
                  className="text-area"
                  placeholder="Comments"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />

                <button
                  className={`submit-btn ${currentSel.status === 'submitted' ? 'resubmit' : ''}`}
                  onClick={handleSubmit}
                >
                  {currentSel.status === 'submitted' ? '🔄 Resubmit' : '📤 Submit'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {toast && <div className="toast"> {toast}</div>}
    </div>
  );
}

export default AssignmentDashboard;