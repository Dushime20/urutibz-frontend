import React, { useState } from 'react';
import { Search, MapPin, Bot, Globe, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HeroSection: React.FC = () => {
  const [searchCategory, setSearchCategory] = useState('all');
  const navigate = useNavigate();
  
  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchCategory !== 'all') {
      params.set('category', searchCategory);
    }
    navigate(`/items/search?${params.toString()}`);
  };
  
  const handleFindRentals = () => {
    navigate('/items/search');
  };
  
  const categories = [
    { id: 'all', label: 'All Items', icon: '🏠' },
    { id: 'vehicles', label: 'Vehicles', icon: '🚗' },
    { id: 'tools', label: 'Tools & Equipment', icon: '🔧' },
    { id: 'electronics', label: 'Electronics', icon: '📱' },
    { id: 'outdoor', label: 'Outdoor Gear', icon: '⛺' },
    { id: 'events', label: 'Event Items', icon: '🎉' }
  ];

  return (
    <section className="relative py-8 sm:py-12 lg:py-16 xl:py-20 overflow-hidden" style={{ backgroundColor: 'var(--background-color)' }}>
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_rgba(0,170,169,0.3)_1px,_transparent_0)] bg-[length:40px_40px]"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-start lg:items-center py-4 sm:py-6 lg:py-8">
          {/* Left Content */}
          <div className="space-y-6 lg:space-y-8 w-full lg:max-w-none">
            {/* AI Badge */}
            <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-3 lg:px-4 py-2 rounded-full border border-teal-200 shadow-sm">
              <Bot className="w-4 h-4 text-active" />
              <span className="text-sm font-medium text-active font-outfit">AI-Powered Matching</span>
              <Sparkles className="w-4 h-4 text-yellow-500" />
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight font-outfit">
              <span style={{ color: 'var(--foreground-color)' }}>Rent Anything,</span>
              <br />
              <span className="text-active">Anywhere</span>{' '}
              <span style={{ color: 'var(--foreground-color)' }}>with</span>
              <br />
              <span className="bg-gradient-to-r from-active to-active-dark bg-clip-text text-transparent">
                Smart AI
              </span>
            </h1>
            
            <p className="text-base lg:text-lg xl:text-xl leading-relaxed max-w-2xl font-inter" style={{ color: 'var(--foreground-color)' }}>
              Connect with people in your community to rent anything you need. Our AI finds the perfect match, handles logistics, and ensures safe transactions worldwide.
            </p>
            
            {/* Global Stats */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 lg:gap-8">
              <div className="flex items-center space-x-3">
                <div className="flex -space-x-2">
                  <img 
                    src="/assets/img/profiles/avatar-01.jpg" 
                    alt="User" 
                    className="w-10 h-10 lg:w-12 lg:h-12 rounded-full border-2 border-white shadow-md"
                  />
                  <img 
                    src="/assets/img/profiles/avatar-02.jpg" 
                    alt="User" 
                    className="w-10 h-10 lg:w-12 lg:h-12 rounded-full border-2 border-white shadow-md"
                  />
                  <img 
                    src="/assets/img/profiles/avatar-03.jpg" 
                    alt="User" 
                    className="w-10 h-10 lg:w-12 lg:h-12 rounded-full border-2 border-white shadow-md"
                  />
                  <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full border-2 border-white shadow-md bg-active flex items-center justify-center text-white font-bold text-xs lg:text-sm">
                    +12K
                  </div>
                </div>
                <div>
                  <div className="text-base lg:text-lg font-bold font-outfit" style={{ color: 'var(--foreground-color)' }}>Active Community</div>
                  <div className="text-sm lg:text-base text-platform-grey font-inter">across 40+ countries</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Globe className="w-5 h-5 text-active" />
                <div>
                  <div className="text-base lg:text-lg font-bold font-outfit" style={{ color: 'var(--foreground-color)' }}>200K+ Items</div>
                  <div className="text-sm lg:text-base text-platform-grey font-inter">available globally</div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
              <button 
                onClick={handleFindRentals}
                className="btn-primary flex items-center justify-center space-x-2 font-outfit text-sm lg:text-base py-3 lg:py-4 px-6 lg:px-8"
              >
                <Search className="w-4 h-4 lg:w-5 lg:h-5" />
                <span>Find Rentals</span>
              </button>
              <button className="btn-secondary flex items-center justify-center space-x-2 font-outfit text-sm lg:text-base py-3 lg:py-4 px-6 lg:px-8">
                <Sparkles className="w-4 h-4 lg:w-5 lg:h-5 text-active" />
                <span>List Your Items</span>
              </button>
            </div>
          </div>
          
          {/* Right Content - Visual Elements */}
          <div className="relative mt-8 lg:mt-0 w-full lg:max-w-none">
            <div className="card relative p-6 lg:p-8 w-full max-w-md mx-auto lg:max-w-none">
              {/* AI Recommendation Card */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-base lg:text-lg xl:text-xl font-semibold font-outfit" style={{ color: 'var(--foreground-color)' }}>AI Recommendations</h3>
                  <div className="inline-flex items-center space-x-1 bg-active/10 text-active px-3 py-1 rounded-full text-xs lg:text-sm font-medium font-outfit">
                    <Bot className="w-4 h-4" />
                    <span className="hidden sm:inline">Smart Match</span>
                  </div>
                </div>
                
                {/* Sample Items */}
                <div className="space-y-4">
                  {[
                    { item: 'Professional Camera Kit', price: '$45/day', location: 'Kigali, Rwanda', match: '98%' },
                    { item: 'Electric Drill Set', price: '$15/day', location: 'Nairobi, Kenya', match: '95%' },
                    { item: 'Camping Tent (4-person)', price: '$25/day', location: 'Cape Town, SA', match: '92%' }
                  ].map((rental, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-platform-light-grey rounded-platform border border-platform-grey">
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="font-medium font-inter text-sm lg:text-base truncate" style={{ color: 'var(--foreground-color)' }}>{rental.item}</div>
                        <div className="text-sm text-platform-grey flex items-center space-x-1 font-inter mt-1">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{rental.location}</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-semibold text-active font-inter text-sm lg:text-base">{rental.price}</div>
                        <div className="text-xs lg:text-sm text-active font-medium font-inter">{rental.match} match</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-active/10 text-active px-3 py-2 rounded-full text-sm font-semibold shadow-lg">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-active rounded-full"></div>
                  <span className="font-outfit">AI-Verified</span>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -left-4 bg-active text-white px-4 py-3 rounded-platform shadow-lg">
                <div className="text-xs text-white/80 font-inter">Trusted by</div>
                <div className="font-bold text-white font-outfit text-base">12,000+ Users</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Smart Search Form */}
        <div className="mt-12 lg:mt-16">
          <div className="card max-w-6xl mx-auto">
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-3 lg:mb-4">
                <Bot className="w-4 h-4 lg:w-5 lg:h-5 text-active" />
                <h3 className="text-base lg:text-lg font-semibold font-outfit" style={{ color: 'var(--foreground-color)' }}>AI-Powered Search</h3>
                <span className="text-sm text-platform-grey font-inter">Find exactly what you need</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                <div className="sm:col-span-2 lg:col-span-2 space-y-2">
                  <label className="block text-sm font-medium font-inter" style={{ color: 'var(--foreground-color)' }}>What do you need?</label>
                  <select 
                    value={searchCategory}
                    onChange={(e) => setSearchCategory(e.target.value)}
                    className="w-full px-3 lg:px-4 py-2.5 lg:py-3 bg-white border border-platform-grey rounded-platform font-inter focus:outline-none focus:ring-2 focus:ring-active focus:border-active text-sm lg:text-base"
                    style={{ color: 'var(--foreground-color)' }}
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium font-inter" style={{ color: 'var(--foreground-color)' }}>Location</label>
                  <select className="w-full px-3 lg:px-4 py-2.5 lg:py-3 bg-white border border-platform-grey rounded-platform font-inter focus:outline-none focus:ring-2 focus:ring-active focus:border-active text-sm lg:text-base" style={{ color: 'var(--foreground-color)' }}>
                    <option>🇷🇼 Kigali</option>
                    <option>🇰🇪 Nairobi</option>
                    <option>🇿🇦 Cape Town</option>
                    <option>🇳🇬 Lagos</option>
                    <option>🇬🇭 Accra</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium font-inter" style={{ color: 'var(--foreground-color)' }}>Start Date</label>
                  <input
                    type="date"
                    defaultValue="2025-07-15"
                    className="w-full px-3 lg:px-4 py-2.5 lg:py-3 bg-white border border-platform-grey rounded-platform font-inter focus:outline-none focus:ring-2 focus:ring-active focus:border-active text-sm lg:text-base"
                    style={{ color: 'var(--foreground-color)' }}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium font-inter" style={{ color: 'var(--foreground-color)' }}>Duration</label>
                  <select className="w-full px-3 lg:px-4 py-2.5 lg:py-3 bg-white border border-platform-grey rounded-platform font-inter focus:outline-none focus:ring-2 focus:ring-active focus:border-active text-sm lg:text-base" style={{ color: 'var(--foreground-color)' }}>
                    <option>1 Day</option>
                    <option>2-3 Days</option>
                    <option>1 Week</option>
                    <option>2+ Weeks</option>
                  </select>
                </div>
                
                <div className="sm:col-span-2 lg:col-span-1 xl:col-span-1 flex items-end">
                  <button 
                    onClick={handleSearch}
                    className="btn-primary w-full flex items-center justify-center space-x-2 font-outfit text-sm lg:text-base py-2.5 lg:py-3 px-4 lg:px-6"
                  >
                    <Bot className="w-4 h-4 lg:w-5 lg:h-5" />
                    <span>AI Search</span>
                  </button>
                </div>
              </div>
            
              {/* Quick AI Suggestions */}
              <div className="mt-4 lg:mt-6 flex flex-wrap gap-2">
                <span className="text-sm text-platform-grey font-inter">AI Suggestions:</span>
                {[
                  { text: '📷 Camera gear nearby', category: 'electronics' },
                  { text: '🔧 Power tools today', category: 'tools' },
                  { text: '⛺ Camping equipment', category: 'outdoor' },
                  { text: '🎸 Musical instruments', category: 'entertainment' }
                ].map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => navigate(`/items/search?category=${suggestion.category}`)}
                    className="px-2 lg:px-3 py-1 bg-active/10 text-active rounded-full text-xs lg:text-sm hover:bg-active/20 transition-colors duration-200 font-inter"
                  >
                    {suggestion.text}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;