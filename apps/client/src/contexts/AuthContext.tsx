import type { AuthResponse, Organisation } from "@flowstation/types";
import { API_VERSION } from "@flowstation/constants";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { API_BASE_URL, configureApiAuth } from "../lib/api";

interface User {
  org: Organisation;
}

interface AuthCtx {
  user: User | null;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    address: string,
  ) => Promise<void>;
  logout: () => void;
  updateUserOrg: (org: Partial<Organisation>) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthCtx>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const accessTokenRef = useRef<string | null>(null);
  const refreshTokenRef = useRef<string | null>(null);
  const refreshPromiseRef = useRef<Promise<string> | null>(null);

  const setAccessToken = useCallback((token: string | null) => {
    accessTokenRef.current = token;
    setAccessTokenState(token);
  }, []);

  const clearAuth = useCallback(() => {
    setAccessToken(null);
    refreshTokenRef.current = null;
    setUser(null);
  }, [setAccessToken]);

  const refreshAccessToken = useCallback((): Promise<string> => {
    if (refreshPromiseRef.current) return refreshPromiseRef.current;

    const pending = (async () => {
      const refreshToken = refreshTokenRef.current;
      const response = await fetch(
        `${API_BASE_URL}/api/${API_VERSION}/auth/refresh`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          signal: AbortSignal.timeout(10_000),
          ...(refreshToken ? { body: JSON.stringify({ refreshToken }) } : {}),
        },
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(
          error.error ||
            error.message ||
            "Your session has expired. Please log in again.",
        );
      }

      const data = (await response.json()) as AuthResponse;
      if (!data.accessToken || !data.organisation) {
        throw new Error("The server returned an invalid refresh response.");
      }

      setAccessToken(data.accessToken);
      refreshTokenRef.current = data.refreshToken ?? refreshToken;
      setUser({ org: data.organisation });
      return data.accessToken;
    })();

    refreshPromiseRef.current = pending;
    return pending.finally(() => {
      if (refreshPromiseRef.current === pending) {
        refreshPromiseRef.current = null;
      }
    });
  }, [setAccessToken]);

  const logout = useCallback(async () => {
    clearAuth();
    fetch(`${API_BASE_URL}/api/${API_VERSION}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    }).catch(console.error);
  }, [clearAuth]);

  useEffect(
    () =>
      configureApiAuth({
        getAccessToken: () => accessTokenRef.current,
        refreshAccessToken,
        onUnauthorized: logout,
      }),
    [logout, refreshAccessToken],
  );
  // fetch the access token and user data on mount
  useEffect(() => {
    let mounted = true;

    refreshAccessToken()
      .catch(() => {
        if (mounted) clearAuth();
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [clearAuth, refreshAccessToken]);

  function storeAuthResponse(data: AuthResponse) {
    if (!data.accessToken || !data.organisation) {
      throw new Error(
        "The server returned an invalid authentication response.",
      );
    }

    setAccessToken(data.accessToken);
    refreshTokenRef.current = data.refreshToken ?? null;
    setUser({ org: data.organisation });
  }

  async function login(email: string, password: string) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/${API_VERSION}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        },
      );
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || error.error || "Login failed");
      }
      storeAuthResponse((await response.json()) as AuthResponse);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Login failed", {
        cause: error,
      });
    }
  }

  async function register(
    name: string,
    email: string,
    password: string,
    address: string,
  ) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/${API_VERSION}/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ name, email, password, address }),
        },
      );
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || error.error || "Registration failed");
      }
      storeAuthResponse((await response.json()) as AuthResponse);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Registration failed",
        { cause: error },
      );
    }
  }

  function updateUserOrg(orgUpdate: Partial<Organisation>) {
    setUser((currentUser) =>
      currentUser ? { org: { ...currentUser.org, ...orgUpdate } } : currentUser,
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        login,
        register,
        logout,
        updateUserOrg,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
