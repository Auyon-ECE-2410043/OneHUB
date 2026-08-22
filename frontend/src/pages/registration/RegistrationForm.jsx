import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import registrationService from "../../services/registrationService";
import courseService from "../../services/courseService";
import { SEMESTERS } from "../../utils/constants";
import { formatCurrency, formatDate, getStatusBadge, getStatusLabel } from "../../utils/helpers";
import { PageLoader } from "../../components/common/Loader";
import Modal from "../../components/common/Modal";
import {
  ClipboardList,
  CheckCircle2,
  Plus,
  Trash2,
  AlertCircle,
  FileCheck,
} from "lucide-react";

export function RegistrationForm() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  // Student States
  const [myRegistration, setMyRegistration] = useState(null);
  const [assignedData, setAssignedData] = useState(null);
  const [allCourses, setAllCourses] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState("2-1");
  const [selectedBacklogIds, setSelectedBacklogIds] = useState([]);
  const [submittingReg, setSubmittingReg] = useState(false);

  // Faculty/Admin Review States
  const [pendingList, setPendingList] = useState([]);
  const [selectedRegForReview, setSelectedRegForReview] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewActionLoading, setReviewActionLoading] = useState(false);

  // Review Form state
  const [adviserComment, setAdviserComment] = useState("");
  const [hallFeeAmount, setHallFeeAmount] = useState("");
  const [extraFees, setExtraFees] = useState([]);
  const [dueDate, setDueDate] = useState("");
  const [feedbackMsg, setFeedbackMsg] = useState({ text: "", type: "" });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (user?.role === "student") {
        try {
          const reg = await registrationService.getMyRegistration();
          setMyRegistration(reg);
        } catch {
          setMyRegistration(null);
        }

        try {
          const [assigned, catalog] = await Promise.allSettled([
            courseService.getAssignedCourses(),
            courseService.getAllCourses(),
          ]);
          if (assigned.status === "fulfilled") {
            setAssignedData(assigned.value);
            if (assigned.value.semester) setSelectedSemester(assigned.value.semester);
          }
          if (catalog.status === "fulfilled") setAllCourses(catalog.value);
        } catch (e) {
          console.warn("Could not fetch assigned courses", e);
        }
      } else {
        // Faculty / Admin
        const pending = await registrationService.getPendingRegistrations();
        setPendingList(pending);
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Fetch assigned courses dynamically when selectedSemester changes
  useEffect(() => {
    // Only run if not initially loading and user is a student
    if (!loading && user?.role === "student" && selectedSemester) {
      const fetchAssigned = async () => {
        try {
          const assigned = await courseService.getAssignedCourses(selectedSemester);
          setAssignedData(assigned);
        } catch (err) {
          setAssignedData(null);
        }
      };
      fetchAssigned();
    }
  }, [selectedSemester, user, loading]);

  // Student: Submit Registration
  const handleSubmitRegistration = async (e) => {
    e.preventDefault();
    setSubmittingReg(true);
    setFeedbackMsg({ text: "", type: "" });

    try {
      const reg = await registrationService.submitRegistration({
        semester: selectedSemester,
        backlogCourseIds: selectedBacklogIds,
      });
      setMyRegistration(reg);
      setFeedbackMsg({
        text: "Course registration submitted successfully! Your adviser will review and generate the semester fees.",
        type: "success",
      });
    } catch (err) {
      setFeedbackMsg({
        text: err.message || "Failed to submit course registration.",
        type: "error",
      });
    } finally {
      setSubmittingReg(false);
    }
  };

  // Faculty: Open Review Modal
  const openReview = (reg) => {
    setSelectedRegForReview(reg);
    setAdviserComment("");
    setHallFeeAmount("");
    setExtraFees([]);
    // Default due date to 14 days from now
    const twoWeeks = new Date();
    twoWeeks.setDate(twoWeeks.getDate() + 14);
    setDueDate(twoWeeks.toISOString().split("T")[0]);
    setIsReviewModalOpen(true);
  };

  const handleAddExtraFee = () => {
    setExtraFees([...extraFees, { label: "", amount: "" }]);
  };

  const handleRemoveExtraFee = (idx) => {
    setExtraFees(extraFees.filter((_, i) => i !== idx));
  };

  const handleUpdateExtraFee = (idx, field, value) => {
    const updated = [...extraFees];
    updated[idx][field] = value;
    setExtraFees(updated);
  };

  // Faculty: Approve Registration
  const handleApprove = async () => {
    if (!selectedRegForReview) return;
    setReviewActionLoading(true);
    try {
      const formattedExtras = extraFees
        .filter((item) => item.label && item.amount)
        .map((item) => ({ label: item.label, amount: parseFloat(item.amount) }));

      await registrationService.approveRegistration(selectedRegForReview._id, {
        adviserComment,
        hallFeeAmount: hallFeeAmount ? parseFloat(hallFeeAmount) : null,
        extraFees: formattedExtras,
        dueDate: dueDate || null,
      });

      setIsReviewModalOpen(false);
      await loadData();
    } catch (err) {
      alert(err.message || "Failed to approve registration");
    } finally {
      setReviewActionLoading(false);
    }
  };

  // Faculty: Reject Registration
  const handleReject = async () => {
    if (!selectedRegForReview) return;
    if (!adviserComment) {
      alert("Please provide a reason for rejection in the comment box.");
      return;
    }
    setReviewActionLoading(true);
    try {
      await registrationService.rejectRegistration(selectedRegForReview._id, {
        adviserComment,
      });
      setIsReviewModalOpen(false);
      await loadData();
    } catch (err) {
      alert(err.message || "Failed to reject registration");
    } finally {
      setReviewActionLoading(false);
    }
  };

  if (loading) {
    return <PageLoader text="Loading course registration details..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center space-x-2.5">
          <ClipboardList className="w-7 h-7 text-sky-600" />
          <span>
            {user?.role === "student" ? "Semester Course Registration" : "Registration Review Portal"}
          </span>
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {user?.role === "student"
            ? "Submit your academic semester enrollment package and track adviser approval status."
            : "Review pending student semester course registrations, calculate fees, and issue approvals."}
        </p>
      </div>

      {feedbackMsg.text && (
        <div
          className={`p-4 rounded-2xl border flex items-center space-x-3 text-sm animate-in fade-in duration-200 ${
            feedbackMsg.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          {feedbackMsg.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* STUDENT INTERFACE */}
      {user?.role === "student" && (
        <div className="space-y-6">
          {/* Active Registration Status Card */}
          {myRegistration && (
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-xs uppercase font-semibold text-slate-400">Current Status</span>
                  <div className="flex items-center space-x-2 mt-1">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(
                        myRegistration.status
                      )}`}
                    >
                      {getStatusLabel(myRegistration.status)}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      Submitted on {formatDate(myRegistration.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-xs uppercase font-semibold text-slate-400">Semester</span>
                  <p className="text-sm font-bold text-slate-800">
                    Semester {myRegistration.semester} ({myRegistration.academicSession || `Batch '${user?.batch}`})
                  </p>
                </div>
              </div>

              {myRegistration.adviserComment && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                  <span className="font-semibold text-slate-700 block mb-1">Adviser Remark:</span>
                  <p className="text-slate-600 italic">"{myRegistration.adviserComment}"</p>
                </div>
              )}

              {/* Registered Courses Table */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                  Registered Courses ({myRegistration.courseIds?.length || 0} Courses •{" "}
                  {myRegistration.totalCredit} Credits)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {myRegistration.courseIds?.map((c) => (
                    <div
                      key={c._id}
                      className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between"
                    >
                      <div>
                        <span className="font-mono font-bold text-xs text-sky-700 block">
                          {c.courseCode}
                        </span>
                        <span className="text-xs font-semibold text-slate-800">{c.courseName}</span>
                      </div>
                      <span className="text-xs font-bold text-slate-600 bg-white px-2 py-1 rounded border border-slate-200">
                        {c.credit} Cr
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* New Registration Submission Form */}
          {(!myRegistration || myRegistration.status === "rejected") && (
            <form onSubmit={handleSubmitRegistration} className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-6">
              <h3 className="text-lg font-bold text-slate-800">Submit New Registration</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1.5">
                    Target Semester
                  </label>
                  <select
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    {SEMESTERS.map((s) => (
                      <option key={s} value={s}>
                        Semester {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Fixed Batch Courses Preview */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Standard Batch Courses ({assignedData?.courses?.length || 0} Courses)
                </h4>
                {(!assignedData?.courses || assignedData.courses.length === 0) ? (
                  <p className="text-xs text-amber-600 p-3 bg-amber-50 rounded-xl">
                    No course package currently mapped for your batch in this semester.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {assignedData.courses.map((c) => (
                      <div
                        key={c._id}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between"
                      >
                        <div className="truncate pr-2">
                          <span className="font-mono font-bold text-xs text-sky-700 block">
                            {c.courseCode}
                          </span>
                          <span className="text-xs text-slate-700">{c.courseName}</span>
                        </div>
                        <span className="text-xs font-bold text-slate-600">{c.credit} Cr</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Backlog Course Selector */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Optional Backlog / Improvement Courses
                </h4>
                <div className="max-h-48 overflow-y-auto space-y-1.5 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  {allCourses
                    .filter((c) => !assignedData?.courses?.some((ac) => ac._id === c._id))
                    .map((c) => {
                      const isChecked = selectedBacklogIds.includes(c._id);
                      return (
                        <label
                          key={c._id}
                          className="flex items-center space-x-3 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer hover:bg-sky-50 text-xs"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) {
                                setSelectedBacklogIds(selectedBacklogIds.filter((id) => id !== c._id));
                              } else {
                                setSelectedBacklogIds([...selectedBacklogIds, c._id]);
                              }
                            }}
                            className="rounded text-sky-600"
                          />
                          <span className="font-mono font-bold text-sky-700">{c.courseCode}</span>
                          <span className="text-slate-800">{c.courseName}</span>
                          <span className="text-slate-500">({c.credit} Cr)</span>
                        </label>
                      );
                    })}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={submittingReg}
                  className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-sm transition-smooth shadow-sm disabled:opacity-50 flex items-center space-x-2"
                >
                  {submittingReg ? (
                    <span>Submitting...</span>
                  ) : (
                    <>
                      <FileCheck className="w-4 h-4" />
                      <span>Submit for Adviser Approval</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* FACULTY / ADMIN INTERFACE */}
      {user?.role !== "student" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-800">
                Pending Submissions ({pendingList.length})
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-4">Student</th>
                    <th className="py-3.5 px-4">Roll Number</th>
                    <th className="py-3.5 px-4">Department & Batch</th>
                    <th className="py-3.5 px-4">Semester</th>
                    <th className="py-3.5 px-4">Total Credits</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {pendingList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        No pending course registrations awaiting approval.
                      </td>
                    </tr>
                  ) : (
                    pendingList.map((reg) => (
                      <tr key={reg._id} className="hover:bg-slate-50/80 transition-smooth">
                        <td className="py-3.5 px-4 font-semibold text-slate-800">
                          {reg.studentId?.name || "Student"}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-sky-700">
                          {reg.studentId?.rollNo || "N/A"}
                        </td>
                        <td className="py-3.5 px-4">
                          {reg.studentId?.department} • Batch '{reg.studentId?.batch}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs">
                          {reg.semester}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-800">
                          {reg.totalCredit} Cr
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => openReview(reg)}
                            className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-medium transition-smooth"
                          >
                            Review & Bill
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
      )}

      {/* Faculty Review Modal */}
      {selectedRegForReview && (
        <Modal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          title={`Review Registration: ${selectedRegForReview.studentId?.name} (${selectedRegForReview.studentId?.rollNo})`}
        >
          <div className="space-y-5">
            {/* Summary info */}
            <div className="p-4 bg-slate-50 rounded-xl text-xs space-y-1">
              <p>
                <strong>Department:</strong> {selectedRegForReview.studentId?.department} •{" "}
                <strong>Batch:</strong> Batch '{selectedRegForReview.studentId?.batch} •{" "}
                <strong>Semester:</strong> {selectedRegForReview.semester}
              </p>
              <p>
                <strong>Total Credits:</strong> {selectedRegForReview.totalCredit} Credit Hours (
                {selectedRegForReview.courseIds?.length || 0} Courses)
              </p>
            </div>

            {/* Courses list */}
            <div>
              <h4 className="text-xs font-bold uppercase text-slate-600 mb-2">Registered Courses</h4>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {selectedRegForReview.courseIds?.map((c) => (
                  <div
                    key={c._id}
                    className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded-lg text-xs"
                  >
                    <span className="truncate pr-2">
                      <strong className="font-mono text-sky-700">{c.courseCode}</strong> {c.courseName}
                    </span>
                    <span className="text-slate-500 uppercase font-semibold text-[10px]">
                      {c.courseType} ({c.credit} Cr)
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Automated Fee Billing Calculation */}
            <div className="p-4 bg-sky-50/70 border border-sky-200 rounded-xl space-y-2 text-xs">
              <h4 className="font-bold text-sky-900 uppercase">Automatic Fee Assessment</h4>
              <div className="flex justify-between text-slate-700">
                <span>Tuition (৳20 × {Math.ceil(selectedRegForReview.totalCredit || 0)} Cr):</span>
                <span className="font-bold">
                  {formatCurrency(Math.ceil(selectedRegForReview.totalCredit || 0) * 20)}
                </span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Exam Fees (Theory ৳50 / Sessional ৳30):</span>
                <span className="font-bold">
                  {formatCurrency(
                    selectedRegForReview.courseIds?.reduce(
                      (sum, c) => sum + (c.courseType === "theory" ? 50 : 30),
                      0
                    ) || 0
                  )}
                </span>
              </div>
            </div>

            {/* Hall Fee Option */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Hall Fee (Optional)
              </label>
              <input
                type="number"
                placeholder="e.g. 1500"
                value={hallFeeAmount}
                onChange={(e) => setHallFeeAmount(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            {/* Extra Fees */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold uppercase text-slate-600">
                  Custom Extra Fees (e.g. ID Card, Library Fine)
                </label>
                <button
                  type="button"
                  onClick={handleAddExtraFee}
                  className="text-xs text-sky-600 hover:text-sky-700 font-semibold inline-flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Line</span>
                </button>
              </div>

              {extraFees.map((item, idx) => (
                <div key={idx} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    placeholder="Fee Label"
                    value={item.label}
                    onChange={(e) => handleUpdateExtraFee(idx, "label", e.target.value)}
                    className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                  />
                  <input
                    type="number"
                    placeholder="Amount"
                    value={item.amount}
                    onChange={(e) => handleUpdateExtraFee(idx, "amount", e.target.value)}
                    className="w-28 px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveExtraFee(idx)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Payment Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            {/* Adviser Comment */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Adviser Feedback / Comment
              </label>
              <textarea
                rows={2}
                placeholder="Optional notes or rejection reasons..."
                value={adviserComment}
                onChange={(e) => setAdviserComment(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
              ></textarea>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={handleReject}
                disabled={reviewActionLoading}
                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-xl text-xs transition-smooth"
              >
                Reject Registration
              </button>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-600 rounded-xl text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={reviewActionLoading}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs transition-smooth shadow-sm"
                >
                  {reviewActionLoading ? "Approving & Invoicing..." : "Approve & Generate Fees"}
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default RegistrationForm;
