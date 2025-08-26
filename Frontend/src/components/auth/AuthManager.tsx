import React, { useState } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import OTPVerification from "./OTPVerification";
import TwoFactorSetup from "./TwoFactorSetup";
import TwoFactorVerification from "./TwoFactorVerification";

type AuthStep =
    | "login"
    | "register"
    | "otp-verification"
    | "2fa-setup"
    | "2fa-verification";

interface AuthData {
    email?: string;
    fullName?: string;
    twoFactorSecret?: string;
    qrCodeData?: string;
    backupCodes?: string[];
}

interface AuthManagerProps {
    initialStep?: AuthStep;
    onAuthSuccess?: (user: any) => void;
    apiBaseUrl?: string;
}

const AuthManager: React.FC<AuthManagerProps> = ({
    initialStep = "login",
    onAuthSuccess,
    apiBaseUrl = "https://api.stocksense.com",
}) => {
    const [currentStep, setCurrentStep] = useState<AuthStep>(initialStep);
    const [authData, setAuthData] = useState<AuthData>({});

    // API call functions - replace these with your actual API endpoints
    const handleLogin = async (data: { email: string; password: string }) => {
        const response = await fetch(`${apiBaseUrl}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            if (error.code === "2FA_REQUIRED") {
                setAuthData({ email: data.email });
                setCurrentStep("2fa-verification");
                throw new Error("2FA_REQUIRED");
            }
            throw new Error(error.message || "Login failed");
        }

        const result = await response.json();
        onAuthSuccess?.(result.user);
    };

    const handleRegister = async (data: {
        fullName: string;
        email: string;
        password: string;
    }) => {
        const response = await fetch(`${apiBaseUrl}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Registration failed");
        }

        setAuthData({ email: data.email, fullName: data.fullName });
        setCurrentStep("otp-verification");
    };

    const handleGoogleAuth = async () => {
        // Redirect to Google OAuth endpoint
        window.location.href = `${apiBaseUrl}/auth/google`;
    };

    const handleOTPVerification = async (code: string) => {
        const response = await fetch(`${apiBaseUrl}/auth/verify-email`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: authData.email, code }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Verification failed");
        }

        const result = await response.json();

        // Check if 2FA setup is required
        if (result.setup2FA) {
            setAuthData({
                ...authData,
                twoFactorSecret: result.secret,
                qrCodeData: result.qrCodeData,
                backupCodes: result.backupCodes,
            });
            setCurrentStep("2fa-setup");
        } else {
            onAuthSuccess?.(result.user);
        }
    };

    const handleResendOTP = async () => {
        const response = await fetch(`${apiBaseUrl}/auth/resend-otp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: authData.email }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to resend OTP");
        }
    };

    const handle2FASetup = async (code: string) => {
        const response = await fetch(`${apiBaseUrl}/auth/setup-2fa`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: authData.email,
                secret: authData.twoFactorSecret,
                code,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "2FA setup failed");
        }

        const result = await response.json();
        onAuthSuccess?.(result.user);
    };

    const handle2FAVerification = async (
        code: string,
        isBackupCode = false
    ) => {
        const response = await fetch(`${apiBaseUrl}/auth/verify-2fa`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: authData.email,
                code,
                isBackupCode,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "2FA verification failed");
        }

        const result = await response.json();
        onAuthSuccess?.(result.user);
    };

    const handle2FASkip = () => {
        // For now, just redirect to success - in production, you might want to
        // mark the user as having skipped 2FA setup
        onAuthSuccess?.({ email: authData.email });
    };

    switch (currentStep) {
        case "register":
            return (
                <RegisterForm
                    onRegister={handleRegister}
                    onGoogleRegister={handleGoogleAuth}
                    onSwitchToLogin={() => setCurrentStep("login")}
                />
            );

        case "otp-verification":
            return (
                <OTPVerification
                    email={authData.email}
                    onVerify={handleOTPVerification}
                    onResendOTP={handleResendOTP}
                    onBack={() => setCurrentStep("register")}
                />
            );

        case "2fa-setup":
            return (
                <TwoFactorSetup
                    secret={authData.twoFactorSecret}
                    qrCodeData={authData.qrCodeData}
                    backupCodes={authData.backupCodes}
                    onVerifyAndEnable={handle2FASetup}
                    onSkip={handle2FASkip}
                    onBack={() => setCurrentStep("otp-verification")}
                />
            );

        case "2fa-verification":
            return (
                <TwoFactorVerification
                    onVerify={handle2FAVerification}
                    onBack={() => setCurrentStep("login")}
                />
            );

        default:
            return (
                <LoginForm
                    onLogin={handleLogin}
                    onGoogleLogin={handleGoogleAuth}
                    onSwitchToRegister={() => setCurrentStep("register")}
                    onForgotPassword={() => {
                        // Handle forgot password - could be another step
                        console.log("Forgot password clicked");
                    }}
                    onTwoFactorRequired={() =>
                        setCurrentStep("2fa-verification")
                    }
                />
            );
    }
};

export default AuthManager;
