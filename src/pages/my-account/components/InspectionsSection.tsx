import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, MapPin, Clock, Eye, CheckCircle, AlertTriangle, Play, AlertCircle, MessageSquare, Plus, FileText, Upload, X } from 'lucide-react';
import { disputeService, inspectionService } from '../../../services/inspectionService';
import { DisputeType, InspectionType, InspectionStatus } from '../../../types/inspection';
import RenterPreReviewComponent from '../../../components/inspections/RenterPreReviewComponent';
import RenterPostInspectionForm from '../../../components/inspections/RenterPostInspectionForm';
import OwnerPostReviewComponent from '../../../components/inspections/OwnerPostReviewComponent';
import InspectionDetailsModal from '../../../components/inspections/InspectionDetailsModal';

interface Props {
  loading: boolean;
  userInspections: any[];
  onViewInspection: (id: string) => void;
  onRequestInspection: () => void;
}

const InspectionsSection: React.FC<Props> = ({
  loading,
  userInspections,
  onViewInspection,
  onRequestInspection,
}) => {
  const [activeTab, setActiveTab] = useState<'my-items' | 'rented-items' | 'disputes'>('my-items');
  const [rentedInspections, setRentedInspections] = useState<any[]>([]);
  const [rentedLoading, setRentedLoading] = useState(false);
  const [userDisputes, setUserDisputes] = useState<any[]>([]);
  const [disputesLoading, setDisputesLoading] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [selectedDisputeInspectionId, setSelectedDisputeInspectionId] = useState<string | null>(null);
  const [disputeForm, setDisputeForm] = useState({
    disputeType: DisputeType.DAMAGE_ASSESSMENT,
    reason: '',
    evidence: '',
    photos: [] as File[]
  });

  // New workflow form modals
  const [showRenterPreReviewModal, setShowRenterPreReviewModal] = useState(false);
  const [showRenterPostInspectionModal, setShowRenterPostInspectionModal] = useState(false);
  const [showOwnerPostReviewModal, setShowOwnerPostReviewModal] = useState(false);
  const [showInspectionDetailsModal, setShowInspectionDetailsModal] = useState(false);
  const [selectedInspectionId, setSelectedInspectionId] = useState<string | null>(null);
  const [selectedInspection, setSelectedInspection] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch rented inspections
  const loadRentedInspections = async () => {
    setRentedLoading(true);
    try {
      const response = await inspectionService.getMyInspections();
      const inspections = response.data || [];
      console.log('📦 Loaded Rented Inspections:', {
        count: inspections.length,
        inspections: inspections.map((i: any) => ({
          id: i.id,
          type: i.inspectionType,
          typeRaw: i.inspectionType || i.inspection_type,
          status: i.status,
          hasOwnerPreInspection: !!i.ownerPreInspectionData,
          ownerPreInspectionConfirmed: i.ownerPreInspectionConfirmed,
          renterPreReviewAccepted: i.renterPreReviewAccepted,
          renterDiscrepancyReported: i.renterDiscrepancyReported,
          renterPostInspectionData: i.renterPostInspectionData ? 'exists' : 'missing',
          renterPostInspectionConfirmed: i.renterPostInspectionConfirmed,
          ownerPostReviewAccepted: i.ownerPostReviewAccepted,
          ownerDisputeRaised: i.ownerDisputeRaised,
          isPostRental: i.inspectionType === InspectionType.POST_RENTAL || i.inspection_type === 'post_rental' || i.inspection_type === 'POST_RENTAL' || i.inspectionType === 'post_return' || i.inspection_type === 'post_return'
        }))
      });
      setRentedInspections(inspections);
    } catch (error) {
      console.error('Error fetching rented inspections:', error);
      setRentedInspections([]);
    } finally {
      setRentedLoading(false);
    }
  };

  // Fetch user disputes
  const loadUserDisputes = async () => {
    setDisputesLoading(true);
    try {
      // Get user ID from localStorage or context
      const token = localStorage.getItem('token');
      if (!token) {
        setUserDisputes([]);
        return;
      }
      
      // Extract user ID from token
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const userId = tokenPayload.sub || tokenPayload.userId || tokenPayload.id;
      
      if (!userId) {
        // Fallback to general disputes if no user ID
        const response = await disputeService.getAllDisputes();
        setUserDisputes(response.disputes || []);
      } else {
        // Get user-specific disputes
        const response = await disputeService.getUserDisputes(userId);
        setUserDisputes(response.disputes || []);
      }
    } catch (error) {
      console.error('Error fetching disputes:', error);
      setUserDisputes([]);
    } finally {
      setDisputesLoading(false);
    }
  };

  // Load data when tabs are active
  useEffect(() => {
    if (activeTab === 'rented-items') {
      loadRentedInspections();
    } else if (activeTab === 'disputes') {
      loadUserDisputes();
    }
  }, [activeTab, refreshTrigger]);

  // Determine which action button to show based on inspection status and user role
  const getActionButton = (inspection: any, isOwner: boolean) => {
    const inspectionType = inspection.inspectionType;
    const status = inspection.status;
    
    // Debug logging
    if (!isOwner && inspectionType === InspectionType.PRE_RENTAL) {
      console.log('🔍 Renter Pre-Rental Inspection:', {
        id: inspection.id,
        ownerPreInspectionConfirmed: inspection.ownerPreInspectionConfirmed,
        renterPreReviewAccepted: inspection.renterPreReviewAccepted,
        renterDiscrepancyReported: inspection.renterDiscrepancyReported,
        ownerPreInspectionData: inspection.ownerPreInspectionData ? 'exists' : 'missing',
        inspectionType,
        status
      });
    }

    // Owner actions for pre-rental inspection
    if (isOwner && inspectionType === InspectionType.PRE_RENTAL) {
      if (!inspection.ownerPreInspectionConfirmed) {
        // New inspections should have pre-inspection data from creation
        // This state should not occur with the combined form
        return (
          <span className="mt-2 px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full dark:bg-gray-900/20 dark:text-gray-400">
            Pre-Inspection Pending
          </span>
        );
      }
      if (inspection.ownerPreInspectionConfirmed && !inspection.renterPreReviewAccepted) {
        return (
          <span className="mt-2 px-3 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full dark:bg-yellow-900/20 dark:text-yellow-400">
            Waiting for Renter Review
          </span>
        );
      }
    }

    // Renter actions for pre-rental inspection
    if (!isOwner && inspectionType === InspectionType.PRE_RENTAL) {
      // Debug: Log inspection data to see what we have
      console.log('🔍 getActionButton - Renter Pre-Rental:', {
        id: inspection.id,
        ownerPreInspectionData: inspection.ownerPreInspectionData ? 'exists' : 'missing',
        ownerPreInspectionConfirmed: inspection.ownerPreInspectionConfirmed,
        renterPreReviewAccepted: inspection.renterPreReviewAccepted,
        renterDiscrepancyReported: inspection.renterDiscrepancyReported,
        renterPostInspectionData: inspection.renterPostInspectionData ? 'exists' : 'missing',
        renterPostInspectionConfirmed: inspection.renterPostInspectionConfirmed,
        booking: inspection.booking,
        inspectionKeys: Object.keys(inspection)
      });
      
      // Check if booking has ended (for post-inspection)
      const booking = inspection.booking || (inspection as any).Booking;
      const bookingEndDate = booking?.end_date || booking?.endDate || booking?.rental_end_date;
      const now = new Date();
      const bookingEnded = bookingEndDate ? new Date(bookingEndDate) < now : false;
      
      // Check if renter has already provided post-inspection
      const hasPostInspectionData = 
        inspection.renterPostInspectionData || 
        (inspection as any).renter_post_inspection_data;
      const isPostInspectionConfirmed = 
        inspection.renterPostInspectionConfirmed || 
        (inspection as any).renter_post_inspection_confirmed;
      
      // If booking has ended and renter hasn't provided post-inspection yet, show post-inspection button
      if (bookingEnded && !isPostInspectionConfirmed && !hasPostInspectionData) {
        console.log('✅ Booking ended - Showing "Provide Post-Inspection" button');
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedInspection(inspection);
              setShowRenterPostInspectionModal(true);
            }}
            className="mt-2 px-3 py-1 bg-teal-600 text-white text-xs rounded-full hover:bg-teal-700 transition-colors flex items-center gap-1"
          >
            <Upload className="w-3 h-3" />
            Provide Post-Inspection
          </button>
        );
      }
      
      // If post-inspection is provided but owner hasn't reviewed yet
      if (isPostInspectionConfirmed && !inspection.ownerPostReviewAccepted && !inspection.ownerDisputeRaised) {
        return (
          <span className="mt-2 px-3 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full dark:bg-yellow-900/20 dark:text-yellow-400">
            Waiting for Owner Review
          </span>
        );
      }
      
      // Check if owner has provided pre-inspection data (even if not confirmed yet)
      // Also check for nested data structures
      const hasOwnerPreInspection = 
        inspection.ownerPreInspectionData || 
        inspection.ownerPreInspectionConfirmed ||
        (inspection as any).owner_pre_inspection_data ||
        (inspection as any).owner_pre_inspection_confirmed;
      
      // Show review button if owner has provided pre-inspection and renter hasn't reviewed yet
      if (hasOwnerPreInspection && !inspection.renterPreReviewAccepted && !inspection.renterDiscrepancyReported) {
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedInspection(inspection);
              setShowRenterPreReviewModal(true);
            }}
            className="mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded-full hover:bg-blue-700 transition-colors flex items-center gap-1"
          >
            <FileText className="w-3 h-3" />
            Review Pre-Inspection
          </button>
        );
      }
      
      // Show status if renter has already reviewed
      if (inspection.renterPreReviewAccepted) {
        return (
          <span className="mt-2 px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full dark:bg-green-900/20 dark:text-green-400">
            Review Accepted
          </span>
        );
      }
      
      // Show status if discrepancy was reported
      if (inspection.renterDiscrepancyReported) {
        return (
          <span className="mt-2 px-3 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full dark:bg-yellow-900/20 dark:text-yellow-400">
            Discrepancy Reported
          </span>
        );
      }
      
      // Show waiting status if owner hasn't provided pre-inspection yet
      if (!hasOwnerPreInspection) {
        return (
          <span className="mt-2 px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full dark:bg-gray-900/20 dark:text-gray-400">
            Waiting for Owner Pre-Inspection
          </span>
        );
      }
    }

    // Renter actions for post-return inspection
    // Check inspection type with multiple possible formats (handle both POST_RENTAL and POST_RETURN)
    const isPostRental = 
      inspectionType === InspectionType.POST_RENTAL || 
      inspectionType === 'post_rental' || 
      inspectionType === 'POST_RENTAL' ||
      inspectionType === 'post_return' ||  // Backend uses POST_RETURN
      inspectionType === 'POST_RETURN' ||
      (inspection as any).inspection_type === 'post_rental' ||
      (inspection as any).inspection_type === 'POST_RENTAL' ||
      (inspection as any).inspection_type === 'post_return' ||
      (inspection as any).inspection_type === 'POST_RETURN';
    
    if (!isOwner && isPostRental) {
      // Debug logging for post-inspection
      console.log('🔍 getActionButton - Renter Post-Rental:', {
        id: inspection.id,
        inspectionType,
        inspection_type: (inspection as any).inspection_type,
        isPostRental,
        isOwner,
        renterPostInspectionConfirmed: inspection.renterPostInspectionConfirmed,
        renter_post_inspection_confirmed: (inspection as any).renter_post_inspection_confirmed,
        renterPostInspectionData: inspection.renterPostInspectionData ? 'exists' : 'missing',
        renter_post_inspection_data: (inspection as any).renter_post_inspection_data ? 'exists' : 'missing',
        ownerPostReviewAccepted: inspection.ownerPostReviewAccepted,
        ownerDisputeRaised: inspection.ownerDisputeRaised,
        status,
        allKeys: Object.keys(inspection)
      });
      
      // Check if renter has submitted post-inspection (handle both camelCase and snake_case)
      const hasPostInspectionData = 
        inspection.renterPostInspectionData || 
        (inspection as any).renter_post_inspection_data;
      const isConfirmed = 
        inspection.renterPostInspectionConfirmed || 
        (inspection as any).renter_post_inspection_confirmed;
      
      console.log('🔍 Post-Inspection Button Check:', {
        hasPostInspectionData: !!hasPostInspectionData,
        isConfirmed,
        shouldShowButton: !isConfirmed && !hasPostInspectionData
      });
      
      // Show button if post-inspection hasn't been submitted/confirmed yet
      if (!isConfirmed && !hasPostInspectionData) {
        console.log('✅ Showing "Provide Post-Inspection" button');
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedInspection(inspection);
              setShowRenterPostInspectionModal(true);
            }}
            className="mt-2 px-3 py-1 bg-teal-600 text-white text-xs rounded-full hover:bg-teal-700 transition-colors flex items-center gap-1"
          >
            <Upload className="w-3 h-3" />
            Provide Post-Inspection
          </button>
        );
      }
      
      // Show status if renter has submitted but owner hasn't reviewed yet
      if (isConfirmed && !inspection.ownerPostReviewAccepted && !inspection.ownerDisputeRaised) {
        return (
          <span className="mt-2 px-3 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full dark:bg-yellow-900/20 dark:text-yellow-400">
            Waiting for Owner Review
          </span>
        );
      }
      
      // Show status if owner has accepted
      if (inspection.ownerPostReviewAccepted) {
        return (
          <span className="mt-2 px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full dark:bg-green-900/20 dark:text-green-400">
            Owner Accepted
          </span>
        );
      }
      
      // Show status if owner raised dispute
      if (inspection.ownerDisputeRaised) {
        return (
          <span className="mt-2 px-3 py-1 bg-red-100 text-red-700 text-xs rounded-full dark:bg-red-900/20 dark:text-red-400">
            Owner Dispute Raised
          </span>
        );
      }
    }

    // Owner actions for post-return inspection
    // Check inspection type with multiple possible formats (handle both POST_RENTAL and POST_RETURN)
    const isPostRentalForOwner = 
      inspectionType === InspectionType.POST_RENTAL || 
      inspectionType === 'post_rental' || 
      inspectionType === 'POST_RENTAL' ||
      inspectionType === 'post_return' ||  // Backend uses POST_RETURN
      inspectionType === 'POST_RETURN' ||
      (inspection as any).inspection_type === 'post_rental' ||
      (inspection as any).inspection_type === 'POST_RENTAL' ||
      (inspection as any).inspection_type === 'post_return' ||
      (inspection as any).inspection_type === 'POST_RETURN';
    
    if (isOwner && isPostRentalForOwner) {
      if (inspection.renterPostInspectionConfirmed && !inspection.ownerPostReviewAccepted && !inspection.ownerDisputeRaised) {
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedInspection(inspection);
              setShowOwnerPostReviewModal(true);
            }}
            className="mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded-full hover:bg-blue-700 transition-colors flex items-center gap-1"
          >
            <FileText className="w-3 h-3" />
            Review Post-Inspection
          </button>
        );
      }
      if (inspection.ownerDisputeRaised) {
        return (
          <span className="mt-2 px-3 py-1 bg-red-100 text-red-700 text-xs rounded-full dark:bg-red-900/20 dark:text-red-400">
            Dispute Raised
          </span>
        );
      }
    }

    return null;
  };

  // Form submission handlers
  const handleRenterPreReviewSubmit = async (review: any) => {
    if (!selectedInspection) return;
    
    // Get current user ID from token for debugging
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    let currentUserId = null;
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        currentUserId = payload.id || payload.sub || payload.userId;
      } catch (e) {
        console.warn('Could not parse token:', e);
      }
    }
    
    console.log('[InspectionsSection] Submitting renter pre-review:', {
      inspectionId: selectedInspection.id,
      review,
      currentUserId,
      inspectionRenterId: selectedInspection.renterId || selectedInspection.renter_id,
      tokenExists: !!token
    });
    
    try {
      await inspectionService.submitRenterPreReview(selectedInspection.id, review);
      setShowRenterPreReviewModal(false);
      setSelectedInspection(null);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Failed to submit renter pre-review:', error);
      throw error;
    }
  };

  const handleRenterDiscrepancySubmit = async (discrepancy: any) => {
    if (!selectedInspection) return;
    
    // Get current user ID from token for debugging
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    let currentUserId = null;
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        currentUserId = payload.id || payload.sub || payload.userId;
      } catch (e) {
        console.warn('Could not parse token:', e);
      }
    }
    
    console.log('[InspectionsSection] Reporting renter discrepancy:', {
      inspectionId: selectedInspection.id,
      discrepancy: {
        issuesCount: discrepancy.issues?.length || 0,
        notesLength: discrepancy.notes?.length || 0,
        photosCount: discrepancy.photos?.length || 0
      },
      currentUserId,
      inspectionRenterId: selectedInspection.renterId || selectedInspection.renter_id,
      tokenExists: !!token
    });
    
    try {
      await inspectionService.reportRenterDiscrepancy(selectedInspection.id, discrepancy);
      setShowRenterPreReviewModal(false);
      setSelectedInspection(null);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Failed to report discrepancy:', error);
      throw error;
    }
  };

  const handleRenterPostInspectionSubmit = async (data: any) => {
    if (!selectedInspection) return;
    
    // Get current user ID from token for debugging
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    let currentUserId = null;
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        currentUserId = payload.id || payload.sub || payload.userId;
      } catch (e) {
        console.warn('Could not parse token:', e);
      }
    }
    
    console.log('[InspectionsSection] Submitting renter post-inspection:', {
      inspectionId: selectedInspection.id,
      data: {
        photosCount: data.returnPhotos?.length || 0,
        hasCondition: !!data.condition,
        notesLength: data.notes?.length || 0,
        hasLocation: !!data.returnLocation,
        confirmed: data.confirmed
      },
      currentUserId,
      inspectionRenterId: selectedInspection.renterId || selectedInspection.renter_id,
      tokenExists: !!token
    });
    
    try {
      await inspectionService.submitRenterPostInspection(selectedInspection.id, data);
      setShowRenterPostInspectionModal(false);
      setSelectedInspection(null);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Failed to submit renter post-inspection:', error);
      throw error;
    }
  };

  const handleOwnerPostReviewSubmit = async (review: any) => {
    if (!selectedInspection) return;
    try {
      await inspectionService.submitOwnerPostReview(selectedInspection.id, review);
      setShowOwnerPostReviewModal(false);
      setSelectedInspection(null);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Failed to submit owner post-review:', error);
      throw error;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'in_progress': return 'bg-blue-100 text-blue-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'disputed': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'in_progress': return <Play className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'disputed': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getDisputeStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-700';
      case 'under_review': return 'bg-blue-100 text-blue-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getDisputeStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'under_review': return <AlertCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'rejected': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const handleRaiseDispute = async () => {
    if (!selectedDisputeInspectionId || !disputeForm.reason.trim()) {
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

      await disputeService.raiseDispute(selectedDisputeInspectionId, formData as any);

      // Reset form and close modal
      setDisputeForm({
        disputeType: DisputeType.DAMAGE_ASSESSMENT,
        reason: '',
        evidence: '',
        photos: []
      });
      setShowDisputeModal(false);
      setSelectedDisputeInspectionId(null);
      
      // Reload disputes
      loadUserDisputes();
    } catch (error) {
      console.error('Failed to raise dispute:', error);
    }
  };

  const openDisputeModal = (inspectionId: string) => {
    setSelectedDisputeInspectionId(inspectionId);
    setShowDisputeModal(true);
  };

  if ((loading && activeTab === 'my-items') || (rentedLoading && activeTab === 'rented-items')) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 dark:bg-slate-900 dark:border-slate-700">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      </div>
    );
  }

  if (disputesLoading && activeTab === 'disputes') {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 dark:bg-slate-900 dark:border-slate-700">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:bg-slate-900 dark:border-slate-700">
      {/* Header with tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
        <div className="flex overflow-x-auto whitespace-nowrap space-x-1 bg-gray-100 rounded-lg p-1 dark:bg-slate-800">
          <button
            onClick={() => setActiveTab('my-items')}
            className={`px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-colors shrink-0 ${
              activeTab === 'my-items'
                ? 'bg-white text-gray-900 shadow-sm dark:bg-slate-900 dark:text-slate-100'
                : 'text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            My Items ({userInspections.length})
          </button>
          <button
            onClick={() => setActiveTab('rented-items')}
            className={`px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-colors shrink-0 ${
              activeTab === 'rented-items'
                ? 'bg-white text-gray-900 shadow-sm dark:bg-slate-900 dark:text-slate-100'
                : 'text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Rented Items ({rentedInspections.length})
          </button>
          <button
            onClick={() => setActiveTab('disputes')}
            className={`px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-colors shrink-0 ${
              activeTab === 'disputes'
                ? 'bg-white text-gray-900 shadow-sm dark:bg-slate-900 dark:text-slate-100'
                : 'text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Disputes ({userDisputes.length})
          </button>
        </div>
        <div className="flex gap-2">
          {activeTab === 'my-items' && (
            <button onClick={onRequestInspection} className="bg-emerald-600 text-white px-3 py-2 hover:bg-emerald-700 rounded text-sm">
              Request Inspection
            </button>
          )}
          {activeTab === 'disputes' && (
            <button 
              onClick={() => setShowDisputeModal(true)}
              className="bg-red-600 text-white px-3 py-2 hover:bg-red-700 rounded flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              Raise Dispute
            </button>
          )}
        </div>
      </div>

      {/* My Items Tab */}
      {activeTab === 'my-items' && (
        <div className="space-y-4">
          {userInspections.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4 dark:text-slate-500" />
              <h3 className="text-lg font-medium text-gray-900 mb-2 dark:text-slate-100">No Inspections Yet</h3>
              <p className="text-gray-500 mb-4 dark:text-slate-400">You haven't requested any inspections yet.</p>
              <button
                onClick={onRequestInspection}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Request Your First Inspection
              </button>
            </div>
          ) : (
            userInspections.map((inspection) => (
              <div
                key={inspection.id}
                className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-3 sm:space-y-0 p-4 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors cursor-pointer overflow-hidden dark:border-slate-700 dark:hover:border-slate-600"
                onClick={() => {
                  setSelectedInspectionId(inspection.id);
                  setShowInspectionDetailsModal(true);
                }}
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-semibold text-gray-900 capitalize dark:text-slate-100">
                      {inspection.inspectionType?.replace(/_/g, ' ') || 'Inspection'}
                    </h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(inspection.status)}`}>
                      {getStatusIcon(inspection.status)}
                      {inspection.status?.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2 dark:text-slate-400">
                    {inspection.scheduledAt && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
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

                  {inspection.notes && (
                    <p className="text-xs text-gray-400 truncate dark:text-slate-500">{inspection.notes}</p>
                  )}
                </div>

                <div className="sm:text-right text-left">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                    <span className="text-xs text-gray-500 dark:text-slate-400">View Details</span>
                  </div>
                  {inspection.createdAt && (
                    <p className="text-xs text-gray-400 mt-1 break-words dark:text-slate-500">
                      Created {formatDate(inspection.createdAt)}
                    </p>
                  )}
                  {/* Action Button based on inspection status */}
                  {getActionButton(inspection, true)}
                  {/* Raise Dispute Button (legacy) */}
                  {inspection.status === InspectionStatus.DISPUTED && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openDisputeModal(inspection.id);
                      }}
                      className="mt-2 px-3 py-1 bg-red-100 text-red-700 text-xs rounded-full hover:bg-red-200 transition-colors flex items-center gap-1 dark:bg-red-900/20 dark:hover:bg-red-900/30"
                    >
                      <AlertCircle className="w-3 h-3" />
                      Raise Dispute
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Rented Items Tab */}
      {activeTab === 'rented-items' && (
        <div className="space-y-4">
          {rentedInspections.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4 dark:text-slate-500" />
              <h3 className="text-lg font-medium text-gray-900 mb-2 dark:text-slate-100">No Rented Item Inspections</h3>
              <p className="text-gray-500 mb-4 dark:text-slate-400">You haven't rented any items that require inspections yet.</p>
            </div>
          ) : (
            rentedInspections.map((inspection) => (
              <div
                key={inspection.id}
                className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-3 sm:space-y-0 p-4 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors cursor-pointer overflow-hidden dark:border-slate-700 dark:hover:border-slate-600"
                onClick={() => {
                  setSelectedInspectionId(inspection.id);
                  setShowInspectionDetailsModal(true);
                }}
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-semibold text-gray-900 capitalize dark:text-slate-100">
                      {inspection.inspectionType?.replace(/_/g, ' ') || 'Inspection'}
                    </h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(inspection.status)}`}>
                      {getStatusIcon(inspection.status)}
                      {inspection.status?.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2 dark:text-slate-400">
                    {inspection.scheduledAt && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
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

                  {inspection.notes && (
                    <p className="text-sm text-gray-600 mb-2 dark:text-slate-400">{inspection.notes}</p>
                  )}

                  {inspection.inspectorNotes && (
                    <p className="text-sm text-gray-600 mb-2 italic dark:text-slate-400">
                      Inspector Notes: {inspection.inspectorNotes}
                    </p>
                  )}
                </div>

                <div className="sm:text-right text-left">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                    <span className="text-xs text-gray-500 dark:text-slate-400">View Details</span>
                  </div>
                  {inspection.createdAt && (
                    <p className="text-xs text-gray-400 mt-1 break-words dark:text-slate-500">
                      Created {formatDate(inspection.createdAt)}
                    </p>
                  )}
                  {/* Action Button based on inspection status */}
                  {getActionButton(inspection, false)}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Disputes Tab */}
      {activeTab === 'disputes' && (
        <div className="space-y-4">
          {userDisputes.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4 dark:text-slate-500" />
              <h3 className="text-lg font-medium text-gray-900 mb-2 dark:text-slate-100">No Disputes Yet</h3>
              <p className="text-gray-500 mb-4 dark:text-slate-400">You haven't raised any disputes yet.</p>
              <button
                onClick={() => setShowDisputeModal(true)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Raise Your First Dispute
              </button>
            </div>
          ) : (
            userDisputes.map((dispute) => (
              <div
                key={dispute.id}
                className="flex items-center space-x-4 p-4 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors dark:border-slate-700 dark:hover:border-slate-600"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-semibold text-gray-900 capitalize dark:text-slate-100">
                      {dispute.disputeType?.replace(/_/g, ' ') || 'Dispute'}
                    </h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getDisputeStatusColor(dispute.status)}`}>
                      {getDisputeStatusIcon(dispute.status)}
                      {dispute.status?.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2 dark:text-slate-400">
                    {dispute.createdAt && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Raised {formatDate(dispute.createdAt)}</span>
                      </div>
                    )}
                    {dispute.inspectionId && (
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>Inspection #{dispute.inspectionId}</span>
                      </div>
                    )}
                  </div>

                  {dispute.reason && (
                    <p className="text-xs text-gray-400 truncate dark:text-slate-500">{dispute.reason}</p>
                  )}
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                    <span className="text-xs text-gray-500 dark:text-slate-400">Dispute</span>
                  </div>
                  {dispute.updatedAt && (
                    <p className="text-xs text-gray-400 mt-1 dark:text-slate-500">
                      Updated {formatDate(dispute.updatedAt)}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Dispute Modal */}
      {showDisputeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowDisputeModal(false)} />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 dark:bg-slate-900">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 dark:text-slate-100">Raise Dispute</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-slate-300">Dispute Type *</label>
                <select
                  value={disputeForm.disputeType}
                  onChange={(e) => setDisputeForm(prev => ({ ...prev, disputeType: e.target.value as DisputeType }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                >
                  <option value={DisputeType.DAMAGE_ASSESSMENT}>Damage Assessment</option>
                  <option value={DisputeType.COST_DISPUTE}>Cost Dispute</option>
                  <option value={DisputeType.PROCEDURE_VIOLATION}>Procedure Violation</option>
                  <option value={DisputeType.OTHER}>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-slate-300">Reason *</label>
                <textarea
                  value={disputeForm.reason}
                  onChange={(e) => setDisputeForm(prev => ({ ...prev, reason: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                  placeholder="Describe the reason for this dispute..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-slate-300">Evidence</label>
                <textarea
                  value={disputeForm.evidence}
                  onChange={(e) => setDisputeForm(prev => ({ ...prev, evidence: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                  placeholder="Provide any supporting evidence or additional details..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-slate-300">Supporting Photos</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setDisputeForm(prev => ({ ...prev, photos: files }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Upload photos to support your dispute (optional)</p>
                {disputeForm.photos.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 dark:text-slate-400">Selected files:</p>
                    <ul className="mt-1 text-sm text-gray-500 dark:text-slate-400">
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
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 dark:border-slate-700 dark:text-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
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

      {/* Renter Pre-Review Modal */}
      {showRenterPreReviewModal && selectedInspection && selectedInspection.ownerPreInspectionData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => {
            setShowRenterPreReviewModal(false);
            setSelectedInspection(null);
          }} />
          <div className="relative bg-white dark:bg-slate-900 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Review Pre-Inspection</h3>
              <button
                onClick={() => {
                  setShowRenterPreReviewModal(false);
                  setSelectedInspection(null);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <RenterPreReviewComponent
                inspectionId={selectedInspection.id}
                ownerPreInspection={selectedInspection.ownerPreInspectionData}
                onSubmit={handleRenterPreReviewSubmit}
                onReportDiscrepancy={handleRenterDiscrepancySubmit}
                onCancel={() => {
                  setShowRenterPreReviewModal(false);
                  setSelectedInspection(null);
                }}
                showDiscrepancyFormInitially={selectedInspection._showDiscrepancyForm || false}
              />
            </div>
          </div>
        </div>
      )}

      {/* Renter Post-Inspection Modal */}
      {showRenterPostInspectionModal && selectedInspection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => {
            setShowRenterPostInspectionModal(false);
            setSelectedInspection(null);
          }} />
          <div className="relative bg-white dark:bg-slate-900 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Provide Post-Inspection</h3>
              <button
                onClick={() => {
                  setShowRenterPostInspectionModal(false);
                  setSelectedInspection(null);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <RenterPostInspectionForm
                inspectionId={selectedInspection.id}
                productId={selectedInspection.productId}
                bookingId={selectedInspection.bookingId}
                onSubmit={handleRenterPostInspectionSubmit}
                onCancel={() => {
                  setShowRenterPostInspectionModal(false);
                  setSelectedInspection(null);
                }}
                initialData={selectedInspection.renterPostInspectionData}
              />
            </div>
          </div>
        </div>
      )}

      {/* Owner Post-Review Modal */}
      {showOwnerPostReviewModal && selectedInspection && selectedInspection.renterPostInspectionData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => {
            setShowOwnerPostReviewModal(false);
            setSelectedInspection(null);
          }} />
          <div className="relative bg-white dark:bg-slate-900 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Review Post-Inspection</h3>
              <button
                onClick={() => {
                  setShowOwnerPostReviewModal(false);
                  setSelectedInspection(null);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <OwnerPostReviewComponent
                inspectionId={selectedInspection.id}
                renterPostInspection={selectedInspection.renterPostInspectionData}
                onSubmit={handleOwnerPostReviewSubmit}
                onCancel={() => {
                  setShowOwnerPostReviewModal(false);
                  setSelectedInspection(null);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Inspection Details Modal */}
      {showInspectionDetailsModal && selectedInspectionId && (
        <InspectionDetailsModal
          isOpen={showInspectionDetailsModal}
          inspectionId={selectedInspectionId}
          onClose={() => {
            setShowInspectionDetailsModal(false);
            setSelectedInspectionId(null);
          }}
          userRole={activeTab === 'rented-items' ? 'renter' : activeTab === 'my-items' ? 'owner' : undefined}
          onReviewPreInspection={(inspection) => {
            setSelectedInspection(inspection);
            setShowInspectionDetailsModal(false);
            setShowRenterPreReviewModal(true);
          }}
          onReportDiscrepancy={(inspection) => {
            // Mark inspection to show discrepancy form when opening review modal
            const inspectionWithFlag = { ...inspection, _showDiscrepancyForm: true };
            setSelectedInspection(inspectionWithFlag);
            setShowInspectionDetailsModal(false);
            setShowRenterPreReviewModal(true);
          }}
        />
      )}
    </div>
  );
};

export default InspectionsSection;


