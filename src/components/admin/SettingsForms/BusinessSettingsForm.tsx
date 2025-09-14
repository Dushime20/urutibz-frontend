import React, { useState, useEffect } from 'react';
import { 
  Building, 
  DollarSign, 
  Globe, 
  Phone, 
  Mail, 
  MapPin, 
  ExternalLink,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Upload,
  X,
  Clock
} from 'lucide-react';
import type { BusinessSettings } from '../../../types/adminSettings.types';

interface BusinessSettingsFormProps {
  settings: BusinessSettings;
  onUpdate: (updates: Partial<BusinessSettings>) => void;
  onLogoUpload?: (logoFile: File) => Promise<{ success: boolean; message: string; logoUrl?: string }>;
  isLoading: boolean;
  theme: any;
}

const BusinessSettingsForm: React.FC<BusinessSettingsFormProps> = ({
  settings,
  onUpdate,
  onLogoUpload,
  isLoading,
}) => {
  const [formData, setFormData] = useState<BusinessSettings>(settings);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleChange = (field: keyof BusinessSettings, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (parent: keyof BusinessSettings, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent] as any),
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Handle logo file upload separately if there's a file and upload function is available
      if (formData.companyLogo && typeof formData.companyLogo === 'string' && formData.companyLogo.startsWith('data:') && onLogoUpload) {
        // Convert base64 to file
        const base64Data = formData.companyLogo.split(',')[1];
        const file = new File([Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))], 'logo.png', { type: 'image/png' });
        
        // Upload logo to separate endpoint
        const logoResult = await onLogoUpload(file);
        
        if (logoResult.success && logoResult.logoUrl) {
          // Update form data with the new logo URL
          const updatedFormData = { ...formData, companyLogo: logoResult.logoUrl };
          await onUpdate(updatedFormData);
        } else {
          console.error('Logo upload failed:', logoResult.message);
          // Still update other settings even if logo upload fails
          const { companyLogo, ...otherData } = formData;
          await onUpdate(otherData);
        }
      } else {
        // Regular form submission without file
        await onUpdate(formData);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'RWF', name: 'Rwandan Franc', symbol: 'RF' },
    { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
    { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh' },
  ];

  const businessTypes = [
    { value: 'marketplace', label: 'Marketplace', description: 'Connect buyers and sellers' },
    { value: 'rental', label: 'Rental Platform', description: 'Focus on rental services' },
    { value: 'both', label: 'Both', description: 'Marketplace with rental features' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Company Information */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Building className="w-5 h-5 mr-2" />
          Company Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Company Name *
            </label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => handleChange('companyName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Business Type
            </label>
            <select
              value={formData.businessType}
              onChange={(e) => handleChange('businessType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
            >
              {businessTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label} - {type.description}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Auto Approval */}
        <div className="mt-6">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.autoApproval || false}
              onChange={(e) => handleChange('autoApproval', e.target.checked)}
              className="w-4 h-4 text-my-primary bg-gray-100 border-gray-300 rounded focus:ring-my-primary dark:focus:ring-teal-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Auto-approve bookings
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Automatically approve bookings without manual review
              </p>
            </div>
          </label>
        </div>

        {/* Company Logo */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Company Logo
          </label>
          <div className="flex items-center space-x-4">
            {formData.companyLogo ? (
              <div className="relative">
                <img
                  src={formData.companyLogo}
                  alt="Company Logo"
                  className="w-16 h-16 object-contain border border-gray-300 dark:border-gray-600 rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => handleChange('companyLogo', '')}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="w-16 h-16 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center">
                <Upload className="w-6 h-6 text-gray-400" />
              </div>
            )}
            <label className="bg-my-primary hover:bg-opacity-80 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors">
              Upload Logo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      handleChange('companyLogo', event.target?.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Financial Settings */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <DollarSign className="w-5 h-5 mr-2" />
          Financial Settings
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Default Currency
            </label>
            <select
              value={formData.currency}
              onChange={(e) => handleChange('currency', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
            >
              {currencies.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.code} - {currency.name} ({currency.symbol})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tax Rate (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={formData.taxRate}
              onChange={(e) => handleChange('taxRate', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Commission Rate (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={formData.commissionRate}
              onChange={(e) => handleChange('commissionRate', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Supported Currencies
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {currencies.map((currency) => (
              <label key={currency.code} className="flex items-center">
                <input
                  type="checkbox"
                  checked={Array.isArray(formData.supportedCurrencies) && formData.supportedCurrencies.includes(currency.code)}
                  onChange={(e) => {
                    const currencies = Array.isArray(formData.supportedCurrencies) ? formData.supportedCurrencies : [];
                    if (e.target.checked) {
                      handleChange('supportedCurrencies', [...currencies, currency.code]);
                    } else {
                      handleChange('supportedCurrencies', currencies.filter(c => c !== currency.code));
                    }
                  }}
                  className="w-4 h-4 text-my-primary border-gray-300 dark:border-gray-600 rounded focus:ring-my-primary dark:bg-gray-800"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  {currency.code} - {currency.name}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Booking Settings */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Booking Settings
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Minimum Booking Duration (days)
            </label>
            <input
              type="number"
              min="1"
              value={formData.minimumBookingDuration}
              onChange={(e) => handleChange('minimumBookingDuration', parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Maximum Booking Duration (days)
            </label>
            <input
              type="number"
              min="1"
              value={formData.maximumBookingDuration}
              onChange={(e) => handleChange('maximumBookingDuration', parseInt(e.target.value) || 365)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
            />
          </div>
        </div>
      </div>

      {/* Timezone Settings */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2" />
          Timezone Settings
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Timezone
            </label>
            <select
              value={formData.timezone}
              onChange={(e) => handleChange('timezone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
            >
              <option value="Africa/Kigali">Africa/Kigali (GMT+2)</option>
              <option value="Africa/Nairobi">Africa/Nairobi (GMT+3)</option>
              <option value="Africa/Cairo">Africa/Cairo (GMT+2)</option>
              <option value="Africa/Johannesburg">Africa/Johannesburg (GMT+2)</option>
              <option value="Europe/London">Europe/London (GMT+0)</option>
              <option value="Europe/Paris">Europe/Paris (GMT+1)</option>
              <option value="America/New_York">America/New_York (GMT-5)</option>
              <option value="America/Los_Angeles">America/Los_Angeles (GMT-8)</option>
              <option value="Asia/Tokyo">Asia/Tokyo (GMT+9)</option>
              <option value="Asia/Shanghai">Asia/Shanghai (GMT+8)</option>
              <option value="UTC">UTC (GMT+0)</option>
            </select>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Select the timezone for your business operations
            </p>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Phone className="w-5 h-5 mr-2" />
          Contact Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={formData.contactInfo?.email || ''}
              onChange={(e) => handleNestedChange('contactInfo', 'email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.contactInfo?.phone || ''}
              onChange={(e) => handleNestedChange('contactInfo', 'phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Website
            </label>
            <input
              type="url"
              value={formData.contactInfo?.website || ''}
              onChange={(e) => handleNestedChange('contactInfo', 'website', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Address
            </label>
            <textarea
              value={formData.contactInfo?.address || ''}
              onChange={(e) => handleNestedChange('contactInfo', 'address', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
            />
          </div>
        </div>
      </div>

      {/* Social Media */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Globe className="w-5 h-5 mr-2" />
          Social Media Links
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
              <Facebook className="w-4 h-4 mr-2 text-my-primary" />
              Facebook
            </label>
            <input
              type="url"
              value={formData.socialMedia?.facebook || ''}
              onChange={(e) => handleNestedChange('socialMedia', 'facebook', e.target.value)}
              placeholder="https://facebook.com/yourpage"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
              <Twitter className="w-4 h-4 mr-2 text-teal-400" />
              Twitter
            </label>
            <input
              type="url"
              value={formData.socialMedia?.twitter || ''}
              onChange={(e) => handleNestedChange('socialMedia', 'twitter', e.target.value)}
              placeholder="https://twitter.com/yourhandle"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
              <Instagram className="w-4 h-4 mr-2 text-pink-600" />
              Instagram
            </label>
            <input
              type="url"
              value={formData.socialMedia?.instagram || ''}
              onChange={(e) => handleNestedChange('socialMedia', 'instagram', e.target.value)}
              placeholder="https://instagram.com/yourhandle"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
              <Linkedin className="w-4 h-4 mr-2 text-teal-700" />
              LinkedIn
            </label>
            <input
              type="url"
              value={formData.socialMedia?.linkedin || ''}
              onChange={(e) => handleNestedChange('socialMedia', 'linkedin', e.target.value)}
              placeholder="https://linkedin.com/company/yourcompany"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
            />
          </div>
        </div>
      </div>

      {/* Policies */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Policies & Terms
        </h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cancellation Policy
            </label>
            <textarea
              value={formData.cancellationPolicy}
              onChange={(e) => handleChange('cancellationPolicy', e.target.value)}
              rows={4}
              placeholder="Describe your cancellation policy..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Refund Policy
            </label>
            <textarea
              value={formData.refundPolicy}
              onChange={(e) => handleChange('refundPolicy', e.target.value)}
              rows={4}
              placeholder="Describe your refund policy..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Terms of Service
            </label>
            <textarea
              value={formData.termsOfService}
              onChange={(e) => handleChange('termsOfService', e.target.value)}
              rows={4}
              placeholder="Enter your terms of service..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Privacy Policy
            </label>
            <textarea
              value={formData.privacyPolicy}
              onChange={(e) => handleChange('privacyPolicy', e.target.value)}
              rows={4}
              placeholder="Enter your privacy policy..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
            />
          </div>
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

export default BusinessSettingsForm;
