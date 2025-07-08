import React, { useState } from 'react';
import { Calendar, ArrowRight, Bot, Globe, TrendingUp, Heart, Eye, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const BlogSection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All Posts', icon: TrendingUp },
    { id: 'ai-tips', label: 'AI & Tech', icon: Bot },
    { id: 'community', label: 'Community', icon: Heart },
    { id: 'international', label: 'Global', icon: Globe }
  ];

  const blogPosts = [
    {
      title: 'How AI Helps You Find the Perfect Rental in Seconds',
      excerpt: 'Discover how our advanced AI algorithms analyze 50+ factors to match you with exactly what you need, when you need it, in your neighborhood.',
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=250&fit=crop',
      author: 'Dr. Amara Nkomo',
      authorRole: 'AI Research Lead',
      authorImage: '/assets/img/profiles/avatar-01.jpg',
      date: 'July 5, 2025',
      readTime: '6 min read',
      views: '2.3K',
      comments: 47,
      category: 'ai-tips',
      featured: true,
      tags: ['AI Matching', 'Technology', 'User Guide']
    },
    {
      title: 'Building Trust Across Borders: International Rental Success Stories',
      excerpt: 'From Kigali to Cape Town, see how our global community is building lasting connections and successful rental relationships across cultures.',
      image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=250&fit=crop',
      author: 'Kofi Asante',
      authorRole: 'Community Manager',
      authorImage: '/assets/img/profiles/avatar-02.jpg',
      date: 'July 3, 2025',
      readTime: '8 min read',
      views: '1.8K',
      comments: 32,
      category: 'international',
      featured: false,
      tags: ['Global Community', 'Success Stories', 'Cross-Cultural']
    },
    {
      title: 'Turn Your Unused Items into Monthly Income: A Complete Guide',
      excerpt: 'Learn proven strategies from top earners who make $400+ monthly by sharing their unused electronics, tools, and equipment with neighbors.',
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=250&fit=crop',
      author: 'Priya Mbeki',
      authorRole: 'Platform Success Coach',
      authorImage: '/assets/img/profiles/avatar-03.jpg',
      date: 'July 1, 2025',
      readTime: '10 min read',
      views: '3.1K',
      comments: 89,
      category: 'community',
      featured: true,
      tags: ['Earning Tips', 'Platform Growth', 'Financial Success']
    },
    {
      title: 'Safety First: How AI-Powered Verification Protects Our Community',
      excerpt: 'Behind the scenes look at our multi-layered AI verification system that maintains 99.2% successful rental rate and keeps everyone safe.',
      image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=250&fit=crop',
      author: 'James Okonkwo',
      authorRole: 'Trust & Safety Director',
      authorImage: '/assets/img/profiles/avatar-02.jpg',
      date: 'June 28, 2025',
      readTime: '7 min read',
      views: '1.5K',
      comments: 23,
      category: 'ai-tips',
      featured: false,
      tags: ['Safety', 'AI Verification', 'Trust & Security']
    },
    {
      title: 'From Student to Entrepreneur: How the Platform Changed My Life',
      excerpt: 'Personal story of a university student in Nairobi who built a thriving equipment rental business using our platform and AI recommendations.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop',
      author: 'Ahmed Hassan',
      authorRole: 'Community Member',
      authorImage: '/assets/img/profiles/avatar-01.jpg',
      date: 'June 25, 2025',
      readTime: '12 min read',
      views: '2.7K',
      comments: 156,
      category: 'community',
      featured: true,
      tags: ['Success Story', 'Entrepreneurship', 'Student Life']
    },
    {
      title: 'Breaking Language Barriers: Real-Time Translation in Action',
      excerpt: 'How our AI-powered translation enables seamless rentals between communities speaking different languages across 40+ countries.',
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=250&fit=crop',
      author: 'Fatima Al-Zahra',
      authorRole: 'International Product Lead',
      authorImage: '/assets/img/profiles/avatar-03.jpg',
      date: 'June 22, 2025',
      readTime: '5 min read',
      views: '1.2K',
      comments: 34,
      category: 'international',
      featured: false,
      tags: ['Translation', 'Global Features', 'Communication']
    }
  ];

  const filteredPosts = activeCategory === 'all' 
    ? blogPosts 
    : blogPosts.filter(post => post.category === activeCategory);

  const featuredPosts = blogPosts.filter(post => post.featured);

  return (
    <section className="py-12 sm:py-16 lg:py-20 xl:py-24 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-200 shadow-sm mb-6">
            <Heart className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">Community Insights</span>
            <Bot className="w-4 h-4 text-yellow-500" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            Stories, Tips & <span className="text-blue-600">AI Insights</span>
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg leading-relaxed">
            Discover success stories from our global community, learn advanced platform tips, and stay updated with the latest AI-powered features that make sharing effortless.
          </p>
        </div>

        {/* Category Filter */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 mb-12 shadow-lg border border-white/50">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                    activeCategory === category.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-white/80 text-slate-600 hover:bg-blue-50 hover:text-blue-700 border border-slate-200'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span className="text-sm">{category.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Featured Posts */}
        {activeCategory === 'all' && (
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-slate-800 mb-8 flex items-center space-x-2">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              <span>Featured Stories</span>
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {featuredPosts.slice(0, 2).map((post, index) => (
                <article 
                  key={index} 
                  className="bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="relative">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                      Featured
                    </div>
                    <div className="absolute bottom-4 right-4 flex space-x-2">
                      {post.tags.slice(0, 2).map((tag, tagIndex) => (
                        <span 
                          key={tagIndex}
                          className="bg-white/90 backdrop-blur-sm text-slate-700 px-2 py-1 rounded-full text-xs font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-slate-600 mb-4 line-clamp-3 leading-relaxed">{post.excerpt}</p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={post.authorImage} 
                          alt={post.author}
                          className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                        />
                        <div>
                          <div className="font-medium text-slate-800 text-sm">{post.author}</div>
                          <div className="text-xs text-slate-500">{post.authorRole}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-xs text-slate-500">
                        <div className="flex items-center space-x-1">
                          <Eye className="w-3 h-3" />
                          <span>{post.views}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="w-3 h-3" />
                          <span>{post.comments}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-slate-500 space-x-4">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{post.date}</span>
                        </div>
                        <span>{post.readTime}</span>
                      </div>
                      
                      <Link
                        to="#"
                        className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Read More
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
        
        {/* All Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {filteredPosts.slice(activeCategory === 'all' ? 2 : 0).map((post, index) => (
            <article 
              key={index} 
              className="bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 group hover:-translate-y-1"
            >
              <div className="relative">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {post.featured && (
                  <div className="absolute top-4 left-4 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                    Featured
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                    {categories.find(cat => cat.id === post.category)?.label || 'General'}
                  </span>
                  <div className="flex items-center space-x-3 text-xs text-slate-500">
                    <div className="flex items-center space-x-1">
                      <Eye className="w-3 h-3" />
                      <span>{post.views}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="w-3 h-3" />
                      <span>{post.comments}</span>
                    </div>
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-slate-600 mb-4 line-clamp-3 text-sm leading-relaxed">{post.excerpt}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <img 
                      src={post.authorImage} 
                      alt={post.author}
                      className="w-6 h-6 rounded-full border border-white shadow-sm"
                    />
                    <div>
                      <div className="font-medium text-slate-800 text-xs">{post.author}</div>
                      <div className="text-xs text-slate-500">{post.readTime}</div>
                    </div>
                  </div>
                  
                  <Link
                    to="#"
                    className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    Read
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="bg-white/60 backdrop-blur-md rounded-2xl p-8 border border-white/50 shadow-lg text-center">
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Bot className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            
            <h3 className="text-2xl font-bold text-slate-800 mb-3">
              Stay Updated with AI Insights
            </h3>
            <p className="text-slate-600 mb-6 leading-relaxed">
              Get weekly updates on platform features, community success stories, and AI-powered tips to maximize your rental experience.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700"
              />
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2">
                <span>Subscribe</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-xs text-slate-500 mt-4">
              Join 8,500+ community members • Unsubscribe anytime • No spam, ever
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;