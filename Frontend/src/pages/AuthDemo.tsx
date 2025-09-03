import React from "react";
import AuthManager from "@/components/auth/AuthManager";
import { handleLoginRedirect } from "@/services/apiClient";

const AuthDemo = () => {
    const handleAuthSuccess = () => {
        console.log("Authentication successful, redirecting...");
        handleLoginRedirect();
    };

    return (
        <div className="flex justify-center items-center min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
            <AuthManager
                initialStep="login"
                onAuthSuccess={handleAuthSuccess}
                apiBaseUrl={import.meta.env.VITE_API_BASE_URL}
            />
        </div>
    );
};

export default AuthDemo;
