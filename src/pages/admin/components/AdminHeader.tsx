import React from 'react';
import { Search, Bell, Shield } from 'lucide-react';

interface AdminHeaderProps {
  selectedLocation: string;
  setSelectedLocation: (val: string) => void;
  selectedLanguage: string;
  setSelectedLanguage: (val: string) => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ selectedLocation, setSelectedLocation, selectedLanguage, setSelectedLanguage }) => (
  <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Shield className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <select 
              value={selectedLocation} 
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="bg-gray-100 border-0 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Locations</option>
              <option value="Kigali">🇷🇼 Kigali</option>
              <option value="Butare">🇷🇼 Butare</option>
              <option value="Kampala">🇺🇬 Kampala</option>
              <option value="Nairobi">🇰🇪 Nairobi</option>
            </select>
            <select 
              value={selectedLanguage} 
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-gray-100 border-0 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="en">🇺🇸 English</option>
              <option value="rw">🇷🇼 Kinyarwanda</option>
              <option value="fr">🇫🇷 Français</option>
              <option value="sw">🇹🇿 Kiswahili</option>
            </select>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users, items, bookings..."
              className="pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 w-80"
            />
          </div>
          <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Bell className="w-5 h-5" />
            <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
          </button>
          <div className="flex items-center space-x-2 pl-4 border-l border-gray-200">
            <img 
              src="/assets/img/profiles/avatar-01.jpg" 
              alt="Admin" 
              className="w-8 h-8 rounded-full object-cover" 
            />
            <span className="text-sm font-medium text-gray-700">Admin</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default AdminHeader; 