const fs = require("fs");
const path = require("path");
const filePath = path.join(__dirname, "frontend", "src", "components", "dashboard", "LiveSidebar.jsx");
let code = fs.readFileSync(filePath, "utf-8");

code = code.replace(
  /import \{ AlertCircle, Award, Bell, Activity, Trash2, Zap, Sparkles, Plus \} from "lucide-react";/,
  `import { AlertCircle, Award, Bell, Activity, Trash2, Zap, Sparkles, Plus, Globe } from "lucide-react";`
);

code = code.replace(
  /\{feed\.type === 'achievement' \? <Award className="w-6 h-6" \/> : <Bell className="w-6 h-6" \/>\}/,
  `{feed.type === "achievement" ? <Award className="w-6 h-6" /> : feed.type === "ruet_news" ? <Globe className="w-6 h-6" /> : <Bell className="w-6 h-6" />}`
);

fs.writeFileSync(filePath, code);
console.log("Patched LiveSidebar.jsx");

