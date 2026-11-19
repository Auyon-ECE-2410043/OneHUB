/**
 * File: CourseDetails.jsx
 * Description: React component rendering the Course Details interface with
 * Course Materials & Resource Vault, Lab Manual & Experiment Tracker,
 * Approved Student Roster, and OBE Configuration.
 * 
 * Part of the RUET OneHub Project.
 */

import { useState, useEffect } from "react";
import { useParams, Link, useOutletContext } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import courseService from "../../services/courseService";
import CourseOBEProfile from "./CourseOBEProfile";
import { PageLoader } from "../../components/common/Loader";
import { toast } from "sonner";
import {
  Users,
  CalendarCheck,
  Award,
  ArrowLeft,
  Search,
  BookOpen,
  FileText,
  Video,
  ExternalLink,
  Download,
  Plus,
  Trash2,
  Copy,
  CheckCircle2,
  Clock,
  AlertCircle,
  FlaskConical,
  FolderGit2,
  Share2,
  Check,
  Upload,
} from "lucide-react";

export function CourseDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const { features = {} } = useOutletContext() || {};
  const isObeEnabled = features.obe !== false;

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("resources"); // default to resources or experiments
  
  // Resources state
  const [resources, setResources] = useState([]);
  const [resourceFilter, setResourceFilter] = useState("all");
  const [resourceSearch, setResourceSearch] = useState("");
  const [isAddResourceOpen, setIsAddResourceOpen] = useState(false);
  const [newResource, setNewResource] = useState({
    title: "",
    type: "slides",
    url: "",
    description: "",
  });
  const [submittingResource, setSubmittingResource] = useState(false);

  // Experiments state
  const [experiments, setExperiments] = useState([]);
  const [labProgress, setLabProgress] = useState([]);
  const [isSubmitReportOpen, setIsSubmitReportOpen] = useState(false);
  const [selectedExpForSubmit, setSelectedExpForSubmit] = useState(null);
  const [reportUrlInput, setReportUrlInput] = useState("");
  const [isAddExpOpen, setIsAddExpOpen] = useState(false);
  const [newExp, setNewExp] = useState({
    expNo: 1,
    title: "",
    description: "",
    sheetUrl: "",
    dateConducted: "",
    maxMarks: 20,
  });

  const canPostResource = user?.role === "admin" || user?.role === "faculty" || user?.isCR;
  const canManageExperiments = user?.role === "admin" || user?.role === "faculty";

  useEffect(() => {
    const fetchCourseData = async () => {
      setLoading(true);
      try {
        const [courseData, enrolledStudents, progressData] = await Promise.allSettled([
          courseService.getCourseById(id).catch(async () => {
            const all = await courseService.getAllCourses();
            return all.find((c) => c._id === id);
          }),
          courseService.getCourseStudents(id),
          courseService.getExperimentProgress(id),
        ]);

        if (courseData.status === "fulfilled" && courseData.value) {
          const current = courseData.value;
          setCourse(current);
          setResources(current.resources || []);
          setExperiments(current.experiments || []);
          // If sessional course, default to experiments tab
          if (current.courseType === "sessional") {
            setActiveTab("experiments");
          } else {
            setActiveTab("resources");
          }
        }

        if (enrolledStudents.status === "fulfilled") {
          setStudents(enrolledStudents.value);
        }

        if (progressData.status === "fulfilled") {
          setLabProgress(progressData.value);
        }
      } catch (err) {
        console.error("Failed to load course details:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCourseData();
  }, [id]);

  // Handle Add Resource
  const handleAddResource = async (e) => {
    e.preventDefault();
    if (!newResource.title || !newResource.url) {
      toast.error("Please enter a title and resource URL.");
      return;
    }
    setSubmittingResource(true);
    try {
      const res = await courseService.addCourseResource(id, newResource);
      toast.success("Course resource posted successfully!");
      if (res.resources) {
        setResources(res.resources);
      } else if (res.resource) {
        setResources([res.resource, ...resources]);
      }
      setIsAddResourceOpen(false);
      setNewResource({ title: "", type: "slides", url: "", description: "" });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to post resource.");
    } finally {
      setSubmittingResource(false);
    }
  };

  // Handle Delete Resource
  const handleDeleteResource = async (resourceId) => {
    if (!window.confirm("Are you sure you want to remove this resource?")) return;
    try {
      const res = await courseService.deleteCourseResource(id, resourceId);
      toast.success("Resource removed.");
      if (res.resources) setResources(res.resources);
      else setResources(resources.filter((r) => r._id !== resourceId));
    } catch (err) {
      toast.error("Failed to delete resource.");
    }
  };

  // Handle Copy Link
  const handleCopyLink = (url) => {
    navigator.clipboard.writeText(url);
    toast.success("Resource URL copied to clipboard!");
  };

  // Handle Add Experiment (Faculty)
  const handleAddExperiment = async (e) => {
    e.preventDefault();
    if (!newExp.title) {
      toast.error("Experiment title is required.");
      return;
    }
    try {
      const res = await courseService.addCourseExperiment(id, newExp);
      toast.success("Experiment saved successfully!");
      if (res.experiments) setExperiments(res.experiments);
      setIsAddExpOpen(false);
      setNewExp({
        expNo: experiments.length + 2,
        title: "",
        description: "",
        sheetUrl: "",
        dateConducted: "",
        maxMarks: 20,
      });
    } catch (err) {
      toast.error("Failed to save experiment.");
    }
  };

  // Handle Submit Lab Report (Student)
  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!reportUrlInput) {
      toast.error("Please enter a valid report link (Google Drive / GitHub).");
      return;
    }
    try {
      await courseService.updateExperimentStatus(id, selectedExpForSubmit.expNo, {
        reportUrl: reportUrlInput,
      });
      toast.success(`Lab Report for Exp ${selectedExpForSubmit.expNo} submitted!`);
      // Refresh progress
      const refreshed = await courseService.getExperimentProgress(id);
      setLabProgress(refreshed);
      setIsSubmitReportOpen(false);
      setReportUrlInput("");
    } catch (err) {
      toast.error("Failed to submit lab report.");
    }
  };

  if (loading) {
    return <PageLoader text="Loading course resources, experiments & roster..." />;
  }

  const filteredStudents = students.filter((s) => {
    const term = searchTerm.toLowerCase();
    return s.name?.toLowerCase().includes(term) || s.rollNo?.toLowerCase().includes(term);
  });

  const filteredResources = resources.filter((r) => {
    const matchesFilter = resourceFilter === "all" || r.type === resourceFilter;
    const matchesSearch =
      r.title?.toLowerCase().includes(resourceSearch.toLowerCase()) ||
      r.description?.toLowerCase().includes(resourceSearch.toLowerCase()) ||
      r.uploadedBy?.toLowerCase().includes(resourceSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getResourceTypeIcon = (type) => {
    switch (type) {
      case "slides":
        return <FileText className="w-5 h-5 text-sky-600" />;
      case "book":
        return <BookOpen className="w-5 h-5 text-emerald-600" />;
      case "youtube":
        return <Video className="w-5 h-5 text-rose-600" />;
      case "drive":
        return <FolderGit2 className="w-5 h-5 text-amber-600" />;
      case "question":
        return <Award className="w-5 h-5 text-violet-600" />;
      default:
        return <FileText className="w-5 h-5 text-slate-600" />;
    }
  };

  const getResourceTypeBadge = (type) => {
    const styles = {
      slides: "bg-sky-50 text-sky-700 border-sky-200",
      book: "bg-emerald-50 text-emerald-700 border-emerald-200",
      youtube: "bg-rose-50 text-rose-700 border-rose-200",
      drive: "bg-amber-50 text-amber-700 border-amber-200",
      question: "bg-violet-50 text-violet-700 border-violet-200",
      note: "bg-slate-50 text-slate-700 border-slate-200",
    };
    return (
      <span
        className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md border ${
          styles[type] || "bg-slate-50 text-slate-700 border-slate-200"
        }`}
      >
        {type}
      </span>
    );
  };

  const isSessional = course?.courseType === "sessional";

  return (
    <div className="space-y-6">
      {/* Course Header */}
      <div className="flex items-center space-x-3">
        <Link
          to="/courses"
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-smooth"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xl font-bold text-sky-600">{course?.courseCode || "Course"}</span>
            <span className="text-slate-400 font-bold">-</span>
            <h1 className="text-2xl font-bold text-slate-800">{course?.courseName || "Details"}</h1>
            {isSessional && (
              <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                Sessional / Laboratory
              </span>
            )}
          </div>
          <p className="text-slate-500 text-sm mt-0.5">
            Department of {course?.department || "ECE"} • Semester {course?.semester || "N/A"} •{" "}
            <span className="font-bold text-slate-700">{course?.credit || 0} Credits</span>
          </p>
        </div>
      </div>

      {/* Quick Action Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-4 text-sm text-slate-600">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-sky-600" />
            <span>
              <strong className="text-slate-900">{students.length}</strong> Enrolled Students
            </span>
          </div>
          <div className="hidden sm:inline text-slate-300">•</div>
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <span>
              <strong className="text-slate-900">{resources.length}</strong> Course Resources
            </span>
          </div>
          {isSessional && (
            <>
              <div className="hidden sm:inline text-slate-300">•</div>
              <div className="flex items-center space-x-2">
                <FlaskConical className="w-4 h-4 text-emerald-600" />
                <span>
                  <strong className="text-slate-900">{experiments.length}</strong> Lab Experiments
                </span>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to={`/attendance/mark?courseId=${id}&semester=${course?.semester}`}
            className="px-3.5 py-2 bg-sky-50 text-sky-700 hover:bg-sky-100 font-semibold rounded-xl text-xs transition-smooth inline-flex items-center space-x-1.5"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Mark Attendance</span>
          </Link>
          <Link
            to={`/marks/entry?courseId=${id}&semester=${course?.semester}`}
            className="px-3.5 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold rounded-xl text-xs transition-smooth inline-flex items-center space-x-1.5"
          >
            <Award className="w-4 h-4" />
            <span>Enter Marks</span>
          </Link>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab("resources")}
          className={`px-5 py-3 font-semibold text-sm transition-colors flex items-center space-x-2 ${
            activeTab === "resources"
              ? "border-b-2 border-sky-500 text-sky-600"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Course Resources & Slides ({resources.length})</span>
        </button>

        {isSessional && (
          <button
            onClick={() => setActiveTab("experiments")}
            className={`px-5 py-3 font-semibold text-sm transition-colors flex items-center space-x-2 ${
              activeTab === "experiments"
                ? "border-b-2 border-emerald-500 text-emerald-600"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <FlaskConical className="w-4 h-4" />
            <span>Lab Manual & Experiments ({experiments.length})</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab("roster")}
          className={`px-5 py-3 font-semibold text-sm transition-colors flex items-center space-x-2 ${
            activeTab === "roster"
              ? "border-b-2 border-sky-500 text-sky-600"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Approved Roster ({students.length})</span>
        </button>

        {(user?.role === "admin" || user?.role === "faculty") && isObeEnabled && (
          <button
            onClick={() => setActiveTab("obe")}
            className={`px-5 py-3 font-semibold text-sm transition-colors flex items-center space-x-2 ${
              activeTab === "obe"
                ? "border-b-2 border-sky-500 text-sky-600"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Award className="w-4 h-4" />
            <span>OBE Configuration</span>
          </button>
        )}
      </div>

      {/* TAB 1: COURSE RESOURCES & SLIDES */}
      {activeTab === "resources" && (
        <div className="space-y-5">
          {/* Controls: Search, Category Filters, and Add Resource */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
              {[
                { id: "all", label: "All Items" },
                { id: "slides", label: "Slides" },
                { id: "book", label: "Textbooks" },
                { id: "youtube", label: "Video Lectures" },
                { id: "drive", label: "Google Drive" },
                { id: "question", label: "Past Questions" },
                { id: "note", label: "Lecture Notes" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setResourceFilter(f.id)}
                  className={`px-3 py-1.5 rounded-xl transition-smooth ${
                    resourceFilter === f.id
                      ? "bg-sky-600 text-white shadow-xs"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-60">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search slides, books..."
                  value={resourceSearch}
                  onChange={(e) => setResourceSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {canPostResource && (
                <button
                  onClick={() => setIsAddResourceOpen(true)}
                  className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition-smooth shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Post Resource</span>
                </button>
              )}
            </div>
          </div>

          {/* Resources Grid */}
          {filteredResources.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 space-y-2">
              <BookOpen className="w-10 h-10 mx-auto text-slate-300" />
              <h3 className="font-bold text-base text-slate-700">No resources found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No course materials matching the selected category. Faculty and Class Representatives (CRs) can post lecture slides, books, and past exam questions.
              </p>
              {canPostResource && (
                <button
                  onClick={() => setIsAddResourceOpen(true)}
                  className="mt-3 px-4 py-2 bg-sky-600 text-white text-xs font-semibold rounded-xl inline-flex items-center space-x-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add First Resource</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredResources.map((item) => (
                <div
                  key={item._id}
                  className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-sky-300 shadow-xs hover:shadow-md transition-smooth flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start space-x-3">
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 shrink-0 mt-0.5">
                          {getResourceTypeIcon(item.type)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            {getResourceTypeBadge(item.type)}
                            <span className="text-[11px] text-slate-400">
                              {new Date(item.createdAt).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 mt-1 leading-snug">
                            {item.title}
                          </h4>
                        </div>
                      </div>

                      {canPostResource && (
                        <button
                          onClick={() => handleDeleteResource(item._id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete resource"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {item.description && (
                      <p className="text-xs text-slate-600 pl-12 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 text-[11px]">
                      By: <strong className="text-slate-700">{item.uploadedBy}</strong>
                    </span>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleCopyLink(item.url)}
                        className="px-2.5 py-1 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer"
                        title="Copy link"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Copy</span>
                      </button>

                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors"
                      >
                        <span>Open</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: LAB MANUAL & EXPERIMENTS (FOR SESSIONAL COURSES) */}
      {activeTab === "experiments" && isSessional && (
        <div className="space-y-6">
          {/* Summary Progress Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs text-center">
              <span className="text-xs text-slate-500 font-semibold uppercase">Total Experiments</span>
              <p className="text-2xl font-black text-slate-800 mt-1">{experiments.length}</p>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs text-center">
              <span className="text-xs text-slate-500 font-semibold uppercase">Evaluated</span>
              <p className="text-2xl font-black text-emerald-600 mt-1">
                {labProgress.filter((p) => p.status === "evaluated").length}
              </p>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs text-center">
              <span className="text-xs text-slate-500 font-semibold uppercase">Submitted</span>
              <p className="text-2xl font-black text-sky-600 mt-1">
                {labProgress.filter((p) => p.status === "submitted").length}
              </p>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs text-center">
              <span className="text-xs text-slate-500 font-semibold uppercase">Pending</span>
              <p className="text-2xl font-black text-amber-600 mt-1">
                {experiments.length - labProgress.filter((p) => p.status === "evaluated" || p.status === "submitted").length}
              </p>
            </div>
          </div>

          {/* Header Bar */}
          <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <h3 className="font-bold text-base text-slate-800">Laboratory Experiments (Exp 1 - {experiments.length || 10})</h3>
              <p className="text-xs text-slate-500">Track experiment objectives, download official lab sheets, and submit reports.</p>
            </div>

            {canManageExperiments && (
              <button
                onClick={() => setIsAddExpOpen(true)}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition-smooth cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Experiment</span>
              </button>
            )}
          </div>

          {/* Experiments List */}
          {experiments.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 space-y-2">
              <FlaskConical className="w-10 h-10 mx-auto text-slate-300" />
              <h3 className="font-bold text-base text-slate-700">No experiments listed yet</h3>
              <p className="text-xs text-slate-500">Course teachers can configure Exp 1 through Exp 10 with titles and lab sheet downloads.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {experiments.map((exp) => {
                const progress = labProgress.find((p) => p.expNo === exp.expNo) || {};
                const isEvaluated = progress.status === "evaluated";
                const isSubmitted = progress.status === "submitted";

                return (
                  <div
                    key={exp.expNo}
                    className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 shadow-xs transition-smooth"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 font-mono font-black flex items-center justify-center text-sm shrink-0 border border-emerald-200">
                          #{exp.expNo < 10 ? `0${exp.expNo}` : exp.expNo}
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-base text-slate-900">{exp.title}</span>
                            {exp.dateConducted && (
                              <span className="text-[11px] font-mono text-slate-400">
                                • Held: {exp.dateConducted}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                            {exp.description}
                          </p>

                          {isEvaluated && progress.feedback && (
                            <div className="p-2 bg-emerald-50/80 border border-emerald-200 rounded-lg text-xs text-emerald-900 font-medium mt-2">
                              <strong>Teacher Feedback:</strong> {progress.feedback}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Action & Status Box */}
                      <div className="flex sm:flex-col items-end justify-between sm:justify-start gap-2 shrink-0">
                        
                        {/* Status Badge */}
                        {isEvaluated ? (
                          <div className="flex items-center space-x-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Score: {progress.marksObtained} / {exp.maxMarks || 20}</span>
                          </div>
                        ) : isSubmitted ? (
                          <div className="flex items-center space-x-1.5 px-3 py-1 bg-sky-100 text-sky-800 rounded-full font-bold text-xs">
                            <Clock className="w-3.5 h-3.5 text-sky-600" />
                            <span>Submitted • Under Review</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full font-bold text-xs">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                            <span>Pending Submission</span>
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex items-center space-x-2 mt-2">
                          {exp.sheetUrl && (
                            <a
                              href={exp.sheetUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors"
                              title="Download Lab Sheet"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Lab Sheet</span>
                            </a>
                          )}

                          <button
                            onClick={() => {
                              setSelectedExpForSubmit(exp);
                              setReportUrlInput(progress.reportUrl || "");
                              setIsSubmitReportOpen(true);
                            }}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>{progress.reportUrl ? "Update Report" : "Submit Report"}</span>
                          </button>
                        </div>

                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: APPROVED ROSTER */}
      {activeTab === "roster" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="font-bold text-base text-slate-800">Approved Student Roster</h3>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by student name or roll..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Roll Number</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Batch</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No approved student registrations found for this course.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s, idx) => (
                    <tr key={s._id || idx} className="hover:bg-slate-50/80 transition-smooth">
                      <td className="py-3 px-4 text-slate-400 font-mono text-xs">{idx + 1}</td>
                      <td className="py-3 px-4 font-mono font-bold text-sky-700">
                        {s.rollNo || "N/A"}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{s.name}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-xs text-slate-600 font-medium">
                          {s.department || "ECE"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-xs">
                        {s.batch ? `Batch '${s.batch}` : "N/A"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: OBE CONFIGURATION */}
      {activeTab === "obe" && <CourseOBEProfile courseId={id} />}

      {/* MODAL: Add Resource */}
      {isAddResourceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-sky-400" />
                <h3 className="font-bold text-base">Post Course Resource & Slides</h3>
              </div>
              <button
                onClick={() => setIsAddResourceOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddResource} className="p-6 space-y-4 text-xs font-medium">
              <div>
                <label className="block text-slate-700 mb-1">Resource Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lecture 05: Relational Algebra & Calculus Slides"
                  value={newResource.title}
                  onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none text-slate-900 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">Resource Type</label>
                  <select
                    value={newResource.type}
                    onChange={(e) => setNewResource({ ...newResource, type: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none text-slate-900 text-xs"
                  >
                    <option value="slides">Lecture Slides</option>
                    <option value="book">Reference Book / PDF</option>
                    <option value="youtube">YouTube Lecture Link</option>
                    <option value="drive">Google Drive Folder</option>
                    <option value="question">Past Exam Questions</option>
                    <option value="note">Class Notes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">Resource URL / Link *</label>
                  <input
                    type="url"
                    required
                    placeholder="https://drive.google.com/..."
                    value={newResource.url}
                    onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none text-slate-900 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Short Description / Syllabus Coverage</label>
                <textarea
                  rows="3"
                  placeholder="Summary of topics covered, chapter references, or instructions for students..."
                  value={newResource.description}
                  onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none text-slate-900 text-xs"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddResourceOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingResource}
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl disabled:opacity-50 cursor-pointer"
                >
                  {submittingResource ? "Posting..." : "Publish Resource"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Submit Lab Report */}
      {isSubmitReportOpen && selectedExpForSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 bg-emerald-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FlaskConical className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base">Submit Lab Report (Exp #{selectedExpForSubmit.expNo})</h3>
              </div>
              <button
                onClick={() => setIsSubmitReportOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitReport} className="p-6 space-y-4 text-xs font-medium">
              <div>
                <p className="font-bold text-sm text-slate-800">{selectedExpForSubmit.title}</p>
                <p className="text-slate-500 text-xs mt-1">{selectedExpForSubmit.description}</p>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">
                  Report Drive / GitHub Link *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://drive.google.com/file/d/... or GitHub repo"
                  value={reportUrlInput}
                  onChange={(e) => setReportUrlInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-900 text-xs"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Ensure the Google Drive link has view permissions set to "Anyone with the link".
                </p>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSubmitReportOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl cursor-pointer"
                >
                  Submit Lab Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add Experiment (Faculty/Admin) */}
      {isAddExpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FlaskConical className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base">Add Lab Experiment Entry</h3>
              </div>
              <button onClick={() => setIsAddExpOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddExperiment} className="p-6 space-y-4 text-xs font-medium">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">Exp Number *</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    required
                    value={newExp.expNo}
                    onChange={(e) => setNewExp({ ...newExp, expNo: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 text-xs"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-slate-700 mb-1">Experiment Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Study of Amplitude Modulation & Demodulation"
                    value={newExp.title}
                    onChange={(e) => setNewExp({ ...newExp, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Experiment Description / Apparatus</label>
                <textarea
                  rows="2"
                  placeholder="Objective, required kits, oscilloscope, software tools..."
                  value={newExp.description}
                  onChange={(e) => setNewExp({ ...newExp, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">Lab Sheet / Manual URL</label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/...pdf"
                    value={newExp.sheetUrl}
                    onChange={(e) => setNewExp({ ...newExp, sheetUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">Date Conducted</label>
                  <input
                    type="date"
                    value={newExp.dateConducted}
                    onChange={(e) => setNewExp({ ...newExp, dateConducted: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddExpOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl cursor-pointer"
                >
                  Save Experiment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CourseDetails;
