import React, { useState } from "react";
import "./Login.css";
import { Images } from "../../Images/Images.js";
import { useNavigate } from "react-router-dom";
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.user.role);
        localStorage.setItem('userId', data.user._id);

        if (data.user.role === 'Teacher') {
          navigate('/teacher');
        } else {
          navigate('/dashboard');
        }
        
      } else {
        setErrorMsg(`Error: ${data.message}`);
      }
    } catch (error) {
      setErrorMsg("Could not connect to the server.");
    }
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
        {errorMsg && <div style={{ color: "#ff6b6b", marginTop: "10px", fontWeight: "bold" }}>{errorMsg}</div>}

        <div 
          className="ForgotPassword" 
          onClick={() => navigate('/register')}
          style={{ cursor: 'pointer', textDecoration: 'underline' }}
        >
          Don't have an Account? Click me
        </div>
      </form>
    </div>
  );
}

export default LoginPage;
