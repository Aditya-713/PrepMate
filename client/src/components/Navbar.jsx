import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bot, LayoutDashboard, FileText, PlayCircle, Shield, LogOut, User } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="navbar">
      <div className="nav-container">
        <Link to="/" className="brand-logo">
          <Bot size={28} color="#818cf8" />
          <span>PrepMate</span>
        </Link>

        {user ? (
          <nav className="nav-links">
            <Link to="/dashboard" className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}>
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </Link>

            <Link to="/resumes" className={`nav-item ${isActive('/resumes') ? 'active' : ''}`}>
              <FileText size={18} />
              <span>Resumes & JD</span>
            </Link>

            <Link to="/interview/new" className={`nav-item ${isActive('/interview/new') ? 'active' : ''}`}>
              <PlayCircle size={18} />
              <span>New Mock Interview</span>
            </Link>

            {user.role === 'admin' && (
              <Link to="/admin" className={`nav-item ${isActive('/admin') ? 'active' : ''}`}>
                <Shield size={18} color="#f59e0b" />
                <span>Admin Console</span>
              </Link>
            )}

            <div className="nav-user">
              <div className="user-badge">
                <User size={14} color="#a5b4fc" />
                <span>{user.name}</span>
                {user.role === 'admin' && <span className="badge badge-warning">Admin</span>}
              </div>

              <button onClick={handleLogout} className="btn btn-secondary btn-sm" title="Log Out">
                <LogOut size={16} />
              </button>
            </div>
          </nav>
        ) : (
          <div className="nav-links">
            <Link to="/login" className="btn btn-secondary btn-sm">Log In</Link>
            <Link to="/signup" className="btn btn-primary btn-sm">Get Started</Link>
          </div>
        )}
      </div>
    </header>
  );
};
