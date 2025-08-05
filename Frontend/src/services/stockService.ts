import demoData from "../data/demoData.json";

export interface StockData {
    symbol: string;
    companyName: string;
    overview?: {
        price: number;
        change: number;
        changePercent: number;
        volume: string;
        marketCap: string;
        peRatio: number;
        dayRange: string;
    };
    historicalPerformance?: {
        dailyData: Array<{ date: string; price: number; volume: number }>;
        performance: {
            "1d": number;
            "1w": number;
            "1m": number;
            "3m": number;
            "1y": number;
        };
    };
    riskAnalysis?: {
        riskScore: number;
        volatility: number;
        beta: number;
        sharpeRatio: number;
        maxDrawdown: number;
        var95: number;
    };
    technicalLevels?: {
        currentPrice: number;
        dailyLevels: {
            support: number[];
            resistance: number[];
        };
        weeklyLevels: {
            support: number[];
            resistance: number[];
        };
        indicators: {
            rsi: number;
            macd: string;
            trend: string;
        };
    };
    aiPredictions?: {
        monthlyPredictions: Array<{
            date: string;
            predictedPrice: number;
            confidence: number;
            direction: string;
        }>;
        summary: {
            nextDayPrediction: {
                direction: string;
                confidence: number;
                targetPrice: number;
                reasoning: string;
            };
            weeklyOutlook: {
                direction: string;
                confidence: number;
                targetRange: string;
                keyFactors: string[];
            };
            riskFactors: string[];
        };
    };
    news?: Array<{
        id: number;
        title: string;
        summary: string;
        time: string;
        source: string;
        sentiment: string;
    }>;
    financialDocuments?: {
        keyMetrics: Array<{
            label: string;
            value: string;
            change: string;
        }>;
        documents: Array<{
            id: number;
            title: string;
            type: string;
            date: string;
            size: string;
            category: string;
        }>;
    };
}

const API_BASE_URL = "http://127.0.0.1:8000";

export const fetchStockData = async (symbol: string): Promise<StockData> => {
    try {
        console.log(`Fetching data for ${symbol} from API...`);

        const response = await fetch(`${API_BASE_URL}/${symbol}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            // Add timeout to prevent hanging
            signal: AbortSignal.timeout(10000), // 10 second timeout
        });

        if (!response.ok) {
            throw new Error(
                `API request failed with status: ${response.status}`
            );
        }

        const data = await response.json();
        console.log("API response received:", data);

        return {
            ...data,
            symbol: data.symbol.toUpperCase(),
        };
    } catch (error) {
        console.warn("API request failed, falling back to demo data:", error);

        // Return demo data with the requested symbol
        return {
            ...demoData,
            symbol: symbol.toUpperCase(),
            companyName: `${symbol.toUpperCase()} Inc.`,
        } as StockData;
    }
};

// Helper function to check if a section has data
export const hasData = (data: any): boolean => {
    return (
        data !== undefined &&
        data !== null &&
        (typeof data !== "object" || Object.keys(data).length > 0)
    );
};
