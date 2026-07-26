import { createContext, useContext, useEffect, useState } from "react";
import { loginRequest, meRequest, registerRequest } from "../api/authApi";

const AuthContext = createContext(null);
const savedUser = () => { try { return localStorage.getItem("bridge_token") ? JSON.parse(localStorage.getItem("bridge_user")) : null; } catch { return null; } };

export function AuthProvider({ children }) {
  const [user, setUser] = useState(savedUser);
  const [authReady, setAuthReady] = useState(false);
  const clearSession = () => {
    localStorage.removeItem("bridge_token");
    localStorage.removeItem("bridge_user");
    setUser(null);
  };

  useEffect(() => {
    const token = localStorage.getItem("bridge_token");
    if (!token) { clearSession(); setAuthReady(true); return; }
    meRequest().then((currentUser) => {
      localStorage.setItem("bridge_user", JSON.stringify(currentUser));
      setUser(currentUser);
    }).catch(clearSession).finally(() => setAuthReady(true));
  }, []);
  const saveSession = (data) => {
    localStorage.setItem("bridge_token", data.access_token);
    localStorage.setItem("bridge_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };
  const login = async (values) => saveSession(await loginRequest(values));
  const register = async (values) => saveSession(await registerRequest(values));
  const logout = clearSession;
  return <AuthContext.Provider value={{ user, login, register, logout, authReady, isAuthenticated: Boolean(user) }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
