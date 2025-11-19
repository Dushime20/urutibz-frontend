import React, { useState, useEffect, useRef } from 'react';
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
  Key,
  HelpCircle,
  FileText,
  BarChart3,
  List,
  Eye,
  Sun,
  Moon,
  Award,
  Target,
  Activity,
  DollarSign,
  Download,
  Filter,
  Search,
  Plus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Menu,
  X,
  ClipboardCheck,
  ClipboardList,
  Briefcase,
  Home,
  ChevronRight,
  Camera,
  Edit,
  Calculator,
  FileCheck,
  Users,
  Building2,
  Zap,
  Wallet,
  CreditCard,
  Globe
} from 'lucide-react';
import type { Inspection, Inspector, AvailabilityStatus, WorkingHours } from '../../types/inspection';
import { inspectionService, inspectorService, inspectionItemService } from '../../services/inspectionService';
import StatusBadge from '../../components/inspections/StatusBadge';
import QuickStatsCard from '../../components/inspections/QuickStatsCard';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { TwoFactorManagement } from '../../components/2fa/TwoFactorManagement';
import ProfileSettingsForm from '../my-account/components/ProfileSettingsForm';
import { fetchUserProfile, updateUser, uploadUserAvatar, API_BASE_URL, fetchUserTransactions } from '../my-account/service/api';
import axios from 'axios';
import VerificationBanner from '../../components/verification/VerificationBanner';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, LineChart, Line } from 'recharts';
import AllInspectionsTab from './components/AllInspectionsTab';
import CompletedInspectionsTab from './components/CompletedInspectionsTab';
import PaymentsTab from './components/PaymentsTab';
import InspectorInspectionDetailsModal from './components/InspectorInspectionDetailsModal';
import { useTranslation } from '../../hooks/useTranslation';
import { TranslatedText } from '../../components/translated-text';

const InspectorDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const { tSync, language, setLanguage } = useTranslation();
  
  // Navigation state
  const [activeTab, setActiveTab] = useState<'overview' | 'inspections' | 'completed' | 'payments' | 'settings'>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      const saved = localStorage.getItem('inspector-sidebar-collapsed');
      return saved === 'true';
    } catch {
      return false;
    }
  });
  const [inspectionTypeFilter, setInspectionTypeFilter] = useState<string>('all');
  
  // Data states
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [inspector, setInspector] = useState<Inspector | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Stats state
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0
  });

  // Performance metrics
  const [performanceMetrics, setPerformanceMetrics] = useState({
    averageRating: 4.8,
    totalEarnings: 0,
    completionRate: 0,
    onTimeRate: 0,
    responseTime: '2.5 hours'
  });

  // Payments state
  const [payments, setPayments] = useState<any[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentsStats, setPaymentsStats] = useState({
    totalEarnings: 0,
    pendingPayments: 0,
    completedPayments: 0,
    thisMonth: 0
  });

  // Trending data for charts
  const [trendingData, setTrendingData] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal states
  const [showReschedule, setShowReschedule] = useState<{ open: boolean; id: string | null; value: string }>(() => ({ open: false, id: null, value: '' }));
  const [showComplete, setShowComplete] = useState<{ open: boolean; id: string | null; notes: string; items: Array<{ itemName: string; description: string; condition: string; notes: string; repairCost: number; replacementCost: number; requiresRepair: boolean; requiresReplacement: boolean }> }>(() => ({
    open: false,
    id: null,
    notes: '',
    items: [
      { itemName: '', description: '', condition: 'good', notes: '', repairCost: 0, replacementCost: 0, requiresRepair: false, requiresReplacement: false }
    ]
  }));
  const [showInspectionDetailsModal, setShowInspectionDetailsModal] = useState(false);
  const [selectedInspectionId, setSelectedInspectionId] = useState<string | null>(null);

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


  // Enhanced header states
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [notifications] = useState([
    { id: 1, message: 'New inspection assigned', time: '2 min ago', unread: true },
    { id: 2, message: 'Inspection completed', time: '1 hour ago', unread: false },
    { id: 3, message: 'Performance review completed', time: '2 hours ago', unread: false }
  ]);

  // Account/settings modals
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showQuickSettings, setShowQuickSettings] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  // Theme and currency
  const [isDark, setIsDark] = useState<boolean>(false);
  const [preferredCurrency, setPreferredCurrency] = useState<string>('');
  const token = (typeof window !== 'undefined' && localStorage.getItem('token')) || '';
  const userId = user?.id || (() => {
    try { const raw = localStorage.getItem('user'); return raw ? JSON.parse(raw)?.id : undefined; } catch { return undefined; }
  })();

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
      if (!target.closest('.language-dropdown') && !target.closest('.language-button')) {
        setShowLanguageDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initialize theme
  useEffect(() => {
    try {
      const saved = localStorage.getItem('theme');
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const useDark = saved ? saved === 'dark' : prefersDark;
      setIsDark(useDark);
      document.documentElement.classList.toggle('dark', useDark);
    } catch {}
  }, []);

  // Load profile to hydrate preferred currency
  useEffect(() => {
    (async () => {
      try {
        if (!token) return;
        const res = await fetchUserProfile(token);
        const data = res?.data;
        let found = '';
        if (data?.preferred_currency) found = String(data.preferred_currency);
        else if (data?.preferredCurrency) found = String(data.preferredCurrency);
        if (!found) {
          try { const cached = localStorage.getItem('user'); if (cached) { const u = JSON.parse(cached); found = u?.preferred_currency || u?.preferredCurrency || ''; } } catch {}
        }
        if (found) setPreferredCurrency(found.toUpperCase());
      } catch {}
    })();
  }, [token]);

  useEffect(() => {
    loadInspectorData();
    generateTrendingData();
  }, []);

  useEffect(() => {
    if (activeTab === 'payments') {
      loadPayments();
    }
    if (activeTab === 'overview' && inspections.length > 0) {
      generateTrendingData();
      loadRecentActivities();
    }
  }, [activeTab, inspections.length]);

  const loadInspectorData = async () => {
    try {
      setLoading(true);
      // Get the inspector ID from the authenticated user
      const inspectorId = user?.id;
      if (!inspectorId) {
        console.error('No user ID available');
        setLoading(false);
        return;
      }
      
      // Load inspector profile (use user data as fallback since there's no /inspectors/:id endpoint)
      let inspectorData: Inspector | null = null;
      try {
        // Try to get inspector from the list (first result matching the ID)
        const inspectorsList = await inspectorService.getInspectors('inspector');
        inspectorData = inspectorsList.find((insp: any) => insp.id === inspectorId) || null;
        
        // If not found in list, create a minimal inspector object from user data
        if (!inspectorData && user) {
          const defaultWorkingHours: WorkingHours = {
            monday: { start: '09:00', end: '17:00', available: true },
            tuesday: { start: '09:00', end: '17:00', available: true },
            wednesday: { start: '09:00', end: '17:00', available: true },
            thursday: { start: '09:00', end: '17:00', available: true },
            friday: { start: '09:00', end: '17:00', available: true },
            saturday: { start: '09:00', end: '17:00', available: true },
            sunday: { start: '09:00', end: '17:00', available: false }
          };
          
          inspectorData = {
            id: user.id,
            userId: user.id,
            qualifications: [],
            specializations: [],
            experience: 0,
            rating: 0,
            totalInspections: 0,
            completedInspections: 0,
            workingHours: defaultWorkingHours,
            availability: 'available' as AvailabilityStatus,
            location: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          } as Inspector;
        }
        setInspector(inspectorData);
      } catch (e) {
        console.warn('Failed to load inspector profile:', e);
        // Fallback to user data
        if (user) {
          const defaultWorkingHours: WorkingHours = {
            monday: { start: '09:00', end: '17:00', available: true },
            tuesday: { start: '09:00', end: '17:00', available: true },
            wednesday: { start: '09:00', end: '17:00', available: true },
            thursday: { start: '09:00', end: '17:00', available: true },
            friday: { start: '09:00', end: '17:00', available: true },
            saturday: { start: '09:00', end: '17:00', available: true },
            sunday: { start: '09:00', end: '17:00', available: false }
          };
          
          inspectorData = {
            id: user.id,
            userId: user.id,
            qualifications: [],
            specializations: [],
            experience: 0,
            rating: 0,
            totalInspections: 0,
            completedInspections: 0,
            workingHours: defaultWorkingHours,
            availability: 'available' as AvailabilityStatus,
            location: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          } as Inspector;
          setInspector(inspectorData);
        } else {
          setInspector(null);
        }
      }
      
      // Load inspector's inspections (fetch more to get accurate stats)
      console.log('📥 [InspectorDashboard] Fetching inspections for inspector:', inspectorId);
      const response = await inspectionService.getInspectionsByInspector(inspectorId, 1, 100);
      console.log('📦 [InspectorDashboard] Raw API Response:', {
        response,
        hasInspections: !!response?.inspections,
        inspectionsCount: response?.inspections?.length || 0,
        total: response?.total,
        page: response?.page,
        limit: response?.limit
      });
      
      const inspectionsList: Inspection[] = Array.isArray(response?.inspections)
        ? response.inspections
        : (Array.isArray(response) ? response as Inspection[] : []);
      
      console.log('✅ [InspectorDashboard] Processed Inspections List:', {
        count: inspectionsList.length,
        inspections: inspectionsList,
        sample: inspectionsList[0] || null
      });
      
      setInspections(inspectionsList);
      
      // Calculate stats from real data
      const statsData = {
        total: (response?.total ?? inspectionsList.length) as number,
        pending: inspectionsList.filter(i => i.status === 'pending').length,
        inProgress: inspectionsList.filter(i => i.status === 'in_progress').length,
        completed: inspectionsList.filter(i => i.status === 'completed').length
      };
      setStats(statsData);

      // Calculate real performance metrics
      const completedInspections = inspectionsList.filter(i => i.status === 'completed');
      const completedCount = completedInspections.length;
      const totalCount = statsData.total || 1;
      const completionRate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
      
      // Calculate on-time rate (inspections completed on or before scheduled date)
      const onTimeInspections = completedInspections.filter(ins => {
        if (!ins.scheduledAt || !ins.completedAt) return false;
        const scheduled = new Date(ins.scheduledAt);
        const completed = new Date(ins.completedAt);
        return completed <= scheduled || completed.getTime() - scheduled.getTime() <= 24 * 60 * 60 * 1000; // within 24 hours
      });
      const onTimeRate = completedCount > 0 ? (onTimeInspections.length / completedCount) * 100 : 0;
      
      // Calculate average response time (time from assignment to start)
      const startedInspections = inspectionsList.filter(ins => 
        ins.status === 'in_progress' || ins.status === 'completed'
      );
      let totalResponseTime = 0;
      let responseTimeCount = 0;
      
      startedInspections.forEach(ins => {
        if (ins.createdAt) {
          // Try to find when inspection was started (use updatedAt as proxy if startedAt not available)
          const assignedTime = new Date(ins.createdAt).getTime();
          const startedTime = ins.scheduledAt ? new Date(ins.scheduledAt).getTime() : assignedTime;
          const responseTimeHours = (startedTime - assignedTime) / (1000 * 60 * 60);
          if (responseTimeHours > 0 && responseTimeHours < 720) { // reasonable range (0-30 days)
            totalResponseTime += responseTimeHours;
            responseTimeCount++;
          }
        }
      });
      
      const avgResponseTimeHours = responseTimeCount > 0 ? totalResponseTime / responseTimeCount : 0;
      const responseTimeStr = avgResponseTimeHours > 0 
        ? avgResponseTimeHours < 1 
          ? `${Math.round(avgResponseTimeHours * 60)} min`
          : `${avgResponseTimeHours.toFixed(1)} hours`
        : 'N/A';
      
      // Get inspector rating from profile or calculate from inspections
      const inspectorRating = inspectorData?.rating || 
        (completedInspections.length > 0 ? 4.5 : 0);
      
      setPerformanceMetrics({
        averageRating: Number(inspectorRating) || 0,
        totalEarnings: 0, // Will be updated when payments are loaded
        completionRate: Math.round(completionRate),
        onTimeRate: Math.round(onTimeRate),
        responseTime: responseTimeStr
      });
      
      // Generate trending data from real inspections
      generateTrendingDataFromInspections(inspectionsList);
      
      // Load recent activities
      loadRecentActivitiesFromInspections(inspectionsList);
      
      // Load payments to calculate earnings (async, don't block)
      if (userId && token) {
        loadPayments().catch(err => {
          console.warn('Failed to load payments:', err);
        });
      }
    } catch (error) {
      console.error('Error loading inspector data:', error);
      showToast('Failed to load inspector data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadPayments = async () => {
    if (!userId || !token) return;
    
    try {
      setPaymentsLoading(true);
      console.log('📥 [InspectorDashboard] Fetching inspector payments...');
      
      // Use the new inspector-specific endpoint
      const response = await axios.get(
        `${API_BASE_URL}/payment-transactions/inspector/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            page: 1,
            limit: 200,
            status: ['completed', 'pending', 'processing'] // Optional: filter by status
          }
        }
      );

      const result = response.data;
      const transactions = result.data || [];
      const stats = result.stats || {
        totalEarnings: 0,
        completedPayments: 0,
        pendingPayments: 0,
        thisMonthEarnings: 0
      };

      console.log('📦 [InspectorDashboard] Inspector payments:', transactions);
      console.log('📊 [InspectorDashboard] Payment stats:', stats);

      // Process payments without fetching payment method details
      // NOTE: Payment methods belong to the payer (product owner), not the inspector
      // The backend returns 401 if we try to fetch payment methods we don't own
      // Instead, we'll use basic payment info that's already in the transaction
      const paymentsWithMethods = transactions.map((payment: any) => {
        // Extract basic payment method info from transaction data if available
        // Don't fetch full payment method details - they belong to the payer
        const basicMethodInfo = payment.payment_method_id ? {
          id: payment.payment_method_id,
          // Infer type from provider if available
          type: payment.provider ? 'mobile_money' : 'card',
          provider: payment.provider || null
        } : null;

        return {
          ...payment,
          paymentMethod: basicMethodInfo
        };
      });

      console.log('💳 [InspectorDashboard] Payments processed:', paymentsWithMethods);
      setPayments(paymentsWithMethods);
      setPaymentsStats(stats);

      // Update performance metrics with earnings
      setPerformanceMetrics(prev => ({
        ...prev,
        totalEarnings: stats.totalEarnings
      }));
    } catch (error) {
      console.error('❌ [InspectorDashboard] Error loading payments:', error);
      showToast('Failed to load payments', 'error');
    } finally {
      setPaymentsLoading(false);
    }
  };

  const generateTrendingDataFromInspections = (inspectionsList: Inspection[]) => {
    // Generate last 7 days of inspection activity data from real inspections
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      // Count inspections for this day (by scheduled date or created date)
      const dayInspections = inspectionsList.filter(ins => {
        if (!ins.scheduledAt && !ins.createdAt) return false;
        const insDate = new Date(ins.scheduledAt || ins.createdAt || '');
        insDate.setHours(0, 0, 0, 0);
        return insDate.getTime() === date.getTime();
      });

      days.push({
        date: dateStr,
        inspections: dayInspections.length,
        completed: dayInspections.filter(ins => ins.status === 'completed').length,
        pending: dayInspections.filter(ins => ins.status === 'pending' || ins.status === 'in_progress').length
      });
    }
    setTrendingData(days);
  };

  const generateTrendingData = () => {
    // Use current inspections state
    generateTrendingDataFromInspections(inspections);
  };

  const loadRecentActivitiesFromInspections = (inspectionsList: Inspection[]) => {
    // Create activities from real inspections
    const activities: any[] = [];
    
    // Process inspections and create activity entries
    inspectionsList.forEach(ins => {
      if (!ins.updatedAt && !ins.createdAt) return;
      
      let title = '';
      let description = '';
      
      if (ins.status === 'completed') {
        title = 'Inspection completed';
        description = `${ins.inspectionType ? ins.inspectionType.replace(/_/g, ' ') : 'Inspection'} completed`;
      } else if (ins.status === 'in_progress') {
        title = 'Inspection in progress';
        description = `${ins.inspectionType ? ins.inspectionType.replace(/_/g, ' ') : 'Inspection'} is being conducted`;
      } else if (ins.status === 'pending') {
        title = 'Inspection assigned';
        description = `New ${ins.inspectionType ? ins.inspectionType.replace(/_/g, ' ') : 'inspection'} assigned`;
      } else {
        title = `Inspection ${ins.status}`;
        description = `${ins.inspectionType ? ins.inspectionType.replace(/_/g, ' ') : 'Inspection'} - ${ins.status}`;
      }
      
      activities.push({
        id: `ins-${ins.id}`,
        type: 'inspection',
        title,
        description: description + (ins.location ? ` at ${ins.location}` : ''),
        timestamp: ins.updatedAt || ins.createdAt,
        icon: CheckCircle2,
        inspectionId: ins.id
      });
    });

    // Sort by timestamp (most recent first) and take top 10
    activities.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return timeB - timeA;
    });
    setRecentActivities(activities.slice(0, 10));
  };

  const loadRecentActivities = () => {
    // Use current inspections state
    loadRecentActivitiesFromInspections(inspections);
  };

  const handleInspectionClick = (inspectionId: string) => {
    console.log('👁️ [InspectorDashboard] Opening inspection details:', inspectionId);
    setSelectedInspectionId(inspectionId);
    setShowInspectionDetailsModal(true);
  };

  const toggleTheme = (theme: 'light' | 'dark') => {
    const isD = theme === 'dark';
    setIsDark(isD);
    try {
      localStorage.setItem('theme', theme);
      document.documentElement.classList.toggle('dark', isD);
      showToast(`Switched to ${theme} mode`, 'success');
    } catch {}
  };

  const savePreferredCurrency = async (value: string) => {
    const prev = preferredCurrency;
    setPreferredCurrency(value);
    try {
      if (!userId || !token) {
        setPreferredCurrency(prev);
        showToast('Unable to update currency', 'error');
        return;
      }
      const res = await updateUser(userId, { preferred_currency: value }, token);
      if (!res?.success) {
        setPreferredCurrency(prev);
        showToast('Failed to update preferred currency', 'error');
        return;
      }
      try {
        const cached = localStorage.getItem('user');
        if (cached) { const u = JSON.parse(cached); u.preferred_currency = value; localStorage.setItem('user', JSON.stringify(u)); }
      } catch {}
      showToast('Preferred currency updated', 'success');
    } catch (e) {
      setPreferredCurrency(prev);
      showToast('Error updating preferred currency', 'error');
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!token) { showToast('Not authenticated', 'error'); return { ok: false, error: 'No token' }; }
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/change-password`, { currentPassword, newPassword }, { headers: { Authorization: `Bearer ${token}` } });
      return { ok: !!res?.data, error: null };
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to change password';
      return { ok: false, error: msg };
    }
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
        { itemName: '', description: '', condition: 'good', notes: '', repairCost: 0, replacementCost: 0, requiresRepair: false, requiresReplacement: false }
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


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-my-primary"></div>
      </div>
    );
  }

  // Filter inspections based on search, status, and type
  const filteredInspections = inspections.filter(inspection => {
    const matchesSearch = !searchQuery || 
      getTypeLabel(inspection.inspectionType || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      inspection.location?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inspection.status === statusFilter;
    
    // Filter by inspection type based on active tab
    // No type filtering needed - activeTab only has valid inspection tabs
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Professional Sidebar */}
      <InspectorSidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        stats={stats}
        onLogout={() => { logout(); navigate('/login'); }}
      />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        sidebarOpen 
          ? (sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64') 
          : 'lg:ml-0'
      }`}>
        {/* Enhanced Professional Header */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm sticky top-0 z-40">
          <div className="px-4 sm:px-6 lg:px-8">
            {/* Top Bar */}
            <div className="flex items-center justify-between py-1">
            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              
              <div className="flex items-center space-x-3">
              
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {activeTab === 'overview' && <TranslatedText text="Dashboard" />}
                    {activeTab === 'inspections' && <TranslatedText text="Inspections" />}
                    {activeTab === 'completed' && <TranslatedText text="Completed Inspections" />}
                    {activeTab === 'payments' && <TranslatedText text="Payments" />}
                    {activeTab === 'settings' && <TranslatedText text="Settings" />}
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400"><TranslatedText text="Professional Inspector" /></p>
                </div>
              </div>
             
            </div>
            
            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <button
                onClick={() => toggleTheme(isDark ? 'light' : 'dark')}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                aria-label="Toggle theme"
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors notifications-button"
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
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 notifications-dropdown">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100"><TranslatedText text="Notifications" /></h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div key={notification.id} className={`p-4 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 ${notification.unread ? 'bg-my-primary/5 dark:bg-gray-800/60' : ''}`}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className={`text-sm ${notification.unread ? 'font-medium text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'}`}>
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notification.time}</p>
                            </div>
                            {notification.unread && (
                              <div className="w-2 h-2 bg-my-primary rounded-full ml-2"></div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 border-t border-gray-200 dark:border-gray-800">
                      <button className="w-full text-sm text-my-primary hover:text-my-primary/80 font-medium">
                        <TranslatedText text="View All Notifications" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Language Switcher (replaces Settings icon) */}
              <div className="relative">
                <button
                  onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                  className="flex items-center justify-center p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors language-button"
                  aria-label="Select language"
                >
                  <Globe className="w-5 h-5" />
                </button>
                
                {showLanguageDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 language-dropdown max-h-96 overflow-y-auto">
                    <div className="py-2">
                      {[
                        { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
                        { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
                        { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', flag: '🇰🇪' },
                        { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
                        { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
                        { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
                        { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
                        { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
                        { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
                        { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
                        { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
                        { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
                        { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
                        { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
                        { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
                        { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
                        { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
                        { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭' },
                        { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', flag: '🇺🇦' },
                      ].map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setLanguage(lang.code);
                            setShowLanguageDropdown(false);
                          }}
                          className={`w-full flex items-center space-x-3 px-4 py-2 text-sm text-left transition-colors ${
                            language === lang.code
                              ? 'text-[#01aaa7] font-medium bg-[#01aaa7]/10 dark:bg-[#01aaa7]/20'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          <span className="text-lg">{lang.flag}</span>
                          <div className="flex flex-col">
                            <span className="font-medium">{lang.nativeName}</span>
                            {lang.name !== lang.nativeName && (
                              <span className="text-xs opacity-70">{lang.name}</span>
                            )}
                          </div>
                          {language === lang.code && (
                            <span className="ml-auto text-[#01aaa7]">✓</span>
                          )}
                        </button>
                      ))}
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
                  <div className="w-10 h-10 bg-my-primary/10 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-my-primary" />
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {inspector?.userId || user?.name || 'Inspector'}
                    </p>
                    <p className="text-xs text-gray-500"><TranslatedText text="Professional Inspector" /></p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
                
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50 profile-dropdown">
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-my-primary/10 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-my-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {inspector?.userId || user?.name || 'Inspector'}
                          </p>
                          <p className="text-xs text-gray-500"><TranslatedText text="ID" />: {inspector?.id || <TranslatedText text="N/A" />}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="py-2">
                      <div className="px-4 py-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600"><TranslatedText text="Rating" /></span>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-amber-500 fill-current" />
                            <span className="font-medium">{inspector?.rating || 0}/5.0</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm mt-2">
                          <span className="text-gray-600"><TranslatedText text="Experience" /></span>
                          <span className="font-medium">{inspector?.experience || 0} <TranslatedText text="years" /></span>
                        </div>
                        <div className="flex items-center justify-between text-sm mt-2">
                          <span className="text-gray-600"><TranslatedText text="Total Inspections" /></span>
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
                          <span><TranslatedText text="Sign Out" /></span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Verification banner for unverified users */}
            <VerificationBanner />
            
            {/* Search and Filter Bar - Show for inspection tabs */}
            {(activeTab === 'inspections' || activeTab === 'completed') && (
              <div className="mb-6 flex flex-col sm:flex-row items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={tSync('Search inspections...')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-my-primary focus:border-my-primary"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-my-primary focus:border-my-primary"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="disputed">Disputed</option>
                </select>
              </div>
            )}

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <OverviewTab 
                stats={stats}
                inspections={inspections}
                inspector={inspector}
                onInspectionClick={handleInspectionClick}
                formatDate={formatDate}
                getTypeLabel={getTypeLabel}
                trendingData={trendingData}
                recentActivities={recentActivities}
                performanceMetrics={performanceMetrics}
              />
            )}

            {activeTab === 'inspections' && (() => {
              const activeInspections = inspections.filter(i => i.status !== 'completed');
              console.log('📋 [InspectorDashboard] Rendering Inspections Tab:', {
                totalInspections: inspections.length,
                activeInspections: activeInspections.length,
                filteredOut: inspections.length - activeInspections.length,
                activeInspectionsList: activeInspections,
                statusBreakdown: activeInspections.reduce((acc, ins) => {
                  acc[ins.status] = (acc[ins.status] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              });
              return (
                <AllInspectionsTab 
                  inspections={activeInspections}
                  onInspectionClick={handleInspectionClick}
                  onStart={handleStart}
                  onComplete={handleComplete}
                  onReschedule={handleReschedule}
                  onAddItem={handleAddItem}
                  formatDate={formatDate}
                  getTypeLabel={getTypeLabel}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  statusFilter={statusFilter}
                  setStatusFilter={setStatusFilter}
                />
              );
            })()}

            {activeTab === 'completed' && (
              <CompletedInspectionsTab 
                inspections={inspections.filter(i => i.status === 'completed')}
                onInspectionClick={handleInspectionClick}
                formatDate={formatDate}
                getTypeLabel={getTypeLabel}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />
            )}

            {activeTab === 'payments' && (
              <PaymentsTab 
                payments={payments}
                paymentsLoading={paymentsLoading}
                paymentsStats={paymentsStats}
                formatDate={formatDate}
                preferredCurrency={preferredCurrency}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsTab 
                user={user}
                inspector={inspector}
                onProfileUpdate={() => loadInspectorData()}
              />
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {/* Inspection Details Modal */}
      {showInspectionDetailsModal && selectedInspectionId && (
        <InspectorInspectionDetailsModal
          isOpen={showInspectionDetailsModal}
          inspectionId={selectedInspectionId}
          onClose={() => {
            setShowInspectionDetailsModal(false);
            setSelectedInspectionId(null);
          }}
          onStart={handleStart}
          onComplete={handleComplete}
          onRefresh={loadInspectorData}
        />
      )}

      {/* Enhanced Profile Modal */}
      {showProfileModal && userId && (
        <InspectorProfileModal
          userId={userId}
          token={token}
          inspector={inspector}
          user={user}
          onClose={() => setShowProfileModal(false)}
          onUpdated={() => { 
            try { 
              loadInspectorData(); 
              setShowProfileModal(false);
            } catch {} 
          }}
        />
      )}

      {/* 2FA Modal */}
      {show2FAModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShow2FAModal(false)} />
          <div className="relative w-full max-w-3xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100"><TranslatedText text="Two-Factor Authentication" /></h3>
              <button onClick={() => setShow2FAModal(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">✕</button>
            </div>
            <TwoFactorManagement onStatusChange={() => { /* could refetch status if needed */ }} />
          </div>
        </div>
      )}

      {/* Quick Settings Modal */}
      {showQuickSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowQuickSettings(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100"><TranslatedText text="Quick Settings" /></h3>
              <button onClick={() => setShowQuickSettings(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">✕</button>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Theme</label>
                <div className="flex gap-2">
                  <button onClick={() => toggleTheme('light')} className={`px-3 py-2 rounded-lg border ${!isDark ? 'bg-gray-100 border-gray-300' : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200'}`}>Light</button>
                  <button onClick={() => toggleTheme('dark')} className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-800 text-white border-gray-600' : 'border-gray-300 text-gray-700'}`}>Dark</button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preferred Currency</label>
                <select value={preferredCurrency} onChange={(e) => setPreferredCurrency(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                  <option value="USD">USD</option>
                  <option value="RWF">RWF</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
                <div className="mt-3 flex justify-end">
                  <button onClick={() => savePreferredCurrency(preferredCurrency)} className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800">Save</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePassword && (
        <ChangePasswordModal onClose={() => setShowChangePassword(false)} onSubmit={changePassword} />
      )}
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
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-my-primary focus:border-my-primary"
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
                className="px-4 py-2 rounded bg-my-primary text-white hover:bg-opacity-90"
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
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowComplete({ open: false, id: null, notes: '', items: [{ itemName: '', description: '', condition: 'good', notes: '', repairCost: 0, replacementCost: 0, requiresRepair: false, requiresReplacement: false }] })} />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Complete Inspection</h3>
            <label className="block text-sm text-gray-700 mb-2">Completion notes</label>
            <textarea
              rows={3}
              value={showComplete.notes}
              onChange={(e) => setShowComplete((s) => ({ ...s, notes: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-my-primary focus:border-my-primary"
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
                    return { ...s, items: [...s.items, { itemName: '', description: '', condition: 'good', notes: '', repairCost: 0, replacementCost: 0, requiresRepair: false, requiresReplacement: false }] };
                  })}
                  className="text-xs px-2 py-1 rounded bg-my-primary/10 text-my-primary border border-my-primary/20 hover:bg-my-primary/20"
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
                        <label className="block text-xs text-gray-600 mb-1">Description</label>
                        <input value={it.description} onChange={(e) => setShowComplete((s) => { const items = [...s.items]; items[idx].description = e.target.value; return { ...s, items }; })} className="w-full border border-gray-300 rounded px-2 py-1" placeholder="Item description" />
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
              <button onClick={() => setShowComplete({ open: false, id: null, notes: '', items: [ { itemName: '', description: '', condition: 'good', notes: '', repairCost: 0, replacementCost: 0, requiresRepair: false, requiresReplacement: false } ] })} className="px-4 py-2 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">Cancel</button>
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
                      description: i.description,
                      condition: i.condition as any,
                      notes: i.notes,
                      repairCost: i.repairCost,
                      replacementCost: i.replacementCost,
                      requiresRepair: i.requiresRepair,
                      requiresReplacement: i.requiresReplacement,
                      photos: [],
                    }));
                    await inspectionService.completeInspection(showComplete.id, { 
                      description: showComplete.notes, 
                      inspectorNotes: showComplete.notes,
                      items: itemsPayload 
                    });
                    setShowComplete({ open: false, id: null, notes: '', items: [ { itemName: '', description: '', condition: 'good', notes: '', repairCost: 0, replacementCost: 0, requiresRepair: false, requiresReplacement: false } ] });
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
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowAddItem({ open: false, inspectionId: null, item: { itemName: '', description: '', condition: 'good', notes: '', repairCost: 0, replacementCost: 0, requiresRepair: false, requiresReplacement: false, photos: [] } })} />
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
                     className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-my-primary focus:border-my-primary"
                     placeholder="e.g., Camera Body, Lens, Tripod"
                   />
                 </div>
                 
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Condition *</label>
                   <select
                     value={showAddItem.item.condition}
                     onChange={(e) => setShowAddItem(s => ({ ...s, item: { ...s.item, condition: e.target.value } }))}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-my-primary focus:border-my-primary"
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
                       {showAddItem.item.photos.map((file) => (
                         <li key={file.name}>{file.name}</li>
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
                    className="rounded border-gray-300 text-my-primary focus:ring-my-primary"
                  />
                  <span className="ml-2 text-sm text-gray-700">Requires Repair</span>
                </label>
                
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={showAddItem.item.requiresReplacement}
                    onChange={(e) => setShowAddItem(s => ({ ...s, item: { ...s.item, requiresReplacement: e.target.checked } }))}
                    className="rounded border-gray-300 text-my-primary focus:ring-my-primary"
                  />
                  <span className="ml-2 text-sm text-gray-700">Requires Replacement</span>
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowAddItem({ open: false, inspectionId: null, item: { itemName: '', description: '', condition: 'good', notes: '', repairCost: 0, replacementCost: 0, requiresRepair: false, requiresReplacement: false, photos: [] } })}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-my-primary"
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
                     showAddItem.item.photos.forEach((photo) => {
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
                 className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-my-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-my-primary"
               >
                 Add Item
               </button>
            </div>
          </div>
                 </div>
       )}

     </div>
   );
 };

// Overview Tab Component
const OverviewTab: React.FC<{
  stats: any;
  inspections: Inspection[];
  inspector: Inspector | null;
  onInspectionClick: (id: string) => void;
  formatDate: (date: string) => string;
  getTypeLabel: (type: string) => string;
  trendingData: any[];
  recentActivities: any[];
  performanceMetrics: any;
}> = ({ stats, inspections, inspector, onInspectionClick, formatDate, getTypeLabel, trendingData, recentActivities, performanceMetrics }) => {
  const { tSync } = useTranslation();
  return (
    <div className="space-y-8">
      {/* Enhanced Quick Stats with better design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">{stats.total}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400 font-medium"><TranslatedText text="Total Assigned" /></div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">{stats.pending}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400 font-medium"><TranslatedText text="Pending" /></div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-my-primary/10 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-my-primary" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">{stats.inProgress}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400 font-medium"><TranslatedText text="In Progress" /></div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-my-primary/10 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-my-primary" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">{stats.completed}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400 font-medium"><TranslatedText text="Completed" /></div>
        </div>
        
      </div>

      {/* Performance Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">{performanceMetrics.averageRating.toFixed(1)}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400 font-medium"><TranslatedText text="Average Rating" /></div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
            ${performanceMetrics.totalEarnings.toFixed(2)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 font-medium"><TranslatedText text="Total Earnings" /></div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">{performanceMetrics.completionRate}%</div>
          <div className="text-sm text-gray-600 dark:text-gray-400 font-medium"><TranslatedText text="Completion Rate" /></div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">{performanceMetrics.responseTime}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400 font-medium"><TranslatedText text="Avg Response Time" /></div>
        </div>
      </div>

      {/* Trending Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inspection Activity Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100"><TranslatedText text="Inspection Activity (Last 7 Days)" /></h3>
            <p className="text-sm text-gray-600 dark:text-gray-400"><TranslatedText text="Trending inspection statistics" /></p>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trendingData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorInspections" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Legend />
                <Area type="monotone" dataKey="inspections" stroke="#10b981" fillOpacity={1} fill="url(#colorInspections)" name={tSync('Total Inspections')} />
                <Area type="monotone" dataKey="completed" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCompleted)" name={tSync('Completed')} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Performance Metrics Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100"><TranslatedText text="Performance Overview" /></h3>
            <p className="text-sm text-gray-600 dark:text-gray-400"><TranslatedText text="Key performance indicators" /></p>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trendingData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Legend />
                <Bar dataKey="pending" fill="#f59e0b" name={tSync('Pending')} />
                <Bar dataKey="completed" fill="#10b981" name={tSync('Completed')} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100"><TranslatedText text="Recent Activities" /></h3>
          <p className="text-sm text-gray-600 dark:text-gray-400"><TranslatedText text="Latest inspection activities and updates" /></p>
        </div>
        <div className="p-6">
          {recentActivities.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2"><TranslatedText text="No recent activities" /></h3>
              <p className="text-gray-500 dark:text-gray-400"><TranslatedText text="Activities will appear here as you work on inspections." /></p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivities.map((activity) => {
                const IconComponent = activity.icon || Activity;
                return (
                  <div 
                    key={activity.id} 
                    className="flex items-center space-x-4 p-4 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 transition-colors cursor-pointer"
                    onClick={() => activity.type === 'inspection' && onInspectionClick(activity.id.replace('ins-', ''))}
                  >
                    <div className="w-10 h-10 bg-my-primary/10 dark:bg-my-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <IconComponent className="w-5 h-5 text-my-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{activity.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{activity.description}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {activity.timestamp && formatDate(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-my-primary/10 dark:bg-my-primary/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-my-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100"><TranslatedText text="Today's Schedule" /></h3>
                <p className="text-sm text-gray-600 dark:text-gray-400"><TranslatedText text="Your upcoming inspections and tasks" /></p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{inspections.length}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400"><TranslatedText text="Total Inspections" /></p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {inspections.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2"><TranslatedText text="No inspections scheduled" /></h3>
              <p className="text-gray-500 dark:text-gray-400"><TranslatedText text="You're all caught up! New inspections will appear here." /></p>
            </div>
          ) : (
            <div className="space-y-4">
              {inspections.slice(0, 5).map((inspection) => (
                <div
                  key={inspection.id}
                  className="flex items-center space-x-4 p-4 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 transition-colors cursor-pointer"
                  onClick={() => onInspectionClick(inspection.id)}
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        {getTypeLabel(inspection.inspectionType || '')}
                      </h4>
                      <StatusBadge status={inspection.status} />
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      {inspection.scheduledAt && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatDate(inspection.scheduledAt)}</span>
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
                          <TranslatedText text="Inspector Notes" />: {inspection.inspectorNotes}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-500 dark:text-gray-400"><TranslatedText text="View Details" /></span>
                    </div>
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

// Professional Sidebar Component
const InspectorSidebar: React.FC<{
  activeTab: string;
  setActiveTab: (tab: any) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  stats: { total: number; pending: number; inProgress: number; completed: number };
  onLogout: () => void;
}> = ({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen, sidebarCollapsed, setSidebarCollapsed, stats, onLogout }) => {
  const { user } = useAuth();
  const { tSync } = useTranslation();

  const toggleCollapse = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    try {
      localStorage.setItem('inspector-sidebar-collapsed', String(newState));
    } catch {}
  };

  const menuItems = [
    {
      id: 'overview',
      label: 'Dashboard',
      icon: Home,
      badge: null
      
    },
    {
      id: 'inspections',
      label: 'Inspections',
      icon: ClipboardCheck,
      badge: stats.pending + stats.inProgress
      
    },
    {
      id: 'completed',
      label: 'Completed',
      icon: CheckCircle2,
      badge: stats.completed
      
    },
    {
      id: 'payments',
      label: 'Payments',
      icon: Wallet,
      badge: null
      
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      badge: null
      
    }
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-slate-800 
        z-50 transform transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        ${sidebarCollapsed ? 'w-20' : 'w-64'}
        lg:translate-x-0
        shadow-xl lg:shadow-none
      `}>
        {/* Sidebar Header */}
        <div className={`h-16 flex items-center justify-between border-b border-gray-200 dark:border-gray-800 ${
          sidebarCollapsed ? 'px-3' : 'px-6'
        }`}>
          {!sidebarCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-my-primary rounded-lg flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100"><TranslatedText text="Inspector" /></h2>
                <p className="text-xs text-gray-500 dark:text-gray-400"><TranslatedText text="Dashboard" /></p>
              </div>
            </div>
          )}
          {sidebarCollapsed && (
            <div className="w-10 h-10 bg-my-primary rounded-lg flex items-center justify-center shadow-lg mx-auto">
              <Shield className="w-6 h-6 text-white" />
            </div>
          )}
          <div className="flex items-center space-x-1">
            {/* Toggle Collapse Button - Desktop only */}
            <button
              onClick={toggleCollapse}
              className="hidden lg:flex p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              title={sidebarCollapsed ? tSync('Expand sidebar') : tSync('Collapse sidebar')}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5 -rotate-90" />
              )}
            </button>
            {/* Close Button - Mobile only */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (window.innerWidth < 1024) {
                      setSidebarOpen(false);
                    }
                  }}
                  className={`
                    w-full flex items-center rounded-lg text-sm font-medium transition-all duration-200 group relative
                    ${sidebarCollapsed ? 'justify-center px-3 py-3' : 'justify-between px-4 py-3'}
                    ${isActive 
                      ? 'bg-my-primary/10 text-my-primary font-semibold shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'
                    }
                  `}
                  title={sidebarCollapsed ? tSync(item.label) : undefined}
                >
                  <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'}`}>
                    <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />
                    {!sidebarCollapsed && (
                      <>
                        <div className="text-left">
                          <div className="font-semibold"><TranslatedText text={item.label} /></div>
                        </div>
                      </>
                    )}
                  </div>
                  {!sidebarCollapsed && (
                    <>
                      {item.badge !== null && item.badge > 0 && (
                        <span className={`
                          px-2 py-0.5 rounded-full text-xs font-semibold
                          ${isActive 
                            ? 'bg-white/20 text-white' 
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                          }
                        `}>
                          {item.badge}
                        </span>
                      )}
                      {isActive && <ChevronRight className="w-4 h-4 text-white" />}
                    </>
                  )}
                  {/* Badge for collapsed state */}
                  {sidebarCollapsed && item.badge !== null && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-semibold rounded-full flex items-center justify-center">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </button>
              );
              })}
              </div>
            </nav>

        {/* Sidebar Footer */}
        <div className={`border-t border-gray-200 dark:border-gray-800 ${sidebarCollapsed ? 'p-2' : 'p-4'}`}>
          {!sidebarCollapsed && (
            <div className="flex items-center space-x-3 mb-3 px-2">
              <div className="w-8 h-8 bg-my-primary/10 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-my-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {user?.name || user?.email || 'Inspector'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400"><TranslatedText text="Professional Inspector" /></p>
              </div>
            </div>
          )}
          {sidebarCollapsed && (
            <div className="flex justify-center mb-3">
              <div className="w-10 h-10 bg-my-primary/10 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-my-primary" />
              </div>
            </div>
          )}
          <button
            onClick={onLogout}
            className={`w-full flex items-center rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ${
              sidebarCollapsed 
                ? 'justify-center px-2 py-2' 
                : 'space-x-2 px-4 py-2'
            }`}
            title={sidebarCollapsed ? tSync('Sign Out') : undefined}
          >
            <LogOut className="w-4 h-4" />
            {!sidebarCollapsed && <span><TranslatedText text="Sign Out" /></span>}
          </button>
        </div>
      </aside>
    </>
  );
};

// Inspections Tab Component
const InspectionsTab: React.FC<{
  inspections: Inspection[];
  onInspectionClick: (id: string) => void;
  onStart: (id: string) => void;
  onComplete: (id: string) => void;
  onReschedule: (id: string) => void;
  onAddItem: (id: string) => void;
  onRaiseDispute: (id: string) => void;
  onResolveDispute: (inspectionId: string, disputeId: string) => void;
  formatDate: (date: string) => string;
  getTypeLabel: (type: string) => string;
  searchQuery?: string;
  inspectionType?: string;
}> = ({ inspections, onInspectionClick, onStart, onComplete, onReschedule, onAddItem, onRaiseDispute, formatDate, getTypeLabel, searchQuery, inspectionType }) => {
  return (
    <div className="space-y-8">
      {/* Active Inspections */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-6 border-b border-gray-200 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-my-primary/10 rounded-lg flex items-center justify-center">
                <List className="w-5 h-5 text-my-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Active Inspections</h3>
                <p className="text-sm text-gray-600">Continue your ongoing inspections</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                {inspections.filter(i => i.status === 'pending' || i.status === 'in_progress').length}
              </p>
              <p className="text-sm text-gray-500">Active</p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {inspections.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-800 dark:to-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                <List className="w-10 h-10 text-gray-400 dark:text-slate-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {searchQuery ? 'No inspections found' : 'No active inspections'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchQuery ? 'Try adjusting your search or filters' : 'All inspections are completed or not yet started.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {inspections
                .filter(inspection => inspection.status === 'pending' || inspection.status === 'in_progress')
                .map((inspection) => (
                <div
                  key={inspection.id}
                  className="group bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 hover:border-my-primary hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-my-primary/10 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-my-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                              {getTypeLabel(inspection.inspectionType || '')}
                            </h4>
                            <StatusBadge status={inspection.status} />
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                            {inspection.scheduledAt && (
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4" />
                                <span>{formatDate(inspection.scheduledAt)}</span>
                              </div>
                            )}
                            {inspection.location && (
                              <div className="flex items-center gap-1.5">
                                <MapPin className="w-4 h-4" />
                                <span className="truncate max-w-xs">{inspection.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Enhanced Action Buttons */}
                      <div className="flex items-center flex-wrap gap-2 mt-4">
                        <button
                          onClick={() => onInspectionClick(inspection.id)}
                          className="px-4 py-2 bg-my-primary/10 text-my-primary text-sm font-medium rounded-lg hover:bg-my-primary/20 transition-colors flex items-center space-x-2"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View Details</span>
                        </button>
                        
                        {inspection.status === 'pending' && (
                          <button
                            onClick={() => onStart(inspection.id)}
                            className="px-4 py-2 bg-my-primary/10 text-my-primary text-sm font-medium rounded-lg hover:bg-my-primary/20 transition-colors flex items-center space-x-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Start Inspection</span>
                          </button>
                        )}
                        
                        {inspection.status === 'in_progress' && (
                          <>
                            <button
                              onClick={() => onComplete(inspection.id)}
                              className="px-4 py-2 bg-my-primary text-white text-sm font-medium rounded-lg hover:bg-opacity-90 transition-all shadow-md shadow-my-primary/20 flex items-center space-x-2"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Complete</span>
                            </button>
                            <button
                              onClick={() => onAddItem(inspection.id)}
                              className="px-4 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-sm font-medium rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors flex items-center space-x-2"
                            >
                              <Plus className="w-4 h-4" />
                              <span>Add Item</span>
                            </button>
                          </>
                        )}
                        
                        <button
                          onClick={() => onReschedule(inspection.id)}
                          className="px-4 py-2 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 text-sm font-medium rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors flex items-center space-x-2"
                        >
                          <Calendar className="w-4 h-4" />
                          <span>Reschedule</span>
                        </button>
                        
                        <button
                          onClick={() => onRaiseDispute(inspection.id)}
                          className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm font-medium rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center space-x-2"
                        >
                          <AlertCircle className="w-4 h-4" />
                          <span>Raise Dispute</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Completed Inspections */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-6 border-b border-gray-200 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-my-primary/10 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-my-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Completed Inspections</h3>
                <p className="text-sm text-gray-600">Recently completed inspections</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                {inspections.filter(i => i.status === 'completed').length}
              </p>
              <p className="text-sm text-gray-500">Completed</p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {inspections.filter(i => i.status === 'completed').length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No completed inspections</h3>
              <p className="text-gray-500">Complete your first inspection to see it here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {inspections
                .filter(inspection => inspection.status === 'completed')
                .slice(0, 5)
                .map((inspection) => (
                <div
                  key={inspection.id}
                  className="flex items-center space-x-4 p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors cursor-pointer"
                  onClick={() => onInspectionClick(inspection.id)}
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-semibold text-gray-900">
                        {getTypeLabel(inspection.inspectionType || '')}
                      </h4>
                      <StatusBadge status={inspection.status} />
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      {inspection.completedAt && (
                        <div className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          <span>Completed {formatDate(inspection.completedAt)}</span>
                        </div>
                      )}
                      {inspection.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{inspection.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-500">View Report</span>
                    </div>
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

// Disputes Tab Component
const DisputesTab: React.FC<{
  inspectorDisputes: any[];
  disputesLoading: boolean;
  onResolveDispute: (inspectionId: string, disputeId: string) => void;
  formatDate: (date: string) => string;
}> = ({ inspectorDisputes, disputesLoading, onResolveDispute, formatDate }) => {
  return (
    <div className="space-y-8">
      {/* Active Disputes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-6 border-b border-gray-200 bg-gradient-to-r from-red-50 to-orange-50">
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-my-primary mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Loading disputes...</p>
            </div>
          ) : inspectorDisputes.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No active disputes</h3>
              <p className="text-gray-500">All inspections are proceeding smoothly.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {inspectorDisputes.map((dispute) => (
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
                          <span className="font-medium">Raised:</span> {dispute.createdAt && formatDate(dispute.createdAt)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                      {dispute.status === 'open' && (
                        <>
                          <button
                            onClick={() => onResolveDispute(dispute.inspectionId, dispute.id)}
                            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-my-primary text-white hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-my-primary transition-colors font-medium text-sm"
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
          )}
        </div>
      </div>
     </div>
   );
 };

// Certifications Tab Component
const CertificationsTab: React.FC<{ inspector: Inspector | null }> = ({ inspector }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30 rounded-lg flex items-center justify-center">
            <Award className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Certifications</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manage your professional credentials</p>
          </div>
        </div>
        
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Award className="w-10 h-10 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No certifications yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">Add your professional certifications to get more assignments</p>
          <button className="px-4 py-2 bg-my-primary text-white rounded-lg hover:bg-opacity-90 transition-colors">
            Add Certification
          </button>
        </div>
      </div>
    </div>
  );
};

// Settings Tab Component
const SettingsTab: React.FC<{ 
  user: any; 
  inspector: Inspector | null; 
  onProfileUpdate: () => void;
}> = ({ user, inspector, onProfileUpdate }) => {
  const { showToast } = useToast();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const token = (typeof window !== 'undefined' && localStorage.getItem('token')) || '';
  const userId = user?.id;

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Account Settings</h3>
        
        <div className="space-y-4">
          <button
            onClick={() => setShowProfileModal(true)}
            className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <UserCheck className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <div className="text-left">
                <div className="font-medium text-gray-900 dark:text-gray-100"><TranslatedText text="Profile Settings" /></div>
                <div className="text-sm text-gray-500 dark:text-gray-400"><TranslatedText text="Update your personal information" /></div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          <button
            onClick={() => setShow2FAModal(true)}
            className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <div className="text-left">
                <div className="font-medium text-gray-900 dark:text-gray-100">Two-Factor Authentication</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Secure your account</div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Enhanced Profile Modal */}
      {showProfileModal && userId && (
        <InspectorProfileModal
          userId={userId}
          token={token}
          inspector={inspector}
          user={user}
          onClose={() => setShowProfileModal(false)}
          onUpdated={() => { 
            onProfileUpdate(); 
            setShowProfileModal(false);
          }}
        />
      )}

      {/* 2FA Modal */}
      {show2FAModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShow2FAModal(false)} />
          <div className="relative w-full max-w-3xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100"><TranslatedText text="Two-Factor Authentication" /></h3>
              <button onClick={() => setShow2FAModal(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">✕</button>
            </div>
            <TwoFactorManagement onStatusChange={() => {}} />
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced Inspector Profile Modal Component
const InspectorProfileModal: React.FC<{
  userId: string;
  token: string;
  inspector: Inspector | null;
  user: any;
  onClose: () => void;
  onUpdated: () => void;
}> = ({ userId, token, inspector, user, onClose, onUpdated }) => {
  const { showToast } = useToast();
  const [activeSection, setActiveSection] = useState<'personal' | 'professional' | 'location' | 'preferences'>('personal');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    // Personal Info
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    date_of_birth: '',
    gender: '',
    
    // Professional Info
    qualifications: '',
    specializations: '',
    experience: '',
    serviceRadius: '50',
    languages: '',
    certifications: '',
    
    // Location
    province: '',
    district: '',
    sector: '',
    cell: '',
    village: '',
    address_line: '',
    latitude: '',
    longitude: '',
    
    // Preferences
    preferred_currency: 'RWF',
    notification_preferences: {
      email: true,
      sms: false,
      push: true
    }
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await fetchUserProfile(token);
      const data = res?.data;
      if (data) {
        setFormData({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          phone: data.phone || data.phone_number || '',
          bio: data.bio || '',
          date_of_birth: data.date_of_birth ? new Date(data.date_of_birth).toISOString().split('T')[0] : '',
          gender: data.gender || '',
          qualifications: inspector?.qualifications?.join(', ') || '',
          specializations: inspector?.specializations?.join(', ') || '',
          experience: inspector?.experience?.toString() || '',
          serviceRadius: '50',
          languages: '',
          certifications: '',
          province: data.province || '',
          district: data.district || '',
          sector: data.sector || '',
          cell: data.cell || '',
          village: data.village || '',
          address_line: data.address_line || data.addressLine || '',
          latitude: data.location?.coordinates?.latitude?.toString() || data.location?.lat?.toString() || '',
          longitude: data.location?.coordinates?.longitude?.toString() || data.location?.lng?.toString() || '',
          preferred_currency: data.preferred_currency || data.preferredCurrency || 'RWF',
          notification_preferences: {
            email: true,
            sms: false,
            push: true
          }
        });
        setAvatarUrl(data.profileImageUrl || data.profile_image || null);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        bio: formData.bio,
        date_of_birth: formData.date_of_birth || undefined,
        gender: formData.gender || undefined,
        province: formData.province,
        district: formData.district,
        sector: formData.sector,
        cell: formData.cell,
        village: formData.village,
        address_line: formData.address_line,
        preferred_currency: formData.preferred_currency,
      };

      if (formData.latitude && formData.longitude) {
        payload.location = {
          lat: parseFloat(formData.latitude),
          lng: parseFloat(formData.longitude)
        };
      }

      const res = await updateUser(userId, payload, token);
      if (res?.success) {
        showToast('Profile updated successfully!', 'success');
        onUpdated();
      } else {
        showToast('Failed to update profile', 'error');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      showToast('Failed to save profile. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      setSaving(true);
      const res = await uploadUserAvatar(userId, file, token);
      const url = res?.data?.profileImageUrl || res?.data?.data?.profileImageUrl;
      if (url) {
        setAvatarUrl(url);
        showToast('Avatar updated successfully!', 'success');
      }
    } catch (error) {
      showToast('Failed to upload avatar', 'error');
    } finally {
      setSaving(false);
    }
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser', 'error');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData(prev => ({
          ...prev,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6)
        }));
        showToast('Location updated!', 'success');
      },
      () => showToast('Failed to get location', 'error')
    );
  };

  const sections = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'professional', label: 'Professional', icon: Briefcase },
    { id: 'location', label: 'Location', icon: MapPin },
    { id: 'preferences', label: 'Preferences', icon: Settings }
  ];

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-my-primary px-6 py-5 border-b border-my-primary">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Inspector Profile</h2>
                <p className="text-sm text-white/90">Manage your professional profile</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex">
            {/* Sidebar Navigation */}
            <div className="w-64 bg-gray-50 dark:bg-slate-800 border-r border-gray-200 dark:border-gray-700 p-4">
              <div className="space-y-2">
                {sections.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id as any)}
                      className={`
                        w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
                        ${isActive
                          ? 'bg-my-primary text-white shadow-md'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'
                        }
                      `}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />
                      <span>{section.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Avatar Section */}
              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-col items-center">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover ring-4 ring-emerald-500/20 mb-3"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/30 dark:to-emerald-800/30 flex items-center justify-center mb-3 ring-4 ring-emerald-500/20">
                      <User className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const preview = URL.createObjectURL(file);
                        setAvatarUrl(preview);
                        handleAvatarUpload(file);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={saving}
                    className="px-4 py-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 disabled:opacity-50"
                  >
                    {saving ? 'Uploading...' : 'Change Photo'}
                  </button>
                </div>
              </div>
            </div>

            {/* Main Form Content */}
            <div className="flex-1 p-6">
              {/* Personal Info Section */}
              {activeSection === 'personal' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">First Name *</label>
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          placeholder="Enter first name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Last Name *</label>
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          placeholder="Enter last name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Email</label>
                        <input
                          type="email"
                          value={formData.email}
                          disabled
                          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-slate-800/50 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Phone Number</label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          placeholder="+250 788 123 456"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Date of Birth</label>
                        <input
                          type="date"
                          value={formData.date_of_birth}
                          onChange={(e) => setFormData(prev => ({ ...prev, date_of_birth: e.target.value }))}
                          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Gender</label>
                        <select
                          value={formData.gender}
                          onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        >
                          <option value="">Select gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Bio</label>
                        <textarea
                          value={formData.bio}
                          onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                          rows={4}
                          maxLength={500}
                          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          placeholder="Tell us about yourself and your inspection experience..."
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formData.bio.length}/500 characters</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Professional Section */}
              {activeSection === 'professional' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Professional Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Qualifications</label>
                        <input
                          type="text"
                          value={formData.qualifications}
                          onChange={(e) => setFormData(prev => ({ ...prev, qualifications: e.target.value }))}
                          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          placeholder="e.g., Certified Inspector, ISO 17020, etc. (comma separated)"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">List your professional qualifications</p>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Specializations</label>
                        <input
                          type="text"
                          value={formData.specializations}
                          onChange={(e) => setFormData(prev => ({ ...prev, specializations: e.target.value }))}
                          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          placeholder="e.g., Vehicles, Electronics, Equipment (comma separated)"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Product categories you specialize in</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Years of Experience</label>
                        <input
                          type="number"
                          min="0"
                          value={formData.experience}
                          onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Service Radius (km)</label>
                        <input
                          type="number"
                          min="1"
                          value={formData.serviceRadius}
                          onChange={(e) => setFormData(prev => ({ ...prev, serviceRadius: e.target.value }))}
                          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          placeholder="50"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Maximum distance you're willing to travel</p>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Languages Spoken</label>
                        <input
                          type="text"
                          value={formData.languages}
                          onChange={(e) => setFormData(prev => ({ ...prev, languages: e.target.value }))}
                          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          placeholder="e.g., English, French, Kinyarwanda (comma separated)"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Location Section */}
              {activeSection === 'location' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Location Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Province</label>
                        <input
                          type="text"
                          value={formData.province}
                          onChange={(e) => setFormData(prev => ({ ...prev, province: e.target.value }))}
                          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">District</label>
                        <input
                          type="text"
                          value={formData.district}
                          onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
                          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Sector</label>
                        <input
                          type="text"
                          value={formData.sector}
                          onChange={(e) => setFormData(prev => ({ ...prev, sector: e.target.value }))}
                          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Cell</label>
                        <input
                          type="text"
                          value={formData.cell}
                          onChange={(e) => setFormData(prev => ({ ...prev, cell: e.target.value }))}
                          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Village</label>
                        <input
                          type="text"
                          value={formData.village}
                          onChange={(e) => setFormData(prev => ({ ...prev, village: e.target.value }))}
                          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Address Line</label>
                        <input
                          type="text"
                          value={formData.address_line}
                          onChange={(e) => setFormData(prev => ({ ...prev, address_line: e.target.value }))}
                          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          placeholder="Street address"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Latitude</label>
                        <input
                          type="number"
                          step="any"
                          value={formData.latitude}
                          onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
                          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          placeholder="e.g., -1.9441"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Longitude</label>
                        <input
                          type="number"
                          step="any"
                          value={formData.longitude}
                          onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
                          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          placeholder="e.g., 30.0619"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <button
                          type="button"
                          onClick={useCurrentLocation}
                          className="px-4 py-2.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors flex items-center space-x-2"
                        >
                          <MapPin className="w-4 h-4" />
                          <span>Use Current Location</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Preferences Section */}
              {activeSection === 'preferences' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Preferences</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Preferred Currency</label>
                        <select
                          value={formData.preferred_currency}
                          onChange={(e) => setFormData(prev => ({ ...prev, preferred_currency: e.target.value }))}
                          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        >
                          <option value="RWF">RWF (R₣)</option>
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                          <option value="GBP">GBP (£)</option>
                          <option value="KES">KES (KSh)</option>
                          <option value="UGX">UGX (USh)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">Notification Preferences</label>
                        <div className="space-y-3">
                          <label className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={formData.notification_preferences.email}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                notification_preferences: { ...prev.notification_preferences, email: e.target.checked }
                              }))}
                              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                            />
                            <span className="text-sm text-gray-700 dark:text-slate-300">Email Notifications</span>
                          </label>
                          <label className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={formData.notification_preferences.sms}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                notification_preferences: { ...prev.notification_preferences, sms: e.target.checked }
                              }))}
                              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                            />
                            <span className="text-sm text-gray-700 dark:text-slate-300">SMS Notifications</span>
                          </label>
                          <label className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={formData.notification_preferences.push}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                notification_preferences: { ...prev.notification_preferences, push: e.target.checked }
                              }))}
                              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                            />
                            <span className="text-sm text-gray-700 dark:text-slate-300">Push Notifications</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 px-6 py-4 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {saving ? <TranslatedText text="Saving..." /> : <TranslatedText text="Save Changes" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InspectorDashboardPage;

// Local inline modal for changing password (self-service)
const ChangePasswordModal: React.FC<{ onClose: () => void; onSubmit: (currentPassword: string, newPassword: string) => Promise<{ ok: boolean; error: string | null }> }> = ({ onClose, onSubmit }) => {
  const { showToast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-md p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100"><TranslatedText text="Change Password" /></h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">✕</button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Current Password</label>
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">New Password</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Confirm New Password</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100" />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">Cancel</button>
          <button
            disabled={saving}
            onClick={async () => {
              if (!currentPassword || !newPassword || !confirmPassword) { showToast('Fill all fields', 'error'); return; }
              if (newPassword.length < 8) { showToast('Password must be at least 8 characters', 'error'); return; }
              if (newPassword !== confirmPassword) { showToast('Passwords do not match', 'error'); return; }
              setSaving(true);
              const res = await onSubmit(currentPassword, newPassword);
              setSaving(false);
              if (res.ok) { showToast('Password changed successfully', 'success'); onClose(); }
              else { showToast(res.error || 'Failed to change password', 'error'); }
            }}
            className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
