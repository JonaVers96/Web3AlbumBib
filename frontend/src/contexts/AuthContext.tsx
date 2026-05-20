import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import type { PublicUser } from "../types/user";
import { setToken as persistToken, ApiError } from "../api/client"; // ⬅️ ApiError toegevoegd
import * as userApi from "../api/users";

type AuthState = {
  token: string;
  user: PublicUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
};

type AuthContextValue = AuthState & {
  login: (email: string, password: string) => Promise<void>;
  register: (body: { firstName: string; lastName: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string>(() => localStorage.getItem("token") ?? "");
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(token));
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = Boolean(token);
  const isAdmin = user?.role === "admin";

  const logout = useCallback(() => {
    setToken("");
    setUser(null);
    setError(null);
    setLoading(false);
    persistToken("");
  }, []);

  const refresh = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const me = await userApi.me();
      setUser(me);
    } catch { 
      logout();
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  useEffect(() => {
    persistToken(token);
    if (!token) return;
    refresh().catch(() => undefined);
    
  }, [token]);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const { token: t, user: u } = await userApi.login(email, password);
      setToken(t);
      setUser(u);
      persistToken(t);
    } catch (e: unknown) {
      if (e instanceof ApiError) {
        setError(e.body?.message ?? e.message ?? "Login failed");
      } else if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Login failed");
      }
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (body: { firstName: string; lastName: string; email: string; password: string }) => {
    setLoading(true);
    setError(null);
    try {
      const { token: t, user: u } = await userApi.register(body);
      setToken(t);
      setUser(u);
      persistToken(t);
    } catch (e: unknown) { 
      if (e instanceof ApiError) {
        setError(e.body?.message ?? e.message ?? "Register failed");
      } else if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Register failed");
      }
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      isAuthenticated,
      isAdmin,
      loading,
      error,
      login,
      register,
      logout,
      refresh,
    }),
    [token, user, isAuthenticated, isAdmin, loading, error, login, register, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};