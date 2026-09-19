const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'frontend', 'src', 'pages', 'auth', 'Login.jsx');
let code = fs.readFileSync(filePath, 'utf-8');

// Add import
code = code.replace(
  /import \{ useAuth \} from "..\/..\/context\/AuthContext";/,
  "import { useAuth } from '../../context/AuthContext';\nimport { useGoogleLogin } from '@react-oauth/google';"
);

// Add google login handler
const googleHandler = \  const handleGoogleSuccess = async (tokenResponse) => {
    setLoading(true);
    try {
      const res = await authService.googleLogin(tokenResponse.credential || tokenResponse.access_token);
      toast.success("Successfully logged in with Google!");
      navigate(from, { replace: true });
      window.location.reload();
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || "Google login failed.");
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const res = await authService.googleLogin(tokenResponse.access_token);
        toast.success("Successfully logged in with Google!");
        navigate(from, { replace: true });
        window.location.reload();
      } catch (err) {
        toast.error(err.response?.data?.error || err.message || "Google login failed.");
      } finally {
        setLoading(false);
      }
    },
    onError: () => toast.error("Google login failed")
  });\

code = code.replace(
  /const handleSubmit = async \(e\) => \{/,
  googleHandler + "\n\n  const handleSubmit = async (e) => {"
);

// Add divider and google button before Don't have an account
const googleButtonUI = \
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-900 text-slate-400">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => loginWithGoogle()}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-slate-700 rounded-xl shadow-sm bg-white/5 hover:bg-white/10 text-sm font-medium text-white transition-smooth"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign in with Google
              </button>
            </div>
          </div>
\;

code = code.replace(
  /<div className="mt-6 text-center text-xs text-slate-400">/,
  googleButtonUI + '\n          <div className="mt-6 text-center text-xs text-slate-400">'
);

fs.writeFileSync(filePath, code);
console.log('Patched Login.jsx for Google Auth');
