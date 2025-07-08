import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Card, Input } from '../../components/ui/DesignSystem';
import VerificationLayout from '../../components/verification/VerificationLayout';
import { Navigate, useNavigate } from 'react-router-dom';
import { MapPin, CheckCircle } from 'lucide-react';

const AddressVerificationPage: React.FC = () => {
  const { user, updateUser, updateVerificationStatus } = useAuth();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zipCode: user?.address?.zipCode || '',
    country: user?.address?.country || ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect if ID not verified
  if (!user?.verification.isIdVerified) {
    return <Navigate to="/verify/id" replace />;
  }

  // Redirect if already verified
  if (user?.verification.isAddressVerified) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.street.trim()) {
      newErrors.street = 'Street address is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State/Province is required';
    }

    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'ZIP/Postal code is required';
    }

    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call for address verification
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update user address
      updateUser({
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          zipCode: formData.zipCode
        }
      });

      // Mark address as verified
      updateVerificationStatus({
        isAddressVerified: true
      });

      // Navigate to dashboard - verification complete!
      navigate('/dashboard');
    } catch (error) {
      console.error('Address verification failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const countries = [
    { value: '', label: 'Select Country' },
    { value: 'US', label: 'United States' },
    { value: 'CA', label: 'Canada' },
    { value: 'GB', label: 'United Kingdom' },
    { value: 'AU', label: 'Australia' },
    { value: 'DE', label: 'Germany' },
    { value: 'FR', label: 'France' },
    { value: 'KE', label: 'Kenya' },
    { value: 'NG', label: 'Nigeria' },
    { value: 'ZA', label: 'South Africa' },
    { value: 'RW', label: 'Rwanda' },
    { value: 'GH', label: 'Ghana' },
    { value: 'UG', label: 'Uganda' },
    { value: 'TZ', label: 'Tanzania' },
    { value: 'EG', label: 'Egypt' },
    { value: 'MA', label: 'Morocco' },
    // Add more countries as needed
  ];

  return (
    <VerificationLayout
      currentStep="address"
      title="Verify Your Address"
      description="Confirm your residential address to complete the verification process and unlock all platform features."
    >
      <Card className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              Final Step: Confirm Your Address
            </h3>
            <p className="text-slate-600">
              This helps us ensure safety and enables location-based features
            </p>
          </div>

          {/* Street Address */}
          <div>
            <label htmlFor="street" className="block text-sm font-medium text-slate-700 mb-2">
              Street Address *
            </label>
            <Input
              id="street"
              name="street"
              type="text"
              value={formData.street}
              onChange={handleInputChange}
              error={errors.street}
              placeholder="123 Main Street, Apt 4B"
            />
          </div>

          {/* City and State */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-slate-700 mb-2">
                City *
              </label>
              <Input
                id="city"
                name="city"
                type="text"
                value={formData.city}
                onChange={handleInputChange}
                error={errors.city}
                placeholder="New York"
              />
            </div>
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-slate-700 mb-2">
                State/Province *
              </label>
              <Input
                id="state"
                name="state"
                type="text"
                value={formData.state}
                onChange={handleInputChange}
                error={errors.state}
                placeholder="NY"
              />
            </div>
          </div>

          {/* ZIP and Country */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="zipCode" className="block text-sm font-medium text-slate-700 mb-2">
                ZIP/Postal Code *
              </label>
              <Input
                id="zipCode"
                name="zipCode"
                type="text"
                value={formData.zipCode}
                onChange={handleInputChange}
                error={errors.zipCode}
                placeholder="10001"
              />
            </div>
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-slate-700 mb-2">
                Country *
              </label>
              <select
                id="country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                  errors.country ? 'border-red-500' : 'border-slate-300'
                }`}
              >
                {countries.map(country => (
                  <option key={country.value} value={country.value}>
                    {country.label}
                  </option>
                ))}
              </select>
              {errors.country && (
                <p className="text-red-600 text-sm mt-1">{errors.country}</p>
              )}
            </div>
          </div>

          {/* Success Message Preview */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="font-medium text-green-800">Almost there!</span>
            </div>
            <p className="text-sm text-green-700">
              Once you submit this address, your account will be fully verified and you'll be able to list items and rent from others.
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              type="submit"
              variant="primary"
              loading={isLoading}
              className="w-full"
            >
              {isLoading ? 'Completing Verification...' : 'Complete Verification'}
            </Button>
          </div>

          <div className="text-xs text-slate-500 text-center">
            Your address information is encrypted and only used for verification and safety purposes.
          </div>
        </form>
      </Card>
    </VerificationLayout>
  );
};

export default AddressVerificationPage;
