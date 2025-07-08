import React from 'react';
import { Link } from 'react-router-dom';
import { CurrencySelector, LanguageSelector } from '../ui/DesignSystem';

const categories = [
  { name: 'Photography', path: '/categories/photography' },
  { name: 'Electronics', path: '/categories/electronics' },
  { name: 'Tools', path: '/categories/tools' },
  { name: 'Sports', path: '/categories/sports' },
  { name: 'Home', path: '/categories/home' },
  { name: 'Vehicles', path: '/categories/vehicles' },
];

const currencies = [
  { code: 'USD', symbol: '$', flag: '🇺🇸' },
  { code: 'RWF', symbol: 'FRw', flag: '🇷🇼' },
  { code: 'KES', symbol: 'KSh', flag: '🇰🇪' },
  { code: 'UGX', symbol: 'USh', flag: '🇺🇬' },
  { code: 'EUR', symbol: '€', flag: '🇪🇺' },
];

const languages = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'rw', label: 'Kinyarwanda', flag: '🇷🇼' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'sw', label: 'Swahili', flag: '🇰🇪' },
];

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-r from-active-dark to-active text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="inline-block mb-6">
              <img src="/assets/img/urutibz-logo-white.svg" alt="UrutiBz" className="h-10" />
            </Link>
            <p className="text-white/80 mb-4">
              UrutiBz is your AI-powered, international rental platform. Rent anything, anytime—photography, electronics, tools, sports, home, vehicles, and more.
            </p>
            <div className="flex space-x-4 mt-4">
              {/* Social icons */}
              <a href="#" className="text-white/60 hover:text-white transition-colors duration-200" aria-label="Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-facebook"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
              <a href="#" className="text-white/60 hover:text-white transition-colors duration-200" aria-label="Twitter">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-twitter"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
              </a>
              <a href="#" className="text-white/60 hover:text-white transition-colors duration-200" aria-label="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-instagram"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 font-outfit">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link to="/" className="text-white/80 hover:text-white transition-colors duration-200">Home</Link></li>
              <li><Link to="/categories" className="text-white/80 hover:text-white transition-colors duration-200">Categories</Link></li>
              <li><Link to="/faq" className="text-white/80 hover:text-white transition-colors duration-200">FAQ</Link></li>
              <li><Link to="/login" className="text-white/80 hover:text-white transition-colors duration-200">Login</Link></li>
              <li><Link to="/register" className="text-white/80 hover:text-white transition-colors duration-200">Register</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 font-outfit">Popular Categories</h3>
            <ul className="space-y-3">
              {categories.map(cat => (
                <li key={cat.name}><Link to={cat.path} className="text-white/80 hover:text-white transition-colors duration-200">{cat.name}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 font-outfit">Contact & Support</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="mr-2">🌍</span>
                <span className="text-white/80">International: +250 788 123 456</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✉️</span>
                <span className="text-white/80">support@urutibz.com</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">🕒</span>
                <span className="text-white/80">24/7 AI & Human Support</span>
              </li>
            </ul>
            <div className="mt-4 flex gap-2">
              {/* Currency selector */}
              <CurrencySelector 
                currencies={currencies} 
                className="bg-white text-platform-dark-grey rounded-platform px-2 py-1 text-sm border border-white/20 focus:outline-none"
                aria-label="Select currency"
              />
              {/* Language selector */}
              <LanguageSelector 
                languages={languages} 
                className="bg-white text-platform-dark-grey rounded-platform px-2 py-1 text-sm border border-white/20 focus:outline-none"
                aria-label="Select language"
              />
            </div>
          </div>
        </div>
        
        <div className="border-t border-white/20 mt-12 pt-8 text-center text-white/80">
          <p>© {new Date().getFullYear()} UrutiBz. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
