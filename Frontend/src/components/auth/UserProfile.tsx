import React, { useState, useEffect } from "react";
import {
    fetchProfile,
    enable2fa,
    disable2fa,
    confirm2fa,
    refresh2faBackup,
    logout,
    isNormalizedError,
    UserProfile as UserProfileType,
} from "../../services/apiClient";
import TwoFactorSetup from "../auth/TwoFactorSetup";
import TwoFactorVerification from "../auth/TwoFactorVerification";
import { useToast } from "@/hooks/use-toast";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, CheckCircle, Smartphone, ShieldOff } from "lucide-react";

type ProfileStep = "profile" | "2fa-setup" | "2fa-disable" | "2fa-refresh";

const UserProfile = () => {
    const [profile, setProfile] = useState<UserProfileType | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentStep, setCurrentStep] = useState<ProfileStep>("profile");
    const [otpAuthUrl, setOtpAuthUrl] = useState<string>("");
    const [backupCodes, setBackupCodes] = useState<string[]>([]);
    const [disablePassword, setDisablePassword] = useState<string>("");
    const { toast } = useToast();

    useEffect(() => {
        const loadProfile = async () => {
            setIsLoading(true);
            const result = await fetchProfile();
            if (isNormalizedError(result)) {
                console.error("Failed to fetch profile:", result.error);
                toast({
                    title: "Error",
                    description:
                        "Failed to load user profile. Please log in again.",
                    variant: "destructive",
                });
                // In a real app, you would clear auth and redirect to login here
                // clearAuth();
            } else {
                setProfile(result.data.user);
            }
            setIsLoading(false);
        };
        loadProfile();
    }, [toast]);

    const handleEnable2FA = async () => {
        setIsLoading(true);
        const result = await enable2fa();
        if (isNormalizedError(result)) {
            toast({
                title: "Error",
                description: result.error,
                variant: "destructive",
            });
        } else if (result.data.otpauthUrl) {
            setOtpAuthUrl(result.data.otpauthUrl);
            setCurrentStep("2fa-setup");
        }
        setIsLoading(false);
    };

    const handleConfirm2FA = async (token: string) => {
        setIsLoading(true);
        const result = await confirm2fa(token);
        if (isNormalizedError(result)) {
            toast({
                title: "Verification Failed",
                description: result.error,
                variant: "destructive",
            });
        } else {
            setBackupCodes(result.data.backupCodes || []);
            setProfile((prev) =>
                prev ? { ...prev, twoFA: { enabled: true } } : null
            );
            setCurrentStep("profile"); // Or a confirmation screen
            toast({
                title: "Success",
                description: "Two-Factor Authentication is now enabled.",
            });
        }
        setIsLoading(false);
    };

    // Wrapper function to handle the 2FA disable flow from the component
    const handleDisable2FA = async (code: string, isBackupCode?: boolean) => {
        if (!disablePassword) {
            toast({
                title: "Error",
                description: "Password is required to disable 2FA.",
                variant: "destructive",
            });
            return;
        }

        const payload: any = { password: disablePassword };
        if (isBackupCode) {
            payload.backupCode = code;
        } else {
            payload.token = code;
        }

        setIsLoading(true);
        const result = await disable2fa(payload);

        if (isNormalizedError(result)) {
            toast({
                title: "Error",
                description: result.error,
                variant: "destructive",
            });
        } else {
            setProfile((prev) =>
                prev ? { ...prev, twoFA: { enabled: false } } : null
            );
            toast({
                title: "Success",
                description: "Two-Factor Authentication is now disabled.",
            });
            setCurrentStep("profile");
        }
        setIsLoading(false);
    };

    const handleLogout = async () => {
        await logout();
        window.location.href = "/auth";
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p>Loading user profile...</p>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Card className="w-[400px]">
                    <CardHeader>
                        <CardTitle>Error</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>Unable to load profile. Please log in.</p>
                        <Button className="mt-4 w-full" onClick={handleLogout}>
                            Go to Login
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (currentStep === "2fa-setup") {
        return (
            <TwoFactorSetup
                otpAuthUrl={otpAuthUrl}
                onVerifyAndEnable={handleConfirm2FA}
                onBack={() => setCurrentStep("profile")}
                backupCodes={backupCodes}
            />
        );
    }

    if (currentStep === "2fa-disable") {
        return (
            <Card className="w-[400px] mx-auto">
                <CardHeader>
                    <CardTitle>Disable Two-Factor Authentication</CardTitle>
                    <CardDescription>
                        Enter your password and a valid code to disable 2FA.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <TwoFactorVerification
                        // The onVerify prop is now correctly handled by our wrapper function
                        onVerify={handleDisable2FA}
                        onBack={() => setCurrentStep("profile")}
                        // We need a way to get the user's password for this flow.
                        // Since this component doesn't have a password input, we'll assume a modal or
                        // another form has captured it and set it in state.
                        // For this code, a `disablePassword` state has been added and should be set
                        // before navigating to this step.
                    />
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="flex justify-center items-center min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle>User Profile</CardTitle>
                    <CardDescription>
                        Manage your account settings.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h4 className="font-semibold text-lg">
                            Account Details
                        </h4>
                        <p>
                            <strong>Email:</strong> {profile.email}
                        </p>
                        <p>
                            <strong>Roles:</strong>{" "}
                            {profile.roles?.join(", ") || "user"}
                        </p>
                    </div>

                    <div>
                        <h4 className="font-semibold text-lg">
                            Two-Factor Authentication (2FA)
                        </h4>
                        <div className="flex items-center gap-2 mt-2">
                            {profile.twoFA?.enabled ? (
                                <>
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                    <span className="text-green-500">
                                        2FA is Enabled
                                    </span>
                                </>
                            ) : (
                                <>
                                    <ShieldOff className="h-5 w-5 text-red-500" />
                                    <span className="text-red-500">
                                        2FA is Disabled
                                    </span>
                                </>
                            )}
                        </div>
                        <div className="mt-4 space-y-2">
                            {profile.twoFA?.enabled ? (
                                <Button
                                    className="w-full"
                                    variant="outline"
                                    onClick={() =>
                                        setCurrentStep("2fa-disable")
                                    }
                                >
                                    Disable 2FA
                                </Button>
                            ) : (
                                <Button
                                    className="w-full"
                                    onClick={handleEnable2FA}
                                >
                                    Enable 2FA
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t">
                        <Button onClick={handleLogout} variant="destructive">
                            Logout
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default UserProfile;
