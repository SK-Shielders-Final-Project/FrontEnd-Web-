import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { logoutUser } from '../../auth/authUtils';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUserId = localStorage.getItem('userId');
        if (token && storedUserId) {
            setIsLoggedIn(true);
            setUserId(storedUserId);
        }
        setLoading(false);
    }, []);

    const login = useCallback((token, refreshToken, id) => {
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('userId', id);
        setIsLoggedIn(true);
        setUserId(id);
    }, []);

    const logout = useCallback(() => {
        logoutUser();
    }, []);


    const value = {
        isLoggedIn,
        userId,
        loading,
        login,
        logout
    };

    return React.createElement(AuthContext.Provider, { value }, children);
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
