import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!localStorage.getItem("taskManagerToken")) {
      setLoading(false);
      return;
    }
    api
      .get("/auth/me")
      .then((r) => setUser(r.data.user))
      .catch(() => {
        localStorage.removeItem("taskManagerToken");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);
  const login = async (credentials) => {
    const { data } = await api.post("/auth/login", credentials);
    localStorage.setItem("taskManagerToken", data.token);
    setUser(data.user);
  };
  const register = async (details) => {
    const { data } = await api.post("/auth/register", details);
    localStorage.setItem("taskManagerToken", data.token);
    setUser(data.user);
  };
  const logout = () => {
    localStorage.removeItem("taskManagerToken");
    setUser(null);
  };
  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => useContext(AuthContext);
