import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import ErrorBoundary from "../common/ErrorBoundary";

export function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col mesh-bg transition-colors duration-500">
      <Navbar
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />

      <div className="flex-1 flex">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Content Area (with left margin on desktop to clear fixed sidebar) */}
        <main className="flex-1 flex flex-col lg:pl-64 min-w-0">
          <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
