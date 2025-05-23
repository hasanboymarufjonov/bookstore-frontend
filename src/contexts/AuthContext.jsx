import {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import { apiService } from "../services/apiService";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const loadUserFromToken = useCallback(async () => {
    setIsLoading(true);
    const storedToken = localStorage.getItem("authToken");
    if (storedToken) {
      setToken(storedToken);
      try {
        const profile = await apiService.getProfile();
        setUser(profile);
      } catch (error) {
        console.error("AuthProvider: Failed to load user from token", error);
        localStorage.removeItem("authToken");
        setToken(null);
        setUser(null);
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadUserFromToken();
  }, [loadUserFromToken]);

  const login = async (email, password) => {
    setAuthError(null);
    setIsLoading(true);
    try {
      const data = await apiService.login({ email, password });
      if (data.accessToken) {
        localStorage.setItem("authToken", data.accessToken);
        setToken(data.accessToken);
        const profile = await apiService.getProfile();
        setUser(profile);
        setIsLoading(false);
        return true;
      }
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error("AuthProvider: Login failed", error);
      setAuthError(error.data?.message || "Login failed.");
      setIsLoading(false);
      return false;
    }
  };
  const signup = async (email, password) => {
    setAuthError(null);
    setIsLoading(true);
    try {
      await apiService.signup({ email, password });
      const loginSuccess = await login(email, password);
      setIsLoading(false);
      return loginSuccess;
    } catch (error) {
      console.error("AuthProvider: Signup failed", error);
      setAuthError(error.data?.message || "Signup failed.");
      setIsLoading(false);
      return false;
    }
  };
  const logout = () => {
    localStorage.removeItem("authToken");
    setToken(null);
    setUser(null);
    setAuthError(null);
  };
  const value = {
    user,
    token,
    isAuthenticated: !!token,
    isLoading,
    login,
    signup,
    logout,
    authError,
    setAuthError,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
export const useAuth = () => useContext(AuthContext);
