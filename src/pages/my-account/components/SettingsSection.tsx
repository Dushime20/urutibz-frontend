import React, { useState } from 'react';
import { Button } from '../../../components/ui/DesignSystem';
import { Lock, Edit2, Shield, Eye, Moon, Sun, Bell, DollarSign } from 'lucide-react';
import { fetchUserProfile, updateUser } from '../service/api';
import { useToast } from '../../../contexts/ToastContext';
import LoginHistoryModal from './LoginHistoryModal';
import ChangePasswordModal from './ChangePasswordModal';
import { useTranslation } from '../../../hooks/useTranslation';
import { TranslatedText } from '../../../components/translated-text';

interface Props {
  twoFactorStatus: { isLoading: boolean; enabled: boolean };
  show2FAModal: boolean;
  setShow2FAModal: (v: boolean) => void;
}

const SettingsSection: React.FC<Props> = ({ twoFactorStatus, setShow2FAModal }) => {
  const { tSync } = useTranslation();
  const [showLoginHistory, setShowLoginHistory] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [isDark, setIsDark] = useState<boolean>(false);
  const token = (typeof window !== 'undefined' && localStorage.getItem('token')) || '';
  const [preferredCurrency, setPreferredCurrency] = useState<string>('');
  const { showToast } = useToast();

  React.useEffect(() => {
    (async () => {
      try {
        if (!token) return;
        const res = await fetchUserProfile(token);
        const data = res?.data;
        let found = '';
        if (data?.preferred_currency) found = String(data.preferred_currency);
        else if (data?.preferredCurrency) found = String(data.preferredCurrency);
        // Fallback to cached user object if API omitted the field
        if (!found) {
          try {
            const cached = localStorage.getItem('user');
            if (cached) {
              const u = JSON.parse(cached);
              found = u?.preferred_currency || u?.preferredCurrency || '';
            }
          } catch {}
        }
        if (found) setPreferredCurrency(found.toUpperCase());
      } catch {}
    })();
  }, [token]);

  const savePreferredCurrency = async (value: string) => {
    const prev = preferredCurrency;
    setPreferredCurrency(value);
    try {
      // Resolve userId: token first, fallback to localStorage user
      let userId: string | undefined;
      try {
        const payload = JSON.parse(atob((token || '').split('.')[1] || ''));
        userId = payload?.sub || payload?.userId || payload?.id;
      } catch {}
      if (!userId) {
        const raw = localStorage.getItem('user');
        if (raw) userId = JSON.parse(raw)?.id;
      }
      if (!userId) {
        showToast('Unable to find user ID to save currency', 'error');
        setPreferredCurrency(prev);
        return;
      }
      const res = await updateUser(userId, { preferred_currency: value }, token);
      if (!res.success) {
        setPreferredCurrency(prev);
        showToast('Failed to update preferred currency', 'error');
        return;
      }
      // Update cached user object if present so UI stays in sync
      try {
        const cached = localStorage.getItem('user');
        if (cached) {
          const u = JSON.parse(cached);
          u.preferred_currency = value;
          localStorage.setItem('user', JSON.stringify(u));
        }
      } catch {}
      showToast('Preferred currency updated', 'success');
    } catch (e) {
      setPreferredCurrency(prev);
      showToast('Error updating preferred currency', 'error');
    }
  };

  // Initialize theme from localStorage or system preference
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('theme');
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const useDark = saved ? saved === 'dark' : prefersDark;
      setIsDark(useDark);
      document.documentElement.classList.toggle('dark', useDark);
    } catch {}
  }, []);

  const toggleTheme = (theme: 'light' | 'dark') => {
    const newTheme = theme === 'dark';
    setIsDark(newTheme);
    document.documentElement.classList.toggle('dark', newTheme);
    localStorage.setItem('theme', theme);
  };

  return (
    <div className="space-y-6">

      <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:bg-slate-900 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-slate-100"><TranslatedText text="Security & Privacy" /></h3>
            <p className="text-gray-600 dark:text-slate-400"><TranslatedText text="Manage your account security and privacy settings" /></p>
          </div>
        </div>
        <div className="space-y-6">
          <div className="border border-gray-200 rounded-xl p-4 dark:border-slate-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-gray-400 dark:text-slate-500" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-slate-100"><TranslatedText text="Password" /></h4>
                  <p className="text-sm text-gray-500 dark:text-slate-400"><TranslatedText text="Last updated 3 months ago" /></p>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="flex items-center gap-2 w-full sm:w-auto justify-center text-gray-700 dark:text-white border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-800"
                onClick={() => setShowChangePassword(true)}
              >
                <Edit2 className="w-4 h-4" />
                <TranslatedText text="Change Password" />
              </Button>
            </div>
          </div>
          <div className="border border-gray-200 rounded-xl p-4 dark:border-slate-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-gray-400 dark:text-slate-500" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-slate-100"><TranslatedText text="Two-Factor Authentication" /></h4>
                  <p className="text-sm text-gray-500 dark:text-slate-400"><TranslatedText text="Add an extra layer of security to your account" /></p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-sm font-medium ${twoFactorStatus.isLoading ? 'text-gray-400 dark:text-slate-500' : twoFactorStatus.enabled ? 'text-green-600' : 'text-gray-500 dark:text-slate-400'}`}>
                  {twoFactorStatus.isLoading ? <TranslatedText text="Loading..." /> : twoFactorStatus.enabled ? <TranslatedText text="Enabled" /> : <TranslatedText text="Disabled" />}
                </span>
                <Button onClick={() => setShow2FAModal(true)} disabled={twoFactorStatus.isLoading} className={`px-3 py-1 ${twoFactorStatus.isLoading ? 'bg-gray-400 cursor-not-allowed' : twoFactorStatus.enabled ? 'bg-gray-600 hover:bg-gray-700 text-white' : 'bg-my-primary hover:bg-primary-700 text-white'}`}>
                  {twoFactorStatus.isLoading ? <TranslatedText text="Loading..." /> : twoFactorStatus.enabled ? <TranslatedText text="Manage" /> : <TranslatedText text="Enable" />}
                </Button>
              </div>
            </div>
          </div>
          <div className="border border-gray-200 rounded-xl p-4 dark:border-slate-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-gray-400 dark:text-slate-500" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-slate-100"><TranslatedText text="Login Activity" /></h4>
                  <p className="text-sm text-gray-500 dark:text-slate-400"><TranslatedText text="View your recent login history" /></p>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="w-full sm:w-auto text-gray-700 dark:text-white border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-800"
                onClick={() => setShowLoginHistory(true)}
              >
                <TranslatedText text="View Activity" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:bg-slate-900 dark:border-slate-700">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 dark:text-slate-100"><TranslatedText text="Preferences" /></h3>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-3 border-b border-gray-100 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-gray-400 dark:text-slate-500" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-slate-100"><TranslatedText text="Preferred Currency" /></h4>
                <p className="text-sm text-gray-500 dark:text-slate-400"><TranslatedText text="Display prices in your favorite currency" /></p>
              </div>
            </div>
            <select
              value={preferredCurrency}
              onChange={(e) => savePreferredCurrency(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
            >
              <option value=""><TranslatedText text="Select currency" /></option>
              <option value="USD">USD ($)</option>
              <option value="RWF">RWF (R₣)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="KES">KES (KSh)</option>
              <option value="UGX">UGX (USh)</option>
            </select>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-3 border-b border-gray-100 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <Moon className="w-5 h-5 text-gray-400 dark:text-slate-500" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-slate-100"><TranslatedText text="Theme" /></h4>
                <p className="text-sm text-gray-500 dark:text-slate-400"><TranslatedText text="Choose your preferred theme" /></p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => toggleTheme('light')}
                className={`p-2 border rounded-lg transition-colors ${
                  !isDark 
                    ? 'border-my-primary bg-my-primary/10 text-my-primary' 
                    : 'border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400'
                }`}
              >
                <Sun className="w-4 h-4" />
              </button>
              <button 
                onClick={() => toggleTheme('dark')}
                className={`p-2 border rounded-lg transition-colors ${
                  isDark 
                    ? 'border-my-primary bg-my-primary/10 text-my-primary' 
                    : 'border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400'
                }`}
              >
                <Moon className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-3">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-gray-400 dark:text-slate-500" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-slate-100"><TranslatedText text="Email Notifications" /></h4>
                <p className="text-sm text-gray-500 dark:text-slate-400"><TranslatedText text="Receive important updates via email" /></p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 dark:bg-slate-700 dark:after:bg-slate-200"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Login History Modal */}
      <LoginHistoryModal
        isOpen={showLoginHistory}
        onClose={() => setShowLoginHistory(false)}
        token={token}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
        token={token}
      />
    </div>
  );
};

export default SettingsSection;


