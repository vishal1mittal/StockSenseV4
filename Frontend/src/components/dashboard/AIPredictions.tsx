
import React, { useState } from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Brain, TrendingUp, Target, Zap, Calendar } from 'lucide-react';

interface AIPredictionsProps {
  symbol: string;
  data: {
    monthlyPredictions: Array<{ date: string; predictedPrice: number; confidence: number; direction: string }>;
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
}

const AIPredictions: React.FC<AIPredictionsProps> = ({ symbol, data }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'1W' | '2W' | '1M'>('1W');
  // Use API data for predictions
  const predictions = {
    shortTerm: {
      direction: data.summary.nextDayPrediction.direction,
      confidence: data.summary.nextDayPrediction.confidence,
      targetPrice: data.summary.nextDayPrediction.targetPrice,
      timeframe: '1 Week'
    },
    mediumTerm: {
      direction: data.summary.weeklyOutlook.direction,
      confidence: data.summary.weeklyOutlook.confidence,
      targetPrice: parseFloat(data.summary.weeklyOutlook.targetRange.split('-')[1] || '0'),
      timeframe: '1 Month'
    },
    longTerm: {
      direction: 'Neutral',
      confidence: 65,
      targetPrice: data.monthlyPredictions[data.monthlyPredictions.length - 1]?.predictedPrice || 0,
      timeframe: '3 Months'
    }
  };

  const signals = [
    { type: 'Buy Signal', strength: 'Strong', color: 'text-green-400', icon: TrendingUp },
    { type: 'Volume Surge', strength: 'Medium', color: 'text-blue-400', icon: Zap },
    { type: 'Momentum', strength: 'Strong', color: 'text-green-400', icon: Target }
  ];

  // Filter API prediction data based on selected period
  const getFilteredPredictions = (period: string) => {
    const days = { '1W': 7, '2W': 14, '1M': 30 }[period] || 7;
    
    const filteredData = data.monthlyPredictions.slice(0, days);
    
    return filteredData.map(item => ({
      date: new Date(item.date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }),
      price: item.predictedPrice,
      confidence: item.confidence
    }));
  };

  const predictionData = getFilteredPredictions(selectedPeriod);
  const periods = [
    { label: '1W', value: '1W' },
    { label: '2W', value: '2W' },
    { label: '1M', value: '1M' }
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 p-3 rounded-lg border border-gray-600 shadow-lg">
          <p className="text-gray-300 text-sm">{label}</p>
          <p className="text-white font-semibold">
            Predicted: ${payload[0].value}
          </p>
          <p className="text-blue-400 text-sm">
            Confidence: {payload[0].payload.confidence}%
          </p>
        </div>
      );
    }
    return null;
  };

  const getDirectionColor = (direction: string) => {
    switch (direction.toLowerCase()) {
      case 'bullish': return 'text-green-400';
      case 'bearish': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center space-x-3 mb-6">
        <Brain className="h-6 w-6 text-blue-400" />
        <h2 className="text-xl font-semibold text-white">AI Predictions</h2>
        <span className="px-2 py-1 bg-blue-600 text-xs text-white rounded">BETA</span>
      </div>

      {/* Prediction Cards */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="text-center">
            <div className="text-sm text-gray-400 mb-2">{predictions.shortTerm.timeframe}</div>
            <div className={`text-lg font-semibold ${getDirectionColor(predictions.shortTerm.direction)}`}>
              {predictions.shortTerm.direction}
            </div>
            <div className="text-2xl font-bold text-white mt-2">${predictions.shortTerm.targetPrice}</div>
            <div className="text-sm text-gray-400 mt-2">
              Confidence: {predictions.shortTerm.confidence}%
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
              <div 
                className="bg-green-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${predictions.shortTerm.confidence}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="text-center">
            <div className="text-sm text-gray-400 mb-2">{predictions.mediumTerm.timeframe}</div>
            <div className={`text-lg font-semibold ${getDirectionColor(predictions.mediumTerm.direction)}`}>
              {predictions.mediumTerm.direction}
            </div>
            <div className="text-2xl font-bold text-white mt-2">${predictions.mediumTerm.targetPrice}</div>
            <div className="text-sm text-gray-400 mt-2">
              Confidence: {predictions.mediumTerm.confidence}%
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
              <div 
                className="bg-green-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${predictions.mediumTerm.confidence}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="text-center">
            <div className="text-sm text-gray-400 mb-2">{predictions.longTerm.timeframe}</div>
            <div className={`text-lg font-semibold ${getDirectionColor(predictions.longTerm.direction)}`}>
              {predictions.longTerm.direction}
            </div>
            <div className="text-2xl font-bold text-white mt-2">${predictions.longTerm.targetPrice}</div>
            <div className="text-sm text-gray-400 mt-2">
              Confidence: {predictions.longTerm.confidence}%
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
              <div 
                className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${predictions.longTerm.confidence}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Signals */}
      <div className="bg-gray-700 p-4 rounded-lg">
        <h3 className="font-medium text-white mb-4">AI Trading Signals</h3>
        <div className="space-y-3">
          {signals.map((signal, index) => {
            const IconComponent = signal.icon;
            return (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <IconComponent className={`h-4 w-4 ${signal.color}`} />
                  <span className="text-white">{signal.type}</span>
                </div>
                <span className={`text-sm font-medium ${signal.color}`}>
                  {signal.strength}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Price Prediction Chart */}
      <div className="bg-gray-700 p-4 rounded-lg mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-white">Daily Price Predictions</h3>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <div className="flex bg-gray-600 rounded-lg p-1">
              {periods.map((period) => (
                <button
                  key={period.value}
                  onClick={() => setSelectedPeriod(period.value as any)}
                  className={`px-2 py-1 text-xs rounded-md transition-colors ${
                    selectedPeriod === period.value
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-500'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={predictionData}
              margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#9CA3AF"
                fontSize={10}
                tick={{ fill: '#9CA3AF' }}
              />
              <YAxis 
                stroke="#9CA3AF"
                fontSize={10}
                tick={{ fill: '#9CA3AF' }}
                domain={['dataMin - 2', 'dataMax + 2']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="price" 
                fill="#8B5CF6"
                radius={[2, 2, 0, 0]}
              />
              <Line 
                type="linear" 
                dataKey="price" 
                stroke="#A78BFA" 
                strokeWidth={2}
                dot={false}
                connectNulls
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
        <div className="text-xs text-yellow-400">
          <strong>Disclaimer:</strong> AI predictions are based on historical data and should not be used as sole investment advice. Always consult with financial professionals.
        </div>
      </div>
    </div>
  );
};

export default AIPredictions;
