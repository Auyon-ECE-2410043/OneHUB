import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import userService from "../../services/userService";
import { DEPARTMENTS, DESIGNATIONS } from "../../utils/constants";
import { getInitials } from "../../utils/helpers";
import { PageLoader } from "../../components/common/Loader";
import Modal from "../../components/common/Modal";
import {
  Users,
  Search,
  Plus,
  Mail,
  Phone,
  MapPin,
  Edit2,
  Camera,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Briefcase,
  GraduationCap,
  Globe,
} from "lucide-react";

export function FacultyDirectory() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [facultyList, setFacultyList] = useState([]);
  const [stats, setStats] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");

  // Admin Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState(null);

  // Form States
  const [facultyForm, setFacultyForm] = useState({
    name: "",
    nameBengali: "",
    email: "",
    password: "password123",
    department: "ECE",
    designation: "Assistant Professor",
    phone: "",
    officeLocation: "",
    isPhdHolder: false,
    isHeadOfDept: false,
    isOnLeave: false,
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ text: "", type: "" });

  const loadDirectory = async () => {
    setLoading(true);
    try {
      const [list, facultyStats] = await Promise.allSettled([
        userService.getFacultyDirectory(),
        userService.getFacultyStats(),
      ]);
      if (list.status === "fulfilled") setFacultyList(list.value);
      if (facultyStats.status === "fulfilled") setStats(facultyStats.value);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDirectory();
  }, []);

  const handleCreateFaculty = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatusMsg({ text: "", type: "" });
    try {
      await userService.createFaculty(facultyForm);
      setIsAddModalOpen(false);
      setStatusMsg({ text: "Faculty member created successfully.", type: "success" });
      await loadDirectory();
    } catch (err) {
      setStatusMsg({ text: err.message || "Failed to create faculty member", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateFaculty = async (e) => {
    e.preventDefault();
    if (!selectedFaculty) return;
    setSubmitting(true);
    try {
      await userService.updateFaculty(selectedFaculty._id, facultyForm);
      setIsEditModalOpen(false);
      setStatusMsg({ text: "Faculty details updated successfully.", type: "success" });
      await loadDirectory();
    } catch (err) {
      alert(err.message || "Failed to update details");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUploadPhoto = async (e) => {
    e.preventDefault();
    if (!selectedFaculty || !photoFile) return;
    setSubmitting(true);
    try {
      await userService.uploadFacultyPhoto(selectedFaculty._id, photoFile);
      setIsPhotoModalOpen(false);
      setPhotoFile(null);
      setStatusMsg({ text: "Faculty photo updated successfully.", type: "success" });
      await loadDirectory();
    } catch (err) {
      alert(err.message || "Failed to upload photo");
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (member) => {
    setSelectedFaculty(member);
    setFacultyForm({
      name: member.name || "",
      nameBengali: member.nameBengali || "",
      email: member.email || "",
      department: member.department || "ECE",
      designation: member.designation || "Assistant Professor",
      phone: member.phone || "",
      officeLocation: member.officeLocation || "",
      isPhdHolder: !!member.isPhdHolder,
      isHeadOfDept: !!member.isHeadOfDept,
      isOnLeave: !!member.isOnLeave,
    });
    setIsEditModalOpen(true);
  };

  if (loading) {
    return <PageLoader text="Loading faculty members directory..." />;
  }

  const filtered = facultyList.filter((f) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      f.name?.toLowerCase().includes(term) ||
      f.nameBengali?.includes(term) ||
      f.officeLocation?.toLowerCase().includes(term) ||
      f.email?.toLowerCase().includes(term);
    const matchesDept = selectedDept === "all" || f.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center space-x-2.5">
            <Users className="w-7 h-7 text-sky-600" />
            <span>Faculty & Academic Staff Directory</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Connect with professors, faculty researchers, and department heads across RUET.
          </p>
        </div>

        {user?.role === "admin" && (
          <button
            onClick={() => {
              setFacultyForm({
                name: "",
                nameBengali: "",
                email: "",
                password: "password123",
                department: "ECE",
                designation: "Assistant Professor",
                phone: "",
                officeLocation: "",
                isPhdHolder: false,
                isHeadOfDept: false,
                isOnLeave: false,
              });
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-sm transition-smooth shadow-sm inline-flex items-center space-x-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Faculty Member</span>
          </button>
        )}
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

      {/* Summary Stats Row */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs text-center">
            <span className="text-[11px] font-bold uppercase text-slate-400">Professors</span>
            <div className="text-xl font-bold text-slate-800 mt-1">{stats.professor}</div>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs text-center">
            <span className="text-[11px] font-bold uppercase text-slate-400">Assoc Prof</span>
            <div className="text-xl font-bold text-slate-800 mt-1">{stats.associateProfessor}</div>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs text-center">
            <span className="text-[11px] font-bold uppercase text-slate-400">Asst Prof</span>
            <div className="text-xl font-bold text-slate-800 mt-1">{stats.assistantProfessor}</div>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs text-center">
            <span className="text-[11px] font-bold uppercase text-slate-400">Lecturers</span>
            <div className="text-xl font-bold text-slate-800 mt-1">{stats.lecturer}</div>
          </div>
          <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl shadow-xs text-center col-span-2 sm:col-span-1">
            <span className="text-[11px] font-bold uppercase text-purple-700">PhD Scholars</span>
            <div className="text-xl font-black text-purple-900 mt-1">{stats.phdHolder}</div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by name, room, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-500">Department:</span>
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
      </div>

      {/* Grouped Faculty Directory List */}
      {DESIGNATIONS.map((designation) => {
        const groupMembers = filtered.filter((f) => f.designation === designation);
        if (groupMembers.length === 0) return null;

        return (
          <div key={designation} className="space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
              <h3 className="text-base font-bold text-slate-800">{designation}s</h3>
              <span className="text-xs text-slate-400 font-semibold">
                ({groupMembers.length})
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {groupMembers.map((member) => (
                <div
                  key={member._id}
                  className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-sky-300 shadow-xs hover:shadow-md transition-smooth flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center space-x-3">
                        {member.photoUrl ? (
                          <img
                            src={member.photoUrl}
                            alt={member.name}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                            {getInitials(member.name)}
                          </div>
                        )}

                        <div>
                          <h4 className="text-sm font-bold text-slate-900 leading-snug">
                            {member.name}
                          </h4>
                          {member.nameBengali && (
                            <p className="text-xs text-slate-500 font-medium">
                              {member.nameBengali}
                            </p>
                          )}
                        </div>
                      </div>

                      {user?.role === "admin" && (
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => {
                              setSelectedFaculty(member);
                              setIsPhotoModalOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-sky-600 rounded-lg hover:bg-slate-100"
                            title="Update Photo"
                          >
                            <Camera className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openEdit(member)}
                            className="p-1.5 text-slate-400 hover:text-sky-600 rounded-lg hover:bg-slate-100"
                            title="Edit Details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-1.5">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-semibold text-[10px] rounded-md">
                        {member.department}
                      </span>
                      {member.isHeadOfDept && (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-800 font-bold text-[10px] rounded-md">
                          Head of Dept
                        </span>
                      )}
                      {member.isPhdHolder && (
                        <span className="px-2 py-0.5 bg-sky-100 text-sky-800 font-bold text-[10px] rounded-md">
                          PhD Holder
                        </span>
                      )}
                      {member.isOnLeave && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold text-[10px] rounded-md">
                          On Study/Official Leave
                        </span>
                      )}
                    </div>

                    {/* Contact details */}
                    <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                      {member.officeLocation && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Room: {member.officeLocation}</span>
                        </div>
                      )}
                      {member.email && (
                        <div className="flex items-center space-x-2 truncate">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <a href={`mailto:${member.email}`} className="text-sky-600 hover:underline truncate">
                            {member.email}
                          </a>
                        </div>
                      )}
                      {member.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{member.phone}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* View Profile Button */}
                    <div className="pt-3 mt-auto">
                      <button 
                        onClick={() => {
                          setSelectedFaculty(member);
                          setIsProfileModalOpen(true);
                        }}
                        className="w-full py-2 bg-slate-50 hover:bg-sky-50 text-sky-700 font-semibold rounded-xl text-xs transition-smooth border border-slate-200 hover:border-sky-200 flex justify-center items-center space-x-1.5"
                      >
                        <span>View Full Profile</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Admin Add Faculty Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Faculty Member"
      >
        <form onSubmit={handleCreateFaculty} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold uppercase text-slate-600 mb-1">
                Name (English)
              </label>
              <input
                type="text"
                required
                placeholder="Dr. Md. Nazmul Islam"
                value={facultyForm.name}
                onChange={(e) => setFacultyForm({ ...facultyForm, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold uppercase text-slate-600 mb-1">
                Name (Bengali)
              </label>
              <input
                type="text"
                placeholder="ড. মো: নাজমুল ইসলাম"
                value={facultyForm.nameBengali}
                onChange={(e) => setFacultyForm({ ...facultyForm, nameBengali: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold uppercase text-slate-600 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={facultyForm.email}
                onChange={(e) => setFacultyForm({ ...facultyForm, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold uppercase text-slate-600 mb-1">
                Default Password
              </label>
              <input
                type="password"
                required
                value={facultyForm.password}
                onChange={(e) => setFacultyForm({ ...facultyForm, password: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold uppercase text-slate-600 mb-1">
                Designation
              </label>
              <select
                value={facultyForm.designation}
                onChange={(e) => setFacultyForm({ ...facultyForm, designation: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              >
                {DESIGNATIONS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold uppercase text-slate-600 mb-1">
                Department
              </label>
              <select
                value={facultyForm.department}
                onChange={(e) => setFacultyForm({ ...facultyForm, department: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold uppercase text-slate-600 mb-1">
                Office Room Location
              </label>
              <input
                type="text"
                placeholder="e.g. ECE Building Room 302"
                value={facultyForm.officeLocation}
                onChange={(e) => setFacultyForm({ ...facultyForm, officeLocation: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold uppercase text-slate-600 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                placeholder="e.g. +8801700000000"
                value={facultyForm.phone}
                onChange={(e) => setFacultyForm({ ...facultyForm, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center space-x-4">
            <label className="flex items-center space-x-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={facultyForm.isPhdHolder}
                onChange={(e) => setFacultyForm({ ...facultyForm, isPhdHolder: e.target.checked })}
              />
              <span>PhD Holder</span>
            </label>
            <label className="flex items-center space-x-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={facultyForm.isHeadOfDept}
                onChange={(e) => setFacultyForm({ ...facultyForm, isHeadOfDept: e.target.checked })}
              />
              <span>Head of Dept</span>
            </label>
          </div>

          <div className="pt-3 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl"
            >
              {submitting ? "Saving..." : "Create Faculty"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Admin Edit Faculty Modal */}
      {selectedFaculty && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit Info: ${selectedFaculty.name}`}
        >
          <form onSubmit={handleUpdateFaculty} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold uppercase text-slate-600 mb-1">
                  Designation
                </label>
                <select
                  value={facultyForm.designation}
                  onChange={(e) => setFacultyForm({ ...facultyForm, designation: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                >
                  {DESIGNATIONS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold uppercase text-slate-600 mb-1">
                  Bengali Name
                </label>
                <input
                  type="text"
                  value={facultyForm.nameBengali}
                  onChange={(e) => setFacultyForm({ ...facultyForm, nameBengali: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold uppercase text-slate-600 mb-1">
                  Office Room
                </label>
                <input
                  type="text"
                  value={facultyForm.officeLocation}
                  onChange={(e) => setFacultyForm({ ...facultyForm, officeLocation: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold uppercase text-slate-600 mb-1">
                  Phone
                </label>
                <input
                  type="text"
                  value={facultyForm.phone}
                  onChange={(e) => setFacultyForm({ ...facultyForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center space-x-4">
              <label className="flex items-center space-x-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={facultyForm.isPhdHolder}
                  onChange={(e) => setFacultyForm({ ...facultyForm, isPhdHolder: e.target.checked })}
                />
                <span>PhD Holder</span>
              </label>
              <label className="flex items-center space-x-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={facultyForm.isHeadOfDept}
                  onChange={(e) => setFacultyForm({ ...facultyForm, isHeadOfDept: e.target.checked })}
                />
                <span>Head of Dept</span>
              </label>
              <label className="flex items-center space-x-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={facultyForm.isOnLeave}
                  onChange={(e) => setFacultyForm({ ...facultyForm, isOnLeave: e.target.checked })}
                />
                <span>On Leave</span>
              </label>
            </div>

            <div className="pt-3 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl"
              >
                {submitting ? "Updating..." : "Save Changes"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Admin Photo Upload Modal */}
      {selectedFaculty && (
        <Modal
          isOpen={isPhotoModalOpen}
          onClose={() => setIsPhotoModalOpen(false)}
          title={`Upload Photo: ${selectedFaculty.name}`}
        >
          <form onSubmit={handleUploadPhoto} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold uppercase text-slate-600 mb-1">
                Select Photo File (JPEG/PNG)
              </label>
              <input
                type="file"
                required
                accept="image/*"
                onChange={(e) => setPhotoFile(e.target.files[0] || null)}
                className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-sky-600 file:text-white hover:file:bg-sky-700"
              />
            </div>

            <div className="pt-3 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsPhotoModalOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl"
              >
                {submitting ? "Uploading..." : "Upload Photo"}
              </button>
            </div>
          </form>
        </Modal>
      )}
      {/* Detailed Profile Modal */}
      {selectedFaculty && (
        <Modal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          title="Faculty Profile"
          maxWidth="max-w-3xl"
        >
          <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row gap-5 items-start">
              {selectedFaculty.photoUrl ? (
                <img
                  src={selectedFaculty.photoUrl}
                  alt={selectedFaculty.name}
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-white shadow-sm shrink-0"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white font-bold flex items-center justify-center text-2xl shadow-sm shrink-0">
                  {getInitials(selectedFaculty.name)}
                </div>
              )}
              
              <div className="space-y-2">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{selectedFaculty.name}</h2>
                  {selectedFaculty.nameBengali && (
                    <p className="text-sm font-medium text-slate-500">{selectedFaculty.nameBengali}</p>
                  )}
                  <p className="text-sky-600 font-semibold text-sm mt-1">{selectedFaculty.designation}</p>
                </div>
                
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-600 pt-1">
                  {selectedFaculty.email && (
                    <div className="flex items-center space-x-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <a href={`mailto:${selectedFaculty.email}`} className="hover:text-sky-600 hover:underline">{selectedFaculty.email}</a>
                    </div>
                  )}
                  {selectedFaculty.phone && (
                    <div className="flex items-center space-x-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{selectedFaculty.phone}</span>
                    </div>
                  )}
                  {selectedFaculty.website && (
                    <div className="flex items-center space-x-1.5">
                      <Globe className="w-3.5 h-3.5 text-slate-400" />
                      <a href={selectedFaculty.website} target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline truncate max-w-[200px]">
                        Website Profile
                      </a>
                    </div>
                  )}
                  {selectedFaculty.firstJoined && (
                    <div className="flex items-center space-x-1.5 text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md mt-1 w-full">
                      <span className="font-semibold text-[10px]">Joined {selectedFaculty.firstJoined}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Grid for details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Research Focus */}
              {selectedFaculty.fieldOfResearch?.length > 0 && (
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 md:col-span-2">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2 mb-3">
                    <BookOpen className="w-4 h-4 text-sky-600" />
                    <span>Field of Research</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedFaculty.fieldOfResearch.map((field, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-white border border-slate-200 text-slate-600 text-[11px] font-medium rounded-lg shadow-xs">
                        {field}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Education Timeline */}
              {selectedFaculty.education?.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2 mb-4 border-b border-slate-100 pb-2">
                    <GraduationCap className="w-4 h-4 text-indigo-600" />
                    <span>Education</span>
                  </h3>
                  <div className="space-y-4 pl-1">
                    {selectedFaculty.education.map((edu, idx) => (
                      <div key={idx} className="relative pl-4 border-l-2 border-indigo-100 pb-1">
                        <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-indigo-400"></div>
                        <h4 className="text-xs font-bold text-slate-800">{edu.degree}</h4>
                        <p className="text-[11px] text-slate-500 font-medium leading-snug mt-0.5">{edu.institution}</p>
                        {edu.year && <span className="text-[10px] font-semibold text-indigo-600 mt-1 block">{edu.year}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Position Timeline */}
              {selectedFaculty.positionHistory?.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2 mb-4 border-b border-slate-100 pb-2">
                    <Briefcase className="w-4 h-4 text-emerald-600" />
                    <span>Experience</span>
                  </h3>
                  <div className="space-y-4 pl-1">
                    {selectedFaculty.positionHistory.map((pos, idx) => (
                      <div key={idx} className="relative pl-4 border-l-2 border-emerald-100 pb-1">
                        <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-emerald-400"></div>
                        <h4 className="text-xs font-bold text-slate-800">{pos.role}</h4>
                        <p className="text-[11px] text-slate-500 font-medium leading-snug mt-0.5">{pos.institution}</p>
                        <span className="text-[10px] font-semibold text-emerald-600 mt-1 block">{pos.duration}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default FacultyDirectory;
