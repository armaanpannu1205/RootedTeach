// import "./App.css";
// import PublicLayout from "./LoginView/PublicLayout";
// import LoginPage from "./LoginView/Login/Login";
// import CreateAccount from "./LoginView/Login/CreateAccount";
// import OurTeam from "./LoginView/OurTeam/OurTeam";
// import ContactPage from "./LoginView/Contact/ContactPage";
// import AboutPage from "./LoginView/About/AboutPage";
// import CourseDashboard from "./StudentView/CourseDashboard";
// import AssignmentDashboard from "./StudentView/AssignmentDashboard";
// import ClassPage from "./Class/ClassPage";
// import ProtectedRoute from "./LoginView/ProtectedRoute";
// import PublicRoute from "./LoginView/PublicRoute";
// import DashboardRouter from "./LoginView/DashboardRouter";

// import { Routes, Route } from "react-router-dom";

// function App() {
//   return (
//     <div className="App">
//       <Routes>
        
//         {/* Pages that only shown before log in */}
//         <Route element={<PublicRoute><PublicLayout /></PublicRoute>}>
//           <Route path="/" element={<LoginPage />} />
//           <Route path="/register" element={<CreateAccount />} />
//         </Route>

//         {/* Pages that anyone can see */}
//         <Route element={<PublicLayout />}>
//           <Route path="/team" element={<OurTeam />} />
//           <Route path="/contact" element={<ContactPage />} />
//           <Route path="/about" element={<AboutPage />} />
//         </Route>

//         {/* Group 3: Pages that log in is needed */}
        
//         <Route path="/dashboard" element={
//           <ProtectedRoute>
//             <DashboardRouter />
//           </ProtectedRoute>
//         } />

//         <Route path="/course" element={<ProtectedRoute><CourseDashboard /></ProtectedRoute>} />
//         <Route path="/assignment" element={<ProtectedRoute><AssignmentDashboard /></ProtectedRoute>} />
//         <Route path="/class" element={<ProtectedRoute><ClassPage /></ProtectedRoute>} />
        
//       </Routes>
//     </div>
//   );
// }

// export default App;


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
import ClassPage from "./Class/ClassPage";
import AllAssignment from "./StudentView/AllAssignment";
import Calendar from "./StudentView/Calendar";
import AllGrades from "./StudentView/AllGrades";
import Account from "./StudentView/Account";

function App() {
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
        <Route path="/assignments" element={<AllAssignment />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/grades" element={<AllGrades />} />
        <Route path="/account" element={<Account />} />
        <Route path="/teacher" element={<Teacher />} />
        {/* Fix later */}
        <Route path="/class" element={<TCourseDashboard />} />
        <Route path="/class" element={<ClassPage />} />
        
      </Routes>
    </div>
  );
}

export default App;