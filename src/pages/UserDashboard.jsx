import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  getTasks, 
  createTask, 
  updateTask, 
  deleteTask 
} from "../firebase/services";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Eye, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  FileText,
  Filter,
  X,
  TrendingUp,
  Inbox
} from "lucide-react";

const UserDashboard = () => {
  const { user, userProfile } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  
  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formCategory, setFormCategory] = useState("Development");
  const [formDueDate, setFormDueDate] = useState("");
  const [formPriority, setFormPriority] = useState("Medium");
  const [formStatus, setFormStatus] = useState("To Do");
  
  const [formError, setFormError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch user tasks
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const userTasks = await getTasks(user.uid, "user");
      setTasks(userTasks);
    } catch (err) {
      console.error("Failed to load tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  // Open modal for Create
  const handleCreateOpen = () => {
    setEditingTask(null);
    setFormTitle("");
    setFormDesc("");
    setFormCategory("Development");
    
    // Set default due date as tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setFormDueDate(tomorrow.toISOString().split("T")[0]);
    
    setFormPriority("Medium");
    setFormStatus("To Do");
    setFormError("");
    setShowModal(true);
  };

  // Open modal for Edit
  const handleEditOpen = (task) => {
    setEditingTask(task);
    setFormTitle(task.title);
    setFormDesc(task.description);
    setFormCategory(task.category);
    setFormDueDate(task.dueDate);
    setFormPriority(task.priority);
    setFormStatus(task.status);
    setFormError("");
    setShowModal(true);
  };

  // Submit Form (Create or Edit)
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      return setFormError("Title is required.");
    }
    
    setFormError("");
    setActionLoading(true);
    
    const taskData = {
      title: formTitle,
      description: formDesc,
      category: formCategory,
      dueDate: formDueDate,
      priority: formPriority,
      status: formStatus,
      userId: user.uid,
      userEmail: userProfile.email,
      userName: userProfile.displayName
    };

    try {
      if (editingTask) {
        await updateTask(editingTask.id, taskData);
      } else {
        await createTask(taskData);
      }
      setShowModal(false);
      fetchTasks();
    } catch (err) {
      console.error("Error saving task:", err);
      setFormError("Failed to save changes. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Task
  const handleDelete = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task? This action cannot be undone.")) {
      try {
        await deleteTask(taskId);
        fetchTasks();
      } catch (err) {
        console.error("Delete task failed:", err);
        alert("Failed to delete task.");
      }
    }
  };

  // Calculate Metrics
  const totalTasksCount = tasks.length;
  const completedCount = tasks.filter(t => t.status === "Completed").length;
  const inProgressCount = tasks.filter(t => t.status === "In Progress").length;
  const toDoCount = tasks.filter(t => t.status === "To Do").length;
  const completionRate = totalTasksCount > 0 ? Math.round((completedCount / totalTasksCount) * 100) : 0;

  // Filter & Search Logic
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      (task.title || '').toLowerCase().includes(search.toLowerCase()) || 
      (task.description || '').toLowerCase().includes(search.toLowerCase()) ||
      (task.category || '').toLowerCase().includes(search.toLowerCase());
      
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="app-container">
      <Sidebar />
      
      <main className="main-content">
        <Header title="Personal Workspace" />
        
        <div className="page-wrapper">
          {/* Analytics Section */}
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-icon-wrapper primary">
                <FileText size={24} />
              </div>
              <div className="metric-data">
                <span className="metric-label">Total Documents</span>
                <span className="metric-value">{totalTasksCount}</span>
                <span className="metric-trend" style={{ color: "var(--text-secondary)" }}>Active tasks</span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-wrapper warning">
                <Clock size={24} />
              </div>
              <div className="metric-data">
                <span className="metric-label">In Progress</span>
                <span className="metric-value">{inProgressCount}</span>
                <span className="metric-trend" style={{ color: "var(--warning)" }}>Pencil drafts</span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-wrapper success">
                <CheckCircle size={24} />
              </div>
              <div className="metric-data">
                <span className="metric-label">Completed</span>
                <span className="metric-value">{completedCount}</span>
                <span className="metric-trend" style={{ color: "var(--success)" }}>Ready items</span>
              </div>
            </div>

            <div className="metric-card">
              <div style={{ position: "relative", width: "42px", height: "42px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {/* Circular CSS Progress Indicator */}
                <svg viewBox="0 0 36 36" style={{ width: "44px", height: "44px", transform: "rotate(-90deg)" }}>
                  <path
                    className="circle-bg"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="var(--bg-tertiary)"
                    strokeWidth="3.5"
                  />
                  <path
                    className="circle"
                    strokeDasharray={`${completionRate}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    style={{ transition: "stroke-dasharray 0.5s ease" }}
                  />
                </svg>
                <div style={{ position: "absolute", fontSize: "0.75rem", fontWeight: 700 }}>{completionRate}%</div>
              </div>
              <div className="metric-data" style={{ marginLeft: "0.75rem" }}>
                <span className="metric-label">Completion Efficiency</span>
                <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-secondary)", marginTop: "0.15rem" }}>
                  {totalTasksCount > 0 ? `${completedCount} of ${totalTasksCount} fulfilled` : "No active items"}
                </span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="dashboard-actions-row">
            <div className="dashboard-title-group">
              <h2>My Document Registries</h2>
              <p>Create and update your secured files here</p>
            </div>

            <button onClick={handleCreateOpen} className="btn btn-primary">
              <Plus size={16} /> New Document
            </button>
          </div>

          {/* Search and Filters Bar */}
          <div className="glass-card" style={{ padding: "1.25rem", borderRadius: "var(--radius-md)", marginBottom: "1.5rem" }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "1rem"
            }}>
              {/* Search */}
              <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
                <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
                <input
                  type="text"
                  placeholder="Search title, details, category..."
                  className="form-input"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ paddingLeft: "36px", padding: "0.5rem 1rem 0.5rem 36px", fontSize: "0.85rem" }}
                />
              </div>

              {/* Filters */}
              <div className="filters-bar" style={{ flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.82rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                  <Filter size={14} /> Filter:
                </div>
                
                <select 
                  className="form-select" 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{ width: "130px", padding: "0.45rem 1rem", fontSize: "0.82rem" }}
                >
                  <option value="all">All Statuses</option>
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>

                <select 
                  className="form-select" 
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  style={{ width: "130px", padding: "0.45rem 1rem", fontSize: "0.82rem" }}
                >
                  <option value="all">All Priorities</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table Container */}
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
              <div className="spinner"></div>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="glass-card" style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "4rem 2rem",
              textAlign: "center"
            }}>
              <Inbox size={48} style={{ color: "var(--text-tertiary)", opacity: 0.6, marginBottom: "1rem" }} />
              <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.35rem" }}>
                No Documents Listed
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", maxWidth: "420px", marginBottom: "1.5rem" }}>
                There are no files matching your filters. Create a new document registry to get started.
              </p>
              <button onClick={handleCreateOpen} className="btn btn-secondary btn-sm">
                <Plus size={14} /> Add First Document
              </button>
            </div>
          ) : (
            <div className="table-container">
              <table className="nexus-table">
                <thead>
                  <tr>
                    <th>Title & Category</th>
                    <th>Due Date</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map((task) => (
                    <tr key={task.id}>
                      <td>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <Link 
                            to={`/tasks/${task.id}`} 
                            style={{ 
                              fontWeight: 700, 
                              color: "var(--text-primary)", 
                              fontSize: "0.92rem", 
                              hover: { color: "var(--primary)" } 
                            }}
                            className="task-title-link"
                          >
                            {task.title}
                          </Link>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", marginTop: "0.15rem", fontWeight: 600 }}>
                            {task.category}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>
                          {new Date(task.dueDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                          })}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-${task.priority.toLowerCase()}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-${task.status.toLowerCase().replace(" ", "")}`}>
                          <span className="badge-dot"></span>
                          {task.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.35rem" }}>
                          <Link 
                            to={`/tasks/${task.id}`} 
                            className="btn btn-secondary btn-icon-only" 
                            style={{ padding: "0.35rem" }}
                            title="Open detailed page"
                          >
                            <Eye size={14} />
                          </Link>
                          <button 
                            onClick={() => handleEditOpen(task)} 
                            className="btn btn-secondary btn-icon-only"
                            style={{ padding: "0.35rem" }}
                            title="Edit task"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            onClick={() => handleDelete(task.id)} 
                            className="btn btn-danger btn-icon-only"
                            style={{ padding: "0.35rem" }}
                            title="Delete task"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Elegant Modal Dialog (Create/Edit Task) */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingTask ? "Modify Document Entry" : "Create New Document Entry"}</h3>
              <button onClick={() => setShowModal(false)} className="modal-close-btn">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit}>
              <div className="modal-body" style={{ maxHeight: "calc(100vh - 200px)", overflowY: "auto" }}>
                {formError && (
                  <div className="error-banner" style={{ padding: "0.65rem 0.85rem", marginBottom: "1rem" }}>
                    <AlertCircle size={16} />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label" htmlFor="task-title-input">Title</label>
                  <input
                    id="task-title-input"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Design Interface Mockups"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    required
                    disabled={actionLoading}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="task-desc-input">Description Details</label>
                  <textarea
                    id="task-desc-input"
                    className="form-textarea"
                    placeholder="Describe task scope, expectations, and milestones..."
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    disabled={actionLoading}
                  />
                </div>

                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem"
                }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="task-cat-select">Category</label>
                    <select
                      id="task-cat-select"
                      className="form-select"
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      disabled={actionLoading}
                    >
                      <option value="Design">Design</option>
                      <option value="Development">Development</option>
                      <option value="DevOps">DevOps</option>
                      <option value="QA">QA</option>
                      <option value="Research">Research</option>
                      <option value="Marketing">Marketing</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="task-due-input">Due Date</label>
                    <input
                      id="task-due-input"
                      type="date"
                      className="form-input"
                      value={formDueDate}
                      onChange={(e) => setFormDueDate(e.target.value)}
                      required
                      disabled={actionLoading}
                    />
                  </div>
                </div>

                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem"
                }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="task-priority-select">Priority Level</label>
                    <select
                      id="task-priority-select"
                      className="form-select"
                      value={formPriority}
                      onChange={(e) => setFormPriority(e.target.value)}
                      disabled={actionLoading}
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="task-status-select">Status</label>
                    <select
                      id="task-status-select"
                      className="form-select"
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value)}
                      disabled={actionLoading}
                    >
                      <option value="To Do">To Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="btn btn-secondary btn-sm"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary btn-sm"
                  disabled={actionLoading}
                >
                  {actionLoading ? "Saving..." : (editingTask ? "Save Changes" : "Create Document")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
