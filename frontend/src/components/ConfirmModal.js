import React from "react";
import "./ConfirmModal.css";

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = "Delete", isDanger = true }) => {
  if (!isOpen) return null;

  return (
    <div className="confirm-modal-overlay" onClick={onCancel}>
      <div className="confirm-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-modal-icon">⚠️</div>
        <h3 className="confirm-modal-title">{title}</h3>
        <p className="confirm-modal-message">{message}</p>
        <div className="confirm-modal-actions">
          <button className="confirm-modal-btn cancel" onClick={onCancel}>
            Cancel
          </button>
          <button className={`confirm-modal-btn ${isDanger ? "danger" : "primary"}`} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
