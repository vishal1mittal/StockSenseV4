
import React from 'react';
import { FileText, Download, ExternalLink, Calendar } from 'lucide-react';

interface FinancialDocumentsProps {
  symbol: string;
  data: {
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

const FinancialDocuments: React.FC<FinancialDocumentsProps> = ({ symbol, data }) => {

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Earnings': return 'bg-green-600 text-green-100';
      case 'Annual': return 'bg-blue-600 text-blue-100';
      case 'Quarterly': return 'bg-purple-600 text-purple-100';
      case 'Proxy': return 'bg-orange-600 text-orange-100';
      default: return 'bg-gray-600 text-gray-100';
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center space-x-3 mb-6">
        <FileText className="h-6 w-6 text-blue-400" />
        <h2 className="text-xl font-semibold text-white">Financial Documents</h2>
      </div>

      {/* Key Metrics */}
      <div className="bg-gray-700 p-4 rounded-lg mb-6">
        <h3 className="font-medium text-white mb-4">Key Financial Metrics</h3>
        <div className="space-y-3">
          {data.keyMetrics.map((metric, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-sm text-gray-400">{metric.label}</span>
              <div className="text-right">
                <div className="text-sm font-semibold text-white">{metric.value}</div>
                <div className={`text-xs ${metric.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                  {metric.change}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Documents List */}
      <div className="space-y-3">
        {data.documents.map((doc) => (
          <div key={doc.id} className="bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className="font-medium text-white text-sm mb-1">{doc.title}</h4>
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`text-xs px-2 py-1 rounded ${getCategoryColor(doc.category)}`}>
                    {doc.type}
                  </span>
                  <span className="text-xs text-gray-400">{doc.size}</span>
                </div>
              </div>
              <div className="flex space-x-2 ml-2">
                <button className="p-1 text-gray-400 hover:text-blue-400 transition-colors">
                  <ExternalLink className="h-4 w-4" />
                </button>
                <button className="p-1 text-gray-400 hover:text-green-400 transition-colors">
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex items-center text-xs text-gray-400">
              <Calendar className="h-3 w-3 mr-1" />
              {new Date(doc.date).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-4 py-2 text-sm text-blue-400 hover:text-blue-300 transition-colors">
        View All SEC Filings →
      </button>
    </div>
  );
};

export default FinancialDocuments;
