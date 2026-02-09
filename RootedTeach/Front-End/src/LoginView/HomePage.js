import React, { useState } from "react";
import "./HomePage.css";
import { Images } from "../Images/Images.js";
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';

function HomePage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    alert(`Logging in with ${email}`);
  };

  return (
    <div className="home-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h1>Sign in</h1>
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
        <div className="input-wrapper">
          <LockIcon className="input-icon" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Password"
          />
        </div>
        <button type="submit">Login</button>
        <div className="ForgotPassword">Don't have an Account? Click me
        </div>
      </form>
    </div>
  );
}

export default HomePage;