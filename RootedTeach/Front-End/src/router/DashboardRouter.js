import React from "react";
import { Navigate } from "react-router-dom";
import TeacherView from "../views/Teacher/Teacher";
import StudentDashboard from "../views/Student/StudentDashboard";

const DashboardRouter = () => {
  const role = localStorage.getItem("role");

  if (role === "Teacher") {
    return <TeacherView />;
  } 
  
  if (role === "Student") {
    return <StudentDashboard />;
  }

  return <Navigate to="/" replace />;
};

export default DashboardRouter;