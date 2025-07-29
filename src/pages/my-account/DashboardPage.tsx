import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign, Star,
  Shield, MessageCircle, TrendingUp,
  BarChart3, Package, Settings,
  Calendar, Heart,
  Car, Wallet, BookOpen, ArrowUpRight,
  Bell, Search, 
  MoreHorizontal, User, Camera, 
  Lock, Globe, Eye, EyeOff,
  Save, Edit2, Trash2, Upload,
  Key, Mail, Phone, MapPin,
  CreditCard, Languages, Moon, Sun
} from 'lucide-react';
import { Button } from '../../components/ui/DesignSystem';
import VerificationBanner from '../../components/verification/VerificationBanner';
import { 
  createProduct, 
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
import NewListingModal from './models/NewListingModal';
import ProductDetailModal from './models/ProductDetailModal';
import EditProductModal from './models/EditProductModal';

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
  base_price_per_day: string;
  base_currency: string;
  base_price_per_week?: string;
  base_price_per_month?: string;
  pickup_methods: string[];
  country_id: string;
  specifications: { [key: string]: string };
  features?: string[];
  images: File[];
  alt_text: string;
  sort_order: string;
  isPrimary: string;
  product_id: string;
  location: { latitude: string; longitude: string };
};

// Add this utility function at the top or in a utils file

// Helper function to truncate text intelligently
const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) return text;
  
  // Try to break at word boundaries
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  // If we found a space and it's not too close to the beginning, break there
  if (lastSpace > maxLength * 0.6) {
    return truncated.substring(0, lastSpace) + '...';
  }
  
  // Otherwise, just truncate with ellipsis
  return truncated + '...';
};

// Helper component for user avatar display
const UserAvatar: React.FC<{ 
  avatar: string | null; 
  verified: boolean; 
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}> = ({ avatar, verified, className = '', size = 'lg' }) => {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16', 
    lg: 'w-20 h-20'
  };
  
  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {avatar ? (
        <img
          src={avatar}
          alt="User"
          className={`${sizeClasses[size]} rounded-2xl object-cover ring-4 ring-white shadow-lg`}
          onError={(e) => {
            // If image fails to load, replace with icon placeholder
            const parent = (e.target as HTMLImageElement).parentElement;
            if (parent) {
              parent.innerHTML = `
                <div class="${sizeClasses[size]} rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 ring-4 ring-white shadow-lg flex items-center justify-center">
                  <svg class="${iconSizes[size]} text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </div>
              `;
            }
          }}
        />
      ) : (
        <div className={`${sizeClasses[size]} rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 ring-4 ring-white shadow-lg flex items-center justify-center`}>
          <User className={`${iconSizes[size]} text-gray-500`} />
        </div>
      )}
      {verified && (
        <div className="absolute -bottom-2 -right-2 bg-primary-500 rounded-xl p-2 shadow-lg">
          <Shield className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  );
};

const DashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'listings' | 'wallet' | 'wishlist' | 'reviews' | 'settings'>('overview');
  const { showToast } = useToast();
  const { user: authUser } = useAuth();
  const [realUser, setRealUser] = useState<any>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<FormState>({
    title: '',
    slug: '',
    description: '',
    category_id: '',
    condition: 'new',
    base_price_per_day: '',
    base_currency: 'USD',
    pickup_methods: [],
    country_id: '',
    specifications: { spec1: '' }, // start with one empty specification
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
    wishlistItems: 0
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
          // Debug: Log the actual API response to see field names
          console.log('User Profile API Response:', userProfileData.data);
          console.log('First Name:', userProfileData.data.firstName);
          console.log('Last Name:', userProfileData.data.lastName);
          console.log('Available fields:', Object.keys(userProfileData.data));
          
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
            avatar: userProfileData.data.profile_image || null,
            location: userProfileData.data.address || 'Location not set',
            verified: userProfileData.data.kyc_status === 'verified',
            rating: parseFloat(userProfileData.data.rating) || 0,
            totalRentals: parseInt(userProfileData.data.total_rentals) || 0,
            totalEarnings: parseFloat(userProfileData.data.total_earnings) || 0,
            hostLevel: userProfileData.data.kyc_status === 'verified' ? 'Verified Host' : 'New Host',
            joinedDate: userProfileData.data.createdAt,
            phone: userProfileData.data.phone,
            dateOfBirth: userProfileData.data.dateOfBirth,
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
        setDashboardStats(stats);

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
      // 1. Create product
      const productPayload = {
        title: form.title,
        slug: form.slug,
        description: form.description,
        category_id: form.category_id,
        condition: form.condition,
        base_price_per_day: parseFloat(form.base_price_per_day),
        base_currency: form.base_currency,
        pickup_methods: form.pickup_methods,
        country_id: form.country_id,
        specifications: form.specifications,
        location: form.location, // include location in payload
        features: Array.isArray(form.features)
          ? form.features.filter(f => typeof f === 'string' && f.trim() !== '')
          : [],
        ...(form.base_price_per_week && !isNaN(parseFloat(form.base_price_per_week)) && { base_price_per_week: parseFloat(form.base_price_per_week) }),
        ...(form.base_price_per_month && !isNaN(parseFloat(form.base_price_per_month)) && { base_price_per_month: parseFloat(form.base_price_per_month) }),
      };
      const productResponse = await createProduct(productPayload);
      const productId = productResponse.data.id;
      setForm((prev) => ({ ...prev, product_id: productId }));
      // 2. Create product images (multiple)
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
        base_price_per_day: '',
        base_currency: 'USD',
        pickup_methods: [],
        country_id: '',
        specifications: { spec1: '' },
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
  const user = realUser || {
    name: authUser?.name || 'Loading...',
    avatar: authUser?.avatar || null,
    location: 'Location not set',
    verified: authUser?.verification?.isFullyVerified || false,
    rating: 0,
    totalRentals: 0,
    totalEarnings: 0,
    hostLevel: 'New Host',
    walletBalance: 0,
    totalTransactions: 0,
    wishlistItems: 0,
    activeBookings: 0,
    verification: authUser?.verification || {
      isProfileComplete: false,
      isEmailVerified: false,
      isPhoneVerified: false,
      isIdVerified: false,
      isAddressVerified: false,
      isFullyVerified: false,
      verificationStep: 'profile',
    },
  };

  // Mock data for dashboard sections


  const wishlistCars = [
    {
      id: 1,
      name: 'BMW M4 Coupe',
      image: '/assets/img/cars/car-04.jpg',
      price: 180,
      rating: 4.8
    },
    {
      id: 2,
      name: 'Mercedes AMG GT',
      image: '/assets/img/cars/car-05.jpg',
      price: 220,
      rating: 4.9
    }
  ];


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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
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
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Verification Banner */}
        <div className="mb-8">
          <VerificationBanner />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
          {/* Sidebar */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-24 overflow-hidden min-w-0">
              {/* User Profile */}
              <div className="text-center mb-8 overflow-hidden">
                {userLoading ? (
                  // Loading state
                  <div className="animate-pulse">
                    <div className="relative inline-block mb-4">
                      <div className="w-20 h-20 rounded-2xl bg-gray-200 ring-4 ring-white shadow-lg flex items-center justify-center">
                        <User className="w-10 h-10 text-gray-400" />
                      </div>
                    </div>
                    <div className="h-5 bg-gray-200 rounded mb-2 w-32 mx-auto"></div>
                    <div className="h-4 bg-gray-200 rounded mb-3 w-24 mx-auto"></div>
                    <div className="flex items-center justify-center space-x-3">
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                ) : (
                  // Actual user profile
                  <>
                    <UserAvatar 
                      avatar={user.avatar} 
                      verified={user.verified} 
                      className="mb-4" 
                      size="lg" 
                    />
                                        <h3 className="text-lg font-bold text-gray-900 mb-1 w-full text-center px-1" title={user.name}>
                      {truncateText(user.name, 20)}
                    </h3>
                    <p className="text-sm text-gray-500 mb-3 w-full text-center px-1" title={user.location}>
                      {truncateText(user.location, 25)}
                    </p>
                     <div className="flex items-center justify-center space-x-2 flex-wrap gap-2">
                      <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-lg">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                        <span className="text-sm font-semibold text-yellow-700">
                          {user.rating ? user.rating.toFixed(1) : '0.0'}
                        </span>
                      </div>
                      <span className="text-xs px-3 py-1 bg-primary-500 text-white rounded-lg font-medium max-w-24 truncate" title={user.hostLevel}>
                        {truncateText(user.hostLevel || '', 12)}
                      </span>
                    </div>
                    
                    {/* User Stats */}
                    {!userLoading && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-xl overflow-hidden">
                        <div className="grid grid-cols-2 gap-3 text-center min-w-0">
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{user.totalRentals || 0}</div>
                            <div className="text-xs text-gray-500">Rentals</div>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              {user.joinedDate ? new Date(user.joinedDate).getFullYear() : new Date().getFullYear()}
                            </div>
                            <div className="text-xs text-gray-500">Joined</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
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
                  icon={Heart}
                  label="Wishlist"
                  active={activeTab === 'wishlist'}
                  onClick={() => setActiveTab('wishlist')}
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

                <div className="border-t border-gray-100 pt-4 mt-6">
                  <Link
                    to="/dashboard/messages"
                    className="w-full flex items-center px-4 py-3.5 rounded-2xl font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200"
                  >
                    <MessageCircle className="w-5 h-5 mr-3" />
                    <span className="flex-1">Messages</span>
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  </Link>
                </div>
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="xl:col-span-4">
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
                        value={`$${dashboardStats.totalEarnings.toLocaleString()}`}
                        subtitle="Available"
                        trend={true}
                        color="text-success-600"
                        bgColor="bg-success-50"
                      />
                      <StatCard
                        icon={DollarSign}
                        title="Total Transactions"
                        value={`$${dashboardStats.totalTransactions.toLocaleString()}`}
                        subtitle="+12% this month"
                        trend={true}
                        color="text-purple-600"
                        bgColor="bg-purple-50"
                      />
                      <StatCard
                        icon={Heart}
                        title="Wishlist Items"
                        value={dashboardStats.wishlistItems}
                        subtitle="Items saved"
                        trend={false}
                        color="text-pink-600"
                        bgColor="bg-pink-50"
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
                                  <p className="font-bold text-gray-900">${booking.product?.base_price_per_day || 0}</p>
                                  <span className={`inline-flex px-2 py-1 rounded-lg text-xs font-medium ${
                                    booking.status === 'pending' ? 'bg-blue-100 text-blue-700' : 'bg-success-100 text-success-700'
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
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center flex-shrink-0">
                                      <DollarSign className="w-4 h-4 text-primary-600" />
                                    </div>
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
                                booking.status === 'pending' ? 'bg-blue-100 text-blue-700' : 'bg-success-100 text-success-700'
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
                    <Button onClick={handleOpenModal} className="mb-4 bg-primary-500 text-white">Add New Listing</Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {myListings.map((listing) => (
                      <div
                        key={listing.id}
                        className="group relative bg-gray-50 rounded-2xl p-6 hover:bg-gray-100/50 transition-all duration-300 cursor-pointer hover:shadow-lg transition-shadow duration-150"
                        onClick={(e) => {
                          if ((e.target as HTMLElement).closest('.more-menu')) return;
                          setSelectedProductId(listing.id);
                          setShowProductDetail(true);
                        }}
                      >
                        {/* Show first image as thumbnail if available */}
                        {productImages[listing.id] && productImages[listing.id][0] ? (
                          <img
                            src={productImages[listing.id][0].image_url}
                            alt={productImages[listing.id][0].alt_text || listing.title}
                            className="w-full h-40 rounded-xl object-cover mb-4 group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-40 rounded-xl bg-gray-200 flex items-center justify-center mb-4 text-gray-400">No Image</div>
                        )}
                        <h4 className="font-semibold text-gray-900 mb-3">{listing.title}</h4>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-lg font-bold text-gray-900">{listing.base_price_per_day}/{listing.base_currency}</span>
                          <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                            listing.status === 'active'
                              ? 'bg-success-100 text-success-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {listing.status || 'Draft'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">{listing.bookings ? `${listing.bookings} bookings this month` : ''}</p>
                        <div className='flex  justify-between items-center'>
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
                  <div className="bg-gradient-to-br from-platform-grey via-platform-dark-grey to-platform-dark-grey rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl shadow-platform-dark-grey/25">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                          <DollarSign className="w-6 h-6 text-white" />
                        </div>
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
                      <p className="text-gray-400 text-sm">Your payment history will appear here</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userTransactions.map((transaction) => (
                        <div key={transaction.id} className="flex items-center space-x-4 p-4 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                            <DollarSign className="w-6 h-6 text-primary-600" />
                          </div>
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
                              <p className="text-xs text-blue-600">
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
 {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Profile Settings */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Profile Settings</h3>
              <Button variant="primary" className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Picture */}
              <div className="lg:col-span-1">
                <div className="text-center">
                  <UserAvatar avatar={user.avatar} verified={user.verified} size="lg" className="mb-4 mx-auto" />
                  <div className="space-y-2">
                    <Button variant="outline" className="flex items-center gap-2 mx-auto">
                      <Upload className="w-4 h-4" />
                      Upload Photo
                    </Button>
                    <Button variant="ghost" className="flex items-center gap-2 mx-auto text-red-600 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                      Remove Photo
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    JPG, GIF or PNG. Max size 2MB.
                  </p>
                </div>
              </div>

              {/* Profile Form */}
              <div className="lg:col-span-2 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      defaultValue={realUser?.firstName || ''}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      defaultValue={realUser?.lastName || ''}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      defaultValue={realUser?.email || ''}
                      className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter your email"
                    />
                  </div>
                  {realUser?.emailVerified === true ? (
                    <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                      <Shield className="w-4 h-4" />
                      Email verified
                    </p>
                  ) : (
                    <p className="text-sm text-amber-600 mt-1">
                      Email not verified. <button className="text-amber-600 hover:text-amber-700 underline">Verify now</button>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      defaultValue={realUser?.phone || ''}
                      className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  {realUser?.phone ? (
                    <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                      <Shield className="w-4 h-4" />
                      Phone verified
                    </p>
                  ) : (
                    <p className="text-sm text-amber-600 mt-1">
                      No phone number added. <button className="text-amber-600 hover:text-amber-700 underline">Add phone</button>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      defaultValue={user.location}
                      className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter your location"
                    />
                  </div>
                </div>
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
                    <span className="text-sm text-gray-500">Disabled</span>
                    <Button variant="primary">Enable</Button>
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
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
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
                  <div className="bg-blue-50 rounded-xl p-4">
                    <h5 className="font-medium text-gray-900 mb-3">AI Analysis</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-blue-600">
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

     
    </div>
  );
};

export default DashboardPage;