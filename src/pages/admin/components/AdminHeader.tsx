import React, { useState } from 'react';
import { Search, Bell, Shield, User, LogOut, ChevronDown } from 'lucide-react';
import { Dialog } from '@headlessui/react';

interface AdminHeaderProps {
  selectedLocation: string;
  setSelectedLocation: (val: string) => void;
  selectedLanguage: string;
  setSelectedLanguage: (val: string) => void;
}

const getUser = () => {
  // Example: fetch from localStorage or use a placeholder
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return { name: 'Admin', avatar: '/assets/img/profiles/avatar-01.jpg', email: 'admin@example.com' };
};

const AdminHeader: React.FC<AdminHeaderProps> = ({ selectedLocation, setSelectedLocation, selectedLanguage, setSelectedLanguage }) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const user = getUser();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-6 h-6 text-my-primary" />
              <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <select 
                value={selectedLocation} 
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="bg-gray-100 border-0 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-my-primary"
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
                className="bg-gray-100 border-0 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-my-primary"
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
                className="pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-xl focus:ring-2 focus:ring-my-primary focus:bg-white transition-all duration-200 w-80"
              />
            </div>
            <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Bell className="w-5 h-5" />
              <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
            </button>
            <div className="relative flex items-center space-x-2 pl-4 border-l border-gray-200">
              <button
                className="flex items-center space-x-2 focus:outline-none"
                onClick={() => setProfileOpen((open) => !open)}
              >
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  className="w-8 h-8 rounded-full object-cover" 
                />
                <span className="text-sm font-medium text-gray-700">{user.name}</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="font-semibold text-gray-900">{user.name}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </div>
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => { setProfileOpen(false); setShowProfileModal(true); }}
                  >
                    <User className="w-4 h-4 mr-2" /> Profile
                  </button>
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 border-t border-gray-100"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {showProfileModal && (
        <Dialog open={showProfileModal} onClose={() => setShowProfileModal(false)} className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" onClick={() => setShowProfileModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl p-8 w-full max-w-sm mx-auto z-50">
            <Dialog.Title className="text-lg font-bold mb-4">Profile</Dialog.Title>
            <div className="flex flex-col items-center">
              <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-full object-cover mb-4" />
              <div className="text-xl font-semibold mb-1">{user.name}</div>
              <div className="text-gray-500 mb-4">{user.email}</div>
              <button
                onClick={() => setShowProfileModal(false)}
                className="mt-2 px-4 py-2 bg-my-primary text-white rounded-lg hover:bg-my-primary/80"
              >
                Close
              </button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};

export default AdminHeader; 