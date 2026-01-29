import React from 'react';
import { 
  Star, 
  Award, 
  Clock, 
  MapPin,
  Shield,
  TrendingUp,
  CheckCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

interface SupplierCardProps {
  supplierId: string;
  supplierName?: string;
  rating?: number;
  reviewCount?: number;
  responseTime?: string;
  isVerified?: boolean;
  location?: string;
  yearsInBusiness?: number;
  totalProducts?: number;
  avatar?: string;
  bio?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  onContactSupplier?: () => void;
  onCallSupplier?: () => void;
}

const SupplierCard: React.FC<SupplierCardProps> = ({
  supplierId,
  supplierName = 'Verified Supplier',
  rating = 4.8,
  reviewCount = 234,
  responseTime = '< 2 hours',
  isVerified = true,
  location = 'Global',
  yearsInBusiness = 5,
  totalProducts = 150,
  avatar,
  bio,
  emailVerified = false,
  phoneVerified = false,
  onContactSupplier,
  onCallSupplier
}) => {
  const supplierInitial = supplierName.charAt(0).toUpperCase();
  
  return (
    <motion.div 
      className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Supplier Header */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="relative">
          {avatar ? (
            <img
              src={avatar}
              alt={supplierName}
              className="w-12 h-12 rounded-full object-cover"
              onError={(e) => {
                // Fallback to initial if image fails to load
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={`${avatar ? 'hidden' : ''} w-12 h-12 bg-gradient-to-br from-teal-600 to-teal-700 rounded-full flex items-center justify-center text-white font-bold text-lg`}>
            {supplierInitial}
          </div>
          {isVerified && (
            <div className="absolute -bottom-1 -right-1 bg-teal-500 rounded-full p-1">
              <Shield className="w-2.5 h-2.5 text-white" />
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{supplierName}</h3>
          <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-slate-300">
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
              <span className="font-medium ml-1">{rating}</span>
            </div>
            <span className="text-gray-400">|</span>
            <span>{reviewCount} Reviews</span>
          </div>
          <div className="flex items-center space-x-1 text-xs text-gray-600 dark:text-slate-300 mt-1">
            <MapPin className="w-3 h-3" />
            <span>{location}</span>
          </div>
        </div>
      </div>

      {/* Supplier Stats - Compact */}
      <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
        <div className="bg-gray-50 dark:bg-slate-800 rounded p-2 text-center">
          <div className="font-semibold text-gray-900 dark:text-white">{yearsInBusiness}+</div>
          <div className="text-gray-600 dark:text-slate-300">Years</div>
        </div>
        <div className="bg-gray-50 dark:bg-slate-800 rounded p-2 text-center">
          <div className="font-semibold text-gray-900 dark:text-white">{totalProducts}+</div>
          <div className="text-gray-600 dark:text-slate-300">Products</div>
        </div>
      </div>

      {/* Supplier Features - Compact */}
      <div className="space-y-2 mb-4 text-xs">
        {isVerified && (
          <div className="flex items-center space-x-2">
            <Award className="w-3 h-3 text-teal-500" />
            <span className="text-gray-700 dark:text-slate-300">KYC Verified</span>
          </div>
        )}
        
        {emailVerified && (
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-3 h-3 text-green-500" />
            <span className="text-gray-700 dark:text-slate-300">Email Verified</span>
          </div>
        )}
        
        {phoneVerified && (
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-3 h-3 text-blue-500" />
            <span className="text-gray-700 dark:text-slate-300">Phone Verified</span>
          </div>
        )}
        
        <div className="flex items-center space-x-2">
          <Clock className="w-3 h-3 text-blue-500" />
          <span className="text-gray-700 dark:text-slate-300">Response: {responseTime}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-3 h-3 text-green-500" />
          <span className="text-gray-700 dark:text-slate-300">Active seller</span>
        </div>
      </div>

      {/* Bio section if available */}
      {bio && (
        <div className="mb-4 p-2 bg-gray-50 dark:bg-slate-800 rounded text-xs">
          <p className="text-gray-700 dark:text-slate-300 line-clamp-2">{bio}</p>
        </div>
      )}

      {/* Contact Buttons - Rental Style */}
      <div className="space-y-2">
        <motion.button
          onClick={onContactSupplier}
          className="w-full bg-teal-500 hover:bg-teal-600 text-white font-medium py-2 px-3 rounded text-sm transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Message Owner
        </motion.button>
        
        <motion.button
          onClick={onCallSupplier}
          className="w-full border border-teal-500 text-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/20 font-medium py-2 px-3 rounded text-sm transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Call Owner
        </motion.button>
      </div>

      {/* Trust Indicators */}
      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-700">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-slate-400">
          <span className="flex items-center space-x-1">
            <Shield className="w-3 h-3" />
            <span>Secure Rental</span>
          </span>
          <span className="flex items-center space-x-1">
            <CheckCircle className="w-3 h-3" />
            <span>Quality Assured</span>
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default SupplierCard;