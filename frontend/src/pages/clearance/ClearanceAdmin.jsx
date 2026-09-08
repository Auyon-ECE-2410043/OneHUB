import { useState, useEffect } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { CheckCircle2, Search, Filter, Loader2, BookOpen, Building, GraduationCap, Banknote } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const DEPARTMENTS = [
  { id: "departmental", label: "Department", icon: GraduationCap, color: "text-blue-500", bg: "bg-blue-50" },
  { id: "hall", label: "Hall Office", icon: Building, color: "text-amber-500", bg: "bg-amber-50" },
  { id: "library", label: "Library", icon: BookOpen, color: "text-emerald-500", bg: "bg-emerald-50" },
  { id: "accounts", label: "Accounts", icon: Banknote, color: "text-purple-500", bg: "bg-purple-50" },
];

export function ClearanceAdmin() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(
    user?.role === "hall_admin" ? "hall" : "departmental"
  );
  const [clearances, setClearances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchClearances();
  }, [activeTab]);

  const fetchClearances = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/clearance/pending/${activeTab}`);
      setClearances(data.clearances);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to load pending clearances");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id, studentName) => {
    if (!window.confirm(`Are you sure you want to approve clearance for ${studentName}?`)) return;
    
    setProcessingId(id);
    try {
      await api.put(`/clearance/${id}/${activeTab}/approve`, {
        remarks: "Approved via Admin Portal"
      });
      toast.success(`Clearance approved for ${studentName}`);
      setClearances((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to approve clearance");
    } finally {
      setProcessingId(null);
    }
  };

  const filteredClearances = clearances.filter((c) => 
    c.studentId?.name?.toLowerCase().includes(search.toLowerCase()) || 
    c.studentId?.rollNo?.toString().includes(search)
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Clearance Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review and approve student exam clearance requests.
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or roll..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 transition-all outline-none"
          />
        </div>
      </div>

      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
        {DEPARTMENTS.map((dept) => {
          const Icon = dept.icon;
          const isActive = activeTab === dept.id;
          return (
            <button
              key={dept.id}
              onClick={() => setActiveTab(dept.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${
                isActive 
                  ? "bg-slate-800 text-white shadow-md dark:bg-slate-700" 
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-white" : dept.color}`} />
              {dept.label} Clearance
            </button>
          );
        })}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Department & Batch</th>
                <th className="px-6 py-4">Semester</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-sky-500 mx-auto" />
                    <p className="mt-3 text-slate-500 font-medium">Loading requests...</p>
                  </td>
                </tr>
              ) : filteredClearances.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                    </div>
                    <p className="text-slate-800 dark:text-slate-200 font-bold">All Caught Up!</p>
                    <p className="text-slate-500 text-sm mt-1">No pending clearances for this department.</p>
                  </td>
                </tr>
              ) : (
                filteredClearances.map((c) => (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={c._id} 
                    className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800 dark:text-slate-100">{c.studentId?.name}</div>
                      <div className="text-xs text-slate-500">{c.studentId?.rollNo}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-600 dark:text-slate-300">
                      {c.studentId?.department} - Series {c.studentId?.batch}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400 text-xs font-bold rounded-lg border border-sky-100 dark:border-sky-500/20">
                        {c.semester}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 text-xs font-bold rounded-lg border border-amber-100 dark:border-amber-500/20 inline-flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                        Pending Review
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleApprove(c._id, c.studentId?.name)}
                        disabled={processingId === c._id}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-all shadow-sm"
                      >
                        {processingId === c._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                        Approve
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
