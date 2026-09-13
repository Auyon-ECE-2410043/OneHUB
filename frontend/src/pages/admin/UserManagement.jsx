import { useState, useEffect } from "react";
import api from "../../services/api";
import { PageLoader } from "../../components/common/Loader";
import { Trash2, ShieldAlert, Search, Filter } from "lucide-react";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterDept, setFilterDept] = useState("all");
  const [filterBatch, setFilterBatch] = useState("all");

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data.users);
    } catch (err) {
      console.error(err);
      alert("Failed to load users: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (userId, name) => {
    // No confirmation required per user request
    
    setDeleting(userId);
    try {
      await api.delete(`/users/${userId}`);
      setUsers(users.filter(u => u._id !== userId));
      // alert("User account successfully deleted.");
    } catch (err) {
      console.error(err);
      alert("Failed to delete user: " + err.message);
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return <PageLoader text="Loading user database..." />;

  // Dynamic dropdown options based on fetched data
  const departments = [...new Set(users.map(u => u.department).filter(Boolean))].sort();
  const batches = [...new Set(users.map(u => u.batch).filter(Boolean))].sort();
  const roles = [...new Set(users.map(u => u.role).filter(Boolean))].sort();

  const filteredUsers = users.filter(u => {
    const s = searchTerm.toLowerCase();
    const matchSearch = (u.name || "").toLowerCase().includes(s) || 
                        (u.email || "").toLowerCase().includes(s) || 
                        (u.rollNo || "").includes(s);
    const matchRole = filterRole === "all" || u.role === filterRole;
    const matchDept = filterDept === "all" || u.department === filterDept;
    const matchBatch = filterBatch === "all" || u.batch === filterBatch;
    return matchSearch && matchRole && matchDept && matchBatch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-2">
        <div className="p-3 bg-rose-100 rounded-lg">
          <ShieldAlert className="w-6 h-6 text-rose-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
          <p className="text-sm text-gray-500">Admin control panel to manage and delete accounts</p>
        </div>
      </div>

      {/* Filtering Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search name, email, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-smooth"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-500">Role:</span>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 capitalize"
            >
              <option value="all">All Roles</option>
              {roles.map(r => <option key={r} value={r}>{r.replace("_", " ")}</option>)}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-500">Dept:</span>
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="all">All Depts</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-500">Series:</span>
            <select
              value={filterBatch}
              onChange={(e) => setFilterBatch(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="all">All Series</option>
              {batches.map(b => <option key={b} value={b}>Series {b}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Name & Dept</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">ID / Roll</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">No users found matching your filters.</td>
                </tr>
              ) : (
                filteredUsers.map(u => (
                  <tr key={u._id} className="hover:bg-slate-50 transition-smooth">
                    <td className="py-3.5 px-4">
                      <p className="font-semibold">{u.name}</p>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        {u.department ? u.department : "N/A"} {u.batch ? ` (Series ${u.batch})` : ""}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{u.email}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        u.role === "admin" ? "bg-rose-100 text-rose-700" :
                        u.role === "faculty" ? "bg-indigo-100 text-indigo-700" :
                        "bg-emerald-100 text-emerald-700"
                      }`}>
                        {u.role.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono">{u.rollNo || u.registrationNo || "N/A"}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDelete(u._id, u.name)}
                        disabled={deleting === u._id}
                        className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg text-xs font-bold transition-smooth inline-flex items-center space-x-1 disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{deleting === u._id ? "Deleting..." : "Delete"}</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
