<div align="center">
  <img src="https://img.icons8.com/color/96/000000/university.png" alt="Logo" width="80" height="80">
  <h1 align="center">RUET OneHUB</h1>
  <p align="center">
    <strong>Central Academic Automation System for Rajshahi University of Engineering & Technology</strong>
    <br />
    <br />
    <a href="#-key-features">Key Features</a>
    ·
    <a href="#-project-architecture">Architecture</a>
    ·
    <a href="#-major-code-components">Code Navigation</a>
    ·
    <a href="#-getting-started">Getting Started</a>
  </p>
</div>

---

## 📖 Overview

**RUET OneHUB** is a comprehensive, full-stack central academic automation portal designed to unify the university experience for students, faculty, and administration. It eliminates fragmented systems by bringing course registration, fee payments, residential hall management, medical services, and real-time campus updates into a single, intuitive platform.

Built with a modern web architecture and a companion mobile app, OneHUB ensures seamless communication and administrative efficiency across the entire campus.

## ✨ Key Features

### 🎓 For Students
- **Smart Dashboard:** Personalized overview of course credits, pending registrations, and unpaid dues.
- **Academic Ecosystem:** View [weekly routines](./frontend/src/pages/routine/Routine.jsx), browse the course catalog, and submit semester registrations.
- **Clearance & Hall Portal:** Apply for residential seats and track [graduation clearance statuses](./frontend/src/pages/clearance/ClearanceStatus.jsx).
- **Medical Center:** Book doctor appointments and access the [emergency blood donor database](./frontend/src/pages/medical/MedicalCenter.jsx).

### 👨‍🏫 For Faculty & Admin
- **Module Access Control:** Admins can dynamically toggle system modules (e.g., turning off Registration after the deadline).
- **Bulk Operations:** Faculty can [enter marks/grades](./frontend/src/pages/marks/MarksEntry.jsx) and mark bulk attendance.
- **Approval Workflows:** Admins can seamlessly approve [hall applications](./frontend/src/pages/hallApplication/HallApplicationStatus.jsx) and student clearances.
- **Live Campus Feed:** Broadcast urgent notices, blood emergencies, and achievements directly to all users via a sleek [Live Post Modal](./frontend/src/components/dashboard/LiveFeedPostModal.jsx).

## 🏗️ Project Architecture

OneHUB is a monorepo consisting of three main components:

1. **[Frontend (React + Vite)](./frontend)**: A blazing-fast SPA built with React, styled with Tailwind CSS, and animated using Framer Motion for a "dynamic, glassmorphic vibe."
2. **[Backend (Node.js + Express)](./server.js)**: A robust REST API backed by MongoDB, featuring secure JWT authentication and role-based access control (RBAC).
3. **[Mobile App (Flutter)](./mobile)**: A cross-platform mobile application bringing OneHUB to Android and iOS.

## 🧭 Major Code Components (For Evaluation)

Teachers and evaluators can use the links below to quickly navigate to the core implementation files of major features:

### 🖥️ Frontend (React)
- **Dashboard & Layout**: [`Dashboard.jsx`](./frontend/src/pages/dashboard/Dashboard.jsx) | [`LiveSidebar.jsx`](./frontend/src/components/dashboard/LiveSidebar.jsx)
- **Role-based Routing**: [`AppRoutes.jsx`](./frontend/src/routes/AppRoutes.jsx) | [`Sidebar.jsx`](./frontend/src/components/layout/Sidebar.jsx)
- **Clearance Management (Admin)**: [`ClearanceAdmin.jsx`](./frontend/src/pages/clearance/ClearanceAdmin.jsx)
- **Live Feed Posting**: [`LiveFeedPostModal.jsx`](./frontend/src/components/dashboard/LiveFeedPostModal.jsx)
- **Medical Center**: [`MedicalCenter.jsx`](./frontend/src/pages/medical/MedicalCenter.jsx)
- **API Services Integration**: [`livefeedService.js`](./frontend/src/services/livefeedService.js)

### ⚙️ Backend (Node.js)
- **Express App Entry**: [`server.js`](./server.js)
- **Authentication Middleware**: [`auth.js`](./middleware/auth.js)
- **Database Models**: [`User.js`](./models/User.js) | [`Clearance.js`](./models/Clearance.js) | [`LiveFeed.js`](./models/LiveFeed.js)
- **API Routes**: [`clearance.js`](./routes/clearance.js) | [`livefeed.js`](./routes/livefeed.js)

### 📱 Mobile (Flutter)
- **Mobile Entry Point**: [`main.dart`](./mobile/lib/main.dart)
- **Mobile Screens**: [`home_screen.dart`](./mobile/lib/screens/home_screen.dart) | [`weekly_routine_screen.dart`](./mobile/lib/screens/weekly_routine_screen.dart)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB instance (local or Atlas)
- Flutter SDK (for mobile app)

### Backend Setup
\`\`\`bash
# Install dependencies
npm install

# Create a .env file with your MongoDB URI and JWT Secret
echo "MONGO_URI=your_mongodb_string\nJWT_SECRET=your_secret" > .env

# Start the server
npm run dev
\`\`\`

### Frontend Setup
\`\`\`bash
cd frontend

# Install dependencies
npm install

# Start the Vite development server
npm run dev
\`\`\`

## 🛠️ Tech Stack
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![Flutter](https://img.shields.io/badge/Flutter-%2302569B.svg?style=for-the-badge&logo=Flutter&logoColor=white)

---
*Designed and built for RUET.*
