/**
 * File: Dashboard.jsx
 * Description: The main dashboard overview after a user logs in.
 * 
 * This file is part of the RUET OneHub Project.
 */

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { CourseDistributionChart } from "../../components/dashboard/CourseDistributionChart";
import courseService from "../../services/courseService";
import registrationService from "../../services/registrationService";
import feeService from "../../services/feeService";
import noticeService from "../../services/noticeService";
import userService from "../../services/userService";
import hallApplicationService from "../../services/hallApplicationService";
import { formatCurrency, formatDate, getStatusBadge, getStatusLabel } from "../../utils/helpers";
import { PageLoader } from "../../components/common/Loader";
import {
  BookOpen,
  CalendarCheck,
  CreditCard,
  Building,
  Bell,
  Award,
  ArrowRight,
  Clock,
  Users,
} from "lucide-react";

export function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [maintenance, setMaintenance] = useState(false);
  const [features, setFeatures] = useState({});
  const [togglingFeature, setTogglingFeature] = useState(null);
  const [maintenanceLoading, setMaintenanceLoading] = useState(false);

  
  const handleToggleFeature = async (featureKey) => {
    setTogglingFeature(featureKey);
    const currentState = features[featureKey] !== false;
    const newState = !currentState;
    
    // Optimistic UI update
    setFeatures(prev => ({ ...prev, [featureKey]: newState }));
    
    try {
      const { default: api } = await import("../../services/api");
      const res = await api.post("/settings/feature", { featureKey, enabled: newState });
      setFeatures(res.data.features || { ...features, [featureKey]: newState });
    } catch (e) {
      console.error("Toggle failed", e);
      setFeatures(prev => ({ ...prev, [featureKey]: currentState })); // revert
      alert("Failed to save feature toggle: " + (e.response?.data?.error || e.message));
    } finally {
      setTogglingFeature(null);
    }
  };

  // Data states
  const [coursesData, setCoursesData] = useState(null);
  const [allCourses, setAllCourses] = useState([]);
  const [registration, setRegistration] = useState(null);
  const [pendingRegistrations, setPendingRegistrations] = useState([]);
  const [fees, setFees] = useState([]);
  const [notices, setNotices] = useState([]);
  const [facultyStats, setFacultyStats] = useState(null);
  const [hallApplications, setHallApplications] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Load notices for everyone
        try {
          const fetchedNotices = await noticeService.getNotices();
          setNotices(fetchedNotices.slice(0, 4));
        } catch (e) {
          console.warn("Could not load notices", e);
        }

        // Student-specific data
        if (user?.role === "student") {
          try {
            const [assignedCourses, reg, myFees] = await Promise.allSettled([
              courseService.getAssignedCourses(),
              registrationService.getMyRegistration(),
              feeService.getMyFees(),
            ]);

            if (assignedCourses.status === "fulfilled") setCoursesData(assignedCourses.value);
            if (reg.status === "fulfilled") setRegistration(reg.value);
            if (myFees.status === "fulfilled") setFees(myFees.value);
          } catch (e) {
            console.warn("Student data fetch error", e);
          }
        }

        // Faculty-specific data
        if (user?.role === "faculty") {
          try {
            const [courses, pending] = await Promise.allSettled([
              courseService.getAllCourses(),
              registrationService.getPendingRegistrations(),
            ]);
            if (courses.status === "fulfilled") setAllCourses(courses.value);
            if (pending.status === "fulfilled") setPendingRegistrations(pending.value);
          } catch (e) {
            console.warn("Faculty data fetch error", e);
          }
        }

        // Admin-specific data
        if (user?.role === "admin" || user?.role === "hall_admin") {
          try {
            const [fStats, apps, pending] = await Promise.allSettled([
              userService.getFacultyStats(),
              hallApplicationService.getAllApplications(),
              registrationService.getPendingRegistrations(),
            ]);
            if (fStats.status === "fulfilled") setFacultyStats(fStats.value);
            if (apps.status === "fulfilled") setHallApplications(apps.value);
            if (pending.status === "fulfilled") setPendingRegistrations(pending.value);
          } catch (e) {
            console.warn("Admin data fetch error", e);
          }

          if (user?.role === "admin") {
            try {
              const { default: api } = await import("../../services/api");
              const res = await api.get("/settings");
              setMaintenance(res.data.maintenanceMode);
                      setFeatures(res.data.features || {});
        setFeatures(res.data.features || {});
            } catch (e) {
              console.warn("Could not load settings", e);
            }
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return <PageLoader text="Loading your RUET dashboard..." />;
  }

  // Calculate student fee stats
  const dueFees = fees.filter((f) => f.status === "due");
  const totalDueAmount = dueFees.reduce((sum, f) => sum + (f.amount || 0), 0);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Welcome Banner */}
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-700 via-sky-600 to-indigo-700 dark:from-sky-900 dark:via-sky-800 dark:to-indigo-950 p-6 sm:p-8 text-white shadow-lg shadow-sky-900/10">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="space-y-2 max-w-xl">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Welcome back, {user?.name.split(" ")[0]}!
            </h1>
            <p className="text-sky-100 text-sm sm:text-base leading-relaxed">
              {user?.role === "student"
                ? "Here's what's happening with your courses, routine, and fees today."
                : user?.role === "faculty"
                ? "Manage your assigned courses, view your teaching routine, and track student registrations."
                : "Overview of system activity, pending registrations, and administrative tasks."}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {user?.role === "student" && (
              <Link
                to="/registration"
                className="px-4 py-2.5 bg-white text-sky-700 hover:bg-sky-50 font-semibold rounded-xl text-sm transition-smooth shadow-sm inline-flex items-center space-x-2"
              >
                <span>Course Registration</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
            {user?.role === "faculty" && (
              <Link
                to="/attendance/mark"
                className="px-4 py-2.5 bg-white text-sky-700 hover:bg-sky-50 font-semibold rounded-xl text-sm transition-smooth shadow-sm inline-flex items-center space-x-2"
              >
                <span>Take Attendance</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
            {user?.role === "admin" && (
              <>
                <Link
                  to="/course-assignments"
                  className="px-4 py-2.5 bg-white text-sky-700 hover:bg-sky-50 font-semibold rounded-xl text-sm transition-smooth shadow-sm inline-flex items-center space-x-2"
                >
                  <span>Assign Batch Courses</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={async () => {
                    setMaintenanceLoading(true);
                    try {
                      const { default: api } = await import("../../services/api");
                      const res = await api.post("/settings/maintenance");
                      setMaintenance(res.data.maintenanceMode);
                    } catch (e) {
                      console.error(e);
                    } finally {
                      setMaintenanceLoading(false);
                    }
                  }}
                  disabled={maintenanceLoading}
                  className={`px-4 py-2.5 font-semibold rounded-xl text-sm transition-smooth shadow-sm inline-flex items-center space-x-2 ${
                    maintenance
                      ? "bg-rose-500 hover:bg-rose-600 text-white"
                      : "bg-white/20 hover:bg-white/30 text-white backdrop-blur-md"
                  }`}
                >
                  <span>{maintenanceLoading ? "Switching..." : maintenance ? "Maintenance: ON" : "Turn Off Website"}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* STUDENT DASHBOARD METRICS */}
      {user?.role === "student" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Assigned Courses with Chart */}
          <motion.div variants={itemVariants} className="p-5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-smooth flex flex-col">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Course Credits
              </span>
              <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>
            
            <div className="mt-4 flex-1">
              <CourseDistributionChart coursesData={coursesData} />
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {coursesData?.totalCredit || 0} Total Credits
              </div>
              <Link to="/courses" className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 inline-flex items-center">
                View All <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
            </div>
          </motion.div>

          {/* Registration Status */}
          <motion.div variants={itemVariants} className="p-5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-smooth">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Registration
              </span>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-lg font-bold text-slate-800 truncate">
                {registration ? (
                  <span className={`inline-block px-2.5 py-1 text-xs rounded-full border ${getStatusBadge(registration.status)}`}>
                    {getStatusLabel(registration.status)}
                  </span>
                ) : (
                  <span className="text-sm font-medium text-slate-400">Not Submitted</span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {registration?.semester ? `Semester: ${registration.semester}` : "Current session"}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100">
              <Link to="/registration" className="text-xs font-semibold text-sky-600 hover:text-sky-700 inline-flex items-center">
                Registration details <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
            </div>
          </motion.div>

          {/* Fee Dues */}
          <motion.div variants={itemVariants} className="p-5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-smooth">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Fee Dues
              </span>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-slate-800">
                {formatCurrency(totalDueAmount)}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {dueFees.length} unpaid bill{dueFees.length === 1 ? "" : "s"}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100">
              <Link to="/fees" className="text-xs font-semibold text-sky-600 hover:text-sky-700 inline-flex items-center">
                Pay online <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
            </div>
          </motion.div>

          {/* Quick Hall / Profile */}
          <motion.div variants={itemVariants} className="p-5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-smooth">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Hall Portal
              </span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Building className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-base font-bold text-slate-800">
                Residential Seat
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Merit & Need Allocations
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100">
              <Link to="/hall" className="text-xs font-semibold text-sky-600 hover:text-sky-700 inline-flex items-center">
                Apply or check status <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
            </div>
          </motion.div>
        </div>
      )}

      {/* FACULTY / ADMIN DASHBOARD METRICS */}
      {(user?.role === "faculty" || user?.role === "admin" || user?.role === "hall_admin") && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Pending Registrations
              </span>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-slate-800">
                {pendingRegistrations.length}
              </div>
              <p className="text-xs text-slate-500 mt-1">Awaiting advisor review</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100">
              <Link to="/registration" className="text-xs font-semibold text-sky-600 hover:text-sky-700 inline-flex items-center">
                Review submissions <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
            </div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Active Courses
              </span>
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-slate-800">
                {allCourses.length}
              </div>
              <p className="text-xs text-slate-500 mt-1">Available in syllabus</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100">
              <Link to="/courses" className="text-xs font-semibold text-sky-600 hover:text-sky-700 inline-flex items-center">
                View catalog <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
            </div>
          </div>

          {(user?.role === "admin" || user?.role === "hall_admin") && (
            <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Hall Applications
                </span>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Building className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-slate-800">
                  {hallApplications.length}
                </div>
                <p className="text-xs text-slate-500 mt-1">Submitted student applications</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100">
                <Link to="/hall/review" className="text-xs font-semibold text-sky-600 hover:text-sky-700 inline-flex items-center">
                  Process applications <ArrowRight className="w-3 h-3 ml-1" />
                </Link>
              </div>
            </div>
          )}

          {user?.role === "admin" && facultyStats && (
            <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Faculty Stats
                </span>
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-slate-800">
                  {facultyStats.professor + facultyStats.associateProfessor + facultyStats.assistantProfessor + facultyStats.lecturer}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {facultyStats.phdHolder} PhD Holders
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100">
                <Link to="/faculty" className="text-xs font-semibold text-sky-600 hover:text-sky-700 inline-flex items-center">
                  Faculty Directory <ArrowRight className="w-3 h-3 ml-1" />
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      
      {user?.role === "admin" && (
        <div className="mb-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Module Access Control</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Enable or disable specific features across the portal. Disabled modules will show an "Under Maintenance" screen to students and faculty.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {[
              { key: 'routine', label: 'Weekly Routine' },
              { key: 'courses', label: 'Courses' },
              { key: 'registration', label: 'Registration' },
              { key: 'attendance', label: 'Attendance' },
              { key: 'marks', label: 'Marks' },
              { key: 'cgpa', label: 'CGPA Analytics' },
              { key: 'fees', label: 'Fees & Payment' },
              { key: 'hall', label: 'Hall App' },
              { key: 'medical', label: 'Medical Center' },
              { key: 'notices', label: 'Notice Board' },
              { key: 'faculty', label: 'Faculty Dir' },
              { key: 'calendar', label: 'Calendar' }
            ].map(f => {
              const isEnabled = features[f.key] !== false;
              const isToggling = togglingFeature === f.key;
              
              return (
                <button
                  key={f.key}
                  onClick={() => handleToggleFeature(f.key)}
                  disabled={isToggling}
                  className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden ${isEnabled ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-sky-300 shadow-sm' : 'bg-slate-50 dark:bg-slate-900/50 border-rose-200 dark:border-rose-900/30'}`}
                >
                  <div className="flex justify-between items-start mb-2.5">
                    <span className={`text-xs font-bold uppercase tracking-wider ${isEnabled ? 'text-slate-500 dark:text-slate-400' : 'text-rose-500 dark:text-rose-400'}`}>
                      {f.label}
                    </span>
                    <div className={`w-8 h-4 rounded-full flex items-center p-0.5 transition-colors ${isEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                      <div className={`w-3 h-3 bg-white rounded-full shadow-sm transform transition-transform ${isEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                    </div>
                  </div>
                  <div className={`text-xs font-semibold ${isEnabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-500'}`}>
                    {isToggling ? 'Updating...' : isEnabled ? 'Active' : 'Disabled'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Two Column Section: Quick Shortcuts & Recent Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
            <span>Quick Services</span>
          </h2>

          <div className="grid grid-cols-1 gap-3">
            {user?.role === "student" && (
              <>
                <Link
                  to="/attendance"
                  className="p-4 bg-white hover:bg-sky-50/50 rounded-2xl border border-slate-200/80 flex items-center justify-between group transition-smooth"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center group-hover:bg-sky-600 group-hover:text-white transition-smooth">
                      <CalendarCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800">Attendance Tracker</h4>
                      <p className="text-xs text-slate-500">Day-by-day class attendance %</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 group-hover:translate-x-1 transition-smooth" />
                </Link>

                <Link
                  to="/marks"
                  className="p-4 bg-white hover:bg-sky-50/50 rounded-2xl border border-slate-200/80 flex items-center justify-between group transition-smooth"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-smooth">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800">Marks & Grade Sheets</h4>
                      <p className="text-xs text-slate-500">CTs, Quizzes, Assignments, Finals</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-smooth" />
                </Link>

                <Link
                  to="/fees"
                  className="p-4 bg-white hover:bg-sky-50/50 rounded-2xl border border-slate-200/80 flex items-center justify-between group transition-smooth"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-smooth">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800">Fee Payment Gateway</h4>
                      <p className="text-xs text-slate-500">Pay tuition, exam, hall dues</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-smooth" />
                </Link>
              </>
            )}

            {(user?.role === "faculty" || user?.role === "admin") && (
              <>
                <Link
                  to="/attendance/mark"
                  className="p-4 bg-white hover:bg-sky-50/50 rounded-2xl border border-slate-200/80 flex items-center justify-between group transition-smooth"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center group-hover:bg-sky-600 group-hover:text-white transition-smooth">
                      <CalendarCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800">Bulk Attendance Entry</h4>
                      <p className="text-xs text-slate-500">Mark class rosters at once</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 transition-smooth" />
                </Link>

                <Link
                  to="/marks/entry"
                  className="p-4 bg-white hover:bg-sky-50/50 rounded-2xl border border-slate-200/80 flex items-center justify-between group transition-smooth"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-smooth">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800">Evaluation & Grades</h4>
                      <p className="text-xs text-slate-500">Enter CT, quiz, exam marks</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition-smooth" />
                </Link>
              </>
            )}

            <Link
              to="/faculty"
              className="p-4 bg-white hover:bg-sky-50/50 rounded-2xl border border-slate-200/80 flex items-center justify-between group transition-smooth"
            >
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-slate-700 group-hover:text-white transition-smooth">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-800">Faculty Directory</h4>
                  <p className="text-xs text-slate-500">Search teachers, offices, contact info</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-smooth" />
            </Link>
          </div>
        </div>

        {/* Notices Board */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
              <Bell className="w-5 h-5 text-sky-600" />
              <span>Campus Notices & Circulars</span>
            </h2>
            <Link
              to="/notices"
              className="text-xs font-semibold text-sky-600 hover:text-sky-700 inline-flex items-center"
            >
              View all <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <div className="space-y-3">
            {notices.length === 0 ? (
              <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-slate-500">
                No active announcements published.
              </div>
            ) : (
              notices.map((notice) => (
                <div
                  key={notice._id}
                  className="p-5 bg-white rounded-2xl border border-slate-200/80 hover:border-sky-300 shadow-xs hover:shadow-sm transition-smooth"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                        {formatDate(notice.createdAt)} • Posted by {notice.postedBy?.name || "Administration"}
                      </span>
                      <h3 className="text-base font-semibold text-slate-800">{notice.title}</h3>
                      <p className="text-sm text-slate-600 mt-1 line-clamp-2">{notice.body}</p>
                    </div>

                    {notice.attachmentUrl && (
                      <span className="shrink-0 px-2.5 py-1 bg-sky-50 text-sky-700 text-xs font-medium rounded-lg border border-sky-100">
                        Attachment
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default Dashboard;
