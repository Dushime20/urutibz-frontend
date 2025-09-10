import React from 'react';
import { Button } from '../../../components/ui/DesignSystem';
import ProfileSettingsForm from '../components/ProfileSettingsForm';
import { Lock, Edit2, Shield, Eye, Moon, Sun, Bell } from 'lucide-react';

interface Props {
  twoFactorStatus: { isLoading: boolean; enabled: boolean };
  show2FAModal: boolean;
  setShow2FAModal: (v: boolean) => void;
  realUser: any;
  setRealUser: (fn: (prev: any) => any) => void;
}

const SettingsSection: React.FC<Props> = ({ twoFactorStatus, setShow2FAModal, setRealUser }) => {
  const token = (typeof window !== 'undefined' && localStorage.getItem('token')) || '';
  let userId = '';
  try {
    const tp = token ? JSON.parse(atob(token.split('.')[1])) : {};
    userId = tp.sub || tp.userId || tp.id || '';
  } catch {}

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:bg-slate-900 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-slate-100">Profile Settings</h3>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
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

      <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:bg-slate-900 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-slate-100">Security & Privacy</h3>
            <p className="text-gray-600 dark:text-slate-400">Manage your account security and privacy settings</p>
          </div>
        </div>
        <div className="space-y-6">
          <div className="border border-gray-200 rounded-xl p-4 dark:border-slate-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-gray-400 dark:text-slate-500" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-slate-100">Password</h4>
                  <p className="text-sm text-gray-500 dark:text-slate-400">Last updated 3 months ago</p>
                </div>
              </div>
              <Button variant="outline" className="flex items-center gap-2 w-full sm:w-auto justify-center">
                <Edit2 className="w-4 h-4" />
                Change Password
              </Button>
            </div>
          </div>
          <div className="border border-gray-200 rounded-xl p-4 dark:border-slate-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-gray-400 dark:text-slate-500" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-slate-100">Two-Factor Authentication</h4>
                  <p className="text-sm text-gray-500 dark:text-slate-400">Add an extra layer of security to your account</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-sm font-medium ${twoFactorStatus.isLoading ? 'text-gray-400 dark:text-slate-500' : twoFactorStatus.enabled ? 'text-green-600' : 'text-gray-500 dark:text-slate-400'}`}>
                  {twoFactorStatus.isLoading ? 'Loading...' : twoFactorStatus.enabled ? 'Enabled' : 'Disabled'}
                </span>
                <Button onClick={() => setShow2FAModal(true)} disabled={twoFactorStatus.isLoading} className={`px-3 py-1 ${twoFactorStatus.isLoading ? 'bg-gray-400 cursor-not-allowed' : twoFactorStatus.enabled ? 'bg-gray-600 hover:bg-gray-700 text-white' : 'bg-my-primary hover:bg-primary-700 text-white'}`}>
                  {twoFactorStatus.isLoading ? 'Loading...' : twoFactorStatus.enabled ? 'Manage' : 'Enable'}
                </Button>
              </div>
            </div>
          </div>
          <div className="border border-gray-200 rounded-xl p-4 dark:border-slate-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-gray-400 dark:text-slate-500" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-slate-100">Login Activity</h4>
                  <p className="text-sm text-gray-500 dark:text-slate-400">View your recent login history</p>
                </div>
              </div>
              <Button variant="outline" className="w-full sm:w-auto">View Activity</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:bg-slate-900 dark:border-slate-700">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 dark:text-slate-100">Preferences</h3>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-3 border-b border-gray-100 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <Moon className="w-5 h-5 text-gray-400 dark:text-slate-500" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-slate-100">Theme</h4>
                <p className="text-sm text-gray-500 dark:text-slate-400">Choose your preferred theme</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 border border-gray-200 rounded-lg dark:border-slate-700 dark:hover:bg-slate-800"><Sun className="w-4 h-4" /></button>
              <button className="p-2 border border-gray-200 rounded-lg bg-gray-100 dark:border-slate-700 dark:bg-slate-800"><Moon className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-3">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-gray-400 dark:text-slate-500" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-slate-100">Email Notifications</h4>
                <p className="text-sm text-gray-500 dark:text-slate-400">Receive important updates via email</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 dark:bg-slate-700 dark:after:bg-slate-200"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsSection;


