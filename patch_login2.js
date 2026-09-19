const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'frontend', 'src', 'pages', 'auth', 'Login.jsx');
let code = fs.readFileSync(filePath, 'utf-8');

const replacement1 = '<div>\n' +
'                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">\n' +
'                  Confirm Password\n' +
'                </label>\n' +
'                <input\n' +
'                  type="password"\n' +
'                  name="confirmPassword"\n' +
'                  value={verifyData.confirmPassword || ""}\n' +
'                  onChange={handleVerifyChange}\n' +
'                  placeholder="Confirm new password"\n' +
'                  className="block w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-smooth"\n' +
'                  required\n' +
'                />\n' +
'              </div>\n' +
'              <div>\n' +
'                <button\n' +
'                  type="submit"\n' +
'                  disabled={loading}\n' +
'                  className="w-full flex items-center justify-center py-3 px-4 rounded-xl shadow-lg shadow-emerald-600/30 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 transition-smooth cursor-pointer"\n' +
'                >\n' +
'                  {loading ? "Resetting..." : "Reset Password"}';

code = code.replace(
  '<div>\n                <button\n                  type="submit"\n                  disabled={loading}\n                  className="w-full flex items-center justify-center py-3 px-4 rounded-xl shadow-lg shadow-emerald-600/30 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 transition-smooth cursor-pointer"\n                >\n                  {loading ? "Resetting..." : "Reset Password"}',
  replacement1
);

const replacement2 = 'if (verifyData.newPassword.length < 6) {\n' +
'      toast.error("Password must be at least 6 characters.");\n' +
'      return;\n' +
'    }\n' +
'    if (verifyData.newPassword !== verifyData.confirmPassword) {\n' +
'      toast.error("Passwords do not match.");\n' +
'      return;\n' +
'    }';

code = code.replace(
  'if (verifyData.newPassword.length < 6) {\n      toast.error("Password must be at least 6 characters.");\n      return;\n    }',
  replacement2
);

fs.writeFileSync(filePath, code);
console.log('Patched');
