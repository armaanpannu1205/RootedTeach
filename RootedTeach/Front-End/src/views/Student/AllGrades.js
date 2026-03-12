import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar, { COURSE_COLORS } from '../../components/Sidebar/Sidebar';
import './StudentDashboard.css';
import './AllGrades.css';

const SAMPLE_COURSES = [
  { id: 'cs35l',   code: 'CS 35L',   name: 'Software Construction',                    prof: 'Eggert',  color: 0, assignments: 5, upcoming: 1 },
  { id: 'math161', code: 'MATH 161', name: 'Applied Numerical Methods',                 prof: 'Clifton', color: 1, assignments: 5, upcoming: 2 },
  { id: 'cs180',   code: 'CS 180',   name: 'Introduction to Algorithms and Complexity', prof: 'Park',    color: 2, assignments: 2, upcoming: 0 },
];

// ✅ CHANGE 2: grade data for each course
const COURSE_GRADE_DATA = {
  'cs35l': {
    letterGrade: 'A',
    gpa: 91.0,
    completed: 3,
    total: 5,
    items: [
      { name: 'Assignment 1', type: 'Assignment', weight: '10%', score: 92,  max: 100 },
      { name: 'Assignment 2', type: 'Assignment', weight: '10%', score: 88,  max: 100 },
      { name: 'Quiz 1',       type: 'Quiz',       weight: '5%',  score: 45,  max: 50  },
      { name: 'Assignment 3', type: 'Assignment', weight: '10%', score: null, max: 100 },
      { name: 'Final Project',type: 'Project',    weight: '35%', score: null, max: 200 },
    ],
  },
  'math161': {
    letterGrade: 'B+',
    gpa: 87.5,
    completed: 2,
    total: 5,
    items: [
      { name: 'HW 1',       type: 'Assignment', weight: '10%', score: 47,  max: 50  },
      { name: 'HW 2',       type: 'Assignment', weight: '10%', score: 43,  max: 50  },
      { name: 'HW 3',       type: 'Assignment', weight: '10%', score: null, max: 50  },
      { name: 'Midterm',    type: 'Exam',       weight: '30%', score: null, max: 150 },
      { name: 'Final Exam', type: 'Exam',       weight: '40%', score: null, max: 200 },
    ],
  },
  'cs180': {
    letterGrade: 'A-',
    gpa: 91.0,
    completed: 1,
    total: 2,
    items: [
      { name: 'HW 1',               type: 'Assignment', weight: '30%', score: 76, max: 80  },
      { name: 'Project Checkpoint', type: 'Project',    weight: '70%', score: null, max: 100 },
    ],
  },
};

// ── SVG Donut Chart ──────────────────────────────────────────────────────────
function DonutChart({ percent, color, size = 100, stroke = 12 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (percent / 100) * circ;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
      {/* track */}
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke="rgba(26,26,46,0.08)"
        strokeWidth={stroke}
      />
      {/* fill */}
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        style={{ transition: 'stroke-dasharray 0.6s cubic-bezier(0.4,0,0.2,1)' }}
      />
    </svg>
  );
}

// ── Grade letter → colour ────────────────────────────────────────────────────
function gradeColor(letter) {
  if (letter.startsWith('A')) return '#2ecc8b';
  if (letter.startsWith('B')) return '#4facfe';
  if (letter.startsWith('C')) return '#f0a500';
  return '#e05f5f';
}

function AllGrades() {
  const navigate = useNavigate();
  const [courses] = useState(() => {
    try {
      const saved = localStorage.getItem('courses');
      return saved ? JSON.parse(saved) : SAMPLE_COURSES;
    } catch { return SAMPLE_COURSES; }
  });

  const [expanded, setExpanded] = useState(null); // courseId of open detail panel

  // Weighted overall GPA across all courses (simple average here)
  const allGpa = courses
    .map(c => COURSE_GRADE_DATA[c.id]?.gpa ?? 0)
    .reduce((a, b) => a + b, 0) / courses.length;

  function openCourse(c) {
    localStorage.setItem('currentCourse', JSON.stringify(c));
    navigate('/course');
  }

  return (
    <div className="app-layout">
      <Sidebar courses={courses} activePage="grades" />

      <div className="main">
        <div className="topbar">
          <div>
            <h1>Grades</h1>
            <p className="greeting">
              Overall average: <strong>{allGpa.toFixed(1)}</strong>
            </p>
          </div>
        </div>

        {/* ── Top summary strip ── */}
        <div className="stats-row" style={{ marginBottom: 36 }}>
          <div className="stat-card">
            <div className="stat-val">{courses.length}</div>
            <div className="stat-label">Enrolled courses</div>
          </div>
          <div className="stat-card">
            <div className="stat-val">
              {courses.reduce((s, c) => s + (COURSE_GRADE_DATA[c.id]?.completed ?? 0), 0)}
            </div>
            <div className="stat-label">Graded items</div>
          </div>
          <div className="stat-card">
            <div className="stat-val">{allGpa.toFixed(1)}</div>
            <div className="stat-label">Avg score</div>
          </div>
        </div>

        {/* ── Course grade cards grid ── */}
        <div className="section-title">Course Overview</div>
        <div className="grades-grid">
          {courses.map((c) => {
            const data = COURSE_GRADE_DATA[c.id];
            if (!data) return null;
            const accent = COURSE_COLORS[c.color % COURSE_COLORS.length].accent;
            const pct    = Math.round((data.completed / data.total) * 100);
            const lColor = gradeColor(data.letterGrade);
            const isOpen = expanded === c.id;

            return (
              <div className="grade-course-card" key={c.id}>
                {/* ── Card header strip ── */}
                <div
                  className="gcc-header"
                  style={{ background: COURSE_COLORS[c.color % COURSE_COLORS.length].gradient }}
                >
                  <div>
                    <div className="gcc-code">{c.code}</div>
                    <div className="gcc-name">{c.name}</div>
                  </div>
                </div>

                {/* ── Donut + grade ── */}
                <div className="gcc-body">
                  <div className="gcc-donut-wrap">
                    <DonutChart percent={data.gpa} color={lColor} size={96} stroke={10} />
                    <div className="gcc-donut-label">
                      <div className="gcc-letter" style={{ color: lColor }}>{data.letterGrade}</div>
                      <div className="gcc-gpa">{data.gpa}</div>
                    </div>
                  </div>

                  <div className="gcc-info">
                    <div className="gcc-prof">Prof. {c.prof}</div>
                    <div className="gcc-progress-label">
                      Progress · {data.completed}/{data.total} graded
                    </div>
                    <div className="progress-bar-bg">
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${pct}%`,
                          background: accent,
                        }}
                      />
                    </div>
                    <div className="gcc-actions">
                      <button
                        className="gcc-btn-detail"
                        onClick={() => setExpanded(isOpen ? null : c.id)}
                      >
                        {isOpen ? 'Hide details ▲' : 'Show details ▼'}
                      </button>
                      <button
                        className="gcc-btn-course"
                        style={{ background: accent }}
                        onClick={() => openCourse(c)}
                      >
                        Go to course →
                      </button>
                    </div>
                  </div>
                </div>

                {isOpen && (
                  <div className="gcc-detail">
                    <table className="gcc-table">
                      <thead>
                        <tr>
                          <th>Item</th>
                          <th>Type</th>
                          <th>Weight</th>
                          <th>Score</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.items.map((item) => (
                          <tr key={item.name}>
                            <td>{item.name}</td>
                            <td style={{ color: 'var(--muted)' }}>{item.type}</td>
                            <td>{item.weight}</td>
                            <td>
                              {item.score !== null
                                ? `${item.score} / ${item.max}`
                                : '—'}
                            </td>
                            <td>
                              {item.score !== null
                                ? <span className="grade-pill done">Graded</span>
                                : <span className="grade-pill pending">Pending</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default AllGrades;