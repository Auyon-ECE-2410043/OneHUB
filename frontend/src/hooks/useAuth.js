/**
 * File: useAuth.js
 * Description: React component rendering the useAuth.js UI interface.
 * 
 * This file is part of the RUET OneHub Project.
 */

import { useContext } from "react";
import { AuthContext } from "../context/authContextInstance";

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default useAuth;
