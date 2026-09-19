const fs = require("fs");
let c = fs.readFileSync("C:/Users/lenovo/.gemini/antigravity/brain/cbe86718-5d76-4116-8d8a-5ef60cfa031d/task.md", "utf8");
c = c.replace("- [ ] Create `CourseProfile.js` model for COs and Mappings", "- [x] Create `CourseProfile.js` model for COs and Mappings");
c = c.replace("- [ ] Create a seeder script for the 12 Washington Accord POs", "- [x] Create a seeder script for the 12 Washington Accord POs");
fs.writeFileSync("C:/Users/lenovo/.gemini/antigravity/brain/cbe86718-5d76-4116-8d8a-5ef60cfa031d/task.md", c);
