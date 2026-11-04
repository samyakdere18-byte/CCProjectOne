// frontend/src/components/DeleteConfirmModal.jsx
import React, { useEffect } from "react";

export default function DeleteConfirmModal({
  isOpen,
  student,
  onConfirm,
  onCancel,
  isDeleting,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && !isDeleting) {
        onCancel();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isDeleting, onCancel]);

  if (!isOpen || !student) return null;

  return (
    <div className="modal-backdrop" onClick={onCancel} role="dialog" aria-modal="true">
      <div
        className="modal-card modal-card--danger"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-icon-badge modal-icon-badge--danger">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </div>
          <div className="modal-title-group">
            <h3 className="modal-title">Delete Student Record</h3>
            <p className="modal-subtitle">
              This action will permanently remove the record from MongoDB Atlas.
            </p>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onCancel}
            disabled={isDeleting}
            aria-label="Close dialog"
          >
            &times;
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-student-summary">
            <div className="summary-row">
              <span className="summary-label">Student Name:</span>
              <span className="summary-value summary-value--highlight">
                {student.name}
              </span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Student ID:</span>
              <span className="summary-value summary-value--mono">
                {student.studentId}
              </span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Department:</span>
              <span className="summary-value">{student.department}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Semester:</span>
              <span className="summary-value">Semester {student.semester}</span>
            </div>
          </div>
          <p className="modal-warning-note">
            <strong>Warning:</strong> Deleting this record is irreversible. All academic data associated with ID <strong>{student.studentId}</strong> will be erased.
          </p>
        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="btn btn--secondary"
            onClick={onCancel}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn--danger"
            onClick={() => onConfirm(student)}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <span className="btn-spinner-wrap">
                <span className="spinner-sm" />
                Deleting...
              </span>
            ) : (
              "Yes, Delete Record"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

