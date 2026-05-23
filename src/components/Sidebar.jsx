import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  LayoutDashboard, 
  MessageSquare, 
  LogOut, 
  UserX, 
  ShieldAlert, 
  X,
  AlertTriangle
} from "lucide-react";

const Sidebar = () => {
  const { userProfile, logout, deleteAccount, isDemo } = useAuth();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/signin");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (confirmEmail !== userProfile?.email) {
      return setDeleteError("Email address does not match your account.");
    }
    
    setDeleteError("");
    setDeleting(true);
    try {
      await deleteAccount();
      setShowDeleteModal(false);
      navigate("/signin");
    } catch (err) {
      console.error("Account deletion failed:", err);
      setDeleteError("Could not delete account. If you logged in recently, please re-authenticate and try again.");
    } finally {
      setDeleting(false);
    }
  };

  const isSystemAdmin = userProfile?.role === "admin";

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-logo-container">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="32" height="32" className="logo-icon">
            <defs>
              <linearGradient id="sideLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#4f46e5" />
                <stop offset="100%" stop-color="#8b5cf6" />
              </linearGradient>
            </defs>
            <path d="M 30 50 C 40 30, 60 70, 70 50" fill="none" stroke="url(#sideLogoGrad)" stroke-width="8" stroke-linecap="round" />
            <circle cx="30" cy="50" r="10" fill="#4f46e5" />
            <circle cx="70" cy="50" r="10" fill="#8b5cf6" />
          </svg>
          <span className="logo-text">NexusHub</span>
        </div>

        <nav className="sidebar-nav">
          <NavLink 
            to={isSystemAdmin ? "/admin" : "/dashboard"} 
            className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink 
            to="/chat" 
            className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
          >
            <MessageSquare size={18} />
            <span>Live Chat</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <button 
            onClick={() => setShowDeleteModal(true)} 
            className="sidebar-link"
            style={{ 
              width: "100%", 
              color: "var(--danger)", 
              backgroundColor: "transparent", 
              border: "none", 
              textAlign: "left",
              justifyContent: "flex-start",
              padding: "0.75rem 1rem"
            }}
          >
            <UserX size={18} color="var(--danger)" />
            <span>Delete Account</span>
          </button>
          
          <button onClick={handleLogout} className="signout-btn">
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Elegant Account Deletion Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "460px" }}>
            <div className="modal-header">
              <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--danger)" }}>
                <ShieldAlert size={20} /> Close Workspace Account
              </h3>
              <button onClick={() => setShowDeleteModal(false)} className="modal-close-btn">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleDeleteAccount}>
              <div className="modal-body">
                <div style={{
                  display: "flex",
                  gap: "0.75rem",
                  padding: "0.75rem 1rem",
                  backgroundColor: "var(--danger-light)",
                  color: "var(--danger)",
                  borderRadius: "var(--radius-md)",
                  fontSize: "0.85rem",
                  lineHeight: "1.45",
                  fontWeight: 600,
                  marginBottom: "1.25rem"
                }}>
                  <AlertTriangle size={24} style={{ flexShrink: 0 }} />
                  <span>
                    <strong>CRITICAL WARNING:</strong> Deleting your account is permanent. All of your personal documents, task listings, and profile metadata will be completely expunged from the system.
                  </span>
                </div>

                <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "1.25rem" }}>
                  To proceed, please type your email address <strong style={{ color: "var(--text-primary)" }}>{userProfile?.email}</strong> below:
                </p>

                {deleteError && (
                  <div className="error-banner" style={{ padding: "0.65rem 0.85rem", marginBottom: "1rem" }}>
                    <AlertCircle size={16} />
                    <span>{deleteError}</span>
                  </div>
                )}

                <div className="form-group">
                  <input
                    type="email"
                    className="form-input"
                    placeholder="Enter your email to confirm"
                    value={confirmEmail}
                    onChange={(e) => setConfirmEmail(e.target.value)}
                    required
                    style={{ border: "1.5px solid var(--danger)" }}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  onClick={() => setShowDeleteModal(false)} 
                  className="btn btn-secondary btn-sm"
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-danger btn-sm"
                  disabled={deleting || confirmEmail !== userProfile?.email}
                >
                  {deleting ? "Deactivating..." : "Delete Permanently"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
