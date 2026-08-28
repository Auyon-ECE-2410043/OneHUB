/**
 * File: Sidebar.jsx
 * Description: React component rendering the Sidebar UI interface.
 * 
 * This file is part of the RUET OneHub Project.
 */

import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  CalendarCheck,
  Award,
  CreditCard,
  Building,
  Bell,
  Users,
  User,
  Layers,
  CheckSquare,
  HeartPulse,
  ShieldCheck,
  CalendarClock,
  CalendarDays,
} from "lucide-react";

export function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  const role = user?.role;

  // Define navigation items based on user role
  const getNavItems = () => {
    switch (role) {
      case "faculty":
        return [
          { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
          { label: "Academic Calendar", path: "/calendar", icon: CalendarDays },
          { label: "Weekly Routine", path: "/routine", icon: CalendarClock },
          { label: "Course Catalog", path: "/courses", icon: BookOpen },
          ...(user?.isAdviser || user?.role === 'admin' ? [{ label: "Pending Registrations", path: "/registration", icon: CheckSquare }] : []),
          { label: "Mark Attendance", path: "/attendance/mark", icon: CalendarCheck },
          { label: "Enter Marks & Grades", path: "/marks/entry", icon: Award },
          { label: "Notice Board", path: "/notices", icon: Bell },
          { label: "Faculty Directory", path: "/faculty", icon: Users },
          { label: "My Profile", path: "/profile", icon: User },
        ];

      case "admin":
        return [
          { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
          { label: "Manage Routine", path: "/manage-routine", icon: CalendarClock },
          { label: "Course Management", path: "/courses", icon: BookOpen },
          { label: "Course Assignments", path: "/course-assignments", icon: Layers },
          { label: "Registration Approvals", path: "/registration", icon: CheckSquare },
          { label: "Hall Applications", path: "/hall/review", icon: Building },
          { label: "Mark Entry", path: "/marks/entry", icon: Award },
            { label: "Fee Management", path: "/fees", icon: CreditCard },
            { label: "Notice Board", path: "/notices", icon: Bell },
            { label: "Faculty Management", path: "/faculty", icon: Users },
          { label: "My Profile", path: "/profile", icon: User },
        ];

      case "hall_admin":
        return [
          { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
          { label: "Hall Applications", path: "/hall/review", icon: Building },
          { label: "Notice Board", path: "/notices", icon: Bell },
          { label: "Faculty Directory", path: "/faculty", icon: Users },
          { label: "My Profile", path: "/profile", icon: User },
        ];

      case "student":
      default:
        return [
          { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
          { label: "Academic Calendar", path: "/calendar", icon: CalendarDays },
          { label: "Weekly Routine", path: "/routine", icon: CalendarClock },
          { label: "My Courses", path: "/courses", icon: BookOpen },
          { label: "Course Registration", path: "/registration", icon: ClipboardList },
          { label: "Attendance Record", path: "/attendance", icon: CalendarCheck },
          { label: "Marks & Grades", path: "/marks", icon: Award },
          { label: "CGPA Analytics", path: "/cgpa", icon: Award },
          { label: "Fees & Payment", path: "/fees", icon: CreditCard },
          { label: "Hall Application", path: "/hall", icon: Building },
          { label: "Clearance Status", path: "/clearance", icon: ShieldCheck },
          { label: "Medical Center", path: "/medical", icon: HeartPulse },
          { label: "Notice Board", path: "/notices", icon: Bell },
          { label: "Faculty Directory", path: "/faculty", icon: Users },
          { label: "My Profile", path: "/profile", icon: User },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex-1 py-4 px-3 overflow-y-auto space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Navigation Menu
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                end={item.path === "/courses" || item.path === "/attendance" || item.path === "/marks" || item.path === "/registration" || item.path === "/hall"}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-smooth ${
                    isActive
                      ? "bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400 font-semibold shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`w-5 h-5 mr-3 transition-smooth ${
                        isActive ? "text-sky-600 dark:text-sky-400" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                      }`}
                    />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Academic Session Footer inside Sidebar */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Rajshahi University of Engineering & Technology</span>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Central Academic Automation</p>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
