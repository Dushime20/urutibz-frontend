import React, { useState } from 'react';
import { ArrowRight, Bot, MapPin, Star, Shield, Heart, TrendingUp } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const FeaturedRentalsSection: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('trending');
  const navigate = useNavigate();

  const filters = [
    { id: 'trending', label: 'AI Trending', icon: TrendingUp },
    { id: 'popular', label: 'Community Favorites', icon: Heart },
    { id: 'new', label: 'Recently Added', icon: Bot },
    { id: 'verified', label: 'AI Verified', icon: Shield }
  ];

  const featuredItems = [
    {
      id: 1,
      title: 'Professional Camera Kit',
      description: 'Canon EOS R5 with multiple lenses, perfect for events',
      price: 45,
      period: 'day',
      originalPrice: 65,
      location: 'Kigali, Rwanda',
      distance: '1.2 km',
      owner: {
        name: 'Amara N.',
        avatar: '/assets/img/profiles/avatar-01.jpg',
        rating: 4.9,
        verified: true
      },
      image: '/assets/img/car-list-1.jpg',
      category: 'Electronics',
      aiMatch: 98,
      trending: true,
      features: ['Professional grade', 'Multiple lenses', 'Full accessories'],
      booked: 23
    },
    {
      id: 2,
      title: 'Electric Drill Set',
      description: 'Complete power tool set for construction and DIY projects',
      price: 15,
      period: 'day',
      originalPrice: 25,
      location: 'Nairobi, Kenya',
      distance: '2.1 km',
      owner: {
        name: 'James M.',
        avatar: '/assets/img/profiles/avatar-02.jpg',
        rating: 4.8,
        verified: true
      },
      image: '/assets/img/car-list-2.jpg',
      category: 'Tools & Equipment',
      aiMatch: 95,
      trending: true,
      features: ['Professional grade', 'Multiple bits', 'Fast charging'],
      booked: 18
    },
    {
      id: 3,
      title: '4-Person Camping Tent',
      description: 'Waterproof tent perfect for weekend getaways',
      price: 25,
      period: 'day',
      originalPrice: 35,
      location: 'Cape Town, SA',
      distance: '3.5 km',
      owner: {
        name: 'Sarah K.',
        avatar: '/assets/img/profiles/avatar-03.jpg',
        rating: 4.9,
        verified: true
      },
      image: '/assets/img/car-list-3.jpg',
      category: 'Outdoor Gear',
      aiMatch: 92,
      trending: false,
      features: ['Waterproof', 'Easy setup', 'Spacious'],
      booked: 31
    },
    {
      id: 4,
      title: 'Gaming Console Setup',
      description: 'PS5 with controllers and popular games included',
      price: 35,
      period: 'day',
      originalPrice: 50,
      location: 'Lagos, Nigeria',
      distance: '1.8 km',
      owner: {
        name: 'David O.',
        avatar: '/assets/img/profiles/avatar-04.jpg',
        rating: 4.7,
        verified: true
      },
      image: '/assets/img/car-list-4.jpg',
      category: 'Entertainment',
      aiMatch: 89,
      trending: true,
      features: ['Latest games', '2 controllers', 'HDMI included'],
      booked: 15
    }
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20 xl:py-24" style={{ backgroundColor: 'var(--background-color)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8 lg:mb-12">
          <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-3 lg:px-4 py-2 rounded-full border border-teal-200 shadow-sm mb-4 lg:mb-6">
            <Bot className="w-3 h-3 lg:w-4 lg:h-4 text-active" />
            <span className="text-xs lg:text-sm font-medium text-active font-outfit">AI-Curated Selection</span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-outfit mb-3 lg:mb-4" style={{ color: 'var(--foreground-color)' }}>
            Featured <span className="text-active">Rentals</span>
          </h2>
          <p className="text-base lg:text-lg leading-relaxed text-platform-grey max-w-2xl mx-auto font-inter px-4">
            Handpicked by our AI based on your preferences, location, and community ratings.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-6 lg:mb-8 px-4">
          {filters.map((filter) => {
            const IconComponent = filter.icon;
            return (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`flex items-center space-x-1.5 lg:space-x-2 px-3 lg:px-4 py-2 rounded-full font-medium transition-all duration-200 font-outfit text-sm lg:text-base ${
                  activeFilter === filter.id
                    ? 'bg-active text-white shadow-active'
                    : 'bg-white text-platform-grey hover:bg-active/10 hover:text-active border border-platform-light-grey'
                }`}
              >
                <IconComponent className="w-3 h-3 lg:w-4 lg:h-4" />
                <span className="hidden sm:inline">{filter.label}</span>
              </button>
            );
          })}
        </div>

        {/* Featured Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-8 lg:mb-12">
          {featuredItems.map((item) => (
            <div 
              key={item.id} 
              className="card group cursor-pointer overflow-hidden hover:shadow-active transition-all duration-300 hover:-translate-y-1"
              onClick={() => navigate(`/item/${item.id}`)}
            >
              {/* Image */}
              <div className="relative">
                <img 
                  src={item.image} 
                  alt={item.title}
                  className="w-full h-36 sm:h-40 lg:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Badges */}
                <div className="absolute top-2 lg:top-3 left-2 lg:left-3 flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
                  {item.trending && (
                    <div className="bg-active text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                      <TrendingUp className="w-2.5 h-2.5 lg:w-3 lg:h-3" />
                      <span className="hidden sm:inline">Trending</span>
                    </div>
                  )}
                  <div className="bg-white/90 backdrop-blur-sm text-active px-2 py-1 rounded-full text-xs font-medium">
                    {item.aiMatch}% AI
                  </div>
                </div>
                
                {/* Wishlist */}
                <button className="absolute top-2 lg:top-3 right-2 lg:right-3 w-7 h-7 lg:w-8 lg:h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors">
                  <Heart className="w-3 h-3 lg:w-4 lg:h-4 text-platform-grey hover:text-red-500" />
                </button>
              </div>
              
              {/* Content */}
              <div className="p-3 lg:p-4">
                <div className="mb-2 lg:mb-3">
                  <h3 className="font-semibold font-outfit mb-1 text-sm lg:text-base line-clamp-1" style={{ color: 'var(--foreground-color)' }}>{item.title}</h3>
                  <p className="text-xs lg:text-sm text-platform-grey font-inter line-clamp-2">{item.description}</p>
                </div>
                
                {/* Features */}
                <div className="flex flex-wrap gap-1 mb-2 lg:mb-3">
                  {item.features.slice(0, 2).map((feature, index) => (
                    <span key={index} className="bg-platform-light-grey text-platform-grey px-1.5 lg:px-2 py-0.5 lg:py-1 rounded text-xs font-inter">
                      {feature}
                    </span>
                  ))}
                </div>
                
                {/* Location & Distance */}
                <div className="flex items-center text-xs lg:text-sm text-platform-grey mb-2 lg:mb-3 font-inter">
                  <MapPin className="w-2.5 h-2.5 lg:w-3 lg:h-3 mr-1 flex-shrink-0" />
                  <span className="truncate">{item.location}</span>
                  <span className="mx-1 lg:mx-2">•</span>
                  <span className="flex-shrink-0">{item.distance} away</span>
                </div>
                
                {/* Owner */}
                <div className="flex items-center space-x-2 mb-2 lg:mb-3">
                  <img 
                    src={item.owner.avatar} 
                    alt={item.owner.name}
                    className="w-5 h-5 lg:w-6 lg:h-6 rounded-full"
                  />
                  <span className="text-xs lg:text-sm font-medium font-inter truncate" style={{ color: 'var(--foreground-color)' }}>{item.owner.name}</span>
                  {item.owner.verified && (
                    <Shield className="w-2.5 h-2.5 lg:w-3 lg:h-3 text-active flex-shrink-0" />
                  )}
                  <div className="flex items-center space-x-1 ml-auto">
                    <Star className="w-2.5 h-2.5 lg:w-3 lg:h-3 text-yellow-500 fill-current" />
                    <span className="text-xs text-platform-grey font-inter">{item.owner.rating}</span>
                  </div>
                </div>
                
                {/* Price & CTA */}
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-base lg:text-lg font-bold text-active font-outfit">${item.price}</span>
                    <span className="text-xs lg:text-sm text-platform-grey font-inter">/{item.period}</span>
                    {item.originalPrice && (
                      <span className="text-xs text-platform-grey line-through ml-1 lg:ml-2 font-inter">${item.originalPrice}</span>
                    )}
                  </div>
                  <button 
                    className="btn-primary text-xs lg:text-sm px-3 lg:px-4 py-2 font-outfit"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/item/${item.id}`);
                    }}
                  >
                    Book Now
                  </button>
                </div>
                
                {/* Booking Stats */}
                <div className="text-xs text-platform-grey font-inter">
                  Booked {item.booked} times this month
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <Link 
            to="/items" 
            className="btn-secondary inline-flex items-center space-x-2 font-outfit"
          >
            <span>View All Items</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedRentalsSection;
