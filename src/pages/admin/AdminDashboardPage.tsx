import React, { useState, useEffect, useMemo } from 'react';

import { Button } from '../../components/ui/DesignSystem';
import { itemCategories } from '../../data/mockRentalData';
import type { AdminStats, RecentUser, RecentBooking, AdminUser } from './interfaces';
import {
  fetchAllProducts,
  fetchAdminStats,
  fetchRecentUsers,
  fetchRecentBookings,
  fetchAdminUsers,
  fetchAdminAnalytics,
  fetchAdminRealtimeMetrics,
  fetchPricingStats,
  fetchAllInspections,
  fetchAllDisputes,
  fetchInspectionSummary,
  resolveDispute
} from './service';
import AdminSidebar from './components/AdminSidebar';
import AdminHeader from './components/AdminHeader';
import AdminStatCards from './components/AdminStatCards';
import ItemsManagement from './components/ItemsManagement';
import UserManagement from './components/UserManagement';
import BookingsManagement from './components/BookingsManagement';
import FinancesManagement from './components/FinancesManagement';
import ReportsManagement from './components/ReportsManagement';
import LocationsManagement from './components/LocationsManagement';
import LanguagesManagement from './components/LanguagesManagement';
import MessagingManagement from './components/MessagingManagement';
import NotificationsManagement from './components/NotificationsManagement';
import AdminProfilePage from './components/AdminProfilePage';
import RecentTransactionsList from './components/RecentTransactionsList';
import TransactionsManagement from './components/TransactionsManagement';
import CategoriesManagement from './components/CategoriesManagement';
import NewListingModal from '../my-account/models/NewListingModal';
import { createProduct, createProductPricing, createProductImage, getProductById } from '../my-account/service/api';
import { fetchUserById } from './service';
import CountriesManagement from './components/CountriesManagement';
import PaymentMethodsManagement from './components/PaymentMethodsManagement';
import PaymentProvidersManagement from './components/PaymentProvidersManagement';
import InsuranceProvidersManagement from './components/InsuranceProvidersManagement';
import CategoryRegulationsManagement from './components/CategoryRegulationsManagement';
import AdministrativeDivisionsManagement from './components/AdministrativeDivisionsManagement';
import PricingManagement from './components/PricingManagement';
import ProductCategoriesChart from './components/ProductCategoriesChart';
import ModerationDashboardPage from './ModerationDashboardPage';
import AIAnalyticsDashboard from './components/AIAnalyticsDashboard';
import InspectionsManagement from './components/InspectionsManagement';
import RiskManagementPage from '../risk-management/RiskManagementPage';
import HandoverReturnPage from '../handover-return/HandoverReturnPage';
import SettingsPage from './SettingsPage';
import { useAdminSettingsContext } from '../../contexts/AdminSettingsContext';

import SkeletonPricingStats from './components/SkeletonPricingStats';
import SkeletonAdminStats from '../../components/ui/SkeletonAdminStats';
import SkeletonMetrics from '../../components/ui/SkeletonMetrics';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts';
import { Users, Calendar, Cpu, Clock, CheckCircle, Activity, User as UserIcon, Image as ImageIcon, LayoutGrid, Menu } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import DashboardMobileNav from '../../components/dashboard/DashboardMobileNav';
import { inspectionService, inspectionItemService } from '../../services/inspectionService';
import { useTranslation } from '../../hooks/useTranslation';
import { TranslatedText } from '../../components/translated-text';

interface AdminNavigationItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  onClick: () => void;
  hasNotification?: boolean;
}

// Add interfaces for Product and Owner
interface Product {
  id: string;
  title: string;
  description?: string;
  owner_id: string;
  category_id?: string;
  location?: string;
  status?: string;
  [key: string]: any;
}

interface Owner {
  id: string;
  name: string;
  [key: string]: any;
}

const AdminDashboardPage: React.FC = () => {
  const { formatCurrency, formatDate, settings } = useAdminSettingsContext();
  const { showToast } = useToast();
  const { tSync, language, setLanguage } = useTranslation();
  const [activeTab, setActiveTab] = useState<'overview' | 'items' | 'users' | 'bookings' | 'finances' | 'transactions' | 'categories' | 'countries' | 'paymentMethods' | 'paymentProviders' | 'insuranceProviders' | 'categoryRegulations' | 'pricing' | 'reports' | 'profile' | 'locations' | 'languages' | 'messaging' | 'notifications' | 'administrativeDivisions' | 'moderation' | 'ai-analytics' | 'inspections' | 'risk-management' | 'handover-return' | 'admin-settings'>('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [itemFilter, setItemFilter] = useState<string>('all');
  const [itemStatus, setItemStatus] = useState<string>('all');
  const [itemSort, setItemSort] = useState<'newest' | 'oldest'>('newest');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>(language || 'en');
  const [products, setProducts] = useState<Product[]>([]);
  const [itemPage, setItemPage] = useState(1);
  const [itemLimit, setItemLimit] = useState(20);
  const [itemMeta, setItemMeta] = useState({ total: 0, totalPages: 1, hasNext: false, hasPrev: false });
  const [owners, setOwners] = useState<Record<string, Owner>>({});
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [verifiedUsersCount, setVerifiedUsersCount] = useState(0);

  // Overview data state
  const [adminStats, setAdminStats] = useState<AdminStats>({
    totalUsers: 0,
    totalItems: 0,
    activeBookings: 0,
    totalRevenue: 0,
    monthlyGrowth: {
      users: 0,
      items: 0,
      bookings: 0,
      revenue: 0
    }
  });
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [overviewError, setOverviewError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [realtimeMetrics, setRealtimeMetrics] = useState<any>(null);
  const [loadingRealtime, setLoadingRealtime] = useState(false);
  const [realtimeError, setRealtimeError] = useState<string | null>(null);
  const [pricingStats, setPricingStats] = useState<any>(null);
  const [loadingPricingStats, setLoadingPricingStats] = useState(false);
  const [pricingStatsError, setPricingStatsError] = useState<string | null>(null);

  // If 2FA is being enforced, jump to Admin Settings so the modal can open
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam) {
        setActiveTab(tabParam as any);
      }
      if (params.get('force2fa') === '1') {
        setActiveTab('admin-settings');
        try { localStorage.setItem('force2fa', '1'); } catch {}
      }
    } catch {}
  }, []);

  useEffect(() => {
    setSelectedLanguage(language || 'en');
  }, [language]);

  // Handle navigation to users tab from RecentUsersList component
  useEffect(() => {
    const handleNavigateToUsersTab = () => {
      setActiveTab('users');
    };
    const handleNavigateToBookingsTab = () => {
      setActiveTab('bookings');
    };

    window.addEventListener('navigateToUsersTab', handleNavigateToUsersTab);
    window.addEventListener('navigateToBookingsTab', handleNavigateToBookingsTab);
    return () => {
      window.removeEventListener('navigateToUsersTab', handleNavigateToUsersTab);
      window.removeEventListener('navigateToBookingsTab', handleNavigateToBookingsTab);
    };
  }, []);

  // Admin-side New Listing Modal state
  const [showNewListingModalAdmin, setShowNewListingModalAdmin] = useState(false);
  type AdminNewListingForm = {
    title: string; slug: string; description: string; category_id: string; condition: string;
    brand?: string; model?: string; year_manufactured?: string; address_line?: string; delivery_fee?: string;
    price_per_hour: string; price_per_day: string; price_per_week: string; price_per_month: string; security_deposit: string;
    currency: string; market_adjustment_factor: string; weekly_discount_percentage: string; monthly_discount_percentage: string;
    bulk_discount_threshold: string; bulk_discount_percentage: string; dynamic_pricing_enabled: boolean; peak_season_multiplier: string; off_season_multiplier: string;
    pickup_methods: string[]; country_id: string; specifications: { [k: string]: string }; features?: string[]; included_accessories?: string[];
    images: File[]; alt_text: string; sort_order: string; isPrimary: string; product_id: string; location: { latitude: string; longitude: string };
  };
  const [newListingForm, setNewListingForm] = useState<AdminNewListingForm>({
    title: '', slug: '', description: '', category_id: '', condition: 'new', brand: '', model: '', year_manufactured: '', address_line: '', delivery_fee: '',
    price_per_hour: '', price_per_day: '', price_per_week: '', price_per_month: '', security_deposit: '', currency: 'USD', market_adjustment_factor: '1.0',
    weekly_discount_percentage: '0.1', monthly_discount_percentage: '0.2', bulk_discount_threshold: '5', bulk_discount_percentage: '0.05',
    dynamic_pricing_enabled: false, peak_season_multiplier: '1.2', off_season_multiplier: '0.8', pickup_methods: [], country_id: '', specifications: { spec1: '' },
    features: [], included_accessories: [], images: [], alt_text: '', sort_order: '1', isPrimary: 'true', product_id: '', location: { latitude: '', longitude: '' }
  });
  const [newListingSubmitting, setNewListingSubmitting] = useState(false);
  const handleNewListingInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.currentTarget as any;
    if (type === 'file' && (e.currentTarget as HTMLInputElement).files) {
      if (name === 'images') {
        const inputEl = e.currentTarget as HTMLInputElement;
        setNewListingForm(prev => ({ ...prev, images: inputEl.files ? Array.from(inputEl.files) : [] }));
      }
      return;
    }
    if (name === 'title') {
      const slug = value.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');
      setNewListingForm(prev => ({ ...prev, title: value, slug }));
      return;
    }
    if (name === 'pickup_methods') {
      setNewListingForm(prev => ({ ...prev, pickup_methods: Array.from((e.target as HTMLSelectElement).selectedOptions, (o: any) => o.value) }));
      return;
    }
    if (name && name.startsWith('specifications.')) {
      const key = name.split('.')[1];
      setNewListingForm(prev => ({ ...prev, specifications: { ...prev.specifications, [key]: value } }));
      return;
    }
    setNewListingForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAdminNewListingSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setNewListingSubmitting(true);
    try {
      const productPayload: any = {
        title: newListingForm.title,
        slug: newListingForm.slug,
        description: newListingForm.description,
        category_id: newListingForm.category_id,
        condition: newListingForm.condition,
        brand: newListingForm.brand || undefined,
        model: newListingForm.model || undefined,
        year_manufactured: newListingForm.year_manufactured ? Number(newListingForm.year_manufactured) : undefined,
        address_line: newListingForm.address_line || undefined,
        delivery_fee: newListingForm.delivery_fee ? Number(newListingForm.delivery_fee) : undefined,
        included_accessories: Array.isArray(newListingForm.included_accessories) ? newListingForm.included_accessories.filter(a => a?.trim()) : undefined,
        includedAccessories: Array.isArray(newListingForm.included_accessories) ? newListingForm.included_accessories.filter(a => a?.trim()) : undefined,
        pickup_methods: newListingForm.pickup_methods,
        country_id: newListingForm.country_id,
        specifications: newListingForm.specifications,
        location: newListingForm.location,
        features: Array.isArray(newListingForm.features) ? newListingForm.features.filter(f => f?.trim()) : [],
        status: settings?.system?.autoApproveProducts ? 'approved' : 'pending',
      };
      const created = await createProduct(productPayload);
      const productId = created?.data?.id || created?.data?.data?.id || created?.id;
      if (!productId) throw new Error('Product creation failed');

      const daily = parseFloat(newListingForm.price_per_day);
      if (!newListingForm.country_id || !newListingForm.currency || Number.isNaN(daily) || daily <= 0) {
        throw new Error('Missing pricing fields');
      }
      const pricingPayload: any = {
        product_id: String(productId), productId: String(productId),
        country_id: String(newListingForm.country_id), countryId: String(newListingForm.country_id),
        currency: newListingForm.currency,
        price_per_day: daily, pricePerDay: daily,
        price_per_hour: parseFloat(newListingForm.price_per_hour) || 0, pricePerHour: parseFloat(newListingForm.price_per_hour) || 0,
        price_per_week: parseFloat(newListingForm.price_per_week) || 0, pricePerWeek: parseFloat(newListingForm.price_per_week) || 0,
        price_per_month: parseFloat(newListingForm.price_per_month) || 0, pricePerMonth: parseFloat(newListingForm.price_per_month) || 0,
        security_deposit: parseFloat(newListingForm.security_deposit) || 0, securityDeposit: parseFloat(newListingForm.security_deposit) || 0,
        market_adjustment_factor: parseFloat(newListingForm.market_adjustment_factor) || 1.0, marketAdjustmentFactor: parseFloat(newListingForm.market_adjustment_factor) || 1.0,
        weekly_discount_percentage: parseFloat(newListingForm.weekly_discount_percentage) || 0, weeklyDiscountPercentage: parseFloat(newListingForm.weekly_discount_percentage) || 0,
        monthly_discount_percentage: parseFloat(newListingForm.monthly_discount_percentage) || 0, monthlyDiscountPercentage: parseFloat(newListingForm.monthly_discount_percentage) || 0,
        bulk_discount_threshold: parseInt(newListingForm.bulk_discount_threshold as any) || 0, bulkDiscountThreshold: parseInt(newListingForm.bulk_discount_threshold as any) || 0,
        bulk_discount_percentage: parseFloat(newListingForm.bulk_discount_percentage) || 0, bulkDiscountPercentage: parseFloat(newListingForm.bulk_discount_percentage) || 0,
        dynamic_pricing_enabled: Boolean(newListingForm.dynamic_pricing_enabled), dynamicPricingEnabled: Boolean(newListingForm.dynamic_pricing_enabled),
        peak_season_multiplier: parseFloat(newListingForm.peak_season_multiplier) || 1.0, peakSeasonMultiplier: parseFloat(newListingForm.peak_season_multiplier) || 1.0,
        off_season_multiplier: parseFloat(newListingForm.off_season_multiplier) || 1.0, offSeasonMultiplier: parseFloat(newListingForm.off_season_multiplier) || 1.0,
        is_active: true, isActive: true,
      };
      await createProductPricing(pricingPayload);

      if (newListingForm.images && newListingForm.images.length > 0) {
        const imagePayload = {
          images: newListingForm.images,
          product_id: productId,
          alt_text: newListingForm.alt_text,
          sort_order: newListingForm.sort_order,
          isPrimary: 'true',
        } as any;
        await createProductImage(imagePayload);
      }
      setShowNewListingModalAdmin(false);
      setNewListingSubmitting(false);
      showToast(tSync('Listing created successfully!'), 'success');
    } catch (err: any) {
      setNewListingSubmitting(false);
      showToast(err?.message || tSync('Failed to create listing'), 'error');
    }
  };

  // Allow ItemsManagement button to open this modal from Admin
  useEffect(() => {
    (window as any).__openNewListingModal = () => setShowNewListingModalAdmin(true);
    return () => { try { delete (window as any).__openNewListingModal; } catch { } };
  }, []);

  // Listen for navigation events from header
  useEffect(() => {
    const handleNavigation = (event: CustomEvent) => {
      const { tab } = event.detail;
      if (tab === 'profile') {
        setActiveTab('profile');
      }
    };

    window.addEventListener('admin-navigate', handleNavigation as EventListener);
    return () => {
      window.removeEventListener('admin-navigate', handleNavigation as EventListener);
    };
  }, []);

  // Add state for pagination and modals
  const [userPage, setUserPage] = useState(1);
  const [bookingPage, setBookingPage] = useState(1);
  const [usersPerPage] = useState(5);
  const [bookingsPerPage] = useState(5);
  const [selectedUser, setSelectedUser] = useState<RecentUser | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<RecentBooking | null>(null);

  // Inspections Management State
  const [inspections, setInspections] = useState<any[]>([]);
  const [loadingInspections, setLoadingInspections] = useState(false);
  const [inspectionsError, setInspectionsError] = useState<string | null>(null);
  const [inspectionPage, setInspectionPage] = useState(1);
  const [inspectionsPerPage] = useState(10);
  // const [selectedInspection, setSelectedInspection] = useState<any>(null);

  // Disputes Management State
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loadingDisputes, setLoadingDisputes] = useState(false);
  const [disputesError, setDisputesError] = useState<string | null>(null);
  const [disputePage] = useState(1);
  const [disputesPerPage] = useState(10);
  const [selectedDispute, setSelectedDispute] = useState<any>(null);

  // Inspection Summary State
  const [inspectionSummary, setInspectionSummary] = useState<any>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  // Modal States

  const [showInspectionDetailsModal, setShowInspectionDetailsModal] = useState(false);
  const [showDisputeDetailsModal, setShowDisputeDetailsModal] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState<any>(null);
  const [modalProductName, setModalProductName] = useState<string>('');
  const [modalInspectorName, setModalInspectorName] = useState<string>('');
  const [adminInspectionDetails, setAdminInspectionDetails] = useState<any>(null);
  const [isStartingInspection, setIsStartingInspection] = useState(false);
  const [isCompletingInspection, setIsCompletingInspection] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItemForm, setNewItemForm] = useState({
    itemName: '',
    description: '',
    condition: 'good',
    repairCost: '',
    replacementCost: ''
  });
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completeForm, setCompleteForm] = useState({
    verificationCode: '',
    handoverSignature: '',
    overallCondition: 'good',
    conditionScore: 5,
    notes: '',
    inspectorNotes: '',
    generalNotes: '',
    ownerNotes: '',
    renterNotes: '',
    inspectionLocation: ''
  });
  const [completeItems, setCompleteItems] = useState<Array<{ itemName: string; condition: string; description: string }>>([
    { itemName: '', condition: 'good', description: '' }
  ]);

  useEffect(() => {
    const loadFriendlyNames = async () => {
      try {
        if (!showInspectionDetailsModal || !selectedInspection) return;
        // Load full inspection details (participants, items)
        try {
          const details = await inspectionService.getInspection(selectedInspection.id);
          setAdminInspectionDetails(details);
        } catch {}
        // Product name
        const inlineName = selectedInspection.product?.name || selectedInspection.productName;
        if (inlineName) setModalProductName(String(inlineName));
        else if (selectedInspection.productId || selectedInspection.product_id) {
          try {
            const pid = selectedInspection.productId || selectedInspection.product_id;
            const prod = await getProductById(pid);
            const name = prod?.title || prod?.name || prod?.productName;
            if (name) setModalProductName(String(name));
          } catch {}
        }
        // Inspector name
        const inspectorInline = selectedInspection.inspector?.name || selectedInspection.inspectorName;
        if (inspectorInline) setModalInspectorName(String(inspectorInline));
        else if (selectedInspection.inspector && selectedInspection.inspector.userId) setModalInspectorName(String(selectedInspection.inspector.userId));
        else if (selectedInspection.inspectorId) setModalInspectorName(String(selectedInspection.inspectorId));
      } catch {}
    };
    loadFriendlyNames();
  }, [showInspectionDetailsModal, selectedInspection]);

  const refreshSelectedInspection = async () => {
    try {
      if (!selectedInspection) return;
      const details = await inspectionService.getInspection(selectedInspection.id);
      setSelectedInspection(details.inspection);
    } catch {}
  };

  const handleAdminStartInspection = async () => {
    if (!selectedInspection || isStartingInspection) return;
    try {
      setIsStartingInspection(true);
      await inspectionService.startInspection(selectedInspection.id, {});
      await refreshSelectedInspection();
      try { showToast && showToast(tSync('Inspection started successfully'), 'success'); } catch {}
    } catch (e) {
      console.error('Failed to start inspection:', e);
      try { showToast && showToast(tSync('Failed to start inspection'), 'error'); } catch {}
    } finally {
      setIsStartingInspection(false);
    }
  };

  const handleAdminCompleteInspection = async () => {
    if (!selectedInspection || isCompletingInspection) return;
    // Validate items
    const validItems = completeItems.filter(it => it.itemName.trim() && it.description.trim());
    if (validItems.length === 0) {
      try { showToast && showToast(tSync('Add at least one item with name and description'), 'error'); } catch {}
      return;
    }
    try {
      setIsCompletingInspection(true);
      await inspectionService.completeInspection(selectedInspection.id, {
        verificationCode: completeForm.verificationCode,
        handoverSignature: completeForm.handoverSignature,
        items: validItems,
        inspectorNotes: completeForm.inspectorNotes,
        generalNotes: completeForm.generalNotes || completeForm.notes,
        ownerNotes: completeForm.ownerNotes,
        renterNotes: completeForm.renterNotes,
        inspectionLocation: completeForm.inspectionLocation,
        conditionAssessment: {
          overallCondition: completeForm.overallCondition as any,
          conditionScore: Number(completeForm.conditionScore),
          damages: [],
          accessories: [],
          notes: completeForm.notes,
          assessedBy: 'admin',
          assessedAt: new Date().toISOString()
        }
      } as any);
      await refreshSelectedInspection();
      setShowCompleteModal(false);
      try { showToast && showToast(tSync('Inspection completed successfully'), 'success'); } catch {}
    } catch (e) {
      console.error('Failed to complete inspection:', e);
      try { showToast && showToast(tSync('Failed to complete inspection'), 'error'); } catch {}
    } finally {
      setIsCompletingInspection(false);
    }
  };

  const handleOpenAddItem = () => {
    setNewItemForm({ itemName: '', description: '', condition: 'good', repairCost: '', replacementCost: '' });
    setShowAddItemModal(true);
  };

  const handleSubmitAddItem = async () => {
    if (!selectedInspection || isAddingItem) return;
    try {
      setIsAddingItem(true);
      const payload: any = {
        itemName: newItemForm.itemName,
        description: newItemForm.description,
        condition: newItemForm.condition,
      };
      if (newItemForm.repairCost) payload.repairCost = Number(newItemForm.repairCost);
      if (newItemForm.replacementCost) payload.replacementCost = Number(newItemForm.replacementCost);
      await inspectionItemService.addItem(selectedInspection.id, payload);
      try { showToast && showToast(tSync('Item added to inspection'), 'success'); } catch {}
      setShowAddItemModal(false);
      // reload details list
      const details = await inspectionService.getInspection(selectedInspection.id);
      setAdminInspectionDetails(details);
    } catch (e) {
      console.error('Failed to add item:', e);
      try { showToast && showToast(tSync('Failed to add item'), 'error'); } catch {}
    } finally {
      setIsAddingItem(false);
    }
  };

  // Fetch overview data
  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        setLoadingOverview(true);
        setOverviewError(null);
        setLoadingRealtime(true);
        setRealtimeError(null);
        setLoadingPricingStats(true);
        setPricingStatsError(null);
        const token = localStorage.getItem('token');
        // Fetch all overview data in parallel
        const [stats, users, bookings, allUsers, analyticsData, realtimeData, pricingData] = await Promise.all([
          fetchAdminStats(token || undefined),
          fetchRecentUsers(5, token || undefined),
          fetchRecentBookings(5, token || undefined),
          fetchAdminUsers(1, 1000, token || undefined),
          fetchAdminAnalytics(token || undefined),
          fetchAdminRealtimeMetrics(token || undefined),
          fetchPricingStats(token || undefined)
        ]);
        setAdminStats(stats);
        setRecentUsers(users);
        setRecentBookings(bookings);
        setAnalytics(analyticsData?.data || null);
        setAnalyticsError(null);
        setRealtimeMetrics(realtimeData?.data || null);
        setRealtimeError(null);
        setPricingStats(pricingData?.data || null);
        setPricingStatsError(null);
        // Count verified users
        const verifiedCount = allUsers.items.filter((u: AdminUser) => u.kyc_status?.toLowerCase() === 'verified').length;
        setVerifiedUsersCount(verifiedCount);
      } catch (err) {
        console.error('Error fetching overview data:', err);
        setOverviewError(tSync('Failed to load overview data'));
        setAnalyticsError(tSync('Failed to load analytics data'));
        setRealtimeError(tSync('Failed to load real-time metrics'));
        setPricingStatsError(tSync('Failed to load pricing statistics'));
      } finally {
        setLoadingOverview(false);
        setLoadingAnalytics(false);
        setLoadingRealtime(false);
        setLoadingPricingStats(false);
      }
    };
    fetchOverviewData();
  }, []);

  // Fetch inspections and disputes data when inspections tab is active
  useEffect(() => {
    if (activeTab === 'inspections') {
      const fetchInspectionsData = async () => {
        try {
          setLoadingInspections(true);
          setLoadingDisputes(true);
          setLoadingSummary(true);
          setInspectionsError(null);
          setDisputesError(null);
          setSummaryError(null);

          const token = localStorage.getItem('token');

          const [inspectionsData, disputesData, summaryData] = await Promise.all([
            fetchAllInspections(inspectionPage, inspectionsPerPage, token || undefined),
            fetchAllDisputes(disputePage, disputesPerPage, token || undefined),
            fetchInspectionSummary(token || undefined)
          ]);

          setInspections(inspectionsData.data || []);
          // Fix: Extract disputes from the correct nested structure
          // Now disputesData should already be the extracted data from response.data.data.data
          const disputesArray = disputesData?.disputes || [];
          setDisputes(disputesArray);
          setInspectionSummary(summaryData);
        } catch (err) {
          console.error('Error fetching inspections data:', err);
          setInspectionsError(tSync('Failed to load inspections data'));
          setDisputesError(tSync('Failed to load disputes data'));
          setSummaryError(tSync('Failed to load summary data'));
        } finally {
          setLoadingInspections(false);
          setLoadingDisputes(false);
          setLoadingSummary(false);
        }
      };

      fetchInspectionsData();
    }
  }, [activeTab, inspectionPage, disputePage]);

  // Use real rental items data

  // Helper function to get category icon

  // Multi-location and Multi-language data


  // Messaging and Communication data






  const AdminNavigationItem: React.FC<AdminNavigationItemProps> = ({
    icon: Icon,
    label,
    active,
    onClick,
    hasNotification = false
  }) => (
    <button
      onClick={onClick}
      className={`
        group relative w-full flex items-center px-4 py-3 rounded-lg 
        transition-all duration-300 
        ${active
          ? 'bg-my-primary/10 text-my-primary font-semibold shadow-sm'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
      `}
    >
      <Icon
        className={`
          w-5 h-5 mr-3 
          ${active
            ? 'text-my-primary scale-110'
            : 'text-gray-500 group-hover:text-gray-700'}
        `}
      />
      <span className="flex-1 text-left">
        <TranslatedText text={label} />
      </span>

      {hasNotification && (
        <div className="w-2 h-2 bg-red-500 rounded-full ml-auto animate-pulse"></div>
      )}

      {active && (
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 
          w-1.5 h-7 bg-my-primary rounded-l-full"></div>
      )}
    </button>
  );

  useEffect(() => {
    setLoadingProducts(true);
    setProductsError(null);
    const tokenRaw = localStorage.getItem('token');
    const token = tokenRaw || undefined;
    fetchAllProducts(token, true, itemPage, itemLimit, itemStatus, itemSort)
      .then(async (result) => {
        if (result.error) {
          setProductsError(result.error);
          setProducts([]);
          setOwners({});
          return;
        }
        const productList: Product[] = result.data || [];
        setProducts(productList);
        // pagination meta
        if (result.meta) {
          setItemMeta({
            total: Number(result.meta.total ?? productList.length ?? 0),
            totalPages: Number(result.meta.totalPages ?? 1),
            hasNext: Boolean(result.meta.hasNext),
            hasPrev: Boolean(result.meta.hasPrev),
          });
        }
        // Fetch owners for all products
        const ownerIds = Array.from(new Set(productList.map((p) => p.owner_id)));
        const ownerMap: Record<string, Owner> = {};
        await Promise.all(ownerIds.map(async (id: string) => {
          const userResult = await fetchUserById(id, token);
          if (userResult.error || !userResult.data) {
            ownerMap[id] = { id, name: 'Unknown' };
          } else {
            const user = userResult.data;
            const name = user.first_name && user.last_name
              ? `${user.first_name} ${user.last_name}`
              : user.email || 'Unknown';
            ownerMap[id] = {
              id: user.id,
              name,
              ...user
            };
          }
        }));
        setOwners(ownerMap);
      })
      .catch((err) => {
        setProductsError(tSync('Failed to load products. Please try again later.'));
        console.error('Failed to load products:', err);
      })
      .finally(() => setLoadingProducts(false));
  }, [itemPage, itemLimit, itemStatus, itemSort]);

  // Normalized analytics data for charts
  const normalizedBookingTrends = (analytics?.bookingTrends || []).map((trend: any) => ({
    ...trend,
    count: Number(trend.count),
    dateLabel: new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }));
  const normalizedUserGrowth = (analytics?.userGrowth || []).map((growth: any) => ({
    ...growth,
    count: Number(growth.count),
    dateLabel: new Date(growth.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }));
  const normalizedTopProducts = (analytics?.topProducts || []).map((prod: any) => ({
    ...prod,
    booking_count: Number(prod.booking_count),
    // Optionally handle total_revenue if it's numeric
  }));

  // Expose status/sort setters for ItemsManagement dropdowns
  (window as any).__setItemStatus = (val: string) => setItemStatus(val);
  (window as any).__setItemSort = (val: 'newest' | 'oldest') => setItemSort(val);

  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLanguageChange = (lang: string) => {
    setSelectedLanguage(lang);
    try {
      setLanguage?.(lang);
    } catch {}
  };

  const handleMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  const mobileBookingsBadge = useMemo(
    () => recentBookings.filter((booking) => (booking as any)?.status === 'pending').length,
    [recentBookings]
  );

  const adminMobileNavItems = useMemo(
    () => [
      {
        key: 'overview',
        label: tSync('Home'),
        icon: LayoutGrid,
        onPress: () => setActiveTab('overview'),
        active: activeTab === 'overview'
      },
      {
        key: 'bookings',
        label: tSync('Bookings'),
        icon: Calendar,
        onPress: () => setActiveTab('bookings'),
        active: activeTab === 'bookings',
        badge: mobileBookingsBadge
      },
      {
        key: 'users',
        label: tSync('Users'),
        icon: Users,
        onPress: () => setActiveTab('users'),
        active: activeTab === 'users'
      },
      {
        key: 'profile',
        label: tSync('Profile'),
        icon: UserIcon,
        onPress: () => setActiveTab('profile'),
        active: activeTab === 'profile'
      },
      {
        key: 'menu',
        label: tSync('Menu'),
        icon: Menu,
        onPress: () => setIsMobileMenuOpen(true)
      }
    ],
    [activeTab, mobileBookingsBadge, setActiveTab, tSync]
  );

  return (
    <>
      {/* Admin Header - Hidden on mobile, visible on desktop */}
      <div className="hidden md:block sticky top-0 z-[100]">
        <AdminHeader
          selectedLocation={selectedLocation}
          setSelectedLocation={setSelectedLocation}
          selectedLanguage={selectedLanguage}
          setSelectedLanguage={handleLanguageChange}
          onMenuToggle={handleMenuToggle}
        />
      </div>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        {/* Sidebar - Desktop and Mobile */}
        <div className={`fixed left-0 z-[70] xl:z-auto xl:flex-shrink-0 top-0 bottom-[88px] md:top-0 md:bottom-0 xl:top-16 xl:bottom-0 xl:pt-2 ${!isMobileMenuOpen ? 'pointer-events-none xl:pointer-events-auto' : 'pointer-events-auto'}`}>
          <AdminSidebar
            activeTab={activeTab}
            setActiveTab={(tab: any) => { 
              setActiveTab(tab); 
              if (isMobileMenuOpen) handleMenuClose(); 
            }}
            AdminNavigationItem={AdminNavigationItem}
            isMobileMenuOpen={isMobileMenuOpen}
            onMobileMenuClose={handleMenuClose}
            onCollapseChange={setIsSidebarCollapsed}
          />
        </div>

        {/* Main Content */}
        <div className={`flex-1 overflow-y-auto xl:pt-2 w-full pb-28 md:pb-8 xl:transition-all xl:duration-300 ${isSidebarCollapsed ? 'xl:ml-16' : 'xl:ml-72'}`}>
          <div className="px-4 sm:px-8 py-4">
            <div className="space-y-10">
              {(() => {
                switch (activeTab) {
                  case 'overview':
                    return (
                      <>
                        {/* Real-time Metrics Card */}
                        <section className="mb-8">
                          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4"><TranslatedText text="Real-Time Metrics" /></h2>
                          {loadingRealtime ? (
                            <SkeletonMetrics />
                          ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                              {realtimeError ? (
                                <div className="col-span-6 flex items-center justify-center h-20 text-red-500">{realtimeError}</div>
                              ) : realtimeMetrics ? (
                                <>
                                  {/* Active Users */}
                                  <div className="flex flex-col items-center bg-white dark:bg-gray-800 rounded-xl shadow p-4 hover:shadow-lg transition">
                                    <div className="p-2 rounded-full bg-my-primary/10 dark:bg-my-primary/20 mb-2"><Users className="w-6 h-6 text-my-primary" aria-label="Active Users" /></div>
                                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{realtimeMetrics.activeUsers}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1"><TranslatedText text="Active Users" /></div>
                                  </div>
                                  {/* Current Bookings */}
                                  <div className="flex flex-col items-center bg-white dark:bg-gray-800 rounded-xl shadow p-4 hover:shadow-lg transition">
                                    <div className="p-2 rounded-full bg-purple-50 dark:bg-purple-900/20 mb-2"><Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" aria-label="Current Bookings" /></div>
                                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{realtimeMetrics.currentBookings}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1"><TranslatedText text="Current Bookings" /></div>
                                  </div>
                                  {/* System Load */}
                                  <div className="flex flex-col items-center bg-white dark:bg-gray-800 rounded-xl shadow p-4 hover:shadow-lg transition">
                                    <div className="p-2 rounded-full bg-orange-50 dark:bg-orange-900/20 mb-2"><Cpu className="w-6 h-6 text-orange-600 dark:text-orange-400" aria-label="System Load" /></div>
                                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{(realtimeMetrics.systemLoad * 100).toFixed(1)}<span className="text-base font-normal text-gray-400 dark:text-gray-500">%</span></div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1"><TranslatedText text="System Load" /></div>
                                  </div>
                                  {/* Response Time */}
                                  <div className="flex flex-col items-center bg-white dark:bg-gray-800 rounded-xl shadow p-4 hover:shadow-lg transition">
                                    <div className="p-2 rounded-full bg-my-primary/10 dark:bg-my-primary/20 mb-2"><Clock className="w-6 h-6 text-my-primary" aria-label="Response Time" /></div>
                                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{Math.round(realtimeMetrics.responseTime)}<span className="text-base font-normal text-gray-400 dark:text-gray-500"> ms</span></div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1"><TranslatedText text="Response Time" /></div>
                                  </div>
                                  {/* Uptime */}
                                  <div className="flex flex-col items-center bg-white dark:bg-gray-800 rounded-xl shadow p-4 hover:shadow-lg transition">
                                    <div className="p-2 rounded-full bg-green-50 dark:bg-green-900/20 mb-2"><CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" aria-label="Uptime" /></div>
                                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{realtimeMetrics.uptime}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1"><TranslatedText text="Uptime" /></div>
                                  </div>
                                  {/* Timestamp */}
                                  <div className="flex flex-col items-center bg-white dark:bg-gray-800 rounded-xl shadow p-4 hover:shadow-lg transition">
                                    <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 mb-2"><Activity className="w-6 h-6 text-gray-500 dark:text-gray-400" aria-label="Timestamp" /></div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400"><TranslatedText text="Timestamp" /></div>
                                    <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">{formatDate(realtimeMetrics.timestamp)}</div>
                                  </div>
                                </>
                              ) : (
                                <div className="col-span-6 flex items-center justify-center h-20 text-gray-500 dark:text-gray-400"><TranslatedText text="No real-time metrics available." /></div>
                              )}
                            </div>
                          )}
                        </section>
                        {/* End Real-time Metrics Card */}
                        <section className="mb-8">
                          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4"><TranslatedText text="Statistics" /></h2>
                          <div className="mb-6">
                            {loadingOverview ? (
                              <SkeletonAdminStats />
                            ) : (
                              <AdminStatCards adminStats={adminStats} verifiedUsers={verifiedUsersCount} />
                            )}
                          </div>
                        </section>
                        {/* Analytics Section */}
                        <section className="mb-8">
                          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4"><TranslatedText text="Analytics Overview" /></h2>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-8">
                              <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100"><TranslatedText text="Booking Trends" /></h3>
                              <ResponsiveContainer width="100%" height={320}>
                                <AreaChart data={normalizedBookingTrends} margin={{ top: 20, right: 40, left: 0, bottom: 0 }}>
                                  <defs>
                                    <linearGradient id="colorBooking" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#00aaa9" stopOpacity={0.7} />
                                      <stop offset="95%" stopColor="#00aaa9" stopOpacity={0.1} />
                                    </linearGradient>
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                  <XAxis dataKey="dateLabel" stroke="#6b7280" fontSize={14} fontWeight={600} />
                                  <YAxis allowDecimals={false} stroke="#6b7280" fontSize={14} fontWeight={600} />
                                  <Tooltip
                                    contentStyle={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0001', fontSize: 16 }}
                                    labelStyle={{ color: '#00aaa9', fontWeight: 700 }}
                                    itemStyle={{ color: '#374151' }}
                                  />
                                  <Area
                                    type="monotone"
                                    dataKey="count"
                                    stroke="#00aaa9"
                                    strokeWidth={3}
                                    fill="url(#colorBooking)"
                                    activeDot={{ r: 7, fill: '#fff', stroke: '#00aaa9', strokeWidth: 3 }}
                                  />
                                </AreaChart>
                              </ResponsiveContainer>
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-8">
                              <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100"><TranslatedText text="User Growth" /></h3>
                              <ResponsiveContainer width="100%" height={320}>
                                <AreaChart data={normalizedUserGrowth} margin={{ top: 20, right: 40, left: 0, bottom: 0 }}>
                                  <defs>
                                    <linearGradient id="colorUser" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.7} />
                                      <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.1} />
                                    </linearGradient>
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                  <XAxis dataKey="dateLabel" stroke="#6b7280" fontSize={14} fontWeight={600} />
                                  <YAxis allowDecimals={false} stroke="#6b7280" fontSize={14} fontWeight={600} />
                                  <Tooltip
                                    contentStyle={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0001', fontSize: 16 }}
                                    labelStyle={{ color: '#82ca9d', fontWeight: 700 }}
                                    itemStyle={{ color: '#374151' }}
                                  />
                                  <Area
                                    type="monotone"
                                    dataKey="count"
                                    stroke="#82ca9d"
                                    strokeWidth={3}
                                    fill="url(#colorUser)"
                                    activeDot={{ r: 7, fill: '#fff', stroke: '#82ca9d', strokeWidth: 3 }}
                                  />
                                </AreaChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-8">
                              <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100"><TranslatedText text="Top Products" /></h3>
                              <ResponsiveContainer width="100%" height={320}>
                                <BarChart data={normalizedTopProducts} margin={{ top: 20, right: 40, left: 0, bottom: 0 }}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                  <XAxis dataKey="title" stroke="#6b7280" fontSize={14} fontWeight={600} />
                                  <YAxis allowDecimals={false} stroke="#6b7280" fontSize={14} fontWeight={600} />
                                  <Tooltip
                                    contentStyle={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0001', fontSize: 16 }}
                                    labelStyle={{ color: '#00aaa9', fontWeight: 700 }}
                                    itemStyle={{ color: '#374151' }}
                                  />
                                  <Legend />
                                  <Bar dataKey="booking_count" fill="#00aaa9" name={tSync('Bookings')} barSize={32} radius={[8, 8, 0, 0]} />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                            <div>
                              {analytics && <ProductCategoriesChart topProducts={normalizedTopProducts} />}
                            </div>
                          </div>
                        </section>
                        {/* Pricing Statistics */}
                        <section className="mb-8">
                          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4"><TranslatedText text="Pricing Statistics" /></h2>
                          {loadingPricingStats ? (
                            <SkeletonPricingStats />
                          ) : pricingStatsError ? (
                            <div className="flex items-center justify-center h-32 text-red-500">{pricingStatsError}</div>
                          ) : pricingStats ? (
                            <>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {/* Total Price Records */}
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400"><TranslatedText text="Total Price Records" /></p>
                                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{pricingStats.total_price_records}</p>
                                    </div>
                                    <div className="p-3 rounded-full bg-my-primary/10 dark:bg-my-primary/20">
                                      <svg className="w-6 h-6 text-my-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                      </svg>
                                    </div>
                                  </div>
                                </div>

                                {/* Active Price Records */}
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400"><TranslatedText text="Active Price Records" /></p>
                                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{pricingStats.active_price_records}</p>
                                    </div>
                                    <div className="p-3 rounded-full bg-green-50 dark:bg-green-900/20">
                                      <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                    </div>
                                  </div>
                                </div>

                                {/* Countries with Pricing */}
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400"><TranslatedText text="Countries with Pricing" /></p>
                                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{pricingStats.countries_with_pricing}</p>
                                    </div>
                                    <div className="p-3 rounded-full bg-purple-50 dark:bg-purple-900/20">
                                      <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                    </div>
                                  </div>
                                </div>

                                {/* Currencies Supported */}
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400"><TranslatedText text="Currencies Supported" /></p>
                                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{pricingStats.currencies_supported}</p>
                                    </div>
                                    <div className="p-3 rounded-full bg-yellow-50 dark:bg-yellow-900/20">
                                      <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                                      </svg>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Price Distribution Charts */}
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                                {/* Price Range Distribution */}
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                                  <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100"><TranslatedText text="Price Range Distribution" /></h3>
                                  <div className="space-y-3">
                                    {Object.entries(pricingStats.price_distribution?.by_price_range || {}).map(([range, count]) => (
                                      <div key={range} className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">{range}</span>
                                        <div className="flex items-center gap-2">
                                          <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                            <div
                                              className="bg-my-primary h-2 rounded-full"
                                              style={{ width: `${(Number(count) / pricingStats.total_price_records) * 100}%` }}
                                            ></div>
                                          </div>
                                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{String(count)}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Currency Distribution */}
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                                  <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100"><TranslatedText text="Currency Distribution" /></h3>
                                  <div className="space-y-3">
                                    {Object.entries(pricingStats.price_distribution?.by_currency || {}).map(([currency, count]) => (
                                      <div key={currency} className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">{currency}</span>
                                        <div className="flex items-center gap-2">
                                          <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                            <div
                                              className="bg-my-primary h-2 rounded-full"
                                              style={{ width: `${(Number(count) / pricingStats.total_price_records) * 100}%` }}
                                            ></div>
                                          </div>
                                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{String(count)}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* Discount Analysis */}
                              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mt-6">
                                <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100"><TranslatedText text="Discount Analysis" /></h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div className="text-center">
                                    <div className="text-2xl font-bold text-my-primary">{pricingStats.discount_analysis?.products_with_weekly_discount || 0}</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400"><TranslatedText text="Weekly Discounts" /></div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{pricingStats.discount_analysis?.products_with_monthly_discount || 0}</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400"><TranslatedText text="Monthly Discounts" /></div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{pricingStats.discount_analysis?.products_with_bulk_discount || 0}</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400"><TranslatedText text="Bulk Discounts" /></div>
                                  </div>
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="flex items-center justify-center h-32 text-gray-500"><TranslatedText text="No pricing statistics available." /></div>
                          )}
                        </section>
                        {/* Recent Activity */}
                        <section>
                          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4"><TranslatedText text="Recent Activity" /></h2>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Recent Users Card */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
                              <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100"><TranslatedText text="Recent Users" /></h3>
                                <button 
                                  onClick={() => setActiveTab('users')} 
                                  className="text-my-primary text-sm font-medium hover:underline"
                                >
                                  <TranslatedText text="View All" />
                                </button>
                              </div>
                              <div className="space-y-3">
                                {recentUsers.slice(0, 3).map(user => (
                                  <div key={user.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer" onClick={() => setSelectedUser(user)}>
                                    <div className="relative">
                                      {(user as any).profileImageUrl || (user as any).avatar ? (
                                        <img
                                          src={(user as any).profileImageUrl || (user as any).avatar}
                                          alt={user.name}
                                          className="w-10 h-10 rounded-full object-cover"
                                          onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                            const fallback = target.nextElementSibling as HTMLDivElement | null;
                                            if (fallback) fallback.classList.remove('hidden');
                                          }}
                                        />
                                      ) : null}
                                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white bg-gray-200 dark:bg-gray-700 ring-1 ring-gray-300 dark:ring-gray-600 ${(((user as any).profileImageUrl) || ((user as any).avatar)) ? 'hidden' : ''}`}>
                                        <UserIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                                      </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{user.name}</div>
                                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</div>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${user.verified ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                                      {user.verified ? <TranslatedText text="Verified" /> : <TranslatedText text="Pending" />}
                                    </span>
                                  </div>
                                ))}
                              </div>
                              {recentUsers.length === 0 && (
                                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                                  <TranslatedText text="No recent users found" />
                                </div>
                              )}

                              {/* User Detail Modal */}
                              {selectedUser && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
                                    <div className="flex justify-between items-center mb-4">
                                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100"><TranslatedText text="User Details" /></h4>
                                      <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-my-primary text-xl">&times;</button>
                                    </div>
                                    <div className="flex items-center gap-4 mb-4">
                                      <div className="relative">
                                        {(selectedUser as any).profileImageUrl || (selectedUser as any).avatar ? (
                                          <img
                                            src={(selectedUser as any).profileImageUrl || (selectedUser as any).avatar}
                                            alt={selectedUser.name || ''}
                                            className="w-16 h-16 rounded-full object-cover"
                                            onError={(e) => {
                                              const target = e.target as HTMLImageElement;
                                              target.style.display = 'none';
                                              const fallback = target.nextElementSibling as HTMLDivElement | null;
                                              if (fallback) fallback.classList.remove('hidden');
                                            }}
                                          />
                                        ) : null}
                                        <div className={`w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 ring-1 ring-gray-300 dark:ring-gray-600 flex items-center justify-center ${((selectedUser as any).profileImageUrl || (selectedUser as any).avatar) ? 'hidden' : ''}`}>
                                          <UserIcon className="w-7 h-7 text-gray-600 dark:text-gray-300" />
                                        </div>
                                      </div>
                                      <div>
                                        <div className="font-semibold text-lg text-gray-900 dark:text-gray-100">{selectedUser.name || ''}</div>
                                        <div className="text-gray-500 dark:text-gray-400 text-sm">{selectedUser.email || ''}</div>
                                        <div className="mt-2">
                                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${selectedUser.verified ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                                            {selectedUser.verified ? <TranslatedText text="Verified" /> : <TranslatedText text="Pending" />}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400"><TranslatedText text="Joined" />: {selectedUser.joinDate || ''}</div>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Recent Bookings Card */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
                              <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100"><TranslatedText text="Recent Bookings" /></h3>
                                <button 
                                  onClick={() => setActiveTab('bookings')} 
                                  className="text-my-primary text-sm font-medium hover:underline"
                                >
                                  <TranslatedText text="View All" />
                                </button>
                              </div>
                              <div className="space-y-3">
                                {recentBookings.slice(0, 3).map(booking => (
                                  <div key={booking.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer" onClick={() => setSelectedBooking(booking)}>
                                    {booking.itemImage ? (
                                      <img
                                        src={booking.itemImage}
                                        alt={booking.itemName}
                                        className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          target.style.display = 'none';
                                          const fallback = target.nextElementSibling as HTMLDivElement | null;
                                          if (fallback) fallback.classList.remove('hidden');
                                        }}
                                      />
                                    ) : null}
                                    <div className={`w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 ring-1 ring-gray-300 dark:ring-gray-600 flex items-center justify-center ${booking.itemImage ? 'hidden' : ''}`}>
                                      <ImageIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{booking.itemName}</div>
                                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{booking.customerName}</div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${booking.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                                        {booking.status}
                                      </span>
                                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatCurrency(Number(booking.amount) || 0)}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              {recentBookings.length === 0 && (
                                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                                  No recent bookings found
                                </div>
                              )}

                              {/* Booking Detail Modal */}
                              {selectedBooking && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
                                    <div className="flex justify-between items-center mb-4">
                                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Booking Details</h4>
                                      <button onClick={() => setSelectedBooking(null)} className="text-gray-400 hover:text-my-primary text-xl">&times;</button>
                                    </div>
                                    <div className="flex items-center gap-4 mb-4">
                                      <div className="relative">
                                        {selectedBooking.itemImage ? (
                                          <img
                                            src={selectedBooking.itemImage}
                                            alt={selectedBooking.itemName || ''}
                                            className="w-16 h-16 rounded-lg object-cover"
                                            onError={(e) => {
                                              const target = e.target as HTMLImageElement;
                                              target.style.display = 'none';
                                              const fallback = target.nextElementSibling as HTMLDivElement | null;
                                              if (fallback) fallback.classList.remove('hidden');
                                            }}
                                          />
                                        ) : null}
                                        <div className={`w-16 h-16 rounded-lg bg-gray-200 dark:bg-gray-700 ring-1 ring-gray-300 dark:ring-gray-600 flex items-center justify-center ${selectedBooking.itemImage ? 'hidden' : ''}`}>
                                          <ImageIcon className="w-7 h-7 text-gray-600 dark:text-gray-300" />
                                        </div>
                                      </div>
                                      <div>
                                        <div className="font-semibold text-lg text-gray-900 dark:text-gray-100">{selectedBooking.itemName || ''}</div>
                                        <div className="text-gray-500 dark:text-gray-400 text-sm">{selectedBooking.customerName || ''}</div>
                                        <div className="mt-2">
                                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${selectedBooking.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                                            {selectedBooking.status}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                      <div>Amount: {formatCurrency(Number(selectedBooking.amount) || 0)}</div>
                                      <div>Dates: {selectedBooking.startDate || ''} - {selectedBooking.endDate || ''}</div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          {/* Recent Transactions Card */}
                          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-8 mt-8">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Recent Transactions</h3>
                              <button 
                                onClick={() => setActiveTab('transactions')} 
                                className="text-my-primary text-sm font-medium hover:underline"
                              >
                                View All
                              </button>
                            </div>
                            <div className="overflow-x-auto">
                              <RecentTransactionsList limit={5} />
                            </div>
                          </div>
                        </section>
                      </>
                    );
                  case 'items':
                    return (
                      <ItemsManagement
                        products={products}
                        owners={owners}
                        loading={loadingProducts}
                        itemCategories={itemCategories}
                        itemFilter={itemFilter}
                        setItemFilter={setItemFilter}
                        selectedLocation={selectedLocation}
                        selectedItems={selectedItems}
                        setSelectedItems={setSelectedItems}
                        Button={Button}
                        error={productsError || undefined}
                        availabilityFilter={availabilityFilter}
                        setAvailabilityFilter={setAvailabilityFilter}
                        page={itemPage}
                        limit={itemLimit}
                        total={itemMeta.total}
                        totalPages={itemMeta.totalPages}
                        hasNext={itemMeta.hasNext}
                        hasPrev={itemMeta.hasPrev}
                        onPageChange={setItemPage}
                        onLimitChange={(l) => { setItemLimit(l); setItemPage(1); }}
                      />
                    );
                  case 'users':
                    return <UserManagement Button={Button} />;
                  case 'bookings':
                    return <BookingsManagement />;
                  case 'transactions':
                    return <TransactionsManagement />;
                  case 'categories':
                    return <CategoriesManagement />;
                  case 'countries':
                    return <CountriesManagement />;
                  case 'paymentMethods':
                    return <PaymentMethodsManagement />;
                  case 'paymentProviders':
                    return <PaymentProvidersManagement />;
                  case 'pricing':
                    return <PricingManagement />;
                  case 'insuranceProviders':
                    return <InsuranceProvidersManagement />;
                  case 'categoryRegulations':
                    return <CategoryRegulationsManagement />;
                  case 'administrativeDivisions':
                    return <AdministrativeDivisionsManagement />;
                  case 'reports':
                    return <ReportsManagement />;
                  case 'locations':
                    return <LocationsManagement />;
                  case 'languages':
                    return <LanguagesManagement />;
                  case 'finances':
                    return <FinancesManagement />;
                  case 'messaging':
                    return <MessagingManagement />;
                  case 'notifications':
                    return <NotificationsManagement />;
                  case 'moderation':
                    return <ModerationDashboardPage />;
                  case 'ai-analytics':
                    return <AIAnalyticsDashboard token={localStorage.getItem('token') || undefined} />;
                  case 'inspections':
                    return (
                      <div className="space-y-6">
                        <InspectionsManagement
                          inspections={inspections}
                          disputes={disputes}
                          inspectionSummary={inspectionSummary}
                          loadingInspections={loadingInspections}
                          loadingDisputes={loadingDisputes}
                          loadingSummary={loadingSummary}
                          onResolveDispute={async (inspectionId: string, disputeId: string, data: any) => {
                            try {
                              const token = localStorage.getItem('token');
                              await resolveDispute(inspectionId, disputeId, data, token || undefined);
                              // Refresh disputes data
                              const disputesData = await fetchAllDisputes(disputePage, disputesPerPage, token || undefined);
                              const disputesArray = disputesData?.disputes || [];
                              setDisputes(disputesArray);
                              showToast('Dispute resolved successfully', 'success');
                            } catch (error) {
                              console.error('Failed to resolve dispute:', error);
                              showToast('Failed to resolve dispute', 'error');
                            }
                          }}
                          onViewInspection={(inspection: any) => {
                            setSelectedInspection(inspection);
                            setShowInspectionDetailsModal(true);
                          }}
                          onViewDispute={(dispute: any) => {
                            setSelectedDispute(dispute);
                            setShowDisputeDetailsModal(true);
                          }}
                        />
                      </div>
                    );
                  case 'risk-management':
                    return <RiskManagementPage />;
                  case 'handover-return':
                    return <HandoverReturnPage />;
                  case 'admin-settings':
                    return <SettingsPage />;
                  case 'profile':
                    return <AdminProfilePage />;
                  default:
                    return null;
                }
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Inspection Details Modal */}
      {showInspectionDetailsModal && selectedInspection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowInspectionDetailsModal(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Inspection Details</h3>
              <button
                onClick={() => setShowInspectionDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Basic Information</h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">ID:</span>
                    <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">{selectedInspection.id}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Product:</span>
                    <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">{modalProductName || selectedInspection.product?.name || selectedInspection.productName || 'N/A'}</span>
                    {selectedInspection.productId && (
                      <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">(ID: {selectedInspection.productId})</span>
                    )}
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Status:</span>
                    <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${selectedInspection.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                      selectedInspection.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                        selectedInspection.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                      {selectedInspection.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Type:</span>
                    <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">{selectedInspection.inspectionType?.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Location:</span>
                    <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">{selectedInspection.location || selectedInspection.inspectionLocation || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Inspector:</span>
                    <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">{modalInspectorName || (selectedInspection.inspector && (selectedInspection.inspector.userId || selectedInspection.inspector.name)) || selectedInspection.inspectorId || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Timing</h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Scheduled:</span>
                    <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">
                      {selectedInspection.scheduledAt ? formatDate(selectedInspection.scheduledAt) : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Started:</span>
                    <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">
                      {selectedInspection.startedAt ? formatDate(selectedInspection.startedAt) : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed:</span>
                    <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">
                      {selectedInspection.completedAt ? formatDate(selectedInspection.completedAt) : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {(selectedInspection.notes || selectedInspection.generalNotes) && (
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Notes</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">{selectedInspection.notes || selectedInspection.generalNotes}</p>
              </div>
            )}

            {/* Participants */}
            {adminInspectionDetails?.participants && (
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Participants</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Inspector:</span>
                    <span className="ml-2 text-gray-900 dark:text-gray-100">{adminInspectionDetails.participants.inspector?.name || modalInspectorName || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Renter:</span>
                    <span className="ml-2 text-gray-900 dark:text-gray-100">{adminInspectionDetails.participants.renter?.name || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Owner:</span>
                    <span className="ml-2 text-gray-900 dark:text-gray-100">{adminInspectionDetails.participants.owner?.name || 'N/A'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Items Preview */}
            {Array.isArray(adminInspectionDetails?.items) && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">Inspection Items</h4>
                  <button
                    onClick={handleOpenAddItem}
                    className="inline-flex items-center px-3 py-1.5 rounded-md text-sm bg-teal-600 text-white hover:bg-teal-700"
                  >
                    Add Item
                  </button>
                </div>
                {adminInspectionDetails.items.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No items added.</p>
                ) : (
                  <div className="space-y-2">
                    {adminInspectionDetails.items.slice(0, 5).map((it: any) => (
                      <div key={it.id} className="border border-gray-200 dark:border-gray-700 rounded-md p-3">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{it.itemName || it.name || 'Item'}</div>
                        {it.description && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 break-words">{it.description}</div>
                        )}
                      </div>
                    ))}
                    {adminInspectionDetails.items.length > 5 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">and {adminInspectionDetails.items.length - 5} more…</div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-2">
                <button
                  onClick={handleAdminStartInspection}
                  disabled={selectedInspection.status !== 'pending' || isStartingInspection}
                  className={`px-4 py-2 rounded-md text-sm ${selectedInspection.status === 'pending' && !isStartingInspection ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                >
                  {isStartingInspection ? 'Starting…' : 'Start Inspection'}
                </button>
                <button
                  onClick={() => setShowCompleteModal(true)}
                  disabled={selectedInspection.status !== 'in_progress'}
                  className={`px-4 py-2 rounded-md text-sm ${selectedInspection.status === 'in_progress' && !isCompletingInspection ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                >
                  Complete Inspection
                </button>
              </div>

              {Array.isArray(disputes) && disputes.some(d => d.inspectionId === selectedInspection.id) && (
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Related disputes: {disputes.filter(d => d.inspectionId === selectedInspection.id).length}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowInspectionDetailsModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dispute Details Modal */}
      {showDisputeDetailsModal && selectedDispute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowDisputeDetailsModal(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Dispute Details</h3>
              <button
                onClick={() => setShowDisputeDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Dispute Information</h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">ID:</span>
                    <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">{selectedDispute.id}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Type:</span>
                    <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">{selectedDispute.disputeType?.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Status:</span>
                    <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${selectedDispute.status === 'resolved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                      selectedDispute.status === 'under_review' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                        selectedDispute.status === 'open' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                      {selectedDispute.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Inspection ID:</span>
                    <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">{selectedDispute.inspectionId}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Timing</h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Created:</span>
                    <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">
                      {selectedDispute.createdAt ? formatDate(selectedDispute.createdAt) : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Updated:</span>
                    <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">
                      {selectedDispute.updatedAt ? formatDate(selectedDispute.updatedAt) : 'N/A'}
                    </span>
                  </div>
                  {selectedDispute.resolvedAt && (
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Resolved:</span>
                      <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">
                        {formatDate(selectedDispute.resolvedAt)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Reason</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300">{selectedDispute.reason}</p>
            </div>

            {selectedDispute.evidence && (
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Evidence</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">{selectedDispute.evidence}</p>
              </div>
            )}

            {selectedDispute.resolutionNotes && (
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Resolution Notes</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">{selectedDispute.resolutionNotes}</p>
              </div>
            )}

            {selectedDispute.agreedAmount && (
              <div className="mt-6">
                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Agreed Amount</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">${selectedDispute.agreedAmount}</p>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDisputeDetailsModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin New Listing Modal */}
      {showNewListingModalAdmin && (
        <NewListingModal
          open={showNewListingModalAdmin}
          onClose={() => setShowNewListingModalAdmin(false)}
          onSubmit={handleAdminNewListingSubmit}
          form={newListingForm as any}
          setForm={setNewListingForm as any}
          isSubmitting={newListingSubmitting}
          handleInputChange={handleNewListingInputChange}
        />
      )}

      {/* Add Item Modal */}
      {showAddItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowAddItemModal(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Add Inspection Item</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Item name</label>
                <input
                  value={newItemForm.itemName}
                  onChange={(e) => setNewItemForm({ ...newItemForm, itemName: e.target.value })}
                  className="mt-1 w-full px-3 py-2 rounded-md border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="e.g., Front bumper"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                <textarea
                  value={newItemForm.description}
                  onChange={(e) => setNewItemForm({ ...newItemForm, description: e.target.value })}
                  className="mt-1 w-full px-3 py-2 rounded-md border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Condition</label>
                <select
                  value={newItemForm.condition}
                  onChange={(e) => setNewItemForm({ ...newItemForm, condition: e.target.value })}
                  className="mt-1 w-full px-3 py-2 rounded-md border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                  <option value="damaged">Damaged</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Repair cost</label>
                  <input
                    type="number"
                    min="0"
                    value={newItemForm.repairCost}
                    onChange={(e) => setNewItemForm({ ...newItemForm, repairCost: e.target.value })}
                    className="mt-1 w-full px-3 py-2 rounded-md border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Replacement cost</label>
                  <input
                    type="number"
                    min="0"
                    value={newItemForm.replacementCost}
                    onChange={(e) => setNewItemForm({ ...newItemForm, replacementCost: e.target.value })}
                    className="mt-1 w-full px-3 py-2 rounded-md border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowAddItemModal(false)}
                className="px-4 py-2 rounded-md border text-sm text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitAddItem}
                disabled={isAddingItem || !newItemForm.itemName.trim()}
                className={`px-4 py-2 rounded-md text-sm ${isAddingItem ? 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300' : 'bg-teal-600 hover:bg-teal-700 text-white'}`}
              >
                {isAddingItem ? 'Adding…' : 'Add Item'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complete Inspection Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowCompleteModal(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Complete Inspection</h3>
            <div className="space-y-4">
              {/* Items Editor */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Items</label>
                  <button
                    onClick={() => setCompleteItems([...completeItems, { itemName: '', condition: 'good', description: '' }])}
                    className="px-2 py-1 rounded-md text-xs bg-teal-600 text-white hover:bg-teal-700"
                  >
                    Add Row
                  </button>
                </div>
                <div className="space-y-3">
                  {completeItems.map((it, idx) => (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input
                        value={it.itemName}
                        onChange={(e) => {
                          const next = [...completeItems];
                          next[idx] = { ...next[idx], itemName: e.target.value };
                          setCompleteItems(next);
                        }}
                        placeholder="Item name"
                        className="px-3 py-2 rounded-md border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                      <select
                        value={it.condition}
                        onChange={(e) => {
                          const next = [...completeItems];
                          next[idx] = { ...next[idx], condition: e.target.value };
                          setCompleteItems(next);
                        }}
                        className="px-3 py-2 rounded-md border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value="excellent">Excellent</option>
                        <option value="good">Good</option>
                        <option value="fair">Fair</option>
                        <option value="poor">Poor</option>
                        <option value="damaged">Damaged</option>
                      </select>
                      <input
                        value={it.description}
                        onChange={(e) => {
                          const next = [...completeItems];
                          next[idx] = { ...next[idx], description: e.target.value };
                          setCompleteItems(next);
                        }}
                        placeholder="Description (required)"
                        className="px-3 py-2 rounded-md border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Required/Optional fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Verification code</label>
                  <input
                    value={completeForm.verificationCode}
                    onChange={(e) => setCompleteForm({ ...completeForm, verificationCode: e.target.value })}
                    className="mt-1 w-full px-3 py-2 rounded-md border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Enter code"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Handover signature</label>
                  <input
                    value={completeForm.handoverSignature}
                    onChange={(e) => setCompleteForm({ ...completeForm, handoverSignature: e.target.value })}
                    className="mt-1 w-full px-3 py-2 rounded-md border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Signer or signature ref"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Overall condition</label>
                  <select
                    value={completeForm.overallCondition}
                    onChange={(e) => setCompleteForm({ ...completeForm, overallCondition: e.target.value })}
                    className="mt-1 w-full px-3 py-2 rounded-md border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                    <option value="damaged">Damaged</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Condition score (1–5)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={completeForm.conditionScore}
                    onChange={(e) => setCompleteForm({ ...completeForm, conditionScore: Number(e.target.value) })}
                    className="mt-1 w-full px-3 py-2 rounded-md border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Inspector notes</label>
                  <textarea
                    value={completeForm.inspectorNotes}
                    onChange={(e) => setCompleteForm({ ...completeForm, inspectorNotes: e.target.value })}
                    className="mt-1 w-full px-3 py-2 rounded-md border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">General notes</label>
                  <textarea
                    value={completeForm.generalNotes}
                    onChange={(e) => setCompleteForm({ ...completeForm, generalNotes: e.target.value })}
                    className="mt-1 w-full px-3 py-2 rounded-md border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    rows={2}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Owner notes</label>
                  <textarea
                    value={completeForm.ownerNotes}
                    onChange={(e) => setCompleteForm({ ...completeForm, ownerNotes: e.target.value })}
                    className="mt-1 w-full px-3 py-2 rounded-md border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Renter notes</label>
                  <textarea
                    value={completeForm.renterNotes}
                    onChange={(e) => setCompleteForm({ ...completeForm, renterNotes: e.target.value })}
                    className="mt-1 w-full px-3 py-2 rounded-md border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    rows={2}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Inspection location</label>
                <input
                  value={completeForm.inspectionLocation}
                  onChange={(e) => setCompleteForm({ ...completeForm, inspectionLocation: e.target.value })}
                  className="mt-1 w-full px-3 py-2 rounded-md border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Warehouse A - Bay 3"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowCompleteModal(false)}
                className="px-4 py-2 rounded-md border text-sm text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleAdminCompleteInspection}
                disabled={isCompletingInspection || !completeForm.verificationCode.trim() || completeItems.every(i => !i.itemName.trim() || !i.description.trim())}
                className={`px-4 py-2 rounded-md text-sm ${isCompletingInspection ? 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300' : 'bg-green-600 hover:bg-green-700 text-white'}`}
              >
                {isCompletingInspection ? 'Completing…' : 'Complete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <DashboardMobileNav items={adminMobileNavItems} />
    </>
  );
};

export default AdminDashboardPage;
