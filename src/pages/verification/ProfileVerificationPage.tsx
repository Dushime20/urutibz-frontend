import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Card, Input } from '../../components/ui/DesignSystem';
import VerificationLayout from '../../components/verification/VerificationLayout';
import { Navigate, useNavigate } from 'react-router-dom';
import { User, Camera } from 'lucide-react';

const ProfileVerificationPage: React.FC = () => {
  const { user, updateUser, updateVerificationStatus } = useAuth();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.name.split(' ')[0] || '',
    lastName: user?.name.split(' ').slice(1).join(' ') || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth || '',
    bio: '',
    profileImage: user?.avatar || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect if already verified
  if (user?.verification.isProfileComplete) {
    return <Navigate to="/verify/email" replace />;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s\-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 18) {
        newErrors.dateOfBirth = 'You must be at least 18 years old';
      }
    }

    if (!formData.bio.trim()) {
      newErrors.bio = 'A short bio is required';
    } else if (formData.bio.length < 50) {
      newErrors.bio = 'Bio must be at least 50 characters long';
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update user data
      updateUser({
        name: `${formData.firstName} ${formData.lastName}`,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        avatar: formData.profileImage
      });

      // Mark profile as complete
      updateVerificationStatus({
        isProfileComplete: true
      });

      // Navigate to next step
      navigate('/verify/email');
    } catch (error) {
      console.error('Profile update failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you would upload to your server
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({ 
          ...prev, 
          profileImage: e.target?.result as string 
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <VerificationLayout
      currentStep="profile"
      title="Complete Your Profile"
      description="Help us get to know you better by completing your profile information. This helps build trust with other users on the platform."
    >
      <Card className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Image */}
          <div className="text-center">
            <div className="relative inline-block">
              <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                {formData.profileImage ? (
                  <img 
                    src={formData.profileImage} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-slate-400" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-primary-500 text-white p-2 rounded-full cursor-pointer hover:bg-primary-600 transition-colors">
                <Camera className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-sm text-slate-600 mt-2">Upload a profile photo</p>
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 mb-2">
                First Name *
              </label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleInputChange}
                error={errors.firstName}
                placeholder="Enter your first name"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 mb-2">
                Last Name *
              </label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleInputChange}
                error={errors.lastName}
                placeholder="Enter your last name"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">
              Phone Number *
            </label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              error={errors.phone}
              placeholder="+1 (555) 123-4567"
            />
          </div>

          {/* Date of Birth */}
          <div>
            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-slate-700 mb-2">
              Date of Birth *
            </label>
            <Input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              error={errors.dateOfBirth}
            />
            <p className="text-sm text-slate-500 mt-1">You must be at least 18 years old</p>
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-slate-700 mb-2">
              About You *
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={4}
              value={formData.bio}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                errors.bio ? 'border-red-500' : 'border-slate-300'
              }`}
              placeholder="Tell us about yourself, your interests, and why you're joining UrutiBz..."
            />
            {errors.bio && (
              <p className="text-red-600 text-sm mt-1">{errors.bio}</p>
            )}
            <p className="text-sm text-slate-500 mt-1">
              {formData.bio.length}/200 characters (minimum 50)
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
              {isLoading ? 'Saving Profile...' : 'Continue to Email Verification'}
            </Button>
          </div>
        </form>
      </Card>
    </VerificationLayout>
  );
};

export default ProfileVerificationPage;
