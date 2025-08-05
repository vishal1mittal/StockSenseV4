# StockSense - Stock Market Analysis

## Project Description

StockSense is an AI-powered stock market analysis platform that provides comprehensive insights, risk analysis, technical indicators, and predictive analytics for informed investment decisions.

## Features

- **Stock Search & Overview**: Real-time stock data and key metrics
- **Historical Performance**: Interactive charts with historical price data
- **Risk Analysis**: Comprehensive risk metrics and volatility analysis
- **Technical Levels**: Support/resistance levels and technical indicators
- **AI Predictions**: Machine learning-powered price predictions and trading signals
- **News Integration**: Latest market news and financial updates
- **Financial Documents**: Access to company financial reports and filings

## How to run this project locally

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies
npm i

# Step 4: Start the development server
npm run dev
```

## Technologies Used

This project is built with:

- **Vite** - Fast build tool and development server
- **TypeScript** - Type-safe JavaScript
- **React** - Frontend framework
- **shadcn-ui** - Modern UI components
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Charting library for data visualization
- **Lucide React** - Icon library

## Project Structure

```
src/
├── components/
│   ├── dashboard/          # Dashboard components
│   │   ├── StockOverview.tsx
│   │   ├── HistoricalPerformance.tsx
│   │   ├── RiskAnalysis.tsx
│   │   ├── TechnicalLevels.tsx
│   │   ├── AIPredictions.tsx
│   │   ├── NewsSection.tsx
│   │   └── FinancialDocuments.tsx
│   ├── ui/                 # Reusable UI components
│   ├── Hero.tsx
│   ├── SearchBar.tsx
│   └── StockDashboard.tsx
├── pages/
│   ├── Index.tsx
│   └── NotFound.tsx
└── lib/
    └── utils.ts
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.
