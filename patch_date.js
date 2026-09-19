const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "frontend", "src", "pages", "dining", "DiningDashboard.jsx");
let code = fs.readFileSync(filePath, "utf-8");

// Remove date-fns import
code = code.replace(/import \{ format, addDays \} from "date-fns";/, "");

// Replace format(new Date(r.date), "dd MMM, yyyy")
// with native formatting
code = code.replace(
  /\{format\(new Date\(r\.date\), "dd MMM, yyyy"\)\}/g,
  `{new Date(r.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}`
);

// Replace addDays(new Date(), 1) with native
code = code.replace(
  /addDays\(new Date\(\), 1\)/g,
  `new Date(new Date().setDate(new Date().getDate() + 1))`
);

fs.writeFileSync(filePath, code);
console.log("Patched date-fns out");

