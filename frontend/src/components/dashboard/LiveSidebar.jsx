import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Award, Bell, Activity, Trash2, Zap, Sparkles, Plus, Globe } from "lucide-react";
import LiveFeedPostModal from "./LiveFeedPostModal";
import livefeedService from "../../services/livefeedService";
import { useAuth } from "../../context/AuthContext";
import { formatDate } from "../../utils/helpers";

export function LiveSidebar({ onOpenPostModal }) {
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
    return <div className="h-full bg-white/50 dark:bg-slate-900/50 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 animate-pulse min-h-[400px]"></div>;
  }

  const emergencies = feeds.filter(f => f.type === "emergency_blood");
  const others = feeds.filter(f => f.type !== "emergency_blood");

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-6 sm:p-8 border border-indigo-500/30 shadow-2xl shadow-indigo-900/40 h-full flex flex-col space-y-6"
    >
      {/* Background Animated Elements */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }}></div>

      <div className="relative z-10 flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-500/20 rounded-xl backdrop-blur-md border border-indigo-400/30">
            <Activity className="w-6 h-6 text-indigo-400" />
          </div>
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Live Campus Feed
              <Sparkles className="w-4 h-4 text-sky-400 animate-bounce" />
            </h2>
            {(user?.role === "admin" || user?.role === "faculty") && (
              <button
                onClick={onOpenPostModal}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition-colors backdrop-blur-sm border border-white/10"
              >
                <Plus className="w-3.5 h-3.5" />
                Post
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-semibold text-emerald-400 tracking-wider uppercase">Live</span>
        </div>
      </div>

      <div className="relative z-10 flex-1 overflow-y-auto space-y-5 pr-2 custom-scrollbar">
        <AnimatePresence>
          {emergencies.map((feed) => (
            <motion.div
              key={feed._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative p-5 rounded-2xl bg-gradient-to-r from-rose-950/80 to-red-900/40 backdrop-blur-md border border-rose-500/50 hover:border-rose-400 transition-colors shadow-lg shadow-rose-900/20 group"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <AlertCircle className="w-24 h-24 text-rose-500" />
              </div>
              <div className="relative z-10 flex items-start space-x-4">
                <div className="p-3 bg-rose-500/20 rounded-2xl text-rose-400 border border-rose-500/30">
                  <AlertCircle className="w-6 h-6 animate-pulse" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-rose-100 text-lg mb-1">{feed.title}</h3>
                  <p className="text-sm text-rose-200/90 leading-relaxed mb-3">{feed.content}</p>
                  <p className="text-xs text-rose-400 font-semibold uppercase tracking-widest">{formatDate(feed.createdAt)}</p>
                </div>
              </div>
              {user?.role === "admin" && (
                <button onClick={() => handleDelete(feed._id)} className="absolute bottom-3 right-3 p-2 bg-rose-900/50 rounded-lg text-rose-300 opacity-0 group-hover:opacity-100 hover:bg-rose-800 transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
        
      
    </motion.div>
          ))}
          
          {others.map((feed) => (
            <motion.div
              key={feed._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`relative p-5 rounded-2xl backdrop-blur-md border hover:shadow-xl transition-all group ${
                feed.type === 'achievement' 
                  ? 'bg-gradient-to-br from-amber-900/30 to-orange-900/10 border-amber-500/30 hover:border-amber-400/50' 
                  : 'bg-white/5 border-white/10 hover:border-sky-400/30'
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-2xl border ${
                  feed.type === 'achievement' 
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' 
                    : 'bg-sky-500/20 text-sky-400 border-sky-500/30'
                }`}>
                  {feed.type === "achievement" ? <Award className="w-6 h-6" /> : feed.type === "ruet_news" ? <Globe className="w-6 h-6" /> : <Bell className="w-6 h-6" />}
                </div>
                <div className="flex-1">
                  <h3 className={`font-bold text-base mb-1 ${feed.type === 'achievement' ? 'text-amber-300' : 'text-slate-100'}`}>{feed.title}</h3>
                  <p className="text-sm text-slate-300/80 leading-relaxed mb-3">{feed.content}</p>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest">{formatDate(feed.createdAt)}</p>
                </div>
              </div>
              {user?.role === "admin" && (
                <button onClick={() => handleDelete(feed._id)} className="absolute bottom-3 right-3 p-2 bg-white/5 rounded-lg text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-white/10 hover:text-white transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </motion.div>
          ))}
          
          {feeds.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10">
                <Zap className="w-8 h-8 text-slate-500" />
              </div>
              <h3 className="text-slate-300 font-medium text-lg">All caught up</h3>
              <p className="text-sm text-slate-500 mt-1">No active campus updates at the moment.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
