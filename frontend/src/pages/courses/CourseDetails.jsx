/**
 * File: CourseDetails.jsx
 * Description: React component rendering the CourseDetails UI interface.
 * 
 * This file is part of the RUET OneHub Project.
 */

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import courseService from "../../services/courseService";
import CourseOBEProfile from "./CourseOBEProfile";
import { PageLoader } from "../../components/common/Loader";
import {
  Users,
  CalendarCheck,
  Award,
  ArrowLeft,
  Search,
} from "lucide-react";

export function CourseDetails() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("roster");
  const { user } = require("../../context/AuthContext").useAuth();

  useEffect(() => {
    const fetchCourseStudents = async () => {
      setLoading(true);
      try {
        const [allCourses, enrolledStudents] = await Promise.allSettled([
          courseService.getAllCourses(),
          courseService.getCourseStudents(id),
        ]);

        if (allCourses.status === "fulfilled") {
          const current = allCourses.value.find((c) => c._id === id);
          setCourse(current);
        }
        if (enrolledStudents.status === "fulfilled") {
          setStudents(enrolledStudents.value);
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCourseStudents();
  }, [id]);

  if (loading) {
    return <PageLoader text="Loading course roster and details..." />;
  }

  const filteredStudents = students.filter((s) => {
    const term = searchTerm.toLowerCase();
    return s.name?.toLowerCase().includes(term) || s.rollNo?.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Link
          to="/courses"
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-smooth"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center space-x-2">
            <span className="font-mono text-sky-600">{course?.courseCode || "Course"}</span>
            <span>-</span>
            <span>{course?.courseName || "Details"}</span>
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Department of {course?.department || "ECE"} • Semester {course?.semester || "N/A"} •{" "}
            <span className="font-bold text-slate-700">{course?.credit || 0} Credits</span>
          </p>
        </div>
      </div>

      {/* Quick Action Bar for Faculty */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-2 text-sm text-slate-600">
          <Users className="w-5 h-5 text-sky-600" />
          <span>
            <strong className="text-slate-900">{students.length}</strong> Enrolled Students in Course
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to={`/attendance/mark?courseId=${id}&semester=${course?.semester}`}
            className="px-4 py-2 bg-sky-50 text-sky-700 hover:bg-sky-100 font-semibold rounded-xl text-xs transition-smooth inline-flex items-center space-x-1.5"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Mark Attendance</span>
          </Link>
          <Link
            to={`/marks/entry?courseId=${id}&semester=${course?.semester}`}
            className="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold rounded-xl text-xs transition-smooth inline-flex items-center space-x-1.5"
          >
            <Award className="w-4 h-4" />
            <span>Enter Marks</span>
          </Link>
        </div>
      </div>

      
      <div className="flex border-b border-slate-200 mt-6">
        <button
          onClick={() => setActiveTab("roster")}
          className={`px-6 py-3 font-semibold text-sm transition-colors ${activeTab === "roster" ? "border-b-2 border-sky-500 text-sky-600" : "text-slate-500 hover:text-slate-700"}`}
        >
          Approved Roster
        </button>
        {(user?.role === 'admin' || user?.role === 'faculty') && (
          <button
            onClick={() => setActiveTab("obe")}
            className={`px-6 py-3 font-semibold text-sm transition-colors ${activeTab === "obe" ? "border-b-2 border-sky-500 text-sky-600" : "text-slate-500 hover:text-slate-700"}`}
          >
            OBE Configuration
          </button>
        )}
      </div>

      {activeTab === "roster" ? (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-bold text-base text-slate-800">Approved Student Roster</h3>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by student name or roll..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Roll Number</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Batch</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No approved student registrations found for this course.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s, idx) => (
                  <tr key={s._id || idx} className="hover:bg-slate-50/80 transition-smooth">
                    <td className="py-3 px-4 text-slate-400 font-mono text-xs">{idx + 1}</td>
                    <td className="py-3 px-4 font-mono font-bold text-sky-700">
                      {s.rollNo || "N/A"}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{s.name}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-xs text-slate-600 font-medium">
                        {s.department || "ECE"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-xs">
                      {s.batch ? `Batch '${s.batch}` : "N/A"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      ) : (
        <CourseOBEProfile courseId={id} />
      )}
    </div>
  );
}

export default CourseDetails;
