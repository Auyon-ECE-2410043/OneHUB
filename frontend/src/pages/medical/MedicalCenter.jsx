import { useState, useEffect } from "react";
import api from "../../services/api";
import { Search, Stethoscope, Droplet, Calendar, User as UserIcon, Phone, FileText } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export function MedicalCenter() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("appointments");

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl shadow-xs border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Medical Center</h1>
          <p className="text-slate-500 mt-1">Book doctor appointments and access the emergency blood directory.</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-2 bg-slate-100 p-1 rounded-xl">
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

      {activeTab === "appointments" ? <AppointmentsTab user={user} /> : <BloodDirectoryTab />}
    </div>
  );
}

function AppointmentsTab({ user }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    doctorName: "Dr. A. Rahman",
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
                <option value="Dr. A. Rahman">Dr. A. Rahman (General Physician)</option>
                <option value="Dr. S. Islam">Dr. S. Islam (Specialist)</option>
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
