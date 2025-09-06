import React from 'react';
import { BarChart3, Calendar, Car, Wallet, Shield, BookOpen, Settings, MessageCircle, TrendingUp, ArrowRightLeft } from 'lucide-react';

type TabKey = 'overview' | 'bookings' | 'listings' | 'wallet' | 'inspections' | 'reviews' | 'messages' | 'settings' | 'risk-assessment' | 'handover-return';

interface Props {
  activeTab: TabKey;
  onSelect: (tab: TabKey) => void;
}

const buttonBase = 'group relative w-full flex items-center px-4 py-3.5 rounded-2xl font-medium transition-all duration-300';
const activeClasses = ' bg-gray-200';
const inactiveClasses = 'text-gray-600 hover:text-gray-900 hover:bg-gray-50';

const Item = ({
  icon: Icon,
  label,
  active,
  onClick,
  hasNotification = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  onClick: () => void;
  hasNotification?: boolean;
}) => (
  <button onClick={onClick} className={`${buttonBase}${active ? activeClasses : ' ' + inactiveClasses}`}>
    <Icon className={`w-5 h-5 mr-3 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-105'}`} />
    <span className="flex-1 text-left truncate">{label}</span>
    {hasNotification && <div className="w-2 h-2 bg-red-500 rounded-full ml-auto animate-pulse"></div>}
  </button>
);

const MyAccountNavTabs: React.FC<Props> = ({ activeTab, onSelect }) => {
  return (
    <div className="flex items-center space-x-2 py-4 overflow-x-auto">
      <Item icon={BarChart3} label="Overview" active={activeTab === 'overview'} onClick={() => onSelect('overview')} />
      <Item icon={Calendar} label="My Bookings" active={activeTab === 'bookings'} onClick={() => onSelect('bookings')} />
      <Item icon={Car} label="My Listings" active={activeTab === 'listings'} onClick={() => onSelect('listings')} />
      <Item icon={Wallet} label="Wallet" active={activeTab === 'wallet'} onClick={() => onSelect('wallet')} />
      <Item icon={Shield} label="Inspections" active={activeTab === 'inspections'} onClick={() => onSelect('inspections')} />
      <Item icon={TrendingUp} label="Risk Assessment" active={activeTab === 'risk-assessment'} onClick={() => onSelect('risk-assessment')} />
      <Item icon={ArrowRightLeft} label="Handover & Return" active={activeTab === 'handover-return'} onClick={() => onSelect('handover-return')} />
      <Item icon={BookOpen} label="Reviews" active={activeTab === 'reviews'} onClick={() => onSelect('reviews')} />
      <Item icon={MessageCircle} label="Messages" active={activeTab === 'messages'} onClick={() => onSelect('messages')} hasNotification={true} />
      <Item icon={Settings} label="Settings" active={activeTab === 'settings'} onClick={() => onSelect('settings')} />
    </div>
  );
};

export default MyAccountNavTabs;


