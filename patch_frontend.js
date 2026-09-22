const fs = require("fs");
let c = fs.readFileSync("frontend/src/pages/ai/ObeLatexGenerator.jsx", "utf8");
c = c.replace("let code = res.data.latex || \"\";", "let code = typeof res.data === \"string\" ? res.data : (res.data.latex || \"\");");
fs.writeFileSync("frontend/src/pages/ai/ObeLatexGenerator.jsx", c);

