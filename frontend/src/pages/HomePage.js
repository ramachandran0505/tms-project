import React, { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { complaintService } from "../services/api";
import "./HomePage.css";

const HomePage = () => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, closed: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      if (!isAuthenticated) return;
      try {
        const res = await complaintService.getStats();
        setStats({
          total: res.data.total || 0,
          pending: res.data.pending || 0,
          inProgress: res.data.assigned || 0,
          closed: res.data.closed || 0,
        });
      } catch (err) {
        console.error("Failed to load dashboard metrics", err);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchDashboardStats();
  }, [isAuthenticated]);

  const adminLinks = [
    { to: "/reports", label: "Analytics & Reports", desc: "System analytics & logs", icon: "📊", tag: "Analytics" },
    { to: "/departments", label: "Departments", desc: "Manage campus divisions", icon: "🏢", tag: "Master" },
    { to: "/programmes", label: "Programmes", desc: "Academic degree paths", icon: "🎓", tag: "Academic" },
    { to: "/blocks", label: "Campus Blocks", desc: "Building structures & zones", icon: "🏗️", tag: "Facility" },
    { to: "/rooms", label: "Room Registry", desc: "Individual space units", icon: "🚪", tag: "Space" },
    { to: "/roles", label: "Roles & Permissions", desc: "Matrix security policies", icon: "🛡️", tag: "Security" },
    { to: "/users", label: "User Directory", desc: "Staff & student accounts", icon: "👥", tag: "Accounts" },
    { to: "/complaints", label: "Ticket Dispatch", desc: "Global issue management", icon: "📦", tag: "Operations" },
  ];

  return (
    <div className="home-dashboard-page">
      <div className="dashboard-content-container">
        {/* Top Hero Banner */}
        <section className="dashboard-hero-card">
          <div className="hero-left-meta">
            <div className="avatar-user-badge">
              {user?.profileImage ? (
                <img src={user.profileImage} alt="User" />
              ) : (
                user?.username?.charAt(0).toUpperCase() || "U"
              )}
            </div>
            <div className="hero-text-group">
              <div className="clearance-pill">
                <span className="pill-dot"></span>
                {user?.role === "SuperAdmin" ? "SUPERADMIN CLEARANCE" : "USER CLEARANCE"}
              </div>
              <h1>
                Welcome back, <span>{user?.username || "Operator"}</span>
              </h1>
              <p>Campus Operations & Facility Management Control System</p>
            </div>
          </div>

          <div className="hero-quick-cta">
            <Link to="/complaints/new" className="hero-primary-btn">
              <span>＋ Raise Ticket</span>
            </Link>
          </div>
        </section>

        {/* Live Metrics Grid */}
        <section className="metrics-summary-grid">
          <div className="metric-card total-metric">
            <div className="metric-icon">📂</div>
            <div className="metric-info">
              <span className="metric-number">{loadingStats ? "..." : stats.total}</span>
              <span className="metric-label">Total Tickets</span>
            </div>
          </div>

          <div className="metric-card pending-metric">
            <div className="metric-icon">⏳</div>
            <div className="metric-info">
              <span className="metric-number">{loadingStats ? "..." : stats.pending}</span>
              <span className="metric-label">Pending Action</span>
            </div>
          </div>

          <div className="metric-card progress-metric">
            <div className="metric-icon">🔄</div>
            <div className="metric-info">
              <span className="metric-number">{loadingStats ? "..." : stats.inProgress}</span>
              <span className="metric-label">In Progress</span>
            </div>
          </div>

          <div className="metric-card closed-metric">
            <div className="metric-icon">✅</div>
            <div className="metric-info">
              <span className="metric-number">{loadingStats ? "..." : stats.closed}</span>
              <span className="metric-label">Resolved & Closed</span>
            </div>
          </div>
        </section>

        {/* Main Operational Modules Grid */}
        {isAuthenticated && user?.role === "SuperAdmin" ? (
          <section className="modules-section">
            <div className="section-title-bar">
              <h2>⚡ Administrative Operational Console</h2>
              <span className="subtitle-hint">Direct system management and master configuration</span>
            </div>

            <div className="admin-modules-grid">
              {adminLinks.map((link) => (
                <Link key={link.to} to={link.to} className="module-card-item">
                  <div className="module-top-row">
                    <div className="module-icon-pod">{link.icon}</div>
                    <span className="module-tag">{link.tag}</span>
                  </div>
                  <div className="module-body">
                    <h3>{link.label}</h3>
                    <p>{link.desc}</p>
                  </div>
                  <div className="module-footer">
                    <span className="arrow-link">Access Module →</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : (
          <section className="user-action-section">
            <div className="section-title-bar">
              <h2>🚀 Service Desk Actions</h2>
              <span className="subtitle-hint">Report maintenance issues or track active complaints</span>
            </div>

            <div className="user-action-grid">
              <Link to="/complaints/new" className="user-action-card highlight">
                <div className="action-icon">📝</div>
                <h3>Submit New Ticket</h3>
                <p>Log a maintenance request for rooms, equipment, or campus facilities.</p>
                <span className="action-btn-text">Open Ticket Form →</span>
              </Link>

              <Link to="/my-complaints" className="user-action-card">
                <div className="action-icon">📋</div>
                <h3>Track My Complaints</h3>
                <p>View real-time status updates and responses on your reported issues.</p>
                <span className="action-btn-text">View My Feed →</span>
              </Link>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default HomePage;
