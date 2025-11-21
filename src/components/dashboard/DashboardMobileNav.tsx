import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface MobileNavItem {
  key: string;
  label: string;
  icon: LucideIcon;
  onPress: () => void;
  active?: boolean;
  badge?: number | string | null;
  disabled?: boolean;
}

interface DashboardMobileNavProps {
  items: MobileNavItem[];
  className?: string;
}

const DashboardMobileNav: React.FC<DashboardMobileNavProps> = ({ items, className }) => {
  if (!items.length) return null;

  return (
    <nav
      aria-label="Mobile dashboard navigation"
      className={`md:hidden fixed bottom-0 inset-x-0 z-[80] bg-white/95 dark:bg-gray-900/95 border-t border-gray-200 dark:border-gray-800 backdrop-blur safe-area-bottom shadow-[0_-8px_30px_rgba(15,23,42,0.12)] ${className ?? ''}`}
    >
      <div className="px-4 py-3 grid grid-cols-5 gap-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = Boolean(item.active);

          return (
            <button
              key={item.key}
              onClick={item.onPress}
              disabled={item.disabled}
              className={`flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-semibold transition-all touch-manipulation min-h-[56px] ${
                isActive
                  ? 'text-teal-600 dark:text-teal-300 bg-teal-50 dark:bg-teal-900/30 shadow-inner shadow-teal-900/10'
                  : 'text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              } ${item.disabled ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <span className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-teal-600 dark:text-teal-300' : ''}`} />
                {item.badge !== undefined && item.badge !== null && Number(item.badge) > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] px-[5px] rounded-full bg-red-500 text-white text-[10px] leading-[16px] text-center">
                    {Number(item.badge) > 99 ? '99+' : item.badge}
                  </span>
                )}
              </span>
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default DashboardMobileNav;

