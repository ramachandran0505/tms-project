import React, { useContext, useEffect, useState } from "react";
import { complaintService, departmentService, programmeService, userService } from "../services/api";
import { AuthContext } from "../context/AuthContext";
import "./ReportsPage.css";

const ReportsPage = () => {
  const { user } = useContext(AuthContext);
  const [departments, setDepartments] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({
    department: "",
    programme: "",
    complaintType: "",
    status: "",
    assignee: "",
    assigneeRole: "",
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchReportInternal = async (filterParams) => {
    setError("");
    setLoading(true);
    try {
      const params = { ...filterParams };
      Object.keys(params).forEach((k) => { if (!params[k]) delete params[k]; });
      const res = await complaintService.report(params);
      setResults(res.data || []);
    } catch (err) {
      setError("Intelligence retrieval failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role !== "SuperAdmin") return;
    Promise.all([
      departmentService.getAll(),
      programmeService.getAll(),
      userService.getAll(),
    ]).then(([d, p, u]) => {
      setDepartments(d.data || []);
      setProgrammes(p.data || []);
      setUsers(u.data || []);
    }).catch(() => { });
  }, [user]);

  useEffect(() => {
    const savedFilters = localStorage.getItem("superadmin_report_filters");
    const hasGenerated = localStorage.getItem("superadmin_report_generated");
    if (hasGenerated && savedFilters) {
      try {
        const parsed = JSON.parse(savedFilters);
        setFilters(parsed);
        fetchReportInternal(parsed);
      } catch (e) { }
    }
  }, []);

  const handleManualGenerate = () => {
    localStorage.setItem("superadmin_report_filters", JSON.stringify(filters));
    localStorage.setItem("superadmin_report_generated", "true");
    fetchReportInternal(filters);
  };

  const exportCSV = () => {
    if (!results.length) return;
    const headers = ["Date", "Dept", "Programme", "Block", "Room", "Type", "Status", "CreatedBy", "Staff Role", "Assignee"];
    const rows = results.map((r) => [
      new Date(r.createdAt).toLocaleString(),
      r.departmentName || "-", r.programmeName || "-",
      r.blockName, r.roomNumber, r.complaintType, r.status,
      r.createdBy?.username || r.createdBy?.email || "",
      r.assignedTo?.role || "-",
      r.assignedTo?.username || r.assignedTo?.email || "",
    ]);
    const csv = [headers.join(","), ...rows.map(row => row.map(cell => `"${("" + cell).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `TMS_Data_Export_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (user?.role !== "SuperAdmin") {
    return (
      <div className="reports-page animated-bg">
        <div className="reports-rail denied-screen">
          <div className="denied-icon">🔒</div>
          <h1>Security Override Required</h1>
          <p>Access to analytical data is restricted to SuperAdmin tier.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reports-page animated-bg">
      <div className="reports-rail">
        <header className="reports-header">
          <h1>Intelligence Center</h1>
          <p className="info-label">Advanced filtering and analytical data export</p>
        </header>

        {error && <div className="error-message">{error}</div>}

        <section className="filter-console">
          <div className="intelligence-grid">
            <div className="form-group">
              <label>Department Unit</label>
              <select value={filters.department} onChange={(e) => setFilters({ ...filters, department: e.target.value })}>
                <option value="">All Units</option>
                {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Programme Hub</label>
              <select value={filters.programme} onChange={(e) => setFilters({ ...filters, programme: e.target.value })}>
                <option value="">All Hubs</option>
                {programmes.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Operational Type</label>
              <input value={filters.complaintType} onChange={(e) => setFilters({ ...filters, complaintType: e.target.value })} placeholder="Search codes..." />
            </div>
            <div className="form-group">
              <label>Staff Role</label>
              <select value={filters.assigneeRole} onChange={(e) => setFilters({ ...filters, assigneeRole: e.target.value, assignee: "" })}>
                <option value="">All Roles</option>
                <option value="Networking Staff">Networking Staff</option>
                <option value="Plumber">Plumber</option>
                <option value="Electrician">Electrician</option>
                <option value="Software Developer">Software Developer</option>
                <option value="Application">Application</option>
                <option value="PC Hardware">PC Hardware</option>
              </select>
            </div>
            <div className="form-group">
              <label>Specific Staff</label>
              <select value={filters.assignee} onChange={(e) => setFilters({ ...filters, assignee: e.target.value })}>
                <option value="">All Personnel</option>
                {users
                  .filter(u => !filters.assigneeRole || u.role === filters.assigneeRole)
                  .map(u => <option key={u._id} value={u._id}>{u.username}</option>)
                }
              </select>
            </div>
            <div className="form-group">
              <label>Lifecycle Status</label>
              <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                <option value="">All States</option>
                <option value="Pending">Pending</option>
                <option value="Assigned">Assigned</option>
                <option value="In-Progress">In-Progress</option>
                <option value="Onhold">Onhold</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="intelligence-btn-group">
            <button onClick={exportCSV} className="btn-intelligence btn-secondary-intel">Export Data Cluster ⤓</button>
            <button onClick={handleManualGenerate} className="btn-intelligence btn-primary-intel">Initialize Search 🔍</button>
          </div>
        </section>

        <section className="intelligence-card">
          <div className="table-header-row">
            <h3>Analytical Result Grid</h3>
            <span className="info-label">{results.length} Nodes Identified</span>
          </div>

          <div className="table-wrapper">
            <table className="standard-table">
              <thead>
                <tr>
                  <th>Temporal Node</th>
                  <th>Structural ID</th>
                  <th>Category</th>
                  <th>Condition</th>
                  <th>Staff Role</th>
                  <th>Assignee</th>
                  <th>Origin</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem' }}>Processing Data...</td></tr>
                ) : (
                  results.map(r => (
                    <tr key={r._id}>
                      <td style={{ opacity: 0.7 }}>{new Date(r.createdAt).toLocaleDateString()}</td>
                      <td><strong>{r.blockName}</strong> • {r.roomNumber}</td>
                      <td>{r.complaintType}</td>
                      <td><span className={`status-tag tag-progress`}>{r.status}</span></td>
                      <td><span className="info-label" style={{ fontSize: '0.8rem' }}>{r.assignedTo?.role || "-"}</span></td>
                      <td>{r.assignedTo?.username || "Unassigned"}</td>
                      <td>{r.createdBy?.username || "N/A"}</td>
                    </tr>
                  ))
                )}
                {!loading && results.length === 0 && (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem', opacity: 0.5 }}>No data nodes found for selected criteria.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ReportsPage;
