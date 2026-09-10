/**
 * File: NotificationBell.jsx
 * Description: React component rendering the NotificationBell UI interface.
 * 
 * This file is part of the RUET OneHub Project.
 */

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Bell, Check, Clock } from "lucide-react";
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
                toast(notif.title, { description: notif.message, icon: "🔔" });
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
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  onClick={() => {
                    if (!notif.isRead) markAsRead(notif._id);
                    if (notif.link) {
                      setIsOpen(false);
                      navigate(notif.link);
                    }
                  }}
                  className={`px-4 py-3 border-b border-slate-50 transition-colors ${
                    !notif.isRead 
                      ? "bg-sky-50/40 hover:bg-sky-100/50 cursor-pointer" 
                      : "hover:bg-slate-50"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p
                        className={`text-sm ${
                          !notif.isRead ? "font-semibold text-slate-900" : "text-slate-700"
                        }`}
                      >
                        {notif.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">{notif.message}</p>
                      <div className="flex items-center mt-2 text-[10px] text-slate-400">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatNotifDate(notif.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
