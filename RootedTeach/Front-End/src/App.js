import "./App.css";
import { useState } from "react";
import { Routes, Route } from "react-router-dom";

import Student from "./StudentView/Student.js";
import Teacher from "./TeacherView/Teacher.js";
import Login from "./LoginView/Login";
import Navbar from "./LoginView/Navbar";
import AboutPage from "./LoginView/AboutPage";
import OurTeam from "./LoginView/OurTeam";
import ContactPage from "./LoginView/ContactPage";
import HomePage from "./LoginView/HomePage";
import StudentDashboard from "./StudentView/StudentDashboard"
import CourseDashboard from "./StudentView/CourseDashboard"
import AssignmentDashboard from "./StudentView/AssignmentDashboard";

function App() {
  const [logIn, setLogin] = useState(false);

  const handleClick = () => {
    setLogin(true);
  };

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<StudentDashboard />} />
        <Route path="/dashboard" element={<StudentDashboard />} />
        <Route path="/course" element={<CourseDashboard />} />
        <Route path="/assignment" element={<AssignmentDashboard />} />
      </Routes>
    </div>
  );
}

export default App;
