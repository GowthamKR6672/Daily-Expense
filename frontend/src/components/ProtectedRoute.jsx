import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import MaintenanceScreen from './MaintenanceScreen';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading, maintenanceMode } = useContext(AuthContext);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // Show maintenance screen for regular users (admin is exempt)
  if (maintenanceMode !== 'none' && user.role !== 'admin') {
    return <MaintenanceScreen mode={maintenanceMode} />;
  }

  return children;
};

export default ProtectedRoute;
