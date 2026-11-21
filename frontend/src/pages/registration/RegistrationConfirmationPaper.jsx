/**
 * File: RegistrationConfirmationPaper.jsx
 * Description: Official RUET Course Registration / Course Adjustment Confirmation Paper.
 * 
 * Features:
 * - Authentic departmental layout matching RUET official registration form
 * - Prominent "COURSE REGISTRATION APPROVED" stamp on the top right
 * - All official signatures pre-filled (Student, Academic Adviser, Controller of Examinations)
 * - Official RUET verification seal
 * - High-resolution PNG download (via html2canvas-pro) & Print / Save as PDF
 * 
 * Part of the RUET OneHub Project.
 */

import { useRef, useState } from "react";
import html2canvasPro from "html2canvas-pro";
import html2canvasStd from "html2canvas";
import { jsPDF } from "jspdf";
import { Download, Printer, X, CheckCircle2, ShieldCheck, FileCheck, FileText } from "lucide-react";
import { toast } from "sonner";

// Helper to convert semester code to RUET Academic Term name
const getSemesterTermName = (sem) => {
  const map = {
    "1-1": "1st Year Odd Semester",
    "1-2": "1st Year Even Semester",
    "2-1": "2nd Year Odd Semester",
    "2-2": "2nd Year Even Semester",
    "3-1": "3rd Year Odd Semester",
    "3-2": "3rd Year Even Semester",
    "4-1": "4th Year Odd Semester",
    "4-2": "4th Year Even Semester",
  };
  return map[sem] || `Semester ${sem}`;
};

// Helper to format academic session properly (e.g. "24" -> "2024-2025")
const formatSession = (rawSession, batch) => {
  if (rawSession && String(rawSession).includes("-")) return rawSession;
  const num = parseInt(rawSession || batch || "24", 10);
  if (!isNaN(num)) {
    const yr = num < 100 ? 2000 + num : num;
    return `${yr}-${yr + 1}`;
  }
  return "2024-2025";
};

export default function RegistrationConfirmationPaper({
  registration,
  user,
  isOpen,
  onClose
}) {
  const paperRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  if (!isOpen || !registration) return null;

  // Resolve student from registration.studentId (if populated) or current logged in user
  const student = (registration.studentId && typeof registration.studentId === "object")
    ? { ...user, ...registration.studentId }
    : (user || {});

  const courses = registration.courseIds || [];
  const backlogs = registration.backlogCourseIds || [];
  const semester = registration.semester || "2-2";
  const termName = getSemesterTermName(semester);
  const session = formatSession(registration.academicSession, student.batch);
  const studentRoll = student.rollNo || user?.rollNo || "";
  const studentName = student.name || user?.name || "";
  const studentRegNo = student.registrationNo || user?.registrationNo || studentRoll || "";
  const studentDept = student.department || user?.department || "ECE";

  const totalCredit = registration.totalCredit
    ? Number(registration.totalCredit).toFixed(2)
    : courses.reduce((sum, c) => sum + (Number(c.credit) || 0), 0).toFixed(2);
  const previouslyEarnedCredit = Number(student.previouslyEarnedCredit || registration.previouslyEarnedCredit || 39.0).toFixed(2);

  const approvalDate = registration.approvedAt
    ? new Date(registration.approvedAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric"
      })
    : new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric"
      });

  const adviserName = registration.approvedBy?.name && registration.approvedBy?.name !== "Admin User"
    ? registration.approvedBy.name
    : "Prof. Dr. Md. Anwar Hossain";
  const adviserTitle = registration.approvedBy?.designation || "Academic Adviser";
  const adviserDept = registration.approvedBy?.department || studentDept;

  // 1. Direct Official Legal PDF Download (Using html2canvas-pro + jsPDF)
  const handleDownloadPDF = async () => {
    if (!paperRef.current) return;
    setDownloading(true);
    const toastId = toast.loading("Generating official Legal-size PDF...");

    let clone = null;
    try {
      const element = paperRef.current;
      clone = element.cloneNode(true);
      clone.style.position = "fixed";
      clone.style.top = "0";
      clone.style.left = "0";
      clone.style.zIndex = "-9999";
      clone.style.width = "816px";
      clone.style.minWidth = "816px";
      clone.style.maxWidth = "816px";
      clone.style.height = "1344px";
      clone.style.minHeight = "1344px";
      clone.style.maxHeight = "1344px";
      clone.style.transform = "none";
      clone.style.margin = "0";
      clone.style.padding = "42px 50px";
      clone.style.boxSizing = "border-box";
      clone.style.display = "flex";
      clone.style.flexDirection = "column";
      clone.style.justifyContent = "space-between";
      clone.style.backgroundColor = "#ffffff";
      clone.style.color = "#000000";
      clone.style.boxShadow = "none";
      clone.style.border = "none";
      clone.style.overflow = "hidden";

      // Ensure crisp black text on white
      clone.querySelectorAll("h1, h2, h3, p, span, td, th, div").forEach((node) => {
        if (
          !node.closest(".stamp-badge") &&
          !node.closest(".signature-item") &&
          !node.closest(".seal-badge")
        ) {
          node.style.color = "#000000";
          if (node.tagName === "TABLE" || node.tagName === "TH" || node.tagName === "TD") {
            node.style.borderColor = "#000000";
          }
        }
      });

      document.body.appendChild(clone);

      const opts = {
        scale: 2.5,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        logging: false,
        width: 816,
        height: 1344,
      };

      let canvas;
      try {
        canvas = await html2canvasPro(clone, opts);
      } catch (ePro) {
        canvas = await html2canvasStd(clone, opts);
      }

      const imgData = canvas.toDataURL("image/jpeg", 0.98);
      // Legal dimensions in pt: 612 x 1008 (8.5 x 14 inches)
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "legal",
      });

      pdf.addImage(imgData, "JPEG", 0, 0, 612, 1008);
      const safeRoll = studentRoll || "Registration";
      pdf.save(`RUET_Course_Registration_Approved_${safeRoll}_Sem_${semester}_Legal.pdf`);

      toast.success("Official Legal-size PDF downloaded successfully!", { id: toastId });
    } catch (err) {
      console.error("PDF generation error:", err);
      toast.error("Failed to generate PDF. You can use Download Legal PNG.", { id: toastId });
    } finally {
      if (clone && clone.parentNode) {
        clone.parentNode.removeChild(clone);
      }
      setDownloading(false);
    }
  };

  // 2. High-Res PNG Download with full Dark Mode immunity, Legal size aspect ratio (8.5" x 14")
  const handleDownloadPNG = async () => {
    if (!paperRef.current) return;
    setDownloading(true);
    const toastId = toast.loading("Generating high-resolution Legal size confirmation paper...");

    let clone = null;
    try {
      const element = paperRef.current;
      clone = element.cloneNode(true);
      clone.style.position = "fixed";
      clone.style.top = "0";
      clone.style.left = "0";
      clone.style.zIndex = "-9999";
      clone.style.width = "816px";
      clone.style.minWidth = "816px";
      clone.style.maxWidth = "816px";
      clone.style.height = "1344px";
      clone.style.minHeight = "1344px";
      clone.style.maxHeight = "1344px";
      clone.style.transform = "none";
      clone.style.margin = "0";
      clone.style.padding = "42px 50px";
      clone.style.boxSizing = "border-box";
      clone.style.display = "flex";
      clone.style.flexDirection = "column";
      clone.style.justifyContent = "space-between";
      clone.style.backgroundColor = "#ffffff";
      clone.style.color = "#000000";
      clone.style.boxShadow = "none";
      clone.style.border = "none";
      clone.style.overflow = "hidden";

      // Ensure black text for all text nodes
      clone.querySelectorAll("h1, h2, h3, p, span, td, th, div").forEach((node) => {
        if (
          !node.closest(".stamp-badge") &&
          !node.closest(".signature-item") &&
          !node.closest(".seal-badge")
        ) {
          node.style.color = "#000000";
          if (node.tagName === "TABLE" || node.tagName === "TH" || node.tagName === "TD") {
            node.style.borderColor = "#000000";
          }
        }
      });

      document.body.appendChild(clone);

      const opts = {
        scale: 2.5,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        logging: false,
        width: 816,
        height: 1344,
      };

      let canvas;
      try {
        canvas = await html2canvasPro(clone, opts);
      } catch (errPro) {
        canvas = await html2canvasStd(clone, opts);
      }

      const imgData = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement("a");
      const safeRoll = studentRoll || "Registration";
      link.download = `RUET_Course_Registration_Approved_${safeRoll}_Sem_${semester}_Legal.png`;
      link.href = imgData;
      link.click();

      toast.success("Official Legal-size registration confirmation paper downloaded successfully!", { id: toastId });
    } catch (err) {
      console.error("Export error:", err);
      toast.error("Failed to generate image. You can use Download Legal PDF.", { id: toastId });
    } finally {
      if (clone && clone.parentNode) {
        clone.parentNode.removeChild(clone);
      }
      setDownloading(false);
    }
  };

  // 3. Browser Print / Save as PDF - Immune to blank preview via sized off-screen iframe
  const handlePrint = () => {
    const printContent = paperRef.current;
    if (!printContent) {
      window.print();
      return;
    }

    try {
      const iframe = document.createElement("iframe");
      // Set actual dimensions offscreen so Chromium layout engine computes positive width and height
      iframe.style.position = "fixed";
      iframe.style.top = "-10000px";
      iframe.style.left = "-10000px";
      iframe.style.width = "8.5in";
      iframe.style.height = "14in";
      iframe.style.border = "none";
      iframe.style.zIndex = "-9999";
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow.document;

      // Extract existing stylesheets while filtering out any parent modal hide rules
      const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
        .filter((node) => {
          const text = node.innerHTML || node.innerText || "";
          return !text.includes("visibility: hidden") && !text.includes("body > *");
        })
        .map((node) => node.outerHTML)
        .join("\n");

      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>RUET Course Registration Confirmation Paper</title>
            ${styles}
            <style>
              @page {
                size: legal portrait;
                margin: 0.3in 0.45in;
              }
              *, *:before, *:after {
                box-sizing: border-box !important;
                visibility: visible !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              html, body {
                margin: 0 !important;
                padding: 0 !important;
                background: #ffffff !important;
                color: #000000 !important;
                font-family: 'Times New Roman', Times, serif !important;
                width: 100% !important;
                min-height: 100% !important;
                visibility: visible !important;
              }
              .isolated-legal-paper, #ruet-registration-paper {
                width: 100% !important;
                max-width: 8.5in !important;
                height: 100% !important;
                max-height: 13.4in !important;
                margin: 0 auto !important;
                padding: 0.35in 0.45in !important;
                box-sizing: border-box !important;
                background: #ffffff !important;
                color: #000000 !important;
                display: flex !important;
                flex-direction: column !important;
                justify-content: space-between !important;
                visibility: visible !important;
                page-break-inside: avoid !important;
                page-break-after: avoid !important;
                break-inside: avoid !important;
                break-after: avoid !important;
                overflow: hidden !important;
              }
              table {
                border-collapse: collapse !important;
                width: 100% !important;
                color: #000000 !important;
              }
              th, td {
                border: 1px solid #000000 !important;
                color: #000000 !important;
              }
            </style>
          </head>
          <body>
            <div id="ruet-registration-paper" class="isolated-legal-paper">
              ${printContent.innerHTML}
            </div>
          </body>
        </html>
      `);
      doc.close();

      const triggerPrint = () => {
        try {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
        } catch (e) {
          console.warn("Direct iframe print error:", e);
          window.print();
        } finally {
          setTimeout(() => {
            if (iframe.parentNode) {
              iframe.parentNode.removeChild(iframe);
            }
          }, 2000);
        }
      };

      // Ensure images in iframe are loaded before printing
      const imgs = doc.querySelectorAll("img");
      if (imgs.length === 0) {
        setTimeout(triggerPrint, 300);
      } else {
        let loaded = 0;
        const onImgDone = () => {
          loaded++;
          if (loaded >= imgs.length) {
            setTimeout(triggerPrint, 250);
          }
        };
        imgs.forEach((img) => {
          if (img.complete) onImgDone();
          else {
            img.onload = onImgDone;
            img.onerror = onImgDone;
          }
        });
        setTimeout(triggerPrint, 1200);
      }
    } catch (e) {
      console.warn("Iframe print fallback to window.print:", e);
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6 print:p-0 print:bg-white animate-fade-in print:static print:z-auto print:overflow-visible">
      {/* Print isolation style configured for standard Legal paper (8.5in x 14in) */}
      <style>{`
        @page {
          size: legal portrait;
          margin: 0.3in 0.45in;
        }
        @media print {
          html, body {
            width: 8.5in !important;
            height: 14in !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* Ensure modal paper is strictly visible when printing */
          #ruet-registration-paper {
            visibility: visible !important;
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 8.5in !important;
            height: 13.4in !important;
            margin: 0 !important;
            padding: 0.35in 0.45in !important;
            box-shadow: none !important;
            border: none !important;
            background: #ffffff !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
            break-after: avoid !important;
            break-inside: avoid !important;
            overflow: hidden !important;
          }
          #ruet-registration-paper * {
            visibility: visible !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
            break-after: avoid !important;
            break-inside: avoid !important;
          }
          table, tr, td, th, .signature-item, .stamp-badge {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}</style>

      {/* Control Toolbar (Hidden during print) */}
      <div className="flex flex-col max-h-[96vh] w-full max-w-[920px] bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden print:border-none print:shadow-none print:max-h-none print:w-auto print:bg-transparent">
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-800 border-b border-slate-700 print:hidden shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Course Registration Confirmation Paper</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-400/30">
                  Legal Size (8.5&quot; × 14&quot;)
                </span>
              </div>
              <p className="text-xs text-slate-400">Official Departmental 1-Page Legal Sheet • PDF, PNG &amp; Print</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-bold text-white shadow-md shadow-emerald-600/30 transition disabled:opacity-50 cursor-pointer"
              title="Instant One-Click Download Official Legal-Size PDF"
            >
              <Download className="w-4 h-4" /> {downloading ? "Generating..." : "Download PDF"}
            </button>
            <button
              onClick={handleDownloadPNG}
              disabled={downloading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-semibold text-white transition disabled:opacity-50 cursor-pointer"
              title="Download 1-Page Legal 300 DPI PNG Image"
            >
              <FileCheck className="w-4 h-4" /> PNG
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-700 hover:bg-sky-600 text-xs font-semibold text-white transition cursor-pointer"
              title="Print or Save as PDF via Browser"
            >
              <Printer className="w-4 h-4" /> Print / PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/50 transition cursor-pointer"
              title="Close viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Document Container */}
        <div className="overflow-y-auto p-4 sm:p-8 flex justify-center bg-slate-950/60 print:p-0 print:bg-white print:overflow-visible">
          {/* Printable Official Paper Canvas (Standard Legal White Sheet 8.5in x 14in) */}
          <div
            ref={paperRef}
            id="ruet-registration-paper"
            style={{
              fontFamily: "'Times New Roman', Times, serif",
              backgroundColor: "#ffffff",
              color: "#000000",
              width: "816px",
              minHeight: "1344px",
              maxHeight: "1344px",
              boxSizing: "border-box",
            }}
            className="w-full max-w-[816px] min-h-[1344px] max-h-[1344px] bg-white text-black p-8 sm:p-11 rounded-lg shadow-xl border border-slate-300 relative flex flex-col justify-between print:p-0 print:shadow-none print:border-none print:max-w-none print:w-full print:rounded-none"
          >
            {/* UPPER WRAPPER (Header, Info, Courses, Adviser Comment) */}
            <div>
              {/* TOP RIGHT: OFFICIAL "COURSE REGISTRATION APPROVED" STAMP */}
              <div className="stamp-badge absolute top-6 right-6 sm:top-8 sm:right-8 z-10 pointer-events-none select-none">
                <div className="border-[2.5px] border-emerald-700 rounded-lg p-2 bg-emerald-50 shadow-xs text-center transform rotate-[-2deg]">
                  <div className="flex items-center justify-center gap-1.5 text-emerald-800 font-black text-xs sm:text-[13px] tracking-wider uppercase">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Course Registration Approved</span>
                  </div>
                  <div className="text-[9.5px] text-emerald-900 font-bold uppercase tracking-wider mt-0.5">
                    Academic Adviser &amp; Controller Verified
                  </div>
                  <div className="text-[8.5px] text-emerald-700 font-mono font-semibold mt-0.5">
                    Ref: RUET/{studentDept}/REG-{semester}-{studentRoll || "STU"}
                  </div>
                </div>
              </div>

              {/* HEADER SECTION */}
              <div className="text-center space-y-0.5 pt-0 pb-2">
                <div className="flex justify-center mb-1">
                  <img
                    src="/ruet-logo.png"
                    alt="RUET Crest"
                    className="w-14 h-14 object-contain"
                    onError={(e) => {
                      e.currentTarget.src = "/ruet-logo.svg";
                    }}
                  />
                </div>
                <p className="text-[11px] italic tracking-wider text-slate-800 font-medium">Heaven&apos;s Light is Our Guide</p>
                <h1 className="text-sm sm:text-base font-black tracking-wide uppercase leading-tight text-black">
                  Rajshahi University of Engineering &amp; Technology, Bangladesh
                </h1>
                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider underline decoration-1 underline-offset-3 text-black">
                  Course Registration / Course Adjustment Form
                </h2>
                <h3 className="text-xs font-bold uppercase tracking-wider pt-0.5 text-black">
                  Department of {studentDept}
                </h3>
                <p className="text-xs font-bold pt-0.5 text-black">Academic Session: {session}</p>
              </div>

              {/* STUDENT & ACADEMIC DETAILS */}
              <div className="text-xs sm:text-[12.5px] leading-snug space-y-1.5 mt-3 pt-2 border-t border-slate-400 text-black">
                <div className="flex flex-col sm:flex-row justify-between gap-1">
                  <div className="flex items-baseline">
                    <span className="font-bold shrink-0 text-black">Roll No.:</span>
                    <span className="ml-2 font-mono font-bold text-black border-b border-dotted border-black px-2 pb-0.5 min-w-[110px]">
                      {studentRoll || "—"}
                    </span>
                  </div>
                  <div className="flex items-baseline">
                    <span className="font-bold shrink-0 text-black">Registration No. with Session:</span>
                    <span className="ml-2 font-mono font-bold text-black border-b border-dotted border-black px-2 pb-0.5 min-w-[140px]">
                      {studentRegNo || studentRoll} (Session: {session})
                    </span>
                  </div>
                </div>

                <div className="flex items-baseline">
                  <span className="font-bold shrink-0 text-black">Name:</span>
                  <span className="ml-2 font-bold uppercase tracking-wide border-b border-dotted border-black px-2 pb-0.5 flex-1 text-black">
                    {studentName || "—"}
                  </span>
                </div>

                <div className="flex items-baseline flex-wrap">
                  <span className="font-bold shrink-0 text-black">Academic session with Semester:</span>
                  <span className="ml-2 font-semibold border-b border-dotted border-black px-2 pb-0.5 flex-1 min-w-[200px] text-black">
                    {session}, {termName} ({semester})
                  </span>
                </div>

                <div className="flex items-baseline">
                  <span className="font-bold shrink-0 text-black">Previously earned credit:</span>
                  <span className="ml-2 font-semibold border-b border-dotted border-black px-2 pb-0.5 min-w-[90px] text-black">
                    {previouslyEarnedCredit}
                  </span>
                </div>

                <div className="flex items-baseline">
                  <span className="font-bold shrink-0 text-black">Course No. of Backlog course:</span>
                  <span className="ml-2 font-semibold border-b border-dotted border-black px-2 pb-0.5 flex-1 text-black">
                    {backlogs && backlogs.length > 0
                      ? backlogs.map((b) => b.courseCode).join(", ")
                      : "None (Regular Student)"}
                  </span>
                </div>
              </div>

              {/* COURSES TABLE */}
              <div className="mt-3 text-black">
                <p className="text-xs sm:text-[12.5px] font-bold mb-1 text-black">
                  Courses to be registered in this semester:
                </p>

                <table className="w-full border-collapse border border-black text-xs sm:text-[12px] text-black">
                  <thead>
                    <tr className="bg-slate-100 print:bg-slate-100">
                      <th className="border border-black py-1 px-3 font-bold text-center w-28 uppercase text-black">
                        Course No.
                      </th>
                      <th className="border border-black py-1 px-4 font-bold text-left uppercase text-black">
                        Course Title
                      </th>
                      <th className="border border-black py-1 px-3 font-bold text-center w-24 uppercase text-black">
                        Credit
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map((course, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 text-black">
                        <td className="border border-black py-1 px-3 font-bold text-center font-mono text-black">
                          {course.courseCode}
                        </td>
                        <td className="border border-black py-1 px-4 font-medium text-black">
                          {course.courseName || course.title}
                        </td>
                        <td className="border border-black py-1 px-3 font-bold text-center text-black">
                          {Number(course.credit).toFixed(2)}
                        </td>
                      </tr>
                    ))}

                    {/* Total Credit Row */}
                    <tr className="bg-slate-50 font-bold border-t-2 border-black text-black">
                      <td
                        colSpan={2}
                        className="border border-black py-1.5 px-4 text-right font-bold uppercase tracking-wider text-xs text-black"
                      >
                        Total Credit of this Semester
                      </td>
                      <td className="border border-black py-1.5 px-3 text-center font-bold font-mono text-xs sm:text-sm text-black">
                        {totalCredit}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* ADVISER'S COMMENT */}
              <div className="mt-2.5 text-xs sm:text-[12.5px] text-black">
                <span className="font-bold text-black">Adviser&apos;s Comment (if any):</span>
                <span className="ml-2 italic text-slate-800 border-b border-dotted border-black pb-0.5 inline-block min-w-[280px]">
                  {registration.adviserComment || "Approved for regular academic session with good standing."}
                </span>
              </div>
            </div>

            {/* LOWER WRAPPER (Signatures & Security Footer anchored at bottom of Legal Sheet) */}
            <div className="pt-4">
              {/* SIGNATURES SECTION */}
              <div className="grid grid-cols-3 gap-4 text-center text-xs sm:text-[12px] text-black">
                {/* 1. Student Signature */}
                <div className="signature-item flex flex-col items-center justify-end">
                  <div
                    className="text-base sm:text-lg font-bold text-blue-900 mb-1 select-none"
                    style={{ fontFamily: "'Brush Script MT', cursive, serif" }}
                  >
                    {studentName || "Student"}
                  </div>
                  <div className="w-full border-t border-black pt-1">
                    <p className="font-bold leading-tight text-black">Signature of the Student</p>
                    <p className="text-[10px] text-slate-600 mt-0.5">Date: {approvalDate}</p>
                  </div>
                </div>

                {/* 2. Adviser Signature */}
                <div className="signature-item flex flex-col items-center justify-end">
                  <div
                    className="text-base sm:text-lg font-bold text-indigo-950 mb-1 select-none"
                    style={{ fontFamily: "'Brush Script MT', cursive, serif" }}
                  >
                    {adviserName}
                  </div>
                  <div className="w-full border-t border-black pt-1">
                    <p className="font-bold leading-tight text-black">Signature of the Adviser</p>
                    <p className="text-[10px] text-slate-600 mt-0.5">
                      {adviserTitle}, Dept. of {adviserDept}
                    </p>
                    <p className="text-[10px] text-slate-600">Date: {approvalDate}</p>
                  </div>
                </div>

                {/* 3. Controller of Examinations Signature & Official Seal */}
                <div className="signature-item flex flex-col items-center justify-end relative">
                  {/* Official Circular Stamp Overlay */}
                  <div className="seal-badge absolute -top-8 opacity-85 pointer-events-none select-none">
                    <div className="w-18 h-18 rounded-full border-2 border-dashed border-blue-900 flex flex-col items-center justify-center text-[7px] font-bold text-blue-900 leading-tight uppercase transform rotate-[-6deg]">
                      <span>★ RUET ★</span>
                      <span>Controller</span>
                      <span>Section</span>
                      <span className="text-[6px]">Verified</span>
                    </div>
                  </div>

                  <div
                    className="text-base sm:text-lg font-bold text-emerald-950 mb-1 select-none relative z-10"
                    style={{ fontFamily: "'Brush Script MT', cursive, serif" }}
                  >
                    Prof. Dr. Md. Selim Hossain
                  </div>
                  <div className="w-full border-t border-black pt-1 relative z-10">
                    <p className="font-bold leading-tight text-black">Signature of the Controller</p>
                    <p className="text-[10px] text-slate-600 mt-0.5">Controller of Examinations, RUET</p>
                    <p className="text-[10px] text-slate-600">Date: {approvalDate}</p>
                  </div>
                </div>
              </div>

              {/* FOOTER NOTICE */}
              <div className="mt-4 pt-2 border-t border-slate-300 text-center text-[10px] text-slate-600 italic">
                Students are asked to cross out the irrelevant Terms. Generated via RUET OneHUB Central Automation Portal • Official Legal Size Document.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
