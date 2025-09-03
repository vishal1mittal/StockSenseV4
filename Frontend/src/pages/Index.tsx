import React, { useState, useEffect } from "react";
import {
    Search,
    TrendingUp,
    BarChart3,
    FileText,
    Calendar,
    Brain,
    Shield,
    Home,
    User,
    LogIn,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import StockDashboard from "../components/StockDashboard";
import Hero from "../components/Hero";
import {
    isAuthenticated,
    subscribeAuth,
    loginAsDemo,
} from "../services/apiClient";

const Index = () => {
    const { symbol } = useParams();
    const [selectedStock, setSelectedStock] = useState<string | null>(
        symbol || null
    );
    const [currentView, setCurrentView] = useState<"home" | "dashboard">(
        symbol ? "dashboard" : "home"
    );
    const [isAuth, setIsAuth] = useState(isAuthenticated());

    useEffect(() => {
        const unsubscribe = subscribeAuth(() => {
            setIsAuth(isAuthenticated());
        });
        return () => unsubscribe();
    }, []);

    const handleStockSelect = (stock: string) => {
        setSelectedStock(stock);
        setCurrentView("dashboard");
    };

    const handleHomeClick = () => {
        setCurrentView("home");
        setSelectedStock(null);
    };

    const handleAuthRedirect = () => {
        localStorage.setItem("stocksense_return_url", window.location.pathname);
    };

    const handleLoginAsDemo = () => {
        localStorage.setItem("stocksense_return_url", window.location.pathname);
        loginAsDemo();
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Navigation Header */}
            <nav className="bg-gray-800 border-b border-gray-700 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <img
                            src="/favicon.ico"
                            alt="StockSense Logo"
                            className="h-12 w-12 "
                        />
                        <span className="text-2xl font-bold text-blue-400">
                            StockSense
                        </span>

                        <button
                            onClick={handleHomeClick}
                            className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                                currentView === "home"
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-300 hover:text-white hover:bg-gray-700"
                            }`}
                        >
                            <Home className="h-4 w-4" />
                            <span>Home</span>
                        </button>
                    </div>

                    <div className="flex-1 max-w-2xl mx-8">
                        <SearchBar onStockSelect={handleStockSelect} />
                    </div>

                    <div>
                        <Link
                            to={isAuth ? "/profile" : "/auth"}
                            onClick={!isAuth ? handleAuthRedirect : undefined}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background h-10 py-2 px-4 bg-blue-600 text-white hover:bg-blue-700"
                        >
                            {isAuth ? (
                                <User className="mr-2 h-4 w-4" />
                            ) : (
                                <LogIn className="mr-2 h-4 w-4" />
                            )}
                            <span>{isAuth ? "Profile" : "Login"}</span>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                {currentView === "home" ? (
                    <Hero onStockSelect={handleStockSelect} />
                ) : (
                    <StockDashboard
                        selectedStock={selectedStock}
                        onLoginAsDemo={handleLoginAsDemo}
                    />
                )}
            </main>
        </div>
    );
};

export default Index;
