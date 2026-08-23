/**
 * File: ManageRoutine.jsx
 * Description: React component rendering the ManageRoutine UI interface.
 * 
 * This file is part of the RUET OneHub Project.
 */

import { useState, useEffect } from "react";
import routineService from "../../services/routineService";
import { PageLoader } from "../../components/common/Loader";
import { Plus, Edit2, Trash2 } from "lucide-react";

export default function ManageRoutine() {
  const [loading, setLoading] = useState(true);
  const [slots, setSlots] = useState([]);
  
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
  });

  const fetchRoutine = async () => {
    setLoading(true);
    try {
      const data = await routineService.getAllRoutine();
      setSlots(data.routine || []);
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
        teacherInitials: "",
        type: "theory",
        targetGroup: "All",
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

  if (loading) return <PageLoader />;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Class Routine</h1>
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
                <th className="p-4 text-sm font-semibold text-gray-600">Teacher(s)</th>
                <th className="p-4 text-sm font-semibold text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {slots.map(slot => (
                <tr key={slot._id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-800">
                    {slot.courseCode}
                    {slot.targetGroup && slot.targetGroup !== "All" && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-800">
                        {slot.targetGroup}
                      </span>
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
                    type="text"
                    required
                    value={formData.courseCode}
                    onChange={e => setFormData({ ...formData, courseCode: e.target.value })}
                    className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. MATH-2117"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Series</label>
                  <input
                    type="text"
                    required
                    value={formData.series}
                    onChange={e => setFormData({ ...formData, series: e.target.value })}
                    className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. 2024 Series"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                  <input
                    type="text"
                    required
                    value={formData.semester}
                    onChange={e => setFormData({ ...formData, semester: e.target.value })}
                    className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. 1-1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class Type</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time (HH:MM)</label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time (HH:MM)</label>
                  <input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500"
                  />
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
    </div>
  );
}
