import React from 'react';
import { MapPin, X, Chrome, Globe, Monitor } from 'lucide-react';

interface LocationPermissionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => void;
}

const LocationPermissionDialog: React.FC<LocationPermissionDialogProps> = ({ 
  isOpen, 
  onClose, 
  onRetry 
}) => {
  if (!isOpen) return null;

  const getBrowserName = () => {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Browser';
  };

  const browserName = getBrowserName();

  const getBrowserIcon = () => {
    switch (browserName) {
      case 'Chrome':
        return <Chrome className="w-5 h-5" />;
      case 'Firefox':
        return <Monitor className="w-5 h-5" />; // Using Monitor as Firefox alternative
      case 'Safari':
        return <Globe className="w-5 h-5" />; // Using Globe as Safari alternative
      default:
        return <Globe className="w-5 h-5" />;
    }
  };

  const getInstructions = () => {
    switch (browserName) {
      case 'Chrome':
        return [
          'Look for the location icon (🌍) in your address bar',
          'Click on it and select "Allow"',
          'If you don\'t see it, click the lock icon and enable location',
          'Refresh the page and try again'
        ];
      case 'Firefox':
        return [
          'Look for the shield icon in your address bar',
          'Click on it and select "Allow Location Access"',
          'Or go to Firefox menu > Settings > Privacy & Security',
          'Find "Permissions" and click "Settings" next to Location',
          'Remove this site from blocked list if present'
        ];
      case 'Safari':
        return [
          'Go to Safari menu > Settings for This Website',
          'Or Safari > Preferences > Websites > Location',
          'Find this website and change setting to "Allow"',
          'Refresh the page and try again'
        ];
      case 'Edge':
        return [
          'Look for the location icon in your address bar',
          'Click on it and select "Allow"',
          'Or go to Edge menu > Settings > Site permissions',
          'Click on Location and allow this site'
        ];
      default:
        return [
          'Look for a location or lock icon in your address bar',
          'Click on it and allow location access',
          'Check your browser settings for location permissions',
          'Refresh the page and try again'
        ];
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Location Access Required
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            We need your location to auto-fill your address details
          </p>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            {getBrowserIcon()}
            <span className="font-medium text-gray-900 dark:text-white">
              Enable location in {browserName}:
            </span>
          </div>
          
          <ol className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            {getInstructions().map((instruction, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-teal-100 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 rounded-full flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </span>
                <span>{instruction}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Skip for now
          </button>
          <button
            onClick={() => {
              onClose();
              onRetry();
            }}
            className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationPermissionDialog;