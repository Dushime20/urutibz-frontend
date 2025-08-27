import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, User, X } from 'lucide-react';
import { InspectionStatus, InspectionType, Inspector } from '../../types/inspection';
import { inspectorService } from '../../services/inspectionService';

interface InspectionFiltersPanelProps {
  selectedStatus: InspectionStatus[];
  selectedTypes: InspectionType[];
  onStatusChange: (status: InspectionStatus[]) => void;
  onTypeChange: (types: InspectionType[]) => void;
  onDateRangeChange: (start: string, end: string) => void;
  onLocationChange: (location: string) => void;
  onInspectorChange: (inspectorId: string) => void;
}

const InspectionFiltersPanel: React.FC<InspectionFiltersPanelProps> = ({
  selectedStatus,
  selectedTypes,
  onStatusChange,
  onTypeChange,
  onDateRangeChange,
  onLocationChange,
  onInspectorChange
}) => {
  const [inspectors, setInspectors] = useState<Inspector[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [location, setLocation] = useState('');
  const [selectedInspectorId, setSelectedInspectorId] = useState('');

  useEffect(() => {
    loadInspectors();
  }, []);

  const loadInspectors = async () => {
    try {
      const inspectorsData = await inspectorService.getInspectors();
      setInspectors(inspectorsData);
    } catch (error) {
      console.error('Error loading inspectors:', error);
    }
  };

  const handleStatusToggle = (status: InspectionStatus) => {
    const newStatus = selectedStatus.includes(status)
      ? selectedStatus.filter(s => s !== status)
      : [...selectedStatus, status];
    onStatusChange(newStatus);
  };

  const handleTypeToggle = (type: InspectionType) => {
    const newTypes = selectedTypes.includes(type)
      ? selectedTypes.filter(t => t !== type)
      : [...selectedTypes, type];
    onTypeChange(newTypes);
  };

  const handleDateRangeChange = () => {
    if (startDate && endDate) {
      onDateRangeChange(startDate, endDate);
    }
  };

  const handleLocationChange = () => {
    onLocationChange(location);
  };

  const handleInspectorChange = () => {
    onInspectorChange(selectedInspectorId);
  };

  const clearAllFilters = () => {
    onStatusChange([]);
    onTypeChange([]);
    onDateRangeChange('', '');
    onLocationChange('');
    onInspectorChange('');
    setStartDate('');
    setEndDate('');
    setLocation('');
    setSelectedInspectorId('');
  };

  const getStatusLabel = (status: InspectionStatus) => {
    switch (status) {
      case InspectionStatus.PENDING:
        return 'Pending';
      case InspectionStatus.IN_PROGRESS:
        return 'In Progress';
      case InspectionStatus.COMPLETED:
        return 'Completed';
      case InspectionStatus.DISPUTED:
        return 'Disputed';
      case InspectionStatus.RESOLVED:
        return 'Resolved';
      default:
        return status;
    }
  };

  const getTypeLabel = (type: InspectionType) => {
    switch (type) {
      case InspectionType.PRE_RENTAL:
        return 'Pre-Rental';
      case InspectionType.POST_RENTAL:
        return 'Post-Rental';
      case InspectionType.DAMAGE_ASSESSMENT:
        return 'Damage Assessment';
      case InspectionType.MAINTENANCE_CHECK:
        return 'Maintenance Check';
      case InspectionType.QUALITY_VERIFICATION:
        return 'Quality Verification';
      default:
        return type;
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <div className="space-y-2">
            {Object.values(InspectionStatus).map((status) => (
              <label key={status} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedStatus.includes(status)}
                  onChange={() => handleStatusToggle(status)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">
                  {getStatusLabel(status)}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type
          </label>
          <div className="space-y-2">
            {Object.values(InspectionType).map((type) => (
              <label key={type} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedTypes.includes(type)}
                  onChange={() => handleTypeToggle(type)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">
                  {getTypeLabel(type)}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Date Range Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date Range
          </label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="flex-1 text-sm border border-gray-300 rounded-md px-2 py-1"
                placeholder="Start date"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="flex-1 text-sm border border-gray-300 rounded-md px-2 py-1"
                placeholder="End date"
              />
            </div>
            <button
              onClick={handleDateRangeChange}
              className="w-full text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-200 hover:bg-blue-100"
            >
              Apply Date Range
            </button>
          </div>
        </div>

        {/* Location & Inspector Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="flex-1 text-sm border border-gray-300 rounded-md px-2 py-1"
                placeholder="Enter location"
              />
            </div>
            <button
              onClick={handleLocationChange}
              className="w-full text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-200 hover:bg-blue-100"
            >
              Apply Location
            </button>
          </div>

          <label className="block text-sm font-medium text-gray-700 mb-2 mt-4">
            Inspector
          </label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-gray-400" />
              <select
                value={selectedInspectorId}
                onChange={(e) => setSelectedInspectorId(e.target.value)}
                className="flex-1 text-sm border border-gray-300 rounded-md px-2 py-1"
              >
                <option value="">All Inspectors</option>
                {inspectors.map((inspector) => (
                  <option key={inspector.id} value={inspector.id}>
                    {inspector.userId} - {inspector.specializations.join(', ')}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleInspectorChange}
              className="w-full text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-200 hover:bg-blue-100"
            >
              Apply Inspector
            </button>
          </div>
        </div>
      </div>

      {/* Clear All Filters */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <button
          onClick={clearAllFilters}
          className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <X className="w-4 h-4 mr-2" />
          Clear All Filters
        </button>
      </div>
    </div>
  );
};

export default InspectionFiltersPanel;
