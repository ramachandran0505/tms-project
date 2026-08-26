import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { userService, departmentService } from "../services/api";
import ConfirmModal from "../components/ConfirmModal";
import "./MasterScreen.css";

const UserPage = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    role: "User",
    department: "",
    programme: "",
    profileImage: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const roles = [
    "SuperAdmin", "User", "Networking Staff", "Plumber",
    "Electrician", "Software Developer", "Application", "PC Hardware",
  ];

  useEffect(() => {
    if (user?.role === "SuperAdmin") fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [userRes, deptRes] = await Promise.all([
        userService.getAll(),
        departmentService.getAll(),
      ]);
      setUsers(userRes.data || []);
      setDepartments(deptRes.data || []);
      setError("");
    } catch (err) {
      setError("User directory synchronization failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = { ...formData };
      if (!editingId && !submitData.password) {
        setError("Security key required for new identities.");
        return;
      }
      if (editingId && !submitData.password) delete submitData.password;
      if (submitData.department === "") delete submitData.department;
      if (submitData.programme === "") delete submitData.programme;

      if (editingId) {
        await userService.update(editingId, submitData);
      } else {
        await userService.create(submitData);
      }
      setFormData({
        username: "", email: "", phone: "", password: "",
        role: "User", department: "", programme: "", profileImage: "",
      });
      setEditingId(null);
      setShowForm(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Identity registration failed.");
    }
  };

  const handleEdit = (userData) => {
    setFormData({
      username: userData.username,
      email: userData.email,
      phone: userData.phone,
      password: "",
      role: userData.role,
      department: userData.department?._id || userData.department || "",
      programme: userData.programme?._id || userData.programme || "",
      profileImage: userData.profileImage || "",
    });
    setEditingId(userData._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await userService.delete(deleteTargetId);
      setDeleteTargetId(null);
      fetchData();
    } catch (err) {
      setError("Revocation failed: Active administrative session.");
      setDeleteTargetId(null);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.department?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="loading">Profiling User Directory...</div>;

  return (
    <div className="master-screen animated-bg">
      <div className="screen-content">
        <header className="screen-header-rail">
          <h1>Identity Directory</h1>
          <button
            onClick={() => { setShowForm(!showForm); if (showForm) setEditingId(null); }}
            className="btn-primary"
          >
            {showForm ? "✕ Dismiss Console" : "＋ Register Identity"}
          </button>
        </header>

        {error && <div className="error-message">{error}</div>}

        {showForm && (
          <form className="master-form-glass" onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Unique Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="e.g. admin_01"
                  required
                />
              </div>
              <div className="form-group">
                <label>Primary Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@domain.com"
                  required
                />
              </div>
              <div className="form-group">
                <label>Contact Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (xxx) xxx-xxxx"
                  required
                />
              </div>
              <div className="form-group">
                <label>Access Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  {roles.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Department Unit</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                >
                  <option value="">N/A</option>
                  {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Security Key</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={editingId ? "Leave blank to preserve" : "Enter robust key"}
                />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Profile Image URL</label>
                <input
                  type="text"
                  value={formData.profileImage}
                  onChange={(e) => setFormData({ ...formData, profileImage: e.target.value })}
                  placeholder="https://example.com/image.png"
                />
              </div>
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%' }}>
              {editingId ? "Update Identity" : "Establish Identity"}
            </button>
          </form>
        )}

        <section className="master-table-card">
          <div className="table-action-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
            <h3>User Registry ({filteredUsers.length})</h3>
            <input
              type="text"
              placeholder="🔍 Search username, email, role, or unit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ maxWidth: '300px' }}
            />
          </div>
          <div className="table-wrapper">
            <table className="standard-table">
              <thead>
                <tr>
                  <th>Avatar</th>
                  <th>Identity</th>
                  <th>Primary Email</th>
                  <th>Core Role</th>
                  <th>Linked Unit</th>
                  <th style={{ textAlign: 'right' }}>Management</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div className="table-avatar">
                        {u.profileImage ? (
                          <img src={u.profileImage} alt="Avatar" />
                        ) : (
                          u.username.charAt(0).toUpperCase()
                        )}
                      </div>
                    </td>
                    <td style={{ fontWeight: 700 }}>{u.username}</td>
                    <td style={{ opacity: 0.8 }}>{u.email}</td>
                    <td>
                      <span className={`status-tag ${u.role === 'SuperAdmin' ? 'tag-completed' : 'tag-progress'}`}>{u.role}</span>
                    </td>
                    <td>{u.department?.name || "-"}</td>
                    <td>
                      <div className="action-btn-group">
                        <button className="btn-icon-only" onClick={() => handleEdit(u)} title="Edit User">✎</button>
                        <button className="btn-icon-only btn-delete-icon" onClick={() => setDeleteTargetId(u._id)} title="Delete User">✕</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', opacity: 0.6 }}>
                      No user identities matching query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <ConfirmModal
          isOpen={!!deleteTargetId}
          title="Revoke User Identity?"
          message="Are you sure you want to permanently remove this user account from the directory?"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTargetId(null)}
        />
      </div>
    </div>
  );
};

export default UserPage;
