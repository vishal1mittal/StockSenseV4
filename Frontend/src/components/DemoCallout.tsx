import React from "react";
import { Link } from "react-router-dom";
import { LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DemoCalloutProps {
    onLoginAsDemo: () => void;
}

const DemoCallout: React.FC<DemoCalloutProps> = ({ onLoginAsDemo }) => {
    return (
        <div className="bg-blue-600/20 rounded-xl p-8 border border-blue-600 text-center space-y-4 shadow-xl mb-8">
            <div className="space-y-2">
                <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                    You're viewing a sample of our data.
                </h3>
                <p className="text-base text-gray-200 leading-relaxed max-w-2xl mx-auto">
                    This is a sneak peek to help you get a feel for our system.
                    For live, real-time stock data and full access to our
                    features, you can either log in as a demo user or register
                    for your own account to experience our state-of-the-art
                    security system.
                </p>
            </div>
            <div className="flex flex-col md:flex-row justify-center items-center gap-4">
                <Button
                    onClick={onLoginAsDemo}
                    className="w-full md:w-auto bg-white text-blue-600 hover:bg-gray-200 transition-colors"
                >
                    <LogIn className="mr-2 h-4 w-4" />
                    Log In as Demo User
                </Button>
                <Link to="/auth">
                    <Button
                        variant="ghost"
                        className="w-full md:w-auto text-white hover:bg-white/10"
                    >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Register
                    </Button>
                </Link>
            </div>
        </div>
    );
};

export default DemoCallout;
