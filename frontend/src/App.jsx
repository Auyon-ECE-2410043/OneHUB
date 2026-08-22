import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import AppRoutes from "./routes/AppRoutes";
import ErrorBoundary from "./components/common/ErrorBoundary";
import { ThemeProvider } from "./context/ThemeContext";
import { Toaster } from "sonner";

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
        <Toaster position="bottom-right" richColors closeButton />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
