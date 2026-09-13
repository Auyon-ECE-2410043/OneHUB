/**
 * File: Profile.jsx
 * Description: Allows users to view and update their personal details and password.
 * 
 * This file is part of the RUET OneHub Project.
 */

import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import authService from "../../services/authService";
import { getInitials } from "../../utils/helpers";
import {
  User,
  Mail,
  Building,
  GraduationCap,
  Hash,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";

export function Profile() {
  const { user, updateUser } = useAuth();

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    rollNo: user?.rollNo || "",
    batch: user?.batch || "",
    phone: user?.phone || "",
    fatherContactNo: user?.fatherContactNo || "",
    motherContactNo: user?.motherContactNo || "",
    bloodGroup: user?.bloodGroup || "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [profileMsg, setProfileMsg] = useState({ text: "", type: "" });

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSubmitting(true);
    setProfileMsg({ text: "", type: "" });
    try {
      const response = await authService.updateProfile(profileForm);
      if (response.user) updateUser(response.user);
      setProfileMsg({ text: "Profile updated successfully.", type: "success" });
    } catch (err) {
      setProfileMsg({ text: err.message || "Failed to update profile.", type: "error" });
    } finally {
      setProfileSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setMsg({ text: "", type: "" });

    if (passwordForm.newPassword.length < 6) {
      setMsg({ text: "New password must be at least 6 characters.", type: "error" });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMsg({ text: "New password and confirmation do not match.", type: "error" });
      return;
    }

    setSubmitting(true);
    try {
      await authService.changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword
      );
      setMsg({
        text: "Password updated successfully. Please use your new password for subsequent logins.",
        type: "success",
      });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setMsg({
        text: err.message || "Failed to update password. Please check your current password.",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center space-x-2.5">
          <User className="w-7 h-7 text-sky-600" />
          <span>My Profile & Account Security</span>
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Manage your institutional identity, academic affiliation, and portal security credentials.
        </p>
      </div>

      {msg.text && (
        <div
          className={`p-4 rounded-2xl border flex items-center space-x-3 text-sm animate-in fade-in duration-200 ${
            msg.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          {msg.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Profile Overview Card */}
      <div className="p-6 bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
        <div className="relative group shrink-0">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white text-2xl font-bold flex items-center justify-center shadow-lg overflow-hidden relative">
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              getInitials(user?.name)
            )}
            <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center text-white text-xs font-medium">
              Update
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={async (e) => {
                  if (e.target.files && e.target.files[0]) {
                    try {
                      setMsg({ text: "Uploading...", type: "success" });
                      const res = await authService.uploadProfilePicture(e.target.files[0]);
                      updateUser(res.user);
                      setMsg({ text: "Profile picture updated successfully", type: "success" });
                    } catch (err) {
                      setMsg({ text: "Failed to update profile picture", type: "error" });
                    }
                  }
                }}
              />
            </label>
          </div>
        </div>

        <div className="flex-1 text-center md:text-left space-y-2">
          <div className="flex flex-col md:flex-row md:items-center space-y-1 md:space-y-0 md:space-x-3">
            <h2 className="text-xl font-bold text-slate-900">{user?.name || "RUET User"}</h2>
            <span className="px-2.5 py-0.5 bg-sky-100 text-sky-800 font-bold uppercase text-[11px] rounded-full border border-sky-200 w-max mx-auto md:mx-0">
              {user?.role?.replace("_", " ")}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 pt-2">
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{user?.email}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Building className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Department of {user?.department || "ECE"}</span>
            </div>
            {user?.rollNo && (
              <div className="flex items-center space-x-2">
                <Hash className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Roll: <strong className="font-mono">{user.rollNo}</strong></span>
              </div>
            )}
            {user?.batch && (
              <div className="flex items-center space-x-2">
                <GraduationCap className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Batch / Series '{user.batch}</span>
              </div>
            )}
          </div>
        </div>
      </div>

        {/* Edit Profile Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
              <User className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-800">Update Profile</h3>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Full Name
              </label>
              <input
                type="text"
                placeholder="e.g., John Doe"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Roll Number
                </label>
                <input
                  type="text"
                  placeholder="e.g., 2410001"
                  value={profileForm.rollNo}
                  onChange={(e) => setProfileForm({ ...profileForm, rollNo: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Batch / Series
                </label>
                <input
                  type="text"
                  placeholder="e.g., 24"
                  value={profileForm.batch}
                  onChange={(e) => setProfileForm({ ...profileForm, batch: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                placeholder="e.g., 01700000000"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Father's Contact #
              </label>
              <input
                type="text"
                placeholder="e.g., 01700000000"
                value={profileForm.fatherContactNo}
                onChange={(e) => setProfileForm({ ...profileForm, fatherContactNo: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Mother's Contact #
              </label>
              <input
                type="text"
                placeholder="e.g., 01700000000"
                value={profileForm.motherContactNo}
                onChange={(e) => setProfileForm({ ...profileForm, motherContactNo: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Blood Group
              </label>
              <select
                value={profileForm.bloodGroup}
                onChange={(e) => setProfileForm({ ...profileForm, bloodGroup: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            {profileMsg.text && (
              <div className={`p-4 rounded-xl flex items-center space-x-3 text-sm font-medium ${
                profileMsg.type === "success" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"
              }`}>
                {profileMsg.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                <p>{profileMsg.text}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={profileSubmitting}
              className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-100 transition-all disabled:opacity-70"
            >
              {profileSubmitting ? "Saving..." : "Save Profile"}
            </button>
          </form>
        </div>

      {/* Password Change Card */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100">
          <KeyRound className="w-5 h-5 text-sky-600" />
          <h3 className="font-bold text-base text-slate-800">Change Account Password</h3>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
              Current Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
              }
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
              New Password
            </label>
            <input
              type="password"
              required
              placeholder="At least 6 characters"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, newPassword: e.target.value })
              }
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              placeholder="Repeat new password"
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
              }
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-sm transition-smooth shadow-sm disabled:opacity-50 inline-flex items-center space-x-2 cursor-pointer"
            >
              {submitting ? (
                <span>Updating Password...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Update Password</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Profile;
