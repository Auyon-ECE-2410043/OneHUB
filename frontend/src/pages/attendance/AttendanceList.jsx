/**
 * File: AttendanceList.jsx
 * Description: React component rendering the AttendanceList UI interface.
 * 
 * This file is part of the RUET OneHub Project.
 */

import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { SEMESTERS, getSeriesDefaultSemester } from "../../utils/constants";
import attendanceService from "../../services/attendanceService";
import courseService from "../../services/courseService";
import registrationService from "../../services/registrationService";
import { formatDate } from "../../utils/helpers";
import { PageLoader } from "../../components/common/Loader";
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export function AttendanceList() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialCourseId = searchParams.get("courseId") || "";

  const [loading, setLoading] = useState(true);
  const [studentRegistrations, setStudentRegistrations] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState(() => getSeriesDefaultSemester(user) || "2-2");
  const [assignedCourses, setAssignedCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(initialCourseId);

  // Attendance metrics
  const [attendanceData, setAttendanceData] = useState({
    records: [],
    totalClasses: 0,
    presentCount: 0,
    percentage: 0,
  });

  useEffect(() => {
    const fetchRegistrationsAndCourses = async () => {
      setLoading(true);
      try {
        let regs = studentRegistrations;
        if (regs.length === 0) {
          try {
            regs = await registrationService.getAllMyRegistrations();
            setStudentRegistrations(regs || []);
          } catch (e) {
            console.warn("Could not fetch student registrations", e);
          }
        }

        // Check if student has an approved registration for selectedSemester
        const approvedReg = (regs || []).find(
          (r) => r.semester === selectedSemester && r.status === "approved"
        );

        let courses = [];
        if (approvedReg && approvedReg.courseIds && approvedReg.courseIds.length > 0) {
          courses = [...approvedReg.courseIds];
          if (approvedReg.backlogCourseIds && approvedReg.backlogCourseIds.length > 0) {
            courses = [...courses, ...approvedReg.backlogCourseIds];
          }
        } else {
          // Fallback to assigned batch curriculum for this specific semester
          const assigned = await courseService.getAssignedCourses(selectedSemester);
          courses = assigned?.courses || [];
        }

        setAssignedCourses(courses);

        if (courses.length > 0) {
          const exists = courses.some((c) => c._id === selectedCourseId);
          if (!exists) {
            setSelectedCourseId(courses[0]._id);
          }
        } else {
          setSelectedCourseId("");
        }
      } catch (e) {
        console.warn("Could not fetch assigned courses", e);
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrationsAndCourses();
  }, [selectedSemester]);

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!selectedCourseId) return;
      try {
        const data = await attendanceService.getCourseAttendance(selectedCourseId);
        setAttendanceData(data);
      } catch (e) {
        console.warn("Error fetching attendance", e);
        setAttendanceData({ records: [], totalClasses: 0, presentCount: 0, percentage: 0 });
      }
    };
    fetchAttendance();
  }, [selectedCourseId]);

  if (loading) {
    return <PageLoader text="Loading your class attendance records..." />;
  }

  const { records, totalClasses, presentCount, percentage } = attendanceData;
  const missedCount = totalClasses - presentCount;

  // RUET Eligibility Rule (75% collegiate, 50-74% non-collegiate fine, <50% discollegiate)
  const getEligibilityStatus = (pct) => {
    if (totalClasses === 0) return { label: "No Classes Held", color: "text-slate-500 bg-slate-100" };
    if (pct >= 75) return { label: "Collegiate (Eligible)", color: "text-emerald-700 bg-emerald-100 border-emerald-200" };
    if (pct >= 50) return { label: "Non-Collegiate (Fine Required)", color: "text-amber-700 bg-amber-100 border-amber-200" };
    return { label: "Discollegiate (Ineligible)", color: "text-rose-700 bg-rose-100 border-rose-200" };
  };

  const status = getEligibilityStatus(percentage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center space-x-2.5">
            <CalendarCheck className="w-7 h-7 text-sky-600" />
            <span>Class Attendance Record</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Monitor real-time class attendance logs and track RUET exam eligibility compliance.
          </p>
        </div>

        {/* Selectors: Semester and Course */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold uppercase text-slate-500 shrink-0">Semester:</span>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-sky-500 shadow-xs cursor-pointer"
            >
              {SEMESTERS.map((sem) => {
                const isCurrent = sem === getSeriesDefaultSemester(user);
                const isApproved = studentRegistrations.some(
                  (r) => r.semester === sem && r.status === "approved"
                );
                return (
                  <option key={sem} value={sem}>
                    Semester {sem} {isCurrent ? "(Current)" : ""} {isApproved ? "✓ (Approved)" : ""}
                  </option>
                );
              })}
            </select>
          </div>

          {assignedCourses.length > 0 && (
            <div className="flex items-center space-x-2 flex-1 sm:flex-initial">
              <span className="text-xs font-semibold uppercase text-slate-500 shrink-0">Course:</span>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="flex-1 sm:w-auto min-w-[200px] max-w-[320px] truncate px-4 py-2 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-none shadow-xs cursor-pointer"
              >
                {assignedCourses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.courseCode} - {c.courseName}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Attendance Rate
          </span>
          <div className="text-3xl font-black text-slate-900 my-2">
            {percentage}%
          </div>
          <div>
            <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${status.color}`}>
              {status.label}
            </span>
          </div>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Classes Conducted
          </span>
          <div className="text-3xl font-bold text-slate-800 my-2">
            {totalClasses}
          </div>
          <span className="text-xs text-slate-400">Total sessions</span>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Classes Present
          </span>
          <div className="text-3xl font-bold text-emerald-600 my-2">
            {presentCount}
          </div>
          <span className="text-xs text-emerald-600 font-medium">Attended lectures</span>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Classes Absent
          </span>
          <div className="text-3xl font-bold text-rose-600 my-2">
            {missedCount}
          </div>
          <span className="text-xs text-rose-500 font-medium">Missed sessions</span>
        </div>
      </div>

      {/* Day by Day Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-800">
            Lecture-by-Lecture Attendance Log ({records.length} Recorded Days)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Lecture Date</th>
                <th className="py-3 px-4">Attendance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-10 text-center text-slate-400">
                    No lecture attendance has been recorded for this course yet.
                  </td>
                </tr>
              ) : (
                records.map((rec, idx) => (
                  <tr key={rec._id || idx} className="hover:bg-slate-50/80 transition-smooth">
                    <td className="py-3 px-4 text-slate-400 font-mono text-xs">{idx + 1}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {formatDate(rec.date)}
                    </td>
                    <td className="py-3 px-4">
                      {rec.present ? (
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full border border-emerald-200 inline-flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Present</span>
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-rose-100 text-rose-800 font-bold text-xs rounded-full border border-rose-200 inline-flex items-center space-x-1">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Absent</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AttendanceList;
