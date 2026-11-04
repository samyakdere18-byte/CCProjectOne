// frontend/src/components/SearchBar.jsx
import React from "react";

const DEPARTMENTS = [
  "Computer Engineering",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "BEST",
];

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

export default function SearchBar({
  value = "",
  onChange,
  department = "all",
  onDepartmentChange,
  semester = "all",
  onSemesterChange,
  onReset,
  totalResults,
}) {
  const isFiltered = Boolean(
    value.trim() ||
      (department && department !== "all") ||
      (semester && semester !== "all")
  );

  return (
    <div className="filter-toolbar" role="search" aria-label="Student Filters">
      {/* Search Input Box */}
      <div className="search-box">
        <span className="search-box__icon" aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        <input
          type="text"
          className="search-box__input"
          placeholder="Search by student name, ID, email, or dept..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label="Search students"
        />
        {value && (
          <button
            className="search-box__clear"
            onClick={() => onChange("")}
            aria-label="Clear search text"
            type="button"
            title="Clear text"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* Filter Selects Group */}
      <div className="filter-group">
        {/* Department Filter */}
        {onDepartmentChange && (
          <div className="filter-select-wrap">
            <label htmlFor="dept-filter" className="sr-only">Filter by Department</label>
            <select
              id="dept-filter"
              className="filter-select"
              value={department}
              onChange={(e) => onDepartmentChange(e.target.value)}
              aria-label="Filter by department"
            >
              <option value="all">All Departments</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <span className="filter-select__chevron" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </span>
          </div>
        )}

        {/* Semester Filter */}
        {onSemesterChange && (
          <div className="filter-select-wrap filter-select-wrap--sm">
            <label htmlFor="sem-filter" className="sr-only">Filter by Semester</label>
            <select
              id="sem-filter"
              className="filter-select"
              value={semester}
              onChange={(e) => onSemesterChange(e.target.value)}
              aria-label="Filter by semester"
            >
              <option value="all">All Semesters</option>
              {SEMESTERS.map((s) => (
                <option key={s} value={String(s)}>
                  Sem {s}
                </option>
              ))}
            </select>
            <span className="filter-select__chevron" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </span>
          </div>
        )}

        {/* Reset Filter Button */}
        {isFiltered && onReset && (
          <button
            type="button"
            className="btn btn--outline btn--sm"
            onClick={onReset}
            title="Reset all search filters"
          >
            <svg
              className="btn-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
