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
    <div className="min-h-screen bg-slate-200 flex flex-col justify-center items-center relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-slate-50 rounded-full blur-[120px] pointer-events-none"></div>

      {/* The Digital Lanyard / ID Card Container */}
      <div className="relative w-full max-w-sm mx-4 z-10 animate-fade-in-up" style={{ perspective: '1000px' }}>
        
        {/* Lanyard Strap */}
        <div className="absolute bottom-[98%] left-1/2 -translate-x-1/2 w-10 h-[300px] bg-gradient-to-t from-red-600 to-red-900 shadow-2xl z-0" style={{ transform: 'rotateX(20deg)', transformOrigin: 'bottom' }}>
           {/* Stitching lines on the lanyard */}
           <div className="absolute inset-y-0 left-1 w-[1px] bg-red-950/40 border-r border-red-500/30"></div>
           <div className="absolute inset-y-0 right-1 w-[1px] bg-red-950/40 border-l border-red-500/30"></div>
        </div>

        {/* Card Body */}
        <div className="relative z-10 bg-white rounded-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden border border-slate-300">
          
          {/* Hole Punch */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-3.5 bg-slate-200 rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"></div>

          {/* Top Blue Band */}
          <div className="h-[72px] bg-gradient-to-b from-blue-700 to-blue-900 flex items-end justify-center pb-2 relative">
            <span className="text-white font-bold tracking-[0.2em] text-xs uppercase opacity-90 drop-shadow-md">
              Rajshahi University of Engineering & Technology
            </span>
          </div>

          {/* Content Area */}
          <div className="p-8 pt-6 pb-6">
            <div className="text-center mb-6">
               <div className="w-20 h-24 mx-auto bg-slate-50 border-2 border-slate-200 rounded-lg overflow-hidden flex items-center justify-center mb-3 shadow-[inset_0_2px_10px_rgba(0,0,0,0.05)]">
                  <UserCheck className="w-10 h-10 text-slate-300" />
               </div>
               <div className="text-[10px] font-bold text-blue-800 tracking-widest uppercase">
                 Identity Verification
               </div>
            </div>

            {/* Form Area */}
            {step === "login" ? (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 pl-1">
                    University Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. 2108001@student.ruet.ac.bd"
                      className="block w-full border-0 border-b-2 border-slate-200 px-1 py-1 text-slate-800 font-bold focus:ring-0 focus:border-blue-700 transition-colors bg-transparent placeholder-slate-300 text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 pl-1 mt-3">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="block w-full border-0 border-b-2 border-slate-200 px-1 py-1 text-slate-800 font-bold focus:ring-0 focus:border-blue-700 transition-colors bg-transparent placeholder-slate-300 text-sm pr-8"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-2 text-slate-300 hover:text-slate-500 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Faculty Fast Logins for Testing */}
                <div className="flex gap-2 justify-center pt-2">
                  <button type="button" onClick={() => fillCredentials("cse_faculty@ruet.ac.bd", "password123")} className="text-[9px] font-bold tracking-wider text-slate-400 hover:text-blue-600 transition-colors uppercase border border-slate-200 px-2 py-1 rounded">CSE</button>
                  <button type="button" onClick={() => fillCredentials("ece_faculty@ruet.ac.bd", "password123")} className="text-[9px] font-bold tracking-wider text-slate-400 hover:text-blue-600 transition-colors uppercase border border-slate-200 px-2 py-1 rounded">ECE</button>
                  <button type="button" onClick={() => fillCredentials("admin@ruet.ac.bd", "password123")} className="text-[9px] font-bold tracking-wider text-slate-400 hover:text-blue-600 transition-colors uppercase border border-slate-200 px-2 py-1 rounded">ADMIN</button>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center py-3 px-4 rounded-xl shadow-lg shadow-blue-600/20 text-xs font-bold tracking-widest uppercase text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    {loading ? "Authenticating..." : "Scan & Login"}
                  </button>
                </div>
              </form>
            ) : step === "force_password_change" ? (
              <form className="space-y-4" onSubmit={handleForcePasswordSubmit}>
                 <div className="text-center mb-4">
                  <Lock className="w-8 h-8 text-rose-500 mx-auto mb-2" />
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Security Update</h3>
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 pl-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="newPassword"
                      value={verifyData.newPassword}
                      onChange={handleVerifyChange}
                      placeholder="••••••••"
                      className="block w-full border-0 border-b-2 border-rose-200 px-1 py-1 text-slate-800 font-bold focus:ring-0 focus:border-rose-600 transition-colors bg-transparent placeholder-slate-300 text-sm pr-8"
                      required
                    />
                     <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-2 text-slate-300">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="pt-2">
                  <button type="submit" disabled={loading} className="w-full flex items-center justify-center py-3 px-4 rounded-xl shadow-lg shadow-rose-600/20 text-xs font-bold tracking-widest uppercase text-white bg-rose-600 hover:bg-rose-700 transition-colors">
                    {loading ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </form>
            ) : (
              <form className="space-y-4" onSubmit={handleVerifySubmit}>
                 <div className="text-center mb-4">
                  <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Verify First Login</h3>
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 pl-1">OTP Code</label>
                  <input type="text" name="otp" value={verifyData.otp} onChange={handleVerifyChange} className="block w-full border-0 border-b-2 border-emerald-200 px-1 py-1 text-slate-800 font-bold focus:ring-0 focus:border-emerald-600 bg-transparent text-center tracking-[0.3em] text-lg mb-4" required />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 pl-1">New Password</label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} name="newPassword" value={verifyData.newPassword} onChange={handleVerifyChange} className="block w-full border-0 border-b-2 border-emerald-200 px-1 py-1 text-slate-800 font-bold focus:ring-0 focus:border-emerald-600 bg-transparent pr-8 text-sm" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-2 text-slate-300">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="pt-2">
                  <button type="submit" disabled={loading} className="w-full flex items-center justify-center py-3 px-4 rounded-xl shadow-lg shadow-emerald-600/20 text-xs font-bold tracking-widest uppercase text-white bg-emerald-600 hover:bg-emerald-700 transition-colors">
                    {loading ? "Verifying..." : "Verify & Login"}
                  </button>
                </div>
              </form>
            )}

            <div className="mt-6 text-center text-[10px] text-slate-400 uppercase tracking-widest font-bold">
              Not registered?{" "}
              <Link to="/register" className="text-blue-600 hover:text-blue-800 transition-colors">
                Apply Here
              </Link>
            </div>
          </div>
          
          {/* Barcode Footer */}
          <div className="bg-slate-50 border-t border-slate-200 p-4 pb-5 flex flex-col items-center">
            {/* Fake Barcode Lines */}
            <div className="flex items-center space-x-1 mb-2 h-10 opacity-70">
               <div className="w-[2px] h-full bg-slate-800"></div>
               <div className="w-[4px] h-full bg-slate-800"></div>
               <div className="w-[1px] h-full bg-slate-800"></div>
               <div className="w-[3px] h-full bg-slate-800"></div>
               <div className="w-[2px] h-full bg-slate-800"></div>
               <div className="w-[1px] h-full bg-slate-800"></div>
               <div className="w-[5px] h-full bg-slate-800"></div>
               <div className="w-[1px] h-full bg-slate-800"></div>
               <div className="w-[2px] h-full bg-slate-800"></div>
               <div className="w-[4px] h-full bg-slate-800"></div>
               <div className="w-[1px] h-full bg-slate-800"></div>
               <div className="w-[2px] h-full bg-slate-800"></div>
               <div className="w-[3px] h-full bg-slate-800"></div>
               <div className="w-[1px] h-full bg-slate-800"></div>
               <div className="w-[2px] h-full bg-slate-800"></div>
            </div>
            <div className="text-[8px] tracking-[0.3em] text-slate-500 font-mono font-bold">10398472093847</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
