import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Bot, Shield, Globe, Sparkles, HelpCircle, MessageCircle } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
  category: 'general' | 'ai' | 'safety' | 'payments' | 'international';
}

export const FaqSection: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const toggleFaq = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const categories = [
    { id: 'all', label: 'All Questions', icon: HelpCircle },
    { id: 'general', label: 'Getting Started', icon: Sparkles },
    { id: 'ai', label: 'AI Features', icon: Bot },
    { id: 'safety', label: 'Trust & Safety', icon: Shield },
    { id: 'payments', label: 'Payments & Earnings', icon: Globe },
    { id: 'international', label: 'International', icon: Globe }
  ];

  const faqs: FaqItem[] = [
    {
      question: "How does the AI-powered matching work?",
      answer: "Our AI analyzes your requirements, location, budget, and preferences to find the perfect matches from our community. It considers factors like proximity, item condition, owner ratings, availability, and past successful rentals to suggest the best options with 96.8% accuracy.",
      category: 'ai'
    },
    {
      question: "What items can I rent on the platform?",
      answer: "You can rent almost anything! From vehicles and power tools to cameras, camping gear, musical instruments, and party supplies. Our AI organizes items into categories and helps you discover equipment you might not have known was available nearby.",
      category: 'general'
    },
    {
      question: "How does the platform ensure safety and trust?",
      answer: "We use AI-powered verification for all users and items, comprehensive insurance coverage, secure payments held in escrow, 24/7 community support, and a robust rating system. Every transaction is protected, and our AI monitors for fraudulent activity in real-time.",
      category: 'safety'
    },
    {
      question: "Can I rent items from other countries?",
      answer: "Yes! Our platform operates in 40+ countries with automatic currency conversion, multi-language support, and international shipping coordination for eligible items. AI helps match you with trusted international owners and handles cross-border logistics.",
      category: 'international'
    },
    {
      question: "How do I earn money by listing my items?",
      answer: "Simply list your unused items with photos and descriptions. Our AI suggests optimal pricing based on demand, location, and similar items. You keep 85% of rental income, receive payments automatically, and can track earnings through your dashboard. Average users earn $320-450 monthly.",
      category: 'payments'
    },
    {
      question: "What if an item gets damaged during rental?",
      answer: "All rentals include damage protection. Our AI-powered inspection system documents item condition before and after each rental. If damage occurs, our claims team handles everything, and you're compensated promptly. Most claims are resolved within 24-48 hours.",
      category: 'safety'
    },
    {
      question: "How does pricing work and can I negotiate?",
      answer: "Our AI analyzes market demand, item condition, location, and seasonal trends to suggest fair pricing. While owners set their rates, our smart pricing recommendations help both parties. Some owners allow negotiation for longer rentals or repeat customers.",
      category: 'payments'
    },
    {
      question: "What languages does the platform support?",
      answer: "Our AI provides real-time translation in 40+ languages including English, French, Swahili, Arabic, Portuguese, and local African languages. Communication barriers are eliminated, making international rentals seamless and building global community connections.",
      category: 'international'
    },
    {
      question: "How quickly can I get an item after booking?",
      answer: "Depends on the item and location! Many items are available for same-day pickup. Our AI considers urgent requests and suggests the fastest available options. Express delivery is available in major cities, with some items delivered within 2-4 hours.",
      category: 'general'
    },
    {
      question: "What happens if the AI suggests items I don't need?",
      answer: "Our AI learns from your feedback! Rate suggestions, save preferences, and specify exactly what you need. The more you use the platform, the better our recommendations become. You can also provide detailed requirements for more accurate matching.",
      category: 'ai'
    },
    {
      question: "Are there any membership fees or hidden costs?",
      answer: "The platform is free to join and browse. We only charge a small service fee (12-15%) on completed transactions, which covers insurance, AI services, payment processing, and 24/7 support. No hidden fees, no monthly charges, no surprise costs.",
      category: 'payments'
    },
    {
      question: "How do I resolve disputes with other users?",
      answer: "Our AI-powered mediation system helps resolve most issues automatically. For complex disputes, our trained community managers step in. We maintain detailed transaction histories, communication logs, and have a fair resolution process that typically resolves issues within 2-3 days.",
      category: 'safety'
    }
  ];

  const filteredFaqs = activeCategory === 'all' 
    ? faqs 
    : faqs.filter(faq => faq.category === activeCategory);

  return (
    <section className="py-12 sm:py-16 lg:py-20 xl:py-24 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-200 shadow-sm mb-6">
              <HelpCircle className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Community Support</span>
              <Sparkles className="w-4 h-4 text-yellow-500" />
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              Frequently Asked <span className="text-blue-600">Questions</span>
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg leading-relaxed">
              Get instant answers to common questions about our AI-powered rental platform. Can't find what you're looking for? Our community support team is here to help 24/7.
            </p>
          </div>

          {/* Category Filter */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 mb-8 shadow-lg border border-white/50">
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

          {/* FAQ Items */}
          <div className="space-y-4 mb-12">
            {filteredFaqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-blue-50/50 transition-colors duration-200"
                >
                  <span className="text-lg font-semibold text-slate-800 pr-4">
                    {faq.question}
                  </span>
                  <div className="flex-shrink-0">
                    {activeIndex === index ? (
                      <ChevronUp className="h-6 w-6 text-blue-600" />
                    ) : (
                      <ChevronDown className="h-6 w-6 text-slate-400" />
                    )}
                  </div>
                </button>

                {activeIndex === index && (
                  <div className="px-6 pb-6 border-t border-blue-100/50">
                    <div className="pt-4">
                      <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Help Center CTA */}
          <div className="bg-white/60 backdrop-blur-md rounded-2xl p-8 border border-white/50 shadow-lg text-center">
            <div className="max-w-2xl mx-auto">
              <div className="flex justify-center mb-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <MessageCircle className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-slate-800 mb-3">
                Still Have Questions?
              </h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Our AI-powered help center and community support team are available 24/7 to assist you. Get personalized answers and connect with experienced community members.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2">
                  <Bot className="w-5 h-5" />
                  <span>Ask AI Assistant</span>
                </button>
                <button className="border-2 border-slate-300 bg-white/80 backdrop-blur-sm text-slate-700 hover:bg-white hover:border-slate-400 font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2">
                  <MessageCircle className="w-5 h-5" />
                  <span>Contact Support</span>
                </button>
              </div>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-600">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Average response: 2 minutes</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Available in 40+ languages</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>97% satisfaction rate</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FaqSection;