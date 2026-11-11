/**
 * File: RoutineVisualExporter.jsx
 * Description: Interactive Visual Routine Designer & High-Res PNG Exporter.
 * Formatted to match the official RUET Departmental Timetable layout and styling.
 * 
 * Supports:
 * - Direct click-to-edit cells
 * - Sessional Lab course assignment for 1st 30 and 2nd 30 across dates
 * - Class Test (CT) black box with white text
 * - CT Syllabus dynamic editor
 * - Running week, total class day count, and previous class records
 * - High-res PNG export powered by html2canvas-pro (full Tailwind v4 & oklch support)
 * - Presets for 2-2, 1-2, 3-1, 3-2, 4-2
 */

import { useState, useRef, useMemo } from "react";
import html2canvas from "html2canvas-pro";
import { Download, RotateCcw, Plus, Trash2, Calendar, Layers, Users, RefreshCw, Check, Sparkles } from "lucide-react";
import routineService from "../../services/routineService";

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

const getContrastTextColor = (hexColor) => {
  if (!hexColor || hexColor === "#000000") return "#FFFFFF";
  const hex = hexColor.replace("#", "");
  if (hex.length < 6) return "#000000";
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return yiq >= 145 ? "#000000" : "#FFFFFF";
};

const COLOR_PRESETS = [
  // Classic Department Routine Palette
  { label: "Light Blue", bg: "#8EDCE6", text: "#000000" },
  { label: "Peach", bg: "#F7AC8E", text: "#000000" },
  { label: "Bright Yellow", bg: "#FFF266", text: "#000000" },
  { label: "Cyan/Teal Lab", bg: "#66D2D6", text: "#000000" },
  { label: "Periwinkle", bg: "#A8C6FA", text: "#000000" },
  { label: "Mint Green", bg: "#A7F3D0", text: "#000000" },
  { label: "Soft Lavender", bg: "#DDD6FE", text: "#000000" },
  { label: "Rose Pink", bg: "#FECDD3", text: "#000000" },
  { label: "Warm Amber", bg: "#FDE68A", text: "#000000" },
  { label: "Sky Blue", bg: "#BAE6FD", text: "#000000" },
  { label: "Spring Lime", bg: "#D9F99D", text: "#000000" },
  { label: "Lilac Violet", bg: "#E9D5FF", text: "#000000" },
  { label: "Turquoise", bg: "#99F6E4", text: "#000000" },
  { label: "Soft Coral", bg: "#FCA5A5", text: "#000000" },
  { label: "Sage Green", bg: "#DCFCE7", text: "#000000" },
  { label: "Warm Beige", bg: "#F5E6CC", text: "#000000" },
  { label: "Timetable Olive", bg: "#D4CC95", text: "#000000" },
  { label: "Header Green", bg: "#8CD57E", text: "#000000" },
  { label: "Light Slate", bg: "#E2E8F0", text: "#000000" },
  { label: "Pure White", bg: "#FFFFFF", text: "#000000" },
  { label: "Deep Indigo", bg: "#3730A3", text: "#FFFFFF" },
  { label: "Forest Green", bg: "#166534", text: "#FFFFFF" },
  { label: "Wine Red", bg: "#991B1B", text: "#FFFFFF" },
  { label: "Class Test Black", bg: "#000000", text: "#FFFFFF" },
];

// Presets for all 5 current semesters based on official RUET Department routine
const SEMESTER_PRESETS = {
  "2-2": {
    seriesName: "2nd Year Even (2024 Series / 2-2)",
    dateRange: "14 November, 2026 to November 18, 2026",
    runningWeek: "01",
    totalClassDayCount: "05",
    previousClassRecord: "[ECE 2207: 00] [ECE 2213: 00] [ECE 2215: 00] [MATH 2217: 00] [HUM 2217: 00]",
    previousCtRecord: "[ECE 2207: 00] [ECE 2213: 00] [ECE 2215: 00] [MATH 2217: 00] [HUM 2217: 00]",
    schedule: {
      Saturday: {
        slot0: { course: "ECE 2216", teacher: "MNT+NIS", note: "Lab-2", group: "2nd 30", bg: "#FFAAA6", text: "#000000", span: 3 },
        slot3: { course: "ECE 2215", teacher: "NIS+MNT", note: "R-401", bg: "#8EDCE6", text: "#000000" },
        slot4: { course: "HUM 2217", teacher: "SI", note: "R-401", bg: "#CBE5FF", text: "#000000" },
        slot5: { course: "ECE 2207", teacher: "FT+NRP", note: "R-401", bg: "#D4CC95", text: "#000000" },
        slot6: { course: "ECE 2214", teacher: "MSA+MI", note: "Lab-1", group: "1st 30", bg: "#A8C6FA", text: "#000000", span: 3 },
      },
      Sunday: {
        slot0: { course: "ECE 2213", teacher: "MI", note: "R-404", bg: "#FFF266", text: "#000000" },
        slot1: { course: "Math 2217", teacher: "MRK", note: "R-404", bg: "#E8D5FF", text: "#000000" },
        slot2: { course: "ECE 2215", teacher: "NIS+MNT", note: "R-404", bg: "#8EDCE6", text: "#000000" },
        slot3: { course: "ECE 2208", teacher: "MAH (EEE)", note: "LAB-8", group: "1st 30", bg: "#A7F3D0", text: "#000000", span: 3 },
      },
      Monday: {
        slot0: { course: "ECE 2200", teacher: "MAH+NRP", note: "LAB-4", group: "2nd 30", bg: "#F7AC8E", text: "#000000", span: 3 },
        slot3: { course: "ECE 2207", teacher: "FT+NRP", note: "R-404", bg: "#D4CC95", text: "#000000" },
        slot4: { course: "HUM 2217", teacher: "MRI", note: "R-404", bg: "#CBE5FF", text: "#000000" },
        slot5: { course: "ECE 2213", teacher: "MI", note: "R-404", bg: "#FFF266", text: "#000000" },
      },
      Tuesday: {
        slot0: { course: "ECE 2200", teacher: "MAH+NRP", note: "LAB-4", group: "1st 30", bg: "#F7AC8E", text: "#000000", span: 3 },
        slot3: { course: "Math 2217", teacher: "MZH+MRK", note: "R-404", bg: "#E8D5FF", text: "#000000" },
        slot4: { course: "HUM 2217", teacher: "MRI", note: "R-404", bg: "#CBE5FF", text: "#000000" },
        slot5: { course: "ECE 2215", teacher: "NIS+MNT", note: "R-404", bg: "#8EDCE6", text: "#000000" },
        slot6: { course: "ECE 2214", teacher: "MSA+MI", note: "Lab-2", group: "2nd 30", bg: "#A8C6FA", text: "#000000", span: 3 },
      },
      Wednesday: {
        slot0: { course: "Math 2217", teacher: "MRK+MZH", note: "R-404", bg: "#E8D5FF", text: "#000000" },
        slot1: { course: "ECE 2213", teacher: "MZA", note: "R-404", bg: "#FFF266", text: "#000000" },
        slot2: { course: "ECE 2207", teacher: "FT+NRP", note: "R-404", bg: "#D4CC95", text: "#000000" },
        slot3: { course: "ECE 2216", teacher: "MNT+NIS", note: "Lab-2", group: "1st 30", bg: "#FFAAA6", text: "#000000", span: 3 },
      },
    },
    ctSyllabus: []
  },

  "1-2": {
    seriesName: "1st Year Even (2025 Series / 1-2)",
    dateRange: "14 November, 2026 to November 18, 2026",
    runningWeek: "01",
    totalClassDayCount: "05",
    previousClassRecord: "[ECE 1201: 00] [ECE 1203: 00] [ECE 1205: 00] [MATH 1217: 00] [HUM 1217: 00]",
    previousCtRecord: "[ECE 1201: 00] [ECE 1203: 00] [ECE 1205: 00] [MATH 1217: 00] [HUM 1217: 00]",
    schedule: {
      Saturday: {
        slot0: { course: "ECE 1203", teacher: "HBK+NIS", note: "Lab 1", group: "1st 30", bg: "#66D2D6", text: "#000000", span: 3 },
        slot3: { course: "HUM 1217", teacher: "TTT", note: "R-404", bg: "#FFFFFF", text: "#000000" },
        slot4: { course: "ECE 1205", teacher: "MI/MKG", note: "R-404", bg: "#8EDCE6", text: "#000000" },
        slot5: { course: "ECE 1203", teacher: "HBK+NIS", note: "R-404", bg: "#F7AC8E", text: "#000000" },
      },
      Sunday: {
        slot0: { course: "ECE 1206", teacher: "MI+MKG", note: "LAB-4", group: "1st 30", bg: "#66D2D6", text: "#000000", span: 3 },
        slot3: { course: "ECE 1201", teacher: "FT+NRP", note: "R-404", bg: "#FFF266", text: "#000000" },
        slot4: { course: "Math 1217", teacher: "MSA", note: "R-404", bg: "#FFFFFF", text: "#000000" },
        slot5: { course: "ECE 1203", teacher: "HBK+NIS", note: "R-404", bg: "#F7AC8E", text: "#000000" },
      },
      Monday: {
        slot0: { course: "ECE 1205", teacher: "MI/MKG", note: "R-404", bg: "#8EDCE6", text: "#000000" },
        slot1: { course: "Math 1217", teacher: "MI", note: "R-404", bg: "#FFFFFF", text: "#000000" },
        slot2: { course: "HUM 1217", teacher: "TTT", note: "R-404", bg: "#FFFFFF", text: "#000000" },
        slot3: { course: "ECE 1202", teacher: "MAH+NIS", note: "Lab-3", group: "2nd 30", bg: "#66D2D6", text: "#000000", span: 3 },
      },
      Tuesday: {
        slot0: { course: "ECE 1200", teacher: "HBK+NIS", note: "Lab-4", group: "Lab- all", bg: "#66D2D6", text: "#000000", span: 3 },
        slot3: { course: "ECE 1201", teacher: "FT+NRP", note: "R-404", bg: "#FFF266", text: "#000000" },
        slot4: { course: "HUM 1217", teacher: "TTT", note: "R-404", bg: "#FFFFFF", text: "#000000" },
        slot5: { course: "ECE 1205", teacher: "MI/MKG", note: "R-404", bg: "#8EDCE6", text: "#000000" },
      },
      Wednesday: {
        slot0: { course: "ECE 1204", teacher: "HBK+NIS", note: "Lab 2", group: "1st 30", bg: "#66D2D6", text: "#000000", span: 3 },
        slot3: { course: "ECE 1201", teacher: "FT+NRP", note: "R-404", bg: "#FFF266", text: "#000000" },
        slot4: { course: "Math 1217", teacher: "MSA", note: "R-404", bg: "#FFFFFF", text: "#000000" },
        slot5: { course: "ECE 1205", teacher: "MI+MKG", note: "R-404", bg: "#8EDCE6", text: "#000000" },
      },
    },
    ctSyllabus: []
  },

  "3-1": {
    seriesName: "3rd Year Odd (2023 Series / 3-1)",
    dateRange: "14 November, 2026 to November 18, 2026",
    runningWeek: "01",
    totalClassDayCount: "05",
    previousClassRecord: "[ECE 3101: 00] [ECE 3103: 00] [ECE 3105: 00] [ECE 3107: 00] [HUM 3117: 00]",
    previousCtRecord: "[ECE 3101: 00] [ECE 3103: 00] [ECE 3105: 00] [ECE 3107: 00] [HUM 3117: 00]",
    schedule: {
      Saturday: {
        slot0: { course: "ME 3119", teacher: "MMR/MRP", note: "R-402", bg: "#FFFFFF", text: "#000000" },
        slot1: { course: "ECE 3107", teacher: "MKG+MI", note: "R-403", bg: "#8EDCE6", text: "#000000" },
        slot3: { course: "ECE 3121", teacher: "MMR+RI", note: "R-403", bg: "#FFF266", text: "#000000" },
        slot4: { course: "ECE 3119", teacher: "NRP", note: "R-403", bg: "#F7AC8E", text: "#000000" },
        slot5: { course: "ECE 3107", teacher: "MKG+MN", note: "R-403", bg: "#8EDCE6", text: "#000000" },
      },
      Sunday: {
        slot3: { course: "ECE 3108", teacher: "ST/HBK+MNT", note: "ECE Seminar Room / LAB-2", group: "1st 30", bg: "#66D2D6", text: "#000000", span: 3 },
      },
      Monday: {
        slot0: { course: "ME 3119", teacher: "MMR/MRP", note: "R-402", bg: "#FFFFFF", text: "#000000" },
        slot1: { course: "ECE 3108", teacher: "MKG+GKH", note: "LAB-8", bg: "#66D2D6", text: "#000000" },
        slot3: { course: "ECE 3100", teacher: "All Faculty", note: "LAB-1 / LAB-2", group: "Lab- all", bg: "#A8C6FA", text: "#000000", span: 3 },
      },
      Tuesday: {
        slot0: { course: "ECE 3112", teacher: "MFA+RA", note: "LAB-2", group: "1st 30", bg: "#66D2D6", text: "#000000", span: 3 },
        slot3: { course: "ME 3119", teacher: "MMR/MRP", note: "R-402", bg: "#FFFFFF", text: "#000000" },
        slot4: { course: "HUM 3117", teacher: "KF", note: "R-402", bg: "#FFFFFF", text: "#000000" },
        slot5: { course: "ECE 3121", teacher: "MMR+RI", note: "R-403", bg: "#FFF266", text: "#000000" },
      },
      Wednesday: {
        slot0: { course: "ECE 3112", teacher: "MFA+RA", note: "LAB-1", group: "2nd 30", bg: "#66D2D6", text: "#000000", span: 3 },
        slot3: { course: "ECE 3107", teacher: "MKG+MNT", note: "R-403", bg: "#8EDCE6", text: "#000000" },
        slot4: { course: "ECE 3119", teacher: "NRP", note: "R-403", bg: "#F7AC8E", text: "#000000" },
        slot5: { course: "ECE 3117", teacher: "HBK+MNT", note: "R-403", bg: "#FFF266", text: "#000000" },
      },
    },
    ctSyllabus: []
  },

  "3-2": {
    seriesName: "3rd Year Even (2022 Series / 3-2)",
    dateRange: "14 November, 2026 to November 18, 2026",
    runningWeek: "01",
    totalClassDayCount: "05",
    previousClassRecord: "[ECE 3205: 00] [ECE 3207: 00] [ECE 3221: 00] [ME 3219: 00]",
    previousCtRecord: "[ECE 3205: 00] [ECE 3207: 00] [ECE 3221: 00] [ME 3219: 00]",
    schedule: {
      Saturday: {
        slot0: { course: "ME 3220", teacher: "RP", note: "Lab-11", group: "1st 30", bg: "#66D2D6", text: "#000000", span: 3 },
        slot3: { course: "ECE 3221", teacher: "HBK+NIS", note: "R-402", bg: "#8EDCE6", text: "#000000" },
        slot4: { course: "ECE 3205", teacher: "MFA+MKG", note: "R-402", bg: "#F7AC8E", text: "#000000" },
        slot5: { course: "ME 3219", teacher: "MAH+MNT", note: "R-403", bg: "#FFFFFF", text: "#000000" },
      },
      Sunday: {
        slot0: { course: "ME 3219", teacher: "MMR/MRP", note: "R-402", bg: "#FFFFFF", text: "#000000" },
        slot1: { course: "ECE 3217", teacher: "TK", note: "R-403", bg: "#FFF266", text: "#000000" },
        slot2: { course: "ECE 3205", teacher: "MFA+MKG", note: "R-402", bg: "#F7AC8E", text: "#000000" },
        slot3: { course: "ECE 3200", teacher: "GKH+NRP", note: "LAB-8", group: "Lab- all", bg: "#A8C6FA", text: "#000000", span: 3 },
      },
      Monday: {
        slot0: { course: "ME 3219", teacher: "MMR/MRP", note: "R-402", bg: "#FFFFFF", text: "#000000" },
        slot3: { course: "ECE 3222", teacher: "HBK+NIS", note: "LAB-2", group: "1st 30", bg: "#66D2D6", text: "#000000", span: 3 },
      },
      Tuesday: {
        slot0: { course: "ECE 3207", teacher: "T", note: "R-402", bg: "#FFF266", text: "#000000" },
        slot3: { course: "ECE 3205", teacher: "MFA+MKG", note: "R-402", bg: "#F7AC8E", text: "#000000" },
        slot4: { course: "ECE 3217", teacher: "KF", note: "R-402", bg: "#FFF266", text: "#000000" },
        slot5: { course: "ECE 3221", teacher: "HBK+NIS", note: "R-402", bg: "#8EDCE6", text: "#000000" },
        slot6: { course: "ECE 3200", teacher: "GKH+NRP", note: "R-401", bg: "#FFFFFF", text: "#000000" },
      },
      Wednesday: {
        slot0: { course: "ECE 3208 / 3206", teacher: "MAH+MNT / MFA+MKG", note: "Lab-10 / LAB-3", group: "1st 30 / 2nd 30", bg: "#66D2D6", text: "#000000", span: 3 },
        slot3: { course: "HUM 3217", teacher: "KF", note: "R-402", bg: "#FFFFFF", text: "#000000" },
        slot4: { course: "ECE 3207", teacher: "MAH/MNT", note: "R-402", bg: "#FFF266", text: "#000000" },
        slot5: { course: "ECE 3221", teacher: "HBK/NIS", note: "R-402", bg: "#8EDCE6", text: "#000000" },
      },
    },
    ctSyllabus: []
  },

  "4-2": {
    seriesName: "4th Year Even (2021 Series / 4-2)",
    dateRange: "14 November, 2026 to November 18, 2026",
    runningWeek: "01",
    totalClassDayCount: "05",
    previousClassRecord: "[ECE 4201: 00] [ECE 4203: 00] [ECE 4205: 00] [ECE 4209: 00] [ECE 4227: 00]",
    previousCtRecord: "[ECE 4201: 00] [ECE 4203: 00] [ECE 4205: 00] [ECE 4209: 00] [ECE 4227: 00]",
    schedule: {
      Saturday: {
        slot0: { course: "ECE 4277", teacher: "RIY", note: "R-401", bg: "#FFF266", text: "#000000" },
        slot1: { course: "ECE 4251", teacher: "RIS", note: "R-401", bg: "#8EDCE6", text: "#000000" },
        slot2: { course: "ECE 4209", teacher: "FT", note: "R-401", bg: "#8EDCE6", text: "#000000" },
        slot3: { course: "ECE 4212", teacher: "MFA", note: "LAB-1", group: "1st 30", bg: "#66D2D6", text: "#000000", span: 3 },
      },
      Sunday: {
        slot0: { course: "ECE 4224", teacher: "RIY/MKG", note: "LAB-1", group: "1st 30", bg: "#66D2D6", text: "#000000", span: 3 },
        slot3: { course: "ECE 4000", teacher: "ALL Faculty", note: "Lab-ALL", group: "Lab- all", bg: "#A8C6FA", text: "#000000", span: 3 },
      },
      Monday: {
        slot0: { course: "ECE 4245", teacher: "MSZ", note: "R-401", bg: "#FFF266", text: "#000000" },
        slot1: { course: "ECE 4224", teacher: "RIY/MKG", note: "LAB-2", group: "2nd 30", bg: "#66D2D6", text: "#000000", span: 3 },
        slot3: { course: "ECE 4223", teacher: "MKG/RIY", note: "R-401", bg: "#F7AC8E", text: "#000000" },
        slot4: { course: "ECE 4209", teacher: "FT", note: "R-401", bg: "#8EDCE6", text: "#000000" },
      },
      Tuesday: {
        slot0: { course: "ECE 4252", teacher: "SH", note: "LAB-1/15", group: "Lab- all", bg: "#66D2D6", text: "#000000", span: 3 },
        slot3: { course: "ECE 4211", teacher: "MFA", note: "R-401", bg: "#F7AC8E", text: "#000000" },
        slot4: { course: "ECE 4223", teacher: "MKG+RIY", note: "R-401", bg: "#F7AC8E", text: "#000000" },
        slot5: { course: "ECE 4227", teacher: "RIY", note: "R-401", bg: "#FFF266", text: "#000000" },
      },
      Wednesday: {
        slot3: { course: "ECE 4211", teacher: "MFA", note: "R-401", bg: "#F7AC8E", text: "#000000" },
        slot4: { course: "ECE 4223", teacher: "MKG+RIY", note: "R-401", bg: "#F7AC8E", text: "#000000" },
        slot5: { course: "ECE 4209", teacher: "FT", note: "R-401", bg: "#8EDCE6", text: "#000000" },
        slot6: { course: "ECE 4228 / 4246", teacher: "RIY+MSZ", note: "LAB-1 / LAB-2", group: "1st 30 / 2nd 30", bg: "#66D2D6", text: "#000000", span: 3 },
      },
    },
    ctSyllabus: []
  }
};

export default function RoutineVisualExporter() {
  const [selectedSemKey, setSelectedSemKey] = useState("2-2"); // Default to user's 2-2 semester
  const [data, setData] = useState(SEMESTER_PRESETS["2-2"]);
  const [activeTab, setActiveTab] = useState("preview"); // "preview" | "header" | "labs" | "ct"
  const [selectedCell, setSelectedCell] = useState(null); // { day, slotId }
  const [downloading, setDownloading] = useState(false);
  const [syncingDb, setSyncingDb] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState("");
  const routineRef = useRef(null);

  // Calendar Date System States (Default to Saturday 14 Nov 2026 to Wednesday 18 Nov 2026)
  const [calStartDate, setCalStartDate] = useState("2026-11-14");
  const [calEndDate, setCalEndDate] = useState("2026-11-18");

  const formatDateRangeFromDates = (startStr, endStr) => {
    if (!startStr || !endStr) return "";
    const s = new Date(startStr + "T00:00:00");
    const e = new Date(endStr + "T00:00:00");
    if (isNaN(s) || isNaN(e)) return "";

    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const startDay = s.getDate();
    const startMonth = months[s.getMonth()];
    const startYear = s.getFullYear();

    const endDay = e.getDate();
    const endMonth = months[e.getMonth()];
    const endYear = e.getFullYear();

    if (startMonth === endMonth && startYear === endYear) {
      return `${startDay} ${startMonth}, ${startYear} to ${endMonth} ${endDay}, ${endYear}`;
    }
    return `${startDay} ${startMonth}, ${startYear} to ${endDay} ${endMonth}, ${endYear}`;
  };

  const handleDatePick = (newStart, newEnd) => {
    setCalStartDate(newStart);
    setCalEndDate(newEnd);
    if (newStart && newEnd) {
      const formatted = formatDateRangeFromDates(newStart, newEnd);
      if (formatted) {
        setData(prev => ({ ...prev, dateRange: formatted }));
      }
    }
  };

  const handleSetWeekPreset = (offsetWeeks = 0) => {
    const now = new Date();
    const day = now.getDay(); // 0 is Sunday, 6 is Saturday
    const diffToSat = (day === 6 ? 0 : -(day + 1)) + (offsetWeeks * 7);
    const sat = new Date(now);
    sat.setDate(now.getDate() + diffToSat);

    const wed = new Date(sat);
    wed.setDate(sat.getDate() + 4);

    const formatIso = (d) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const dt = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${dt}`;
    };

    const sStr = formatIso(sat);
    const eStr = formatIso(wed);
    handleDatePick(sStr, eStr);
  };

  // Switch between semester presets
  const handleSelectSemesterPreset = (key) => {
    setSelectedSemKey(key);
    if (SEMESTER_PRESETS[key]) {
      setData(SEMESTER_PRESETS[key]);
    }
  };

  // Extract all lab slots across the week from the current schedule
  const labSlots = useMemo(() => {
    const list = [];
    DAYS.forEach(day => {
      const daySlots = data.schedule[day] || {};
      Object.keys(daySlots).forEach(slotId => {
        const slot = daySlots[slotId];
        if (slot) {
          const isLab = (slot.span && slot.span >= 2) ||
            (slot.note && slot.note.toLowerCase().includes("lab")) ||
            (slot.group && slot.group !== "All");
          if (isLab) {
            const timeObj = TIME_SLOTS.find(t => t.id === slotId);
            list.push({
              day,
              slotId,
              time: timeObj ? timeObj.time : slotId,
              ...slot
            });
          }
        }
      });
    });
    return list;
  }, [data.schedule]);

  // Group lab slots by courseCode
  const labsByCourse = useMemo(() => {
    const map = {};
    labSlots.forEach(slot => {
      const c = slot.course || "Other Lab";
      if (!map[c]) map[c] = [];
      map[c].push(slot);
    });
    return map;
  }, [labSlots]);

  // Update a lab slot's target group
  const handleSetSlotGroup = (day, slotId, newGroup) => {
    const updated = { ...data.schedule };
    if (!updated[day] || !updated[day][slotId]) return;
    updated[day][slotId] = {
      ...updated[day][slotId],
      group: newGroup
    };
    setData({ ...data, schedule: updated });
  };

  // Swap 1st 30 and 2nd 30 between two sessions of a lab course
  const handleSwapCourseGroups = (courseCode) => {
    const slots = labsByCourse[courseCode] || [];
    if (slots.length < 2) return;
    const updated = { ...data.schedule };
    const s1 = slots[0];
    const s2 = slots[1];
    const g1 = s1.group || "1st 30";
    const g2 = s2.group || "2nd 30";

    updated[s1.day][s1.slotId] = { ...updated[s1.day][s1.slotId], group: g2 };
    updated[s2.day][s2.slotId] = { ...updated[s2.day][s2.slotId], group: g1 };

    setData({ ...data, schedule: updated });
  };

  // Auto-alternate all multi-session labs
  const handleAutoAlternateAll = () => {
    const updated = { ...data.schedule };
    Object.keys(labsByCourse).forEach(courseCode => {
      const sessions = labsByCourse[courseCode];
      if (sessions.length >= 2) {
        sessions.forEach((s, idx) => {
          const grp = idx % 2 === 0 ? "1st 30" : "2nd 30";
          updated[s.day][s.slotId] = { ...updated[s.day][s.slotId], group: grp };
        });
      }
    });
    setData({ ...data, schedule: updated });
  };

  // Edit cell modal state
  const [cellForm, setCellForm] = useState({
    course: "",
    teacher: "",
    note: "",
    group: "All",
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
      group: existing.group || (existing.span >= 2 ? "1st 30" : "All"),
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
      delete updatedSchedule[day][slotId];
    } else {
      updatedSchedule[day][slotId] = {
        course: cellForm.course.trim(),
        teacher: cellForm.teacher.trim(),
        note: cellForm.note.trim(),
        group: cellForm.group || "All",
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
      ctSyllabus: [...(data.ctSyllabus || []), { courseCode: "", syllabus: "" }]
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

  // High-Res PNG Export using html2canvas-pro
  const handleDownloadPNG = async () => {
    if (!routineRef.current) return;
    setDownloading(true);
    try {
      // html2canvas-pro natively parses oklch and modern Tailwind CSS v4 variables
      const canvas = await html2canvas(routineRef.current, {
        scale: 2.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        windowWidth: 1200,
        onclone: (clonedDoc) => {
          const el = clonedDoc.querySelector("[data-routine-export='true']");
          if (el) {
            el.style.transform = "none";
          }
        }
      });

      const image = canvas.toDataURL("image/png", 1.0);
      const a = document.createElement("a");
      a.href = image;
      a.download = `Routine_${selectedSemKey}_Week_${data.runningWeek || "01"}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error("Failed to generate routine image:", err);
      alert(`Error generating PNG: ${err?.message || "Please try again."}`);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-lg">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
              Visual Routine Designer
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-slate-500 dark:text-slate-400">Preset:</span>
              <select
                value={selectedSemKey}
                onChange={(e) => handleSelectSemesterPreset(e.target.value)}
                className="text-xs font-semibold bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-0.5 text-indigo-600 dark:text-indigo-400 focus:outline-none"
              >
                <option value="2-2">2-2 (2024 Series - Current)</option>
                <option value="1-2">1-2 (2025 Series)</option>
                <option value="3-1">3-1 (2023 Series)</option>
                <option value="3-2">3-2 (2022 Series)</option>
                <option value="4-2">4-2 (2021 Series)</option>
              </select>
            </div>
          </div>
        </div>

        {/* View mode & action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium">
            <button
              onClick={() => setActiveTab("preview")}
              className={`px-3 py-1.5 rounded-md transition ${
                activeTab === "preview"
                  ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Visual Preview
            </button>
            <button
              onClick={() => setActiveTab("header")}
              className={`px-3 py-1.5 rounded-md transition ${
                activeTab === "header"
                  ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Header & Counts
            </button>
            <button
              onClick={() => setActiveTab("labs")}
              className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${
                activeTab === "labs"
                  ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Users className="w-3.5 h-3.5 text-amber-500" />
              Lab Allocations (1st / 2nd 30)
            </button>
            <button
              onClick={() => setActiveTab("ct")}
              className={`px-3 py-1.5 rounded-md transition flex items-center gap-1 ${
                activeTab === "ct"
                  ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              CT Syllabus ({data.ctSyllabus?.length || 0})
            </button>
          </div>

          <button
            onClick={() => handleSelectSemesterPreset(selectedSemKey)}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            title="Reset to default timetable preset"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>

          <button
            onClick={handleDownloadPNG}
            disabled={downloading}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm transition"
          >
            <Download className="w-4 h-4" />
            {downloading ? "Rendering PNG..." : "Download Routine PNG"}
          </button>
        </div>
      </div>

      {/* Header & Counts Tab */}
      {activeTab === "header" && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-5">
          <h3 className="font-semibold text-slate-800 dark:text-white border-b pb-2">Routine Header & Schedule Details</h3>

          {/* Calendar System for Date Range */}
          <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-500" />
                Select Routine Date Range (Calendar System)
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSetWeekPreset(0)}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-200 shadow-xs"
                >
                  📅 Current Week (Sat–Wed)
                </button>
                <button
                  type="button"
                  onClick={() => handleSetWeekPreset(1)}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-200 shadow-xs"
                >
                  📅 Next Week (Sat–Wed)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <span className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Start Date (Saturday)
                </span>
                <input
                  type="date"
                  value={calStartDate}
                  onChange={(e) => handleDatePick(e.target.value, calEndDate)}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white font-medium cursor-pointer"
                />
              </div>

              <div>
                <span className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  End Date (Wednesday)
                </span>
                <input
                  type="date"
                  value={calEndDate}
                  onChange={(e) => handleDatePick(calStartDate, e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white font-medium cursor-pointer"
                />
              </div>
            </div>

            <div>
              <span className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Formatted Text on Routine Header (Editable)
              </span>
              <input
                type="text"
                value={data.dateRange}
                onChange={(e) => setData({ ...data, dateRange: e.target.value })}
                placeholder="e.g. 14 November, 2026 to November 18, 2026"
                className="w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white font-medium font-serif"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1">
                Running Week
              </label>
              <input
                type="text"
                value={data.runningWeek}
                onChange={(e) => setData({ ...data, runningWeek: e.target.value })}
                placeholder="e.g. 01"
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
                placeholder="e.g. 05"
                className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1">
                Previous Class Record (Values After Colon Render in Black)
              </label>
              <input
                type="text"
                value={data.previousClassRecord}
                onChange={(e) => setData({ ...data, previousClassRecord: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1">
                Previous Class Test (CT) Record (Values After Colon Render in Black)
              </label>
              <input
                type="text"
                value={data.previousCtRecord}
                onChange={(e) => setData({ ...data, previousCtRecord: e.target.value })}
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

      {/* Lab Sessional Allocations Tab (1st 30 / 2nd 30) */}
      {activeTab === "labs" && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-5">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-3 border-b pb-3">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-500" />
                Assign Sessional Lab Batches (1st 30 vs 2nd 30)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Select which student group performs lab experiments on each scheduled date. Changes immediately appear on the printable routine.
              </p>
            </div>

            <button
              onClick={handleAutoAlternateAll}
              className="flex items-center gap-1.5 text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-300/80 dark:border-amber-700/60 px-3.5 py-2 rounded-lg hover:bg-amber-100 transition shadow-xs self-start md:self-auto"
            >
              <Sparkles className="w-4 h-4 text-amber-500" /> Auto-Alternate All Multi-Session Labs
            </button>
          </div>

          <div className="space-y-4">
            {Object.keys(labsByCourse).length === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center">No sessional lab slots detected in this routine preset.</p>
            ) : (
              Object.keys(labsByCourse).map(courseCode => {
                const sessions = labsByCourse[courseCode];
                return (
                  <div key={courseCode} className="bg-slate-50 dark:bg-slate-900/70 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-800 dark:text-white bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded">
                          {courseCode}
                        </span>
                        <span className="text-xs text-slate-500">
                          ({sessions.length} weekly session{sessions.length > 1 ? "s" : ""})
                        </span>
                      </div>

                      {sessions.length >= 2 && (
                        <button
                          type="button"
                          onClick={() => handleSwapCourseGroups(courseCode)}
                          className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold bg-white dark:bg-slate-800 px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700"
                          title="Swap groups between session dates"
                        >
                          <RefreshCw className="w-3 h-3" /> Swap Dates (1st ⇄ 2nd 30)
                        </button>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-3">
                      {sessions.map((session, sIdx) => {
                        const currentGrp = session.group || "1st 30";
                        return (
                          <div
                            key={`${session.day}-${session.slotId}`}
                            className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col justify-between gap-2 shadow-xs"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="text-xs font-bold text-slate-800 dark:text-white">
                                  {session.day}
                                </span>
                                <span className="text-[11px] text-slate-500 ml-1.5 font-mono">
                                  ({session.time})
                                </span>
                                <div className="text-[11px] text-slate-500 mt-0.5">
                                  Room: <span className="font-semibold text-slate-700 dark:text-slate-300">{session.note || "Lab"}</span> &bull; Teacher: <span className="font-semibold text-slate-700 dark:text-slate-300">{session.teacher}</span>
                                </div>
                              </div>
                              <span
                                className="text-[11px] font-extrabold px-2 py-0.5 rounded border"
                                style={{
                                  color: currentGrp === "1st 30" ? "#b45309" : currentGrp === "2nd 30" ? "#0284c7" : "#475569",
                                  backgroundColor: currentGrp === "1st 30" ? "#fef3c7" : currentGrp === "2nd 30" ? "#e0f2fe" : "#f1f5f9",
                                  borderColor: currentGrp === "1st 30" ? "#fde68a" : currentGrp === "2nd 30" ? "#bae6fd" : "#cbd5e1"
                                }}
                              >
                                {currentGrp}
                              </span>
                            </div>

                            {/* Group selector buttons */}
                            <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-700">
                              {["1st 30", "2nd 30", "1st 30 / 2nd 30", "Lab- all", "All"].map(grp => (
                                <button
                                  key={grp}
                                  type="button"
                                  onClick={() => handleSetSlotGroup(session.day, session.slotId, grp)}
                                  className={`px-2 py-1 text-[11px] font-bold rounded transition ${
                                    currentGrp === grp
                                      ? "bg-amber-500 text-white shadow-xs"
                                      : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                                  }`}
                                >
                                  {grp}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="flex justify-between items-center pt-3 border-t">
            <span className="text-xs text-slate-500">All changes reflect in the printable routine in real-time.</span>
            <button
              onClick={() => setActiveTab("preview")}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
            >
              Done & View Preview
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
            {(!data.ctSyllabus || data.ctSyllabus.length === 0) && (
              <p className="text-sm text-slate-400 py-4 text-center">No CT tests scheduled for this week. Click above to add one.</p>
            )}
            {data.ctSyllabus?.map((item, index) => (
              <div key={index} className="flex gap-3 items-start bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="w-32">
                  <label className="block text-xs text-slate-500 uppercase mb-1 font-semibold">Course Code</label>
                  <input
                    type="text"
                    value={item.courseCode}
                    onChange={(e) => handleUpdateCtSyllabus(index, "courseCode", e.target.value)}
                    placeholder="e.g. ECE 2207"
                    className="w-full px-2.5 py-1.5 border rounded text-sm bg-white dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-slate-500 uppercase mb-1 font-semibold">Topics / Syllabus</label>
                  <input
                    type="text"
                    value={item.syllabus}
                    onChange={(e) => handleUpdateCtSyllabus(index, "syllabus", e.target.value)}
                    placeholder="e.g. Chapter 1 & 2..."
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
          <span>💡 Tip: Click on any slot in the timetable to edit course, teacher, room, lab group (1st/2nd 30), or add CT (Class Test) black box.</span>
          <span>Click "Download Routine PNG" above to export.</span>
        </div>

        {/* The Exact Printable Template Box */}
        <div className="overflow-x-auto bg-slate-200 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-300 dark:border-slate-800 flex justify-center">
          <div
            ref={routineRef}
            data-routine-export="true"
            className="w-[1050px] bg-white text-black p-8 font-sans shadow-lg select-none"
            style={{ minWidth: "1050px", backgroundColor: "#ffffff", color: "#000000" }}
          >
            {/* Top header lines */}
            <div className="flex justify-between items-center text-sm font-serif" style={{ color: "#000000" }}>
              <div>
                This Routine will be followed from <span className="font-bold">{data.dateRange?.split(" to ")[0] || "14 November, 2026"}</span> to <span className="font-bold">{data.dateRange?.split(" to ")[1] || data.dateRange}</span>
              </div>
              <div className="font-serif">
                Running Week: <span className="font-bold">{data.runningWeek}</span>
              </div>
            </div>

            {/* Solid separator line */}
            <hr className="border-t border-black my-2" style={{ borderColor: "#000000" }} />

            {/* Counts & Records Header */}
            <div className="space-y-1 text-xs font-serif font-bold mb-5">
              <div>
                <span style={{ color: "#18538a" }}>Total class day count: </span>
                <span style={{ color: "#000000" }}>
                  {data.totalClassDayCount?.replace(/^total class day count:\s*/i, "")}
                </span>
              </div>
              <div>
                <span style={{ color: "#18538a" }}>Previous Class Record: </span>
                <span style={{ color: "#000000" }}>
                  {data.previousClassRecord?.replace(/^previous class record:\s*/i, "")}
                </span>
              </div>
              <div>
                <span style={{ color: "#18538a" }}>Previous Class Test Record: </span>
                <span style={{ color: "#000000" }}>
                  {data.previousCtRecord?.replace(/^previous class test record:\s*/i, "")}
                </span>
              </div>
            </div>

            {/* Main Timetable */}
            <div className="border border-black overflow-hidden mb-6" style={{ borderColor: "#000000" }}>
              <table className="w-full border-collapse text-center" style={{ borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#8cd57e", color: "#000000", fontSize: "11px", fontWeight: "bold" }}>
                    {/* Corner Cell: TIME / DAY */}
                    <th className="border border-black p-2 w-[90px] relative text-left" style={{ borderColor: "#000000" }}>
                      <div className="text-right text-[11px] leading-tight pr-1">TIME</div>
                      <div className="text-left text-[11px] leading-tight pl-1 -mt-1">DAY</div>
                    </th>

                    {/* Period Columns */}
                    <th className="border border-black p-1.5 w-[75px] leading-tight text-[11px]" style={{ borderColor: "#000000" }}>8.00<br/>8.50</th>
                    <th className="border border-black p-1.5 w-[75px] leading-tight text-[11px]" style={{ borderColor: "#000000" }}>8.50<br/>9.40</th>
                    <th className="border border-black p-1.5 w-[75px] leading-tight text-[11px]" style={{ borderColor: "#000000" }}>9.40<br/>10.30</th>
                    
                    {/* Vertical Break 1 */}
                    <th className="border border-black p-1 w-[26px] text-[10px] leading-none select-none" style={{ backgroundColor: "#8cd57e", borderColor: "#000000" }}>
                      <div style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", margin: "0 auto", padding: "4px 0", letterSpacing: "-0.5px" }}>
                        10.30-10.50
                      </div>
                    </th>

                    <th className="border border-black p-1.5 w-[75px] leading-tight text-[11px]" style={{ borderColor: "#000000" }}>10.50<br/>11.40</th>
                    <th className="border border-black p-1.5 w-[75px] leading-tight text-[11px]" style={{ borderColor: "#000000" }}>11.40<br/>12.30</th>
                    <th className="border border-black p-1.5 w-[75px] leading-tight text-[11px]" style={{ borderColor: "#000000" }}>12.30<br/>1.20</th>

                    {/* Vertical Break 2 */}
                    <th className="border border-black p-1 w-[26px] text-[10px] leading-none select-none" style={{ backgroundColor: "#8cd57e", borderColor: "#000000" }}>
                      <div style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", margin: "0 auto", padding: "4px 0", letterSpacing: "-0.5px" }}>
                        1.20-2.30
                      </div>
                    </th>

                    <th className="border border-black p-1.5 w-[75px] leading-tight text-[11px]" style={{ borderColor: "#000000" }}>2.30<br/>3.20</th>
                    <th className="border border-black p-1.5 w-[75px] leading-tight text-[11px]" style={{ borderColor: "#000000" }}>3.20<br/>4.10</th>
                    <th className="border border-black p-1.5 w-[75px] leading-tight text-[11px]" style={{ borderColor: "#000000" }}>4.10<br/>5.00</th>
                  </tr>
                </thead>

                <tbody>
                  {DAYS.map((day, dayIndex) => {
                    const daySlots = data.schedule[day] || {};

                    return (
                      <tr key={day} className="h-[62px]">
                        {/* Day label */}
                        <td
                          className="border border-black font-serif font-bold text-xs px-2 text-center"
                          style={{ backgroundColor: "#d4cc95", borderColor: "#000000", color: "#000000" }}
                        >
                          {day}
                        </td>

                        {/* Slot 0 (8.00 - 8.50) */}
                        {renderSlotCell(day, "slot0", daySlots.slot0, false, () => openCellEditor(day, "slot0"))}

                        {/* Slot 1 (8.50 - 9.40) */}
                        {renderSlotCell(day, "slot1", daySlots.slot1, daySlots.slot0?.span >= 2, () => openCellEditor(day, "slot1"))}

                        {/* Slot 2 (9.40 - 10.30) */}
                        {renderSlotCell(day, "slot2", daySlots.slot2, daySlots.slot0?.span >= 3 || daySlots.slot1?.span >= 2, () => openCellEditor(day, "slot2"))}

                        {/* Middle Class Break Column */}
                        {dayIndex === 0 && (
                          <td
                            rowSpan={DAYS.length}
                            className="border border-black text-[11px] font-sans font-medium text-center p-0 align-middle select-none"
                            style={{ backgroundColor: "#ffffff", borderColor: "#000000", color: "#334155" }}
                          >
                            <div style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", margin: "0 auto", textTransform: "uppercase", letterSpacing: "1px" }}>
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
                            className="border border-black text-[11px] font-sans font-medium text-center p-0 align-middle select-none"
                            style={{ backgroundColor: "#ffffff", borderColor: "#000000", color: "#334155" }}
                          >
                            <div style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", margin: "0 auto", textTransform: "uppercase", letterSpacing: "1px" }}>
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
            {data.ctSyllabus && data.ctSyllabus.length > 0 && (
              <div className="pt-2 font-serif text-sm">
                <h4 className="font-bold text-[15px] mb-1.5" style={{ color: "#18538a" }}>CT Syllabus</h4>
                <div className="space-y-1.5 text-[13px] leading-relaxed">
                  {data.ctSyllabus.map((ct, idx) => (
                    <div key={idx}>
                      <span className="font-bold" style={{ color: "#18538a" }}>{ct.courseCode}: </span>
                      <span className="font-sans font-medium" style={{ color: "#000000" }}>{ct.syllabus}</span>
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
                  placeholder="e.g. ECE 2207 or Math 2217"
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
                  placeholder="e.g. FT+NRP or MI"
                  value={cellForm.teacher}
                  onChange={(e) => setCellForm({ ...cellForm, teacher: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1">
                  Room / Lab / Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. R-404 or Lab-2"
                  value={cellForm.note}
                  onChange={(e) => setCellForm({ ...cellForm, note: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                />
              </div>

              {/* Target Group (1st 30 / 2nd 30) */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1">
                  Target Group / Sessional Batch
                </label>
                <div className="grid grid-cols-4 gap-1.5 mb-2">
                  {["1st 30", "2nd 30", "1st 30 / 2nd 30", "All"].map(grp => (
                    <button
                      key={grp}
                      type="button"
                      onClick={() => setCellForm({ ...cellForm, group: grp })}
                      className={`px-2 py-1.5 text-xs font-bold rounded-lg border transition ${
                        cellForm.group === grp
                          ? "bg-amber-500 text-white border-amber-600 shadow-xs"
                          : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {grp}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Or enter custom group, e.g. Lab- all"
                  value={cellForm.group || ""}
                  onChange={(e) => setCellForm({ ...cellForm, group: e.target.value })}
                  className="w-full px-3 py-1.5 border rounded-lg bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-white text-xs"
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
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">
                      Box Background Color
                    </label>
                    <span className="text-[11px] font-mono font-medium text-slate-500">
                      {cellForm.bg.toUpperCase()}
                    </span>
                  </div>

                  {/* 23 Preset Colors Grid */}
                  <div className="grid grid-cols-6 gap-1.5 max-h-36 overflow-y-auto p-1 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                    {COLOR_PRESETS.filter(p => !p.bg.includes("#000000")).map(preset => {
                      const isSelected = cellForm.bg.toUpperCase() === preset.bg.toUpperCase();
                      return (
                        <button
                          key={preset.bg}
                          type="button"
                          title={preset.label}
                          onClick={() => setCellForm({ ...cellForm, bg: preset.bg, text: preset.text })}
                          className={`h-7 rounded-md border flex items-center justify-center transition shadow-xs ${
                            isSelected ? "ring-2 ring-indigo-500 scale-105 z-10" : "hover:scale-105"
                          }`}
                          style={{
                            backgroundColor: preset.bg,
                            color: preset.text,
                            borderColor: isSelected ? "#6366f1" : "rgba(0,0,0,0.15)"
                          }}
                        >
                          {isSelected && <span className="text-[10px] font-black">✓</span>}
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Color Wheel & Hex Picker */}
                  <div className="flex items-center gap-2 pt-1">
                    <div className="flex items-center gap-1.5 flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1">
                      <input
                        type="color"
                        value={cellForm.bg.length === 7 ? cellForm.bg : "#FFFFFF"}
                        onChange={(e) => {
                          const hex = e.target.value.toUpperCase();
                          setCellForm({ ...cellForm, bg: hex, text: getContrastTextColor(hex) });
                        }}
                        className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent p-0"
                        title="Pick custom color from palette wheel"
                      />
                      <input
                        type="text"
                        value={cellForm.bg}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCellForm({
                            ...cellForm,
                            bg: val,
                            text: val.length === 7 ? getContrastTextColor(val) : cellForm.text
                          });
                        }}
                        placeholder="#HEX"
                        className="w-full text-xs font-mono uppercase bg-transparent outline-none dark:text-white"
                      />
                    </div>

                    {/* Font contrast switcher */}
                    <div className="flex bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
                      <button
                        type="button"
                        onClick={() => setCellForm({ ...cellForm, text: "#000000" })}
                        className={`px-2 py-1 rounded transition text-[10px] font-bold ${
                          cellForm.text === "#000000" ? "bg-white text-black shadow-xs" : "text-slate-400"
                        }`}
                        title="Black text font"
                      >
                        Black
                      </button>
                      <button
                        type="button"
                        onClick={() => setCellForm({ ...cellForm, text: "#FFFFFF" })}
                        className={`px-2 py-1 rounded transition text-[10px] font-bold ${
                          cellForm.text === "#FFFFFF" ? "bg-black text-white shadow-xs" : "text-slate-400"
                        }`}
                        title="White text font"
                      >
                        White
                      </button>
                    </div>
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

function renderSlotCell(day, slotId, slotData, isOverriddenBySpan = false, onClick) {
  if (isOverriddenBySpan) {
    return null;
  }

  if (!slotData) {
    return (
      <td
        key={slotId}
        onClick={onClick}
        className="border border-black p-1 bg-white hover:bg-slate-100 cursor-pointer transition"
        style={{ borderColor: "#000000", backgroundColor: "#ffffff" }}
        title="Click to add course"
      >
        <span className="opacity-0 group-hover:opacity-100 text-[10px] text-slate-400">+</span>
      </td>
    );
  }

  const { course, teacher, note, noteBg, noteColor, bg, text, span = 1, isCT, group } = slotData;

  return (
    <td
      key={slotId}
      colSpan={span}
      onClick={onClick}
      className="border border-black p-1 text-center align-middle cursor-pointer hover:brightness-95 transition"
      style={{
        backgroundColor: bg || "#FFFFFF",
        color: text || "#000000",
        borderColor: "#000000"
      }}
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
        {/* Target Group: 1st 30 / 2nd 30 in distinct yellow/amber styling */}
        {group && group !== "All" && (
          <span
            className="text-[11px] font-black mt-0.5 px-1.5 py-0.2 rounded"
            style={{
              color: isCT ? "#fef08a" : "#b45309",
              backgroundColor: isCT ? "#18181b" : "#fef3c7",
              letterSpacing: "-0.2px"
            }}
          >
            {group}
          </span>
        )}
      </div>
    </td>
  );
}
