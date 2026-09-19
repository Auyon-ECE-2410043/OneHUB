const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "frontend", "src", "components", "layout", "Sidebar.jsx");
let code = fs.readFileSync(filePath, "utf-8");

code = code.replace(
  /\{\s*label:\s*"Hall Application",\s*path:\s*"\/hall",\s*icon:\s*Building\s*\},\s*\{\s*label:\s*"Dining Tokens",\s*path:\s*"\/dining",\s*icon:\s*Utensils\s*\}/g,
  `{ label: "Hall Management", path: "/hall", icon: Building }`
);

fs.writeFileSync(filePath, code);
console.log("Patched Sidebar for Hall Management");

