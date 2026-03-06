import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./HomePage.css";

const HomePage = () => {
  const { user, isAuthenticated } = useContext(AuthContext);

  const adminLinks = [
    { to: "/reports", label: "Reports", icon: "📊" },
    { to: "/departments", label: "Departments", icon: "🏢" },
    { to: "/blocks", label: "Blocks", icon: "🏗️" },
    { to: "/rooms", label: "Rooms", icon: "🚪" },
    { to: "/roles", label: "Roles", icon: "🛡️" },
    { to: "/users", label: "Users", icon: "👥" },
    { to: "/programmes", label: "Programmes", icon: "📚" },
    { to: "/complaints", label: "Tickets", icon: "🗂️" },
  ];

  return (
    <div className="home-page animated-bg">
      <div className="home-container page-fade">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="brand-badge">TMS Platform</div>
          <h1 className="home-title">
            {isAuthenticated && user?.role === "SuperAdmin" ? (
              <>
                Super Admin <span>Dashboard</span>
              </>
            ) : (
              <>
                Complaint <span>Management</span>
              </>
            )}
          </h1>
          <p className="home-subtitle">
            A premium, high-efficiency platform designed to streamline facility maintenance and issue tracking.
          </p>
        </section>

        {/* Dynamic Content Section */}
        <main className="content-section">
          {isAuthenticated ? (
            <div className="user-welcome-card">
              <div className="user-info">
                <div className="avatar-placeholder">
                  {user?.username?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="user-details">
                  <h2>Welcome back, {user?.username}</h2>
                  <div className="role-tag">
                    <span className="role-dot"></span>
                    {user?.role} Access
                  </div>
                </div>
              </div>

              {user?.role === "SuperAdmin" && (
                <div className="dashboard-grid">
                  <div className="section-header">
                    <h3 className="section-label">⚡ Administrative Console</h3>
                  </div>
                  <div className="quick-links-container">
                    {adminLinks.map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        className="quick-link-card"
                      >
                        <div className="link-icon">{link.icon}</div>
                        <span className="link-label">{link.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {user?.role !== "SuperAdmin" && (
                <div className="user-dashboard-preview">
                  <h3 className="section-label">🚀 Getting Started</h3>
                  <div className="quick-links-container">
                    <Link to="/complaints/new" className="quick-link-card">
                      <div className="link-icon">✏️</div>
                      <span className="link-label">Raise Ticket</span>
                    </Link>
                    <Link to="/my-complaints" className="quick-link-card">
                      <div className="link-icon">📋</div>
                      <span className="link-label">View My Tickets</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="login-message">
              <p>Authentication required to access the dashboard system.</p>
              <Link to="/login" className="login-btn-large">
                Login to System
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default HomePage;
