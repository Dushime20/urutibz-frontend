import React, { useState } from 'react';
import { MessageCircle, Search, X } from 'lucide-react';
import FaqSection from '../components/sections/FaqSection';

const FaqPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <section className="relative overflow-hidden bg-white dark:bg-slate-900">
        <div className="relative max-w-6xl mx-auto px-6 lg:px-10 py-16 lg:py-20">
          <div className="flex flex-col items-start gap-6">
            {/* Search Bar - At the Very Top */}
            <div className="w-full max-w-4xl">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        // Search is already happening on input change, but we can add focus handling here if needed
                      }
                    }}
                    placeholder="Search for any question..."
                    className="w-full pl-14 pr-14 py-5 text-lg bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/20 rounded-xl text-gray-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all shadow-lg"
                  />
                  {searchQuery && (
                    <button
                      onClick={clearSearch}
                      className="absolute inset-y-0 right-0 pr-5 flex items-center text-slate-400 dark:text-slate-300 hover:text-gray-600 dark:hover:text-white transition-colors"
                      aria-label="Clear search"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    // Search is already happening on input change, but we can add any additional logic here
                    const input = document.querySelector('input[type="text"]') as HTMLInputElement;
                    input?.focus();
                  }}
                  className="px-8 py-5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap"
                  aria-label="Search"
                >
                  <Search className="h-5 w-5" />
                  <span className="hidden sm:inline">Search</span>
                </button>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 dark:bg-white/10 border border-teal-200 dark:border-white/20 px-4 py-1 text-xs font-semibold tracking-[0.2em] uppercase text-teal-700 dark:text-teal-200">
              <MessageCircle className="w-4 h-4 text-teal-600 dark:text-teal-200" />
              <span>Help Center</span>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight text-gray-900 dark:text-white">
                Frequently Asked Questions
              </h1>
              <p className="mt-3 text-base md:text-lg text-gray-600 dark:text-slate-200 max-w-2xl">
                Everything you need to know about our global renting system—trust, AI automations, payouts, and cross-border logistics.
              </p>
            </div>
          
          </div>
        </div>
      </section>

      <FaqSection searchQuery={searchQuery} onClearSearch={clearSearch} />
    </div>
  );
};

export default FaqPage;
