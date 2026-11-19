/**
 * File: MarksList.jsx
 * Description: React component rendering the MarksList UI interface.
 * 
 * This file is part of the RUET OneHub Project.
 */

import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { SEMESTERS, getSeriesDefaultSemester } from "../../utils/constants";
import markService from "../../services/markService";
import courseService from "../../services/courseService";
import registrationService from "../../services/registrationService";
import { PageLoader } from "../../components/common/Loader";
import {
  Award,
  CheckCircle2,
  FileSpreadsheet,
  Layers,
} from "lucide-react";

export function MarksList() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialCourseId = searchParams.get("courseId") || "";

  const [loading, setLoading] = useState(true);
  const [studentRegistrations, setStudentRegistrations] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState(() => getSeriesDefaultSemester(user) || "2-2");
  const [assignedCourses, setAssignedCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(initialCourseId);

  // Marks data
  const [ctMarks, setCtMarks] = useState([]);
  const [quizMarks, setQuizMarks] = useState([]);
  const [assignmentMarks, setAssignmentMarks] = useState([]);
  const [finalGrades, setFinalGrades] = useState([]);
  const [activeTab, setActiveTab] = useState("ct"); // 'ct' | 'quiz' | 'assignment' | 'final'

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
        console.warn("Could not fetch courses for semester", e);
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrationsAndCourses();
  }, [selectedSemester]);

  useEffect(() => {
    const fetchCourseMarks = async () => {
      if (!selectedCourseId) return;
      try {
        const [cts, quizzes, assignments, finals] = await Promise.allSettled([
          markService.getCourseCTMarks(selectedCourseId),
          markService.getQuizMarks(),
          markService.getAssignmentMarks(),
          markService.getFinalGrades(),
        ]);

        if (cts.status === "fulfilled") setCtMarks(cts.value);
        if (quizzes.status === "fulfilled") setQuizMarks(quizzes.value);
        if (assignments.status === "fulfilled") setAssignmentMarks(assignments.value);
        if (finals.status === "fulfilled") setFinalGrades(finals.value);
      } catch (e) {
        console.warn("Error fetching marks", e);
      }
    };

    fetchCourseMarks();
  }, [selectedCourseId]);

  if (loading) {
    return <PageLoader text="Loading your marks and grade records..." />;
  }

  const selectedCourse = assignedCourses.find((c) => c._id === selectedCourseId);

  // CT Calculation (Best 3 out of 4)
  const validCtScores = ctMarks
    .filter((m) => m.marksObtained !== null && m.marksObtained !== undefined)
    .map((m) => m.marksObtained)
    .sort((a, b) => b - a);

  const best3 = validCtScores.slice(0, 3);
  const best3Average =
    best3.length > 0 ? (best3.reduce((sum, val) => sum + val, 0) / best3.length).toFixed(2) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center space-x-2.5">
            <Award className="w-7 h-7 text-amber-500" />
            <span>Academic Marks & Evaluation</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Track continuous assessments, Class Tests (CTs), Quizzes, Assignments, and Official Final Grades.
          </p>
        </div>

        {/* Selectors: Semester and Course */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto mt-4 sm:mt-0">
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

      {/* Course Banner */}
      {selectedCourse && (
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-mono font-bold text-xs">
              {selectedCourse.credit} Cr
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                <span className="font-mono text-sky-700 mr-2">{selectedCourse.courseCode}</span>
                {selectedCourse.courseName}
              </h3>
              <p className="text-xs text-slate-500">
                Type: <span className="capitalize font-semibold">{selectedCourse.courseType}</span> •
                Department: {selectedCourse.department}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold px-3 py-1 bg-slate-100 rounded-full text-slate-700">
              Semester {selectedCourse.semester}
            </span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab("ct")}
          className={`py-3 px-6 text-sm font-semibold border-b-2 transition-smooth flex items-center space-x-2 ${
            activeTab === "ct"
              ? "border-amber-500 text-amber-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Class Tests (CT 1-4)</span>
        </button>

        <button
          onClick={() => setActiveTab("quiz")}
          className={`py-3 px-6 text-sm font-semibold border-b-2 transition-smooth flex items-center space-x-2 ${
            activeTab === "quiz"
              ? "border-amber-500 text-amber-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Sessional Quizzes</span>
        </button>

        <button
          onClick={() => setActiveTab("assignment")}
          className={`py-3 px-6 text-sm font-semibold border-b-2 transition-smooth flex items-center space-x-2 ${
            activeTab === "assignment"
              ? "border-amber-500 text-amber-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Assignments</span>
        </button>

        <button
          onClick={() => setActiveTab("final")}
          className={`py-3 px-6 text-sm font-semibold border-b-2 transition-smooth flex items-center space-x-2 ${
            activeTab === "final"
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Final Semester Grades</span>
        </button>
      </div>

      {/* CLASS TESTS TAB */}
      {activeTab === "ct" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((num) => {
              const ct = ctMarks.find((m) => m.instanceNumber === num);
              const score = ct?.marksObtained;
              const total = ct?.totalMarks || 20;

              return (
                <div
                  key={num}
                  className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Class Test {num}
                    </span>
                    <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold rounded">
                      Max: {total}
                    </span>
                  </div>

                  <div className="my-4">
                    {score !== null && score !== undefined ? (
                      <div className="text-3xl font-extrabold text-slate-800">
                        {score}{" "}
                        <span className="text-sm font-normal text-slate-400">/ {total}</span>
                      </div>
                    ) : (
                      <div className="text-sm font-medium text-slate-400 italic">
                        Not conducted / Not entered
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                    {score !== null && score !== undefined
                      ? `${Math.round((score / total) * 100)}% score achieved`
                      : "Awaiting evaluation"}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Evaluation Summary */}
          <div className="p-6 bg-amber-50/50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-amber-950 uppercase tracking-wider">
                RUET CT Rule: Best 3 Out of 4 Average
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                Automatically drops the lowest scored Class Test and averages the best 3.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold uppercase text-amber-700 block">
                Calculated Best 3 CT Average
              </span>
              <div className="text-2xl font-black text-amber-900">
                {best3Average} <span className="text-sm font-normal text-amber-700">/ 20</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUIZZES TAB */}
      {activeTab === "quiz" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 font-bold text-sm text-slate-800">
            Sessional Quiz Marks ({quizMarks.length})
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <th className="py-3 px-4">Course</th>
                <th className="py-3 px-4">Quiz #</th>
                <th className="py-3 px-4">Marks Obtained</th>
                <th className="py-3 px-4">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {quizMarks.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400">
                    No quiz marks recorded yet.
                  </td>
                </tr>
              ) : (
                quizMarks.map((q) => (
                  <tr key={q._id}>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {q.courseId?.courseCode} - {q.courseId?.courseName}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs">Quiz {q.instanceNumber}</td>
                    <td className="py-3 px-4 font-bold text-sky-700">{q.marksObtained}</td>
                    <td className="py-3 px-4 text-slate-500">{q.totalMarks || 20}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ASSIGNMENTS TAB */}
      {activeTab === "assignment" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 font-bold text-sm text-slate-800">
            Course Assignments ({assignmentMarks.length})
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <th className="py-3 px-4">Course</th>
                <th className="py-3 px-4">Marks Obtained</th>
                <th className="py-3 px-4">Max Marks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {assignmentMarks.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-slate-400">
                    No assignment marks recorded yet.
                  </td>
                </tr>
              ) : (
                assignmentMarks.map((a) => (
                  <tr key={a._id}>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {a.courseId?.courseCode} - {a.courseId?.courseName}
                    </td>
                    <td className="py-3 px-4 font-bold text-sky-700">{a.marksObtained}</td>
                    <td className="py-3 px-4 text-slate-500">{a.totalMarks || 10}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* FINAL GRADES TAB */}
      {activeTab === "final" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 font-bold text-sm text-slate-800">
            Final Letter Grades & GPA Points ({finalGrades.length})
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <th className="py-3 px-4">Course Code & Title</th>
                <th className="py-3 px-4">Credit</th>
                <th className="py-3 px-4">Grade</th>
                <th className="py-3 px-4">Grade Point (GPA)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {finalGrades.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400">
                    Final semester grades have not been published yet.
                  </td>
                </tr>
              ) : (
                finalGrades.map((g) => (
                  <tr key={g._id}>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      <span className="font-mono text-sky-700 mr-2">{g.courseId?.courseCode}</span>
                      {g.courseId?.courseName}
                    </td>
                    <td className="py-3 px-4">{g.courseId?.credit || 3}</td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-md">
                        {g.grade}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">
                      {g.gpaPoint !== null ? g.gpaPoint.toFixed(2) : "N/A"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default MarksList;
