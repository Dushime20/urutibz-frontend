import React from 'react';
import { Calendar, MapPin, User, Clock } from 'lucide-react';
import type { Inspection } from '../../types/inspection';
import StatusBadge from './StatusBadge';

interface RecentInspectionsTimelineProps {
  inspections: Inspection[];
  onInspectionClick: (id: string) => void;
}

const RecentInspectionsTimeline: React.FC<RecentInspectionsTimelineProps> = ({
  inspections,
  onInspectionClick
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'pre_rental':
        return 'Pre-Rental';
      case 'post_rental':
        return 'Post-Rental';
      case 'damage_assessment':
        return 'Damage Assessment';
      case 'maintenance_check':
        return 'Maintenance Check';
      case 'quality_verification':
        return 'Quality Verification';
      default:
        return type;
    }
  };

  if (inspections.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="mx-auto h-8 w-8 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No recent activity</h3>
        <p className="mt-1 text-sm text-gray-500">
          Inspections will appear here as they are created and updated.
        </p>
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {inspections.map((inspection, inspectionIdx) => (
          <li key={inspection.id}>
            <div className="relative pb-8">
              {inspectionIdx !== inspections.length - 1 ? (
                <span
                  className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              ) : null}
              <div className="relative flex space-x-3">
                <div>
                                  <span className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center ring-8 ring-white">
                  <Calendar className="h-4 w-4 text-white" />
                </span>
                </div>
                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                  <div>
                    <p className="text-sm text-gray-500">
                      <button
                        onClick={() => onInspectionClick(inspection.id)}
                        className="font-medium text-gray-900 hover:text-emerald-600 cursor-pointer"
                      >
                        {inspection.product?.name || `Product ${inspection.productId}`}
                      </button>
                      {' '}inspection {getTypeLabel(inspection.inspectionType).toLowerCase()}
                    </p>
                    <div className="mt-1 flex items-center space-x-2 text-xs text-gray-500">
                      <MapPin className="h-3 w-3" />
                      <span>{inspection.location}</span>
                      {inspection.inspector && (
                        <>
                          <span>•</span>
                          <User className="h-3 w-3" />
                          <span>Inspector {inspection.inspector.userId}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right text-sm whitespace-nowrap text-gray-500">
                    <time dateTime={inspection.updatedAt}>
                      {formatDate(inspection.updatedAt)}
                    </time>
                  </div>
                </div>
              </div>
              <div className="mt-2 ml-12">
                <StatusBadge status={inspection.status} size="sm" />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentInspectionsTimeline;
