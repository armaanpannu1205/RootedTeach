import { useState } from "react";

export default function StudentDashboard() {
    const [classes, setClasses] = useState([]);

  return (
    <div style={{padding: "20px" }}>
      <h1>Student Dashboard</h1>
      <p>Welcome Back</p>

    <div style ={{ display: "grid", gridTemlateColumns: "repeat{auto-fill, 250px)", gap :"20px" }}>
      {classes.map((c) => (
        <div key={c.id} style={{
          border: "1px solid #ccc",
          boarderRadius: "10px",
          padding: "15px",
          backgroundColor: "#f9f9f9"
        }}>
           <h3>{c.name}</h3>
           <p>Instructor: {c.instructor}</p>
           <button>Enter Class</button>
          </div>
        ))}
      </div>
    </div>
  );
}