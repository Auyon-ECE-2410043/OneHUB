import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/common/ProtectedRoute";
import DashboardLayout from "../components/layout/DashboardLayout";
import { Loader2 } from "lucide-react";

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

// Loading Fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
  </div>
);

export function AppRoutes() {
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
