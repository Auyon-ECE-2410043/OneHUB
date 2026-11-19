/**
 * File: NotificationBell.jsx
 * Description: React component rendering the NotificationBell UI interface.
 * 
 * This file is part of the RUET OneHub Project.
 */

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Bell, Check, Clock, CreditCard, ChevronRight, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [prevNotifIds, setPrevNotifIds] = useState(new Set());
  const containerRef = useRef(null);

  const formatNotifDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const isToday = date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (isToday) return time;
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth() && date.getFullYear() === yesterday.getFullYear();
    if (isYesterday) return "Yesterday, " + time;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ", " + time;
  };

  const fetchNotifications = async () => {
      try {
        const { data } = await api.get("/notifications");
        const newNotifications = data.notifications || [];
        setNotifications(newNotifications);
        
        if (!isOpen) {
          setUnreadCount(data.unreadCount || 0);
        }

        // Check for newly arrived notifications and toast them
        setPrevNotifIds((prev) => {
          const currentIds = new Set(newNotifications.map(n => n._id));
          if (prev.size > 0) { // Don't toast on initial load
            newNotifications.forEach(notif => {
              if (!prev.has(notif._id) && !notif.isRead) {
                if (notif.type === "urgent_blood" || notif.title?.includes("Blood")) {
                  toast.error(notif.title, { description: notif.message, icon: "🩸", duration: 10000 });
                } else {
                  toast(notif.title, { description: notif.message, icon: "🔔" });
                }
              }
            });
          }
          return currentIds;
        });

      } catch (err) {
        console.error("Failed to fetch notifications", err);
      }
    };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // every minute
    return () => clearInterval(interval);
  }, [isOpen]);

  // Handle clicking outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = () => {
    if (!isOpen) {
      setIsOpen(true);
      if (unreadCount > 0) {
        // Optimistically clear the red badge
        setUnreadCount(0);
        // Silently mark as read in the backend so next load they are read
        api.put("/notifications/read-all").catch(console.error);
      }
    } else {
      setIsOpen(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      // Optimistically update UI
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      await api.put(`/notifications/${id}/read`);
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      await api.put("/notifications/read-all");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={handleToggle}
        className="relative p-2 text-slate-500 hover:text-sky-600 hover:bg-slate-100 rounded-xl transition-smooth focus:outline-none"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-2 ring-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed top-16 right-4 left-4 sm:absolute sm:top-auto sm:left-auto sm:right-0 mt-2 sm:w-80 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
          <div className="px-4 py-2 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-slate-800">Notifications</h3>
            {notifications.some(n => !n.isRead) && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-sky-600 hover:text-sky-800 font-medium"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-slate-500">
                No new notifications
              </div>
            ) : (
              notifications.map((notif) => {
                const isPayment = notif.type === "fee_due" || notif.title?.includes("Payment") || notif.title?.includes("Fee");
                const isPaid = notif.type === "payment" || notif.title?.includes("Payment Successful");
                const isUrgentBlood = notif.type === "urgent_blood" || notif.title?.includes("Blood") || notif.title?.includes("🩸");

                return (
                  <div
                    key={notif._id}
                    onClick={() => {
                      if (!notif.isRead) markAsRead(notif._id);
                      if (notif.link) {
                        setIsOpen(false);
                        navigate(notif.link);
                      } else if (isUrgentBlood) {
                        setIsOpen(false);
                        navigate("/medical");
                      } else if (isPayment) {
                        setIsOpen(false);
                        navigate("/fees");
                      }
                    }}
                    className={`px-4 py-3 border-b border-slate-50 transition-colors cursor-pointer ${
                      !notif.isRead 
                        ? isUrgentBlood
                          ? "bg-rose-50/80 hover:bg-rose-100/90 border-l-4 border-l-rose-500"
                          : isPayment
                          ? "bg-amber-50/50 hover:bg-amber-100/60"
                          : "bg-sky-50/40 hover:bg-sky-100/50"
                        : isUrgentBlood
                        ? "bg-rose-50/40 hover:bg-rose-100/60"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {isUrgentBlood && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-700 border border-rose-300 animate-pulse">
                              <span>🩸 URGENT BLOOD</span>
                            </span>
                          )}
                          {isPayment && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                              <CreditCard className="w-3 h-3 text-amber-600" />
                              <span>Bill Due</span>
                            </span>
                          )}
                          {isPaid && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>Paid</span>
                            </span>
                          )}
                          <p
                            className={`text-sm truncate ${
                              !notif.isRead ? "font-bold text-slate-900" : "font-medium text-slate-700"
                            }`}
                          >
                            {notif.title}
                          </p>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
                        <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100/70 text-[10px] text-slate-400">
                          <div className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatNotifDate(notif.createdAt)}
                          </div>
                          {isPayment && (
                            <span className="font-bold text-sky-600 hover:text-sky-700 flex items-center gap-0.5">
                              <span>Pay Now</span>
                              <ChevronRight className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
