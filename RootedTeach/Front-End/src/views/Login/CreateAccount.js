import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateAccount.css";
import {
  Box, Button, TextField, Grid,
  InputAdornment, IconButton, Alert, CircularProgress,
  LinearProgress, ToggleButton, ToggleButtonGroup, Divider, Typography,
} from "@mui/material";
import { Visibility, VisibilityOff, Email, Lock, Person, School, MenuBook } from "@mui/icons-material";
import { GoogleAuthProvider, signInWithPopup, getAuth } from "firebase/auth";
import { initializeApp, getApps } from "firebase/app";

// Firebase is only used here to open the Google popup and get an ID token
// No Firestore calls — all user data goes through our Express backend
const firebaseConfig = {
  apiKey: "AIzaSyCFatSe4ClkJ6AGTCpyXC-2iX5TRCtaOuY",
  authDomain: "rootedteach.firebaseapp.com",
  projectId: "rootedteach",
  storageBucket: "rootedteach.firebasestorage.app",
  messagingSenderId: "31712574441",
  appId: "1:31712574441:web:83606dabbef728c60e6978",
};

const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(firebaseApp);

const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    background: "rgba(255,255,255,0.06)",
    color: "white",
    "& fieldset": { borderColor: "rgba(255,255,255,0.15)" },
    "&:hover fieldset": { borderColor: "rgba(255,255,255,0.35)" },
    "&.Mui-focused fieldset": { borderColor: "#6ea8ff", borderWidth: "1.5px" },
  },
  "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.45)" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#6ea8ff" },
  "& .MuiInputAdornment-root .MuiSvgIcon-root": { color: "rgba(255,255,255,0.35)" },
  "& input": { color: "white" },
};

function getPasswordStrength(pw) {
  if (pw.length === 0) return { value: 0,   label: "",          color: "transparent" };
  if (pw.length < 6)   return { value: 25,  label: "Too short", color: "#fc8181" };
  if (pw.length < 10)  return { value: 60,  label: "Good",      color: "#f6ad55" };
  return                      { value: 100, label: "Strong",    color: "#68d391" };
}

export default function CreateAccount() {
  const [firstName, setFirstName]         = useState("");
  const [lastName, setLastName]           = useState("");
  const [email, setEmail]                 = useState("");
  const [password, setPassword]           = useState("");
  const [confirmPw, setConfirmPw]         = useState("");
  const [role, setRole]                   = useState("Student");
  const [showPw, setShowPw]               = useState(false);
  const [showConfirm, setShowConfirm]     = useState(false);
  const [message, setMessage]             = useState({ type: "", text: "" });
  const [loading, setLoading]             = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();

  const strength = getPasswordStrength(password);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (password !== confirmPw) return setMessage({ type: "error", text: "Passwords do not match." });
    if (password.length < 6)    return setMessage({ type: "error", text: "Password must be at least 6 characters." });

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: `${firstName.trim()} ${lastName.trim()}`,
          email, password, role,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "Account created! Redirecting to login…" });
        setTimeout(() => navigate("/"), 1800);
      } else {
        setMessage({ type: "error", text: data.message });
      }
    } catch {
      setMessage({ type: "error", text: "Could not connect to the server." });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setMessage({ type: "", text: "" });
    setGoogleLoading(true);
    try {
      // Step 1: open Google popup and get ID token
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      // Step 2: send ID token + chosen role to our backend
      const res = await fetch("http://localhost:5001/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, role }),
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.user.role);
        localStorage.setItem("userId", data.user._id);
        localStorage.setItem("username", data.user.username);
        navigate(data.user.role === "Teacher" ? "/teacher" : "/dashboard");
      } else {
        setMessage({ type: "error", text: data.message });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Google sign-up failed. Please try again." });
      console.error(err.message);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="create-account-container">
      <Box component="form" onSubmit={handleSignUp} className="create-account-card">

        <div className="create-account-header">
          <div className="create-account-logo">RT</div>
          <h1 className="create-account-title">Create Account</h1>
          <p className="create-account-subtitle">Join RootedTeach — select your role to get started</p>
        </div>

        <div className="role-toggle-wrapper">
          <ToggleButtonGroup value={role} exclusive fullWidth onChange={(_, val) => val && setRole(val)}>
            <ToggleButton value="Student"><School fontSize="small" />&nbsp; Student</ToggleButton>
            <ToggleButton value="Teacher"><MenuBook fontSize="small" />&nbsp; Teacher</ToggleButton>
          </ToggleButtonGroup>
        </div>

        <Button fullWidth onClick={handleGoogleSignUp} disabled={googleLoading} sx={{
          py: 1.5, borderRadius: "12px",
          background: "rgba(255,255,255,0.07)",
          border: "1px solid rgba(255,255,255,0.18)",
          color: "white", fontWeight: 600, fontSize: "0.95rem",
          textTransform: "none", gap: 1.5,
          "&:hover": { background: "rgba(255,255,255,0.13)", border: "1px solid rgba(255,255,255,0.32)" },
          "&:disabled": { opacity: 0.6 },
        }}>
          {googleLoading ? (
            <CircularProgress size={20} sx={{ color: "white" }} />
          ) : (
            <>
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: 20, height: 20 }} />
              Continue with Google as {role}
            </>
          )}
        </Button>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Divider sx={{ flex: 1, borderColor: "rgba(255,255,255,0.1)" }} />
          <Typography sx={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.3)", whiteSpace: "nowrap" }}>
            or register with email
          </Typography>
          <Divider sx={{ flex: 1, borderColor: "rgba(255,255,255,0.1)" }} />
        </Box>

        <Grid container spacing={1.5}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="First Name" fullWidth required value={firstName}
              onChange={(e) => setFirstName(e.target.value)} placeholder="John"
              InputProps={{ startAdornment: <InputAdornment position="start"><Person fontSize="small" /></InputAdornment> }}
              sx={inputSx}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Last Name" fullWidth required value={lastName}
              onChange={(e) => setLastName(e.target.value)} placeholder="Doe"
              InputProps={{ startAdornment: <InputAdornment position="start"><Person fontSize="small" /></InputAdornment> }}
              sx={inputSx}
            />
          </Grid>
        </Grid>

        <TextField label="Email Address" type="email" fullWidth required value={email}
          onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com"
          InputProps={{ startAdornment: <InputAdornment position="start"><Email fontSize="small" /></InputAdornment> }}
          sx={inputSx}
        />

        <Grid container spacing={1.5}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Password" type={showPw ? "text" : "password"} fullWidth required
              value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 characters"
              InputProps={{
                startAdornment: <InputAdornment position="start"><Lock fontSize="small" /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPw(!showPw)} edge="end" sx={{ color: "rgba(255,255,255,0.35)" }}>
                      {showPw ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={inputSx}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Confirm Password" type={showConfirm ? "text" : "password"} fullWidth required
              value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} placeholder="Repeat password"
              InputProps={{
                startAdornment: <InputAdornment position="start"><Lock fontSize="small" /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirm(!showConfirm)} edge="end" sx={{ color: "rgba(255,255,255,0.35)" }}>
                      {showConfirm ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={inputSx}
            />
          </Grid>
        </Grid>

        {password.length > 0 && (
          <div className="strength-row">
            <LinearProgress variant="determinate" value={strength.value} sx={{
              flex: 1, height: 4, borderRadius: 2,
              background: "rgba(255,255,255,0.08)",
              "& .MuiLinearProgress-bar": { background: strength.color, borderRadius: 2 },
            }} />
            <span className="strength-label" style={{ color: strength.color }}>{strength.label}</span>
          </div>
        )}

        {message.text && (
          <Alert severity={message.type} sx={{
            borderRadius: "10px",
            background: message.type === "error" ? "rgba(252,129,129,0.1)" : "rgba(104,211,145,0.1)",
            color: message.type === "error" ? "#fc8181" : "#68d391",
            border: `1px solid ${message.type === "error" ? "rgba(252,129,129,0.25)" : "rgba(104,211,145,0.25)"}`,
            "& .MuiAlert-icon": { color: message.type === "error" ? "#fc8181" : "#68d391" },
          }}>
            {message.text}
          </Alert>
        )}

        <Button type="submit" fullWidth disabled={loading} sx={{
          mt: 0.5, py: 1.7, borderRadius: "12px",
          background: "linear-gradient(135deg, #4facfe 0%, #7b2fff 100%)",
          color: "white", fontWeight: 700, fontSize: "1rem",
          textTransform: "none",
          boxShadow: "0 4px 20px rgba(79,172,254,0.3)",
          "&:hover": { background: "linear-gradient(135deg, #6dbfff 0%, #9b4fff 100%)", transform: "translateY(-1px)", boxShadow: "0 8px 28px rgba(79,172,254,0.45)" },
          "&:active": { transform: "translateY(0)" },
          "&:disabled": { opacity: 0.6 },
          transition: "all 0.2s",
        }}>
          {loading ? <CircularProgress size={22} sx={{ color: "white" }} /> : `Create ${role} Account`}
        </Button>

        <div className="create-account-footer">
          Already have an account?{" "}
          <span className="link" onClick={() => navigate("/")}>Sign in here</span>
        </div>
      </Box>
    </div>
  );
}
