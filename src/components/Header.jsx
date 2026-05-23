import React from "react";
import { useAuth } from "../context/AuthContext";
import { Database, ShieldAlert, Sparkles } from "lucide-react";

const Header = ({ title }) => {
  const { userProfile, isDemo } = useAuth();

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  const isAdmin = userProfile?.role === "admin";

  return (
    <>
      {/* Dynamic System Banner */}
      {isDemo && (
        <div className="demo-mode-banner">
          <Sparkles size={14} />
          <span>
            Running in <strong>Workspace Demo Mode</strong> (Persisting in LocalStorage). Add your Firebase credentials to <code>.env</code> to hook up a real-time Firestore database.
          </span>
          <span className="demo-mode-badge">local db</span>
        </div>
      )}

      <header className="top-header">
        <div className="header-left">
          <h1>{title}</h1>
        </div>

        <div className="header-right">
          <div className="user-profile-widget">
            <div className="avatar-wrapper">
              {userProfile?.photoURL ? (
                <img 
                  src={userProfile.photoURL} 
                  alt={userProfile?.displayName} 
                  onError={(e) => {
                    // Fallback to initials if image fails
                    e.target.style.display = "none";
                    e.target.parentNode.textContent = getInitials(userProfile?.displayName);
                  }}
                />
              ) : (
                getInitials(userProfile?.displayName)
              )}
            </div>
            
            <div className="user-meta">
              <span className="user-meta-name">{userProfile?.displayName || "Loading..."}</span>
              <span 
                className={`role-badge ${isAdmin ? "admin" : "user"}`}
                style={{ fontSize: "0.6rem", marginTop: "0.15rem", width: "fit-content" }}
              >
                {userProfile?.role || "user"}
              </span>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
