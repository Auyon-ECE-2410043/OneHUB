const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "frontend", "src", "components", "layout", "Sidebar.jsx");
let code = fs.readFileSync(filePath, "utf-8");

// Add Utensils to lucide imports
if (!code.includes("Utensils")) {
  code = code.replace(/HeartPulse,/, "HeartPulse,\n  Utensils,");
}

// Add the Dining Tokens link under Hall Application for students
code = code.replace(
  /\{\s*label:\s*"Hall Application",\s*path:\s*"\/hall",\s*icon:\s*Building\s*\},/,
  `{ label: "Hall Application", path: "/hall", icon: Building },
          { label: "Dining Tokens", path: "/dining", icon: Utensils },`
);

// Optional: Add to Admin/Hall Admin sidebar under Hall Applications
code = code.replace(
  /\{\s*label:\s*"Hall Applications",\s*path:\s*"\/hall\/review",\s*icon:\s*Building\s*\},/g,
  `{ label: "Hall Applications", path: "/hall/review", icon: Building },
          { label: "Dining Management", path: "/admin/dining", icon: Utensils },`
);

fs.writeFileSync(filePath, code);
console.log("Patched Sidebar for Dining");

