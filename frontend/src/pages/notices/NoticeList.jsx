import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import noticeService from "../../services/noticeService";
import { formatDate } from "../../utils/helpers";
import { PageLoader } from "../../components/common/Loader";
import Modal from "../../components/common/Modal";
import {
  Bell,
  Plus,
  Search,
  FileText,
  Image as ImageIcon,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Calendar,
  User,
  Trash2,
} from "lucide-react";

export function NoticeList() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [notices, setNotices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Post Notice Modal (Faculty / Admin)
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ text: "", type: "" });

  // Attachment Preview Modal
  const [previewNotice, setPreviewNotice] = useState(null);

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const list = await noticeService.getNotices();
      setNotices(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handlePostNotice = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    setStatusMsg({ text: "", type: "" });

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("body", body);
      if (attachmentFile) {
        formData.append("attachment", attachmentFile);
      }

      await noticeService.createNotice(formData);

      setIsPostModalOpen(false);
      setTitle("");
      setBody("");
      setAttachmentFile(null);
      setStatusMsg({ text: "Notice broadcasted successfully across RUET OneHUB.", type: "success" });
      await fetchNotices();
    } catch (err) {
      setStatusMsg({ text: err.message || "Failed to post notice.", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteNotice = async (id) => {
    if (!window.confirm("Are you sure you want to delete this notice? This action cannot be undone.")) {
      return;
    }
    
    try {
      await noticeService.deleteNotice(id);
      setStatusMsg({ text: "Notice deleted successfully.", type: "success" });
      await fetchNotices();
    } catch (err) {
      setStatusMsg({ text: err.message || "Failed to delete notice.", type: "error" });
    }
  };

  if (loading) {
    return <PageLoader text="Loading university notice board..." />;
  }

  const filteredNotices = notices.filter(
    (n) =>
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.body?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center space-x-2.5">
            <Bell className="w-7 h-7 text-sky-600" />
            <span>Campus Notice & Circular Board</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Official announcements, academic schedules, examination notifications, and departmental memos.
          </p>
        </div>

        {(user?.role === "faculty" || user?.role === "admin" || user?.role === "hall_admin") && (
          <button
            onClick={() => setIsPostModalOpen(true)}
            className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-sm transition-smooth shadow-sm inline-flex items-center space-x-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Publish Notice</span>
          </button>
        )}
      </div>

      {statusMsg.text && (
        <div
          className={`p-4 rounded-2xl border flex items-center space-x-3 text-sm animate-in fade-in duration-200 ${
            statusMsg.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          {statusMsg.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search circulars by keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>

      {/* Notices Grid */}
      <div className="space-y-4">
        {filteredNotices.length === 0 ? (
          <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center text-slate-400">
            No notices found matching your search.
          </div>
        ) : (
          filteredNotices.map((notice) => (
            <div
              key={notice._id}
              className="p-6 bg-white rounded-2xl border border-slate-200/90 hover:border-sky-300 shadow-xs hover:shadow-md transition-smooth flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex-1 space-y-2">
                <div className="flex items-center space-x-3 text-xs text-slate-400">
                  <span className="flex items-center space-x-1 font-medium text-slate-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDate(notice.createdAt)}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center space-x-1 font-medium text-slate-500">
                    <User className="w-3.5 h-3.5" />
                    <span>Posted by {notice.postedBy?.name || "Administration"}</span>
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-800 leading-snug">
                  {notice.title}
                </h3>
                <p className="text-sm text-slate-600 whitespace-pre-line">{notice.body}</p>
              </div>

              <div className="shrink-0 flex items-center space-x-2">
                {(user?.role === "admin" || user?.id === notice.postedBy?._id || user?._id === notice.postedBy?._id) && (
                  <button
                    onClick={() => handleDeleteNotice(notice._id)}
                    className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-smooth"
                    title="Delete Notice"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                {notice.attachmentUrl && (
                  <>
                    <button
                      onClick={() => setPreviewNotice(notice)}
                      className="px-3.5 py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-xl text-xs font-semibold transition-smooth inline-flex items-center space-x-1.5"
                    >
                      {notice.attachmentType === "pdf" ? (
                        <FileText className="w-4 h-4 text-sky-600" />
                      ) : (
                        <ImageIcon className="w-4 h-4 text-sky-600" />
                      )}
                      <span>View Attachment</span>
                    </button>

                    <a
                      href={notice.attachmentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-smooth"
                      title="Open in new window"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Publish Notice Modal */}
      <Modal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        title="Publish Official Campus Circular"
      >
        <form onSubmit={handlePostNotice} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
              Notice Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Schedule for 2nd Year 1st Term Class Tests"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
              Notice Content / Circular Body
            </label>
            <textarea
              rows={4}
              required
              placeholder="Detailed notification announcement message..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
            ></textarea>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
              Attachment (PDF / Image Document)
            </label>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => setAttachmentFile(e.target.files[0] || null)}
              className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
            />
          </div>

          <div className="pt-3 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsPostModalOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-600 rounded-xl text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-xs transition-smooth shadow-sm disabled:opacity-50"
            >
              {submitting ? "Broadcasting..." : "Publish Circular"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Attachment Preview Modal */}
      {previewNotice && (
        <Modal
          isOpen={!!previewNotice}
          onClose={() => setPreviewNotice(null)}
          title={`Attachment: ${previewNotice.title}`}
          maxWidth="max-w-4xl"
        >
          <div className="space-y-4">
            {previewNotice.attachmentType === "pdf" ? (
              <iframe
                src={previewNotice.attachmentUrl}
                title="Notice PDF Attachment"
                className="w-full h-[600px] rounded-xl border border-slate-200"
              ></iframe>
            ) : (
              <img
                src={previewNotice.attachmentUrl}
                alt="Notice Attachment"
                className="w-full max-h-[600px] object-contain rounded-xl border border-slate-200"
              />
            )}

            <div className="flex justify-end">
              <a
                href={previewNotice.attachmentUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-xs inline-flex items-center space-x-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Fullscreen in New Tab</span>
              </a>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default NoticeList;
