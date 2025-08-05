
import React from 'react';
import { Calendar, ExternalLink } from 'lucide-react';

interface NewsSectionProps {
  symbol: string;
  data: Array<{
    id: number;
    title: string;
    summary: string;
    time: string;
    source: string;
    sentiment: string;
  }>;
}

const NewsSection: React.FC<NewsSectionProps> = ({ symbol, data }) => {

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'negative': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center space-x-3 mb-6">
        <Calendar className="h-6 w-6 text-blue-400" />
        <h2 className="text-xl font-semibold text-white">Market News</h2>
      </div>

      <div className="space-y-4">
        {data.map((article) => (
          <div key={article.id} className="bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-medium text-white text-sm leading-tight flex-1">{article.title}</h3>
              <ExternalLink className="h-4 w-4 text-gray-400 ml-2 flex-shrink-0" />
            </div>
            
            <p className="text-gray-300 text-xs mb-3 leading-relaxed">{article.summary}</p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-400">{article.source}</span>
                <span className="text-xs text-gray-500">•</span>
                <span className="text-xs text-gray-400">{article.time}</span>
              </div>
              <span className={`text-xs px-2 py-1 rounded border ${getSentimentColor(article.sentiment)}`}>
                {article.sentiment}
              </span>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-4 py-2 text-sm text-blue-400 hover:text-blue-300 transition-colors">
        View All News →
      </button>
    </div>
  );
};

export default NewsSection;
