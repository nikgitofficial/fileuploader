// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { token } = useAuth();
  const user = JSON.parse(localStorage.getItem('user'));

  if (!token) return <Navigate to="/login" replace />;

  if (adminOnly && user?.role !== 'admin') return <Navigate to="/" replace />;

  return children;
};

export default ProtectedRoute;
