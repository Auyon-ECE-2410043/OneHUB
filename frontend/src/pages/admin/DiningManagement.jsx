/**
 * File: DiningManagement.jsx
 * Description: Admin & Mess Staff Dining Management interface with Camera-based
 * Real-time Fast QR Scanner, Sub-second Token Verification, Live Counter Feed,
 * and Grand Feast Token tracking.
 * 
 * Part of the RUET OneHub Project.
 */

import React, { useState, useEffect, useRef } from "react";
import {
  Calendar,
  Search,
  CheckCircle,
  XCircle,
  Users,
  Utensils,
  Camera,
  CameraOff,
  Flame,
  Volume2,
  VolumeX,
  Clock,
  Sparkles,
  AlertTriangle,
  QrCode,
  ShieldCheck,
  Check,
} from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import api from "../../services/api";
import { toast } from "sonner";

// Web Audio synthesizer for instant counter beep
const playSound = (type = "success") => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === "success") {
      // Pleasant double beep (880Hz -> 1320Hz)
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(1320, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else {
      // Low buzzer tone (220Hz)
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    }
  } catch (e) {
    // Audio context not allowed or supported
  }
};

export default function DiningManagement() {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Scanner state
  const [scannerActive, setScannerActive] = useState(false);
  const [scanResult, setScanResult] = useState(null); // { success, message, token, reason }
  const [manualTokenId, setManualTokenId] = useState("");
  const [liveServedFeed, setLiveServedFeed] = useState([]);
  const html5QrCodeRef = useRef(null);
  const isScanningRef = useRef(false);

  const fetchTokens = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/dining/admin/tokens?date=${date}`);
      setTokens(res.data.tokens || []);
    } catch (err) {
      toast.error("Failed to load dining records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens();
  }, [date]);

  // Clean up scanner on unmount
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, []);

  // Handle Token Verification (both from camera scanner and manual input)
  const verifyToken = async (rawCode) => {
    if (!rawCode) return;
    try {
      const res = await api.post("/dining/admin/scan", { qrPayload: rawCode });
      const verifiedToken = res.data.token;
      
      if (soundEnabled) playSound("success");
      toast.success("Meal Served!");

      setScanResult({
        success: true,
        message: "Token Verified & Meal Served Successfully!",
        token: verifiedToken,
      });

      // Add to live counter feed
      setLiveServedFeed((prev) => [
        {
          _id: verifiedToken._id,
          name: verifiedToken.studentId?.name || "Student",
          rollNo: verifiedToken.studentId?.rollNo || verifiedToken.studentId?.studentId || "N/A",
          department: verifiedToken.studentId?.department || "ECE",
          mealType: verifiedToken.mealType,
          isGrandFeast: verifiedToken.isGrandFeast,
          time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        },
        ...prev.slice(0, 9),
      ]);

      fetchTokens();
    } catch (err) {
      if (soundEnabled) playSound("error");
      const errData = err.response?.data || {};
      
      if (err.response?.status === 409) {
        setScanResult({
          success: false,
          reason: "ALREADY_USED",
          message: "WARNING: Token Already Redeemed!",
          token: errData.token,
          usedAt: errData.usedAt,
        });
        toast.error("Token already redeemed!");
      } else {
        setScanResult({
          success: false,
          reason: "INVALID",
          message: errData.message || "Invalid or Expired Token.",
        });
        toast.error(errData.message || "Invalid token.");
      }
    }
  };

  // Toggle Camera Scanner
  const toggleScanner = async () => {
    if (scannerActive) {
      if (html5QrCodeRef.current) {
        try {
          await html5QrCodeRef.current.stop();
        } catch (e) {}
      }
      setScannerActive(false);
      isScanningRef.current = false;
    } else {
      setScannerActive(true);
      setTimeout(() => {
        startScanner();
      }, 200);
    }
  };

  const startScanner = async () => {
    try {
      const elementId = "reader-viewport";
      const qrScanner = new Html5Qrcode(elementId);
      html5QrCodeRef.current = qrScanner;

      const config = {
        fps: 15,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      await qrScanner.start(
        { facingMode: "environment" },
        config,
        async (decodedText) => {
          if (isScanningRef.current) return;
          isScanningRef.current = true;

          await verifyToken(decodedText);

          // 1.5s cooldown before scanning next token
          setTimeout(() => {
            isScanningRef.current = false;
          }, 1500);
        },
        () => {
          // Frame scan error (normal when no QR is in frame)
        }
      );
    } catch (err) {
      console.error("Camera start error:", err);
      toast.error("Could not access camera. Ensure camera permission is granted.");
      setScannerActive(false);
    }
  };

  const markUsed = async (id) => {
    try {
      await api.patch(`/dining/admin/tokens/${id}/use`);
      toast.success("Token marked as used!");
      fetchTokens();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update token");
    }
  };

  const lunches = tokens.filter((t) => t.mealType === "Lunch");
  const dinners = tokens.filter((t) => t.mealType === "Dinner");
  const grandFeasts = tokens.filter((t) => t.isGrandFeast || t.mealType === "Grand Feast");
  const totalServed = tokens.filter((t) => t.status === "used").length;

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
              <Utensils className="w-5 h-5" />
            </div>
            <span>Dining & Mess Counter Management</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time counter QR scanner, fast meal token redemption, and Grand Feast monitoring.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Audio toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border transition-colors ${
              soundEnabled
                ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700"
                : "bg-slate-50 dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-800"
            }`}
            title={soundEnabled ? "Mute beep sound" : "Enable beep sound"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Date Picker */}
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent border-none focus:outline-none text-xs font-semibold text-slate-700 dark:text-slate-200"
            />
          </div>

          {/* Toggle QR Scanner Button */}
          <button
            onClick={toggleScanner}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center space-x-2 shadow-xs transition-smooth cursor-pointer ${
              scannerActive
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-sky-600 hover:bg-sky-700 text-white"
            }`}
          >
            {scannerActive ? <CameraOff className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
            <span>{scannerActive ? "Close Scanner" : "Launch QR Scanner"}</span>
          </button>
        </div>
      </div>

      {/* FAST QR SCANNER DRAWER / MODAL */}
      {scannerActive && (
        <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-2xl border border-slate-800 space-y-5 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <span>Fast Mess Counter Scanner</span>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-full">
                    Live Video Feed
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Hold student phone / printed token pass in front of the camera. Scans in under 1 second.
                </p>
              </div>
            </div>

            {/* Manual Token ID input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                verifyToken(manualTokenId);
                setManualTokenId("");
              }}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                placeholder="Or type/paste Token ID..."
                value={manualTokenId}
                onChange={(e) => setManualTokenId(e.target.value)}
                className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono w-48"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold rounded-xl"
              >
                Verify
              </button>
            </form>
          </div>

          {/* Scanner Area & Live Feedback */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Camera Viewport Container */}
            <div className="flex flex-col items-center justify-center">
              <div
                id="reader-viewport"
                className="w-full max-w-[320px] h-[320px] rounded-2xl overflow-hidden bg-black border-2 border-dashed border-sky-500/40 relative flex items-center justify-center shadow-inner"
              ></div>
              <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5">
                <QrCode className="w-3.5 h-3.5 text-sky-400" />
                <span>Center the QR code inside the box</span>
              </p>
            </div>

            {/* Scan Result Feedback Screen */}
            <div className="space-y-4">
              {scanResult ? (
                <div
                  className={`p-5 rounded-2xl border transition-all ${
                    scanResult.success
                      ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-200"
                      : scanResult.reason === "ALREADY_USED"
                      ? "bg-red-950/50 border-red-500/60 text-red-200"
                      : "bg-amber-950/40 border-amber-500/50 text-amber-200"
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {scanResult.success ? (
                      <CheckCircle className="w-8 h-8 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-8 h-8 text-red-400 shrink-0 mt-0.5" />
                    )}

                    <div className="space-y-1.5 flex-1">
                      <h4 className="text-base font-black tracking-wide">
                        {scanResult.message}
                      </h4>

                      {scanResult.token && (
                        <div className="space-y-1 text-xs pt-1 border-t border-white/10">
                          <p>
                            Student:{" "}
                            <strong className="text-white">
                              {scanResult.token.studentId?.name || "Student"}
                            </strong>
                          </p>
                          <p className="font-mono text-[11px] opacity-80">
                            Roll: {scanResult.token.studentId?.rollNo || scanResult.token.studentId?.studentId || "N/A"} •{" "}
                            {scanResult.token.studentId?.department || "ECE"}
                          </p>
                          <p>
                            Meal:{" "}
                            <span className="font-bold text-white">
                              {scanResult.token.mealType}
                            </span>{" "}
                            {scanResult.token.isGrandFeast && (
                              <span className="px-1.5 py-0.5 bg-orange-500 text-white text-[10px] font-bold rounded">
                                GRAND FEAST
                              </span>
                            )}
                          </p>

                          {scanResult.reason === "ALREADY_USED" && scanResult.usedAt && (
                            <p className="text-red-400 font-bold text-xs pt-1">
                              ⚠️ Previously served on:{" "}
                              {new Date(scanResult.usedAt).toLocaleTimeString("en-US")}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-800/40 border border-slate-800 rounded-2xl text-slate-400 space-y-2">
                  <QrCode className="w-10 h-10 mx-auto text-slate-600" />
                  <p className="text-sm font-semibold text-slate-300">Scanner Ready</p>
                  <p className="text-xs text-slate-500">
                    Awaiting next student QR token at the serving counter.
                  </p>
                </div>
              )}

              {/* Live Counter Stream */}
              {liveServedFeed.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
                    <span>Recent Servings (This Session)</span>
                    <span className="text-emerald-400">{liveServedFeed.length} Served</span>
                  </div>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {liveServedFeed.map((item, idx) => (
                      <div
                        key={idx}
                        className="px-3 py-1.5 bg-slate-800/70 border border-slate-700/50 rounded-xl flex items-center justify-between text-xs text-slate-300"
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="font-semibold text-white truncate">{item.name}</span>
                          <span className="font-mono text-[11px] text-slate-400">({item.rollNo})</span>
                        </div>
                        <div className="flex items-center space-x-2 shrink-0">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-700 rounded text-slate-200">
                            {item.mealType}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">{item.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lunch Booked</p>
            <p className="text-2xl font-black text-slate-800 dark:text-white mt-1">{lunches.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Utensils className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dinner Booked</p>
            <p className="text-2xl font-black text-slate-800 dark:text-white mt-1">{dinners.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
            <Utensils className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-orange-500 uppercase tracking-wider">Grand Feast</p>
            <p className="text-2xl font-black text-orange-600 mt-1">{grandFeasts.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
            <Flame className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Total Served</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{totalServed}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* TOKENS TABLE */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="font-bold text-sm text-slate-800 dark:text-slate-200">
            Booked Tokens for {new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} ({tokens.length})
          </div>
          <div className="text-xs text-slate-500">
            Serving Status: <strong>{totalServed}</strong> / {tokens.length}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">Student Details</th>
                <th className="p-4">Meal Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Counter Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500">
                    Loading records...
                  </td>
                </tr>
              ) : tokens.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500">
                    No tokens booked for this date.
                  </td>
                </tr>
              ) : (
                tokens.map((token) => (
                  <tr
                    key={token._id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="p-4">
                      <p className="font-bold text-slate-800 dark:text-slate-200">
                        {token.studentId?.name || "Student"}
                      </p>
                      <p className="text-xs font-mono text-slate-500">
                        Roll: {token.studentId?.rollNo || token.studentId?.studentId || "N/A"} •{" "}
                        {token.studentId?.department || "ECE"}
                      </p>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
                          token.isGrandFeast || token.mealType === "Grand Feast"
                            ? "bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-300"
                            : token.mealType === "Lunch"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                            : "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300"
                        }`}
                      >
                        {token.isGrandFeast && <Flame className="w-3 h-3 text-orange-600" />}
                        <span>{token.mealType}</span>
                        {token.guestTokensCount > 0 && (
                          <span className="text-[10px] ml-1 opacity-80">
                            (+{token.guestTokensCount} guests)
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="p-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                      ৳{token.price}
                    </td>
                    <td className="p-4">
                      {token.status === "active" ? (
                        <span className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
                          <CheckCircle className="w-3.5 h-3.5" /> Active (Unused)
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-slate-400 text-xs font-semibold">
                          <Check className="w-3.5 h-3.5 text-slate-500" /> Served
                          {token.usedAt && (
                            <span className="font-mono text-[10px]">
                              ({new Date(token.usedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })})
                            </span>
                          )}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {token.status === "active" && (
                        <button
                          onClick={() => markUsed(token._id)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-smooth shadow-xs cursor-pointer"
                        >
                          Serve Meal
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
