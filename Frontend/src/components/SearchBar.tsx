
import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  onStockSelect: (stock: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onStockSelect }) => {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Mock stock suggestions - in real app this would come from an API
  const suggestions = [
    { symbol: 'AAPL', name: 'Apple Inc.' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.' },
    { symbol: 'MSFT', name: 'Microsoft Corporation' },
    { symbol: 'TSLA', name: 'Tesla, Inc.' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation' },
  ].filter(stock => 
    stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
    stock.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onStockSelect(query.toUpperCase());
      setQuery('');
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (symbol: string) => {
    onStockSelect(symbol);
    setQuery('');
    setShowSuggestions(false);
  };

  return (
    <div className="relative">
      <form onSubmit={handleSearch} className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder="Search stocks (e.g., AAPL, Tesla)..."
          className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && query && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {suggestions.map((stock) => (
            <button
              key={stock.symbol}
              onClick={() => handleSuggestionClick(stock.symbol)}
              className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors border-b border-gray-700 last:border-b-0"
            >
              <div className="font-semibold text-blue-400">{stock.symbol}</div>
              <div className="text-sm text-gray-300">{stock.name}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
