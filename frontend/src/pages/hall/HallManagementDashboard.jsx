/**
 * File: HallManagementDashboard.jsx
 * Description: Residential Hall Dashboard featuring Allocated Room & Roommates Directory,
 * Room Maintenance Request / Complaint Ticketing System, and Dining Token shortcuts.
 * 
 * Part of the RUET OneHub Project.
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { toast } from "sonner";
import {
  Building,
  Utensils,
  ChevronRight,
  CheckCircle2,
  Clock,
  Wrench,
  Zap,
  Droplets,
  Armchair,
  Wifi,
  Sparkles,
  AlertCircle,
  Plus,
  Phone,
  UserCheck,
  Calendar,
  MessageSquare,
  Bed,
  DoorOpen,
  Filter,
} from "lucide-react";

export function HallManagementDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [appStatus, setAppStatus] = useState(null);
  const [allocation, setAllocation] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [ticketFilter, setTicketFilter] = useState("all");
  
  // New Ticket Modal State
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const [newTicket, setNewTicket] = useState({
    category: "Electricity",
    title: "",
    description: "",
    priority: "normal",
    roomNumber: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [appRes, allocRes, maintRes] = await Promise.allSettled([
        api.get("/hall/my-application"),
        api.get("/hall/allocation"),
        api.get("/hall/maintenance"),
      ]);

      if (appRes.status === "fulfilled") {
        setAppStatus(appRes.value.data.application);
      }
      if (allocRes.status === "fulfilled" && allocRes.value.data.allocated) {
        setAllocation(allocRes.value.data);
        setNewTicket((prev) => ({
          ...prev,
          roomNumber: allocRes.value.data.roomNumber || "",
        }));
      }
      if (maintRes.status === "fulfilled") {
        setTickets(maintRes.value.data.tickets || []);
      }
    } catch (err) {
      console.warn("Error fetching hall data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Submit new ticket
  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    if (!newTicket.title || !newTicket.description) {
      toast.error("Please fill in the title and description.");
      return;
    }

    setSubmittingTicket(true);
    try {
      const res = await api.post("/hall/maintenance", {
        ...newTicket,
        hallName: allocation?.hallName || appStatus?.preferredHall || "Residential Hall",
        roomNumber: newTicket.roomNumber || allocation?.roomNumber || "312",
      });
      toast.success("Maintenance request submitted successfully!");
      setTickets([res.data.ticket, ...tickets]);
      setIsNewTicketOpen(false);
      setNewTicket({
        category: "Electricity",
        title: "",
        description: "",
        priority: "normal",
        roomNumber: allocation?.roomNumber || "",
      });
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to submit request.");
    } finally {
      setSubmittingTicket(false);
    }
  };

  // Staff update status
  const handleUpdateStatus = async (ticketId, status) => {
    try {
      const res = await api.patch(`/hall/maintenance/${ticketId}/status`, { status });
      toast.success(`Ticket marked as ${status}!`);
      setTickets(tickets.map((t) => (t._id === ticketId ? res.data.ticket : t)));
    } catch (err) {
      toast.error("Failed to update status.");
    }
  };

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case "Electricity":
        return <Zap className="w-4 h-4 text-amber-500" />;
      case "Plumbing":
        return <Droplets className="w-4 h-4 text-sky-500" />;
      case "Furniture":
        return <Armchair className="w-4 h-4 text-emerald-500" />;
      case "Wi-Fi/LAN":
        return <Wifi className="w-4 h-4 text-indigo-500" />;
      case "Cleanliness":
        return <Sparkles className="w-4 h-4 text-teal-500" />;
      default:
        return <Wrench className="w-4 h-4 text-slate-500" />;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "emergency":
        return <span className="px-2 py-0.5 bg-red-100 text-red-800 text-[10px] font-bold uppercase rounded">Emergency</span>;
      case "urgent":
        return <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold uppercase rounded">Urgent</span>;
      default:
        return <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-semibold uppercase rounded">Normal</span>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Resolved":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 text-xs font-bold rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Resolved</span>
          </span>
        );
      case "In Progress":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300 text-xs font-bold rounded-full">
            <Wrench className="w-3.5 h-3.5 text-sky-600" />
            <span>In Progress</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 text-xs font-bold rounded-full">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Pending</span>
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isAllocated = allocation?.allocated || appStatus?.status === "approved";
  const filteredTickets = tickets.filter((t) => {
    if (ticketFilter === "all") return true;
    return t.status?.toLowerCase() === ticketFilter.toLowerCase();
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center shadow-xs">
            <Building className="w-5 h-5" />
          </div>
          Hall & Residential Life
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Room allocation directory, maintenance ticketing system, and mess dining tokens.
        </p>
      </div>

      {/* ALLOCATED ROOM & ROOMMATES CARD */}
      {isAllocated && allocation && (
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-indigo-900/40 relative overflow-hidden">
          {/* Decorative Background Crest */}
          <div className="absolute right-0 bottom-0 pointer-events-none opacity-5 translate-x-10 translate-y-10">
            <Building className="w-96 h-96" />
          </div>

          <div className="relative z-10 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-800/40 pb-5">
              <div className="space-y-1">
                <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-full inline-flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5" />
                  Residential Scholar • Active Seat Allocation
                </span>
                <h2 className="text-2xl font-black tracking-tight text-white mt-1">
                  {allocation.hallName}
                </h2>
                <p className="text-xs text-indigo-300">
                  RUET Residential Hall Administration • Academic Year 2024-2025
                </p>
              </div>

              {/* Room & Bed Pill */}
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 shrink-0">
                <div className="text-center pr-3 border-r border-white/20">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 block">Room</span>
                  <span className="text-xl font-black font-mono text-white">{allocation.roomNumber}</span>
                </div>
                <div className="text-center pl-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 block">Bed</span>
                  <span className="text-xl font-black font-mono text-emerald-400">{allocation.bedNumber}</span>
                </div>
              </div>
            </div>

            {/* Roommates Directory */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-200 flex items-center gap-2">
                  <DoorOpen className="w-4 h-4 text-indigo-400" />
                  <span>Roommates in Room {allocation.roomNumber} ({allocation.roommates?.length || 0})</span>
                </h3>
                <span className="text-[11px] text-indigo-300">Shared room accommodation</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {allocation.roommates && allocation.roommates.length > 0 ? (
                  allocation.roommates.map((rm, idx) => (
                    <div
                      key={idx}
                      className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-3.5 transition-smooth flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                          {rm.name ? rm.name.substring(0, 2).toUpperCase() : "RM"}
                        </div>
                        <div className="truncate">
                          <h4 className="text-xs font-bold text-white truncate">{rm.name}</h4>
                          <p className="text-[11px] font-mono text-indigo-300 truncate">
                            Roll: {rm.rollNo} • {rm.department}
                          </p>
                          <span className="text-[10px] font-semibold text-emerald-400">
                            {rm.bedNumber}
                          </span>
                        </div>
                      </div>

                      {rm.phone && (
                        <a
                          href={`tel:${rm.phone}`}
                          className="p-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-xl transition-colors shrink-0"
                          title={`Call ${rm.name} (${rm.phone})`}
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-indigo-300 italic py-2 col-span-3">
                    No other roommates registered for Room {allocation.roomNumber} yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* THREE ACTION CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Card 1: Maintenance Ticketing */}
        <div
          onClick={() => {
            const el = document.getElementById("maintenance-section");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs hover:shadow-md hover:border-amber-400 transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 group-hover:bg-amber-100 transition-colors">
              <Wrench className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">
              Room Maintenance & Complaints
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Report issues for Electricity (fans/lights), Plumbing, Furniture, or Wi-Fi/LAN connection.
            </p>
          </div>
          <div className="mt-5 flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
              {tickets.filter((t) => t.status !== "Resolved").length} Active Requests
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-500 transition-colors" />
          </div>
        </div>

        {/* Card 2: Dining Token System */}
        <div
          onClick={() => navigate("/dining")}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs hover:shadow-md hover:border-orange-400 transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-4 group-hover:bg-orange-100 transition-colors">
              <Utensils className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">
              Dining Tokens & Feasts
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Book digital lunch/dinner tokens, university Grand Feasts, and recharge your mess wallet.
            </p>
          </div>
          <div className="mt-5 flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-orange-600 dark:text-orange-400">Open Dining Mess</span>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-orange-500 transition-colors" />
          </div>
        </div>

        {/* Card 3: Hall Seat Application */}
        <div
          onClick={() => navigate("/hall/apply")}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs hover:shadow-md hover:border-sky-400 transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-4 group-hover:bg-sky-100 transition-colors">
              <Building className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">
              Seat Application Status
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              View official allocation details, submit new semester residential requests, or appeal.
            </p>
          </div>
          <div className="mt-5 flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> Allocated
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-sky-500 transition-colors" />
          </div>
        </div>

      </div>

      {/* ROOM MAINTENANCE & COMPLAINTS SECTION */}
      <div id="maintenance-section" className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-amber-500" />
              <span>Room Maintenance & Complaints</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Submit requests to hall technicians for immediate repairs and facility servicing.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {/* Filter buttons */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
              {["all", "pending", "in progress", "resolved"].map((f) => (
                <button
                  key={f}
                  onClick={() => setTicketFilter(f)}
                  className={`px-3 py-1.5 rounded-lg capitalize transition-smooth cursor-pointer ${
                    ticketFilter === f
                      ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-xs font-bold"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsNewTicketOpen(true)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs shadow-xs transition-smooth flex items-center space-x-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Report Issue</span>
            </button>
          </div>
        </div>

        {/* Tickets Grid */}
        {filteredTickets.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 space-y-2">
            <Wrench className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
            <h3 className="font-bold text-base text-slate-700 dark:text-slate-200">No maintenance tickets</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Your room facilities are running smoothly. Click "Report Issue" if you need electricity, plumbing, furniture, or Wi-Fi repairs.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTickets.map((ticket) => (
              <div
                key={ticket._id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-300 rounded-2xl p-5 shadow-xs transition-smooth flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shrink-0">
                        {getCategoryIcon(ticket.category)}
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {ticket.category}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                          {ticket.title}
                        </h4>
                      </div>
                    </div>
                    {getStatusBadge(ticket.status)}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {ticket.description}
                  </p>

                  {/* Technician and Staff Notes */}
                  {ticket.technicianAssigned && (
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700/60 text-xs space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>Technician:</span>
                        <strong className="text-slate-800 dark:text-slate-200">{ticket.technicianAssigned}</strong>
                      </div>
                      {ticket.staffNotes && (
                        <p className="text-[11px] text-indigo-600 dark:text-indigo-400 italic">
                          Note: {ticket.staffNotes}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    {getPriorityBadge(ticket.priority)}
                    <span className="text-[11px] text-slate-400">
                      Room {ticket.roomNumber}
                    </span>
                  </div>

                  {/* Staff status toggle */}
                  {(user?.role === "admin" || user?.role === "hall_admin") && (
                    <select
                      value={ticket.status}
                      onChange={(e) => handleUpdateStatus(ticket._id, e.target.value)}
                      className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 rounded-lg px-2 py-1 text-slate-800 dark:text-white border border-slate-300 dark:border-slate-700 focus:outline-none"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL: Report Issue */}
      {isNewTicketOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Wrench className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base">New Room Maintenance Ticket</h3>
              </div>
              <button
                onClick={() => setIsNewTicketOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitTicket} className="p-6 space-y-4 text-xs font-medium">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Issue Category *</label>
                  <select
                    value={newTicket.category}
                    onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs"
                  >
                    <option value="Electricity">Electricity (fan, light, socket)</option>
                    <option value="Plumbing">Plumbing (tap, washroom, basin)</option>
                    <option value="Furniture">Furniture (bed, table, chair)</option>
                    <option value="Wi-Fi/LAN">Wi-Fi / LAN Network</option>
                    <option value="Cleanliness">Cleanliness & Sanitation</option>
                    <option value="Other">Other Maintenance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                  <select
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs"
                  >
                    <option value="normal">Normal (within 48 hours)</option>
                    <option value="urgent">Urgent (same day)</option>
                    <option value="emergency">Emergency (immediate)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Room Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 312"
                  value={newTicket.roomNumber}
                  onChange={(e) => setNewTicket({ ...newTicket, roomNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Issue Title / Subject *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ceiling fan regulator switch broken"
                  value={newTicket.title}
                  onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Detailed Description *</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Describe the exact location, symptoms, or repair needed..."
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewTicketOpen(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingTicket}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {submittingTicket ? "Submitting..." : "Submit Ticket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default HallManagementDashboard;
