import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield,
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  Search,
  Filter,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  User,
  LogOut,
  BarChart3,
  Settings,
  Home,
  Scale,
  MessageSquare,
  Eye,
  DollarSign,
  Calendar,
  Sun,
  Moon,
  Bell,
  UserCircle,
  Lock,
  Smartphone
} from 'lucide-react';
import type { Dispute } from '../../types/inspection';
import { DisputeStatus, DisputeType } from '../../types/inspection';
import { disputeService } from '../../services/inspectionService';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

const ModeratorDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  
  // Navigation state
  const [activeTab, setActiveTab] = useState<'overview' | 'active' | 'resolved' | 'settings'>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      const saved = localStorage.getItem('moderator-sidebar-collapsed');
      return saved === 'true';
    } catch {
      return false;
    }
  });
  
  // Data states
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  
  // Stats state
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    underReview: 0,
    resolved: 0,
    closed: 0
  });

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Modal states
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  // Mock notifications data
  const [notifications] = useState([
    { id: 1, message: 'New dispute raised', time: '2 min ago', unread: true },
    { id: 2, message: 'Dispute resolved successfully', time: '1 hour ago', unread: false },
    { id: 3, message: '3 disputes pending review', time: '3 hours ago', unread: true }
  ]);
  
  // Chart data for trending statistics
  const [trendingData, setTrendingData] = useState<any[]>([]);

  useEffect(() => {
    loadDisputes();
    generateTrendingData();
  }, []);

  const generateTrendingData = () => {
    // Generate last 7 days of data
    const days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      days.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        disputes: Math.floor(Math.random() * 10) + 5,
        resolved: Math.floor(Math.random() * 8) + 3
      });
    }
    setTrendingData(days);
  };

  const loadDisputes = async () => {
    try {
      setLoading(true);
      const response = await disputeService.getAllDisputes(1, 100);
      const disputesList = response.disputes || [];
      setDisputes(disputesList);
      
      // Calculate stats
      setStats({
        total: disputesList.length,
        open: disputesList.filter(d => d.status === DisputeStatus.OPEN).length,
        underReview: disputesList.filter(d => d.status === DisputeStatus.UNDER_REVIEW).length,
        resolved: disputesList.filter(d => d.status === DisputeStatus.RESOLVED).length,
        closed: disputesList.filter(d => d.status === DisputeStatus.CLOSED).length
      });
    } catch (error: any) {
      console.error('Error loading disputes:', error);
      showToast('Failed to load disputes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleCollapse = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    try {
      localStorage.setItem('moderator-sidebar-collapsed', String(newState));
    } catch {}
  };

  const handleToggleDarkMode = () => {
    toggleDarkMode();
    showToast(`Switched to ${!isDarkMode ? 'dark' : 'light'} mode`, 'info');
  };

  const filteredDisputes = disputes.filter(dispute => {
    const matchesSearch = !searchQuery || 
      dispute.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dispute.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || dispute.status === statusFilter;
    const matchesType = typeFilter === 'all' || dispute.disputeType === typeFilter;
    
    if (activeTab === 'active') {
      return matchesSearch && matchesStatus && matchesType && 
        (dispute.status === DisputeStatus.OPEN || dispute.status === DisputeStatus.UNDER_REVIEW);
    }
    if (activeTab === 'resolved') {
      return matchesSearch && matchesStatus && matchesType && 
        (dispute.status === DisputeStatus.RESOLVED || dispute.status === DisputeStatus.CLOSED);
    }
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.notifications-dropdown') && !target.closest('.notifications-button')) {
        setShowNotifications(false);
      }
      if (!target.closest('.profile-dropdown') && !target.closest('.profile-button')) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: Home, description: 'Dashboard overview', badge: null },
    { id: 'active', label: 'Active Disputes', icon: AlertCircle, description: 'Open disputes', badge: stats.open + stats.underReview },
    { id: 'resolved', label: 'Resolved', icon: CheckCircle2, description: 'Closed disputes', badge: stats.resolved + stats.closed },
    { id: 'settings', label: 'Settings', icon: Settings, description: 'Account settings', badge: null }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Professional Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700
        transition-all duration-300 z-40
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        ${sidebarCollapsed ? 'w-20' : 'w-64'}
        lg:translate-x-0
      `}>
        {/* Sidebar Header */}
        <div className={`p-6 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-gray-900 flex-shrink-0 flex items-center ${sidebarCollapsed ? 'px-3 justify-center' : 'justify-between'}`}>
          {!sidebarCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-my-primary rounded-lg flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Moderator</h2>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Dispute Resolution</p>
              </div>
            </div>
          )}
          {sidebarCollapsed && (
            <div className="w-10 h-10 bg-my-primary rounded-lg flex items-center justify-center shadow-lg mx-auto">
              <Shield className="w-6 h-6 text-white" />
            </div>
          )}
          <div className="flex items-center space-x-1">
            <button
              onClick={toggleCollapse}
              className="hidden lg:flex p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5 -rotate-90" />
              )}
            </button>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
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
                    setActiveTab(item.id as any);
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
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'}`}>
                    <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-my-primary scale-110' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700'}`} />
                    {!sidebarCollapsed && (
                      <div className="text-left">
                        <div className="font-semibold">{item.label}</div>
                        {item.description && (
                          <div className={`text-xs ${isActive ? 'text-my-primary' : 'text-gray-500 dark:text-gray-400'}`}>
                            {item.description}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {!sidebarCollapsed && (
                    <>
                      {item.badge !== null && item.badge > 0 && (
                        <span className={`
                          px-2 py-0.5 rounded-full text-xs font-semibold
                          ${isActive 
                            ? 'bg-my-primary/20 text-my-primary' 
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                          }
                        `}>
                          {item.badge}
                        </span>
                      )}
                      {isActive && (
                        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1.5 h-7 bg-my-primary rounded-l-full"></div>
                      )}
                    </>
                  )}
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
                  {user?.name || user?.email || 'Moderator'}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Moderator</p>
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
          
          {/* Dark Mode Toggle */}
          <button
            onClick={() => {
              toggleDarkMode();
              showToast(`Switched to ${!isDarkMode ? 'dark' : 'light'} mode`, 'info');
            }}
            title={sidebarCollapsed ? (isDarkMode ? 'Light Mode' : 'Dark Mode') : undefined}
            className={`w-full flex items-center rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors mb-2 ${
              sidebarCollapsed 
                ? 'justify-center px-2 py-2' 
                : 'justify-start px-3 py-2 space-x-2'
            }`}
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-yellow-400" />
            ) : (
              <Moon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            )}
            {!sidebarCollapsed && (
              <span className="text-gray-700 dark:text-gray-300">
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
              </span>
            )}
          </button>
          
          <button
            onClick={handleLogout}
            className={`w-full flex items-center rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ${
              sidebarCollapsed 
                ? 'justify-center px-2 py-2' 
                : 'justify-start px-3 py-2 space-x-2'
            }`}
            title={sidebarCollapsed ? 'Logout' : undefined}
          >
            <LogOut className="w-4 h-4" />
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <Menu className="w-6 h-6" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {activeTab === 'overview' && 'Dashboard Overview'}
                    {activeTab === 'active' && 'Active Disputes'}
                    {activeTab === 'resolved' && 'Resolved Disputes'}
                    {activeTab === 'settings' && 'Settings'}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Manage and resolve inspection disputes
                  </p>
                </div>
              </div>
              
              {/* Right side - Notifications and Profile */}
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <div className="relative notifications-dropdown">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative notifications-button p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {notifications.filter(n => n.unread).length > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    )}
                  </button>
                  
                  {/* Notifications Dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Notifications</h3>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                            No notifications
                          </div>
                        ) : (
                          <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {notifications.map((notification) => (
                              <div
                                key={notification.id}
                                className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${notification.unread ? 'bg-my-primary/5' : ''}`}
                              >
                                <p className="text-sm text-gray-900 dark:text-gray-100">{notification.message}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notification.time}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Profile Menu */}
                <div className="relative profile-dropdown flex items-center space-x-2 pl-4 border-l border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="profile-button flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-my-primary rounded-xl px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    aria-label="Profile menu"
                  >
                    {user?.profileImageUrl ? (
                      <img
                        src={user.profileImageUrl}
                        alt={user.name || user.email}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <UserCircle className="w-8 h-8 text-gray-400" />
                    )}
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden sm:block">
                      {user?.name || user?.email || 'Moderator'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>
                  
                  {/* Profile Dropdown */}
                  {showProfileMenu && (
                    <div className="absolute right-0 top-10 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50">
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                        <div className="font-semibold text-gray-900 dark:text-gray-100">
                          {user?.name || user?.email || 'Moderator'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Moderator</div>
                      </div>
                      <div className="px-4 py-2">
                        <button
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          onClick={() => {
                            setShowProfileMenu(false);
                            setActiveTab('settings');
                          }}
                        >
                          <User className="w-4 h-4 mr-2" /> Profile Settings
                        </button>
                        <button
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors mt-1"
                          onClick={() => {
                            setShowProfileMenu(false);
                            // TODO: Open 2FA modal
                          }}
                        >
                          <Smartphone className="w-4 h-4 mr-2" /> Two-Factor Authentication
                        </button>
                        <button
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors mt-1"
                          onClick={() => {
                            setShowProfileMenu(false);
                            // TODO: Open change password modal
                          }}
                        >
                          <Lock className="w-4 h-4 mr-2" /> Change Password
                        </button>
                        <button
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors mt-1"
                          onClick={handleLogout}
                        >
                          <LogOut className="w-4 h-4 mr-2" /> Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-4 sm:p-6 lg:p-8">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total Disputes</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stats.total}</p>
                    </div>
                    <div className="p-3 rounded-full bg-my-primary/10">
                      <Scale className="w-6 h-6 text-my-primary" />
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Open</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stats.open}</p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Under Review</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stats.underReview}</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                      <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Resolved</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stats.resolved}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Trending Statistics Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Disputes Over Time Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Disputes Over Time</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={trendingData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorDisputes" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00aaa9" stopOpacity={0.7}/>
                          <stop offset="95%" stopColor="#00aaa9" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#6b7280" 
                        fontSize={12}
                        tick={{ fill: '#6b7280' }}
                      />
                      <YAxis 
                        allowDecimals={false}
                        stroke="#6b7280" 
                        fontSize={12}
                        tick={{ fill: '#6b7280' }}
                      />
                      <Tooltip
                        contentStyle={{ 
                          background: '#fff', 
                          borderRadius: 8, 
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          border: '1px solid #e5e7eb'
                        }}
                        labelStyle={{ color: '#00aaa9', fontWeight: 600 }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="disputes" 
                        stroke="#00aaa9" 
                        fillOpacity={1} 
                        fill="url(#colorDisputes)" 
                        name="New Disputes"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Resolution Rate Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Resolution Trends</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={trendingData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#6b7280" 
                        fontSize={12}
                        tick={{ fill: '#6b7280' }}
                      />
                      <YAxis 
                        allowDecimals={false}
                        stroke="#6b7280" 
                        fontSize={12}
                        tick={{ fill: '#6b7280' }}
                      />
                      <Tooltip
                        contentStyle={{ 
                          background: '#fff', 
                          borderRadius: 8, 
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          border: '1px solid #e5e7eb'
                        }}
                        labelStyle={{ color: '#00aaa9', fontWeight: 600 }}
                      />
                      <Legend />
                      <Bar dataKey="disputes" fill="#00aaa9" name="New Disputes" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="resolved" fill="#10b981" name="Resolved" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent Disputes */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Disputes</h2>
                </div>
                <div className="p-6">
                  {loading ? (
                    <div className="text-center py-8 text-gray-500">Loading...</div>
                  ) : filteredDisputes.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No disputes found</div>
                  ) : (
                    <div className="space-y-4">
                      {filteredDisputes.slice(0, 5).map((dispute) => (
                        <div key={dispute.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-gray-100">{dispute.reason}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {dispute.disputeType} • {new Date(dispute.raisedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            dispute.status === DisputeStatus.OPEN ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                            dispute.status === DisputeStatus.UNDER_REVIEW ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' :
                            dispute.status === DisputeStatus.RESOLVED ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                            'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
                          }`}>
                            {dispute.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {(activeTab === 'active' || activeTab === 'resolved') && (
            <div className="space-y-6">
              {/* Search and Filters */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search disputes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-my-primary focus:border-my-primary"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  >
                    <option value="all">All Statuses</option>
                    <option value={DisputeStatus.OPEN}>Open</option>
                    <option value={DisputeStatus.UNDER_REVIEW}>Under Review</option>
                    <option value={DisputeStatus.RESOLVED}>Resolved</option>
                    <option value={DisputeStatus.CLOSED}>Closed</option>
                  </select>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  >
                    <option value="all">All Types</option>
                    <option value={DisputeType.DAMAGE_ASSESSMENT}>Damage Assessment</option>
                    <option value={DisputeType.CONDITION_DISAGREEMENT}>Condition Disagreement</option>
                    <option value={DisputeType.COST_DISPUTE}>Cost Dispute</option>
                    <option value={DisputeType.OTHER}>Other</option>
                  </select>
                </div>
              </div>

              {/* Disputes List */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="p-6">
                  {loading ? (
                    <div className="text-center py-8 text-gray-500">Loading...</div>
                  ) : filteredDisputes.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No disputes found</div>
                  ) : (
                    <div className="space-y-4">
                      {filteredDisputes.map((dispute) => (
                        <div key={dispute.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="font-semibold text-gray-900 dark:text-white">{dispute.reason}</h3>
                                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                  dispute.status === DisputeStatus.OPEN ? 'bg-yellow-100 text-yellow-700' :
                                  dispute.status === DisputeStatus.UNDER_REVIEW ? 'bg-orange-100 text-orange-700' :
                                  dispute.status === DisputeStatus.RESOLVED ? 'bg-green-100 text-green-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {dispute.status}
                                </span>
                              </div>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                Type: {dispute.disputeType} • Raised: {new Date(dispute.raisedAt).toLocaleDateString()}
                              </p>
                              {dispute.evidence && (
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{dispute.evidence}</p>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 ml-4">
                              <button
                                onClick={() => {
                                  setSelectedDispute(dispute);
                                  setShowDetailsModal(true);
                                }}
                                className="p-2 text-gray-500 hover:text-my-primary hover:bg-my-primary/10 dark:hover:bg-my-primary/20 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <Eye className="w-5 h-5" />
                              </button>
                              {dispute.status !== DisputeStatus.RESOLVED && dispute.status !== DisputeStatus.CLOSED && (
                                <button
                                  onClick={() => {
                                    setSelectedDispute(dispute);
                                    setShowResolveModal(true);
                                  }}
                                  className="px-4 py-2 bg-my-primary text-white rounded-lg hover:bg-opacity-90 transition-colors"
                                >
                                  Resolve
                                </button>
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
          )}

          {activeTab === 'settings' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Settings</h2>
              <p className="text-gray-500 dark:text-gray-400">Settings coming soon...</p>
            </div>
          )}
        </main>
      </div>

      {/* Dispute Details Modal */}
      {showDetailsModal && selectedDispute && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dispute Details</h2>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedDispute(null);
                  }}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Reason</h3>
                <p className="text-gray-900 dark:text-white">{selectedDispute.reason}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Type</h3>
                <span className="px-3 py-1 bg-my-primary/10 text-my-primary rounded-full text-sm font-semibold">
                  {selectedDispute.disputeType}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Status</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  selectedDispute.status === DisputeStatus.OPEN ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                  selectedDispute.status === DisputeStatus.UNDER_REVIEW ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' :
                  selectedDispute.status === DisputeStatus.RESOLVED ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                  'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
                }`}>
                  {selectedDispute.status}
                </span>
              </div>
              {selectedDispute.evidence && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Evidence</h3>
                  <p className="text-gray-900 dark:text-white">{selectedDispute.evidence}</p>
                </div>
              )}
              {selectedDispute.photos && selectedDispute.photos.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Photos</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedDispute.photos.map((photo) => (
                      <img
                        key={photo.id}
                        src={photo.url}
                        alt={photo.description || 'Evidence photo'}
                        className="w-full h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                      />
                    ))}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Raised At</h3>
                  <p className="text-gray-900 dark:text-white">{new Date(selectedDispute.raisedAt).toLocaleString()}</p>
                </div>
                {selectedDispute.resolvedAt && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Resolved At</h3>
                    <p className="text-gray-900 dark:text-white">{new Date(selectedDispute.resolvedAt).toLocaleString()}</p>
                  </div>
                )}
              </div>
              {selectedDispute.resolutionNotes && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Resolution Notes</h3>
                  <p className="text-gray-900 dark:text-white">{selectedDispute.resolutionNotes}</p>
                </div>
              )}
              {selectedDispute.agreedAmount && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Agreed Amount</h3>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">${selectedDispute.agreedAmount.toFixed(2)}</p>
                </div>
              )}
              {selectedDispute.status !== DisputeStatus.RESOLVED && selectedDispute.status !== DisputeStatus.CLOSED && (
                <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setShowResolveModal(true);
                    }}
                    className="w-full px-4 py-2 bg-my-primary text-white rounded-lg hover:bg-opacity-90 transition-colors font-semibold"
                  >
                    Resolve Dispute
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Resolve Dispute Modal */}
      {showResolveModal && selectedDispute && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Resolve Dispute</h2>
                <button
                  onClick={() => {
                    setShowResolveModal(false);
                    setSelectedDispute(null);
                  }}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <ResolveDisputeForm
              dispute={selectedDispute}
              onClose={() => {
                setShowResolveModal(false);
                setSelectedDispute(null);
              }}
              onSuccess={() => {
                setShowResolveModal(false);
                setSelectedDispute(null);
                loadDisputes();
                showToast('Dispute resolved successfully', 'success');
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Resolve Dispute Form Component
interface ResolveDisputeFormProps {
  dispute: Dispute;
  onClose: () => void;
  onSuccess: () => void;
}

const ResolveDisputeForm: React.FC<ResolveDisputeFormProps> = ({ dispute, onClose, onSuccess }) => {
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [agreedAmount, setAgreedAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resolutionNotes.trim()) {
      showToast('Resolution notes are required', 'error');
      return;
    }

    try {
      setLoading(true);
      await disputeService.resolveDispute(dispute.inspectionId, dispute.id, {
        resolutionNotes,
        agreedAmount: agreedAmount ? parseFloat(agreedAmount) : undefined
      });
      onSuccess();
    } catch (error: any) {
      console.error('Error resolving dispute:', error);
      showToast(error.response?.data?.message || 'Failed to resolve dispute', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Resolution Notes <span className="text-red-500">*</span>
        </label>
        <textarea
          value={resolutionNotes}
          onChange={(e) => setResolutionNotes(e.target.value)}
          rows={6}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-my-primary focus:border-my-primary"
          placeholder="Enter detailed resolution notes explaining how the dispute was resolved..."
          required
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Agreed Amount (Optional)
        </label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="number"
            value={agreedAmount}
            onChange={(e) => setAgreedAmount(e.target.value)}
            step="0.01"
            min="0"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-my-primary focus:border-my-primary"
            placeholder="0.00"
          />
        </div>
      </div>
      <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-my-primary text-white rounded-lg hover:bg-opacity-90 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? 'Resolving...' : 'Resolve Dispute'}
        </button>
      </div>
    </form>
  );
};

export default ModeratorDashboardPage;

