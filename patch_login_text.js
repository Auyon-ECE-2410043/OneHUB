const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "frontend", "src", "pages", "auth", "Login.jsx");
let code = fs.readFileSync(filePath, "utf-8");

code = code.replace(
  /faculty members must change their default password/g,
  "you must change your default password"
);

fs.writeFileSync(filePath, code);
console.log("Patched Login.jsx text");

