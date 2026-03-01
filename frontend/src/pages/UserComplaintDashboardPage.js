import React, { useEffect, useState, useContext, useCallback } from "react";
import { complaintService } from "../services/api";
import { AuthContext } from "../context/AuthContext";
import "./UserComplaintDashboardPage.css";

const StatCard = ({ label, value, color, onClick }) => (
  <div
    className="stat-card"
    style={{ "--stat-color": color }}
    onClick={onClick}
    role="button"
    tabIndex={0}
  >
    <div className="stat-value">{value}</div>
    <div className="stat-label">{label}</div>
    <div className="stat-glow" style={{ background: color }}></div>
  </div>
);

const UserComplaintDashboardPage = () => {
  const { user } = useContext(AuthContext);
  const [myStats, setMyStats] = useState({
    total: 0,
    pending: 0,
    assigned: 0,
    closed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [complaints, setComplaints] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await complaintService.getAll();
      const allComplaints = res.data || [];

      const userId = user?.id || user?._id;
      const userComplaints = allComplaints.filter((c) => {
        const createdById = c.createdBy?._id || c.createdBy;
        const assignedToId = c.assignedTo?._id || c.assignedTo;
        return (
          String(createdById) === String(userId) ||
          String(assignedToId) === String(userId)
        );
      });
      setComplaints(userComplaints);

      const stats = {
        total: userComplaints.filter(c => String(c.assignedTo?._id || c.assignedTo) === String(userId)).length || userComplaints.length,
        pending: userComplaints.filter((c) => c.status === "Pending").length,
        assigned: userComplaints.filter((c) => c.status === "Assigned").length,
        closed: userComplaints.filter((c) => c.status === "Completed").length,
      };
      setMyStats(stats);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load complaints");
    } finally {
      setLoading(false);
    }
  }, [user]);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await complaintService.updateStatus(id, newStatus);
      loadData();
      if (selectedComplaint && selectedComplaint._id === id) {
        setSelectedComplaint({ ...selectedComplaint, status: newStatus });
      }
    } catch (err) {
      setError("Status update failed.");
    }
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredComplaints =
    filterStatus === "All"
      ? complaints
      : complaints.filter((c) => c.status === filterStatus);

  const viewComplaintDetails = (complaint) => {
    setSelectedComplaint(complaint);
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  if (loading) return <div className="loading">Initializing Dashboard...</div>;

  return (
    <div className="user-complaint-dashboard animated-bg">
      <div className="dashboard-content">
        <header className="page-hero-header">
          <h1>My Performance</h1>
          <p>Tracking your service tickets and issue resolutions</p>
        </header>

        {error && <div className="error-message">{error}</div>}

        <section className="stats-overview">
          <div className="stats-grid">
            <StatCard
              label="Total Engagement"
              value={myStats.total}
              color="var(--primary)"
              onClick={() => setFilterStatus("All")}
            />
            <StatCard
              label="Pending Review"
              value={myStats.pending}
              color="var(--primary)"
              onClick={() => setFilterStatus("Pending")}
            />
            <StatCard
              label="Success Closed"
              value={myStats.closed}
              color="#10b981"
              onClick={() => setFilterStatus("Completed")}
            />
          </div>
        </section>

        {selectedComplaint && (
          <section className="complaint-details-glass">
            <div className="details-header">
              <h2>Ticket Inspection</h2>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="close-details-btn"
              >✕</button>
            </div>

            <div className="details-info-grid">
              <div className="info-box">
                <span className="info-label">Location Control</span>
                <span className="info-content">
                  {selectedComplaint.blockName} • {selectedComplaint.roomNumber}
                </span>
              </div>
              <div className="info-box">
                <span className="info-label">Category</span>
                <span className="info-content">{selectedComplaint.complaintType}</span>
              </div>
              <div className="info-box">
                <span className="info-label">Current Status</span>
                <div>
                  <span className={`status-tag ${getStatusClass(selectedComplaint.status)}`}>
                    {selectedComplaint.status}
                  </span>
                </div>
              </div>
              <div className="info-box">
                <span className="info-label">Submission Date</span>
                <span className="info-content">
                  {new Date(selectedComplaint.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="info-box" style={{ gridColumn: "1 / -1" }}>
                <span className="info-label">Service Remarks</span>
                <p className="info-content" style={{ fontWeight: 400, opacity: 0.8 }}>
                  {selectedComplaint.remarks || "No remarks provided."}
                </p>
              </div>

              {selectedComplaint.attachment && (
                <div className="info-box" style={{ gridColumn: "1 / -1" }}>
                  <span className="info-label">Evidentiary Attachment</span>
                  <a
                    href={`http://localhost:5000/${selectedComplaint.attachment}`}
                    target="_blank"
                    rel="noreferrer"
                    className="reset-filter-btn"
                    style={{ textDecoration: 'none', display: 'inline-block', marginTop: '0.5rem' }}
                  >
                    View Document ↗
                  </a>
                </div>
              )}

              {/* Staff Actions in Details */}
              {String(selectedComplaint.assignedTo?._id || selectedComplaint.assignedTo) === String(user?.id || user?._id) && selectedComplaint.status !== "Completed" && (
                <div className="info-box" style={{ gridColumn: "1 / -1", borderTop: '1px solid var(--border-soft)', paddingTop: '1.5rem', marginTop: '1rem' }}>
                  <span className="info-label">Administrative Actions</span>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    {selectedComplaint.status !== "In-Progress" && (
                      <button onClick={() => handleStatusUpdate(selectedComplaint._id, "In-Progress")} className="admin-action-btn btn-assign" style={{ flex: 1 }}>Begin Work ⚡</button>
                    )}
                    <button onClick={() => handleStatusUpdate(selectedComplaint._id, "Completed")} className="admin-action-btn btn-done" style={{ flex: 1 }}>Mark Finished ✓</button>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        <section className="data-table-container">
          <div className="table-header-row">
            <h3>{filterStatus} Activity Rail</h3>
            <button onClick={() => setFilterStatus("All")} className="reset-filter-btn">
              Clear Filters
            </button>
          </div>

          <div className="table-wrapper">
            <table className="standard-table">
              <thead>
                <tr>
                  <th>Target</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Timestamp</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredComplaints.map((c) => (
                  <tr key={c._id} onClick={() => viewComplaintDetails(c)} style={{ cursor: 'pointer' }}>
                    <td>{c.blockName} / {c.roomNumber}</td>
                    <td>{c.complaintType}</td>
                    <td>
                      <span className={`status-tag ${getStatusClass(c.status)}`}>
                        {c.status}
                      </span>
                    </td>
                    <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {String(c.assignedTo?._id || c.assignedTo) === String(user?.id || user?._id) && c.status !== "Completed" && (
                          <>
                            {c.status !== "In-Progress" && (
                              <button
                                onClick={() => handleStatusUpdate(c._id, "In-Progress")}
                                className="admin-action-btn btn-assign"
                                style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                              >
                                Work
                              </button>
                            )}
                            <button
                              onClick={() => handleStatusUpdate(c._id, "Completed")}
                              className="admin-action-btn btn-done"
                              style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                            >
                              Finish
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => viewComplaintDetails(c)}
                          className="reset-filter-btn"
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                        >
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredComplaints.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '4rem', opacity: 0.5 }}>
                      No digital records matching these filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default UserComplaintDashboardPage;
