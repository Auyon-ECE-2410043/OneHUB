import { useState, useEffect } from "react";
import api from "../../services/api";
import { PageLoader } from "../../components/common/Loader";
import { Trash2, Users, ShieldAlert } from "lucide-react";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

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
    const confirmText = prompt(`WARNING: This will permanently delete ${name} and ALL their associated data (marks, registrations, etc).\n\nType "DELETE" to confirm.`);
    if (confirmText !== "DELETE") return;
    
    setDeleting(userId);
    try {
      await api.delete(`/users/${userId}`);
      setUsers(users.filter(u => u._id !== userId));
      alert("User account successfully deleted.");
    } catch (err) {
      console.error(err);
      alert("Failed to delete user: " + err.message);
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return <PageLoader text="Loading user database..." />;

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

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Name</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">ID / Roll</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {users.map(u => (
                <tr key={u._id} className="hover:bg-slate-50 transition-smooth">
                  <td className="py-3.5 px-4 font-semibold">{u.name}</td>
                  <td className="py-3.5 px-4 text-slate-500">{u.email}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                      u.role === "admin" ? "bg-rose-100 text-rose-700" :
                      u.role === "faculty" ? "bg-indigo-100 text-indigo-700" :
                      "bg-emerald-100 text-emerald-700"
                    }`}>
                      {u.role}
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

