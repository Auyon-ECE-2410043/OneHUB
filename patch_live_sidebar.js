const fs = require('fs');
let code = fs.readFileSync('v:/Project/OneHUB/OneHUB/frontend/src/components/dashboard/LiveSidebar.jsx', 'utf8');

// 1. Add import for the modal and Plus icon
code = code.replace(
  'import { AlertCircle, Award, Bell, Activity, Trash2, Zap, Sparkles } from "lucide-react";',
  'import { AlertCircle, Award, Bell, Activity, Trash2, Zap, Sparkles, Plus } from "lucide-react";\nimport LiveFeedPostModal from "./LiveFeedPostModal";'
);

// 2. Add state
code = code.replace(
  '  const [loading, setLoading] = useState(true);',
  '  const [loading, setLoading] = useState(true);\n  const [isModalOpen, setIsModalOpen] = useState(false);'
);

// 3. Add the button to the header
const headerRegex = /<h2 className="text-xl font-bold text-white flex items-center gap-2">\s*Live Campus Feed\s*<Sparkles className="w-4 h-4 text-sky-400 animate-bounce" \/>\s*<\/h2>/;
const newHeader = `<div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Live Campus Feed
              <Sparkles className="w-4 h-4 text-sky-400 animate-bounce" />
            </h2>
            {(user?.role === "admin" || user?.role === "faculty") && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition-colors backdrop-blur-sm border border-white/10"
              >
                <Plus className="w-3.5 h-3.5" />
                Post
              </button>
            )}
          </div>`;
code = code.replace(headerRegex, newHeader);

// 4. Add the modal at the end before </motion.div>
const modalMarkup = `\n      <LiveFeedPostModal \n        isOpen={isModalOpen} \n        onClose={() => setIsModalOpen(false)} \n        onSuccess={() => fetchFeeds()} \n      />\n    </motion.div>`;
code = code.replace('    </motion.div>', modalMarkup);

fs.writeFileSync('v:/Project/OneHUB/OneHUB/frontend/src/components/dashboard/LiveSidebar.jsx', code);
console.log("Patched LiveSidebar!");
