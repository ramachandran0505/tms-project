import React, { useContext, useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import "./Navbar-simple.css";

const Navbar = () => {
  const { user, logout, isAuthenticated } = useContext(AuthContext);
  const { toggleThemeMode, isDark } = useContext(ThemeContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const dropdownRef = useRef(null);
  const adminMenuRef = useRef(null);
  const drawerRef = useRef(null);
  const toggleRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 12);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close all menus on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setShowDropdown(false);
    setShowAdminMenu(false);
  }, [location.pathname]);

  // Close menus and drawer on outside click or touch
  useEffect(() => {
    const handlePointerDown = (event) => {
      // Auto-close mobile drawer if clicked/tapped outside drawer and toggle
      if (
        isMenuOpen &&
        drawerRef.current &&
        !drawerRef.current.contains(event.target) &&
        toggleRef.current &&
        !toggleRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }

      // Auto-close profile dropdown if clicked outside
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }

      // Auto-close admin menu if clicked outside
      if (adminMenuRef.current && !adminMenuRef.current.contains(event.target)) {
        setShowAdminMenu(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        setShowDropdown(false);
        setShowAdminMenu(false);
      }
    };

    const handleResize = () => {
      if (window.innerWidth > 1080) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown, { passive: true });
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
    };
  }, [isMenuOpen]);

  const confirmLogout = () => {
    setShowDropdown(false);
    setShowAdminMenu(false);
    setIsMenuOpen(false);
    logout();
    navigate("/login");
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const isActive = (path) =>
    location.pathname === path ? "nav-link active" : "nav-link";

  const isAdminActive = () =>
    [
      "/departments",
      "/programmes",
      "/blocks",
      "/rooms",
      "/roles",
      "/users",
    ].includes(location.pathname);

  return (
    <nav className={`nexus-navbar ${scrolled ? "scrolled" : ""} ${isMenuOpen ? "drawer-open" : ""}`}>
      <div className="nav-main-rail">
        {/* Brand Identity */}
        <div className="brand-unit">
          <Link to="/dashboard" className="brand-nexus-anchor" onClick={() => setIsMenuOpen(false)}>
            <div className="brand-logo-pod">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div className="brand-telemetry">
              <span className="title">TMS</span>
              <div className="status-indicator">
                <span className="status-dot"></span>
                <span className="status-label">PORTAL</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Center Command Rail (Desktop) & Mobile Drawer */}
        {isAuthenticated && (
          <div className={`command-unit ${isMenuOpen ? "gate-open" : ""}`} ref={drawerRef}>
            {/* Mobile Drawer Top Bar with Theme Switch & Close Button */}
            <div className="mobile-drawer-header">
              <div className="drawer-top-action-row">
                <span className="drawer-nav-heading">NAVIGATION</span>
                <div className="drawer-top-btns">
                  <button
                    className="drawer-theme-toggle-btn"
                    onClick={toggleThemeMode}
                    aria-label={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
                    title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
                    type="button"
                  >
                    {isDark ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="5" />
                        <line x1="12" y1="1" x2="12" y2="3" />
                        <line x1="12" y1="21" x2="12" y2="23" />
                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                        <line x1="1" y1="12" x2="3" y2="12" />
                        <line x1="21" y1="12" x2="23" y2="12" />
                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                      </svg>
                    )}
                  </button>
                  <button
                    className="drawer-close-btn"
                    onClick={() => setIsMenuOpen(false)}
                    aria-label="Close navigation menu"
                    type="button"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              </div>

              <Link to="/profile" className="mobile-profile-card" onClick={() => setIsMenuOpen(false)}>
                <div className="avatar-orb-v5">
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt="User" />
                  ) : (
                    user?.username?.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="stub-meta">
                  <span className="alias">{user?.username}</span>
                  <span className="clearance">{user?.role === "SuperAdmin" ? "Super Admin" : "Standard User"}</span>
                </div>
                <svg className="chevron-right" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
            </div>

            {/* Navigation Links Group */}
            <div className="flex-rail-horizontal">
              <Link to="/dashboard" className={isActive("/dashboard")} onClick={() => setIsMenuOpen(false)}>
                <svg className="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                <span className="label">Dashboard</span>
              </Link>

              <Link
                to={user?.role === "SuperAdmin" ? "/complaints" : "/my-complaints"}
                className={isActive(user?.role === "SuperAdmin" ? "/complaints" : "/my-complaints")}
                onClick={() => setIsMenuOpen(false)}
              >
                <svg className="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
                <span className="label">{user?.role === "SuperAdmin" ? "Tickets" : "My Tickets"}</span>
              </Link>

              <Link to="/complaints/new" className={`${isActive("/complaints/new")} nav-link-cta`} onClick={() => setIsMenuOpen(false)}>
                <svg className="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span className="label">New Ticket</span>
              </Link>

              {user?.role === "SuperAdmin" && (
                <>
                  <Link to="/reports" className={isActive("/reports")} onClick={() => setIsMenuOpen(false)}>
                    <svg className="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="20" x2="18" y2="10" />
                      <line x1="12" y1="20" x2="12" y2="4" />
                      <line x1="6" y1="20" x2="6" y2="14" />
                    </svg>
                    <span className="label">Reports</span>
                  </Link>

                  {/* Desktop Admin Modules Dropdown */}
                  <div className="admin-menu-container desktop-only-menu" ref={adminMenuRef}>
                    <button
                      className={`nav-link admin-trigger ${isAdminActive() ? "active" : ""} ${showAdminMenu ? "open" : ""}`}
                      onClick={() => setShowAdminMenu(!showAdminMenu)}
                      type="button"
                    >
                      <svg className="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="7" height="7" />
                        <rect x="14" y="3" width="7" height="7" />
                        <rect x="14" y="14" width="7" height="7" />
                        <rect x="3" y="14" width="7" height="7" />
                      </svg>
                      <span className="label">Administration</span>
                      <svg className="chevron-mini" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>

                    {showAdminMenu && (
                      <div className="admin-popover-menu">
                        <div className="admin-popover-header">
                          <span className="popover-badge-pill">SYSTEM CONFIGURATION</span>
                          <span className="popover-count">6 MODULES</span>
                        </div>
                        <div className="admin-popover-grid">
                          <Link to="/departments" className={`admin-popover-item ${location.pathname === "/departments" ? "active" : ""}`} onClick={() => setShowAdminMenu(false)}>
                            <div className="popover-icon-box">🏢</div>
                            <div className="popover-text">
                              <span className="item-title">Departments</span>
                              <span className="item-desc">Academic units</span>
                            </div>
                          </Link>

                          <Link to="/programmes" className={`admin-popover-item ${location.pathname === "/programmes" ? "active" : ""}`} onClick={() => setShowAdminMenu(false)}>
                            <div className="popover-icon-box">🎓</div>
                            <div className="popover-text">
                              <span className="item-title">Programmes</span>
                              <span className="item-desc">Degree programs</span>
                            </div>
                          </Link>

                          <Link to="/blocks" className={`admin-popover-item ${location.pathname === "/blocks" ? "active" : ""}`} onClick={() => setShowAdminMenu(false)}>
                            <div className="popover-icon-box">🏗️</div>
                            <div className="popover-text">
                              <span className="item-title">Blocks</span>
                              <span className="item-desc">Campus buildings</span>
                            </div>
                          </Link>

                          <Link to="/rooms" className={`admin-popover-item ${location.pathname === "/rooms" ? "active" : ""}`} onClick={() => setShowAdminMenu(false)}>
                            <div className="popover-icon-box">🚪</div>
                            <div className="popover-text">
                              <span className="item-title">Rooms</span>
                              <span className="item-desc">Classrooms & labs</span>
                            </div>
                          </Link>

                          <Link to="/roles" className={`admin-popover-item ${location.pathname === "/roles" ? "active" : ""}`} onClick={() => setShowAdminMenu(false)}>
                            <div className="popover-icon-box">🛡️</div>
                            <div className="popover-text">
                              <span className="item-title">Roles</span>
                              <span className="item-desc">Access & permissions</span>
                            </div>
                          </Link>

                          <Link to="/users" className={`admin-popover-item ${location.pathname === "/users" ? "active" : ""}`} onClick={() => setShowAdminMenu(false)}>
                            <div className="popover-icon-box">👥</div>
                            <div className="popover-text">
                              <span className="item-title">Users</span>
                              <span className="item-desc">User registry</span>
                            </div>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Mobile Drawer Sub-Links */}
                  <div className="mobile-drawer-admin-section">
                    <div className="drawer-section-title">ADMINISTRATION</div>
                    <Link to="/departments" className={isActive("/departments")} onClick={() => setIsMenuOpen(false)}>
                      <span className="drawer-item-icon">🏢</span>
                      <span className="label">Departments</span>
                    </Link>
                    <Link to="/programmes" className={isActive("/programmes")} onClick={() => setIsMenuOpen(false)}>
                      <span className="drawer-item-icon">🎓</span>
                      <span className="label">Programmes</span>
                    </Link>
                    <Link to="/blocks" className={isActive("/blocks")} onClick={() => setIsMenuOpen(false)}>
                      <span className="drawer-item-icon">🏗️</span>
                      <span className="label">Blocks</span>
                    </Link>
                    <Link to="/rooms" className={isActive("/rooms")} onClick={() => setIsMenuOpen(false)}>
                      <span className="drawer-item-icon">🚪</span>
                      <span className="label">Rooms</span>
                    </Link>
                    <Link to="/roles" className={isActive("/roles")} onClick={() => setIsMenuOpen(false)}>
                      <span className="drawer-item-icon">🛡️</span>
                      <span className="label">Roles</span>
                    </Link>
                    <Link to="/users" className={isActive("/users")} onClick={() => setIsMenuOpen(false)}>
                      <span className="drawer-item-icon">👥</span>
                      <span className="label">Users</span>
                    </Link>
                  </div>
                </>
              )}

              {/* Mobile Drawer Quick Sign Out */}
              <div className="mobile-drawer-footer">
                <button onClick={confirmLogout} className="mobile-logout-btn" type="button">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  <span>Sign Out Session</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Identity & User Actions (Right Desktop / Mobile Actions) */}
        <div className="profile-unit" ref={dropdownRef}>
          {isAuthenticated ? (
            <>
              {/* Desktop Dark / Light Mode Toggle Button */}
              <button
                className="theme-toggle-nav-btn desktop-only-btn"
                onClick={toggleThemeMode}
                aria-label={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
                title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
                type="button"
              >
                {isDark ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                )}
              </button>

              <div className="identity-capsule-v5">
                <button
                  className={`identity-trigger-v5 ${showDropdown ? "active" : ""}`}
                  onClick={() => setShowDropdown(!showDropdown)}
                  title="Account Settings"
                  type="button"
                >
                  <div className="avatar-wrapper-v5">
                    <div className="avatar-orb-v5">
                      {user?.profileImage ? (
                        <img src={user.profileImage} alt="User" />
                      ) : (
                        user?.username?.charAt(0).toUpperCase()
                      )}
                    </div>
                    <span className="online-dot-ring"></span>
                  </div>
                  <div className="identity-meta-v5">
                    <span className="alias">{user?.username}</span>
                    <span className="clearance-tag">{user?.role === "SuperAdmin" ? "SUPERADMIN" : "USER"}</span>
                  </div>
                  <span className="dropdown-chevron">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </span>
                </button>

                {/* Profile Dropdown Popover */}
                {showDropdown && (
                  <div className="nav-profile-dropdown">
                    <div className="dropdown-user-header">
                      <div className="avatar-orb-v5 large">
                        {user?.profileImage ? (
                          <img src={user.profileImage} alt="User" />
                        ) : (
                          user?.username?.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="dropdown-user-info">
                        <span className="dropdown-name">{user?.username}</span>
                        <span className="dropdown-email">{user?.email || "System Account"}</span>
                        <span className="dropdown-badge">{user?.role}</span>
                      </div>
                    </div>

                    <div className="dropdown-divider"></div>

                    <Link to="/profile" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                      <svg className="dropdown-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <span>Account Profile</span>
                    </Link>

                    <Link to="/dashboard" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                      <svg className="dropdown-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="7" height="9" />
                        <rect x="14" y="3" width="7" height="5" />
                        <rect x="14" y="12" width="7" height="9" />
                        <rect x="3" y="16" width="7" height="5" />
                      </svg>
                      <span>Overview Dashboard</span>
                    </Link>

                    <div className="dropdown-divider"></div>

                    <button className="dropdown-logout-btn" onClick={confirmLogout} type="button">
                      <svg className="dropdown-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      <span>Log Out Session</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link to="/login" className="login-nexus-cta">
              <span>Sign In</span>
            </Link>
          )}

          {/* Animated Hamburger Toggle */}
          <button
            className={`nexus-toggle ${isMenuOpen ? "active" : ""}`}
            onClick={toggleMenu}
            ref={toggleRef}
            aria-label="Toggle navigation drawer"
            type="button"
          >
            <span className="hamburger-bar bar-1"></span>
            <span className="hamburger-bar bar-2"></span>
            <span className="hamburger-bar bar-3"></span>
          </button>
        </div>
      </div>

      {/* Blurred Backdrop Overlay */}
      <div
        className={`mobile-overlay ${isMenuOpen ? "active" : ""}`}
        onClick={() => setIsMenuOpen(false)}
        onTouchStart={() => setIsMenuOpen(false)}
        aria-hidden="true"
      ></div>
    </nav>
  );
};

export default Navbar;
