import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import AddStudentsModal from './AddStudentsModal';
import CreateAssignmentModal from './CreateAssignmentModal';
import './ClassPage.css';

const getTextColor = (hexColor) => {
  if (!hexColor) return '#000000';
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness >= 128 ? 'black' : 'white';
};

const ClassPage = () => {
  const location = useLocation();
  const { title, quarter, color, classId } = location.state || {};

  const [isAddStudentsOpen, setIsAddStudentsOpen] = useState(false);
  const [isCreateAssignmentOpen, setIsCreateAssignmentOpen] = useState(false);
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    const fetchAssignments = async () => {
      const res = await fetch(`http://localhost:5001/api/assignments/class/${classId}`);
      const data = await res.json();
      setAssignments(data);
    };
    fetchAssignments();
  }, [classId]);

  if (!title) {
    return (
      <div className="class-page-error">
        <p>No class data was found. <Link to="/teacher-dashboard">Back to Dashboard</Link></p>
      </div>
    );
  }

  const textColor = getTextColor(color);

  return (
    <div className="class-page-container">

      <AddStudentsModal
        isOpen={isAddStudentsOpen}
        onClose={() => setIsAddStudentsOpen(false)}
      />
      <CreateAssignmentModal
        isOpen={isCreateAssignmentOpen}
        onClose={() => setIsCreateAssignmentOpen(false)}
        classId={classId}
      />

      <div
        className="class-page-header"
        style={{ backgroundColor: color, color: textColor }}
      >
        <Link to="/about" className="class-page-back-link" style={{ color: textColor }}>
          ← Back to Dashboard
        </Link>
        <h1>{title}</h1>
        <p>{quarter}</p>
      </div>

      <div className="class-page-body">
        <div className="class-page-actions">
          <button className="class-page-btn" onClick={() => setIsAddStudentsOpen(true)}>
            + Add Students
          </button>
          <button className="class-page-btn" onClick={() => setIsCreateAssignmentOpen(true)}>
            + Create Assignment
          </button>
        </div>

        <h2>Class Information</h2>
        {assignments.length > 0 ? (
          <ul>
            {assignments.map((a) => (
              <li key={a._id}>
                <strong>{a.title}</strong> - Due: {new Date(a.dueDate).toLocaleDateString()}
                <p>{a.description}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No assignments yet.</p>
        )}
      </div>

    </div>
  );
};

export default ClassPage;