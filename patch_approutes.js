const fs = require('fs');
const file = 'frontend/src/routes/AppRoutes.jsx';
let c = fs.readFileSync(file, 'utf8');

if (!c.includes('import DiningManagement')) {
  c = c.replace(
    'import { ClearanceAdmin } from "../pages/clearance/ClearanceAdmin";',
    'import { ClearanceAdmin } from "../pages/clearance/ClearanceAdmin";\nimport DiningManagement from "../pages/admin/DiningManagement";'
  );
}

if (!c.includes('path="/admin/dining"')) {
  c = c.replace(
    '<Route path="/admin/clearance" element={<FeatureGuard featureKey="clearance" title="Manage Clearances"><ProtectedRoute allowedRoles={["admin", "faculty", "hall_admin"]}><ClearanceAdmin /></ProtectedRoute></FeatureGuard>} />',
    '<Route path="/admin/clearance" element={<FeatureGuard featureKey="clearance" title="Manage Clearances"><ProtectedRoute allowedRoles={["admin", "faculty", "hall_admin"]}><ClearanceAdmin /></ProtectedRoute></FeatureGuard>} />\n          <Route path="/admin/dining" element={<FeatureGuard featureKey="dining" title="Dining Management"><ProtectedRoute allowedRoles={["admin", "hall_admin", "faculty"]}><DiningManagement /></ProtectedRoute></FeatureGuard>} />'
  );
}

fs.writeFileSync(file, c);
console.log('AppRoutes patched!');
