/* HomePage.js - The main entry point for the app (Login Screen). */
/* Keeping it simple with just email/password login and a link to signup. */

import React, { useState } from "react";
import "./HomePage.css";
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import CreateAccount from "./CreateAccount";

function HomePage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // States for toggling UI elements
  const [showPassword, setShowPassword] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    // TODO: Connect this to the Express backend later
    alert(`Logging in with ${email}`);
  };

  return (
    <div className="home-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h1>Welcome</h1>

        {/* User identification field */}
        <div className="input-wrapper">
          <PersonIcon className="input-icon" />
          <input
            type="email"
            value={email}
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Password field with a visibility toggle button */}
        <div className="input-wrapper">
          <LockIcon className="input-icon" />
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Password"
          />
          <button
            type="button"
            className="toggle-password"
            onClick={() => setShowPassword((p) => !p)}
            tabIndex={-1} // Don't let users tab into the eye icon for better flow
            aria-label="Toggle password visibility"
          >
            {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
          </button>
        </div>

        <button type="submit" className="submit-btn">Login</button>

        {/* Redirect to signup modal/page */}
        <div className="ForgotPassword">
          Don't have an account?{" "}
          <span className="link-text" onClick={() => setShowSignup(true)}>
            Sign up
          </span>
        </div>
      </form>

      {/* Conditionally render the signup overlay */}
      {showSignup && <CreateAccount onClose={() => setShowSignup(false)} />}
    </div>
  );
}

export default HomePage;