const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "frontend", "src", "routes", "AppRoutes.jsx");
let code = fs.readFileSync(filePath, "utf-8");

code = code.replace(
  /import \{ MedicalCenter \} from "\.\.\/pages\/medical\/MedicalCenter";/,
  `import { MedicalCenter } from "../pages/medical/MedicalCenter";
import { DiningDashboard } from "../pages/dining/DiningDashboard";`
);

code = code.replace(
  /<Route path="\/medical"/,
  `<Route path="/dining" element={<FeatureGuard featureKey="hall" title="Dining Tokens"><ProtectedRoute allowedRoles={["student"]}><DiningDashboard /></ProtectedRoute></FeatureGuard>} />
        <Route path="/medical"`
);

fs.writeFileSync(filePath, code);
console.log("Patched AppRoutes for Dining");

