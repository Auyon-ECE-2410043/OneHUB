const fs = require("fs");
let c = fs.readFileSync("frontend/src/pages/admin/DiningManagement.jsx", "utf8");
c = c.replace("/api/dining/admin/tokens?date=", "/dining/admin/tokens?date=");
c = c.replace("/api/dining/admin/tokens/", "/dining/admin/tokens/");
fs.writeFileSync("frontend/src/pages/admin/DiningManagement.jsx", c);
