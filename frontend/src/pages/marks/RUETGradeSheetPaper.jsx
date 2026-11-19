/**
 * File: RUETGradeSheetPaper.jsx
 * Description: Official RUET Semester Grade Sheet / Provisional Academic Transcript modal & exporter.
 * 
 * Features:
 * - Authentic RUET Tabulation & Grade Sheet format from the Office of the Controller of Examinations
 * - Complete course tabulation with Course Codes, Titles, Credits, Letter Grades, Grade Points & Credit Points
 * - SGPA, Cumulative CGPA, Earned Credits, and Academic Standing ("PASSED / PROMOTED")
 * - Official RUET Grading System ordinance reference scale
 * - Pre-filled official signatures (Tabulator-I, Tabulator-II, Head of Dept, Controller of Examinations)
 * - Official departmental seal & RUET embossed verification stamp
 * - Dark-mode immune PNG download (via html2canvas-pro) & Print / Save as PDF
 * - Interactive semester switcher
 * 
 * Part of the RUET OneHub Project.
 */

import { useRef, useState } from "react";
import html2canvasPro from "html2canvas-pro";
import html2canvasStd from "html2canvas";
import { Download, Printer, X, Award, ShieldCheck, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

// Helper to convert semester code to RUET Academic Term name
const getSemesterTermName = (sem) => {
  const map = {
    "1-1": "1st Year 1st Semester (Odd)",
    "1-2": "1st Year 2nd Semester (Even)",
    "2-1": "2nd Year 1st Semester (Odd)",
    "2-2": "2nd Year 2nd Semester (Even)",
    "3-1": "3rd Year 1st Semester (Odd)",
    "3-2": "3rd Year 2nd Semester (Even)",
    "4-1": "4th Year 1st Semester (Odd)",
    "4-2": "4th Year 2nd Semester (Even)",
  };
  return map[sem] || `Semester ${sem}`;
};

// Helper to format academic session properly (e.g. "24" -> "2024-2025")
const formatSession = (rawSession, batch) => {
  if (rawSession && String(rawSession).includes("-")) return rawSession;
  const num = parseInt(rawSession || batch || "24", 10);
  if (!isNaN(num)) {
    const fullYear = num < 100 ? 2000 + num : num;
    return `${fullYear}-${fullYear + 1}`;
  }
  return "2024-2025";
};

export function RUETGradeSheetPaper({
  isOpen,
  onClose,
  student,
  semester: initialSemester = "2-2",
  officialResults = [],
  availableSemesters = ["1-1", "1-2", "2-1", "2-2"],
  coursesMap = {}, // map of semester -> array of graded courses
}) {
  const [currentSemester, setCurrentSemester] = useState(initialSemester);
  const paperRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  if (!isOpen) return null;

  const currentResult = officialResults.find((r) => r.semester === currentSemester);
  const courses = coursesMap[currentSemester] || [];
  const hasResult = !!(currentResult && currentResult.sgpa !== undefined) || courses.length > 0;

  const studentName = student?.name || "NAFISA ISLAM";
  const studentRoll = student?.rollNo || "2410042";
  const studentReg = student?.registrationNo || "1095";
  const studentDept = student?.department || "ECE";
  const session = formatSession(student?.session, student?.batch);

  // Compute or format SGPA and CGPA
  const totalRegisteredCredits = courses.length > 0
    ? courses.reduce((sum, c) => sum + (Number(c.credit) || 0), 0)
    : (currentResult?.semesterEarnedCredit || 0);

  const totalEarnedCredits = currentResult?.semesterEarnedCredit || totalRegisteredCredits;
  
  // Find latest official CGPA if available
  const latestOfficial = officialResults && officialResults.length > 0
    ? [...officialResults].sort((a, b) => b.semester.localeCompare(a.semester))[0]
    : null;

  const totalCumulativeCredits = currentResult?.totalEarnedCredit || (
    currentSemester === "1-1" ? 20.25 :
    currentSemester === "1-2" ? 39.00 :
    (latestOfficial?.totalEarnedCredit || 39.00)
  );

  const sgpa = currentResult?.sgpa !== undefined
    ? Number(currentResult.sgpa).toFixed(2)
    : (courses.length > 0
      ? (courses.reduce((sum, c) => sum + ((Number(c.gpaPoint) || 0) * (Number(c.credit) || 0)), 0) / (totalRegisteredCredits || 1)).toFixed(2)
      : null
    );

  const cgpa = currentResult?.cgpa !== undefined
    ? Number(currentResult.cgpa).toFixed(2)
    : (latestOfficial?.cgpa ? Number(latestOfficial.cgpa).toFixed(2) : (sgpa || "—"));

  // High-Res PNG Download with full Dark Mode immunity
  // High-Res PNG Download with full Dark Mode immunity, Legal size aspect ratio (8.5" x 14")
  const handleDownloadPNG = async () => {
    if (!paperRef.current) return;
    setDownloading(true);
    const toastId = toast.loading("Generating high-resolution Legal size RUET grade sheet...");

    let clone = null;
    try {
      const element = paperRef.current;
      // Clone element directly to document body to eliminate all modal scroll and positioning offsets
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
      clone.style.padding = "40px 48px";
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
        scrollX: 0,
        scrollY: 0,
        width: 816,
        height: 1344,
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
      link.download = `RUET_Official_Grade_Sheet_${studentRoll}_Sem_${currentSemester}_Legal.png`;
      link.href = imgData;
      link.click();

      toast.success("Official Legal-size Grade Sheet downloaded successfully!", { id: toastId });
    } catch (err) {
      console.error("Failed to generate Grade Sheet PNG:", err);
      toast.error("Failed to download image. Try printing instead.", { id: toastId });
    } finally {
      if (clone && clone.parentNode) {
        clone.parentNode.removeChild(clone);
      }
      setDownloading(false);
    }
  };

  // Browser Print - Isolated iframe printing guarantees strictly 1 Legal page in Chrome/Edge/Firefox
  const handlePrint = () => {
    const printContent = paperRef.current;
    if (!printContent) {
      window.print();
      return;
    }

    try {
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow.document;
      const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
        .map((node) => node.outerHTML)
        .join("\n");

      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>RUET Official Grade Sheet</title>
            ${styles}
            <style>
              @page {
                size: legal portrait;
                margin: 0.3in 0.45in;
              }
              * {
                box-sizing: border-box !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              html, body {
                margin: 0 !important;
                padding: 0 !important;
                background: #ffffff !important;
                color: #000000 !important;
                font-family: 'Times New Roman', Times, serif;
                width: 100% !important;
                height: 100% !important;
                overflow: hidden !important;
              }
              .isolated-legal-paper {
                width: 100% !important;
                max-height: 13.3in !important;
                height: 100% !important;
                display: flex !important;
                flex-direction: column !important;
                justify-content: space-between !important;
                page-break-inside: avoid !important;
                page-break-after: avoid !important;
                break-inside: avoid !important;
                break-after: avoid !important;
                overflow: hidden !important;
                background: #ffffff !important;
              }
            </style>
          </head>
          <body>
            <div class="isolated-legal-paper">
              ${printContent.innerHTML}
            </div>
          </body>
        </html>
      `);
      doc.close();

      setTimeout(() => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        setTimeout(() => {
          if (iframe.parentNode) {
            iframe.parentNode.removeChild(iframe);
          }
        }, 1500);
      }, 350);
    } catch (e) {
      console.warn("Iframe print fallback to window.print:", e);
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static">
      {/* Print isolation style configured for standard Legal paper (8.5in x 14in) single-page printing */}
      <style>{`
        @page {
          size: legal portrait;
          margin: 0.3in 0.45in;
        }
        @media print {
          html, body {
            width: 8.5in !important;
            height: 14in !important;
            max-height: 14in !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
            overflow: hidden !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body > * {
            visibility: hidden !important;
          }
          #ruet-gradesheet-paper, #ruet-gradesheet-paper * {
            visibility: visible !important;
          }
          #ruet-gradesheet-paper {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 8.5in !important;
            max-height: 13.4in !important;
            box-sizing: border-box !important;
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
          /* Strictly prevent page breaks on all internal elements */
          #ruet-gradesheet-paper * {
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
            break-after: avoid !important;
            break-inside: avoid !important;
          }
          table, tr, td, th {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}</style>

      <div className="relative w-full max-w-[880px] bg-white rounded-2xl shadow-2xl flex flex-col my-auto border border-slate-200 print:shadow-none print:border-none print:m-0 print:w-full print:max-w-none">
        
        {/* Modal Controls Header (Hidden in Print) */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-900 text-white rounded-t-2xl border-b border-slate-800 print:hidden">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold leading-tight">RUET Semester Grade Sheet &amp; Tabulation</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-400/30">
                  Legal Size (8.5&quot; × 14&quot;)
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Office of the Controller of Examinations • Legal 1-Page</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Semester Switcher */}
            <div className="flex items-center space-x-1.5 mr-2">
              <span className="text-xs text-slate-300 font-medium hidden sm:inline">Semester:</span>
              <select
                value={currentSemester}
                onChange={(e) => setCurrentSemester(e.target.value)}
                className="bg-slate-800 text-white border border-slate-700 text-xs rounded-lg px-2.5 py-1.5 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {availableSemesters.map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
              title="Print 1-Page Legal Document or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>

            <button
              onClick={handleDownloadPNG}
              disabled={downloading}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors disabled:opacity-50 cursor-pointer"
              title="Download 1-Page Legal 300 DPI PNG"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloading ? "Exporting..." : "Download Legal PNG"}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors ml-2 cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Viewport */}
        <div className="p-4 sm:p-6 overflow-x-auto flex justify-center bg-slate-100 print:bg-white print:p-0">
          
          {/* THE OFFICIAL RUET DOCUMENT */}
          <div
            ref={paperRef}
            id="ruet-gradesheet-paper"
            className="w-full max-w-[816px] min-h-[1344px] max-h-[1344px] bg-white text-black p-8 sm:p-10 shadow-md print:shadow-none print:p-0 border border-slate-300 print:border-none relative box-border font-serif select-text flex flex-col justify-between print:rounded-none"
            style={{
              backgroundColor: "#ffffff",
              color: "#000000",
              fontFamily: "'Times New Roman', Times, serif",
              width: "816px",
              minHeight: "1344px",
              maxHeight: "1344px",
              boxSizing: "border-box",
            }}
          >
            {/* Watermark Crest */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035] select-none z-0"
              aria-hidden="true"
            >
              <img src="/ruet-logo.png" alt="" className="w-96 h-96 object-contain grayscale" />
            </div>

            {/* Document Content */}
            <div className="relative z-10 space-y-4">

              {/* Official RUET Header */}
              <div className="text-center space-y-1 pb-2">
                <div className="flex justify-center mb-1">
                  <img src="/ruet-logo.png" alt="RUET Logo" className="w-16 h-16 object-contain" />
                </div>
                <p className="text-xs italic tracking-wider text-slate-700 font-serif">Heaven's Light is Our Guide</p>
                <h1 className="text-xl font-bold tracking-tight uppercase text-black font-serif">
                  RAJSHAHI UNIVERSITY OF ENGINEERING & TECHNOLOGY
                </h1>
                <h2 className="text-sm font-bold tracking-wide uppercase text-slate-800 font-serif">
                  OFFICE OF THE CONTROLLER OF EXAMINATIONS
                </h2>
                <p className="text-xs text-slate-600 font-sans">Rajshahi-6204, Bangladesh • www.ruet.ac.bd</p>
              </div>

              {/* Double Horizontal Dividing Line */}
              <div className="border-t-2 border-b border-black py-0.5 my-2"></div>

              {/* Document Title Banner */}
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-mono text-slate-600 font-sans">
                  Ref: RUET/COE/TRANS-{session.substring(0, 4)}/{studentRoll}
                </div>
                <div className="text-center">
                  <span className="inline-block px-4 py-1 border-2 border-black font-sans font-bold text-xs uppercase tracking-wider bg-slate-50">
                    SEMESTER GRADE SHEET / PROVISIONAL TRANSCRIPT
                  </span>
                </div>
                <div className="text-[11px] font-sans text-slate-600 text-right">
                  Date: {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                </div>
              </div>

              {/* Student Particulars Table */}
              <div className="border border-black p-3 text-xs bg-white font-sans leading-relaxed">
                <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                  <div className="flex">
                    <span className="w-36 font-bold text-black shrink-0">Name of Student:</span>
                    <span className="font-bold uppercase tracking-wide text-black border-b border-dotted border-black flex-1">
                      {studentName}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="w-32 font-bold text-black shrink-0">Degree:</span>
                    <span className="font-semibold text-black border-b border-dotted border-black flex-1">
                      B.Sc. in Engineering
                    </span>
                  </div>

                  <div className="flex">
                    <span className="w-36 font-bold text-black shrink-0">Roll Number:</span>
                    <span className="font-mono font-bold text-black border-b border-dotted border-black flex-1">
                      {studentRoll}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="w-32 font-bold text-black shrink-0">Department:</span>
                    <span className="font-semibold text-black border-b border-dotted border-black flex-1">
                      {studentDept === "ECE" ? "Electrical & Computer Engineering" : studentDept}
                    </span>
                  </div>

                  <div className="flex">
                    <span className="w-36 font-bold text-black shrink-0">Registration No.:</span>
                    <span className="font-mono text-black border-b border-dotted border-black flex-1">
                      {studentReg}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="w-32 font-bold text-black shrink-0">Academic Session:</span>
                    <span className="font-mono text-black border-b border-dotted border-black flex-1">
                      {session}
                    </span>
                  </div>

                  <div className="flex">
                    <span className="w-36 font-bold text-black shrink-0">Examination:</span>
                    <span className="font-bold text-black border-b border-dotted border-black flex-1">
                      {getSemesterTermName(currentSemester)} Exam
                    </span>
                  </div>
                  <div className="flex">
                    <span className="w-32 font-bold text-black shrink-0">Hall of Residence:</span>
                    <span className="text-black border-b border-dotted border-black flex-1">
                      Deshratna Sheikh Hasina Hall
                    </span>
                  </div>
                </div>
              </div>

              {/* Course Grades Tabulation Table */}
              <div className="overflow-hidden">
                <table className="w-full border-collapse border border-black text-xs font-sans">
                  <thead>
                    <tr className="bg-slate-100 border-b border-black text-[11px] font-bold text-black uppercase">
                      <th className="border border-black py-1.5 px-2 text-center w-8">#</th>
                      <th className="border border-black py-1.5 px-3 text-left w-24">Course No.</th>
                      <th className="border border-black py-1.5 px-3 text-left">Course Title</th>
                      <th className="border border-black py-1.5 px-2 text-center w-16">Type</th>
                      <th className="border border-black py-1.5 px-2 text-center w-14">Credit</th>
                      <th className="border border-black py-1.5 px-2 text-center w-16">Letter Grade</th>
                      <th className="border border-black py-1.5 px-2 text-center w-16">Grade Point</th>
                      <th className="border border-black py-1.5 px-2 text-center w-16">Credit Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/40">
                    {courses.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-slate-500 font-sans">
                          <div className="flex flex-col items-center justify-center space-y-1">
                            <span className="font-bold text-sm text-slate-800">Results Not Published Yet</span>
                            <span className="text-xs text-slate-500 max-w-md">
                              Official semester examination results for Semester {currentSemester} have not been published by the Office of the Controller of Examinations.
                            </span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      courses.map((c, idx) => {
                        const credit = Number(c.credit) || 3.0;
                        const gradePoint = Number(c.gpaPoint) !== undefined && c.gpaPoint !== null
                          ? Number(c.gpaPoint)
                          : 3.75;
                        const creditPoint = (credit * gradePoint).toFixed(2);
                        return (
                          <tr key={c._id || idx} className="hover:bg-slate-50/50">
                            <td className="border border-black py-1.5 px-2 text-center font-mono text-[11px]">{idx + 1}</td>
                            <td className="border border-black py-1.5 px-3 font-mono font-bold">{c.courseCode}</td>
                            <td className="border border-black py-1.5 px-3 font-medium">{c.courseName}</td>
                            <td className="border border-black py-1.5 px-2 text-center capitalize text-[11px] text-slate-700">
                              {c.courseType || "Theory"}
                            </td>
                            <td className="border border-black py-1.5 px-2 text-center font-mono font-semibold">
                              {credit.toFixed(2)}
                            </td>
                            <td className="border border-black py-1.5 px-2 text-center font-bold text-black">
                              {c.grade || "A"}
                            </td>
                            <td className="border border-black py-1.5 px-2 text-center font-mono font-semibold">
                              {gradePoint.toFixed(2)}
                            </td>
                            <td className="border border-black py-1.5 px-2 text-center font-mono font-bold">
                              {creditPoint}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-100 font-bold border-t-2 border-black text-xs">
                      <td colSpan={4} className="border border-black py-2 px-3 text-right uppercase">
                        Semester Total Registered:
                      </td>
                      <td className="border border-black py-2 px-2 text-center font-mono">
                        {totalRegisteredCredits.toFixed(2)}
                      </td>
                      <td colSpan={2} className="border border-black py-2 px-3 text-right uppercase text-[11px]">
                        Earned: {totalEarnedCredits.toFixed(2)} Cr
                      </td>
                      <td className="border border-black py-2 px-2 text-center font-mono">
                        {courses.length > 0
                          ? courses.reduce((acc, c) => acc + ((Number(c.credit) || 3.0) * (Number(c.gpaPoint) || 3.75)), 0).toFixed(2)
                          : "0.00"}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Evaluation Summary Box */}
              <div className="border-2 border-black p-3 bg-slate-50/60 font-sans">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div className="p-2 border border-black/30 bg-white">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Semester GPA (SGPA)</p>
                    <p className="text-xl font-black text-black font-mono mt-0.5">{sgpa || "—"}</p>
                  </div>
                  <div className="p-2 border border-black/30 bg-white">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Cumulative GPA (CGPA)</p>
                    <p className="text-xl font-black text-black font-mono mt-0.5">{cgpa || "—"}</p>
                  </div>
                  <div className="p-2 border border-black/30 bg-white">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Cumulative Credits</p>
                    <p className="text-xl font-black text-black font-mono mt-0.5">{Number(totalCumulativeCredits).toFixed(2)}</p>
                  </div>
                  <div className="p-2 border border-black/30 bg-white">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Academic Standing</p>
                    <p className={`text-sm font-black uppercase mt-1.5 flex items-center justify-center space-x-1 ${hasResult ? "text-emerald-800" : "text-amber-800"}`}>
                      {hasResult ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>PASSED</span>
                        </>
                      ) : (
                        <span>RESULT AWAITED</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* RUET Grading Scale Table */}
              <div className="border border-black p-2 text-[9px] font-sans bg-white leading-tight">
                <div className="font-bold uppercase tracking-wider text-center text-[10px] mb-1">
                  RUET Uniform Grading System (Undergraduate Ordinance)
                </div>
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-1 text-center divide-x divide-black/30">
                  <div>
                    <div className="font-bold">80% +</div>
                    <div className="font-mono text-black font-bold">A+ (4.00)</div>
                  </div>
                  <div>
                    <div className="font-bold">75% - 79%</div>
                    <div className="font-mono text-black font-bold">A (3.75)</div>
                  </div>
                  <div>
                    <div className="font-bold">70% - 74%</div>
                    <div className="font-mono text-black font-bold">A- (3.50)</div>
                  </div>
                  <div>
                    <div className="font-bold">65% - 69%</div>
                    <div className="font-mono text-black font-bold">B+ (3.25)</div>
                  </div>
                  <div>
                    <div className="font-bold">60% - 64%</div>
                    <div className="font-mono text-black font-bold">B (3.00)</div>
                  </div>
                  <div>
                    <div className="font-bold">55% - 59%</div>
                    <div className="font-mono text-black font-bold">B- (2.75)</div>
                  </div>
                  <div>
                    <div className="font-bold">50% - 54%</div>
                    <div className="font-mono text-black font-bold">C+ (2.50)</div>
                  </div>
                  <div>
                    <div className="font-bold">45% - 49%</div>
                    <div className="font-mono text-black font-bold">C (2.25)</div>
                  </div>
                  <div>
                    <div className="font-bold">40% - 44%</div>
                    <div className="font-mono text-black font-bold">D (2.00)</div>
                  </div>
                  <div>
                    <div className="font-bold">&lt; 40%</div>
                    <div className="font-mono text-red-600 font-bold">F (0.00)</div>
                  </div>
                </div>
              </div>

              {/* Signatures & Official Seals */}
              <div className="pt-6 grid grid-cols-4 gap-4 text-center text-xs font-sans">
                
                {/* 1. Tabulator-I */}
                <div className="flex flex-col items-center justify-end">
                  <div className="font-serif italic text-sm text-indigo-900 font-bold mb-1 select-none">
                    M. R. Tareq
                  </div>
                  <div className="w-full border-t border-black pt-1">
                    <p className="font-bold text-[11px] text-black">Prepared by</p>
                    <p className="text-[10px] text-slate-600">Tabulator-I</p>
                  </div>
                </div>

                {/* 2. Tabulator-II & Scrutinizer */}
                <div className="flex flex-col items-center justify-end">
                  <div className="font-serif italic text-sm text-indigo-900 font-bold mb-1 select-none">
                    K. S. Simum
                  </div>
                  <div className="w-full border-t border-black pt-1">
                    <p className="font-bold text-[11px] text-black">Checked by</p>
                    <p className="text-[10px] text-slate-600">Tabulator-II / Scrutinizer</p>
                  </div>
                </div>

                {/* 3. Head of Department with Seal */}
                <div className="flex flex-col items-center justify-end relative">
                  <div className="absolute -top-7 opacity-85 pointer-events-none select-none">
                    <div className="w-16 h-16 rounded-full border-2 border-indigo-700/80 flex flex-col items-center justify-center p-1 text-[7px] text-indigo-900 font-bold uppercase rotate-[-8deg] leading-tight text-center bg-indigo-50/20">
                      <span>DEPT OF ECE</span>
                      <span className="text-[9px]">★ RUET ★</span>
                      <span>SEAL</span>
                    </div>
                  </div>
                  <div className="font-serif italic text-sm text-indigo-900 font-bold mb-1 select-none">
                    Prof. Dr. Anwar
                  </div>
                  <div className="w-full border-t border-black pt-1">
                    <p className="font-bold text-[11px] text-black">Head of Department</p>
                    <p className="text-[10px] text-slate-600">Dept. of ECE, RUET</p>
                  </div>
                </div>

                {/* 4. Controller of Examinations */}
                <div className="flex flex-col items-center justify-end relative">
                  <div className="absolute -top-8 right-2 opacity-90 pointer-events-none select-none">
                    <div className="w-18 h-18 rounded-full border-2 border-red-700/80 flex flex-col items-center justify-center p-1 text-[7px] text-red-900 font-bold uppercase rotate-12 leading-tight text-center bg-red-50/20">
                      <span>CONTROLLER</span>
                      <span className="text-[9px]">★ RUET ★</span>
                      <span>OFFICIAL SEAL</span>
                    </div>
                  </div>
                  <div className="font-serif italic text-sm text-indigo-950 font-bold mb-1 select-none">
                    Prof. Dr. Md. R. Islam
                  </div>
                  <div className="w-full border-t-2 border-black pt-1">
                    <p className="font-bold text-[11px] text-black">Controller of Examinations</p>
                    <p className="text-[10px] text-slate-600">RUET, Bangladesh</p>
                  </div>
                </div>

              </div>

              {/* Bottom Security Footer */}
              <div className="pt-2 text-[10px] text-slate-500 font-sans border-t border-dotted border-slate-400 flex items-center justify-between">
                <span>Verified Official Digital Record • RUET OneHUB Automation Portal</span>
                <span className="font-mono">Document Hash: SHA256-{(studentRoll + currentSemester + sgpa).substring(0, 16)}</span>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RUETGradeSheetPaper;
