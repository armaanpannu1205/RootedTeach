import { Navigate } from "react-router-dom";

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (token) {
    return <Navigate to={role === "Teacher" ? "/teacher" : "/dashboard"} replace />;
  }

  return children;
};

export default PublicRoute;