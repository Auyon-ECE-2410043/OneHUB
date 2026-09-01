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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleVerifyChange = (e) => {
    setVerifyData({ ...verifyData, [e.target.name]: e.target.value });
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
      await forcePasswordChange(userId, verifyData.newPassword);
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

  const fillCredentials = (email, password) => {
    setFormData({ email, password });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex relative overflow-hidden">
      {/* Left Column - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 bg-slate-950 z-20 shadow-[20px_0_40px_rgba(0,0,0,0.4)] relative">
        <div className="absolute top-0 left-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none lg:hidden"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none lg:hidden"></div>

        <div className="mx-auto w-full max-w-sm lg:max-w-md relative z-10">
          <div className="flex justify-center lg:justify-start">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white ring-1 ring-white/10 shadow-lg">
              <GraduationCap className="w-6 h-6 text-slate-300" />
            </div>
          </div>
          <h2 className="mt-6 text-center lg:text-left text-2xl font-semibold tracking-tight text-white">
            Sign in to OneHUB
          </h2>
          <p className="mt-2 text-center lg:text-left text-sm text-slate-400 font-light">
            Enter your university credentials to continue.
          </p>
          
          <div className="mt-10 relative z-10 w-full">
            <div className="bg-transparent lg:bg-slate-900/30 lg:backdrop-blur-md lg:border lg:border-slate-800/80 lg:shadow-2xl rounded-2xl py-2 px-0 lg:py-8 lg:px-8">
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
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Password
                  </label>
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

              {/* Quick Demo Logins Helper */}
              <div className="mt-6 pt-6 border-t border-slate-800">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider text-center mb-3">
                  Fast Demo Autofill
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => fillCredentials("student@ruet.ac.bd", "password123")}
                    className="p-2 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-xl text-center transition-smooth text-xs text-slate-300 hover:text-white"
                  >
                    <UserCheck className="w-3.5 h-3.5 mx-auto mb-1 text-sky-400" />
                    <span>Student</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillCredentials("faculty@ruet.ac.bd", "password123")}
                    className="p-2 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-xl text-center transition-smooth text-xs text-slate-300 hover:text-white"
                  >
                    <BookOpen className="w-3.5 h-3.5 mx-auto mb-1 text-emerald-400" />
                    <span>Faculty</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillCredentials("admin@ruet.ac.bd", "password123")}
                    className="p-2 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-xl text-center transition-smooth text-xs text-slate-300 hover:text-white"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 mx-auto mb-1 text-purple-400" />
                    <span>Admin</span>
                  </button>
                </div>
              </div>
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
                  For your first login, a verification code was sent to your email. Please enter it below and set a new password.
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
            </form>
          ) : null}

          <div className="mt-6 text-center text-xs text-slate-400">
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold text-sky-400 hover:text-sky-300 transition-smooth">
              Create student / faculty account
            </Link>
                  </div>
        </div>
        </div>
      </div>
      </div>
      
      {/* Right Column - Minimal Brand Panel */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-slate-900 items-center justify-center">
        {/* Deep, abstract grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:48px_48px]"></div>
        
        {/* Very subtle, slow glowing orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        
        {/* Minimal Glass Panel */}
        <div className="relative z-10 max-w-lg p-12 bg-slate-900/40 backdrop-blur-2xl border border-slate-700/30 rounded-[2rem] shadow-2xl">
           <div className="w-12 h-12 mb-8 rounded-full bg-sky-500/10 flex items-center justify-center border border-sky-500/20">
             <BookOpen className="w-5 h-5 text-sky-400 opacity-90" />
           </div>
           
           <h2 className="text-4xl font-light tracking-wide text-white mb-6 leading-tight">
             Elevating Academic <br />
             <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">
               Automation.
             </span>
           </h2>
           
           <p className="text-slate-400 leading-relaxed font-light text-sm">
             A unified, transparent portal for students and faculty of Rajshahi University of Engineering & Technology. Streamlining workflows effortlessly.
           </p>
           
           <div className="mt-10 pt-8 border-t border-slate-800/50 flex items-center space-x-8">
             <div className="flex items-center space-x-2.5 text-xs text-slate-500 font-medium tracking-wide uppercase">
               <div className="w-2 h-2 rounded-full bg-emerald-500/80 animate-pulse"></div>
               <span>Systems Operational</span>
             </div>
             <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium tracking-wide uppercase">
               <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
               <span>End-to-end Secure</span>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}

export default Login;





