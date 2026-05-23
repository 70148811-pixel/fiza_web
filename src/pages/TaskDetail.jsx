import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getSingleTask, deleteTask } from "../firebase/services";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { 
  ArrowLeft, 
  Calendar, 
  Trash2, 
  Edit2, 
  User, 
  Mail, 
  Tag, 
  Clock, 
  ShieldCheck, 
  AlertCircle,
  FolderDot
} from "lucide-react";

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTaskDetails = async () => {
      try {
        setLoading(true);
        setError("");
        const taskData = await getSingleTask(id);
        
        // Strict Security Access Check
        // Non-admins can only view their own tasks
        const isAdmin = userProfile?.role === "admin";
        if (!isAdmin && taskData.userId !== user.uid) {
          // Unauthorized to view this task -> redirect to unauthorized page
          navigate("/unauthorized", { replace: true });
          return;
        }

        setTask(taskData);
      } catch (err) {
        console.error("Error reading task details:", err);
        setError("The requested task document could not be found or you do not have permission to view it.");
      } finally {
        setLoading(false);
      }
    };

    if (user && id) {
      fetchTaskDetails();
    }
  }, [id, user, userProfile, navigate]);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to permanently delete this document? This action is irreversible.")) {
      try {
        await deleteTask(task.id);
        const redirectPath = userProfile?.role === "admin" ? "/admin" : "/dashboard";
        navigate(redirectPath);
      } catch (err) {
        console.error("Purging document failed:", err);
        alert("Failed to delete task.");
      }
    }
  };

  const isAdmin = userProfile?.role === "admin";

  return (
    <div className="app-container">
      <Sidebar />
      
      <main className="main-content">
        <Header title="Document Inspection" />
        
        <div className="page-wrapper">
          <div className="detail-page-container">
            {/* Back Nav Link */}
            <div style={{ marginBottom: "1.5rem" }}>
              <Link 
                to={isAdmin ? "/admin" : "/dashboard"} 
                style={{ 
                  display: "inline-flex", 
                  alignItems: "center", 
                  gap: "0.45rem", 
                  fontSize: "0.88rem", 
                  fontWeight: 700, 
                  color: "var(--text-secondary)" 
                }}
              >
                <ArrowLeft size={16} /> Back to Dashboard
              </Link>
            </div>

            {loading ? (
              <div className="glass-card" style={{ display: "flex", justifyContent: "center", padding: "6rem" }}>
                <div className="spinner"></div>
              </div>
            ) : error ? (
              <div className="glass-card" style={{ textAlign: "center", padding: "4rem 2rem" }}>
                <AlertCircle size={48} color="var(--danger)" style={{ marginBottom: "1rem" }} />
                <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.3rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                  Record Fetch Failed
                </h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", maxWidth: "480px", margin: "0 auto 1.5rem" }}>
                  {error}
                </p>
                <Link to={isAdmin ? "/admin" : "/dashboard"} className="btn btn-primary btn-sm">
                  Return to Dashboard
                </Link>
              </div>
            ) : (
              <div className="glass-card" style={{ padding: "2.5rem" }}>
                {/* Detail Header */}
                <div className="detail-header">
                  <div className="detail-title">
                    <h1>{task.title}</h1>
                    <div className="detail-badges">
                      <span className={`badge badge-${task.priority.toLowerCase()}`}>
                        {task.priority} Priority
                      </span>
                      <span className={`badge badge-${task.status.toLowerCase().replace(" ", "")}`}>
                        <span className="badge-dot"></span>
                        {task.status}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button 
                      onClick={handleDelete} 
                      className="btn btn-danger btn-sm"
                      style={{ padding: "0.5rem" }}
                      title="Purge Task"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Description details */}
                <div className="detail-section">
                  <h4>Document Specification</h4>
                  <div className="detail-desc">
                    {task.description || (
                      <em style={{ color: "var(--text-tertiary)" }}>No additional specifications provided for this document entry.</em>
                    )}
                  </div>
                </div>

                {/* Metadata Grid */}
                <div className="detail-section" style={{ marginTop: "2.5rem" }}>
                  <h4>Document Context Registry</h4>
                  
                  <div className="detail-metadata-grid">
                    <div className="meta-item">
                      <span>Category Group</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", color: "var(--primary)" }}>
                        <FolderDot size={14} /> {task.category}
                      </span>
                    </div>

                    <div className="meta-item">
                      <span>Assigned Due Date</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                        <Calendar size={14} /> 
                        {new Date(task.dueDate).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric"
                        })}
                      </span>
                    </div>

                    <div className="meta-item">
                      <span>Document Registrant</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                        <User size={14} /> {task.userName}
                      </span>
                    </div>

                    <div className="meta-item">
                      <span>Contact Email</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                        <Mail size={14} /> {task.userEmail}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Security Badge */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontSize: "0.78rem",
                  color: "var(--success)",
                  backgroundColor: "var(--success-light)",
                  padding: "0.6rem 0.85rem",
                  borderRadius: "var(--radius-md)",
                  fontWeight: 600,
                  width: "fit-content",
                  border: "1px solid rgba(16, 185, 129, 0.2)"
                }}>
                  <ShieldCheck size={16} /> Secured and validated by Cloud Firestore IAM guards.
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default TaskDetail;
