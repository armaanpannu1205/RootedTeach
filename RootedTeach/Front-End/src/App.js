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

function App() {
  const [logIn, setLogin] = useState(false);

  const handleClick = () => {
    setLogin(true);
  };

  return (
    <div className="App">
      <div>
        <Login />
      </div>
    </div>
  );
}

export default App;
