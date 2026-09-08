const fs = require('fs');
let code = fs.readFileSync('v:/Project/OneHUB/OneHUB/frontend/src/pages/dashboard/Dashboard.jsx', 'utf8');

// Import
if (!code.includes('LiveSidebar')) {
  code = code.replace(
    'import { PageLoader } from "../../components/common/Loader";',
    'import { PageLoader } from "../../components/common/Loader";\nimport { LiveSidebar } from "../../components/dashboard/LiveSidebar";'
  );
}

const splitPattern = '</motion.div>\n\n      {/* STUDENT DASHBOARD METRICS */}';
if (code.includes(splitPattern)) {
  code = code.replace(
    splitPattern,
    '</motion.div>\n\n      <div className="flex flex-col xl:flex-row gap-8 items-stretch">\n        <div className="flex-1 flex flex-col space-y-8 min-w-0">\n\n      {/* STUDENT DASHBOARD METRICS */}'
  );
} else {
  console.log("Could not find split pattern 1");
}

const endPattern = '        </div>\n      </motion.div>\n    );\n  }';
if (code.includes(endPattern)) {
  code = code.replace(
    endPattern,
    '        </div>\n\n        </div>\n        {/* Right Live Sidebar */}\n        <div className="w-full xl:w-[350px] shrink-0">\n          <LiveSidebar />\n        </div>\n      </div>\n    </motion.div>\n    );\n  }'
  );
} else {
  console.log("Could not find split pattern 2");
}

fs.writeFileSync('v:/Project/OneHUB/OneHUB/frontend/src/pages/dashboard/Dashboard.jsx', code);
