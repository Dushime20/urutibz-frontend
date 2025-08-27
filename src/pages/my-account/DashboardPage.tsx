import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign, Star,
  Shield, MessageCircle, TrendingUp,
  BarChart3, Package, Settings,
  Calendar, 
  Car, Wallet, BookOpen, ArrowUpRight,
  Bell, Search, 
  MoreHorizontal, User, 
  Lock, Eye, 
  Edit2, Trash2, 
  Mail, Phone, MapPin,
  CreditCard, Languages, Moon, Sun,
  XCircle
} from 'lucide-react';
import { Button } from '../../components/ui/DesignSystem';
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
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import CreateInspectionModal from '../../components/inspections/CreateInspectionModal';
import { inspectionService } from '../../services/inspectionService';
import { useNavigate } from 'react-router-dom';
import NewListingModal from './models/NewListingModal';
import ProfileSettingsForm from './components/ProfileSettingsForm';
import ProductDetailModal from './models/ProductDetailModal';
import EditProductModal from './models/EditProductModal';
import { TwoFactorManagement } from '../../components/2fa';
import { useTwoFactor } from '../../hooks/useTwoFactor';
import { disputeService } from '../../services/inspectionService';
import { Inspection, DisputeType } from '../../types/inspection';

// TypeScript interfaces for component props
interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: boolean;
  color: string;
  bgColor: string;
}

interface NavigationItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  onClick: () => void;
  hasNotification?: boolean;
}

type FormState = {
  title: string;
  slug: string;
  description: string;
  category_id: string;
  condition: string;
  // New product meta
  brand?: string;
  model?: string;
  year_manufactured?: string;
  address_line?: string;
  delivery_fee?: string;
  // Pricing fields - moved from product to separate pricing system
  price_per_hour: string;
  price_per_day: string;
  price_per_week: string;
  price_per_month: string;
  security_deposit: string;
  currency: string;
  market_adjustment_factor: string;
  weekly_discount_percentage: string;
  monthly_discount_percentage: string;
  bulk_discount_threshold: string;
  bulk_discount_percentage: string;
  dynamic_pricing_enabled: boolean;
  peak_season_multiplier: string;
  off_season_multiplier: string;
  // Product fields
  pickup_methods: string[];
  country_id: string;
  specifications: { [key: string]: string };
  features?: string[];
  included_accessories?: string[];
  images: File[];
  alt_text: string;
  sort_order: string;
  isPrimary: string;
  product_id: string;
  location: { latitude: string; longitude: string };
};

// Add this utility function at the top or in a utils file

// Helper function to truncate text intelligently

// Helper component for user avatar display

const DashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'listings' | 'wallet' | 'inspections' | 'reviews' | 'settings'>('overview');
  const { showToast } = useToast();
  const { user: authUser, logout } = useAuth();
  const navigate = useNavigate();
  const [realUser, setRealUser] = useState<any>(null);
  const [userLoading, setUserLoading] = useState(true);
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
  
  // 2FA state
  const [show2FAModal, setShow2FAModal] = useState(false);
  const { status: twoFactorStatus } = useTwoFactor();

  const [userInspections, setUserInspections] = useState<Inspection[]>([]);
  const [inspectionsLoading, setInspectionsLoading] = useState(false);
  const [userDisputes, setUserDisputes] = useState<any[]>([]);
  const [disputesLoading, setDisputesLoading] = useState(false);

  // Fetch real user profile data
  useEffect(() => {
    const fetchRealUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setUserLoading(false);
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
        console.error('Error fetching user data:', error);
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
      } finally {
        setUserLoading(false);
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
          console.error('Error parsing token for transactions:', tokenError);
          // Fallback to general recent transactions
          const transactions = await fetchRecentTransactions(token);
          setRecentDashboardTransactions(transactions);
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
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
          console.error('No token found');
          return;
        }

        // Decode token to get user ID (or get it from your auth context)
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        const userId = tokenPayload.sub || tokenPayload.userId || tokenPayload.id;
        
        if (!userId) {
          console.error('No user ID found in token');
          return;
        }

        const transactionData = await fetchUserTransactions(userId, token);
        
        if (transactionData.success) {
          setUserTransactions(transactionData.data);
        } else {
          console.error('Failed to fetch user transactions:', transactionData.error);
          showToast('Failed to load transactions', 'error');
        }
      } catch (error) {
        console.error('Error fetching wallet data:', error);
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
            console.error(`Error fetching review for booking ${booking.id}:`, reviewError);
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
        console.error('Error fetching reviews:', error);
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
        // Debug: log what we're sending to product-prices
        try {
          // Lazy import to avoid top-level import churn
          const { logger } = await import('../../lib/logger');
          logger.group('[DEBUG] Creating product pricing payload');
          logger.debug('payload:', pricingPayload);
          logger.groupEnd();
        } catch {}
        try {
          await createProductPricing(pricingPayload);
          console.log('product pricingPayload',productPayload)
        } catch (err: any) {
          const msg = err?.response?.data?.message || err?.message || 'Failed to create product pricing';
          // Debug error with payload and server response
          try {
            const { logger } = await import('../../lib/logger');
            logger.group('[DEBUG] Product pricing creation failed');
            logger.error('error response:', err?.response?.data.data || err?.message);
            logger.debug('sent payload:', pricingPayload);
            logger.groupEnd();
            logger.log(
              msg.includes('country')
                ? 'Please ensure product and country are set for pricing.'
                : msg,
              'error'
            );
          } catch {}
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

  // Use real user data with fallback

  // Mock data for dashboard sections




  const StatCard: React.FC<StatCardProps> = ({ icon: Icon, title, value, subtitle, trend, color, bgColor }) => (
    <div className="group relative bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-2xl ${bgColor}`}>
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
          {trend && <TrendingUp className="w-5 h-5 text-success-500" />}
        </div>
        <div className="space-y-1">
          <div className="text-2xl font-bold text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{title}</div>
          {subtitle && (
            <div className="flex items-center text-xs text-success-600 font-medium">
              <ArrowUpRight className="w-3 h-3 mr-1" />
              {subtitle}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const NavigationItem: React.FC<NavigationItemProps> = ({ icon: Icon, label, active, onClick, hasNotification = false }) => (
    <button
      onClick={onClick}
      className={`group relative w-full flex items-center px-4 py-3.5 rounded-2xl font-medium transition-all duration-300 ${active
        ? ' bg-gray-200'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        }`}
    >
      <Icon className={`w-5 h-5 mr-3 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-105'}`} />
      <span className="flex-1 text-left truncate">{label}</span>
      {hasNotification && (
        <div className="w-2 h-2 bg-red-500 rounded-full ml-auto animate-pulse"></div>
      )}
    
    </button>
  );

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
      console.error('Error fetching review detail:', error);
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
      console.error('Error fetching booking review:', error);
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
      console.error('Failed to raise dispute:', error);
      showToast('Failed to raise dispute', 'error');
    }
  };

  // Fetch user's inspections
  const fetchUserInspections = async () => {
    if (!authUser?.id) return;
    
    setInspectionsLoading(true);
    try {
      const response = await inspectionService.getInspectionsByOwner(authUser.id);
      setUserInspections(response.data || []);
      
      // Update dashboard stats with inspection data
      const totalInspections = response.total || 0;
      const activeInspections = (response.data || [])?.filter((inspection: Inspection) => 
        inspection.status === 'pending' || inspection.status === 'in_progress'
      ).length || 0;
      const completedInspections = (response.data || [])?.filter((inspection: Inspection) => 
        inspection.status === 'completed'
      ).length || 0;
      
      setDashboardStats(prev => ({
        ...prev,
        activeInspections,
        totalInspections,
        completedInspections
      }));
    } catch (error) {
      console.error('Error fetching user inspections:', error);
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
    
    setDisputesLoading(true);
    try {
      console.log('Fetching user disputes...');
      const response = await disputeService.getAllDisputes();
      console.log('Disputes response:', response);
      console.log('Disputes array:', response.disputes);
      setUserDisputes(response.disputes || []);
    } catch (error) {
      console.error('Error fetching user disputes:', error);
      showToast('Failed to load disputes', 'error');
      setUserDisputes([]);
    } finally {
      setDisputesLoading(false);
    }
  };

  // Load inspections when inspections tab is active
  useEffect(() => {
    if (activeTab === 'inspections' && authUser?.id) {
      fetchUserInspections();
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
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900">My Account</h1>
              <button
                onClick={() => navigate('/browse')}
                className="px-3 py-1.5 rounded-xl border text-gray-700 hover:bg-gray-50"
              >
                Browse Items
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all duration-200 w-64"
                />
              </div>
              <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Bell className="w-5 h-5" />
                <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
              </button>
              <button
                onClick={() => { logout(); navigate('/'); }}
                className="px-3 py-1.5 rounded-xl border text-gray-700 hover:bg-gray-50 whitespace-nowrap"
              >
                Logout
              </button>
            </div>
          </div>
          
          {/* Horizontal Navigation Menu */}
          <div className="flex items-center space-x-2 py-4 overflow-x-auto">
            <NavigationItem
              icon={BarChart3}
              label="Overview"
              active={activeTab === 'overview'}
              onClick={() => setActiveTab('overview')}
            />
            <NavigationItem
              icon={Calendar}
              label="My Bookings"
              active={activeTab === 'bookings'}
              onClick={() => setActiveTab('bookings')}
            />
            <NavigationItem
              icon={Car}
              label="My Listings"
              active={activeTab === 'listings'}
              onClick={() => setActiveTab('listings')}
            />
            <NavigationItem
              icon={Wallet}
              label="Wallet"
              active={activeTab === 'wallet'}
              onClick={() => setActiveTab('wallet')}
            />
                         <NavigationItem
               icon={Shield}
               label="Inspections"
               active={activeTab === 'inspections'}
               onClick={() => setActiveTab('inspections')}
             />
            <NavigationItem
              icon={BookOpen}
              label="Reviews"
              active={activeTab === 'reviews'}
              onClick={() => setActiveTab('reviews')}
            />
            <NavigationItem
              icon={Settings}
              label="Settings"
              active={activeTab === 'settings'}
              onClick={() => setActiveTab('settings')}
            />
            <Link
              to="/dashboard/messages"
              className="flex items-center px-4 py-3.5 rounded-2xl font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200 whitespace-nowrap"
            >
              <MessageCircle className="w-5 h-5 mr-3" />
              <span>Messages</span>
              <div className="w-2 h-2 bg-red-500 rounded-full ml-2 animate-pulse"></div>
            </Link>
            
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Verification Banner */}
        <div className="mb-8">
          <VerificationBanner />
        </div>

        {/* Main Content Area - Full Width */}
        <div className="w-full">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {loadingDashboard ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : (
                <>
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                      icon={Package}
                      title="Active Bookings"
                      value={dashboardStats.activeBookings}
                      subtitle="View all →"
                      trend={true}
                      color="text-primary-600"
                      bgColor="bg-primary-50"
                    />
                    <StatCard
                      icon={Wallet}
                      title="Total Earnings"
                      value={`${dashboardStats.totalEarnings.toLocaleString()}`}
                      subtitle="Available"
                      trend={true}
                      color="text-success-600"
                      bgColor="bg-success-50"
                    />
                    <StatCard
                      icon={DollarSign}
                      title="Total Transactions"
                      value={`${dashboardStats.totalTransactions.toLocaleString()}`}
                      subtitle="+12% this month"
                      trend={true}
                      color="text-purple-600"
                      bgColor="bg-purple-50"
                    />
                                         <StatCard
                       icon={Shield}
                       title="Active Inspections"
                       value={dashboardStats.activeInspections}
                       subtitle="In progress"
                       trend={true}
                       color="text-emerald-600"
                       bgColor="bg-emerald-50"
                     />
                  </div>

                  {/* Content Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Bookings */}
                    <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Recent Bookings</h3>
                        <Link
                          to="#"
                          className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center group"
                        >
                          View all
                          <ArrowUpRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </Link>
                      </div>
                      <div className="space-y-4">
                        {recentDashboardBookings.length === 0 ? (
                          <div className="text-center py-8">
                            <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-500 text-sm">No recent bookings found</p>
                          </div>
                        ) : (
                          recentDashboardBookings.map((booking) => (
                            <div key={booking.id} className="group flex items-center space-x-4 p-4 rounded-2xl bg-gray-50/50 hover:bg-gray-50 transition-all duration-200">
                              <div className="relative">
                                <img
                                  src={booking.images?.[0]?.image_url || '/assets/img/placeholder-image.png'}
                                  alt={booking.product?.title || 'Product'}
                                  className="w-16 h-12 rounded-xl object-cover"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-xl transition-colors duration-200"></div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-900 truncate">{booking.product?.title || 'Product'}</h4>
                                <p className="text-sm text-gray-500">{new Date(booking.start_date).toLocaleDateString()}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-gray-900">{booking.product?.base_price_per_day != null && booking.product?.base_currency ? `$${booking.product.base_price_per_day}` : ''}</p>
                                <span className={`inline-flex px-2 py-1 rounded-lg text-xs font-medium ${
                                  booking.status === 'pending' ? 'bg-my-primary/10 text-my-primary' : 'bg-success-100 text-success-700'
                                }`}>
                                  {booking.status}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Recent Transactions */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Transactions</h3>
                        <button
                          onClick={() => setActiveTab('wallet')}
                          className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center group"
                        >
                          View all
                          <ArrowUpRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </button>
                      </div>
                      <div className="space-y-3">
                        {recentDashboardTransactions.length === 0 ? (
                          <div className="text-center py-8">
                            <DollarSign className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-500 text-sm">No transactions yet</p>
                          </div>
                        ) : (
                          recentDashboardTransactions.slice(0, 3).map((transaction) => (
                            <div key={transaction.id} className="p-4 rounded-2xl bg-gray-50/50 hover:bg-gray-100/50 transition-colors duration-200 border border-gray-100/50">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center space-x-3">
                                  {/* <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center flex-shrink-0">
                                    <DollarSign className="w-4 h-4 text-primary-600" />
                                  </div> */}
                                  <div>
                                    <p className="text-sm font-semibold text-gray-900 capitalize">
                                      {transaction.transaction_type?.replace(/_/g, ' ') || 'Payment'}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {new Date(transaction.created_at).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric'
                                      })}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-sm text-gray-900">
                                    {parseFloat(transaction.amount).toLocaleString()} {transaction.currency}
                                  </p>
                                  <span className={`inline-block px-2 py-1 rounded-lg text-xs font-medium ${
                                    transaction.status === 'completed' 
                                      ? 'bg-green-100 text-green-700' 
                                      : transaction.status === 'pending'
                                      ? 'bg-yellow-100 text-yellow-700'
                                      : 'bg-red-100 text-red-700'
                                  }`}>
                                    {transaction.status}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center justify-between text-xs text-gray-400">
                                <span>via {transaction.provider}</span>
                                <span>
                                  {new Date(transaction.created_at).toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">My Bookings</h3>
                <div className="flex items-center space-x-2">
                  <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-50 transition-colors">
                    All
                  </button>
                  <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-50 transition-colors">
                    Active
                  </button>
                  <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-50 transition-colors">
                    Completed
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                {loadingBookings ? (
                  <div>Loading bookings...</div>
                ) : userBookings.length === 0 ? (
                  <div>No bookings found.</div>
                ) : (
                  userBookings.map((booking) => {
                    const product = bookingProducts[booking.id];
                    const images = bookingImages[booking.id] || [];
                    const bookingReview = bookingReviews[booking.id];
                    const isLoadingReview = loadingBookingReviews[booking.id];
                    const reviewCount = bookingReviewCounts[booking.id] || 0;
                    
                    return (
                      <div key={booking.id} className="border border-gray-100 rounded-2xl p-6 hover:border-gray-200 transition-colors">
                        <div className="flex items-center space-x-4 mb-4">
                          <img
                            src={images[0]?.image_url || '/assets/img/placeholder-image.png'}
                            alt={product?.title || 'Product'}
                            className="w-24 h-18 rounded-xl object-cover"
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">{product?.title || 'Product'}</h4>
                            <p className="text-sm text-gray-500 mb-2">
                              {new Date(booking.start_date).toLocaleString()} - {new Date(booking.end_date).toLocaleString()}
                            </p>
                            <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-medium ${
                              booking.status === 'pending' ? 'bg-my-primary/10 text-my-primary' : 'bg-success-100 text-success-700'
                            }`}>
                              {booking.status}
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-xl text-gray-900">
                              {product?.base_price_per_day ? `$${product.base_price_per_day}` : ''}
                            </p>
                          </div>
                        </div>
                        
                        {/* Review Section */}
                        <div className="border-t border-gray-100 pt-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <h5 className="font-medium text-gray-900">Review</h5>
                              {reviewCount > 0 && (
                                <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
                                  {reviewCount} review{reviewCount !== 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                            {!bookingReview && !isLoadingReview && reviewCount === 0 && (
                              <button
                                onClick={() => handleViewBookingReview(booking.id)}
                                className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
                              >
                                Check for Review
                              </button>
                            )}
                            {!bookingReview && !isLoadingReview && reviewCount > 0 && (
                              <button
                                onClick={() => handleViewBookingReview(booking.id)}
                                className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
                              >
                                View Review
                              </button>
                            )}
                          </div>
                          
                          {isLoadingReview ? (
                            <div className="flex items-center justify-center py-4">
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
                              <span className="ml-2 text-sm text-gray-500">Loading review...</span>
                            </div>
                          ) : bookingReview ? (
                            <div className="bg-gray-50 rounded-xl p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h6 className="font-semibold text-gray-900">{bookingReview.title}</h6>
                                  <p className="text-sm text-gray-500">
                                    {new Date(bookingReview.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="flex items-center space-x-1">
                                  {[...Array(5)].map((_, index) => (
                                    <Star
                                      key={index}
                                      className={`w-4 h-4 ${
                                        index < bookingReview.overallRating
                                          ? 'fill-yellow-400 text-yellow-400'
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                  <span className="ml-2 text-sm font-medium text-gray-900">
                                    {bookingReview.overallRating}/5
                                  </span>
                                </div>
                              </div>
                              
                              <p className="text-gray-700 text-sm mb-3">{bookingReview.comment}</p>
                              
                              <div className="grid grid-cols-3 gap-3 text-xs">
                                <div className="text-center">
                                  <div className="font-semibold text-gray-900">{bookingReview.communicationRating}</div>
                                  <div className="text-gray-500">Communication</div>
                                </div>
                                <div className="text-center">
                                  <div className="font-semibold text-gray-900">{bookingReview.conditionRating}</div>
                                  <div className="text-gray-500">Condition</div>
                                </div>
                                <div className="text-center">
                                  <div className="font-semibold text-gray-900">{bookingReview.valueRating}</div>
                                  <div className="text-gray-500">Value</div>
                                </div>
                              </div>
                              
                              {bookingReview.response && (
                                <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                      <span className="text-xs text-white font-bold">R</span>
                                    </div>
                                    <span className="text-xs font-medium text-gray-900">Your Response</span>
                                  </div>
                                  <p className="text-gray-700 text-xs">{bookingReview.response}</p>
                                </div>
                              )}
                              
                              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  bookingReview.moderationStatus === 'approved' 
                                    ? 'bg-success-100 text-success-700'
                                    : bookingReview.moderationStatus === 'pending'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-red-100 text-red-700'
                                }`}>
                                  {bookingReview.moderationStatus}
                                </span>
                                {bookingReview.isFlagged && (
                                  <span className="text-red-500 text-xs">⚠️ Flagged</span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-4 text-gray-500 text-sm">
                              {reviewCount === 0 ? 'No review available for this booking' : 'Click "View Review" to see the review details'}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {activeTab === 'listings' && (
            loadingListings ? (
              <div className="flex items-center justify-center py-8">
                <svg className="animate-spin h-6 w-6 text-primary-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
                <span>Loading your listings...</span>
              </div>
            ) : myListings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-gray-300 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <div className="text-2xl font-bold text-gray-400 mb-2">No listings yet</div>
                <div className="text-gray-500 mb-6">You haven't created any product listings. Click below to get started!</div>
                <Button
                  onClick={handleOpenModal}
                  className="bg-primary-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
                >
                  Add New Listing
                </Button>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">My Listings</h3>
                  <div className="flex gap-2">
                    <Button onClick={() => setShowInspectionModal(true)} className="mb-4 bg-emerald-600 text-white px-3 py-2 hover:bg-emerald-700">Request Inspection</Button>
                    <Button onClick={handleOpenModal} className="mb-4 bg-primary-500 text-white px-2 py-2">Add New Listing</Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myListings.map((listing) => (
                    <div
                      key={listing.id}
                      className="group relative bg-white rounded-3xl p-4 border border-gray-100 cursor-pointer"
                      onClick={(e) => {
                        if ((e.target as HTMLElement).closest('.more-menu')) return;
                        setSelectedProductId(listing.id);
                        setShowProductDetail(true);
                      }}
                    >
                      {/* thumbnail */}
                      {productImages[listing.id] && productImages[listing.id][0] ? (
                        <img
                          src={productImages[listing.id][0].image_url}
                          alt={productImages[listing.id][0].alt_text || listing.title}
                          className="w-full h-44 rounded-2xl object-cover mb-3"
                        />
                      ) : (
                        <div className="w-full h-44 rounded-2xl bg-gray-100 flex items-center justify-center mb-3 text-gray-400">No Image</div>
                      )}
                      <h4 className="font-semibold text-gray-900 mb-2">{listing.title}</h4>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-lg font-bold text-gray-900">{(listing.base_price_per_day != null && listing.base_currency) ? `${listing.base_price_per_day}/${listing.base_currency}` : 'No price'}</span>
                        <span className={`px-3 py-1 rounded-lg text-xs font-medium ${listing.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {listing.status || 'Draft'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-4">{listing.bookings ? `${listing.bookings} bookings this month` : ''}</p>
                      <div className='flex justify-between items-center'>
                          <p>status: {listing.status || 'Draft'}</p>
                          <div className="relative inline-block text-left more-menu">
                            <button onClick={() => setOpenMenuId(openMenuId === listing.id ? null : listing.id)} className="p-2 rounded-full hover:bg-gray-100">
                              <MoreHorizontal className="w-5 h-5" />
                            </button>

                            {openMenuId === listing.id && (
                              <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow-lg z-50">
                                <button onClick={() => { setSelectedProductId(listing.id); setShowProductDetail(true); setOpenMenuId(null); }} className="block w-full text-left px-4 py-2 hover:bg-gray-100">View</button>
                                <button onClick={() => { setEditProductId(listing.id); setShowEditModal(true); setOpenMenuId(null); }} className="block w-full text-left px-4 py-2 hover:bg-gray-100">Edit</button>
                                <button onClick={() => { /* handleDelete(listing.id) */ setOpenMenuId(null); }} className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100">Delete</button>
                              </div>
                            )}
                          </div>
                        </div>
                    </div>
                  ))}
                </div>
              </div>
            )
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
             <div className="space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {/* Available Balance Card */}
                 <div className="bg-gradient-to-br from-active via-active to-active-dark rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl shadow-active/25">
                   <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
                   <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>
                   <div className="relative z-10">
                     <div className="flex items-center justify-between mb-4">
                       <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                         <Wallet className="w-6 h-6 text-white" />
                       </div>
                       <div className="text-xs bg-white/20 px-3 py-1 rounded-full font-medium backdrop-blur-sm">
                         Available
                       </div>
                     </div>
                     <h4 className="text-lg font-semibold mb-2 text-white/90">Wallet Balance</h4>
                     <p className="text-4xl font-bold mb-6 text-white">${dashboardStats.totalEarnings.toLocaleString()}</p>
                     <button className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 backdrop-blur-sm hover:scale-105 border border-white/20">
                       Withdraw Funds
                     </button>
                   </div>
                 </div>
                 
                 {/* Total Transactions Card */}
                 <div className="bg-gradient-br from-platform-grey via-platform-dark-grey to-platform-dark-grey rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl shadow-platform-dark-grey/25">
                   <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
                   <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>
                   <div className="relative z-10">
                     <div className="flex items-center justify-between mb-4">
                       {/* <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                         <DollarSign className="w-6 h-6 text-primary-600" />
                         </div> */}
                       <div className="text-xs bg-white/20 px-3 py-1 rounded-full font-medium backdrop-blur-sm">
                         Total
                       </div>
                     </div>
                     <h4 className="text-lg font-semibold mb-2 text-white/90">Transaction Volume</h4>
                     <p className="text-4xl font-bold mb-6 text-white">${dashboardStats.totalTransactions.toLocaleString()}</p>
                     <button
                       onClick={() => setActiveTab('wallet')}
                       className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 backdrop-blur-sm hover:scale-105 border border-white/20"
                     >
                       View All Transactions
                     </button>
                   </div>
                 </div>
               </div>

               <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                 <div className="flex items-center justify-between mb-6">
                   <h4 className="text-lg font-bold text-gray-900">Payment Transactions</h4>
                   {userTransactions.length > 0 && (
                     <span className="text-sm text-gray-500">{userTransactions.length} total</span>
                   )}
                 </div>
                 
                 {loadingWallet ? (
                   <div className="flex items-center justify-center py-12">
                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                     <span className="ml-3 text-gray-600">Loading transactions...</span>
                   </div>
                 ) : userTransactions.length === 0 ? (
                   <div className="text-center py-12">
                     <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                     <p className="text-gray-500 text-lg font-medium">No transactions found</p>
                     <p className="text-gray-500 text-sm">Your payment history will appear here</p>
                   </div>
                 ) : (
                   <div className="space-y-4">
                     {userTransactions.map((transaction) => (
                       <div key={transaction.id} className="flex items-center space-x-4 p-4 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors">
                         {/* <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                           <DollarSign className="w-6 h-6 text-primary-600" />
                         </div> */}
                         <div className="flex-1">
                           <div className="flex items-center space-x-2">
                             <h4 className="font-semibold text-gray-900 capitalize">
                               {transaction.transaction_type?.replace(/_/g, ' ') || 'Payment'}
                             </h4>
                             <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                               transaction.status === 'completed' 
                                 ? 'bg-green-100 text-green-700' 
                                 : transaction.status === 'pending'
                                 ? 'bg-yellow-100 text-yellow-700'
                                 : 'bg-red-100 text-red-700'
                             }`}>
                               {transaction.status}
                             </span>
                           </div>
                           <p className="text-sm text-gray-500">
                             {new Date(transaction.created_at).toLocaleDateString('en-US', {
                               year: 'numeric',
                               month: 'short',
                               day: 'numeric',
                               hour: '2-digit',
                               minute: '2-digit'
                             })}
                           </p>
                           {transaction.metadata?.description && (
                             <p className="text-xs text-gray-400 mt-1">{transaction.metadata.description}</p>
                           )}
                         </div>
                         <div className="text-right">
                           <p className="font-bold text-lg text-gray-900">
                             {parseFloat(transaction.amount).toLocaleString()} {transaction.currency}
                             </p>
                           <p className="text-xs text-gray-500">via {transaction.provider}</p>
                           {transaction.metadata?.is_converted && (
                             <p className="text-xs text-my-primary">
                               Originally {transaction.metadata.original_amount} {transaction.metadata.original_currency}
                             </p>
                           )}
                         </div>
                       </div>
                     ))}
                   </div>
                 )}
               </div>
             </div>
           )}

           {activeTab === 'inspections' && (
             <div className="space-y-6">
               {/* Overview Cards */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <StatCard
                   icon={Shield}
                   title="Total Inspections"
                   value={dashboardStats.totalInspections}
                   subtitle="All time"
                   trend={false}
                   color="text-emerald-600"
                   bgColor="bg-emerald-50"
                 />
                 <StatCard
                   icon={Calendar}
                   title="Active Inspections"
                   value={dashboardStats.activeInspections}
                   subtitle="Currently pending"
                   trend={true}
                   color="text-blue-600"
                   bgColor="bg-blue-50"
                 />
                 <StatCard
                   icon={BookOpen}
                   title="Completed Inspections"
                   value={dashboardStats.completedInspections}
                   subtitle="Successfully finished"
                   trend={true}
                   color="text-green-600"
                   bgColor="bg-green-50"
                 />
               </div>

               {/* Inspections Management */}
               <div className="bg-white rounded-lg shadow p-6">
                 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                   <div>
                     <h3 className="text-lg font-semibold text-gray-900">Inspections Management</h3>
                     <p className="text-sm text-gray-600">Manage your product inspections and disputes</p>
                   </div>
                   <div className="flex flex-col sm:flex-row gap-3">
                     <Button
                       onClick={() => setShowInspectionModal(true)}
                       className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-2"
                     >
                       Request New Inspection
                     </Button>
                     <Button
                       onClick={() => setShowDisputeModal(true)}
                       variant="outline"
                       className="border-red-300 text-red-700 hover:bg-red-50"
                     >
                       Raise Dispute
                     </Button>
                   </div>
                 </div>

                 {/* Inspections List */}
                 <div className="space-y-4">
                   {inspectionsLoading ? (
                     <div className="text-center py-8">
                       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                       <p className="mt-2 text-gray-600">Loading inspections...</p>
                     </div>
                   ) : (userInspections || []).length > 0 ? (
                     <div className="space-y-3">
                       {(userInspections || []).map((inspection) => (
                         <div
                           key={inspection.id}
                           className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                         >
                           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                             <div className="flex-1">
                               <div className="flex items-center gap-3 mb-2">
                                 <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                   inspection.status === 'completed' ? 'bg-green-100 text-green-800' :
                                   inspection.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                   inspection.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                   'bg-gray-100 text-gray-800'
                                 }`}>
                                   {inspection.status.replace('_', ' ').toUpperCase()}
                                 </span>
                                 <span className="text-sm text-gray-500">
                                   {inspection.inspectionType.replace('_', ' ').toUpperCase()}
                                 </span>
                               </div>
                               <p className="text-sm text-gray-600 mb-1">
                                 <strong>Location:</strong> {inspection.location}
                               </p>
                               <p className="text-sm text-gray-600 mb-1">
                                 <strong>Scheduled:</strong> {new Date(inspection.scheduledAt).toLocaleDateString()}
                               </p>
                               {inspection.notes && (
                                 <p className="text-sm text-gray-600">
                                   <strong>Notes:</strong> {inspection.notes}
                                 </p>
                               )}
                             </div>
                             <div className="flex flex-col sm:flex-row gap-2">
                               <Button
                                 onClick={() => handleOpenDisputeModal(inspection.id)}
                                 variant="outline"
                                 size="sm"
                                 className="border-red-300 text-red-700 hover:bg-red-50"
                               >
                                 Raise Dispute
                               </Button>
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
                       <Button
                         onClick={() => setShowInspectionModal(true)}
                         className="bg-emerald-600 hover:bg-emerald-700 text-white"
                       >
                         Request Your First Inspection
                       </Button>
                     </div>
                   )}
                 </div>
               </div>

               {/* Recent Activity */}
               <div className="bg-white rounded-lg shadow p-6">
                 <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                 <div className="space-y-3">
                   {(userInspections || []).slice(0, 3).map((inspection) => (
                     <div key={inspection.id} className="flex items-center gap-3 text-sm">
                       <div className={`w-2 h-2 rounded-full ${
                         inspection.status === 'completed' ? 'bg-green-500' :
                         inspection.status === 'in_progress' ? 'bg-blue-500' :
                         'bg-yellow-500'
                       }`}></div>
                       <span className="text-gray-600">
                         {inspection.status === 'completed' ? 'Inspection completed' :
                          inspection.status === 'in_progress' ? 'Inspection in progress' :
                          'Inspection scheduled'} for {inspection.inspectionType.replace('_', ' ')}
                       </span>
                       <span className="text-gray-400 ml-auto">
                         {new Date(inspection.updatedAt || inspection.createdAt).toLocaleDateString()}
                       </span>
                     </div>
                   ))}
                   {(userInspections || []).length === 0 && (
                     <p className="text-gray-500 text-center py-4">No recent activity</p>
                   )}
                 </div>
               </div>

               {/* Disputes Section */}
               <div className="bg-white rounded-lg shadow p-6">
                 <div className="flex items-center justify-between mb-4">
                   <h3 className="text-lg font-semibold text-gray-900">Disputes</h3>
                   <Button
                     onClick={() => setShowDisputeModal(true)}
                     variant="outline"
                     size="sm"
                     className="border-red-300 text-red-700 hover:bg-red-50"
                   >
                     Raise New Dispute
                   </Button>
                 </div>
                 
                 {disputesLoading ? (
                   <div className="text-center py-8">
                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                     <p className="mt-2 text-gray-600">Loading disputes...</p>
                   </div>
                 ) : (userDisputes || []).length > 0 ? (
                   <div className="space-y-3">
                     {(userDisputes || []).map((dispute) => (
                       <div
                         key={dispute.id}
                         className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                       >
                         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                           <div className="flex-1">
                             <div className="flex items-center gap-3 mb-2">
                               <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                 dispute.status === 'resolved' ? 'bg-green-100 text-green-800' :
                                 dispute.status === 'under_review' ? 'bg-blue-100 text-blue-800' :
                                 'bg-red-100 text-red-800'
                               }`}>
                                 {dispute.status.replace('_', ' ').toUpperCase()}
                               </span>
                               <span className="text-sm text-gray-500">
                                 {dispute.disputeType?.replace('_', ' ').toUpperCase() || 'DISPUTE'}
                               </span>
                             </div>
                             <p className="text-sm text-gray-600 mb-1">
                               <strong>Reason:</strong> {dispute.reason}
                             </p>
                             {dispute.evidence && (
                               <p className="text-sm text-gray-600 mb-1">
                                 <strong>Evidence:</strong> {dispute.evidence}
                               </p>
                             )}
                             <p className="text-sm text-gray-600">
                               <strong>Raised:</strong> {new Date(dispute.createdAt).toLocaleDateString()}
                             </p>
                           </div>
                           <div className="flex flex-col sm:flex-row gap-2">
                             {dispute.status === 'open' && (
                               <Button
                                 onClick={() => handleOpenDisputeModal(dispute.inspectionId)}
                                 variant="outline"
                                 size="sm"
                                 className="border-blue-300 text-blue-700 hover:bg-blue-50"
                               >
                                 View Details
                               </Button>
                             )}
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>
                 ) : (
                   <div className="text-center py-8">
                     <Shield className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                     <h3 className="text-lg font-medium text-gray-900 mb-2">No disputes yet</h3>
                     <p className="text-gray-600 mb-4">You haven't raised any disputes yet.</p>
                     <Button
                       onClick={() => setShowDisputeModal(true)}
                       className="bg-emerald-600 hover:bg-emerald-700 text-white"
                     >
                       Raise Your First Dispute
                     </Button>
                   </div>
                 )}
               </div>
             </div>
           )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Profile Settings */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Profile Settings</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                  <div className="lg:col-span-1">
                    {(() => {
                      const token = localStorage.getItem('token') || '';
                      let userId = '';
                      try {
                        const tp = JSON.parse(atob(token.split('.')[1]));
                        userId = tp.sub || tp.userId || tp.id || '';
                      } catch {}
                      return (
                        <>
                          <ProfileSettingsForm
                            formId="profile-settings-form"
                            userId={userId}
                            token={token}
                            onUpdated={(u: any) => setRealUser((prev: any) => ({ ...(prev || {}), ...u, avatar: u?.profileImageUrl || prev?.avatar }))}
                          />
                          <div className="flex justify-end mt-4">
                            <button type="submit" form="profile-settings-form" className="px-4 py-2 rounded-xl bg-primary-600 text-white disabled:opacity-50">Save Changes</button>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Security Settings */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Security & Privacy</h3>
                    <p className="text-gray-600">Manage your account security and privacy settings</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Password */}
                  <div className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Lock className="w-5 h-5 text-gray-400" />
                        <div>
                          <h4 className="font-medium text-gray-900">Password</h4>
                          <p className="text-sm text-gray-500">Last updated 3 months ago</p>
                        </div>
                      </div>
                      <Button variant="outline" className="flex items-center gap-2">
                        <Edit2 className="w-4 h-4" />
                        Change Password
                      </Button>
                    </div>
                  </div>

                  {/* Two-Factor Authentication */}
                  <div className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-gray-400" />
                        <div>
                          <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                          <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-medium ${
                          twoFactorStatus.isLoading ? 'text-gray-400' :
                          twoFactorStatus.enabled ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          {twoFactorStatus.isLoading ? 'Loading...' :
                           twoFactorStatus.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                        <Button 
                          onClick={() => setShow2FAModal(true)}
                          disabled={twoFactorStatus.isLoading}
                          className={`px-3 py-1 ${
                            twoFactorStatus.isLoading ? 'bg-gray-400 cursor-not-allowed' :
                            twoFactorStatus.enabled 
                              ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                              : 'bg-my-primary hover:bg-primary-700 text-white'
                          }`}
                        >
                          {twoFactorStatus.isLoading ? 'Loading...' : 
                           twoFactorStatus.enabled ? 'Manage' : 'Enable'}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Login Activity */}
                  <div className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Eye className="w-5 h-5 text-gray-400" />
                        <div>
                          <h4 className="font-medium text-gray-900">Login Activity</h4>
                          <p className="text-sm text-gray-500">View your recent login history</p>
                        </div>
                      </div>
                      <Button variant="outline">View Activity</Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Verification Status */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Account Verification</h3>
                    <p className="text-gray-600">Complete verification to unlock all features</p>
                  </div>
                  <div className="text-sm">
                    KYC Status: <span className={`font-medium ${
                      realUser?.kyc_status === 'verified' ? 'text-green-600' : 
                      realUser?.kyc_status === 'pending' ? 'text-amber-600' : 'text-gray-600'
                    }`}>
                      {realUser?.kyc_status || 'Not started'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { 
                      icon: User, 
                      title: 'Profile Complete', 
                      completed: !!(realUser?.first_name && realUser?.last_name),
                      description: 'Basic profile information'
                    },
                    { 
                      icon: Mail, 
                      title: 'Email Verified', 
                      completed: realUser?.emailVerified === true,
                      description: 'Email address confirmation'
                    },
                    { 
                      icon: Phone, 
                      title: 'Phone Verified', 
                      completed: !!realUser?.phone,
                      description: 'Phone number verification'
                    },
                    { 
                      icon: Shield, 
                      title: 'Identity Verified', 
                      completed: realUser?.kyc_status === 'verified',
                      description: 'Government ID verification'
                    },
                    { 
                      icon: MapPin, 
                      title: 'Address Verified', 
                      completed: !!(realUser?.address || realUser?.city),
                      description: 'Address confirmation'
                    },
                    { 
                      icon: CreditCard, 
                      title: 'Payment Method', 
                      completed: false,
                      description: 'Add payment method'
                    }
                  ].map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <div 
                        key={index}
                        className={`border rounded-xl p-4 ${
                          item.completed 
                            ? 'border-green-200 bg-green-50' 
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`p-2 rounded-lg ${
                            item.completed 
                              ? 'bg-green-100 text-green-600' 
                              : 'bg-gray-100 text-gray-400'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className={`text-sm font-medium ${
                            item.completed ? 'text-green-800' : 'text-gray-700'
                          }`}>
                            {item.title}
                          </span>
                          {item.completed && (
                            <div className="ml-auto bg-green-500 rounded-full p-1">
                              <Shield className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                        <p className={`text-xs ${
                          item.completed ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          {item.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Preferences */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Preferences</h3>
                
                <div className="space-y-4">
                  {/* Language */}
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <Languages className="w-5 h-5 text-gray-400" />
                      <div>
                        <h4 className="font-medium text-gray-900">Language</h4>
                        <p className="text-sm text-gray-500">Choose your preferred language</p>
                      </div>
                    </div>
                    <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
                      <option>English</option>
                      <option>French</option>
                      <option>Kinyarwanda</option>
                      <option>Swahili</option>
                    </select>
                  </div>

                  {/* Currency */}
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-5 h-5 text-gray-400" />
                      <div>
                        <h4 className="font-medium text-gray-900">Currency</h4>
                        <p className="text-sm text-gray-500">Default currency for transactions</p>
                      </div>
                    </div>
                    <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
                      <option>USD ($)</option>
                      <option>RWF (₨)</option>
                      <option>KES (KSh)</option>
                      <option>UGX (USh)</option>
                      <option>EUR (€)</option>
                    </select>
                  </div>

                  {/* Theme */}
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <Moon className="w-5 h-5 text-gray-400" />
                      <div>
                        <h4 className="font-medium text-gray-900">Theme</h4>
                        <p className="text-sm text-gray-500">Choose your preferred theme</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 border border-gray-200 rounded-lg">
                        <Sun className="w-4 h-4" />
                      </button>
                      <button className="p-2 border border-gray-200 rounded-lg bg-gray-100">
                        <Moon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Email Notifications */}
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-gray-400" />
                      <div>
                        <h4 className="font-medium text-gray-900">Email Notifications</h4>
                        <p className="text-sm text-gray-500">Receive important updates via email</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-red-200">
                <h3 className="text-xl font-bold text-red-900 mb-2">Danger Zone</h3>
                <p className="text-gray-600 mb-6">Irreversible and destructive actions</p>
                
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                  </Button>
                  <p className="text-sm text-gray-500">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">My Reviews</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {userReviews.length} review{userReviews.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              
              {loadingReviews ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : userReviews.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Star className="w-10 h-10 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-600 mb-2">No Reviews Yet</h4>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    Start renting cars to receive reviews from hosts and renters.
                    Your reviews will help build trust with the community.
                  </p>
                  <Button className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors">
                    Browse Cars
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {userReviews.map((review) => (
                    <div key={review.id} className="border border-gray-100 rounded-2xl p-6 hover:border-gray-200 transition-colors">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                            <Star className="w-6 h-6 text-primary-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{review.title}</h4>
                            <p className="text-sm text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, index) => (
                            <Star
                              key={index}
                              className={`w-4 h-4 ${
                                index < review.overallRating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                          <span className="ml-2 text-sm font-medium text-gray-900">
                            {review.overallRating}/5
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 mb-4">{review.comment}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-900">{review.communicationRating}</div>
                          <div className="text-xs text-gray-500">Communication</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-900">{review.conditionRating}</div>
                          <div className="text-xs text-gray-500">Condition</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-900">{review.valueRating}</div>
                          <div className="text-xs text-gray-500">Value</div>
                        </div>
                        {review.deliveryRating && (
                          <div className="text-center">
                            <div className="text-lg font-semibold text-gray-900">{review.deliveryRating}</div>
                            <div className="text-xs text-gray-500">Delivery</div>
                          </div>
                        )}
                      </div>
                      
                      {review.response && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                              <span className="text-xs text-white font-bold">R</span>
                            </div>
                            <span className="text-sm font-medium text-gray-900">Your Response</span>
                          </div>
                          <p className="text-gray-700 text-sm">{review.response}</p>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className={`px-2 py-1 rounded-full ${
                            review.moderationStatus === 'approved' 
                              ? 'bg-success-100 text-success-700'
                              : review.moderationStatus === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {review.moderationStatus}
                          </span>
                          {review.isVerifiedBooking && (
                            <span className="px-2 py-1 bg-my-primary/10 text-my-primary rounded-full">
                              Verified
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {review.isFlagged && (
                            <span className="text-red-500 text-xs">⚠️ Flagged</span>
                          )}
                          <button
                            onClick={() => handleViewReviewDetail(review.id)}
                            disabled={loadingReviewDetail}
                            className="text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors"
                          >
                            {loadingReviewDetail ? 'Loading...' : 'View Details'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
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
                        className={`w-5 h-5 ${
                          index < selectedReview.overallRating
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
                      <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                        selectedReview.moderationStatus === 'approved' 
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