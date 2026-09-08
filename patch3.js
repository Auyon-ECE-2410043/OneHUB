const fs = require('fs');
let code = fs.readFileSync('v:/Project/OneHUB/OneHUB/frontend/src/pages/dashboard/Dashboard.jsx', 'utf8');

code = code.replace(
  'import { LiveSidebar } from "../../components/dashboard/LiveSidebar";\r\nimport { LiveSidebar } from "../../components/dashboard/LiveSidebar";',
  'import { LiveSidebar } from "../../components/dashboard/LiveSidebar";'
);
code = code.replace(
  'import { LiveSidebar } from "../../components/dashboard/LiveSidebar";\nimport { LiveSidebar } from "../../components/dashboard/LiveSidebar";',
  'import { LiveSidebar } from "../../components/dashboard/LiveSidebar";'
);

fs.writeFileSync('v:/Project/OneHUB/OneHUB/frontend/src/pages/dashboard/Dashboard.jsx', code);
