import { useState, useEffect } from "react";
import { fetchStockData, StockData } from "../services/stockService";
import { isAuthenticated } from "../services/apiClient";

export const useStockData = (symbol: string | null) => {
    const [data, setData] = useState<StockData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Get the latest auth status
    const isAuth = isAuthenticated();

    useEffect(() => {
        if (!symbol) {
            setData(null);
            setError(null);
            return;
        }

        const loadStockData = async () => {
            setLoading(true);
            setError(null);

            try {
                const stockData = await fetchStockData(symbol);
                setData(stockData);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load stock data"
                );
                setData(null);
            } finally {
                setLoading(false);
            }
        };

        loadStockData();
    }, [symbol, isAuth]);

    return { data, loading, error };
};
