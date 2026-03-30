// authContext.jsx - Global authentication state management
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { register, login, logout, checkAuth, resetPassword } from "../api/authApi";

// Create auth context for sharing auth state across components
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // Initialize user and token from localStorage
    const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || null);
    const [token, setToken] = useState(localStorage.getItem("token") || null); // Token is stored in httpOnly cookie, but we keep a flag in localStorage for client-side checks
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Save user data to state and localStorage
    const saveAuthData = useCallback((userData) => {
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        // Token is stored in httpOnly cookie by backend
        const tokenFromStorage = localStorage.getItem("token");
        if (tokenFromStorage) {
            setToken(tokenFromStorage);
        }
    }, []);

    // Clear all auth data on logout
    const clearAuthData = useCallback(() => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
    }, []);

    // Check if user is authenticated on app load
    useEffect(() => {
        const checkUser = async () => {
            const token = localStorage.getItem("token");
            if (token) {
                const result = await checkAuth();
                if (result.success && result.authenticated) {
                    saveAuthData(result.data);
                } else {
                    setError(result.message || "Authentication check failed");
                    clearAuthData();
                }
            }
            setLoading(false);
        };
        checkUser();
    }, [saveAuthData, clearAuthData]);

    // Connect/disconnect socket based on token
    // useEffect(() => {
    //     if (token) {
    //         connectSocket(token);
    //     }
    //     return () => {
    //         if (!token) {
    //             disconnectSocket();
    //         }
    //     };
    // }, [token]);

    // Handle user login
    const handleLogin = useCallback(async (credentials) => {
        const result = await login(credentials);
        if (result.success) {
            localStorage.setItem("token", "cookie-auth");
            setToken("cookie-auth");
            saveAuthData(result.data);
        }else {
            setError(result.message || "Login failed");
        }
        return result;
    }, [saveAuthData]);

    // Refresh user data from server
    const refreshUser = useCallback(async () => {
        const result = await checkAuth();
        if (result.success && result.authenticated) {
            saveAuthData(result.data);
            return { success: true, data: result.data };
        } else {
            setError(result.message || "Authentication check failed");
            clearAuthData();
            return { success: false };
        }
    }, [saveAuthData, clearAuthData]);

    // Handle new user registration
    const handleRegister = useCallback(async (credentials) => {
        const result = await register(credentials);
        if (result.success) {
            localStorage.setItem("token", "cookie-auth");
            setToken("cookie-auth");
            saveAuthData(result.data);
        }else{
            setError(result.message || "Registration failed");
        }
        return result;
    }, [saveAuthData]);

    // Handle user logout
    const handleLogout = useCallback(async () => {
        const result = await logout();
        clearAuthData();
        return result;
    }, [clearAuthData]);

    // Handle password reset
    const handleResetPassword = useCallback(async (passwordData) => {
        const result = await resetPassword(passwordData);
        if (!result.success) {
            setError(result.message || "Password reset failed");
        }
        return result;
    }, []);

    // Memoize provider value to avoid re-rendering all consumers on every parent render.
    const authValue = useMemo(() => ({
        user,
        token,
        loading,
        isAuthenticated: !!user,
        handleLogin,
        handleRegister,
        handleLogout,
        handleResetPassword,
        refreshUser
    }), [user, token, loading, handleLogin, handleRegister, handleLogout, handleResetPassword, refreshUser]);

    // Provide auth state and functions to children
    return (
        <AuthContext.Provider value={authValue}>
            {/* Only render children after loading is complete */}
            {!loading && children}
        </AuthContext.Provider>
    );
};

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);