import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { roleService } from "../services/api";
import "./RolePage.css";

const RolePage = () => {
  const { user } = useContext(AuthContext);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", permissions: "" });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (user?.role === "SuperAdmin") fetchRoles();
  }, [user]);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await roleService.getAll();
      setRoles(response.data);
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
      const permissions = formData.permissions.split(",").map(p => p.trim()).filter(p => p);
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

  const handleDelete = async (id) => {
    if (window.confirm("Authorize permanent revocation of this role?")) {
      try {
        await roleService.delete(id);
        fetchRoles();
      } catch (err) {
        setError("Revocation denied: Active association detected.");
      }
    }
  };

  if (loading) return <div className="loading">Parsing Permission Matrix...</div>;

  return (
    <div className="role-page page-container">
      <header className="role-page-header">
        <h1>Permission Matrix</h1>
        <button
          onClick={() => { setShowForm(!showForm); if (showForm) setEditingId(null); }}
          className="primary-action-btn"
        >
          {showForm ? "✕ Close Interface" : "＋ Register Role"}
        </button>
      </header>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <form className="role-form-card" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group-item" style={{ gridColumn: '1 / -1' }}>
              <label>Operational Designation</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. System Engineer"
                required
              />
            </div>
            <div className="form-group-item" style={{ gridColumn: '1 / -1' }}>
              <label>Access Vectors (Comma Separated)</label>
              <textarea
                value={formData.permissions}
                onChange={(e) => setFormData({ ...formData, permissions: e.target.value })}
                placeholder="read_data, write_logs, triage_tickets..."
                rows="3"
              />
            </div>
          </div>
          <button type="submit" className="primary-action-btn" style={{ width: '100%', justifyContent: 'center' }}>
            {editingId ? "Update Authorization" : "Commit Role"}
          </button>
        </form>
      )}

      <section className="role-table-card">
        <div className="table-action-header">
          <h3>Authorization Registry</h3>
          <span className="info-label">{roles.length} Tiers Active</span>
        </div>
        <div className="table-wrapper" style={{ margin: 0, border: 'none', borderRadius: 0 }}>
          <table className="standard-table">
            <thead>
              <tr>
                <th>Designation</th>
                <th>Permission Vectors</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((r) => (
                <tr key={r._id}>
                  <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{r.name}</td>
                  <td>
                    <div className="permission-tag-group">
                      {r.permissions?.map((p, idx) => (
                        <span key={idx} className="status-tag tag-progress">{p}</span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div className="action-btn-group">
                      <button className="btn-icon-only" onClick={() => handleEdit(r)} title="Edit Role">✎</button>
                      <button className="btn-icon-only btn-delete-icon" onClick={() => handleDelete(r._id)} title="Delete Role">✕</button>
                    </div>
                  </td>
                </tr>
              ))}
              {roles.length === 0 && (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', opacity: 0.5 }}>No roles initialized.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default RolePage;
