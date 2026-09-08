const fs = require('fs');
let code = fs.readFileSync('v:/Project/OneHUB/OneHUB/frontend/src/components/layout/Sidebar.jsx', 'utf8');

const facultyBlock = `      case "faculty":
        return [
          { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
          { label: "Academic Calendar", path: "/calendar", icon: CalendarDays },
          { label: "Weekly Routine", path: "/routine", icon: CalendarClock },
          { label: "Course Catalog", path: "/courses", icon: BookOpen },
          ...(user?.isAdviser || user?.role === 'admin' ? [{ label: "Pending Registrations", path: "/registration", icon: CheckSquare }] : []),
          { label: "Mark Attendance", path: "/attendance/mark", icon: CalendarCheck },
          { label: "Enter Marks & Grades", path: "/marks/entry", icon: Award },
          { label: "Manage Clearances", path: "/admin/clearance", icon: ShieldCheck },
          { label: "Notice Board", path: "/notices", icon: Bell },
          { label: "Faculty Directory", path: "/faculty", icon: Users },
          { label: "My Profile", path: "/profile", icon: User },
        ];`;

const adminBlock = `      case "admin":
        return [
          { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
          { label: "Manage Routine", path: "/manage-routine", icon: CalendarClock },
          { label: "Course Management", path: "/courses", icon: BookOpen },
          { label: "Course Assignments", path: "/course-assignments", icon: Layers },
          { label: "Registration Approvals", path: "/registration", icon: CheckSquare },
          { label: "Hall Applications", path: "/hall/review", icon: Building },
          { label: "Mark Entry", path: "/marks/entry", icon: Award },
          { label: "Fee Management", path: "/fees", icon: CreditCard },
          { label: "Manage Clearances", path: "/admin/clearance", icon: ShieldCheck },
          { label: "Notice Board", path: "/notices", icon: Bell },
          { label: "Faculty Management", path: "/faculty", icon: Users },
          { label: "My Profile", path: "/profile", icon: User },
        ];`;

const hallAdminBlock = `      case "hall_admin":
        return [
          { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
          { label: "Hall Applications", path: "/hall/review", icon: Building },
          { label: "Manage Clearances", path: "/admin/clearance", icon: ShieldCheck },
          { label: "Notice Board", path: "/notices", icon: Bell },
          { label: "Faculty Directory", path: "/faculty", icon: Users },
          { label: "My Profile", path: "/profile", icon: User },
        ];`;

code = code.replace(/case "faculty":[\s\S]*?\];/, facultyBlock);
code = code.replace(/case "admin":[\s\S]*?\];/, adminBlock);
code = code.replace(/case "hall_admin":[\s\S]*?\];/, hallAdminBlock);

fs.writeFileSync('v:/Project/OneHUB/OneHUB/frontend/src/components/layout/Sidebar.jsx', code);
console.log("Patched Sidebar.jsx");
