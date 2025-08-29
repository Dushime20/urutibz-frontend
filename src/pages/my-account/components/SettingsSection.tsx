import React from 'react';
import { Button } from '../../../components/ui/DesignSystem';
import ProfileSettingsForm from '../components/ProfileSettingsForm';
import { Lock, Edit2, Shield, Eye, Mail, Phone, MapPin, CreditCard, Moon, Sun, Bell } from 'lucide-react';

interface Props {
  twoFactorStatus: { isLoading: boolean; enabled: boolean };
  show2FAModal: boolean;
  setShow2FAModal: (v: boolean) => void;
  realUser: any;
  setRealUser: (fn: (prev: any) => any) => void;
}

const SettingsSection: React.FC<Props> = ({ twoFactorStatus, show2FAModal, setShow2FAModal, realUser, setRealUser }) => {
  const token = (typeof window !== 'undefined' && localStorage.getItem('token')) || '';
  let userId = '';
  try {
    const tp = token ? JSON.parse(atob(token.split('.')[1])) : {};
    userId = tp.sub || tp.userId || tp.id || '';
  } catch {}

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Profile Settings</h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          <div className="lg:col-span-1">
            <ProfileSettingsForm
              formId="profile-settings-form"
              userId={userId}
              token={token}
              onUpdated={(u: any) => setRealUser((prev: any) => ({ ...(prev || {}), ...u, avatar: u?.profileImageUrl || prev?.avatar }))}
            />
            <div className="flex justify-end mt-4">
              <button type="submit" form="profile-settings-form" className="px-4 py-2 rounded-xl bg-primary-600 text-white disabled:opacity-50">Save Changes</button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Security & Privacy</h3>
            <p className="text-gray-600">Manage your account security and privacy settings</p>
          </div>
        </div>
        <div className="space-y-6">
          <div className="border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-gray-400" />
                <div>
                  <h4 className="font-medium text-gray-900">Password</h4>
                  <p className="text-sm text-gray-500">Last updated 3 months ago</p>
                </div>
              </div>
              <Button variant="outline" className="flex items-center gap-2">
                <Edit2 className="w-4 h-4" />
                Change Password
              </Button>
            </div>
          </div>
          <div className="border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-gray-400" />
                <div>
                  <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                  <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-sm font-medium ${twoFactorStatus.isLoading ? 'text-gray-400' : twoFactorStatus.enabled ? 'text-green-600' : 'text-gray-500'}`}>
                  {twoFactorStatus.isLoading ? 'Loading...' : twoFactorStatus.enabled ? 'Enabled' : 'Disabled'}
                </span>
                <Button onClick={() => setShow2FAModal(true)} disabled={twoFactorStatus.isLoading} className={`px-3 py-1 ${twoFactorStatus.isLoading ? 'bg-gray-400 cursor-not-allowed' : twoFactorStatus.enabled ? 'bg-gray-600 hover:bg-gray-700 text-white' : 'bg-my-primary hover:bg-primary-700 text-white'}`}>
                  {twoFactorStatus.isLoading ? 'Loading...' : twoFactorStatus.enabled ? 'Manage' : 'Enable'}
                </Button>
              </div>
            </div>
          </div>
          <div className="border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-gray-400" />
                <div>
                  <h4 className="font-medium text-gray-900">Login Activity</h4>
                  <p className="text-sm text-gray-500">View your recent login history</p>
                </div>
              </div>
              <Button variant="outline">View Activity</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <Moon className="w-5 h-5 text-gray-400" />
              <div>
                <h4 className="font-medium text-gray-900">Theme</h4>
                <p className="text-sm text-gray-500">Choose your preferred theme</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 border border-gray-200 rounded-lg"><Sun className="w-4 h-4" /></button>
              <button className="p-2 border border-gray-200 rounded-lg bg-gray-100"><Moon className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-gray-400" />
              <div>
                <h4 className="font-medium text-gray-900">Email Notifications</h4>
                <p className="text-sm text-gray-500">Receive important updates via email</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsSection;


