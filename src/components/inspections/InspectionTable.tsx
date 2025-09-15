import React from 'react';
import { Eye, Edit, Play, CheckCircle, Calendar, MapPin, User } from 'lucide-react';
import type { Inspection } from '../../types/inspection';
import { InspectionStatus } from '../../types/inspection';
import StatusBadge from './StatusBadge';
import Pagination from '../ui/Pagination';

interface InspectionTableProps {
  inspections: Inspection[];
  loading: boolean;
  onAction: (inspection: Inspection, action: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const InspectionTable: React.FC<InspectionTableProps> = ({
  inspections,
  loading,
  onAction,
  currentPage,
  totalPages,
  onPageChange
}) => {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getActionButtons = (inspection: Inspection) => {
    const buttons = [];

    // View button - always available
    buttons.push(
      <button
        key="view"
        onClick={() => onAction(inspection, 'view')}
        className="inline-flex items-center px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        title="View Details"
      >
        <Eye className="w-3 h-3 mr-1" />
        View
      </button>
    );

    // Edit button - available for pending and in_progress
    if ([InspectionStatus.PENDING, InspectionStatus.IN_PROGRESS].includes(inspection.status)) {
      buttons.push(
        <button
          key="edit"
          onClick={() => onAction(inspection, 'edit')}
          className="inline-flex items-center px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          title="Edit Inspection"
        >
          <Edit className="w-3 h-3 mr-1" />
          Edit
        </button>
      );
    }

    // Start button - only for pending
    if (inspection.status === InspectionStatus.PENDING) {
      buttons.push(
        <button
          key="start"
          onClick={() => onAction(inspection, 'start')}
          className="inline-flex items-center px-2 py-1 border border-transparent rounded text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          title="Start Inspection"
        >
          <Play className="w-3 h-3 mr-1" />
          Start
        </button>
      );
    }

    // Complete button - only for in_progress
    if (inspection.status === InspectionStatus.IN_PROGRESS) {
      buttons.push(
        <button
          key="complete"
          onClick={() => onAction(inspection, 'complete')}
          className="inline-flex items-center px-2 py-1 border border-transparent rounded text-xs font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          title="Complete Inspection"
        >
          <CheckCircle className="w-3 h-3 mr-1" />
          Complete
        </button>
      );
    }

    return buttons;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (inspections.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-sm">No inspections found</div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      {/* Mobile View */}
      <div className="lg:hidden space-y-4">
        {inspections.map((inspection) => (
          <div key={inspection.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900">
                  {inspection.product?.name || 'Product'}
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  {getTypeLabel(inspection.inspectionType)}
                </p>
              </div>
              <StatusBadge status={inspection.status} size="sm" />
            </div>
            
            <div className="space-y-2 mb-3">
              <div className="flex items-center text-xs text-gray-500">
                <Calendar className="w-3 h-3 mr-2" />
                {formatDate(inspection.scheduledAt)}
              </div>
              <div className="flex items-center text-xs text-gray-500">
                <MapPin className="w-3 h-3 mr-2" />
                {inspection.location}
              </div>
              {inspection.inspector && (
                <div className="flex items-center text-xs text-gray-500">
                  <User className="w-3 h-3 mr-2" />
                  Inspector {inspection.inspector.userId}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {getActionButtons(inspection)}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop View */}
      <div className="hidden lg:block">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Scheduled
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Inspector
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {inspections.map((inspection) => (
                <tr key={inspection.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {inspection.product?.name || 'Product'}
                    </div>
                    {/* ID hidden in table view; available in detail view */}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {getTypeLabel(inspection.inspectionType)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={inspection.status} size="sm" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(inspection.scheduledAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{inspection.location || inspection.inspectionLocation || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {inspection.inspector ? `Inspector ${inspection.inspector.userId}` : 'Unassigned'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {getActionButtons(inspection)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};

export default InspectionTable;
