import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useOffline } from '../contexts/OfflineContext';
import './Layout.css';

const Layout = ({ children }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { isOnline, pendingActions } = useOffline();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: '📊' },
    { name: 'Equipment', href: '/equipment', icon: '⚙️' },
    { name: 'Maintenance', href: '/maintenance', icon: '🔧' },
    { name: 'Issues', href: '/issues', icon: '⚠️' },
    { name: 'QR Scanner', href: '/scan', icon: '📱' }
  ];

  const handleLogout = () => {
    logout();
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="layout">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <button className="sidebar-toggle" onClick={toggleSidebar}>
              ☰
            </button>
            <div className="logo">
              <span className="logo-text">Mitsubishi Manufacturing</span>
            </div>
          </div>
          
          <div className="header-right">
            {/* Connection Status */}
            <div className={`connection-status ${isOnline ? 'online' : 'offline'}`}>
              <span className="status-dot"></span>
              <span className="status-text">
                {isOnline ? 'Online' : 'Offline'}
                {pendingActions.length > 0 && ` (${pendingActions.length} pending)`}
              </span>
            </div>
            
            {/* User Menu */}
            <div className="user-menu">
              <span className="user-name">{user?.firstName} {user?.lastName}</span>
              <span className="user-role">{user?.role}</span>
              <Link to="/profile" className="profile-link">Profile</Link>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-content">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`nav-item ${location.pathname === item.href ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text">{item.name}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Sidebar Overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}

      {/* Main Content */}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;