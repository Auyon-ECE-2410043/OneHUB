/**
 * File: MedicalCenter.jsx
 * Description: React component rendering the MedicalCenter UI interface.
 * 
 * This file is part of the RUET OneHub Project.
 */

import { useState, useEffect } from "react";
import api from "../../services/api";
import { Search, Stethoscope, Droplet, Calendar, User as UserIcon, Phone, FileText, Info, Building2, Clock, CheckCircle2, UserRound, PhoneCall, QrCode, ExternalLink } from "lucide-react";
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
      {activeTab === "blood-directory" && <BloodDirectoryTab />}
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

function BloodDirectoryTab() {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bloodGroup, setBloodGroup] = useState("");

  const searchDonors = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/medical/blood-directory${bloodGroup ? `?group=${encodeURIComponent(bloodGroup)}` : ""}`);
      setDonors(data.donors);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    searchDonors();
  }, [bloodGroup]);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center">
          <Search className="w-5 h-5 mr-2 text-rose-500" />
          Emergency Donor Search
        </h2>
        <div className="flex w-full sm:w-auto space-x-2">
          <select
            className="w-full sm:w-48 rounded-xl border-slate-200 bg-slate-50 border px-4 py-2.5 text-sm focus:border-rose-500 focus:ring-rose-500 outline-none transition-smooth"
            value={bloodGroup}
            onChange={(e) => setBloodGroup(e.target.value)}
          >
            <option value="">All Blood Groups</option>
            {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-slate-100 rounded-xl animate-pulse"></div>)}
        </div>
      ) : donors.length === 0 ? (
        <div className="text-center py-12">
          <Droplet className="w-12 h-12 mx-auto text-rose-200 mb-3" />
          <p className="text-slate-500 font-medium">No donors found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {donors.map((donor) => (
            <div key={donor._id} className="p-4 rounded-xl border border-slate-100 hover:border-rose-200 bg-slate-50 hover:bg-rose-50/30 transition-smooth flex items-start space-x-4">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-lg shadow-inner">
                {donor.bloodGroup}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 truncate">{donor.name}</p>
                <p className="text-xs text-slate-500 truncate">{donor.department} &middot; {donor.batch}</p>
                <a href={`tel:${donor.phone}`} className="mt-2 inline-flex items-center text-sm text-sky-600 hover:text-sky-800 font-medium">
                  <Phone className="w-3.5 h-3.5 mr-1" />
                  {donor.phone || "Not provided"}
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
