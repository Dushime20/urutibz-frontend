import React from 'react';
import ProfileSettingsForm from './ProfileSettingsForm';

interface Props {
  realUser: any;
  setRealUser: (fn: (prev: any) => any) => void;
}

const ProfileSection: React.FC<Props> = ({ realUser, setRealUser }) => {
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
              <button type="submit" form="profile-settings-form" className="px-4 py-2 rounded-xl bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black disabled:opacity-50 transition-colors">Save Changes</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;
