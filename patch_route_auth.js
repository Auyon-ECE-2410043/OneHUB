const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'frontend', 'src', 'routes', 'AppRoutes.jsx');
let code = fs.readFileSync(filePath, 'utf-8');

code = code.replace(
  '<Route path="/ai/study" element={<StudyBuddy />} />',
  '<Route path="/ai/study" element={<ProtectedRoute allowedRoles={["student", "faculty"]}><StudyBuddy /></ProtectedRoute>} />'
);

fs.writeFileSync(filePath, code);
console.log('Patched StudyBuddy route');
