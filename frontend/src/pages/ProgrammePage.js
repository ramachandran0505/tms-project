import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { programmeService, departmentService } from "../services/api";
import ConfirmModal from "../components/ConfirmModal";
import "./MasterScreen.css";

const ProgrammePage = () => {
  const { user } = useContext(AuthContext);
  const [programmes, setProgrammes] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", shortName: "", department: "" });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  useEffect(() => {
    if (user?.role === "SuperAdmin") fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [progRes, deptRes] = await Promise.all([
        programmeService.getAll(),
        departmentService.getAll(),
      ]);
      setProgrammes(progRes.data || []);
      setDepartments(deptRes.data || []);
      setError("");
    } catch (err) {
      setError("Data synchronization failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await programmeService.update(editingId, formData);
      } else {
        await programmeService.create(formData);
      }
      setFormData({ name: "", shortName: "", department: "" });
      setEditingId(null);
      setShowForm(false);
      fetchData();
    } catch (err) {
      setError("Failed to commit programme data.");
    }
  };

  const handleEdit = (prog) => {
    setFormData({
      ...prog,
      department: prog.department?._id || prog.department
    });
    setEditingId(prog._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await programmeService.delete(deleteTargetId);
      setDeleteTargetId(null);
      fetchData();
    } catch (err) {
      setError("Deletion restricted by active dependencies.");
      setDeleteTargetId(null);
    }
  };

  const filteredProgrammes = programmes.filter(
    (prog) =>
      prog.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prog.shortName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prog.department?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="loading">Initializing Academic Data...</div>;

  return (
    <div className="master-screen animated-bg">
      <div className="screen-content">
        <header className="screen-header-rail">
          <h1>Programme Management</h1>
          <button
            onClick={() => { setShowForm(!showForm); if (showForm) setEditingId(null); }}
            className="btn-primary"
          >
            {showForm ? "✕ Close Console" : "＋ Register Programme"}
          </button>
        </header>

        {error && <div className="error-message">{error}</div>}

        {showForm && (
          <form className="master-form-glass" onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Academic Programme Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Bachelor of Technology"
                  required
                />
              </div>
              <div className="form-group">
                <label>Code</label>
                <input
                  type="text"
                  value={formData.shortName}
                  onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                  placeholder="e.g. B.Tech"
                  required
                />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Parent Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  required
                >
                  <option value="">Select Target Department</option>
                  {departments.map((dept) => (
                    <option key={dept._id} value={dept._id}>{dept.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%' }}>
              {editingId ? "Update Programme" : "Establish Programme"}
            </button>
          </form>
        )}

        <section className="master-table-card">
          <div className="table-action-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
            <h3>Programme Registry ({filteredProgrammes.length})</h3>
            <input
              type="text"
              placeholder="🔍 Search programme or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ maxWidth: '300px' }}
            />
          </div>
          <div className="table-wrapper">
            <table className="standard-table">
              <thead>
                <tr>
                  <th>Academic Identity</th>
                  <th>ID</th>
                  <th>Department</th>
                  <th style={{ textAlign: 'right' }}>Management</th>
                </tr>
              </thead>
              <tbody>
                {filteredProgrammes.map((prog) => (
                  <tr key={prog._id}>
                    <td style={{ fontWeight: 700 }}>{prog.name}</td>
                    <td><span className="status-tag tag-progress">{prog.shortName}</span></td>
                    <td>{prog.department?.name || "N/A"}</td>
                    <td>
                      <div className="action-btn-group">
                        <button className="btn-icon-only" onClick={() => handleEdit(prog)} title="Edit">✎</button>
                        <button className="btn-icon-only btn-delete-icon" onClick={() => setDeleteTargetId(prog._id)} title="Delete">✕</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredProgrammes.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '3rem', opacity: 0.6 }}>
                      No programme records matching query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <ConfirmModal
          isOpen={!!deleteTargetId}
          title="Delete Programme?"
          message="Are you sure you want to permanently remove this academic programme record?"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTargetId(null)}
        />
      </div>
    </div>
  );
};

export default ProgrammePage;
