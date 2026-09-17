import React, { useState, useEffect } from 'react';
import { Calendar, Search, CheckCircle, XCircle, Users, Utensils } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'sonner';

export default function DiningManagement() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTokens = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dining/admin/tokens?date=' + date);
      setTokens(res.data.tokens);
    } catch (err) {
      toast.error('Failed to load dining records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens();
  }, [date]);

  const markUsed = async (id) => {
    try {
      await api.patch('/dining/admin/tokens/' + id + '/use');
      toast.success('Token marked as used!');
      fetchTokens();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update token');
    }
  };

  const lunches = tokens.filter(t => t.mealType === 'Lunch');
  const dinners = tokens.filter(t => t.mealType === 'Dinner');

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Utensils className="w-8 h-8 text-sky-500" />
          Dining Management
        </h1>
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800">
          <Calendar className="w-5 h-5 text-slate-400" />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-transparent border-none focus:outline-none text-slate-700 dark:text-slate-200"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase">Lunch Tokens</p>
            <p className="text-3xl font-bold text-slate-800 dark:text-white mt-1">{lunches.length}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Users className="w-6 h-6" />
          </div>
        </div>
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase">Dinner Tokens</p>
            <p className="text-3xl font-bold text-slate-800 dark:text-white mt-1">{dinners.length}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 font-semibold text-slate-700 dark:text-slate-200">
          Purchased Tokens
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-sm">
              <tr>
                <th className="p-4">Student</th>
                <th className="p-4">Meal</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr><td colSpan="4" className="p-8 text-center text-slate-500">Loading...</td></tr>
              ) : tokens.length === 0 ? (
                <tr><td colSpan="4" className="p-8 text-center text-slate-500">No tokens booked for this date.</td></tr>
              ) : (
                tokens.map(token => (
                  <tr key={token._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{token.studentId?.name}</p>
                      <p className="text-xs text-slate-500">{token.studentId?.studentId} • {token.studentId?.department}</p>
                    </td>
                    <td className="p-4">
                      <span className={'px-2 py-1 rounded-full text-xs font-medium ' + (token.mealType === 'Lunch' ? 'bg-amber-500/10 text-amber-600' : 'bg-indigo-500/10 text-indigo-600')}>
                        {token.mealType}
                      </span>
                    </td>
                    <td className="p-4">
                      {token.status === 'active' ? (
                        <span className="flex items-center gap-1 text-emerald-500 text-sm font-medium"><CheckCircle className="w-4 h-4"/> Active</span>
                      ) : (
                        <span className="flex items-center gap-1 text-slate-500 text-sm font-medium"><XCircle className="w-4 h-4"/> Used</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {token.status === 'active' && (
                        <button onClick={() => markUsed(token._id)} className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-colors">
                          Mark Used
                        </button>
                      )}
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