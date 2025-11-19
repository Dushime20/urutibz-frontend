import React, { useEffect, useState } from 'react';
import { Eye, Clock, MapPin, CheckCircle2, AlertCircle, Search, Filter, Play, CheckCircle, Calendar, Info, X } from 'lucide-react';
import type { Inspection } from '../../../types/inspection';
import StatusBadge from '../../../components/inspections/StatusBadge';
import { useTranslation } from '../../../hooks/useTranslation';
import { TranslatedText } from '../../../components/translated-text';

interface AllInspectionsTabProps {
  inspections: Inspection[];
  onInspectionClick: (id: string) => void;
  onStart: (id: string) => void;
  onComplete: (id: string) => void;
  onReschedule: (id: string) => void;
  onAddItem: (id: string) => void;
  formatDate: (date: string) => string;
  getTypeLabel: (type: string) => string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
}

const AllInspectionsTab: React.FC<AllInspectionsTabProps> = ({
  inspections,
  onInspectionClick,
  onStart,
  onComplete,
  formatDate,
  getTypeLabel,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter
}) => {
  const { tSync } = useTranslation();
  const [showDebugPanel, setShowDebugPanel] = useState(false);

  // Console log retrieved data
  useEffect(() => {
    console.log('🔍 [AllInspectionsTab] Inspections Data:', {
      totalInspections: inspections.length,
      inspections: inspections,
      searchQuery,
      statusFilter,
      timestamp: new Date().toISOString()
    });

    // Log inspection breakdown by status
    const statusBreakdown = inspections.reduce((acc, ins) => {
      acc[ins.status] = (acc[ins.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    console.log('📊 [AllInspectionsTab] Status Breakdown:', statusBreakdown);

    // Log inspection breakdown by type
    const typeBreakdown = inspections.reduce((acc, ins) => {
      const type = ins.inspectionType || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    console.log('📋 [AllInspectionsTab] Type Breakdown:', typeBreakdown);
  }, [inspections, searchQuery, statusFilter]);

  // Filter inspections
  const filteredInspections = inspections.filter(ins => {
    const matchesSearch = !searchQuery || 
      ins.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ins.inspectionType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ins.location?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || ins.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Log filtered results
  useEffect(() => {
    console.log('✅ [AllInspectionsTab] Filtered Results:', {
      total: filteredInspections.length,
      filtered: filteredInspections,
      filters: { searchQuery, statusFilter }
    });
  }, [filteredInspections, searchQuery, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Debug Panel Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Info className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredInspections.length} of {inspections.length} inspections
          </span>
        </div>
        <button
          onClick={() => setShowDebugPanel(!showDebugPanel)}
          className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
        >
          {showDebugPanel ? 'Hide' : 'Show'} Debug Data
        </button>
      </div>

      {/* Debug Panel */}
      {showDebugPanel && (
        <div className="bg-gray-900 rounded-xl p-4 text-green-400 font-mono text-xs overflow-auto max-h-96">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-green-300">Console Data (Check Browser Console for Full Logs)</span>
            <button
              onClick={() => setShowDebugPanel(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <pre className="whitespace-pre-wrap break-words">
            {JSON.stringify({
              totalInspections: inspections.length,
              filteredCount: filteredInspections.length,
              filters: { searchQuery, statusFilter },
              sampleInspection: filteredInspections[0] || null,
              statusBreakdown: inspections.reduce((acc, ins) => {
                acc[ins.status] = (acc[ins.status] || 0) + 1;
                return acc;
              }, {} as Record<string, number>)
            }, null, 2)}
          </pre>
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={tSync('Search inspections by ID, type, or location...')}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                console.log('🔎 [AllInspectionsTab] Search query changed:', e.target.value);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-my-primary focus:border-my-primary dark:bg-gray-700 dark:text-gray-100"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                console.log('🔽 [AllInspectionsTab] Status filter changed:', e.target.value);
              }}
              className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-my-primary focus:border-my-primary dark:bg-gray-700 dark:text-gray-100"
            >
              <option value="all"><TranslatedText text="All Status" /></option>
              <option value="pending"><TranslatedText text="Pending" /></option>
              <option value="in_progress"><TranslatedText text="In Progress" /></option>
              <option value="completed"><TranslatedText text="Completed" /></option>
            </select>
          </div>
        </div>
      </div>

      {/* Inspections List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                <TranslatedText text="All Requested Inspections" />
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {filteredInspections.length} <TranslatedText text={filteredInspections.length !== 1 ? "inspections found" : "inspection found"} />
                {searchQuery || statusFilter !== 'all' ? ` (${tSync('filtered')})` : ''}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-my-primary">{filteredInspections.length}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400"><TranslatedText text="Total" /></div>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {filteredInspections.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2"><TranslatedText text="No inspections found" /></h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchQuery || statusFilter !== 'all' 
                  ? <TranslatedText text="Try adjusting your search or filters" />
                  : <TranslatedText text="No inspections have been assigned to you yet" />}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInspections.map((inspection) => {
                // Log each inspection when rendered
                console.log('📝 [AllInspectionsTab] Rendering inspection:', {
                  id: inspection.id,
                  type: inspection.inspectionType,
                  status: inspection.status,
                  scheduledAt: inspection.scheduledAt,
                  location: inspection.location,
                  fullData: inspection
                });

                return (
                  <div
                    key={inspection.id}
                    className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-my-primary dark:hover:border-my-primary hover:shadow-md transition-all"
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                              {getTypeLabel(inspection.inspectionType || '')}
                            </h4>
                            <StatusBadge status={inspection.status} />
                            {inspection.id && (
                              <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                {inspection.id.substring(0, 8)}...
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            {inspection.scheduledAt && (
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span><TranslatedText text="Scheduled" />: {formatDate(inspection.scheduledAt)}</span>
                              </div>
                            )}
                            {inspection.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                <span>{inspection.location}</span>
                              </div>
                            )}
                            {inspection.createdAt && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span><TranslatedText text="Created" />: {formatDate(inspection.createdAt)}</span>
                              </div>
                            )}
                          </div>
                          {inspection.inspectorNotes && (
                            <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded text-sm text-gray-700 dark:text-gray-300">
                              <strong><TranslatedText text="Notes" />:</strong> {inspection.inspectorNotes}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('👁️ [AllInspectionsTab] View inspection clicked:', inspection.id);
                            onInspectionClick(inspection.id);
                          }}
                          className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          <TranslatedText text="View Details" />
                        </button>
                        {inspection.status === 'pending' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log('▶️ [AllInspectionsTab] Start inspection clicked:', inspection.id);
                              onStart(inspection.id);
                            }}
                            className="px-3 py-1.5 text-sm font-medium text-white bg-my-primary hover:bg-my-primary/90 rounded-lg transition-colors flex items-center gap-2"
                          >
                            <Play className="w-4 h-4" />
                            <TranslatedText text="Start" />
                          </button>
                        )}
                        {inspection.status === 'in_progress' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log('✅ [AllInspectionsTab] Complete inspection clicked:', inspection.id);
                              onComplete(inspection.id);
                            }}
                            className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <TranslatedText text="Complete" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllInspectionsTab;

