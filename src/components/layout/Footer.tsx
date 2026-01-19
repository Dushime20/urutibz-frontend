import React from 'react';
import { Link } from 'react-router-dom';
import { CurrencySelector } from '../ui/DesignSystem';
import { useAdminSettingsContext } from '../../contexts/AdminSettingsContext';
import { useTranslation } from '../../hooks/useTranslation';
import { TranslatedText } from '../translated-text';

const currencies = [
  { code: 'USD', symbol: '$', flag: '🇺🇸' },
  { code: 'RWF', symbol: 'FRw', flag: '🇷🇼' },
  { code: 'KES', symbol: 'KSh', flag: '🇰🇪' },
  { code: 'UGX', symbol: 'USh', flag: '🇺🇬' },
  { code: 'EUR', symbol: '€', flag: '🇪🇺' },
];

const languages = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', flag: '🇰🇪' },
  { code: 'rw', name: 'Kinyarwanda', nativeName: 'Kinyarwanda', flag: '🇷🇼' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', flag: '🇺🇦' }
];

const Footer: React.FC = () => {
  const { settings } = useAdminSettingsContext();
  const { tSync, language, setLanguage } = useTranslation();
  const platform = settings?.platform;
  const business = settings?.business;

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
  };
  return (
    <footer className="bg-[#0b0d0f] text-white">
      <div className=" mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-20 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="inline-block mb-6">
              <img src={business?.companyLogo || "/assets/img/yacht/urutilogo2.png"} alt={business?.companyName || platform?.siteName || tSync('UrutiBz')} className="h-10 w-auto object-contain drop-shadow" />
            </Link>
            <p className="text-white/80 mb-4">
              {(platform?.siteDescription) || <TranslatedText text="Your trusted platform for renting and sharing items. Connect with a community of renters and owners." />}
            </p>
            <div className="flex space-x-4 mt-4">
              {/* Social icons from business settings */}
              {business?.socialMedia?.facebook && (
                <a href={business.socialMedia.facebook} target="_blank" rel="noreferrer" className="text-white/60 hover:text-white transition-colors duration-200" aria-label={tSync('Facebook')}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-facebook"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                </a>
              )}
              {business?.socialMedia?.twitter && (
                <a href={business.socialMedia.twitter} target="_blank" rel="noreferrer" className="text-white/60 hover:text-white transition-colors duration-200" aria-label={tSync('Twitter')}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-twitter"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
                </a>
              )}
              {business?.socialMedia?.instagram && (
                <a href={business.socialMedia.instagram} target="_blank" rel="noreferrer" className="text-white/60 hover:text-white transition-colors duration-200" aria-label={tSync('Instagram')}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-instagram"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </a>
              )}
              {business?.socialMedia?.linkedin && (
                <a href={business.socialMedia.linkedin} target="_blank" rel="noreferrer" className="text-white/60 hover:text-white transition-colors duration-200" aria-label={tSync('LinkedIn')}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-linkedin"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                </a>
              )}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 font-outfit"><TranslatedText text="Quick Links" /></h3>
            <ul className="space-y-3">
              <li><Link to="/" className="text-white/80 hover:text-white transition-colors duration-200"><TranslatedText text="Home" /></Link></li>
              <li><Link to="/categories" className="text-white/80 hover:text-white transition-colors duration-200"><TranslatedText text="Categories" /></Link></li>
              <li><Link to="/faq" className="text-white/80 hover:text-white transition-colors duration-200"><TranslatedText text="FAQ" /></Link></li>
              <li><Link to="/login" className="text-white/80 hover:text-white transition-colors duration-200"><TranslatedText text="Login" /></Link></li>
              <li><Link to="/register" className="text-white/80 hover:text-white transition-colors duration-200"><TranslatedText text="Register" /></Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 font-outfit"><TranslatedText text="Company" /></h3>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-white/80 hover:text-white transition-colors duration-200"><TranslatedText text="About" /></Link></li>
              <li><Link to="/careers" className="text-white/80 hover:text-white transition-colors duration-200"><TranslatedText text="Careers" /></Link></li>
              <li><Link to="/contact" className="text-white/80 hover:text-white transition-colors duration-200"><TranslatedText text="Contact" /></Link></li>
              <li><Link to="/terms" className="text-white/80 hover:text-white transition-colors duration-200"><TranslatedText text="Terms" /></Link></li>
              <li><Link to="/privacy" className="text-white/80 hover:text-white transition-colors duration-200"><TranslatedText text="Privacy" /></Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 font-outfit"><TranslatedText text="Contact & Support" /></h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="mr-2">🌍</span>
                <span className="text-white/80">{platform?.contactPhone || business?.contactInfo?.phone || <TranslatedText text="+1 (555) 123-4567" />}</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✉</span>
                <span className="text-white/80">{platform?.contactEmail || business?.contactInfo?.email || <TranslatedText text="support@urutibz.com" />}</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">🕒</span>
                <span className="text-white/80"><TranslatedText text="24/7 Support Available" /></span>
              </li>
            </ul>
            <div className="mt-4 flex gap-2">
              {/* Currency selector */}
              <CurrencySelector
                currencies={currencies}
                className="bg-white text-platform-dark-grey rounded-platform px-2 py-1 text-sm border border-white/20 focus:outline-none"
                aria-label={tSync('Select Currency')}
              />
              {/* Language selector */}
              <select
                value={language}
                onChange={handleLanguageChange}
                className="bg-white text-platform-dark-grey rounded-platform px-2 py-1 text-sm border border-white/20 focus:outline-none"
                aria-label={tSync('Select Language')}
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.nativeName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between text-white/70 text-sm">
          <p>© {new Date().getFullYear()} {(platform?.siteName || business?.companyName || <TranslatedText text="UrutiBz" />)}. <TranslatedText text="All rights reserved" /></p>
          <div className="mt-4 md:mt-0 flex items-center gap-3">
            <img src={business?.companyLogo || "/assets/img/yacht/urutilogo2.png"} alt={business?.companyName || platform?.siteName || tSync('UrutiBz')} className="h-6 w-auto opacity-90" />
            <span className="hidden sm:inline">{platform?.siteTagline || <TranslatedText text="Rent. Share. Connect." />}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;