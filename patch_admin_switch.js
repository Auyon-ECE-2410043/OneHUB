const fs = require("fs");
const path = require("path");

// 1. Patch Dashboard.jsx
const dashboardPath = path.join(__dirname, "frontend", "src", "pages", "dashboard", "Dashboard.jsx");
let dashboardCode = fs.readFileSync(dashboardPath, "utf-8");

dashboardCode = dashboardCode.replace(
  `{ key: 'hall', label: 'Hall' },`,
  `{ key: 'hall', label: 'Hall' },
                      { key: 'dining', label: 'Dining' },`
);
fs.writeFileSync(dashboardPath, dashboardCode);

// 2. Patch AppRoutes.jsx
const routesPath = path.join(__dirname, "frontend", "src", "routes", "AppRoutes.jsx");
let routesCode = fs.readFileSync(routesPath, "utf-8");

routesCode = routesCode.replace(
  `featureKey="hall" title="Dining Tokens"`,
  `featureKey="dining" title="Dining Tokens"`
);
fs.writeFileSync(routesPath, routesCode);

// 3. Patch Sidebar.jsx feature map
const sidebarPath = path.join(__dirname, "frontend", "src", "components", "layout", "Sidebar.jsx");
let sidebarCode = fs.readFileSync(sidebarPath, "utf-8");

sidebarCode = sidebarCode.replace(
  `"/hall/review": "hall",`,
  `"/hall/review": "hall",
      "/dining": "dining",
      "/admin/dining": "dining",`
);
fs.writeFileSync(sidebarPath, sidebarCode);

console.log("Patched admin switches for dining");

