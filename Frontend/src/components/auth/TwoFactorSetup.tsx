import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Shield, Copy, CheckCircle, Smartphone } from "lucide-react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import AuthLayout from "./AuthLayout";

const twoFactorSetupSchema = z.object({
    code: z.string().length(6, "TOTP code must be 6 digits"),
});

type TwoFactorSetupData = z.infer<typeof twoFactorSetupSchema>;

interface TwoFactorSetupProps {
    otpAuthUrl?: string;
    backupCodes?: string[];
    onVerifyAndEnable?: (code: string) => Promise<void>;
    onSkip?: () => void;
    onBack?: () => void;
}

const TwoFactorSetup: React.FC<TwoFactorSetupProps> = ({
    otpAuthUrl,
    backupCodes,
    onVerifyAndEnable,
    onSkip,
    onBack,
}) => {
    const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
    const [secret, setSecret] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [secretCopied, setSecretCopied] = useState(false);
    const [step, setStep] = useState<"setup" | "verify" | "backup-codes">(
        "setup"
    );
    const { toast } = useToast();

    const {
        setValue,
        watch,
        handleSubmit,
        formState: { errors },
    } = useForm<TwoFactorSetupData>({
        resolver: zodResolver(twoFactorSetupSchema),
    });

    const code = watch("code");

    useEffect(() => {
        if (otpAuthUrl) {
            try {
                // The URLSearchParams API can parse the secret from the otpAuthUrl
                const url = new URL(otpAuthUrl);
                const extractedSecret = url.searchParams.get("secret");
                if (extractedSecret) {
                    setSecret(extractedSecret);
                }

                QRCode.toDataURL(otpAuthUrl)
                    .then(setQrCodeUrl)
                    .catch(console.error);
            } catch (error) {
                console.error("Failed to process otpAuthUrl:", error);
            }
        }
    }, [otpAuthUrl]);

    const handleCopySecret = async () => {
        if (!secret) return;

        try {
            await navigator.clipboard.writeText(secret);
            setSecretCopied(true);
            toast({
                title: "Secret Copied",
                description: "The secret key has been copied to your clipboard",
            });
            setTimeout(() => setSecretCopied(false), 3000);
        } catch (error) {
            toast({
                title: "Copy Failed",
                description: "Failed to copy secret to clipboard",
                variant: "destructive",
            });
        }
    };

    const onSubmit = async (data: TwoFactorSetupData) => {
        if (!onVerifyAndEnable) return;

        setIsLoading(true);
        try {
            await onVerifyAndEnable(data.code);
            if (backupCodes && backupCodes.length > 0) {
                setStep("backup-codes");
            }
        } catch (error: any) {
            toast({
                title: "Verification Failed",
                description: error.message || "Invalid TOTP code",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyBackupCodes = async () => {
        if (!backupCodes) return;

        const codesText = backupCodes.join("\n");
        try {
            await navigator.clipboard.writeText(codesText);
            toast({
                title: "Backup Codes Copied",
                description: "Backup codes have been copied to your clipboard",
            });
        } catch (error) {
            toast({
                title: "Copy Failed",
                description: "Failed to copy backup codes",
                variant: "destructive",
            });
        }
    };

    if (step === "backup-codes") {
        return (
            <AuthLayout
                title="Save your backup codes"
                description="Store these codes safely - you can use them to access your account if you lose your device"
            >
                <div className="space-y-6">
                    <div className="flex justify-center">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                        </div>
                    </div>

                    <Alert>
                        <Shield className="h-4 w-4" />
                        <AlertDescription>
                            Two-factor authentication has been enabled
                            successfully! Save these backup codes in a secure
                            location.
                        </AlertDescription>
                    </Alert>

                    <div className="bg-muted p-4 rounded-lg">
                        <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                            {backupCodes?.map((code, index) => (
                                <div
                                    key={index}
                                    className="p-2 bg-background rounded border"
                                >
                                    {code}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={handleCopyBackupCodes}
                        >
                            <Copy className="mr-2 h-4 w-4" />
                            Copy Backup Codes
                        </Button>

                        <Button
                            type="button"
                            className="w-full"
                            onClick={() => {
                                // This should redirect to the main app
                                window.location.href = "/";
                            }}
                        >
                            Continue to StockSense
                        </Button>
                    </div>
                </div>
            </AuthLayout>
        );
    }

    if (step === "verify") {
        return (
            <AuthLayout
                title="Verify your authenticator"
                description="Enter the 6-digit code from your authenticator app"
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="flex justify-center">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                            <Smartphone className="h-8 w-8 text-primary" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-center">
                            <InputOTP
                                maxLength={6}
                                value={code}
                                onChange={(value) => setValue("code", value)}
                            >
                                <InputOTPGroup>
                                    <InputOTPSlot index={0} />
                                    <InputOTPSlot index={1} />
                                    <InputOTPSlot index={2} />
                                    <InputOTPSlot index={3} />
                                    <InputOTPSlot index={4} />
                                    <InputOTPSlot index={5} />
                                </InputOTPGroup>
                            </InputOTP>
                        </div>
                        {errors.code && (
                            <p className="text-sm text-destructive text-center">
                                {errors.code.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-3">
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading || !code || code.length !== 6}
                        >
                            {isLoading
                                ? "Verifying..."
                                : "Enable Two-Factor Authentication"}
                        </Button>

                        <Button
                            type="button"
                            variant="ghost"
                            className="w-full"
                            onClick={() => setStep("setup")}
                        >
                            Back to QR Code
                        </Button>
                    </div>
                </form>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout
            title="Set up two-factor authentication"
            description="Secure your account with an additional layer of protection"
        >
            <div className="space-y-6">
                <div className="flex justify-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                        <Shield className="h-8 w-8 text-primary" />
                    </div>
                </div>

                <div className="text-center space-y-2">
                    <h3 className="text-lg font-semibold">Scan QR Code</h3>
                    <p className="text-sm text-muted-foreground">
                        Use your authenticator app to scan this QR code
                    </p>
                </div>

                {qrCodeUrl && (
                    <div className="flex justify-center">
                        <div className="p-4 bg-white rounded-lg">
                            <img
                                src={qrCodeUrl}
                                alt="2FA QR Code"
                                className="w-48 h-48"
                            />
                        </div>
                    </div>
                )}

                <div className="space-y-3">
                    <p className="text-sm text-muted-foreground text-center">
                        Can't scan? Enter this secret key manually:
                    </p>
                    <div className="flex items-center space-x-2">
                        <div className="flex-1 p-3 bg-muted rounded-md text-sm font-mono break-all">
                            {secret}
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleCopySecret}
                        >
                            {secretCopied ? (
                                <CheckCircle className="h-4 w-4" />
                            ) : (
                                <Copy className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </div>

                <Alert>
                    <Smartphone className="h-4 w-4" />
                    <AlertDescription>
                        Download an authenticator app like Google Authenticator,
                        Authy, or Microsoft Authenticator to get started.
                    </AlertDescription>
                </Alert>

                <div className="space-y-3">
                    <Button
                        type="button"
                        className="w-full"
                        onClick={() => setStep("verify")}
                    >
                        I've Added the Account
                    </Button>

                    {onSkip && (
                        <Button
                            type="button"
                            variant="ghost"
                            className="w-full"
                            onClick={onSkip}
                        >
                            Skip for Now
                        </Button>
                    )}

                    {onBack && (
                        <Button
                            type="button"
                            variant="ghost"
                            className="w-full"
                            onClick={onBack}
                        >
                            Back
                        </Button>
                    )}
                </div>
            </div>
        </AuthLayout>
    );
};

export default TwoFactorSetup;
