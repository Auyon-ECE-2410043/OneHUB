const fs = require("fs");
let c = fs.readFileSync("C:/Users/lenovo/.gemini/antigravity/brain/cbe86718-5d76-4116-8d8a-5ef60cfa031d/task.md", "utf8");
c = c.replace("- [ ] Build Backend analytics endpoints for CQI", "- [x] Build Backend analytics endpoints for CQI");
c = c.replace("- [ ] Build Student Radar Chart UI for PO progress", "- [x] Build Student Radar Chart UI for PO progress");
fs.writeFileSync("C:/Users/lenovo/.gemini/antigravity/brain/cbe86718-5d76-4116-8d8a-5ef60cfa031d/task.md", c);
