const fs = require('fs');
let code = fs.readFileSync('v:/Project/OneHUB/OneHUB/frontend/src/pages/dashboard/Dashboard.jsx', 'utf8');

code = code.replace(
  '          {/* Quick Shortcuts & Notices */}\r\n          ` + cleanedShortcuts + `\r\n        </div>', // wait I am patching the actual output file, not the script!
  ''
);
