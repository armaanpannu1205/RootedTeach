import CreateAccount from "./CreateAccount";
import Navbar from "./Navbar";
import HomePage from "./HomePage";
import AboutPage from "./AboutPage";
import OurTeam from "./OurTeam";
import ContactPage from "./ContactPage";
import { Routes, Route } from "react-router-dom";

function Login() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/team" element={<OurTeam />} />
        <Route path="/contact" element={<ContactPage />} />
      </Routes>
    </>
  );
}

export default Login;
