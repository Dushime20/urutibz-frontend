import React from 'react';
import { InspectionStatus } from '../../types/inspection';

interface StatusBadgeProps {
  status: InspectionStatus;
  size?: 'sm' | 'md' | 'lg';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getStatusConfig = (status: InspectionStatus) => {
    switch (status) {
      case InspectionStatus.PENDING:
        return {
          label: 'Pending',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          borderColor: 'border-yellow-200',
          icon: '⏳'
        };
      case InspectionStatus.IN_PROGRESS:
        return {
          label: 'In Progress',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800',
          borderColor: 'border-blue-200',
          icon: '🔄'
        };
      case InspectionStatus.COMPLETED:
        return {
          label: 'Completed',
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          borderColor: 'border-green-200',
          icon: '✅'
        };
      case InspectionStatus.DISPUTED:
        return {
          label: 'Disputed',
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          borderColor: 'border-red-200',
          icon: '⚠️'
        };
      case InspectionStatus.RESOLVED:
        return {
          label: 'Resolved',
          bgColor: 'bg-purple-100',
          textColor: 'text-purple-800',
          borderColor: 'border-purple-200',
          icon: '🔒'
        };
      default:
        return {
          label: 'Unknown',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          borderColor: 'border-gray-200',
          icon: '❓'
        };
    }
  };

  const config = getStatusConfig(status);
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <span
      className={`
        inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium
        ${config.bgColor} ${config.textColor} ${config.borderColor}
        border ${sizeClasses[size]}
      `}
    >
      <span className="mr-1.5">{config.icon}</span>
      {config.label}
    </span>
  );
};

export default StatusBadge;
