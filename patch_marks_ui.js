const fs = require("fs");
let c = fs.readFileSync("frontend/src/pages/marks/MarksEntry.jsx", "utf8");

const obeUI = `          </div>

          {/* OBE CO Mapping */}
          {courseCOs.length > 0 && markType !== "final" && (
            <div className="pt-4 mt-4 border-t border-slate-100">
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-2">
                Map Assessment to Course Outcomes (OBE)
              </label>
              <div className="flex flex-wrap gap-3">
                {courseCOs.map(co => (
                  <label key={co.code} className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedCOs.includes(co.code)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedCOs([...selectedCOs, co.code]);
                        else setSelectedCOs(selectedCOs.filter(c => c !== co.code));
                      }}
                      className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                    />
                    <span className="text-sm font-bold text-slate-700">{co.code}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>`;

c = c.replace("          </div>\n        </div>\n  \n        {/* Spreadsheet Input Table */}", obeUI + "\n  \n        {/* Spreadsheet Input Table */}");
fs.writeFileSync("frontend/src/pages/marks/MarksEntry.jsx", c);
