import React, { useState } from 'react';
import { ArrowRight, Bot, MapPin, Star, Shield, Heart, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button, AIBadge } from '../ui/DesignSystem';

const FeaturedRentalsSection: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('trending');

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
      category: 'Electronics',
      rating: 4.8,
      reviewCount: 127,
      image: '/assets/img/items/camera-kit.jpg',
      aiMatch: 98,
      trending: true,
      quickBook: true,
      tags: ['Professional', 'Wedding Ready', 'Insurance Included']
    },
    {
      id: 2,
      title: 'Power Drill Set - Makita',
      description: 'Complete cordless drill set with bits and carrying case',
      price: 15,
      period: 'day',
      originalPrice: 25,
      location: 'Nairobi, Kenya',
      distance: '2.8 km',
      owner: {
        name: 'James O.',
        avatar: '/assets/img/profiles/avatar-02.jpg',
        rating: 4.7,
        verified: true
      },
      category: 'Tools',
      rating: 4.9,
      reviewCount: 89,
      image: '/assets/img/items/drill-set.jpg',
      aiMatch: 95,
      trending: false,
      quickBook: true,
      tags: ['DIY Perfect', 'Heavy Duty', 'Same Day Pickup']
    },
    {
      id: 3,
      title: 'BMW 3 Series',
      description: 'Luxury sedan, perfect for business or special occasions',
      price: 80,
      period: 'day',
      originalPrice: 120,
      location: 'Cape Town, SA',
      distance: '3.5 km',
      owner: {
        name: 'Priya M.',
        avatar: '/assets/img/profiles/avatar-03.jpg',
        rating: 4.8,
        verified: true
      },
      category: 'Vehicles',
      rating: 4.7,
      reviewCount: 203,
      image: '/assets/img/items/bmw-sedan.jpg',
      aiMatch: 92,
      trending: true,
      quickBook: false,
      tags: ['Luxury', 'GPS Included', 'Airport Pickup']
    },
    {
      id: 4,
      title: '4-Person Camping Tent',
      description: 'Waterproof family tent with easy setup for adventures',
      price: 25,
      period: 'day',
      originalPrice: 35,
      location: 'Lagos, Nigeria',
      distance: '5.1 km',
      owner: {
        name: 'Ahmed H.',
        avatar: '/assets/img/profiles/avatar-02.jpg',
        rating: 4.6,
        verified: true
      },
      category: 'Outdoor',
      rating: 4.6,
      reviewCount: 156,
      image: '/assets/img/items/camping-tent.jpg',
      aiMatch: 89,
      trending: false,
      quickBook: true,
      tags: ['Family Size', 'Weather Proof', 'Setup Guide']
    },
    {
      id: 5,
      title: 'DJ Sound System',
      description: 'Professional PA system with wireless mics and mixer',
      price: 120,
      period: 'day',
      originalPrice: 180,
      location: 'Accra, Ghana',
      distance: '4.2 km',
      owner: {
        name: 'Kofi A.',
        avatar: '/assets/img/profiles/avatar-01.jpg',
        rating: 4.9,
        verified: true
      },
      category: 'Events',
      rating: 4.8,
      reviewCount: 91,
      image: '/assets/img/items/sound-system.jpg',
      aiMatch: 96,
      trending: true,
      quickBook: false,
      tags: ['Event Ready', 'Setup Included', 'Wireless']
    },
    {
      id: 6,
      title: 'MacBook Pro M3',
      description: '16-inch laptop with video editing software pre-installed',
      price: 60,
      period: 'day',
      originalPrice: 85,
      location: 'Marrakech, Morocco',
      distance: '6.7 km',
      owner: {
        name: 'Fatima A.',
        avatar: '/assets/img/profiles/avatar-03.jpg',
        rating: 4.8,
        verified: true
      },
      category: 'Electronics',
      rating: 4.7,
      reviewCount: 134,
      image: '/assets/img/items/macbook-pro.jpg',
      aiMatch: 94,
      trending: false,
      quickBook: true,
      tags: ['Creative Pro', 'Software Ready', 'Power Adapter']
    }
  ];

  return (
    <section className="section-padding bg-gradient-surface-subtle">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-12">
          <div className="mb-6 lg:mb-0">
            <AIBadge className="mb-4">
              AI-Curated Recommendations
            </AIBadge>
            <h2 className="heading-2 text-text-primary mb-4">
              <span className="text-primary">Featured</span> Community Rentals
            </h2>
            <p className="body-large text-text-secondary max-w-2xl">
              Discover the most popular items from our global community. AI-matched based on your interests, location, and trending demands.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/browse">
              <Button variant="primary" size="lg" className="flex items-center space-x-2">
                <span>Explore All Items</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/list-item">
              <Button variant="secondary" size="lg">
                List Your Items
              </Button>
            </Link>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 mb-8 shadow-lg border border-white/50">
          <div className="flex flex-wrap gap-3 justify-center">
            {filters.map((filter) => {
              const IconComponent = filter.icon;
              return (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                    activeFilter === filter.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-white/80 text-slate-600 hover:bg-blue-50 hover:text-blue-700 border border-slate-200'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span className="text-sm">{filter.label}</span>
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {featuredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 group hover:-translate-y-1"
            >
              {/* Image Section */}
              <div className="relative">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {item.trending && (
                    <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>Trending</span>
                    </div>
                  )}
                  <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                    <Bot className="w-3 h-3" />
                    <span>{item.aiMatch}% AI Match</span>
                  </div>
                </div>
                
                {/* Quick Book */}
                {item.quickBook && (
                  <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                    Quick Book
                  </div>
                )}
                
                {/* Price */}
                <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
                  <div className="text-right">
                    <div className="text-lg font-bold text-slate-800">
                      ${item.price}<span className="text-sm text-slate-600">/{item.period}</span>
                    </div>
                    {item.originalPrice > item.price && (
                      <div className="text-xs text-slate-500 line-through">
                        ${item.originalPrice}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-6">
                {/* Category & Title */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                    {item.category}
                  </span>
                  <div className="flex items-center space-x-1 text-yellow-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-medium text-slate-700">{item.rating}</span>
                    <span className="text-xs text-slate-500">({item.reviewCount})</span>
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors duration-200">
                  {item.title}
                </h3>
                <p className="text-slate-600 text-sm mb-4 line-clamp-2">{item.description}</p>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {item.tags.slice(0, 2).map((tag, index) => (
                    <span
                      key={index}
                      className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                  {item.tags.length > 2 && (
                    <span className="text-xs text-slate-500">
                      +{item.tags.length - 2} more
                    </span>
                  )}
                </div>
                
                {/* Location & Owner */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-slate-600">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{item.distance} away</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <img
                      src={item.owner.avatar}
                      alt={item.owner.name}
                      className="w-6 h-6 rounded-full border border-white shadow-sm"
                    />
                    <span className="text-sm text-slate-600">{item.owner.name}</span>
                    {item.owner.verified && (
                      <Shield className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Stats & CTA */}
        <div className="bg-white/60 backdrop-blur-md rounded-2xl p-8 border border-white/50 shadow-lg text-center">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="space-y-2">
              <div className="text-2xl font-bold text-blue-600">47K+</div>
              <div className="text-sm text-slate-600">Items Available</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-green-600">96.8%</div>
              <div className="text-sm text-slate-600">AI Match Accuracy</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-purple-600">40+</div>
              <div className="text-sm text-slate-600">Countries Active</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-orange-600">4.8/5</div>
              <div className="text-sm text-slate-600">Community Rating</div>
            </div>
          </div>
          
          <h3 className="text-xl font-bold text-slate-800 mb-3">
            Join the Future of Sharing
          </h3>
          <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
            Discover items you never knew were available nearby, or earn money from things you already own. Our AI makes it safe, simple, and rewarding.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2">
              <Bot className="w-5 h-5" />
              <span>Start Exploring</span>
            </button>
            <button className="border-2 border-slate-300 bg-white/80 backdrop-blur-sm text-slate-700 hover:bg-white hover:border-slate-400 font-semibold py-3 px-8 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2">
              <Heart className="w-5 h-5 text-red-500" />
              <span>Join Community</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedRentalsSection;
