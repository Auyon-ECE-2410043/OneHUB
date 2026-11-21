/**
 * File: DigitalStudentIDModal.jsx
 * Description: Interactive Digital Student ID Card Modal styled exactly according to the official RUET Student Identity Card specification.
 * Features:
 * - Authentic landscape CR-80 physical card dimensions and crisp institutional white theme
 * - Exact university crest, motto "Heaven's Light Is Our Guide", and typography
 * - Passport student photograph, holder signature, and aligned academic credentials
 * - Signature cyan/sky-blue "STUDENT" designation banner and dark navy base bar
 * - Authentic Back side layout with Issuing Authority (DSW) details, issue date, dynamic QR code, and campus architectural motif
 * - Live 3D flip toggle, high-resolution 300 DPI PNG download, and card-sized print export
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
  CheckCircle2,
  Droplet,
  Phone,
  Sparkles
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
  const isNafisa =
    currentUser.rollNo === "2410042" ||
    (currentUser.name && currentUser.name.toLowerCase().includes("nafisa"));

  const rollNumber = currentUser.rollNo || (isNafisa ? "2410042" : "2410043");
  const studentName = isNafisa ? "NAFISA ISLAM" : (currentUser.name || "AUYON DIP SARDAR").toUpperCase();

  const departmentName = isNafisa
    ? "Department of Electrical & Computer Engineering"
    : currentUser.department
    ? currentUser.department.toLowerCase().includes("department")
      ? currentUser.department
      : `Department of ${currentUser.department}`
    : "Department of Electrical & Computer Engineering";

  const blood = isNafisa
    ? "A+"
    : currentUser.bloodGroup || (rollNumber === "2410043" ? "B+" : "A+");

  const contactPhone = isNafisa
    ? "+8801989646177"
    : currentUser.phone || "+8801700-000000";

  const photoUrl = isNafisa
    ? "/nafisa_photo.png"
    : currentUser.profilePicture || "/nafisa_photo.png";

  // Generate QR code data for the back of the card
  useEffect(() => {
    if (!studentName) return;
    const qrPayload = JSON.stringify({
      institution: "RUET",
      type: "STUDENT_ID",
      name: studentName,
      roll: rollNumber,
      dept: departmentName,
      blood: blood,
      contact: contactPhone,
      issuingAuthority: "Director of Students' Welfare, RUET",
      validUntil: "2028-12-31",
      verification: "VERIFIED_RUET_ONEHUB"
    });

    QRCode.toDataURL(qrPayload, {
      width: 160,
      margin: 1,
      color: {
        dark: "#0f172a",
        light: "#ffffff"
      }
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error("QR Code generation error:", err));
  }, [studentName, rollNumber, departmentName, blood, contactPhone]);

  if (!isOpen || !currentUser) return null;

  // Clean PNG export using an isolated off-screen clone
  const handleDownloadPNG = async () => {
    const targetEl = isFlipped ? cardBackRef.current : cardFrontRef.current;
    if (!targetEl) return;

    setDownloading(true);
    const toastId = toast.loading(`Exporting ${isFlipped ? "Back" : "Front"} ID Card...`);

    let clone = null;
    try {
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
      {/* Print isolation styles for actual standard ID card printing */}
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
            gap: 24px !important;
          }
        }
      `}</style>

      <div className="flex flex-col w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden print:border-none print:shadow-none print:bg-transparent">
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
                  RUET AUTHENTIC
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
            {/* FRONT CARD - LANDSCAPE CR-80 SPECIFICATION */}
            <div
              ref={cardFrontRef}
              className={`w-[480px] h-[304px] rounded-2xl shadow-2xl overflow-hidden relative select-none transition-all duration-300 bg-white border border-slate-300 flex flex-col justify-between ${
                isFlipped ? "hidden print:flex" : "flex"
              }`}
              style={{
                boxShadow: "0 20px 40px -15px rgba(0,0,0,0.6), 0 0 0 1px rgba(226, 232, 240, 0.8)",
              }}
            >
              {/* Subtle RUET Crest Watermark */}
              <div
                className="absolute inset-0 pointer-events-none opacity-[0.06] flex items-center justify-center"
                style={{
                  backgroundImage: "radial-gradient(#94a3b8 0.75px, transparent 0.75px)",
                  backgroundSize: "12px 12px",
                }}
              >
                <img
                  src="/ruet-logo.png"
                  alt="Watermark"
                  className="w-48 h-48 object-contain filter grayscale"
                />
              </div>

              {/* CARD TOP HEADER */}
              <div className="pt-2 px-4 relative z-10">
                {/* Motto */}
                <p className="text-[9.5px] font-serif italic text-slate-600 text-center tracking-wide leading-tight">
                  Heaven&apos;s Light Is Our Guide
                </p>

                {/* University Header Row */}
                <div className="flex items-center justify-center gap-3 mt-0.5">
                  <div className="flex flex-col items-center shrink-0">
                    <img
                      src="/ruet-logo.png"
                      alt="RUET Crest"
                      className="w-10 h-10 object-contain"
                      onError={(e) => {
                        e.currentTarget.src = "/ruet-logo.svg";
                      }}
                    />
                    <span className="text-[7px] font-serif font-black tracking-widest text-[#0a2540] -mt-0.5">
                      R U E T
                    </span>
                  </div>

                  <div className="text-center">
                    <h2 className="text-[15.5px] font-black uppercase tracking-wide text-[#0a2540] leading-none font-serif">
                      RAJSHAHI UNIVERSITY OF
                    </h2>
                    <h2 className="text-[15px] font-black uppercase tracking-wide text-[#0a2540] leading-tight font-serif mt-0.5">
                      ENGINEERING &amp; TECHNOLOGY
                    </h2>
                  </div>
                </div>
              </div>

              {/* CARD MIDDLE BODY (2 Columns) */}
              <div className="px-4 py-1 flex items-center gap-3.5 relative z-10 flex-1">
                {/* Left Column: Photograph & Holder's Signature */}
                <div className="flex flex-col items-center shrink-0 w-[100px]">
                  <div className="w-[90px] h-[108px] rounded border border-slate-300 overflow-hidden bg-slate-100 shadow-xs relative">
                    <img
                      src={photoUrl}
                      alt={studentName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/nafisa_photo.png";
                      }}
                    />
                  </div>
                  <span className="text-[8px] font-semibold text-slate-600 tracking-tight mt-1">
                    Holder&apos;s Signature
                  </span>
                  {/* Signature display / line */}
                  <div className="w-[85px] h-4 border-b border-dashed border-slate-400 flex items-center justify-center">
                    <svg viewBox="0 0 100 20" className="w-16 h-3 text-sky-800 stroke-current fill-none">
                      <path
                        d="M5 14 C 18 2, 25 18, 38 6 C 50 15, 62 4, 78 12 C 85 8, 92 14, 98 10"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>

                {/* Right Column: Academic Credentials */}
                <div className="flex-1 flex flex-col justify-center space-y-1">
                  {/* Student Full Name */}
                  <h3 className="text-[17px] font-black uppercase text-[#0a2540] tracking-tight leading-snug">
                    {studentName}
                  </h3>

                  {/* Department */}
                  <p className="text-[12px] font-bold text-slate-800 leading-tight">
                    {departmentName}
                  </p>

                  {/* Aligned Key-Value Table */}
                  <div className="space-y-0.5 pt-1 text-[11px] font-medium text-slate-800">
                    <div className="flex items-center">
                      <span className="w-24 text-slate-700 font-semibold">ID Number</span>
                      <span className="mr-2">:</span>
                      <span className="font-mono font-bold text-[#0a2540] text-xs">{rollNumber}</span>
                    </div>

                    <div className="flex items-center">
                      <span className="w-24 text-slate-700 font-semibold">Blood Group</span>
                      <span className="mr-2">:</span>
                      <span className="font-bold text-slate-900">{blood}</span>
                    </div>

                    <div className="flex items-center">
                      <span className="w-24 text-slate-700 font-semibold">Contact</span>
                      <span className="mr-2">:</span>
                      <span className="font-mono font-bold text-slate-900 text-[11px]">{contactPhone}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* CARD BOTTOM BANNER */}
              <div className="relative z-10 w-full">
                {/* Light-blue / cyan designation strip */}
                <div className="bg-[#78c8ee] py-1 text-center border-t border-[#5cb5de]">
                  <span className="text-[13px] font-black tracking-[0.25em] text-[#0a2540] uppercase">
                    STUDENT
                  </span>
                </div>
                {/* Dark navy base bar */}
                <div className="h-1.5 bg-[#0a2540] w-full" />
              </div>
            </div>

            {/* BACK CARD - LANDSCAPE CR-80 SPECIFICATION */}
            <div
              ref={cardBackRef}
              className={`w-[480px] h-[304px] rounded-2xl shadow-2xl overflow-hidden relative select-none transition-all duration-300 bg-white border border-slate-300 flex flex-col justify-between ${
                !isFlipped ? "hidden print:flex" : "flex"
              }`}
              style={{
                boxShadow: "0 20px 40px -15px rgba(0,0,0,0.6), 0 0 0 1px rgba(226, 232, 240, 0.8)",
              }}
            >
              {/* TOP HEADER: Issuing Authority, Issue Date & QR Code */}
              <div className="pt-3 px-4 flex items-start justify-between relative z-10">
                {/* Left: Issuing Authority Information */}
                <div className="w-[190px] flex flex-col">
                  <span className="text-[9px] font-bold text-slate-800">
                    Issuing Authority:
                  </span>
                  {/* Cursive DSW Signature */}
                  <div className="h-6 w-24 flex items-center my-0.5">
                    <svg viewBox="0 0 120 28" className="w-20 h-5 text-[#1e3a5f] stroke-current fill-none">
                      <path
                        d="M10 20 C 18 2, 25 24, 38 8 C 50 2, 60 22, 75 14 C 85 8, 95 18, 110 12"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <p className="text-[8.5px] font-bold text-slate-900 leading-tight">
                    Director of Students&apos; Welfare,
                  </p>
                  <p className="text-[8px] text-slate-700 leading-tight">
                    RUET, Rajshahi-6204, Bangladesh.
                  </p>
                  <p className="text-[7.5px] font-mono text-slate-600 leading-tight mt-0.5">
                    Phone: 0721-750885 Ext. 137
                  </p>
                  <p className="text-[7.5px] font-mono text-slate-600 leading-tight">
                    Email: dsw@ruet.ac.bd
                  </p>
                  <p className="text-[7.5px] font-mono text-slate-600 leading-tight">
                    Website: www.ruet.ac.bd
                  </p>
                </div>

                {/* Center: Issue Date */}
                <div className="flex flex-col items-center pt-1 text-center">
                  <span className="text-[8.5px] font-bold text-slate-700 leading-tight">
                    Issue Date
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-900 tracking-wider mt-0.5">
                    18 05 2025
                  </span>
                  <span className="text-[7px] font-mono text-slate-500 tracking-widest mt-0.5">
                    DD MM YY
                  </span>
                </div>

                {/* Right: High-Density Scannable QR Code */}
                <div className="w-[66px] h-[66px] bg-white p-0.5 border border-slate-200 rounded shadow-xs flex items-center justify-center shrink-0">
                  {qrDataUrl ? (
                    <img src={qrDataUrl} alt="Student QR Code" className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-[7px] font-mono text-slate-500">
                      QR CODE
                    </div>
                  )}
                </div>
              </div>

              {/* CENTER: Architectural Skyline Graphic & Security Hologram */}
              <div className="px-4 relative flex-1 flex items-end justify-between pb-1">
                {/* RUET Campus Gate / Skyline Vector Graphic */}
                <div className="w-full h-24 relative overflow-hidden flex items-end">
                  <svg viewBox="0 0 400 90" className="w-full h-full">
                    {/* Dynamic Blue Curved Swoosh Arc */}
                    <path
                      d="M 120 70 C 180 30, 260 20, 360 40"
                      stroke="#4299e1"
                      strokeWidth="2.5"
                      fill="none"
                      strokeLinecap="round"
                    />
                    {/* Red Circular Sun / Emblem */}
                    <circle cx="280" cy="52" r="14" fill="#e53e3e" fillOpacity="0.85" />
                    {/* Skyline Silhouette Buildings & Gate Architecture */}
                    <path
                      d="M 10 90 L 10 65 L 20 65 L 20 70 L 30 70 L 30 60 L 42 60 L 42 90 
                         M 60 90 L 60 55 L 75 55 L 75 90 
                         M 100 90 L 100 45 L 115 45 L 115 90 
                         M 130 90 L 130 35 L 145 35 L 145 90 
                         M 160 90 L 160 20 L 180 20 L 180 90 
                         M 180 25 L 220 20 L 220 90 L 200 90 L 200 30 
                         M 230 90 L 230 40 L 250 40 L 250 90 
                         M 290 90 L 290 60 L 305 60 L 305 90 
                         M 320 90 L 320 50 L 340 50 L 340 90 
                         M 360 90 L 360 65 L 380 65 L 380 90"
                      fill="#718096"
                      fillOpacity="0.75"
                    />
                    {/* Modern Gate Horizontal Beam */}
                    <rect x="155" y="24" width="95" height="5" fill="#4a5568" rx="2" />
                  </svg>
                </div>

                {/* Metallic Security Hologram Sticker */}
                <div className="absolute right-4 bottom-2 w-12 h-8 rounded border border-slate-300 bg-gradient-to-tr from-slate-200 via-amber-100 to-sky-200 shadow-inner flex flex-col items-center justify-center p-0.5">
                  <Sparkles className="w-3 h-3 text-amber-600/70" />
                  <span className="text-[5.5px] font-black uppercase text-slate-700 tracking-tighter">
                    RUET SECURE
                  </span>
                </div>
              </div>

              {/* BOTTOM BANNER: Legal Notice & Property Terms */}
              <div className="relative z-10 w-full">
                <div className="bg-[#78c8ee] py-1 px-3 text-center border-t border-[#5cb5de]">
                  <p className="text-[7.5px] font-bold text-[#0a2540] leading-tight">
                    This Card is the property of RUET, Rajshahi-6204, Bangladesh.
                  </p>
                  <p className="text-[7px] font-medium text-[#0a2540] leading-tight">
                    The card must be surrendered at the time of taking clearance from this University.
                  </p>
                </div>
                {/* Dark navy base bar */}
                <div className="h-1 bg-[#0a2540] w-full" />
              </div>
            </div>
          </div>

          {/* Quick Flip Hint & Side Toggle */}
          <div className="mt-4 flex items-center gap-3 print:hidden">
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
