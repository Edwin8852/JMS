import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  Coins, 
  CreditCard, 
  Package, 
  ShoppingBag, 
  BarChart3, 
  Bell, 
  Settings,
  LogOut,
  ShieldCheck,
  Activity,
  Database,
  History,
  User as UserIcon,
  HelpCircle,
  TrendingUp,
  Wallet,
  FileText,
  Calculator,
  ChevronDown
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { useTranslation } from 'react-i18next';
import sdrsLogo from '../assets/SDRS Logo.png';

const SidebarGroup = ({ item, isOpen, toggleSidebar, location }) => {
  const isActive = item.paths.some(path => location.pathname === path || location.pathname.startsWith(`${path}/`));
  const [isExpanded, setIsExpanded] = useState(isActive);

  useEffect(() => {
    if (isActive) setIsExpanded(true);
  }, [location.pathname, isActive]);

  return (
    <div className="space-y-1">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center justify-between px-4 py-2.5 transition-all duration-300 ease-in-out hover:translate-x-[2px] group rounded-[14px] ${
          isActive && !isExpanded
          ? 'bg-gradient-to-r from-white to-[#f8f5ee] text-[#1f2937] shadow-[0_4px_12px_rgba(0,0,0,0.08)] font-bold' 
          : 'text-white/90 hover:text-white hover:bg-white/10'
        }`}
      >
        <div className="flex items-center gap-4">
          <item.icon size={20} className={`transition-transform group-hover:scale-110 ${isActive && !isExpanded ? 'text-[#c2932e]' : ''}`} />
          <span className="whitespace-nowrap text-base font-semibold">{item.name}</span>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className={isActive && !isExpanded ? 'text-gray-400' : 'text-white/60'}
        >
          <ChevronDown size={16} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pl-11 pr-2 py-1 space-y-1">
              {item.children.map(child => (
                <NavLink
                  key={child.path}
                  to={child.path}
                  onClick={() => window.innerWidth < 1024 && toggleSidebar()}
                  className={({ isActive: isChildActive }) => 
                    `flex items-center gap-3 px-3 py-2 transition-all duration-300 ease-in-out rounded-[10px] text-base font-medium ${
                      isChildActive 
                      ? 'bg-white/20 text-white font-bold shadow-sm' 
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`
                  }
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${location.pathname === child.path || location.pathname.startsWith(`${child.path}/`) ? 'bg-white' : 'bg-current opacity-50'}`}></span>
                  <span className="whitespace-nowrap">{child.name}</span>
                </NavLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);

  // Define menu items for all roles
  const menuConfig = {
    SUPER_ADMIN: [
      { name: t('Dashboard'), icon: LayoutDashboard, path: '/super-admin/dashboard' },
      { name: t('Analytics'), icon: BarChart3, path: '/super-admin/analytics' },
      { name: t('Activity Logs'), icon: Activity, path: '/super-admin/activity-logs' },
      { name: t('Security Center'), icon: ShieldCheck, path: '/super-admin/security' },
      { 
        isGroup: true,
        name: t('Inventory'), 
        icon: Package, 
        paths: ['/admin/inventory', '/admin/inventory/stock-entry', '/admin/inventory/stock-history'],
        children: [
          { name: t('Inventory Dashboard'), path: '/admin/inventory' },
          { name: t('Stock Entry'), path: '/admin/inventory/stock-entry' },
          { name: t('Stock History'), path: '/admin/inventory/stock-history' }
        ]
      },
      { name: t('Reports'), icon: BarChart3, path: '/super-admin/reports' },
    ],
    ADMIN: [
      { name: t('Dashboard'), icon: LayoutDashboard, path: '/admin/dashboard' },
      { name: t('Customers'), icon: Users, path: '/admin/customers' },
      { 
        isGroup: true,
        name: t('Loans'), 
        icon: Coins, 
        paths: ['/admin/loans', '/admin/loan-payments', '/admin/gold-loan/approvals', '/admin/gold-loan/closed-history', '/admin/loan-ledger', '/admin/invoices'],
        children: [
          { name: t('Gold Loan Management'), path: '/admin/loans' },
          { name: t('Loan Payments'), path: '/admin/loan-payments' },
          { name: t('Loan Approvals'), path: '/admin/gold-loan/approvals' },
          { name: t('Closed History'), path: '/admin/gold-loan/closed-history' },
          { name: t('Loan Ledger'), path: '/admin/loan-ledger' },
          { name: t('Invoices'), path: '/admin/invoices' },
        ]
      },
      { 
        isGroup: true,
        name: t('Jewellery'),
        icon: ShoppingBag,
        paths: ['/admin/jewelry-orders', '/admin/billing-calculator'],
        children: [
          { name: t('Jewelry Orders'), path: '/admin/jewelry-orders' },
          { name: t('Billing Calculator'), path: '/admin/billing-calculator' }
        ]
      },
      { 
        isGroup: true,
        name: t('Finance & Schemes'),
        icon: Wallet,
        paths: ['/admin/chit-fund'],
        children: [
          { name: t('Chit Fund'), path: '/admin/chit-fund' }
        ]
      },
      { name: t('Documents'), icon: UserIcon, path: '/admin/kyc-management' },
      { name: t('Support Inbox'), icon: HelpCircle, path: '/admin/support' },
      {
        isGroup: true,
        name: t('Inventory'),
        icon: Package,
        paths: ['/admin/inventory', '/admin/inventory/stock-entry', '/admin/inventory/stock-history'],
        children: [
          { name: t('Inventory Dashboard'), path: '/admin/inventory' },
          { name: t('Stock Entry'), path: '/admin/inventory/stock-entry' },
          { name: t('Stock History'), path: '/admin/inventory/stock-history' },
        ]
      },
      { name: t('Reports'), icon: FileText, path: '/admin/reports' },
      { name: t('Settings'), icon: Settings, path: '/admin/settings' },
    ],
    CUSTOMER: [
      { name: t('Dashboard'), icon: LayoutDashboard, path: '/customer/dashboard' },
      { 
        isGroup: true,
        name: t('Loans'),
        icon: Coins,
        paths: ['/customer/my-loans', '/customer/loan-ledger', '/customer/my-invoices', '/customer/payments'],
        children: [
          { name: t('My Loans'), path: '/customer/my-loans' },
          { name: t('Payments'), path: '/customer/payments' },
          { name: t('Loan Ledger'), path: '/customer/loan-ledger' },
          { name: t('My Invoices'), path: '/customer/my-invoices' },
        ]
      },
      { name: t('My Chits'), icon: Wallet, path: '/customer/my-chits' },
      { name: t('Documents'), icon: ShieldCheck, path: '/customer/kyc-verification' },
      { name: t('Support'), icon: HelpCircle, path: '/customer/support' },
      { name: t('Profile'), icon: UserIcon, path: '/customer/profile' },
    ]
  };

  const menuItems = menuConfig[user?.role] || [];

  return (
    <motion.aside
      initial={false}
      animate={{ width: isOpen ? 280 : 0 }}
      className="fixed left-0 top-0 h-screen bg-[#c2932e] text-white z-50 overflow-hidden lg:relative lg:block shadow-xl shadow-gray-200/50 flex flex-col"
    >
      <div className="p-5 flex items-center gap-3 flex-shrink-0">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg shadow-black/10 overflow-hidden">
          <img src={sdrsLogo} alt="SDRS Logo" className="w-full h-full object-cover scale-[1.35] drop-shadow-md" />
        </div>
        <span className="text-xl font-display font-bold tracking-tight text-white">SDRS <span className="text-white">GOLD FINANCE</span></span>
      </div>

      <nav className="flex-grow px-4 space-y-1 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          if (item.isGroup) {
            return <SidebarGroup key={item.name} item={item} isOpen={isOpen} toggleSidebar={toggleSidebar} location={location} />;
          }

          return (
            <NavLink
              key={item.path}
              onClick={() => window.innerWidth < 1024 && toggleSidebar()}
              to={item.path}
              className={({ isActive }) => 
                `flex items-center gap-4 px-4 py-2.5 transition-all duration-300 ease-in-out hover:translate-x-[2px] group ${
                  isActive 
                  ? 'bg-gradient-to-r from-white to-[#f8f5ee] text-[#1f2937] rounded-[14px] shadow-[0_4px_12px_rgba(0,0,0,0.08)] font-bold' 
                  : 'rounded-xl text-white/90 hover:text-white hover:bg-white/10'
                }`
              }
            >
              <item.icon size={20} className="transition-transform group-hover:scale-110" />
              <span className="whitespace-nowrap text-base font-semibold">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/20 flex-shrink-0">
        <button 
          onClick={() => {
            if (window.innerWidth < 1024) toggleSidebar();
            dispatch(logout());
          }}
          className="flex items-center gap-4 w-full px-4 py-2.5 text-white/90 hover:text-white transition-all rounded-xl hover:bg-white/10 group"
        >
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold text-base">{t('Logout')}</span>
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
