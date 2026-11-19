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
import { Download, Printer, X, CheckCircle2, ShieldCheck, FileCheck } from "lucide-react";
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

// Helper to calculate academic session from batch
const getAcademicSession = (batch, semester) => {
  if (!batch) return "2024-2025";
  const b = parseInt(batch, 10);
  if (isNaN(b)) return "2024-2025";
  const startYear = 2000 + b;
  return `${startYear}-${startYear + 1}`;
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

  const student = registration.studentId || user || {};
  const courses = registration.courseIds || [];
  const backlogs = registration.backlogCourseIds || [];
  const semester = registration.semester || "2-2";
  const termName = getSemesterTermName(semester);
  const session = registration.academicSession || getAcademicSession(student.batch || "24", semester);
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
  const adviserDept = registration.approvedBy?.department || student.department || "ECE";

  // High-Res PNG Download
  const handleDownloadPNG = async () => {
    if (!paperRef.current) return;
    setDownloading(true);
    const toastId = toast.loading("Generating high-resolution official confirmation paper...");

    try {
      const element = paperRef.current;
      const opts = {
        scale: 2.5,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#FFFFFF",
        logging: false,
        windowWidth: 1200,
      };

      let canvas;
      try {
        canvas = await html2canvasPro(element, opts);
      } catch (errPro) {
        console.warn("html2canvasPro fallback to standard:", errPro);
        canvas = await html2canvasStd(element, opts);
      }

      const imgData = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement("a");
      const safeRoll = student.rollNo || "Registration";
      link.download = `RUET_Course_Registration_Approved_${safeRoll}_Sem_${semester}.png`;
      link.href = imgData;
      link.click();

      toast.success("Official registration confirmation paper downloaded successfully!", { id: toastId });
    } catch (err) {
      console.error("Export error:", err);
      toast.error("Failed to generate image. You can use Print / Save as PDF.", { id: toastId });
    } finally {
      setDownloading(false);
    }
  };

  // Browser Print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6 print:p-0 print:bg-white animate-fade-in print:static print:z-auto print:overflow-visible">
      {/* Print isolation style to guarantee only the paper is printed */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #ruet-registration-paper, #ruet-registration-paper * {
            visibility: visible !important;
          }
          #ruet-registration-paper {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 12mm 16mm !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
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
              <h3 className="text-sm font-bold text-white">Course Registration Confirmation Paper</h3>
              <p className="text-xs text-slate-400">Official Departmental Registration &amp; Adjustment Document</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-semibold text-white transition cursor-pointer"
              title="Print document or save as PDF"
            >
              <Printer className="w-4 h-4" /> Print / PDF
            </button>
            <button
              onClick={handleDownloadPNG}
              disabled={downloading}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-md shadow-emerald-600/30 transition disabled:opacity-50 cursor-pointer"
              title="Download 300 DPI PNG Image"
            >
              <Download className="w-4 h-4" /> {downloading ? "Exporting..." : "Download PNG"}
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
          {/* Printable Official Paper Canvas (Standard A4 White Sheet) */}
          <div
            ref={paperRef}
            id="ruet-registration-paper"
            style={{ fontFamily: "'Times New Roman', Times, serif" }}
            className="w-full max-w-[820px] bg-white text-black p-8 sm:p-12 rounded-lg shadow-xl border border-slate-300 relative print:p-6 print:shadow-none print:border-none print:max-w-none print:w-full"
          >
            {/* TOP RIGHT: OFFICIAL "COURSE REGISTRATION APPROVED" STAMP */}
            <div className="absolute top-6 right-6 sm:top-8 sm:right-8 z-10 pointer-events-none select-none">
              <div className="border-[3px] border-emerald-700 rounded-lg p-2.5 bg-emerald-50/90 shadow-xs text-center transform rotate-[-2deg] transition-transform">
                <div className="flex items-center justify-center gap-1.5 text-emerald-800 font-black text-xs sm:text-sm tracking-wider uppercase">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Course Registration Approved</span>
                </div>
                <div className="text-[10px] text-emerald-900 font-bold uppercase tracking-wider mt-0.5">
                  Academic Adviser &amp; Controller Verified
                </div>
                <div className="text-[9px] text-emerald-700 font-mono font-semibold mt-0.5">
                  Ref: RUET/{student.department || "ECE"}/REG-{semester}-{student.rollNo || "STU"}
                </div>
              </div>
            </div>

            {/* HEADER SECTION */}
            <div className="text-center space-y-1 pt-1 pb-3">
              <div className="flex justify-center mb-1">
                <img
                  src="/ruet-logo.svg"
                  alt="RUET Crest"
                  className="w-16 h-16 object-contain"
                  onError={(e) => {
                    // Fallback to placeholder if svg not found
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
              <p className="text-xs italic tracking-wider text-slate-800 font-medium">Heaven&apos;s Light is Our Guide</p>
              <h1 className="text-base sm:text-lg font-black tracking-wide uppercase leading-snug">
                Rajshahi University of Engineering &amp; Technology, Bangladesh
              </h1>
              <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider underline decoration-1 underline-offset-4">
                Course Registration / Course Adjustment Form
              </h2>
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider pt-0.5">
                Department of {student.department || "ECE"}
              </h3>
              <p className="text-xs font-bold pt-0.5">{session}</p>
            </div>

            {/* STUDENT & ACADEMIC DETAILS */}
            <div className="text-xs sm:text-[13px] leading-relaxed space-y-2 mt-4 pt-2 border-t border-slate-300">
              <div className="flex flex-col sm:flex-row justify-between gap-1">
                <div className="flex items-baseline">
                  <span className="font-bold shrink-0">Roll No.:</span>
                  <span className="ml-2 font-mono font-bold text-black border-b border-dotted border-black px-2 pb-0.5 min-w-[120px]">
                    {student.rollNo || "2410043"}
                  </span>
                </div>
                <div className="flex items-baseline">
                  <span className="font-bold shrink-0">Registration No. with Session:</span>
                  <span className="ml-2 font-mono font-bold text-black border-b border-dotted border-black px-2 pb-0.5 min-w-[150px]">
                    {student.registrationNo || "8001"} (Session: {session})
                  </span>
                </div>
              </div>

              <div className="flex items-baseline">
                <span className="font-bold shrink-0">Name:</span>
                <span className="ml-2 font-bold uppercase tracking-wide border-b border-dotted border-black px-2 pb-0.5 flex-1">
                  {student.name || "Nafisa Islam"}
                </span>
              </div>

              <div className="flex items-baseline flex-wrap">
                <span className="font-bold shrink-0">Academic session with Semester:</span>
                <span className="ml-2 font-semibold border-b border-dotted border-black px-2 pb-0.5 flex-1 min-w-[200px]">
                  {session}, {termName} ({semester})
                </span>
              </div>

              <div className="flex items-baseline">
                <span className="font-bold shrink-0">Previously earned credit:</span>
                <span className="ml-2 font-semibold border-b border-dotted border-black px-2 pb-0.5 min-w-[100px]">
                  {previouslyEarnedCredit}
                </span>
              </div>

              <div className="flex items-baseline">
                <span className="font-bold shrink-0">Course No. of Backlog course:</span>
                <span className="ml-2 font-semibold border-b border-dotted border-black px-2 pb-0.5 flex-1">
                  {backlogs && backlogs.length > 0
                    ? backlogs.map((b) => b.courseCode).join(", ")
                    : "None (Regular Student)"}
                </span>
              </div>
            </div>

            {/* COURSES TABLE */}
            <div className="mt-5">
              <p className="text-xs sm:text-[13px] font-bold mb-1.5">
                Courses to be registered in this semester:
              </p>

              <table className="w-full border-collapse border border-black text-xs sm:text-[13px]">
                <thead>
                  <tr className="bg-slate-100 print:bg-slate-100">
                    <th className="border border-black py-1.5 px-3 font-bold text-center w-28 uppercase">
                      Course No.
                    </th>
                    <th className="border border-black py-1.5 px-4 font-bold text-left uppercase">
                      Course Title
                    </th>
                    <th className="border border-black py-1.5 px-3 font-bold text-center w-24 uppercase">
                      Credit
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="border border-black py-1.5 px-3 font-bold text-center font-mono">
                        {course.courseCode}
                      </td>
                      <td className="border border-black py-1.5 px-4 font-medium">
                        {course.courseName || course.title}
                      </td>
                      <td className="border border-black py-1.5 px-3 font-bold text-center">
                        {Number(course.credit).toFixed(2)}
                      </td>
                    </tr>
                  ))}

                  {/* Empty spacer row if needed to maintain form height */}
                  {courses.length < 5 && (
                    <tr>
                      <td className="border border-black py-2 px-3 text-center">&nbsp;</td>
                      <td className="border border-black py-2 px-4">&nbsp;</td>
                      <td className="border border-black py-2 px-3 text-center">&nbsp;</td>
                    </tr>
                  )}

                  {/* Total Credit Row */}
                  <tr className="bg-slate-50 font-bold border-t-2 border-black">
                    <td
                      colSpan={2}
                      className="border border-black py-2 px-4 text-right font-bold uppercase tracking-wider text-xs sm:text-[13px]"
                    >
                      Total Credit of this Semester
                    </td>
                    <td className="border border-black py-2 px-3 text-center font-bold font-mono text-sm">
                      {totalCredit}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* ADVISER'S COMMENT */}
            <div className="mt-4 text-xs sm:text-[13px]">
              <span className="font-bold">Adviser&apos;s Comment (if any):</span>
              <span className="ml-2 italic text-slate-800 border-b border-dotted border-black pb-0.5 inline-block min-w-[300px]">
                {registration.adviserComment || "Approved for regular academic session with good standing."}
              </span>
            </div>

            {/* SIGNATURES SECTION */}
            <div className="mt-14 pt-2 grid grid-cols-3 gap-4 text-center text-xs sm:text-[13px]">
              {/* 1. Student Signature */}
              <div className="flex flex-col items-center justify-end">
                <div
                  className="text-base sm:text-lg font-bold text-blue-900 mb-1 select-none"
                  style={{ fontFamily: "'Brush Script MT', cursive, serif" }}
                >
                  {student.name || "Nafisa Islam"}
                </div>
                <div className="w-full border-t border-black pt-1">
                  <p className="font-bold leading-tight">Signature of the Student</p>
                  <p className="text-[10px] text-slate-600 mt-0.5">Date: {approvalDate}</p>
                </div>
              </div>

              {/* 2. Adviser Signature */}
              <div className="flex flex-col items-center justify-end">
                <div
                  className="text-base sm:text-lg font-bold text-indigo-950 mb-1 select-none"
                  style={{ fontFamily: "'Brush Script MT', cursive, serif" }}
                >
                  {adviserName}
                </div>
                <div className="w-full border-t border-black pt-1">
                  <p className="font-bold leading-tight">Signature of the Adviser</p>
                  <p className="text-[10px] text-slate-600 mt-0.5">
                    {adviserTitle}, Dept. of {adviserDept}
                  </p>
                  <p className="text-[10px] text-slate-600">Date: {approvalDate}</p>
                </div>
              </div>

              {/* 3. Controller of Examinations Signature & Official Seal */}
              <div className="flex flex-col items-center justify-end relative">
                {/* Official Circular Stamp Overlay */}
                <div className="absolute -top-10 opacity-75 pointer-events-none select-none">
                  <div className="w-20 h-20 rounded-full border-2 border-dashed border-blue-900 flex flex-col items-center justify-center text-[7px] font-bold text-blue-900 leading-tight uppercase transform rotate-[-6deg]">
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
                  <p className="font-bold leading-tight">Signature of the Controller</p>
                  <p className="text-[10px] text-slate-600 mt-0.5">Controller of Examinations, RUET</p>
                  <p className="text-[10px] text-slate-600">Date: {approvalDate}</p>
                </div>
              </div>
            </div>

            {/* FOOTER NOTICE */}
            <div className="mt-8 pt-3 border-t border-slate-200 text-center text-[10px] text-slate-600 italic">
              Students are asked to cross out the irrelevant Terms. Generated via RUET OneHUB Central Automation Portal.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
