import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api, setAuthToken } from "../api.js";

const AuthContext = createContext(null);

const STORAGE_KEY = "connectify_auth";

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (auth?.token) {
      setAuthToken(auth.token);
    }
    setLoading(false);
  }, []);

  const persist = useCallback((value) => {
    setAuth(value);
    if (value) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
      setAuthToken(value.token);
    } else {
      localStorage.removeItem(STORAGE_KEY);
      setAuthToken(null);
    }
  }, []);

  const register = useCallback(
    async (username, password, displayName) => {
      const { data } = await api.post("/auth/register", {
        username,
        password,
        displayName,
      });
      persist(data);
      return data;
    },
    [persist]
  );

  const login = useCallback(
    async (username, password) => {
      const { data } = await api.post("/auth/login", { username, password });
      persist(data);
      return data;
    },
    [persist]
  );

  const logout = useCallback(() => {
    persist(null);
  }, [persist]);

  const value = useMemo(
    () => ({
      user: auth?.user || null,
      token: auth?.token || null,
      isAuthenticated: !!auth?.token,
      loading,
      register,
      login,
      logout,
    }),
    [auth, loading, register, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth должен использоваться внутри AuthProvider");
  return ctx;
}
