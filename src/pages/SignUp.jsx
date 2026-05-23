import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { User, Mail, Lock, UserPlus, Shield, UserCheck, AlertCircle } from "lucide-react";

const SignUp = () => {
  const { signup, googleSignin } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user"); // Defaults to user, but can select admin
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      return setError("Please fill in all fields.");
    }
    if (password.length < 6) {
      return setError("Password must be at least 6 characters long.");
    }
    setError("");
    setLoading(true);
    try {
      await signup(email, password, name, role);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      if (err.code === "auth/email-already-in-use" || err.message?.includes("email-already-in-use")) {
        setError("This email address is already registered.");
      } else if (err.code === "auth/invalid-email" || err.message?.includes("invalid-email")) {
        setError("Please enter a valid email address.");
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError("");
    setLoading(true);
    try {
      await googleSignin();
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Google authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container" style={{ padding: "1.5rem 1rem" }}>
      <div className="auth-bg-blob auth-bg-blob-1"></div>
      <div className="auth-bg-blob auth-bg-blob-2"></div>

      <div className="auth-card" style={{ maxWidth: "500px", padding: "2rem 2.25rem" }}>
        <div className="auth-logo-header" style={{ marginBottom: "1.5rem" }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="48" height="48" className="logo-icon">
            <defs>
              <linearGradient id="signupGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#4f46e5" />
                <stop offset="100%" stop-color="#8b5cf6" />
              </linearGradient>
            </defs>
            <path d="M 30 50 C 40 30, 60 70, 70 50" fill="none" stroke="url(#signupGrad)" stroke-width="8" stroke-linecap="round" />
            <circle cx="30" cy="50" r="10" fill="#4f46e5" />
            <circle cx="70" cy="50" r="10" fill="#8b5cf6" />
          </svg>
          <h2 style={{ fontSize: "1.6rem" }}>Create Your Account</h2>
          <p>Join NexusHub and access dynamic secure utilities</p>
        </div>

        {error && (
          <div className="error-banner" style={{ padding: "0.65rem 0.85rem", marginBottom: "1rem" }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: "1rem" }}>
            <label className="form-label" htmlFor="fullname-input">Full Name</label>
            <div style={{ position: "relative" }}>
              <User 
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
                id="fullname-input"
                type="text"
                className="form-input"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ paddingLeft: "40px", padding: "0.65rem 1rem 0.65rem 40px" }}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: "1rem" }}>
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
                style={{ paddingLeft: "40px", padding: "0.65rem 1rem 0.65rem 40px" }}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: "1rem" }}>
            <label className="form-label" htmlFor="password-input">Password (6+ characters)</label>
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
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: "40px", padding: "0.65rem 1rem 0.65rem 40px" }}
                required
              />
            </div>
          </div>

          {/* Premium Role Selector */}
          <div className="form-group" style={{ marginBottom: "1.25rem" }}>
            <label className="form-label">Select Account Role</label>
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0.75rem"
            }}>
              <div 
                onClick={() => setRole("user")}
                style={{
                  border: `1.5px solid ${role === "user" ? "var(--primary)" : "var(--border-light)"}`,
                  background: role === "user" ? "var(--primary-light)" : "var(--bg-secondary)",
                  padding: "0.6rem 0.75rem",
                  borderRadius: "var(--radius-md)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  transition: "var(--transition-fast)"
                }}
              >
                <UserCheck size={16} color={role === "user" ? "var(--primary)" : "var(--text-secondary)"} />
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: "0.82rem", fontWeight: 700, color: role === "user" ? "var(--primary)" : "var(--text-primary)" }}>User</div>
                  <div style={{ fontSize: "0.68rem", color: "var(--text-secondary)" }}>Manage own tasks</div>
                </div>
              </div>

              <div 
                onClick={() => setRole("admin")}
                style={{
                  border: `1.5px solid ${role === "admin" ? "var(--secondary)" : "var(--border-light)"}`,
                  background: role === "admin" ? "var(--secondary-light)" : "var(--bg-secondary)",
                  padding: "0.6rem 0.75rem",
                  borderRadius: "var(--radius-md)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  transition: "var(--transition-fast)"
                }}
              >
                <Shield size={16} color={role === "admin" ? "var(--secondary)" : "var(--text-secondary)"} />
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: "0.82rem", fontWeight: 700, color: role === "admin" ? "var(--secondary)" : "var(--text-primary)" }}>Admin</div>
                  <div style={{ fontSize: "0.68rem", color: "var(--text-secondary)" }}>Manage all system records</div>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", padding: "0.65rem 1.25rem" }}
            disabled={loading}
          >
            {loading ? "Registering..." : (
              <>
                <UserPlus size={16} /> Sign Up
              </>
            )}
          </button>
        </form>

        <div className="auth-divider" style={{ margin: "1rem 0" }}>Or continue with</div>

        <button
          type="button"
          onClick={handleGoogleSignUp}
          className="google-signin-btn"
          style={{ padding: "0.6rem 0.75rem" }}
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
          Sign up with Google
        </button>

        <div className="auth-footer" style={{ marginTop: "1.25rem" }}>
          Already have an account?{" "}
          <Link to="/signin" className="auth-footer-link">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
