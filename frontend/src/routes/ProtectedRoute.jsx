import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * ProtectedRoute
 * Handles authentication and role-based authorization
 */
const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login but keep the location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRole = user?.role?.toUpperCase();
  const normalizedAllowedRoles = allowedRoles?.map(role => role.toUpperCase());

  if (allowedRoles && !normalizedAllowedRoles.includes(userRole) && userRole !== 'SUPER_ADMIN') {
    // Role not authorized, send to unauthorized page
    console.warn(`[ProtectedRoute] Access denied for role: ${userRole}. Required: ${normalizedAllowedRoles}`);
    return <Navigate to="/unauthorized" replace />;
  }



  return <Outlet />;
};

export default ProtectedRoute;
