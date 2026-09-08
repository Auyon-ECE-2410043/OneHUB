const fs = require('fs');
let code = fs.readFileSync('v:/Project/OneHUB/OneHUB/frontend/src/pages/dashboard/Dashboard.jsx', 'utf8');

code = code.replace(
  'import { PageLoader } from "../../components/common/Loader";',
  'import { PageLoader } from "../../components/common/Loader";\nimport { LiveSidebar } from "../../components/dashboard/LiveSidebar";'
);

code = code.replace(
  '      </motion.div>\r\n\r\n      {/* STUDENT DASHBOARD METRICS */}',
  '      </motion.div>\r\n\r\n      <div className="flex flex-col lg:flex-row gap-8 items-stretch">\r\n        <div className="flex-1 flex flex-col space-y-8 min-w-0">\r\n\r\n      {/* STUDENT DASHBOARD METRICS */}'
);

code = code.replace(
  '          </div>\r\n        </div>\r\n      </div>\r\n    </motion.div>\r\n  );\r\n}',
  '          </div>\r\n        </div>\r\n      </div>\r\n      \r\n      </div>\r\n      <div className="w-full lg:w-[360px] shrink-0">\r\n        <LiveSidebar />\r\n      </div>\r\n      </div>\r\n    </motion.div>\r\n  );\r\n}'
);

fs.writeFileSync('v:/Project/OneHUB/OneHUB/frontend/src/pages/dashboard/Dashboard.jsx', code);
console.log("Patched!");
