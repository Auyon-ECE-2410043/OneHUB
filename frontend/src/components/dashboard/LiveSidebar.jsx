import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Award, Bell, Activity, Trash2 } from "lucide-react";
import livefeedService from "../../services/livefeedService";
import { useAuth } from "../../context/AuthContext";
import { formatDate } from "../../utils/helpers";

export function LiveSidebar() {
  const { user } = useAuth();
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFeeds = async () => {
    try {
      const data = await livefeedService.getFeeds();
      setFeeds(data);
    } catch (err) {
      console.error("Failed to fetch live feed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeeds();
    // Poll every 2 minutes
    const interval = setInterval(fetchFeeds, 120000);
    return () => clearInterval(interval);
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this alert?")) return;
    try {
      await livefeedService.deleteFeed(id);
      fetchFeeds();
    } catch (err) {
      alert("Failed to delete alert");
    }
  };

  if (loading) {
    return <div className="h-full bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 animate-pulse min-h-[400px]"></div>;
  }

  const emergencies = feeds.filter(f => f.type === "emergency_blood");
  const others = feeds.filter(f => f.type !== "emergency_blood");

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs h-full flex flex-col space-y-6 overflow-hidden relative">
      <div className="flex items-center space-x-3 pb-2 border-b border-slate-100 dark:border-slate-800">
        <Activity className="w-5 h-5 text-sky-500" />
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Live Campus Feed</h2>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
        <AnimatePresence>
          {emergencies.map((feed) => (
            <motion.div
              key={feed._id}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900"
            >
              <div className="absolute top-0 right-0 -mt-2 -mr-2 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500"></span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-rose-100 dark:bg-rose-900 rounded-full text-rose-600 dark:text-rose-300">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-rose-800 dark:text-rose-300 text-sm mb-1">{feed.title}</h3>
                  <p className="text-xs text-rose-700 dark:text-rose-400 leading-relaxed mb-2">{feed.content}</p>
                  <p className="text-[10px] text-rose-500/80 dark:text-rose-500 font-medium uppercase tracking-wider">{formatDate(feed.createdAt)}</p>
                </div>
              </div>
              {user?.role === "admin" && (
                <button onClick={() => handleDelete(feed._id)} className="absolute bottom-2 right-2 p-1 text-rose-400 hover:text-rose-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </motion.div>
          ))}
          
          {others.map((feed) => (
            <motion.div
              key={feed._id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`relative p-4 rounded-2xl border ${feed.type === 'achievement' ? 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200/50 dark:border-amber-900/50' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'}`}
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-full ${feed.type === 'achievement' ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400' : 'bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400'}`}>
                  {feed.type === 'achievement' ? <Award className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <h3 className={`font-bold text-sm mb-1 ${feed.type === 'achievement' ? 'text-amber-900 dark:text-amber-200' : 'text-slate-800 dark:text-slate-200'}`}>{feed.title}</h3>
                  <p className={`text-xs leading-relaxed mb-2 ${feed.type === 'achievement' ? 'text-amber-800/80 dark:text-amber-300/80' : 'text-slate-600 dark:text-slate-400'}`}>{feed.content}</p>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{formatDate(feed.createdAt)}</p>
                </div>
              </div>
              {user?.role === "admin" && (
                <button onClick={() => handleDelete(feed._id)} className="absolute bottom-2 right-2 p-1 text-slate-400 hover:text-slate-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </motion.div>
          ))}
          
          {feeds.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 text-center px-4">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
                <Bell className="w-5 h-5 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-500">No active campus updates right now.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
