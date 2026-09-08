const fs = require('fs');
let code = fs.readFileSync('v:/Project/OneHUB/OneHUB/frontend/src/pages/dashboard/Dashboard.jsx', 'utf8');

// 1. We need to extract the Welcome Banner
const bannerStart = '{/* Welcome Banner */}';
const bannerEnd = '<div className="flex flex-col xl:flex-row gap-8 items-start">';

let bannerCode = code.slice(code.indexOf(bannerStart), code.indexOf(bannerEnd));

// 2. Remove the banner from its current location
code = code.replace(bannerCode, '');

// 3. Remove the student Course Registration button from the banner
bannerCode = bannerCode.replace(/{\s*user\?\.role === "student" && \([\s\S]*?<\/Link>\s*\)\s*}/, '');

// 4. Reduce padding on the banner
bannerCode = bannerCode.replace('p-6 sm:p-8', 'p-5 sm:p-6');
bannerCode = bannerCode.replace('text-3xl sm:text-4xl', 'text-2xl sm:text-3xl');

// 5. Insert the banner into the left column
const insertPoint = '{/* Main Content Area (Middle) */}\r\n        <div className="flex-1 flex flex-col space-y-8 min-w-0">';
// fallback for \n
const insertPoint2 = '{/* Main Content Area (Middle) */}\n        <div className="flex-1 flex flex-col space-y-8 min-w-0">';

if (code.includes(insertPoint)) {
  code = code.replace(insertPoint, insertPoint + '\n          ' + bannerCode.trim());
} else if (code.includes(insertPoint2)) {
  code = code.replace(insertPoint2, insertPoint2 + '\n          ' + bannerCode.trim());
} else {
  console.log("Could not find insert point");
  process.exit(1);
}

fs.writeFileSync('v:/Project/OneHUB/OneHUB/frontend/src/pages/dashboard/Dashboard.jsx', code);
console.log("Patched banner!");
