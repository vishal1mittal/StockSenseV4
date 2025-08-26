import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import AuthLayout from "./AuthLayout";

const otpSchema = z.object({
    code: z.string().length(6, "OTP must be 6 digits"),
});

type OTPFormData = z.infer<typeof otpSchema>;

interface OTPVerificationProps {
    email?: string;
    onVerify?: (code: string) => Promise<void>;
    onResendOTP?: () => Promise<void>;
    onBack?: () => void;
}

const OTPVerification: React.FC<OTPVerificationProps> = ({
    email,
    onVerify,
    onResendOTP,
    onBack,
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [timeLeft, setTimeLeft] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const { toast } = useToast();

    const {
        setValue,
        watch,
        handleSubmit,
        formState: { errors },
    } = useForm<OTPFormData>({
        resolver: zodResolver(otpSchema),
    });

    const code = watch("code");

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [timeLeft]);

    const onSubmit = async (data: OTPFormData) => {
        if (!onVerify) return;

        setIsLoading(true);
        try {
            await onVerify(data.code);
        } catch (error: any) {
            toast({
                title: "Verification Failed",
                description: error.message || "Invalid OTP code",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (!onResendOTP || !canResend) return;

        setIsResending(true);
        try {
            await onResendOTP();
            setTimeLeft(60);
            setCanResend(false);
            toast({
                title: "OTP Sent",
                description:
                    "A new verification code has been sent to your email",
            });
        } catch (error: any) {
            toast({
                title: "Failed to Resend",
                description: error.message || "Failed to resend OTP",
                variant: "destructive",
            });
        } finally {
            setIsResending(false);
        }
    };

    return (
        <AuthLayout
            title="Verify your email"
            description={`We've sent a 6-digit verification code to ${
                email || "your email"
            }`}
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="flex justify-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                        <Mail className="h-8 w-8 text-primary" />
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

                <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading || !code || code.length !== 6}
                >
                    {isLoading ? "Verifying..." : "Verify Email"}
                </Button>

                <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">
                        Didn't receive the code?
                    </p>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleResendOTP}
                        disabled={!canResend || isResending}
                        className="text-primary hover:text-primary/80"
                    >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        {isResending
                            ? "Sending..."
                            : canResend
                            ? "Resend code"
                            : `Resend in ${timeLeft}s`}
                    </Button>

                    {onBack && (
                        <div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={onBack}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                Back to previous step
                            </Button>
                        </div>
                    )}
                </div>
            </form>
        </AuthLayout>
    );
};

export default OTPVerification;
