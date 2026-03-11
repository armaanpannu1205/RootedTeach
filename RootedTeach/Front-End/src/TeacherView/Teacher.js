// import React, { useState } from 'react'
// function Teacher({ teacher }) {

//   const [classes, setClasses] = useState(["English", "Math", "Science"]);
//   const [newClass, setNewClass] = useState("");

//   function handleInputChange(event){ //text box to type Class Name
//     setNewClass(event.target.value);
//   }

//   function addClass(){

//     if(newClass.trim() !== ""){
//       setClasses(c =>[...c, newClass]);
//       setNewClass("");
//     }

//   }

//   function deleteClass(index){
//     const updatedClass = classes.filter((_, i) => i !== index);
//     setClasses(updatedClass);
//   }

//     return (
//     <div className="teacher">

//       <h1>Teacher Page</h1>

//       <div> 
//         <input
//           type="text"
//           placeholder="Add Class"
//           value={newClass}
//           onChange={handleInputChange}/>
//           <button
//             className="add-button"
//             onClick={addClass}>
//             Add 
//           </button>
//       </div> 

//       <ol>
//         {classes.map((classes, index) => 
//           <li key={index}>
//             <button className="text">
//               {classes}

//             </button>
//             <button
//               className="delete-button"
//               onClick={() => deleteClass(index)}>
//               Delete
//             </button>
          

//           </li>
//         )}
//       </ol>



//     </div>);
//   }
  
//   export default Teacher; 


import React, { useState, useEffect} from 'react';
import ClassTile from './ClassTile.js';
import AddClassModal from './AddClassModal';
import './Teacher.css';

function Teacher() {
  const [classes, setClasses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const teacherId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchClasses = async () => {
      const res = await fetch('http://localhost:5001/api/classes');
      const data = await res.json();
      setClasses(data);
    };
    fetchClasses();
  }, []);

  const handleAddClass = async (newClass) => {
    try {
      const res = await fetch('http://localhost:5001/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          className: newClass.title,
          quarter: newClass.quarter,
          color: newClass.color,
          teacherId: teacherId,
        }),
      });
      const saved = await res.json();
      setClasses((prev) => [...prev, saved]);
    } catch (err) {
      console.error('Failed to save class:', err);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (index) => {
    setClasses((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
    setIsModalOpen(true);
  };

  return (
    <div className="teacher-container">
      <AddClassModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingIndex(null); }}
        onSave={handleAddClass}
        initialData={editingIndex !== null ? classes[editingIndex] : null}
      />

      <div className="teacher-main">
        <div className="teacher-main-header">
          <h1>Classes</h1>
          <button
            onClick={() => { setEditingIndex(null); setIsModalOpen(true); }}
            className="add-class-button"
          >
            + Add Class
          </button>
        </div>

        <div className="teacher-class-list">
          {classes.length > 0 ? (
            <div className="teacher-class-grid">
              {classes.map((cls, index) => (
                <ClassTile
                  key={cls.id || index}
                  title={cls.className}
                  quarter={cls.quarter}
                  color={cls.color}
                  classId={cls.id}
                  onDelete={() => handleDelete(index)}
                  onEdit={() => handleEdit(index)}
                />
              ))}
            </div>
          ) : (
            <div className="teacher-empty-state">
              <p>Your dashboard is empty now.</p>
            </div>
          )}
        </div>
      </div>

      <div className="teacher-sidebar">
        <h2>Profile? </h2>
        <h2>Calender? </h2>
        <h2>Schedule timelines?</h2>
        <h2>Announcements?</h2>
      </div>
    </div>
  );
}

export default Teacher;