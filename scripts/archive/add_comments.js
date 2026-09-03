
const fs = require("fs");
const path = require("path");

const descriptions = {
  // Backend Routes
  "auth.js": "Handles user authentication, login, registration, and profile updates.",
  "hall.js": "Provides API endpoints for students to apply for residential halls and admins to manage them.",
  "courses.js": "Manages course creation, fetching course details, and syllabus information.",
  "registrations.js": "Handles student course registrations for each semester.",
  "fees.js": "Processes student fee payments and tracks due balances.",
  "marks.js": "Manages student marks, grading, and CGPA calculation.",
  "attendance.js": "Allows faculty to take attendance and students to view their attendance records.",
  "notices.js": "Manages the notice board, allowing admins to post announcements.",
  "faculty.js": "Handles faculty directory and fetching professor profiles.",
  "routine.js": "Manages the weekly class routine and schedules for students and faculty.",
  "students.js": "Admin endpoints to manage student records and import student data.",
  "notifications.js": "Handles pushing and fetching in-app notifications and reminders.",
  "medical.js": "Manages medical center appointments and health records.",
  "calendar.js": "Provides the academic calendar and holiday schedule.",
  "clearance.js": "Handles graduation clearance workflows for students.",
  "settings.js": "Manages global system settings like maintenance mode.",
  
  // Backend Models
  "User.js": "Mongoose schema for system users (Students, Faculty, Admins).",
  "HallApplication.js": "Mongoose schema representing a student's application to a residential hall.",
  "Course.js": "Mongoose schema for academic courses and syllabus.",
  "ClassSchedule.js": "Mongoose schema for weekly routine and class timings.",
  
  // Frontend Pages
  "Dashboard.jsx": "The main dashboard overview after a user logs in.",
  "Routine.jsx": "Displays the weekly class routine in a graphical calendar grid.",
  "HallApplicationForm.jsx": "React component for students to fill out and submit their hall application.",
  "HallApplicationStatus.jsx": "React component displaying the current status of a submitted hall application.",
  "Profile.jsx": "Allows users to view and update their personal details and password.",
  "Login.jsx": "React component handling user login.",
  
  // Mobile Screens
  "home_screen.dart": "The main landing screen of the mobile app showing dashboard metrics.",
  "weekly_routine_screen.dart": "Renders the weekly class routine in a native Flutter calendar view.",
  "hall_application_screen.dart": "Allows students to apply for a hall directly from the mobile app.",
  "my_profile_screen.dart": "Mobile screen for viewing user profile and details."
};

const getGenericDescription = (filename, dir) => {
  if (dir.includes("frontend") || dir.includes("client")) {
    if (filename.includes("Service")) return `Service layer for making API calls related to ${filename.replace("Service.js", "")}.`;
    if (filename.includes("Context")) return `React Context provider for managing global ${filename.replace("Context.jsx", "")} state.`;
    return `React component rendering the ${filename.replace(".jsx", "")} UI interface.`;
  }
  if (dir.includes("mobile")) {
    if (filename.includes("_screen")) return `Flutter screen widget for the ${filename.replace("_screen.dart", "")} view.`;
    if (filename.includes("_service")) return `Flutter service class handling API requests for ${filename.replace("_service.dart", "")}.`;
    return `Flutter utility or widget class for ${filename}.`;
  }
  if (dir.includes("routes")) return `Express router defining API endpoints for ${filename.replace(".js", "")}.`;
  if (dir.includes("models")) return `Mongoose database schema definition for ${filename.replace(".js", "")}.`;
  
  return `Handles logic and execution for ${filename}.`;
};

const processFile = (filePath) => {
  try {
    const ext = path.extname(filePath);
    if (![".js", ".jsx", ".dart"].includes(ext)) return;
    
    let content = fs.readFileSync(filePath, "utf8");
    
    // Check if it already has a header comment
    if (content.startsWith("/**\n *") || content.startsWith("// File:") || content.startsWith("/*\n *")) return;
    
    const filename = path.basename(filePath);
    const description = descriptions[filename] || getGenericDescription(filename, filePath);
    
    const commentStyle = ext === ".dart" ? "//" : "*";
    
    let header = "";
    if (ext === ".dart") {
      header = `// ==========================================\n// File: ${filename}\n// Description: ${description}\n// ==========================================\n\n`;
    } else {
      header = `/**\n * File: ${filename}\n * Description: ${description}\n * \n * This file is part of the RUET OneHub Project.\n */\n\n`;
    }
    
    fs.writeFileSync(filePath, header + content);
    console.log(`Added comment to ${filename}`);
  } catch (err) {
    console.error(`Error processing ${filePath}:`, err.message);
  }
};

const walkSync = (dir, filelist = []) => {
  if (!fs.existsSync(dir)) return filelist;
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (!["node_modules", "dist", "build", ".git", ".dart_tool", "windows", "linux", "macos", "web", "ios"].includes(file)) {
        filelist = walkSync(filePath, filelist);
      }
    } else {
      filelist.push(filePath);
    }
  });
  return filelist;
};

// Target directories
const dirs = [
  path.join(__dirname, "routes"),
  path.join(__dirname, "models"),
  path.join(__dirname, "services"),
  path.join(__dirname, "middleware"),
  path.join(__dirname, "frontend", "src"),
  path.join(__dirname, "mobile", "lib")
];

let totalFiles = [];
dirs.forEach(d => {
  totalFiles = totalFiles.concat(walkSync(d));
});

totalFiles.forEach(file => processFile(file));
console.log("Done commenting files!");

