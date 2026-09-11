import { useState, useEffect } from "react";
import { calendarService } from "../../services/calendarService";
import { PageLoader } from "../../components/common/Loader";
import { CalendarDays, Plus, Trash2, Edit, Save, X } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "../../components/common/Modal";

export function ManageCalendar() {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    startDate: "",
    endDate: "",
    type: "holiday",
    classesSuspended: true
  });

  const fetchHolidays = async () => {
    try {
      const data = await calendarService.getHolidays();
      setHolidays(data);
    } catch (err) {
      toast.error("Failed to load holidays");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  const handleOpenModal = (holiday = null) => {
    if (holiday) {
      setEditId(holiday._id);
      setFormData({
        title: holiday.title,
        startDate: holiday.startDate.split("T")[0],
        endDate: holiday.endDate.split("T")[0],
        type: holiday.type,
        classesSuspended: holiday.classesSuspended
      });
    } else {
      setEditId(null);
      setFormData({
        title: "",
        startDate: "",
        endDate: "",
        type: "holiday",
        classesSuspended: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await calendarService.updateHoliday(editId, formData);
        toast.success("Holiday updated successfully");
      } else {
        await calendarService.createHoliday(formData);
        toast.success("Holiday added successfully");
      }
      setIsModalOpen(false);
      fetchHolidays();
    } catch (err) {
      toast.error(err.response?.data?.error || "An error occurred");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await calendarService.deleteHoliday(id);
      toast.success("Event deleted");
      fetchHolidays();
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-sky-600" />
            Manage Calendar
          </h1>
          <p className="text-slate-500 mt-1">Add, edit, or remove academic holidays.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all font-medium"
        >
          <Plus className="w-5 h-5" />
          Add Event
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-xs border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Event Title</th>
                <th className="px-6 py-4">Dates</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Classes</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {holidays.map((h) => (
                <tr key={h._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-800">{h.title}</td>
                  <td className="px-6 py-4">
                    {new Date(h.startDate).toLocaleDateString()} - {new Date(h.endDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 capitalize">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold \${h.type === "holiday" ? "bg-red-100 text-red-700" : h.type === "vacation" ? "bg-emerald-100 text-emerald-700" : "bg-sky-100 text-sky-700"}`}>
                      {h.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">{h.classesSuspended ? "Suspended" : "Regular"}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleOpenModal(h)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(h._id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {holidays.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">No events found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editId ? "Edit Event" : "Add Event"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Event Title</label>
            <input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Start Date</label>
              <input type="date" required value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">End Date</label>
              <input type="date" required value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Event Type</label>
              <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <option value="holiday">Holiday</option>
                <option value="vacation">Vacation</option>
                <option value="event">Event (e.g. University Day)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Classes Suspended?</label>
              <select value={formData.classesSuspended} onChange={(e) => setFormData({...formData, classesSuspended: e.target.value === "true"})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <option value="true">Yes, Suspended</option>
                <option value="false">No, Regular Classes</option>
              </select>
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">Save Event</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default ManageCalendar;
