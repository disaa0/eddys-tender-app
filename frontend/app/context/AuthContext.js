import React, { createContext, useState, useEffect, useContext } from 'react';
import AuthService from '../api/AuthService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [userToken, setUserToken] = useState(null);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        loadStoredAuth();
    }, []);

    const loadStoredAuth = async () => {
        try {
            const [token, storedUser] = await Promise.all([
                AuthService.getToken(),
                AuthService.getUser(),
            ]);

            if (token && storedUser) {
                setUserToken(token);
                setUser(storedUser);
            }
        } catch (error) {
            console.error('Error loading auth state:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (credentials) => {
        try {
            const response = await AuthService.login(credentials);
            setUserToken(response.token);
            setUser(response.user);
            response.user.idUserType === 1 ? setIsAdmin(true) : setIsAdmin(false);
            return true;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await AuthService.logout();
            setUserToken(null);
            setUser(null);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                userToken,
                user,
                isAuthenticated: !!userToken,
                login,
                logout,
                isLoading,
                isAdmin,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// Hook personalizado para usar el contexto
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth debe usarse dentro de un AuthProvider");
    }
    return context;
};
