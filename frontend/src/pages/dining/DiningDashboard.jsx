/**
 * File: DiningDashboard.jsx
 * Description: Student Dining & Mess Token Dashboard featuring Wallet Recharge,
 * Digital Meal Coupons, QR Code Token Pass for food counter redemption,
 * and Dedicated Grand Feast / Special Dinner booking with guest tokens.
 * 
 * Part of the RUET OneHub Project.
 */

import React, { useState, useEffect } from "react";
import { 
  Wallet, 
  Utensils, 
  History, 
  ArrowUpRight, 
  ArrowDownRight, 
  CreditCard,
  CheckCircle2,
  Clock,
  Ban,
  Search,
  Filter,
  Ticket,
  X,
  QrCode,
  Flame,
  Users,
  Sparkles,
  Download,
  AlertCircle
} from "lucide-react";
import QRCode from "qrcode";
import { useAuth } from "../../context/AuthContext";
import { getDiningDashboard, purchaseDiningToken, topupDiningWallet } from "../../services/diningApi";
import { toast } from "sonner";

const mockMenu = [
  { id: 1, type: "Lunch", desc: "Rice, Chicken/Fish/Egg, Vorta, Daul.", startTime: "01:00 PM", endTime: "03:00 PM", price: 40, available: true },
  { id: 2, type: "Dinner", desc: "Rice, Chicken/Fish/Egg, Vorta, Daul.", startTime: "08:00 PM", endTime: "10:30 PM", price: 40, available: true }
];

export function DiningDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("purchase");
  const [purchasing, setPurchasing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState({ deposit: 0, withdrawn: 0, balance: 0 });
  const [records, setRecords] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Wallet Topup
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [topupAmount, setTopupAmount] = useState("");
  const [toppingUp, setToppingUp] = useState(false);

  // Grand Feast Booking State
  const [isGrandFeastActive, setIsGrandFeastActive] = useState(true);
  const [guestCount, setGuestCount] = useState(0);
  const [purchasingFeast, setPurchasingFeast] = useState(false);

  // QR Code Pass Modal State
  const [selectedTokenForQR, setSelectedTokenForQR] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState("");

  const fetchDashboard = async () => {
    try {
      const data = await getDiningDashboard();
      setWallet(data.wallet || { deposit: 0, withdrawn: 0, balance: 0 });
      setRecords(data.tokens || []);
    } catch (err) {
      toast.error("Failed to load dining data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Standard Lunch / Dinner purchase
  const handlePurchase = async (type) => {
    setPurchasing(type);
    try {
      const res = await purchaseDiningToken({ mealType: type, date: selectedDate });
      toast.success(`Successfully purchased ${type} token!`);
      if (res.token) {
        setRecords([res.token, ...records]);
        openQRModal(res.token);
      }
      fetchDashboard();
    } catch (err) {
      toast.error(err.response?.data?.error || `Failed to purchase ${type} token`);
    } finally {
      setPurchasing(null);
    }
  };

  // Grand Feast purchase
  const handlePurchaseGrandFeast = async () => {
    setPurchasingFeast(true);
    const totalPrice = 150 * (1 + Number(guestCount));
    try {
      const res = await purchaseDiningToken({
        mealType: "Grand Feast",
        date: selectedDate,
        isGrandFeast: true,
        guestTokensCount: Number(guestCount),
      });
      toast.success(`Grand Feast Token Booked (${1 + Number(guestCount)} passes) for ৳${totalPrice}!`);
      if (res.token) {
        setRecords([res.token, ...records]);
        openQRModal(res.token);
      }
      fetchDashboard();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to book Grand Feast token.");
    } finally {
      setPurchasingFeast(false);
    }
  };

  const handleTopup = async (e) => {
    e.preventDefault();
    if (!topupAmount || topupAmount <= 0) return;
    setToppingUp(true);
    try {
      await topupDiningWallet(topupAmount);
      toast.success("Wallet recharged successfully!");
      setShowTopupModal(false);
      setTopupAmount("");
      fetchDashboard();
    } catch (err) {
      toast.error(err.response?.data?.error || "Recharge failed");
    } finally {
      setToppingUp(false);
    }
  };

  // Open QR Code Pass Modal
  const openQRModal = async (token) => {
    try {
      setSelectedTokenForQR(token);
      const payload = JSON.stringify({
        tokenId: token._id,
        rollNo: user?.rollNo || user?.studentId || "2410042",
        mealType: token.mealType,
        date: token.date,
      });
      const url = await QRCode.toDataURL(payload, {
        width: 320,
        margin: 2,
        color: {
          dark: "#0f172a",
          light: "#ffffff",
        },
      });
      setQrDataUrl(url);
    } catch (err) {
      toast.error("Failed to generate QR code pass.");
    }
  };

  const currentBalance = (wallet.deposit || 0) - (wallet.withdrawn || 0);

  // Check if today already booked Grand Feast
  const isGrandFeastPurchased = records.some(
    (r) =>
      (r.mealType === "Grand Feast" || r.isGrandFeast) &&
      new Date(r.date).toDateString() === selectedDate.toDateString()
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Header & Wallet Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center shadow-xs">
              <Utensils className="w-5 h-5" />
            </div>
            <span>Dining & Mess Portal</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            Book digital dining tokens, manage mess deposit, and redeem meals with Fast QR Scanner.
          </p>
        </div>

        {/* Digital Wallet Card */}
        <div className="flex items-center gap-4 bg-gradient-to-tr from-sky-600 to-indigo-700 text-white px-5 py-3 rounded-2xl shadow-md w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-xs">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-sky-100 block">
                Mess Balance
              </span>
              <span className="text-xl font-black font-mono">
                ৳{currentBalance}
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowTopupModal(true)}
            className="px-3.5 py-1.5 bg-white text-sky-800 hover:bg-sky-50 font-bold rounded-xl text-xs transition-colors shadow-xs cursor-pointer"
          >
            + Recharge
          </button>
        </div>
      </div>

      {/* TABS HEADER */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs overflow-hidden">
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            onClick={() => setActiveTab("purchase")}
            className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              activeTab === "purchase"
                ? "bg-white dark:bg-[#0f172a] text-sky-600 dark:text-sky-400 border-b-2 border-sky-500"
                : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900/50"
            }`}
          >
            <Utensils className="w-4 h-4" />
            Available Menu & Tokens
          </button>
          <button
            onClick={() => setActiveTab("records")}
            className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              activeTab === "records"
                ? "bg-white dark:bg-[#0f172a] text-sky-600 dark:text-sky-400 border-b-2 border-sky-500"
                : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900/50"
            }`}
          >
            <History className="w-4 h-4" />
            My Token Passes ({records.length})
          </button>
        </div>

        <div className="p-6">
          {activeTab === "purchase" ? (
            <div className="space-y-6">
              
              {/* DATE SELECTOR BAR */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                    Dining Meal Selection
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Tokens must be booked at least 2 hours prior to meal serving time.
                  </p>
                </div>
                <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 shrink-0">
                  <button
                    onClick={() => setSelectedDate(new Date())}
                    className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                      selectedDate.toDateString() === new Date().toDateString()
                        ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-xs"
                        : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
                    }`}
                  >
                    Today
                  </button>
                  <button
                    onClick={() =>
                      setSelectedDate(new Date(Date.now() + 86400000))
                    }
                    className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                      selectedDate.toDateString() ===
                      new Date(Date.now() + 86400000).toDateString()
                        ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-xs"
                        : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
                    }`}
                  >
                    Tomorrow
                  </button>
                </div>
              </div>

              {/* DEDICATED GRAND FEAST / SPECIAL DINNER BANNER */}
              <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-red-600 text-white rounded-3xl p-6 shadow-lg border border-orange-400/40 relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-black/25 text-amber-200 text-[10px] font-black uppercase tracking-wider rounded-full flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-amber-300" />
                        <span>University Grand Feast</span>
                      </span>
                      <span className="text-xs text-amber-100 font-semibold">
                        • Special Residential Dinner
                      </span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black text-white">
                      Annual Hall Grand Feast & Gala Dinner
                    </h2>
                    <p className="text-xs text-orange-100 leading-relaxed">
                      <strong>Special Menu:</strong> Shahi Mutton Kacchi Biryani / Special Chicken Roast, Firni, Borhani, Jorda & Cold Drinks.
                    </p>

                    {/* Guest Pass Selector */}
                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      <span className="text-xs font-bold text-amber-100">Guest Passes:</span>
                      {[0, 1, 2, 3, 5].map((count) => (
                        <button
                          key={count}
                          type="button"
                          onClick={() => setGuestCount(count)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            guestCount === count
                              ? "bg-white text-orange-800 shadow-xs scale-105"
                              : "bg-black/20 hover:bg-black/30 text-white"
                          }`}
                        >
                          {count === 0 ? "Self Only" : `+${count} Guest${count > 1 ? "s" : ""}`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price & Book Action */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 bg-black/20 p-4 rounded-2xl border border-white/10 shrink-0">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] uppercase font-bold text-orange-200 block">
                        Total for {1 + Number(guestCount)} Pass{guestCount > 0 ? "es" : ""}
                      </span>
                      <span className="text-2xl sm:text-3xl font-black font-mono text-white">
                        ৳{150 * (1 + Number(guestCount))}
                      </span>
                    </div>

                    <button
                      onClick={handlePurchaseGrandFeast}
                      disabled={
                        purchasingFeast ||
                        isGrandFeastPurchased ||
                        currentBalance < 150 * (1 + Number(guestCount))
                      }
                      className={`px-5 py-2.5 rounded-xl text-xs font-black shadow-md transition-all cursor-pointer ${
                        isGrandFeastPurchased
                          ? "bg-emerald-500 text-white"
                          : "bg-white text-orange-800 hover:bg-amber-50 disabled:opacity-50"
                      }`}
                    >
                      {isGrandFeastPurchased ? (
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" /> Booked
                        </span>
                      ) : purchasingFeast ? (
                        "Booking..."
                      ) : currentBalance < 150 * (1 + Number(guestCount)) ? (
                        "Recharge Needed"
                      ) : (
                        `Book Grand Feast`
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* STANDARD LUNCH AND DINNER CARDS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {mockMenu.map((m) => {
                  const isPurchased = records.some(
                    (r) =>
                      r.mealType === m.type &&
                      new Date(r.date).toDateString() === selectedDate.toDateString()
                  );

                  return (
                    <div
                      key={m.id}
                      className={`border ${
                        isPurchased
                          ? "border-emerald-500/50 bg-emerald-50/20 dark:bg-emerald-900/10"
                          : "border-slate-200 dark:border-slate-700"
                      } rounded-2xl p-5 hover:border-sky-300 transition-all flex flex-col justify-between bg-slate-50/50 dark:bg-slate-900/20`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                              m.type === "Lunch"
                                ? "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400"
                                : "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400"
                            }`}
                          >
                            <Utensils className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 dark:text-slate-100 text-base">
                              {m.type}
                            </h4>
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                              <Clock className="w-3.5 h-3.5" />
                              {m.startTime} - {m.endTime}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-black text-slate-800 dark:text-slate-100 font-mono">
                            ৳{m.price}
                          </span>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700/50 mb-4 flex-grow">
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                          {m.desc}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handlePurchase(m.type)}
                          disabled={
                            purchasing === m.type ||
                            isPurchased ||
                            currentBalance < m.price
                          }
                          className={`flex-1 py-2.5 rounded-xl font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                            isPurchased
                              ? "bg-emerald-600 text-white"
                              : "bg-sky-600 hover:bg-sky-700 text-white disabled:opacity-50"
                          }`}
                        >
                          {isPurchased ? (
                            <>
                              <CheckCircle2 className="w-4 h-4" /> Purchased • Show Pass
                            </>
                          ) : purchasing === m.type ? (
                            "Processing..."
                          ) : currentBalance < m.price ? (
                            "Recharge Needed"
                          ) : (
                            `Cut ${m.type} Token @ ৳${m.price}`
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          ) : (
            /* TAB 2: MY TOKEN PASSES & QR CODES */
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                {records.length === 0 ? (
                  <div className="py-12 text-center text-slate-500">
                    <History className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                    <p className="text-sm font-semibold">No dining tokens purchased yet.</p>
                  </div>
                ) : (
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400">
                      <tr>
                        <th className="px-4 py-3">Meal Category</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Price</th>
                        <th className="px-4 py-3 text-right">QR Pass</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                      {records.map((r) => (
                        <tr
                          key={r._id}
                          className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                        >
                          <td className="px-4 py-3 font-bold">
                            <span className="flex items-center gap-1.5">
                              {r.isGrandFeast && <Flame className="w-3.5 h-3.5 text-orange-500" />}
                              <span>{r.mealType}</span>
                              {r.guestTokensCount > 0 && (
                                <span className="text-[10px] text-orange-600 dark:text-orange-400 font-semibold">
                                  (+{r.guestTokensCount} guests)
                                </span>
                              )}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-500 dark:text-slate-400 font-medium">
                            {new Date(r.date).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>
                          <td className="px-4 py-3">
                            {r.status === "used" && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold">
                                <CheckCircle2 className="w-3 h-3" /> Served
                              </span>
                            )}
                            {r.status === "active" && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400 text-[11px] font-bold">
                                <Ticket className="w-3 h-3" /> Active (Unused)
                              </span>
                            )}
                            {r.status === "expired" && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-[11px] font-bold">
                                <Ban className="w-3 h-3" /> Expired
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-bold">
                            ৳{r.price}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => openQRModal(r)}
                              className="px-3 py-1 bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 hover:bg-sky-100 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                              <span>QR Pass</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: QR Token Pass */}
      {selectedTokenForQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-sm border border-slate-200 dark:border-slate-800 overflow-hidden text-center p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Official RUET Dining Pass
              </span>
              <button
                onClick={() => setSelectedTokenForQR(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-800 dark:text-white">
                {selectedTokenForQR.mealType} Token Pass
              </h3>
              <p className="text-xs text-slate-500">
                {new Date(selectedTokenForQR.date).toLocaleDateString("en-GB", {
                  weekday: "long",
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>

            {/* Generated QR Image */}
            <div className="p-4 bg-white rounded-2xl border-2 border-dashed border-slate-200 shadow-inner flex justify-center">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Token QR Code"
                  className="w-52 h-52 object-contain"
                />
              ) : (
                <div className="w-52 h-52 flex items-center justify-center text-slate-400">
                  Generating QR...
                </div>
              )}
            </div>

            {/* Student particulars snapshot */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs space-y-1 text-left font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Student:</span>
                <strong className="text-slate-800 dark:text-white font-sans">{user?.name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Roll No:</span>
                <span className="text-sky-600 font-bold">{user?.rollNo || "2410042"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Token ID:</span>
                <span className="text-[10px] truncate max-w-[160px] text-slate-500">
                  {selectedTokenForQR._id}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Status:</span>
                <span
                  className={`font-bold ${
                    selectedTokenForQR.status === "used"
                      ? "text-slate-400"
                      : "text-emerald-600"
                  }`}
                >
                  {selectedTokenForQR.status === "used" ? "REDEEMED" : "ACTIVE / VALID"}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 italic">
              Show this QR code at the dining counter scanner to receive your meal in &lt;1 second.
            </p>
          </div>
        </div>
      )}

      {/* MODAL: Wallet Topup */}
      {showTopupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
            <div className="flex justify-between items-center p-5 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-base flex items-center gap-2 text-slate-800 dark:text-slate-100">
                <CreditCard className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                <span>Recharge Dining Wallet</span>
              </h3>
              <button
                onClick={() => setShowTopupModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleTopup} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Amount to Recharge (৳)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
                    ৳
                  </span>
                  <input
                    type="number"
                    value={topupAmount}
                    onChange={(e) => setTopupAmount(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-base font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                    placeholder="e.g. 500"
                    min="10"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowTopupModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={toppingUp}
                  className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-50 rounded-xl shadow-xs"
                >
                  {toppingUp ? "Processing..." : "Recharge Now"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DiningDashboard;
