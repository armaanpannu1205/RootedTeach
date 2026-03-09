import "./App.css";
import { useState } from "react";
import { Routes, Route } from "react-router-dom";

import PublicLayout from "./LoginView/PublicLayout";
import LoginPage from "./LoginView/Login/Login";
import CreateAccount from "./LoginView/Login/CreateAccount";
import OurTeam from "./LoginView/OurTeam/OurTeam";
import ContactPage from "./LoginView/Contact/ContactPage";
import About from "./LoginView/About/AboutPage";

import StudentDashboard from "./StudentView/StudentDashboard";
import CourseDashboard from "./StudentView/CourseDashboard";
import AssignmentDashboard from "./StudentView/AssignmentDashboard";
import TeacherView from "./TeacherView/Teacher"; 
import ClassPage from "./Class/ClassPage";

function App() {
  const [logIn, setLogin] = useState(false);

  return (
    <div className="App">
      <Routes>
        
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<CreateAccount />} />
          <Route path="/team" element={<OurTeam />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/about" element={<About />} />
        </Route>

        <Route path="/dashboard" element={<StudentDashboard />} />
        <Route path="/course" element={<CourseDashboard />} />
        <Route path="/assignment" element={<AssignmentDashboard />} />
        <Route path="/teacher" element={<TeacherView />} />
        <Route path="/class" element={<ClassPage />} />
        
      </Routes>
    </div>
  );
}

export default App;