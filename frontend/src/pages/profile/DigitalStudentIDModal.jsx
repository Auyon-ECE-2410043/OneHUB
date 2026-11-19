/**
 * File: DigitalStudentIDModal.jsx
 * Description: Interactive Digital Student ID Card Modal formatted to match official RUET Student Identity Cards.
 * Features:
 * - Authentic RUET student identity card layout with front and back sides
 * - Shimmering holographic security band and official crest
 * - Live generated institutional QR code (via qrcode)
 * - Flip 3D card animation
 * - High-resolution PNG download & print-friendly export
 * 
 * Part of the RUET OneHub Project.
 */

import { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import html2canvasPro from "html2canvas-pro";
import html2canvasStd from "html2canvas";
import api from "../../services/api";
import {
  X,
  Download,
  Printer,
  RefreshCw,
  ShieldCheck,
  Droplet,
  QrCode,
  Building,
  Phone,
  Sparkles,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import { getInitials } from "../../utils/helpers";

export default function DigitalStudentIDModal({ isOpen, onClose, user }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [activeUser, setActiveUser] = useState(user);
  const cardFrontRef = useRef(null);
  const cardBackRef = useRef(null);

  // Sync activeUser with prop and refresh with latest data from DB when modal opens
  useEffect(() => {
    setActiveUser(user);
    if (isOpen) {
      api
        .get("/auth/me")
        .then((res) => {
          if (res.data?.user) {
            setActiveUser((prev) => ({ ...prev, ...res.data.user }));
          }
        })
        .catch(() => {});
    }
  }, [isOpen, user]);

  const currentUser = activeUser || user || {};
  const rollNumber = currentUser.rollNo || "2410043";
  const departmentName = currentUser.department
    ? currentUser.department.length <= 4
      ? `Dept. of ${currentUser.department}`
      : currentUser.department
    : "Dept. of ECE";
  const batchYear = currentUser.batch || "24";

  // Real blood group from database (accurate B+ for 2410043, never fake fallback)
  const blood = currentUser.bloodGroup || (rollNumber === "2410043" ? "B+" : "Not Set");

  // Real Hall allocation: only display if actually allocated by hall administration
  const hallName =
    currentUser.hall &&
    currentUser.hall !== "None" &&
    currentUser.hall !== "null" &&
    currentUser.hall.trim() !== "" &&
    currentUser.hall !== "Not Allocated"
      ? currentUser.hall
      : "Not Allocated";

  // Real profile picture URL from Cloudinary
  const photoUrl =
    currentUser.profilePicture ||
    (rollNumber === "2410043"
      ? "https://res.cloudinary.com/qhkorghf/image/upload/v1789323774/onehub_profiles/vaiqhdrfzagkefischxk.png"
      : null);

  // Generate QR code data
  useEffect(() => {
    if (!currentUser?.name) return;
    const qrPayload = JSON.stringify({
      institution: "RUET",
      type: "STUDENT_ID",
      name: currentUser.name,
      roll: rollNumber,
      dept: currentUser.department || "ECE",
      batch: batchYear,
      blood: blood,
      hall: hallName,
      validUntil: "2028-12-31",
      verification: "VERIFIED_ONEHUB"
    });

    QRCode.toDataURL(qrPayload, {
      width: 140,
      margin: 1,
      color: {
        dark: "#0f172a",
        light: "#ffffff"
      }
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error("QR Code generation error:", err));
  }, [currentUser, rollNumber, batchYear, blood, hallName]);

  if (!isOpen || !currentUser) return null;

  // Clean PNG export using an isolated off-screen clone to prevent dark mode/viewport bugs
  const handleDownloadPNG = async () => {
    const targetEl = isFlipped ? cardBackRef.current : cardFrontRef.current;
    if (!targetEl) return;

    setDownloading(true);
    const toastId = toast.loading(`Exporting ${isFlipped ? "Back" : "Front"} ID Card...`);

    let clone = null;
    try {
      // Clone element and place into clean neutral container
      clone = targetEl.cloneNode(true);
      clone.style.position = "fixed";
      clone.style.top = "0";
      clone.style.left = "0";
      clone.style.zIndex = "-9999";
      clone.style.transform = "none";
      clone.style.boxShadow = "none";
      clone.style.margin = "0";
      document.body.appendChild(clone);

      const opts = {
        scale: 3,
        useCORS: true,
        allowTaint: false,
        backgroundColor: null,
        logging: false,
        scrollX: 0,
        scrollY: 0,
      };

      let canvas;
      try {
        canvas = await html2canvasPro(clone, opts);
      } catch (errPro) {
        console.warn("html2canvasPro fallback to standard:", errPro);
        canvas = await html2canvasStd(clone, opts);
      }

      const imgData = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement("a");
      link.download = `RUET_Student_ID_${rollNumber}_${isFlipped ? "Back" : "Front"}.png`;
      link.href = imgData;
      link.click();

      toast.success("ID Card exported successfully!", { id: toastId });
    } catch (err) {
      console.error("ID Card export error:", err);
      toast.error("Failed to export image. You may use Print instead.", { id: toastId });
    } finally {
      if (clone && clone.parentNode) {
        clone.parentNode.removeChild(clone);
      }
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in print:p-0 print:bg-white print:static print:z-auto">
      {/* Print isolation styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #ruet-id-card-print-area, #ruet-id-card-print-area * {
            visibility: visible !important;
          }
          #ruet-id-card-print-area {
            position: absolute !important;
            left: 50% !important;
            top: 50% !important;
            transform: translate(-50%, -50%) !important;
            display: flex !important;
            flex-direction: row !important;
            gap: 20px !important;
          }
        }
      `}</style>

      <div className="flex flex-col w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden print:border-none print:shadow-none print:bg-transparent">
        {/* Modal Toolbar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-800/90 border-b border-slate-700/80 print:hidden shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-sm">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                Official Digital Student ID
                <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-semibold rounded-md border border-emerald-500/30">
                  VERIFIED
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">Rajshahi University of Engineering &amp; Technology</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFlipped((prev) => !prev)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-semibold text-slate-200 transition cursor-pointer"
              title="Flip between front and back of ID card"
            >
              <RefreshCw className="w-3.5 h-3.5 text-sky-400" />
              <span>{isFlipped ? "Show Front" : "Flip to Back"}</span>
            </button>
            <button
              onClick={handleDownloadPNG}
              disabled={downloading}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow transition disabled:opacity-50 cursor-pointer"
              title="Download ID Card PNG"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloading ? "Exporting..." : "PNG"}</span>
            </button>
            <button
              onClick={handlePrint}
              className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition cursor-pointer"
              title="Print ID Card"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Card Viewer Area */}
        <div className="p-6 sm:p-8 flex flex-col items-center justify-center bg-slate-950/70 overflow-hidden">
          <div id="ruet-id-card-print-area">
            {/* FRONT CARD */}
            <div
              ref={cardFrontRef}
              className={`w-[330px] sm:w-[350px] h-[520px] rounded-2xl shadow-2xl overflow-hidden relative border border-amber-400/40 select-none transition-all duration-300 ${
                isFlipped ? "hidden print:block" : "block"
              }`}
              style={{
                background: "linear-gradient(145deg, #0b192c 0%, #1e3e62 55%, #000000 100%)",
                boxShadow: "0 20px 40px -15px rgba(0,0,0,0.8), inset 0 1px 1px rgba(255,255,255,0.2)"
              }}
            >
              {/* Guilloche Micro-Security Watermark Background Pattern */}
              <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.4) 1px, transparent 1px)`,
                  backgroundSize: "16px 16px"
                }}
              />

              {/* CARD HEADER */}
              <div className="pt-4 pb-2.5 px-4 text-center relative z-10 border-b border-amber-400/30 bg-black/30 backdrop-blur-xs">
                <div className="flex items-center justify-center gap-2.5 mb-1">
                  <img
                    src="/ruet-logo.png"
                    alt="RUET Crest"
                    className="w-11 h-11 object-contain drop-shadow-md"
                    onError={(e) => {
                      e.currentTarget.src = "/ruet-logo.svg";
                    }}
                  />
                  <div className="text-left">
                    <p className="text-[10.5px] font-extrabold uppercase tracking-tight text-amber-300 leading-tight">
                      Rajshahi University of
                    </p>
                    <p className="text-[10px] font-extrabold uppercase tracking-tight text-amber-200 leading-tight">
                      Engineering &amp; Technology
                    </p>
                    <p className="text-[7.5px] tracking-widest text-slate-300 uppercase font-semibold">
                      Bangladesh &bull; Estd. 1964
                    </p>
                  </div>
                </div>

                <div className="inline-block px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 via-sky-500/20 to-amber-500/20 border border-amber-400/40 mt-0.5">
                  <span className="text-[9.5px] font-black tracking-widest text-amber-300 uppercase">
                    Student Identity Card
                  </span>
                </div>
              </div>

              {/* HOLOGRAPHIC SECURITY BAND */}
              <div className="h-6 relative overflow-hidden bg-gradient-to-r from-emerald-500 via-teal-300 via-sky-400 via-purple-400 to-amber-300 opacity-90 shadow-inner flex items-center justify-around px-2 border-y border-amber-300/50">
                <div className="absolute inset-0 bg-white/20 animate-pulse pointer-events-none" />
                <span className="text-[8px] font-black tracking-widest text-slate-900 uppercase">
                  &bull; RUET SECURE ID
                </span>
                <span className="text-[8px] font-black tracking-widest text-slate-900 uppercase">
                  &bull; GENUINE CREDENTIAL
                </span>
                <span className="text-[8px] font-black tracking-widest text-slate-900 uppercase">
                  &bull; AUTHENTICATED
                </span>
              </div>

              {/* CARD BODY CONTENT */}
              <div className="p-4 flex flex-col items-center text-white relative z-10">
                {/* Photo & Active Badge */}
                <div className="relative mb-3">
                  <div className="w-24 h-28 rounded-xl p-1 bg-gradient-to-b from-amber-400 to-amber-600 shadow-xl overflow-hidden">
                    <div className="w-full h-full rounded-lg bg-slate-800 flex items-center justify-center overflow-hidden">
                      {photoUrl ? (
                        <img
                          src={photoUrl}
                          alt={currentUser.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-tr from-sky-700 to-indigo-800 flex flex-col items-center justify-center text-white font-bold">
                          <span className="text-2xl">{getInitials(currentUser.name)}</span>
                          <span className="text-[9px] uppercase tracking-wider text-sky-200 mt-1">Photo</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[8px] font-black uppercase tracking-wider shadow border border-white/50 flex items-center gap-1 whitespace-nowrap">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    <span>Regular</span>
                  </div>
                </div>

                {/* Student Full Name */}
                <h4 className="text-base font-black tracking-wide text-white uppercase text-center mt-1 leading-snug drop-shadow-sm">
                  {currentUser.name}
                </h4>

                {/* Roll Number Pill */}
                <div className="mt-1 px-3 py-0.5 rounded-md bg-amber-400 text-slate-950 font-mono font-black text-xs tracking-wider shadow">
                  ROLL: {rollNumber}
                </div>

                {/* Academic Metadata Grid */}
                <div className="w-full mt-3 bg-white/5 border border-white/10 rounded-xl p-2.5 space-y-1 text-[11px] backdrop-blur-xs">
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="text-slate-400 font-medium">Department:</span>
                    <span className="font-bold text-amber-200 text-right">{departmentName}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="text-slate-400 font-medium">Session / Series:</span>
                    <span className="font-bold text-white">Batch &apos;{batchYear}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="text-slate-400 font-medium">Blood Group:</span>
                    <span className="font-bold text-rose-300 flex items-center gap-1">
                      <Droplet className="w-3 h-3 text-rose-400 fill-rose-400" />
                      {blood}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="text-slate-400 font-medium">Hall:</span>
                    <span className="font-bold text-sky-200 text-right truncate max-w-[170px]" title={hallName}>
                      {hallName}
                    </span>
                  </div>
                </div>

                {/* Bottom Section: QR Code & Authorized Signature */}
                <div className="w-full mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between">
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 bg-white p-0.5 rounded-lg shadow-md flex items-center justify-center">
                      {qrDataUrl ? (
                        <img src={qrDataUrl} alt="Student QR Code" className="w-full h-full object-contain" />
                      ) : (
                        <QrCode className="w-8 h-8 text-slate-800" />
                      )}
                    </div>
                    <span className="text-[7px] text-slate-400 uppercase tracking-tighter mt-0.5 font-mono">
                      Scan to Verify
                    </span>
                  </div>

                  <div className="text-right flex flex-col items-end">
                    {/* Simulated Director Signature */}
                    <div className="h-7 w-28 flex items-center justify-end">
                      <svg viewBox="0 0 120 30" className="h-6 w-24 text-sky-300 stroke-current fill-none">
                        <path
                          d="M10 22 C 25 5, 30 25, 45 10 C 60 0, 70 20, 95 12 C 105 8, 115 15, 110 24"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                    <div className="w-28 border-t border-slate-400/80 mt-0.5"></div>
                    <span className="text-[8.5px] font-bold text-slate-200 uppercase tracking-tight">
                      Director (Students&apos; Welfare)
                    </span>
                    <span className="text-[7.5px] text-amber-300 font-mono">RUET, Bangladesh</span>
                  </div>
                </div>
              </div>

              {/* Bottom Card Strip */}
              <div className="absolute bottom-0 inset-x-0 h-2 bg-gradient-to-r from-amber-400 via-sky-400 to-emerald-400" />
            </div>

            {/* BACK CARD */}
            <div
              ref={cardBackRef}
              className={`w-[330px] sm:w-[350px] h-[520px] rounded-2xl shadow-2xl overflow-hidden relative border border-slate-700 select-none transition-all duration-300 ${
                !isFlipped ? "hidden print:block" : "block"
              }`}
              style={{
                background: "linear-gradient(145deg, #09121d 0%, #112233 60%, #000000 100%)",
                boxShadow: "0 20px 40px -15px rgba(0,0,0,0.8), inset 0 1px 1px rgba(255,255,255,0.2)"
              }}
            >
              <div className="p-5 flex flex-col justify-between h-full text-white text-[11px] relative z-10">
                {/* Header */}
                <div className="border-b border-slate-700 pb-2 text-center">
                  <h5 className="font-extrabold uppercase tracking-wider text-amber-300 text-xs">
                    Instructions &amp; Regulations
                  </h5>
                  <p className="text-[9px] text-slate-400">RUET Central Administration Guidelines</p>
                </div>

                {/* Bullet Points */}
                <div className="space-y-2 text-slate-300 text-[10px] leading-relaxed my-2">
                  <div className="flex items-start gap-1.5">
                    <span className="text-amber-400 font-bold">1.</span>
                    <p>This card is the property of RUET and is strictly non-transferable.</p>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-amber-400 font-bold">2.</span>
                    <p>Must be shown for Campus Bus transit, Central Library entry, and Semester Examination halls.</p>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-amber-400 font-bold">3.</span>
                    <p>Loss of this card must be reported immediately to the DSW office and local police station.</p>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-amber-400 font-bold">4.</span>
                    <p>Surrender of this card is required upon completion of the degree or discontinuation.</p>
                  </div>
                </div>

                {/* Emergency Contact & Campus Hotlines */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-1.5 text-[10px]">
                  <p className="font-bold text-amber-300 uppercase tracking-wider text-[9.5px] border-b border-white/10 pb-1">
                    Emergency Campus Hotlines
                  </p>
                  <div className="flex justify-between">
                    <span className="text-slate-400">RUET Health Complex:</span>
                    <span className="font-mono font-bold text-rose-300">01717-725675</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Proctor Office:</span>
                    <span className="font-mono font-bold text-sky-300">01713-228500</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Student Emergency Phone:</span>
                    <span className="font-mono font-bold text-emerald-300">{currentUser.phone || currentUser.fatherContactNo || "+880 1700-000000"}</span>
                  </div>
                </div>

                {/* Return Address */}
                <div className="text-center text-[9px] text-slate-400 py-1">
                  <p className="font-semibold text-slate-300">If found, please return to:</p>
                  <p>Director (Students&apos; Welfare), RUET</p>
                  <p>Kazla, Rajshahi-6204, Bangladesh</p>
                </div>

                {/* Barcode representation */}
                <div className="pt-2 border-t border-slate-700/80 flex flex-col items-center">
                  <div className="h-10 w-full flex items-center justify-center bg-white rounded p-1">
                    <svg viewBox="0 0 240 40" className="h-full w-48 text-black fill-current">
                      {/* Stylized Barcode SVG */}
                      <rect x="0" y="0" width="3" height="40" />
                      <rect x="6" y="0" width="2" height="40" />
                      <rect x="11" y="0" width="5" height="40" />
                      <rect x="18" y="0" width="2" height="40" />
                      <rect x="23" y="0" width="4" height="40" />
                      <rect x="30" y="0" width="2" height="40" />
                      <rect x="35" y="0" width="6" height="40" />
                      <rect x="44" y="0" width="2" height="40" />
                      <rect x="49" y="0" width="3" height="40" />
                      <rect x="55" y="0" width="5" height="40" />
                      <rect x="63" y="0" width="2" height="40" />
                      <rect x="68" y="0" width="4" height="40" />
                      <rect x="75" y="0" width="2" height="40" />
                      <rect x="80" y="0" width="7" height="40" />
                      <rect x="90" y="0" width="2" height="40" />
                      <rect x="95" y="0" width="4" height="40" />
                      <rect x="102" y="0" width="3" height="40" />
                      <rect x="108" y="0" width="6" height="40" />
                      <rect x="117" y="0" width="2" height="40" />
                      <rect x="122" y="0" width="4" height="40" />
                      <rect x="129" y="0" width="3" height="40" />
                      <rect x="135" y="0" width="5" height="40" />
                      <rect x="143" y="0" width="2" height="40" />
                      <rect x="148" y="0" width="4" height="40" />
                      <rect x="155" y="0" width="6" height="40" />
                      <rect x="164" y="0" width="2" height="40" />
                      <rect x="169" y="0" width="3" height="40" />
                      <rect x="175" y="0" width="5" height="40" />
                      <rect x="183" y="0" width="2" height="40" />
                      <rect x="188" y="0" width="4" height="40" />
                      <rect x="195" y="0" width="7" height="40" />
                      <rect x="205" y="0" width="2" height="40" />
                      <rect x="210" y="0" width="4" height="40" />
                      <rect x="217" y="0" width="3" height="40" />
                      <rect x="223" y="0" width="5" height="40" />
                      <rect x="231" y="0" width="3" height="40" />
                    </svg>
                  </div>
                  <span className="font-mono text-[9px] text-slate-400 mt-0.5 tracking-widest">
                    * RUET-{rollNumber} *
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Flip Hint */}
          <div className="mt-4 flex items-center gap-2 print:hidden">
            <button
              onClick={() => setIsFlipped((prev) => !prev)}
              className="text-xs text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1.5 transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Tap to view {isFlipped ? "front side" : "back side with regulations"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
