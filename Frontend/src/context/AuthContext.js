// 📂 Frontend/src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    // Store tokens + session info
    const [auth, setAuth] = useState({
        accessToken: null,
        refreshToken: null,
        opaqueToken: null,
        sessionId: null,
        user: null,
    });

    // 🟢 On first load, restore from localStorage
    useEffect(() => {
        const storedAuth = localStorage.getItem("auth");
        if (storedAuth) {
            setAuth(JSON.parse(storedAuth));
        }
    }, []);

    // 🟢 Keep localStorage in sync whenever auth changes
    useEffect(() => {
        if (auth.accessToken) {
            localStorage.setItem("auth", JSON.stringify(auth));
        } else {
            localStorage.removeItem("auth");
        }
    }, [auth]);

    // 🔑 Login — save tokens + user
    const login = ({
        accessToken,
        refreshToken,
        opaqueToken,
        sessionId,
        user,
    }) => {
        setAuth({ accessToken, refreshToken, opaqueToken, sessionId, user });
    };

    // 🔑 Logout — clear everything
    const logout = () => {
        setAuth({
            accessToken: null,
            refreshToken: null,
            opaqueToken: null,
            sessionId: null,
            user: null,
        });
        localStorage.removeItem("auth");
    };

    // 🔄 Update access token only (used after refresh)
    const updateAccessToken = (newAccessToken) => {
        setAuth((prev) => ({ ...prev, accessToken: newAccessToken }));
    };

    return (
        <AuthContext.Provider
            value={{ auth, login, logout, updateAccessToken }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// 🔧 Hook for easy use
export const useAuth = () => useContext(AuthContext);
