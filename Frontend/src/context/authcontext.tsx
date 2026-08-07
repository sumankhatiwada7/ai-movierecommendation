import {
  createContext,
  useContext,
  useEffect,
  useState,
    
} from "react";
import type{ ReactNode } from "react";
import { login as loginApi, logout as logoutApi, refresh } from "../api/authapi";

interface User {
  role: string;
  id: string;
  name: string;
  email: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  login: (data: LoginData) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (data: LoginData) => {
    const response = await loginApi(data);

    setUser(response.user);
    setAccessToken(response.accessToken);
  };
 

  const logout = async () => {
    await logoutApi();
    setUser(null);
    setAccessToken(null);
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const response = await refresh();

        setUser(response.user);
        setAccessToken(response.accessToken);
      } catch {
        setUser(null);
        setAccessToken(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthContext must be used inside AuthProvider");
  }

  return context;
};