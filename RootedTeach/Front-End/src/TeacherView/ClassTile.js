import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './ClassTile.css';

const getTextColor = (hexColor) => {
  if (!hexColor) return '#000000';
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness >= 128 ? 'black' : 'white';
};

const ClassTile = ({ title, quarter, color, onDelete, onEdit }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const textColor = getTextColor(color);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen((prev) => !prev);
  };

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen(false);
    onDelete();
  };

  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen(false);
    onEdit();
  };

  return (
    <Link
      to="/class"
      state={{ title, quarter, color }}
      className="class-tile-link"
    >
      <div className="class-tile">
        <div
          className="class-tile-header"
          style={{ backgroundColor: color || '#B3F5FF' }}
        >
          {/* Three-dot button */}
          <button
            className="class-tile-menu-btn"
            onClick={handleMenuClick}
            style={{ color: textColor }}
          >
            ⋯
          </button>

          {/* Dropdown */}
          {menuOpen && (
            <div className="class-tile-dropdown" ref={menuRef}>
              <button onClick={handleEdit}>Edit</button>
              <button className="delete" onClick={handleDelete}>Delete</button>
            </div>
          )}

          <h3 style={{ color: textColor }}>{title}</h3>
          <p style={{ color: textColor }}>{quarter}</p>
        </div>
        <div className="class-tile-body" />
      </div>
    </Link>
  );
};

export default ClassTile;