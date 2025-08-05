# StockSense API Format

Your backend API at `api.stocksense.com` should return data in the following JSON format:

## Endpoint

```
GET https://api.stocksense.com/stock/{SYMBOL}
```

## Complete API Response Format

```json
{
  "symbol": "AAPL",
  "companyName": "Apple Inc.",
  "overview": {
    "price": 175.43,
    "change": 2.34,
    "changePercent": 1.35,
    "volume": "64.2M",
    "marketCap": "2.68T",
    "peRatio": 28.45,
    "dayRange": "172.80 - 176.90"
  },
  "historicalPerformance": {
    "dailyData": [
      { "date": "2023-01-26", "price": 165.20, "volume": 50200000 },
      { "date": "2023-01-27", "price": 166.50, "volume": 48300000 },
      { "date": "2023-01-30", "price": 167.80, "volume": 52100000 },
      ...
      { "date": "2024-01-25", "price": 174.20, "volume": 64200000 },
      { "date": "2024-01-26", "price": 175.43, "volume": 68500000 }
    ],
    "performance": {
      "1d": 1.35,
      "1w": 2.89,
      "1m": 6.22,
      "3m": 8.45,
      "1y": 12.67
    }
  },
  "riskAnalysis": {
    "riskScore": 6.8,
    "volatility": 24.5,
    "beta": 1.2,
    "sharpeRatio": 1.45,
    "maxDrawdown": 15.2,
    "var95": 8.3
  },
  "technicalLevels": {
    "currentPrice": 175.43,
    "dailyLevels": {
      "support": [172.50, 170.25, 168.80],
      "resistance": [178.90, 181.25, 184.50]
    },
    "weeklyLevels": {
      "support": [165.00, 160.50, 155.75],
      "resistance": [185.00, 190.25, 195.50]
    },
    "indicators": {
      "rsi": 68.5,
      "macd": "Bullish",
      "trend": "Upward"
    }
  },
  "aiPredictions": {
    "monthlyPredictions": [
      { "date": "2024-01-27", "predictedPrice": 178.50, "confidence": 78, "direction": "up" },
      { "date": "2024-01-28", "predictedPrice": 179.20, "confidence": 75, "direction": "up" },
      { "date": "2024-01-29", "predictedPrice": 177.80, "confidence": 72, "direction": "down" },
      ...
      { "date": "2024-02-26", "predictedPrice": 185.30, "confidence": 68, "direction": "up" }
    ],
    "summary": {
      "nextDayPrediction": {
        "direction": "up",
        "confidence": 78,
        "targetPrice": 178.50,
        "reasoning": "Strong technical momentum with positive earnings sentiment"
      },
      "weeklyOutlook": {
        "direction": "up",
        "confidence": 65,
        "targetRange": "175-182",
        "keyFactors": ["Earnings beat", "Technical breakout", "Sector rotation"]
      },
      "riskFactors": [
        "Market volatility ahead of Fed meeting",
        "High valuation metrics",
        "Seasonal trading patterns"
      ]
    }
  },
  "news": [
    {
      "id": 1,
      "title": "AAPL Reports Strong Q4 Earnings",
      "summary": "Company exceeds analyst expectations with robust revenue growth and improved margins.",
      "time": "2 hours ago",
      "source": "Financial Times",
      "sentiment": "positive"
    },
    {
      "id": 2,
      "title": "Market Analysis: Tech Sector Outlook",
      "summary": "Analysts remain bullish on technology stocks despite recent market volatility.",
      "time": "4 hours ago",
      "source": "Reuters",
      "sentiment": "neutral"
    }
  ],
  "financialDocuments": {
    "keyMetrics": [
      { "label": "Revenue (TTM)", "value": "$394.3B", "change": "+2.8%" },
      { "label": "Net Income (TTM)", "value": "$97.0B", "change": "-2.8%" },
      { "label": "EPS (TTM)", "value": "$6.13", "change": "-2.4%" },
      { "label": "ROE", "value": "174.6%", "change": "+8.2%" }
    ],
    "documents": [
      {
        "id": 1,
        "title": "Q4 2023 Earnings Report",
        "type": "10-K",
        "date": "2024-01-15",
        "size": "2.4 MB",
        "category": "Earnings"
      }
    ]
  }
}
```

## Important Notes:

### Required Fields

-   `symbol` (string): Stock symbol in uppercase
-   `companyName` (string): Full company name

### Optional Sections

All other sections are optional. If a section is n ot available, simply omit it from the response. The frontend will automatically hide sections that are not present.

### Fallback Behavior

-   If the API is unreachable or returns an error, the frontend will automatically load demo data
-   The frontend includes a 10-second timeout for API requests
-   All error handling is built-in

### Field Types

-   Numbers: Use actual numbers, not strings (e.g., `175.43`, not `"175.43"`)
-   Percentages: Can be numbers or strings (e.g., `1.35` or `"1.35%"`)
-   Dates: Use ISO date format (YYYY-MM-DD) or relative time ("2 hours ago")
-   Prices: Numbers for calculations, formatted strings for display

### Chart Data

-   **Historical Performance**: Provide 1 year of daily data in `dailyData` array. Frontend will automatically filter for different timeframes (1D, 1W, 1M, 3M, 6M, 1Y)
-   **AI Predictions**: Provide 1 month of daily prediction data in `monthlyPredictions` array. Frontend will handle visualization for different prediction periods
-   Use YYYY-MM-DD format for all dates
-   Include price, volume, and confidence data for comprehensive analysis

### Response Status

-   Return HTTP 200 for successful responses
-   Return appropriate HTTP error codes (404, 500, etc.) for errors
-   The frontend will handle all error cases gracefully
