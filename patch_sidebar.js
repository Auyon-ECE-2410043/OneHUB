const fs = require("fs");
const path = "frontend/src/components/layout/Sidebar.jsx";
let content = fs.readFileSync(path, "utf-8");

const replacement = `export function Sidebar({ isOpen, onClose, features = {} }) {
  const { user } = useAuth();
  const role = user?.role;

  const featureKeyMap = {
    "/calendar": "calendar",
    "/manage-calendar": "calendar",
    "/routine": "routine",
    "/manage-routine": "routine",
    "/courses": "courses",
    "/course-assignments": "courses",
    "/registration": "registration",
    "/attendance": "attendance",
    "/attendance/mark": "attendance",
    "/marks": "marks",
    "/marks/entry": "marks",
    "/cgpa": "cgpa",
    "/fees": "fees",
    "/hall": "hall",
    "/hall/review": "hall",
    "/admin/clearance": "clearance",
    "/clearance": "clearance",
    "/medical": "medical",
    "/notices": "notices",
    "/faculty": "faculty",
  };

  // Define navigation items based on user role
  const getNavItems = () => {`;

content = content.replace(`export function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  const role = user?.role;

  // Define navigation items based on user role
  const getNavItems = () => {`, replacement);

const replacement2 = `  };

  const navItems = getNavItems().filter((item) => {
    if (role === "admin") return true;
    const featureKey = featureKeyMap[item.path];
    if (featureKey && features[featureKey] === false) return false;
    return true;
  });

  return (`;

content = content.replace(`  };

  const navItems = getNavItems();

  return (`, replacement2);

fs.writeFileSync(path, content, "utf-8");
console.log("Done");
