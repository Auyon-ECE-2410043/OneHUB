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
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error("Failed to restore auth state", e);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
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

  const updateUser = (updatedUser) => {
    const merged = { ...user, ...updatedUser };
    setUser(merged);
    localStorage.setItem("user", JSON.stringify(merged));
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
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
