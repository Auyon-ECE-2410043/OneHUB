/**
 * File: AcademicCalendar.jsx
 * Description: React component rendering the AcademicCalendar UI interface.
 * 
 * This file is part of the RUET OneHub Project.
 */

import React, { useState, useEffect } from "react";
import { calendarService } from "../../services/calendarService";
import { PageLoader } from "../../components/common/Loader";
import { CalendarDays, Info } from "lucide-react";

export default function AcademicCalendar() {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const data = await calendarService.getHolidays();
        setHolidays(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHolidays();
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Academic Calendar 2026</h1>
          <p className="text-slate-500 mt-1">Official holidays and vacations for RUET.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
          <Info className="w-5 h-5 text-sky-600" />
          <span className="text-sm text-slate-600">
            <strong>Note:</strong> Events marked with an asterisk (*) are subject to the appearance of the moon.
            University Day (**) means classes will run as usual.
          </span>
        </div>
        <ul className="divide-y divide-slate-200">
          {holidays.map((h) => {
            const startDate = new Date(h.startDate);
            const endDate = new Date(h.endDate);
            const isSingleDay = startDate.getTime() === endDate.getTime();

            return (
              <li key={h._id} className="p-4 sm:p-6 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center border border-sky-200">
                  <CalendarDays className="w-6 h-6 text-sky-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-slate-800">{h.title}</h3>
                  <div className="mt-1 flex items-center gap-4 text-sm text-slate-500">
                    <span>
                      {startDate.toLocaleDateString("en-GB", { day: "numeric", month: "long" })}
                      {!isSingleDay && ` - ${endDate.toLocaleDateString("en-GB", { day: "numeric", month: "long" })}`}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        h.type === "vacation"
                          ? "bg-purple-100 text-purple-700"
                          : h.type === "event"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {h.type.toUpperCase()}
                    </span>
                    {!h.classesSuspended && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                        Classes Running
                      </span>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
