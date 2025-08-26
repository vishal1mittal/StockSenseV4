import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Shield, Smartphone, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import AuthLayout from "./AuthLayout";

const twoFactorSchema = z.object({
    code: z.string().length(6, "Code must be 6 digits"),
});

const backupCodeSchema = z.object({
    backupCode: z.string().min(8, "Backup code is invalid"),
});

type TwoFactorData = z.infer<typeof twoFactorSchema>;
type BackupCodeData = z.infer<typeof backupCodeSchema>;

interface TwoFactorVerificationProps {
    onVerify?: (code: string, isBackupCode?: boolean) => Promise<void>;
    onBack?: () => void;
}

const TwoFactorVerification: React.FC<TwoFactorVerificationProps> = ({
    onVerify,
    onBack,
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [useBackupCode, setUseBackupCode] = useState(false);
    const { toast } = useToast();

    const {
        setValue: setTOTPValue,
        watch: watchTOTP,
        handleSubmit: handleTOTPSubmit,
        formState: { errors: totpErrors },
    } = useForm<TwoFactorData>({
        resolver: zodResolver(twoFactorSchema),
    });

    const {
        register: registerBackup,
        handleSubmit: handleBackupSubmit,
        formState: { errors: backupErrors },
    } = useForm<BackupCodeData>({
        resolver: zodResolver(backupCodeSchema),
    });

    const code = watchTOTP("code");

    const onTOTPSubmit = async (data: TwoFactorData) => {
        if (!onVerify) return;

        setIsLoading(true);
        try {
            await onVerify(data.code, false);
        } catch (error: any) {
            toast({
                title: "Verification Failed",
                description: error.message || "Invalid authentication code",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const onBackupSubmit = async (data: BackupCodeData) => {
        if (!onVerify) return;

        setIsLoading(true);
        try {
            await onVerify(data.backupCode, true);
        } catch (error: any) {
            toast({
                title: "Verification Failed",
                description: error.message || "Invalid backup code",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (useBackupCode) {
        return (
            <AuthLayout
                title="Enter backup code"
                description="Use one of your backup codes to access your account"
            >
                <form
                    onSubmit={handleBackupSubmit(onBackupSubmit)}
                    className="space-y-6"
                >
                    <div className="flex justify-center">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                            <Key className="h-8 w-8 text-primary" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="backupCode">Backup Code</Label>
                        <Input
                            id="backupCode"
                            type="text"
                            placeholder="Enter your backup code"
                            className="text-center font-mono"
                            {...registerBackup("backupCode")}
                        />
                        {backupErrors.backupCode && (
                            <p className="text-sm text-destructive text-center">
                                {backupErrors.backupCode.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-3">
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? "Verifying..." : "Verify Backup Code"}
                        </Button>

                        <Button
                            type="button"
                            variant="ghost"
                            className="w-full"
                            onClick={() => setUseBackupCode(false)}
                        >
                            Use Authenticator App Instead
                        </Button>

                        {onBack && (
                            <Button
                                type="button"
                                variant="ghost"
                                className="w-full"
                                onClick={onBack}
                            >
                                Back to Login
                            </Button>
                        )}
                    </div>
                </form>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout
            title="Two-factor authentication"
            description="Enter the 6-digit code from your authenticator app"
        >
            <form
                onSubmit={handleTOTPSubmit(onTOTPSubmit)}
                className="space-y-6"
            >
                <div className="flex justify-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                        <Shield className="h-8 w-8 text-primary" />
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-center">
                        <InputOTP
                            maxLength={6}
                            value={code}
                            onChange={(value) => setTOTPValue("code", value)}
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
                    {totpErrors.code && (
                        <p className="text-sm text-destructive text-center">
                            {totpErrors.code.message}
                        </p>
                    )}
                </div>

                <div className="space-y-3">
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading || !code || code.length !== 6}
                    >
                        {isLoading ? "Verifying..." : "Verify Code"}
                    </Button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <Separator className="w-full" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                Or
                            </span>
                        </div>
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => setUseBackupCode(true)}
                    >
                        <Key className="mr-2 h-4 w-4" />
                        Use Backup Code
                    </Button>

                    {onBack && (
                        <Button
                            type="button"
                            variant="ghost"
                            className="w-full"
                            onClick={onBack}
                        >
                            Back to Login
                        </Button>
                    )}
                </div>
            </form>
        </AuthLayout>
    );
};

export default TwoFactorVerification;
