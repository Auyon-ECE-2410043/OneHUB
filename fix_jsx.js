const fs = require("fs");
let c = fs.readFileSync("frontend/src/pages/courses/CourseDetails.jsx", "utf8");
c = c.replace("{activeTab === \"roster\" ? (\n\n      {/* Student Roster Table */}\n      <div", "{activeTab === \"roster\" ? (\n      <div");
fs.writeFileSync("frontend/src/pages/courses/CourseDetails.jsx", c);
