// frontend/src/App.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Navbar from "./components/Navbar";
import StatsOverview from "./components/StatsOverview";
import SearchBar from "./components/SearchBar";
import StudentForm from "./components/StudentForm";
import StudentTable from "./components/StudentTable";
import DeleteConfirmModal from "./components/DeleteConfirmModal";
import {
  getAllStudents,
  createStudent,
  updateStudent,
  deleteStudent,
} from "./services/studentService";

export default function App() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [semesterFilter, setSemesterFilter] = useState("all");

  // Edit & Delete modal state
  const [editingStudent, setEditingStudent] = useState(null);
  const [studentToDelete, setStudentToDelete] = useState(null);

  // Notifications
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = (type, message) => setToast({ type, message });

  /* ---------------- Fetch All Students ---------------- */
  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllStudents();
      setStudents(res.data || []);
    } catch (err) {
      showToast("error", err.message);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  /* ---------------- Create or Update Student ---------------- */
  const handleSubmit = async (payload) => {
    setSubmitting(true);
    try {
      if (editingStudent) {
        const res = await updateStudent(editingStudent._id, payload);
        setStudents((prev) =>
          prev.map((s) => (s._id === editingStudent._id ? res.data : s))
        );
        showToast("success", `Record for "${res.data.name}" updated successfully.`);
        setEditingStudent(null);
      } else {
        const res = await createStudent(payload);
        setStudents((prev) => [res.data, ...prev]);
        showToast("success", `Student "${res.data.name}" enrolled successfully.`);
      }
      return true;
    } catch (err) {
      showToast("error", err.message);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------- Delete Student Modal Confirmation ---------------- */
  const handleOpenDeleteModal = (student) => {
    setStudentToDelete(student);
  };

  const handleConfirmDelete = async (student) => {
    if (!student?._id) return;
    setDeleting(true);
    try {
      await deleteStudent(student._id);
      setStudents((prev) => prev.filter((s) => s._id !== student._id));
      if (editingStudent && editingStudent._id === student._id) {
        setEditingStudent(null);
      }
      showToast("success", `Student record "${student.name}" deleted from database.`);
      setStudentToDelete(null);
    } catch (err) {
      showToast("error", err.message);
    } finally {
      setDeleting(false);
    }
  };

  /* ---------------- Edit Student Handler ---------------- */
  const handleEditClick = (student) => {
    setEditingStudent(student);
    const formEl = document.getElementById("student-form-section");
    if (formEl) {
      formEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleScrollToForm = () => {
    const formEl = document.getElementById("student-form-section");
    if (formEl) {
      formEl.scrollIntoView({ behavior: "smooth", block: "start" });
      const firstInput = formEl.querySelector("input#studentId");
      if (firstInput) firstInput.focus();
    }
  };

  /* ---------------- Reset Filters ---------------- */
  const handleResetFilters = () => {
    setSearch("");
    setDepartmentFilter("all");
    setSemesterFilter("all");
  };

  /* ---------------- Export Current List to CSV ---------------- */
  const handleExportCsv = () => {
    if (filteredStudents.length === 0) return;
    const headers = [
      "Student ID",
      "Full Name",
      "Email Address",
      "Department",
      "Semester",
      "Contact",
    ];
    const rows = filteredStudents.map((s) => [
      `"${s.studentId || ""}"`,
      `"${s.name || ""}"`,
      `"${s.email || ""}"`,
      `"${s.department || ""}"`,
      `"${s.semester || ""}"`,
      `"${s.contact || ""}"`,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `BIT_Student_Directory_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("success", "Exported student directory as CSV.");
  };

  /* ---------------- Filter Students ---------------- */
  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase();
    return students.filter((s) => {
      const matchesSearch =
        !q ||
        s.studentId?.toLowerCase().includes(q) ||
        s.name?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.department?.toLowerCase().includes(q);

      const matchesDept =
        departmentFilter === "all" || s.department === departmentFilter;

      const matchesSem =
        semesterFilter === "all" ||
        String(s.semester) === String(semesterFilter);

      return matchesSearch && matchesDept && matchesSem;
    });
  }, [students, search, departmentFilter, semesterFilter]);

  const hasFilter = Boolean(
    search.trim() || departmentFilter !== "all" || semesterFilter !== "all"
  );

  return (
    <div className="app-layout">
      {/* 1. Header Navbar */}
      <Navbar
        studentCount={students.length}
        onRefresh={fetchStudents}
        loading={loading}
      />

      {/* 2. Floating Notification Toast */}
      {toast && (
        <div className={`toast-container toast-container--${toast.type}`} role="alert">
          <div className="toast-card">
            <span className="toast-icon">
              {toast.type === "success" ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              )}
            </span>
            <div className="toast-content">
              <span className="toast-title">
                {toast.type === "success" ? "Operation Successful" : "Attention Required"}
              </span>
              <span className="toast-message">{toast.message}</span>
            </div>
            <button
              className="toast-close-btn"
              onClick={() => setToast(null)}
              aria-label="Dismiss notification"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* 3. Main Dashboard Workspace */}
      <main className="main-content">
        <div className="content-container">
          {/* A. Dashboard Statistics Overview */}
          <StatsOverview
            students={students}
            onAddClick={handleScrollToForm}
            onDepartmentSelect={(dept) => setDepartmentFilter(dept)}
            selectedDepartment={departmentFilter}
            onExportCsv={handleExportCsv}
          />

          {/* B. Student Registration & Update Form */}
          <StudentForm
            onSubmit={handleSubmit}
            editingStudent={editingStudent}
            onCancelEdit={() => setEditingStudent(null)}
            submitting={submitting}
          />

          {/* C. Student Directory Section */}
          <section className="card directory-card" aria-labelledby="directory-heading">
            <div className="card__header card__header--split">
              <div className="card__heading">
                <div className="card__eyebrow-row">
                  <span className="status-pill status-pill--primary">
                    INSTITUTIONAL DIRECTORY
                  </span>
                  <span className="badge badge--count">
                    {filteredStudents.length} of {students.length} Records
                  </span>
                </div>
                <h3 id="directory-heading" className="card__title">
                  All Registered Students
                </h3>
                <p className="card__description">
                  Filter, search, review, and manage student credentials synced across the university database.
                </p>
              </div>

              {/* Search & Filter Toolbar */}
              <SearchBar
                value={search}
                onChange={setSearch}
                department={departmentFilter}
                onDepartmentChange={setDepartmentFilter}
                semester={semesterFilter}
                onSemesterChange={setSemesterFilter}
                onReset={handleResetFilters}
                totalResults={filteredStudents.length}
              />
            </div>

            {/* D. Data Table */}
            <StudentTable
              students={filteredStudents}
              onEdit={handleEditClick}
              onDelete={handleOpenDeleteModal}
              loading={loading}
              hasStudents={students.length > 0}
              hasFilter={hasFilter}
              onClearFilter={handleResetFilters}
              onAddStudentClick={handleScrollToForm}
            />
          </section>
        </div>
      </main>

      {/* 4. Modern Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(studentToDelete)}
        student={studentToDelete}
        onConfirm={handleConfirmDelete}
        onCancel={() => setStudentToDelete(null)}
        isDeleting={deleting}
      />

      {/* 5. Institutional Footer */}
      <footer className="footer">
        <div className="footer__container">
          <div className="footer__meta">
            <span className="footer__logo-text">BIT Student Information Management System</span>
            <span className="footer__separator">&bull;</span>
            <span className="footer__subtext">Bhilai Institute of Technology</span>
          </div>
          <div className="footer__badges">
            <span className="footer__status-badge">
              <span className="status-indicator__dot"></span>
              MongoDB Atlas Replica Connected
            </span>
            <span className="footer__version">v1.0.0 &bull; Node Express + React Vite</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
