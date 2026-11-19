/**
 * File: MedicalCenter.jsx
 * Description: React component rendering the MedicalCenter UI interface.
 * 
 * This file is part of the RUET OneHub Project.
 */

import { useState, useEffect } from "react";
import api from "../../services/api";
import {
  Search,
  Stethoscope,
  Droplet,
  Calendar,
  User as UserIcon,
  Phone,
  FileText,
  Info,
  Building2,
  Clock,
  CheckCircle2,
  UserRound,
  PhoneCall,
  QrCode,
  ExternalLink,
  Megaphone,
  AlertTriangle,
  HeartPulse,
  X,
  Send,
  Check,
  ShieldAlert
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";

export function MedicalCenter() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("directory");

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-white p-6 rounded-2xl shadow-xs border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Medical Center</h1>
          <p className="text-slate-500 mt-1">Access RUET Health Complex directory, book appointments, and find blood donors.</p>
        </div>
        <div className="mt-4 lg:mt-0 flex flex-wrap space-x-2 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("directory")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-smooth flex items-center ${
              activeTab === "directory" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Building2 className="w-4 h-4 mr-2" />
            Health Complex
          </button>
          <button
            onClick={() => setActiveTab("appointments")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-smooth flex items-center ${
              activeTab === "appointments" ? "bg-white text-sky-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Stethoscope className="w-4 h-4 mr-2" />
            Appointments
          </button>
          <button
            onClick={() => setActiveTab("blood-directory")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-smooth flex items-center ${
              activeTab === "blood-directory" ? "bg-white text-rose-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Droplet className="w-4 h-4 mr-2" />
            Blood Directory
          </button>
        </div>
      </header>

      {activeTab === "directory" && <DirectoryTab onBookAppointment={() => setActiveTab("appointments")} />}
      {activeTab === "appointments" && <AppointmentsTab user={user} />}
      {activeTab === "blood-directory" && <BloodDirectoryTab user={user} />}
    </div>
  );
}

function DirectoryTab({ onBookAppointment }) {
  const units = [
    {
      name: "Eye Unit (চক্ষু ইউনিট)",
      doctor: "Dr. Md. Firoz Uddin",
      qualifications: "Associate Professor & Head (Eye Dept), Barind Medical College & Hospital",
      role: "Consultant (Eye), RUET Health Complex",
      schedule: "Every Wednesday, 9:00 AM - 2:00 PM",
      contact: "01717-725675, 01733-068146, 01716-472060",
      services: ["Conjunctivitis", "Refraction", "Dry Eye", "Foreign Body Removal", "General Eye Treatments"],
      color: "bg-blue-50 text-blue-700 border-blue-200"
    },
    {
      name: "Dental Unit (দন্ত ইউনিট)",
      doctor: "Dr. Md. Mohadderul Haque",
      qualifications: "BDS (Rajshahi Medical College)",
      role: "Oral & Dental Specialist & Surgeon. Consultant (Dental), RUET Health Complex",
      schedule: "Every Monday, 9:00 AM - 2:00 PM",
      contact: "01790-443735",
      services: ["Routine Dental Checkup", "Painful Tooth Extraction", "Mouth/Gum Infection", "Dental Filling", "Polishing", "Wisdom Tooth Treatment"],
      color: "bg-teal-50 text-teal-700 border-teal-200"
    },
    {
      name: "Physiotherapy Unit (ফিজিওথেরাপি ইউনিট)",
      doctor: "Md. Golam Muktadir",
      qualifications: "BPT (RIHD), MPH (DU), FSMT (SBSIT, India), Diploma in Med Acupuncture",
      role: "Physiotherapist, RUET Health Complex",
      schedule: "Every Saturday, 9:30 AM - 2:30 PM",
      contact: "01750-262873",
      services: ["Neck/Shoulder Pain (Frozen Shoulder)", "Knee/Heel Pain", "Joint & Muscle Pain", "Sports Injury", "Osteoarthritis", "Facial Paralysis (Bell's Palsy)", "Hand Tremor", "PLID (Waist Pain)"],
      color: "bg-purple-50 text-purple-700 border-purple-200"
    },
    {
      name: "Pathology Unit (প্যাথলজি)",
      doctor: "Md. Altab Hossain",
      qualifications: "B.Sc (Lab Medicine), MGU (India), CME (Andhra), MPH (RU)",
      role: "Assistant Principal Medical Technologist (Pathology)",
      schedule: "Regular Health Complex Hours",
      contact: "Inquire at front desk",
      services: ["Routine Blood Tests", "Pathology Diagnostics", "Sample Collection", "Lab Reports"],
      color: "bg-rose-50 text-rose-700 border-rose-200"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100 text-center">
        <h2 className="text-xl font-bold text-slate-800">RUET Health Complex</h2>
        <div className="mt-4 flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-6 text-sm">
          <p className="text-slate-600 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
            Chief Medical Officer In-charge: <strong className="text-slate-800">Dr. Md. Azizul Islam</strong>
          </p>
          <p className="text-slate-600 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
            Medical Officer: <strong className="text-slate-800">Dr. Farhana Rahman</strong>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        {units.map((unit, idx) => (
          <div key={idx} className="bg-white rounded-2xl shadow-xs border border-slate-100 flex flex-col overflow-hidden transition-all hover:shadow-md hover:border-slate-300">
            <div className={`p-4 border-b ${unit.color}`}>
              <h3 className="font-bold text-lg">{unit.name}</h3>
            </div>
            <div className="p-5 flex-1 flex flex-col space-y-4">
              <div>
                <p className="font-bold text-slate-800 text-lg flex items-start gap-2">
                  <UserRound className="w-5 h-5 mt-0.5 text-slate-400" /> {unit.doctor}
                </p>
                <p className="text-xs text-slate-500 mt-1 pl-7">{unit.qualifications}</p>
                <p className="text-xs text-slate-700 font-medium mt-1 pl-7">{unit.role}</p>
              </div>
              
              <div className="bg-slate-50 rounded-lg p-3 space-y-2">
                <p className="text-sm font-semibold flex items-center gap-2 text-slate-700">
                  <Clock className="w-4 h-4 text-emerald-600" /> {unit.schedule}
                </p>
                <p className="text-sm font-semibold flex items-center gap-2 text-slate-700">
                  <PhoneCall className="w-4 h-4 text-sky-600" /> {unit.contact}
                </p>
              </div>

              <div className="flex-1">
                <h4 className="text-sm font-bold text-slate-800 mb-2">Services Provided:</h4>
                <ul className="grid grid-cols-1 gap-1.5">
                  {unit.services.map((svc, sIdx) => (
                    <li key={sIdx} className="text-sm text-slate-600 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>{svc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Counseling Services Card */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-100 flex flex-col sm:flex-row overflow-hidden">
        <div className="bg-amber-50 p-6 sm:w-1/3 flex flex-col items-center justify-center border-b sm:border-b-0 sm:border-r border-amber-100 relative">
          <QrCode className="w-12 h-12 text-amber-600 mb-3" />
          <h3 className="font-bold text-amber-900 text-center text-lg leading-tight">Mental Health Counseling</h3>
          <div className="mt-3 pt-3 border-t border-amber-200/60 w-full text-center">
            <p className="font-bold text-amber-800 text-base">Tanjir Ahmmed Tushar</p>
            <p className="text-xs text-amber-700 mt-1 font-medium">Specialist Clinical Psychologist</p>
            <p className="text-[10px] text-amber-600/80 mt-0.5">Assoc. Professor, Psychology, RU</p>
          </div>
        </div>
        <div className="p-6 flex-1 flex flex-col justify-center">
          <h4 className="text-lg font-bold text-slate-800 mb-3">Service Hours</h4>
          <ul className="space-y-2 mb-5">
            <li className="flex items-center gap-3">
              <span className="w-24 font-medium text-slate-600">Sunday</span>
              <span className="text-slate-800">2:00 PM - 6:00 PM</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-24 font-medium text-slate-600">Tuesday</span>
              <span className="text-slate-800">2:00 PM - 6:00 PM</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-24 font-medium text-slate-600">Thursday</span>
              <span className="text-slate-800">2:00 PM - 6:00 PM</span>
            </li>
          </ul>
          <div className="flex flex-wrap gap-3">
            <button 
              type="button"
              onClick={onBookAppointment} 
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-lg font-medium transition-smooth shadow-xs cursor-pointer"
            >
              Book Counseling Session <Calendar className="w-4 h-4" />
            </button>
            <a 
              href="mailto:tushar5003@gmail.com?subject=RUET%20Psychological%20Counseling%20Appointment%20Request" 
              className="inline-flex items-center gap-2 bg-amber-100 hover:bg-amber-200 text-amber-900 px-5 py-2.5 rounded-lg font-medium transition-smooth"
            >
              Email Directly (tushar5003@gmail.com) <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function AppointmentsTab({ user }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    doctorName: "Dr. Md. Firoz Uddin (Eye)",
    appointmentDate: "",
    timeSlot: "10:00 AM - 10:30 AM",
    symptoms: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchAppointments = async () => {
    try {
      const { data } = await api.get("/medical/appointments");
      setAppointments(data.appointments);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await api.post("/medical/appointments", formData);
      fetchAppointments();
      setFormData({ ...formData, symptoms: "", appointmentDate: "" });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to book appointment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Booking Form */}
      <div className="lg:col-span-1">
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-sky-500" />
            Book a Doctor
          </h2>
          {error && <div className="p-3 bg-rose-50 text-rose-600 text-sm rounded-xl mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Select Doctor</label>
              <select
                className="w-full rounded-xl border-slate-200 bg-slate-50 border px-4 py-2.5 text-sm focus:border-sky-500 focus:ring-sky-500 outline-none transition-smooth"
                value={formData.doctorName}
                onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
              >
                <option value="Dr. Md. Firoz Uddin (Eye)">Dr. Md. Firoz Uddin (Eye Unit)</option>
                <option value="Dr. Md. Mohadderul Haque (Dental)">Dr. Md. Mohadderul Haque (Dental Unit)</option>
                <option value="Md. Golam Muktadir (Physiotherapy)">Md. Golam Muktadir (Physiotherapy Unit)</option>
                <option value="Tanjir Ahmmed Tushar (Mental Health Counseling)">Tanjir Ahmmed Tushar (Mental Health Counseling)</option>
                <option value="Dr. Md. Azizul Islam (CMO)">Dr. Md. Azizul Islam (Chief Medical Officer)</option>
                <option value="Dr. Farhana Rahman (MO)">Dr. Farhana Rahman (Medical Officer)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
              <input
                type="date"
                required
                className="w-full rounded-xl border-slate-200 bg-slate-50 border px-4 py-2.5 text-sm focus:border-sky-500 focus:ring-sky-500 outline-none transition-smooth"
                value={formData.appointmentDate}
                onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Time Slot</label>
              <select
                className="w-full rounded-xl border-slate-200 bg-slate-50 border px-4 py-2.5 text-sm focus:border-sky-500 focus:ring-sky-500 outline-none transition-smooth"
                value={formData.timeSlot}
                onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
              >
                <option value="10:00 AM - 10:30 AM">10:00 AM - 10:30 AM</option>
                <option value="11:00 AM - 11:30 AM">11:00 AM - 11:30 AM</option>
                <option value="02:00 PM - 02:30 PM">02:00 PM - 02:30 PM</option>
                <option value="04:00 PM - 04:30 PM">04:00 PM - 04:30 PM</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Symptoms / Reason</label>
              <textarea
                required
                rows="3"
                className="w-full rounded-xl border-slate-200 bg-slate-50 border px-4 py-2.5 text-sm focus:border-sky-500 focus:ring-sky-500 outline-none transition-smooth resize-none"
                placeholder="Briefly describe your health issue..."
                value={formData.symptoms}
                onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-sky-600 hover:bg-sky-700 text-white font-medium py-2.5 rounded-xl transition-smooth disabled:opacity-70"
            >
              {submitting ? "Booking..." : "Confirm Appointment"}
            </button>
          </form>
        </div>
      </div>

      {/* History */}
      <div className="lg:col-span-2">
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100 min-h-full">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-slate-400" />
            My Appointments
          </h2>
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-100 rounded-xl"></div>)}
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 mx-auto text-slate-200 mb-3" />
              <p className="text-slate-500 font-medium">No appointments found</p>
              <p className="text-sm text-slate-400 mt-1">Book an appointment using the form</p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((apt) => (
                <div key={apt._id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <h3 className="font-semibold text-slate-800 flex items-center">
                      {apt.doctorName}
                      <span className={`ml-3 px-2 py-0.5 rounded text-xs font-semibold uppercase ${
                        apt.status === 'scheduled' ? 'bg-amber-100 text-amber-700' :
                        apt.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-rose-100 text-rose-700'
                      }`}>
                        {apt.status}
                      </span>
                    </h3>
                    <p className="text-sm text-slate-500 mt-1 flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1.5" />
                      {new Date(apt.appointmentDate).toLocaleDateString()} &middot; {apt.timeSlot}
                    </p>
                    <p className="text-sm text-slate-600 mt-2 line-clamp-1">{apt.symptoms}</p>
                  </div>
                  {apt.prescriptionToken && (
                    <button className="whitespace-nowrap px-4 py-2 bg-white border border-slate-200 text-sky-600 hover:bg-sky-50 rounded-lg text-sm font-medium transition-smooth shadow-xs">
                      View Prescription
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BloodDirectoryTab({ user }) {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bloodGroup, setBloodGroup] = useState("");

  // Emergency Requests State
  const [emergencyRequests, setEmergencyRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [submittingBroadcast, setSubmittingBroadcast] = useState(false);

  const [broadcastForm, setBroadcastForm] = useState({
    patientName: "",
    bloodGroup: "O+",
    unitsNeeded: 1,
    hospital: "RUET Health Complex (Campus)",
    contactNumber: user?.phone || "",
    urgency: "Immediate (Next 1-2 Hours)",
    reason: "",
  });

  const searchDonors = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/medical/blood-directory${bloodGroup ? `?group=${encodeURIComponent(bloodGroup)}` : ""}`);
      setDonors(data.donors || []);
    } catch (err) {
      console.error("Failed to fetch blood donors", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmergencyRequests = async () => {
    setLoadingRequests(true);
    try {
      const { data } = await api.get("/medical/emergency-blood-requests");
      setEmergencyRequests(data.requests || []);
    } catch (err) {
      console.error("Failed to fetch emergency requests", err);
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    searchDonors();
  }, [bloodGroup]);

  useEffect(() => {
    fetchEmergencyRequests();
  }, []);

  const handleBroadcastSubmit = async (e) => {
    e.preventDefault();
    if (!broadcastForm.patientName || !broadcastForm.contactNumber) {
      toast.error("Please provide the patient name and contact phone number.");
      return;
    }

    setSubmittingBroadcast(true);
    try {
      const { data } = await api.post("/medical/emergency-blood-request", broadcastForm);
      toast.success(
        `Emergency blood alert broadcasted! Notified ${data.notifiedCount || 0} matching ${broadcastForm.bloodGroup} donors on campus.`
      );
      setIsBroadcastModalOpen(false);
      setBroadcastForm({
        patientName: "",
        bloodGroup: "O+",
        unitsNeeded: 1,
        hospital: "RUET Health Complex (Campus)",
        contactNumber: user?.phone || "",
        urgency: "Immediate (Next 1-2 Hours)",
        reason: "",
      });
      fetchEmergencyRequests();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to broadcast emergency blood request.");
    } finally {
      setSubmittingBroadcast(false);
    }
  };

  const handleFulfillRequest = async (id) => {
    try {
      await api.put(`/medical/emergency-blood-requests/${id}/fulfill`);
      toast.success("Blood request marked as fulfilled / donor found!");
      fetchEmergencyRequests();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update request status.");
    }
  };

  const activeRequests = emergencyRequests.filter((r) => r.status === "active");

  return (
    <div className="space-y-6">
      {/* Emergency Broadcast Callout Card */}
      <div className="bg-gradient-to-r from-rose-950 via-red-900 to-slate-900 text-white p-5 sm:p-6 rounded-2xl border border-rose-800/60 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-72 bg-radial from-rose-500/15 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-rose-300">
                Campus Emergency Blood Alert System
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              Need Blood Urgently for a Patient?
            </h2>
            <p className="text-xs sm:text-sm text-rose-100/90 leading-relaxed">
              Broadcast an instant high-priority notification bell alert to every registered RUET student and faculty member on campus matching the required blood group.
            </p>
          </div>

          <button
            onClick={() => setIsBroadcastModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-rose-900/40 transition hover:scale-[1.02] active:scale-[0.98] shrink-0 cursor-pointer"
          >
            <Megaphone className="w-4 h-4 animate-bounce" />
            <span>Broadcast Emergency Request</span>
          </button>
        </div>
      </div>

      {/* Active Emergency Requests Live Feed */}
      {activeRequests.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Active Emergency Blood Requests ({activeRequests.length})</span>
            </h3>
            <span className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full animate-pulse">
              Urgent Donors Needed
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeRequests.map((req) => {
              const isRequester = req.requesterId?._id === user?._id || user?.role === "admin";
              return (
                <div
                  key={req._id}
                  className="bg-white rounded-2xl border-2 border-rose-300 shadow-md p-4 sm:p-5 flex flex-col justify-between gap-3 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-rose-600" />
                  <div className="flex items-start gap-3.5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-600 to-red-700 text-white font-black text-xl flex items-center justify-center shrink-0 shadow-md shadow-rose-600/30">
                      {req.bloodGroup}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 flex-wrap">
                        <h4 className="font-bold text-slate-900 text-sm truncate">{req.patientName}</h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-100 text-rose-800 border border-rose-200">
                          {req.urgency}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 font-medium mt-1 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{req.hospital}</span>
                      </p>

                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                        <Droplet className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span>Required: <strong className="text-slate-800">{req.unitsNeeded} Bag(s)</strong></span>
                        {req.notifiedCount > 0 && (
                          <span className="text-[10px] text-slate-400 font-medium">
                            &bull; Notified {req.notifiedCount} on campus
                          </span>
                        )}
                      </p>

                      {req.reason && (
                        <p className="text-[11px] text-slate-600 italic mt-1 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                          &ldquo;{req.reason}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
                    <a
                      href={`tel:${req.contactNumber}`}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call {req.contactNumber}</span>
                    </a>

                    {isRequester && (
                      <button
                        onClick={() => handleFulfillRequest(req._id)}
                        className="py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                        title="Mark as fulfilled"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Fulfilled</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL: BROADCAST EMERGENCY BLOOD REQUEST */}
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-rose-50 to-red-50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-sm">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Emergency Blood Donor Broadcast</h3>
                  <p className="text-[11px] text-slate-500">Alerts all campus students &amp; faculty of this blood group</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBroadcastModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBroadcastSubmit} className="p-6 space-y-4">
              {/* Blood Group Select Pills */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1.5">
                  Required Blood Group *
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                    <button
                      key={bg}
                      type="button"
                      onClick={() => setBroadcastForm({ ...broadcastForm, bloodGroup: bg })}
                      className={`py-2 text-xs font-black rounded-xl border transition ${
                        broadcastForm.bloodGroup === bg
                          ? "bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/30 scale-102"
                          : "border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {bg}
                    </button>
                  ))}
                </div>
              </div>

              {/* Patient Name & Units Needed */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                    Patient Name / Relation *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Md. Rafiqul Islam (Father of Student)"
                    value={broadcastForm.patientName}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, patientName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                    Units (Bags) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={broadcastForm.unitsNeeded}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, unitsNeeded: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-rose-500 focus:outline-none text-center"
                  />
                </div>
              </div>

              {/* Hospital Location */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Hospital / Clinic Location *
                </label>
                <select
                  value={broadcastForm.hospital}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, hospital: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-rose-500 focus:outline-none cursor-pointer"
                >
                  <option value="RUET Health Complex (Campus)">RUET Health Complex (Campus)</option>
                  <option value="Rajshahi Medical College Hospital (RMCH)">Rajshahi Medical College Hospital (RMCH)</option>
                  <option value="Islami Bank Medical College Hospital, Rajshahi">Islami Bank Medical College Hospital, Rajshahi</option>
                  <option value="Barind Medical College Hospital">Barind Medical College Hospital</option>
                  <option value="Amana Hospital, Laxmipur, Rajshahi">Amana Hospital, Laxmipur, Rajshahi</option>
                  <option value="Popular Diagnostic Center & Clinic, Laxmipur">Popular Diagnostic Center &amp; Clinic, Laxmipur</option>
                </select>
              </div>

              {/* Contact Phone & Urgency */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                    Contact Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 01712-345678"
                    value={broadcastForm.contactNumber}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, contactNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                    Urgency Level
                  </label>
                  <select
                    value={broadcastForm.urgency}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, urgency: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-rose-500 focus:outline-none cursor-pointer"
                  >
                    <option value="Immediate (Next 1-2 Hours)">Immediate (Next 1-2 Hours)</option>
                    <option value="Today">Today</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              {/* Reason / Notes */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Reason / Diagnosis / Ward Number
                </label>
                <textarea
                  rows="2"
                  placeholder="e.g. Emergency surgery in OT-2 / ICU bed 4 / Dengue platelet transfusion"
                  value={broadcastForm.reason}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, reason: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              {/* Broadcast Notice Alert */}
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 flex items-start gap-2 text-rose-800 text-[11px]">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <p>
                  Pressing Broadcast will instantly create notification bell alerts for all verified donors matching <strong>{broadcastForm.bloodGroup}</strong> across the university.
                </p>
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsBroadcastModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingBroadcast}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-md shadow-rose-600/30 flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submittingBroadcast ? "Broadcasting..." : "Broadcast Alert Now"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Regular Blood Donor Directory & Search */}
      <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center">
              <Search className="w-5 h-5 mr-2 text-rose-500" />
              Registered Campus Blood Donor Directory
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Browse voluntary blood donors among students and faculty members.
            </p>
          </div>

          <div className="flex w-full sm:w-auto space-x-2">
            <select
              className="w-full sm:w-48 rounded-xl border-slate-200 bg-slate-50 border px-4 py-2.5 text-xs font-bold focus:border-rose-500 focus:ring-rose-500 outline-none transition-smooth cursor-pointer"
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
            >
              <option value="">All Blood Groups</option>
              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                <option key={bg} value={bg}>
                  Group {bg}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 bg-slate-100 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : donors.length === 0 ? (
          <div className="text-center py-12">
            <Droplet className="w-12 h-12 mx-auto text-rose-200 mb-3" />
            <p className="text-slate-500 font-medium">No registered donors found for this group</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {donors.map((donor) => (
              <div
                key={donor._id}
                className="p-4 rounded-xl border border-slate-100 hover:border-rose-200 bg-slate-50 hover:bg-rose-50/30 transition-smooth flex items-start space-x-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-black text-lg shadow-inner shrink-0">
                  {donor.bloodGroup}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 truncate text-sm">{donor.name}</p>
                  <p className="text-xs text-slate-500 truncate">
                    {donor.department} &bull; Batch &apos;{donor.batch || "24"} {donor.rollNo ? `(${donor.rollNo})` : ""}
                  </p>
                  <a
                    href={`tel:${donor.phone}`}
                    className="mt-2 inline-flex items-center text-xs text-sky-600 hover:text-sky-800 font-bold"
                  >
                    <Phone className="w-3.5 h-3.5 mr-1" />
                    {donor.phone || "No phone listed"}
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
