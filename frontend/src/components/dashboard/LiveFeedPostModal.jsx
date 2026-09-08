import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, AlertTriangle, Trophy, Bell, Loader2 } from "lucide-react";
import livefeedService from "../../services/livefeedService";
import { toast } from "sonner";

export default function LiveFeedPostModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    type: "campus_alert",
    title: "",
    content: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await livefeedService.addFeed(formData);
      toast.success("Successfully posted to Live Campus Feed");
      onSuccess();
      onClose();
      setFormData({ type: "campus_alert", title: "", content: "" });
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to post");
    } finally {
      setLoading(false);
    }
  };

  

  return createPortal(
    <AnimatePresence>
      
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              New Live Feed Post
            </h3>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-2">
                Post Type
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: "campus_alert" })}
                  className={`flex flex-col items-center p-3 rounded-xl border transition-all ${
                    formData.type === "campus_alert"
                      ? "border-sky-500 bg-sky-50 text-sky-700"
                      : "border-slate-200 hover:border-slate-300 text-slate-600 bg-white"
                  }`}
                >
                  <Bell className="w-5 h-5 mb-1" />
                  <span className="text-xs font-semibold text-center">Notice / Alert</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: "achievement" })}
                  className={`flex flex-col items-center p-3 rounded-xl border transition-all ${
                    formData.type === "achievement"
                      ? "border-amber-500 bg-amber-50 text-amber-700"
                      : "border-slate-200 hover:border-slate-300 text-slate-600 bg-white"
                  }`}
                >
                  <Trophy className="w-5 h-5 mb-1" />
                  <span className="text-xs font-semibold text-center">Achievement</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: "emergency_blood" })}
                  className={`flex flex-col items-center p-3 rounded-xl border transition-all ${
                    formData.type === "emergency_blood"
                      ? "border-rose-500 bg-rose-50 text-rose-700"
                      : "border-slate-200 hover:border-slate-300 text-slate-600 bg-white"
                  }`}
                >
                  <AlertTriangle className="w-5 h-5 mb-1" />
                  <span className="text-xs font-semibold text-center">Blood Emergency</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">
                Headline
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. RUET Team wins NASA Space Apps"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">
                Details (Keep it short)
              </label>
              <textarea
                required
                rows="3"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write a brief description..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 transition-all outline-none resize-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || !formData.title || !formData.content}
                className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-sky-600/30 transition-all flex justify-center items-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Publish to Live Feed</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    
      )}
    </AnimatePresence>,
    document.body
  );
}
