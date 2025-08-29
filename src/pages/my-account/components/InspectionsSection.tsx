import React from 'react';
import { Shield, Calendar, BookOpen, Button as Btn } from 'lucide-react';
import { Button } from '../../../components/ui/DesignSystem';

interface Props {
  dashboardStats: { totalInspections: number; activeInspections: number; completedInspections: number };
  inspectionsLoading: boolean;
  userInspections: any[];
  onRequestInspection: () => void;
  onOpenDispute: (inspectionId: string) => void;
}

const Stat = ({ icon: Icon, title, value, subtitle, color, bgColor }: any) => (
  <div className={`rounded-xl p-4 ${bgColor}`}>
    <div className="flex items-center gap-3">
      <Icon className={`w-5 h-5 ${color}`} />
      <div>
        <div className="text-sm text-gray-600">{title}</div>
        <div className="text-lg font-semibold text-gray-900">{value}</div>
      </div>
    </div>
    {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
  </div>
);

const InspectionsSection: React.FC<Props> = ({ dashboardStats, inspectionsLoading, userInspections, onRequestInspection, onOpenDispute }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Stat icon={Shield} title="Total Inspections" value={dashboardStats.totalInspections} subtitle="All time" color="text-emerald-600" bgColor="bg-emerald-50" />
        <Stat icon={Calendar} title="Active Inspections" value={dashboardStats.activeInspections} subtitle="Currently pending" color="text-blue-600" bgColor="bg-blue-50" />
        <Stat icon={BookOpen} title="Completed" value={dashboardStats.completedInspections} subtitle="Successfully finished" color="text-green-600" bgColor="bg-green-50" />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Inspections Management</h3>
            <p className="text-sm text-gray-600">Manage your product inspections and disputes</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={onRequestInspection} className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-2">Request New Inspection</Button>
          </div>
        </div>

        <div className="space-y-4">
          {inspectionsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading inspections...</p>
            </div>
          ) : (userInspections || []).length > 0 ? (
            <div className="space-y-3">
              {(userInspections || []).map((inspection: any) => (
                <div key={inspection.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${inspection.status === 'completed' ? 'bg-green-100 text-green-800' : inspection.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : inspection.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>{String(inspection.status || '').replace('_', ' ').toUpperCase()}</span>
                        <span className="text-sm text-gray-500">{String(inspection.inspectionType || '').replace('_', ' ').toUpperCase()}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1"><strong>Location:</strong> {inspection.location}</p>
                      <p className="text-sm text-gray-600 mb-1"><strong>Scheduled:</strong> {inspection.scheduledAt ? new Date(inspection.scheduledAt).toLocaleDateString() : ''}</p>
                      {inspection.notes && <p className="text-sm text-gray-600"><strong>Notes:</strong> {inspection.notes}</p>}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button onClick={() => onOpenDispute(inspection.id)} variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-50">Raise Dispute</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Shield className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No inspections yet</h3>
              <p className="text-gray-600 mb-4">You haven't requested any inspections yet.</p>
              <Button onClick={onRequestInspection} className="bg-emerald-600 hover:bg-emerald-700 text-white px-1 py-2">Request Your First Inspection</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InspectionsSection;


