/**
 * File: CampusBusSchedule.jsx
 * Description: RUET Campus Bus Schedule and Route Tracker component.
 * Features:
 * - Real-time upcoming bus departure tracker with countdown
 * - Search by stoppage name (Vodra, Station, Laxmipur, Talaimari, Katakhali, Binodpur, etc.)
 * - Route filtering and morning/afternoon shift toggles
 * - Visual stoppage route sequence
 * - Driver and transport cell emergency contacts
 * - Print-friendly layout
 * 
 * Part of the RUET OneHub Project.
 */

import { useState, useMemo, useEffect } from "react";
import {
  Bus,
  Clock,
  MapPin,
  Search,
  Phone,
  Calendar,
  AlertCircle,
  Printer,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Filter
} from "lucide-react";

// Official RUET Bus Routes Configuration
const BUS_ROUTES = [
  {
    id: "route-1",
    routeNumber: "Route 01",
    title: "Rail Station & Shaheb Bazar Loop",
    busName: "Poddo & Dhanoshiri",
    regNo: "RUET-CHA-11-0421",
    capacity: "52 Seats",
    driverName: "Md. Selim Hossain",
    driverPhone: "01712-345678",
    routeType: "Student & Staff",
    color: "from-sky-600 to-blue-700",
    badgeColor: "bg-sky-100 text-sky-800 border-sky-200",
    stoppages: [
      "RUET Campus (Gate-1)",
      "Talaimari Mor",
      "Alupotti",
      "Shaheb Bazar (Zero Point)",
      "Rajshahi Rail Station",
      "Shiroil Bus Terminal",
      "Vodra Mor",
      "Kazla Gate",
      "RUET Campus"
    ],
    trips: [
      { id: "1-1", shift: "Morning", direction: "Towards Campus", departure: "07:30 AM", startPoint: "Rail Station", note: "Via Vodra & Kazla" },
      { id: "1-2", shift: "Morning", direction: "Towards Campus", departure: "08:15 AM", startPoint: "Shaheb Bazar", note: "Via Alupotti & Talaimari" },
      { id: "1-3", shift: "Mid-Day", direction: "From Campus", departure: "01:40 PM", startPoint: "RUET Gate-1", note: "Via Talaimari to Station" },
      { id: "1-4", shift: "Afternoon", direction: "From Campus", departure: "04:15 PM", startPoint: "RUET Gate-1", note: "Via Vodra to Shaheb Bazar" },
      { id: "1-5", shift: "Evening", direction: "From Campus", departure: "05:15 PM", startPoint: "RUET Gate-1", note: "Full city loop" },
      { id: "1-6", shift: "Night", direction: "From Campus", departure: "07:00 PM", startPoint: "RUET Gate-1", note: "Terminal night shuttle" }
    ]
  },
  {
    id: "route-2",
    routeNumber: "Route 02",
    title: "Laxmipur & Court Express",
    busName: "Surma & Kaptai",
    regNo: "RUET-CHA-11-0422",
    capacity: "52 Seats",
    driverName: "Md. Jahangir Alam",
    driverPhone: "01715-882233",
    routeType: "Student & Faculty",
    color: "from-emerald-600 to-teal-700",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
    stoppages: [
      "RUET Campus",
      "Talaimari",
      "Monichattar",
      "Sadar Hospital",
      "Laxmipur Mor",
      "Medical College Gate",
      "C&B Mor",
      "Rajshahi Court",
      "RUET Campus"
    ],
    trips: [
      { id: "2-1", shift: "Morning", direction: "Towards Campus", departure: "07:45 AM", startPoint: "Court Mor", note: "Via C&B & Laxmipur" },
      { id: "2-2", shift: "Morning", direction: "Towards Campus", departure: "08:30 AM", startPoint: "Laxmipur", note: "Direct to RUET via Talaimari" },
      { id: "2-3", shift: "Mid-Day", direction: "From Campus", departure: "01:30 PM", startPoint: "RUET Gate-1", note: "To Laxmipur & Court" },
      { id: "2-4", shift: "Afternoon", direction: "From Campus", departure: "05:10 PM", startPoint: "RUET Gate-1", note: "Full Court route" }
    ]
  },
  {
    id: "route-3",
    routeNumber: "Route 03",
    title: "Katakhali & Belpukur Suburban",
    busName: "Madhumati",
    regNo: "RUET-CHA-11-0425",
    capacity: "52 Seats",
    driverName: "Md. Anwar Hossain",
    driverPhone: "01723-991144",
    routeType: "Student Special",
    color: "from-indigo-600 to-purple-700",
    badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-200",
    stoppages: [
      "RUET Campus",
      "Kazla",
      "Binodpur Gate (RU)",
      "Meherchandi",
      "Katakhali Bazar",
      "Pouroshova Mor",
      "Belpukur Rail Crossing",
      "RUET Campus"
    ],
    trips: [
      { id: "3-1", shift: "Morning", direction: "Towards Campus", departure: "08:00 AM", startPoint: "Belpukur", note: "Via Katakhali & Binodpur" },
      { id: "3-2", shift: "Mid-Day", direction: "From Campus", departure: "01:30 PM", startPoint: "RUET Gate-1", note: "To Binodpur & Katakhali" },
      { id: "3-3", shift: "Afternoon", direction: "From Campus", departure: "05:15 PM", startPoint: "RUET Gate-1", note: "To Belpukur terminus" }
    ]
  },
  {
    id: "route-4",
    routeNumber: "Route 04",
    title: "Bornali & New Market Loop",
    busName: "Teesta",
    regNo: "RUET-CHA-11-0428",
    capacity: "45 Seats",
    driverName: "Md. Rafiqul Islam",
    driverPhone: "01734-556677",
    routeType: "Student Special",
    color: "from-amber-600 to-orange-700",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
    stoppages: [
      "RUET Campus",
      "Vodra Mor",
      "Rail Gate",
      "Bornali Mor",
      "New Market",
      "Rani Bazar",
      "Talaimari",
      "RUET Campus"
    ],
    trips: [
      { id: "4-1", shift: "Morning", direction: "Towards Campus", departure: "07:50 AM", startPoint: "New Market", note: "Via Bornali & Rail Gate" },
      { id: "4-2", shift: "Morning", direction: "Towards Campus", departure: "08:20 AM", startPoint: "Bornali Mor", note: "Via Vodra to RUET" },
      { id: "4-3", shift: "Mid-Day", direction: "From Campus", departure: "01:45 PM", startPoint: "RUET Gate-1", note: "To New Market & Bornali" },
      { id: "4-4", shift: "Afternoon", direction: "From Campus", departure: "05:05 PM", startPoint: "RUET Gate-1", note: "Full circuit loop" }
    ]
  },
  {
    id: "route-5",
    routeNumber: "Route 05",
    title: "Teachers & Officer Staff Shuttle",
    busName: "Chitra (AC Coaster)",
    regNo: "RUET-CHA-11-0430",
    capacity: "32 Seats (AC)",
    driverName: "Md. Tariqul Islam",
    driverPhone: "01711-223344",
    routeType: "Faculty & Officers",
    color: "from-rose-600 to-pink-700",
    badgeColor: "bg-rose-100 text-rose-800 border-rose-200",
    stoppages: [
      "Padma Residential Area",
      "Upashahar Housing",
      "Station Mor",
      "Laxmipur",
      "C&B Mor",
      "RUET Administrative Building"
    ],
    trips: [
      { id: "5-1", shift: "Morning", direction: "Towards Campus", departure: "08:00 AM", startPoint: "Upashahar", note: "Faculty morning transit" },
      { id: "5-2", shift: "Mid-Day", direction: "From Campus", departure: "02:30 PM", startPoint: "Admin Building", note: "Mid-day transit" },
      { id: "5-3", shift: "Afternoon", direction: "From Campus", departure: "05:10 PM", startPoint: "Admin Building", note: "Return shuttle" }
    ]
  }
];

export default function CampusBusSchedule() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRouteId, setSelectedRouteId] = useState("all");
  const [selectedShift, setSelectedShift] = useState("all");
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update clock every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  // Helper to convert "07:30 AM" into minutes from midnight
  const parseTripMinutes = (timeStr) => {
    const [time, period] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  // Find next upcoming bus departure across all routes
  const nextDeparture = useMemo(() => {
    const nowMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    let closestTrip = null;
    let minDiff = Infinity;
    let closestRoute = null;

    BUS_ROUTES.forEach((route) => {
      route.trips.forEach((trip) => {
        const tripMinutes = parseTripMinutes(trip.departure);
        const diff = tripMinutes - nowMinutes;
        // Trip is later today
        if (diff >= 0 && diff < minDiff) {
          minDiff = diff;
          closestTrip = trip;
          closestRoute = route;
        }
      });
    });

    return {
      trip: closestTrip,
      route: closestRoute,
      minutesUntil: minDiff !== Infinity ? minDiff : null
    };
  }, [currentTime]);

  // Filter routes based on search term, route ID, and shift
  const filteredRoutes = useMemo(() => {
    return BUS_ROUTES.filter((route) => {
      // Route ID filter
      if (selectedRouteId !== "all" && route.id !== selectedRouteId) {
        return false;
      }

      // Stoppage / text search
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesTitle = route.title.toLowerCase().includes(query);
        const matchesBus = route.busName.toLowerCase().includes(query);
        const matchesStoppage = route.stoppages.some((s) => s.toLowerCase().includes(query));
        const matchesTrip = route.trips.some(
          (t) =>
            t.startPoint.toLowerCase().includes(query) ||
            t.departure.toLowerCase().includes(query) ||
            t.note.toLowerCase().includes(query)
        );
        if (!matchesTitle && !matchesBus && !matchesStoppage && !matchesTrip) {
          return false;
        }
      }

      return true;
    }).map((route) => {
      // Filter trips within route by shift if selected
      if (selectedShift === "all") return route;
      const filteredTrips = route.trips.filter((t) => t.shift.toLowerCase() === selectedShift.toLowerCase());
      return { ...route, trips: filteredTrips };
    }).filter((r) => r.trips.length > 0 || !selectedShift || selectedShift === "all");
  }, [searchTerm, selectedRouteId, selectedShift]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-full pb-10">
      {/* Top Banner & Quick Controls */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-sm">
              <Bus className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
                RUET Campus Bus Schedule
                <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200 uppercase">
                  Active
                </span>
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                Daily university transport connecting RUET campus with all major zones in Rajshahi.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
            title="Print bus schedule"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Print Schedule</span>
          </button>
        </div>
      </div>

      {/* Next Upcoming Departure Spotlight Banner */}
      {nextDeparture.trip && (
        <div className="bg-gradient-to-r from-sky-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-5 rounded-2xl border border-sky-800/50 shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-64 bg-radial from-sky-500/10 to-transparent pointer-events-none" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Next Scheduled Departure
                </span>
                {nextDeparture.minutesUntil !== null && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-white font-mono font-semibold">
                    Departs in {nextDeparture.minutesUntil} min{nextDeparture.minutesUntil === 1 ? "" : "s"}
                  </span>
                )}
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <span>{nextDeparture.trip.departure}</span>
                <span className="text-sky-300 font-normal text-sm sm:text-base">
                  &bull; {nextDeparture.route.title} ({nextDeparture.route.busName})
                </span>
              </h3>
              <p className="text-xs text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>
                  From: <strong className="text-white">{nextDeparture.trip.startPoint}</strong> &bull; Direction:{" "}
                  <strong className="text-amber-300">{nextDeparture.trip.direction}</strong> ({nextDeparture.trip.note})
                </span>
              </p>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-center shrink-0">
              <a
                href={`tel:${nextDeparture.route.driverPhone}`}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Driver ({nextDeparture.route.driverName.split(" ")[1] || "Driver"})</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Stoppage Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Stoppage Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search pickup points (e.g. Vodra, Station, Laxmipur, Katakhali, Court, Talaimari)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Shift Filter Dropdown */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={selectedShift}
                onChange={(e) => setSelectedShift(e.target.value)}
                className="text-xs font-bold bg-transparent text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="all">All Shifts (Morning/Afternoon/Evening)</option>
                <option value="Morning">Morning (07:30 - 08:30 AM)</option>
                <option value="Mid-Day">Mid-Day (01:30 - 02:30 PM)</option>
                <option value="Afternoon">Afternoon (04:15 - 05:15 PM)</option>
                <option value="Evening">Evening & Night</option>
              </select>
            </div>
          </div>
        </div>

        {/* Route Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setSelectedRouteId("all")}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition cursor-pointer ${
              selectedRouteId === "all"
                ? "bg-sky-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All 5 Routes
          </button>
          {BUS_ROUTES.map((route) => (
            <button
              key={route.id}
              onClick={() => setSelectedRouteId(route.id)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition cursor-pointer ${
                selectedRouteId === route.id
                  ? "bg-sky-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {route.routeNumber}: {route.title.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Routes Grid */}
      {filteredRoutes.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <Bus className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No matching bus route or stoppage found</h3>
          <p className="text-xs text-slate-400">
            Try searching for common RUET stops like Vodra, Station, Laxmipur, Talaimari, Katakhali, or Court.
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedRouteId("all");
              setSelectedShift("all");
            }}
            className="px-4 py-2 bg-sky-600 text-white text-xs font-bold rounded-xl hover:bg-sky-700 transition"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredRoutes.map((route) => (
            <div
              key={route.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition hover:shadow-md"
            >
              {/* Route Card Header */}
              <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row justify-between md:items-center gap-3 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-tr ${route.color} text-white shadow-xs`}>
                    <Bus className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-slate-400">{route.routeNumber}</span>
                      <h2 className="text-base sm:text-lg font-bold text-slate-900">{route.title}</h2>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${route.badgeColor}`}>
                        {route.routeType}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Bus: <strong className="text-slate-800">{route.busName}</strong> ({route.regNo}) &bull;{" "}
                      {route.capacity}
                    </p>
                  </div>
                </div>

                {/* Driver Info Contact */}
                <div className="flex items-center gap-3 shrink-0 self-start md:self-center bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="text-right">
                    <p className="text-[11px] font-bold text-slate-800">{route.driverName}</p>
                    <p className="text-[10px] text-slate-400">Official Campus Driver</p>
                  </div>
                  <a
                    href={`tel:${route.driverPhone}`}
                    className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition"
                    title={`Call ${route.driverName} (${route.driverPhone})`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Stoppage Path Flow */}
              <div className="px-5 py-3.5 bg-slate-100/60 border-b border-slate-200/60">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-sky-600" />
                  <span>Stoppage &amp; Pickup Sequence:</span>
                </p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {route.stoppages.map((stop, idx) => {
                    const isHighlighted = searchTerm && stop.toLowerCase().includes(searchTerm.toLowerCase());
                    return (
                      <div key={idx} className="flex items-center gap-1.5">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                            isHighlighted
                              ? "bg-amber-300 text-slate-950 font-black shadow-xs ring-2 ring-amber-400"
                              : "bg-white text-slate-700 border border-slate-200 shadow-2xs"
                          }`}
                        >
                          {stop}
                        </span>
                        {idx < route.stoppages.length - 1 && (
                          <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Timetable Trips Table */}
              <div className="p-4 sm:p-5 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                      <th className="pb-2.5 pl-2">Trip</th>
                      <th className="pb-2.5">Shift</th>
                      <th className="pb-2.5">Departure Time</th>
                      <th className="pb-2.5">Origin / Departure Point</th>
                      <th className="pb-2.5">Direction</th>
                      <th className="pb-2.5">Via / Key Route Notes</th>
                      <th className="pb-2.5 pr-2 text-right">Operating Days</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                    {route.trips.map((trip, idx) => (
                      <tr key={trip.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-2.5 pl-2 font-mono text-slate-400 font-bold">#{idx + 1}</td>
                        <td className="py-2.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              trip.shift === "Morning"
                                ? "bg-sky-100 text-sky-800"
                                : trip.shift === "Mid-Day"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-purple-100 text-purple-800"
                            }`}
                          >
                            {trip.shift}
                          </span>
                        </td>
                        <td className="py-2.5 font-bold text-slate-900 text-sm flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-sky-600" />
                          <span>{trip.departure}</span>
                        </td>
                        <td className="py-2.5 font-semibold text-slate-800">{trip.startPoint}</td>
                        <td className="py-2.5">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                              trip.direction.includes("Towards") ? "text-emerald-700" : "text-indigo-700"
                            }`}
                          >
                            <ArrowRight className="w-3 h-3" />
                            {trip.direction}
                          </span>
                        </td>
                        <td className="py-2.5 text-slate-500 text-xs">{trip.note}</td>
                        <td className="py-2.5 pr-2 text-right text-slate-500 text-[11px]">Sun &ndash; Thu</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* University Transport Cell Contact Footer */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-md flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-800 text-sky-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Central Transport Cell &bull; RUET</h4>
            <p className="text-xs text-slate-400">
              For emergency shuttle requests, charter inquiries, or lost property aboard university buses.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="text-right">
            <p className="text-xs text-slate-300">
              Transport In-Charge: <strong className="text-white">Engr. Md. Faruk Hossain</strong>
            </p>
            <p className="text-xs text-sky-400 font-mono">Emergency Hotline: +880 258886-0044</p>
          </div>
          <a
            href="tel:+8802588860044"
            className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow transition flex items-center gap-1.5"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call Transport Office</span>
          </a>
        </div>
      </div>
    </div>
  );
}
