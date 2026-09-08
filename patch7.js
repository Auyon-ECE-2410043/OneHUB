const fs = require('fs');
let code = fs.readFileSync('v:/Project/OneHUB/OneHUB/frontend/src/pages/dashboard/Dashboard.jsx', 'utf8');

// I will extract everything BEFORE <div className="flex flex-col lg:flex-row gap-8 items-stretch">
const splitPoint = '<div className="flex flex-col lg:flex-row gap-8 items-stretch">';
const parts = code.split(splitPoint);

if (parts.length < 2) {
  console.log("Could not find split point");
  process.exit(1);
}

const topCode = parts[0];
const bottomCode = parts[1];

// Extract the 4 sections from bottomCode using precise regex
const studentMetricsMatch = bottomCode.match(/{\/\* STUDENT DASHBOARD METRICS \*\/}([\s\S]*?){\/\* FACULTY \/ ADMIN DASHBOARD METRICS \*\/}/);
const facultyMetricsMatch = bottomCode.match(/{\/\* FACULTY \/ ADMIN DASHBOARD METRICS \*\/}([\s\S]*?){\/\* ADMIN SETTINGS SECTION \*\/}/);
const adminSettingsMatch = bottomCode.match(/{\/\* ADMIN SETTINGS SECTION \*\/}([\s\S]*?){\/\* Two Column Section: Quick Shortcuts/);
const shortcutsMatch = bottomCode.match(/{\/\* Two Column Section: Quick Shortcuts & Recent Notices \*\/}([\s\S]*?){\/\* Right Live Sidebar \*\/}/);

const studentMetrics = studentMetricsMatch ? studentMetricsMatch[1].trim() : '';
const facultyMetrics = facultyMetricsMatch ? facultyMetricsMatch[1].trim() : '';
const adminSettings = adminSettingsMatch ? adminSettingsMatch[1].trim() : '';
const shortcuts = shortcutsMatch ? shortcutsMatch[1].trim() : '';

// 1. In shortcuts, we want to replace lg:grid-cols-3 with lg:grid-cols-2 and lg:col-span-2 with lg:col-span-1.
// We also need to strip the wrapping `      </div>\r\n      </div>` from the end of the shortcuts text!
let cleanedShortcuts = shortcuts.replace(/<\/div>\s*<\/div>\s*$/, ''); // remove the extra closing divs that closed the old grid and main col.
cleanedShortcuts = cleanedShortcuts.replace('lg:grid-cols-3', 'lg:grid-cols-2');
cleanedShortcuts = cleanedShortcuts.replace('lg:col-span-2', 'lg:col-span-1');

// 2. Shrink metrics
let updatedStudentMetrics = studentMetrics.replace('grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6', 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4');
updatedStudentMetrics = updatedStudentMetrics.replace(/p-5 /g, 'p-4 ');

let updatedFacultyMetrics = facultyMetrics.replace('grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6', 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4');
updatedFacultyMetrics = updatedFacultyMetrics.replace(/p-5 /g, 'p-4 ');

const newLayout = `
      <div className="flex flex-col xl:flex-row gap-8 items-start">
        
        {/* Main Content Area (Middle) */}
        <div className="flex-1 flex flex-col space-y-8 min-w-0">
          
          {/* HUGE LIVE FEED */}
          <div className="w-full">
            <LiveSidebar />
          </div>

          {/* Quick Shortcuts & Notices */}
          ` + cleanedShortcuts + `
        </div>

        {/* Right Sidebar Area (Stacked Metrics) */}
        <div className="w-full xl:w-[320px] shrink-0 flex flex-col space-y-6">
          <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-3xl p-5 border border-slate-200/50 dark:border-slate-800/50">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-500"></span>
              My Overview
            </h3>
            
            <div className="space-y-6">
              ` + (updatedStudentMetrics ? `{/* STUDENT DASHBOARD METRICS */}\n${updatedStudentMetrics}` : '') + `
              ` + (updatedFacultyMetrics ? `{/* FACULTY / ADMIN DASHBOARD METRICS */}\n${updatedFacultyMetrics}` : '') + `
              ` + (adminSettings ? `{/* ADMIN SETTINGS SECTION */}\n${adminSettings}` : '') + `
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}

export default Dashboard;
`;

fs.writeFileSync('v:/Project/OneHUB/OneHUB/frontend/src/pages/dashboard/Dashboard.jsx', topCode + splitPoint + newLayout);
console.log("Rewrote perfectly!");
