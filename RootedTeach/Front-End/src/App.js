/* App.js - The main router for the entire application. */
/* Defines which pages are public and which require a login (Protected). */

import "./App.css";
import { Routes, Route } from "react-router-dom";

// Layout & Auth
import PublicLayout     from "./views/Login/PublicLayout";
import ProtectedRoute   from "./router/ProtectedRoute";
import PublicRoute      from "./router/PublicRoute";
import DashboardRouter  from "./router/DashboardRouter";

// Login / Public pages
import LoginPage        from "./views/Login/Login";
import CreateAccount    from "./views/Login/CreateAccount";
import OurTeam          from "./views/Login/OurTeam/OurTeam";
import ContactPage      from "./views/Login/ContactPage";
import About            from "./views/Login/AboutPage";

// Student pages
import StudentDashboard    from "./views/Student/StudentDashboard";
import CourseDashboard     from "./views/Student/CourseDashboard";
import AssignmentDashboard from "./views/Student/AssignmentDashboard";
import AllAssignment       from "./views/Student/AllAssignment";
import Calendar            from "./views/Student/Calendar";
import AllGrades           from "./views/Student/AllGrades";
import Account             from "./views/Student/Account";

// Teacher pages
import Teacher          from "./views/Teacher/Teacher";
import TCourseDashboard from "./views/Teacher/TCourseDashboard";

function App() {
  return (
    <div className="App">
      <Routes>

        {/* Public pages (Login, CreateAccount, OurTeam, Contact, About)*/}
        <Route element={<PublicRoute><PublicLayout /></PublicRoute>}>
          <Route path="/"         element={<LoginPage />} />
          <Route path="/register" element={<CreateAccount />} />
        </Route>
        <Route element={<PublicLayout />}>
          <Route path="/team"    element={<OurTeam />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/about"   element={<About />} />
        </Route>

        {/* Protected pages (Student/Teacher pages)*/}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardRouter /></ProtectedRoute>} />

        {/* Student Pages*/}
        <Route path="/course"       element={<ProtectedRoute><CourseDashboard /></ProtectedRoute>} />
        <Route path="/assignment"   element={<ProtectedRoute><AssignmentDashboard /></ProtectedRoute>} />
        <Route path="/assignments"  element={<ProtectedRoute><AllAssignment /></ProtectedRoute>} />
        <Route path="/calendar"     element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
        <Route path="/grades"       element={<ProtectedRoute><AllGrades /></ProtectedRoute>} />
        <Route path="/account"      element={<ProtectedRoute><Account /></ProtectedRoute>} />

        {/* Teacher Pages*/}
        <Route path="/teacher"  element={<ProtectedRoute><Teacher /></ProtectedRoute>} />
        <Route path="/class"    element={<ProtectedRoute><TCourseDashboard /></ProtectedRoute>} />

      </Routes>
    </div>
  );
}

export default App;
