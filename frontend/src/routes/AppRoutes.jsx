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
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        const res = await api.get("/settings");
        setMaintenance(res.data.maintenanceMode);
      } catch (err) {
        console.error("Failed to check maintenance status");
      } finally {
        setChecking(false);
      }
    };
    checkMaintenance();
  }, []);

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
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Courses & Assignments */}
        <Route path="/courses" element={<CourseList />} />
        <Route path="/courses/:id" element={<CourseDetails />} />
        <Route
          path="/course-assignments"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <CourseAssignmentList />
            </ProtectedRoute>
          }
        />

        <Route path="/routine" element={<Routine />} />
        <Route
          path="/manage-routine"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ManageRoutine />
            </ProtectedRoute>
          }
        />
        
        {/* Course Registration */}
        <Route path="/registration" element={<RegistrationForm />} />

        {/* Fees & Payment */}
        <Route path="/fees" element={<FeeList />} />
        <Route path="/fees/payment" element={<FeePayment />} />

        {/* Marks & Grading */}
        <Route path="/marks" element={<MarksList />} />
        <Route path="/cgpa" element={<CGPAAnalytics />} />
        <Route
          path="/marks/entry"
          element={
            <ProtectedRoute allowedRoles={["faculty", "admin"]}>
              <MarksEntry />
            </ProtectedRoute>
          }
        />

        {/* Attendance */}
        <Route path="/attendance" element={<AttendanceList />} />
        <Route
          path="/attendance/mark"
          element={
            <ProtectedRoute allowedRoles={["faculty", "admin"]}>
              <MarkAttendance />
            </ProtectedRoute>
          }
        />

        {/* Notice Board */}
        <Route path="/notices" element={<NoticeList />} />

        {/* Hall Accommodation */}
        <Route path="/hall" element={<HallApplicationForm />} />
        <Route
          path="/hall/review"
          element={
            <ProtectedRoute allowedRoles={["admin", "hall_admin"]}>
              <HallApplicationStatus />
            </ProtectedRoute>
          }
        />

        {/* Faculty Directory */}
        <Route path="/faculty" element={<FacultyDirectory />} />

        {/* Profile & Account Security */}
        <Route path="/profile" element={<Profile />} />

        {/* Medical & Clearance */}
        <Route path="/medical" element={<MedicalCenter />} />
        <Route path="/clearance" element={<ClearanceStatus />} />
        
        {/* Calendar */}
        <Route path="/calendar" element={<AcademicCalendar />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
