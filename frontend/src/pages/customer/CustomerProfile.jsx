import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  Clock, 
  CreditCard,
  Edit2,
  Save,
  Loader2,
  X,
  Lock,
  Eye,
  EyeOff,
  KeyRound
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyProfile } from '../../store/slices/customerSlice';
import { updateUserSync } from '../../store/slices/authSlice';
import authApi from '../../api/auth.api';
import Input from '../../components/ui/Input';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

const CustomerProfile = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { myProfile: profile, loading } = useSelector((state) => state.customers);
  const [isEditing, setIsEditing] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profileData, setProfileData] = useState({});
  const [saveLoading, setSaveLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showImageModal, setShowImageModal] = useState(false);
  const fileInputRef = React.useRef(null);

  // Change Password Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  useEffect(() => {
    document.title = "My Profile | SDRS Gold Finance";
    dispatch(fetchMyProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      setProfileData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
        mobile: profile.mobileNumber || profile.mobile || '',
        profileImage: profile.profileImage || user?.profileImage || ''
      });
      setProfilePhoto(profile.profileImage || user?.profileImage || null);
    }
  }, [profile, user]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowImageModal(false);
        setShowPasswordModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Manage body scroll for password modal
  useEffect(() => {
    if (showPasswordModal || showImageModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showPasswordModal, showImageModal]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setProfilePhoto(url);

      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData(prev => ({ ...prev, profileImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setSaveLoading(true);
      setMessage({ type: '', text: '' });
      const res = await authApi.updateProfile(profileData);
      if (res.data.success) {
        dispatch(updateUserSync(res.data.user));
        setMessage({ type: 'success', text: 'Profile updated successfully' });
        setIsEditing(false);
        dispatch(fetchMyProfile());
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update profile' });
    } finally {
      setSaveLoading(false);
    }
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
        setShowPasswordModal(false);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password. Check your current password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Debug Logs
  useEffect(() => {
    if (profile) {
      console.log("Profile API Response:", profile);
    }
  }, [profile]);

  if (loading && !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="text-gold animate-spin" size={48} />
        <p className="text-gray-500 font-bold animate-pulse tracking-widest uppercase text-xs">Synchronizing Profile Data...</p>
      </div>
    );
  }

  const joinDate = profile?.createdAt ? format(new Date(profile.createdAt), "MMMM yyyy") : "N/A";

  return (
    <div className="w-full space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl font-display font-bold">{t('My Profile')}</h1>
          <p className="text-gray-500 mt-1">{t('Manage your personal information and security.')}</p>
        </motion.div>
        
        <button 
          onClick={() => {
            if (isEditing) {
              handleUpdateProfile();
            } else {
              setIsEditing(true);
            }
          }}
          disabled={saveLoading}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${
            isEditing ? 'bg-gold text-black shadow-gold' : 'bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-gray-700'
          } ${saveLoading ? 'opacity-50' : ''}`}
        >
          {isEditing ? (
            <>{saveLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} {t('Save Profile')}</>
          ) : (
            <><Edit2 size={18} /> {t('Edit Profile')}</>
          )}
        </button>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl text-center w-full ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 rounded-[2.5rem] flex flex-col items-center text-center self-start w-full"
        >
          <div className="w-32 h-32 bg-gold-gradient rounded-[2rem] flex items-center justify-center text-black font-black text-4xl shadow-gold mb-6 relative overflow-hidden group">
            {profilePhoto ? (
              <img 
                src={profilePhoto} 
                alt="Profile" 
                className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition-transform duration-300" 
                onClick={() => setShowImageModal(true)}
              />
            ) : (
              <>{profile?.firstName?.[0]}{profile?.lastName?.[0]}</>
            )}
            <div className="absolute -bottom-2 -right-2 bg-green-500 border-4 border-white dark:border-dark-surface w-8 h-8 rounded-full flex items-center justify-center text-white z-10">
              <Shield size={14} fill="currentColor" />
            </div>
          </div>
          {isEditing && (
            <div className="mb-4">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handlePhotoChange} 
                accept="image/*" 
                className="hidden" 
              />
              <button 
                onClick={() => fileInputRef.current?.click()} 
                className="text-sm font-bold text-gold hover:underline"
              >
                {t('Change Photo')}
              </button>
            </div>
          )}
          <h2 className="text-2xl font-bold">{profile?.firstName} {profile?.lastName}</h2>
          <p className="text-sm text-gray-500 font-medium mt-1">{t('Customer ID:')} {profile?.customerCode || 'N/A'}</p>
          
          <div className="mt-8 w-full space-y-4">
            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-dark-card rounded-2xl border border-transparent hover:border-gold/20 transition-all">
              <Shield className="text-green-500" size={20} />
              <div className="text-left">
                <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">{t('KYC Status')}</p>
                <p className="text-sm font-bold text-green-500">{t(profile?.kycStatus) || t('VERIFIED')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-dark-card rounded-2xl border border-transparent hover:border-gold/20 transition-all">
              <Calendar className="text-gold" size={20} />
              <div className="text-left">
                <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">{t('Member Since')}</p>
                <p className="text-sm font-bold">{joinDate}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Detailed Info */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-8 rounded-[2.5rem]"
          >
            <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
              <User size={20} className="text-gold" />
              {t('Personal Information')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label={t("First Name")} value={profileData.firstName || ''} onChange={(e) => setProfileData({...profileData, firstName: e.target.value})} disabled={!isEditing} icon={User} />
              <Input label={t("Last Name")} value={profileData.lastName || ''} onChange={(e) => setProfileData({...profileData, lastName: e.target.value})} disabled={!isEditing} icon={User} />
              <Input label={t("Email Address")} value={profileData.email || ''} onChange={(e) => setProfileData({...profileData, email: e.target.value})} disabled={!isEditing} icon={Mail} />
              <Input label={t("Phone Number")} value={profileData.mobile || ''} onChange={(e) => setProfileData({...profileData, mobile: e.target.value})} disabled={!isEditing} icon={Phone} />
              <div className="md:col-span-2">
                 <Input 
                   label={t("Registered Address")} 
                   defaultValue={profile?.address || t("Address not provided")} 
                   disabled={!isEditing} 
                   icon={MapPin} 
                 />
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-8 rounded-[2.5rem]"
          >
            <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
              <Shield size={20} className="text-gold" />
              {t('Security & Access')}
            </h3>
            <div className="space-y-4">
               <div className="flex items-center justify-between p-4 border border-gray-100 dark:border-dark-border rounded-2xl hover:bg-gray-50 dark:hover:bg-dark-card transition-all">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                      <Clock size={20} />
                    </div>
                    <div>
                       <p className="text-sm font-bold">{t('Password Management')}</p>
                       <p className="text-xs text-gray-500">{t('Keep your account secure with regular updates')}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowPasswordModal(true)}
                    className="text-sm font-bold text-gold hover:underline cursor-pointer"
                  >
                    {t('Change Password')}
                  </button>
               </div>
               <div className="flex items-center justify-between p-4 border border-gray-100 dark:border-dark-border rounded-2xl hover:bg-gray-50 dark:hover:bg-dark-card transition-all">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500">
                      <CreditCard size={20} />
                    </div>
                    <div>
                       <p className="text-sm font-bold">{t('Two-Factor Authentication')}</p>
                       <p className="text-xs text-gray-500">{t('Add an extra layer of protection')}</p>
                    </div>
                  </div>
                  <button className="text-sm font-bold text-gray-400">{t('Coming Soon')}</button>
               </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Image Modal (WhatsApp Style) */}
      {createPortal(
        <AnimatePresence>
          {showImageModal && profilePhoto && (
            <div 
              className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-hidden"
              onClick={() => setShowImageModal(false)}
            >
              <button 
                className="fixed top-4 right-4 z-[10000] text-white/80 hover:text-white bg-black/50 hover:bg-black/70 p-3 rounded-full transition-all shadow-lg"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowImageModal(false);
                }}
              >
                <X size={24} />
              </button>
              
              <div className="relative flex items-center justify-center w-full h-full pointer-events-none">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="max-w-[700px] w-full max-h-[80vh] rounded-3xl overflow-hidden shadow-2xl pointer-events-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <img 
                    src={profilePhoto} 
                    alt="Profile Full Size" 
                    className="w-full h-auto max-h-[80vh] object-contain block mx-auto"
                  />
                </motion.div>
              </div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

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
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Change Password</h3>
                      <p className="text-xs text-gray-500">Secure your account</p>
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
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
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
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
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
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                      >
                        {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="px-6 pb-6 flex gap-3">
                  <button
                    onClick={() => setShowPasswordModal(false)}
                    className="flex-1 py-3 border border-gray-200 dark:border-dark-border rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-card transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleChangePassword}
                    disabled={passwordLoading || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword || passwordForm.newPassword !== passwordForm.confirmPassword}
                    className="flex-1 py-3 bg-gradient-to-r from-amber-400 to-yellow-500 text-black rounded-xl text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 cursor-pointer"
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
    </div>
  );
};

export default CustomerProfile;
