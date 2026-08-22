/**
 * File: HallApplicationStatus.jsx
 * Description: React component displaying the current status of a submitted hall application.
 * 
 * This file is part of the RUET OneHub Project.
 */

import { useState, useEffect, useCallback } from "react";
import hallApplicationService from "../../services/hallApplicationService";
import { getStatusBadge, getStatusLabel } from "../../utils/helpers";
import { PageLoader } from "../../components/common/Loader";
import Modal from "../../components/common/Modal";
import {
  Building,
  Search,
  ExternalLink,
} from "lucide-react";

export function HallApplicationStatus() {
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Review Modal State
  const [selectedApp, setSelectedApp] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reviewStatus, setReviewStatus] = useState("approved");
  const [allocatedRoomNumber, setAllocatedRoomNumber] = useState("");
  const [flaggedReason, setFlaggedReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await hallApplicationService.getAllApplications(
        statusFilter === "all" ? "" : statusFilter
      );
      setApplications(data);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const openReviewModal = (app) => {
    setSelectedApp(app);
    setReviewStatus(app.status === "flagged_ineligible" ? "flagged_ineligible" : "approved");
    setAllocatedRoomNumber(app.allocatedRoomNumber || "");
    setFlaggedReason(app.flaggedReason || "");
    setIsModalOpen(true);
  };

  const handleSaveReview = async () => {
    if (!selectedApp) return;
    setSubmitting(true);
    try {
      await hallApplicationService.reviewApplication(selectedApp._id, {
        status: reviewStatus,
        allocatedRoomNumber,
        flaggedReason,
      });
      setIsModalOpen(false);
      await fetchApplications();
    } catch (err) {
      alert(err.message || "Failed to update review");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <PageLoader text="Loading hall applications registry..." />;
  }

  const filtered = applications.filter((a) => {
    const term = searchTerm.toLowerCase();
    return (
      a.fullName?.toLowerCase().includes(term) ||
      a.rollNo?.toLowerCase().includes(term) ||
      a.preferredHall?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center space-x-2.5">
          <Building className="w-7 h-7 text-sky-600" />
          <span>Hall Seat Applications Administration</span>
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Review student accommodation applications, verify domicile and income records, and assign residential rooms.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by student name, roll, hall..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "all", label: "All" },
            { id: "pending_review", label: "Pending Review" },
            { id: "flagged_ineligible", label: "Flagged (Rajshahi)" },
            { id: "approved", label: "Approved" },
            { id: "rejected", label: "Rejected" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-smooth ${
                statusFilter === f.id
                  ? "bg-sky-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4">Roll #</th>
                <th className="py-3.5 px-4">Preferred Hall</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">CGPA</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Room</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No hall applications match the selected status filters.
                  </td>
                </tr>
              ) : (
                filtered.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50/80 transition-smooth">
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {app.fullName}
                      <span className="block text-xs font-normal text-slate-400">
                        {app.department}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-sky-700">
                      {app.rollNo || "N/A"}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-slate-700">
                      {app.preferredHall}
                    </td>
                    <td className="py-3.5 px-4 text-xs capitalize">
                      {app.category.replace("_", " ")}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {app.cgpa}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${getStatusBadge(
                          app.status
                        )}`}
                      >
                        {getStatusLabel(app.status)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs font-bold text-emerald-700">
                      {app.allocatedRoomNumber || "—"}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => openReviewModal(app)}
                        className="px-3 py-1.5 bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-lg text-xs font-medium transition-smooth"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Application Review Modal */}
      {selectedApp && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Review Hall Application: ${selectedApp.fullName}`}
        >
          <div className="space-y-4 text-xs">
            {/* Applicant Summary */}
            <div className="p-4 bg-slate-50 rounded-xl grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 block font-medium">Roll Number</span>
                <span className="font-mono font-bold text-slate-800">{selectedApp.rollNo}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">CGPA</span>
                <span className="font-bold text-sky-700">{selectedApp.cgpa}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Quota Category</span>
                <span className="font-semibold capitalize text-slate-800">
                  {selectedApp.category.replace("_", " ")}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">National ID (NID)</span>
                <span className="font-mono text-slate-800">{selectedApp.nidNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Parent Contact</span>
                <span className="text-slate-800">
                  {selectedApp.fatherContactNo} / {selectedApp.motherContactNo}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Hometown Status</span>
                <span
                  className={`font-semibold ${
                    selectedApp.hometownInsideRajshahi ? "text-amber-700" : "text-slate-800"
                  }`}
                >
                  {selectedApp.hometownInsideRajshahi ? "Inside Rajshahi Metro" : "Outside Rajshahi"}
                </span>
              </div>
            </div>

            {selectedApp.incomeDocumentUrl && (
              <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl flex items-center justify-between">
                <span>Family Income Document Submitted</span>
                <a
                  href={selectedApp.incomeDocumentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sky-700 hover:text-sky-800 font-bold inline-flex items-center space-x-1"
                >
                  <span>View Document</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            {/* Decision Controls */}
            <div>
              <label className="block font-semibold uppercase text-slate-600 mb-1">
                Review Decision
              </label>
              <select
                value={reviewStatus}
                onChange={(e) => setReviewStatus(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-semibold text-slate-800"
              >
                <option value="approved">Approve Seat Allocation</option>
                <option value="rejected">Reject Application</option>
                <option value="flagged_ineligible">Flag for Domicile / NID Verification</option>
                <option value="pending_review">Keep Pending</option>
              </select>
            </div>

            {reviewStatus === "approved" && (
              <div>
                <label className="block font-semibold uppercase text-slate-600 mb-1">
                  Allocate Room Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. Room 314-A"
                  value={allocatedRoomNumber}
                  onChange={(e) => setAllocatedRoomNumber(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl font-mono text-sm"
                />
              </div>
            )}

            <div>
              <label className="block font-semibold uppercase text-slate-600 mb-1">
                Review Notes / Flag Reason
              </label>
              <textarea
                rows={2}
                placeholder="Optional administrative remarks..."
                value={flaggedReason}
                onChange={(e) => setFlaggedReason(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs"
              ></textarea>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveReview}
                disabled={submitting}
                className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl transition-smooth shadow-sm disabled:opacity-50"
              >
                {submitting ? "Saving..." : "Submit Review Decision"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default HallApplicationStatus;
