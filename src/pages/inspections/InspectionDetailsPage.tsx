import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Play, 
  CheckCircle, 
  Camera, 
  Plus,
  MapPin,
  Calendar,
  User,
  FileText,
  AlertTriangle
} from 'lucide-react';
import type { Inspection } from '../../types/inspection';
import { inspectionService } from '../../services/inspectionService';
import StatusBadge from '../../components/inspections/StatusBadge';

const InspectionDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadInspection();
    }
  }, [id]);

  const loadInspection = async () => {
    try {
      setLoading(true);
      if (id) {
        const inspectionData = await inspectionService.getInspection(id);
        setInspection(inspectionData);
      }
    } catch (error) {
      console.error('Error loading inspection:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartInspection = async () => {
    if (!inspection) return;
    
    try {
      await inspectionService.startInspection(inspection.id, { notes: '' });
      await loadInspection(); // Reload to get updated status
    } catch (error) {
      console.error('Error starting inspection:', error);
    }
  };

  const handleCompleteInspection = () => {
    if (!inspection) return;
    navigate(`/inspections/${inspection.id}/complete`);
  };

  const handleEditInspection = () => {
    if (!inspection) return;
    navigate(`/inspections/${inspection.id}/edit`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!inspection) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Inspection not found</h3>
          <p className="mt-1 text-sm text-gray-500">
            The inspection you're looking for doesn't exist.
          </p>
          <div className="mt-6">
            <button
              onClick={() => navigate('/inspections')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Back to Inspections
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/inspections')}
                className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Inspections
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {inspection.product?.name || `Product ${inspection.productId}`}
                </h1>
                <p className="text-sm text-gray-500">
                  Inspection ID: {inspection.id}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <StatusBadge status={inspection.status} size="lg" />
              <div className="flex space-x-2">
                {inspection.status === 'pending' && (
                  <button
                    onClick={handleStartInspection}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Inspection
                  </button>
                )}
                {inspection.status === 'in_progress' && (
                  <button
                    onClick={handleCompleteInspection}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Complete Inspection
                  </button>
                )}
                {['pending', 'in_progress'].includes(inspection.status) && (
                  <button
                    onClick={handleEditInspection}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Inspection Details */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Inspection Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Type</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {getTypeLabel(inspection.inspectionType)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Status</label>
                    <div className="mt-1">
                      <StatusBadge status={inspection.status} size="sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Scheduled</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {formatDate(inspection.scheduledAt)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Location</label>
                    <p className="mt-1 text-sm text-gray-900">{inspection.location}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Inspector</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {inspection.inspector ? `Inspector ${inspection.inspector.userId}` : 'Unassigned'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Created</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {formatDate(inspection.createdAt)}
                    </p>
                  </div>
                </div>
                {inspection.notes && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-500">Notes</label>
                    <p className="mt-1 text-sm text-gray-900">{inspection.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Inspection Items */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Inspection Items</h3>
                  <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </button>
                </div>
                {inspection.items.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No items added</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Start adding inspection items to assess the product condition.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {inspection.items.map((item) => (
                      <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900">{item.itemName}</h4>
                            <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                            <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                              <span>Condition: {item.condition}</span>
                              <span>Repair Cost: ${item.repairCost}</span>
                              <span>Replacement Cost: ${item.replacementCost}</span>
                            </div>
                          </div>
                          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                            Edit
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Photos */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Photos</h3>
                  <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100">
                    <Camera className="w-4 h-4 mr-2" />
                    Add Photo
                  </button>
                </div>
                {inspection.photos.length === 0 ? (
                  <div className="text-center py-8">
                    <Camera className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No photos added</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Add photos to document the inspection process.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {inspection.photos.map((photo) => (
                      <div key={photo.id} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={photo.url}
                          alt={photo.description || 'Inspection photo'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                    <Camera className="w-4 h-4 mr-2" />
                    Take Photo
                  </button>
                  <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                    <FileText className="w-4 h-4 mr-2" />
                    Add Note
                  </button>
                  <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Raise Dispute
                  </button>
                </div>
              </div>
            </div>

            {/* Disputes */}
            {inspection.disputes.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Disputes</h3>
                  <div className="space-y-3">
                    {inspection.disputes.map((dispute) => (
                      <div key={dispute.id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">
                            {dispute.type}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            dispute.status === 'open' ? 'bg-red-100 text-red-800' :
                            dispute.status === 'resolved' ? 'bg-green-100 text-green-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {dispute.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{dispute.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InspectionDetailsPage;
