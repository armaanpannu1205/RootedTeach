import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Button, TextField, Typography,
  InputAdornment, IconButton, Alert, CircularProgress, Divider,
} from "@mui/material";
import { Visibility, VisibilityOff, Email, Lock } from "@mui/icons-material";
import { GoogleAuthProvider, signInWithPopup, getAuth } from "firebase/auth";
import { initializeApp, getApps } from "firebase/app";

// Firebase is only used here to get the Google ID token from the popup
// All actual user storage and verification happens on our Express backend
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
  "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.45)", fontSize: "0.9rem" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#6ea8ff" },
  "& .MuiInputAdornment-root .MuiSvgIcon-root": { color: "rgba(255,255,255,0.35)" },
  "& input": { color: "white" },
};

export default function LoginPage() {
  const [email, setEmail]                 = useState("");
  const [password, setPassword]           = useState("");
  const [showPassword, setShowPassword]   = useState(false);
  const [errorMsg, setErrorMsg]           = useState("");
  const [loading, setLoading]             = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.user.role);
        localStorage.setItem("userId", data.user._id);
        localStorage.setItem("username", data.user.username);
        navigate(data.user.role === "Teacher" ? "/teacher" : "/dashboard");
      } else {
        setErrorMsg(data.message);
      }
    } catch {
      setErrorMsg("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg("");
    setGoogleLoading(true);
    try {
      // Step 1: open Google popup and get the ID token
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      // Step 2: send the ID token to our backend to verify and get a JWT back
      const res = await fetch("http://localhost:5001/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.user.role);
        localStorage.setItem("userId", data.user._id);
        localStorage.setItem("username", data.user.username);
        navigate(data.user.role === "Teacher" ? "/teacher" : "/dashboard");
      } else {
        setErrorMsg(data.message);
      }
    } catch (err) {
      setErrorMsg("Google sign-in failed. Please try again.");
      console.error(err.message);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: "100vh", width: "100vw",
      display: "flex", alignItems: "center", justifyContent: "center",
      backgroundImage: "url('https://i.imgur.com/YrZFSSN.jpg')",
      backgroundSize: "cover", backgroundRepeat: "repeat",
      animation: "moveBg 40s linear infinite",
      "@keyframes moveBg": { "0%": { backgroundPosition: "0 0" }, "100%": { backgroundPosition: "1000px 0" } },
      p: 2,
    }}>
      <Box component="form" onSubmit={handleLogin} sx={{
        width: "100%", maxWidth: 540,
        background: "rgba(0,1,26,0.85)", backdropFilter: "blur(16px)",
        borderRadius: "20px", border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 32px 80px rgba(0,0,0,0.65)",
        p: { xs: "36px 24px", sm: "52px 56px" },
        display: "flex", flexDirection: "column", gap: 2.5,
      }}>

        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, mb: 1 }}>
          <Box sx={{
            width: 56, height: 56, borderRadius: "16px",
            background: "linear-gradient(135deg, #4facfe 0%, #7b2fff 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 900, fontSize: "1.1rem", color: "white",
            boxShadow: "0 4px 20px rgba(79,172,254,0.4)", letterSpacing: 1,
          }}>RT</Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: "white", letterSpacing: "-0.5px" }}>
            Welcome Back
          </Typography>
          <Typography sx={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.4)" }}>
            Sign in to your RootedTeach account
          </Typography>
        </Box>

        <Button fullWidth onClick={handleGoogleLogin} disabled={googleLoading} sx={{
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
              Continue with Google
            </>
          )}
        </Button>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Divider sx={{ flex: 1, borderColor: "rgba(255,255,255,0.1)" }} />
          <Typography sx={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.3)", whiteSpace: "nowrap" }}>
            or sign in with email
          </Typography>
          <Divider sx={{ flex: 1, borderColor: "rgba(255,255,255,0.1)" }} />
        </Box>

        <TextField label="Email Address" type="email" fullWidth required
          value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          InputProps={{ startAdornment: <InputAdornment position="start"><Email fontSize="small" /></InputAdornment> }}
          sx={inputSx}
        />

        <TextField label="Password" type={showPassword ? "text" : "password"} fullWidth required
          value={password} onChange={(e) => setPassword(e.target.value)}
          placeholder="Your password"
          InputProps={{
            startAdornment: <InputAdornment position="start"><Lock fontSize="small" /></InputAdornment>,
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: "rgba(255,255,255,0.35)" }}>
                  {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={inputSx}
        />

        {errorMsg && (
          <Alert severity="error" sx={{
            borderRadius: "10px", background: "rgba(252,129,129,0.1)",
            color: "#fc8181", border: "1px solid rgba(252,129,129,0.25)",
            "& .MuiAlert-icon": { color: "#fc8181" },
          }}>
            {errorMsg}
          </Alert>
        )}

        <Button type="submit" fullWidth disabled={loading} sx={{
          mt: 0.5, py: 1.7, borderRadius: "12px",
          background: "linear-gradient(135deg, #4facfe 0%, #7b2fff 100%)",
          color: "white", fontWeight: 700, fontSize: "1rem",
          textTransform: "none", letterSpacing: "0.3px",
          boxShadow: "0 4px 20px rgba(79,172,254,0.3)",
          "&:hover": { background: "linear-gradient(135deg, #6dbfff 0%, #9b4fff 100%)", boxShadow: "0 8px 28px rgba(79,172,254,0.45)", transform: "translateY(-1px)" },
          "&:active": { transform: "translateY(0)" },
          "&:disabled": { opacity: 0.6 },
          transition: "all 0.2s",
        }}>
          {loading ? <CircularProgress size={22} sx={{ color: "white" }} /> : "Sign In"}
        </Button>

        <Typography sx={{ textAlign: "center", fontSize: "0.83rem", color: "rgba(255,255,255,0.4)" }}>
          Don't have an account?{" "}
          <Box component="span" onClick={() => navigate("/register")}
            sx={{ color: "#6ea8ff", fontWeight: 600, cursor: "pointer", "&:hover": { textDecoration: "underline" } }}>
            Create one here
          </Box>
        </Typography>
      </Box>
    </Box>
  );
}