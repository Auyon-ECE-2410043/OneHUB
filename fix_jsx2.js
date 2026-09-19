const fs = require("fs");
let c = fs.readFileSync("frontend/src/pages/courses/CourseOBEProfile.jsx", "utf8");
c = c.replace("value=-{co.description}", "value={co.description}");
fs.writeFileSync("frontend/src/pages/courses/CourseOBEProfile.jsx", c);
