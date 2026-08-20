import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';

import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { ResumeUpload } from './pages/ResumeUpload';
import { QuestionGen } from './pages/QuestionGen';
import { MockInterview } from './pages/MockInterview';
import { SessionDetail } from './pages/SessionDetail';
import { AdminDashboard } from './pages/AdminDashboard';

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
          <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : <Signup />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/resumes" element={<ProtectedRoute><ResumeUpload /></ProtectedRoute>} />
          <Route path="/interview/new" element={<ProtectedRoute><ResumeUpload /></ProtectedRoute>} />
          <Route path="/interview/questions/:sessionId" element={<ProtectedRoute><QuestionGen /></ProtectedRoute>} />
          <Route path="/interview/play/:sessionId" element={<ProtectedRoute><MockInterview /></ProtectedRoute>} />
          <Route path="/interview/session/:sessionId" element={<ProtectedRoute><SessionDetail /></ProtectedRoute>} />

          {/* Admin Protected Route */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

          {/* Root Fallback */}
          <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
