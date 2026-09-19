const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "frontend", "src", "routes", "AppRoutes.jsx");
let code = fs.readFileSync(filePath, "utf-8");

code = code.replace(
  /import HallApplicationForm from "\.\.\/pages\/hallApplication\/HallApplicationForm";/,
  `import HallApplicationForm from "../pages/hallApplication/HallApplicationForm";
import { HallManagementDashboard } from "../pages/hall/HallManagementDashboard";`
);

code = code.replace(
  /<Route path="\/hall" element=\{<FeatureGuard featureKey="hall" title="Hall Application"><HallApplicationForm \/><\/FeatureGuard>\} \/>/,
  `<Route path="/hall" element={<FeatureGuard featureKey="hall" title="Hall Management"><ProtectedRoute allowedRoles={["student"]}><HallManagementDashboard /></ProtectedRoute></FeatureGuard>} />
        <Route path="/hall/apply" element={<FeatureGuard featureKey="hall" title="Hall Application"><HallApplicationForm /></FeatureGuard>} />`
);

fs.writeFileSync(filePath, code);
console.log("Patched AppRoutes for Hall Management");

