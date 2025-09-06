import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { RiskProfile, RiskProfileFilters, BulkCreateRiskProfileResponse } from '../../../types/riskManagement';

// State interface
interface RiskManagementState {
  profiles: RiskProfile[];
  loading: boolean;
  error: string | null;
  filters: RiskProfileFilters;
  pagination: {
    page: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  bulkOperation: {
    loading: boolean;
    result: BulkCreateRiskProfileResponse | null;
    error: string | null;
  };
  selectedProfiles: string[];
  ui: {
    showBulkForm: boolean;
    showProgressModal: boolean;
    showFilters: boolean;
  };
}

// Action types
type RiskManagementAction =
  | { type: 'SET_PROFILES'; payload: RiskProfile[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_FILTERS'; payload: RiskProfileFilters }
  | { type: 'SET_PAGINATION'; payload: Partial<RiskManagementState['pagination']> }
  | { type: 'SET_BULK_OPERATION_LOADING'; payload: boolean }
  | { type: 'SET_BULK_OPERATION_RESULT'; payload: BulkCreateRiskProfileResponse | null }
  | { type: 'SET_BULK_OPERATION_ERROR'; payload: string | null }
  | { type: 'SET_SELECTED_PROFILES'; payload: string[] }
  | { type: 'TOGGLE_PROFILE_SELECTION'; payload: string }
  | { type: 'SELECT_ALL_PROFILES' }
  | { type: 'CLEAR_SELECTED_PROFILES' }
  | { type: 'SET_UI_STATE'; payload: Partial<RiskManagementState['ui']> }
  | { type: 'RESET_BULK_OPERATION' }
  | { type: 'RESET_STATE' };

// Initial state
const initialState: RiskManagementState = {
  profiles: [],
  loading: false,
  error: null,
  filters: {},
  pagination: {
    page: 1,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  },
  bulkOperation: {
    loading: false,
    result: null,
    error: null
  },
  selectedProfiles: [],
  ui: {
    showBulkForm: false,
    showProgressModal: false,
    showFilters: false
  }
};

// Reducer
const riskManagementReducer = (state: RiskManagementState, action: RiskManagementAction): RiskManagementState => {
  switch (action.type) {
    case 'SET_PROFILES':
      return { ...state, profiles: action.payload };
    
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_FILTERS':
      return { 
        ...state, 
        filters: action.payload,
        pagination: { ...state.pagination, page: 1 } // Reset to first page when filters change
      };
    
    case 'SET_PAGINATION':
      return { ...state, pagination: { ...state.pagination, ...action.payload } };
    
    case 'SET_BULK_OPERATION_LOADING':
      return { 
        ...state, 
        bulkOperation: { ...state.bulkOperation, loading: action.payload }
      };
    
    case 'SET_BULK_OPERATION_RESULT':
      return { 
        ...state, 
        bulkOperation: { ...state.bulkOperation, result: action.payload, error: null }
      };
    
    case 'SET_BULK_OPERATION_ERROR':
      return { 
        ...state, 
        bulkOperation: { ...state.bulkOperation, error: action.payload, result: null }
      };
    
    case 'SET_SELECTED_PROFILES':
      return { ...state, selectedProfiles: action.payload };
    
    case 'TOGGLE_PROFILE_SELECTION':
      return {
        ...state,
        selectedProfiles: state.selectedProfiles.includes(action.payload)
          ? state.selectedProfiles.filter(id => id !== action.payload)
          : [...state.selectedProfiles, action.payload]
      };
    
    case 'SELECT_ALL_PROFILES':
      return {
        ...state,
        selectedProfiles: state.profiles.map(profile => profile.id)
      };
    
    case 'CLEAR_SELECTED_PROFILES':
      return { ...state, selectedProfiles: [] };
    
    case 'SET_UI_STATE':
      return { ...state, ui: { ...state.ui, ...action.payload } };
    
    case 'RESET_BULK_OPERATION':
      return {
        ...state,
        bulkOperation: {
          loading: false,
          result: null,
          error: null
        }
      };
    
    case 'RESET_STATE':
      return initialState;
    
    default:
      return state;
  }
};

// Context interface
interface RiskManagementContextType {
  state: RiskManagementState;
  dispatch: React.Dispatch<RiskManagementAction>;
  
  // Convenience methods
  setProfiles: (profiles: RiskProfile[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: RiskProfileFilters) => void;
  setPagination: (pagination: Partial<RiskManagementState['pagination']>) => void;
  
  // Bulk operation methods
  setBulkOperationLoading: (loading: boolean) => void;
  setBulkOperationResult: (result: BulkCreateRiskProfileResponse | null) => void;
  setBulkOperationError: (error: string | null) => void;
  resetBulkOperation: () => void;
  
  // Selection methods
  toggleProfileSelection: (profileId: string) => void;
  selectAllProfiles: () => void;
  clearSelectedProfiles: () => void;
  setSelectedProfiles: (profileIds: string[]) => void;
  
  // UI methods
  showBulkForm: () => void;
  hideBulkForm: () => void;
  showProgressModal: () => void;
  hideProgressModal: () => void;
  toggleFilters: () => void;
  
  // Utility methods
  resetState: () => void;
}

// Create context
const RiskManagementContext = createContext<RiskManagementContextType | undefined>(undefined);

// Provider component
interface RiskManagementProviderProps {
  children: ReactNode;
}

export const RiskManagementProvider: React.FC<RiskManagementProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(riskManagementReducer, initialState);

  // Convenience methods
  const setProfiles = (profiles: RiskProfile[]) => {
    dispatch({ type: 'SET_PROFILES', payload: profiles });
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const setError = (error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const setFilters = (filters: RiskProfileFilters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  };

  const setPagination = (pagination: Partial<RiskManagementState['pagination']>) => {
    dispatch({ type: 'SET_PAGINATION', payload: pagination });
  };

  // Bulk operation methods
  const setBulkOperationLoading = (loading: boolean) => {
    dispatch({ type: 'SET_BULK_OPERATION_LOADING', payload: loading });
  };

  const setBulkOperationResult = (result: BulkCreateRiskProfileResponse | null) => {
    dispatch({ type: 'SET_BULK_OPERATION_RESULT', payload: result });
  };

  const setBulkOperationError = (error: string | null) => {
    dispatch({ type: 'SET_BULK_OPERATION_ERROR', payload: error });
  };

  const resetBulkOperation = () => {
    dispatch({ type: 'RESET_BULK_OPERATION' });
  };

  // Selection methods
  const toggleProfileSelection = (profileId: string) => {
    dispatch({ type: 'TOGGLE_PROFILE_SELECTION', payload: profileId });
  };

  const selectAllProfiles = () => {
    dispatch({ type: 'SELECT_ALL_PROFILES' });
  };

  const clearSelectedProfiles = () => {
    dispatch({ type: 'CLEAR_SELECTED_PROFILES' });
  };

  const setSelectedProfiles = (profileIds: string[]) => {
    dispatch({ type: 'SET_SELECTED_PROFILES', payload: profileIds });
  };

  // UI methods
  const showBulkForm = () => {
    dispatch({ type: 'SET_UI_STATE', payload: { showBulkForm: true } });
  };

  const hideBulkForm = () => {
    dispatch({ type: 'SET_UI_STATE', payload: { showBulkForm: false } });
  };

  const showProgressModal = () => {
    dispatch({ type: 'SET_UI_STATE', payload: { showProgressModal: true } });
  };

  const hideProgressModal = () => {
    dispatch({ type: 'SET_UI_STATE', payload: { showProgressModal: false } });
  };

  const toggleFilters = () => {
    dispatch({ type: 'SET_UI_STATE', payload: { showFilters: !state.ui.showFilters } });
  };

  // Utility methods
  const resetState = () => {
    dispatch({ type: 'RESET_STATE' });
  };

  const contextValue: RiskManagementContextType = {
    state,
    dispatch,
    setProfiles,
    setLoading,
    setError,
    setFilters,
    setPagination,
    setBulkOperationLoading,
    setBulkOperationResult,
    setBulkOperationError,
    resetBulkOperation,
    toggleProfileSelection,
    selectAllProfiles,
    clearSelectedProfiles,
    setSelectedProfiles,
    showBulkForm,
    hideBulkForm,
    showProgressModal,
    hideProgressModal,
    toggleFilters,
    resetState
  };

  return (
    <RiskManagementContext.Provider value={contextValue}>
      {children}
    </RiskManagementContext.Provider>
  );
};

// Hook to use the context
export const useRiskManagement = (): RiskManagementContextType => {
  const context = useContext(RiskManagementContext);
  if (context === undefined) {
    throw new Error('useRiskManagement must be used within a RiskManagementProvider');
  }
  return context;
};
