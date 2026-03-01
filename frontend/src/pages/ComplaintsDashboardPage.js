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



  const getStatusClass = (status) => {
    switch (status) {
      case "Pending": return "tag-pending";
      case "Assigned": return "tag-assigned";
      case "In-Progress": return "tag-progress";
      case "Completed": return "tag-completed";
      default: return "";
    }
  };

  if (listLoading) return <div className="loading">Accessing Global Repository...</div>;

  return (
    <div className="complaints-dashboard animated-bg">
      <div className="dashboard-rail">
        <header className="dashboard-hero">
          <h1>Global Oversight</h1>
          <p className="info-label">Centralized complaint management dashboard</p>
        </header>

        {error && <div className="error-message">{error}</div>}

        <section className="admin-stats-grid">
          <div className="admin-stat-card" style={{ "--stat-color": "var(--primary)" }}>
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">System Load</span>
          </div>
          <div className="admin-stat-card" style={{ "--stat-color": "var(--primary)" }}>
            <span className="stat-value">{stats.pending}</span>
            <span className="stat-label">Awaiting Triage</span>
          </div>
          <div className="admin-stat-card" style={{ "--stat-color": "#8b5cf6" }}>
            <span className="stat-value">{stats.assigned}</span>
            <span className="stat-label">In Field View</span>
          </div>
          <div className="admin-stat-card" style={{ "--stat-color": "#10b981" }}>
            <span className="stat-value">{stats.closed}</span>
            <span className="stat-label">Resolved Units</span>
          </div>
        </section>

        <section className="admin-table-container">
          <div className="table-header-row">
            <h3>Live Ticker Output</h3>
            <button onClick={refresh} className="reset-filter-btn">Manual Sync ⟳</button>
          </div>

          <div className="table-wrapper">
            <table className="standard-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Designation</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Originator</th>
                  <th>Management</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c) => {
                  const isAssigned = c.assignedTo && String(c.assignedTo._id || c.assignedTo) === String(user?.id || user?._id);
                  return (
                    <tr key={c._id}>
                      <td style={{ opacity: 0.7 }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td>
                        <strong>{c.blockName}</strong> • {c.roomNumber}
                      </td>
                      <td>{c.complaintType}</td>
                      <td>
                        <span className={`status-tag ${getStatusClass(c.status)}`}>
                          {c.status}
                        </span>
                      </td>
                      <td>{c.createdBy?.username || "Anonymous"}</td>
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
