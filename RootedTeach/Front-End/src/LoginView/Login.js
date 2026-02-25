import CreateAccount from "./CreateAccount";
import Navbar from "./Navbar";
import HomePage from "./HomePage";
import AboutPage from "./AboutPage";
import OurTeam from "./OurTeam";
import ContactPage from "./ContactPage";
import TeacherView from "../TeacherView/Teacher";
import { Routes, Route } from "react-router-dom";
import ClassPage from "../Class/ClassPage";

function Login() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<TeacherView />} />
        <Route path="/team" element={<OurTeam />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/class" element={<ClassPage/>} />
      </Routes>
    </>
  );
}

export default Login;
