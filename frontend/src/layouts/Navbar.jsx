import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { 
  Bell, 
  Search, 
  User, 
  LogOut, 
  Settings as SettingsIcon, 
  ChevronDown,
  Clock,
  Menu,
  Camera,
  X,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  Loader2
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout, updateUserSync } from '../store/slices/authSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { fetchNotifications } from '../store/slices/notificationSlice';
import NotificationPanel from './NotificationPanel';
import authApi from '../api/auth.api';
import { toast } from 'react-toastify';

const Navbar = ({ toggleSidebar }) => {
  const { t, i18n } = useTranslation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [previewImage, setPreviewImage] = useState(false);

  // Change Password Modal state
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  // Logout state
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Change Photo state
  const changePhotoRef = useRef(null);
  const [photoLoading, setPhotoLoading] = useState(false);

  const { user } = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.notifications);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ── View Profile ──────────────────────────────────────────────────────────
  const handleProfileNavigation = () => {
    setShowProfileMenu(false);
    const role = user?.role || '';
    if (role === 'CUSTOMER') {
      navigate('/customer/profile');
    } else {
      navigate('/admin/settings');
    }
  };

  // ── Account Settings ──────────────────────────────────────────────────────
  const handleAccountSettings = () => {
    setShowProfileMenu(false);
    const role = user?.role || '';
    if (role === 'CUSTOMER') {
      navigate('/customer/settings');
    } else {
      navigate('/admin/settings');
    }
  };

  // ── Change Photo ──────────────────────────────────────────────────────────
  const handleChangePhotoClick = () => {
    setShowProfileMenu(false);
    changePhotoRef.current?.click();
  };

  const handlePhotoFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a jpg, jpeg, png, or webp image');
      e.target.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      e.target.value = '';
      return;
    }

    setPhotoLoading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const res = await authApi.updateProfile({ profileImage: reader.result });
        if (res.data.success) {
          dispatch(updateUserSync(res.data.user));
          toast.success('Profile photo updated successfully!');
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to update photo');
      } finally {
        setPhotoLoading(false);
        e.target.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  // ── Change Password ───────────────────────────────────────────────────────
  const handleOpenChangePassword = () => {
    setShowProfileMenu(false);
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setPasswordError('');
    setShowCurrentPw(false);
    setShowNewPw(false);
    setShowConfirmPw(false);
    setShowChangePasswordModal(true);
  };

  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordForm;
    setPasswordError('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All fields are required');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    try {
      setPasswordLoading(true);
      const res = await authApi.changePassword({ currentPassword, newPassword });
      if (res.data.success) {
        toast.success('Password changed successfully!');
        setShowChangePasswordModal(false);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password. Check your current password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  // ── Utilities ─────────────────────────────────────────────────────────────
  const toggleLanguage = () => {
    const nextLng = i18n.language === 'en' ? 'ta' : 'en';
    i18n.changeLanguage(nextLng);
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    dispatch(fetchNotifications());
    return () => clearInterval(timer);
  }, [dispatch]);

  // Handle ESC key for modals
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setPreviewImage(false);
        setShowProfileMenu(false);
        setShowNotifications(false);
        setShowChangePasswordModal(false);
        setShowLogoutModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Manage body scroll for modals
  useEffect(() => {
    if (showChangePasswordModal || previewImage || showLogoutModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showChangePasswordModal, previewImage, showLogoutModal]);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showProfileMenu && !e.target.closest('#profile-menu-container') && !e.target.closest('#profile-btn')) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileMenu]);

  return (
    <header className="h-20 bg-white/80 dark:bg-dark-surface/80 backdrop-blur-xl border-b border-gray-100 dark:border-dark-border px-4 md:px-8 flex items-center justify-between sticky top-0 z-40">

      {/* Hidden file input for photo change */}
      <input
        type="file"
        ref={changePhotoRef}
        onChange={handlePhotoFileChange}
        accept=".jpg,.jpeg,.png,.webp"
        className="hidden"
      />

      <div className="flex items-center gap-4">
        {/* Mobile Toggle Burger Menu */}
        <button 
          onClick={toggleSidebar} 
          className="lg:hidden p-2.5 bg-gray-50 dark:bg-dark-card text-gray-500 hover:text-gold rounded-xl transition-all border border-transparent focus:border-gold/30"
        >
          <Menu size={20} />
        </button>


      </div>

      <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
        {/* Language Toggle */}
        <button 
          onClick={toggleLanguage}
          className="flex items-center gap-2 px-3 py-2 bg-gold/10 text-gold rounded-xl text-xs font-black border border-gold/20 hover:bg-gold hover:text-black transition-all"
        >
          {i18n.language === 'en' ? 'தமிழ்' : 'ENGLISH'}
        </button>

        {/* Real-time Clock */}
        <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-dark-card rounded-xl text-gray-500 font-medium text-sm">
          <Clock size={16} />
          {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button 
            id="notification-btn"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className={`relative p-2.5 rounded-xl transition-all ${
              showNotifications ? 'bg-gold-gradient text-white shadow-lg shadow-gold/20' : 'bg-gray-50 dark:bg-dark-card text-gray-500 hover:text-gold'
            }`}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-dark-card animate-pulse" />
            )}
          </button>

          <AnimatePresence>
            {showNotifications && <NotificationPanel />}
          </AnimatePresence>
        </div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button 
            id="profile-btn"
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-3 p-1.5 bg-gray-50 dark:bg-dark-card rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group"
          >
            <div className="relative w-10 h-10 bg-gold-gradient rounded-xl flex items-center justify-center text-white font-bold shadow-sm overflow-hidden group-hover:shadow-gold/30 transition-shadow">
              {photoLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : user?.profileImage ? (
                <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                user?.firstName?.[0] || 'A'
              )}
            </div>
            <div className="hidden md:block text-left mr-2">
              <p className="text-xs font-bold text-gray-900 dark:text-white">{user?.firstName} {user?.lastName}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-tighter">{user?.role?.replace('_', ' ')}</p>
            </div>
            <ChevronDown size={14} className={`text-gray-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showProfileMenu && (
              <>
                {/* Mobile Backdrop */}
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }} 
                  className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 sm:hidden"
                  onClick={() => setShowProfileMenu(false)}
                />
                
                {/* Profile Dropdown Modal */}
                <motion.div
                  id="profile-menu-container"
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="fixed inset-0 m-auto h-max w-[90vw] max-w-[320px] z-50 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-3 sm:m-0 sm:w-[320px] bg-white/95 dark:bg-dark-surface/95 backdrop-blur-xl rounded-[24px] shadow-2xl border border-gray-100 dark:border-dark-border overflow-hidden"
                >
                  {/* Profile Header Area */}
                  <div className="relative p-6 flex flex-col items-center justify-center border-b border-gray-100 dark:border-dark-border bg-gradient-to-b from-gold/10 to-transparent">
                    {/* Enlarged Avatar with Lightbox trigger */}
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewImage(true);
                        setShowProfileMenu(false);
                      }}
                      className="relative w-28 h-28 rounded-full p-1 bg-gold-gradient cursor-pointer group/avatar hover:scale-105 transition-transform duration-300 shadow-xl shadow-gold/20"
                    >
                      <div className="w-full h-full rounded-full overflow-hidden border-[4px] border-white dark:border-dark-surface relative z-10 bg-white dark:bg-dark-surface">
                        {user?.profileImage ? (
                          <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gold">
                            {user?.firstName?.[0] || 'A'}
                          </div>
                        )}
                      </div>
                      
                      {/* Hover Overlay for Zoom */}
                      <div className="absolute inset-1 rounded-full bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity z-20 flex items-center justify-center text-white backdrop-blur-[2px]">
                        <Search size={28} />
                      </div>
                    </div>
                    
                    <h3 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">
                      {user?.firstName} {user?.lastName}
                    </h3>
                    <p className="text-sm text-gray-500 font-medium mt-0.5">{user?.email}</p>
                    <span className="mt-3 px-4 py-1.5 bg-gold/10 text-gold rounded-full text-xs font-bold uppercase tracking-widest border border-gold/20">
                      {user?.role?.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Actions List */}
                  <div className="p-3">
                    {/* View Profile */}
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleProfileNavigation(); }}
                      className="flex items-center gap-4 w-full px-4 py-3.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gold/10 hover:text-gold rounded-2xl transition-all group cursor-pointer"
                    >
                      <div className="p-2 bg-gray-50 dark:bg-dark-card rounded-xl group-hover:bg-gold/20 group-hover:text-gold text-gray-500 transition-colors">
                        <User size={18} />
                      </div>
                      {t('View Profile')}
                    </button>
                    
                    {/* Change Photo */}
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleChangePhotoClick(); }}
                      disabled={photoLoading}
                      className="flex items-center gap-4 w-full px-4 py-3.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gold/10 hover:text-gold rounded-2xl transition-all group cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <div className="p-2 bg-gray-50 dark:bg-dark-card rounded-xl group-hover:bg-gold/20 group-hover:text-gold text-gray-500 transition-colors">
                        {photoLoading ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
                      </div>
                      {photoLoading ? t('Uploading...') : t('Change Photo')}
                    </button>

                    {/* Change Password */}
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleOpenChangePassword(); }}
                      className="flex items-center gap-4 w-full px-4 py-3.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gold/10 hover:text-gold rounded-2xl transition-all group cursor-pointer"
                    >
                      <div className="p-2 bg-gray-50 dark:bg-dark-card rounded-xl group-hover:bg-gold/20 group-hover:text-gold text-gray-500 transition-colors">
                        <Lock size={18} />
                      </div>
                      {t('Change Password')}
                    </button>

                    {/* Account Settings */}
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleAccountSettings(); }}
                      className="flex items-center gap-4 w-full px-4 py-3.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gold/10 hover:text-gold rounded-2xl transition-all group cursor-pointer"
                    >
                      <div className="p-2 bg-gray-50 dark:bg-dark-card rounded-xl group-hover:bg-gold/20 group-hover:text-gold text-gray-500 transition-colors">
                        <SettingsIcon size={18} />
                      </div>
                      {t('Account Settings')}
                    </button>
                    
                    <div className="my-2 mx-4 border-t border-gray-100 dark:border-dark-border" />
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowProfileMenu(false);
                        setShowLogoutModal(true);
                      }}
                      className="flex items-center gap-4 w-full px-4 py-3.5 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-2xl transition-all group cursor-pointer"
                    >
                      <div className="p-2 bg-red-50 dark:bg-red-500/10 rounded-xl group-hover:bg-red-100 dark:group-hover:bg-red-500/20 transition-colors">
                        <LogOut size={18} />
                      </div>
                      {t('Logout Session')}
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

        </div>
      </div>

      {/* ── Avatar Lightbox / Image Preview Modal (Portal) ─────────────────── */}
      {createPortal(
        <AnimatePresence>
          {previewImage && (
            <div 
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
              onClick={() => setPreviewImage(false)}
            >
              {/* Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              />
              
              {/* Close Button */}
              <button 
                className="absolute top-6 right-6 z-[10000] text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full backdrop-blur-xl transition-all cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewImage(false);
                }}
              >
                <X size={24} />
              </button>
              
              {/* Enlarged Avatar */}
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="relative z-[10000] aspect-square rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(255,215,0,0.3)] border-[3px] border-gold/40 flex items-center justify-center bg-dark-surface w-[220px] sm:w-[280px] max-w-[90vw] max-h-[80vh]"
                onClick={(e) => e.stopPropagation()}
              >
                {user?.profileImage ? (
                  <img src={user.profileImage} alt="Profile Preview" className="w-full h-full object-contain bg-black/20" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-8xl sm:text-9xl font-bold text-gold">
                    {user?.firstName?.[0] || 'A'}
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* ── Change Password Modal (Portal) ─────────────────────────────────── */}
      {createPortal(
        <AnimatePresence>
          {showChangePasswordModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
              onClick={() => setShowChangePasswordModal(false)}
            >
              {/* Backdrop */}
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

              {/* Modal Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="relative z-10 w-full max-w-md bg-white dark:bg-dark-surface rounded-3xl shadow-2xl border border-gray-100 dark:border-dark-border overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-dark-border bg-gradient-to-r from-gold/10 to-transparent">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gold/10 rounded-xl">
                      <Lock size={20} className="text-gold" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Change Password</h3>
                      <p className="text-xs text-gray-500">Keep your account secure</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowChangePasswordModal(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-dark-card rounded-xl transition-colors text-gray-500 hover:text-gray-700"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Form */}
                <div className="p-6 space-y-4">
                  {/* Error */}
                  {passwordError && (
                    <div className="p-3 bg-red-50 dark:bg-red-500/10 text-red-500 text-sm rounded-xl border border-red-100 dark:border-red-500/20 font-medium">
                      {passwordError}
                    </div>
                  )}

                  {/* Current Password */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <input
                        type={showCurrentPw ? 'text' : 'password'}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))}
                        className="w-full pl-10 pr-10 py-3 bg-gray-50 dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl text-sm outline-none focus:border-gold/50 transition-colors text-gray-900 dark:text-white"
                        placeholder="Enter current password"
                        onKeyDown={(e) => e.key === 'Enter' && handleChangePassword()}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPw(v => !v)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <KeyRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <input
                        type={showNewPw ? 'text' : 'password'}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
                        className="w-full pl-10 pr-10 py-3 bg-gray-50 dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl text-sm outline-none focus:border-gold/50 transition-colors text-gray-900 dark:text-white"
                        placeholder="Minimum 6 characters"
                        onKeyDown={(e) => e.key === 'Enter' && handleChangePassword()}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPw(v => !v)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <KeyRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <input
                        type={showConfirmPw ? 'text' : 'password'}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))}
                        className="w-full pl-10 pr-10 py-3 bg-gray-50 dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl text-sm outline-none focus:border-gold/50 transition-colors text-gray-900 dark:text-white"
                        placeholder="Re-enter new password"
                        onKeyDown={(e) => e.key === 'Enter' && handleChangePassword()}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPw(v => !v)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="px-6 pb-6 flex gap-3">
                  <button
                    onClick={() => setShowChangePasswordModal(false)}
                    className="flex-1 py-3 border border-gray-200 dark:border-dark-border rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-card transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleChangePassword}
                    disabled={passwordLoading}
                    className="flex-1 py-3 bg-gradient-to-r from-amber-400 to-yellow-500 text-black rounded-xl text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20"
                  >
                    {passwordLoading ? (
                      <><Loader2 size={16} className="animate-spin" /> Updating...</>
                    ) : (
                      <><Lock size={16} /> Update Password</>
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* ── Logout Confirmation Modal (Portal) ─────────────────────────────────── */}
      {createPortal(
        <AnimatePresence>
          {showLogoutModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
              onClick={() => setShowLogoutModal(false)}
            >
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="relative z-10 w-full max-w-sm bg-white dark:bg-dark-surface rounded-3xl shadow-2xl border border-gray-100 dark:border-dark-border overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 text-center">
                  <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <LogOut size={32} className="text-red-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('Logout Session')}?</h3>
                  <p className="text-sm text-gray-500">{t('Are you sure you want to log out of your account?')}</p>
                </div>
                <div className="px-6 pb-6 flex gap-3">
                  <button
                    onClick={() => setShowLogoutModal(false)}
                    className="flex-1 py-3 border border-gray-200 dark:border-dark-border rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-card transition-colors cursor-pointer"
                  >
                    {t('Cancel')}
                  </button>
                  <button
                    onClick={() => {
                      setShowLogoutModal(false);
                      dispatch(logout());
                      toast.success(t('Logged out successfully'));
                    }}
                    className="flex-1 py-3 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {t('Logout')}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </header>
  );
};

export default Navbar;
