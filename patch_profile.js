const fs = require("fs");
let c = fs.readFileSync("frontend/src/pages/profile/Profile.jsx", "utf8");

c = c.replace(
  "import { getInitials } from \"../../utils/helpers\";",
  "import { getInitials } from \"../../utils/helpers\";\nimport OBERadarChart from \"./OBERadarChart\";"
);

c = c.replace(
  "{/* Password Change Card */}",
  "{/* OBE Radar Chart (Student Only) */}\n        {user?.role === \"student\" && <OBERadarChart studentId=\"me\" />}\n\n        {/* Password Change Card */}"
);

fs.writeFileSync("frontend/src/pages/profile/Profile.jsx", c);
