import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import routineService from "../../services/routineService";
import { PageLoader } from "../../components/common/Loader";
import { Calendar, Clock, MapPin, User as UserIcon } from "lucide-react";

const DAYS = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const START_HOUR = 8; // 08:00
const END_HOUR = 17; // 17:00
const HOUR_HEIGHT = 110; // px per hour

export function Routine() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const fetchRoutine = async () => {
      try {
        const data = await routineService.getWeeklyRoutine();
        setClasses(data.routine || data.classes || []);
      } catch (err) {
        console.error("Failed to fetch routine", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoutine();

    // Update current time every minute for the red line indicator
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <PageLoader text="Loading your class routine..." />;
  }

  // Helper to parse HH:mm to minutes from START_HOUR
  const timeToMinutesFromStart = (timeStr) => {
    const [h, m] = timeStr.split(":").map(Number);
    const totalMinutes = (h * 60 + m) - (START_HOUR * 60);
    return totalMinutes;
  };

  // Helper to calculate top and height in px
  const getStyleForSlot = (startTime, endTime) => {
    const startMins = timeToMinutesFromStart(startTime);
    const endMins = timeToMinutesFromStart(endTime);
    const top = (startMins / 60) * HOUR_HEIGHT;
    const height = ((endMins - startMins) / 60) * HOUR_HEIGHT;
    return { top: `${top}px`, height: `${height}px` };
  };

  // Generate current time line position
  const getCurrentTimeLine = (day) => {
    const today = new Date().toLocaleString("en-US", { weekday: "long", timeZone: "Asia/Dhaka" });
    if (day !== today) return null;

    const bdTime = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" }));
    const currentH = bdTime.getHours();
    
    // Only show line if within routine hours
    if (currentH < START_HOUR || currentH > END_HOUR) return null;

    const currentM = bdTime.getMinutes();
    const totalMinutes = (currentH * 60 + currentM) - (START_HOUR * 60);
    const top = (totalMinutes / 60) * HOUR_HEIGHT;

    return (
      <div 
        className="absolute left-0 right-0 z-20 border-t-2 border-rose-500 shadow-sm shadow-rose-500/50 flex items-center"
        style={{ top: `${top}px` }}
      >
        <div className="w-2 h-2 bg-rose-500 rounded-full -ml-1 absolute pulse-dot"></div>
      </div>
    );
  };

  // Find the exact next upcoming class
  const getNextClass = () => {
    const bdTime = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" }));
    const todayStr = bdTime.toLocaleString("en-US", { weekday: "long" });
    const currentH = String(bdTime.getHours()).padStart(2, "0");
    const currentM = String(bdTime.getMinutes()).padStart(2, "0");
    const currentTime24 = `${currentH}:${currentM}`;

    // First try today's remaining classes
    let todayClasses = classes.filter(c => c.dayOfWeek === todayStr && c.startTime > currentTime24);
    if (todayClasses.length > 0) {
      return todayClasses.reduce((prev, curr) => (prev.startTime < curr.startTime ? prev : curr));
    }

    // Otherwise find the very first class of tomorrow or next available day
    const dayIndex = DAYS.indexOf(todayStr);
    for (let i = 1; i <= 7; i++) {
      const nextDay = DAYS[(dayIndex + i) % 7];
      const nextDayClasses = classes.filter(c => c.dayOfWeek === nextDay);
      if (nextDayClasses.length > 0) {
        return nextDayClasses.reduce((prev, curr) => (prev.startTime < curr.startTime ? prev : curr));
      }
    }
    return null;
  };

  const nextUpcoming = getNextClass();

  // Generate background hour lines
  const hourLines = [];
  for (let i = START_HOUR; i <= END_HOUR; i++) {
    const isNoon = i === 12;
    const hourLabel = i > 12 ? `${i - 12}:00 PM` : `${i}:00 AM`;
    hourLines.push(
      <div key={i} className="flex h-[70px] group">
        <div className="w-16 sm:w-20 pr-2 sm:pr-4 text-right text-[10px] sm:text-xs font-medium text-slate-400 group-hover:text-slate-600 transition-colors -mt-2.5">
          {i === 12 ? "12:00 PM" : hourLabel}
        </div>
        <div className="flex-1 border-t border-slate-200/60 group-hover:border-slate-300 transition-colors border-dashed"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4">
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

        {nextUpcoming && (
          <div className="bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-100 p-4 rounded-xl flex items-start space-x-4 max-w-sm">
            <div className="w-10 h-10 rounded-full bg-sky-200/50 flex items-center justify-center text-sky-700 shrink-0">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-sky-700">Next Upcoming Class</p>
              <h4 className="text-base font-bold text-slate-800 mt-0.5">{nextUpcoming.courseCode}</h4>
              <div className="flex items-center text-xs text-slate-600 mt-1 space-x-3">
                <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1" /> {nextUpcoming.dayOfWeek}</span>
                <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1" /> {nextUpcoming.startTime}</span>
                <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1" /> {nextUpcoming.roomOrLab}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col h-[800px]">
        {/* Days Header */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 sticky top-0 z-10">
          <div className="w-16 sm:w-20 shrink-0 border-r border-slate-200"></div>
          {DAYS.map((day) => {
            const isToday = day === new Date().toLocaleString("en-US", { weekday: "long", timeZone: "Asia/Dhaka" });
            return (
              <div 
                key={day} 
                className={`flex-1 text-center py-3 sm:py-4 border-r last:border-r-0 border-slate-200 transition-colors ${isToday ? 'bg-sky-50/80' : ''}`}
              >
                <span className={`text-xs sm:text-sm font-semibold uppercase tracking-wider ${isToday ? 'text-sky-700' : 'text-slate-600'}`}>
                  {window.innerWidth < 640 ? day.substring(0, 3) : day}
                </span>
                {isToday && <div className="mt-1 text-[10px] font-bold text-sky-600 bg-sky-100 rounded-full px-2 py-0.5 inline-block">TODAY</div>}
              </div>
            );
          })}
        </div>

        {/* Time Grid Scrollable Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative scroll-smooth bg-slate-50/30">
          <div className="flex relative">
            
            {/* Hour Markers Background */}
            <div className="absolute inset-0 pt-[35px] pointer-events-none">
              {hourLines}
            </div>

            {/* Empty space for time labels column */}
            <div className="w-16 sm:w-20 shrink-0 border-r border-slate-200 z-10"></div>

            {/* Day Columns */}
            {DAYS.map((day) => (
              <div key={day} className="flex-1 border-r last:border-r-0 border-slate-200 relative min-h-[630px] pt-[35px]">
                {/* Current Time Indicator Line */}
                {getCurrentTimeLine(day)}

                {/* Render Classes for this Day */}
                {classes
                  .filter((c) => c.dayOfWeek === day)
                  .map((c) => {
                    const style = getStyleForSlot(c.startTime, c.endTime);
                    const isSessional = c.type === "sessional" || c.type === "project";
                    
                    return (
                      <div
                        key={c._id}
                        className={`absolute left-1 right-1 sm:left-2 sm:right-2 rounded-xl p-1.5 sm:p-2 overflow-hidden shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer border-l-4 group ${
                          isSessional
                            ? "bg-indigo-50 border-indigo-500 hover:bg-indigo-100"
                            : "bg-sky-50 border-sky-500 hover:bg-sky-100"
                        }`}
                        style={style}
                        title={`${c.courseCode} - ${c.courseName}\nRoom: ${c.roomOrLab}\nTeacher: ${c.teacherInitials.join(", ")}`}
                      >
                        <div className="h-full flex flex-col relative z-10">
                          <h4 className={`text-xs sm:text-sm font-bold truncate shrink-0 ${isSessional ? "text-indigo-800" : "text-sky-800"}`}>
                            {c.courseCode}
                          </h4>
                          <p className={`text-[10px] sm:text-xs truncate font-medium mt-0.5 shrink-0 ${isSessional ? "text-indigo-600" : "text-sky-600"}`}>
                            {c.startTime} - {c.endTime}
                          </p>
                          
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
                  })}
              </div>
            ))}
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
