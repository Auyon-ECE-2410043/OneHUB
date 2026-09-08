const fs = require('fs');

let code = fs.readFileSync('v:/Project/OneHUB/OneHUB/frontend/src/pages/dashboard/Dashboard.jsx', 'utf8');

// 1. Add LiveSidebar import
if (!code.includes('LiveSidebar')) {
  code = code.replace(
    'import { PageLoader } from "../../components/common/Loader";',
    'import { PageLoader } from "../../components/common/Loader";\nimport { LiveSidebar } from "../../components/dashboard/LiveSidebar";'
  );
}

// 2. Wrap the main content
// Find where the Welcome Banner ends and Quick Stats begins
const quickStatsComment = '{/* Quick Stats Grid */}';
const lastDiv = '      </motion.div>\n    );\n  }';

// We split the code at Quick Stats
const [topPart, bottomPart] = code.split(quickStatsComment);

if (bottomPart) {
  // Find the last closing tag of the main container to close our new layout wrapper
  const newBottomPart = bottomPart.replace(
    '      </motion.div>\n    );\n  }',
    '          </div>\n          \n          {/* Right Live Sidebar */}\n          <div className="w-full lg:w-96 shrink-0 h-auto">\n            <LiveSidebar />\n          </div>\n        </div>\n      </motion.div>\n    );\n  }'
  );

  const newCode = topPart + '<div className="flex flex-col lg:flex-row gap-8 items-stretch">\n          \n          {/* Main Content Area */}\n          <div className="flex-1 flex flex-col space-y-8">\n            ' + quickStatsComment + newBottomPart;

  fs.writeFileSync('v:/Project/OneHUB/OneHUB/frontend/src/pages/dashboard/Dashboard.jsx', newCode);
  console.log("Dashboard.jsx patched successfully!");
} else {
  console.error("Could not find Quick Stats Grid comment.");
}
