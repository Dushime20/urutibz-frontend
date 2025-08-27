import React from 'react';
import { LucideIcon } from 'lucide-react';

interface QuickStatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const QuickStatsCard: React.FC<QuickStatsCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  color,
  trend 
}) => {
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'green':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'yellow':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'red':
        return 'bg-red-50 border-red-200 text-red-700';
      case 'purple':
        return 'bg-purple-50 border-purple-200 text-purple-700';
      case 'gray':
        return 'bg-gray-50 border-gray-200 text-gray-700';
      default:
        return 'bg-emerald-50 border-emerald-200 text-emerald-700';
    }
  };

  const getIconColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'text-blue-600';
      case 'green':
        return 'text-green-600';
      case 'yellow':
        return 'text-yellow-600';
      case 'red':
        return 'text-red-600';
      case 'purple':
        return 'text-purple-600';
      case 'gray':
        return 'text-gray-600';
      default:
        return 'text-emerald-600';
    }
  };

  return (
    <div className={`bg-white rounded-lg border p-4 ${getColorClasses(color)}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 truncate">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value?.toLocaleString() || '0'}</p>
          {trend && (
            <div className="flex items-center mt-2">
              <span
                className={`text-xs font-medium ${
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              <span className="text-xs text-gray-500 ml-1">from last month</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${getIconColorClasses(color)} bg-white`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

export default QuickStatsCard;
