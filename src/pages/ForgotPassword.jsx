import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Mail, ArrowLeft, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";

const ForgotPassword = () => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      return setError("Please enter your email address.");
    }
    setError("");
    setMessage("");
    setLoading(true);
    try {
      await resetPassword(email);
      setMessage("A password recovery link has been dispatched to your email address.");
      setEmail("");
    } catch (err) {
      console.error(err);
      if (err.code === "auth/user-not-found" || err.message?.includes("user-not-found")) {
        setError("No user profile is associated with this email address.");
      } else if (err.code === "auth/invalid-email" || err.message?.includes("invalid-email")) {
        setError("Please supply a valid email format.");
      } else {
        setError("Reset request failed. Please check your network and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-bg-blob auth-bg-blob-1"></div>
      <div className="auth-bg-blob auth-bg-blob-2"></div>

      <div className="auth-card" style={{ maxWidth: "440px" }}>
        <div className="auth-logo-header">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="56" height="56" className="logo-icon">
            <defs>
              <linearGradient id="resetGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#4f46e5" />
                <stop offset="100%" stop-color="#8b5cf6" />
              </linearGradient>
            </defs>
            <path d="M 30 50 C 40 30, 60 70, 70 50" fill="none" stroke="url(#resetGrad)" stroke-width="8" stroke-linecap="round" />
            <circle cx="30" cy="50" r="10" fill="#4f46e5" />
            <circle cx="70" cy="50" r="10" fill="#8b5cf6" />
          </svg>
          <h2>Reset Password</h2>
          <p>Retrieve access to your secure workspace</p>
        </div>

        {error && (
          <div className="error-banner">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="success-banner">
            <CheckCircle size={18} />
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: "1.5rem" }}>
            <label className="form-label" htmlFor="email-input">Registered Email</label>
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
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%" }}
            disabled={loading}
          >
            {loading ? "Processing..." : (
              <>
                <RefreshCw size={16} /> Recover Access
              </>
            )}
          </button>
        </form>

        <div className="auth-footer" style={{ marginTop: "1.5rem" }}>
          <Link to="/signin" className="auth-footer-link" style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem" }}>
            <ArrowLeft size={14} /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
