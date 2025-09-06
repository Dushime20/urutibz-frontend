import React, { useState, useEffect } from 'react';
import { Star, XCircle, TrendingUp, Package, CheckCircle } from 'lucide-react';
import VerificationBanner from '../../components/verification/VerificationBanner';
import {
  createProduct,
  createProductPricing,
  createProductImage,
  getMyProducts,
  getProductImagesByProductId,
  fetchUserBookings,
  getProductById,
  fetchProductImages,
  fetchDashboardStats,
  fetchRecentBookings,
  fetchRecentTransactions,
  fetchUserTransactions,
  fetchUserReviews,
  fetchReviewById,
  fetchReviewByBookingId,
  fetchUserProfile
} from './service/api';
// Notifications handled in MyAccountHeader
import MyAccountHeader from './components/MyAccountHeader';
import MyAccountSidebar from './components/MyAccountSidebar';
import OverviewSection from './components/OverviewSection';
import SkeletonMyAccountOverview from '../../components/ui/SkeletonMyAccountOverview';
import BookingsSection from './components/BookingsSection';
import ListingsSection from './components/ListingsSection';
import WalletSection from './components/WalletSection';
import InspectionsSection from './components/InspectionsSection';
import ReviewsSection from './components/ReviewsSection';
import SettingsSection from './components/SettingsSection';
import MessagesSection from './components/MessagesSection';
import RiskAssessmentForm from '../risk-management/components/RiskAssessmentForm';
import ComplianceChecker from '../risk-management/components/ComplianceChecker';
import ProductRiskProfile from '../risk-management/components/ProductRiskProfile';
import HandoverReturnPage from '../handover-return/HandoverReturnPage';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import CreateInspectionModal from '../../components/inspections/CreateInspectionModal';
import { inspectionService } from '../../services/inspectionService';
import { useNavigate } from 'react-router-dom';
import NewListingModal from './models/NewListingModal';
import ProductDetailModal from './models/ProductDetailModal';
import EditProductModal from './models/EditProductModal';
import { TwoFactorManagement } from '../../components/2fa';
import { useTwoFactor } from '../../hooks/useTwoFactor';
import { disputeService } from '../../services/inspectionService';
import { Inspection, DisputeType } from '../../types/inspection';

// TypeScript interfaces for component props
import type { FormState } from './types';

// Navigation tabs moved to MyAccountNavTabs



const DashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'listings' | 'wallet' | 'inspections' | 'reviews' | 'messages' | 'settings' | 'risk-assessment' | 'handover-return'>('overview');
  const [riskAssessmentTab, setRiskAssessmentTab] = useState<'assessment' | 'compliance' | 'profile'>('assessment');
  const { showToast } = useToast();
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  const [realUser, setRealUser] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<FormState>({
    title: '',
    slug: '',
    description: '',
    category_id: '',
    condition: 'new',
    brand: '',
    model: '',
    year_manufactured: '',
    address_line: '',
    delivery_fee: '',
    // Pricing fields - moved from product to separate pricing system
    price_per_hour: '',
    price_per_day: '',
    price_per_week: '',
    price_per_month: '',
    security_deposit: '',
    currency: 'USD',
    market_adjustment_factor: '1.0',
    weekly_discount_percentage: '0.1',
    monthly_discount_percentage: '0.2',
    bulk_discount_threshold: '5',
    bulk_discount_percentage: '0.05',
    dynamic_pricing_enabled: false,
    peak_season_multiplier: '1.2',
    off_season_multiplier: '0.8',
    // Product fields
    pickup_methods: [],
    country_id: '',
    specifications: { spec1: '' }, // start with one empty specification
    features: [],
    included_accessories: [],
    images: [],
    alt_text: '',
    sort_order: '1',
    isPrimary: 'true',
    product_id: '',
    location: { latitude: '', longitude: '' },
  });

  // Prefill location with user's geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setForm((prev) => ({
            ...prev,
            location: {
              latitude: position.coords.latitude.toString(),
              longitude: position.coords.longitude.toString(),
            },
          }));
        },
        () => {
          // Optionally handle error (user denied, etc.)
        }
      );
    }
  }, []);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [myListings, setMyListings] = useState<any[]>([]);
  const [productImages, setProductImages] = useState<{ [productId: string]: any[] }>({});
  const [loadingListings, setLoadingListings] = useState(false);
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [selectedInspectionId, setSelectedInspectionId] = useState<string | null>(null);
  const [disputeForm, setDisputeForm] = useState({
    disputeType: DisputeType.DAMAGE_ASSESSMENT,
    reason: '',
    evidence: '',
    photos: [] as File[]
  });
  const [showProductDetail, setShowProductDetail] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editProductId, setEditProductId] = useState<string | null>(null);
  const [userBookings, setUserBookings] = useState<any[]>([]);
  const [bookingProducts, setBookingProducts] = useState<{ [bookingId: string]: any }>({});
  const [bookingImages, setBookingImages] = useState<{ [bookingId: string]: any[] }>({});
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    activeBookings: 0,
    totalEarnings: 0,
    totalTransactions: 0,
    activeInspections: 0,
    totalInspections: 0,
    completedInspections: 0
  });
  const [recentDashboardBookings, setRecentDashboardBookings] = useState<any[]>([]);
  const [recentDashboardTransactions, setRecentDashboardTransactions] = useState<any[]>([]);
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [userReviews, setUserReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [showReviewDetail, setShowReviewDetail] = useState(false);
  const [loadingReviewDetail, setLoadingReviewDetail] = useState(false);
  const [bookingReviews, setBookingReviews] = useState<{ [bookingId: string]: any }>({});
  const [loadingBookingReviews, setLoadingBookingReviews] = useState<{ [bookingId: string]: boolean }>({});
  const [bookingReviewCounts, setBookingReviewCounts] = useState<{ [bookingId: string]: number }>({});
  const [userTransactions, setUserTransactions] = useState<any[]>([]);
  const [loadingWallet, setLoadingWallet] = useState(false);
  // Notifications moved to MyAccountHeader

  // 2FA state
  const [show2FAModal, setShow2FAModal] = useState(false);
  const { status: twoFactorStatus } = useTwoFactor();

  const [userInspections, setUserInspections] = useState<Inspection[]>([]);
  const [inspectionsLoading, setInspectionsLoading] = useState(false);
  // Disputes state moved out; not used in current UI

  // Fetch real user profile data
  useEffect(() => {
    const fetchRealUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          return;
        }

        const userProfileData = await fetchUserProfile(token);

        if (userProfileData.success && userProfileData.data) {


          // Transform backend user data to match frontend interface
          const transformedUser = {
            id: userProfileData.data.id,
            name: (() => {
              // Construct name from firstName and lastName (actual API format)
              const firstName = userProfileData.data.firstName || '';
              const lastName = userProfileData.data.lastName || '';
              const fullName = `${firstName} ${lastName}`.trim();

              // Return full name if available, otherwise fallback to email
              return fullName.length > 0 ? fullName : (userProfileData.data.email || 'User');
            })(),
            email: userProfileData.data.email,
            avatar: userProfileData.data.profileImageUrl || userProfileData.data.profile_image || null,
            location: userProfileData.data.address || 'Location not set',
            verified: userProfileData.data.kyc_status === 'verified',
            rating: parseFloat(userProfileData.data.rating) || 0,
            totalRentals: parseInt(userProfileData.data.total_rentals) || 0,
            totalEarnings: parseFloat(userProfileData.data.total_earnings) || 0,
            hostLevel: userProfileData.data.kyc_status === 'verified' ? 'Verified Host' : 'New Host',
            joinedDate: userProfileData.data.createdAt,
            phone: userProfileData.data.phone,
            // Normalize date of birth field across APIs
            dateOfBirth: userProfileData.data.date_of_birth || userProfileData.data.dateOfBirth,
            date_of_birth: userProfileData.data.date_of_birth || userProfileData.data.dateOfBirth,
            role: userProfileData.data.role || 'user',
            status: userProfileData.data.status || 'active',
            kyc_status: userProfileData.data.kyc_status,
            // Store raw API data for settings form
            firstName: userProfileData.data.firstName,
            lastName: userProfileData.data.lastName,
            emailVerified: userProfileData.data.emailVerified,
            phoneVerified: userProfileData.data.phoneVerified,
            verifications: userProfileData.data.verifications || [],
            kycProgress: userProfileData.data.kycProgress || {},
            // Verification status based on available data
            verification: {
              isProfileComplete: !!(userProfileData.data.firstName && userProfileData.data.lastName),
              isEmailVerified: userProfileData.data.emailVerified === true,
              isPhoneVerified: !!userProfileData.data.phone, // If phone exists, it's verified
              isIdVerified: userProfileData.data.kyc_status === 'verified',
              isAddressVerified: !!userProfileData.data.address,
              isFullyVerified: userProfileData.data.kyc_status === 'verified',
              verificationStep: userProfileData.data.kyc_status === 'verified' ? 'complete' : 'profile'
            }
          };

          setRealUser(transformedUser);
        } else {
          // Fallback to auth user data if API fails
          if (authUser) {
            setRealUser({
              ...authUser,
              avatar: authUser.avatar || null,
              totalRentals: 0,
              totalEarnings: 0,
              hostLevel: authUser.verification?.isFullyVerified ? 'Verified Host' : 'New Host',
              rating: 0
            });
          }
        }
              } catch (error) {
          // Fallback to auth user if there's an error
        if (authUser) {
          setRealUser({
            ...authUser,
            avatar: authUser.avatar || null,
            totalRentals: 0,
            totalEarnings: 0,
            hostLevel: authUser.verification?.isFullyVerified ? 'Verified Host' : 'New Host',
            rating: 0
          });
        }
      }
    };

    fetchRealUserData();
  }, [authUser]);

  // Add new useEffect for dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (activeTab !== 'overview') return;

      setLoadingDashboard(true);
      try {
        const token = localStorage.getItem('token') || '';

        // Fetch dashboard stats
        const stats = await fetchDashboardStats(token);
        setDashboardStats({
          activeBookings: stats.activeBookings || 0,
          totalEarnings: stats.totalEarnings || 0,
          totalTransactions: stats.totalTransactions || 0,
          activeInspections: 0,
          totalInspections: 0,
          completedInspections: 0
        });

        // Fetch recent bookings
        const bookings = await fetchRecentBookings(token);
        const bookingsWithDetails = await Promise.all(
          bookings.map(async (booking: any) => {
            const product = await getProductById(booking.product_id);
            const images = await fetchProductImages(booking.product_id, token ?? undefined);
            return {
              ...booking,
              product,
              images: images.data
            };
          })
        );
        setRecentDashboardBookings(bookingsWithDetails);

        // Fetch recent transactions (user-specific)
        try {
          const tokenPayload = JSON.parse(atob(token.split('.')[1]));
          const userId = tokenPayload.sub || tokenPayload.userId || tokenPayload.id;

          if (userId) {
            const userTransactionData = await fetchUserTransactions(userId, token);
            if (userTransactionData.success) {
              // Get only the most recent 5 transactions for overview
              setRecentDashboardTransactions(userTransactionData.data.slice(0, 5));
            } else {
              // Fallback to general recent transactions
              const transactions = await fetchRecentTransactions(token);
              setRecentDashboardTransactions(transactions);
            }
          } else {
            // Fallback if no user ID found
            const transactions = await fetchRecentTransactions(token);
            setRecentDashboardTransactions(transactions);
          }
        } catch (tokenError) {
          // Fallback to general recent transactions
          const transactions = await fetchRecentTransactions(token);
          setRecentDashboardTransactions(transactions);
        }

      } catch (error) {
        // Dashboard data fetch failed
      } finally {
        setLoadingDashboard(false);
      }
    };

    fetchDashboardData();
  }, [activeTab]);

  // Add useEffect for fetching user transactions when wallet tab is active
  useEffect(() => {
    const fetchWalletData = async () => {
      if (activeTab !== 'wallet') return;

      setLoadingWallet(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          return;
        }

        // Decode token to get user ID (or get it from your auth context)
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        const userId = tokenPayload.sub || tokenPayload.userId || tokenPayload.id;

        if (!userId) {
          return;
        }

        const transactionData = await fetchUserTransactions(userId, token);

        if (transactionData.success) {
          setUserTransactions(transactionData.data);
        } else {
          showToast('Failed to load transactions', 'error');
        }
      } catch (error) {
        showToast('Failed to load wallet data', 'error');
      } finally {
        setLoadingWallet(false);
      }
    };

    fetchWalletData();
  }, [activeTab, showToast]);

  useEffect(() => {
    const fetchListings = async () => {
      setLoadingListings(true);
      try {
        const res = await getMyProducts();
        setMyListings(res || []);
        // Fetch images for only the first 5 products, with a delay between requests
        for (const product of (res || []).slice(0, 5)) {
          try {
            await new Promise(resolve => setTimeout(resolve, 200));
            const imgRes = await getProductImagesByProductId(product.id);
            setProductImages(prev => ({ ...prev, [product.id]: imgRes || [] }));
          } catch (imgErr) {
            setProductImages(prev => ({ ...prev, [product.id]: [] }));
          }
        }
      } catch (err) {
        if (
          typeof err === 'object' &&
          err !== null &&
          'response' in err &&
          typeof (err as any).response === 'object' &&
          (err as any).response !== null &&
          'status' in (err as any).response &&
          (err as any).response.status === 429
        ) {

          alert('You are making requests too quickly. Please wait a moment and try again.');

        } else {

          alert('An error occurred. Please try again later.');
        }
        throw err;

        setMyListings([]);
      } finally {
        setLoadingListings(false);
      }
    };
    fetchListings();
  }, []);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoadingBookings(true);
      try {
        const token = localStorage.getItem('token');
        const bookingsRes = await fetchUserBookings(token);
        const bookings = bookingsRes.data || [];
        setUserBookings(bookings);

        // Fetch product details and images for each booking
        for (const booking of bookings) {
          const product = await getProductById(booking.product_id);
          setBookingProducts(prev => ({ ...prev, [booking.id]: product }));
          const imagesRes = await fetchProductImages(booking.product_id, token ?? undefined);
          setBookingImages(prev => ({ ...prev, [booking.id]: imagesRes.data || [] }));

          // Also check for reviews for this booking
          try {
            const reviewResult = await fetchReviewByBookingId(booking.id, token ?? undefined);
            if (reviewResult.review) {
              setBookingReviews(prev => ({ ...prev, [booking.id]: reviewResult.review }));
              setBookingReviewCounts(prev => ({ ...prev, [booking.id]: reviewResult.count }));
            }
          } catch (reviewError) {
            // Review fetch failed for this booking
          }
        }
      } catch (err) {
        setUserBookings([]);
      } finally {
        setLoadingBookings(false);
      }
    };
    fetchBookings();
  }, []);

  useEffect(() => {
    const fetchReviews = async () => {
      if (activeTab !== 'reviews') return;

      setLoadingReviews(true);
      try {
        const token = localStorage.getItem('token');
        // For now, using a hardcoded user ID - in a real app, you'd get this from user context
        const userId = '7f102034-45c2-460a-bc89-a7525cf32938'; // This should come from user context
        const reviews = await fetchUserReviews(userId, token ?? undefined);
        setUserReviews(reviews);
      } catch (error) {
        setUserReviews([]);
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchReviews();
  }, [activeTab]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'file' && e.target instanceof HTMLInputElement) {
      const input = e.target as HTMLInputElement;
      if (name === 'images') {
        setForm((prev) => ({ ...prev, images: input.files ? Array.from(input.files) : [] }));
      }
    } else if (name.startsWith('specifications.')) {
      const specKey = name.split('.')[1];
      setForm((prev) => ({ ...prev, specifications: { ...prev.specifications, [specKey]: value } }));
    } else if (name === 'pickup_methods') {
      setForm((prev) => ({ ...prev, pickup_methods: Array.from((e.target as HTMLSelectElement).selectedOptions, (option) => option.value) }));
    } else if (name === 'title') {
      // Generate slug from title
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      setForm((prev) => ({ ...prev, title: value, slug }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Validate pickup_methods
    if (!form.pickup_methods || form.pickup_methods.length === 0) {
      showToast('Please select at least one pickup method.', 'error');
      setIsSubmitting(false);
      return;
    }
    try {
      // 1. Create product (without pricing data)
      const productPayload: any = {
        title: form.title,
        slug: form.slug,
        description: form.description,
        category_id: form.category_id,
        condition: form.condition,
        brand: form.brand || undefined,
        model: form.model || undefined,
        year_manufactured: form.year_manufactured ? Number(form.year_manufactured) : undefined,
        address_line: form.address_line || undefined,
        delivery_fee: form.delivery_fee !== undefined && form.delivery_fee !== ''
          ? Number(form.delivery_fee)
          : undefined,
        included_accessories: Array.isArray(form.included_accessories)
          ? form.included_accessories.filter(a => typeof a === 'string' && a.trim() !== '')
          : undefined,
        // Compatibility key for backends expecting camelCase
        includedAccessories: Array.isArray(form.included_accessories)
          ? form.included_accessories.filter(a => typeof a === 'string' && a.trim() !== '')
          : undefined,
        // Ensure backend NOT NULL constraints are satisfied
        // base_price_per_day: parseFloat(form.price_per_day) || 0,
        // base_currency: form.currency,
        pickup_methods: form.pickup_methods,
        country_id: form.country_id,
        specifications: form.specifications,
        location: form.location, // include location in payload
        features: Array.isArray(form.features)
          ? form.features.filter(f => typeof f === 'string' && f.trim() !== '')
          : [],
      };
      let productResponse;
      let productId;
      try {
        productResponse = await createProduct(productPayload);
      } catch (err: any) {
        const errMsg = err?.response?.data?.message || err?.message || '';
        const duplicateSlug = /slug|duplicate key/i.test(errMsg);
        if (duplicateSlug) {
          const uniqueSuffix = Math.random().toString(36).slice(2, 7);
          const newSlug = `${form.slug}-${uniqueSuffix}`;
          productPayload.slug = newSlug;
          setForm((prev) => ({ ...prev, slug: newSlug }));
          productResponse = await createProduct(productPayload);
        } else {
          throw err;
        }
      }
      productId = productResponse?.data?.id || productResponse?.data?.data?.id || productResponse?.id;
      setForm((prev) => ({ ...prev, product_id: productId }));

      // 2. Create product pricing
      if (productId) {
        // Validate required fields for pricing
        const daily = parseFloat(form.price_per_day);
        if (!form.country_id || !form.currency || Number.isNaN(daily) || daily <= 0) {
          showToast('Provide country, currency, and a daily price greater than 0.', 'error');
          throw new Error('Missing or invalid pricing fields');
        }
        const pricingPayload: any = {
          product_id: String(productId),
          productId: String(productId), // compatibility
          country_id: String(form.country_id),
          countryId: String(form.country_id), // compatibility
          currency: form.currency,
          price_per_day: daily,
          pricePerDay: daily, // compatibility
          price_per_hour: parseFloat(form.price_per_hour) || 0,
          pricePerHour: parseFloat(form.price_per_hour) || 0,
          price_per_week: parseFloat(form.price_per_week) || 0,
          pricePerWeek: parseFloat(form.price_per_week) || 0,
          price_per_month: parseFloat(form.price_per_month) || 0,
          pricePerMonth: parseFloat(form.price_per_month) || 0,
          security_deposit: parseFloat(form.security_deposit) || 0,
          securityDeposit: parseFloat(form.security_deposit) || 0,
          market_adjustment_factor: parseFloat(form.market_adjustment_factor) || 1.0,
          marketAdjustmentFactor: parseFloat(form.market_adjustment_factor) || 1.0,
          weekly_discount_percentage: parseFloat(form.weekly_discount_percentage) || 0,
          weeklyDiscountPercentage: parseFloat(form.weekly_discount_percentage) || 0,
          monthly_discount_percentage: parseFloat(form.monthly_discount_percentage) || 0,
          monthlyDiscountPercentage: parseFloat(form.monthly_discount_percentage) || 0,
          bulk_discount_threshold: parseInt(form.bulk_discount_threshold as any) || 0,
          bulkDiscountThreshold: parseInt(form.bulk_discount_threshold as any) || 0,
          bulk_discount_percentage: parseFloat(form.bulk_discount_percentage) || 0,
          bulkDiscountPercentage: parseFloat(form.bulk_discount_percentage) || 0,
          dynamic_pricing_enabled: Boolean(form.dynamic_pricing_enabled),
          dynamicPricingEnabled: Boolean(form.dynamic_pricing_enabled),
          peak_season_multiplier: parseFloat(form.peak_season_multiplier) || 1.0,
          peakSeasonMultiplier: parseFloat(form.peak_season_multiplier) || 1.0,
          off_season_multiplier: parseFloat(form.off_season_multiplier) || 1.0,
          offSeasonMultiplier: parseFloat(form.off_season_multiplier) || 1.0,
          is_active: true,
          isActive: true,
        };

        try {
          await createProductPricing(pricingPayload);
        } catch (err: any) {
          const msg = err?.response?.data?.message || err?.message || 'Failed to create product pricing';
          showToast(msg.includes('product_id') || msg.includes('country') ? 'Please ensure product and country are set for pricing.' : msg, 'error');


          throw err;
        }
      }

      // 3. Create product images (multiple)
      if (form.images && form.images.length > 0 && productId) {
        const imagePayload = {
          images: form.images, // pass the array
          product_id: productId,
          alt_text: form.alt_text,
          sort_order: form.sort_order,
          isPrimary: 'true', // or handle primary logic as needed
        };
        await createProductImage(imagePayload);
      }
      showToast('Listing created successfully!', 'success');
      setForm({
        title: '',
        slug: '',
        description: '',
        category_id: '',
        condition: 'new',
        brand: '',
        model: '',
        year_manufactured: '',
        address_line: '',
        delivery_fee: '',
        // Pricing fields - moved from product to separate pricing system
        price_per_hour: '',
        price_per_day: '',
        price_per_week: '',
        price_per_month: '',
        security_deposit: '',
        currency: 'USD',
        market_adjustment_factor: '1.0',
        weekly_discount_percentage: '0.1',
        monthly_discount_percentage: '0.2',
        bulk_discount_threshold: '5',
        bulk_discount_percentage: '0.05',
        dynamic_pricing_enabled: false,
        peak_season_multiplier: '1.2',
        off_season_multiplier: '0.8',
        // Product fields
        pickup_methods: [],
        country_id: '',
        specifications: { spec1: '' },
        features: [],
        included_accessories: [],
        images: [],
        alt_text: '',
        sort_order: '1',
        isPrimary: 'true',
        product_id: '',
        location: { latitude: '', longitude: '' },
      });
      setShowModal(false);
      // Optionally refresh listings here
    } catch (err) {
      showToast('Failed to create listing. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenModal = () => {
    setShowModal(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setForm((prev) => ({
            ...prev,
            location: {
              latitude: position.coords.latitude.toString(),
              longitude: position.coords.longitude.toString(),
            },
          }));
        }
      );
    }
  };


  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleViewReviewDetail = async (reviewId: string) => {
    setLoadingReviewDetail(true);
    try {
      const token = localStorage.getItem('token');
      const reviewDetail = await fetchReviewById(reviewId, token ?? undefined);
      setSelectedReview(reviewDetail);
      setShowReviewDetail(true);
    } catch (error) {
      showToast('Failed to load review details', 'error');
    } finally {
      setLoadingReviewDetail(false);
    }
  };

  const handleViewBookingReview = async (bookingId: string) => {
    setLoadingBookingReviews(prev => ({ ...prev, [bookingId]: true }));
    try {
      const token = localStorage.getItem('token');
      const result = await fetchReviewByBookingId(bookingId, token ?? undefined);
      setBookingReviews(prev => ({ ...prev, [bookingId]: result.review }));
      setBookingReviewCounts(prev => ({ ...prev, [bookingId]: result.count }));
    } catch (error) {
      showToast('Failed to load booking review', 'error');
    } finally {
      setLoadingBookingReviews(prev => ({ ...prev, [bookingId]: false }));
    }
  };

  const handleOpenDisputeModal = (inspectionId: string) => {
    setSelectedInspectionId(inspectionId);
    setShowDisputeModal(true);
  };

  const handleRaiseDispute = async () => {
    if (!selectedInspectionId || !disputeForm.reason.trim()) {
      showToast('Please provide a reason for the dispute', 'error');
      return;
    }

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('disputeType', disputeForm.disputeType);
      formData.append('reason', disputeForm.reason);
      formData.append('evidence', disputeForm.evidence);

      // Append photos if any
      disputeForm.photos.forEach((photo) => {
        formData.append('photos', photo);
      });

      await disputeService.raiseDispute(selectedInspectionId, formData as any);

      // Reset form and close modal
      setDisputeForm({
        disputeType: DisputeType.DAMAGE_ASSESSMENT,
        reason: '',
        evidence: '',
        photos: []
      });
      setShowDisputeModal(false);
      setSelectedInspectionId(null);
      showToast('Dispute raised successfully', 'success');
    } catch (error) {
      showToast('Failed to raise dispute', 'error');
    }
  };

  // Fetch user's inspections
  const loadUserInspections = async () => {
    if (!authUser?.id) return;

    setInspectionsLoading(true);
    try {
      const response = await inspectionService.getInspectionsByOwner(authUser.id);
      setUserInspections(response.data || []);

      // Update dashboard stats with inspection data
      const totalInspections = response.total || 0;
      const activeInspections = (response.data || [])?.filter((inspection: any) =>
        inspection.status === 'pending' || inspection.status === 'in_progress'
      ).length || 0;
      const completedInspections = (response.data || [])?.filter((inspection: any) =>
        inspection.status === 'completed'
      ).length || 0;

      setDashboardStats(prev => ({
        ...prev,
        activeInspections,
        totalInspections,
        completedInspections
      }));
    } catch (error) {
      showToast('Failed to load inspections', 'error');
      // Ensure userInspections is always an array even on error
      setUserInspections([]);
      // Reset inspection stats on error
      setDashboardStats(prev => ({
        ...prev,
        activeInspections: 0,
        totalInspections: 0,
        completedInspections: 0
      }));
    } finally {
      setInspectionsLoading(false);
    }
  };

  // Fetch user's disputes
  const fetchUserDisputes = async () => {
    if (!authUser?.id) return;

    try {
      await disputeService.getAllDisputes();
    } catch (error) {
      showToast('Failed to load disputes', 'error');
    }
  };

  // Load inspections when inspections tab is active
  useEffect(() => {
    if (activeTab === 'inspections' && authUser?.id) {
      loadUserInspections();
      fetchUserDisputes();
    }
  }, [activeTab, authUser?.id]);

  // Initialize userInspections as empty array when component mounts
  useEffect(() => {
    if (!userInspections) {
      setUserInspections([]);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-my-primary/10 to-indigo-50/30">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-50  backdrop-blur-xl border-b border-gray-200 bg-white ">
        <div className="flex h-16">
          {/* Sidebar Space */}
         
          {/* Header Content - full width */}
          <div className="flex-1 flex items-center  w-full">
            <MyAccountHeader />
          </div>
        </div>
      </div>

      {/* Main Layout with Sidebar */}
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="flex-shrink-0">
          <MyAccountSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Verification Banner */}
        <div className="mb-8">
          <VerificationBanner />
        </div>

        {/* Main Content Area - Full Width */}
        <div className="w-full">
          {activeTab === 'overview' && (
            loadingDashboard ? (
              <SkeletonMyAccountOverview />
            ) : (
              <OverviewSection
                dashboardStats={dashboardStats}
                recentDashboardBookings={recentDashboardBookings}
                recentDashboardTransactions={recentDashboardTransactions}
              />
            )
          )}

          {activeTab === 'bookings' && (
            <BookingsSection
              loadingBookings={loadingBookings}
              userBookings={userBookings}
              navigateToBrowse={() => navigate('/browse')}
              bookingProducts={bookingProducts}
              bookingImages={bookingImages}
              bookingReviews={bookingReviews}
              loadingBookingReviews={loadingBookingReviews}
              bookingReviewCounts={bookingReviewCounts}
              onViewBookingReview={handleViewBookingReview}
            />
          )}

          {activeTab === 'listings' && (
            <ListingsSection
              loading={loadingListings}
              myListings={myListings}
              productImages={productImages}
              onRequestInspection={() => setShowInspectionModal(true)}
              onAddListing={handleOpenModal}
              onOpenListing={(id) => { setSelectedProductId(id); setShowProductDetail(true); }}
              openMenuId={openMenuId}
              setOpenMenuId={setOpenMenuId}
              setSelectedProductId={setSelectedProductId}
              setShowProductDetail={setShowProductDetail}
              setEditProductId={setEditProductId}
              setShowEditModal={setShowEditModal}
            />
          )}



          {/* Request Inspection Modal */}
          {showInspectionModal && (
            <CreateInspectionModal
              isOpen={showInspectionModal}
              onClose={() => setShowInspectionModal(false)}
              onSubmit={async (data) => {
                try {
                  await inspectionService.createInspection(data as any);
                  setShowInspectionModal(false);
                  showToast('Inspection requested successfully!', 'success');
                } catch (e: any) {
                  showToast(e?.message || 'Failed to request inspection', 'error');
                }
              }}
            />
          )}

          {/* Dispute Modal */}
          {showDisputeModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/40" onClick={() => setShowDisputeModal(false)} />
              <div className="relative bg-white rounded-lg shadow-lg w-full max-w-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Raise Dispute</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dispute Type *</label>
                    <select
                      value={disputeForm.disputeType}
                      onChange={(e) => setDisputeForm(prev => ({ ...prev, disputeType: e.target.value as DisputeType }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value={DisputeType.DAMAGE_ASSESSMENT}>Damage Assessment</option>
                      <option value={DisputeType.COST_DISPUTE}>Cost Dispute</option>
                      <option value={DisputeType.PROCEDURE_VIOLATION}>Procedure Violation</option>
                      <option value={DisputeType.OTHER}>Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
                    <textarea
                      value={disputeForm.reason}
                      onChange={(e) => setDisputeForm(prev => ({ ...prev, reason: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Describe the reason for this dispute..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Evidence</label>
                    <textarea
                      value={disputeForm.evidence}
                      onChange={(e) => setDisputeForm(prev => ({ ...prev, evidence: e.target.value }))}
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
                        setDisputeForm(prev => ({ ...prev, photos: files }));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                    />
                    <p className="mt-1 text-sm text-gray-500">Upload photos to support your dispute (optional)</p>
                    {disputeForm.photos.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">Selected files:</p>
                        <ul className="mt-1 text-sm text-gray-500">
                          {disputeForm.photos.map((file, index) => (
                            <li key={index}>{file.name}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => setShowDisputeModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleRaiseDispute}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Raise Dispute
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'wallet' && (
            <WalletSection
              dashboardStats={dashboardStats}
              loadingWallet={loadingWallet}
              userTransactions={userTransactions}
              onViewAll={() => setActiveTab('wallet')}
            />
          )}
          {activeTab === 'inspections' && (
            <InspectionsSection
              loading={inspectionsLoading}
              userInspections={userInspections}
              onViewInspection={(id: string) => navigate(`/inspections/${id}`, { state: { from: 'my-account' } })}
              onRequestInspection={() => setShowInspectionModal(true)}
            />
          )}
          {activeTab === 'settings' && (
            <SettingsSection
              twoFactorStatus={twoFactorStatus}
              show2FAModal={show2FAModal}
              setShow2FAModal={setShow2FAModal}
              realUser={realUser}
              setRealUser={setRealUser}
            />
          )}

          {activeTab === 'reviews' && (
            <ReviewsSection
              loadingReviews={loadingReviews}
              userReviews={userReviews}
              onViewReviewDetail={handleViewReviewDetail}
              loadingReviewDetail={loadingReviewDetail}
            />
          )}

          {activeTab === 'messages' && (
            <MessagesSection />
          )}

          {activeTab === 'risk-assessment' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Risk Assessment</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Evaluate risk for product-renter combinations and check compliance
                    </p>
                  </div>
                </div>

                {/* Risk Assessment Tabs */}
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8">
                    {[
                      { id: 'assessment', label: 'Risk Assessment', icon: TrendingUp },
                      { id: 'compliance', label: 'Compliance Check', icon: CheckCircle },
                      { id: 'profile', label: 'Product Profile', icon: Package }
                    ].map((tab) => {
                      const Icon = tab.icon;
                      const isActive = riskAssessmentTab === tab.id;
                      
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setRiskAssessmentTab(tab.id as any)}
                          className={`group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                            isActive
                              ? 'border-teal-500 text-teal-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <Icon
                            className={`-ml-0.5 mr-2 h-5 w-5 ${
                              isActive ? 'text-teal-500' : 'text-gray-400 group-hover:text-gray-500'
                            }`}
                          />
                          {tab.label}
                        </button>
                      );
                    })}
                  </nav>
                </div>
              </div>

              {/* Tab Content */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                {riskAssessmentTab === 'assessment' && <RiskAssessmentForm />}
                {riskAssessmentTab === 'compliance' && <ComplianceChecker />}
                {riskAssessmentTab === 'profile' && <ProductRiskProfile />}
              </div>
            </div>
          )}

          {activeTab === 'handover-return' && (
            <div className="space-y-6">
              <HandoverReturnPage />
            </div>
          )}
          </div>
        </div>
      </div>
      </div>

      {/* Modal for new listing */}
      <NewListingModal
        open={showModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        form={form}
        setForm={setForm}
        isSubmitting={isSubmitting}
        handleInputChange={handleInputChange}
      />
      <ProductDetailModal
        open={showProductDetail}
        onClose={() => setShowProductDetail(false)}
        productId={selectedProductId || ''}
        onEdit={() => {
          setEditProductId(selectedProductId);
          setShowEditModal(true);
          setShowProductDetail(false);
        }}
      />
      <EditProductModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        productId={editProductId || ''}
      />

      {/* Review Detail Modal */}

      {showReviewDetail && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Review Details</h3>
                <button
                  onClick={() => {
                    setShowReviewDetail(false);
                    setSelectedReview(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Review Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <Star className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{selectedReview.title}</h4>
                      <p className="text-sm text-gray-500">
                        {new Date(selectedReview.createdAt).toLocaleDateString()} at{' '}
                        {new Date(selectedReview.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, index) => (
                      <Star
                        key={index}
                        className={`w-5 h-5 ${index < selectedReview.overallRating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                          }`}
                      />
                    ))}
                    <span className="ml-2 text-lg font-medium text-gray-900">
                      {selectedReview.overallRating}/5
                    </span>
                  </div>
                </div>

                {/* Review Comment */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h5 className="font-medium text-gray-900 mb-2">Review Comment</h5>
                  <p className="text-gray-700">{selectedReview.comment}</p>
                </div>

                {/* Detailed Ratings */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <div className="text-2xl font-bold text-gray-900">{selectedReview.communicationRating}</div>
                    <div className="text-sm text-gray-500">Communication</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <div className="text-2xl font-bold text-gray-900">{selectedReview.conditionRating}</div>
                    <div className="text-sm text-gray-500">Condition</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <div className="text-2xl font-bold text-gray-900">{selectedReview.valueRating}</div>
                    <div className="text-sm text-gray-500">Value</div>
                  </div>
                  {selectedReview.deliveryRating && (
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                      <div className="text-2xl font-bold text-gray-900">{selectedReview.deliveryRating}</div>
                      <div className="text-sm text-gray-500">Delivery</div>
                    </div>
                  )}
                </div>

                {/* AI Analysis */}
                {selectedReview.aiSentimentScore && (
                  <div className="bg-my-primary/10 rounded-xl p-4">
                    <h5 className="font-medium text-gray-900 mb-3">AI Analysis</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-my-primary">
                          {parseFloat(selectedReview.aiSentimentScore).toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">Sentiment Score</div>
                      </div>
                      {selectedReview.aiToxicityScore && (
                        <div className="text-center">
                          <div className="text-lg font-semibold text-orange-600">
                            {parseFloat(selectedReview.aiToxicityScore).toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500">Toxicity Score</div>
                        </div>
                      )}
                      {selectedReview.aiHelpfulnessScore && (
                        <div className="text-center">
                          <div className="text-lg font-semibold text-green-600">
                            {parseFloat(selectedReview.aiHelpfulnessScore).toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500">Helpfulness Score</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Response Section */}
                {selectedReview.response && (
                  <div className="bg-green-50 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-bold">R</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">Your Response</span>
                      {selectedReview.responseDate && (
                        <span className="text-xs text-gray-500">
                          {new Date(selectedReview.responseDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700">{selectedReview.response}</p>
                  </div>
                )}

                {/* Metadata */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Review ID:</span>
                      <p className="font-mono text-xs text-gray-700">{selectedReview.id}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Booking ID:</span>
                      <p className="font-mono text-xs text-gray-700">{selectedReview.bookingId}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Reviewer ID:</span>
                      <p className="font-mono text-xs text-gray-700">{selectedReview.reviewerId}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Status:</span>
                      <span className={`ml-1 px-2 py-1 rounded-full text-xs ${selectedReview.moderationStatus === 'approved'
                        ? 'bg-success-100 text-success-700'
                        : selectedReview.moderationStatus === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                        }`}>
                        {selectedReview.moderationStatus}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2FA Management Modal */}
      {show2FAModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Two-Factor Authentication</h2>
                <button
                  onClick={() => setShow2FAModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              <TwoFactorManagement
                onStatusChange={(status) => {
                  // Update local state when 2FA status changes
                  if (status.enabled !== twoFactorStatus.enabled) {
                    // Refresh the 2FA status
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DashboardPage;