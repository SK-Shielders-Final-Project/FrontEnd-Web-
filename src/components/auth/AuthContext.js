import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { logoutUser } from '../../auth/authUtils';
import { getCookie, setCookie, removeCookie } from '../../utils/cookie';


const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = getCookie('token');
        const storedUserId = getCookie('userId');
        if (token && storedUserId) {
            setIsLoggedIn(true);
            setUserId(storedUserId);
        }
        setLoading(false);
    }, []);

    const login = useCallback((token, refreshToken, id) => {
        setCookie('token', token, 1); // 1 day expiry
        setCookie('refreshToken', refreshToken, 7); // 7 days expiry
        setCookie('userId', id, 1); // 1 day expiry
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
