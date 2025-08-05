
import React from 'react';
import { Shield, AlertTriangle, TrendingUp } from 'lucide-react';

interface RiskAnalysisProps {
  symbol: string;
  data: {
    riskScore: number;
    volatility: number;
    beta: number;
    sharpeRatio: number;
    maxDrawdown: number;
    var95: number;
  };
}

const RiskAnalysis: React.FC<RiskAnalysisProps> = ({ symbol, data }) => {

  const getRiskLevel = (score: number) => {
    if (score <= 3) return { level: 'Low', color: 'text-green-400', bg: 'bg-green-400' };
    if (score <= 7) return { level: 'Medium', color: 'text-yellow-400', bg: 'bg-yellow-400' };
    return { level: 'High', color: 'text-red-400', bg: 'bg-red-400' };
  };

  const risk = getRiskLevel(data.riskScore);

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center space-x-3 mb-6">
        <Shield className="h-6 w-6 text-blue-400" />
        <h2 className="text-xl font-semibold text-white">Risk Analysis</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Risk Score */}
        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-400">Overall Risk Score</span>
            <span className={`text-sm font-medium ${risk.color}`}>{risk.level}</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex-1 bg-gray-600 rounded-full h-2">
              <div 
                className={`${risk.bg} h-2 rounded-full transition-all duration-300`}
                style={{ width: `${(data.riskScore / 10) * 100}%` }}
              ></div>
            </div>
            <span className="text-lg font-bold text-white">{data.riskScore}/10</span>
          </div>
        </div>

        {/* Volatility */}
        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="h-4 w-4 text-blue-400" />
            <span className="text-sm text-gray-400">30-Day Volatility</span>
          </div>
          <div className="text-2xl font-bold text-white">{data.volatility}%</div>
        </div>
      </div>

      {/* Risk Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="text-center">
          <div className="text-sm text-gray-400 mb-1">Beta</div>
          <div className="text-lg font-semibold text-white">{data.beta}</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-400 mb-1">Sharpe Ratio</div>
          <div className="text-lg font-semibold text-white">{data.sharpeRatio}</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-400 mb-1">Max Drawdown</div>
          <div className="text-lg font-semibold text-red-400">{data.maxDrawdown}%</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-400 mb-1">VaR (95%)</div>
          <div className="text-lg font-semibold text-white">{data.var95}%</div>
        </div>
      </div>

      {/* Risk Warning */}
      <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
          <div>
            <div className="text-sm font-medium text-yellow-400 mb-1">Risk Assessment</div>
            <div className="text-sm text-gray-300">
              This stock shows {risk.level.toLowerCase()} volatility. Consider your risk tolerance and diversification strategy.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskAnalysis;
