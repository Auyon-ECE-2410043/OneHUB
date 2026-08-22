/**
 * File: ClearanceStatus.jsx
 * Description: React component rendering the ClearanceStatus UI interface.
 * 
 * This file is part of the RUET OneHub Project.
 */

import { useState, useEffect } from "react";
import api from "../../services/api";
import { ShieldCheck, CheckCircle2, Clock, AlertCircle, QrCode, Download } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export function ClearanceStatus() {
  const { user } = useAuth();
  const [clearance, setClearance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [admitData, setAdmitData] = useState(null);
  
  // For simplicity, hardcoding semester. In real app, this might come from context.
  const currentSemester = "2-1";

  const fetchClearance = async () => {
    try {
      const { data } = await api.get(`/clearance?semester=${currentSemester}`);
      setClearance(data.clearance);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClearance();
  }, []);

  const handleGenerateAdmit = async () => {
    setGenerating(true);
    try {
      const { data } = await api.post(`/clearance/${clearance._id}/generate-admit`);
      setAdmitData(data);
      fetchClearance(); // Refresh status
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to generate admit card");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading clearance data...</div>;
  }

  const depts = clearance?.departments || {};
  const isAllCleared = clearance?.status === "cleared";

  const getStatusIcon = (status) => {
    if (status === "cleared") return <CheckCircle2 className="w-6 h-6 text-emerald-500" />;
    if (status === "rejected") return <AlertCircle className="w-6 h-6 text-rose-500" />;
    if (status === "not_applicable") return <ShieldCheck className="w-6 h-6 text-slate-400" />;
    return <Clock className="w-6 h-6 text-amber-500" />;
  };

  const getStatusColor = (status) => {
    if (status === "cleared") return "bg-emerald-50 border-emerald-200";
    if (status === "rejected") return "bg-rose-50 border-rose-200";
    if (status === "not_applicable") return "bg-slate-50 border-slate-200 opacity-70";
    return "bg-amber-50 border-amber-200";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="bg-gradient-to-r from-indigo-900 to-indigo-700 text-white p-8 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Digital Exam Clearance</h1>
            <p className="text-indigo-200 text-lg">Semester {currentSemester} &middot; Automatic Verifications</p>
          </div>
          <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/20">
            <p className="text-sm text-indigo-200 font-medium uppercase tracking-wider mb-1">Overall Status</p>
            <div className="flex items-center space-x-2">
              {isAllCleared ? (
                <span className="text-2xl font-bold text-emerald-400 flex items-center">
                  <CheckCircle2 className="w-6 h-6 mr-2" /> CLEARED
                </span>
              ) : (
                <span className="text-2xl font-bold text-amber-400 flex items-center">
                  <Clock className="w-6 h-6 mr-2" /> PENDING
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { key: "accounts", label: "Accounts Section", desc: "Tuition & Registration Fees" },
          { key: "hall", label: "Hall Administration", desc: "Seat Rent & Dining Fees" },
          { key: "library", label: "Central Library", desc: "Book Returns & Fines" },
          { key: "departmental", label: "Department Head", desc: "Attendance >= 60% & Labs" }
        ].map((dept) => {
          const status = depts[dept.key]?.status || "pending";
          return (
            <div key={dept.key} className={`p-6 rounded-2xl border transition-smooth flex items-start space-x-4 ${getStatusColor(status)}`}>
              <div className="mt-1 bg-white p-2 rounded-full shadow-sm">
                {getStatusIcon(status)}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-800 text-lg">{dept.label}</h3>
                <p className="text-sm text-slate-600 mt-1">{dept.desc}</p>
                <div className="mt-3 flex items-center">
                  <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${
                    status === 'cleared' ? 'bg-emerald-100 text-emerald-700' :
                    status === 'rejected' ? 'bg-rose-100 text-rose-700' :
                    status === 'not_applicable' ? 'bg-slate-200 text-slate-600' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {status.replace("_", " ")}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-xs border border-slate-100 flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center mb-4">
          <QrCode className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Digital Admit Card</h2>
        <p className="text-slate-500 mt-2 max-w-lg mb-6">
          Once all 4 departments have cleared your academic record, you will be able to instantly generate and download your verifiable QR Admit Card.
        </p>

        {clearance?.admitCardGenerated || admitData ? (
          <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl w-full max-w-md">
            <h3 className="font-bold text-emerald-600 flex items-center justify-center mb-2">
              <CheckCircle2 className="w-5 h-5 mr-2" /> Admit Card Generated
            </h3>
            <p className="font-mono text-sm bg-white p-3 border border-slate-200 rounded text-slate-700 mb-4 break-all">
              {clearance?.admitCardToken || admitData?.token}
            </p>
            <button className="w-full bg-slate-800 hover:bg-slate-900 text-white font-medium py-2.5 rounded-lg transition-smooth flex items-center justify-center">
              <Download className="w-4 h-4 mr-2" /> Download PDF
            </button>
          </div>
        ) : (
          <button
            onClick={handleGenerateAdmit}
            disabled={!isAllCleared || generating}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-xl shadow-md transition-smooth disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {generating ? "Generating..." : "Generate Admit Card"}
          </button>
        )}
      </div>
    </div>
  );
}
