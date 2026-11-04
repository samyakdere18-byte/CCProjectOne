// frontend/src/components/StudentForm.jsx
import React, { useEffect, useState } from "react";

const EMPTY_FORM = {
  studentId: "",
  name: "",
  email: "",
  department: "",
  semester: "",
  contact: "",
};

const DEPARTMENTS = [
  "Computer Engineering",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "BEST",
];

export default function StudentForm({
  onSubmit,
  editingStudent,
  onCancelEdit,
  submitting,
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingStudent) {
      setForm({
        studentId: editingStudent.studentId || "",
        name: editingStudent.name || "",
        email: editingStudent.email || "",
        department: editingStudent.department || "",
        semester: editingStudent.semester ?? "",
        contact: editingStudent.contact || "",
      });
      setErrors({});
    } else {
      setForm(EMPTY_FORM);
    }
  }, [editingStudent]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const next = {};

    if (!form.studentId.trim()) {
      next.studentId = "Student ID is required";
    }

    if (!form.name.trim()) {
      next.name = "Full name is required";
    } else if (form.name.trim().length < 2) {
      next.name = "Name must be at least 2 characters";
    }

    if (!form.email.trim()) {
      next.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      next.email = "Please enter a valid academic email address";
    }

    if (!form.department.trim()) {
      next.department = "Please select an academic department";
    }

    if (form.semester === "" || form.semester === null) {
      next.semester = "Academic semester is required";
    } else {
      const sem = Number(form.semester);
      if (Number.isNaN(sem) || sem < 1 || sem > 8) {
        next.semester = "Semester must be a number between 1 and 8";
      }
    }

    if (form.contact && !/^[\d+\-\s()]{6,20}$/.test(form.contact.trim())) {
      next.contact = "Contact number must be 6–20 digits";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      studentId: form.studentId.trim(),
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      department: form.department.trim(),
      semester: Number(form.semester),
      contact: form.contact.trim(),
    };

    const ok = await onSubmit(payload);
    if (ok && !editingStudent) {
      setForm(EMPTY_FORM);
      setErrors({});
    }
  };

  const handleCancel = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    onCancelEdit();
  };

  return (
    <section
      id="student-form-section"
      className={`card form-card ${editingStudent ? "form-card--editing" : ""}`}
      aria-labelledby="form-heading"
    >
      {/* Form Card Header */}
      <div className="card__header card__header--split">
        <div className="card__heading">
          <div className="card__eyebrow-row">
            <span
              className={`status-pill ${
                editingStudent ? "status-pill--warning" : "status-pill--primary"
              }`}
            >
              {editingStudent ? "EDIT MODE" : "STUDENT REGISTRATION"}
            </span>
            {editingStudent && (
              <span className="text-muted text-mono text-sm">
                Target Record: #{editingStudent.studentId}
              </span>
            )}
          </div>
          <h3 id="form-heading" className="card__title">
            {editingStudent
              ? `Updating Record: ${editingStudent.name}`
              : "Register New Student"}
          </h3>
          <p className="card__description">
            {editingStudent
              ? "Modify the academic credentials below. Updates are directly saved to MongoDB Atlas."
              : "Enter official student credentials to enroll a student in the institutional database."}
          </p>
        </div>

        {editingStudent && (
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={handleCancel}
            disabled={submitting}
          >
            Cancel Edit
          </button>
        )}
      </div>

      {/* Form Body */}
      <form onSubmit={handleSubmit} className="student-form" noValidate>
        <div className="form-grid">
          {/* 1. Student ID */}
          <div className="form-group">
            <label htmlFor="studentId" className="form-label">
              Student ID <span className="required-star">*</span>
            </label>
            <div className="input-group">
              <span className="input-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="16" rx="2" />
                  <line x1="7" y1="8" x2="17" y2="8" />
                  <line x1="7" y1="12" x2="11" y2="12" />
                  <line x1="7" y1="16" x2="15" y2="16" />
                </svg>
              </span>
              <input
                id="studentId"
                name="studentId"
                type="text"
                value={form.studentId}
                onChange={handleChange}
                placeholder="e.g. BIT-2026-CS001"
                className={`form-input form-input--mono ${
                  errors.studentId ? "form-input--error" : ""
                }`}
                disabled={submitting}
                autoComplete="off"
              />
            </div>
            {errors.studentId && (
              <span className="form-error">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {errors.studentId}
              </span>
            )}
          </div>

          {/* 2. Full Name */}
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Full Legal Name <span className="required-star">*</span>
            </label>
            <div className="input-group">
              <span className="input-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Aarav Sharma"
                className={`form-input ${errors.name ? "form-input--error" : ""}`}
                disabled={submitting}
                autoComplete="name"
              />
            </div>
            {errors.name && (
              <span className="form-error">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {errors.name}
              </span>
            )}
          </div>

          {/* 3. Email Address */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Academic Email <span className="required-star">*</span>
            </label>
            <div className="input-group">
              <span className="input-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </span>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="e.g. student@bit.edu"
                className={`form-input ${errors.email ? "form-input--error" : ""}`}
                disabled={submitting}
                autoComplete="email"
              />
            </div>
            {errors.email && (
              <span className="form-error">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {errors.email}
              </span>
            )}
          </div>

          {/* 4. Department Dropdown */}
          <div className="form-group">
            <label htmlFor="department" className="form-label">
              Department <span className="required-star">*</span>
            </label>
            <div className="input-group">
              <span className="input-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
              </span>
              <select
                id="department"
                name="department"
                value={form.department}
                onChange={handleChange}
                className={`form-input form-select ${
                  errors.department ? "form-input--error" : ""
                }`}
                disabled={submitting}
              >
                <option value="">Select Academic Department</option>
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
              <span className="select-arrow" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </span>
            </div>
            {errors.department && (
              <span className="form-error">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {errors.department}
              </span>
            )}
          </div>

          {/* 5. Semester */}
          <div className="form-group">
            <label htmlFor="semester" className="form-label">
              Semester (1 to 8) <span className="required-star">*</span>
            </label>
            <div className="input-group">
              <span className="input-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 14 10" />
                </svg>
              </span>
              <select
                id="semester"
                name="semester"
                value={form.semester}
                onChange={handleChange}
                className={`form-input form-select ${
                  errors.semester ? "form-input--error" : ""
                }`}
                disabled={submitting}
              >
                <option value="">Select Semester</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Semester {s} ({s <= 4 ? "Lower Division" : "Upper Division"})
                  </option>
                ))}
              </select>
              <span className="select-arrow" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </span>
            </div>
            {errors.semester && (
              <span className="form-error">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {errors.semester}
              </span>
            )}
          </div>

          {/* 6. Contact Number */}
          <div className="form-group">
            <label htmlFor="contact" className="form-label">
              Phone / Contact Number <span className="optional-tag">(Optional)</span>
            </label>
            <div className="input-group">
              <span className="input-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </span>
              <input
                id="contact"
                name="contact"
                type="tel"
                value={form.contact}
                onChange={handleChange}
                placeholder="e.g. +91 98765 43210"
                className={`form-input ${errors.contact ? "form-input--error" : ""}`}
                disabled={submitting}
                autoComplete="tel"
              />
            </div>
            {errors.contact && (
              <span className="form-error">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {errors.contact}
              </span>
            )}
          </div>
        </div>

        {/* Form Action Controls */}
        <div className="form-actions-bar">
          <div className="form-actions-bar__note">
            <span className="required-star">*</span> Required fields for database integrity
          </div>

          <div className="form-actions-bar__buttons">
            {editingStudent && (
              <button
                type="button"
                className="btn btn--secondary"
                onClick={handleCancel}
                disabled={submitting}
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              className="btn btn--primary btn--md"
              disabled={submitting}
            >
              {submitting ? (
                <span className="btn-spinner-wrap">
                  <span className="spinner-sm" />
                  Saving to Database...
                </span>
              ) : editingStudent ? (
                <>
                  <svg
                    className="btn-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
                  </svg>
                  Update Student Record
                </>
              ) : (
                <>
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
                  Save Student Record
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
