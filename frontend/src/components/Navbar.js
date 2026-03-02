import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./Navbar-simple.css";

const Navbar = () => {
  const { user, logout, isAuthenticated } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const isActive = (path) =>
    location.pathname === path ? "nav-link active" : "nav-link";

  return (
    <nav className={`nexus-navbar ${scrolled ? "scrolled" : ""} ${isMenuOpen ? "drawer-open" : ""}`}>
      {/* Cinematic Ambient Background */}
      <div className="nav-aura-field">
        <div className="aura-pulse aura-1"></div>
        <div className="aura-pulse aura-2"></div>
      </div>

      <div className="nav-main-rail">
        {/* Unit 1: Brand System */}
        <div className="nav-unit brand-unit">
          <Link to="/dashboard" className="brand-nexus-anchor" onClick={() => setIsMenuOpen(false)}>
            <div className="brand-logo-pod">
              <span className="glyph">T</span>
            </div>
            <div className="brand-telemetry">
              <div className="brand-name-group">
                <span className="title">TMS</span>
              </div>
              <div className="status-indicator">
                <span className="status-dot"></span>
                <span className="status-label">SYSTEMS ACTIVE</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Unit 2: Command Rail (Horizontal Flex Cluster) */}
        <div className={`nav-unit command-unit ${isMenuOpen ? "gate-open" : ""}`}>
          <div className="command-cluster-v5">
            {isAuthenticated ? (
              <div className="flex-rail-horizontal">
                {/* Mobile Profile View (Only visible on mobile) */}
                <Link to="/profile" className="mobile-profile-stub" onClick={() => setIsMenuOpen(false)}>
                  <div className="avatar-orb-v5">
                    {user?.profileImage ? <img src={user.profileImage} alt="User" /> : user?.username?.charAt(0).toUpperCase()}
                  </div>
                  <div className="stub-meta">
                    <span className="alias">{user?.username}</span>
                    <span className="clearance">{user?.role}</span>
                  </div>
                </Link>

                <Link to="/complaints/new" className={isActive("/complaints/new")} onClick={() => setIsMenuOpen(false)}>
                  <span className="icon">✦</span>
                  <span className="label">Initialize</span>
                </Link>

                <div className="cluster-divider"></div>

                {user?.role === "SuperAdmin" ? (
                  <div className="admin-flex-group">
                    <Link to="/complaints" className={isActive("/complaints")} onClick={() => setIsMenuOpen(false)}>
                      <span className="icon">⬡</span>
                      <span className="label">Tickets</span>
                    </Link>
                    <Link to="/reports" className={isActive("/reports")} onClick={() => setIsMenuOpen(false)}>
                      <span className="icon">📊</span>
                      <span className="label">Reports</span>
                    </Link>

                    <div className="inner-divider"></div>

                    <div className="shortcut-dots">
                      <Link to="/users" className={isActive("/users")} onClick={() => setIsMenuOpen(false)} title="Users">
                        <span className="icon">👥</span>
                        <span className="label">Users</span>
                      </Link>
                      <Link to="/departments" className={isActive("/departments")} onClick={() => setIsMenuOpen(false)} title="Departments">
                        <span className="icon">🏢</span>
                        <span className="label">Depts</span>
                      </Link>
                      <Link to="/blocks" className={isActive("/blocks")} onClick={() => setIsMenuOpen(false)} title="Infrastructure Blocks">
                        <span className="icon">🏗️</span>
                        <span className="label">Blocks</span>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <Link to="/my-complaints" className={isActive("/my-complaints")} onClick={() => setIsMenuOpen(false)}>
                    <span className="icon">◈</span>
                    <span className="label">My Feed</span>
                  </Link>
                )}

                {/* Mobile Logout (Only visible on mobile) */}
                <button onClick={handleLogout} className="mobile-logout-btn">
                  <span className="icon">⏻</span>
                  <span className="label">Terminate</span>
                </button>
              </div>
            ) : (
              <Link to="/login" className="login-nexus-cta" onClick={() => setIsMenuOpen(false)}>
                <span className="icon">⚔️</span>
                <span className="label">Access Portal</span>
              </Link>
            )}
          </div>
        </div>

        {/* Unit 3: Identity Segment (Desktop Only) */}
        <div className="nav-unit profile-unit">
          {isAuthenticated && (
            <div className="identity-capsule-v5">
              <Link to="/profile" className="identity-trigger-v5" onClick={() => setIsMenuOpen(false)}>
                <div className="avatar-orb-v5">
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt="User" />
                  ) : (
                    user?.username?.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="identity-meta-v5">
                  <span className="alias">{user?.username}</span>
                  <span className="clearance">{user?.role === 'SuperAdmin' ? 'ADMIN' : 'USER'}</span>
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="session-terminate-v5"
                title="Terminate Session"
              >
                <span className="terminate-icon">⏻</span>
              </button>
            </div>
          )}
        </div>

        <button className={`nexus-toggle ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu} aria-label="Toggle Menu">
          {isMenuOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          )}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      <div className={`mobile-overlay ${isMenuOpen ? "active" : ""}`} onClick={() => setIsMenuOpen(false)}></div>
    </nav>
  );
};

export default Navbar;
