import { Routes, Route } from "react-router-dom";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Dashboard from "../pages/dashboard/Dashboard";
import Attendance from "../pages/attendance/Attendance";
import Courses from "../pages/courses/Courses";
import CourseDetails from "../pages/courses/CourseDetails";
import Assignments from "../pages/assignments/Assignments";
import Fees from "../pages/fees/Fees";
import HallApplication from "../pages/hall/HallApplication";
import Marks from "../pages/marks/Marks";
import Notices from "../pages/notices/Notices";
import Registration from "../pages/registration/Registration";

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:id" element={<CourseDetails />} />
            <Route path="/assignments" element={<Assignments />} />
            <Route path="/fees" element={<Fees />} />
            <Route path="/hall" element={<HallApplication />} />
            <Route path="/marks" element={<Marks />} />
            <Route path="/notices" element={<Notices />} />
            <Route path="/registration" element={<Registration />} />
        </Routes>
    );
}

export default AppRoutes;
