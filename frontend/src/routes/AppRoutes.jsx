import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Core
import Login from '../pages/auth/Login';
import NotFound from '../pages/errors/NotFound';
import ProtectedRoute from './ProtectedRoute';

// Layouts
import AdminLayout from '../layouts/AdminLayout';
import CustomerLayout from '../layouts/CustomerLayout';

// Admin Pages
import Dashboard from '../pages/dashboard/Dashboard';
import CustomerList from '../pages/customers/CustomerList';
import LoanList from '../pages/gold-finance/LoanList';
import CreateLoan from '../pages/gold-finance/CreateLoan';
import ReportList from '../pages/reports/Reports';
import OrderList from '../pages/orders/OrderList';
import PaymentList from '../pages/payments/PaymentList';
import ChitDashboard from '../pages/chitFund/ChitDashboard';

// Customer Pages
import CustomerDashboard from '../pages/customer/CustomerDashboard';
import ServicesOverview from '../pages/customer/ServicesOverview';
import ChitServiceSelection from '../pages/customer/ChitServiceSelection';
import MyChits from '../pages/customer/MyChits';
import MyLoans from '../pages/customer/MyLoans';
import LoanApplication from '../pages/customer/LoanApplication';
import PaymentHistory from '../pages/customer/PaymentHistory';
import CustomerProfile from '../pages/customer/CustomerProfile';
import SupportCenter from '../pages/customer/SupportCenter';
import KycCenter from '../pages/customer/KycCenter';
import KycVerification from '../pages/customer/KycVerification';

// Lazy loaded
const CustomerSettings = lazy(() => import('../pages/customer/CustomerSettings'));

const AppRoutes = () => {
  const { isAuthenticated, user } = useSelector(state => state.auth);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={
        isAuthenticated ? (
          <Navigate to={user?.role === 'CUSTOMER' ? "/customer/dashboard" : "/admin/dashboard"} replace />
        ) : (
          <Login />
        )
      } />

      {/* Admin & Super Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/super-admin/dashboard" element={<Dashboard />} />
          <Route path="/dashboard" element={<Navigate to={user?.role === 'SUPER_ADMIN' ? "/super-admin/dashboard" : "/admin/dashboard"} replace />} />

          <Route path="/admin/customers" element={<CustomerList />} />
          <Route path="/customers" element={<Navigate to="/admin/customers" replace />} />

          <Route path="/admin/loans" element={<LoanList />} />
          <Route path="/admin/loans/new" element={<CreateLoan />} />
          <Route path="/loans" element={<Navigate to="/admin/loans" replace />} />

          <Route path="/admin/payments" element={<PaymentList />} />
          <Route path="/payments" element={<Navigate to="/admin/payments" replace />} />

          <Route path="/admin/orders" element={<OrderList />} />
          <Route path="/orders" element={<Navigate to="/admin/orders" replace />} />

          <Route path="/admin/reports" element={<ReportList />} />
          <Route path="/reports" element={<Navigate to="/admin/reports" replace />} />

          <Route path="/admin/chit-fund" element={<ChitDashboard />} />
          <Route path="/chit-fund" element={<Navigate to="/admin/chit-fund" replace />} />
        </Route>
      </Route>

      {/* Customer Routes */}
      <Route element={<ProtectedRoute allowedRoles={['CUSTOMER']} />}>
        <Route element={<CustomerLayout />}>
          <Route path="/customer/dashboard" element={<CustomerDashboard />} />
          <Route path="/customer/services" element={<ServicesOverview />} />
          <Route path="/customer/services/chit-schemes" element={<ChitServiceSelection />} />
          <Route path="/customer/my-chits" element={<MyChits />} />
          <Route path="/customer/loans" element={<MyLoans />} />
          <Route path="/customer/loans/apply" element={<LoanApplication />} />
          <Route path="/customer/payments" element={<PaymentHistory />} />
          <Route path="/customer/profile" element={<CustomerProfile />} />
          <Route path="/customer/support" element={<SupportCenter />} />
          <Route path="/customer/kyc" element={<KycCenter />} />
          <Route path="/customer/kyc/verify" element={<KycVerification />} />
          <Route path="/customer/notifications" element={<div className="p-8"><h1>Notifications</h1></div>} />
          <Route path="/customer/settings" element={
            <Suspense fallback={<div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div></div>}>
              <CustomerSettings />
            </Suspense>
          } />
        </Route>
      </Route>

      {/* Root Redirect */}
      <Route path="/" element={
        isAuthenticated ? (
          <Navigate to={user?.role === 'CUSTOMER' ? "/customer/dashboard" : "/admin/dashboard"} replace />
        ) : (
          <Navigate to="/login" replace />
        )
      } />

      {/* Error Pages */}
      <Route path="/unauthorized" element={<div className="h-screen flex items-center justify-center"><h1>403 - Access Denied</h1></div>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
