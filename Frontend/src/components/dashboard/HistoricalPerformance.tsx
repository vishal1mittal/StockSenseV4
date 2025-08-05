import React, { useState } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Line,
    ComposedChart,
} from "recharts";
import { TrendingUp, Calendar } from "lucide-react";

interface HistoricalPerformanceProps {
    symbol: string;
    data: {
        dailyData: Array<{ date: string; price: number; volume: number }>;
        performance: {
            "1d": number;
            "1w": number;
            "1m": number;
            "3m": number;
            "1y": number;
        };
    };
}

const HistoricalPerformance: React.FC<HistoricalPerformanceProps> = ({
    symbol,
    data,
    currency,
}) => {
    const [selectedPeriod, setSelectedPeriod] = useState<
        "1W" | "1M" | "3M" | "6M" | "1Y"
    >("1M");

    // Filter data based on selected period
    const getFilteredData = (period: string) => {
        const days =
            {
                "1W": 7,
                "1M": 30,
                "3M": 90,
                "6M": 180,
                "1Y": 365,
            }[period] || 30;

        const sortedData = [...data.dailyData].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        const filteredData = sortedData.slice(-days);

        return filteredData.map((item) => ({
            ...item,
            date: new Date(item.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                ...(period === "1Y" ? { year: "2-digit" } : {}),
            }),
        }));
    };

    const historicalData = getFilteredData(selectedPeriod);
    const currentPrice = historicalData[historicalData.length - 1]?.price || 0;
    const firstPrice = historicalData[0]?.price || 0;
    const priceChange = currentPrice - firstPrice;
    const priceChangePercent = (priceChange / firstPrice) * 100;

    const periods = [
        { label: "1W", value: "1W" },
        { label: "1M", value: "1M" },
        { label: "3M", value: "3M" },
        { label: "6M", value: "6M" },
        { label: "1Y", value: "1Y" },
    ];

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-gray-800 p-3 rounded-lg border border-gray-600 shadow-lg">
                    <p className="text-gray-300 text-sm">{label}</p>
                    <p className="text-white font-semibold">
                        Price: {payload[0].value}
                    </p>
                    <p className="text-gray-400 text-sm">
                        Volume: {payload[0].payload.volume.toLocaleString()}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <TrendingUp className="h-6 w-6 text-blue-400" />
                    <h2 className="text-xl font-semibold text-white">
                        Historical Performance ({currency})
                    </h2>
                </div>

                {/* Time Period Selector */}
                <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div className="flex bg-gray-700 rounded-lg p-1">
                        {periods.map((period) => (
                            <button
                                key={period.value}
                                onClick={() =>
                                    setSelectedPeriod(period.value as any)
                                }
                                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                                    selectedPeriod === period.value
                                        ? "bg-blue-600 text-white"
                                        : "text-gray-300 hover:text-white hover:bg-gray-600"
                                }`}
                            >
                                {period.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Performance Summary */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                    <div className="text-sm text-gray-400 mb-1">
                        Period Return
                    </div>
                    <div
                        className={`text-lg font-semibold ${
                            priceChange >= 0 ? "text-green-400" : "text-red-400"
                        }`}
                    >
                        {priceChange >= 0 ? "+" : ""}
                        {priceChange.toFixed(2)}
                    </div>
                </div>
                <div className="text-center">
                    <div className="text-sm text-gray-400 mb-1">
                        Percentage Change
                    </div>
                    <div
                        className={`text-lg font-semibold ${
                            priceChangePercent >= 0
                                ? "text-green-400"
                                : "text-red-400"
                        }`}
                    >
                        {priceChangePercent >= 0 ? "+" : ""}
                        {priceChangePercent.toFixed(2)}%
                    </div>
                </div>
                <div className="text-center">
                    <div className="text-sm text-gray-400 mb-1">
                        Current Price
                    </div>
                    <div className="text-lg font-semibold text-white">
                        {currentPrice.toFixed(2)}
                    </div>
                </div>
            </div>

            {/* Chart Container */}
            <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                        data={historicalData}
                        margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis
                            dataKey="date"
                            stroke="#9CA3AF"
                            fontSize={12}
                            tick={{ fill: "#9CA3AF" }}
                        />
                        <YAxis
                            stroke="#9CA3AF"
                            fontSize={12}
                            tick={{ fill: "#9CA3AF" }}
                            domain={["dataMin - 5", "dataMax + 5"]}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar
                            dataKey="price"
                            fill="#3B82F6"
                            radius={[2, 2, 0, 0]}
                        />
                        <Line
                            type="linear"
                            dataKey="price"
                            stroke="#60A5FA"
                            strokeWidth={2}
                            dot={false}
                            connectNulls
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            {/* Chart Legend */}
            <div className="mt-4 flex items-center justify-center space-x-6 text-sm text-gray-400">
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span>Daily Closing Price</span>
                </div>
            </div>
        </div>
    );
};

export default HistoricalPerformance;
