import React from 'react';
import { BarChart3, TrendingUp, TrendingDown, Calendar } from 'lucide-react';

interface TechnicalLevelsProps {
  symbol: string;
  data: {
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
}

const TechnicalLevels: React.FC<TechnicalLevelsProps> = ({ symbol, data }) => {

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center space-x-3 mb-6">
        <BarChart3 className="h-6 w-6 text-blue-400" />
        <h2 className="text-xl font-semibold text-white">Technical Levels</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Daily Levels */}
        <div className="bg-gray-700 p-4 rounded-lg">
          <h3 className="font-medium text-white mb-4 flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-blue-400" />
            Daily Levels
          </h3>
          
          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-400 mb-2">Resistance Levels</div>
              {data.dailyLevels.resistance.map((level, index) => (
                <div key={index} className="flex justify-between items-center mb-1">
                  <span className="text-sm text-red-400">R{index + 1}</span>
                  <span className="text-sm text-white">${level}</span>
                </div>
              ))}
            </div>
            
            <div className="py-2 border-y border-gray-600">
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-400 font-medium">Current</span>
                <span className="text-sm text-blue-400 font-medium">${data.currentPrice}</span>
              </div>
            </div>
            
            <div>
              <div className="text-sm text-gray-400 mb-2">Support Levels</div>
              {data.dailyLevels.support.map((level, index) => (
                <div key={index} className="flex justify-between items-center mb-1">
                  <span className="text-sm text-green-400">S{index + 1}</span>
                  <span className="text-sm text-white">${level}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Weekly Levels */}
        <div className="bg-gray-700 p-4 rounded-lg">
          <h3 className="font-medium text-white mb-4 flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-purple-400" />
            Weekly Levels
          </h3>
          
          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-400 mb-2">Resistance Levels</div>
              {data.weeklyLevels.resistance.map((level, index) => (
                <div key={index} className="flex justify-between items-center mb-1">
                  <span className="text-sm text-red-400">WR{index + 1}</span>
                  <span className="text-sm text-white">${level}</span>
                </div>
              ))}
            </div>
            
            <div className="py-2 border-y border-gray-600">
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-400 font-medium">Current</span>
                <span className="text-sm text-blue-400 font-medium">${data.currentPrice}</span>
              </div>
            </div>
            
            <div>
              <div className="text-sm text-gray-400 mb-2">Support Levels</div>
              {data.weeklyLevels.support.map((level, index) => (
                <div key={index} className="flex justify-between items-center mb-1">
                  <span className="text-sm text-green-400">WS{index + 1}</span>
                  <span className="text-sm text-white">${level}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Technical Indicators */}
      <div className="mt-6 bg-gray-700 p-4 rounded-lg">
        <h3 className="font-medium text-white mb-4">Key Indicators</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-sm text-gray-400 mb-1">RSI (14)</div>
            <div className={`text-lg font-semibold ${data.indicators.rsi > 70 ? 'text-red-400' : data.indicators.rsi < 30 ? 'text-green-400' : 'text-white'}`}>
              {data.indicators.rsi}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-400 mb-1">MACD</div>
            <div className="text-lg font-semibold text-green-400">{data.indicators.macd}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-400 mb-1">Trend</div>
            <div className="flex items-center justify-center space-x-1">
              <TrendingUp className="h-4 w-4 text-green-400" />
              <span className="text-lg font-semibold text-green-400">{data.indicators.trend}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicalLevels;
