import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";

// Fullscreen Loading Spinner
export const LoadingScreen = () => {
  return (
    <div className="loader-container">
      <div className="pulse-logo">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="80" height="80">
          <defs>
            <linearGradient id="loadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#f43f5e" />
              <stop offset="100%" stop-color="#db2777" />
            </linearGradient>
          </defs>
          <path d="M 30 50 C 40 30, 60 70, 70 50" fill="none" stroke="url(#loadGrad)" stroke-width="8" stroke-linecap="round" />
          <circle cx="30" cy="50" r="10" fill="#f43f5e" />
          <circle cx="70" cy="50" r="10" fill="#db2777" />
        </svg>
      </div>
      <div className="spinner"></div>
      <p style={{ color: "var(--text-secondary)", fontWeight: 600, fontSize: "0.9rem" }}>
        Securing session workspace...
      </p>
    </div>
  );
};

// Route Guard for Authenticated Users
export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    // Redirect them to the signin page, but save the current location they were
    // trying to go to. This allows us to send them back there after they login.
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return children;
};

// Route Guard for Administrators Only
export const AdminRoute = ({ children }) => {
  const { user, userProfile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  if (userProfile?.role !== "admin") {
    // Authenticated but not an admin -> redirect to unauthorized
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};
