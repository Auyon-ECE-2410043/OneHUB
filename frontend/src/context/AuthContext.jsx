/**
 * File: AuthContext.jsx
 * Description: React Context provider for managing global Auth state.
 * 
 * This file is part of the RUET OneHub Project.
 */

import { useState, useEffect } from "react";
import authService from "../services/authService";
import { AuthContext } from "./authContextInstance";
export { useAuth } from "../hooks/useAuth";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser) {
        setToken(storedToken);
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        // Immediate background refresh to sync with latest DB data (bloodGroup, photo, hall)
        fetch((import.meta.env.VITE_API_URL || "http://localhost:5000/api") + "/auth/me", {
          headers: { Authorization: `Bearer ${storedToken}` }
        })
          .then((res) => res.json())
          .then((data) => {
            if (data?.user) {
              setUser(data.user);
              localStorage.setItem("user", JSON.stringify(data.user));
            }
          })
          .catch((err) => console.warn("Background user sync skipped:", err));
      }
    } catch (e) {
      console.error("Failed to restore auth state", e);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      const ping = () => fetch((import.meta.env.VITE_API_URL || "http://localhost:5000/api") + "/auth/heartbeat", { method: "POST", headers: { Authorization: `Bearer ${token}` } }).catch(console.error);
      ping();
      const interval = setInterval(ping, 60000);
      return () => clearInterval(interval);
    }
  }, [token]);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    if (data.token && data.user) {
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  };

  const verifyFirstLogin = async (userId, otp, newPassword) => {
    const data = await authService.verifyFirstLogin(userId, otp, newPassword);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const register = async (userData) => {
    const data = await authService.register(userData);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const forcePasswordChange = async (userId, currentPassword, newPassword) => {
    const data = await authService.forcePasswordChange(userId, currentPassword, newPassword);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    authService.logout();
    setToken(null);
    setUser(null);
  };

  const sendOtp = async (email) => {
    return await authService.sendOtp(email);
  };

  const verifyOtp = async (email, otp) => {
    return await authService.verifyOtp(email, otp);
  };

  const resetPassword = async (email, otp, newPassword) => {
    const data = await authService.resetPassword(email, otp, newPassword);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const value = {
    user,
    token,
    role: user?.role || null,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    register,
    sendOtp,
    verifyOtp,
    verifyFirstLogin,
    forcePasswordChange,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;


