import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar, { COURSE_COLORS } from '../../components/Sidebar/Sidebar';
import './StudentDashboard.css';
import './AllGrades.css';

// Fallback dummy data in case the API or localStorage fails to provide real courses
const SAMPLE_COURSES = [
  { id: 'cs35l',   code: 'CS 35L',   name: 'Software Construction',                    prof: 'Eggert',  color: 0, assignments: 5, upcoming: 1 },
  { id: 'math161', code: 'MATH 161', name: 'Applied Numerical Methods',                 prof: 'Clifton', color: 1, assignments: 5, upcoming: 2 },
  { id: 'cs180',   code: 'CS 180',   name: 'Introduction to Algorithms and Complexity', prof: 'Park',    color: 2, assignments: 2, upcoming: 0 },
];

// Hardcoded grade data for the sample courses (TODO: Replace this with real API data later)
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

// Reusable SVG donut chart component to visualize the student's current grade percentage
function DonutChart({ percent, color, size = 100, stroke = 12 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (percent / 100) * circ;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
      {/* Subtle background ring */}
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke="rgba(26,26,46,0.08)"
        strokeWidth={stroke}
      />
      {/* Foreground progress ring with a smooth CSS transition */}
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

// Map standard letter grades to our UI color palette
function gradeColor(letter) {
  if (letter.startsWith('A')) return '#2ecc8b'; // Green for excellent
  if (letter.startsWith('B')) return '#4facfe'; // Blue for good
  if (letter.startsWith('C')) return '#f0a500'; // Orange/Yellow for warning
  return '#e05f5f'; // Red for danger/failing
}

function AllGrades() {
  const navigate = useNavigate();
  
  // Try to load cached courses from localStorage, fallback to dummy data if missing
  const [courses] = useState(() => {
    try {
      const saved = localStorage.getItem('courses');
      return saved ? JSON.parse(saved) : SAMPLE_COURSES;
    } catch { return SAMPLE_COURSES; }
  });

  // Keep track of which course card has its detailed breakdown table expanded
  const [expanded, setExpanded] = useState(null);

  // Calculate the average GPA across all courses
  // Note: This is a simple average, not weighted by course units yet
  const allGpa = courses
    .map(c => COURSE_GRADE_DATA[c.id]?.gpa ?? 0)
    .reduce((a, b) => a + b, 0) / courses.length;

  // Save the selected course to context/localStorage before routing to its specific dashboard
  function openCourse(c) {
    localStorage.setItem('currentCourse', JSON.stringify(c));
    navigate('/course');
  }

  return (
    <div className="app-layout">
      {/* Main sidebar navigation */}
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

        {/* Top-level summary statistics cards */}
        <div className="stats-row" style={{ marginBottom: 36 }}>
          <div className="stat-card">
            <div className="stat-val">{courses.length}</div>
            <div className="stat-label">Enrolled courses</div>
          </div>
          <div className="stat-card">
            {/* Calculate total number of graded assignments across all enrolled courses */}
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

        <div className="section-title">Course Overview</div>
        <div className="grades-grid">
          {courses.map((c) => {
            const data = COURSE_GRADE_DATA[c.id];
            // Skip rendering if we don't have grade data for this course
            if (!data) return null;
            
            // Map the course color index to our standard theme colors
            const accent = COURSE_COLORS[c.color % COURSE_COLORS.length].accent;
            
            // Calculate progress percentage based on how many items have been graded vs total
            const pct    = Math.round((data.completed / data.total) * 100);
            const lColor = gradeColor(data.letterGrade);
            const isOpen = expanded === c.id;

            return (
              <div className="grade-course-card" key={c.id}>
                {/* Course Header Banner */}
                <div
                  className="gcc-header"
                  style={{ background: COURSE_COLORS[c.color % COURSE_COLORS.length].gradient }}
                >
                  <div>
                    <div className="gcc-code">{c.code}</div>
                    <div className="gcc-name">{c.name}</div>
                  </div>
                </div>

                {/* Course Grade Summary Body */}
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
                    {/* Linear progress bar indicating course completion */}
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
                      {/* Toggle the detailed breakdown table */}
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

                {/* Expanded Detailed Grade Table (Only visible if isOpen is true) */}
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
                              {/* Display score if graded, otherwise show a dash */}
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