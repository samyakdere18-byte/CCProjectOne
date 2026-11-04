// frontend/src/components/StudentTable.jsx
import React, { useState } from "react";

// Color maps for department badges
const DEPT_BADGE_CLASS = {
  "Computer Engineering": "badge--dept-blue",
  "Electrical Engineering": "badge--dept-amber",
  "Mechanical Engineering": "badge--dept-purple",
  "Civil Engineering": "badge--dept-emerald",
  BEST: "badge--dept-indigo",
};

// Generates initials from full name (e.g. "Aarav Sharma" -> "AS")
function getInitials(name = "") {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return "ST";
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Consistent avatar background color based on name
function getAvatarColor(name = "") {
  const colors = [
    "avatar--blue",
    "avatar--indigo",
    "avatar--emerald",
    "avatar--amber",
    "avatar--purple",
    "avatar--cyan",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export default function StudentTable({
  students = [],
  onEdit,
  onDelete,
  loading = false,
  hasStudents = false,
  hasFilter = false,
  onClearFilter,
  onAddStudentClick,
}) {
  const [copiedId, setCopiedId] = useState(null);

  const handleCopyEmail = (email, id) => {
    if (!email) return;
    navigator.clipboard.writeText(email).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  /* ---------------- Loading Skeleton State ---------------- */
  if (loading) {
    return (
      <div className="table-state-wrap">
        <div className="table-loading-skeleton" role="status" aria-label="Loading student records">
          <div className="skeleton-header" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton-row">
              <div className="skeleton-cell skeleton-cell--avatar" />
              <div className="skeleton-cell skeleton-cell--id" />
              <div className="skeleton-cell skeleton-cell--text" />
              <div className="skeleton-cell skeleton-cell--badge" />
              <div className="skeleton-cell skeleton-cell--badge" />
              <div className="skeleton-cell skeleton-cell--actions" />
            </div>
          ))}
        </div>
        <p className="loading-text">Synchronizing records with MongoDB Atlas...</p>
      </div>
    );
  }

  /* ---------------- Empty State: No students at all in DB ---------------- */
  if (!hasStudents) {
    return (
      <div className="table-state table-state--empty">
        <div className="table-state__icon-wrap">
          <svg
            className="table-state__icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="19" y1="8" x2="19" y2="14" />
            <line x1="22" y1="11" x2="16" y2="11" />
          </svg>
        </div>
        <h3 className="table-state__title">No Student Records Yet</h3>
        <p className="table-state__description">
          The institutional database is currently empty. Get started by registering your first student using the form above.
        </p>
        {onAddStudentClick && (
          <button
            type="button"
            className="btn btn--primary btn--md"
            onClick={onAddStudentClick}
          >
            <svg
              className="btn-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Register First Student
          </button>
        )}
      </div>
    );
  }

  /* ---------------- Empty State: Filter matched no records ---------------- */
  if (hasFilter && students.length === 0) {
    return (
      <div className="table-state table-state--empty">
        <div className="table-state__icon-wrap table-state__icon-wrap--muted">
          <svg
            className="table-state__icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        </div>
        <h3 className="table-state__title">No Matching Records Found</h3>
        <p className="table-state__description">
          No enrolled students match your search criteria or selected filters. Try searching for a different keyword or department.
        </p>
        {onClearFilter && (
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={onClearFilter}
          >
            Clear All Filters
          </button>
        )}
      </div>
    );
  }

  /* ---------------- Data Table ---------------- */
  return (
    <div className="table-container">
      <div className="table-responsive">
        <table className="enterprise-table" aria-label="Student Directory">
          <thead>
            <tr>
              <th scope="col" className="col-student">Student Name &amp; Identity</th>
              <th scope="col" className="col-id">Student ID</th>
              <th scope="col" className="col-dept">Department</th>
              <th scope="col" className="col-sem text-center">Semester</th>
              <th scope="col" className="col-contact">Contact Info</th>
              <th scope="col" className="col-actions text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => {
              const initials = getInitials(s.name);
              const avatarClass = getAvatarColor(s.name);
              const deptBadgeClass =
                DEPT_BADGE_CLASS[s.department] || "badge--dept-blue";
              const isCopied = copiedId === s._id;

              return (
                <tr key={s._id} className="table-row">
                  {/* Name + Initials Avatar */}
                  <td className="col-student">
                    <div className="student-profile-cell">
                      <div
                        className={`student-avatar ${avatarClass}`}
                        aria-hidden="true"
                        title={s.name}
                      >
                        {initials}
                      </div>
                      <div className="student-info">
                        <span className="student-name" title={s.name}>
                          {s.name}
                        </span>
                        <div className="student-email-row">
                          <a
                            href={`mailto:${s.email}`}
                            className="student-email"
                            title={`Email ${s.email}`}
                          >
                            {s.email}
                          </a>
                          <button
                            type="button"
                            className="copy-btn"
                            onClick={() => handleCopyEmail(s.email, s._id)}
                            title="Copy email to clipboard"
                            aria-label="Copy email address"
                          >
                            {isCopied ? (
                              <span className="copy-btn__copied">Copied!</span>
                            ) : (
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Student ID (Monospace Badge) */}
                  <td className="col-id">
                    <span className="mono-id-badge" title="Official Student ID">
                      {s.studentId}
                    </span>
                  </td>

                  {/* Department Badge */}
                  <td className="col-dept">
                    <span className={`dept-badge ${deptBadgeClass}`}>
                      {s.department}
                    </span>
                  </td>

                  {/* Semester Pill */}
                  <td className="col-sem text-center">
                    <span
                      className={`sem-pill ${
                        Number(s.semester) <= 4 ? "sem-pill--lower" : "sem-pill--upper"
                      }`}
                      title={`Semester ${s.semester}`}
                    >
                      Sem {s.semester}
                    </span>
                  </td>

                  {/* Contact Number */}
                  <td className="col-contact">
                    {s.contact ? (
                      <span className="contact-text">
                        <svg
                          className="contact-icon"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                        {s.contact}
                      </span>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="col-actions text-right">
                    <div className="action-buttons-wrap">
                      <button
                        type="button"
                        className="action-btn action-btn--edit"
                        onClick={() => onEdit(s)}
                        title={`Edit record for ${s.name}`}
                        aria-label={`Edit ${s.name}`}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        className="action-btn action-btn--delete"
                        onClick={() => onDelete(s)}
                        title={`Delete record for ${s.name}`}
                        aria-label={`Delete ${s.name}`}
                      >
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
                        <span>Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Table Footer with Summary */}
      <div className="table-footer">
        <span className="table-footer__count">
          Showing <strong>{students.length}</strong> {students.length === 1 ? "student record" : "student records"}
        </span>
        <span className="table-footer__hint">
          Database: <strong>CCProjectOne</strong> &bull; Atlas Cluster Replica
        </span>
      </div>
    </div>
  );
}
