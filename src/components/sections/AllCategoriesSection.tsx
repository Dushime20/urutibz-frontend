import React, { useState } from 'react';
import { 
  Car, Truck, Wrench, Camera, Tent, Music, Gamepad2, 
  Bike, Laptop, Sparkles, Bot, Search, Filter,
  Hammer, Headphones, Projector, Dumbbell, Baby,
  Palette, BookOpen, Coffee, Zap, MapPin, TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AllCategoriesSection: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');

  const categories = [
    // Transportation
    { icon: Car, name: 'Cars', count: 8420, color: 'text-blue-600', bg: 'bg-blue-100', trending: true },
    { icon: Bike, name: 'Bikes & Scooters', count: 3240, color: 'text-green-600', bg: 'bg-green-100', trending: true },
    { icon: Truck, name: 'Trucks & Vans', count: 1850, color: 'text-purple-600', bg: 'bg-purple-100', trending: false },
    
    // Tools & Equipment
    { icon: Wrench, name: 'Power Tools', count: 5670, color: 'text-orange-600', bg: 'bg-orange-100', trending: true },
    { icon: Hammer, name: 'Hand Tools', count: 4320, color: 'text-red-600', bg: 'bg-red-100', trending: false },
    { icon: Zap, name: 'Generators', count: 890, color: 'text-yellow-600', bg: 'bg-yellow-100', trending: true },
    
    // Electronics
    { icon: Camera, name: 'Cameras & Photo', count: 2980, color: 'text-indigo-600', bg: 'bg-indigo-100', trending: true },
    { icon: Laptop, name: 'Laptops & Tablets', count: 1560, color: 'text-blue-600', bg: 'bg-blue-100', trending: false },
    { icon: Headphones, name: 'Audio Equipment', count: 2140, color: 'text-purple-600', bg: 'bg-purple-100', trending: true },
    { icon: Projector, name: 'Projectors & Screens', count: 750, color: 'text-pink-600', bg: 'bg-pink-100', trending: false },
    
    // Outdoor & Sports
    { icon: Tent, name: 'Camping Gear', count: 3450, color: 'text-emerald-600', bg: 'bg-emerald-100', trending: true },
    { icon: Dumbbell, name: 'Fitness Equipment', count: 1890, color: 'text-red-600', bg: 'bg-red-100', trending: true },
    
    // Entertainment
    { icon: Music, name: 'Musical Instruments', count: 1240, color: 'text-violet-600', bg: 'bg-violet-100', trending: false },
    { icon: Gamepad2, name: 'Gaming Consoles', count: 980, color: 'text-cyan-600', bg: 'bg-cyan-100', trending: true },
    
    // Events & Parties
    { icon: Sparkles, name: 'Party Supplies', count: 2560, color: 'text-pink-600', bg: 'bg-pink-100', trending: true },
    { icon: Coffee, name: 'Catering Equipment', count: 780, color: 'text-amber-600', bg: 'bg-amber-100', trending: false },
    
    // Specialized
    { icon: Baby, name: 'Baby & Kids', count: 1670, color: 'text-rose-600', bg: 'bg-rose-100', trending: true },
    { icon: Palette, name: 'Art & Craft', count: 920, color: 'text-teal-600', bg: 'bg-teal-100', trending: false },
    { icon: BookOpen, name: 'Books & Education', count: 650, color: 'text-slate-600', bg: 'bg-slate-100', trending: false }
  ];

  const regions = [
    { value: 'all', label: 'All Regions', flag: '🌍' },
    { value: 'africa', label: 'Africa', flag: '🌍' },
    { value: 'europe', label: 'Europe', flag: '🇪🇺' },
    { value: 'asia', label: 'Asia', flag: '🌏' },
    { value: 'americas', label: 'Americas', flag: '🌎' }
  ];

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalItems = categories.reduce((sum, category) => sum + category.count, 0);

  return (
    <section className="py-12 sm:py-16 lg:py-20 xl:py-24 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-200 shadow-sm mb-6">
            <Bot className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">AI-Organized Categories</span>
            <Sparkles className="w-4 h-4 text-yellow-500" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            Discover <span className="text-blue-600">{totalItems.toLocaleString()}+ Items</span> Across All Categories
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg leading-relaxed">
            From everyday essentials to specialized equipment, our global community has everything you need. AI-powered search makes finding the perfect item effortless.
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 mb-12 shadow-lg border border-white/50">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="pl-10 pr-8 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700 appearance-none"
                >
                  {regions.map(region => (
                    <option key={region.value} value={region.value}>
                      {region.flag} {region.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2">
                <Bot className="w-4 h-4" />
                <span>AI Search</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 mb-12">
          {filteredCategories.map((category, index) => {
            const IconComponent = category.icon;
            return (
              <Link
                key={index}
                to={`/browse?category=${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center hover:shadow-xl transition-all duration-300 group hover:-translate-y-1 border border-white/50 relative"
              >
                {/* Trending Badge */}
                {category.trending && (
                  <div className="absolute -top-2 -right-2 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>Hot</span>
                  </div>
                )}
                
                {/* Icon */}
                <div className={`w-16 h-16 ${category.bg} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <IconComponent className={`w-8 h-8 ${category.color}`} />
                </div>
                
                {/* Content */}
                <h3 className="font-semibold text-slate-800 text-sm mb-2 group-hover:text-blue-600 transition-colors duration-200">
                  {category.name}
                </h3>
                <p className="text-xs text-slate-500 mb-2">{category.count.toLocaleString()} items</p>
                
                {/* AI Match Indicator */}
                <div className="inline-flex items-center space-x-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                  <Bot className="w-3 h-3" />
                  <span>AI-matched</span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Stats and CTA Section */}
        <div className="bg-white/60 backdrop-blur-md rounded-2xl p-8 border border-white/50 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            {/* Global Stats */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                <span>Global Availability</span>
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">🇷🇼 Rwanda</span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">3.2K items</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">🇰🇪 Kenya</span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">2.8K items</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">🇿🇦 South Africa</span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">2.1K items</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">🇳🇬 Nigeria</span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">1.9K items</span>
                </div>
              </div>
            </div>
            
            {/* AI Features */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center space-x-2">
                <Bot className="w-5 h-5 text-blue-600" />
                <span>AI-Powered Features</span>
              </h3>
              <div className="space-y-2">
                {[
                  { feature: 'Smart matching', accuracy: '96.8%' },
                  { feature: 'Price optimization', accuracy: '94.2%' },
                  { feature: 'Quality prediction', accuracy: '98.1%' },
                  { feature: 'Availability forecast', accuracy: '92.5%' }
                ].map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">{item.feature}</span>
                    <span className="font-semibold text-green-600 text-sm">{item.accuracy}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* CTA */}
            <div className="text-center space-y-4">
              <h3 className="text-lg font-semibold text-slate-800">Explore All Categories</h3>
              <p className="text-sm text-slate-600 mb-4">
                Discover items you never knew were available in your community.
              </p>
              <div className="space-y-3">
                <Link
                  to="/items"
                  className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Browse All Items
                </Link>
                <Link
                  to="/create-listing"
                  className="block w-full border-2 border-slate-300 bg-white/80 backdrop-blur-sm text-slate-700 hover:bg-white hover:border-slate-400 font-semibold py-3 px-6 rounded-xl transition-all duration-200"
                >
                  List Your Items
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AllCategoriesSection;