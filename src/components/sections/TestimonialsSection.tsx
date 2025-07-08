import React from 'react';
import { Star, Quote, Bot, MapPin, Heart, Sparkles, TrendingUp } from 'lucide-react';

const TestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      name: 'Amara Nkomo',
      role: 'Small Business Owner',
      location: 'Kigali, Rwanda',
      avatar: '/assets/img/profiles/avatar-01.jpg',
      rating: 5,
      rental: 'Professional Camera Kit',
      comment: 'The AI matching was incredible! Found exactly the camera equipment I needed for my wedding photography business just 2 blocks away. The owner was so helpful and the quality was perfect.',
      aiFeature: 'Smart Location Match',
      earnings: 'Also earned $320 this month sharing my unused equipment!'
    },
    {
      name: 'Kofi Asante',
      role: 'University Student',
      location: 'Nairobi, Kenya',
      avatar: '/assets/img/profiles/avatar-02.jpg',
      rating: 5,
      rental: 'Power Drill Set',
      comment: 'As a student, this platform has been a lifesaver! Rented power tools for my thesis project at a fraction of buying cost. The AI suggested everything I needed in one go.',
      aiFeature: 'Bundle Recommendations',
      earnings: 'Saved over $200 compared to buying!'
    },
    {
      name: 'Priya Mbeki',
      role: 'Event Planner',
      location: 'Cape Town, South Africa',
      avatar: '/assets/img/profiles/avatar-03.jpg',
      rating: 5,
      rental: 'Sound System & Projector',
      comment: 'The community here is amazing! Rented sound equipment for a corporate event and the owner even helped with setup. AI verification gave me complete confidence in the transaction.',
      aiFeature: 'Trust & Safety AI',
      earnings: 'Built relationships with 5+ local suppliers!'
    },
    {
      name: 'James Okonkwo',
      role: 'Freelance Filmmaker',
      location: 'Lagos, Nigeria',
      avatar: '/assets/img/profiles/avatar-02.jpg',
      rating: 5,
      rental: 'Drone & Lighting Kit',
      comment: 'This platform connected me with fellow creatives in my city. The AI predicted exactly what additional gear I\'d need based on my project description. Pure magic!',
      aiFeature: 'Predictive Suggestions',
      earnings: 'Completed 3 projects with rented gear worth $2,000+'
    },
    {
      name: 'Fatima Al-Zahra',
      role: 'Adventure Guide',
      location: 'Marrakech, Morocco',
      avatar: '/assets/img/profiles/avatar-01.jpg',
      rating: 5,
      rental: 'Camping Equipment',
      comment: 'The international platform made it easy to rent quality camping gear for tourists. Language barriers disappeared with the AI translation, and payments were seamless across borders.',
      aiFeature: 'Multi-language AI',
      earnings: 'Expanded my business to serve international clients!'
    },
    {
      name: 'Ahmed Hassan',
      role: 'Carpenter',
      location: 'Cairo, Egypt',
      avatar: '/assets/img/profiles/avatar-03.jpg',
      rating: 5,
      rental: 'Specialized Wood Tools',
      comment: 'I list my professional tools when not in use and rent specialized equipment when needed. The AI scheduling prevents conflicts and maximizes my income. This platform changed my business!',
      aiFeature: 'Smart Scheduling',
      earnings: 'Extra $450/month from tool sharing!'
    }
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20 xl:py-24 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-200 shadow-sm mb-6">
            <Heart className="w-4 h-4 text-red-500" />
            <span className="text-sm font-medium text-blue-700">Community Stories</span>
            <Sparkles className="w-4 h-4 text-yellow-500" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            Real Stories from Our <span className="text-blue-600">Global Community</span>
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg leading-relaxed">
            Discover how AI-powered matching is connecting people across the world, building trust, and creating opportunities in local communities.
          </p>
        </div>
        
        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-2 border border-white/50 relative overflow-hidden">
              {/* AI Feature Badge */}
              <div className="absolute top-4 right-4 flex items-center space-x-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                <Bot className="w-3 h-3" />
                <span>{testimonial.aiFeature}</span>
              </div>
              
              {/* Quote and Rating */}
              <div className="flex items-center mb-4">
                <Quote className="w-6 h-6 text-blue-600 mr-3 opacity-60" />
                <div className="flex">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
              
              {/* Rental Info */}
              <div className="mb-4 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                <div className="text-sm font-medium text-blue-700 mb-1">Rented: {testimonial.rental}</div>
                <div className="flex items-center text-xs text-slate-600">
                  <MapPin className="w-3 h-3 mr-1" />
                  <span>{testimonial.location}</span>
                </div>
              </div>
              
              {/* Comment */}
              <p className="text-slate-600 mb-6 leading-relaxed text-sm">{testimonial.comment}</p>
              
              {/* Earnings/Impact */}
              <div className="mb-6 p-3 bg-green-50/50 rounded-lg border border-green-100">
                <div className="flex items-center text-sm font-medium text-green-700">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  <span>{testimonial.earnings}</span>
                </div>
              </div>
              
              {/* User Info */}
              <div className="flex items-center">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full mr-3 border-2 border-white shadow-md"
                />
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm">{testimonial.name}</h4>
                  <p className="text-xs text-slate-500">{testimonial.role}</p>
                  <div className="flex items-center text-xs text-slate-500 mt-1">
                    <MapPin className="w-3 h-3 mr-1" />
                    <span>{testimonial.location}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Community Stats */}
        <div className="bg-white/60 backdrop-blur-md rounded-2xl p-8 border border-white/50 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-2xl font-bold text-blue-600">96.8%</div>
              <div className="text-sm text-slate-600">Customer Satisfaction</div>
              <div className="flex items-center justify-center text-xs text-green-600">
                <TrendingUp className="w-3 h-3 mr-1" />
                <span>+2.3% this month</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-2xl font-bold text-green-600">$2.8M+</div>
              <div className="text-sm text-slate-600">Community Earnings</div>
              <div className="flex items-center justify-center text-xs text-green-600">
                <TrendingUp className="w-3 h-3 mr-1" />
                <span>This year alone</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-2xl font-bold text-purple-600">145K+</div>
              <div className="text-sm text-slate-600">Successful Rentals</div>
              <div className="flex items-center justify-center text-xs text-green-600">
                <TrendingUp className="w-3 h-3 mr-1" />
                <span>Zero major issues</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-2xl font-bold text-orange-600">40+</div>
              <div className="text-sm text-slate-600">Countries Active</div>
              <div className="flex items-center justify-center text-xs text-green-600">
                <TrendingUp className="w-3 h-3 mr-1" />
                <span>Growing weekly</span>
              </div>
            </div>
          </div>
          
          {/* Bottom CTA */}
          <div className="mt-8 text-center">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Join Our Thriving Community</h3>
            <p className="text-slate-600 text-sm mb-4">
              Start earning from your unused items or find exactly what you need in your neighborhood.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2">
                <Bot className="w-4 h-4" />
                <span>Start Renting</span>
              </button>
              <button className="border-2 border-slate-300 bg-white/80 backdrop-blur-sm text-slate-700 hover:bg-white hover:border-slate-400 font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2">
                <Heart className="w-4 h-4 text-red-500" />
                <span>Share Your Story</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;