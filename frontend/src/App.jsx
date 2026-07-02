import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Loading Component
const PageLoader = () => (
  <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-dark-bg">
    <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin" />
  </div>
);

// Pages - Auth
const Login = lazy(() => import('./pages/auth/Login'));
const ChangePassword = lazy(() => import('./pages/auth/ChangePassword'));
const ErrorPage = lazy(() => import('./pages/ErrorPage'));

// Pages - Super Admin
const SuperAdminDashboard = lazy(() => import('./pages/super-admin/SuperAdminDashboard'));
const ActivityLogs = lazy(() => import('./pages/super-admin/ActivityLogs'));
const SecurityCenter = lazy(() => import('./pages/super-admin/SecurityCenter'));
const ExecutiveDashboard = lazy(() => import('./pages/super-admin/ExecutiveDashboard'));
const Reports = lazy(() => import('./pages/reports/Reports'));
const LoanPaymentReports = lazy(() => import('./pages/reports/LoanPaymentReports'));
const ChitPaymentReports = lazy(() => import('./pages/reports/ChitPaymentReports'));

// Pages - Admin
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));
const CustomerList = lazy(() => import('./pages/customers/CustomerList'));
const CreateLoan = lazy(() => import('./pages/loans/CreateLoan'));

const OrderList = lazy(() => import('./pages/orders/OrderList'));
const OrderDetails = lazy(() => import('./pages/orders/OrderDetails'));
const BillingCalculator = lazy(() => import('./pages/orders/BillingCalculator'));
const Settings = lazy(() => import('./pages/dashboard/Settings'));
const ChitDashboard = lazy(() => import('./pages/chitFund/ChitDashboard'));
const SchemeManagement = lazy(() => import('./pages/chitFund/SchemeManagement'));
const SchemeDetails = lazy(() => import('./pages/chitFund/SchemeDetails'));
const SubscriberLedger = lazy(() => import('./pages/chitFund/SubscriberLedger'));
const SupportManagement = lazy(() => import('./pages/admin/SupportManagement'));
const AdminKycManagement = lazy(() => import('./pages/goldLoan/AdminKycManagement'));
const AdminLoanApprovals = lazy(() => import('./pages/goldLoan/AdminLoanApprovals'));
const AdminClosedHistory = lazy(() => import('./pages/goldLoan/AdminClosedHistory'));
const GlobalLoanLedger = lazy(() => import('./pages/goldLoan/GlobalLoanLedger'));
const LoanLedger = lazy(() => import('./pages/goldLoan/LoanLedger'));
const InvoiceList = lazy(() => import('./pages/invoices/InvoiceList'));
const LoanPaymentsCollection = lazy(() => import('./pages/loanPayments/LoanPaymentsCollection'));
const InventoryDashboard = lazy(() => import('./pages/inventory/InventoryDashboard'));
const StockEntry = lazy(() => import('./pages/inventory/StockEntry'));
const StockHistory = lazy(() => import('./pages/inventory/StockHistory'));

// Pages - Customer
const CustomerDashboard = lazy(() => import('./pages/customer/CustomerDashboard'));
const CustomerProfile = lazy(() => import('./pages/customer/CustomerProfile'));
const KycVerification = lazy(() => import('./pages/customer/KycVerification'));
const SupportCenter = lazy(() => import('./pages/customer/SupportCenter'));
const MyLoans = lazy(() => import('./pages/customer/MyLoans'));
const PaymentHistory = lazy(() => import('./pages/customer/PaymentHistory'));
const ServicesOverview = lazy(() => import('./pages/customer/ServicesOverview'));
const GoldLoanApply = lazy(() => import('./pages/goldLoan/GoldLoanApply'));
const GoldLoanDashboard = lazy(() => import('./pages/goldLoan/GoldLoanDashboard'));
const CustomerLoanHistory = lazy(() => import('./pages/goldLoan/CustomerLoanHistory'));
const MyChits = lazy(() => import('./pages/customer/MyChits'));
const CustomerJewelryOrders = lazy(() => import('./pages/customer/CustomerJewelryOrders'));

// Styles
import './styles/global.css';

function App() {
  return (
    <>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/unauthorized" element={<ErrorPage title="Access Denied" code="403" type="unauthorized" />} />
          </Route>
          
          {/* Home Redirect */}
          <Route path="/" element={<HomeRedirect />} />
          
          {/* SUPER_ADMIN Routes */}
          <Route path="/super-admin" element={<DashboardLayout allowedRoles={['SUPER_ADMIN']} />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<SuperAdminDashboard />} />
            <Route path="analytics" element={<ExecutiveDashboard />} />
            <Route path="activity-logs" element={<ActivityLogs />} />
            <Route path="security" element={<SecurityCenter />} />
            <Route path="reports" element={<Reports />} />
            <Route path="reports/loan-payments" element={<LoanPaymentReports />} />
            <Route path="reports/chit-payments" element={<ChitPaymentReports />} />
          </Route>

          {/* ADMIN Routes */}
          <Route path="/admin" element={<DashboardLayout allowedRoles={['ADMIN', 'SUPER_ADMIN']} />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="customers" element={<CustomerList />} />
            <Route path="loans" element={<CreateLoan />} />
            <Route path="jewelry-orders" element={<OrderList />} />
            <Route path="jewelry-orders/:id" element={<OrderDetails />} />
            <Route path="billing-calculator" element={<BillingCalculator />} />
            <Route path="chit-fund" element={<ChitDashboard />} />
            <Route path="chit-fund/schemes" element={<SchemeManagement />} />
            <Route path="chit-fund/scheme/:id" element={<SchemeDetails />} />
            <Route path="chit-fund/subscriber/:id" element={<SubscriberLedger />} />
            <Route path="reports" element={<Reports />} />
            <Route path="reports/loan-payments" element={<LoanPaymentReports />} />
            <Route path="reports/chit-payments" element={<ChitPaymentReports />} />
            <Route path="support" element={<SupportManagement />} />
            <Route path="kyc-management" element={<AdminKycManagement />} />
            <Route path="gold-loan/approvals" element={<AdminLoanApprovals />} />
            <Route path="gold-loan/closed-history" element={<AdminClosedHistory />} />
            <Route path="loan-ledger" element={<GlobalLoanLedger />} />
            <Route path="invoices" element={<InvoiceList />} />
            <Route path="gold-loan/:id/ledger" element={<LoanLedger />} />
            <Route path="loan-payments" element={<LoanPaymentsCollection />} />
            <Route path="inventory" element={<InventoryDashboard />} />
            <Route path="inventory/stock-entry" element={<StockEntry />} />
            <Route path="inventory/stock-history" element={<StockHistory />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* CUSTOMER Routes */}
          <Route path="/customer" element={<DashboardLayout allowedRoles={['CUSTOMER']} />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<CustomerDashboard />} />
            <Route path="my-loans" element={<MyLoans />} />
            <Route path="loan-ledger" element={<GlobalLoanLedger />} />
            <Route path="my-invoices" element={<InvoiceList />} />
            <Route path="my-chits" element={<MyChits />} />
            <Route path="payments" element={<PaymentHistory />} />
            <Route path="services" element={<ServicesOverview />} />
            <Route path="services/loan" element={<GoldLoanApply />} />
            <Route path="services/order" element={<CustomerJewelryOrders />} />
            <Route path="services/order/:id" element={<OrderDetails />} />
            <Route path="gold-loan/dashboard" element={<GoldLoanDashboard />} />
            <Route path="gold-loan/history" element={<CustomerLoanHistory />} />
            <Route path="gold-loan/:id/ledger" element={<LoanLedger />} />
            <Route path="profile" element={<CustomerProfile />} />
            <Route path="kyc-verification" element={<KycVerification />} />
            <Route path="support" element={<SupportCenter />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<ErrorPage title="Page Not Found" code="404" />} />
        </Routes>
      </Suspense>
      
      <ToastContainer position="top-right" theme="colored" />
    </>
  );
}

const HomeRedirect = () => {
  const userString = localStorage.getItem('user');
  if (!userString || userString === "undefined") return <Navigate to="/login" replace />;
  
  try {
    const user = JSON.parse(userString);
    const role = (user.role || '').toUpperCase();
    if (role === 'SUPER_ADMIN') return <Navigate to="/super-admin/dashboard" replace />;
    if (role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (role === 'CUSTOMER') return <Navigate to="/customer/dashboard" replace />;
    return <Navigate to="/login" replace />;
  } catch (e) {
    return <Navigate to="/login" replace />;
  }
};

export default App;
