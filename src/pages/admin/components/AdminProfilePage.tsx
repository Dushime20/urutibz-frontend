import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  User, 
  Mail, 
  MapPin, 
  Calendar, 
  Globe, 
  DollarSign, 
  Camera, 
  Save, 
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Loader2,
  Shield,
  Phone,
  Building,
  Home,
  Navigation
} from 'lucide-react';
import { adminService, AdminUserProfile } from '../service/adminService';
import { useToast } from '../../../contexts/ToastContext';
import { useTranslation } from '../../../hooks/useTranslation';
import { TranslatedText } from '../../../components/translated-text';

// Form validation schema
const schema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(100, 'Last name too long'),
  email: z.string().email('Invalid email address'),
  bio: z.string().max(500, 'Bio too long').optional(),
  dateOfBirth: z.string().date('Invalid date').optional().or(z.literal('')),
  gender: z.enum(['male', 'female', 'other']).optional(),
  province: z.string().max(100).optional(),
  addressLine: z.string().max(255).optional(),
  district: z.string().max(100).optional(),
  sector: z.string().max(100).optional(),
  cell: z.string().max(100).optional(),
  village: z.string().max(100).optional(),
  preferredCurrency: z.string().max(10).optional(),
  location: z.object({
    lat: z.number().min(-90).max(90).optional(),
    lng: z.number().min(-180).max(180).optional(),
  }).optional(),
});

type FormValues = z.infer<typeof schema>;

const AdminProfilePage: React.FC = () => {
  const { tSync } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<AdminUserProfile | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  // Load profile data (respect global theme)
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const profile = await adminService.getCurrentUserProfile();
        setProfileData(profile);
        
        // Format date for input
        const dob = profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : '';
        
        // Handle location data
        let lat: number | undefined;
        let lng: number | undefined;
        if (profile.location) {
          if (profile.location.coordinates?.latitude != null && profile.location.coordinates?.longitude != null) {
            lat = Number(profile.location.coordinates.latitude);
            lng = Number(profile.location.coordinates.longitude);
          } else if (profile.location.geometry?.type === 'Point' && Array.isArray(profile.location.geometry.coordinates)) {
            lng = Number(profile.location.geometry.coordinates[0]);
            lat = Number(profile.location.geometry.coordinates[1]);
          } else if (Array.isArray(profile.location)) {
            lng = Number(profile.location[0]);
            lat = Number(profile.location[1]);
          } else if (profile.location.lat != null && profile.location.lng != null) {
            lat = Number(profile.location.lat);
            lng = Number(profile.location.lng);
          }
        }

        reset({
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          email: profile.email || '',
          bio: profile.bio || '',
          dateOfBirth: dob,
          gender: profile.gender as any,
          province: profile.province || '',
          addressLine: profile.addressLine || '',
          district: profile.district || '',
          sector: profile.sector || '',
          cell: profile.cell || '',
          village: profile.village || '',
          preferredCurrency: profile.preferred_currency || profile.preferredCurrency || 'USD',
          location: lat !== undefined && lng !== undefined ? { lat, lng } : undefined,
        });
        
        setAvatarUrl(profile.profileImageUrl || null);
      } catch (error) {
        console.error('Error loading profile:', error);
        showToast(tSync('Failed to load profile data'), 'error');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [reset, showToast]);

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    if (!profileData) return;
    
    setSaving(true);
    try {
      const payload = {
        firstName: values.firstName,
        lastName: values.lastName,
        bio: values.bio,
        dateOfBirth: values.dateOfBirth,
        gender: values.gender,
        province: values.province,
        addressLine: values.addressLine,
        district: values.district,
        sector: values.sector,
        cell: values.cell,
        village: values.village,
        preferred_currency: values.preferredCurrency,
        location: values.location && values.location.lat !== undefined && values.location.lng !== undefined 
          ? { lat: values.location.lat, lng: values.location.lng } 
          : undefined,
      };
      
      const updatedProfile = await adminService.updateUserProfile(profileData.id, payload);
      setProfileData(updatedProfile);
      showToast(tSync('Profile updated successfully!'), 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast(tSync('Failed to update profile'), 'error');
    } finally {
      setSaving(false);
    }
  };

  // Handle avatar upload
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profileData) return;

    try {
      setSaving(true);
      const uploadedAvatar = await adminService.uploadUserAvatar(profileData.id, file);
      setAvatarUrl(uploadedAvatar.profileImageUrl);
      
      // Update profile data with new avatar URL
      setProfileData(prev => prev ? { ...prev, profileImageUrl: uploadedAvatar.profileImageUrl } : null);
      
      showToast(tSync('Avatar updated successfully!'), 'success');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      showToast(tSync('Failed to upload avatar'), 'error');
    } finally {
      setSaving(false);
    }
  };

  // Handle immediate currency update (similar to my-account)
  const handleCurrencyChange = async (newCurrency: string) => {
    if (!profileData) return;
    
    try {
      setSaving(true);
      const updatedProfile = await adminService.updateUserProfile(profileData.id, { 
        preferred_currency: newCurrency 
      });
      setProfileData(updatedProfile);
      showToast(tSync('Currency preference updated!'), 'success');
    } catch (error) {
      console.error('Error updating currency:', error);
      showToast(tSync('Failed to update currency preference'), 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-20 h-20 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 text-teal-600 dark:text-teal-400" />
                )}
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 bg-teal-600 text-white p-2 rounded-full hover:bg-teal-700 transition-colors"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                <TranslatedText text="Admin Profile" />
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                <TranslatedText text="Manage your personal information and preferences" />
              </p>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Information */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <User className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                <TranslatedText text="Personal Information" />
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <TranslatedText text="First Name" /> *
                </label>
                <input
                  {...register('firstName')}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    errors.firstName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={tSync('Enter your first name')}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <TranslatedText text="Last Name" /> *
                </label>
                <input
                  {...register('lastName')}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    errors.lastName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={tSync('Enter your last name')}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <TranslatedText text="Email Address" /> *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    {...register('email')}
                    type="email"
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={tSync('Enter your email')}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <TranslatedText text="Date of Birth" />
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    {...register('dateOfBirth')}
                    type="date"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <TranslatedText text="Gender" />
                </label>
                <select
                  {...register('gender')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">{tSync('Select gender')}</option>
                  <option value="male">{tSync('Male')}</option>
                  <option value="female">{tSync('Female')}</option>
                  <option value="other">{tSync('Other')}</option>
                </select>
              </div>

              {/* Bio */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <TranslatedText text="Bio" />
                </label>
                <textarea
                  {...register('bio')}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder={tSync('Tell us about yourself...')}
                />
                {errors.bio && (
                  <p className="text-red-500 text-sm mt-1">{errors.bio.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <MapPin className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                <TranslatedText text="Address Information" />
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Province */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <TranslatedText text="Province" />
                </label>
                <input
                  {...register('province')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder={tSync('Enter province')}
                />
              </div>

              {/* District */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <TranslatedText text="District" />
                </label>
                <input
                  {...register('district')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder={tSync('Enter district')}
                />
              </div>

              {/* Sector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <TranslatedText text="Sector" />
                </label>
                <input
                  {...register('sector')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder={tSync('Enter sector')}
                />
              </div>

              {/* Cell */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <TranslatedText text="Cell" />
                </label>
                <input
                  {...register('cell')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder={tSync('Enter cell')}
                />
              </div>

              {/* Village */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <TranslatedText text="Village" />
                </label>
                <input
                  {...register('village')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder={tSync('Enter village')}
                />
              </div>

              {/* Address Line */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <TranslatedText text="Address Line" />
                </label>
                <input
                  {...register('addressLine')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder={tSync('Enter street address')}
                />
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Shield className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                <TranslatedText text="Account Information" />
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Account Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <TranslatedText text="Account Status" />
                </label>
                <div className="px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                  <span className={`font-medium ${profileData?.status === 'active' ? 'text-green-600 dark:text-green-400' : 
                    profileData?.status === 'pending' ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                    {tSync(profileData?.status || 'Unknown')}
                  </span>
                </div>
              </div>

              {/* Email Verification */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <TranslatedText text="Email Verification" />
                </label>
                <div className="px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                  <span className={profileData?.emailVerified ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                    {profileData?.emailVerified ? tSync('✓ Verified') : tSync('✗ Not Verified')}
                  </span>
                </div>
              </div>

              {/* Phone Verification */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <TranslatedText text="Phone Verification" />
                </label>
                <div className="px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                  <span className={profileData?.phoneVerified ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                    {profileData?.phoneVerified ? tSync('✓ Verified') : tSync('✗ Not Verified')}
                  </span>
                </div>
              </div>

              {/* Member Since */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <TranslatedText text="Member Since" />
                </label>
                <div className="px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                  <span className="text-gray-900 dark:text-gray-100">
                    {profileData?.createdAt ? new Date(profileData.createdAt).toLocaleDateString() : tSync('Unknown')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* KYC Verification Progress */}
          {profileData?.kycProgress && (
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <div className="flex items-center space-x-2 mb-6">
                <CheckCircle className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  <TranslatedText text="KYC Verification Progress" />
                </h2>
              </div>
              
              <div className="space-y-4">
                {/* Overall Progress */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300"><TranslatedText text="Overall Progress" /></span>
                    <span className="text-sm font-bold text-teal-600 dark:text-teal-400">
                      {Math.round(profileData.kycProgress.completionRate * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-teal-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${profileData.kycProgress.completionRate * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Verification Counts */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {profileData.kycProgress.verified.length}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400"><TranslatedText text="Verified" /></div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {profileData.kycProgress.pending.length}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400"><TranslatedText text="Pending" /></div>
                  </div>
                  <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {profileData.kycProgress.rejected.length}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400"><TranslatedText text="Rejected" /></div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Preferences */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Globe className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                <TranslatedText text="Preferences" />
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Preferred Currency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <TranslatedText text="Preferred Currency" />
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    {...register('preferredCurrency')}
                    onChange={(e) => {
                      register('preferredCurrency').onChange(e);
                      handleCurrencyChange(e.target.value);
                    }}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="USD">{tSync('USD - US Dollar')}</option>
                    <option value="EUR">{tSync('EUR - Euro')}</option>
                    <option value="GBP">{tSync('GBP - British Pound')}</option>
                    <option value="RWF">{tSync('RWF - Rwandan Franc')}</option>
                    <option value="KES">{tSync('KES - Kenyan Shilling')}</option>
                    <option value="UGX">{tSync('UGX - Ugandan Shilling')}</option>
                    <option value="TZS">{tSync('TZS - Tanzanian Shilling')}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Location Coordinates */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Navigation className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                <TranslatedText text="Location Coordinates" />
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Latitude */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <TranslatedText text="Latitude" />
                </label>
                <input
                  {...register('location.lat', { valueAsNumber: true })}
                  type="number"
                  step="any"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder={tSync('Enter latitude')}
                />
              </div>

              {/* Longitude */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <TranslatedText text="Longitude" />
                </label>
                <input
                  {...register('location.lng', { valueAsNumber: true })}
                  type="number"
                  step="any"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder={tSync('Enter longitude')}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span><TranslatedText text="Reset" /></span>
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{tSync('Saving...')}</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span><TranslatedText text="Save Changes" /></span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminProfilePage;
