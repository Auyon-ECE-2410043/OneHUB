const fs = require("fs");
let c = fs.readFileSync("C:/Users/lenovo/.gemini/antigravity/brain/cbe86718-5d76-4116-8d8a-5ef60cfa031d/task.md", "utf8");
c = c.replace("- [ ] Upgrade `/marks` backend API for CO-based assessment", "- [x] Upgrade `/marks` backend API for CO-based assessment");
fs.writeFileSync("C:/Users/lenovo/.gemini/antigravity/brain/cbe86718-5d76-4116-8d8a-5ef60cfa031d/task.md", c);
