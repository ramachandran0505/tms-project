import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { authService, complaintService } from "../services/api";
import { ThemeContext } from "../context/ThemeContext";
import "./ProfilePage.css";

const ProfilePage = () => {
    const { user, setUser } = useContext(AuthContext);
    const { themes, currentThemeId, applyTheme } = useContext(ThemeContext);
    const [activeTab, setActiveTab] = useState("general");

    // General Info State
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        phone: "",
        profileImage: "",
    });

    // Security State
    const [securityData, setSecurityData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    // Preferences State
    const [prefs, setPrefs] = useState(() => {
        const saved = localStorage.getItem('app-prefs');
        return saved ? JSON.parse(saved) : {
            compact: false,
            notifications: true,
            analytics: true
        };
    });

    useEffect(() => {
        localStorage.setItem('app-prefs', JSON.stringify(prefs));
        if (prefs.compact) {
            document.body.classList.add('compact-mode');
        } else {
            document.body.classList.remove('compact-mode');
        }
    }, [prefs]);

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || "",
                email: user.email || "",
                phone: user.phone || "",
                profileImage: user.profileImage || "",
            });
        }
    }, [user]);

    const handleGeneralChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSecurityChange = (e) => {
        setSecurityData({ ...securityData, [e.target.name]: e.target.value });
    };

    const handleGeneralSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: "", text: "" });

        try {
            const response = await authService.updateProfile(formData);
            setUser(response.data.user);
            setMessage({ type: "success", text: "Profile updated successfully!" });
        } catch (error) {
            console.error("Update failed:", error);
            setMessage({
                type: "error",
                text: error.response?.data?.message || "Failed to update profile",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSecuritySubmit = async (e) => {
        e.preventDefault();
        if (securityData.newPassword !== securityData.confirmPassword) {
            setMessage({ type: "error", text: "New passwords do not match" });
            return;
        }

        setLoading(true);
        setMessage({ type: "", text: "" });

        try {
            await authService.changePassword({
                currentPassword: securityData.currentPassword,
                newPassword: securityData.newPassword,
            });
            setMessage({ type: "success", text: "Password changed successfully!" });
            setSecurityData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (error) {
            setMessage({
                type: "error",
                text: error.response?.data?.message || "Failed to change password",
            });
        } finally {
            setLoading(false);
        }
    };

    const [dashboardStats, setDashboardStats] = useState({ total: 0, closed: 0, pending: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await complaintService.getStats();
                setDashboardStats({
                    total: res.data.total || 0,
                    closed: res.data.closed || 0,
                    pending: (res.data.pending || 0) + (res.data.assigned || 0)
                });
            } catch (err) {
                console.error("Failed to fetch user stats", err);
            }
        };
        if (user) {
            fetchStats();
        }
    }, [user]);

    const stats = [
        { label: "Raised", value: dashboardStats.total.toString().padStart(2, '0'), icon: "🎫" },
        { label: "Resolved", value: dashboardStats.closed.toString().padStart(2, '0'), icon: "✨" },
        { label: "Pending", value: dashboardStats.pending.toString().padStart(2, '0'), icon: "⏳" }
    ];

    return (
        <div className="profile-page animated-bg">
            <div className="profile-container page-fade">
                <section className="profile-hero-upgrade">
                    <div className="hero-content">
                        <div className="brand-badge-glow">Secure Profile</div>
                        <h1 className="profile-glitch-title">
                            Account <span>Intelligence</span>
                        </h1>
                        <p className="profile-subtitle-refined">
                            Manage your digital identity and optimize your workflow settings.
                        </p>
                    </div>
                </section>

                <main className="profile-layout-upgrade">
                    <aside className="profile-sidebar-premium">
                        <div className="sidebar-profile-preview">
                            <div className="preview-avatar">
                                {formData.profileImage ? (
                                    <img src={formData.profileImage} alt="Profile" />
                                ) : (
                                    user?.username?.charAt(0).toUpperCase()
                                )}
                                <div className="status-indicator-online"></div>
                            </div>
                            <div className="preview-info">
                                <h3>{user?.username}</h3>
                                <div className="user-tier-badge">
                                    {user?.role === 'SuperAdmin' ? 'Admin Tier' : 'Standard User'}
                                </div>
                            </div>
                        </div>

                        <nav className="sidebar-nav-links">
                            <button
                                className={`sidebar-btn-v2 ${activeTab === 'general' ? 'active' : ''}`}
                                onClick={() => setActiveTab('general')}
                            >
                                <span className="btn-icon-box">👤</span>
                                <div className="btn-text">
                                    <span className="main-text">General</span>
                                    <span className="sub-text">Basic Info & Identity</span>
                                </div>
                            </button>
                            <button
                                className={`sidebar-btn-v2 ${activeTab === 'security' ? 'active' : ''}`}
                                onClick={() => setActiveTab('security')}
                            >
                                <span className="btn-icon-box">🔒</span>
                                <div className="btn-text">
                                    <span className="main-text">Security</span>
                                    <span className="sub-text">Password & Protection</span>
                                </div>
                            </button>
                            <button
                                className={`sidebar-btn-v2 ${activeTab === 'preferences' ? 'active' : ''}`}
                                onClick={() => setActiveTab('preferences')}
                            >
                                <span className="btn-icon-box">⚙️</span>
                                <div className="btn-text">
                                    <span className="main-text">Customization</span>
                                    <span className="sub-text">Themes & Layouts</span>
                                </div>
                            </button>
                        </nav>
                    </aside>

                    <div className="profile-main-viewport">
                        {activeTab === 'general' && (
                            <div className="viewport-content-v2">
                                <div className="stats-track-v2">
                                    {stats.map((stat, i) => (
                                        <div key={i} className="stat-node-v2">
                                            <span className="node-icon">{stat.icon}</span>
                                            <div className="node-data">
                                                <span className="node-value">{stat.value}</span>
                                                <span className="node-label">{stat.label}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="content-inner-card">
                                    <div className="form-header-premium">
                                        <h3>Identity Profile</h3>
                                    </div>

                                    <div className="avatar-explorer">
                                        <div className="explorer-header">Select New Avatar</div>
                                        <div className="avatar-scroller-v2">
                                            {[
                                                "https://cdn-icons-png.flaticon.com/512/149/149071.png",
                                                "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
                                                "https://cdn-icons-png.flaticon.com/512/4140/4140037.png",
                                                "https://cdn-icons-png.flaticon.com/512/219/219983.png",
                                                "https://cdn-icons-png.flaticon.com/512/219/219986.png",
                                                "https://cdn-icons-png.flaticon.com/512/4140/4140048.png"
                                            ].map((img, index) => (
                                                <div
                                                    key={index}
                                                    className={`avatar-hex ${formData.profileImage === img ? 'active' : ''}`}
                                                    onClick={() => setFormData({ ...formData, profileImage: img })}
                                                >
                                                    <img src={img} alt={`Option ${index + 1}`} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <form onSubmit={handleGeneralSubmit} className="premium-form-v2">
                                        <div className="form-row-v2">
                                            <div className="form-input-box">
                                                <label>Profile Label</label>
                                                <input
                                                    type="text"
                                                    name="username"
                                                    value={formData.username}
                                                    onChange={handleGeneralChange}
                                                    placeholder="Username"
                                                    required
                                                />
                                            </div>
                                            <div className="form-input-box">
                                                <label>Access Role</label>
                                                <input type="text" value={user?.role} disabled className="locked-input" />
                                            </div>
                                        </div>

                                        <div className="form-row-v2">
                                            <div className="form-input-box">
                                                <label>Digital Contact</label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleGeneralChange}
                                                    placeholder="Email"
                                                    required
                                                />
                                            </div>
                                            <div className="form-input-box">
                                                <label>Communication ID</label>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleGeneralChange}
                                                    placeholder="Phone"
                                                />
                                            </div>
                                        </div>

                                        <div className="form-footer-v2">
                                            <button type="submit" className="neon-save-btn" disabled={loading}>
                                                {loading ? "Synchronizing..." : "Synchronize Profile"}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="viewport-content-v2">
                                <div className="content-inner-card security-focus">
                                    <div className="security-shield-header">
                                        <div className="shield-icon">🛡️</div>
                                        <div className="shield-text">
                                            <h3>Credential Protocol</h3>
                                            <p>Update your authentication sequence to maintain maximum security.</p>
                                        </div>
                                    </div>

                                    <form onSubmit={handleSecuritySubmit} className="premium-form-v2">
                                        <div className="secure-input-stack">
                                            <div className="form-input-box full-width">
                                                <label>Current Protocol Key</label>
                                                <input
                                                    type="password"
                                                    name="currentPassword"
                                                    value={securityData.currentPassword}
                                                    onChange={handleSecurityChange}
                                                    placeholder="••••••••"
                                                    required
                                                />
                                            </div>
                                            <div className="form-row-v2">
                                                <div className="form-input-box">
                                                    <label>New Protocol Key</label>
                                                    <input
                                                        type="password"
                                                        name="newPassword"
                                                        value={securityData.newPassword}
                                                        onChange={handleSecurityChange}
                                                        placeholder="••••••••"
                                                        required
                                                    />
                                                </div>
                                                <div className="form-input-box">
                                                    <label>Confirm Protocol</label>
                                                    <input
                                                        type="password"
                                                        name="confirmPassword"
                                                        value={securityData.confirmPassword}
                                                        onChange={handleSecurityChange}
                                                        placeholder="••••••••"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="form-footer-v2">
                                            <button type="submit" className="neon-save-btn security-btn" disabled={loading}>
                                                {loading ? "Updating Protocols..." : "Renew Credentials"}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {activeTab === 'preferences' && (
                            <div className="viewport-content-v2">
                                <div className="content-inner-card preferences-v2">
                                    <div className="form-header-premium">
                                        <h3>System Interface</h3>
                                        <p>Personalize your analytical environment.</p>
                                    </div>

                                    <div className="preferences-stack-v2">
                                        <div className="glass-toggle-card">
                                            <div className="toggle-info">
                                                <h4>Compact Architecture</h4>
                                                <p>Optimize screen real-estate for high-density data viewing.</p>
                                            </div>
                                            <div className="toggle-v2">
                                                <input
                                                    type="checkbox"
                                                    checked={prefs.compact}
                                                    onChange={() => setPrefs({ ...prefs, compact: !prefs.compact })}
                                                />
                                                <div className="toggle-rail"></div>
                                            </div>
                                        </div>

                                        <div className="glass-toggle-card">
                                            <div className="toggle-info">
                                                <h4>Push Communications</h4>
                                                <p>Receive real-time updates regarding ticket status changes.</p>
                                            </div>
                                            <div className="toggle-v2">
                                                <input
                                                    type="checkbox"
                                                    checked={prefs.notifications}
                                                    onChange={() => setPrefs({ ...prefs, notifications: !prefs.notifications })}
                                                />
                                                <div className="toggle-rail"></div>
                                            </div>
                                        </div>

                                        <div className="interface-color-section">
                                            <h4>Environment Hue</h4>
                                            <p>Select your preferred visual spectrum.</p>
                                            <div className="color-orbit-grid">
                                                {themes.map(t => (
                                                    <div
                                                        key={t.id}
                                                        className={`color-orbit-node ${t.id} ${currentThemeId === t.id ? 'pulsing' : ''}`}
                                                        onClick={() => applyTheme(t.id)}
                                                    >
                                                        <div className="orbit-core"></div>
                                                        <span className="orbit-label">{t.id}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {message.text && (
                <div className={`notification-portal ${message.type}`}>
                    <div className="notif-bar"></div>
                    <span className="notif-icon">{message.type === 'success' ? '⚡' : '🔥'}</span>
                    <span className="notif-text">{message.text}</span>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;
