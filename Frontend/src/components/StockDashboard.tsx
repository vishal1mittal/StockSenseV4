import React from "react";
import { useStockData } from "../hooks/useStockData";
import { hasData } from "../services/stockService";
import StockOverview from "./dashboard/StockOverview";
import HistoricalPerformance from "./dashboard/HistoricalPerformance";
import RiskAnalysis from "./dashboard/RiskAnalysis";
import NewsSection from "./dashboard/NewsSection";
import TechnicalLevels from "./dashboard/TechnicalLevels";
import AIPredictions from "./dashboard/AIPredictions";
import FinancialDocuments from "./dashboard/FinancialDocuments";
import { Loader2 } from "lucide-react";

interface StockDashboardProps {
    selectedStock: string | null;
}

const StockDashboard: React.FC<StockDashboardProps> = ({ selectedStock }) => {
    const { data, loading, error } = useStockData(selectedStock);

    if (!selectedStock) {
        return (
            <div className="text-center py-16">
                <p className="text-gray-400 text-lg">
                    Search for a stock to view detailed analysis
                </p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="text-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-blue-400 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">Loading stock data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-16">
                <p className="text-red-400 text-lg mb-2">
                    Error loading stock data
                </p>
                <p className="text-gray-400">{error}</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="text-center py-16">
                <p className="text-gray-400 text-lg">
                    No data available for {selectedStock}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Stock Overview - Always show if we have basic data */}
            {hasData(data.overview) && (
                <StockOverview
                    data={data.overview}
                    symbol={data.symbol}
                    companyName={data.companyName}
                />
            )}

            {/* Historical Performance */}
            {hasData(data.historicalPerformance) && (
                <HistoricalPerformance
                    data={data.historicalPerformance}
                    symbol={data.symbol}
                    currency={data.currency}
                />
            )}

            {/* Main Dashboard Grid */}
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-8">
                    {hasData(data.riskAnalysis) && (
                        <RiskAnalysis
                            data={data.riskAnalysis}
                            symbol={data.symbol}
                        />
                    )}
                    {hasData(data.technicalLevels) && (
                        <TechnicalLevels
                            data={data.technicalLevels}
                            symbol={data.symbol}
                        />
                    )}
                    {hasData(data.aiPredictions) && (
                        <AIPredictions
                            data={data.aiPredictions}
                            symbol={data.symbol}
                        />
                    )}
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                    {hasData(data.news) && (
                        <NewsSection data={data.news} symbol={data.symbol} />
                    )}
                    {hasData(data.financialDocuments) && (
                        <FinancialDocuments
                            data={data.financialDocuments}
                            symbol={data.symbol}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default StockDashboard;
