import "./App.css";
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

import Teacher from "./TeacherView/Teacher";
import TCourseDashboard from "./TeacherView/TCourseDashboard";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/"         element={<LoginPage />} />
          <Route path="/register" element={<CreateAccount />} />
          <Route path="/team"     element={<OurTeam />} />
          <Route path="/contact"  element={<ContactPage />} />
          <Route path="/about"    element={<About />} />
        </Route>

        <Route path="/dashboard"  element={<StudentDashboard />} />
        <Route path="/course"     element={<CourseDashboard />} />
        <Route path="/assignment" element={<AssignmentDashboard />} />

        <Route path="/teacher"    element={<Teacher />} />
        <Route path="/class"      element={<TCourseDashboard />} />
      </Routes>
    </div>
  );
}

export default App;