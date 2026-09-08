const fs = require('fs');
let code = fs.readFileSync('v:/Project/OneHUB/OneHUB/frontend/src/components/dashboard/LiveFeedPostModal.jsx', 'utf8');

// Remove the `if (!isOpen) return null;`
code = code.replace(/if \(!isOpen\) return null;/g, '');

// Wrap the inner content with {isOpen && (...)}
code = code.replace(
  /<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900\/60 backdrop-blur-sm">/,
  `{isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">`
);

// Close the wrapper
code = code.replace(
  /<\/AnimatePresence>/,
  `  )}
    </AnimatePresence>`
);

fs.writeFileSync('v:/Project/OneHUB/OneHUB/frontend/src/components/dashboard/LiveFeedPostModal.jsx', code);
console.log("Patched modal animation logic!");
