import React from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface AuthLayoutProps {
    title: string;
    description: string;
    children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
    title,
    description,
    children,
}) => {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center space-x-2 mb-4">
                        <TrendingUp className="h-8 w-8 text-primary" />
                        <span className="text-2xl font-bold text-foreground">
                            StockSense
                        </span>
                    </div>
                </div>

                <Card>
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl text-center">
                            {title}
                        </CardTitle>
                        <CardDescription className="text-center">
                            {description}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>{children}</CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AuthLayout;
