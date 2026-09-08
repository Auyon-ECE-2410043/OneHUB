const fs = require('fs');
let code = fs.readFileSync('v:/Project/OneHUB/OneHUB/frontend/src/routes/AppRoutes.jsx', 'utf8');

// 1. Add lazy import for ClearanceAdmin
const lazyImportStr = `const ClearanceStatus = lazy(() => import("../pages/clearance/ClearanceStatus").then(module => ({ default: module.ClearanceStatus })));`;
const newLazyImportStr = lazyImportStr + `\nconst ClearanceAdmin = lazy(() => import("../pages/clearance/ClearanceAdmin").then(module => ({ default: module.ClearanceAdmin })));`;
code = code.replace(lazyImportStr, newLazyImportStr);

// 2. Add route mapping
const routeStr = `<Route path="/clearance" element={<FeatureGuard featureKey="clearance" title="Clearance Status"><ClearanceStatus /></FeatureGuard>} />`;
const newRouteStr = routeStr + `\n        <Route path="/admin/clearance" element={<FeatureGuard featureKey="clearance" title="Manage Clearances"><ProtectedRoute allowedRoles={["admin", "faculty", "hall_admin"]}><ClearanceAdmin /></ProtectedRoute></FeatureGuard>} />`;
code = code.replace(routeStr, newRouteStr);

fs.writeFileSync('v:/Project/OneHUB/OneHUB/frontend/src/routes/AppRoutes.jsx', code);
console.log("Patched AppRoutes.jsx");
