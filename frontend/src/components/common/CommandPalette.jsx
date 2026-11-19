/**
 * File: CommandPalette.jsx
 * Description: Global Command Palette (Ctrl+K / Cmd+K) for instant navigation across all features, courses, and utilities.
 * 
 * Part of the RUET OneHub Project.
 */

import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  LayoutDashboard,
  Calendar,
  Bus,
  BookOpen,
  ClipboardList,
  CalendarCheck,
  Award,
  CreditCard,
  Building,
  HeartPulse,
  Users,
  Bell,
  User,
  ShieldCheck,
  Bot,
  CalendarDays,
  Utensils,
  Droplet,
  Download,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  X,
  Sparkles
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import noticeService from "../../services/noticeService";

export default function CommandPalette({ features = {} }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [notices, setNotices] = useState([]);
  const inputRef = useRef(null);
  const resultsContainerRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Listen for Ctrl+K / Cmd+K and custom event
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    const handleOpenCustom = () => setIsOpen(true);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open-command-palette", handleOpenCustom);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open-command-palette", handleOpenCustom);
    };
  }, []);

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);

      // Fetch latest notices if not already loaded
      noticeService.getNotices()
        .then((data) => setNotices(data?.slice(0, 5) || []))
        .catch(() => {});
    }
  }, [isOpen]);

  // Master Navigation & Command Catalog
  const allCommands = useMemo(() => {
    const items = [
      // Navigation Pages
      {
        id: "nav-dash",
        title: "Dashboard",
        category: "Navigation",
        subtitle: "Overview of courses, next class, and quick services",
        icon: LayoutDashboard,
        path: "/dashboard",
        keywords: ["home", "main", "overview", "stats"],
      },
      {
        id: "nav-routine",
        title: "Weekly Class Routine",
        category: "Navigation",
        subtitle: "View timetable grid and CT/Quiz syllabus",
        icon: Calendar,
        path: "/routine",
        keywords: ["schedule", "classes", "timetable", "periods", "ct syllabus"],
      },
      {
        id: "nav-bus",
        title: "Campus Bus Schedule & Routes",
        category: "Navigation",
        subtitle: "Live departure countdown, stoppages, and driver hotlines",
        icon: Bus,
        path: "/bus-schedule",
        keywords: ["transport", "transit", "station", "vodra", "laxmipur", "vehicle"],
      },
      {
        id: "nav-courses",
        title: "My Academic Courses",
        category: "Navigation",
        subtitle: "Curriculum, resource vault, and slides",
        icon: BookOpen,
        path: "/courses",
        keywords: ["syllabus", "slides", "books", "subjects", "materials"],
      },
      {
        id: "nav-reg",
        title: "Course Registration",
        category: "Navigation",
        subtitle: "Submit semester registration and print confirmation paper",
        icon: ClipboardList,
        path: "/registration",
        keywords: ["enroll", "adviser", "approval", "confirmation form"],
      },
      {
        id: "nav-attendance",
        title: "Attendance Record",
        category: "Navigation",
        subtitle: "Track lecture attendance % and exam eligibility",
        icon: CalendarCheck,
        path: "/attendance",
        keywords: ["presence", "percentage", "classes attended", "eligibility"],
      },
      {
        id: "nav-marks",
        title: "Marks & Grades",
        category: "Navigation",
        subtitle: "Continuous evaluations, CTs, and official grade sheets",
        icon: Award,
        path: "/marks",
        keywords: ["results", "evaluation", "best 3", "exam marks", "cgpa"],
      },
      {
        id: "nav-cgpa",
        title: "CGPA Analytics & Tabulation",
        category: "Navigation",
        subtitle: "Academic performance graphs and provisional transcripts",
        icon: Award,
        path: "/cgpa",
        keywords: ["transcript", "gpa", "grade sheet", "sgpa", "rank"],
      },
      {
        id: "nav-cgpa-calc",
        title: "CGPA Predictor & Calculator",
        category: "Navigation",
        subtitle: "Simulate upcoming semester grades and target honors",
        icon: Award,
        path: "/cgpa/calculator",
        keywords: ["predictor", "target", "estimate", "simulator"],
      },
      {
        id: "nav-fees",
        title: "Fees & Payment Center",
        category: "Navigation",
        subtitle: "Review semester dues, exam bills, and online bKash/Nagad checkout",
        icon: CreditCard,
        path: "/fees",
        keywords: ["tuition", "bills", "receipts", "bkash", "nagad", "dues"],
      },
      {
        id: "nav-hall",
        title: "Hall Management & Seat Application",
        category: "Navigation",
        subtitle: "Room maintenance tickets, roommate contacts, and dining tokens",
        icon: Building,
        path: "/hall",
        keywords: ["hostel", "dorm", "room", "maintenance", "dining", "roommates"],
      },
      {
        id: "nav-dining",
        title: "Dining Tokens & Counter Scanner",
        category: "Navigation",
        subtitle: "Book daily meal tokens, grand feasts, and scan QR passes",
        icon: Utensils,
        path: "/dining",
        keywords: ["meal", "lunch", "dinner", "feast", "scanner", "qr"],
      },
      {
        id: "nav-medical",
        title: "Medical Center & Emergency Blood",
        category: "Navigation",
        subtitle: "Health Complex appointments, donor directory, and emergency alerts",
        icon: HeartPulse,
        path: "/medical",
        keywords: ["doctor", "health", "hospital", "clinic", "blood", "donor", "rmch"],
      },
      {
        id: "nav-clearance",
        title: "Clearance Status",
        category: "Navigation",
        subtitle: "Departmental, library, and hall clearance tracker",
        icon: ShieldCheck,
        path: "/clearance",
        keywords: ["approvals", "dues clearance", "library return"],
      },
      {
        id: "nav-calendar",
        title: "Academic Calendar",
        category: "Navigation",
        subtitle: "Official university terms, examination schedules, and holidays",
        icon: CalendarDays,
        path: "/calendar",
        keywords: ["holidays", "vacation", "exam dates", "schedule"],
      },
      {
        id: "nav-faculty",
        title: "Faculty Directory",
        category: "Navigation",
        subtitle: "Teacher profiles, departmental rooms, and email contacts",
        icon: Users,
        path: "/faculty",
        keywords: ["teachers", "professors", "adviser", "head of department"],
      },
      {
        id: "nav-notices",
        title: "Notice Board",
        category: "Navigation",
        subtitle: "Central administration circulars and departmental notifications",
        icon: Bell,
        path: "/notices",
        keywords: ["announcements", "circulars", "news"],
      },
      {
        id: "nav-study",
        title: "StudyBuddy AI",
        category: "AI Tools",
        subtitle: "Course concepts tutor and OBE study assistant",
        icon: Bot,
        path: "/ai/study",
        keywords: ["ai", "assistant", "tutor", "gemini", "questions"],
      },
      {
        id: "nav-profile",
        title: "My Profile & Digital Student ID",
        category: "Account",
        subtitle: "View verified RUET ID Card, update phone, and password",
        icon: User,
        path: "/profile",
        keywords: ["id card", "password", "settings", "roll", "avatar"],
      },

      // Quick Actions
      {
        id: "act-idcard",
        title: "View Digital Student ID Card",
        category: "Quick Actions",
        subtitle: "Holographic student ID with verified scannable QR code",
        icon: User,
        path: "/profile",
        keywords: ["digital id", "student id", "qr code", "hologram"],
      },
      {
        id: "act-blood",
        title: "Broadcast Emergency Blood Request",
        category: "Quick Actions",
        subtitle: "Notify registered students on campus matching blood group",
        icon: Droplet,
        path: "/medical",
        keywords: ["emergency blood", "patient", "need blood", "rmch", "hospital"],
      },
      {
        id: "act-bus",
        title: "Check Next Campus Bus Departure",
        category: "Quick Actions",
        subtitle: "View bus arrival times and driver contact numbers",
        icon: Bus,
        path: "/bus-schedule",
        keywords: ["bus time", "next bus", "pickup point"],
      },
      {
        id: "act-grade",
        title: "Print Official RUET Tabulation Grade Sheet",
        category: "Quick Actions",
        subtitle: "Provisional transcript with Controller of Examinations seal",
        icon: Award,
        path: "/marks",
        keywords: ["transcript", "tabulation sheet", "pdf grade sheet"],
      },
      {
        id: "act-routine-cal",
        title: "Sync Routine with Google Calendar",
        category: "Quick Actions",
        subtitle: "Export .ics file for automatic weekly class alarms",
        icon: Calendar,
        path: "/routine",
        keywords: ["google calendar", "sync routine", "ics download", "phone calendar"],
      },

      // ECE Academic Courses Shortcuts
      {
        id: "course-2201",
        title: "ECE 2201: Signals & Systems",
        category: "Courses",
        subtitle: "Department of ECE &bull; Theory (3.0 Credits)",
        icon: BookOpen,
        path: "/courses",
        keywords: ["ece 2201", "signals", "systems", "fourier", "laplace"],
      },
      {
        id: "course-2203",
        title: "ECE 2203: Electronics-II",
        category: "Courses",
        subtitle: "Department of ECE &bull; Theory (3.0 Credits)",
        icon: BookOpen,
        path: "/courses",
        keywords: ["ece 2203", "electronics", "bjt", "mosfet", "opamp"],
      },
      {
        id: "course-2205",
        title: "ECE 2205: Electrical Machines",
        category: "Courses",
        subtitle: "Department of ECE &bull; Theory (3.0 Credits)",
        icon: BookOpen,
        path: "/courses",
        keywords: ["ece 2205", "transformer", "induction motor", "dc generator"],
      },
      {
        id: "course-2207",
        title: "ECE 2207: Digital Electronics",
        category: "Courses",
        subtitle: "Department of ECE &bull; Theory (3.0 Credits)",
        icon: BookOpen,
        path: "/courses",
        keywords: ["ece 2207", "logic gates", "flip flop", "counters"],
      },
      {
        id: "course-2217",
        title: "MATH 2217: Complex Variables & Statistics",
        category: "Courses",
        subtitle: "Department of Mathematics &bull; Theory (3.0 Credits)",
        icon: BookOpen,
        path: "/courses",
        keywords: ["math 2217", "complex", "contour", "statistics", "probability"],
      },
    ];

    // Append recent notices
    notices.forEach((n) => {
      items.push({
        id: `notice-${n._id}`,
        title: n.title,
        category: "Notices",
        subtitle: `Posted on ${new Date(n.createdAt).toLocaleDateString()} by ${n.postedBy || "Administration"}`,
        icon: Bell,
        path: `/notices/${n._id}`,
        keywords: ["notice", n.category || "general", n.title.toLowerCase()],
      });
    });

    return items;
  }, [notices]);

  // Filter commands based on search query
  const filteredCommands = useMemo(() => {
    if (!searchQuery.trim()) {
      // Default view: Navigation shortcuts and Quick Actions
      return allCommands.filter((c) => c.category === "Navigation" || c.category === "Quick Actions");
    }

    const q = searchQuery.toLowerCase().trim();
    return allCommands.filter((cmd) => {
      const matchTitle = cmd.title.toLowerCase().includes(q);
      const matchSubtitle = cmd.subtitle?.toLowerCase().includes(q);
      const matchCategory = cmd.category.toLowerCase().includes(q);
      const matchKeywords = cmd.keywords?.some((k) => k.toLowerCase().includes(q));
      return matchTitle || matchSubtitle || matchCategory || matchKeywords;
    });
  }, [allCommands, searchQuery]);

  // Handle keyboard navigation inside the list
  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        executeCommand(filteredCommands[selectedIndex]);
      }
    }
  };

  const executeCommand = (cmd) => {
    setIsOpen(false);
    navigate(cmd.path);
  };

  // Group filtered results by category
  const groupedResults = useMemo(() => {
    const groups = {};
    filteredCommands.forEach((item, index) => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push({ ...item, flatIndex: index });
    });
    return groups;
  }, [filteredCommands]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-md flex items-start justify-center pt-16 sm:pt-24 p-3 animate-fade-in">
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <Search className="w-5 h-5 text-sky-600 dark:text-sky-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command, course code, notice, or feature..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-sm sm:text-base font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-200 dark:bg-slate-800 text-slate-500 rounded border border-slate-300 dark:border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div
          ref={resultsContainerRef}
          className="max-h-[60vh] overflow-y-auto p-3 space-y-4 divide-y divide-slate-100 dark:divide-slate-800/60"
        >
          {filteredCommands.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Search className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                No matching results found
              </p>
              <p className="text-xs text-slate-400">
                Try searching for &quot;routine&quot;, &quot;bus&quot;, &quot;marks&quot;, &quot;ECE 2203&quot;, or &quot;fees&quot;.
              </p>
            </div>
          ) : (
            Object.entries(groupedResults).map(([category, items]) => (
              <div key={category} className="pt-2 first:pt-0">
                <p className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {category}
                </p>
                <div className="space-y-1">
                  {items.map((item) => {
                    const isSelected = item.flatIndex === selectedIndex;
                    const IconComponent = item.icon;
                    return (
                      <div
                        key={item.id}
                        onClick={() => executeCommand(item)}
                        onMouseEnter={() => setSelectedIndex(item.flatIndex)}
                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition ${
                          isSelected
                            ? "bg-sky-50 dark:bg-sky-950/60 text-sky-900 dark:text-sky-200 border border-sky-200 dark:border-sky-800/80 shadow-2xs"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`p-2 rounded-xl shrink-0 ${
                              isSelected
                                ? "bg-sky-600 text-white shadow-xs"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                            }`}
                          >
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-bold truncate">{item.title}</p>
                            {item.subtitle && (
                              <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                                {item.subtitle}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 ml-3">
                          {isSelected && (
                            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono font-bold bg-sky-200 dark:bg-sky-900 text-sky-800 dark:text-sky-200 rounded">
                              ↵ ENTER
                            </kbd>
                          )}
                          <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Keyboard Navigation Footer */}
        <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded font-mono">
                ↑
              </kbd>
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded font-mono">
                ↓
              </kbd>
              <span>to navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded font-mono">
                ↵
              </kbd>
              <span>to select</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-sky-500" />
            <span>RUET OneHUB Instant Palette</span>
          </div>
        </div>
      </div>
    </div>
  );
}
