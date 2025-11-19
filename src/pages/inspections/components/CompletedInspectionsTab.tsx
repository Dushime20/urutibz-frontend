import React from 'react';
import { Eye, Clock, MapPin, CheckCircle2, Search, FileText, Download } from 'lucide-react';
import type { Inspection } from '../../../types/inspection';
import StatusBadge from '../../../components/inspections/StatusBadge';
import { useTranslation } from '../../../hooks/useTranslation';
import { TranslatedText } from '../../../components/translated-text';

interface CompletedInspectionsTabProps {
  inspections: Inspection[];
  onInspectionClick: (id: string) => void;
  formatDate: (date: string) => string;
  getTypeLabel: (type: string) => string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const CompletedInspectionsTab: React.FC<CompletedInspectionsTabProps> = ({
  inspections,
  onInspectionClick,
  formatDate,
  getTypeLabel,
  searchQuery,
  setSearchQuery
}) => {
  const { tSync } = useTranslation();
  // Filter inspections by search
  const filteredInspections = inspections.filter(ins => {
    return !searchQuery || 
      ins.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ins.inspectionType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ins.location?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={tSync('Search completed inspections...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-my-primary focus:border-my-primary dark:bg-gray-700 dark:text-gray-100"
          />
        </div>
      </div>

      {/* Completed Inspections List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                <TranslatedText text="Completed Inspections" /> ({filteredInspections.length})
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                <TranslatedText text="View and download inspection reports" />
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {filteredInspections.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2"><TranslatedText text="No completed inspections" /></h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchQuery 
                  ? <TranslatedText text="No completed inspections match your search" />
                  : <TranslatedText text="Completed inspections will appear here" />}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInspections.map((inspection) => (
                <div
                  key={inspection.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-500 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        {getTypeLabel(inspection.inspectionType || '')}
                      </h4>
                      <StatusBadge status={inspection.status} />
                      {inspection.completedAt && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          <TranslatedText text="Completed" /> {formatDate(inspection.completedAt)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                      {inspection.scheduledAt && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span><TranslatedText text="Scheduled" />: {formatDate(inspection.scheduledAt)}</span>
                        </div>
                      )}
                      {inspection.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{inspection.location}</span>
                        </div>
                      )}
                    </div>
                    {inspection.inspectorNotes && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                          <TranslatedText text="Notes" />: {inspection.inspectorNotes}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onInspectionClick(inspection.id)}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-my-primary hover:bg-my-primary/10 rounded-lg transition-colors"
                      title={tSync('View Report')}
                    >
                      <FileText className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => onInspectionClick(inspection.id)}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                      title={tSync('Download Report')}
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompletedInspectionsTab;

