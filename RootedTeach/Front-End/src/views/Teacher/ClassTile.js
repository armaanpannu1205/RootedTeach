/* This displays a single class card with a colored header, course info
   and a dropdown menu for edit and delete actions. */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ClassTile.css';

function ClassTile({ title, courseName, quarter, color, classId, classCode, onDelete, onEdit }) {
  // Controls the visibility of the dot dropdown menu
  const [menuOpen, setMenuOpen] = useState(false); 
  const navigate = useNavigate();

  // Navigate to the class page, passing all relevant class data via route state so the next page doesn't have to re-fetch it
  const handleTileClick = () => {
    navigate('/class', { state: { title, courseName, quarter, color, classId, classCode } });
  };

  // Toggle dropdown menu without triggering the tile's main click event
  const handleMenuClick = (e) => {
    e.stopPropagation();
    setMenuOpen(prev => !prev);
  };
  
  // Close menu and trigger the parent's onEdit callback
  const handleEdit = (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    if (onEdit) onEdit();
  };

  // Close menu and trigger the parent's onDelete callback
  const handleDelete = (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    if (onDelete) onDelete();
  };

  return (
    <div className="class-tile" onClick={handleTileClick}>
      <div className="class-tile-header" style={{ background: color || '#764ba2' }}>
        <button className="class-tile-menu-btn" onClick={handleMenuClick}>⋯</button>
        {menuOpen && (
          <div className="class-tile-dropdown" onClick={e => e.stopPropagation()}>
            <button onClick={handleEdit}>Edit</button>
            <button className="delete" onClick={handleDelete}>Delete</button>
          </div>
        )}
        <h3>{title}</h3>
      </div>
      <div className="class-tile-body">
        {courseName ? (
          <div className="class-tile-course-name">{courseName}</div>
        ) : (
          <div className="class-tile-course-name class-tile-course-name--empty">No course name</div>
        )}
        <div className="class-tile-quarter">{quarter}</div>
      </div>
    </div>
  );
}

export default ClassTile;