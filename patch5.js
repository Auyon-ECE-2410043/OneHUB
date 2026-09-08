const fs = require('fs');
let code = fs.readFileSync('v:/Project/OneHUB/OneHUB/frontend/src/pages/dashboard/Dashboard.jsx', 'utf8');

const startIdx = code.indexOf('<div className="flex flex-col lg:flex-row gap-8 items-stretch">');

if (startIdx === -1) {
  console.log("Could not find start");
  process.exit(1);
}

const topCode = code.slice(0, startIdx);

function extractBlock(marker, nextMarker) {
  const start = code.indexOf(marker);
  if (start === -1) return '';
  const end = nextMarker ? code.indexOf(nextMarker, start) : code.indexOf('        {/* Right Live Sidebar */}');
  return code.slice(start, end).trim();
}

const studentMetrics = extractBlock('{/* STUDENT DASHBOARD METRICS */}', '{/* FACULTY / ADMIN DASHBOARD METRICS */}');
const facultyMetrics = extractBlock('{/* FACULTY / ADMIN DASHBOARD METRICS */}', '{/* ADMIN SETTINGS SECTION */}');
const adminSettings = extractBlock('{/* ADMIN SETTINGS SECTION */}', '{/* Two Column Section: Quick Shortcuts');
const quickShortcuts = extractBlock('{/* Two Column Section: Quick Shortcuts', '        {/* Right Live Sidebar */}');

let updatedShortcuts = quickShortcuts.replace('lg:grid-cols-3', 'lg:grid-cols-2');
updatedShortcuts = updatedShortcuts.replace('lg:col-span-2', 'lg:col-span-1');

let updatedStudentMetrics = studentMetrics.replace('grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6', 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4');
updatedStudentMetrics = updatedStudentMetrics.replace(/p-5 /g, 'p-4 ');

let updatedFacultyMetrics = facultyMetrics.replace('grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6', 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4');
updatedFacultyMetrics = updatedFacultyMetrics.replace(/p-5 /g, 'p-4 ');

const newLayout = `      <div className="flex flex-col xl:flex-row gap-8 items-start">
        
        {/* Main Content Area (Middle) */}
        <div className="flex-1 flex flex-col space-y-8 min-w-0">
          
          {/* HUGE LIVE FEED */}
          <div className="w-full">
            <LiveSidebar />
          </div>

          ` + updatedShortcuts + `
        </div>

        {/* Right Sidebar Area (Stacked Metrics) */}
        <div className="w-full xl:w-[320px] shrink-0 flex flex-col space-y-6">
          <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-3xl p-5 border border-slate-200/50 dark:border-slate-800/50">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-500"></span>
              My Overview
            </h3>
            
            <div className="space-y-6">
              ` + updatedStudentMetrics + `
              ` + updatedFacultyMetrics + `
              ` + adminSettings + `
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}

export default Dashboard;
`;

fs.writeFileSync('v:/Project/OneHUB/OneHUB/frontend/src/pages/dashboard/Dashboard.jsx', topCode + newLayout);
console.log("Rewrote layout successfully");
