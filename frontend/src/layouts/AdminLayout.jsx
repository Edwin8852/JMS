import React, { useState, useEffect } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  Coins, 
  CreditCard, 
  ShoppingBag, 
  BarChart3, 
  Bell, 
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Search,
  User,
  Languages
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { useTranslation } from 'react-i18next';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const dispatch = useDispatch();

  const menuItems = [
    { name: t('Dashboard'), icon: LayoutDashboard, path: '/dashboard' },
    { name: t('Customers'), icon: Users, path: '/customers' },
    { name: t('Loans'), icon: Coins, path: '/loans' },
    { name: t('Payments'), icon: CreditCard, path: '/payments' },
    { name: t('Jewelry Orders'), icon: ShoppingBag, path: '/orders' },
    { name: t('Reports'), icon: BarChart3, path: '/reports' },
    { name: t('Notifications'), icon: Bell, path: '/notifications' },
    { name: t('Settings'), icon: Settings, path: '/settings' },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: isOpen ? 280 : 0 }}
      className="fixed left-0 top-0 h-screen bg-black text-white z-50 overflow-hidden lg:relative lg:block"
    >
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-gold rounded-xl flex items-center justify-center">
          <span className="text-black font-bold text-xl">S</span>
        </div>
        <span className="text-xl font-display font-bold tracking-tight">SDRS <span className="text-gold">GOLD</span></span>
      </div>

      <nav className="mt-8 px-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 ${
              location.pathname === item.path 
              ? 'bg-gold text-black shadow-gold' 
              : 'text-gray-400 hover:text-gold hover:bg-gold/10'
            }`}
          >
            <item.icon size={22} />
            <span className="font-medium">{item.name}</span>
          </Link>
        ))}
      </nav>

      <div className="absolute bottom-8 left-0 w-full px-6">
        <button 
          onClick={() => dispatch(logout())}
          className="flex items-center gap-4 w-full px-4 py-3.5 text-gray-400 hover:text-red-500 transition-colors"
        >
          <LogOut size={22} />
          <span className="font-medium">{t('Logout')}</span>
        </button>
      </div>
    </motion.aside>
  );
};

const Navbar = ({ toggleSidebar }) => {
  const { user } = useSelector(state => state.auth);
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'ta' : 'en');
  };

  return (
    <header className="h-20 glass-card mx-6 mt-4 rounded-2xl flex items-center justify-between px-8 z-40">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-dark-card rounded-lg">
          <Menu size={24} />
        </button>
        <div className="hidden md:flex items-center gap-3 bg-gray-100 dark:bg-dark-card px-4 py-2.5 rounded-xl border border-transparent focus-within:border-gold transition-all">
          <Search size={18} className="text-gray-400" />
          <input 
            type="text" 
            placeholder="Search records..." 
            className="bg-transparent border-none outline-none text-sm w-64"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button 
          onClick={toggleLanguage}
          className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-dark-card rounded-lg transition-colors"
        >
          <Languages size={20} className="text-gold" />
          <span className="text-sm font-medium uppercase">{i18n.language}</span>
        </button>
        
        <div className="w-px h-8 bg-gray-200 dark:bg-dark-border" />

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold">{user?.firstName || 'Admin'}</p>
            <p className="text-xs text-gray-500 uppercase">{user?.role || 'Super Admin'}</p>
          </div>
          <div className="w-10 h-10 bg-gold rounded-full flex items-center justify-center text-black font-bold">
            {user?.firstName?.[0] || 'A'}
          </div>
        </div>
      </div>
    </header>
  );
};

const AdminLayout = () => {
  const [isOpen, setIsOpen] = useState(window.innerWidth >= 1024);
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (user && user.role === 'CUSTOMER') {
    return <Navigate to="/customer/dashboard" replace />;
  }

  return (

    <div className="flex min-h-screen bg-[hsl(var(--background))]">
      {/* Mobile Sidebar Backdrop */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
        />
      )}
      <Sidebar isOpen={isOpen} toggleSidebar={() => setIsOpen(!isOpen)} />
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Navbar toggleSidebar={() => setIsOpen(!isOpen)} />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
