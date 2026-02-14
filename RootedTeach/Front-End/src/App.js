import { Routes, Route } from "react-router-dom";
import Navbar from "./LoginView/Navbar";
import Login from "./LoginView/Login";
import AboutPage from "./LoginView/AboutPage";
import OurTeam from "./LoginView//OurTeam";
import ContactPage from "./LoginView/ContactPage";
import HomePage from "./LoginView/HomePage";
function App() {
  return (
    <div>
      <Navbar /> {/* Navbar always visible */}
      
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/team" element={<OurTeam />} />
        <Route path="/contact" element={<ContactPage />} />
      </Routes>
    </div>
  );
}

export default App;
