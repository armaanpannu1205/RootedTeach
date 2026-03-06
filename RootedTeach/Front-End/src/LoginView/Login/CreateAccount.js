import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import EmailIcon from "@mui/icons-material/Email";
import BadgeIcon from "@mui/icons-material/Badge";

function CreateAccount() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Student");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    
    const combinedUsername = `${firstName} ${lastName}`;

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: combinedUsername,
          email: email,
          password: password,
          role: role
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
      } else {
        setMessage(`Error: ${data.message}`);
      }
    } catch (error) {
      setMessage("Could not connect to the server.");
    }
  };

  return (
    <div className="home-container">
      <form className="login-form" onSubmit={handleSignUp}>
        <h1>Create Account</h1>

        {/* First Name & Last Name */}
        <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
          <div className="input-wrapper" style={{ flex: 1 }}>
            <PersonIcon className="input-icon" />
            <input
              type="text"
              value={firstName}
              placeholder="First Name"
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div className="input-wrapper" style={{ flex: 1 }}>
            <PersonIcon className="input-icon" />
            <input
              type="text"
              value={lastName}
              placeholder="Last Name"
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Email */}
        <div className="input-wrapper">
          <EmailIcon className="input-icon" />
          <input
            type="email"
            value={email}
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Password */}
        <div className="input-wrapper">
          <LockIcon className="input-icon" />
          <input
            type="password"
            value={password}
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* Role Selection */}
        <div className="input-wrapper">
          <BadgeIcon className="input-icon" />
          <select 
            value={role} 
            onChange={(e) => setRole(e.target.value)} 
            required
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '1rem',
              borderRadius: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: role === "" ? 'rgba(255, 255, 255, 0.73)' : 'white',
              appearance: 'none',
            }}
          >
            <option value="Student" style={{ color: 'black' }}>Student</option>
            <option value="Teacher" style={{ color: 'black' }}>Teacher</option>
          </select>
        </div>

        <button type="submit">Sign Up</button>

        {message && <div style={{ color: message.includes("Error") ? "#ff6b6b" : "#4ade80", marginTop: "10px", fontSize: "0.9rem" }}>{message}</div>}

        <div 
        className="ForgotPassword" 
        onClick={() => navigate('/')}
        style={{ cursor: 'pointer', textDecoration: 'underline' }}
        >
          Already have an account? Login here
        </div>
      </form>
    </div>
  );
}

export default CreateAccount;