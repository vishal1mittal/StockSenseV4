// 📂 src/services/stockService.ts
import demoData from "../data/demoData.json";
import { fetchWrapper } from "./fetchWrapper"; // ⬅️ import wrapper

export interface StockData {
    symbol: string;
    companyName: string;
    currency: string;
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

// Use env variable instead of hardcoding
//const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const fetchStockData = async (symbol: string): Promise<StockData> => {
    try {
        console.log(`Fetching data for ${symbol} from API...`);

        // relative path since fetchWrapper already adds base URL
        const data = await fetchWrapper.get<StockData>(
            `/api/stocks/${symbol}/summary`
        );

        console.log("API response received:", data);

        return {
            ...data,
            symbol: data.symbol.toUpperCase(),
        };
    } catch (error) {
        console.warn("API request failed, falling back to demo data:", error);

        return {
            ...demoData,
            symbol: `${symbol.toUpperCase()} (Demo)`,
            companyName: `${symbol.toUpperCase()} Inc.`,
        } as StockData;
    }
};
