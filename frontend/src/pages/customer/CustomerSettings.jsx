import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Settings, Bell, Lock, User, Globe, X, KeyRound, Eye, EyeOff, Loader2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import authApi from '../../api/auth.api';

const CustomerSettings = () => {
  const { t } = useTranslation();

  // Password Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  
  // Password Visibility
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  // Manage body scroll
  useEffect(() => {
    if (showPasswordModal) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [showPasswordModal]);

  // Handle ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setShowPasswordModal(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getPasswordStrength = (password) => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength += 25;
    if (password.match(/\d/)) strength += 25;
    if (password.match(/[^a-zA-Z\d]/)) strength += 25;
    return strength;
  };

  const strength = getPasswordStrength(passwordForm.newPassword);
  
  const getStrengthColor = () => {
    if (strength <= 25) return 'bg-red-500';
    if (strength <= 50) return 'bg-orange-500';
    if (strength <= 75) return 'bg-yellow-500';
    return 'bg-emerald-500';
  };

  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordForm;
    setPasswordError('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError(t('All fields are required'));
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError(t('New password must be at least 6 characters'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(t('New passwords do not match'));
      return;
    }

    try {
      setPasswordLoading(true);
      const res = await authApi.changePassword({ currentPassword, newPassword });
      if (res.data.success) {
        toast.success(t('Password changed successfully!'));
        setShowPasswordModal(false);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      setPasswordError(err.response?.data?.message || t('Failed to change password.'));
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 mb-8"
      >
        <div className="p-3 bg-gold/10 rounded-2xl">
          <Settings className="text-gold" size={24} />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            {t('Account Settings')}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {t('Manage your preferences and account configurations')}
          </p>
        </div>
      </motion.div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="p-6 bg-white dark:bg-dark-surface rounded-[24px] shadow-sm border border-gray-100 dark:border-dark-border group hover:shadow-xl hover:shadow-gold/5 transition-all duration-300"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-500/10 rounded-xl text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
              <User size={20} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('Profile Information')}</h3>
          </div>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            {t('Update your personal details, contact information, and KYC documents.')}
          </p>
          <button className="text-sm font-bold text-gold hover:text-yellow-600 transition-colors flex items-center gap-2">
            {t('Manage Profile')} &rarr;
          </button>
        </motion.div>

        {/* Security Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="p-6 bg-white dark:bg-dark-surface rounded-[24px] shadow-sm border border-gray-100 dark:border-dark-border group hover:shadow-xl hover:shadow-gold/5 transition-all duration-300"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="p-2.5 bg-red-50 dark:bg-red-500/10 rounded-xl text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors">
              <Lock size={20} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('Security & Password')}</h3>
          </div>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            {t('Change your password, set up 2FA, and review your recent login activity.')}
          </p>
          <button 
            onClick={() => setShowPasswordModal(true)}
            className="text-sm font-bold text-gold hover:text-yellow-600 transition-colors flex items-center gap-2 cursor-pointer"
          >
            {t('Change Password')} &rarr;
          </button>
        </motion.div>

        {/* Notifications Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="p-6 bg-white dark:bg-dark-surface rounded-[24px] shadow-sm border border-gray-100 dark:border-dark-border group hover:shadow-xl hover:shadow-gold/5 transition-all duration-300"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="p-2.5 bg-purple-50 dark:bg-purple-500/10 rounded-xl text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-colors">
              <Bell size={20} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('Notifications')}</h3>
          </div>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            {t('Choose what updates you want to receive via email, SMS, or push notifications.')}
          </p>
          <button className="text-sm font-bold text-gold hover:text-yellow-600 transition-colors flex items-center gap-2">
            {t('Configure Alerts')} &rarr;
          </button>
        </motion.div>

        {/* Preferences Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="p-6 bg-white dark:bg-dark-surface rounded-[24px] shadow-sm border border-gray-100 dark:border-dark-border group hover:shadow-xl hover:shadow-gold/5 transition-all duration-300"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
              <Globe size={20} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('Language & Region')}</h3>
          </div>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            {t('Set your preferred language, time zone, and regional formatting options.')}
          </p>
          <button className="text-sm font-bold text-gold hover:text-yellow-600 transition-colors flex items-center gap-2">
            {t('Change Preferences')} &rarr;
          </button>
        </motion.div>
      </div>

      {/* Change Password Modal */}
      {createPortal(
        <AnimatePresence>
          {showPasswordModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
              onClick={() => setShowPasswordModal(false)}
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
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-dark-border bg-gradient-to-r from-gold/10 to-transparent">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gold/10 rounded-xl">
                      <Lock size={20} className="text-gold" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('Change Password')}</h3>
                      <p className="text-xs text-gray-500">{t('Secure your account')}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPasswordModal(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-dark-card rounded-xl transition-colors text-gray-500 hover:text-gray-700 cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Form */}
                <div className="p-6 space-y-4">
                  {/* Error Message */}
                  {passwordError && (
                    <div className="p-3 bg-red-50 dark:bg-red-500/10 text-red-500 text-sm rounded-xl border border-red-100 dark:border-red-500/20 font-medium flex items-center gap-2">
                      <X size={16} /> {passwordError}
                    </div>
                  )}

                  {/* Current Password */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">
                      {t('Current Password')}
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <input
                        type={showCurrentPw ? 'text' : 'password'}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))}
                        className="w-full pl-10 pr-10 py-3 bg-gray-50 dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl text-sm outline-none focus:border-gold/50 transition-colors text-gray-900 dark:text-white"
                        placeholder={t('Enter current password')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPw(v => !v)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                      >
                        {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">
                      {t('New Password')}
                    </label>
                    <div className="relative">
                      <KeyRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <input
                        type={showNewPw ? 'text' : 'password'}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
                        className="w-full pl-10 pr-10 py-3 bg-gray-50 dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl text-sm outline-none focus:border-gold/50 transition-colors text-gray-900 dark:text-white"
                        placeholder={t('Minimum 6 characters')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPw(v => !v)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                      >
                        {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {/* Password Strength Indicator */}
                    {passwordForm.newPassword && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-100 dark:bg-dark-border rounded-full overflow-hidden flex">
                          <div 
                            className={`h-full transition-all duration-300 ${getStrengthColor()}`} 
                            style={{ width: `${strength}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase">
                          {strength <= 25 ? 'Weak' : strength <= 75 ? 'Good' : 'Strong'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">
                      {t('Confirm New Password')}
                    </label>
                    <div className="relative">
                      <KeyRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <input
                        type={showConfirmPw ? 'text' : 'password'}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))}
                        className="w-full pl-10 pr-10 py-3 bg-gray-50 dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl text-sm outline-none focus:border-gold/50 transition-colors text-gray-900 dark:text-white"
                        placeholder={t('Re-enter new password')}
                        onKeyDown={(e) => e.key === 'Enter' && handleChangePassword()}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPw(v => !v)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                      >
                        {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      {/* Match Indicator */}
                      {passwordForm.confirmPassword && (
                        <div className="absolute right-12 top-1/2 -translate-y-1/2">
                          {passwordForm.newPassword === passwordForm.confirmPassword ? (
                            <Check size={16} className="text-emerald-500" />
                          ) : (
                            <X size={16} className="text-red-500" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="px-6 pb-6 flex gap-3">
                  <button
                    onClick={() => setShowPasswordModal(false)}
                    className="flex-1 py-3 border border-gray-200 dark:border-dark-border rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-card transition-colors cursor-pointer"
                  >
                    {t('Cancel')}
                  </button>
                  <button
                    onClick={handleChangePassword}
                    disabled={passwordLoading || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword || passwordForm.newPassword !== passwordForm.confirmPassword}
                    className="flex-1 py-3 bg-gradient-to-r from-amber-400 to-yellow-500 text-black rounded-xl text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 cursor-pointer"
                  >
                    {passwordLoading ? (
                      <><Loader2 size={16} className="animate-spin" /> {t('Updating...')}</>
                    ) : (
                      <><Lock size={16} /> {t('Update Password')}</>
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default CustomerSettings;
