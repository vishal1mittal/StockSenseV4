
import React from 'react';
import { TrendingUp, BarChart3, Brain, Shield, FileText, Calendar } from 'lucide-react';

interface HeroProps {
  onStockSelect: (stock: string) => void;
}

const Hero: React.FC<HeroProps> = ({ onStockSelect }) => {
  const features = [
    {
      icon: TrendingUp,
      title: 'Real-time Stock Analysis',
      description: 'Get comprehensive analysis of stock performance with live data and technical indicators.'
    },
    {
      icon: Brain,
      title: 'AI-Powered Predictions',
      description: 'Advanced machine learning algorithms provide intelligent market forecasts and trading insights.'
    },
    {
      icon: Shield,
      title: 'Risk Assessment',
      description: 'Detailed risk analysis including volatility metrics, beta calculations, and portfolio optimization.'
    },
    {
      icon: BarChart3,
      title: 'Technical Levels',
      description: 'Daily and weekly support/resistance levels, trend analysis, and key price targets.'
    },
    {
      icon: FileText,
      title: 'Financial Documents',
      description: 'Access to quarterly reports, SEC filings, earnings statements, and financial ratios.'
    },
    {
      icon: Calendar,
      title: 'Market News & Events',
      description: 'Stay updated with latest market news, earnings calendars, and economic events.'
    }
  ];

  const popularStocks = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'NVDA'];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <div className="text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-white leading-tight">
            Professional Stock Market
            <span className="text-blue-400 block">Analysis Platform</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Harness the power of AI-driven analytics, real-time data, and comprehensive financial insights 
            to make informed investment decisions with StockSense.
          </p>
        </div>

        {/* Popular Stocks */}
        <div className="flex flex-wrap justify-center gap-3">
          <span className="text-sm text-gray-400 mr-4">Popular stocks:</span>
          {popularStocks.map((stock) => (
            <button
              key={stock}
              onClick={() => onStockSelect(stock)}
              className="px-4 py-2 bg-gray-800 hover:bg-blue-600 text-white rounded-lg transition-colors border border-gray-700 hover:border-blue-500"
            >
              {stock}
            </button>
          ))}
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => {
          const IconComponent = feature.icon;
          return (
            <div
              key={index}
              className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-blue-500 transition-all duration-300 hover:transform hover:scale-105"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-blue-600 rounded-lg">
                  <IconComponent className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
              </div>
              <p className="text-gray-300 leading-relaxed">{feature.description}</p>
            </div>
          );
        })}
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          Start Your Analysis Today
        </h2>
        <p className="text-blue-100 text-lg mb-6">
          Search for any stock symbol above to begin comprehensive market analysis
        </p>
        <div className="flex justify-center space-x-4">
          <div className="text-sm text-blue-100">
            ✓ Real-time data &nbsp;&nbsp; ✓ AI predictions &nbsp;&nbsp; ✓ Risk analysis &nbsp;&nbsp; ✓ Financial insights
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
