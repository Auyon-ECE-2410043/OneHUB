/**
 * File: Routine.jsx
 * Description: Displays the weekly class routine in a graphical calendar grid with integrated CT and Quiz syllabus management.
 * 
 * This file is part of the RUET OneHub Project.
 */

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import routineService from "../../services/routineService";
import { calendarService } from "../../services/calendarService";
import { PageLoader } from "../../components/common/Loader";
import {
  Calendar,
  Clock,
  MapPin,
  User as UserIcon,
  CalendarOff,
  Plus,
  FileText,
  Trash2,
  BookOpen,
  FlaskConical,
  Download,
  X,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Bus,
  CalendarPlus,
} from "lucide-react";
import { toast } from "sonner";
import RoutineVisualExporter from "../admin/RoutineVisualExporter";
import CampusBusSchedule from "./CampusBusSchedule";
import GoogleCalendarExportModal from "../../components/routine/GoogleCalendarExportModal";
import { SEMESTERS, getSeriesDefaultSemester } from "../../utils/constants";

const DAYS = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const START_HOUR = 8; // 08:00
const END_HOUR = 17; // 17:00
const HOUR_HEIGHT = 110; // px per hour

const parseTime = (timeStr) => {
  if (!timeStr) return 0;
  // Handle "08:00 AM" format if it exists
  if (timeStr.includes(" ")) {
    const [time, period] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    return hours + minutes / 60;
  }
  
  // Handle "08:00" format (auto-convert 1 PM - 7 PM to 24-hour)
  let [h, m] = timeStr.split(":").map(Number);
  if (h >= 1 && h <= 7) h += 12;
  return h + m / 60;
};

export function Routine() {
  const { user } = useAuth();
  const defaultSemester = getSeriesDefaultSemester(user) || "2-2";
  const [activeView, setActiveView] = useState("routine"); // "routine" | "bus"
  const [selectedSemester, setSelectedSemester] = useState(defaultSemester);
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Assessment Syllabus State
  const [ctSyllabus, setCtSyllabus] = useState([]);
  const [quizSyllabus, setQuizSyllabus] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showTimetableModal, setShowTimetableModal] = useState(false);
  const [showGoogleCalendarModal, setShowGoogleCalendarModal] = useState(false);
  const [submittingSyllabus, setSubmittingSyllabus] = useState(false);

  const [syllabusForm, setSyllabusForm] = useState({
    type: "CT",
    courseCode: "",
    title: "CT 1",
    syllabus: "",
    assessmentDate: "",
    roomOrLab: "",
    teacherInitials: "",
    targetGroup: "All",
  });

  const fetchSyllabus = async (sem = selectedSemester) => {
    try {
      const res = await routineService.getSyllabus({ semester: sem });
      setCtSyllabus(res.ctSyllabus || []);
      setQuizSyllabus(res.quizSyllabus || []);
    } catch (err) {
      console.warn("Could not fetch syllabus", err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [routineData, holidayData, syllabusData] = await Promise.all([
          routineService.getWeeklyRoutine(),
          calendarService.getHolidays().catch(() => []),
          routineService.getSyllabus({ semester: selectedSemester }).catch(() => ({ ctSyllabus: [], quizSyllabus: [] })),
        ]);
        setClasses(routineData.routine || routineData.classes || []);
        setHolidays(holidayData || []);
        setCtSyllabus(syllabusData.ctSyllabus || []);
        setQuizSyllabus(syllabusData.quizSyllabus || []);
      } catch (err) {
        console.error("Failed to fetch routine/holidays/syllabus", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // Update current time every minute for the red line indicator
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, [selectedSemester]);

  // Handle saving syllabus
  const handleSaveSyllabus = async (e) => {
    e.preventDefault();
    if (!syllabusForm.courseCode.trim() || !syllabusForm.syllabus.trim()) {
      toast.error("Please enter course code and syllabus topics");
      return;
    }
    setSubmittingSyllabus(true);
    try {
      await routineService.addSyllabus({
        ...syllabusForm,
        semester: selectedSemester,
        department: user?.department || "ECE",
      });
      toast.success(`${syllabusForm.type} syllabus saved successfully!`);
      setIsAddModalOpen(false);
      setSyllabusForm({
        type: "CT",
        courseCode: "",
        title: "CT 1",
        syllabus: "",
        assessmentDate: "",
        roomOrLab: "",
        teacherInitials: "",
        targetGroup: "All",
      });
      fetchSyllabus(selectedSemester);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to save syllabus");
    } finally {
      setSubmittingSyllabus(false);
    }
  };

  // Handle deleting syllabus
  const handleDeleteSyllabus = async (id) => {
    if (!window.confirm("Are you sure you want to remove this syllabus entry?")) return;
    try {
      await routineService.deleteSyllabus(id);
      toast.success("Syllabus entry deleted");
      fetchSyllabus(selectedSemester);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to delete syllabus");
    }
  };

  // Course codes suggestions
  const availableCourseCodes = useMemo(() => {
    const list = new Set();
    classes.forEach((c) => {
      if (c.courseCode) list.add(c.courseCode.trim().toUpperCase());
    });
    if (list.size === 0) {
      ["ECE 2201", "ECE 2203", "ECE 2205", "ECE 2207", "MATH 2217", "ECE 2202", "ECE 2204", "ECE 2206"].forEach((c) =>
        list.add(c)
      );
    }
    return Array.from(list).sort();
  }, [classes]);

  const classLayouts = useMemo(() => {
    const layouts = {};
    DAYS.forEach((day) => {
      const dayClasses = classes.filter((c) => c.dayOfWeek === day);
      dayClasses.sort((a, b) => parseTime(a.startTime) - parseTime(b.startTime));

      const columns = [];
      dayClasses.forEach((c) => {
        const start = parseTime(c.startTime);
        const end = parseTime(c.endTime);
        let placed = false;

        for (let i = 0; i < columns.length; i++) {
          const col = columns[i];
          const lastClass = col[col.length - 1];
          const lastEnd = parseTime(lastClass.endTime);

          if (start >= lastEnd) {
            col.push(c);
            placed = true;
            c._col = i;
            break;
          }
        }

        if (!placed) {
          columns.push([c]);
          c._col = columns.length - 1;
        }
      });

      const numCols = columns.length;
      dayClasses.forEach((c) => {
        layouts[c._id] = {
          width: `calc(${100 / numCols}% - 4px)`,
          left: `calc(${(100 / numCols) * c._col}% + 2px)`,
        };
      });
    });
    return layouts;
  }, [classes]);

  const getWeekDates = () => {
    const today = new Date();
    const currentDayVal = today.getDay(); // 0 = Sunday, 6 = Saturday
    let offsetToSat = currentDayVal === 6 ? 0 : currentDayVal + 1;

    const satDate = new Date(today);
    satDate.setDate(today.getDate() - offsetToSat);
    satDate.setHours(0, 0, 0, 0);

    const dates = {};
    DAYS.forEach((d, i) => {
      const dd = new Date(satDate);
      dd.setDate(satDate.getDate() + i);
      dates[d] = dd;
    });
    return dates;
  };

  const weekDates = getWeekDates();

  const getHolidayForDay = (day) => {
    const dayDate = weekDates[day];
    return holidays.find((h) => {
      if (!h.classesSuspended) return false;
      const start = new Date(h.startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(h.endDate);
      end.setHours(23, 59, 59, 999);
      return dayDate >= start && dayDate <= end;
    });
  };

  const getStyleForSlot = (startTime, endTime) => {
    const start = parseTime(startTime);
    const end = parseTime(endTime);

    // Fallbacks to avoid crashes on invalid time
    if (!start || !end || start >= end) return { display: "none" };

    const top = (start - START_HOUR) * HOUR_HEIGHT;
    const height = (end - start) * HOUR_HEIGHT;

    return {
      top: `${top}px`,
      height: `${height}px`,
    };
  };

  const getCurrentTimeLine = (day) => {
    const currentDayStr = currentTime.toLocaleString("en-US", { weekday: "long", timeZone: "Asia/Dhaka" });
    if (day !== currentDayStr) return null;

    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const timeInHours = hours + minutes / 60;

    if (timeInHours < START_HOUR || timeInHours > END_HOUR) return null;

    const top = (timeInHours - START_HOUR) * HOUR_HEIGHT;

    return (
      <div
        className="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
        style={{ top: `${top}px`, transform: "translateY(-50%)" }}
      >
        <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)] pulse-dot -ml-1 shrink-0 z-10" />
        <div className="flex-1 h-[2px] bg-rose-500/80 shadow-[0_0_5px_rgba(244,63,94,0.5)]" />
      </div>
    );
  };

  if (loading) return <PageLoader text="Loading class routine & syllabus..." />;

  const TIME_SLOTS = [
    { label: "08:00 - 08:50", start: "08:00", end: "08:50" },
    { label: "08:50 - 09:40", start: "08:50", end: "09:40" },
    { label: "09:40 - 10:30", start: "09:40", end: "10:30" },
    { label: "10:30 - 10:50", start: "10:30", end: "10:50", isBreak: true },
    { label: "10:50 - 11:40", start: "10:50", end: "11:40" },
    { label: "11:40 - 12:30", start: "11:40", end: "12:30" },
    { label: "12:30 - 01:20", start: "12:30", end: "01:20" },
    { label: "01:20 - 02:30", start: "01:20", end: "02:30", isBreak: true },
    { label: "02:30 - 03:20", start: "02:30", end: "03:20" },
    { label: "03:20 - 04:10", start: "03:20", end: "04:10" },
    { label: "04:10 - 05:00", start: "04:10", end: "05:00" },
  ];

  const hourLines = TIME_SLOTS.map((slot, index) => {
    const style = getStyleForSlot(slot.start, slot.end);
    return (
      <div key={index} className="absolute left-0 right-0 flex border-t border-slate-200/80" style={style}>
        {/* Spacer for sticky column */}
        <div className="w-16 sm:w-20 shrink-0"></div>
        <div
          className={`flex-1 border-l border-slate-200/80 ${
            slot.isBreak
              ? "bg-slate-100/70 flex items-center justify-center border-y border-dashed border-slate-300"
              : ""
          }`}
        >
          {slot.isBreak && (
            <span className="text-xs sm:text-sm font-black text-slate-400/80 tracking-[0.2em] uppercase">
              {slot.label.includes("01:20") ? "Lunch Break" : "Tea Break"}
            </span>
          )}
        </div>
      </div>
    );
  });

  hourLines.push(
    <div
      key="end-line"
      className="absolute left-0 right-0 border-t border-slate-200/80"
      style={{ top: `${(END_HOUR - START_HOUR) * HOUR_HEIGHT}px` }}
    ></div>
  );

  const hourLabels = TIME_SLOTS.map((slot, index) => {
    const style = getStyleForSlot(slot.start, slot.end);
    return (
      <div
        key={index}
        className="absolute left-0 right-0 flex flex-col justify-center items-end text-right pr-1.5 sm:pr-3"
        style={style}
      >
        <span className="leading-none text-[10px] sm:text-xs font-bold text-slate-700">{slot.label.split(" - ")[0]}</span>
        <span className="text-[8px] text-slate-400 my-0.5 font-medium uppercase">to</span>
        <span className="leading-none text-[10px] sm:text-xs font-bold text-slate-700">{slot.label.split(" - ")[1]}</span>
      </div>
    );
  });

  // Find next upcoming class
  const getNextUpcomingClass = () => {
    const currentDayStr = currentTime.toLocaleString("en-US", { weekday: "long", timeZone: "Asia/Dhaka" });
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const timeInHours = hours + minutes / 60;

    // Only check today's classes
    const todayClasses = classes.filter((c) => c.dayOfWeek === currentDayStr);

    // Sort by start time
    todayClasses.sort((a, b) => parseTime(a.startTime) - parseTime(b.startTime));

    let current = null;
    let next = null;

    for (const c of todayClasses) {
      const start = parseTime(c.startTime);
      const end = parseTime(c.endTime);

      if (timeInHours >= start && timeInHours < end) {
        current = c;
      } else if (start >= timeInHours && !next) {
        next = c;
      }
    }

    return { current, next };
  };

  const { current: currentClass, next: nextUpcoming } = getNextUpcomingClass();
  const displayClass = currentClass || nextUpcoming;
  const isCurrent = !!currentClass;

  return (
    <div className="space-y-6 max-w-full pb-10">
      {/* Top View Mode Switcher */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl w-max border border-slate-200">
        <button
          type="button"
          onClick={() => setActiveView("routine")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeView === "routine"
              ? "bg-white text-sky-700 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Calendar className="w-4 h-4 text-sky-600" />
          <span>Weekly Class Routine &amp; Syllabus</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveView("bus")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeView === "bus"
              ? "bg-white text-emerald-700 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Bus className="w-4 h-4 text-emerald-600" />
          <span>Campus Bus Schedule &amp; Routes</span>
          <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 text-[9.5px] font-bold uppercase">
            5 Routes
          </span>
        </button>
      </div>

      {activeView === "bus" ? (
        <CampusBusSchedule />
      ) : (
        <>
          {/* Top Header Bar */}
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center space-x-2">
            <Calendar className="w-7 h-7 text-sky-600" />
            <span>Weekly Class Routine</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {user?.role === "student"
              ? `Department of ${user?.department || "ECE"} • Batch '${user?.batch || "24"} • Semester ${selectedSemester}`
              : `Faculty Member • Department of ${user?.department || "ECE"}`}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Semester Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <span className="text-xs font-semibold text-slate-500 uppercase">Sem:</span>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="text-xs font-bold bg-transparent text-slate-800 focus:outline-none cursor-pointer"
            >
              {SEMESTERS.map((s) => (
                <option key={s} value={s}>
                  Semester {s}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setShowTimetableModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
            title="View official departmental high-res timetable wallpaper"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Timetable Wallpaper</span>
          </button>

          <button
            type="button"
            onClick={() => setShowGoogleCalendarModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-sky-50 to-indigo-50 hover:from-sky-100 hover:to-indigo-100 text-sky-800 text-xs font-bold rounded-xl border border-sky-200 transition cursor-pointer shadow-2xs"
            title="Sync routine to Google Calendar / Phone Calendar (.ics)"
          >
            <CalendarPlus className="w-3.5 h-3.5 text-sky-600" />
            <span>Sync Google Calendar</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSyllabusForm({
                type: "CT",
                courseCode: availableCourseCodes[0] || "",
                title: "CT 1",
                syllabus: "",
                assessmentDate: "",
                roomOrLab: "",
                teacherInitials: "",
                targetGroup: "All",
              });
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Syllabus</span>
          </button>
        </div>
      </div>

      {/* Ongoing / Next Class Banner */}
      {displayClass && (
        <div className="bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-100 p-4 rounded-xl flex items-start space-x-4 max-w-full">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
              isCurrent ? "bg-indigo-200/50 text-indigo-700" : "bg-sky-200/50 text-sky-700"
            }`}
          >
            <Clock className={`w-5 h-5 ${isCurrent ? "animate-pulse" : ""}`} />
          </div>
          <div>
            <p className={`text-xs font-semibold uppercase tracking-wider ${isCurrent ? "text-indigo-700" : "text-sky-700"}`}>
              {isCurrent ? "Currently Ongoing" : "Next Upcoming Class"}
            </p>
            <h4 className="text-base font-bold text-slate-800 mt-0.5">{displayClass.courseCode}</h4>
            <div className="flex items-center text-xs text-slate-600 mt-1 space-x-3">
              <span className="flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1" /> {displayClass.dayOfWeek}
              </span>
              <span className="flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1" /> {displayClass.startTime} - {displayClass.endTime}
              </span>
              <span className="flex items-center">
                <MapPin className="w-3.5 h-3.5 mr-1" /> {displayClass.roomOrLab}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Grid */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex h-[800px]">
        {/* Scrollable Area */}
        <div className="flex-1 overflow-auto relative scroll-smooth bg-slate-50/30">
          <div className="min-w-[700px] h-full relative">
            {/* Days Header */}
            <div className="flex border-b border-slate-200 bg-slate-50/95 backdrop-blur-sm sticky top-0 z-30 shadow-sm">
              <div className="w-16 sm:w-20 shrink-0 border-r border-slate-200 bg-slate-50/95 sticky left-0 z-40"></div>
              {DAYS.map((day) => {
                const isToday = day === new Date().toLocaleString("en-US", { weekday: "long", timeZone: "Asia/Dhaka" });
                const isHoliday = !!getHolidayForDay(day);

                return (
                  <div
                    key={day}
                    className={`flex-1 text-center py-3 sm:py-4 border-r last:border-r-0 border-slate-200 transition-colors ${
                      isToday ? "bg-sky-50/90" : ""
                    } ${isHoliday ? "bg-rose-50/50" : ""}`}
                  >
                    <span
                      className={`text-xs sm:text-sm font-semibold uppercase tracking-wider ${
                        isToday ? "text-sky-700" : isHoliday ? "text-rose-600" : "text-slate-600"
                      }`}
                    >
                      {window.innerWidth < 640 ? day.substring(0, 3) : day}
                    </span>
                    <div className="flex justify-center mt-1 space-x-1">
                      {isToday && (
                        <span className="text-[10px] font-bold text-sky-600 bg-sky-100 rounded-full px-2 py-0.5 inline-block">
                          TODAY
                        </span>
                      )}
                      {isHoliday && (
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-100 rounded-full px-2 py-0.5 inline-block">
                          HOLIDAY
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Grid Body */}
            <div className="relative flex" style={{ height: `${(END_HOUR - START_HOUR) * HOUR_HEIGHT}px` }}>
              {/* Background horizontal hour lines */}
              {hourLines}

              {/* Sticky Left Column: Hour Labels */}
              <div className="w-16 sm:w-20 shrink-0 border-r border-slate-200 bg-white/95 backdrop-blur-xs sticky left-0 z-20">
                {hourLabels}
              </div>

              {/* Day Columns */}
              {DAYS.map((day) => {
                const isHoliday = !!getHolidayForDay(day);
                const holiday = getHolidayForDay(day);

                return (
                  <div key={day} className="flex-1 border-r last:border-r-0 border-slate-200/80 relative">
                    {/* Real-time Indicator Line */}
                    {getCurrentTimeLine(day)}

                    {isHoliday ? (
                      /* Render Full Day Holiday Banner */
                      <div className="absolute inset-0 bg-rose-50/40 backdrop-blur-[1px] m-1.5 rounded-xl border-2 border-dashed border-rose-300 flex flex-col items-center justify-center p-4 text-center z-10 pointer-events-none">
                        <CalendarOff className="w-8 h-8 text-rose-400 mb-2" />
                        <h3 className="font-bold text-rose-800 mb-1">{holiday.title}</h3>
                        <p className="text-xs text-rose-600 font-medium">Classes Suspended</p>
                      </div>
                    ) : (
                      /* Render Classes for this Day */
                      classes
                        .filter((c) => c.dayOfWeek === day)
                        .map((c) => {
                          const baseStyle = getStyleForSlot(c.startTime, c.endTime);
                          const layoutStyle = classLayouts[c._id] || { width: "calc(100% - 4px)", left: "2px" };
                          const style = { ...baseStyle, ...layoutStyle };
                          const isSessional = c.type === "sessional" || c.type === "project";

                          return (
                            <div
                              key={c._id}
                              className={`absolute rounded-xl p-1.5 sm:p-2 overflow-hidden shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer border-l-4 group ${
                                isSessional
                                  ? "bg-indigo-50 border-indigo-500 hover:bg-indigo-100"
                                  : "bg-sky-50 border-sky-500 hover:bg-sky-100"
                              }`}
                              style={style}
                              title={`${c.courseCode} - ${c.courseName}\nRoom: ${c.roomOrLab}\nTeacher: ${c.teacherInitials?.join(
                                ", "
                              )}`}
                            >
                              <div className="h-full flex flex-col relative z-10">
                                <div className="flex justify-between items-start">
                                  <h4
                                    className={`text-xs sm:text-sm font-bold truncate shrink-0 ${
                                      isSessional ? "text-indigo-800" : "text-sky-800"
                                    }`}
                                  >
                                    {c.courseCode}
                                  </h4>
                                  {c.targetGroup && c.targetGroup !== "All" && (
                                    <span className="text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-white/70 text-indigo-700 ml-1 shrink-0">
                                      {c.targetGroup}
                                    </span>
                                  )}
                                </div>
                                <p
                                  className={`text-[10px] sm:text-xs truncate font-medium mt-0.5 shrink-0 ${
                                    isSessional ? "text-indigo-600" : "text-sky-600"
                                  }`}
                                >
                                  {c.startTime} - {c.endTime}
                                </p>

                                {c.assessmentType && c.assessmentType !== "None" && (
                                  <div className="mt-1 flex items-start gap-1 bg-red-100/90 text-red-700 px-1.5 py-0.5 rounded text-[9px] font-bold border border-red-200/50">
                                    <span className="shrink-0">⚠️ {c.assessmentType}</span>
                                    {c.assessmentInfo && <span className="truncate font-medium opacity-90">- {c.assessmentInfo}</span>}
                                  </div>
                                )}

                                <div className="mt-auto space-y-0.5 pt-1">
                                  <div
                                    className={`flex items-center text-[10px] sm:text-xs font-semibold ${
                                      isSessional ? "text-indigo-700" : "text-sky-700"
                                    }`}
                                  >
                                    <MapPin className="w-3 h-3 mr-1 shrink-0" />
                                    <span className="truncate">{c.roomOrLab}</span>
                                  </div>
                                  {c.teacherInitials && c.teacherInitials.length > 0 && (
                                    <div
                                      className={`flex items-center text-[10px] sm:text-xs ${
                                        isSessional ? "text-indigo-700/80" : "text-sky-700/80"
                                      }`}
                                    >
                                      <UserIcon className="w-3 h-3 mr-1 shrink-0" />
                                      <span className="truncate">{c.teacherInitials.join(", ")}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* CT & QUIZ SYLLABUS SECTION AT BOTTOM OF ROUTINE */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  Class Test (CT) &amp; Quiz Syllabus
                </h3>
                <p className="text-xs text-slate-500">
                  Official syllabus topics for Semester {selectedSemester} &middot; Department of {user?.department || "ECE"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTimetableModal(true)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition cursor-pointer"
              title="View and download high-resolution official timetable wallpaper"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Official Timetable Wallpaper</span>
            </button>

            <button
              onClick={() => {
                setSyllabusForm({
                  type: "CT",
                  courseCode: availableCourseCodes[0] || "",
                  title: "CT 1",
                  syllabus: "",
                  assessmentDate: "",
                  roomOrLab: "",
                  teacherInitials: "",
                  targetGroup: "All",
                });
                setIsAddModalOpen(true);
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add / Update Syllabus</span>
            </button>
          </div>
        </div>

        {/* 2 Columns: Theory CTs vs Sessional Lab Quizzes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Column 1: Theory Course CT Syllabus */}
          <div className="bg-slate-50/70 rounded-2xl p-4.5 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <h4 className="font-bold text-sm text-slate-800">
                  Class Test (CT) Syllabus
                </h4>
              </div>
              <span className="text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
                Theory ({ctSyllabus.length})
              </span>
            </div>

            {ctSyllabus.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-400 space-y-2">
                <BookOpen className="w-7 h-7 mx-auto opacity-30 text-slate-400" />
                <p className="font-medium">No Class Test (CT) syllabus posted yet for this semester.</p>
                <p className="text-[11px] text-slate-400">Click &quot;Add / Update Syllabus&quot; to post topics for your batch.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {ctSyllabus.map((item, idx) => (
                  <div
                    key={item._id || idx}
                    className="p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-xs hover:border-indigo-300 transition-all space-y-2 group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {item.courseCode}
                        </span>
                        <span className="text-xs font-bold text-slate-800">
                          {item.title || "Class Test"}
                        </span>
                        {item.targetGroup && item.targetGroup !== "All" && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                            {item.targetGroup}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100">
                        {item.teacherInitials && (
                          <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {item.teacherInitials}
                          </span>
                        )}
                        {item._id && (
                          <button
                            type="button"
                            onClick={() => handleDeleteSyllabus(item._id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition cursor-pointer"
                            title="Delete syllabus topic"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 font-medium leading-relaxed pl-1 border-l-2 border-indigo-500 bg-indigo-50/30 p-2 rounded-r-lg">
                      {item.syllabus}
                    </p>

                    {(item.assessmentDate || item.roomOrLab) && (
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                        {item.assessmentDate && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {item.assessmentDate}
                          </span>
                        )}
                        {item.roomOrLab && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {item.roomOrLab}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Column 2: Sessional Lab Quiz Syllabus */}
          <div className="bg-slate-50/70 rounded-2xl p-4.5 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <h4 className="font-bold text-sm text-slate-800">
                  Lab Quiz &amp; Sessional Syllabus
                </h4>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                Sessional ({quizSyllabus.length})
              </span>
            </div>

            {quizSyllabus.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-400 space-y-2">
                <FlaskConical className="w-7 h-7 mx-auto opacity-30 text-slate-400" />
                <p className="font-medium">No Lab Quiz syllabus scheduled yet for this semester.</p>
                <p className="text-[11px] text-slate-400">Click &quot;Add / Update Syllabus&quot; to post topics for your batch.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {quizSyllabus.map((item, idx) => (
                  <div
                    key={item._id || idx}
                    className="p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-xs hover:border-emerald-300 transition-all space-y-2 group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {item.courseCode}
                        </span>
                        <span className="text-xs font-bold text-slate-800">
                          {item.title || "Lab Quiz"}
                        </span>
                        {item.targetGroup && item.targetGroup !== "All" && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                            {item.targetGroup}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100">
                        {item.teacherInitials && (
                          <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {item.teacherInitials}
                          </span>
                        )}
                        {item._id && (
                          <button
                            type="button"
                            onClick={() => handleDeleteSyllabus(item._id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition cursor-pointer"
                            title="Delete syllabus topic"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 font-medium leading-relaxed pl-1 border-l-2 border-emerald-500 bg-emerald-50/30 p-2 rounded-r-lg">
                      {item.syllabus}
                    </p>

                    {(item.assessmentDate || item.roomOrLab) && (
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                        {item.assessmentDate && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {item.assessmentDate}
                          </span>
                        )}
                        {item.roomOrLab && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {item.roomOrLab}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      </>
      )}

      {/* MODAL: ADD / UPDATE SYLLABUS */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Post Assessment Syllabus</h3>
                  <p className="text-xs text-slate-500">Semester {selectedSemester} &middot; Department of {user?.department || "ECE"}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSyllabus} className="p-6 space-y-4">
              {/* Type selector */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Assessment Category
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSyllabusForm({ ...syllabusForm, type: "CT", title: "CT 1" })}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition ${
                      syllabusForm.type === "CT"
                        ? "bg-rose-50 border-rose-300 text-rose-700 shadow-xs"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Class Test (CT)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSyllabusForm({ ...syllabusForm, type: "Quiz", title: "Lab Quiz 1" })}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition ${
                      syllabusForm.type === "Quiz"
                        ? "bg-emerald-50 border-emerald-300 text-emerald-700 shadow-xs"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Lab Quiz (Sessional)
                  </button>
                </div>
              </div>

              {/* Course code & Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                    Course Code *
                  </label>
                  <input
                    type="text"
                    required
                    list="course-codes-list"
                    placeholder="e.g. ECE 2207"
                    value={syllabusForm.courseCode}
                    onChange={(e) => setSyllabusForm({ ...syllabusForm, courseCode: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold uppercase focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <datalist id="course-codes-list">
                    {availableCourseCodes.map((code) => (
                      <option key={code} value={code} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                    Assessment Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CT 1, CT 2, Quiz 1"
                    value={syllabusForm.title}
                    onChange={(e) => setSyllabusForm({ ...syllabusForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Syllabus Content */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Syllabus Chapters / Topics *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder={
                    syllabusForm.type === "Quiz"
                      ? "e.g. Experiment 1 to 3: Frequency response of single stage BJT amplifier"
                      : "e.g. Chapter 1 & 2: Diode Circuits, BJT Biasing, and Small Signal AC Model"
                  }
                  value={syllabusForm.syllabus}
                  onChange={(e) => setSyllabusForm({ ...syllabusForm, syllabus: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none leading-relaxed"
                ></textarea>
              </div>

              {/* Date, Room & Teacher */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                    Scheduled Time
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Tuesday 10:50 AM"
                    value={syllabusForm.assessmentDate}
                    onChange={(e) => setSyllabusForm({ ...syllabusForm, assessmentDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                    Room / Lab
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. R-404 / Lab-2"
                    value={syllabusForm.roomOrLab}
                    onChange={(e) => setSyllabusForm({ ...syllabusForm, roomOrLab: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                    Teacher Initials
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. FT+NRP"
                    value={syllabusForm.teacherInitials}
                    onChange={(e) => setSyllabusForm({ ...syllabusForm, teacherInitials: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs uppercase focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Target Group */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Target Group
                </label>
                <select
                  value={syllabusForm.targetGroup}
                  onChange={(e) => setSyllabusForm({ ...syllabusForm, targetGroup: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                >
                  <option value="All">All Students (Whole Batch)</option>
                  <option value="1st 30">1st 30 (Rolls 01-30)</option>
                  <option value="2nd 30">2nd 30 (Rolls 31+)</option>
                </select>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingSyllabus}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                >
                  {submittingSyllabus ? "Saving Syllabus..." : "Save & Broadcast"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: OFFICIAL TIMETABLE WALLPAPER / IMAGE EXPORTER */}
      {showTimetableModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-fade-in">
          <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 w-full max-w-7xl max-h-[96vh] overflow-y-auto p-4 sm:p-6 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700 mb-4">
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">
                  Official Departmental Timetable Image (High-Res PNG)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTimetableModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <RoutineVisualExporter
              initialSemKey={selectedSemester}
              onClose={() => setShowTimetableModal(false)}
            />
          </div>
        </div>
      )}

      {/* MODAL: GOOGLE CALENDAR / PHONE CALENDAR EXPORT */}
      <GoogleCalendarExportModal
        isOpen={showGoogleCalendarModal}
        onClose={() => setShowGoogleCalendarModal(false)}
        classes={classes}
        user={user}
      />

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes pulse-dot {
          0% { box-shadow: 0 0 0 0 rgba(244, 63, 94, 0.7); }
          70% { box-shadow: 0 0 0 6px rgba(244, 63, 94, 0); }
          100% { box-shadow: 0 0 0 0 rgba(244, 63, 94, 0); }
        }
        .pulse-dot {
          animation: pulse-dot 2s infinite;
        }
      `,
        }}
      />
    </div>
  );
}

export default Routine;
