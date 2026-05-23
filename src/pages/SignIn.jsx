import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogIn, Mail, Lock, ShieldCheck, AlertCircle } from "lucide-react";

const SignIn = () => {
  const { signin, googleSignin, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Determine redirect route
  const from = location.state?.from?.pathname || "/dashboard";

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return setError("Please fill in all fields.");
    }
    setError("");
    setLoading(true);
    try {
      await signin(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      if (err.code === "auth/invalid-credential" || err.message?.includes("wrong-password") || err.message?.includes("user-not-found")) {
        setError("Invalid email or password credentials.");
      } else if (err.code === "auth/invalid-email" || err.message?.includes("invalid-email")) {
        setError("Please enter a valid email address.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many attempts. Account temporarily locked. Try again later.");
      } else {
        setError("Authentication failed. Please verify your credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      await googleSignin();
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      setError("Google Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-bg-blob auth-bg-blob-1"></div>
      <div className="auth-bg-blob auth-bg-blob-2"></div>

      <div className="auth-card">
        <div className="auth-logo-header">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="56" height="56" className="logo-icon">
            <defs>
              <linearGradient id="signinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#4f46e5" />
                <stop offset="100%" stop-color="#8b5cf6" />
              </linearGradient>
            </defs>
            <path d="M 30 50 C 40 30, 60 70, 70 50" fill="none" stroke="url(#signinGrad)" stroke-width="8" stroke-linecap="round" />
            <circle cx="30" cy="50" r="10" fill="#4f46e5" />
            <circle cx="70" cy="50" r="10" fill="#8b5cf6" />
          </svg>
          <h2>Welcome to NexusHub</h2>
          <p>Sign in to access your secure workspace</p>
        </div>

        {error && (
          <div className="error-banner">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email-input">Email Address</label>
            <div style={{ position: "relative" }}>
              <Mail 
                size={18} 
                style={{ 
                  position: "absolute", 
                  left: "12px", 
                  top: "50%", 
                  transform: "translateY(-50%)", 
                  color: "var(--text-tertiary)" 
                }} 
              />
              <input
                id="email-input"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: "40px" }}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: "0.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label className="form-label" htmlFor="password-input">Password</label>
              <Link 
                to="/forgot-password" 
                style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--primary)" }}
              >
                Forgot password?
              </Link>
            </div>
            <div style={{ position: "relative" }}>
              <Lock 
                size={18} 
                style={{ 
                  position: "absolute", 
                  left: "12px", 
                  top: "50%", 
                  transform: "translateY(-50%)", 
                  color: "var(--text-tertiary)" 
                }} 
              />
              <input
                id="password-input"
                type="password"
                className="form-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: "40px" }}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", marginTop: "1.5rem" }}
            disabled={loading}
          >
            {loading ? "Verifying..." : (
              <>
                <LogIn size={16} /> Sign In
              </>
            )}
          </button>
        </form>

        <div className="auth-divider">Or continue with</div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="google-signin-btn"
          disabled={loading}
        >
          <svg className="google-icon" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5.04c1.62 0 3.08.56 4.22 1.65l3.15-3.15C17.45 1.84 14.93 1 12 1 7.37 1 3.4 3.65 1.5 7.5l3.86 3C6.27 7.55 8.9 5.04 12 5.04z"
            />
            <path
              fill="#4285F4"
              d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.47h6.48c-.28 1.47-1.11 2.71-2.36 3.55l3.66 2.84c2.14-1.97 3.71-4.88 3.71-8.5z"
            />
            <path
              fill="#FBBC05"
              d="M5.36 14.77c-.24-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27L1.5 7.23C.54 9.12 0 11.24 0 13.5s.54 4.38 1.5 6.27l3.86-3z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.24 0 5.97-1.07 7.96-2.92l-3.66-2.84c-1.1.74-2.51 1.18-4.3 1.18-3.1 0-5.73-2.51-6.64-5.46L1.5 15.92C3.4 19.75 7.37 23 12 23z"
            />
          </svg>
          Sign in with Google
        </button>

        <div className="auth-footer" style={{ marginBottom: "0.5rem" }}>
          Don't have an account?{" "}
          <Link to="/signup" className="auth-footer-link">
            Sign up now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
