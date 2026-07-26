import { createContext, useContext, useState } from "react";
import { loginRequest, registerRequest } from "../api/authApi";

const AuthContext = createContext(null);
const savedUser = () => { try { return JSON.parse(localStorage.getItem("bridge_user")); } catch { return null; } };

export function AuthProvider({ children }) {
  const [user, setUser] = useState(savedUser);
  const saveSession = (data) => {
    localStorage.setItem("bridge_token", data.access_token);
    localStorage.setItem("bridge_user", JSON.stringify(data.user));
    setUser(data.user);
  };
  const login = async (values) => saveSession(await loginRequest(values));
  const register = async (values) => saveSession(await registerRequest(values));
  const logout = () => { localStorage.removeItem("bridge_token"); localStorage.removeItem("bridge_user"); setUser(null); };
  return <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: Boolean(user) }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
