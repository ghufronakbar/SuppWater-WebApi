import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import api from "@/config/api";
import { Api } from "@/models/Api";
import { User } from "@prisma/client";

export type UserWithToken = User & { accessToken: string };

interface AuthContextType {
  user: UserWithToken | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  updateUser: (user: UserWithToken) => void;
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
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<UserWithToken | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkAuth = async () => {
    try {
      const token = Cookies.get("accessToken");
      if (!token) {
        setLoading(false);
        return;
      }

      // Try to get user info based on current route
      let endpoint = "/user/account/auth";
      if (router.pathname.startsWith("/admin")) {
        endpoint = "/admin/account/auth";
      } else if (router.pathname.startsWith("/seller")) {
        endpoint = "/seller/account/auth";
      }

      const { data } = await api.get<Api<UserWithToken>>(endpoint);
      setUser(data.data);
    } catch (error) {
      console.error("Auth check failed:", error);
      Cookies.remove("accessToken");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { data } = await api.post("/login", { email, password });
      const { accessToken, ...userData } = data.data;

      Cookies.set("accessToken", accessToken);
      setUser(userData);

      // Redirect based on role
      if (userData.role === "Admin") {
        router.push("/admin/dashboard");
      } else if (userData.role === "Seller") {
        router.push("/seller/dashboard");
      } else {
        router.push("/user/dashboard");
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    Cookies.remove("accessToken");
    setUser(null);
    router.push("/login");
  };

  useEffect(() => {
    checkAuth();
  }, [router.pathname]);

  const updateUser = (user: UserWithToken) => {
    Cookies.set("accessToken", user.accessToken);
    setUser(user);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, checkAuth, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};
