import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import OTPVerification from "./OTPVerification";
import TwoFactorSetup from "./TwoFactorSetup";
import TwoFactorVerification from "./TwoFactorVerification";
import {
    setTokens,
    login,
    register,
    verifyEmail,
    resendEmailOTP,
    enable2fa,
    confirm2fa,
    disable2fa,
    isNormalizedError,
} from "../../services/apiClient";

type AuthStep =
    | "login"
    | "register"
    | "otp-verification"
    | "2fa-setup"
    | "2fa-verification";

interface AuthData {
    email?: string;
    password?: string;
    fullName?: string;
    otpAuthUrl?: string; // Updated to store the URI string
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
    apiBaseUrl = import.meta.env.VITE_API_BASE_URL,
}) => {
    const [currentStep, setCurrentStep] = useState<AuthStep>(initialStep);
    const [authData, setAuthData] = useState<AuthData>({});
    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        const accessToken = searchParams.get("accessToken");
        const refreshToken = searchParams.get("refreshToken");
        const sessionId = searchParams.get("sessionId");

        if (accessToken && refreshToken && sessionId) {
            setTokens({ accessToken, refreshToken, sessionId });
            onAuthSuccess?.({ sessionId });

            searchParams.delete("accessToken");
            searchParams.delete("refreshToken");
            searchParams.delete("sessionId");
            setSearchParams(searchParams, { replace: true });
        }
    }, [searchParams, setSearchParams, onAuthSuccess]);

    const handleLogin = async (data: {
        email: string;
        password: string;
        token?: string;
        backupCode?: string;
    }) => {
        const result = await login(data);

        if (isNormalizedError(result)) {
            if (
                result.status === 401 &&
                result.error === "2FA required or invalid"
            ) {
                setAuthData({ email: data.email, password: data.password });
                setCurrentStep("2fa-verification");
                throw new Error(result.error);
            }
            throw new Error(result.error || "Login failed");
        }

        onAuthSuccess?.({ sessionId: result.data.sessionId });
    };

    const handleRegister = async (data: {
        fullName: string;
        email: string;
        password: string;
    }) => {
        const result = await register(data.email, data.password);

        if (isNormalizedError(result)) {
            throw new Error(result.error || "Registration failed");
        }

        setAuthData({ email: data.email, fullName: data.fullName });
        setCurrentStep("otp-verification");
    };

    const handleGoogleAuth = async () => {
        window.location.href = `${apiBaseUrl}/auth/google`;
    };

    const handleOTPVerification = async (otp: string) => {
        const result = await verifyEmail(authData.email as string, otp);

        if (isNormalizedError(result)) {
            throw new Error(result.error || "Verification failed");
        }
        onAuthSuccess?.({ email: authData.email });
    };

    const handleResendOTP = async () => {
        const result = await resendEmailOTP(authData.email as string);

        if (isNormalizedError(result)) {
            throw new Error(result.error || "Failed to resend OTP");
        }
    };

    const start2FASetup = async () => {
        const result = await enable2fa();
        if (isNormalizedError(result)) {
            throw new Error(result.error);
        }
        setAuthData({ ...authData, otpAuthUrl: result.data.otpauthUrl });
        setCurrentStep("2fa-setup");
    };

    const handle2FAVerification = async (
        code: string,
        isBackupCode = false
    ) => {
        const { email, password } = authData;
        if (!email || !password) {
            throw new Error("Email and password missing for 2FA verification.");
        }
        const loginPayload: any = { email, password };
        if (isBackupCode) {
            loginPayload.backupCode = code;
        } else {
            loginPayload.token = code;
        }
        try {
            await handleLogin(loginPayload);
        } catch (error) {
            throw error;
        }
    };

    const handle2FAConfirm = async (code: string) => {
        const result = await confirm2fa(code);
        if (isNormalizedError(result)) {
            throw new Error(result.error);
        }
        setAuthData({ ...authData, backupCodes: result.data.backupCodes });
        onAuthSuccess?.({});
    };

    const handle2FADisable = async (
        password: string,
        token?: string,
        backupCode?: string
    ) => {
        const result = await disable2fa({ password, token, backupCode });
        if (isNormalizedError(result)) {
            throw new Error(result.error);
        }
        onAuthSuccess?.({});
    };

    const handle2FASkip = () => {
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
                    otpAuthUrl={authData.otpAuthUrl}
                    backupCodes={authData.backupCodes}
                    onVerifyAndEnable={handle2FAConfirm}
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
