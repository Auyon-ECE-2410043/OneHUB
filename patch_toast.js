const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "frontend", "src", "pages", "dining", "DiningDashboard.jsx");
let code = fs.readFileSync(filePath, "utf-8");

// Replace react-toastify import with sonner
code = code.replace(/import \{ toast \} from "react-toastify";/, `import { toast } from "sonner";`);

fs.writeFileSync(filePath, code);
console.log("Patched toast library");

