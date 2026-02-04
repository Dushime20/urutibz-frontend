import React, { useState, useEffect } from 'react';
import { TranslatedText } from '../translated-text';
import { useToast } from '../../contexts/ToastContext';
import { 
  RefreshCw, 
  Calendar, 
  User, 
  Package, 
  DollarSign, 
  Clock, 
  AlertCircle,
  Search,
  Filter,
  Download,
  Eye,
  Trash2
} from 'lucide-react';

interface BookingExpirationLog {
  id: string;
  booking_id: string;
  booking_reference: string;
  user_id: string;
  product_title: string;
  booking_created_at: string;
  booking_expires_at: string;
  expiration_hours_used: number;
  booking_status: string;
  booking_amount: number;
  deletion_reason: string;
  booking_data: any;
  expired_at: string;
  expired_by: string;
  created_at: string;
}

const BookingExpirationLogs: React.FC = () => {
  const { showToast } = useToast();
  const [logs, setLogs] = useState<BookingExpirationLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedLog, setSelectedLog] = useState<BookingExpirationLog | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const logsPerPage = 10;

  // Load expiration logs
  const loadExpirationLogs = async (page = 1) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/admin/booking-expiration-logs?page=${page}&limit=${logsPerPage}&search=${searchTerm}&status=${filterStatus}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load expiration logs');
      }

      const data = await response.json();
      setLogs(data.logs || []);
      setTotalPages(Math.ceil((data.total || 0) / logsPerPage));
      setCurrentPage(page);
    } catch (error: any) {
      console.error('Error loading expiration logs:', error);
      showToast(error.message || 'Failed to load expiration logs', 'error');
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load logs on component mount and when filters change
  useEffect(() => {
    loadExpirationLogs(1);
  }, [searchTerm, filterStatus]);

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      case 'confirmed': return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      case 'cancelled': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      case 'expired': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  // Export logs to CSV
  const exportLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/admin/booking-expiration-logs/export', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to export logs');
      }