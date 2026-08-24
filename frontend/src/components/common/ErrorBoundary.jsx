/**
 * File: ErrorBoundary.jsx
 * Description: React component rendering the ErrorBoundary UI interface.
 * 
 * This file is part of the RUET OneHub Project.
 */

import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    if (error?.message?.includes('Failed to fetch dynamically imported module') || error?.message?.includes('Importing a module script failed')) {
      if (!sessionStorage.getItem('auto_reloaded_chunk')) {
        sessionStorage.setItem('auto_reloaded_chunk', 'true');
        window.location.reload();
        return;
      }
    }
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
          <div className="max-w-md w-full p-8 bg-white border border-rose-100 rounded-2xl shadow-sm text-center">
            <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Something went wrong</h3>
            <p className="text-sm text-slate-500 mb-6">
              {this.state.error?.message || "An unexpected rendering error occurred."}
            </p>
            <button
              onClick={this.handleReset}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-xl transition-smooth shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload Portal</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
