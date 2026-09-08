const fs = require('fs');
const code = fs.readFileSync('v:/Project/OneHUB/OneHUB/frontend/src/pages/dashboard/Dashboard.jsx', 'utf8');

const blocks = [
  "Welcome Banner",
  "Main Content Area (Middle)",
  "HUGE LIVE FEED",
  "Quick Shortcuts & Notices",
  "Right Sidebar Area"
];

for (const b of blocks) {
  const parts = code.split(b);
  if (parts.length < 2) continue;
  let text = parts[1];
  // extract until the next block or end
  let nextIdx = code.length;
  for (const b2 of blocks) {
    if (b === b2) continue;
    const idx = text.indexOf(b2);
    if (idx !== -1 && idx < nextIdx) {
      nextIdx = idx;
    }
  }
  const chunk = text.slice(0, nextIdx);
  const open = (chunk.match(/<div/g) || []).length;
  const close = (chunk.match(/<\/div>/g) || []).length;
  console.log(b, "Open:", open, "Close:", close);
}
