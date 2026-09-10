/**
 * File: AppRoutes.jsx
 * Description: React component rendering the AppRoutes UI interface.
 * 
 * This file is part of the RUET OneHub Project.
 */

import { lazy, Suspense, useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/common/ProtectedRoute";
import DashboardLayout from "../components/layout/DashboardLayout";
import { Loader2 } from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

// Auth Pages
const Login = lazy(() => import("../pages/auth/Login"));
const Register = lazy(() => import("../pages/auth/Register"));

// Feature Pages
const Dashboard = lazy(() => import("../pages/dashboard/Dashboard"));
const CourseList = lazy(() => import("../pages/courses/CourseList"));
const CourseDetails = lazy(() => import("../pages/courses/CourseDetails"));
const CourseAssignmentList = lazy(() => import("../pages/courseAssignment/CourseAssignmentList"));
const Routine = lazy(() => import("../pages/routine/Routine"));
const ManageRoutine = lazy(() => import("../pages/admin/ManageRoutine"));
const RegistrationForm = lazy(() => import("../pages/registration/RegistrationForm"));
const FeeList = lazy(() => import("../pages/fees/FeeList"));
const FeePayment = lazy(() => import("../pages/fees/FeePayment"));
const MarksList = lazy(() => import("../pages/marks/MarksList"));
const MarksEntry = lazy(() => import("../pages/marks/MarksEntry"));
const CGPAAnalytics = lazy(() => import("../pages/marks/CGPAAnalytics"));
const AttendanceList = lazy(() => import("../pages/attendance/AttendanceList"));
const MarkAttendance = lazy(() => import("../pages/attendance/MarkAttendance"));
const NoticeList = lazy(() => import("../pages/notices/NoticeList"));
const HallApplicationForm = lazy(() => import("../pages/hallApplication/HallApplicationForm"));
const HallApplicationStatus = lazy(() => import("../pages/hallApplication/HallApplicationStatus"));
const FacultyDirectory = lazy(() => import("../pages/faculty/FacultyDirectory"));
const Profile = lazy(() => import("../pages/profile/Profile"));
const MedicalCenter = lazy(() => import("../pages/medical/MedicalCenter").then(module => ({ default: module.MedicalCenter })));
const ClearanceStatus = lazy(() => import("../pages/clearance/ClearanceStatus").then(module => ({ default: module.ClearanceStatus })));
const ClearanceAdmin = lazy(() => import("../pages/clearance/ClearanceAdmin").then(module => ({ default: module.ClearanceAdmin })));
const AcademicCalendar = lazy(() => import("../pages/calendar/AcademicCalendar"));
const Maintenance = lazy(() => import("../pages/auth/Maintenance"));

// Loading Fallback
const PageLoader = () => (
  <div className="flex justify-center items-center h-screen bg-slate-50">
    <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
  </div>
);

export function AppRoutes() {
  const { user } = useAuth();
  const [maintenance, setMaintenance] = useState(false);
  const [features, setFeatures] = useState({});
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        const res = await api.get("/settings");
        setMaintenance(res.data.maintenanceMode);
        setFeatures(res.data.features || {});
      } catch (err) {
        console.error("Failed to check maintenance status");
      } finally {
        setChecking(false);
      }
    };
    checkMaintenance();
  }, []);

  
  const FeatureGuard = ({ featureKey, title, children }) => {
    if (user?.role === 'admin') return children;
    if (features[featureKey] === false) {
      return (
        <Suspense fallback={<PageLoader />}>
          <Maintenance embedded={true} title={`${title} is Unavailable`} message={`The ${title} module is currently turned off by the administration for maintenance or updates. Please check back later.`} />
        </Suspense>
      );
    }
    return children;
  };

  if (checking) return <PageLoader />;

  // If maintenance is on AND user is not admin (or user is not logged in), show maintenance screen
  if (maintenance && user?.role !== "admin") {
    // We allow them to go to /login if they want, but usually we just block everything.
    // To allow admin to login during maintenance, if path is /login, we can let it render.
    if (window.location.pathname !== "/") {
      return (
        <Suspense fallback={<PageLoader />}>
          <Maintenance />
        </Suspense>
      );
    }
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Auth Routes */}
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected App Routes wrapped in DashboardLayout */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout key={user?._id || "guest"} />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Courses & Assignments */}
        <Route path="/courses" element={<FeatureGuard featureKey="courses" title="My Courses"><CourseList /></FeatureGuard>} />
        <Route path="/courses/:id" element={<FeatureGuard featureKey="courses" title="Course Details"><CourseDetails /></FeatureGuard>} />
        <Route
          path="/course-assignments"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <CourseAssignmentList />
            </ProtectedRoute>
          }
        />

        <Route path="/routine" element={<FeatureGuard featureKey="routine" title="Weekly Routine"><Routine /></FeatureGuard>} />
        <Route
          path="/manage-routine"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ManageRoutine />
            </ProtectedRoute>
          }
        />
        
        {/* Course Registration */}
        <Route path="/registration" element={<FeatureGuard featureKey="registration" title="Course Registration"><RegistrationForm /></FeatureGuard>} />

        {/* Fees & Payment */}
        <Route path="/fees" element={<FeatureGuard featureKey="fees" title="Fees & Payment"><FeeList /></FeatureGuard>} />
        <Route path="/fees/payment" element={<FeatureGuard featureKey="fees" title="Fees & Payment"><FeePayment /></FeatureGuard>} />

        {/* Marks & Grading */}
        <Route path="/marks" element={<FeatureGuard featureKey="marks" title="Marks & Grades"><MarksList /></FeatureGuard>} />
        <Route path="/cgpa" element={<FeatureGuard featureKey="cgpa" title="CGPA Analytics"><CGPAAnalytics /></FeatureGuard>} />
        <Route
          path="/marks/entry"
          element={
            <ProtectedRoute allowedRoles={["faculty", "admin"]}>
              <MarksEntry />
            </ProtectedRoute>
          }
        />

        {/* Attendance */}
        <Route path="/attendance" element={<FeatureGuard featureKey="attendance" title="Attendance"><AttendanceList /></FeatureGuard>} />
        <Route
          path="/attendance/mark"
          element={
            <ProtectedRoute allowedRoles={["faculty", "admin"]}>
              <MarkAttendance />
            </ProtectedRoute>
          }
        />

        {/* Notice Board */}
        <Route path="/notices" element={<FeatureGuard featureKey="notices" title="Notice Board"><NoticeList /></FeatureGuard>} />

        {/* Hall Accommodation */}
        <Route path="/hall" element={<FeatureGuard featureKey="hall" title="Hall Application"><HallApplicationForm /></FeatureGuard>} />
        <Route
          path="/hall/review"
          element={
            <ProtectedRoute allowedRoles={["admin", "hall_admin"]}>
              <HallApplicationStatus />
            </ProtectedRoute>
          }
        />

        {/* Faculty Directory */}
        <Route path="/faculty" element={<FeatureGuard featureKey="faculty" title="Faculty Directory"><FacultyDirectory /></FeatureGuard>} />

        {/* Profile & Account Security */}
        <Route path="/profile" element={<Profile />} />

        {/* Medical & Clearance */}
        <Route path="/medical" element={<FeatureGuard featureKey="medical" title="Medical Center"><MedicalCenter /></FeatureGuard>} />
        <Route path="/clearance" element={<FeatureGuard featureKey="clearance" title="Clearance Status"><ClearanceStatus /></FeatureGuard>} />
        <Route path="/admin/clearance" element={<FeatureGuard featureKey="clearance" title="Manage Clearances"><ProtectedRoute allowedRoles={["admin", "faculty", "hall_admin"]}><ClearanceAdmin /></ProtectedRoute></FeatureGuard>} />
        
        {/* Calendar */}
        <Route path="/calendar" element={<FeatureGuard featureKey="calendar" title="Academic Calendar"><AcademicCalendar /></FeatureGuard>} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
