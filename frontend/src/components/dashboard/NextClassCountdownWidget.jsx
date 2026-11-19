/**
 * File: NextClassCountdownWidget.jsx
 * Description: Live dashboard countdown widget displaying the student's current or upcoming class.
 * Features:
 * - Real-time countdown clock (Starts in X mins / Ends in X mins)
 * - Room / Lab location, course code, teacher initials, and class type
 * - Fallback to upcoming tomorrow/next-day class when today is finished or weekend
 * - Quick "Add Routine to Google Calendar" button
 * - Direct link to full weekly routine
 * 
 * Part of the RUET OneHub Project.
 */

import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Clock,
  MapPin,
  Calendar,
  Sparkles,
  ArrowRight,
  BookOpen,
  FlaskConical,
  CheckCircle2,
  CalendarPlus,
  Coffee
} from "lucide-react";
import routineService from "../../services/routineService";
import GoogleCalendarExportModal from "../routine/GoogleCalendarExportModal";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Helper to parse "08:00" or "01:20 PM" into minutes from midnight
function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  if (timeStr.includes(" ")) {
    const [time, period] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (period.toUpperCase() === "PM" && hours !== 12) hours += 12;
    if (period.toUpperCase() === "AM" && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }
  let [h, m] = timeStr.split(":").map(Number);
  if (h >= 1 && h <= 7) h += 12; // 1-7 PM conversion
  return h * 60 + m;
}

export default function NextClassCountdownWidget({ user }) {
  const [loading, setLoading] = useState(true);
  const [todayClasses, setTodayClasses] = useState([]);
  const [weeklyRoutine, setWeeklyRoutine] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);

  // Update live clock every 10 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Fetch today's schedule and full week routine
  useEffect(() => {
    let isMounted = true;
    const fetchRoutine = async () => {
      try {
        const [todayRes, weekRes] = await Promise.allSettled([
          routineService.getTodayRoutine(),
          routineService.getWeeklyRoutine(),
        ]);

        if (isMounted) {
          if (todayRes.status === "fulfilled" && todayRes.value) {
            setTodayClasses(todayRes.value.classes || []);
          }
          if (weekRes.status === "fulfilled" && weekRes.value) {
            setWeeklyRoutine(weekRes.value.routine || []);
          }
        }
      } catch (err) {
        console.warn("Could not load class routine widget data", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchRoutine();
    return () => {
      isMounted = false;
    };
  }, [user]);

  // Compute status, current class, next class, and countdown
  const classStatus = useMemo(() => {
    const currentDayName = DAYS[currentTime.getDay()];
    const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();

    // 1. Check for Currently Ongoing Class
    const ongoing = todayClasses.find((c) => {
      const startMin = timeToMinutes(c.startTime);
      const endMin = timeToMinutes(c.endTime);
      return currentMinutes >= startMin && currentMinutes < endMin;
    });

    if (ongoing) {
      const endMin = timeToMinutes(ongoing.endTime);
      const minsRemaining = Math.max(1, endMin - currentMinutes);
      return {
        type: "ongoing",
        cls: ongoing,
        label: `Ongoing: ${ongoing.courseCode} in ${ongoing.roomOrLab || "Room TBA"}`,
        subtitle: `Ends in ${minsRemaining} min${minsRemaining === 1 ? "" : "s"} (${ongoing.startTime} - ${ongoing.endTime})`,
        countdown: `${minsRemaining}m remaining`,
        badgeColor: "bg-emerald-500 text-white",
      };
    }

    // 2. Check for Next Upcoming Class Today
    const nextToday = todayClasses.find((c) => {
      const startMin = timeToMinutes(c.startTime);
      return startMin > currentMinutes;
    });

    if (nextToday) {
      const startMin = timeToMinutes(nextToday.startTime);
      const minsUntil = startMin - currentMinutes;
      const hours = Math.floor(minsUntil / 60);
      const mins = minsUntil % 60;
      const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins} mins`;

      return {
        type: "next_today",
        cls: nextToday,
        label: `Next: ${nextToday.courseCode} in ${nextToday.roomOrLab || "Room TBA"} at ${nextToday.startTime}`,
        subtitle: `Starts in ${timeStr} (${nextToday.startTime} - ${nextToday.endTime})`,
        countdown: `Starts in ${timeStr}`,
        badgeColor: "bg-sky-500 text-white",
      };
    }

    // 3. If today is finished, find the first upcoming class later this week
    if (weeklyRoutine.length > 0) {
      // Find the next day with classes
      for (let offset = 1; offset <= 7; offset++) {
        const nextDayIdx = (currentTime.getDay() + offset) % 7;
        const targetDayName = DAYS[nextDayIdx];
        const dayClasses = weeklyRoutine
          .filter((c) => c.dayOfWeek === targetDayName)
          .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

        if (dayClasses.length > 0) {
          const firstNextClass = dayClasses[0];
          const isTomorrow = offset === 1;
          const dayLabel = isTomorrow ? "Tomorrow" : targetDayName;

          return {
            type: "next_day",
            cls: firstNextClass,
            label: `All classes done for today! Next: ${firstNextClass.courseCode}`,
            subtitle: `${dayLabel} at ${firstNextClass.startTime} in ${firstNextClass.roomOrLab || "Room TBA"}`,
            countdown: `${dayLabel} at ${firstNextClass.startTime}`,
            badgeColor: "bg-purple-600 text-white",
          };
        }
      }
    }

    // 4. Default / No classes found
    return {
      type: "none",
      cls: null,
      label: "No classes scheduled for today",
      subtitle: "Enjoy your free time or review past lectures!",
      countdown: "Free Day",
      badgeColor: "bg-slate-500 text-white",
    };
  }, [todayClasses, weeklyRoutine, currentTime]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-4 animate-pulse flex items-center justify-between">
        <div className="space-y-2 flex-1">
          <div className="h-4 w-48 bg-slate-200 rounded"></div>
          <div className="h-3 w-32 bg-slate-100 rounded"></div>
        </div>
      </div>
    );
  }

  const cls = classStatus.cls;
  const isSessional = cls?.type === "sessional" || cls?.type === "project";
  const teachers = Array.isArray(cls?.teacherInitials) ? cls.teacherInitials.join(", ") : cls?.teacherInitials;

  return (
    <>
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-indigo-950 text-white rounded-2xl border border-sky-800/40 shadow-lg p-4 sm:p-5 relative overflow-hidden group">
        {/* Subtle background glow */}
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-radial from-sky-500/10 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Main Info */}
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-xs ${classStatus.badgeColor}`}>
                {classStatus.type === "ongoing"
                  ? "🔴 Ongoing Now"
                  : classStatus.type === "next_today"
                  ? "⏱️ Next Class"
                  : classStatus.type === "next_day"
                  ? "✨ Up Next"
                  : "🏖️ Free Day"}
              </span>

              {cls && (
                <span className="text-[11px] font-mono font-bold text-sky-300 bg-white/10 px-2 py-0.5 rounded-md">
                  {cls.courseCode}
                </span>
              )}

              {cls && isSessional && (
                <span className="text-[10px] font-bold text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded-md border border-indigo-400/30">
                  Sessional Lab
                </span>
              )}

              <span className="text-xs text-amber-300 font-bold ml-auto sm:ml-0">
                {classStatus.countdown}
              </span>
            </div>

            {/* Headline */}
            <div>
              <h3 className="text-base sm:text-lg font-black text-white tracking-wide truncate">
                {classStatus.label}
              </h3>
              <p className="text-xs sm:text-sm text-sky-200/90 flex items-center gap-2 mt-0.5 flex-wrap">
                {cls ? (
                  <>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span>{cls.roomOrLab || "Room TBA"}</span>
                    </span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span>{cls.startTime} - {cls.endTime}</span>
                    </span>
                    {teachers && (
                      <>
                        <span>&bull;</span>
                        <span className="text-slate-300">Teacher: <strong>{teachers}</strong></span>
                      </>
                    )}
                  </>
                ) : (
                  <span>{classStatus.subtitle}</span>
                )}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-white/10">
            <button
              onClick={() => setIsCalendarModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition cursor-pointer backdrop-blur-xs border border-white/15"
              title="Sync routine with Google & Phone Calendar"
            >
              <CalendarPlus className="w-3.5 h-3.5 text-sky-300" />
              <span>Add to Calendar</span>
            </button>

            <Link
              to="/routine"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-black transition shadow-sm"
              title="Open full weekly class routine"
            >
              <span>Weekly Routine</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Google Calendar Sync Modal */}
      <GoogleCalendarExportModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        classes={weeklyRoutine.length > 0 ? weeklyRoutine : todayClasses}
        user={user}
      />
    </>
  );
}
