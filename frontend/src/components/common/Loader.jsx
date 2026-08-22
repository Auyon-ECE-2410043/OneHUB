/**
 * File: Loader.jsx
 * Description: React component rendering the Loader UI interface.
 * 
 * This file is part of the RUET OneHub Project.
 */

import { Loader2 } from "lucide-react";

export function Loader({ size = "md", text = "Loading..." }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-3">
      <Loader2 className={`${sizeClasses[size] || sizeClasses.md} text-sky-600 animate-spin`} />
      {text && <p className="text-sm font-medium text-slate-500">{text}</p>}
    </div>
  );
}

export function PageLoader({ text = "Loading portal data..." }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center space-y-4">
        <Loader2 className="w-10 h-10 text-sky-600 animate-spin" />
        <p className="text-sm font-medium text-slate-600">{text}</p>
      </div>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="p-6 bg-white rounded-xl border border-slate-200 animate-pulse space-y-4">
      <div className="h-4 bg-slate-200 rounded w-1/3"></div>
      <div className="h-8 bg-slate-200 rounded w-1/2"></div>
      <div className="h-3 bg-slate-200 rounded w-full"></div>
    </div>
  );
}

export default Loader;
