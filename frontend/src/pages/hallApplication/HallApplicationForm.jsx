/**
 * File: HallApplicationForm.jsx
 * Description: React component for students to fill out and submit their hall application.
 * 
 * This file is part of the RUET OneHub Project.
 */

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import hallApplicationService from "../../services/hallApplicationService";
import { MALE_HALLS, FEMALE_HALLS, SEMESTERS, HALL_NAMES } from "../../utils/constants";
import { formatDate, getStatusBadge, getStatusLabel } from "../../utils/helpers";
import { PageLoader } from "../../components/common/Loader";
import {
  Building,
  CheckCircle2,
  AlertTriangle,
  Send,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

export function HallApplicationForm() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [myApplication, setMyApplication] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    semester: "2-1",
    isCurrentResident: false,
    category: "merit", // 'merit' | 'financial_need'
    financialDescription: "",
    fatherContactNo: currentUser?.fatherContactNo || "",
    motherContactNo: currentUser?.motherContactNo || "",
    nidNumber: "",
    hometownInsideRajshahi: false,
    cgpa: "3.75",
    preferredHall: HALL_NAMES[0],
  });
  const [incomeDocumentFile, setIncomeDocumentFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const allowedHalls = currentUser?.gender?.toLowerCase() === "female" 
    ? FEMALE_HALLS 
    : currentUser?.gender?.toLowerCase() === "male"
      ? MALE_HALLS
      : HALL_NAMES;

  const fetchApplication = async () => {
    setLoading(true);
    try {
      const app = await hallApplicationService.getMyApplication();
      setMyApplication(app);
    } catch {
      setMyApplication(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplication();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    if (errorMsg) setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.category === "financial_need" && !incomeDocumentFile) {
      setErrorMsg("Please upload your family income certificate for Financial Need category.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const payload = new FormData();
      Object.keys(formData).forEach((key) => {
        payload.append(key, formData[key]);
      });
      if (incomeDocumentFile) {
        payload.append("incomeDocument", incomeDocumentFile);
      }

      const res = await hallApplicationService.applyHall(payload);
      setMyApplication(res);
      setSuccessMsg("Hall seat application submitted successfully! The provost committee will review your submission.");
    } catch (err) {
      setErrorMsg(err.message || "Failed to submit hall application.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <PageLoader text="Loading your hall accommodation file..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center space-x-2.5">
          <Building className="w-7 h-7 text-sky-600" />
          <span>RUET Residential Hall Accommodation</span>
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Apply for campus hall seat allocation under Merit or Financial Need quotas.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center space-x-3 text-sm animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center space-x-3 text-sm animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ACTIVE APPLICATION STATUS CARD */}
      {myApplication && (
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs uppercase font-semibold text-slate-400">Application Status</span>
              <div className="flex items-center space-x-2 mt-1">
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(
                    myApplication.status
                  )}`}
                >
                  {getStatusLabel(myApplication.status)}
                </span>
                <span className="text-xs text-slate-500">
                  Applied on {formatDate(myApplication.createdAt)}
                </span>
              </div>
            </div>

            {myApplication.allocatedRoomNumber && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900">
                <span className="font-semibold block">Allocated Room:</span>
                <span className="text-lg font-black text-emerald-700">
                  Room #{myApplication.allocatedRoomNumber}
                </span>
              </div>
            )}
          </div>

          {/* Verification / Flag warning if inside Rajshahi */}
          {myApplication.status === "flagged_ineligible" && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-3 text-amber-800 text-xs">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Verification Notice:</span>
                <p>{myApplication.flaggedReason || "Hometown reported as Rajshahi — requires in-person NID and domicile verification before seat allocation."}</p>
              </div>
            </div>
          )}

          {/* Snapshot Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 block font-medium">Preferred Hall</span>
              <span className="font-bold text-slate-800 mt-0.5 block">{myApplication.preferredHall}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 block font-medium">Quota Category</span>
              <span className="font-bold text-slate-800 mt-0.5 block capitalize">
                {myApplication.category.replace("_", " ")}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 block font-medium">Cumulative GPA</span>
              <span className="font-bold text-sky-700 mt-0.5 block">{myApplication.cgpa}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 block font-medium">National ID (NID)</span>
              <span className="font-mono font-semibold text-slate-800 mt-0.5 block">{myApplication.nidNumber}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 block font-medium">Emergency Contacts</span>
              <span className="font-medium text-slate-800 mt-0.5 block">
                F: {myApplication.fatherContactNo} | M: {myApplication.motherContactNo}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 block font-medium">Hometown Location</span>
              <span className="font-medium text-slate-800 mt-0.5 block">
                {myApplication.hometownInsideRajshahi ? "Inside Rajshahi Metro" : "Outside Rajshahi"}
              </span>
            </div>
          </div>

          {myApplication.incomeDocumentUrl && (
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Submitted Income Certificate</span>
              <a
                href={myApplication.incomeDocumentUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sky-600 hover:text-sky-700 font-semibold inline-flex items-center space-x-1"
              >
                <span>View Uploaded Document</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      )}

      {/* NEW APPLICATION SUBMISSION FORM */}
      {!myApplication && (
        <form onSubmit={handleSubmit} className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">
            Hall Seat Allocation Application Form
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Preferred Hall
              </label>
              <select
                name="preferredHall"
                value={formData.preferredHall}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-sky-500"
              >
                {allowedHalls.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Target Semester
              </label>
              <select
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-sky-500"
              >
                {SEMESTERS.map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Category Quota
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-sky-500"
              >
                <option value="merit">Merit Category</option>
                <option value="financial_need">Financial Need Category</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Current CGPA
              </label>
              <input
                type="number"
                step="0.01"
                min="2.00"
                max="4.00"
                required
                name="cgpa"
                value={formData.cgpa}
                onChange={handleChange}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                National ID (NID)
              </label>
              <input
                type="text"
                required
                placeholder="10 or 17 digit NID"
                name="nidNumber"
                value={formData.nidNumber}
                onChange={handleChange}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Father's Contact #
              </label>
              <input
                type="tel"
                required
                placeholder="017xxxxxxxx"
                name="fatherContactNo"
                value={formData.fatherContactNo}
                onChange={handleChange}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Mother's Contact #
              </label>
              <input
                type="tel"
                required
                placeholder="018xxxxxxxx"
                name="motherContactNo"
                value={formData.motherContactNo}
                onChange={handleChange}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Domicile Checkbox */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <label className="flex items-start space-x-3 cursor-pointer text-xs">
              <input
                type="checkbox"
                name="hometownInsideRajshahi"
                checked={formData.hometownInsideRajshahi}
                onChange={handleChange}
                className="mt-0.5 rounded text-sky-600"
              />
              <span className="text-slate-700">
                <strong>My permanent hometown is located inside Rajshahi City / District.</strong> (Note: Applicants residing in Rajshahi are subject to administrative verification under RUET hall policy).
              </span>
            </label>

            <label className="flex items-start space-x-3 cursor-pointer text-xs">
              <input
                type="checkbox"
                name="isCurrentResident"
                checked={formData.isCurrentResident}
                onChange={handleChange}
                className="mt-0.5 rounded text-sky-600"
              />
              <span className="text-slate-700">
                I am already a resident student renewing hall allocation.
              </span>
            </label>
          </div>

          {/* Financial Need Fields */}
          {formData.category === "financial_need" && (
            <div className="p-4 bg-sky-50/70 border border-sky-200 rounded-xl space-y-3">
              <h4 className="text-xs font-bold uppercase text-sky-950">
                Financial Need Verification Requirements
              </h4>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Income Certificate Document (PDF or Image) *
                </label>
                <input
                  type="file"
                  required
                  accept="image/*,application/pdf"
                  onChange={(e) => setIncomeDocumentFile(e.target.files[0] || null)}
                  className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-sky-600 file:text-white hover:file:bg-sky-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Financial Background Statement
                </label>
                <textarea
                  rows={3}
                  name="financialDescription"
                  value={formData.financialDescription}
                  onChange={handleChange}
                  placeholder="Briefly state family income sources, dependents, and why campus accommodation is needed..."
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                ></textarea>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-sm transition-smooth shadow-sm disabled:opacity-50 inline-flex items-center space-x-2 cursor-pointer"
            >
              {submitting ? (
                <span>Submitting Application...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Hall Application</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default HallApplicationForm;
