import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  User, Lock, Bell, Globe, ShieldCheck, Save, X,
  Camera, Eye, EyeOff, ChevronRight, Sun, Moon,
  Monitor, Smartphone, Clock, MapPin, CheckCircle2,
  AlertTriangle, Zap, Key, Building, LogOut, Activity,
  Upload, Trash2, RefreshCw, Shield
} from 'lucide-react';
import Input from '../../components/ui/Input';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import authApi from '../../api/auth.api';
import settingsApi from '../../api/settings.api';
import { updateUserSync, logout } from '../../store/slices/authSlice';

/* ─────────────────────────────────────────
   Password Strength Meter
───────────────────────────────────────── */
const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const map = [
    { label: 'Too Weak', color: 'bg-red-500' },
    { label: 'Weak', color: 'bg-orange-400' },
    { label: 'Fair', color: 'bg-yellow-400' },
    { label: 'Strong', color: 'bg-emerald-400' },
    { label: 'Very Strong', color: 'bg-emerald-600' },
  ];
  return { score, ...map[score] };
};

/* ─────────────────────────────────────────
   Section Header
───────────────────────────────────────── */
const SectionHeader = ({ icon: Icon, title, subtitle, color = 'text-gold' }) => (
  <div className="flex items-start gap-4 pb-6 border-b border-gray-100 dark:border-dark-border mb-8">
    <div className={`p-3 rounded-2xl bg-gold/10 ${color}`}>
      <Icon size={22} />
    </div>
    <div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
      {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
    </div>
  </div>
);

/* ─────────────────────────────────────────
   Toggle Switch
───────────────────────────────────────── */
const Toggle = ({ checked, onChange }) => (
  <button
    onClick={() => onChange(!checked)}
    className={`relative shrink-0 inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${checked ? 'bg-gold' : 'bg-gray-300 dark:bg-gray-600'}`}
  >
    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
  </button>
);

/* ─────────────────────────────────────────
   Settings Nav Item
───────────────────────────────────────── */
const NavItem = ({ id, label, icon: Icon, active, onClick, badge }) => (
  <button
    onClick={() => onClick(id)}
    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all group relative ${
      active
        ? 'bg-gold text-black shadow-lg shadow-gold/30 font-bold'
        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-card hover:text-gray-900 dark:hover:text-white'
    }`}
  >
    <Icon size={18} className={active ? 'text-black' : 'text-gray-400 group-hover:text-gold transition-colors'} />
    <span className="flex-1 text-left">{label}</span>
    {badge && (
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${active ? 'bg-black/20 text-black' : 'bg-gold/10 text-gold'}`}>
        {badge}
      </span>
    )}
    <ChevronRight size={14} className={`opacity-50 ${active ? 'text-black' : ''}`} />
  </button>
);

/* ─────────────────────────────────────────
   Main Component
───────────────────────────────────────── */
const Settings = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector(state => state.auth);

  const [activeTab, setActiveTab] = useState('profile');
  const [profilePhoto, setProfilePhoto] = useState(user?.profileImage || null);
  const [photoFile, setPhotoFile] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsAlerts: true,
    loanUpdates: true,
    paymentReminders: true,
    systemAnnouncements: false,
  });
  const [financeSettings, setFinanceSettings] = useState({
    DEFAULT_MONTHLY_INTEREST_RATE: '12',
    PENALTY_INTEREST_RATE: '3',
    GRACE_DAYS: '5'
  });
  const fileInputRef = useRef(null);

  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    mobile: user?.mobile || '',
    profileImage: user?.profileImage || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '', newPassword: '', confirmPassword: ''
  });
  const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);

  const pwStrength = getPasswordStrength(passwordData.newPassword);
  const sessionInfo = {
    device: 'Chrome on Windows',
    ip: '103.xxx.xxx.xxx',
    location: 'Chennai, TN, India',
    lastLogin: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
  };

  const navItems = [
    { id: 'profile', label: t('My Profile'), icon: User },
    { id: 'edit-profile', label: t('Edit Profile'), icon: Building },
    { id: 'photo', label: t('Profile Photo'), icon: Camera },
    { id: 'security', label: t('Change Password'), icon: Lock },
    { id: 'security-settings', label: t('Security Settings'), icon: ShieldCheck },
    { id: 'notifications', label: t('Notifications'), icon: Bell },
    { id: 'preferences', label: t('Preferences'), icon: Globe },
    { id: 'session', label: t('Session & Activity'), icon: Activity, badge: 'LIVE' },
  ];

  if (user?.role === 'SUPER_ADMIN') {
    navItems.push({ id: 'finance', label: t('Company Finance'), icon: Building, badge: 'ADMIN' });
  }

  useEffect(() => {
    document.title = `Settings | SDRS Gold Finance`;
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === 'Escape') setShowImageModal(false); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
  }, []);

  const handleThemeToggle = (dark) => {
    setIsDarkMode(dark);
    document.documentElement.classList.toggle('dark', dark);
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
    if (!file.type.startsWith('image/')) { toast.error('Please select a valid image file'); return; }
    setPhotoFile(file);
    const url = URL.createObjectURL(file);
    setProfilePhoto(url);
    const reader = new FileReader();
    reader.onloadend = () => setProfileData(prev => ({ ...prev, profileImage: reader.result }));
    reader.readAsDataURL(file);
  };

  const handlePhotoUpload = async () => {
    if (!photoFile) { toast.warning('Please select a photo first'); return; }
    setPhotoLoading(true);
    try {
      // Build clean payload matching backend schema
      const mobile = profileData.mobile?.replace(/\D/g, '') || '';
      const payload = {
        firstName: profileData.firstName?.trim() || user?.firstName || '',
        lastName: profileData.lastName?.trim() || user?.lastName || '',
        email: profileData.email?.trim() || user?.email || '',
        mobile: mobile || user?.mobile?.replace(/\D/g, '') || '',
        profileImage: profileData.profileImage || ''
      };
      if (!payload.profileImage) { toast.error('Photo not loaded yet, please wait'); setPhotoLoading(false); return; }
      const res = await authApi.updateProfile(payload);
      if (res.data.success) {
        dispatch(updateUserSync(res.data.user));
        toast.success('Profile photo updated successfully!');
        setPhotoFile(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update photo');
    } finally {
      setPhotoLoading(false);
    }
  };

  const handleNameInput = (field, e) => {
    const val = e.target.value.replace(/[^A-Za-z\s]/g, '');
    setProfileData(prev => ({ ...prev, [field]: val }));
    e.target.value = val; // Force DOM update for React controlled input bug
  };

  const handlePhoneInput = (e) => {
    const val = e.target.value.replace(/[^\d+-\s]/g, '');
    setProfileData(prev => ({ ...prev, mobile: val }));
    e.target.value = val;
  };

  const handleUpdateProfile = async () => {
    const firstName = profileData.firstName?.trim();
    const lastName = profileData.lastName?.trim();
    const email = profileData.email?.trim();
    const rawMobile = profileData.mobile?.trim();
    const mobile = rawMobile?.replace(/\D/g, ''); // Strip everything except digits

    if (!firstName) { toast.error('First name is required'); return; }
    if (!lastName) { toast.error('Last name is required'); return; }
    if (!email) { toast.error('Email is required'); return; }
    if (!rawMobile) { toast.error('Phone number is required'); return; }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) { toast.error('Please enter a valid email address'); return; }

    if (!mobile || mobile.length !== 10) { toast.error('Phone number must be exactly 10 digits'); return; }

    // Build clean payload matching backend schema exactly
    const payload = { firstName, lastName, email, mobile };
    if (profileData.profileImage) payload.profileImage = profileData.profileImage;

    setLoading(true);
    try {
      const res = await authApi.updateProfile(payload);
      if (res.data.success) {
        dispatch(updateUserSync(res.data.user));
        // Keep local state in sync with cleaned data
        setProfileData(prev => ({ ...prev, ...payload }));
        toast.success('Profile updated successfully!');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!passwordData.currentPassword) { toast.error('Current password is required'); return; }
    if (passwordData.newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (passwordData.newPassword !== passwordData.confirmPassword) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      const res = await authApi.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      if (res.data.success) {
        toast.success('Password changed successfully!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
    toast.success(`Language changed to ${lang === 'en' ? 'English' : 'Tamil'}`);
  };

  useEffect(() => {
    if (user?.role === 'SUPER_ADMIN') {
      const fetchSettings = async () => {
        try {
          const res = await settingsApi.getSettings();
          if (res.data.success && res.data.settings) {
            const newSettings = { ...financeSettings };
            res.data.settings.forEach(s => {
              if (s.settingKey in newSettings) {
                newSettings[s.settingKey] = s.settingValue;
              }
            });
            setFinanceSettings(newSettings);
          }
        } catch (err) {
          console.error('Failed to load finance settings', err);
        }
      };
      fetchSettings();
    }
  }, [user]);

  const handleFinanceUpdate = async () => {
    setLoading(true);
    try {
      await settingsApi.updateSetting('DEFAULT_MONTHLY_INTEREST_RATE', financeSettings.DEFAULT_MONTHLY_INTEREST_RATE);
      await settingsApi.updateSetting('PENALTY_INTEREST_RATE', financeSettings.PENALTY_INTEREST_RATE);
      await settingsApi.updateSetting('GRACE_DAYS', financeSettings.GRACE_DAYS);
      toast.success('Finance settings updated successfully!');
    } catch (err) {
      toast.error('Failed to update finance settings');
    } finally {
      setLoading(false);
    }
  };

  const avatarInitials = `${user?.firstName?.[0] || 'A'}${user?.lastName?.[0] || 'D'}`;

  /* ── Tab Panels ── */
  const panels = {

    /* ── VIEW PROFILE ── */
    profile: (
      <motion.div key="profile" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-6">
        {/* Hero Card */}
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#1a1200] via-[#2d1f00] to-[#1a1200] p-8 text-white">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #FDB931 0%, transparent 50%), radial-gradient(circle at 80% 20%, #9E7922 0%, transparent 40%)' }} />
          <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div
              className="w-28 h-28 rounded-[1.5rem] overflow-hidden ring-4 ring-gold/50 shadow-2xl shadow-gold/20 flex-shrink-0 cursor-pointer group"
              onClick={() => profilePhoto && setShowImageModal(true)}
            >
              {profilePhoto ? (
                <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              ) : (
                <div className="w-full h-full bg-gold-gradient flex items-center justify-center text-3xl font-black text-black">{avatarInitials}</div>
              )}
            </div>
            <div className="text-center sm:text-left flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold/20 border border-gold/30 rounded-full text-xs font-bold text-gold mb-3 uppercase tracking-widest">
                <Zap size={10} fill="currentColor" /> {user?.role?.replace('_', ' ') || 'Admin'}
              </div>
              <h2 className="text-2xl font-black">{user?.firstName} {user?.lastName}</h2>
              <p className="text-white/60 text-sm mt-1">{user?.email}</p>
              <p className="text-white/50 text-xs mt-0.5">{user?.mobile || 'No mobile added'}</p>
              <div className="flex flex-wrap gap-3 mt-4 justify-center sm:justify-start">
                <button onClick={() => setActiveTab('edit-profile')} className="flex items-center gap-2 px-4 py-2 bg-gold text-black text-xs font-bold rounded-xl hover:bg-gold/90 transition-all">
                  <User size={13} /> Edit Profile
                </button>
                <button onClick={() => setActiveTab('photo')} className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all">
                  <Camera size={13} /> Change Photo
                </button>
              </div>
            </div>
            <div className="hidden lg:flex flex-col gap-3 text-right">
              <div className="text-xs text-white/40 uppercase tracking-widest">Account Status</div>
              <div className="flex items-center gap-2 justify-end">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-sm font-bold text-emerald-400">Active</span>
              </div>
              <div className="text-xs text-white/40 mt-2">Last Login</div>
              <div className="text-xs text-white/70">{sessionInfo.lastLogin}</div>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'Full Name', value: `${user?.firstName || '—'} ${user?.lastName || ''}`, icon: User },
            { label: 'Email Address', value: user?.email || '—', icon: Key },
            { label: 'Mobile', value: user?.mobile || 'Not provided', icon: Smartphone },
            { label: 'Role', value: user?.role?.replace('_', ' ') || '—', icon: Shield },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="glass-card rounded-2xl p-5 flex items-center gap-4 hover:border-gold/20 border border-transparent transition-all">
              <div className="p-2.5 bg-gold/10 rounded-xl text-gold flex-shrink-0"><Icon size={18} /></div>
              <div className="min-w-0">
                <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">{label}</p>
                <p className="text-sm font-bold truncate mt-0.5">{value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="glass-card rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-500"><CheckCircle2 size={18} /></div>
            <div>
              <p className="text-sm font-bold">Account Verified</p>
              <p className="text-xs text-gray-500">Your account is fully verified and active</p>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1.5 bg-emerald-500/10 text-emerald-600 rounded-full border border-emerald-500/20">Verified</span>
        </div>
      </motion.div>
    ),

    /* ── EDIT PROFILE ── */
    'edit-profile': (
      <motion.div key="edit-profile" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="glass-card rounded-[2rem] p-8">
        <SectionHeader icon={User} title="Edit Profile" subtitle="Update your personal and contact information." />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="First Name *" value={profileData.firstName} onChange={(e) => handleNameInput('firstName', e)} placeholder="Enter first name" required />
          <Input label="Last Name *" value={profileData.lastName} onChange={(e) => handleNameInput('lastName', e)} placeholder="Enter last name" required />
          <Input label="Email Address *" type="email" value={profileData.email} onChange={(e) => setProfileData({ ...profileData, email: e.target.value })} placeholder="admin@example.com" required />
          <Input label="Phone Number *" value={profileData.mobile} onChange={(e) => handlePhoneInput(e)} placeholder="+91 XXXXX XXXXX" required />
        </div>
        <div className="flex justify-end mt-8 pt-6 border-t border-gray-100 dark:border-dark-border">
          <button onClick={handleUpdateProfile} disabled={loading} className="btn-gold flex items-center gap-2 px-8 py-3 disabled:opacity-50">
            {loading ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </motion.div>
    ),

    /* ── PROFILE PHOTO ── */
    photo: (
      <motion.div key="photo" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="glass-card rounded-[2rem] p-8">
        <SectionHeader icon={Camera} title="Profile Photo" subtitle="Upload a professional photo — JPG, PNG, or WEBP, max 5MB." />
        <div className="flex flex-col items-center gap-8">
          {/* Preview */}
          <div className="relative group">
            <div
              className="w-40 h-40 rounded-[2rem] overflow-hidden ring-4 ring-gold/30 shadow-2xl shadow-gold/20 cursor-pointer"
              onClick={() => profilePhoto && setShowImageModal(true)}
            >
              {profilePhoto ? (
                <img src={profilePhoto} alt="Profile Preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              ) : (
                <div className="w-full h-full bg-gold-gradient flex items-center justify-center text-5xl font-black text-black">{avatarInitials}</div>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 w-11 h-11 bg-gold rounded-2xl flex items-center justify-center text-black shadow-lg hover:scale-110 transition-transform"
            >
              <Camera size={18} />
            </button>
          </div>

          {/* Upload Zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full max-w-md border-2 border-dashed border-gray-200 dark:border-dark-border hover:border-gold/50 rounded-2xl p-8 text-center cursor-pointer transition-all group hover:bg-gold/5"
          >
            <Upload size={28} className="mx-auto text-gray-400 group-hover:text-gold transition-colors mb-3" />
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Click to upload new photo</p>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP up to 5MB</p>
            {photoFile && <p className="mt-3 text-xs font-bold text-gold bg-gold/10 px-3 py-1 rounded-full inline-block">{photoFile.name}</p>}
          </div>

          <input type="file" ref={fileInputRef} onChange={handlePhotoSelect} accept="image/*" className="hidden" />

          <div className="flex gap-3">
            <button
              onClick={handlePhotoUpload}
              disabled={!photoFile || photoLoading}
              className="btn-gold flex items-center gap-2 px-6 py-2.5 disabled:opacity-40"
            >
              {photoLoading ? <RefreshCw size={15} className="animate-spin" /> : <Upload size={15} />}
              {photoLoading ? 'Uploading...' : 'Upload Photo'}
            </button>
            {profilePhoto && (
              <button
                onClick={() => { setProfilePhoto(null); setPhotoFile(null); setProfileData(p => ({ ...p, profileImage: '' })); }}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 text-sm font-bold transition-all"
              >
                <Trash2 size={15} /> Remove
              </button>
            )}
          </div>
        </div>
      </motion.div>
    ),

    /* ── CHANGE PASSWORD ── */
    security: (
      <motion.div key="security" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="glass-card rounded-[2rem] p-8">
        <SectionHeader icon={Lock} title="Change Password" subtitle="Use a strong, unique password to protect your account." />
        <div className="max-w-md space-y-5">
          {/* Current Password */}
          <div className="relative">
            <Input label="Current Password" type={showPass.current ? 'text' : 'password'} placeholder="••••••••" value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} />
            <button onClick={() => setShowPass(p => ({ ...p, current: !p.current }))} className="absolute right-4 top-10 text-gray-400 hover:text-gold transition-colors">
              {showPass.current ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* New Password */}
          <div className="relative">
            <Input label="New Password" type={showPass.new ? 'text' : 'password'} placeholder="••••••••" value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} />
            <button onClick={() => setShowPass(p => ({ ...p, new: !p.new }))} className="absolute right-4 top-10 text-gray-400 hover:text-gold transition-colors">
              {showPass.new ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Strength Bar */}
          {passwordData.newPassword && (
            <div className="space-y-1.5">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i <= pwStrength.score ? pwStrength.color : 'bg-gray-200 dark:bg-dark-border'}`} />
                ))}
              </div>
              <p className={`text-xs font-bold ${pwStrength.score >= 3 ? 'text-emerald-500' : pwStrength.score >= 2 ? 'text-yellow-500' : 'text-red-500'}`}>
                {pwStrength.label}
              </p>
            </div>
          )}

          {/* Confirm Password */}
          <div className="relative">
            <Input
              label="Confirm New Password"
              type={showPass.confirm ? 'text' : 'password'}
              placeholder="••••••••"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              error={passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword ? 'Passwords do not match' : ''}
            />
            <button onClick={() => setShowPass(p => ({ ...p, confirm: !p.confirm }))} className="absolute right-4 top-10 text-gray-400 hover:text-gold transition-colors">
              {showPass.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {passwordData.confirmPassword && passwordData.newPassword === passwordData.confirmPassword && (
            <div className="flex items-center gap-2 text-emerald-500 text-xs font-bold">
              <CheckCircle2 size={14} /> Passwords match
            </div>
          )}
        </div>

        <div className="flex justify-start mt-8 pt-6 border-t border-gray-100 dark:border-dark-border">
          <button onClick={handleUpdatePassword} disabled={loading} className="btn-gold flex items-center gap-2 px-8 py-3 disabled:opacity-50">
            {loading ? <RefreshCw size={16} className="animate-spin" /> : <Lock size={16} />}
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </motion.div>
    ),

    /* ── SECURITY SETTINGS ── */
    'security-settings': (
      <motion.div key="security-settings" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-4">
        <div className="glass-card rounded-[2rem] p-8">
          <SectionHeader icon={ShieldCheck} title="Security Settings" subtitle="Manage your account security and access controls." />
          <div className="space-y-4">
            {[
              {
                icon: Zap, iconBg: 'bg-purple-500/10', iconColor: 'text-purple-500',
                title: 'Two-Factor Authentication',
                subtitle: 'Add an extra layer of security to your account',
                badge: 'Coming Soon', badgeStyle: 'bg-gray-100 dark:bg-dark-card text-gray-500'
              },
              {
                icon: LogOut, iconBg: 'bg-red-500/10', iconColor: 'text-red-500',
                title: 'Revoke All Sessions',
                subtitle: 'Sign out of all devices except this one',
                action: () => { toast.info('Feature coming soon'); },
                actionLabel: 'Revoke', actionStyle: 'text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 border border-red-200'
              },
              {
                icon: Key, iconBg: 'bg-blue-500/10', iconColor: 'text-blue-500',
                title: 'Active Sessions',
                subtitle: '1 active session on Chrome, Windows',
                badge: '1 Active', badgeStyle: 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
              },
            ].map(({ icon: Icon, iconBg, iconColor, title, subtitle, badge, badgeStyle, action, actionLabel, actionStyle }) => (
              <div key={title} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border border-gray-100 dark:border-dark-border hover:bg-gray-50/50 dark:hover:bg-dark-card/50 transition-all gap-4">
                <div className="flex items-center gap-4">
                  <div className={`p-3 ${iconBg} ${iconColor} rounded-xl`}><Icon size={18} /></div>
                  <div>
                    <p className="text-sm font-bold">{title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 self-end sm:self-auto">
                  {badge && <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${badgeStyle}`}>{badge}</span>}
                  {action && (
                    <button onClick={action} className={`text-xs font-bold px-4 py-2 rounded-xl transition-all ${actionStyle}`}>{actionLabel}</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-[2rem] p-6 border-l-4 border-gold">
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className="text-gold mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold">Security Recommendations</p>
              <ul className="mt-2 space-y-1">
                {['Use a password with 12+ characters', 'Enable two-factor authentication when available', 'Do not share login credentials with others'].map(tip => (
                  <li key={tip} className="flex items-center gap-2 text-xs text-gray-500">
                    <div className="w-1 h-1 bg-gold rounded-full flex-shrink-0" /> {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    ),

    /* ── NOTIFICATIONS ── */
    notifications: (
      <motion.div key="notifications" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="glass-card rounded-[2rem] p-5 sm:p-8">
        <SectionHeader icon={Bell} title="Notification Preferences" subtitle="Choose what alerts and updates you want to receive." />
        <div className="space-y-3">
          {[
            { key: 'emailAlerts', label: 'Email Alerts', desc: 'Receive important updates via email', icon: Key },
            { key: 'smsAlerts', label: 'SMS Notifications', desc: 'Get SMS for critical account activities', icon: Smartphone },
            { key: 'loanUpdates', label: 'Loan Status Updates', desc: 'Notify on loan approval/rejection events', icon: CheckCircle2 },
            { key: 'paymentReminders', label: 'Payment Reminders', desc: 'Get reminders for upcoming EMI payments', icon: Clock },
            { key: 'systemAnnouncements', label: 'System Announcements', desc: 'Platform updates and maintenance alerts', icon: Zap },
          ].map(({ key, label, desc, icon: Icon }) => (
            <div key={key} className="flex items-center justify-between p-4 sm:p-5 rounded-2xl border border-gray-100 dark:border-dark-border hover:bg-gray-50/50 dark:hover:bg-dark-card/50 transition-all group gap-4">
              <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                <div className="p-2 sm:p-2.5 bg-gold/10 text-gold rounded-xl group-hover:bg-gold/20 transition-colors shrink-0"><Icon size={16} /></div>
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate">{label}</p>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{desc}</p>
                </div>
              </div>
              <Toggle checked={notifications[key]} onChange={(val) => { setNotifications(p => ({ ...p, [key]: val })); toast.success(`${label} ${val ? 'enabled' : 'disabled'}`); }} />
            </div>
          ))}
        </div>
      </motion.div>
    ),

    /* ── PREFERENCES ── */
    preferences: (
      <motion.div key="preferences" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-6">
        {/* Language */}
        <div className="glass-card rounded-[2rem] p-8">
          <SectionHeader icon={Globe} title="Language Selection" subtitle="Choose your preferred interface language." />
          <div className="grid grid-cols-2 gap-4 max-w-sm">
            {[
              { code: 'en', label: 'English', flag: '🇬🇧', sub: 'Default' },
              { code: 'ta', label: 'தமிழ்', flag: '🇮🇳', sub: 'Tamil' },
            ].map(({ code, label, flag, sub }) => (
              <button
                key={code}
                onClick={() => handleLanguageChange(code)}
                className={`flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all ${
                  i18n.language === code
                    ? 'border-gold bg-gold/10 shadow-lg shadow-gold/10'
                    : 'border-gray-200 dark:border-dark-border hover:border-gold/40'
                }`}
              >
                <span className="text-3xl">{flag}</span>
                <span className="text-sm font-bold">{label}</span>
                <span className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">{sub}</span>
                {i18n.language === code && <div className="w-2 h-2 bg-gold rounded-full" />}
              </button>
            ))}
          </div>
        </div>

        {/* Theme */}
        <div className="glass-card rounded-[2rem] p-8">
          <SectionHeader icon={Sun} title="Theme Settings" subtitle="Customize the visual appearance of the dashboard." />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-md">
            {[
              { id: false, label: 'Light Mode', icon: Sun, preview: 'bg-white border-2 border-gray-200' },
              { id: true, label: 'Dark Mode', icon: Moon, preview: 'bg-gray-900 border-2 border-gray-700' },
              { id: null, label: 'System', icon: Monitor, preview: 'bg-gradient-to-r from-white to-gray-900 border-2 border-gray-300' },
            ].map(({ id, label, icon: Icon, preview }) => (
              <button
                key={label}
                onClick={() => id !== null && handleThemeToggle(id)}
                className={`flex flex-col items-center gap-2.5 p-4 rounded-2xl border-2 transition-all ${
                  (id === null && 'opacity-50') +
                  (isDarkMode === id && id !== null ? ' border-gold bg-gold/10 shadow-lg shadow-gold/10' : ' border-gray-200 dark:border-dark-border hover:border-gold/40')
                }`}
              >
                <div className={`w-full h-10 rounded-xl ${preview}`} />
                <Icon size={15} className={isDarkMode === id && id !== null ? 'text-gold' : 'text-gray-500'} />
                <span className="text-xs font-bold">{label}</span>
                {id === null && <span className="text-[9px] text-gray-400 uppercase tracking-widest">Soon</span>}
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    ),

    /* ── SESSION & ACTIVITY ── */
    session: (
      <motion.div key="session" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-4">
        <div className="glass-card rounded-[2rem] p-8">
          <SectionHeader icon={Activity} title="Session & Login Activity" subtitle="Monitor your active sessions and recent login history." />

          {/* Current Session */}
          <div className="p-5 rounded-2xl border-2 border-gold/30 bg-gold/5 mb-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gold/10 text-gold rounded-xl mt-0.5"><Monitor size={18} /></div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold">Current Session</p>
                    <span className="text-[9px] font-black px-2 py-0.5 bg-emerald-500/10 text-emerald-600 rounded-full uppercase tracking-widest border border-emerald-500/20">Active</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{sessionInfo.device}</p>
                  <div className="flex flex-wrap gap-3 mt-3">
                    {[
                      { icon: MapPin, text: sessionInfo.location },
                      { icon: Clock, text: sessionInfo.lastLogin },
                    ].map(({ icon: Icon, text }) => (
                      <span key={text} className="flex items-center gap-1.5 text-[11px] text-gray-500 bg-gray-100 dark:bg-dark-card px-2.5 py-1 rounded-lg">
                        <Icon size={11} /> {text}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Login History */}
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Recent Login History</p>
          <div className="space-y-2">
            {[
              { device: 'Chrome on Windows', time: sessionInfo.lastLogin, location: 'Chennai, TN', status: 'success' },
              { device: 'Chrome on Windows', time: 'Yesterday, 09:12 AM', location: 'Chennai, TN', status: 'success' },
              { device: 'Firefox on Windows', time: '2 days ago, 03:45 PM', location: 'Chennai, TN', status: 'success' },
            ].map((session, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-dark-card hover:bg-gray-100 dark:hover:bg-dark-surface/60 transition-all">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${session.status === 'success' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                  <div>
                    <p className="text-xs font-bold">{session.device}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1.5">
                      <MapPin size={10} /> {session.location}
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-gray-400">{session.time}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-[2rem] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-500/10 text-red-500 rounded-xl"><LogOut size={18} /></div>
            <div>
              <p className="text-sm font-bold">Logout from Account</p>
              <p className="text-xs text-gray-500">End your current session securely</p>
            </div>
          </div>
          <button
            onClick={() => dispatch(logout())}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-200 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 text-sm font-bold transition-all"
          >
            <LogOut size={15} /> Logout
          </button>
        </div>
      </motion.div>
    ),

    /* ── COMPANY FINANCE ── */
    finance: (
      <motion.div key="finance" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="glass-card rounded-[2rem] p-8">
        <SectionHeader icon={Building} title="Company Finance Settings" subtitle="Configure global interest rates and penalty defaults." />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input 
            label="Default Monthly Interest Rate (% p.a.)" 
            type="number" 
            value={financeSettings.DEFAULT_MONTHLY_INTEREST_RATE} 
            onChange={(e) => setFinanceSettings({ ...financeSettings, DEFAULT_MONTHLY_INTEREST_RATE: e.target.value })} 
            placeholder="12" 
          />
          <Input 
            label="Penalty Interest Rate (% p.a.)" 
            type="number" 
            value={financeSettings.PENALTY_INTEREST_RATE} 
            onChange={(e) => setFinanceSettings({ ...financeSettings, PENALTY_INTEREST_RATE: e.target.value })} 
            placeholder="3" 
          />
          <Input 
            label="Grace Days" 
            type="number" 
            value={financeSettings.GRACE_DAYS} 
            onChange={(e) => setFinanceSettings({ ...financeSettings, GRACE_DAYS: e.target.value })} 
            placeholder="5" 
          />
        </div>
        <div className="flex justify-end mt-8 pt-6 border-t border-gray-100 dark:border-dark-border">
          <button onClick={handleFinanceUpdate} disabled={loading} className="btn-gold flex items-center gap-2 px-8 py-3 disabled:opacity-50">
            {loading ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </motion.div>
    ),
  };

  return (
    <div className="w-full space-y-6 pb-16">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <button onClick={() => navigate('/admin/dashboard')} className="hover:text-gold transition-colors font-medium">Dashboard</button>
        <ChevronRight size={12} />
        <span className="text-gray-700 dark:text-gray-200 font-bold">Settings</span>
        <ChevronRight size={12} />
        <span className="text-gold font-bold capitalize">{navItems.find(n => n.id === activeTab)?.label || 'Profile'}</span>
      </div>

      {/* Page Title */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <h1 className="text-3xl font-display font-black">Account Settings</h1>
        <p className="text-gray-500 mt-1 text-sm">Manage your profile, security, and preferences.</p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ── Sidebar Nav ── */}
        <aside className="w-full lg:w-64 lg:flex-shrink-0">
          <div className="glass-card rounded-[2rem] p-3 space-y-1 lg:sticky lg:top-24">
            {/* Mini profile header */}
            <div
              className="flex items-center gap-3 p-4 rounded-2xl mb-2 cursor-pointer hover:bg-gold/5 transition-all group"
              onClick={() => setActiveTab('profile')}
            >
              <div className="w-11 h-11 rounded-xl overflow-hidden ring-2 ring-gold/30 flex-shrink-0">
                {profilePhoto ? (
                  <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gold-gradient flex items-center justify-center text-sm font-black text-black">{avatarInitials}</div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black truncate">{user?.firstName} {user?.lastName}</p>
                <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>
            <div className="border-t border-gray-100 dark:border-dark-border my-2" />
            {navItems.map(item => (
              <NavItem key={item.id} {...item} active={activeTab === item.id} onClick={setActiveTab} />
            ))}
          </div>
        </aside>

        {/* ── Content Panel ── */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {panels[activeTab]}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Profile Image Lightbox Modal ── */}
      {createPortal(
        <AnimatePresence>
          {showImageModal && profilePhoto && (
            <div
              className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-hidden"
              onClick={() => setShowImageModal(false)}
            >
              <button
                className="fixed top-4 right-4 z-[10000] text-white/80 hover:text-white bg-black/50 hover:bg-black/70 p-3 rounded-full transition-all shadow-lg"
                onClick={(e) => { e.stopPropagation(); setShowImageModal(false); }}
              >
                <X size={24} />
              </button>
              <div className="relative flex items-center justify-center w-full h-full pointer-events-none">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="max-w-[700px] w-full max-h-[80vh] rounded-3xl overflow-hidden shadow-2xl pointer-events-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <img src={profilePhoto} alt="Profile Full Size" className="w-full h-auto max-h-[80vh] object-contain block mx-auto" />
                </motion.div>
              </div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default Settings;
