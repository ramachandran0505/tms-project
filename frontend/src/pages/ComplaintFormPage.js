import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { complaintService, blockService, roomService, departmentService } from "../services/api";
import "./ComplaintFormPage.css";

const complaintTypes = [
  "PC Hardware", "PC Software", "Application Issues", "Network",
  "Electronics", "Plumbing", "Other",
];

const ComplaintFormPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [departmentId, setDepartmentId] = useState("");
  const [departments, setDepartments] = useState([]);
  const [blockId, setBlockId] = useState("");
  const [roomId, setRoomId] = useState("");
  const [customRoomNumber, setCustomRoomNumber] = useState("");
  const [blocks, setBlocks] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [type, setType] = useState(complaintTypes[0]);
  const [remarks, setRemarks] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const resp = await departmentService.getAll();
        setDepartments(resp.data || []);
      } catch (err) {
        setError("Failed to initialize departmental links.");
      } finally {
        setLoadingData(false);
      }
    };
    fetchDepartments();
  }, []);

  useEffect(() => {
    const fetchBlocks = async () => {
      if (!departmentId) { setBlocks([]); setBlockId(""); return; }
      setLoadingData(true);
      try {
        const resp = await blockService.getAll({ departmentId });
        setBlocks(resp.data || []);
      } catch (err) {
        setError("Structural block retrieval failed.");
      } finally {
        setLoadingData(false);
      }
    };
    fetchBlocks();
    setBlockId(""); setRoomId(""); setFilteredRooms([]);
  }, [departmentId]);

  useEffect(() => {
    const fetchRooms = async () => {
      if (!blockId) { setFilteredRooms([]); setRoomId(""); return; }
      setLoadingData(true);
      try {
        const resp = await roomService.getAll({ blockId });
        setFilteredRooms(resp.data || []);
      } catch (err) {
        setError("Facility directory access error.");
      } finally {
        setLoadingData(false);
      }
    };
    fetchRooms();
    setRoomId("");
  }, [blockId]);

  if (user && !["SuperAdmin", "User"].includes(user.role)) {
    return (
      <div className="complaint-form-page animated-bg">
        <div className="form-rail denied-screen">
          <div className="denied-icon">🚫</div>
          <h1>Security Restriction</h1>
          <p>Your authorization level does not permit ticket generation.</p>
          <button onClick={() => navigate("/")} className="btn-primary" style={{ marginTop: '2rem' }}>Return Home</button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const selectedDepartment = departments.find(d => d._id === departmentId);
      const selectedBlock = blocks.find(b => b._id === blockId);
      const selectedRoom = filteredRooms.find(r => r._id === roomId);

      const finalRoomNumber = roomId === "__manual__" ? customRoomNumber : selectedRoom?.roomNumber || "";
      if (!finalRoomNumber) {
        setError("Valid facility identifier required.");
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("departmentName", selectedDepartment?.name || "");
      formData.append("programmeName", selectedBlock?.programme?.name || "");
      formData.append("blockName", selectedBlock?.name || "");
      formData.append("roomNumber", finalRoomNumber);
      formData.append("complaintType", type);
      formData.append("remarks", remarks);
      if (attachment) formData.append("attachment", attachment);
      if (user?.id || user?._id) formData.append("userId", user.id || user._id);

      await complaintService.create(formData);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Transmission failure.");
    } finally {
      setLoading(false);
    }
  };

  if (loadingData && departments.length === 0) return <div className="loading">Initializing Secure Form...</div>;

  return (
    <div className="complaint-form-page animated-bg">
      <div className="form-rail">
        <header className="form-hero">
          <h1>Report Incident</h1>
          <p>Submit a maintenance request to the facility management group</p>
        </header>

        {error && <div className="error-message">{error}</div>}

        <div className="form-glass-card">
          <form onSubmit={handleSubmit} className="form-cluster">
            <div className="form-row">
              <div className="form-group">
                <label>Target Department</label>
                <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} required>
                  <option value="">Select Department</option>
                  {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Sector / Block</label>
                <select value={blockId} onChange={(e) => setBlockId(e.target.value)} required disabled={!departmentId}>
                  <option value="">Select Block</option>
                  {blocks.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Facility / Room</label>
                <select value={roomId} onChange={(e) => setRoomId(e.target.value)} disabled={!blockId} required>
                  <option value="">Select Room</option>
                  {filteredRooms.map(r => <option key={r._id} value={r._id}>{r.roomNumber}</option>)}
                  <option value="__manual__">Manual Entry / Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Service Category</label>
                <select value={type} onChange={(e) => setType(e.target.value)}>
                  {complaintTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            {roomId === "__manual__" && (
              <div className="form-group">
                <label>Custom Room Identifier</label>
                <input
                  value={customRoomNumber}
                  onChange={(e) => setCustomRoomNumber(e.target.value)}
                  placeholder="e.g. LAB-001"
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label>Description of Incident</label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Details of the operational failure..."
                rows="4"
              />
            </div>

            <div className="form-group">
              <label>Evidence Documentation</label>
              <div className="file-upload-zone">
                <input type="file" onChange={(e) => setAttachment(e.target.files[0])} accept="image/*,application/pdf" />
                <div className="upload-icon">📁</div>
                <div className="upload-text">Attach Media or PDF</div>
                {attachment && <div className="selected-file-name">{attachment.name}</div>}
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '1.2rem' }}>
              {loading ? "Transmitting..." : "Initiate Request"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ComplaintFormPage;
