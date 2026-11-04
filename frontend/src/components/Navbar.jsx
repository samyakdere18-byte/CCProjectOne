// frontend/src/components/Navbar.jsx
import React from "react";

export default function Navbar({ studentCount, onRefresh, loading }) {
  return (
    <header className="navbar">
      <div className="navbar__container">
        {/* Brand */}
        <div className="navbar__brand">
          <div className="navbar__logo" aria-hidden="true">
            <svg
              className="navbar__logo-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </div>
          <div className="navbar__brand-text">
            <div className="navbar__brand-row">
              <span className="navbar__title">BIT Student Information System</span>
              <span className="navbar__badge">PORTAL</span>
            </div>
            <p className="navbar__subtitle">
              Bhilai Institute of Technology &bull; Student Records &amp; Directory
            </p>
          </div>
        </div>

        {/* Status & Actions */}
        <div className="navbar__actions">
          {/* Database & System Live Indicator */}
          <div className="status-indicator" title="Connected to MongoDB Atlas cluster">
            <span className="status-indicator__dot"></span>
            <span className="status-indicator__text">MongoDB Atlas Active</span>
          </div>

          {/* Refresh Button */}
          {onRefresh && (
            <button
              type="button"
              className="navbar__action-btn"
              onClick={onRefresh}
              disabled={loading}
              title="Refresh database records"
              aria-label="Refresh student data"
            >
              <svg
                className={`navbar__btn-icon ${loading ? "navbar__btn-icon--spin" : ""}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21.5 2v6h-6M2.5 22v-6h6" />
                <path d="M21.5 15.5a9 9 0 0 1-15.65 3.35L2.5 16M2.5 8.5A9 9 0 0 1 18.15 5.15L21.5 8" />
              </svg>
              <span className="navbar__btn-label">Sync</span>
            </button>
          )}

          {/* User Profile */}
          <div className="navbar__user">
            <div className="navbar__user-avatar" title="Registrar Administrator">
              <span>AD</span>
            </div>
            <div className="navbar__user-meta">
              <span className="navbar__user-name">Registrar Office</span>
              <span className="navbar__user-role">Administrator</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
