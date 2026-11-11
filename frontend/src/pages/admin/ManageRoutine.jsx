/**
 * File: ManageRoutine.jsx
 * Description: React component rendering the ManageRoutine UI interface.
 * 
 * This file is part of the RUET OneHub Project.
 */

import { useState, useEffect } from "react";
import routineService from "../../services/routineService";
import userService from "../../services/userService";
import { PageLoader } from "../../components/common/Loader";
import { Plus, Edit2, Trash2, Filter, LayoutGrid, List } from "lucide-react";
import RoutineVisualExporter from "./RoutineVisualExporter";

const eceCourseMapping = {
  "1-1": ["HUM 1117", "PHY 1117", "ECE 1103", "MATH 1117", "ECE 1101", "HUM 1118", "ECE 1104", "PHY 1118"],
  "1-2": ["CSE 1221", "ECE 1201", "ECE 1203", "CHEM 1217", "MATH 1217", "CSE 1222", "ECE 1202", "ECE 1204", "CHEM 1218"],
  "2-1": ["ECE 2103", "ECE 2105", "ECE 2111", "MATH 2117", "CHEM 2117", "ECE 2104", "ECE 2106/2112", "ECE 2100"],
  "2-2": ["ECE 2201", "ECE 2203", "ECE 2205", "ECE 2207", "MATH 2217", "ECE 2202", "ECE 2204", "ECE 2206", "ECE 2208"],
  "3-1": ["ECE 3101", "ECE 3103", "ECE 3105", "ECE 3107", "HUM 3117", "ECE 3102", "ECE 3104", "ECE 3106", "ECE 3108"],
  "3-2": ["ECE 3205", "ECE 3207", "ECE 3221", "ME 3219", "ECE 3206", "ECE 3208", "ECE 3222", "ME 3220"],
  "4-1": ["ECE 4101", "ECE 4103", "ECE 4105", "ECE 4121", "ECE 4102", "ECE 4104", "ECE 4106", "ECE 4100"],
  "4-2": ["ECE 4201", "ECE 4203", "ECE 4205", "ECE 4221", "ECE 4202", "ECE 4204", "ECE 4206", "ECE 4200"],
};
const seriesOptions = ["2021 Series", "2022 Series", "2023 Series", "2024 Series", "2025 Series", "2026 Series"];
const semesterOptions = ["1-1", "1-2", "2-1", "2-2", "3-1", "3-2", "4-1", "4-2"];
const timeOptions = ["08:00", "08:50", "09:40", "10:30", "10:50", "11:40", "12:30", "13:20", "14:30", "15:20", "16:10", "17:00"];

export default function ManageRoutine() {
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("designer"); // "designer" | "database"
  const [slots, setSlots] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [selectedDeptFilter, setSelectedDeptFilter] = useState("ECE");
  const [selectedTeacherFilter, setSelectedTeacherFilter] = useState("");
  const [selectedSeriesFilter, setSelectedSeriesFilter] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSlot, setCurrentSlot] = useState(null);
  
  const [formData, setFormData] = useState({
    courseCode: "",
    department: "ECE",
    semester: "1-1",
    series: "2025 Series",
    dayOfWeek: "Monday",
    startTime: "08:00",
    endTime: "08:50",
    roomOrLab: "",
    teacherInitials: "",
    type: "theory",
    targetGroup: "All",
    assessmentType: "None",
    assessmentInfo: "",
  });

  const fetchRoutine = async () => {
    setLoading(true);
    try {
      const [data, facultyData] = await Promise.all([
        routineService.getAllRoutine(),
        userService.getFacultyDirectory()
      ]);
      setSlots(data.routine || []);
      setFacultyList(facultyData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutine();
  }, []);

  const handleOpenModal = (slot = null) => {
    if (slot) {
      setCurrentSlot(slot);
      setFormData({
        courseCode: slot.courseCode || "",
        department: slot.department || "ECE",
        semester: slot.semester || "1-1",
        series: slot.series || "2025 Series",
        dayOfWeek: slot.dayOfWeek || "Monday",
        startTime: slot.startTime || "08:00",
        endTime: slot.endTime || "08:50",
        roomOrLab: slot.roomOrLab || "",
        teacherInitials: slot.teacherInitials ? slot.teacherInitials.join(", ") : "",
        type: slot.type || "theory",
        targetGroup: slot.targetGroup || "All",
        assessmentType: slot.assessmentType || "None",
        assessmentInfo: slot.assessmentInfo || "",
      });
      } else {
        setCurrentSlot(null);
        setFormData({
          courseCode: "",
          department: "ECE",
          semester: "1-1",
          series: "2025 Series",
          dayOfWeek: "Monday",
          startTime: "08:00",
          endTime: "08:50",
          roomOrLab: "",
          teacherInitials: selectedTeacherFilter || "",
          type: "theory",
          targetGroup: "All",
          assessmentType: "None",
          assessmentInfo: "",
        });
      }
      setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this class slot?")) return;
    try {
      await routineService.deleteRoutineSlot(id);
      fetchRoutine();
    } catch (err) {
      console.error(err);
      alert("Failed to delete");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        teacherInitials: formData.teacherInitials.split(",").map(s => s.trim()).filter(Boolean)
      };

      if (currentSlot) {
        await routineService.updateRoutineSlot(currentSlot._id, payload);
      } else {
        await routineService.addRoutineSlot(payload);
      }
      setIsModalOpen(false);
      fetchRoutine();
    } catch (err) {
      console.error(err);
      alert("Failed to save slot");
    }
  };

  const departments = [...new Set(facultyList.map(f => f.department).filter(Boolean))].sort();

  const filteredSlots = slots.filter(s => {
    const matchTeacher = selectedTeacherFilter ? s.teacherInitials?.includes(selectedTeacherFilter) : true;
    const matchSeries = selectedSeriesFilter ? (s.series === selectedSeriesFilter || s.semester === selectedSeriesFilter) : true;
    return matchTeacher && matchSeries;
  });

  if (loading) return <PageLoader />;

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manage Class Routine</h1>
          <p className="text-xs text-gray-500 mt-0.5">Design visual weekly routines, export PNGs, or manage database slots.</p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl w-fit border border-slate-200">
          <button
            onClick={() => setViewMode("designer")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition ${
              viewMode === "designer"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <LayoutGrid className="w-4 h-4" /> Visual Generator (PNG)
          </button>
          <button
            onClick={() => setViewMode("database")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition ${
              viewMode === "database"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <List className="w-4 h-4" /> Database Slots List
          </button>
        </div>
      </div>

      {viewMode === "designer" ? (
        <RoutineVisualExporter />
      ) : (
        <>
          <div className="flex justify-end items-center gap-3 mb-4">
            <div className="flex items-center bg-white border rounded-lg px-2 py-1 shadow-sm overflow-hidden">
              <Filter className="w-4 h-4 text-gray-500 ml-2" />
              <select
                value={selectedSeriesFilter}
                onChange={(e) => setSelectedSeriesFilter(e.target.value)}
                className="outline-none bg-transparent text-sm text-gray-700 p-1 border-r border-gray-200"
              >
                <option value="">All Series / Sem</option>
                <optgroup label="By Semester">
                  {semesterOptions.map(sem => <option key={sem} value={sem}>{sem}</option>)}
                </optgroup>
                <optgroup label="By Series">
                  {seriesOptions.map(ser => <option key={ser} value={ser}>{ser}</option>)}
                </optgroup>
              </select>
              <select
                value={selectedDeptFilter}
                onChange={(e) => {
                  setSelectedDeptFilter(e.target.value);
                  setSelectedTeacherFilter("");
                }}
                className="outline-none bg-transparent text-sm text-gray-700 p-1 border-r border-gray-200"
              >
                <option value="">All Depts</option>
                {departments.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <select
                value={selectedTeacherFilter}
                onChange={(e) => setSelectedTeacherFilter(e.target.value)}
                className="outline-none bg-transparent text-sm text-gray-700 p-1 ml-1"
              >
                <option value="">All Teachers</option>
                {facultyList
                  .filter(f => !selectedDeptFilter || f.department === selectedDeptFilter)
                  .map(faculty => (
                    <option key={faculty._id} value={faculty.teacherAcronym || faculty.name}>
                      {faculty.name} ({faculty.teacherAcronym || "N/A"})
                    </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="w-4 h-4" /> Add Slot
            </button>
          </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 text-sm font-semibold text-gray-600">Course</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Series & Sem</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Day & Time</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Room</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Teachers</th>
                <th className="p-4 text-sm font-semibold text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSlots.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-gray-500">
                    No classes found for the selected filters.
                  </td>
                </tr>
              )}
              {filteredSlots.map(slot => (
                <tr key={slot._id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-800">
                    <div className="flex items-center gap-2">
                      <span>{slot.courseCode}</span>
                      {slot.targetGroup && slot.targetGroup !== "All" && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-800">
                          {slot.targetGroup}
                        </span>
                      )}
                    </div>
                    {slot.assessmentType && slot.assessmentType !== 'None' && (
                      <div className="mt-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-red-100 text-red-700">
                          🚨 {slot.assessmentType}
                          {slot.assessmentInfo && ` - ${slot.assessmentInfo}`}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-gray-600">{slot.series} ({slot.semester})</td>
                  <td className="p-4 text-gray-600">{slot.dayOfWeek}, {slot.startTime} - {slot.endTime}</td>
                  <td className="p-4 text-gray-600">{slot.roomOrLab}</td>
                  <td className="p-4 text-gray-600">{slot.teacherInitials?.join(", ")}</td>
                  <td className="p-4 flex justify-end gap-2">
                    <button
                      onClick={() => handleOpenModal(slot)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(slot._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {slots.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-gray-500">No classes found in routine.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">{currentSlot ? "Edit Slot" : "Add New Slot"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Course Code</label>
                    <input
                      list="course-options"
                      type="text"
                      required
                      value={formData.courseCode}
                      onChange={e => setFormData({ ...formData, courseCode: e.target.value })}
                      className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Select or type course..."
                    />
                    <datalist id="course-options">
                      {(eceCourseMapping[formData.semester] || []).map(course => (
                        <option key={course} value={course} />
                      ))}
                    </datalist>
                  </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Series</label>
                  <select
                    required
                    value={formData.series}
                    onChange={e => setFormData({ ...formData, series: e.target.value })}
                    className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {seriesOptions.map(series => (
                      <option key={series} value={series}>{series}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                  <select
                    required
                    value={formData.semester}
                    onChange={e => setFormData({ ...formData, semester: e.target.value })}
                    className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {semesterOptions.map(sem => (
                      <option key={sem} value={sem}>{sem}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class Type</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value, assessmentType: "None" })}
                    className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="theory">Theory</option>
                    <option value="sessional">Sessional / Lab</option>
                    <option value="project">Project</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Group</label>
                  <select
                    value={formData.targetGroup}
                    onChange={e => setFormData({ ...formData, targetGroup: e.target.value })}
                    className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="All">All Students</option>
                    <option value="1st 30">1st 30 (Roll 01-30)</option>
                    <option value="2nd 30">2nd 30 (Roll 31+)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Day of Week</label>
                  <select
                    value={formData.dayOfWeek}
                    onChange={e => setFormData({ ...formData, dayOfWeek: e.target.value })}
                    className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                    <select
                      required
                      value={formData.startTime}
                      onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                      className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      {timeOptions.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                    <select
                      required
                      value={formData.endTime}
                      onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                      className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      {timeOptions.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room / Lab</label>
                  <input
                    type="text"
                    required
                    value={formData.roomOrLab}
                    onChange={e => setFormData({ ...formData, roomOrLab: e.target.value })}
                    className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teacher Initials</label>
                  <input
                    type="text"
                    value={formData.teacherInitials}
                    onChange={e => setFormData({ ...formData, teacherInitials: e.target.value })}
                    className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="MZH, SI"
                  />
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-orange-50 border border-orange-100 rounded-lg space-y-4">
                <div>
                  <label className="block text-sm font-medium text-orange-900 mb-1">Upcoming Assessment</label>
                  <select
                    value={formData.assessmentType}
                    onChange={e => setFormData({ ...formData, assessmentType: e.target.value })}
                    className="w-full border-orange-200 rounded-lg p-2 outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                  >
                    <option value="None">None</option>
                    {formData.type === "sessional" ? (
                        <>
                          <option value="Lab Final">Lab Final</option>
                          <option value="Lab Quiz">Lab Quiz</option>
                          <option value="Assignment">Assignment</option>
                          <option value="Presentation">Presentation</option>
                        </>
                      ) : (
                        <>
                          <option value="CT">Class Test (CT)</option>
                          <option value="Quiz">Quiz</option>
                          <option value="Assignment">Assignment</option>
                          <option value="Presentation">Presentation</option>
                        </>
                      )}
                  </select>
                </div>
                {formData.assessmentType !== 'None' && (
                  <div>
                    <label className="block text-sm font-medium text-orange-900 mb-1">Assessment Info (Optional)</label>
                    <input
                      type="text"
                      value={formData.assessmentInfo}
                      onChange={e => setFormData({ ...formData, assessmentInfo: e.target.value })}
                      className="w-full border-orange-200 rounded-lg p-2 outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                      placeholder="e.g. Syllabus: Chapter 1-3"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Save Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}
