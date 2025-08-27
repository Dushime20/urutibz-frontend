import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import InspectionsDashboardPage from './InspectionsDashboardPage';

const RoleAwareInspections: React.FC = () => {
  const { user } = useAuth();

  if (user?.role === 'inspector') {
    return <Navigate to="/inspector" replace />;
  }

  return <InspectionsDashboardPage />;
};

export default RoleAwareInspections;


