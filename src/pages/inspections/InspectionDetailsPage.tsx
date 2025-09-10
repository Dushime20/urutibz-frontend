import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Play, 
  CheckCircle, 
  Camera, 
  Plus,
  User,
  FileText,
  AlertTriangle,
  Clock,
  DollarSign,
  Users,
  Bell,
  Search,
  Sun,
  Moon
} from 'lucide-react';
import type { Inspection } from '../../types/inspection';
import { inspectionService } from '../../services/inspectionService';
import { getProductById, fetchUserProfile } from '../my-account/service/api';
import { useAuth } from '../../contexts/AuthContext';
import StatusBadge from '../../components/inspections/StatusBadge';
import { getMyNotifications } from '../../features/notifications/api';
import { useMarkReadMutation } from '../../features/notifications/queries';

const InspectionDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [inspectionDetails, setInspectionDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [productName, setProductName] = useState<string>('');
  const { user, logout } = useAuth();
  const isInspector = user?.role === 'inspector' || user?.role === 'admin';

  // Header state
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const searchRef = useRef<HTMLInputElement | null>(null);
  const [notificationsData, setNotificationsData] = useState<any[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const unreadCount = notificationsData.filter((n: any) => !n.read).length;
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const { mutate: markRead } = useMarkReadMutation();
  const notifRef = useRef<HTMLDivElement | null>(null);
  const [isDark, setIsDark] = useState<boolean>(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    try {
      const saved = localStorage.getItem('theme');
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const useDark = saved ? saved === 'dark' : prefersDark;
      setIsDark(useDark);
      document.documentElement.classList.toggle('dark', useDark);
    } catch {}
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    try { localStorage.setItem('theme', next ? 'dark' : 'light'); } catch {}
  };

  useEffect(() => {
    if (id) {
      loadInspection();
    }
  }, [id]);

  // Load avatar and display name from stored user (fast load)
  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const u = JSON.parse(stored);
        const url: string | undefined = u?.avatar || u?.profilePhoto || u?.photoUrl || u?.image;
        const name: string = u?.name || [u?.firstName, u?.lastName].filter(Boolean).join(' ') || u?.email || 'Account';
        if (url) setAvatarUrl(url);
        setUserName(name);
      }
    } catch {}
  }, []);

  // Mirror Settings: fetch live profile using token and populate avatar/name
  useEffect(() => {
    (async () => {
      try {
        const token = (typeof window !== 'undefined' && localStorage.getItem('token')) || '';
        if (!token) return;
        const res = await fetchUserProfile(token);
        const data = res?.data;
        if (!data) return;
        const url: string | undefined = data.profileImageUrl || data.profile_image || data.avatarUrl || data.avatar;
        const name: string = data.name || [data.firstName, data.lastName].filter(Boolean).join(' ') || data.email || userName;
        if (url) setAvatarUrl(url);
        if (name) setUserName(name);
        try {
          const stored = localStorage.getItem('user');
          const existing = stored ? JSON.parse(stored) : {};
          localStorage.setItem('user', JSON.stringify({ ...existing, ...data }));
        } catch {}
      } catch {}
    })();
  }, []);

  // Load notifications
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setNotificationsLoading(true);
        const data = await getMyNotifications();
        setNotificationsData(Array.isArray(data) ? data : (data as any).notifications || []);
      } catch (error) {
        console.error('Failed to load notifications:', error);
      } finally {
        setNotificationsLoading(false);
      }
    };

    loadNotifications();
  }, []);

  // Handle click outside for dropdowns
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (notifRef.current && !notifRef.current.contains(target)) {
        setIsNotifOpen(false);
      }
      if (avatarRef.current && !avatarRef.current.contains(target)) {
        setIsAvatarMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadInspection = async () => {
    try {
      setLoading(true);
      if (id) {
        const inspectionData = await inspectionService.getInspection(id);
        setInspection(inspectionData.inspection);
        setInspectionDetails(inspectionData);
        try {
          const pid = inspectionData?.inspection?.productId;
          if (pid) {
            const prod = await getProductById(pid);
            const name = prod?.title || prod?.name || prod?.productName || '';
            if (name) setProductName(String(name));
          }
        } catch {}
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

  const handleBackNavigation = () => {
    // Check if user came from My Account dashboard using location state
    const fromLocation = location.state?.from;
    
    if (fromLocation === 'my-account') {
      navigate('/my-account');
    } else if (fromLocation === 'inspector') {
      navigate('/inspector');
    } else if (fromLocation === 'inspections-dashboard') {
      navigate('/inspections');
    } else {
      // Check document referrer as fallback
      const referrer = document.referrer;
      if (referrer.includes('/my-account') || referrer.includes('/dashboard')) {
        navigate('/my-account');
      } else if (referrer.includes('/inspector')) {
        navigate('/inspector');
      } else {
        // Default fallback - try to go back in history, or to inspections
        if (window.history.length > 1) {
          navigate(-1);
        } else {
          navigate('/inspections');
        }
      }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!inspection) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-slate-100">Inspection not found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            The inspection you're looking for doesn't exist.
          </p>
          <div className="mt-6">
            <button
              onClick={() => navigate('/inspections')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700"
            >
              Back to Inspections
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white shadow-sm border-b dark:bg-slate-900 dark:border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Back button and title */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              <button
                onClick={handleBackNavigation}
                className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </button>
              <div>
                <h1 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-slate-100 truncate max-w-[200px] sm:max-w-xs">
                  <span className="sm:hidden">Inspection Details</span>
                  <span className="hidden sm:inline">
                    {productName || (inspection.product as any)?.title || inspection.product?.name || `Product ${inspection.productId}`}
                  </span>
                </h1>
                <p className="hidden sm:block text-xs text-gray-500 dark:text-slate-400 truncate">
                  Inspection ID: {inspection.id}
                </p>
              </div>
            </div>

            {/* Right side - Search, theme, notifications, avatar */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Search */}
              <div className="hidden sm:block relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    ref={searchRef}
                    type="text"
                    placeholder="Search..."
                    className="w-64 pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Mobile search button */}
              <button
                onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                className="sm:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Notifications */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors relative"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications dropdown */}
                {isNotifOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 z-50">
                    <div className="p-4 border-b border-gray-200 dark:border-slate-700">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-slate-100">Notifications</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notificationsLoading ? (
                        <div className="p-4 text-center text-sm text-gray-500 dark:text-slate-400">
                          Loading...
                        </div>
                      ) : notificationsData.length === 0 ? (
                        <div className="p-4 text-center text-sm text-gray-500 dark:text-slate-400">
                          No notifications
                        </div>
                      ) : (
                        notificationsData.map((notification: any) => (
                          <div
                            key={notification.id}
                            className={`p-3 border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer ${
                              !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                            }`}
                            onClick={() => {
                              if (!notification.read) {
                                markRead(notification.id);
                              }
                              setIsNotifOpen(false);
                            }}
                          >
                            <p className="text-sm text-gray-900 dark:text-slate-100">{notification.message}</p>
                            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                              {new Date(notification.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Avatar menu */}
              <div className="relative" ref={avatarRef}>
                <button
                  onClick={() => setIsAvatarMenuOpen(!isAvatarMenuOpen)}
                  className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={userName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-500 flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>

                {/* Avatar dropdown */}
                {isAvatarMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 z-50">
                    <div className="p-3 border-b border-gray-200 dark:border-slate-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-slate-100">{userName}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400">{user?.email}</p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          logout();
                          setIsAvatarMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile search */}
          {mobileSearchOpen && (
            <div className="sm:hidden pb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Action buttons */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <StatusBadge status={inspection.status} size="lg" />
          </div>
          <div className="flex space-x-2">
            {isInspector && inspection.status === 'pending' && (
              <button
                onClick={handleStartInspection}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Inspection
              </button>
            )}
            {isInspector && inspection.status === 'in_progress' && (
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
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 dark:border-slate-700 dark:text-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Inspection Details */}
            <div className="bg-white rounded-lg shadow-sm border dark:bg-slate-900 dark:border-slate-700">
              <div className="px-4 py-4 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 dark:text-slate-100">Inspection Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-slate-400">Type</label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-slate-100">
                      {getTypeLabel(inspection.inspectionType)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-slate-400">Status</label>
                    <div className="mt-1">
                      <StatusBadge status={inspection.status} size="sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-slate-400">Scheduled</label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-slate-100">
                      {formatDate(inspection.scheduledAt)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-slate-400">Location</label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-slate-100 break-words">{inspection.location}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-slate-400">Inspector</label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-slate-100">
                      {inspection.inspector ? `Inspector ${inspection.inspector.userId}` : 'Unassigned'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-slate-400">Created</label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-slate-100">
                      {formatDate(inspection.createdAt)}
                    </p>
                  </div>
                </div>
                {inspection.notes && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-500 dark:text-slate-400">Notes</label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-slate-100 break-words">{inspection.notes}</p>
                  </div>
                )}
                {inspection.inspectorNotes && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-500 dark:text-slate-400">Inspector Notes</label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-slate-100 break-words">{inspection.inspectorNotes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Inspection Items */}
            <div className="bg-white rounded-lg shadow-sm border dark:bg-slate-900 dark:border-slate-700">
              <div className="px-4 py-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100">Inspection Items</h3>
                  {isInspector && (
                  <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-teal-600 bg-teal-50 hover:bg-teal-100">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </button>
                  )}
                </div>
                {inspection.items.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-slate-100">No items added</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                      Start adding inspection items to assess the product condition.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {inspection.items.map((item) => (
                      <div key={item.id} className="border border-gray-200 rounded-lg p-4 dark:border-slate-700">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-slate-100">{item.itemName}</h4>
                            <p className="text-sm text-gray-500 mt-1 dark:text-slate-400 break-words">{item.description}</p>
                            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-slate-400">
                              <span>Condition: {item.condition}</span>
                              <span>Repair Cost: ${item.repairCost}</span>
                              <span>Replacement Cost: ${item.replacementCost}</span>
                            </div>
                          </div>
                          <button className="text-teal-600 hover:text-teal-700 text-sm font-medium">
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
            <div className="bg-white rounded-lg shadow-sm border dark:bg-slate-900 dark:border-slate-700">
              <div className="px-4 py-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100">Photos</h3>
                  <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-teal-600 bg-teal-50 hover:bg-teal-100">
                    <Camera className="w-4 h-4 mr-2" />
                    Add Photo
                  </button>
                </div>
                {inspection.photos.length === 0 ? (
                  <div className="text-center py-8">
                    <Camera className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-slate-100">No photos added</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                      Add photos to document the inspection process.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                    {inspection.photos.map((photo) => (
                      <div key={photo.id} className="aspect-square bg-gray-100 rounded-lg overflow-hidden dark:bg-slate-800">
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
            <div className="bg-white rounded-lg shadow-sm border dark:bg-slate-900 dark:border-slate-700">
              <div className="px-4 py-4 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 dark:text-slate-100">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700">
                    <Camera className="w-4 h-4 mr-2" />
                    Take Photo
                  </button>
                  <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:border-slate-700 dark:text-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700">
                    <FileText className="w-4 h-4 mr-2" />
                    Add Note
                  </button>
                  <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:border-slate-700 dark:text-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Raise Dispute
                  </button>
                </div>
              </div>
            </div>

            {/* Disputes */}
            {inspection.disputes.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border dark:bg-slate-900 dark:border-slate-700">
                <div className="px-4 py-4 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 dark:text-slate-100">Disputes</h3>
                  <div className="space-y-3">
                    {inspection.disputes.map((dispute) => (
                      <div key={dispute.id} className="border border-gray-200 rounded-lg p-3 dark:border-slate-700">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900 dark:text-slate-100">
                            {dispute.disputeType}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            dispute.status === 'open' ? 'bg-red-100 text-red-800' :
                            dispute.status === 'resolved' ? 'bg-green-100 text-green-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {dispute.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1 dark:text-slate-400 break-words">{dispute.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Damage Assessment */}
            {inspectionDetails?.damageAssessment && (
              <div className="bg-white rounded-lg shadow-sm border dark:bg-slate-900 dark:border-slate-700">
                <div className="px-4 py-4 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <DollarSign className="w-5 h-5 mr-2" />
                    Damage Assessment
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4 dark:bg-slate-800">
                      <div className="text-sm text-gray-500 dark:text-slate-400">Total Repair Cost</div>
                      <div className="text-xl font-semibold text-gray-900 dark:text-slate-100">
                        ${inspectionDetails.damageAssessment.totalRepairCost}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 dark:bg-slate-800">
                      <div className="text-sm text-gray-500 dark:text-slate-400">Total Replacement Cost</div>
                      <div className="text-xl font-semibold text-gray-900 dark:text-slate-100">
                        ${inspectionDetails.damageAssessment.totalReplacementCost}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 dark:bg-slate-800">
                      <div className="text-sm text-gray-500 dark:text-slate-400">Items Requiring Repair</div>
                      <div className="text-xl font-semibold text-gray-900 dark:text-slate-100">
                        {inspectionDetails.damageAssessment.itemsRequiringRepair}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 dark:bg-slate-800">
                      <div className="text-sm text-gray-500 dark:text-slate-400">Items Requiring Replacement</div>
                      <div className="text-xl font-semibold text-gray-900 dark:text-slate-100">
                        {inspectionDetails.damageAssessment.itemsRequiringReplacement}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Timeline */}
            {inspectionDetails?.timeline && (
              <div className="bg-white rounded-lg shadow-sm border dark:bg-slate-900 dark:border-slate-700">
                <div className="px-4 py-4 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    Timeline
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-slate-400">Scheduled</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-slate-100">
                        {formatDate(inspectionDetails.timeline.scheduled)}
                      </span>
                    </div>
                    {inspectionDetails.timeline.started && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-slate-400">Started</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-slate-100">
                          {formatDate(inspectionDetails.timeline.started)}
                        </span>
                      </div>
                    )}
                    {inspectionDetails.timeline.completed && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-slate-400">Completed</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-slate-100">
                          {formatDate(inspectionDetails.timeline.completed)}
                        </span>
                      </div>
                    )}
                    {inspectionDetails.timeline.duration > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-slate-400">Duration</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-slate-100">
                          {Math.round(inspectionDetails.timeline.duration / 1000 / 60)} minutes
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Participants */}
            {inspectionDetails?.participants && (
              <div className="bg-white rounded-lg shadow-sm border dark:bg-slate-900 dark:border-slate-700">
                <div className="px-4 py-4 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Participants
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center dark:bg-teal-900/30">
                        <User className="w-5 h-5 text-teal-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-slate-100">
                          {inspectionDetails.participants.inspector.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-slate-400">
                          Inspector • {inspectionDetails.participants.inspector.email}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center dark:bg-green-900/30">
                        <User className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-slate-100">
                          {inspectionDetails.participants.renter.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-slate-400">
                          Renter • {inspectionDetails.participants.renter.email}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center dark:bg-purple-900/30">
                        <User className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-slate-100">
                          {inspectionDetails.participants.owner.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-slate-400">
                          Owner • {inspectionDetails.participants.owner.email}
                        </div>
                      </div>
                    </div>
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
