const fs = require("fs");
let c = fs.readFileSync("frontend/src/pages/profile/OBERadarChart.jsx", "utf8");

const emptyState = `  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <Target className="w-5 h-5 text-sky-600"/>
          <h3 className="font-bold text-base text-slate-800">Outcome Attainment (OBE)</h3>
        </div>
        <div className="p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <Target className="w-8 h-8 text-slate-300"/>
          </div>
          <h4 className="font-bold text-slate-700 mb-1">No Skill Data Yet</h4>
          <p className="text-sm text-slate-500 max-w-sm">Your Outcome-Based Education (OBE) radar chart will appear here once your teachers enter exam marks mapped to Course Outcomes.</p>
        </div>
      </div>
    );
  }`;

c = c.replace("  if (data.length === 0) return null;", emptyState);
fs.writeFileSync("frontend/src/pages/profile/OBERadarChart.jsx", c);
