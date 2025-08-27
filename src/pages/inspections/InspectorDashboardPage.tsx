import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  User,
  Star,
  Settings,
  Bell,
  ChevronDown,
  LogOut,
  UserCheck,
  Shield,
  HelpCircle,
  FileText,
  BarChart3
} from 'lucide-react';
import type { Inspection, Inspector } from '../../types/inspection';
import { DisputeType } from '../../types/inspection';
import { inspectionService, inspectorService, inspectionItemService, disputeService } from '../../services/inspectionService';
import StatusBadge from '../../components/inspections/StatusBadge';
import QuickStatsCard from '../../components/inspections/QuickStatsCard';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

const InspectorDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [inspector, setInspector] = useState<Inspector | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReschedule, setShowReschedule] = useState<{ open: boolean; id: string | null; value: string }>(() => ({ open: false, id: null, value: '' }));
  const [showComplete, setShowComplete] = useState<{ open: boolean; id: string | null; notes: string; items: Array<{ itemName: string; condition: string; notes: string; repairCost: number; replacementCost: number; requiresRepair: boolean; requiresReplacement: boolean }> }>(() => ({
    open: false,
    id: null,
    notes: '',
    items: [
      { itemName: '', condition: 'good', notes: '', repairCost: 0, replacementCost: 0, requiresRepair: false, requiresReplacement: false }
    ]
  }));

  const [showAddItem, setShowAddItem] = useState<{
    open: boolean;
    inspectionId: string | null;
    item: {
      itemName: string;
      description: string;
      condition: string;
      notes: string;
      repairCost: number;
      replacementCost: number;
      requiresRepair: boolean;
      requiresReplacement: boolean;
      photos: File[];
    };
  }>(() => ({
    open: false,
    inspectionId: null,
    item: {
      itemName: '',
      description: '',
      condition: 'good',
      notes: '',
      repairCost: 0,
      replacementCost: 0,
      requiresRepair: false,
      requiresReplacement: false,
      photos: []
    }
  }));

  const [showDispute, setShowDispute] = useState<{
    open: boolean;
    inspectionId: string | null;
    disputeType: DisputeType;
    reason: string;
    evidence: string;
    photos: File[];
  }>(() => ({
    open: false,
    inspectionId: null,
    disputeType: DisputeType.DAMAGE_ASSESSMENT,
    reason: '',
    evidence: '',
    photos: []
  }));

  const [showResolveDispute, setShowResolveDispute] = useState<{
    open: boolean;
    inspectionId: string | null;
    disputeId: string | null;
    resolutionNotes: string;
    agreedAmount: number;
  }>(() => ({
    open: false,
    inspectionId: null,
    disputeId: null,
    resolutionNotes: '',
    agreedAmount: 0
  }));

  // Enhanced header states
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'New inspection assigned', time: '2 min ago', unread: true },
    { id: 2, message: 'Dispute resolved successfully', time: '1 hour ago', unread: false },
    { id: 3, message: 'Performance review completed', time: '2 hours ago', unread: false }
  ]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.profile-dropdown') && !target.closest('.profile-button')) {
        setShowProfileDropdown(false);
      }
      if (!target.closest('.settings-dropdown') && !target.closest('.settings-button')) {
        setShowSettingsDropdown(false);
      }
      if (!target.closest('.notifications-dropdown') && !target.closest('.notifications-button')) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    disputed: 0
  });

  const [inspectorDisputes, setInspectorDisputes] = useState<any[]>([]);
  const [disputesLoading, setDisputesLoading] = useState(false);

  useEffect(() => {
    loadInspectorData();
  }, []);

  const loadInspectorData = async () => {
    try {
      setLoading(true);
      // Get the inspector ID from the authenticated user (fallback to placeholder)
      const inspectorId = user?.id || 'current-inspector-id';
      
      // Load inspector profile (best-effort)
      try {
        const inspectorData = await inspectorService.getInspector(inspectorId);
        setInspector(inspectorData);
      } catch (e) {
        // If profile fetch fails, keep minimal header info
        setInspector(null);
      }
      
      // Load inspector's inspections
      const response = await inspectionService.getInspectionsByInspector(inspectorId);
      const inspectionsList: Inspection[] = Array.isArray(response?.inspections)
        ? response.inspections
        : (Array.isArray(response) ? response as Inspection[] : []);
      setInspections(inspectionsList);
      
      // Calculate stats
      const statsData = {
        total: (response?.total ?? inspectionsList.length) as number,
        pending: inspectionsList.filter(i => i.status === 'pending').length,
        inProgress: inspectionsList.filter(i => i.status === 'in_progress').length,
        completed: inspectionsList.filter(i => i.status === 'completed').length,
        disputed: inspectionsList.filter(i => i.status === 'disputed').length
      };
      setStats(statsData);

      // Load inspector's disputes
      await loadInspectorDisputes();
    } catch (error) {
      console.error('Error loading inspector data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadInspectorDisputes = async () => {
    try {
      setDisputesLoading(true);
      console.log('Loading inspector disputes...');
      const response = await disputeService.getAllDisputes();
      console.log('Inspector disputes response:', response);
      console.log('Inspector disputes array:', response.disputes);
      setInspectorDisputes(response.disputes || []);
    } catch (error) {
      console.error('Error loading inspector disputes:', error);
      setInspectorDisputes([]);
    } finally {
      setDisputesLoading(false);
    }
  };

  const handleInspectionClick = (inspectionId: string) => {
    navigate(`/inspections/${inspectionId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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

  const handleStart = async (inspectionId: string) => {
    try {
      await inspectionService.startInspection(inspectionId, { startedAt: new Date().toISOString() } as any);
      await loadInspectorData();
      showToast('Inspection started successfully', 'success');
    } catch (e) {
      console.error('Failed to start inspection:', e);
      showToast('Failed to start inspection', 'error');
    }
  };

  const handleComplete = async (inspectionId: string) => {
    setShowComplete({
      open: true,
      id: inspectionId,
      notes: '',
      items: [
        { itemName: '', condition: 'good', notes: '', repairCost: 0, replacementCost: 0, requiresRepair: false, requiresReplacement: false }
      ]
    });
  };

  const handleReschedule = async (inspectionId: string) => {
    setShowReschedule({ open: true, id: inspectionId, value: '' });
  };

  const handleAddItem = (inspectionId: string) => {
    setShowAddItem({
      open: true,
      inspectionId,
      item: {
        itemName: '',
        description: '',
        condition: 'good',
        notes: '',
        repairCost: 0,
        replacementCost: 0,
        requiresRepair: false,
        requiresReplacement: false,
        photos: []
      }
    });
  };

  const handleRaiseDispute = (inspectionId: string) => {
    setShowDispute({
      open: true,
      inspectionId,
      disputeType: DisputeType.DAMAGE_ASSESSMENT,
      reason: '',
      evidence: '',
      photos: []
    });
  };

  const handleResolveDispute = (inspectionId: string, disputeId: string) => {
    setShowResolveDispute({
      open: true,
      inspectionId,
      disputeId,
      resolutionNotes: '',
      agreedAmount: 0
    });
  };

  const submitResolveDispute = async () => {
    if (!showResolveDispute.inspectionId || !showResolveDispute.disputeId) return;

    try {
      await disputeService.resolveDispute(
        showResolveDispute.inspectionId,
        showResolveDispute.disputeId,
        {
          resolutionNotes: showResolveDispute.resolutionNotes,
          agreedAmount: showResolveDispute.agreedAmount > 0 ? showResolveDispute.agreedAmount : undefined
        }
      );
      
      showToast('Dispute resolved successfully', 'success');
      setShowResolveDispute({
        open: false,
        inspectionId: null,
        disputeId: null,
        resolutionNotes: '',
        agreedAmount: 0
      });
      
      // Reload disputes to show updated status
      await loadInspectorDisputes();
    } catch (error) {
      console.error('Error resolving dispute:', error);
      showToast('Failed to resolve dispute', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Professional Header */}
      <div className="bg-white  border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-emerald-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Inspector Dashboard</h1>
              </div>
              <div className="hidden md:flex items-center space-x-6 text-sm text-gray-600">
                <span className="flex items-center space-x-2">
                  <UserCheck className="w-4 h-4" />
                  <span>Professional Inspector</span>
                </span>
                <span className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4" />
                  <span>Performance Tracking</span>
                </span>
              </div>
            </div>
            
            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors notifications-button"
                >
                  <Bell className="w-5 h-5" />
                  {notifications.filter(n => n.unread).length > 0 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                      {notifications.filter(n => n.unread).length}
                    </span>
                  )}
                </button>
                
                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 notifications-dropdown">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div key={notification.id} className={`p-4 border-b border-gray-100 hover:bg-gray-50 ${notification.unread ? 'bg-blue-50' : ''}`}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className={`text-sm ${notification.unread ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                            </div>
                            {notification.unread && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full ml-2"></div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 border-t border-gray-200">
                      <button className="w-full text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                        View All Notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Settings Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
                  className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors settings-button"
                >
                  <Settings className="w-5 h-5" />
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                {showSettingsDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50 settings-dropdown">
                    <div className="py-2">
                      <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3">
                        <UserCheck className="w-4 h-4" />
                        <span>Profile Settings</span>
                      </button>
                      <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3">
                        <Shield className="w-4 h-4" />
                        <span>Account Security</span>
                      </button>
                      <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3">
                        <FileText className="w-4 h-4" />
                        <span>Documentation</span>
                      </button>
                      <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3">
                        <HelpCircle className="w-4 h-4" />
                        <span>Help & Support</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg transition-colors profile-button"
                >
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {inspector?.userId || user?.name || 'Inspector'}
                    </p>
                    <p className="text-xs text-gray-500">Professional Inspector</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
                
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50 profile-dropdown">
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {inspector?.userId || user?.name || 'Inspector'}
                          </p>
                          <p className="text-xs text-gray-500">ID: {inspector?.id || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="py-2">
                      <div className="px-4 py-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Rating</span>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-amber-500 fill-current" />
                            <span className="font-medium">{inspector?.rating || 0}/5.0</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm mt-2">
                          <span className="text-gray-600">Experience</span>
                          <span className="font-medium">{inspector?.experience || 0} years</span>
                        </div>
                        <div className="flex items-center justify-between text-sm mt-2">
                          <span className="text-gray-600">Total Inspections</span>
                          <span className="font-medium">{inspector?.totalInspections || 0}</span>
                        </div>
                      </div>
                      
                      <div className="border-t border-gray-200 pt-2">
                        <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3">
                          <UserCheck className="w-4 h-4" />
                          <span>Edit Profile</span>
                        </button>
                        <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3">
                          <BarChart3 className="w-4 h-4" />
                          <span>Performance Report</span>
                        </button>
                        <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3">
                          <FileText className="w-4 h-4" />
                          <span>Certifications</span>
                        </button>
                      </div>
                      
                      <div className="border-t border-gray-200 pt-2">
                        <button
                          onClick={() => { logout(); navigate('/login'); }}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Subtitle */}
          
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Enhanced Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <QuickStatsCard
            title="Total Assigned"
            value={stats.total}
            icon={TrendingUp}
            color="blue"
          />
          <QuickStatsCard
            title="Pending"
            value={stats.pending}
            icon={Clock}
            color="yellow"
          />
          <QuickStatsCard
            title="In Progress"
            value={stats.inProgress}
            icon={Clock}
            color="blue"
          />
          <QuickStatsCard
            title="Completed"
            value={stats.completed}
            icon={CheckCircle}
            color="green"
          />
          <QuickStatsCard
            title="Disputed"
            value={stats.disputed}
            icon={AlertTriangle}
            color="red"
          />
        </div>

        {/* Today's Schedule - Enhanced */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8 overflow-hidden">
          <div className="px-6 py-6 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-blue-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Today's Schedule</h3>
                  <p className="text-sm text-gray-600">Your upcoming inspections and tasks</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{inspections.length}</p>
                <p className="text-sm text-gray-500">Total Inspections</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {inspections.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No inspections scheduled</h3>
                <p className="text-gray-600 max-w-sm mx-auto">
                  You have no inspections scheduled for today. Check back later for new assignments.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {inspections.slice(0, 5).map((inspection) => (
                  <div
                    key={inspection.id}
                    className="group relative bg-gray-50 hover:bg-white border border-gray-200 rounded-lg p-5 transition-all duration-200 hover:shadow-md cursor-pointer"
                    onClick={() => handleInspectionClick(inspection.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="flex-shrink-0">
                            <StatusBadge status={inspection.status} size="sm" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-base font-semibold text-gray-900 truncate">
                              {inspection.product?.name || `Product ${inspection.productId}`}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {getTypeLabel(inspection.inspectionType)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center text-gray-600">
                            <Clock className="w-4 h-4 mr-2 text-gray-400" />
                            <span>{formatDate(inspection.scheduledAt)}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                            <span className="truncate">{inspection.location}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        {inspection.status === 'pending' && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleStart(inspection.id); }}
                            className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors font-medium text-sm"
                          >
                            Start
                          </button>
                        )}
                        {inspection.status === 'in_progress' && (
                          <>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleAddItem(inspection.id); }}
                              className="px-3 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors font-medium text-sm"
                            >
                              Add Item
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleComplete(inspection.id); }}
                              className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors font-medium text-sm"
                            >
                              Complete
                            </button>
                          </>
                        )}
                        {(inspection.status === 'pending' || inspection.status === 'in_progress') && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleReschedule(inspection.id); }}
                            className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors font-medium text-sm"
                          >
                            Reschedule
                          </button>
                        )}
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleRaiseDispute(inspection.id); }}
                          className="px-3 py-2 rounded-lg border border-red-300 bg-white text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors font-medium text-sm"
                        >
                          Raise Dispute
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity - Enhanced */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8 overflow-hidden">
          <div className="px-6 py-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Recent Activity</h3>
                <p className="text-sm text-gray-600">Latest inspection updates and actions</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {inspections.slice(0, 10).map((inspection) => (
                <div
                  key={inspection.id}
                  className="flex items-center justify-between p-4 bg-gray-50 hover:bg-white border border-gray-200 rounded-lg transition-colors cursor-pointer group"
                  onClick={() => handleInspectionClick(inspection.id)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                        {inspection.product?.name || `Product ${inspection.productId}`}
                      </p>
                      <p className="text-xs text-gray-500">
                        {getTypeLabel(inspection.inspectionType)} • {inspection.location}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <StatusBadge status={inspection.status} size="sm" />
                    <span className="text-xs text-gray-400">
                      {formatDate(inspection.updatedAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Disputes Section - Enhanced */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-6 border-b border-gray-200 bg-gradient-to-r from-red-50 to-pink-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Active Disputes</h3>
                  <p className="text-sm text-gray-600">Manage and resolve inspection disputes</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{inspectorDisputes.length}</p>
                <p className="text-sm text-gray-500">Open Cases</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {disputesLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Loading disputes...</p>
              </div>
            ) : (inspectorDisputes || []).length > 0 ? (
              <div className="space-y-4">
                {(inspectorDisputes || []).map((dispute) => (
                  <div
                    key={dispute.id}
                    className="bg-gray-50 hover:bg-white border border-gray-200 rounded-lg p-5 transition-all duration-200 hover:shadow-md"
                  >
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            dispute.status === 'resolved' ? 'bg-green-100 text-green-800' :
                            dispute.status === 'under_review' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {dispute.status.replace('_', ' ').toUpperCase()}
                          </span>
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                            {dispute.disputeType?.replace('_', ' ').toUpperCase() || 'DISPUTE'}
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-sm text-gray-900">
                            <span className="font-semibold">Reason:</span> {dispute.reason}
                          </p>
                          {dispute.evidence && (
                            <p className="text-sm text-gray-700">
                              <span className="font-semibold">Evidence:</span> {dispute.evidence}
                            </p>
                          )}
                          <p className="text-sm text-gray-500">
                            <span className="font-medium">Raised:</span> {new Date(dispute.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                        {dispute.status === 'open' && (
                          <>
                            <button
                              onClick={() => handleRaiseDispute(dispute.inspectionId)}
                              className="w-full sm:w-auto px-4 py-2 rounded-lg border border-blue-300 bg-white text-blue-700 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors font-medium text-sm"
                            >
                              View Details
                            </button>
                            <button
                              onClick={() => handleResolveDispute(dispute.inspectionId, dispute.id)}
                              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors font-medium text-sm"
                            >
                              Resolve Dispute
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No disputes yet</h3>
                <p className="text-gray-600 max-w-sm mx-auto">
                  You haven't been involved in any disputes yet. Keep up the good work!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reschedule Modal */}
      {showReschedule.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowReschedule({ open: false, id: null, value: '' })} />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reschedule Inspection</h3>
            <label className="block text-sm text-gray-700 mb-2">New date-time</label>
            <input
              type="datetime-local"
              value={showReschedule.value}
              onChange={(e) => setShowReschedule((s) => ({ ...s, value: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setShowReschedule({ open: false, id: null, value: '' })} className="px-4 py-2 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">Cancel</button>
              <button
                onClick={async () => {
                  if (!showReschedule.id || !showReschedule.value) return;
                  try {
                    // Convert local input to ISO if needed
                    const iso = new Date(showReschedule.value).toISOString();
                    await inspectionService.updateInspection(showReschedule.id, { scheduledAt: iso } as any);
                    setShowReschedule({ open: false, id: null, value: '' });
                    await loadInspectorData();
                    showToast('Inspection rescheduled', 'success');
                  } catch (e) {
                    console.error('Failed to reschedule:', e);
                    showToast('Failed to reschedule inspection', 'error');
                  }
                }}
                className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complete Modal */}
      {showComplete.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowComplete({ open: false, id: null, notes: '', items: [{ itemName: '', condition: 'good', notes: '', repairCost: 0, replacementCost: 0, requiresRepair: false, requiresReplacement: false }] })} />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Complete Inspection</h3>
            <label className="block text-sm text-gray-700 mb-2">Completion notes</label>
            <textarea
              rows={3}
              value={showComplete.notes}
              onChange={(e) => setShowComplete((s) => ({ ...s, notes: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Add any notes (optional)"
            />
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm text-gray-700">Items</label>
                <button
                  type="button"
                  onClick={() => setShowComplete((s) => {
                    // Prevent adding a new item when there is an unfinished (blank) one
                    const hasBlank = s.items.some((it) => !String(it.itemName || '').trim());
                    if (hasBlank) {
                      showToast('Please fill the current item name before adding another.', 'error');
                      return s;
                    }
                    return { ...s, items: [...s.items, { itemName: '', condition: 'good', notes: '', repairCost: 0, replacementCost: 0, requiresRepair: false, requiresReplacement: false }] };
                  })}
                  className="text-xs px-2 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                >
                  Add item
                </button>
              </div>
              <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                {showComplete.items.map((it, idx) => (
                  <div key={idx} className="border rounded-md p-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Item name</label>
                        <input value={it.itemName} onChange={(e) => setShowComplete((s) => { const items = [...s.items]; items[idx].itemName = e.target.value; return { ...s, items }; })} className="w-full border border-gray-300 rounded px-2 py-1" placeholder="e.g., Camera Body" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Condition</label>
                        <select value={it.condition} onChange={(e) => setShowComplete((s) => { const items = [...s.items]; items[idx].condition = e.target.value; return { ...s, items }; })} className="w-full border border-gray-300 rounded px-2 py-1">
                          <option value="excellent">Excellent</option>
                          <option value="good">Good</option>
                          <option value="fair">Fair</option>
                          <option value="poor">Poor</option>
                          <option value="damaged">Damaged</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Repair cost</label>
                        <input type="number" min="0" value={it.repairCost} onChange={(e) => setShowComplete((s) => { const items = [...s.items]; items[idx].repairCost = Number(e.target.value); return { ...s, items }; })} className="w-full border border-gray-300 rounded px-2 py-1" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Replacement cost</label>
                        <input type="number" min="0" value={it.replacementCost} onChange={(e) => setShowComplete((s) => { const items = [...s.items]; items[idx].replacementCost = Number(e.target.value); return { ...s, items }; })} className="w-full border border-gray-300 rounded px-2 py-1" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs text-gray-600 mb-1">Notes</label>
                        <input value={it.notes} onChange={(e) => setShowComplete((s) => { const items = [...s.items]; items[idx].notes = e.target.value; return { ...s, items }; })} className="w-full border border-gray-300 rounded px-2 py-1" placeholder="Condition details" />
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                        <input type="checkbox" checked={it.requiresRepair} onChange={(e) => setShowComplete((s) => { const items = [...s.items]; items[idx].requiresRepair = e.target.checked; return { ...s, items }; })} />
                        Requires repair
                      </label>
                      <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                        <input type="checkbox" checked={it.requiresReplacement} onChange={(e) => setShowComplete((s) => { const items = [...s.items]; items[idx].requiresReplacement = e.target.checked; return { ...s, items }; })} />
                        Requires replacement
                      </label>
                      {showComplete.items.length > 1 && (
                        <button type="button" onClick={() => setShowComplete((s) => ({ ...s, items: s.items.filter((_, i) => i !== idx) }))} className="ml-auto text-xs text-red-600 hover:underline">Remove</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setShowComplete({ open: false, id: null, notes: '', items: [ { itemName: '', condition: 'good', notes: '', repairCost: 0, replacementCost: 0, requiresRepair: false, requiresReplacement: false } ] })} className="px-4 py-2 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">Cancel</button>
              <button
                onClick={async () => {
                  if (!showComplete.id) return;
                  try {
                    // Validate no duplicate item names (case-insensitive, trimmed)
                    const names = showComplete.items.map((i) => String(i.itemName || '').trim().toLowerCase()).filter(Boolean);
                    const hasDup = new Set(names).size !== names.length;
                    if (hasDup) {
                      showToast('Duplicate item names are not allowed.', 'error');
                      return;
                    }
                    const itemsPayload = showComplete.items.map((i) => ({
                      itemName: i.itemName,
                      condition: i.condition,
                      notes: i.notes,
                      repairCost: i.repairCost,
                      replacementCost: i.replacementCost,
                      requiresRepair: i.requiresRepair,
                      requiresReplacement: i.requiresReplacement,
                    }));
                    await inspectionService.completeInspection(showComplete.id, { generalNotes: showComplete.notes, items: itemsPayload } as any);
                    setShowComplete({ open: false, id: null, notes: '', items: [ { itemName: '', condition: 'good', notes: '', repairCost: 0, replacementCost: 0, requiresRepair: false, requiresReplacement: false } ] });
                    await loadInspectorData();
                    showToast('Inspection completed', 'success');
                  } catch (e) {
                    console.error('Failed to complete inspection:', e);
                    showToast('Failed to complete inspection', 'error');
                  }
                }}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                Complete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddItem.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowAddItem({ open: false, inspectionId: null, item: { itemName: '', condition: 'good', notes: '', repairCost: 0, replacementCost: 0, requiresRepair: false, requiresReplacement: false } })} />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Inspection Item</h3>
            
                         <div className="space-y-4">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
                   <input
                     type="text"
                     value={showAddItem.item.itemName}
                     onChange={(e) => setShowAddItem(s => ({ ...s, item: { ...s.item, itemName: e.target.value } }))}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                     placeholder="e.g., Camera Body, Lens, Tripod"
                   />
                 </div>
                 
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Condition *</label>
                   <select
                     value={showAddItem.item.condition}
                     onChange={(e) => setShowAddItem(s => ({ ...s, item: { ...s.item, condition: e.target.value } }))}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                   >
                     <option value="excellent">Excellent</option>
                     <option value="good">Good</option>
                     <option value="fair">Fair</option>
                     <option value="poor">Poor</option>
                     <option value="damaged">Damaged</option>
                   </select>
                 </div>
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                 <input
                   type="text"
                   value={showAddItem.item.description}
                   onChange={(e) => setShowAddItem(s => ({ ...s, item: { ...s.item, description: e.target.value } }))}
                   className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                   placeholder="Brief description of the item"
                 />
               </div>

                             <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                 <textarea
                   value={showAddItem.item.notes}
                   onChange={(e) => setShowAddItem(s => ({ ...s, item: { ...s.item, notes: e.target.value } }))}
                   rows={3}
                   className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                   placeholder="Describe the item's condition, any issues found, etc."
                 />
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Photos</label>
                 <input
                   type="file"
                   multiple
                   accept="image/*"
                   onChange={(e) => {
                     const files = Array.from(e.target.files || []);
                     setShowAddItem(s => ({ ...s, item: { ...s.item, photos: files } }));
                   }}
                   className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                 />
                 <p className="mt-1 text-sm text-gray-500">Upload photos of the item (optional)</p>
                 {showAddItem.item.photos.length > 0 && (
                   <div className="mt-2">
                     <p className="text-sm text-gray-600">Selected files:</p>
                     <ul className="mt-1 text-sm text-gray-500">
                       {showAddItem.item.photos.map((file, index) => (
                         <li key={index}>{file.name}</li>
                       ))}
                     </ul>
                   </div>
                 )}
               </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Repair Cost</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={showAddItem.item.repairCost}
                    onChange={(e) => setShowAddItem(s => ({ ...s, item: { ...s.item, repairCost: parseFloat(e.target.value) || 0 } }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Replacement Cost</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={showAddItem.item.replacementCost}
                    onChange={(e) => setShowAddItem(s => ({ ...s, item: { ...s.item, replacementCost: parseFloat(e.target.value) || 0 } }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={showAddItem.item.requiresRepair}
                    onChange={(e) => setShowAddItem(s => ({ ...s, item: { ...s.item, requiresRepair: e.target.checked } }))}
                    className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Requires Repair</span>
                </label>
                
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={showAddItem.item.requiresReplacement}
                    onChange={(e) => setShowAddItem(s => ({ ...s, item: { ...s.item, requiresReplacement: e.target.checked } }))}
                    className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Requires Replacement</span>
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowAddItem({ open: false, inspectionId: null, item: { itemName: '', condition: 'good', notes: '', repairCost: 0, replacementCost: 0, requiresRepair: false, requiresReplacement: false } })}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                Cancel
              </button>
              
                             <button
                 onClick={async () => {
                   if (!showAddItem.inspectionId || !showAddItem.item.itemName.trim() || !showAddItem.item.description.trim()) {
                     showToast('Please provide item name and description', 'error');
                     return;
                   }
                   
                   try {
                     // Create FormData for file upload
                     const formData = new FormData();
                     formData.append('itemName', showAddItem.item.itemName);
                     formData.append('description', showAddItem.item.description);
                     formData.append('condition', showAddItem.item.condition);
                     formData.append('notes', showAddItem.item.notes);
                     formData.append('repairCost', showAddItem.item.repairCost.toString());
                     formData.append('replacementCost', showAddItem.item.replacementCost.toString());
                     formData.append('requiresRepair', showAddItem.item.requiresRepair.toString());
                     formData.append('requiresReplacement', showAddItem.item.requiresReplacement.toString());
                     
                     // Append photos if any
                     showAddItem.item.photos.forEach((photo, index) => {
                       formData.append('photos', photo);
                     });
                     
                     await inspectionItemService.addItem(showAddItem.inspectionId, formData as any);
                     
                     setShowAddItem({ 
                       open: false, 
                       inspectionId: null, 
                       item: { 
                         itemName: '', 
                         description: '',
                         condition: 'good', 
                         notes: '', 
                         repairCost: 0, 
                         replacementCost: 0, 
                         requiresRepair: false, 
                         requiresReplacement: false,
                         photos: []
                       } 
                     });
                     showToast('Item added successfully', 'success');
                     
                     // Optionally refresh the inspection data
                     await loadInspectorData();
                   } catch (error) {
                     console.error('Failed to add item:', error);
                     showToast('Failed to add item', 'error');
                   }
                 }}
                 className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
               >
                 Add Item
               </button>
            </div>
          </div>
                 </div>
       )}

       {/* Dispute Modal */}
       {showDispute.open && (
         <div className="fixed inset-0 z-50 flex items-center justify-center">
           <div className="absolute inset-0 bg-black/40" onClick={() => setShowDispute({ open: false, inspectionId: null, disputeType: DisputeType.DAMAGE_ASSESSMENT, reason: '', evidence: '', photos: [] })} />
           <div className="relative bg-white rounded-lg shadow-lg w-full max-w-2xl p-6">
             <h3 className="text-lg font-semibold text-gray-900 mb-4">Raise Dispute</h3>
             
             <div className="space-y-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Dispute Type *</label>
                 <select
                   value={showDispute.disputeType}
                   onChange={(e) => setShowDispute(s => ({ ...s, disputeType: e.target.value as DisputeType }))}
                   className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                 >
                   <option value={DisputeType.DAMAGE_ASSESSMENT}>Damage Assessment</option>
                   <option value={DisputeType.CONDITION_DISAGREEMENT}>Condition Disagreement</option>
                   <option value={DisputeType.COST_DISPUTE}>Cost Dispute</option>
                   <option value={DisputeType.PROCEDURE_VIOLATION}>Procedure Violation</option>
                   <option value={DisputeType.OTHER}>Other</option>
                 </select>
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
                 <textarea
                   value={showDispute.reason}
                   onChange={(e) => setShowDispute(s => ({ ...s, reason: e.target.value }))}
                   rows={3}
                   className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                   placeholder="Describe the reason for this dispute..."
                 />
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Evidence</label>
                 <textarea
                   value={showDispute.evidence}
                   onChange={(e) => setShowDispute(s => ({ ...s, evidence: e.target.value }))}
                   rows={3}
                   className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                   placeholder="Provide any supporting evidence or additional details..."
                 />
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Supporting Photos</label>
                 <input
                   type="file"
                   multiple
                   accept="image/*"
                   onChange={(e) => {
                     const files = Array.from(e.target.files || []);
                     setShowDispute(s => ({ ...s, photos: files }));
                   }}
                   className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                 />
                 <p className="mt-1 text-sm text-gray-500">Upload photos to support your dispute (optional)</p>
                 {showDispute.photos.length > 0 && (
                   <div className="mt-2">
                     <p className="text-sm text-gray-600">Selected files:</p>
                     <ul className="mt-1 text-sm text-gray-500">
                       {showDispute.photos.map((file, index) => (
                         <li key={index}>{file.name}</li>
                       ))}
                     </ul>
                   </div>
                 )}
               </div>
             </div>

             <div className="mt-6 flex justify-end gap-3">
               <button
                 onClick={() => setShowDispute({ open: false, inspectionId: null, disputeType: DisputeType.DAMAGE_ASSESSMENT, reason: '', evidence: '', photos: [] })}
                 className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
               >
                 Cancel
               </button>
               
               <button
                 onClick={async () => {
                   if (!showDispute.inspectionId || !showDispute.reason.trim()) {
                     showToast('Please provide a reason for the dispute', 'error');
                     return;
                   }
                   
                   try {
                     // Create FormData for file upload
                     const formData = new FormData();
                     formData.append('disputeType', showDispute.disputeType);
                     formData.append('reason', showDispute.reason);
                     formData.append('evidence', showDispute.evidence);
                     
                     // Append photos if any
                     showDispute.photos.forEach((photo, index) => {
                       formData.append('photos', photo);
                     });
                     
                     await disputeService.raiseDispute(showDispute.inspectionId, formData as any);
                     
                     setShowDispute({ 
                       open: false, 
                       inspectionId: null, 
                       disputeType: DisputeType.DAMAGE_ASSESSMENT, 
                       reason: '', 
                       evidence: '', 
                       photos: [] 
                     });
                     showToast('Dispute raised successfully', 'success');
                     
                     // Refresh the inspection data
                     await loadInspectorData();
                   } catch (error) {
                     console.error('Failed to raise dispute:', error);
                     showToast('Failed to raise dispute', 'error');
                   }
                 }}
                 className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
               >
                 Raise Dispute
               </button>
             </div>
           </div>
         </div>
       )}

       {/* Resolve Dispute Modal */}
       {showResolveDispute.open && (
         <div className="fixed inset-0 z-50 flex items-center justify-center">
           <div className="absolute inset-0 bg-black/40" onClick={() => setShowResolveDispute({ open: false, inspectionId: null, disputeId: null, resolutionNotes: '', agreedAmount: 0 })} />
           <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md p-6">
             <h3 className="text-lg font-semibold text-gray-900 mb-4">Resolve Dispute</h3>
             
             <div className="space-y-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Resolution Notes *</label>
                 <textarea
                   value={showResolveDispute.resolutionNotes}
                   onChange={(e) => setShowResolveDispute(s => ({ ...s, resolutionNotes: e.target.value }))}
                   rows={4}
                   className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                   placeholder="Provide detailed explanation of how the dispute was resolved..."
                   required
                 />
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Agreed Amount (Optional)</label>
                 <input
                   type="number"
                   step="0.01"
                   min="0"
                   value={showResolveDispute.agreedAmount}
                   onChange={(e) => setShowResolveDispute(s => ({ ...s, agreedAmount: parseFloat(e.target.value) || 0 }))}
                   className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                   placeholder="0.00"
                 />
                 <p className="mt-1 text-sm text-gray-500">Enter the agreed upon amount if applicable</p>
               </div>
             </div>

             <div className="mt-6 flex justify-end gap-3">
               <button 
                 onClick={() => setShowResolveDispute({ open: false, inspectionId: null, disputeId: null, resolutionNotes: '', agreedAmount: 0 })}
                 className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
               >
                 Cancel
               </button>
               
               <button
                 onClick={submitResolveDispute}
                 disabled={!showResolveDispute.resolutionNotes.trim()}
                 className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 Resolve Dispute
               </button>
             </div>
           </div>
         </div>
       )}
     </div>
   );
 };

export default InspectorDashboardPage;
