/**
 * File: CourseList.jsx
 * Description: React component rendering the CourseList UI interface.
 * 
 * This file is part of the RUET OneHub Project.
 */

import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import courseService from "../../services/courseService";
import { DEPARTMENTS, SEMESTERS } from "../../utils/constants";
import { PageLoader } from "../../components/common/Loader";
import Modal from "../../components/common/Modal";
import {
  BookOpen,
  Plus,
  Search,
  Users,
  CalendarCheck,
  Award,
  Layers,
} from "lucide-react";

export function CourseList() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  // Data states
  const [registration, setRegistration] = useState(null);
  const [catalog, setCatalog] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");
  const [selectedSemester, setSelectedSemester] = useState("all");

  // Modal for adding course (Admin)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [newCourse, setNewCourse] = useState({
    courseCode: "",
    courseName: "",
    credit: 3.0,
    department: user?.department || "ECE",
    semester: "2-1",
    courseType: "theory",
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (user?.role === "student") {
        try {
          // Import registrationService inside useEffect or component to avoid cyclic dependencies if any,
          // but we can just import it at the top
          const { default: registrationService } = await import("../../services/registrationService");
          const res = await registrationService.getMyRegistration();
          setRegistration(res);
        } catch (e) {
          console.warn("No registration found", e);
        }
      } else {
        const courses = await courseService.getAllCourses();
        setCatalog(courses);
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    try {
      await courseService.createCourse({
        ...newCourse,
        credit: parseFloat(newCourse.credit),
      });
      setIsAddModalOpen(false);
      setNewCourse({
        courseCode: "",
        courseName: "",
        credit: 3.0,
        department: user?.department || "ECE",
        semester: "2-1",
        courseType: "theory",
      });
      await fetchData();
    } catch (err) {
      setErrorMsg(err.message || "Failed to create course");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <PageLoader text="Loading course curriculum..." />;
  }

  // Filtering for faculty/admin view
  const filteredCatalog = catalog.filter((c) => {
    const matchSearch =
      c.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.courseName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDept = selectedDept === "all" || c.department === selectedDept;
    const matchSemester = selectedSemester === "all" || c.semester === selectedSemester;
    return matchSearch && matchDept && matchSemester;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center space-x-2.5">
            <BookOpen className="w-7 h-7 text-sky-600" />
            <span>
              {user?.role === "student" ? "My Academic Courses" : "University Course Catalog"}
            </span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {user?.role === "student"
              ? `Curriculum assigned to Batch '${user?.batch} (${user?.department}) for current academic session.`
              : "Complete institutional syllabus and course registry across all engineering departments."}
          </p>
        </div>

        {user?.role === "admin" && (
          <div className="flex items-center space-x-3">
            <Link
              to="/course-assignments"
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-smooth inline-flex items-center space-x-2"
            >
              <Layers className="w-4 h-4" />
              <span>Assign to Batch</span>
            </Link>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-sm transition-smooth shadow-sm inline-flex items-center space-x-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Course</span>
            </button>
          </div>
        )}
      </div>

      {/* STUDENT VIEW: Enrolled Courses */}
      {user?.role === "student" && (
        <div className="space-y-6">
          {!registration || registration.status !== "approved" ? (
            <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-700">
                {!registration
                  ? "No Active Registration Found"
                  : `Registration Status: ${registration.status.toUpperCase()}`}
              </h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
                {!registration
                  ? "You haven't submitted your course registration for the current semester yet, or your registration was rejected."
                  : "Your course registration is pending approval by your academic adviser. Please wait for it to be approved before viewing your enrolled courses."}
              </p>
              <Link
                to="/registration"
                className="mt-6 inline-flex px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-sm transition-smooth shadow-sm"
              >
                Go to Course Registration
              </Link>
            </div>
          ) : (
            <>
              {/* Summary Box */}
              <div className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-xs uppercase tracking-wider text-sky-400 font-semibold">
                    Semester {registration.semester}
                  </span>
                  <h3 className="text-xl font-bold mt-0.5">Enrolled Course Package</h3>
                  <p className="text-slate-300 text-sm mt-1">
                    Department of {user?.department} • Total Registered Credits:{" "}
                    <span className="text-white font-bold">{registration.totalCredit || 0}</span>
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <Link
                    to="/attendance"
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-semibold rounded-xl transition-smooth flex items-center space-x-1.5"
                  >
                    <CalendarCheck className="w-4 h-4 text-sky-400" />
                    <span>Attendance Log</span>
                  </Link>
                  <Link
                    to="/marks"
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-semibold rounded-xl transition-smooth flex items-center space-x-1.5"
                  >
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>Marks & Grades</span>
                  </Link>
                </div>
              </div>

              {/* Courses Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {registration.courseIds?.map((course) => (
                  <div
                    key={course._id}
                    className="p-6 bg-white rounded-2xl border border-slate-200 hover:border-sky-300 shadow-xs hover:shadow-md transition-smooth flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-3 py-1 bg-sky-50 text-sky-700 font-mono font-bold text-xs rounded-lg border border-sky-200">
                          {course.courseCode}
                        </span>
                        <span
                          className={`text-[11px] font-semibold uppercase px-2.5 py-0.5 rounded-full ${
                            course.courseType === "theory"
                              ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          }`}
                        >
                          {course.courseType}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-800 leading-snug">
                        {course.courseName}
                      </h3>
                      <p className="text-xs text-slate-500 mt-2">
                        Department: <span className="font-semibold text-slate-700">{course.department}</span> •
                        Credit: <span className="font-bold text-sky-700">{course.credit}</span>
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                      <Link
                        to={`/attendance?courseId=${course._id}`}
                        className="font-medium text-slate-600 hover:text-sky-600 inline-flex items-center"
                      >
                        <CalendarCheck className="w-3.5 h-3.5 mr-1" />
                        Attendance
                      </Link>
                      <Link
                        to={`/marks?courseId=${course._id}`}
                        className="font-medium text-slate-600 hover:text-amber-600 inline-flex items-center"
                      >
                        <Award className="w-3.5 h-3.5 mr-1" />
                        CT Marks
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* FACULTY / ADMIN VIEW: Full Course Catalog */}
      {user?.role !== "student" && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search by code or title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-slate-500">Dept:</span>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="all">All Departments</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-slate-500">Semester:</span>
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="all">All Semesters</option>
                  {SEMESTERS.map((s) => (
                    <option key={s} value={s}>
                      Semester {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-4">Course Code</th>
                    <th className="py-3.5 px-4">Course Title</th>
                    <th className="py-3.5 px-4">Credit</th>
                    <th className="py-3.5 px-4">Department</th>
                    <th className="py-3.5 px-4">Semester</th>
                    <th className="py-3.5 px-4">Type</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {filteredCatalog.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No courses found matching your search filters.
                      </td>
                    </tr>
                  ) : (
                    filteredCatalog.map((course) => (
                      <tr key={course._id} className="hover:bg-slate-50/80 transition-smooth">
                        <td className="py-3.5 px-4 font-mono font-bold text-sky-700">
                          {course.courseCode}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">
                          {course.courseName}
                        </td>
                        <td className="py-3.5 px-4 font-medium">
                          {course.credit}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 bg-slate-100 rounded-md text-xs font-medium text-slate-700">
                            {course.department}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs">
                          {course.semester}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${
                              course.courseType === "theory"
                                ? "bg-indigo-50 text-indigo-700"
                                : "bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            {course.courseType}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          <Link
                            to={`/courses/${course._id}`}
                            className="px-3 py-1.5 bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-lg text-xs font-medium transition-smooth inline-flex items-center space-x-1"
                          >
                            <Users className="w-3.5 h-3.5" />
                            <span>Enrolled Students</span>
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Admin Add Course Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Syllabus Course"
      >
        <form onSubmit={handleCreateCourse} className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
              Course Code
            </label>
            <input
              type="text"
              required
              placeholder="e.g. ECE 2101"
              value={newCourse.courseCode}
              onChange={(e) => setNewCourse({ ...newCourse, courseCode: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
              Course Name / Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Signals and Systems"
              value={newCourse.courseName}
              onChange={(e) => setNewCourse({ ...newCourse, courseName: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Credit Hours
              </label>
              <input
                type="number"
                step="0.25"
                required
                value={newCourse.credit}
                onChange={(e) => setNewCourse({ ...newCourse, credit: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Course Type
              </label>
              <select
                value={newCourse.courseType}
                onChange={(e) => setNewCourse({ ...newCourse, courseType: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
              >
                <option value="theory">Theory</option>
                <option value="sessional">Sessional / Lab</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Department
              </label>
              <select
                value={newCourse.department}
                onChange={(e) => setNewCourse({ ...newCourse, department: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Semester
              </label>
              <select
                value={newCourse.semester}
                onChange={(e) => setNewCourse({ ...newCourse, semester: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
              >
                {SEMESTERS.map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-3 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-xl text-sm hover:bg-slate-50 transition-smooth"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-sm transition-smooth disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Save Course"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default CourseList;
