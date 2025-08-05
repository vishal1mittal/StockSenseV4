
import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react';

interface StockOverviewProps {
  symbol: string;
  companyName?: string;
  data: {
    price: number;
    change: number;
    changePercent: number;
    volume: string;
    marketCap: string;
    peRatio: number;
    dayRange: string;
  };
}

const StockOverview: React.FC<StockOverviewProps> = ({ symbol, companyName, data }) => {
  const isPositive = data.change > 0;

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">{symbol}</h1>
          <p className="text-gray-400">{companyName || 'Stock Analysis Dashboard'}</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-white">${data.price}</div>
          <div className={`flex items-center space-x-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            <span>{isPositive ? '+' : ''}{data.change} ({isPositive ? '+' : ''}{data.changePercent}%)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <BarChart3 className="h-4 w-4 text-blue-400" />
            <span className="text-sm text-gray-400">Volume</span>
          </div>
          <div className="text-lg font-semibold text-white">{data.volume}</div>
        </div>
        
        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <DollarSign className="h-4 w-4 text-blue-400" />
            <span className="text-sm text-gray-400">Market Cap</span>
          </div>
          <div className="text-lg font-semibold text-white">{data.marketCap}</div>
        </div>
        
        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="h-4 w-4 text-blue-400" />
            <span className="text-sm text-gray-400">P/E Ratio</span>
          </div>
          <div className="text-lg font-semibold text-white">{data.peRatio}</div>
        </div>
        
        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <BarChart3 className="h-4 w-4 text-blue-400" />
            <span className="text-sm text-gray-400">Day Range</span>
          </div>
          <div className="text-lg font-semibold text-white">{data.dayRange}</div>
        </div>
      </div>
    </div>
  );
};

export default StockOverview;
