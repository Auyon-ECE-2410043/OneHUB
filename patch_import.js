const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'frontend', 'src', 'routes', 'AppRoutes.jsx');
let code = fs.readFileSync(filePath, 'utf-8');

code = code.replace(
  'import ClearanceAdmin from "../pages/clearance/ClearanceAdmin";',
  'import ClearanceAdmin from "../pages/clearance/ClearanceAdmin";\nimport StudyBuddy from "../pages/ai/StudyBuddy";'
);

fs.writeFileSync(filePath, code);
console.log('Added StudyBuddy import');
