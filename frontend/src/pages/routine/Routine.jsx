/**
 * File: Routine.jsx
 * Description: Displays the weekly class routine in a graphical calendar grid.
 * 
 * This file is part of the RUET OneHub Project.
 */

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import routineService from "../../services/routineService";
import { calendarService } from "../../services/calendarService";
import { PageLoader } from "../../components/common/Loader";
import { Calendar, Clock, MapPin, User as UserIcon, CalendarOff } from "lucide-react";

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
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [routineData, holidayData] = await Promise.all([
          routineService.getWeeklyRoutine(),
          calendarService.getHolidays().catch(() => [])
        ]);
        setClasses(routineData.routine || routineData.classes || []);
        setHolidays(holidayData || []);
      } catch (err) {
        console.error("Failed to fetch routine/holidays", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // Update current time every minute for the red line indicator
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const classLayouts = useMemo(() => {
    const layouts = {};
    DAYS.forEach(day => {
      const dayClasses = classes.filter(c => c.dayOfWeek === day);
      dayClasses.sort((a, b) => parseTime(a.startTime) - parseTime(b.startTime));

      const columns = [];
      dayClasses.forEach(c => {
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
      dayClasses.forEach(c => {
        layouts[c._id] = {
          width: `calc(${100 / numCols}% - 4px)`,
          left: `calc(${(100 / numCols) * c._col}% + 2px)`
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
    if (!start || !end || start >= end) return { display: 'none' };

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
        style={{ top: `${top}px`, transform: 'translateY(-50%)' }}
      >
        <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)] pulse-dot -ml-1 shrink-0 z-10" />
        <div className="flex-1 h-[2px] bg-rose-500/80 shadow-[0_0_5px_rgba(244,63,94,0.5)]" />
      </div>
    );
  };

  if (loading) return <PageLoader />;

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
        <div className={`flex-1 border-l border-slate-200/80 ${slot.isBreak ? 'bg-slate-100/70 flex items-center justify-center border-y border-dashed border-slate-300' : ''}`}>
           {slot.isBreak && <span className="text-xs sm:text-sm font-black text-slate-400/80 tracking-[0.2em] uppercase">{slot.label.includes("01:20") ? "Lunch Break" : "Tea Break"}</span>}
        </div>
      </div>
    );
  });
  
  hourLines.push(
    <div key="end-line" className="absolute left-0 right-0 border-t border-slate-200/80" style={{ top: `${(END_HOUR - START_HOUR) * HOUR_HEIGHT}px` }}>
    </div>
  );

  const hourLabels = TIME_SLOTS.map((slot, index) => {
    const style = getStyleForSlot(slot.start, slot.end);
    return (
      <div key={index} className="absolute left-0 right-0 flex flex-col justify-center items-end text-right pr-1.5 sm:pr-3" style={style}>
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
    const todayClasses = classes.filter(c => c.dayOfWeek === currentDayStr);
    
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
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center space-x-2">
            <Calendar className="w-7 h-7 text-sky-600" />
            <span>Weekly Class Routine</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {user?.role === "student" 
              ? `Department of ${user?.department} • Batch '${user?.batch}`
              : `Faculty Member • Department of ${user?.department}`}
          </p>
        </div>

        {displayClass && (
            <div className="bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-100 p-4 rounded-xl flex items-start space-x-4 max-w-sm">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isCurrent ? 'bg-indigo-200/50 text-indigo-700' : 'bg-sky-200/50 text-sky-700'}`}>
                <Clock className={`w-5 h-5 ${isCurrent ? 'animate-pulse' : ''}`} />
              </div>
              <div>
                <p className={`text-xs font-semibold uppercase tracking-wider ${isCurrent ? 'text-indigo-700' : 'text-sky-700'}`}>
                  {isCurrent ? "Currently Ongoing" : "Next Upcoming Class"}
                </p>
                <h4 className="text-base font-bold text-slate-800 mt-0.5">{displayClass.courseCode}</h4>
                <div className="flex items-center text-xs text-slate-600 mt-1 space-x-3">
                  <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1" /> {displayClass.dayOfWeek}</span>
                  <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1" /> {displayClass.startTime} - {displayClass.endTime}</span>
                  <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1" /> {displayClass.roomOrLab}</span>
                </div>
              </div>
            </div>
          )}
      </div>

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
                  className={`flex-1 text-center py-3 sm:py-4 border-r last:border-r-0 border-slate-200 transition-colors ${isToday ? 'bg-sky-50/90' : ''} ${isHoliday ? 'bg-rose-50/50' : ''}`}
                >
                  <span className={`text-xs sm:text-sm font-semibold uppercase tracking-wider ${isToday ? 'text-sky-700' : (isHoliday ? 'text-rose-600' : 'text-slate-600')}`}>
                    {window.innerWidth < 640 ? day.substring(0, 3) : day}
                  </span>
                  <div className="flex justify-center mt-1 space-x-1">
                    {isToday && <span className="text-[10px] font-bold text-sky-600 bg-sky-100 rounded-full px-2 py-0.5 inline-block">TODAY</span>}
                    {isHoliday && <span className="text-[10px] font-bold text-rose-600 bg-rose-100 rounded-full px-2 py-0.5 inline-block">HOLIDAY</span>}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex relative">
            
            {/* Hour Markers Background */}
            <div className="absolute inset-0 pt-[35px] pointer-events-none">
              {hourLines}
            </div>

            {/* Sticky Time labels column */}
              <div className="w-16 sm:w-20 shrink-0 border-r border-slate-200 z-20 bg-slate-50 sticky left-0 relative">
                <div className="absolute inset-0 pt-[35px] pointer-events-none">
                  {hourLabels}
                </div>
              </div>

            {/* Day Columns */}
            {DAYS.map((day) => {
              const holiday = getHolidayForDay(day);

              return (
                <div key={day} className="flex-1 border-r last:border-r-0 border-slate-200 relative pt-[35px]" style={{ minHeight: `${(END_HOUR - START_HOUR) * HOUR_HEIGHT}px` }}>
                  {/* Current Time Indicator Line */}
                  {getCurrentTimeLine(day)}

                  {holiday ? (
                    <div className="absolute inset-0 m-3 mt-10 rounded-2xl bg-rose-50/80 border-2 border-dashed border-rose-200 flex flex-col items-center justify-center text-center p-4">
                      <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center mb-3">
                        <CalendarOff className="w-6 h-6" />
                      </div>
                      <h3 className="font-bold text-rose-800 mb-1">{holiday.title}</h3>
                      <p className="text-xs text-rose-600 font-medium">Classes Suspended</p>
                    </div>
                  ) : (
                    /* Render Classes for this Day */
                    classes
                      .filter((c) => c.dayOfWeek === day)
                      .map((c) => {
                        const baseStyle = getStyleForSlot(c.startTime, c.endTime);
                        const layoutStyle = classLayouts[c._id] || { width: 'calc(100% - 4px)', left: '2px' };
                        const style = { ...baseStyle, ...layoutStyle };
                        const isSessional = c.type === "sessional" || c.type === "project";
                        
                        return (
                          <div
                            key={c._id}
                            className={`absolute rounded-xl p-1.5 sm:p-2 overflow-hidden shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer border-l-4 group ${
                              isSessional
                                ? "bg-indigo-50 border-indigo-500 hover:bg-indigo-100"
                                : "bg-sky-50 border-sky-500 hover:bg-sky-100"
                            }`}
                            style={style}
                            title={`${c.courseCode} - ${c.courseName}\nRoom: ${c.roomOrLab}\nTeacher: ${c.teacherInitials.join(", ")}`}
                          >
                            <div className="h-full flex flex-col relative z-10">
                              <div className="flex justify-between items-start">
                                <h4 className={`text-xs sm:text-sm font-bold truncate shrink-0 ${isSessional ? "text-indigo-800" : "text-sky-800"}`}>
                                  {c.courseCode}
                                </h4>
                                {c.targetGroup && c.targetGroup !== "All" && (
                                  <span className="text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-white/70 text-indigo-700 ml-1 shrink-0">
                                    {c.targetGroup}
                                  </span>
                                )}
                              </div>
                              <p className={`text-[10px] sm:text-xs truncate font-medium mt-0.5 shrink-0 ${isSessional ? "text-indigo-600" : "text-sky-600"}`}>
                                {c.startTime} - {c.endTime}
                              </p>
                              
                              {c.assessmentType && c.assessmentType !== 'None' && (
                                <div className="mt-1 flex items-start gap-1 bg-red-100/90 text-red-700 px-1.5 py-0.5 rounded text-[9px] font-bold border border-red-200/50">
                                  <span className="shrink-0">⚠️ {c.assessmentType}</span>
                                  {c.assessmentInfo && <span className="truncate font-medium opacity-90">- {c.assessmentInfo}</span>}
                                </div>
                              )}

                              <div className="mt-auto space-y-0.5 pt-1">
                                <div className={`flex items-center text-[10px] sm:text-xs font-semibold ${isSessional ? "text-indigo-700" : "text-sky-700"}`}>
                                  <MapPin className="w-3 h-3 mr-1 shrink-0" />
                                  <span className="truncate">{c.roomOrLab}</span>
                                </div>
                                {c.teacherInitials && c.teacherInitials.length > 0 && (
                                  <div className={`flex items-center text-[10px] sm:text-xs ${isSessional ? "text-indigo-700/80" : "text-sky-700/80"}`}>
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
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse-dot {
          0% { box-shadow: 0 0 0 0 rgba(244, 63, 94, 0.7); }
          70% { box-shadow: 0 0 0 6px rgba(244, 63, 94, 0); }
          100% { box-shadow: 0 0 0 0 rgba(244, 63, 94, 0); }
        }
        .pulse-dot {
          animation: pulse-dot 2s infinite;
        }
      `}} />
    </div>
  );
}

export default Routine;
