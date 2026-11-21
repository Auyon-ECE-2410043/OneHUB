/**
 * File: Login.jsx
 * Description: React component handling user login.
 * 
 * This file is part of the RUET OneHub Project.
 */

import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { GoogleLogin, useGoogleLogin } from "@react-oauth/google";
import authService from "../../services/authService";
import {
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  UserCheck,
  BookOpen,
} from "lucide-react";

export function Login() {
  const { login, verifyFirstLogin, forcePasswordChange } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/dashboard";

  const [step, setStep] = useState("login");
  const [userId, setUserId] = useState(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  
  const [verifyData, setVerifyData] = useState({
    otp: "",
    newPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleUnlinked, setGoogleUnlinked] = useState(null);
  const [linkData, setLinkData] = useState({ identifier: "", password: "" });
  const [showGoogleSetupModal, setShowGoogleSetupModal] = useState(false);
  const [setupClientId, setSetupClientId] = useState(
    import.meta.env.VITE_GOOGLE_CLIENT_ID || localStorage.getItem('vite_google_client_id') || "740690894171-8ce0qovfdifvcfoa8jjc9pkss3kof3d1.apps.googleusercontent.com"
  );
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleVerifyChange = (e) => {
    setVerifyData({ ...verifyData, [e.target.name]: e.target.value });
  };

  const handleForgotPasswordEmail = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      toast.error("Please enter your email or roll number.");
      return;
    }
    setLoading(true);
    try {
      const res = await authService.sendOtp(formData.email);
      if (res.email) {
        setFormData((prev) => ({ ...prev, email: res.email }));
      }
      toast.success(res.message || "Password reset code sent to your email!");
      setStep("reset_password");
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || "Failed to send reset code.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordReset = async (e) => {
    e.preventDefault();
    if (!verifyData.otp || !verifyData.newPassword) {
      toast.error("Please fill in OTP and a new password.");
      return;
    }
    if (verifyData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const res = await authService.resetPassword(formData.email, verifyData.otp, verifyData.newPassword);
      toast.success("Password reset successfully! Logging you in...");
      if (res.token) {
        navigate(from, { replace: true });
        window.location.reload();
      } else {
        setStep("login");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || "Invalid verification code.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const idToken = credentialResponse.credential;
    if (!idToken) {
      toast.error("No credentials received from Google.");
      return;
    }
    setLoading(true);
    try {
      await authService.googleLogin(idToken);
      toast.success("Successfully logged in with Google!");
      navigate(from, { replace: true });
      window.location.reload();
    } catch (err) {
      if (err.response?.status === 404 && err.response?.data?.unlinkedEmail) {
        const unlinkedEmail = err.response.data.unlinkedEmail;
        const rollGuess = unlinkedEmail.split('@')[0];
        setGoogleUnlinked({
          token: idToken,
          email: unlinkedEmail,
          name: err.response.data.googleName || "Student"
        });
        setLinkData({
          identifier: !isNaN(rollGuess) ? rollGuess : unlinkedEmail,
          password: ""
        });
        toast.info("Google account verified! Please enter your OneHUB password to link it.");
      } else {
        toast.error(err.response?.data?.error || err.message || "Google login failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        await authService.googleLogin(tokenResponse.access_token);
        toast.success("Successfully logged in with Google!");
        navigate(from, { replace: true });
        window.location.reload();
      } catch (err) {
        if (err.response?.status === 404 && err.response?.data?.unlinkedEmail) {
          const unlinkedEmail = err.response.data.unlinkedEmail;
          const rollGuess = unlinkedEmail.split('@')[0];
          setGoogleUnlinked({
            token: tokenResponse.access_token,
            email: unlinkedEmail,
            name: err.response.data.googleName || "Student"
          });
          setLinkData({
            identifier: !isNaN(rollGuess) ? rollGuess : unlinkedEmail,
            password: ""
          });
          toast.info("Google account verified! Please enter your OneHUB password to link it.");
        } else {
          toast.error(err.response?.data?.error || err.message || "Google login failed.");
        }
      } finally {
        setLoading(false);
      }
    },
    onError: () => toast.error("Google authentication was cancelled or failed.")
  });

  const handleGoogleClick = () => {
    const activeClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || localStorage.getItem('vite_google_client_id') || "740690894171-8ce0qovfdifvcfoa8jjc9pkss3kof3d1.apps.googleusercontent.com";
    if (!activeClientId || activeClientId === "PASTE_YOUR_GOOGLE_CLIENT_ID_HERE") {
      setShowGoogleSetupModal(true);
      return;
    }
    try {
      loginWithGoogle();
    } catch (err) {
      console.error(err);
      setShowGoogleSetupModal(true);
    }
  };

  const handleLinkGoogleAccount = async (e) => {
    e.preventDefault();
    if (!linkData.identifier || !linkData.password) {
      toast.error("Please enter your roll number / email and OneHUB password.");
      return;
    }
    setLoading(true);
    try {
      const res = await authService.googleLink(googleUnlinked.token, linkData.identifier, linkData.password);
      toast.success(res.message || "Google account linked successfully!");
      navigate(from, { replace: true });
      window.location.reload();
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || "Failed to link Google account.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSetupClientId = (e) => {
    e.preventDefault();
    if (!setupClientId.trim()) {
      toast.error("Please enter a valid Google Client ID.");
      return;
    }
    localStorage.setItem('vite_google_client_id', setupClientId.trim());
    toast.success("Google Client ID saved! Reloading application...");
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      toast.error("Please fill in your email.");
      return;
    }

    setLoading(true);

    try {
      const res = await login(formData);
      if (res.requiresOtp) {
          setStep("verify");
          setUserId(res.userId);
          toast.info(res.message);
        } else if (res.requirePasswordChange) {
          setStep("force_password_change");
          setUserId(res.userId);
          toast.info(res.message || "Please change your default password.");
        } else {
        toast.success("Welcome back to OneHUB!");
        navigate(from, { replace: true });
      }
    } catch (err) {
      toast.error(err.message || "Invalid credentials. Please check your email and password.");
    } finally {
      setLoading(false);
    }
  };

  
  const handleForcePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!verifyData.newPassword || verifyData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      await forcePasswordChange(userId, formData.password, verifyData.newPassword);
      toast.success("Password updated successfully!");
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    if (!verifyData.otp || !verifyData.newPassword) {
      toast.error("Please fill in OTP and a new password.");
      return;
    }
    if (verifyData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      await verifyFirstLogin(userId, verifyData.otp, verifyData.newPassword);
      toast.success("Password updated! Welcome to OneHUB.");
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.message || "Invalid verification code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || resending || !userId) return;
    setResending(true);
    try {
      await authService.resendFirstLoginOtp(userId);
      toast.success("A new verification code was sent to your email! Please check your Inbox and Spam/Junk folder.");
      setResendCooldown(45);
    } catch (err) {
      toast.error(err.message || "Failed to resend code.");
    } finally {
      setResending(false);
    }
  };

  const fillCredentials = (email, password) => {
    setFormData({ email, password });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-sky-500/25 ring-1 ring-white/20">
            <GraduationCap className="w-8 h-8" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-3xl font-extrabold tracking-tight text-white">
          RUET OneHUB
        </h2>
        
        <p className="mt-1 text-center text-sm text-slate-400">
          Central Integrated University Automation Portal
        </p>
      </div>
      
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          {step === "login" ? (
            <>
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    University Email
                  </label>
                  <div className="relative rounded-xl shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Mail className="h-5 w-5" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. 2108001@student.ruet.ac.bd"
                      className="block w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm transition-smooth"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Password
                    </label>
                    <button type="button" onClick={() => setStep("forgot_password")} className="text-xs font-medium text-sky-400 hover:text-sky-300 transition-smooth">
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative rounded-xl shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock className="h-5 w-5" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Leave blank if first login"
                      className="block w-full pl-10 pr-10 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm transition-smooth"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-smooth"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center py-3 px-4 rounded-xl shadow-lg shadow-sky-600/30 text-sm font-semibold text-white bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 transition-smooth cursor-pointer"
                  >
                    {loading ? (
                      <span className="flex items-center space-x-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        <span>Signing in...</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-2">
                        <span>Sign in to OneHUB</span>
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    )}
                  </button>
                </div>
              </form>

              
            </>

          ) : step === "force_password_change" ? (
            <form className="space-y-5 animate-fade-in" onSubmit={handleForcePasswordSubmit}>
              <div className="text-center mb-6">
                <Lock className="w-12 h-12 text-purple-400 mx-auto mb-2" />
                <h3 className="text-xl font-bold text-white">Update Default Password</h3>
                <p className="text-sm text-slate-400 mt-2">
                  For security reasons, faculty members must change their default password on first login.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  New Password
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="newPassword"
                    value={verifyData.newPassword}
                    onChange={handleVerifyChange}
                    placeholder="At least 6 characters"
                    className="block w-full pl-10 pr-10 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition-smooth"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-smooth"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center py-3 px-4 rounded-xl shadow-lg shadow-purple-600/30 text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 transition-smooth cursor-pointer"
                >
                  {loading ? (
                    <span className="flex items-center space-x-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      <span>Updating...</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-2">
                      <span>Update Password & Login</span>
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </button>
              </div>
            </form>

          ) : step === "verify" ? (
            <form className="space-y-5 animate-fade-in" onSubmit={handleVerifySubmit}>
              <div className="text-center mb-6">
                <ShieldCheck className="w-12 h-12 text-sky-400 mx-auto mb-2" />
                <h3 className="text-xl font-bold text-white">Security Check</h3>
                <p className="text-sm text-slate-400 mt-2">
                  A verification code was sent to <strong className="text-sky-300 font-semibold">{formData.email}</strong>. Please enter the code below and set a new password.
                </p>
                <p className="text-xs text-amber-300/80 mt-1.5 bg-amber-500/10 py-1.5 px-3 rounded-lg border border-amber-500/20">
                  Tip: If you do not see it in your inbox, please check your <strong>Spam / Junk</strong> folder.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Verification Code (OTP)
                </label>
                <input
                  type="text"
                  name="otp"
                  value={verifyData.otp}
                  onChange={handleVerifyChange}
                  placeholder="6-digit code"
                  className="block w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm transition-smooth text-center tracking-widest text-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  New Password
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="newPassword"
                    value={verifyData.newPassword}
                    onChange={handleVerifyChange}
                    placeholder="At least 6 characters"
                    className="block w-full pl-10 pr-10 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm transition-smooth"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-smooth"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center py-3 px-4 rounded-xl shadow-lg shadow-emerald-600/30 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-smooth cursor-pointer"
                >
                  {loading ? (
                    <span className="flex items-center space-x-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      <span>Verifying...</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-2">
                      <span>Verify & Change Password</span>
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || resending}
                  className="text-xs font-medium text-sky-400 hover:text-sky-300 disabled:text-slate-500 transition-smooth"
                >
                  {resending
                    ? "Resending..."
                    : resendCooldown > 0
                    ? `Resend Code in ${resendCooldown}s`
                    : "Resend Code"}
                </button>
                <button
                  type="button"
                  onClick={() => setStep("login")}
                  className="text-xs font-medium text-slate-400 hover:text-white transition-smooth"
                >
                  ← Back to Sign In
                </button>
              </div>
            </form>
          ) : step === "forgot_password" ? (
            <form className="space-y-5 animate-fade-in" onSubmit={handleForgotPasswordEmail}>
              <div className="text-center mb-6">
                <Mail className="w-12 h-12 text-sky-400 mx-auto mb-2" />
                <h3 className="text-xl font-bold text-white">Reset Password</h3>
                <p className="text-sm text-slate-400 mt-2">
                  Enter your university email or roll number to receive a password reset verification code.
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  University Email or Roll Number
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g. 2410042@student.ruet.ac.bd or 2410042"
                    className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm transition-smooth"
                    required
                  />
                </div>
              </div>
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center py-3 px-4 rounded-xl shadow-lg shadow-sky-600/30 text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 disabled:opacity-50 transition-smooth cursor-pointer"
                >
                  {loading ? "Sending..." : "Send Verification Code"}
                </button>
              </div>
              <div className="text-center mt-4">
                <button type="button" onClick={() => setStep("login")} className="text-sm font-medium text-slate-400 hover:text-white transition-smooth">
                  Back to Login
                </button>
              </div>
            </form>

          ) : step === "reset_password" ? (
            <form className="space-y-5 animate-fade-in" onSubmit={handleForgotPasswordReset}>
              <div className="text-center mb-6">
                <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
                <h3 className="text-xl font-bold text-white">Verify & Reset</h3>
                <p className="text-sm text-slate-400 mt-2">
                  We've sent a 6-digit code to {formData.email}.
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Verification Code (OTP)
                </label>
                <input
                  type="text"
                  name="otp"
                  value={verifyData.otp}
                  onChange={handleVerifyChange}
                  placeholder="6-digit code"
                  className="block w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-smooth text-center tracking-widest text-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={verifyData.newPassword}
                  onChange={handleVerifyChange}
                  placeholder="New password"
                  className="block w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-smooth"
                  required
                />
              </div>
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center py-3 px-4 rounded-xl shadow-lg shadow-emerald-600/30 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 transition-smooth cursor-pointer"
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </div>
            </form>
          ) : null}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-900 text-slate-400">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 flex flex-col items-center justify-center">
              <div className="w-full flex justify-center [&_iframe]:!rounded-xl overflow-hidden">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => toast.error("Google sign-in was cancelled or failed.")}
                  theme="filled_black"
                  shape="pill"
                  size="large"
                  text="signin_with"
                  width="360"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-400">
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold text-sky-400 hover:text-sky-300 transition-smooth">
              Create a student account
            </Link>
          </div>
        </div>
      </div>

      {/* Account Linking Modal (When Google email isn't in database yet) */}
      {googleUnlinked && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Link Google Account</h3>
                  <p className="text-xs text-sky-400 font-medium">{googleUnlinked.email}</p>
                </div>
              </div>
              <button
                onClick={() => setGoogleUnlinked(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
              Confirm your RUET Roll Number or OneHUB Email and Password to link this Google account. Once linked, you can sign in with 1-click anytime!
            </p>

            <form onSubmit={handleLinkGoogleAccount} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  RUET Roll Number or Email
                </label>
                <input
                  type="text"
                  value={linkData.identifier}
                  onChange={(e) => setLinkData({ ...linkData, identifier: e.target.value })}
                  placeholder="e.g. 2410043 or student@ruet.ac.bd"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  OneHUB Password
                </label>
                <input
                  type="password"
                  value={linkData.password}
                  onChange={(e) => setLinkData({ ...linkData, password: e.target.value })}
                  placeholder="Your OneHUB password"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setGoogleUnlinked(null)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-1/2 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-xs font-bold text-white transition disabled:opacity-50"
                >
                  {loading ? "Linking..." : "Link & Sign In"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Google Setup Guidance Modal (Shown when Client ID is missing) */}
      {showGoogleSetupModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-start border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-sky-500/10 rounded-xl text-sky-400">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Google OAuth Setup</h3>
                  <p className="text-xs text-slate-400">Connect Google Cloud Client ID for 1-click Sign-In</p>
                </div>
              </div>
              <button
                onClick={() => setShowGoogleSetupModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 space-y-2">
                <div className="font-semibold text-sky-400 flex items-center gap-1.5">
                  <Info className="w-4 h-4" /> Quick Steps to get Client ID (2 minutes):
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-300 pl-1 leading-relaxed">
                  <li>
                    Open{" "}
                    <a
                      href="https://console.cloud.google.com/apis/credentials"
                      target="_blank"
                      rel="noreferrer"
                      className="text-sky-400 hover:underline font-semibold inline-flex items-center gap-0.5"
                    >
                      Google Cloud Console <ExternalLink className="w-3 h-3" />
                    </a>
                  </li>
                  <li>Click <strong>Create Credentials &gt; OAuth client ID</strong></li>
                  <li>Application type: <strong>Web application</strong></li>
                  <li>
                    Under <strong>Authorized JavaScript origins</strong>, add:
                    <div className="mt-1 font-mono text-[11px] bg-black/40 p-2 rounded border border-slate-700 space-y-1">
                      <div>http://localhost:5173</div>
                      <div>https://one-hub-iota.vercel.app</div>
                    </div>
                  </li>
                  <li>Click <strong>Create</strong> and copy your Client ID.</li>
                </ol>
              </div>

              <form onSubmit={handleSaveSetupClientId} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Paste Google Client ID
                  </label>
                  <input
                    type="text"
                    value={setupClientId}
                    onChange={(e) => setSetupClientId(e.target.value)}
                    placeholder="e.g. 1234567890-abcdefg.apps.googleusercontent.com"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
                    required
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    You can also set <code>VITE_GOOGLE_CLIENT_ID</code> in <code>frontend/.env</code> and <code>GOOGLE_CLIENT_ID</code> in root <code>.env</code>.
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowGoogleSetupModal(false)}
                    className="w-1/2 py-2.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-xs font-bold text-white transition"
                  >
                    Save & Activate
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
    
  );
}

export default Login;





