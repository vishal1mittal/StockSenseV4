import React from "react";
import AuthManager from "@/components/auth/AuthManager";

const AuthDemo = () => {
    const handleAuthSuccess = (user: any) => {
        console.log("Authentication successful:", user);
        // Redirect to main app or update app state
        // For demo purposes, just reload to home
        window.location.href = "/";
    };

    return (
        <AuthManager
            initialStep="login" // Can be 'login', 'register', 'otp-verification', '2fa-setup', '2fa-verification'
            onAuthSuccess={handleAuthSuccess}
            apiBaseUrl={import.meta.env.VITE_API_BASE_URL} // Your API base URL
        />
    );
};

export default AuthDemo;
