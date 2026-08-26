import React, { useEffect, useState, useContext } from "react";
import { complaintService, userService } from "../services/api";
import { AuthContext } from "../context/AuthContext";
import "./ComplaintsDashboardPage.css";

const ComplaintsDashboardPage = () => {
  const { user } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, assigned: 0, closed: 0 });
  const [listLoading, setListLoading] = useState(true);
  const [error, setError] = useState("");
  const [assignTarget, setAssignTarget] = useState({ complaintId: null, assignee: "" });

  useEffect(() => {
    const load = async () => {
      try {
        setListLoading(true);
        const [compRes, statRes] = await Promise.all([
          complaintService.getAll(),
          complaintService.getStats()
        ]);
        setComplaints(compRes.data || []);
        setStats(statRes.data || { total: 0, pending: 0, assigned: 0, closed: 0 });
      } catch (err) {
        setError("Network failure: Unable to retrieve global ticker.");
      } finally {
        setListLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (user?.role === "SuperAdmin") {
      userService.getAll().then((res) => setUsers(res.data || [])).catch(() => { });
    }
  }, [user]);

  const refresh = async () => {
    try {
      const [res, s] = await Promise.all([
        complaintService.getAll(),
        complaintService.getStats()
      ]);
      setComplaints(res.data || []);
      setStats(s.data || { total: 0, pending: 0, assigned: 0, closed: 0 });
    } catch (e) { }
  };

  const handleAssignSubmit = async () => {
    if (!assignTarget.assignee) return;
    try {
      await complaintService.assign(assignTarget.complaintId, assignTarget.assignee);
      setAssignTarget({ complaintId: null, assignee: "" });
      refresh();
    } catch (err) {
      setError("Assignment rejected by server.");
    }
  };



  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending":
        return <span className="status-tag tag-pending">🕒 Pending</span>;
      case "Assigned":
        return <span className="status-tag tag-assigned">👤 Assigned</span>;
      case "In-Progress":
      case "In Progress":
        return <span className="status-tag tag-progress">🔄 In Progress</span>;
      case "Completed":
      case "Closed":
        return <span className="status-tag tag-completed">✅ Closed</span>;
      default:
        return <span className="status-tag">{status}</span>;
    }
  };

  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch =
      c.blockName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.roomNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.complaintType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.createdBy?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c._id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "All" || c.complaintType === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (listLoading) return <div className="loading">Accessing Global Repository...</div>;

  return (
    <div className="complaints-dashboard animated-bg">
      <div className="dashboard-rail">
        <header className="dashboard-hero">
          <h1>Global Oversight & Ticket Management</h1>
          <p className="info-label">Centralized complaint tracking, assignment, and status controls</p>
        </header>

        {error && <div className="error-message">{error}</div>}

        <section className="admin-stats-grid">
          <div className="admin-stat-card" style={{ "--stat-color": "#6C47FF" }}>
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total Tickets</span>
          </div>
          <div className="admin-stat-card" style={{ "--stat-color": "#F59E0B" }}>
            <span className="stat-value">{stats.pending}</span>
            <span className="stat-label">Awaiting Triage</span>
          </div>
          <div className="admin-stat-card" style={{ "--stat-color": "#8B5CF6" }}>
            <span className="stat-value">{stats.assigned}</span>
            <span className="stat-label">In Field / Assigned</span>
          </div>
          <div className="admin-stat-card" style={{ "--stat-color": "#10B981" }}>
            <span className="stat-value">{stats.closed}</span>
            <span className="stat-label">Closed / Resolved</span>
          </div>
        </section>

        {/* SearchBar & Filter Controls */}
        <section className="filter-search-row">
          <input
            type="text"
            placeholder="🔍 Search ticket ID, location, category, or user..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 2, minWidth: '240px' }}
          />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{ width: 'auto', minWidth: '180px' }}
          >
            <option value="All">All Categories</option>
            <option value="PC Hardware">PC Hardware</option>
            <option value="PC Software">PC Software</option>
            <option value="Application Issues">Application Issues</option>
            <option value="Network">Network</option>
            <option value="Electronics">Electronics</option>
            <option value="Plumbing">Plumbing</option>
            <option value="Other">Other</option>
          </select>
          <button onClick={refresh} className="reset-filter-btn" style={{ padding: '0.75rem 1.25rem' }}>
            Sync Feed ⟳
          </button>
        </section>

        <section className="admin-table-container">
          <div className="table-header-row">
            <h3>Ticket Registry ({filteredComplaints.length})</h3>
          </div>

          <div className="table-wrapper">
            <table className="standard-table">
              <thead>
                <tr>
                  <th>Ticket ID & Location</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Originator</th>
                  <th>Timestamp</th>
                  <th>Management</th>
                </tr>
              </thead>
              <tbody>
                {filteredComplaints.map((c) => {
                  const isAssigned = c.assignedTo && String(c.assignedTo._id || c.assignedTo) === String(user?.id || user?._id);
                  return (
                    <tr key={c._id}>
                      <td>
                        <strong>#{c._id.slice(-6).toUpperCase()}</strong> • {c.blockName} ({c.roomNumber})
                      </td>
                      <td>{c.complaintType}</td>
                      <td>{getStatusBadge(c.status)}</td>
                      <td>{c.createdBy?.username || "Anonymous"}</td>
                      <td style={{ opacity: 0.7 }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="action-btn-group">
                          {user?.role === "SuperAdmin" && c.status !== "Completed" && (
                            assignTarget.complaintId === c._id ? (
                              <div className="assign-mini-form">
                                <select
                                  className="mini-select"
                                  value={assignTarget.assignee}
                                  onChange={(e) => setAssignTarget({ ...assignTarget, assignee: e.target.value })}
                                >
                                  <option value="">User</option>
                                  {users.filter(u => u.role !== 'SuperAdmin').map(u => (
                                    <option key={u._id} value={u._id}>{u.username}</option>
                                  ))}
                                </select>
                                <button onClick={handleAssignSubmit} className="admin-action-btn btn-assign">✓</button>
                                <button onClick={() => setAssignTarget({ complaintId: null, assignee: "" })} className="admin-action-btn">✕</button>
                              </div>
                            ) : (
                              <button onClick={() => setAssignTarget({ complaintId: c._id, assignee: "" })} className="admin-action-btn btn-assign">Assign</button>
                            )
                          )}

                          {(isAssigned || user?.role === "SuperAdmin") && c.status !== "Completed" && (
                            <>
                              {c.status !== "In-Progress" && (
                                <button onClick={() => complaintService.updateStatus(c._id, "In-Progress").then(refresh)} className="admin-action-btn btn-assign">Work</button>
                              )}
                              <button onClick={() => complaintService.updateStatus(c._id, "Completed").then(refresh)} className="admin-action-btn btn-done">Finish</button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ComplaintsDashboardPage;
