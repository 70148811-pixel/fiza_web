import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, ArrowLeft } from "lucide-react";

const Unauthorized = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  // Auto-redirect after 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    const redirect = setTimeout(() => {
      navigate("/dashboard");
    }, 5000);

    return () => {
      clearInterval(timer);
      clearTimeout(redirect);
    };
  }, [navigate]);

  return (
    <div className="auth-page-container">
      <div className="auth-bg-blob auth-bg-blob-1"></div>
      <div className="auth-bg-blob auth-bg-blob-2"></div>
      
      <div className="auth-card" style={{ maxWidth: "500px" }}>
        <div style={{
          width: "72px",
          height: "72px",
          borderRadius: "var(--radius-lg)",
          backgroundColor: "var(--danger-light)",
          color: "var(--danger)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 1.5rem"
        }}>
          <ShieldAlert size={36} />
        </div>
        
        <h2 style={{
          fontFamily: "var(--font-heading)",
          fontSize: "1.75rem",
          fontWeight: 800,
          color: "var(--text-primary)",
          marginBottom: "0.75rem"
        }}>
          Access Denied
        </h2>
        
        <p style={{
          color: "var(--text-secondary)",
          fontSize: "0.95rem",
          lineHeight: "1.5",
          marginBottom: "1.5rem"
        }}>
          You do not have the required administrator privileges to view this section. Unauthorized access attempts are monitored and restricted.
        </p>

        <div style={{
          backgroundColor: "var(--bg-tertiary)",
          padding: "0.75rem",
          borderRadius: "var(--radius-md)",
          fontSize: "0.85rem",
          color: "var(--text-secondary)",
          fontWeight: 600,
          marginBottom: "2rem"
        }}>
          Redirecting you back to your workspace in <span style={{ color: "var(--primary)", fontSize: "1rem", fontWeight: 700 }}>{countdown}</span> seconds...
        </div>

        <button 
          onClick={() => navigate("/dashboard")}
          className="btn btn-primary"
          style={{ width: "100%" }}
        >
          <ArrowLeft size={16} /> Return to Workspace
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;
