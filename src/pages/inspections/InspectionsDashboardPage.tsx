import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Calendar, 
  MapPin, 
  Clock,
  Eye,
  Edit,
  Play,
  CheckCircle,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';
import { Inspection, InspectionFilters, InspectionStats, InspectionStatus, InspectionType } from '../../types/inspection';
import { inspectionService } from '../../services/inspectionService';
import StatusBadge from '../../components/inspections/StatusBadge';
import QuickStatsCard from '../../components/inspections/QuickStatsCard';
import InspectionFiltersPanel from '../../components/inspections/InspectionFiltersPanel';
import InspectionTable from '../../components/inspections/InspectionTable';
import RecentInspectionsTimeline from '../../components/inspections/RecentInspectionsTimeline';


const InspectionsDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [stats, setStats] = useState<InspectionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<InspectionFilters>({});
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const [selectedStatus, setSelectedStatus] = useState<InspectionStatus[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<InspectionType[]>([]);

  const limit = 10;

  useEffect(() => {
    loadInspections();
    loadStats();
  }, [filters, page]);

  const loadInspections = async () => {
    try {
      setLoading(true);
      const response = await inspectionService.getInspections(filters, page, limit);
      setInspections(response.inspections);
      setTotal(response.total);
    } catch (error) {
      console.error('Error loading inspections:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await inspectionService.getInspectionStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
      // Set default stats on error
      setStats({
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        disputed: 0,
        resolved: 0
      });
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setFilters(prev => ({ ...prev, search: value }));
    setPage(1);
  };

  const handleStatusFilter = (status: InspectionStatus[]) => {
    setSelectedStatus(status);
    setFilters(prev => ({ ...prev, status }));
    setPage(1);
  };

  const handleTypeFilter = (types: InspectionType[]) => {
    setSelectedTypes(types);
    setFilters(prev => ({ ...prev, type: types }));
    setPage(1);
  };

  const handleDateRangeFilter = (start: string, end: string) => {
    setFilters(prev => ({ 
      ...prev, 
      dateRange: { start, end } 
    }));
    setPage(1);
  };

  const handleLocationFilter = (location: string) => {
    setFilters(prev => ({ ...prev, location }));
    setPage(1);
  };

  const handleInspectorFilter = (inspectorId: string) => {
    setFilters(prev => ({ ...prev, inspectorId }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({});
    setSelectedStatus([]);
    setSelectedTypes([]);
    setSearch('');
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleInspectionAction = (inspection: Inspection, action: string) => {
    switch (action) {
      case 'view':
        navigate(`/inspections/${inspection.id}`);
        break;
      case 'edit':
        navigate(`/inspections/${inspection.id}/edit`);
        break;
      case 'start':
        navigate(`/inspections/${inspection.id}/start`);
        break;
      case 'complete':
        navigate(`/inspections/${inspection.id}/complete`);
        break;
      default:
        break;
    }
  };



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Custom Dashboard Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4">
            {/* Left side - Title and Navigation */}
            <div className="flex items-center space-x-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Inspections Dashboard</h1>
                <p className="text-sm text-gray-500">Manage and track all product inspections</p>
              </div>
              
              {/* Navigation Tabs */}
              <nav className="flex space-x-1">
                <button className="px-3 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 rounded-md border border-emerald-200">
                  Dashboard
                </button>
                <button className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-md">
                  Reports
                </button>
                <button className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-md">
                  Analytics
                </button>
                <button className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-md">
                  Settings
                </button>
              </nav>
            </div>

                                      {/* Right side - Actions and Profile */}
             <div className="flex items-center space-x-4 mt-4 sm:mt-0">

              {/* Notifications */}
              <button className="p-2 text-gray-400 hover:text-gray-500 relative">
                <div className="w-5 h-5">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M9 11h.01M9 8h.01M9 5h.01M9 2h.01" />
                  </svg>
                </div>
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
              </button>

              {/* Profile Dropdown */}
              <div className="relative">
                <button className="flex items-center space-x-2 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">JD</span>
                  </div>
                  <span className="text-gray-700 font-medium">John Doe</span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Profile Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Profile
                    </div>
                  </a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Settings
                    </div>
                  </a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Documentation
                    </div>
                  </a>
                  <div className="border-t border-gray-100 my-1"></div>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign out
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                 {/* Quick Stats */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
           <QuickStatsCard
             title="Total"
             value={stats?.total || 0}
             icon={TrendingUp}
             color="blue"
           />
           <QuickStatsCard
             title="Pending"
             value={stats?.pending || 0}
             icon={Clock}
             color="yellow"
           />
           <QuickStatsCard
             title="In Progress"
             value={stats?.inProgress || 0}
             icon={Play}
             color="blue"
           />
           <QuickStatsCard
             title="Completed"
             value={stats?.completed || 0}
             icon={CheckCircle}
             color="green"
           />
           <QuickStatsCard
             title="Disputed"
             value={stats?.disputed || 0}
             icon={AlertTriangle}
             color="red"
           />
           <QuickStatsCard
             title="Resolved"
             value={stats?.resolved || 0}
             icon={CheckCircle}
             color="green"
           />
         </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                     <input
                     type="text"
                     placeholder="Search inspections..."
                     value={search}
                     onChange={(e) => handleSearch(e.target.value)}
                     className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                   />
                </div>
              </div>

              {/* Filter Toggle */}
                             <button
                 onClick={() => setShowFilters(!showFilters)}
                 className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
               >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                                 {Object.keys(filters).length > 0 && (
                   <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                     {Object.keys(filters).length}
                   </span>
                 )}
              </button>

              {/* Clear Filters */}
              {Object.keys(filters).length > 0 && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <InspectionFiltersPanel
                selectedStatus={selectedStatus}
                selectedTypes={selectedTypes}
                onStatusChange={handleStatusFilter}
                onTypeChange={handleTypeFilter}
                onDateRangeChange={handleDateRangeFilter}
                onLocationChange={handleLocationFilter}
                onInspectorChange={handleInspectorFilter}
              />
            )}
          </div>
        </div>

        {/* Main Content */}
                 {loading ? (
           <div className="flex justify-center items-center py-12">
             <div className="text-center">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
               <p className="mt-4 text-gray-600">Loading inspections...</p>
             </div>
           </div>
         ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Inspections Table */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">All Inspections</h3>
                  <InspectionTable
                    inspections={inspections || []}
                    loading={loading}
                    onAction={handleInspectionAction}
                    currentPage={page}
                    totalPages={Math.ceil(total / limit)}
                    onPageChange={handlePageChange}
                  />
                </div>
              </div>
            </div>

            {/* Recent Inspections Timeline */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                  <RecentInspectionsTimeline
                    inspections={inspections?.slice(0, 5) || []}
                    onInspectionClick={(id) => navigate(`/inspections/${id}`)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      
    </div>
  );
};

export default InspectionsDashboardPage;
