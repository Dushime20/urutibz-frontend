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
    <footer className="bg-[#0b0d0f] text-white">
      <div className=" mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-20 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="inline-block mb-6">
              <img src="/assets/img/yacht/urutilogo2.png" alt="UrutiBz" className="h-10 w-auto object-contain drop-shadow" />
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
            <h3 className="text-lg font-semibold mb-4 font-outfit">Company</h3>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-white/80 hover:text-white transition-colors duration-200">About</Link></li>
              <li><Link to="/careers" className="text-white/80 hover:text-white transition-colors duration-200">Careers</Link></li>
              <li><Link to="/contact" className="text-white/80 hover:text-white transition-colors duration-200">Contact</Link></li>
              <li><Link to="/terms" className="text-white/80 hover:text-white transition-colors duration-200">Terms</Link></li>
              <li><Link to="/privacy" className="text-white/80 hover:text-white transition-colors duration-200">Privacy</Link></li>
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
                <span className="mr-2">✉</span>
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
        
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between text-white/70 text-sm">
          <p>© {new Date().getFullYear()} UrutiBz. All rights reserved.</p>
          <div className="mt-4 md:mt-0 flex items-center gap-3">
            <img src="/assets/img/yacht/urutilogo2.png" alt="UrutiBz" className="h-6 w-auto opacity-90" />
            <span className="hidden sm:inline">Rent anything near you</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;