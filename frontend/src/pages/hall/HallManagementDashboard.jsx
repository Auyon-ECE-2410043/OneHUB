import React, { useState, useEffect } from "react";
import { Building, Utensils, ChevronRight, CheckCircle2, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

export function HallManagementDashboard() {
  const [appStatus, setAppStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await api.get("/hall/my-application");
        setAppStatus(res.data.application);
      } catch (err) {
        setAppStatus(null);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, []);

  if (loading) {
    return <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  const isAllocated = appStatus?.status === "approved";

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center shadow-sm">
            <Building className="w-5 h-5" />
          </div>
          Hall Management
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Central hub for all your residential hall services, applications, and dining.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Hall Application Card */}
        <div 
          onClick={() => navigate("/hall/apply")}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-sky-300 dark:hover:border-sky-500/50 transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div>
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center mb-4 group-hover:bg-sky-100 dark:group-hover:bg-sky-500/20 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
              <Building className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">Hall Seat Application</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Apply for a residential hall seat or check your current application status.
            </p>
          </div>
          <div className="mt-6 flex items-center justify-between">
            {appStatus ? (
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${appStatus.status === "approved" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" : "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"}`}>
                {appStatus.status === "approved" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                {appStatus.status === "approved" ? "Allocated" : "Pending"}
              </span>
            ) : (
              <span className="text-sm font-semibold text-sky-600 dark:text-sky-400">Apply Now</span>
            )}
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-sky-500 transition-colors" />
          </div>
        </div>

        {/* Dining Tokens Card (Only visible if allocated) */}
        {isAllocated && (
          <div 
            onClick={() => navigate("/dining")}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-orange-300 dark:hover:border-orange-500/50 transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="w-12 h-12 rounded-full bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-4 group-hover:bg-orange-100 dark:group-hover:bg-orange-500/20 transition-colors">
                <Utensils className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">Hall Token System</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Purchase and manage digital dining tokens for Lunch and Dinner at your allocated hall.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between">
              <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">Open Dashboard</span>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-orange-500 transition-colors" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

