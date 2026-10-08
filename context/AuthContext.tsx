"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { API_BASE, ENDPOINTS, request } from "../app/api/client";
type User = {
  id?: string | number;
  phone?: string;
  full_name?: string;
  role?: string;
  is_active?: boolean;
  [key: string]: unknown;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  requestOtp: (phone: string) => Promise<unknown>;
  verifyOtp: (phone: string, code: string) => Promise<unknown>;
  refreshToken: () => Promise<unknown>;
  updateUser: (updatedFields: Partial<User>) => Promise<unknown>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Get the stored access token
  const getAccessToken = () => {
    return localStorage.getItem("konvoy_access_token");
  };

  // Check existing session when app loads
  useEffect(() => {
    const checkSession = async () => {
      const token = getAccessToken();

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await request(ENDPOINTS.getUser(API_BASE), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(data.user || data);
      } catch (error) {
        console.error("Session check failed:", error);

        // Access token may have expired.
        // Try refreshing it.
        try {
          const refreshToken = localStorage.getItem("konvoy_refresh_token");

          if (!refreshToken) {
            throw new Error("No refresh token");
          }

          const refreshData = await request(ENDPOINTS.refresh(API_BASE), {
            method: "POST",
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          });

          localStorage.setItem(
            "konvoy_access_token",
            refreshData.access_token
          );

          const meData = await request(ENDPOINTS.getUser(API_BASE), {
            headers: {
              Authorization: `Bearer ${refreshData.access_token}`,
            },
          });

          setUser(meData.user || meData);
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);

          localStorage.removeItem("konvoy_access_token");
          localStorage.removeItem("konvoy_refresh_token");
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  // Request OTP
  const requestOtp = async (phone: string) => {
    const data = await request(ENDPOINTS.requestOtp(API_BASE), {
      method: "POST",
      body: JSON.stringify({
        phone,
      }),
    });

    return data;
  };

  // Verify OTP and log the user in
  const verifyOtp = async (phone: string, code: string) => {
    const data = await request(ENDPOINTS.verifyOtp(API_BASE), {
      method: "POST",
      body: JSON.stringify({
        phone,
        code,
      }),
    });

    if (data.access_token) {
      localStorage.setItem(
        "konvoy_access_token",
        data.access_token
      );
    }

    if (data.refresh_token) {
      localStorage.setItem(
        "konvoy_refresh_token",
        data.refresh_token
      );
    }

    setUser(data.user || null);

    return data;
  };

  // Get a new access token using the refresh token
  const refreshToken = async () => {
    const token = localStorage.getItem("konvoy_refresh_token");

    if (!token) {
      throw new Error("No refresh token available");
    }

    const data = await request(ENDPOINTS.refresh(API_BASE), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    localStorage.setItem(
      "konvoy_access_token",
      data.access_token
    );

    return data;
  };

  // Update current user
  const updateUser = async (updatedFields: Partial<User>) => {
    const token = getAccessToken();

    if (!token) {
      throw new Error("Not authenticated");
    }

    const data = await request(ENDPOINTS.updateUser(API_BASE), {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedFields),
    });

    const updatedUser = data.user || data;

    setUser(updatedUser);

    return data;
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("konvoy_access_token");
    localStorage.removeItem("konvoy_refresh_token");

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        requestOtp,
        verifyOtp,
        refreshToken,
        updateUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return ctx;
}