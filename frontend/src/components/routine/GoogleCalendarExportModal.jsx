/**
 * File: GoogleCalendarExportModal.jsx
 * Description: Interactive modal for syncing weekly routine with Google Calendar, Apple Calendar, and Outlook.
 * 
 * Part of the RUET OneHub Project.
 */

import { useState } from "react";
import {
  Calendar,
  Download,
  ExternalLink,
  CheckCircle2,
  Clock,
  Sparkles,
  Smartphone,
  X,
  Bell,
  MapPin,
  Laptop
} from "lucide-react";
import { toast } from "sonner";
import { downloadRoutineIcs, getGoogleCalendarWebUrl } from "../../utils/calendarExport";

export default function GoogleCalendarExportModal({ isOpen, onClose, classes = [], user }) {
  const [downloaded, setDownloaded] = useState(false);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!classes || classes.length === 0) {
      toast.error("No routine classes available to export.");
      return;
    }
    try {
      downloadRoutineIcs(classes, user);
      setDownloaded(true);
      toast.success("Routine .ics file downloaded! Open it to add to your calendar.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate calendar file.");
    }
  };

  const nextClass = classes && classes.length > 0 ? classes[0] : null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-sky-50 via-indigo-50 to-purple-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-sky-500/20">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Sync Routine to Google Calendar
              </h3>
              <p className="text-xs text-slate-500">
                {classes.length} class slots &bull; Weekly recurring events &amp; alarms
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Main Action Banner */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Universal Calendar Export
              </span>
              <span className="text-[10px] font-mono text-slate-400 bg-white/10 px-2 py-0.5 rounded-full">
                .ics RFC 5545
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Export your complete weekly class routine with room locations, teacher initials, and automatic 15-minute class reminder alarms.
            </p>

            <button
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-black text-xs sm:text-sm shadow-md transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{downloaded ? "Download .ics File Again" : "Download Routine Calendar File (.ics)"}</span>
            </button>
          </div>

          {/* Compatible Apps Badges */}
          <div className="flex items-center justify-around text-center text-[11px] text-slate-600 pt-1 pb-1 border-y border-slate-100">
            <div className="flex flex-col items-center gap-1">
              <span className="font-bold text-slate-800">Google Calendar</span>
              <span className="text-[9.5px] text-slate-400">Android &bull; Web</span>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex flex-col items-center gap-1">
              <span className="font-bold text-slate-800">Apple Calendar</span>
              <span className="text-[9.5px] text-slate-400">iPhone &bull; Mac</span>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex flex-col items-center gap-1">
              <span className="font-bold text-slate-800">MS Outlook</span>
              <span className="text-[9.5px] text-slate-400">Windows &bull; Mobile</span>
            </div>
          </div>

          {/* Quick Direct Web Link */}
          {nextClass && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Quick Web Add:
                </p>
                <p className="text-xs font-bold text-slate-800 truncate">
                  {nextClass.courseCode}: {nextClass.dayOfWeek} at {nextClass.startTime}
                </p>
              </div>

              <a
                href={getGoogleCalendarWebUrl(nextClass, user)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-sky-50 hover:border-sky-300 text-sky-700 text-xs font-bold transition shrink-0 shadow-2xs"
              >
                <span>Add in Web</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {/* Simple 3-Step Phone Sync Instructions */}
          <div className="space-y-2 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
            <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wide flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
              How to Sync with Your Phone:
            </h4>
            <ol className="text-xs text-slate-600 space-y-1.5 list-decimal pl-4 leading-relaxed">
              <li>
                Click <strong>&quot;Download Routine Calendar File (.ics)&quot;</strong> above.
              </li>
              <li>
                Open the downloaded file on your phone (tap to open with <strong>Google Calendar</strong> or <strong>Apple Calendar</strong>).
              </li>
              <li>
                Tap <strong>&quot;Add All&quot;</strong> &mdash; your classes will automatically repeat every week with 15-minute notifications!
              </li>
            </ol>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
