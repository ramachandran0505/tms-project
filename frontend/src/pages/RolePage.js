import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { roleService } from "../services/api";
import ConfirmModal from "../components/ConfirmModal";
import "./RolePage.css";

const PRESET_PERMISSIONS = [
  "manage_users",
  "triage_tickets",
  "view_reports",
  "manage_facilities",
  "system_admin",
  "export_data",
  "manage_departments",
  "read_only"
];

const RolePage = () => {
  const { user } = useContext(AuthContext);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", permissions: "" });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "table"
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  useEffect(() => {
    if (user?.role === "SuperAdmin") fetchRoles();
  }, [user]);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await roleService.getAll();
      setRoles(response.data || []);
      setError("");
    } catch (err) {
      setError("Failed to fetch authorization levels.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const permissions = formData.permissions
        .split(",")
        .map((p) => p.trim())
        .filter((p) => p);
      const data = { ...formData, permissions };
      if (editingId) {
        await roleService.update(editingId, data);
      } else {
        await roleService.create(data);
      }
      setFormData({ name: "", permissions: "" });
      setEditingId(null);
      setShowForm(false);
      fetchRoles();
    } catch (err) {
      setError("Authorization commitment failed.");
    }
  };

  const handleEdit = (role) => {
    setFormData({ name: role.name, permissions: role.permissions?.join(", ") || "" });
    setEditingId(role._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await roleService.delete(deleteTargetId);
      setDeleteTargetId(null);
      fetchRoles();
    } catch (err) {
      setError("Revocation denied: Active association detected.");
      setDeleteTargetId(null);
    }
  };

  const togglePresetPermission = (perm) => {
    const currentList = formData.permissions
      .split(",")
      .map((p) => p.trim())
      .filter((p) => p);

    let updatedList;
    if (currentList.includes(perm)) {
      updatedList = currentList.filter((p) => p !== perm);
    } else {
      updatedList = [...currentList, perm];
    }
    setFormData({ ...formData, permissions: updatedList.join(", ") });
  };

  const filteredRoles = roles.filter(
    (role) =>
      role.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.permissions?.some((p) => p.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getRoleIcon = (name) => {
    const lower = name.toLowerCase();
    if (lower.includes("admin")) return "👑";
    if (lower.includes("staff") || lower.includes("engineer")) return "🛠️";
    if (lower.includes("plumber") || lower.includes("electric")) return "⚡";
    if (lower.includes("user")) return "👤";
    return "🛡️";
  };

  // Compute metrics
  const totalPermissionsCount = roles.reduce(
    (acc, r) => acc + (r.permissions?.length || 0),
    0
  );

  if (loading) return <div className="loading">Parsing Permission Matrix...</div>;

  return (
    <div className="role-page page-container">
      {/* Header Banner */}
      <header className="role-hero-banner">
        <div className="hero-text">
          <span className="hero-badge">🔐 Security & Access Control</span>
          <h1>Permission Matrix Suite</h1>
          <p>
            Configure user access scopes, operational designations, and role privileges across campus services.
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            if (showForm) setEditingId(null);
          }}
          className="primary-action-btn pulse-hover"
        >
          {showForm ? "✕ Dismiss Form" : "＋ Register New Role"}
        </button>
      </header>

      {error && <div className="error-message">{error}</div>}

      {/* Metrics Row */}
      <div className="role-stats-grid">
        <div className="role-stat-card">
          <div className="stat-icon">🛡️</div>
          <div className="stat-content">
            <span className="stat-number">{roles.length}</span>
            <span className="stat-title">Configured Roles</span>
          </div>
        </div>
        <div className="role-stat-card">
          <div className="stat-icon">🔑</div>
          <div className="stat-content">
            <span className="stat-number">{totalPermissionsCount}</span>
            <span className="stat-title">Active Permission Scopes</span>
          </div>
        </div>
        <div className="role-stat-card">
          <div className="stat-icon">⚡</div>
          <div className="stat-content">
            <span className="stat-number">RBAC v2.4</span>
            <span className="stat-title">Access Policy Engine</span>
          </div>
        </div>
      </div>

      {/* Form Drawer / Container */}
      {showForm && (
        <form className="role-form-card" onSubmit={handleSubmit}>
          <div className="form-header">
            <h2>{editingId ? "✎ Modify Role Authorization" : "＋ Register Operational Role"}</h2>
            <p>Assign precise access vectors and permission policies for this role.</p>
          </div>

          <div className="form-grid">
            <div className="form-group-item">
              <label>Role Designation Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Lead Network Systems Engineer"
                required
              />
            </div>

            <div className="form-group-item">
              <label>Quick Select Permission Presets</label>
              <div className="preset-chips-wrapper">
                {PRESET_PERMISSIONS.map((perm) => {
                  const isSelected = formData.permissions
                    .split(",")
                    .map((p) => p.trim())
                    .includes(perm);
                  return (
                    <button
                      type="button"
                      key={perm}
                      className={`preset-chip ${isSelected ? "selected" : ""}`}
                      onClick={() => togglePresetPermission(perm)}
                    >
                      {isSelected ? "✓ " : "＋ "}
                      {perm}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="form-group-item" style={{ gridColumn: "1 / -1" }}>
              <label>Custom Access Vectors (Comma Separated)</label>
              <textarea
                value={formData.permissions}
                onChange={(e) => setFormData({ ...formData, permissions: e.target.value })}
                placeholder="e.g. read_data, write_logs, triage_tickets..."
                rows="3"
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
            >
              Cancel
            </button>
            <button type="submit" className="primary-action-btn">
              {editingId ? "Save Authorization Changes" : "Commit New Role"}
            </button>
          </div>
        </form>
      )}

      {/* Controls Bar */}
      <div className="role-controls-bar">
        <div className="search-box-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search role designation or permission scope..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="view-mode-toggle">
          <button
            className={`toggle-btn ${viewMode === "grid" ? "active" : ""}`}
            onClick={() => setViewMode("grid")}
            title="Grid Cards View"
          >
            ▦ Grid Cards
          </button>
          <button
            className={`toggle-btn ${viewMode === "table" ? "active" : ""}`}
            onClick={() => setViewMode("table")}
            title="Matrix Table View"
          >
            ≡ Matrix Table
          </button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === "grid" ? (
        <div className="roles-grid-container">
          {filteredRoles.map((r) => (
            <div key={r._id} className="role-card-item">
              <div className="role-card-header">
                <div className="role-card-title-group">
                  <div className="role-avatar-icon">{getRoleIcon(r.name)}</div>
                  <div>
                    <h3 className="role-card-name">{r.name}</h3>
                    <span className="role-badge-count">
                      {r.permissions?.length || 0} Permissions Configured
                    </span>
                  </div>
                </div>
                <div className="action-btn-group">
                  <button
                    className="role-action-btn edit-btn"
                    onClick={() => handleEdit(r)}
                    title="Edit Role"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className="role-action-btn delete-btn"
                    onClick={() => setDeleteTargetId(r._id)}
                    title="Delete Role"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>

              <div className="role-card-body">
                <span className="section-small-title">Access Vectors</span>
                <div className="permission-tag-group">
                  {r.permissions && r.permissions.length > 0 ? (
                    r.permissions.map((p, idx) => (
                      <span key={idx} className="status-tag tag-progress">
                        ⚡ {p}
                      </span>
                    ))
                  ) : (
                    <span className="no-perms-text">No custom permissions assigned.</span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredRoles.length === 0 && (
            <div className="empty-roles-card">
              <span className="empty-icon">🛡️</span>
              <h3>No Roles Found</h3>
              <p>No permission matrix profiles match your current search query.</p>
            </div>
          )}
        </div>
      ) : (
        /* Table View */
        <section className="role-table-card">
          <div className="table-action-header">
            <h3>Authorization Matrix Registry ({filteredRoles.length})</h3>
          </div>
          <div className="table-wrapper">
            <table className="standard-table">
              <thead>
                <tr>
                  <th>Designation</th>
                  <th>Permission Scopes</th>
                  <th>Vector Count</th>
                  <th style={{ textAlign: "right" }}>Management</th>
                </tr>
              </thead>
              <tbody>
                {filteredRoles.map((r) => (
                  <tr key={r._id}>
                    <td style={{ fontWeight: 700, color: "#6C47FF" }}>
                      <span style={{ marginRight: "8px" }}>{getRoleIcon(r.name)}</span>
                      {r.name}
                    </td>
                    <td>
                      <div className="permission-tag-group">
                        {r.permissions?.map((p, idx) => (
                          <span key={idx} className="status-tag tag-progress">
                            ⚡ {p}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span className="status-tag tag-assigned">
                        {r.permissions?.length || 0} Vectors
                      </span>
                    </td>
                    <td>
                      <div className="action-btn-group" style={{ justifyContent: 'flex-end' }}>
                        <button
                          className="role-action-btn edit-btn"
                          onClick={() => handleEdit(r)}
                          title="Edit Role"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="role-action-btn delete-btn"
                          onClick={() => setDeleteTargetId(r._id)}
                          title="Delete Role"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredRoles.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center", padding: "3rem", opacity: 0.6 }}>
                      No role definitions match query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTargetId}
        title="Revoke Role Definition?"
        message="Are you sure you want to permanently revoke this role designation and its permission matrix?"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};

export default RolePage;
