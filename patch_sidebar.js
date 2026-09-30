const fs = require("fs");
let c = fs.readFileSync("frontend/src/components/layout/Sidebar.jsx", "utf8");

// Add Calculator to lucide-react imports if not there
if (!c.includes("Calculator,")) {
  c = c.replace(/import {([^}]+)} from "lucide-react";/, (match, p1) => {
    return `import {${p1}, Calculator} from "lucide-react";`;
  });
}

// Add route mapping
c = c.replace(
  "\"/cgpa\": \"cgpa\",",
  "\"/cgpa\": \"cgpa\",\n    \"/cgpa/calculator\": \"cgpa\","
);

// Add to sidebar items
c = c.replace(
  "{ label: \"CGPA Analytics\", path: \"/cgpa\", icon: Award },",
  "{ label: \"CGPA Analytics\", path: \"/cgpa\", icon: Award },\n          { label: \"CGPA Predictor\", path: \"/cgpa/calculator\", icon: Calculator },"
);

fs.writeFileSync("frontend/src/components/layout/Sidebar.jsx", c);
console.log("Sidebar patched");
