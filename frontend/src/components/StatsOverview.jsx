// frontend/src/components/StatsOverview.jsx
import React from "react";

const DEPARTMENTS = [
  "Computer Engineering",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "BEST",
];

export default function StatsOverview({
  students,
  onAddClick,
  onDepartmentSelect,
  selectedDepartment,
  onExportCsv,
}) {
  const totalStudents = students.length;

  // Department counts
  const deptCounts = DEPARTMENTS.reduce((acc, dept) => {
    acc[dept] = students.filter((s) => s.department === dept).length;
    return acc;
  }, {});

  // Unique active departments
  const activeDepts = Object.values(deptCounts).filter((c) => c > 0).length;

  // Average semester
  const avgSemester =
    totalStudents > 0
      ? (
          students.reduce((sum, s) => sum + (Number(s.semester) || 0), 0) /
          totalStudents
        ).toFixed(1)
      : "0";

  // Semester breakdown (e.g. Lower 1-4 vs Upper 5-8)
  const lowerSem = students.filter((s) => Number(s.semester) <= 4).length;
  const upperSem = students.filter((s) => Number(s.semester) > 4).length;

  return (
    <section className="dashboard-stats" aria-label="Student Statistics Dashboard">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="welcome-banner__content">
          <div className="welcome-banner__eyebrow">
            <span className="welcome-banner__pill">Academic Session 2026–27</span>
            <span className="welcome-banner__date">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
          <h2 className="welcome-banner__title">Student Information Management Dashboard</h2>
          <p className="welcome-banner__subtitle">
            Enterprise registry for student records, enrollment tracking, and departmental distribution across Bhilai Institute of Technology.
          </p>
        </div>

        <div className="welcome-banner__actions">
          <button
            type="button"
            className="btn btn--primary"
            onClick={onAddClick}
            aria-label="Scroll to register student form"
          >
            <svg
              className="btn-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add New Student
          </button>

          {totalStudents > 0 && onExportCsv && (
            <button
              type="button"
              className="btn btn--secondary"
              onClick={onExportCsv}
              title="Download directory as CSV"
            >
              <svg
                className="btn-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Export CSV
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        {/* KPI 1: Total Students */}
        <div className="kpi-card">
          <div className="kpi-card__header">
            <span className="kpi-card__label">Total Enrolled</span>
            <div className="kpi-card__icon-wrap kpi-card__icon-wrap--blue">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
          </div>
          <div className="kpi-card__body">
            <span className="kpi-card__value">{totalStudents}</span>
            <span className="kpi-card__badge kpi-card__badge--neutral">
              Active Database Records
            </span>
          </div>
          <div className="kpi-card__footer">
            <span className="kpi-subtext">Verified in MongoDB Atlas</span>
          </div>
        </div>

        {/* KPI 2: Active Departments */}
        <div className="kpi-card">
          <div className="kpi-card__header">
            <span className="kpi-card__label">Active Departments</span>
            <div className="kpi-card__icon-wrap kpi-card__icon-wrap--purple">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
          </div>
          <div className="kpi-card__body">
            <span className="kpi-card__value">{activeDepts} <span className="kpi-card__sub-value">/ {DEPARTMENTS.length}</span></span>
            <span className="kpi-card__badge kpi-card__badge--purple">
              Engineering Disciplines
            </span>
          </div>
          <div className="kpi-card__footer">
            <span className="kpi-subtext">5 Program Specializations</span>
          </div>
        </div>

        {/* KPI 3: Average Semester */}
        <div className="kpi-card">
          <div className="kpi-card__header">
            <span className="kpi-card__label">Mean Academic Level</span>
            <div className="kpi-card__icon-wrap kpi-card__icon-wrap--amber">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
          </div>
          <div className="kpi-card__body">
            <span className="kpi-card__value">Sem {avgSemester}</span>
            <span className="kpi-card__badge kpi-card__badge--amber">
              Semesters 1 &ndash; 8
            </span>
          </div>
          <div className="kpi-card__footer">
            <span className="kpi-subtext">
              {lowerSem} Foundation (1-4) &bull; {upperSem} Advanced (5-8)
            </span>
          </div>
        </div>

        {/* KPI 4: Database Sync Status */}
        <div className="kpi-card">
          <div className="kpi-card__header">
            <span className="kpi-card__label">Cloud Infrastructure</span>
            <div className="kpi-card__icon-wrap kpi-card__icon-wrap--emerald">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
          </div>
          <div className="kpi-card__body">
            <span className="kpi-card__value kpi-card__value--status">100%</span>
            <span className="kpi-card__badge kpi-card__badge--emerald">
              Healthy &bull; Atlas Replica
            </span>
          </div>
          <div className="kpi-card__footer">
            <span className="kpi-subtext">Backend Port 5000 Active</span>
          </div>
        </div>
      </div>

      {/* Department Quick Filter Pills */}
      <div className="dept-breakdown">
        <div className="dept-breakdown__header">
          <span className="dept-breakdown__title">Department Enrollment Quick Filters:</span>
          {selectedDepartment !== "all" && (
            <button
              type="button"
              className="dept-breakdown__reset"
              onClick={() => onDepartmentSelect("all")}
            >
              Reset to All ({totalStudents})
            </button>
          )}
        </div>
        <div className="dept-breakdown__chips">
          <button
            type="button"
            className={`dept-chip ${selectedDepartment === "all" ? "dept-chip--active" : ""}`}
            onClick={() => onDepartmentSelect("all")}
          >
            All Departments
            <span className="dept-chip__count">{totalStudents}</span>
          </button>
          {DEPARTMENTS.map((d) => (
            <button
              key={d}
              type="button"
              className={`dept-chip ${selectedDepartment === d ? "dept-chip--active" : ""}`}
              onClick={() => onDepartmentSelect(d)}
            >
              {d}
              <span className="dept-chip__count">{deptCounts[d] || 0}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

