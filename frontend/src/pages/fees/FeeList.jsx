/**
 * File: FeeList.jsx
 * Description: React component rendering the FeeList UI interface.
 * 
 * This file is part of the RUET OneHub Project.
 */

import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import feeService from "../../services/feeService";
import { formatCurrency, formatDate, formatDateTime, getStatusBadge, getStatusLabel } from "../../utils/helpers";
import { PageLoader } from "../../components/common/Loader";
import Modal from "../../components/common/Modal";
import html2pdf from 'html2pdf.js';
import {
  CreditCard,
  Plus,
  CheckCircle2,
  Clock,
  Receipt,
  Download,
  FileDown,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export function FeeList() {
  const location = useLocation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignForm, setAssignForm] = useState({ mode: 'single', rollNo: '', batch: '', department: '', label: '', amount: '', dueDate: '' });
  const [assigning, setAssigning] = useState(false);
  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    setAssigning(true);
    try {
      await feeService.assignFee({ ...assignForm, amount: Number(assignForm.amount) });
      alert('Fee assigned successfully!');
      setIsAssignModalOpen(false);
      setAssignForm({ mode: 'single', rollNo: '', batch: '', department: '', label: '', amount: '', dueDate: '' });
      fetchFees();
    } catch (err) {
      alert(err.response?.data?.error || err.message || 'Failed to assign fee');
    } finally {
      setAssigning(false);
    }
  };
  const [fees, setFees] = useState([]);
  const [activeTab, setActiveTab] = useState("due"); // 'due' | 'paid'

  // Payment Simulator State
  const [selectedFeeToPay, setSelectedFeeToPay] = useState(null);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("bkash");
  const [paying, setPaying] = useState(false);

  // Receipt Modal State
  const [selectedReceiptFee, setSelectedReceiptFee] = useState(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [expandedFeeId, setExpandedFeeId] = useState(null);

  const fetchFees = async () => {
    setLoading(true);
    try {
      const data = await feeService.getMyFees();
      setFees(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
  }, []);

  const dueFees = fees.filter((f) => f.status === "due");
  const paidFees = fees.filter((f) => f.status === "paid");

  const totalDueAmount = dueFees.reduce((sum, f) => sum + (f.amount || 0), 0);
  const totalPaidAmount = paidFees.reduce((sum, f) => sum + (f.amount || 0), 0);

  const handleOpenPayment = (fee) => {
    setSelectedFeeToPay(fee);
    setIsPayModalOpen(true);
  };

  const handleConfirmPayment = async () => {
    if (!selectedFeeToPay) return;
    setPaying(true);
    try {
      const updated = await feeService.payFee(selectedFeeToPay._id, paymentMethod);
      setIsPayModalOpen(false);
      await fetchFees();
      // Open receipt immediately
      setSelectedReceiptFee(updated);
      setIsReceiptModalOpen(true);
    } catch (err) {
      alert(err.message || "Payment simulation failed");
    } finally {
      setPaying(false);
    }
  };

  const [isDownloading, setIsDownloading] = useState(false);

  const downloadPDF = async () => {
    setIsDownloading(true);
    // Give React a tick to update the UI to show loading state
    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      const element = document.getElementById("receipt-pdf-content");
      if (!element) return;

      // Temporarily hide action buttons so they don't appear in PDF if print:hidden fails
      const buttons = element.querySelectorAll('.print\\:hidden');
      buttons.forEach(btn => btn.style.display = 'none');

      const opt = {
        margin: 0.3,
        filename: `Receipt_${selectedReceiptFee?.transactionId || 'Payment'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true,
          logging: false,
          ignoreElements: (node) => node.classList && node.classList.contains('print:hidden')
        },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      };

      await html2pdf().set(opt).from(element).save();

      // Restore buttons
      buttons.forEach(btn => btn.style.display = '');
    } catch (err) {
      console.error("PDF generation failed", err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleOpenReceipt = (fee) => {
    setSelectedReceiptFee(fee);
    setIsReceiptModalOpen(true);
  };

  if (loading) {
    return <PageLoader text="Loading your financial ledger and fee records..." />;
  }


  const currentList = activeTab === "due" ? dueFees : paidFees;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center space-x-2.5">
              <CreditCard className="w-7 h-7 text-sky-600" />
              <span>Student Fee & Payment Center</span>
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Review semester tuition bills, examination charges, hall dues, and process online payments instantly.
            </p>
          </div>
          {user?.role === 'admin' && (
            <button 
              onClick={() => setIsAssignModalOpen(true)}
              className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-sm transition-smooth shadow-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Assign Custom Fee</span>
            </button>
          )}
        </div>

      {user?.role !== 'admin' ? (<>
      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Outstanding Dues
          </span>
          <div className="text-2xl font-bold text-amber-600 mt-2">
            {formatCurrency(totalDueAmount)}
          </div>
          <p className="text-xs text-slate-500 mt-1">{dueFees.length} unpaid bill(s)</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Settled Payments
          </span>
          <div className="text-2xl font-bold text-emerald-600 mt-2">
            {formatCurrency(totalPaidAmount)}
          </div>
          <p className="text-xs text-slate-500 mt-1">{paidFees.length} completed invoice(s)</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Payment Gateway Status
          </span>
          <div className="flex items-center space-x-2 mt-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-base font-bold text-slate-800">Online & Active</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">bKash • Nagad • Rocket • Cards</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab("due")}
          className={`py-3 px-6 text-sm font-semibold border-b-2 transition-smooth flex items-center space-x-2 ${
            activeTab === "due"
              ? "border-sky-600 text-sky-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Pending Invoices ({dueFees.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("paid")}
          className={`py-3 px-6 text-sm font-semibold border-b-2 transition-smooth flex items-center space-x-2 ${
            activeTab === "paid"
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Payment History & Receipts ({paidFees.length})</span>
        </button>
      </div>
      {/* Fee List Cards */}
      <div className="space-y-4">
        {currentList.length === 0 ? (
          <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center">
            <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-700">
              {activeTab === "due" ? "No Pending Fee Invoices" : "No Past Payments Recorded"}
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
              {activeTab === "due"
                ? "You have zero overdue semester fees. All academic charges are cleared."
                : "Your paid fee receipts and transactions will appear here once cleared."}
            </p>
          </div>
        ) : (
          currentList.map((fee) => {
            const isExpanded = expandedFeeId === fee._id;
            return (
              <div
                key={fee._id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-smooth overflow-hidden"
              >
                <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2.5">
                      <span className="text-base font-bold text-slate-800">{fee.label}</span>
                      <span
                        className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${getStatusBadge(
                          fee.status
                        )}`}
                      >
                        {getStatusLabel(fee.status)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1.5">
                      <span>Semester: <strong className="text-slate-700">{fee.semester}</strong></span>
                      {fee.dueDate && (
                        <span>
                          Due Date: <strong className="text-amber-700">{formatDate(fee.dueDate)}</strong>
                        </span>
                      )}
                      {fee.paidAt && (
                        <span>
                          Paid On: <strong className="text-emerald-700">{formatDateTime(fee.paidAt)}</strong>
                        </span>
                      )}
                      {fee.transactionId && (
                        <span className="font-mono text-slate-600">
                          TxID: {fee.transactionId}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block uppercase font-semibold">Amount</span>
                      <span className="text-xl font-bold text-slate-800">
                        {formatCurrency(fee.amount)}
                      </span>
                    </div>

                    {fee.status === "due" ? (
                      <button
                        onClick={() => handleOpenPayment(fee)}
                        className="px-5 py-2.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-xs transition-smooth shadow-sm cursor-pointer"
                      >
                        Pay Now
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenReceipt(fee)}
                        className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded-xl text-xs transition-smooth border border-emerald-200 inline-flex items-center space-x-1.5"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>View Receipt</span>
                      </button>
                    )}

                    {fee.breakdown && fee.breakdown.length > 0 && (
                      <button
                        onClick={() => setExpandedFeeId(isExpanded ? null : fee._id)}
                        className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                        title="Toggle Breakdown Details"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Optional Expandable Breakdown Detail */}
                {isExpanded && fee.breakdown && fee.breakdown.length > 0 && (
                  <div className="px-5 pb-5 pt-2 bg-slate-50 border-t border-slate-100 text-xs">
                    <span className="font-bold text-slate-700 uppercase tracking-wider block mb-2">
                      Course-by-Course Exam Breakdown
                    </span>
                    <div className="space-y-1">
                      {fee.breakdown.map((item, idx) => (
                        <div key={idx} className="flex justify-between py-1 border-b border-slate-200/50 text-slate-600">
                          <span>{item.label}</span>
                          <span className="font-semibold text-slate-800">{formatCurrency(item.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      </>
      ) : (
        <div className="mt-8 p-12 bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center text-center">
          <CreditCard className="w-16 h-16 text-slate-300 mb-4" />
          <h2 className="text-xl font-bold text-slate-800">Fee Assignment Portal Active</h2>
          <p className="text-slate-500 mt-2 max-w-md">Click the "Assign Custom Fee" button at the top right to issue new bills.</p>
        </div>
      )}

      {/* Online Payment Gateway Simulation Modal */}
      {selectedFeeToPay && (
        <Modal
          isOpen={isPayModalOpen}
          onClose={() => setIsPayModalOpen(false)}
          title="RUET Online Payment Gateway"
        >
          <div className="space-y-5">
            <div className="p-4 bg-sky-50/70 border border-sky-200 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs text-sky-700 uppercase font-semibold">Paying For</span>
                <h4 className="text-base font-bold text-sky-950">{selectedFeeToPay.label}</h4>
                <p className="text-xs text-sky-800">Semester: {selectedFeeToPay.semester}</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-sky-700 uppercase font-semibold">Total Payable</span>
                <div className="text-2xl font-bold text-sky-900">
                  {formatCurrency(selectedFeeToPay.amount)}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-2">
                Choose Payment Method
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "bkash", name: "bKash", color: "bg-pink-50 border-pink-300 text-pink-700" },
                  { id: "nagad", name: "Nagad", color: "bg-orange-50 border-orange-300 text-orange-700" },
                  { id: "rocket", name: "Rocket", color: "bg-purple-50 border-purple-300 text-purple-700" },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    disabled={paying}
                    onClick={() => setPaymentMethod(m.id)}
                    className={`p-3 rounded-xl border text-center font-bold text-xs transition-smooth ${
                      paymentMethod === m.id
                        ? `${m.color} ring-2 ring-sky-500`
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs text-slate-600">
              <div className="flex items-center space-x-2 text-slate-800 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>SSL Encrypted University Sandbox Gateway</span>
              </div>
              <p>
                Clicking confirm will simulate payment authorization and generate a permanent university transaction receipt.
              </p>
            </div>

            <div className="pt-3 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsPayModalOpen(false)}
                className="px-4 py-2 border border-slate-300 text-slate-600 font-medium rounded-xl text-xs hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPayment}
                disabled={paying || !paymentMethod}
                className="px-6 py-2.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-xs transition-smooth shadow-sm disabled:opacity-50"
              >
                {paying ? "Processing..." : `Confirm Payment`}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Official Transaction Receipt Modal */}
      {selectedReceiptFee && (
        <Modal
          isOpen={isReceiptModalOpen}
          onClose={() => setIsReceiptModalOpen(false)}
          title="University Payment Receipt"
        >
          <div id="receipt-pdf-content" className="p-6 bg-white border border-slate-200 rounded-2xl space-y-6 print:border-none print:shadow-none print:p-0">
            {/* Header */}
            <div className="flex flex-col items-center justify-center border-b border-slate-200 pb-4">
              <div className="flex items-center space-x-3 mb-2">
                <img src="/ruet-logo.png" alt="RUET Logo" className="w-12 h-12 object-contain" crossOrigin="anonymous" />
                <h2 className="text-lg font-extrabold text-slate-900 tracking-tight text-center leading-tight">
                  RAJSHAHI UNIVERSITY OF ENGINEERING<br/>& TECHNOLOGY
                </h2>
              </div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mt-0.5">
                Central Accounts Office • OneHUB Money Receipt
              </p>
            </div>

            {/* Receipt Body */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Receipt Title</span>
                <span className="font-bold text-slate-800 text-sm">{selectedReceiptFee.label}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block font-medium">Payment Status</span>
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-full border border-emerald-200 inline-block mt-0.5">
                  PAID & VERIFIED
                </span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Transaction Reference</span>
                <span className="font-mono font-bold text-slate-800">
                  {selectedReceiptFee.transactionId || "N/A"}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block font-medium">Payment Date</span>
                <span className="text-slate-800 font-medium">
                  {formatDateTime(selectedReceiptFee.paidAt)}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Academic Semester</span>
                <span className="text-slate-800 font-semibold">{selectedReceiptFee.semester}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block font-medium">Total Paid Amount</span>
                <span className="text-base font-extrabold text-emerald-700">
                  {formatCurrency(selectedReceiptFee.amount)}
                </span>
              </div>
            </div>

            {/* Breakdown detail if exists */}
            {selectedReceiptFee.breakdown && selectedReceiptFee.breakdown.length > 0 && (
              <div className="pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                  Line Items Breakdown
                </span>
                <div className="space-y-1 text-xs">
                  {selectedReceiptFee.breakdown.map((item, idx) => (
                    <div key={idx} className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                      <span>{item.label}</span>
                      <span className="font-semibold text-slate-800">{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stamp & Footer */}
            <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center space-x-1.5 text-emerald-700 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Digitally Authenticated by OneHUB</span>
              </div>
              <div className="flex items-center space-x-2 print:hidden">
                <button
                  onClick={downloadPDF}
                  className="px-3.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg font-medium inline-flex items-center space-x-1 transition-smooth"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium inline-flex items-center space-x-1 transition-smooth"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
            {/* Assign Fee Modal (Admin Only) */}
      {user?.role === 'admin' && (
        <Modal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} title="Assign Custom Fee / Bill">
          <form onSubmit={handleAssignSubmit} className="space-y-4">
            <div className="flex space-x-4 mb-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="radio" checked={assignForm.mode === 'single'} onChange={() => setAssignForm({...assignForm, mode: 'single'})} />
                <span>Specific Student</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="radio" checked={assignForm.mode === 'series'} onChange={() => setAssignForm({...assignForm, mode: 'series'})} />
                <span>Whole Series</span>
              </label>
            </div>

            {assignForm.mode === 'single' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Student Roll Number</label>
                <input type="text" value={assignForm.rollNo} onChange={e => setAssignForm({...assignForm, rollNo: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="e.g. 2103001" required />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Batch / Series</label>
                  <input type="text" value={assignForm.batch} onChange={e => setAssignForm({...assignForm, batch: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Department</label>
                  <input type="text" value={assignForm.department} onChange={e => setAssignForm({...assignForm, department: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" required placeholder="e.g. CSE" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Bill Title (e.g. Library Card)</label>
              <input type="text" value={assignForm.label} onChange={e => setAssignForm({...assignForm, label: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" required />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Amount (৳)</label>
                <input type="number" value={assignForm.amount} onChange={e => setAssignForm({...assignForm, amount: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Due Date</label>
                <input type="date" value={assignForm.dueDate} onChange={e => setAssignForm({...assignForm, dueDate: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" required />
              </div>
            </div>

            <div className="pt-4 flex justify-end space-x-3">
              <button type="button" onClick={() => setIsAssignModalOpen(false)} className="px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-xl text-sm">Cancel</button>
              <button type="submit" disabled={assigning} className="px-6 py-2 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-xl text-sm transition-colors disabled:opacity-50">
                {assigning ? 'Assigning...' : 'Assign Fee'}
              </button>
            </div>
          </form>
        </Modal>
      )}
      </div>
    );
  }

export default FeeList;
