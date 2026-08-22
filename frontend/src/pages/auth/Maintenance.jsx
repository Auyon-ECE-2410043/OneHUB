
import { HardHat } from "lucide-react";
export default function Maintenance() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl max-w-lg w-full border border-slate-100 flex flex-col items-center">
        <div className="w-24 h-24 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
          <HardHat className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-800 mb-3 tracking-tight">Under Maintenance</h1>
        <p className="text-slate-500 mb-8 leading-relaxed">
          RUET OneHub is currently undergoing scheduled maintenance to improve system stability and deploy new features. Please check back shortly.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 shadow-md transition-colors"
        >
          Check Again
        </button>
      </div>
    </div>
  );
}

