/**
 * File: AppRoutes.jsx
 * Description: React component rendering the AppRoutes UI interface.
 * 
 * This file is part of the RUET OneHub Project.
 */

import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/common/ProtectedRoute";
import DashboardLayout from "../components/layout/DashboardLayout";
import { Loader2 } from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

// Auth Pages
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

// Feature Pages
import Dashboard from "../pages/dashboard/Dashboard";
import CourseList from "../pages/courses/CourseList";
import CourseDetails from "../pages/courses/CourseDetails";
import CourseAssignmentList from "../pages/courseAssignment/CourseAssignmentList";
import Routine from "../pages/routine/Routine";
import ManageRoutine from "../pages/admin/ManageRoutine";
import ManageCalendar from "../pages/admin/ManageCalendar";
import UserManagement from "../pages/admin/UserManagement";
import RegistrationForm from "../pages/registration/RegistrationForm";
import FeeList from "../pages/fees/FeeList";
import FeePayment from "../pages/fees/FeePayment";
import MarksList from "../pages/marks/MarksList";
import MarksEntry from "../pages/marks/MarksEntry";
import CGPAAnalytics from "../pages/marks/CGPAAnalytics";
import AttendanceList from "../pages/attendance/AttendanceList";
import MarkAttendance from "../pages/attendance/MarkAttendance";
import NoticeList from "../pages/notices/NoticeList";
import HallApplicationForm from "../pages/hallApplication/HallApplicationForm";
import { HallManagementDashboard } from "../pages/hall/HallManagementDashboard";
import HallApplicationStatus from "../pages/hallApplication/HallApplicationStatus";
import FacultyDirectory from "../pages/faculty/FacultyDirectory";
import Profile from "../pages/profile/Profile";
import { MedicalCenter } from "../pages/medical/MedicalCenter";
import { DiningDashboard } from "../pages/dining/DiningDashboard";
import { ClearanceStatus } from "../pages/clearance/ClearanceStatus";
import { ClearanceAdmin } from "../pages/clearance/ClearanceAdmin";
import AcademicCalendar from "../pages/calendar/AcademicCalendar";
import Maintenance from "../pages/auth/Maintenance";

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
  }, [user]);

  
  const FeatureGuard = ({ featureKey, title, children }) => {
    if (user?.role === 'admin') return children;
    if (features[featureKey] === false) {
      return (
        
          <Maintenance embedded={true} title={`${title} is Unavailable`} message={`The ${title} module is currently turned off by the administration for maintenance or updates. Please check back later.`} />
        
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
        
          <Maintenance />
        
      );
    }
  }

  return (
    
      <Routes>
        {/* Public Auth Routes */}
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected App Routes wrapped in DashboardLayout */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout key={user?._id || "guest"} features={features} setFeatures={setFeatures} />
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
        <Route path="/hall" element={<FeatureGuard featureKey="hall" title="Hall Management"><ProtectedRoute allowedRoles={["student"]}><HallManagementDashboard /></ProtectedRoute></FeatureGuard>} />
        <Route path="/hall/apply" element={<FeatureGuard featureKey="hall" title="Hall Application"><HallApplicationForm /></FeatureGuard>} />
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

        {/* AI Features */}
        <Route path="/ai/study" element={<StudyBuddy />} />


        {/* Medical & Clearance */}
        <Route path="/dining" element={<FeatureGuard featureKey="dining" title="Dining Tokens"><ProtectedRoute allowedRoles={["student"]}><DiningDashboard /></ProtectedRoute></FeatureGuard>} />
        <Route path="/medical" element={<FeatureGuard featureKey="medical" title="Medical Center"><MedicalCenter /></FeatureGuard>} />
        <Route path="/clearance" element={<FeatureGuard featureKey="clearance" title="Clearance Status"><ClearanceStatus /></FeatureGuard>} />
        <Route path="/admin/clearance" element={<FeatureGuard featureKey="clearance" title="Manage Clearances"><ProtectedRoute allowedRoles={["admin", "faculty", "hall_admin"]}><ClearanceAdmin /></ProtectedRoute></FeatureGuard>} />
        
        {/* Calendar */}
        <Route path="/calendar" element={<FeatureGuard featureKey="calendar" title="Academic Calendar"><AcademicCalendar /></FeatureGuard>} />
        <Route path="/manage-users" element={<ProtectedRoute allowedRoles={["admin"]}><UserManagement /></ProtectedRoute>} />
        <Route path="/manage-calendar" element={<ProtectedRoute allowedRoles={["admin"]}><ManageCalendar /></ProtectedRoute>} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    
  );
}

export default AppRoutes;
