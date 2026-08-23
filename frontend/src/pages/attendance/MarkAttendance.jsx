/**
 * File: MarkAttendance.jsx
 * Description: React component rendering the MarkAttendance UI interface.
 * 
 * This file is part of the RUET OneHub Project.
 */

import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import courseService from "../../services/courseService";
import attendanceService from "../../services/attendanceService";
import { SEMESTERS } from "../../utils/constants";
import { PageLoader } from "../../components/common/Loader";
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Save,
  AlertCircle,
} from "lucide-react";

export function MarkAttendance() {
  const [searchParams] = useSearchParams();
  const initialCourseId = searchParams.get("courseId") || "";
  const initialSemester = searchParams.get("semester") || "2-1";

  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(initialCourseId);
  const [selectedSemester, setSelectedSemester] = useState(initialSemester);
  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Student Roster & Attendance Map
  const [students, setStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({}); // { [studentId]: boolean (true=present, false=absent) }
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ text: "", type: "" });

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const list = await courseService.getAllCourses();
        setCourses(list);
        if (!selectedCourseId && list.length > 0) {
          setSelectedCourseId(list[0]._id);
          if (list[0].semester) setSelectedSemester(list[0].semester);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [selectedCourseId]);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedCourseId) return;
      try {
        const enrolled = await courseService.getCourseStudents(selectedCourseId);
        setStudents(enrolled);

        // Default all enrolled students to present: true
        const initialMap = {};
        enrolled.forEach((s) => {
          initialMap[s._id] = true;
        });
        setAttendanceMap(initialMap);
      } catch (e) {
        console.warn("Error fetching students", e);
      }
    };
    fetchStudents();
  }, [selectedCourseId]);

  const toggleStudent = (studentId) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  const handleMarkAll = (isPresent) => {
    const updated = {};
    students.forEach((s) => {
      updated[s._id] = isPresent;
    });
    setAttendanceMap(updated);
  };

  const handleSubmitBulk = async () => {
    if (!selectedCourseId || students.length === 0) return;
    setSubmitting(true);
    setStatusMsg({ text: "", type: "" });

    try {
      const entries = students.map((s) => ({
        studentId: s._id,
        present: !!attendanceMap[s._id],
      }));

      await attendanceService.markBulkAttendance({
        courseId: selectedCourseId,
        semester: selectedSemester,
        date: attendanceDate,
        entries,
      });

      const presentTotal = entries.filter((e) => e.present).length;
      setStatusMsg({
        text: `Successfully recorded attendance for ${entries.length} students (${presentTotal} Present, ${entries.length - presentTotal} Absent) on ${attendanceDate}.`,
        type: "success",
      });
    } catch (err) {
      setStatusMsg({
        text: err.message || "Failed to record bulk attendance.",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <PageLoader text="Loading class roster for attendance..." />;
  }

  const presentCount = Object.values(attendanceMap).filter(Boolean).length;
  const absentCount = students.length - presentCount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center space-x-2.5">
          <CalendarCheck className="w-7 h-7 text-sky-600" />
          <span>Class Attendance Register</span>
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Take daily lecture attendance in bulk for approved course student rosters.
        </p>
      </div>

      {statusMsg.text && (
        <div
          className={`p-4 rounded-2xl border flex items-center space-x-3 text-sm animate-in fade-in duration-200 ${
            statusMsg.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          {statusMsg.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Settings Bar */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Lecture Session Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
              Course
            </label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-sky-500"
            >
              {courses.filter(c => c.semester === selectedSemester).map((c) => (
                <option key={c._id} value={c._id}>
                  {c.courseCode} - {c.courseName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
              Semester
            </label>
            <select
              value={selectedSemester}
              onChange={(e) => {
                const newSem = e.target.value;
                setSelectedSemester(newSem);
                const filtered = courses.filter(c => c.semester === newSem);
                setSelectedCourseId(filtered.length > 0 ? filtered[0]._id : "");
              }}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-sky-500"
            >
              {SEMESTERS.map((s) => (
                <option key={s} value={s}>
                  Semester {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
              Class Date
            </label>
            <input
              type="date"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Roster & Attendance Toggles */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3 text-sm">
            <span className="font-bold text-slate-800">
              Roster: {students.length} Students
            </span>
            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
              {presentCount} Present
            </span>
            <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 text-xs font-bold rounded-full">
              {absentCount} Absent
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => handleMarkAll(true)}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg transition-smooth"
            >
              All Present
            </button>
            <button
              type="button"
              onClick={() => handleMarkAll(false)}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-lg transition-smooth"
            >
              All Absent
            </button>
            <button
              type="button"
              onClick={handleSubmitBulk}
              disabled={submitting || students.length === 0}
              className="px-5 py-1.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-semibold rounded-lg text-xs transition-smooth shadow-sm flex items-center space-x-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{submitting ? "Saving..." : "Save Attendance"}</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Roll Number</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Batch</th>
                <th className="py-3 px-4 text-center">Status Toggle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No approved enrolled students found for this course. Please verify course registrations.
                  </td>
                </tr>
              ) : (
                students.map((student, idx) => {
                  const isPresent = !!attendanceMap[student._id];
                  return (
                    <tr
                      key={student._id}
                      onClick={() => toggleStudent(student._id)}
                      className="hover:bg-slate-50 cursor-pointer transition-smooth"
                    >
                      <td className="py-3 px-4 text-slate-400 font-mono text-xs">{idx + 1}</td>
                      <td className="py-3 px-4 font-mono font-bold text-sky-700">
                        {student.rollNo || "N/A"}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{student.name}</td>
                      <td className="py-3 px-4 text-xs text-slate-500">
                        Batch '{student.batch || "N/A"}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStudent(student._id);
                          }}
                          className={`px-4 py-1 rounded-full text-xs font-bold transition-smooth inline-flex items-center space-x-1.5 ${
                            isPresent
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : "bg-rose-100 text-rose-800 border border-rose-300"
                          }`}
                        >
                          {isPresent ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Present</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Absent</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default MarkAttendance;
