
import React, { useState } from 'react';
import { Search, TrendingUp, BarChart3, FileText, Calendar, Brain, Shield, Home } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import StockDashboard from '../components/StockDashboard';
import Hero from '../components/Hero';

const Index = () => {
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'home' | 'dashboard'>('home');

  const handleStockSelect = (stock: string) => {
    setSelectedStock(stock);
    setCurrentView('dashboard');
  };

  const handleHomeClick = () => {
    setCurrentView('home');
    setSelectedStock(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navigation Header */}
      <nav className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleHomeClick}
              className="flex items-center space-x-2 text-2xl font-bold text-blue-400 hover:text-blue-300 transition-colors"
            >
              <TrendingUp className="h-8 w-8" />
              <span>StockSense</span>
            </button>
            
            <button
              onClick={handleHomeClick}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                currentView === 'home' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </button>
          </div>

          <div className="flex-1 max-w-2xl mx-8">
            <SearchBar onStockSelect={handleStockSelect} />
          </div>

          <div className="text-sm text-gray-400">
            AI-Powered Stock Analysis
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {currentView === 'home' ? (
          <Hero onStockSelect={handleStockSelect} />
        ) : (
          <StockDashboard selectedStock={selectedStock} />
        )}
      </main>
    </div>
  );
};

export default Index;
