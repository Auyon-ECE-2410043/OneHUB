const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'frontend', 'src', 'routes', 'AppRoutes.jsx');
let code = fs.readFileSync(filePath, 'utf-8');

code = code.replace(
  'import DiningDashboard from "../pages/dining/DiningDashboard";',
  'import DiningDashboard from "../pages/dining/DiningDashboard";\nimport StudyBuddy from "../pages/ai/StudyBuddy";'
);

code = code.replace(
  '<Route path="/profile" element={<Profile />} />',
  '<Route path="/profile" element={<Profile />} />\n\n        {/* AI Features */}\n        <Route path="/ai/study" element={<StudyBuddy />} />\n'
);

fs.writeFileSync(filePath, code);
console.log('Patched AppRoutes');
