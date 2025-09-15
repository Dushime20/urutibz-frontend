import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Palette, 
  Languages, 
  Clock, 
  DollarSign, 
  Users, 
  Shield, 
  Search, 
  Star, 
  Mail, 
  Phone, 
  FileText, 
  BarChart3,
  Cookie,
  Image,
  Settings
} from 'lucide-react';
import type { PlatformSettings } from '../../../types/adminSettings.types';

interface PlatformSettingsFormProps {
  settings: PlatformSettings;
  onUpdate: (updates: Partial<PlatformSettings>) => void;
  isLoading: boolean;
  theme: any;
}

const PlatformSettingsForm: React.FC<PlatformSettingsFormProps> = ({
  settings,
  onUpdate,
  isLoading,
}) => {
  const [formData, setFormData] = useState<PlatformSettings>(settings);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleChange = (field: keyof PlatformSettings, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
  };

  const handleSupportedLanguagesChange = (value: string) => {
    const languages = value.split(',').map(lang => lang.trim()).filter(lang => lang);
    handleChange('supportedLanguages', languages);
  };

  const formatSupportedLanguages = (languages: string[] | undefined) => {
    return languages && Array.isArray(languages) ? languages.join(', ') : '';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Version Indicator */}
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
          <span className="text-sm font-medium text-green-800 dark:text-green-200">
            ✅ Complete Platform Settings - All 30+ API Fields Integrated
          </span>
        </div>
      </div>

      {/* Site Information */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Globe className="w-5 h-5 mr-2" />
          Site Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Site Name
            </label>
            <input
              type="text"
              value={formData.siteName}
              onChange={(e) => handleChange('siteName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
              placeholder="Enter site name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Site Tagline
            </label>
            <input
              type="text"
              value={formData.siteTagline}
              onChange={(e) => handleChange('siteTagline', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
              placeholder="Enter site tagline"
            />
          </div>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Site Description
          </label>
          <textarea
            value={formData.siteDescription}
            onChange={(e) => handleChange('siteDescription', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
            rows={3}
            placeholder="Enter site description"
          />
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            SEO Keywords
          </label>
          <input
            type="text"
            value={formData.siteKeywords}
            onChange={(e) => handleChange('siteKeywords', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
            placeholder="rental, marketplace, equipment, tools"
          />
        </div>
      </div>

      {/* Branding */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Palette className="w-5 h-5 mr-2" />
          Branding & Colors
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Primary Color
            </label>
            <div className="flex items-center">
              <input
                type="color"
                value={formData.primaryColor}
                onChange={(e) => handleChange('primaryColor', e.target.value)}
                className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded-lg mr-3"
              />
              <input
                type="text"
                value={formData.primaryColor}
                onChange={(e) => handleChange('primaryColor', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
                placeholder="#3B82F6"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Secondary Color
            </label>
            <div className="flex items-center">
              <input
                type="color"
                value={formData.secondaryColor}
                onChange={(e) => handleChange('secondaryColor', e.target.value)}
                className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded-lg mr-3"
              />
              <input
                type="text"
                value={formData.secondaryColor}
                onChange={(e) => handleChange('secondaryColor', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
                placeholder="#10B981"
              />
            </div>
          </div>
        </div>
        
        {/* Logo and favicon URL fields removed per requirements */}
      </div>

      {/* Localization */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Languages className="w-5 h-5 mr-2" />
          Localization & Currency
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Default Language
            </label>
            <select
              value={formData.defaultLanguage}
              onChange={(e) => handleChange('defaultLanguage', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
            >
              <option value="en">English</option>
              <option value="fr">French</option>
              <option value="sw">Swahili</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Timezone
            </label>
            <select
              value={formData.timezone}
              onChange={(e) => handleChange('timezone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
            >
              <option value="Africa/Kigali">Africa/Kigali</option>
              <option value="UTC">UTC</option>
              <option value="America/New_York">America/New_York</option>
              <option value="Europe/London">Europe/London</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date Format
            </label>
            <select
              value={formData.dateFormat}
              onChange={(e) => handleChange('dateFormat', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Currency
            </label>
            <select
              value={formData.currency}
              onChange={(e) => handleChange('currency', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
            >
              <option value="RWF">RWF (Rwandan Franc)</option>
              <option value="USD">USD (US Dollar)</option>
              <option value="EUR">EUR (Euro)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Currency Symbol
            </label>
            <input
              type="text"
              value={formData.currencySymbol}
              onChange={(e) => handleChange('currencySymbol', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
              placeholder="₣"
            />
          </div>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Supported Languages
          </label>
          <input
            type="text"
            value={formatSupportedLanguages(formData.supportedLanguages || [])}
            onChange={(e) => handleSupportedLanguagesChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
            placeholder="en, fr, sw"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Separate languages with commas
          </p>
        </div>
      </div>

      {/* User Management */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2" />
          User Management
        </h3>
        
        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.allowUserRegistration}
              onChange={(e) => handleChange('allowUserRegistration', e.target.checked)}
              className="w-4 h-4 text-my-primary border-gray-300 dark:border-gray-600 rounded focus:ring-my-primary dark:bg-gray-800"
            />
            <div className="ml-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Allow new user registration
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Enable new users to create accounts
              </p>
            </div>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.requireEmailVerification}
              onChange={(e) => handleChange('requireEmailVerification', e.target.checked)}
              className="w-4 h-4 text-my-primary border-gray-300 dark:border-gray-600 rounded focus:ring-my-primary dark:bg-gray-800"
            />
            <div className="ml-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Require email verification
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Users must verify their email address
              </p>
            </div>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.allowGuestBookings}
              onChange={(e) => handleChange('allowGuestBookings', e.target.checked)}
              className="w-4 h-4 text-my-primary border-gray-300 dark:border-gray-600 rounded focus:ring-my-primary dark:bg-gray-800"
            />
            <div className="ml-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Allow bookings without registration
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Enable guest checkout functionality
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Content Management */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Shield className="w-5 h-5 mr-2" />
          Content Management
        </h3>
        
        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.autoApproveListings}
              onChange={(e) => handleChange('autoApproveListings', e.target.checked)}
              className="w-4 h-4 text-my-primary border-gray-300 dark:border-gray-600 rounded focus:ring-my-primary dark:bg-gray-800"
            />
            <div className="ml-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Auto-approve new listings
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Automatically approve new product listings
              </p>
            </div>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.requireListingVerification}
              onChange={(e) => handleChange('requireListingVerification', e.target.checked)}
              className="w-4 h-4 text-my-primary border-gray-300 dark:border-gray-600 rounded focus:ring-my-primary dark:bg-gray-800"
            />
            <div className="ml-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Require listing verification
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Verify listings before they go live
              </p>
            </div>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.moderationEnabled}
              onChange={(e) => handleChange('moderationEnabled', e.target.checked)}
              className="w-4 h-4 text-my-primary border-gray-300 dark:border-gray-600 rounded focus:ring-my-primary dark:bg-gray-800"
            />
            <div className="ml-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Enable content moderation
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Moderate user-generated content
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Search & Display */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Search className="w-5 h-5 mr-2" />
          Search & Display
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Radius (km)
            </label>
            <input
              type="number"
              value={formData.searchRadius}
              onChange={(e) => handleChange('searchRadius', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
              min="1"
              max="1000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Max Search Results
            </label>
            <input
              type="number"
              value={formData.maxSearchResults}
              onChange={(e) => handleChange('maxSearchResults', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
              min="10"
              max="200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Featured Listings Count
            </label>
            <input
              type="number"
              value={formData.featuredListingsCount}
              onChange={(e) => handleChange('featuredListingsCount', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
              min="1"
              max="20"
            />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Mail className="w-5 h-5 mr-2" />
          Contact Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Contact Email
            </label>
            <input
              type="email"
              value={formData.contactEmail}
              onChange={(e) => handleChange('contactEmail', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
              placeholder="support@urutibiz.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Contact Phone
            </label>
            <input
              type="tel"
              value={formData.contactPhone}
              onChange={(e) => handleChange('contactPhone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
              placeholder="+250 123 456 789"
            />
          </div>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Support Hours
          </label>
          <input
            type="text"
            value={formData.supportHours}
            onChange={(e) => handleChange('supportHours', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
            placeholder="Mon-Fri 8AM-6PM"
          />
        </div>
      </div>

      {/* Legal Pages */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          Legal Pages
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Terms of Service URL
            </label>
            <input
              type="url"
              value={formData.termsOfServiceUrl}
              onChange={(e) => handleChange('termsOfServiceUrl', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
              placeholder="/terms"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Privacy Policy URL
            </label>
            <input
              type="url"
              value={formData.privacyPolicyUrl}
              onChange={(e) => handleChange('privacyPolicyUrl', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
              placeholder="/privacy"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cookie Policy URL
            </label>
            <input
              type="url"
              value={formData.cookiePolicyUrl}
              onChange={(e) => handleChange('cookiePolicyUrl', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
              placeholder="/cookies"
            />
          </div>
        </div>
      </div>

      {/* Analytics & Tracking */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2" />
          Analytics & Tracking
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Google Analytics ID
            </label>
            <input
              type="text"
              value={formData.googleAnalyticsId}
              onChange={(e) => handleChange('googleAnalyticsId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
              placeholder="GA-XXXXXXXXX-X"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Facebook Pixel ID
            </label>
            <input
              type="text"
              value={formData.facebookPixelId}
              onChange={(e) => handleChange('facebookPixelId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
              placeholder="123456789012345"
            />
          </div>
        </div>
        
        <div className="mt-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.enableCookies}
              onChange={(e) => handleChange('enableCookies', e.target.checked)}
              className="w-4 h-4 text-my-primary border-gray-300 dark:border-gray-600 rounded focus:ring-my-primary dark:bg-gray-800"
            />
            <div className="ml-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Enable cookie consent
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Show cookie consent banner to users
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          type="submit"
          disabled={isLoading}
          className="bg-my-primary hover:bg-opacity-80 text-white px-6 py-2 rounded-lg transition-colors flex items-center disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

export default PlatformSettingsForm;