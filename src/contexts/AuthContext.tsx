"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiClient, tokenManager } from "@/lib/api";
import { User, LoginCredentials, AuthResponse } from "@/types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!user && !!tokenManager.getAccessToken();

  // Check if user is authenticated on app start
  useEffect(() => {
    const initializeAuth = async () => {
      const token = tokenManager.getAccessToken();
      if (token) {
        try {
          await refreshUser();
        } catch (error) {
          console.error("Failed to initialize auth:", error);
          tokenManager.clearTokens();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      setLoading(true);
      const response: AuthResponse = await apiClient.post("/users/login", credentials);
      
      const { access_token, refresh_token, user: userData } = response;
      
      // Store tokens
      tokenManager.setTokens(access_token, refresh_token);
      
      // Set user state
      setUser(userData);
      
      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Login failed:", error);
      throw new Error(error.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const logout = (): void => {
    setUser(null);
    tokenManager.clearTokens();
    router.push("/auth/login");
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const userData: User = await apiClient.get("/users/me");
      setUser(userData);
    } catch (error) {
      console.error("Failed to refresh user:", error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    refreshUser,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
