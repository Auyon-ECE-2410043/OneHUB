# ==========================================
# ONEHUB Project Structure Generator
# React + Vite + Tailwind + Node/Express
# ==========================================

$root = "ONEHUB"
$project = "$root\OneHUB"

Write-Host "Creating ONEHUB project structure..." -ForegroundColor Cyan

# ------------------------------------------
# Create directories
# ------------------------------------------

$directories = @(
    "$project\client\public",

    "$project\client\src\assets",

    "$project\client\src\components\common",
    "$project\client\src\components\layout",
    "$project\client\src\components\dashboard",

    "$project\client\src\pages\auth",
    "$project\client\src\pages\dashboard",
    "$project\client\src\pages\attendance",
    "$project\client\src\pages\courses",
    "$project\client\src\pages\assignments",
    "$project\client\src\pages\fees",
    "$project\client\src\pages\hall",
    "$project\client\src\pages\marks",
    "$project\client\src\pages\notices",
    "$project\client\src\pages\registration",

    "$project\client\src\services",
    "$project\client\src\context",
    "$project\client\src\hooks",
    "$project\client\src\routes",

    "$project\config",
    "$project\middleware",
    "$project\models",
    "$project\routes",
    "$project\temp"
)

foreach ($dir in $directories) {
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
}

# ------------------------------------------
# Frontend component files
# ------------------------------------------

$files = @(
    # Common components
    "$project\client\src\components\common\Button.jsx",
    "$project\client\src\components\common\Modal.jsx",
    "$project\client\src\components\common\Loader.jsx",
    "$project\client\src\components\common\ProtectedRoute.jsx",

    # Layout
    "$project\client\src\components\layout\Navbar.jsx",
    "$project\client\src\components\layout\Sidebar.jsx",
    "$project\client\src\components\layout\Footer.jsx",

    # Dashboard components
    "$project\client\src\components\dashboard\StatCard.jsx",
    "$project\client\src\components\dashboard\RecentNotice.jsx",
    "$project\client\src\components\dashboard\QuickActions.jsx",

    # Auth pages
    "$project\client\src\pages\auth\Login.jsx",
    "$project\client\src\pages\auth\Register.jsx",

    # Pages
    "$project\client\src\pages\dashboard\Dashboard.jsx",
    "$project\client\src\pages\attendance\Attendance.jsx",

    "$project\client\src\pages\courses\Courses.jsx",
    "$project\client\src\pages\courses\CourseDetails.jsx",

    "$project\client\src\pages\assignments\Assignments.jsx",
    "$project\client\src\pages\fees\Fees.jsx",
    "$project\client\src\pages\hall\HallApplication.jsx",
    "$project\client\src\pages\marks\Marks.jsx",
    "$project\client\src\pages\notices\Notices.jsx",
    "$project\client\src\pages\registration\Registration.jsx",

    # Services
    "$project\client\src\services\api.js",
    "$project\client\src\services\authService.js",
    "$project\client\src\services\courseService.js",
    "$project\client\src\services\noticeService.js",

    # Context
    "$project\client\src\context\AuthContext.jsx",

    # Hooks
    "$project\client\src\hooks\useAuth.js",

    # Routes
    "$project\client\src\routes\AppRoutes.jsx",

    # Main frontend files
    "$project\client\src\App.jsx",
    "$project\client\src\main.jsx",
    "$project\client\src\index.css",

    # Frontend config
    "$project\client\.env",
    "$project\client\index.html",
    "$project\client\package.json",
    "$project\client\vite.config.js",

    # Backend config
    "$project\config\cloudinary.js",
    "$project\middleware\auth.js",

    # Models
    "$project\models\Attendance.js",
    "$project\models\Course.js",
    "$project\models\CourseAssignment.js",
    "$project\models\Fee.js",
    "$project\models\HallApplication.js",
    "$project\models\Mark.js",
    "$project\models\Notice.js",
    "$project\models\Registration.js",
    "$project\models\User.js",

    # Routes
    "$project\routes\auth.js",
    "$project\routes\attendance.js",
    "$project\routes\courses.js",
    "$project\routes\assignments.js",
    "$project\routes\fees.js",
    "$project\routes\hall.js",
    "$project\routes\marks.js",
    "$project\routes\notices.js",
    "$project\routes\registration.js",

    # Backend files
    "$project\.env",
    "$project\package.json",
    "$project\package-lock.json",
    "$project\server.js",

    # Root README
    "$root\README.md"
)

foreach ($file in $files) {
    if (!(Test-Path $file)) {
        New-Item -ItemType File -Path $file -Force | Out-Null
    }
}

# ------------------------------------------
# Add basic frontend files
# ------------------------------------------

@'
import AppRoutes from "./routes/AppRoutes";

function App() {
    return <AppRoutes />;
}

export default App;
'@ | Set-Content "$project\client\src\App.jsx"


@'
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </StrictMode>
);
'@ | Set-Content "$project\client\src\main.jsx"


@'
@import "tailwindcss";

* {
    box-sizing: border-box;
}

body {
    margin: 0;
    font-family: Inter, system-ui, sans-serif;
    background: #f8fafc;
}
'@ | Set-Content "$project\client\src\index.css"


@'
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
'@ | Set-Content "$project\client\src\routes\AppRoutes.jsx"


@'
import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
    headers: {
        "Content-Type": "application/json",
    },
});

export default api;
'@ | Set-Content "$project\client\src\services\api.js"


@'
VITE_API_URL=http://localhost:5000/api
'@ | Set-Content "$project\client\.env"


@'
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
    ],
});
'@ | Set-Content "$project\client\vite.config.js"


# ------------------------------------------
# Install frontend
# ------------------------------------------

Write-Host ""
Write-Host "Installing React frontend dependencies..." -ForegroundColor Yellow

Set-Location "$project\client"

npm install
npm install react-router-dom axios lucide-react
npm install tailwindcss @tailwindcss/vite

# ------------------------------------------
# Return to project
# ------------------------------------------

Set-Location "..\.."

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host " ONEHUB structure created successfully!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green

Write-Host ""
Write-Host "Frontend:" -ForegroundColor Cyan
Write-Host "  $project\client"

Write-Host ""
Write-Host "Backend:" -ForegroundColor Cyan
Write-Host "  $project"

Write-Host ""
Write-Host "To start the React frontend:" -ForegroundColor Yellow
Write-Host "  cd $project\client"
Write-Host "  npm run dev"

Write-Host ""
Write-Host "Done!" -ForegroundColor Green