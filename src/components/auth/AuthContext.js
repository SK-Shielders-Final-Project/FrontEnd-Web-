import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; // Assuming jwt-decode is installed

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                if (decodedToken.exp * 1000 < Date.now()) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('userId');
                    setIsLoggedIn(false);
                    setUserId(null);
                } else {
                    setIsLoggedIn(true);
                    setUserId(localStorage.getItem('userId'));
                }
            } catch (e) {
                localStorage.removeItem('token');
                localStorage.removeItem('userId');
                setIsLoggedIn(false);
                setUserId(null);
            }
        }
        setLoading(false);
    }, []);

    const value = {
        isLoggedIn,
        setIsLoggedIn,
        userId,
        setUserId,
        loading
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
