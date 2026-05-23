import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  getTasks, 
  createTask, 
  updateTask, 
  deleteTask, 
  getAllUsers,
  updateUserRole 
} from "../firebase/services";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Eye, 
  Users, 
  Shield, 
  FileSpreadsheet, 
  CheckCircle2, 
  Clock, 
  UserCheck, 
  AlertCircle,
  X,
  Filter,
  Inbox,
  Calendar
} from "lucide-react";

const AdminDashboard = () => {
  const { user, userProfile } = useAuth();
  
  // States
  const [tasks, setTasks] = useState([]);
  const [systemUsers, setSystemUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter State
  const [taskSearch, setTaskSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all"); // Filter by specific user

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
  const [formAssigneeId, setFormAssigneeId] = useState(""); // Target user
  
  const [formError, setFormError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("tasks"); // 'tasks' or 'users'

  // Fetch all system data
  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch all tasks from all users
      const allTasks = await getTasks(user.uid, "admin");
      setTasks(allTasks);

      // Fetch all registered users
      const allUsers = await getAllUsers();
      setSystemUsers(allUsers);
    } catch (err) {
      console.error("Failed to fetch admin dashboard datasets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  // Open modal for Create
  const handleCreateOpen = () => {
    setEditingTask(null);
    setFormTitle("");
    setFormDesc("");
    setFormCategory("Development");
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setFormDueDate(tomorrow.toISOString().split("T")[0]);
    
    setFormPriority("Medium");
    setFormStatus("To Do");
    setFormAssigneeId(user.uid); // Defaults to Admin self-assigned
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
    setFormAssigneeId(task.userId);
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
    
    // Find assignee details
    const assignee = systemUsers.find(u => u.uid === formAssigneeId) || userProfile;

    const taskData = {
      title: formTitle,
      description: formDesc,
      category: formCategory,
      dueDate: formDueDate,
      priority: formPriority,
      status: formStatus,
      userId: assignee.uid,
      userEmail: assignee.email,
      userName: assignee.displayName
    };

    try {
      if (editingTask) {
        await updateTask(editingTask.id, taskData);
      } else {
        await createTask(taskData);
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error("Admin task save error:", err);
      setFormError("Failed to save changes. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Task
  const handleDelete = async (taskId) => {
    if (window.confirm("As an Administrator, you are deleting a record globally. Proceed?")) {
      try {
        await deleteTask(taskId);
        fetchData();
      } catch (err) {
        console.error("Delete task failed:", err);
        alert("Failed to delete task.");
      }
    }
  };

  // Update User Role
  const handleRoleChange = async (targetUid, newRole) => {
    if (targetUid === user.uid) {
      return alert("For safety precautions, you cannot modify your own administrative privileges.");
    }

    if (window.confirm(`Are you sure you want to change this user's role to ${newRole.toUpperCase()}?`)) {
      try {
        await updateUserRole(targetUid, newRole);
        // If in mock demo mode, update the sessionStorage active profile too just in case
        fetchData();
      } catch (err) {
        console.error("Failed to update role:", err);
        alert("Role update failed.");
      }
    }
  };

  // Calculate Global Metrics
  const totalUsersCount = systemUsers.length;
  const adminUsersCount = systemUsers.filter(u => u.role === "admin").length;
  const normalUsersCount = systemUsers.filter(u => u.role === "user").length;

  const totalTasksCount = tasks.length;
  const completedCount = tasks.filter(t => t.status === "Completed").length;
  const inProgressCount = tasks.filter(t => t.status === "In Progress").length;
  const toDoCount = tasks.filter(t => t.status === "To Do").length;
  
  const completionRate = totalTasksCount > 0 ? Math.round((completedCount / totalTasksCount) * 100) : 0;

  // Filter Tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      (task.title || '').toLowerCase().includes(taskSearch.toLowerCase()) || 
      (task.description || '').toLowerCase().includes(taskSearch.toLowerCase()) ||
      (task.category || '').toLowerCase().includes(taskSearch.toLowerCase()) ||
      (task.userName || '').toLowerCase().includes(taskSearch.toLowerCase()) ||
      (task.userEmail || '').toLowerCase().includes(taskSearch.toLowerCase());
      
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
    const matchesUser = userFilter === "all" || task.userId === userFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesUser;
  });

  // Filter Users
  const filteredUsers = systemUsers.filter(u => {
    return (
      (u.displayName || '').toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.role || '').toLowerCase().includes(userSearch.toLowerCase())
    );
  });

  return (
    <div className="app-container">
      <Sidebar />
      
      <main className="main-content">
        <Header title="Administrative Control Center" />
        
        <div className="page-wrapper">
          {/* Analytics Dashboard Grid */}
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-icon-wrapper secondary">
                <Users size={24} />
              </div>
              <div className="metric-data">
                <span className="metric-label">Registered Members</span>
                <span className="metric-value">{totalUsersCount}</span>
                <span className="metric-trend" style={{ color: "var(--text-secondary)" }}>
                  {adminUsersCount} Admins | {normalUsersCount} Users
                </span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-wrapper primary">
                <FileSpreadsheet size={24} />
              </div>
              <div className="metric-data">
                <span className="metric-label">Total Shared Tasks</span>
                <span className="metric-value">{totalTasksCount}</span>
                <span className="metric-trend" style={{ color: "var(--text-secondary)" }}>Global database size</span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-wrapper success">
                <CheckCircle2 size={24} />
              </div>
              <div className="metric-data">
                <span className="metric-label">Finished Jobs</span>
                <span className="metric-value">{completedCount}</span>
                <span className="metric-trend" style={{ color: "var(--success)" }}>
                  {inProgressCount} in progress
                </span>
              </div>
            </div>

            <div className="metric-card">
              <div style={{ position: "relative", width: "42px", height: "42px", display: "flex", alignItems: "center", justifyContent: "center" }}>
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
                    stroke="var(--secondary)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    style={{ transition: "stroke-dasharray 0.5s ease" }}
                  />
                </svg>
                <div style={{ position: "absolute", fontSize: "0.75rem", fontWeight: 700 }}>{completionRate}%</div>
              </div>
              <div className="metric-data" style={{ marginLeft: "0.75rem" }}>
                <span className="metric-label">System Performance</span>
                <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-secondary)", marginTop: "0.15rem" }}>
                  {completionRate > 50 ? "Healthy operation" : "Action required"}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div style={{
            display: "flex",
            borderBottom: "2px solid var(--border-light)",
            marginBottom: "2rem",
            gap: "1.5rem"
          }}>
            <button
              onClick={() => setActiveTab("tasks")}
              style={{
                background: "none",
                border: "none",
                padding: "0.75rem 0.5rem",
                fontSize: "1rem",
                fontWeight: 700,
                color: activeTab === "tasks" ? "var(--primary)" : "var(--text-secondary)",
                borderBottom: activeTab === "tasks" ? "3px solid var(--primary)" : "3px solid transparent",
                cursor: "pointer",
                transition: "var(--transition-fast)"
              }}
            >
              Task Management
            </button>
            <button
              onClick={() => setActiveTab("users")}
              style={{
                background: "none",
                border: "none",
                padding: "0.75rem 0.5rem",
                fontSize: "1rem",
                fontWeight: 700,
                color: activeTab === "users" ? "var(--primary)" : "var(--text-secondary)",
                borderBottom: activeTab === "users" ? "3px solid var(--primary)" : "3px solid transparent",
                cursor: "pointer",
                transition: "var(--transition-fast)"
              }}
            >
              User Directory
            </button>
          </div>

          {/* ==========================================
              TAB 1: TASK MANAGEMENT
              ========================================== */}
          {activeTab === "tasks" && (
            <>
              {/* Actions row */}
              <div className="dashboard-actions-row">
                <div className="dashboard-title-group">
                  <h2>System-Wide Documents</h2>
                  <p>As Admin, you have write permissions on all registered files</p>
                </div>

                <button onClick={handleCreateOpen} className="btn btn-primary">
                  <Plus size={16} /> Assign Task
                </button>
              </div>

              {/* Filters Box */}
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
                      placeholder="Search title, description, assignee..."
                      className="form-input"
                      value={taskSearch}
                      onChange={(e) => setTaskSearch(e.target.value)}
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
                      value={userFilter}
                      onChange={(e) => setUserFilter(e.target.value)}
                      style={{ width: "140px", padding: "0.45rem 1rem", fontSize: "0.82rem" }}
                    >
                      <option value="all">All Assignees</option>
                      {systemUsers.map(u => (
                        <option key={u.uid} value={u.uid}>{u.displayName}</option>
                      ))}
                    </select>
                    
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

              {/* Tasks List */}
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
                    Global Archive Empty
                  </h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", maxWidth: "420px", marginBottom: "1.5rem" }}>
                    There are no system documents matching the query parameters.
                  </p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="nexus-table">
                    <thead>
                      <tr>
                        <th>Title & Category</th>
                        <th>Assignee</th>
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
                                style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.92rem" }}
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
                            <div style={{ display: "flex", flexDirection: "column" }}>
                              <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)" }}>
                                {task.userName}
                              </span>
                              <span style={{ fontSize: "0.72rem", color: "var(--text-tertiary)" }}>
                                {task.userEmail}
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
                                title="Open detailed view"
                              >
                                <Eye size={14} />
                              </Link>
                              <button 
                                onClick={() => handleEditOpen(task)} 
                                className="btn btn-secondary btn-icon-only"
                                style={{ padding: "0.35rem" }}
                                title="Modify task settings"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button 
                                onClick={() => handleDelete(task.id)} 
                                className="btn btn-danger btn-icon-only"
                                style={{ padding: "0.35rem" }}
                                title="Purge task"
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
            </>
          )}

          {/* ==========================================
              TAB 2: USER DIRECTORY
              ========================================== */}
          {activeTab === "users" && (
            <>
              <div className="dashboard-actions-row">
                <div className="dashboard-title-group">
                  <h2>System User Directory</h2>
                  <p>Audit registered credentials and dynamically adjust permissions roles</p>
                </div>
              </div>

              {/* Search Bar */}
              <div className="glass-card" style={{ padding: "1.25rem", borderRadius: "var(--radius-md)", marginBottom: "1.5rem" }}>
                <div style={{ position: "relative" }}>
                  <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
                  <input
                    type="text"
                    placeholder="Search name, email, or role..."
                    className="form-input"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    style={{ paddingLeft: "36px", padding: "0.5rem 1rem 0.5rem 36px", fontSize: "0.85rem" }}
                  />
                </div>
              </div>

              {/* Users Grid */}
              {loading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
                  <div className="spinner"></div>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="glass-card" style={{ padding: "3rem", textAlign: "center" }}>
                  <Inbox size={48} style={{ color: "var(--text-tertiary)", opacity: 0.6, marginBottom: "1rem" }} />
                  <h3>No matching user records</h3>
                </div>
              ) : (
                <div className="table-container">
                  <table className="nexus-table">
                    <thead>
                      <tr>
                        <th>User Identity</th>
                        <th>Email Contact</th>
                        <th>Created Timestamp</th>
                        <th>Assigned Access Scope</th>
                        <th style={{ textAlign: "right" }}>Update Role Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u) => {
                        const isSelf = u.uid === user.uid;
                        
                        return (
                          <tr key={u.uid}>
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                <div style={{
                                  width: "36px",
                                  height: "36px",
                                  borderRadius: "var(--radius-full)",
                                  backgroundColor: "var(--primary-light)",
                                  color: "var(--primary)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontWeight: 700,
                                  border: "1.5px solid var(--border-light)",
                                  overflow: "hidden"
                                }}>
                                  {u.photoURL ? (
                                    <img src={u.photoURL} alt={u.displayName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                  ) : (
                                    u.displayName[0].toUpperCase()
                                  )}
                                </div>
                                <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>
                                  {u.displayName} {isSelf && <span style={{ color: "var(--text-tertiary)", fontWeight: 500 }}>(You)</span>}
                                </span>
                              </div>
                            </td>
                            <td>
                              <span style={{ fontSize: "0.88rem" }}>{u.email}</span>
                            </td>
                            <td>
                              <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                                <Calendar size={14} /> 
                                {new Date(u.createdAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric"
                                })}
                              </span>
                            </td>
                            <td>
                              <span className={`role-badge ${u.role === "admin" ? "admin" : "user"}`}>
                                {u.role}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                <select
                                  className="form-select"
                                  value={u.role}
                                  onChange={(e) => handleRoleChange(u.uid, e.target.value)}
                                  disabled={isSelf}
                                  style={{
                                    width: "120px",
                                    padding: "0.3rem 0.5rem",
                                    fontSize: "0.8rem",
                                    borderRadius: "var(--radius-sm)",
                                    border: isSelf ? "1px dashed var(--border-medium)" : "1.5px solid var(--border-light)"
                                  }}
                                >
                                  <option value="user">User</option>
                                  <option value="admin">Admin</option>
                                </select>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Elegant Modal Dialog (Create/Edit Task Assignee) */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingTask ? "Edit Global Assignment" : "Assign Global Task"}</h3>
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
                    placeholder="e.g. Database Index Optimization"
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
                    placeholder="Explain task scope and assignment metrics..."
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    disabled={actionLoading}
                  />
                </div>

                {/* Assignment Target */}
                <div className="form-group">
                  <label className="form-label" htmlFor="assignee-select">Assign Responsibility To</label>
                  <select
                    id="assignee-select"
                    className="form-select"
                    value={formAssigneeId}
                    onChange={(e) => setFormAssigneeId(e.target.value)}
                    disabled={actionLoading}
                  >
                    {systemUsers.map(u => (
                      <option key={u.uid} value={u.uid}>
                        {u.displayName} ({u.email}) - {u.role.toUpperCase()}
                      </option>
                    ))}
                  </select>
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
                  {actionLoading ? "Saving..." : (editingTask ? "Save Changes" : "Assign Task")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
