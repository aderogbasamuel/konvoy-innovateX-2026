
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { API_BASE, ENDPOINTS, request } from "../app/api/client";

export type User = {
  id?: string | number;
  phone?: string;
  full_name?: string;
  role?: string;
  is_active?: boolean;
  [key: string]: unknown;
};

type ApiResponse = {
  message?: string;
  expires_in?: number;
  access_token?: string;
  refresh_token?: string;
  is_new_user?: boolean;
  user?: User;
  [key: string]: unknown;
};

export type VerifyOtpResult = ApiResponse & {
  access_token: string;
  refresh_token: string;
  is_new_user: boolean;
  user: User;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  requestOtp: (phone: string) => Promise<ApiResponse>;
  verifyOtp: (phone: string, code: string) => Promise<VerifyOtpResult>;
  refreshToken: () => Promise<ApiResponse>;
  updateUser: (updatedFields: Partial<User>) => Promise<ApiResponse>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const getAccessToken = () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("konvoy_access_token");
  };

  // Restore the existing session when the app loads.
  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      try {
        const token = getAccessToken();

        if (!token) return;

        try {
          const data: ApiResponse = await request(
            ENDPOINTS.getUser(API_BASE),
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!cancelled) {
            setUser(data.user ?? null);
          }

          return;
        } catch (error) {
          console.warn("Access token check failed; trying refresh.", error);
        }

        const storedRefreshToken = localStorage.getItem(
          "konvoy_refresh_token"
        );

        if (!storedRefreshToken) {
          throw new Error("No refresh token available");
        }

        const refreshData: ApiResponse = await request(
          ENDPOINTS.refresh(API_BASE),
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${storedRefreshToken}`,
            },
          }
        );

        if (!refreshData.access_token) {
          throw new Error("Refresh response did not include an access token");
        }

        localStorage.setItem(
          "konvoy_access_token",
          refreshData.access_token
        );

        const meData: ApiResponse = await request(
          ENDPOINTS.getUser(API_BASE),
          {
            headers: {
              Authorization: `Bearer ${refreshData.access_token}`,
            },
          }
        );

        if (!cancelled) {
          setUser(meData.user ?? null);
        }
      } catch (error) {
        console.error("Session restoration failed:", error);

        localStorage.removeItem("konvoy_access_token");
        localStorage.removeItem("konvoy_refresh_token");

        if (!cancelled) {
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void checkSession();

    return () => {
      cancelled = true;
    };
  }, []);

  // Request a verification code.
  const requestOtp = async (phone: string): Promise<ApiResponse> => {
    return request(ENDPOINTS.requestOtp(API_BASE), {
      method: "POST",
      body: JSON.stringify({ phone }),
    });
  };

  // Verify the code, store tokens, and return is_new_user to the UI.
  const verifyOtp = async (
    phone: string,
    code: string
  ): Promise<VerifyOtpResult> => {
    const data: ApiResponse = await request(
      ENDPOINTS.verifyOtp(API_BASE),
      {
        method: "POST",
        body: JSON.stringify({ phone, code }),
      }
    );

    if (!data.access_token || !data.refresh_token || !data.user) {
      throw new Error("The server returned an incomplete login response.");
    }

    localStorage.setItem("konvoy_access_token", data.access_token);
    localStorage.setItem("konvoy_refresh_token", data.refresh_token);

    setUser(data.user);

    return {
      ...data,
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      user: data.user,
      is_new_user: data.is_new_user === true,
    };
  };

  // Get a new access token using the refresh token.
  const refreshToken = async (): Promise<ApiResponse> => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("konvoy_refresh_token")
        : null;

    if (!token) {
      throw new Error("No refresh token available");
    }

    const data: ApiResponse = await request(ENDPOINTS.refresh(API_BASE), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!data.access_token) {
      throw new Error("The server did not return an access token.");
    }

    localStorage.setItem("konvoy_access_token", data.access_token);

    return data;
  };

  // Update the current user's profile.
  const updateUser = async (
    updatedFields: Partial<User>
  ): Promise<ApiResponse> => {
    const token = getAccessToken();

    if (!token) {
      throw new Error("Not authenticated");
    }

    const data: ApiResponse = await request(
      ENDPOINTS.updateUser(API_BASE),
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedFields),
      }
    );

    const updatedUser = data.user ?? data;

    setUser(updatedUser as User);

    return data;
  };

  // Log out locally.
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