import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { PageLoader } from "./Loader";
import { ShieldAlert } from "lucide-react";

export function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <PageLoader text="Authenticating..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Access Restricted</h2>
        <p className="text-slate-600 max-w-md mb-6">
          Your current role (<span className="font-semibold capitalize">{user?.role}</span>) does not have permission to view this section.
        </p>
        <a
          href="/dashboard"
          className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-xl transition-smooth shadow-sm"
        >
          Return to Dashboard
        </a>
      </div>
    );
  }

  return children;
}

export default ProtectedRoute;
