import React, { useState } from 'react';
import { MapPin, Navigation, Loader2 } from 'lucide-react';

interface AddressStepProps {
  addressForm: any;
  setAddressForm: any;
  errors: any;
  onUseCurrentLocation: () => void;
}

const AddressStep: React.FC<AddressStepProps> = ({ addressForm, setAddressForm, onUseCurrentLocation }) => {
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const handleLocationClick = async () => {
    setIsGettingLocation(true);
    try {
      await onUseCurrentLocation();
    } finally {
      setIsGettingLocation(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <MapPin className="w-12 h-12 text-[#01aaa7] mx-auto mb-3" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Address Details</h2>
        <p className="text-gray-600 dark:text-slate-400">Provide your address information</p>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <input className="px-3 py-2 rounded-md border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" placeholder="First Name" value={addressForm.firstName || ''} onChange={e => setAddressForm({...addressForm, firstName: e.target.value})} />
        <input className="px-3 py-2 rounded-md border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" placeholder="Last Name" value={addressForm.lastName || ''} onChange={e => setAddressForm({...addressForm, lastName: e.target.value})} />
        <input type="date" className="px-3 py-2 rounded-md border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" value={addressForm.date_of_birth || ''} onChange={e => setAddressForm({...addressForm, date_of_birth: e.target.value})} />
        <select className="px-3 py-2 rounded-md border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" value={addressForm.gender || ''} onChange={e => setAddressForm({...addressForm, gender: e.target.value})}>
          <option value="">Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        
        {/* Global Address Fields */}
        <input className="px-3 py-2 rounded-md border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 md:col-span-2" placeholder="Street Address" value={addressForm.street_address || ''} onChange={e => setAddressForm({...addressForm, street_address: e.target.value})} />
        <input className="px-3 py-2 rounded-md border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" placeholder="City" value={addressForm.city || ''} onChange={e => setAddressForm({...addressForm, city: e.target.value})} />
        <input className="px-3 py-2 rounded-md border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" placeholder="State/Province" value={addressForm.state_province || ''} onChange={e => setAddressForm({...addressForm, state_province: e.target.value})} />
        <input className="px-3 py-2 rounded-md border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" placeholder="Postal/ZIP Code" value={addressForm.postal_code || ''} onChange={e => setAddressForm({...addressForm, postal_code: e.target.value})} />
        <input className="px-3 py-2 rounded-md border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" placeholder="Country" value={addressForm.country || ''} onChange={e => setAddressForm({...addressForm, country: e.target.value})} />
        
        {/* Optional Location Coordinates */}
        <input className="px-3 py-2 rounded-md border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" placeholder="Latitude (Optional)" value={addressForm.location_lat || ''} onChange={e => setAddressForm({...addressForm, location_lat: e.target.value})} />
        <input className="px-3 py-2 rounded-md border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" placeholder="Longitude (Optional)" value={addressForm.location_lng || ''} onChange={e => setAddressForm({...addressForm, location_lng: e.target.value})} />
      </div>
      
      <button 
        type="button" 
        onClick={handleLocationClick} 
        disabled={isGettingLocation}
        className="w-full px-4 py-2 rounded-md bg-[#01aaa7] text-white hover:bg-[#019c98] disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
      >
        {isGettingLocation ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Getting Location...
          </>
        ) : (
          <>
            <Navigation className="w-5 h-5" />
            Use Current Location
          </>
        )}
      </button>
      
      {/* Location coordinates display */}
      {(addressForm.location_lat && addressForm.location_lng) && (
        <div className="text-center text-sm text-gray-600 dark:text-gray-400 bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
          <MapPin className="w-4 h-4 inline mr-1" />
          Location detected: {parseFloat(addressForm.location_lat).toFixed(6)}, {parseFloat(addressForm.location_lng).toFixed(6)}
        </div>
      )}
    </div>
  );
};

export default AddressStep;
