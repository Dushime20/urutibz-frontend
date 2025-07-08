import React from 'react';
import { Car, Wrench, Camera, Tent, Music, Gamepad2, Bot, Sparkles, TrendingUp } from 'lucide-react';

const CategorySection: React.FC = () => {
  const categories = [
    {
      icon: Car,
      name: 'Vehicles',
      count: '8,500+ Items',
      description: 'Cars, bikes, scooters and more for every journey',
      gradient: 'from-blue-100 to-blue-200',
      iconColor: 'text-blue-600',
      trending: '+15% this week'
    },
    {
      icon: Wrench,
      name: 'Tools & Equipment',
      count: '12,200+ Items',
      description: 'Power tools, machinery, and professional equipment',
      gradient: 'from-green-100 to-green-200',
      iconColor: 'text-green-600',
      trending: '+23% this week'
    },
    {
      icon: Camera,
      name: 'Electronics',
      count: '6,800+ Items',
      description: 'Cameras, drones, audio gear, and tech devices',
      gradient: 'from-purple-100 to-purple-200',
      iconColor: 'text-purple-600',
      trending: '+18% this week'
    },
    {
      icon: Tent,
      name: 'Outdoor & Sports',
      count: '5,400+ Items',
      description: 'Camping gear, sports equipment, and adventure tools',
      gradient: 'from-emerald-100 to-emerald-200',
      iconColor: 'text-emerald-600',
      trending: '+31% this week'
    },
    {
      icon: Music,
      name: 'Event & Party',
      count: '3,200+ Items',
      description: 'Sound systems, decorations, and celebration essentials',
      gradient: 'from-pink-100 to-pink-200',
      iconColor: 'text-pink-600',
      trending: '+27% this week'
    },
    {
      icon: Gamepad2,
      name: 'Entertainment',
      count: '2,900+ Items',
      description: 'Gaming consoles, projectors, and fun activities',
      gradient: 'from-orange-100 to-orange-200',
      iconColor: 'text-orange-600',
      trending: '+12% this week'
    }
  ];
  return (
    <section className="py-12 sm:py-16 lg:py-20 xl:py-24" style={{ backgroundColor: 'var(--background-color)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 lg:mb-16">
          <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-3 lg:px-4 py-2 rounded-full border border-teal-200 shadow-sm mb-4 lg:mb-6">
            <Bot className="w-3 h-3 lg:w-4 lg:h-4 text-active" />
            <span className="text-xs lg:text-sm font-medium text-active font-outfit">AI-Curated Categories</span>
            <Sparkles className="w-3 h-3 lg:w-4 lg:h-4 text-yellow-500" />
          </div>
          
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-outfit mb-3 lg:mb-4" style={{ color: 'var(--foreground-color)' }}>
            Rent What You Need, <span className="text-active">When You Need It</span>
          </h2>
          <p className="text-base lg:text-lg leading-relaxed text-platform-grey max-w-2xl mx-auto font-inter px-4">
            From everyday essentials to specialized equipment, our AI connects you with trusted community members who have exactly what you're looking for.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 lg:mb-12">
          {categories.map((category, index) => {
            const IconComponent = category.icon;
            return (
              <div
                key={index}
                className="card p-4 sm:p-6 lg:p-8 text-center hover:shadow-active transition-all duration-300 cursor-pointer group hover:-translate-y-2 relative overflow-hidden"
              >
                {/* Trending Badge */}
                <div className="absolute top-2 sm:top-3 lg:top-4 right-2 sm:right-3 lg:right-4 flex items-center space-x-1 bg-active/10 text-active px-2 py-1 rounded-full text-xs font-medium">
                  <TrendingUp className="w-2.5 h-2.5 lg:w-3 lg:h-3" />
                  <span className="font-outfit hidden sm:inline">{category.trending}</span>
                </div>
                
                {/* Icon */}
                <div className={`w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 bg-gradient-to-br ${category.gradient} rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <IconComponent className={`w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 ${category.iconColor}`} />
                </div>
                
                {/* Content */}
                <h3 className="text-base sm:text-lg font-semibold font-outfit mb-2 lg:mb-3" style={{ color: 'var(--foreground-color)' }}>{category.name}</h3>
                <p className="text-sm sm:text-base lg:text-lg font-bold text-active mb-2 lg:mb-3 font-outfit">{category.count}</p>
                <p className="text-sm lg:text-base text-platform-grey font-inter px-2">{category.description}</p>
                
                {/* AI Match Indicator */}
                <div className="mt-3 lg:mt-4 inline-flex items-center space-x-1 bg-active/10 text-active px-2 lg:px-3 py-1 rounded-full text-xs lg:text-sm font-medium">
                  <Bot className="w-2.5 h-2.5 lg:w-3 lg:h-3" />
                  <span className="font-outfit">AI-matched</span>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Bottom Stats & CTA */}
        <div className="card p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            {/* Stats */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold font-outfit flex items-center space-x-2" style={{ color: 'var(--foreground-color)' }}>
                <Bot className="w-5 h-5 text-active" />
                <span>AI-Powered Insights</span>
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-platform-grey font-inter">Average match accuracy</span>
                  <span className="font-semibold text-active font-outfit">96.8%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-platform-grey font-inter">Booking success rate</span>
                  <span className="font-semibold text-active font-outfit">94.2%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-platform-grey font-inter">Community satisfaction</span>
                  <span className="font-semibold text-active font-outfit">4.9/5</span>
                </div>
              </div>
            </div>
            
            {/* Popular Locations */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold font-outfit" style={{ color: 'var(--foreground-color)' }}>Popular Locations</h3>
              <div className="space-y-2">
                {[
                  { city: 'Kigali, Rwanda', items: '3.2K items' },
                  { city: 'Nairobi, Kenya', items: '2.8K items' },
                  { city: 'Cape Town, SA', items: '2.1K items' },
                  { city: 'Lagos, Nigeria', items: '1.9K items' }
                ].map((location, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm text-platform-grey font-inter">{location.city}</span>
                    <div className="bg-active/10 text-active px-2 py-1 rounded-full text-xs font-medium font-outfit">
                      {location.items}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* CTA */}
            <div className="text-center space-y-3 lg:space-y-4">
              <h3 className="text-base lg:text-lg font-semibold font-outfit" style={{ color: 'var(--foreground-color)' }}>Can't Find Your Category?</h3>
              <p className="text-sm text-platform-grey mb-3 lg:mb-4 font-inter">
                Our AI learns from every search to expand our categories and improve matches.
              </p>
              <button className="btn-primary w-full flex items-center justify-center space-x-2 font-outfit text-sm lg:text-base py-3 px-4">
                <Sparkles className="w-4 h-4" />
                <span>Suggest New Category</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategorySection;