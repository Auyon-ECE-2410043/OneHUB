/**
 * File: NotificationBell.jsx
 * Description: React component rendering the NotificationBell UI interface.
 * 
 * This file is part of the RUET OneHub Project.
 */

import { useState, useEffect } from "react";
import { Bell, Check, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api"; // Assuming axios instance is here

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get("/notifications");
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // every minute
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put("/notifications/read-all");
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
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
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="fixed top-16 right-4 left-4 sm:absolute sm:top-auto sm:left-auto sm:right-0 mt-2 sm:w-80 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
            <div className="px-4 py-2 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-sm font-semibold text-slate-800">Notifications</h3>
              {unreadCount > 0 && (
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
                          {new Date(notif.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
