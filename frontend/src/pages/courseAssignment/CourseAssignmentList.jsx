/**
 * File: CourseAssignmentList.jsx
 * Description: React component rendering the CourseAssignmentList UI interface.
 * 
 * This file is part of the RUET OneHub Project.
 */

import { useState, useEffect } from "react";
import courseService from "../../services/courseService";
import { DEPARTMENTS, SEMESTERS, BATCHES } from "../../utils/constants";
import { PageLoader } from "../../components/common/Loader";
import {
  Layers,
  Check,
  CheckCircle2,
  Search,
  Save,
  AlertCircle,
} from "lucide-react";

export function CourseAssignmentList() {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);

  const [selectedBatch, setSelectedBatch] = useState("21");
  const [selectedDept, setSelectedDept] = useState("ECE");
  const [selectedSemester, setSelectedSemester] = useState("2-1");
  const [selectedCourseIds, setSelectedCourseIds] = useState([]);

  const [search, setSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    const fetchCatalog = async () => {
      setLoading(true);
      try {
        const catalog = await courseService.getAllCourses(1, 100); 
        setCourses(catalog);
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, []);

  const toggleCourse = (courseId) => {
    if (selectedCourseIds.includes(courseId)) {
      setSelectedCourseIds(selectedCourseIds.filter((id) => id !== courseId));
    } else {
      setSelectedCourseIds([...selectedCourseIds, courseId]);
    }
  };

  const handleSelectAllSemester = () => {
    const semCourses = courses
      .filter((c) => c.department === selectedDept && c.semester === selectedSemester)
      .map((c) => c._id);
    setSelectedCourseIds(Array.from(new Set([...selectedCourseIds, ...semCourses])));
  };

  const handleClearSelection = () => {
    setSelectedCourseIds([]);
  };

  const handleSaveAssignment = async () => {
    if (selectedCourseIds.length === 0) {
      setMessage({ text: "Please select at least one course for the batch.", type: "error" });
      return;
    }

    setSubmitting(true);
    setMessage({ text: "", type: "" });
    try {
      await courseService.assignCoursesToBatch({
        batch: selectedBatch,
        department: selectedDept,
        semester: selectedSemester,
        courseIds: selectedCourseIds,
      });
      setMessage({
        text: `Successfully assigned ${selectedCourseIds.length} courses to Batch '${selectedBatch} (${selectedDept}, Semester ${selectedSemester}).`,
        type: "success",
      });
    } catch (err) {
      setMessage({ text: err.message || "Failed to save course assignment.", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <PageLoader text="Loading course catalog..." />;
  }

  // Filter courses by department/semester/search
  const filteredCourses = courses.filter((c) => {
    const matchSearch =
      c.courseCode.toLowerCase().includes(search.toLowerCase()) ||
      c.courseName.toLowerCase().includes(search.toLowerCase());
    const matchDept = c.department === selectedDept;
    const matchSem = c.semester === selectedSemester;
    return matchSearch && matchDept && matchSem;
  });

  const selectedCoursesList = courses.filter((c) => selectedCourseIds.includes(c._id));
  const totalCredits = selectedCoursesList.reduce((sum, c) => sum + (c.credit || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center space-x-2.5">
          <Layers className="w-7 h-7 text-sky-600" />
          <span>Batch Course Assignment Configuration</span>
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Map standard institutional syllabus courses to a target Batch, Department, and Semester for one-click student enrollment.
        </p>
      </div>

      {message.text && (
        <div
          className={`p-4 rounded-2xl border flex items-center space-x-3 text-sm animate-in fade-in duration-200 ${
            message.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Configuration Header Card */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
          Target Student Group
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1.5">
              Series / Batch
            </label>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-none"
            >
              {BATCHES.map((b) => (
                <option key={b} value={b}>
                  Batch '{b}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1.5">
              Department
            </label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-none"
            >
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1.5">
              Academic Semester
            </label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-none"
            >
              {SEMESTERS.map((s) => (
                <option key={s} value={s}>
                  Semester {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Course Selection Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Available Courses Picker */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search catalog..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleSelectAllSemester}
                className="px-3 py-1.5 bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-lg text-xs font-semibold transition-smooth"
              >
                Auto-Select {selectedDept} ({selectedSemester})
              </button>
              <button
                type="button"
                onClick={handleClearSelection}
                className="px-3 py-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg text-xs font-semibold transition-smooth"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[550px] overflow-y-auto pr-1">
            {filteredCourses.map((course) => {
              const isSelected = selectedCourseIds.includes(course._id);
              return (
                <div
                  key={course._id}
                  onClick={() => toggleCourse(course._id)}
                  className={`p-4 rounded-xl border transition-smooth cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "bg-sky-50/70 border-sky-400 ring-1 ring-sky-400"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="font-mono font-bold text-xs text-sky-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {course.courseCode}
                    </span>
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center transition-smooth ${
                        isSelected
                          ? "bg-sky-600 text-white"
                          : "border border-slate-300 text-transparent"
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <h4 className="text-sm font-semibold text-slate-800 mt-2 line-clamp-2">
                    {course.courseName}
                  </h4>

                  <div className="flex items-center justify-between text-xs text-slate-500 mt-3 pt-2 border-t border-slate-100">
                    <span>{course.department} • Sem {course.semester}</span>
                    <span className="font-bold text-slate-700">{course.credit} Cr</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Package Summary */}
        <div className="space-y-4">
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between h-full">
            <div>
              <h3 className="font-bold text-slate-800 text-base mb-1">
                Assigned Package Summary
              </h3>
              <p className="text-xs text-slate-500">
                Batch '{selectedBatch} • {selectedDept} • Semester {selectedSemester}
              </p>

              <div className="my-5 p-4 bg-slate-50 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 block">Total Selected</span>
                  <strong className="text-lg text-slate-800">
                    {selectedCourseIds.length} Courses
                  </strong>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 block">Total Credits</span>
                  <strong className="text-lg text-sky-700">
                    {totalCredits.toFixed(2)} Cr
                  </strong>
                </div>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {selectedCoursesList.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">
                    No courses selected yet.
                  </p>
                ) : (
                  selectedCoursesList.map((c) => (
                    <div
                      key={c._id}
                      className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg text-xs"
                    >
                      <span className="font-medium text-slate-700 truncate pr-2">
                        <strong className="font-mono text-sky-700">{c.courseCode}</strong> {c.courseName}
                      </span>
                      <span className="font-bold text-slate-600 shrink-0">{c.credit}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 mt-6">
              <button
                onClick={handleSaveAssignment}
                disabled={submitting || selectedCourseIds.length === 0}
                className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-smooth shadow-sm flex items-center justify-center space-x-2 cursor-pointer"
              >
                {submitting ? (
                  <span>Saving Assignment...</span>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Course Package</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseAssignmentList;
