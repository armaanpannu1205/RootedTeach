import React from "react";
import {Navigate} from "react-router-dom";

const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (allowedRole && role !== allowedRole) {
    return <Navigate to={role === "Teacher" ? "/teacher" : "/dashboard"} replace />;
  }

  return children;
};

export default ProtectedRoute;