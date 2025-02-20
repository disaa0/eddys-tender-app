import React, { createContext, useState, useEffect, useContext } from 'react';
import AuthService from '../api/AuthService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [userToken, setUserToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadToken = async () => {
            const token = await AuthService.getToken();
            setUserToken(token);
            setIsLoading(false);
        };
        loadToken();
    }, []);

    const login = async (userData) => {
        const response = await AuthService.login(userData);
        if (response.token) {
            setUserToken(response.token);
        }
    };

    const logout = async () => {
        await AuthService.logout();
        setUserToken(null);
    };

    return (
        <AuthContext.Provider value={{ userToken, isAuthenticated: !!userToken, login, logout, isLoading }}>
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
