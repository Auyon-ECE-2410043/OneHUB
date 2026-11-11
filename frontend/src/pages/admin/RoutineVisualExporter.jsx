import { useState, useRef } from "react";
import html2canvas from "html2canvas";
import { Download, RotateCcw, Plus, Trash2, Edit3, CheckCircle, Calendar, BookOpen, AlertCircle } from "lucide-react";

// Standard RUET ECE time slots
const TIME_SLOTS = [
  { id: "slot0", label: "8.00\n8.50", time: "8.00 - 8.50" },
  { id: "slot1", label: "8.50\n9.40", time: "8.50 - 9.40" },
  { id: "slot2", label: "9.40\n10.30", time: "9.40 - 10.30" },
  { id: "break1", isBreak: true, label: "10.30-10.50", text: "Class Break" },
  { id: "slot3", label: "10.50\n11.40", time: "10.50 - 11.40" },
  { id: "slot4", label: "11.40\n12.30", time: "11.40 - 12.30" },
  { id: "slot5", label: "12.30\n1.20", time: "12.30 - 1.20" },
  { id: "break2", isBreak: true, label: "1.20-2.30", text: "Class Break" },
  { id: "slot6", label: "2.30\n3.20", time: "2.30 - 3.20" },
  { id: "slot7", label: "3.20\n4.10", time: "3.20 - 4.10" },
  { id: "slot8", label: "4.10\n5.00", time: "4.10 - 5.00" },
];

const DAYS = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday"];

const COLOR_PRESETS = [
  { label: "Light Blue (ECE 2105)", bg: "#8EDCE6", text: "#000000" },
  { label: "Peach (ECE 2103/04)", bg: "#F7AC8E", text: "#000000" },
  { label: "Yellow (ECE 2111)", bg: "#FFF266", text: "#000000" },
  { label: "Cyan/Teal (Lab)", bg: "#66D2D6", text: "#000000" },
  { label: "Periwinkle Blue (ECE 2100)", bg: "#A8C6FA", text: "#000000" },
  { label: "White (Math/Chem)", bg: "#FFFFFF", text: "#000000" },
  { label: "Black (Class Test)", bg: "#000000", text: "#FFFFFF" },
];

// Initial template populated from the user's uploaded routine image
const INITIAL_TEMPLATE = {
  dateRange: "18 July, 2026 to July 22, 2026",
  runningWeek: "05",
  totalClassDayCount: "20",
  previousClassRecord: "[ECE 2103: 07] [ECE 2105: 10] [ECE 2111: 06] [MATH 2117: 08] [CHEM 2117: 12]",
  previousCtRecord: "[ECE 2103: 00] [ECE 2105: 00] [ECE 2111: 00] [MATH 2117: 01] [CHEM 2117: 01]",
  
  schedule: {
    Saturday: {
      slot3: { course: "ECE 2105", teacher: "MKG+MI", bg: "#8EDCE6", text: "#000000" },
      slot4: { course: "MATH 2117", teacher: "MZA", bg: "#FFFFFF", text: "#000000" },
      slot5: { course: "ECE 2111", teacher: "NRP+MNT", bg: "#FFF266", text: "#000000" },
      slot6: { course: "ECE 2104", teacher: "MFA", note: "1st 30", noteColor: "#8b2000", bg: "#F7AC8E", text: "#000000", span: 3 },
    },
    Sunday: {
      slot0: { course: "ECE 2106/ECE 2112", teacher: "MKG+MI/NRP+MNT", note: "1st 30 / 2nd 30", noteBg: "#FFF266", bg: "#66D2D6", text: "#000000", span: 3 },
      slot3: { course: "ECE 2103", teacher: "MFA", bg: "#F7AC8E", text: "#000000" },
      slot4: { course: "CHEM 2117", teacher: "SR", bg: "#FFFFFF", text: "#000000" },
      slot5: { course: "MATH 2117", teacher: "Y", bg: "#FFFFFF", text: "#000000" },
    },
    Monday: {
      slot0: { course: "ECE 2104", teacher: "MFA", note: "2nd 30", noteBg: "#FFF266", bg: "#F7AC8E", text: "#000000", span: 3 },
      slot3: { course: "CHEM 2117", teacher: "SR", bg: "#FFFFFF", text: "#000000" },
      slot4: { course: "ECE 2105", teacher: "MKG+MI", bg: "#8EDCE6", text: "#000000" },
      slot5: { course: "ECE 2103", teacher: "MFA", bg: "#F7AC8E", text: "#000000" },
    },
    Tuesday: {
      slot2: { course: "ECE 2111", teacher: "NRP+MNT", bg: "#FFF266", text: "#000000" },
      slot3: { course: "CHEM 2117", teacher: "AAI", bg: "#FFFFFF", text: "#000000" },
      slot4: { course: "MATH 2117", teacher: "MZA", bg: "#FFFFFF", text: "#000000" },
      slot5: { course: "ECE 2103", teacher: "MFA", bg: "#F7AC8E", text: "#000000" },
      slot6: { course: "ECE 2105", teacher: "MKG (CT)", isCT: true, bg: "#000000", text: "#FFFFFF" },
    },
    Wednesday: {
      slot1: { course: "CHEM 2118", teacher: "SR+AAI", note: "2nd 30", noteBg: "#FFF266", bg: "#FFFFFF", text: "#000000", span: 2 },
      slot3: { course: "ECE 2111", teacher: "MNT (CT)", isCT: true, bg: "#000000", text: "#FFFFFF" },
      slot4: { course: "ECE 2105", teacher: "MKG+MI", bg: "#8EDCE6", text: "#000000" },
      slot6: { course: "ECE 2100", teacher: "ALL FACULTY", note: "Lab- all", noteBg: "#FFF266", bg: "#A8C6FA", text: "#000000", span: 3 },
    },
  },

  ctSyllabus: [
    {
      courseCode: "ECE 2105",
      syllabus: "Cascade, Cascode, Basic circuit of Darligton, Darlington emitter-follower configuration."
    },
    {
      courseCode: "ECE 2111",
      syllabus: "Chapter 1 (Digital Design by Morris Mano 5th Edition)"
    }
  ]
};

export default function RoutineVisualExporter() {
  const [data, setData] = useState(INITIAL_TEMPLATE);
  const [activeTab, setActiveTab] = useState("preview"); // "preview" | "header" | "schedule" | "ct"
  const [selectedCell, setSelectedCell] = useState(null); // { day, slotId }
  const [downloading, setDownloading] = useState(false);
  const routineRef = useRef(null);

  // Edit cell modal state
  const [cellForm, setCellForm] = useState({
    course: "",
    teacher: "",
    note: "",
    span: 1,
    isCT: false,
    bg: "#FFFFFF",
    text: "#000000"
  });

  const openCellEditor = (day, slotId) => {
    const existing = data.schedule[day]?.[slotId] || {};
    setSelectedCell({ day, slotId });
    setCellForm({
      course: existing.course || "",
      teacher: existing.teacher || "",
      note: existing.note || "",
      span: existing.span || 1,
      isCT: existing.isCT || false,
      bg: existing.bg || (existing.isCT ? "#000000" : "#FFFFFF"),
      text: existing.text || (existing.isCT ? "#FFFFFF" : "#000000"),
    });
  };

  const handleSaveCell = () => {
    if (!selectedCell) return;
    const { day, slotId } = selectedCell;
    const updatedSchedule = { ...data.schedule };
    if (!updatedSchedule[day]) updatedSchedule[day] = {};

    if (!cellForm.course.trim()) {
      // If course is empty, remove the slot
      delete updatedSchedule[day][slotId];
    } else {
      updatedSchedule[day][slotId] = {
        course: cellForm.course.trim(),
        teacher: cellForm.teacher.trim(),
        note: cellForm.note.trim(),
        span: Number(cellForm.span) || 1,
        isCT: cellForm.isCT,
        bg: cellForm.isCT ? "#000000" : cellForm.bg,
        text: cellForm.isCT ? "#FFFFFF" : cellForm.text,
      };
    }

    setData({ ...data, schedule: updatedSchedule });
    setSelectedCell(null);
  };

  const handleClearCell = () => {
    if (!selectedCell) return;
    const { day, slotId } = selectedCell;
    const updatedSchedule = { ...data.schedule };
    if (updatedSchedule[day]) {
      delete updatedSchedule[day][slotId];
    }
    setData({ ...data, schedule: updatedSchedule });
    setSelectedCell(null);
  };

  const handleAddCtSyllabus = () => {
    setData({
      ...data,
      ctSyllabus: [...data.ctSyllabus, { courseCode: "", syllabus: "" }]
    });
  };

  const handleUpdateCtSyllabus = (index, field, value) => {
    const updated = [...data.ctSyllabus];
    updated[index][field] = value;
    setData({ ...data, ctSyllabus: updated });
  };

  const handleRemoveCtSyllabus = (index) => {
    setData({
      ...data,
      ctSyllabus: data.ctSyllabus.filter((_, i) => i !== index)
    });
  };

  // High-resolution PNG download using html2canvas
  const handleDownloadPNG = async () => {
    if (!routineRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(routineRef.current, {
        scale: 2.5, // High DPI for crisp text
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const image = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = image;
      a.download = `Routine_Week_${data.runningWeek || "01"}.png`;
      a.click();
    } catch (err) {
      console.error("Failed to generate routine image:", err);
      alert("Error generating PNG. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Visual Routine Designer</h2>
          <span className="text-xs bg-indigo-100 text-indigo-700 font-semibold px-2 py-0.5 rounded-full">
            Week {data.runningWeek}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-lg text-sm">
            <button
              onClick={() => setActiveTab("preview")}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                activeTab === "preview" ? "bg-white dark:bg-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400" : "text-slate-600 dark:text-slate-300"
              }`}
            >
              Visual Preview
            </button>
            <button
              onClick={() => setActiveTab("header")}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                activeTab === "header" ? "bg-white dark:bg-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400" : "text-slate-600 dark:text-slate-300"
              }`}
            >
              Header & Counts
            </button>
            <button
              onClick={() => setActiveTab("ct")}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                activeTab === "ct" ? "bg-white dark:bg-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400" : "text-slate-600 dark:text-slate-300"
              }`}
            >
              CT Syllabus ({data.ctSyllabus.length})
            </button>
          </div>

          <button
            onClick={() => setData(INITIAL_TEMPLATE)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
            title="Reset to default template"
          >
            <RotateCcw className="w-4 h-4" /> Reset Template
          </button>

          <button
            onClick={handleDownloadPNG}
            disabled={downloading}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm px-4 py-2 rounded-lg shadow-sm transition disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            {downloading ? "Rendering PNG..." : "Download Routine PNG"}
          </button>
        </div>
      </div>

      {/* Header & Counts Tab */}
      {activeTab === "header" && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <h3 className="font-semibold text-slate-800 dark:text-white border-b pb-2">Routine Header Details</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1">
                Date Range (Followed From - To)
              </label>
              <input
                type="text"
                value={data.dateRange}
                onChange={(e) => setData({ ...data, dateRange: e.target.value })}
                placeholder="e.g. 18 July, 2026 to July 22, 2026"
                className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1">
                Running Week
              </label>
              <input
                type="text"
                value={data.runningWeek}
                onChange={(e) => setData({ ...data, runningWeek: e.target.value })}
                placeholder="e.g. 05"
                className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1">
                Total Class Day Count
              </label>
              <input
                type="text"
                value={data.totalClassDayCount}
                onChange={(e) => setData({ ...data, totalClassDayCount: e.target.value })}
                placeholder="e.g. 20"
                className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1">
                Previous Class Record
              </label>
              <input
                type="text"
                value={data.previousClassRecord}
                onChange={(e) => setData({ ...data, previousClassRecord: e.target.value })}
                placeholder="e.g. [ECE 2103: 07] [ECE 2105: 10] [ECE 2111: 06]..."
                className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1">
                Previous Class Test (CT) Record
              </label>
              <input
                type="text"
                value={data.previousCtRecord}
                onChange={(e) => setData({ ...data, previousCtRecord: e.target.value })}
                placeholder="e.g. [ECE 2103: 00] [ECE 2105: 00] [MATH 2117: 01]..."
                className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-white font-mono"
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button
              onClick={() => setActiveTab("preview")}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
            >
              Save & View Routine
            </button>
          </div>
        </div>
      )}

      {/* CT Syllabus Tab */}
      {activeTab === "ct" && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="font-semibold text-slate-800 dark:text-white">Class Test (CT) Syllabus Sections</h3>
            <button
              onClick={handleAddCtSyllabus}
              className="flex items-center gap-1 text-sm bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 font-medium px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition"
            >
              <Plus className="w-4 h-4" /> Add CT Course
            </button>
          </div>

          <div className="space-y-3">
            {data.ctSyllabus.map((item, index) => (
              <div key={index} className="flex gap-3 items-start bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="w-32">
                  <label className="block text-xs text-slate-500 uppercase mb-1 font-semibold">Course Code</label>
                  <input
                    type="text"
                    value={item.courseCode}
                    onChange={(e) => handleUpdateCtSyllabus(index, "courseCode", e.target.value)}
                    placeholder="e.g. ECE 2105"
                    className="w-full px-2.5 py-1.5 border rounded text-sm bg-white dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-slate-500 uppercase mb-1 font-semibold">Topics / Syllabus</label>
                  <input
                    type="text"
                    value={item.syllabus}
                    onChange={(e) => handleUpdateCtSyllabus(index, "syllabus", e.target.value)}
                    placeholder="e.g. Cascade, Cascode, Basic circuit of Darlington..."
                    className="w-full px-2.5 py-1.5 border rounded text-sm bg-white dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <button
                  onClick={() => handleRemoveCtSyllabus(index)}
                  className="mt-6 p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded transition"
                  title="Remove this CT syllabus"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setActiveTab("preview")}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
            >
              Done & Return to Preview
            </button>
          </div>
        </div>
      )}

      {/* Visual Canvas / Printable Document View */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
          <span>💡 Tip: Click on any slot in the timetable to edit or change its course, teacher, color, or CT status.</span>
          <span>Click "Download Routine PNG" above to export.</span>
        </div>

        {/* The Exact Printable Template Box */}
        <div className="overflow-x-auto bg-slate-200 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-300 dark:border-slate-800 flex justify-center">
          <div
            ref={routineRef}
            className="w-[1050px] bg-white text-black p-8 font-sans shadow-lg select-none"
            style={{ minWidth: "1050px" }}
          >
            {/* Top header lines */}
            <div className="flex justify-between items-center text-sm font-serif">
              <div>
                This Routine will be followed from <span className="font-bold">{data.dateRange.split(" to ")[0]}</span> to <span className="font-bold">{data.dateRange.split(" to ")[1] || data.dateRange}</span>
              </div>
              <div className="font-serif">
                Running Week: <span className="font-bold">{data.runningWeek}</span>
              </div>
            </div>

            {/* Solid separator line */}
            <hr className="border-t border-black my-2" />

            {/* Counts & Records Header */}
            <div className="space-y-1 text-xs font-serif font-bold text-[#18538a] mb-5">
              <div>Total class day count: {data.totalClassDayCount}</div>
              <div>Previous Class Record: {data.previousClassRecord}</div>
              <div>Previous Class Test Record: {data.previousCtRecord}</div>
            </div>

            {/* Main Timetable */}
            <div className="border border-black overflow-hidden mb-6">
              <table className="w-full border-collapse text-center">
                <thead>
                  <tr className="bg-[#8cd57e] text-black text-xs font-bold font-sans">
                    {/* Corner Cell: TIME / DAY */}
                    <th className="border border-black p-2 w-[90px] relative text-left">
                      <div className="text-right text-[11px] leading-tight pr-1">TIME</div>
                      <div className="text-left text-[11px] leading-tight pl-1 -mt-1">DAY</div>
                    </th>

                    {/* Period Columns */}
                    <th className="border border-black p-1.5 w-[75px] leading-tight text-[11px]">8.00<br/>8.50</th>
                    <th className="border border-black p-1.5 w-[75px] leading-tight text-[11px]">8.50<br/>9.40</th>
                    <th className="border border-black p-1.5 w-[75px] leading-tight text-[11px]">9.40<br/>10.30</th>
                    
                    {/* Vertical Break 1 */}
                    <th className="border border-black p-1 w-[26px] text-[10px] leading-none select-none bg-[#8cd57e]">
                      <div className="rotate-180 [writing-mode:vertical-rl] mx-auto py-1 tracking-tighter">10.30-10.50</div>
                    </th>

                    <th className="border border-black p-1.5 w-[75px] leading-tight text-[11px]">10.50<br/>11.40</th>
                    <th className="border border-black p-1.5 w-[75px] leading-tight text-[11px]">11.40<br/>12.30</th>
                    <th className="border border-black p-1.5 w-[75px] leading-tight text-[11px]">12.30<br/>1.20</th>

                    {/* Vertical Break 2 */}
                    <th className="border border-black p-1 w-[26px] text-[10px] leading-none select-none bg-[#8cd57e]">
                      <div className="rotate-180 [writing-mode:vertical-rl] mx-auto py-1 tracking-tighter">1.20-2.30</div>
                    </th>

                    <th className="border border-black p-1.5 w-[75px] leading-tight text-[11px]">2.30<br/>3.20</th>
                    <th className="border border-black p-1.5 w-[75px] leading-tight text-[11px]">3.20<br/>4.10</th>
                    <th className="border border-black p-1.5 w-[75px] leading-tight text-[11px]">4.10<br/>5.00</th>
                  </tr>
                </thead>

                <tbody>
                  {DAYS.map((day, dayIndex) => {
                    const daySlots = data.schedule[day] || {};
                    let skipCount = 0; // for colSpan handling

                    return (
                      <tr key={day} className="h-[62px]">
                        {/* Day label */}
                        <td className="border border-black font-serif font-bold text-xs bg-[#d4cc95] px-2 text-center">
                          {day}
                        </td>

                        {/* Slot 0 (8.00 - 8.50) */}
                        {renderSlotCell(day, "slot0", daySlots.slot0, () => openCellEditor(day, "slot0"))}

                        {/* Slot 1 (8.50 - 9.40) */}
                        {renderSlotCell(day, "slot1", daySlots.slot1, daySlots.slot0?.span >= 2, () => openCellEditor(day, "slot1"))}

                        {/* Slot 2 (9.40 - 10.30) */}
                        {renderSlotCell(day, "slot2", daySlots.slot2, daySlots.slot0?.span >= 3 || daySlots.slot1?.span >= 2, () => openCellEditor(day, "slot2"))}

                        {/* Middle Class Break Column */}
                        {dayIndex === 0 && (
                          <td
                            rowSpan={DAYS.length}
                            className="border border-black bg-white text-[11px] font-sans font-medium text-center p-0 align-middle select-none"
                          >
                            <div className="rotate-180 [writing-mode:vertical-rl] tracking-wider uppercase text-slate-700 mx-auto">
                              Class Break
                            </div>
                          </td>
                        )}

                        {/* Slot 3 (10.50 - 11.40) */}
                        {renderSlotCell(day, "slot3", daySlots.slot3, false, () => openCellEditor(day, "slot3"))}

                        {/* Slot 4 (11.40 - 12.30) */}
                        {renderSlotCell(day, "slot4", daySlots.slot4, daySlots.slot3?.span >= 2, () => openCellEditor(day, "slot4"))}

                        {/* Slot 5 (12.30 - 1.20) */}
                        {renderSlotCell(day, "slot5", daySlots.slot5, daySlots.slot3?.span >= 3 || daySlots.slot4?.span >= 2, () => openCellEditor(day, "slot5"))}

                        {/* Lunch / Prayer Break Column */}
                        {dayIndex === 0 && (
                          <td
                            rowSpan={DAYS.length}
                            className="border border-black bg-white text-[11px] font-sans font-medium text-center p-0 align-middle select-none"
                          >
                            <div className="rotate-180 [writing-mode:vertical-rl] tracking-wider uppercase text-slate-700 mx-auto">
                              Class Break
                            </div>
                          </td>
                        )}

                        {/* Slot 6 (2.30 - 3.20) */}
                        {renderSlotCell(day, "slot6", daySlots.slot6, false, () => openCellEditor(day, "slot6"))}

                        {/* Slot 7 (3.20 - 4.10) */}
                        {renderSlotCell(day, "slot7", daySlots.slot7, daySlots.slot6?.span >= 2, () => openCellEditor(day, "slot7"))}

                        {/* Slot 8 (4.10 - 5.00) */}
                        {renderSlotCell(day, "slot8", daySlots.slot8, daySlots.slot6?.span >= 3 || daySlots.slot7?.span >= 2, () => openCellEditor(day, "slot8"))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* CT Syllabus Section at the Bottom */}
            {data.ctSyllabus.length > 0 && (
              <div className="pt-2 font-serif text-sm">
                <h4 className="font-bold text-[#18538a] text-[15px] mb-1.5">CT Syllabus</h4>
                <div className="space-y-1.5 text-[13px] leading-relaxed">
                  {data.ctSyllabus.map((ct, idx) => (
                    <div key={idx}>
                      <span className="font-bold text-[#18538a]">{ct.courseCode}: </span>
                      <span className="font-sans text-black font-medium">{ct.syllabus}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Slot / Cell Editor Modal */}
      {selectedCell && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 w-full max-w-md border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Edit Routine Cell</h3>
                <p className="text-xs text-slate-500">
                  {selectedCell.day} &bull; {TIME_SLOTS.find(s => s.id === selectedCell.slotId)?.time || selectedCell.slotId}
                </p>
              </div>
              <button
                onClick={() => setSelectedCell(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1">
                  Course Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. ECE 2105 or MATH 2117"
                  value={cellForm.course}
                  onChange={(e) => setCellForm({ ...cellForm, course: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1">
                  Teacher Initials
                </label>
                <input
                  type="text"
                  placeholder="e.g. MKG+MI or MFA"
                  value={cellForm.teacher}
                  onChange={(e) => setCellForm({ ...cellForm, teacher: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1">
                  Section / Lab Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1st 30, 2nd 30, Lab- all"
                  value={cellForm.note}
                  onChange={(e) => setCellForm({ ...cellForm, note: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1">
                    Span (Periods)
                  </label>
                  <select
                    value={cellForm.span}
                    onChange={(e) => setCellForm({ ...cellForm, span: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                  >
                    <option value={1}>1 Period (50 min)</option>
                    <option value={2}>2 Periods (Lab 1h 40m)</option>
                    <option value={3}>3 Periods (Full Lab 2h 30m)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1">
                    Is Class Test (CT)?
                  </label>
                  <label className="flex items-center gap-2 mt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cellForm.isCT}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        setCellForm({
                          ...cellForm,
                          isCT: isChecked,
                          bg: isChecked ? "#000000" : "#FFFFFF",
                          text: isChecked ? "#FFFFFF" : "#000000",
                          teacher: isChecked && !cellForm.teacher.includes("(CT)")
                            ? `${cellForm.teacher} (CT)`.trim()
                            : cellForm.teacher
                        });
                      }}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <span className="text-sm font-semibold text-rose-600 dark:text-rose-400">Class Test (Black Box)</span>
                  </label>
                </div>
              </div>

              {!cellForm.isCT && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1.5">
                    Box Background Color
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {COLOR_PRESETS.filter(p => !p.bg.includes("#000000")).map(preset => (
                      <button
                        key={preset.bg}
                        type="button"
                        onClick={() => setCellForm({ ...cellForm, bg: preset.bg, text: preset.text })}
                        className={`h-8 rounded-lg border text-xs font-medium flex items-center justify-center transition ${
                          cellForm.bg.toUpperCase() === preset.bg.toUpperCase() ? "ring-2 ring-indigo-500 font-bold scale-105" : "hover:opacity-80"
                        }`}
                        style={{ backgroundColor: preset.bg, color: preset.text }}
                      >
                        {preset.bg === "#FFFFFF" ? "White" : ""}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-3 border-t">
              <button
                type="button"
                onClick={handleClearCell}
                className="text-xs text-rose-600 hover:underline flex items-center gap-1 font-medium"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear Cell
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCell(null)}
                  className="px-3 py-1.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveCell}
                  className="px-4 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm"
                >
                  Save Cell
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper to render individual schedule cell
function renderSlotCell(day, slotId, slotData, isOverriddenBySpan = false, onClick) {
  if (isOverriddenBySpan) {
    return null; // Cell hidden because earlier slot spanned over it
  }

  if (!slotData) {
    return (
      <td
        key={slotId}
        onClick={onClick}
        className="border border-black p-1 bg-white hover:bg-slate-100 cursor-pointer transition"
        title="Click to add course"
      >
        <span className="opacity-0 group-hover:opacity-100 text-[10px] text-slate-400">+</span>
      </td>
    );
  }

  const { course, teacher, note, noteBg, noteColor, bg, text, span = 1, isCT } = slotData;

  return (
    <td
      key={slotId}
      colSpan={span}
      onClick={onClick}
      className="border border-black p-1 text-center align-middle cursor-pointer hover:brightness-95 transition"
      style={{ backgroundColor: bg || "#FFFFFF", color: text || "#000000" }}
      title="Click to edit slot"
    >
      <div className="flex flex-col items-center justify-center leading-tight py-0.5">
        <span className="font-bold text-[12px] tracking-tight">{course}</span>
        {teacher && <span className="font-semibold text-[11px]">{teacher}</span>}
        {note && (
          <span
            className="text-[10px] font-bold mt-0.5 px-1 rounded"
            style={{
              backgroundColor: noteBg || "transparent",
              color: noteColor || (isCT ? "#FFFFFF" : "#000000")
            }}
          >
            {note}
          </span>
        )}
      </div>
    </td>
  );
}
