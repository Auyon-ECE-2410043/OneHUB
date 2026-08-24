/**
 * File: Register.jsx
 * Description: React component handling user registration.
 * 
 * This file is part of the RUET OneHub Project.
 */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { DEPARTMENTS, BATCHES, ROLES } from "../../utils/constants";
import {
  GraduationCap,
  Mail,
  User,
  Hash,
  Lock,
  Eye,
  EyeOff,
  Building2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export function Register() {
  const { register, verifyFirstLogin } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: ROLES.STUDENT,
    rollNo: "",
    registrationNo: "",
    department: "ECE",
    batch: "21",
  });
  
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (role) => {
    setFormData({ ...formData, role });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const submitData = { ...formData };
      delete submitData.confirmPassword;
      
      const res = await register(submitData);
      if (res.requiresOtp) {
        setStep(2);
        setUserId(res.userId);
        toast.info(res.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || "Registration failed. Please check the provided details.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) {
      toast.error("Please enter the verification code.");
      return;
    }

    setLoading(true);
    try {
      await verifyFirstLogin(userId, otp, ""); // empty newPassword means don't change it
      toast.success("Email verified successfully! Welcome to OneHUB.");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || "Invalid or expired code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl relative z-10">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-sky-500/25 ring-1 ring-white/20">
            <GraduationCap className="w-7 h-7" />
          </div>
        </div>
        <h2 className="mt-3 text-center text-3xl font-extrabold tracking-tight text-white">
          Create OneHUB Account
        </h2>
        <p className="mt-1 text-center text-sm text-slate-400">
          Join RUET's unified academic and administrative ecosystem
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl relative z-10">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          
          {step === 1 ? (
            <>
              

              <form className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300" onSubmit={handleSubmit}>
                
                {/* Edu Email */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Academic Edu Mail
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
                      className="block w-full pl-10 pr-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm transition-smooth"
                      required
                    />
                  </div>
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative rounded-xl shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <User className="h-5 w-5" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Tanvir Ahmed"
                      className="block w-full pl-10 pr-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm transition-smooth"
                      required
                    />
                  </div>
                </div>

                {/* Passwords */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        placeholder="At least 6 chars"
                        className="block w-full pl-10 pr-10 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm transition-smooth"
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
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Confirm Password
                    </label>
                    <div className="relative rounded-xl shadow-xs">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <Lock className="h-5 w-5" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm password"
                        className="block w-full pl-10 pr-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm transition-smooth"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                        Roll Number
                      </label>
                      <div className="relative rounded-xl shadow-xs">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                          <Hash className="h-5 w-5" />
                        </div>
                        <input
                          type="text"
                          name="rollNo"
                          value={formData.rollNo}
                          onChange={handleChange}
                          placeholder="e.g. 2108001"
                          className="block w-full pl-10 pr-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm transition-smooth"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                        Registration Number
                      </label>
                      <div className="relative rounded-xl shadow-xs">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                          <Hash className="h-5 w-5" />
                        </div>
                        <input
                          type="text"
                          name="registrationNo"
                          value={formData.registrationNo}
                          onChange={handleChange}
                          placeholder="e.g. 8001"
                          className="block w-full pl-10 pr-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm transition-smooth"
                          required
                        />
                      </div>
                    </div>
                  </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Department
                    </label>
                    <div className="relative rounded-xl shadow-xs">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <select
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm transition-smooth"
                      >
                        {DEPARTMENTS.map((dept) => (
                          <option key={dept} value={dept} className="bg-slate-800">
                            {dept}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                        Batch / Series
                      </label>
                      <div className="relative rounded-xl shadow-xs">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                          <GraduationCap className="h-5 w-5" />
                        </div>
                        <select
                          name="batch"
                          value={formData.batch}
                          onChange={handleChange}
                          className="block w-full pl-10 pr-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm transition-smooth"
                        >
                          {BATCHES.map((batch) => (
                            <option key={batch} value={batch} className="bg-slate-800">
                              Series {batch}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center py-3 px-4 rounded-xl shadow-lg shadow-emerald-600/30 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-smooth cursor-pointer"
                  >
                    {loading ? (
                      <span className="flex items-center space-x-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        <span>Creating Account...</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-2">
                        <span>Register Account</span>
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <form className="space-y-5 animate-fade-in" onSubmit={handleVerifyOtp}>
              <div className="text-center mb-6">
                <ShieldCheck className="w-12 h-12 text-sky-400 mx-auto mb-2" />
                <h3 className="text-xl font-bold text-white">Verify Your Email</h3>
                <p className="text-sm text-slate-400 mt-2">
                  A verification code has been sent to your email. Please enter it below to activate your account.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Verification Code (OTP)
                </label>
                <input
                  type="text"
                  name="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="6-digit code"
                  className="block w-full px-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm transition-smooth text-center tracking-widest text-lg"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center py-3 px-4 rounded-xl shadow-lg shadow-sky-600/30 text-sm font-semibold text-white bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 transition-smooth cursor-pointer"
                >
                  {loading ? (
                    <span className="flex items-center space-x-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      <span>Verifying...</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-2">
                      <span>Verify & Login</span>
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="mt-8 text-center text-xs text-slate-400">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-sky-400 hover:text-sky-300 transition-smooth">
              Sign in to OneHUB
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
