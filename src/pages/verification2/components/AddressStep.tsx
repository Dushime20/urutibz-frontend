import React from 'react';
import { MapPin, Navigation } from 'lucide-react';

interface AddressStepProps {
  addressForm: any;
  setAddressForm: any;
  errors: any;
  onUseCurrentLocation: () => void;
}

const AddressStep: React.FC<AddressStepProps> = ({ addressForm, setAddressForm, onUseCurrentLocation }) => {
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
        <input className="px-3 py-2 rounded-md border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" placeholder="Province" value={addressForm.province || ''} onChange={e => setAddressForm({...addressForm, province: e.target.value})} />
        <input className="px-3 py-2 rounded-md border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" placeholder="District" value={addressForm.district || ''} onChange={e => setAddressForm({...addressForm, district: e.target.value})} />
        <input className="px-3 py-2 rounded-md border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" placeholder="Sector" value={addressForm.sector || ''} onChange={e => setAddressForm({...addressForm, sector: e.target.value})} />
        <input className="px-3 py-2 rounded-md border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" placeholder="Cell" value={addressForm.cell || ''} onChange={e => setAddressForm({...addressForm, cell: e.target.value})} />
        <input className="px-3 py-2 rounded-md border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" placeholder="Village" value={addressForm.village || ''} onChange={e => setAddressForm({...addressForm, village: e.target.value})} />
        <input className="px-3 py-2 rounded-md border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" placeholder="Street" value={addressForm.address_line || ''} onChange={e => setAddressForm({...addressForm, address_line: e.target.value})} />
        <input className="px-3 py-2 rounded-md border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" placeholder="Latitude" value={addressForm.location_lat || ''} onChange={e => setAddressForm({...addressForm, location_lat: e.target.value})} />
        <input className="px-3 py-2 rounded-md border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" placeholder="Longitude" value={addressForm.location_lng || ''} onChange={e => setAddressForm({...addressForm, location_lng: e.target.value})} />
      </div>
      <button type="button" onClick={onUseCurrentLocation} className="w-full px-4 py-2 rounded-md bg-[#01aaa7] text-white hover:bg-[#019c98] flex items-center justify-center gap-2">
        <Navigation className="w-5 h-5" />
        Use Current Location
      </button>
    </div>
  );
};

export default AddressStep;
