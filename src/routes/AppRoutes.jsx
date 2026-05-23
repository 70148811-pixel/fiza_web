import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ProtectedRoute, AdminRoute } from "./ProtectedRoute";

// Pages
import SignIn from "../pages/SignIn";
import SignUp from "../pages/SignUp";
import ForgotPassword from "../pages/ForgotPassword";
import Unauthorized from "../pages/Unauthorized";
import UserDashboard from "../pages/UserDashboard";
import AdminDashboard from "../pages/AdminDashboard";
import TaskDetail from "../pages/TaskDetail";
import ChatPage from "../pages/ChatPage";

// Dashboard Entry Switch
const DashboardRedirect = () => {
  const { userProfile } = useAuth();
  
  if (userProfile?.role === "admin") {
    return <Navigate to="/admin" replace />;
  }
  return <Navigate to="/dashboard" replace />;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Guest-Only Routes */}
      <Route 
        path="/signin" 
        element={!user ? <SignIn /> : <DashboardRedirect />} 
      />
      <Route 
        path="/signup" 
        element={!user ? <SignUp /> : <DashboardRedirect />} 
      />
      <Route 
        path="/forgot-password" 
        element={!user ? <ForgotPassword /> : <DashboardRedirect />} 
      />

      {/* Protected User Dashboard Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        }
      />

      {/* Protected Admin Dashboard Routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />

      {/* Protected Chat Route (Accessible to all registered users) */}
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        }
      />

      {/* Dynamic Task Details Route */}
      <Route
        path="/tasks/:id"
        element={
          <ProtectedRoute>
            <TaskDetail />
          </ProtectedRoute>
        }
      />

      {/* Access Denied Route */}
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Catch-all Routing */}
      <Route 
        path="*" 
        element={user ? <DashboardRedirect /> : <Navigate to="/signin" replace />} 
      />
    </Routes>
  );
};

export default AppRoutes;
