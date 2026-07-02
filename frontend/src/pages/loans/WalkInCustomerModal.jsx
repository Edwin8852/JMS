import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, User, Phone, FileText, MapPin, Briefcase, Camera, 
  Upload, Shield, CheckCircle, AlertCircle, Loader2, ArrowRight
} from 'lucide-react';
import walkInApi from '../../api/walkIn.api';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

const WalkInCustomerModal = ({ isOpen, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [createdCustomer, setCreatedCustomer] = useState(null);

  // Form Fields State
  const [profileData, setProfileData] = useState({
    name: '',
    mobileNumber: '',
    alternativeNumber: '',
    aadharNumber: '',
    panNumber: '',
    address: '',
    gender: 'MALE',
    occupation: '',
    remarks: ''
  });

  // File Upload State
  const [files, setFiles] = useState({
    kycAadharFront: null,
    kycAadharBack: null,
    kycPanCard: null,
    photo: null,
    signature: null,
    jewelPhotos: [],
    kycSupportingDocs: []
  });

  const [validationErrors, setValidationErrors] = useState({});

  const handleTextChange = (e) => {
    const { name } = e.target;
    let value = e.target.value;

    if (name === 'name') {
      // Name: strictly letters and spaces only
      value = value.replace(/[^a-zA-Z\s]/g, '');
    } else if (name === 'mobileNumber' || name === 'alternativeNumber') {
      // Mobile Number & Alternative Number: strictly numeric digits up to 10 characters
      value = value.replace(/\D/g, '').slice(0, 10);
    } else if (name === 'aadharNumber') {
      // Aadhaar Number: strictly numeric digits up to 12 characters
      value = value.replace(/\D/g, '').slice(0, 12);
    } else if (name === 'panNumber') {
      // PAN Number: alphanumeric characters, auto-uppercase, up to 10 characters
      value = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 10);
    }

    setProfileData(prev => ({ ...prev, [name]: value }));
    // Clear validation error when editing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateProfile = () => {
    const errors = {};
    if (!profileData.name.trim()) {
      errors.name = 'Customer Name is required';
    } else if (profileData.name.trim().length < 3) {
      errors.name = 'Customer Name must be at least 3 characters';
    }

    if (!profileData.mobileNumber.trim()) {
      errors.mobileNumber = 'Mobile Number is required';
    } else if (profileData.mobileNumber.length !== 10) {
      errors.mobileNumber = 'Mobile Number must be exactly 10 digits';
    }

    if (profileData.alternativeNumber && profileData.alternativeNumber.length !== 10) {
      errors.alternativeNumber = 'Alternative Number must be exactly 10 digits';
    }

    if (!profileData.aadharNumber.trim()) {
      errors.aadharNumber = 'Aadhaar Number is required';
    } else if (profileData.aadharNumber.length !== 12) {
      errors.aadharNumber = 'Aadhaar Number must be exactly 12 digits';
    }

    if (profileData.panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(profileData.panNumber.toUpperCase())) {
      errors.panNumber = 'Invalid PAN Number format (e.g. ABCDE1234F)';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFileChange = (e, fieldName, isMultiple = false) => {
    const selectedFiles = Array.from(e.target.files);
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    const invalid = selectedFiles.find(f => !validTypes.includes(f.type) || f.size > maxSize);
    if (invalid) {
      toast.error('Only JPEG, PNG, WEBP & PDF under 10MB are allowed');
      return;
    }

    if (isMultiple) {
      setFiles(prev => ({ ...prev, [fieldName]: [...prev[fieldName], ...selectedFiles] }));
    } else {
      setFiles(prev => ({ ...prev, [fieldName]: selectedFiles[0] }));
    }
  };

  const removeFile = (fieldName, index = null) => {
    if (index !== null) {
      setFiles(prev => ({
        ...prev,
        [fieldName]: prev[fieldName].filter((_, i) => i !== index)
      }));
    } else {
      setFiles(prev => ({ ...prev, [fieldName]: null }));
    }
  };

  const handleRegisterProfile = async () => {
    if (!validateProfile()) return;
    setLoading(true);
    try {
      const res = await walkInApi.registerCustomer(profileData);
      setCreatedCustomer(res.data.data);
      toast.success(t('Profile details saved successfully!'));
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || t('Failed to register customer'));
    } finally {
      setLoading(false);
    }
  };

  const handleUploadKyc = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      if (files.kycAadharFront) formData.append('kycAadharFront', files.kycAadharFront);
      if (files.kycAadharBack) formData.append('kycAadharBack', files.kycAadharBack);
      if (files.kycPanCard) formData.append('kycPanCard', files.kycPanCard);
      if (files.photo) formData.append('photo', files.photo);
      if (files.signature) formData.append('signature', files.signature);
      
      files.jewelPhotos.forEach(file => {
        formData.append('jewelPhotos', file);
      });
      
      files.kycSupportingDocs.forEach(file => {
        formData.append('kycSupportingDocs', file);
      });

      await walkInApi.uploadKyc(createdCustomer.id, formData);
      toast.success(t('KYC documents uploaded successfully!'));
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || t('Failed to upload KYC documents'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyKyc = async (status) => {
    setLoading(true);
    try {
      await walkInApi.verifyKyc(createdCustomer.id, {
        status,
        remarks: 'Direct Walk-in customer instant KYC verified by Administrator.'
      });
      toast.success(t(`KYC status updated: ${status}`));
      
      // Auto-fill and continue on parent page
      onSuccess({
        id: createdCustomer.id,
        firstName: createdCustomer.firstName,
        lastName: createdCustomer.lastName,
        customerCode: createdCustomer.customerCode
      });
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || t('Verification failed'));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Sheet */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-3xl bg-white dark:bg-dark-surface rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header Banner */}
          <div className="p-8 border-b border-gray-100 dark:border-dark-border flex items-center justify-between bg-gold-gradient relative overflow-hidden shrink-0">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
            <div className="text-white relative z-10">
              <h2 className="text-2xl font-bold tracking-tight">{t('Walk-in Customer Loan Process')}</h2>
              <p className="text-white/80 text-xs mt-1 uppercase tracking-wider font-semibold">
                {step === 1 ? t('Step 1: Registration Profile') : step === 2 ? t('Step 2: Upload KYC Files') : t('Step 3: Compliance & Verification')}
              </p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full text-white transition-colors relative z-10"
            >
              <X size={24} />
            </button>
          </div>

          {/* Stepper Indicator */}
          <div className="flex justify-between items-center px-12 py-4 bg-gray-50 border-b border-gray-100 shrink-0">
            {[1, 2, 3].map((num) => (
              <div key={num} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                  step >= num ? 'bg-gold text-black shadow-lg shadow-gold/25' : 'bg-gray-200 text-gray-400'
                }`}>
                  {num}
                </div>
                <span className={`text-xs font-bold ${step >= num ? 'text-gray-900' : 'text-gray-400'}`}>
                  {num === 1 ? t('Profile') : num === 2 ? t('Documents') : t('Compliance')}
                </span>
                {num < 3 && <div className="w-16 h-0.5 bg-gray-200" />}
              </div>
            ))}
          </div>

          {/* Form Scroll Body */}
          <div className="p-8 overflow-y-auto flex-1 custom-scrollbar space-y-6">
            
            {/* STEP 1: profile information */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                      <User size={14} /> {t('Customer Name *')}
                    </label>
                    <input 
                      type="text" 
                      name="name"
                      value={profileData.name}
                      onChange={handleTextChange}
                      placeholder={t('Enter full name')}
                      className={`w-full bg-gray-50 border-none rounded-2xl py-3.5 px-4 outline-none focus:ring-2 transition-all duration-250 ${
                        validationErrors.name ? 'ring-2 ring-red-500/40 bg-red-50/10' : 'ring-gold/20 focus:ring-gold'
                      }`}
                    />
                    {validationErrors.name && <p className="text-red-500 text-xs font-semibold mt-1">{validationErrors.name}</p>}
                  </div>

                  {/* Mobile */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                      <Phone size={14} /> {t('Mobile Number *')}
                    </label>
                    <input 
                      type="text" 
                      name="mobileNumber"
                      value={profileData.mobileNumber}
                      onChange={handleTextChange}
                      placeholder="e.g. 9876543210"
                      className={`w-full bg-gray-50 border-none rounded-2xl py-3.5 px-4 outline-none focus:ring-2 transition-all duration-250 ${
                        validationErrors.mobileNumber ? 'ring-2 ring-red-500/40 bg-red-50/10' : 'ring-gold/20 focus:ring-gold'
                      }`}
                    />
                    {validationErrors.mobileNumber && <p className="text-red-500 text-xs font-semibold mt-1">{validationErrors.mobileNumber}</p>}
                  </div>

                  {/* Alternative Number */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                      <Phone size={14} /> {t('Alternative Number')}
                    </label>
                    <input 
                      type="text" 
                      name="alternativeNumber"
                      value={profileData.alternativeNumber}
                      onChange={handleTextChange}
                      placeholder="e.g. 9876543211"
                      className={`w-full bg-gray-50 border-none rounded-2xl py-3.5 px-4 outline-none focus:ring-2 transition-all duration-250 ${
                        validationErrors.alternativeNumber ? 'ring-2 ring-red-500/40 bg-red-50/10' : 'ring-gold/20 focus:ring-gold'
                      }`}
                    />
                    {validationErrors.alternativeNumber && <p className="text-red-500 text-xs font-semibold mt-1">{validationErrors.alternativeNumber}</p>}
                  </div>

                  {/* Gender */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                      <User size={14} /> {t('Gender')}
                    </label>
                    <select
                      name="gender"
                      value={profileData.gender}
                      onChange={handleTextChange}
                      className="w-full bg-gray-50 border-none rounded-2xl py-3.5 px-4 outline-none focus:ring-2 ring-gold/20 focus:ring-gold"
                    >
                      <option value="MALE">{t('Male')}</option>
                      <option value="FEMALE">{t('Female')}</option>
                      <option value="OTHER">{t('Other')}</option>
                    </select>
                  </div>

                  {/* Aadhaar Number */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                      <FileText size={14} /> {t('Aadhaar Number *')}
                    </label>
                    <input 
                      type="text" 
                      name="aadharNumber"
                      value={profileData.aadharNumber}
                      onChange={handleTextChange}
                      placeholder="12 Digit Aadhaar Card #"
                      className={`w-full bg-gray-50 border-none rounded-2xl py-3.5 px-4 outline-none focus:ring-2 transition-all duration-250 ${
                        validationErrors.aadharNumber ? 'ring-2 ring-red-500/40 bg-red-50/10' : 'ring-gold/20 focus:ring-gold'
                      }`}
                    />
                    {validationErrors.aadharNumber && <p className="text-red-500 text-xs font-semibold mt-1">{validationErrors.aadharNumber}</p>}
                  </div>

                  {/* PAN Number */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                      <FileText size={14} /> {t('PAN Number')}
                    </label>
                    <input 
                      type="text" 
                      name="panNumber"
                      value={profileData.panNumber}
                      onChange={handleTextChange}
                      placeholder="e.g. ABCDE1234F"
                      className={`w-full bg-gray-50 border-none rounded-2xl py-3.5 px-4 outline-none focus:ring-2 uppercase transition-all duration-250 ${
                        validationErrors.panNumber ? 'ring-2 ring-red-500/40 bg-red-50/10' : 'ring-gold/20 focus:ring-gold'
                      }`}
                    />
                    {validationErrors.panNumber && <p className="text-red-500 text-xs font-semibold mt-1">{validationErrors.panNumber}</p>}
                  </div>

                  {/* Occupation */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                      <Briefcase size={14} /> {t('Occupation')}
                    </label>
                    <input 
                      type="text" 
                      name="occupation"
                      value={profileData.occupation}
                      onChange={handleTextChange}
                      placeholder="e.g. Business, Salaried"
                      className="w-full bg-gray-50 border-none rounded-2xl py-3.5 px-4 outline-none focus:ring-2 ring-gold/20"
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                    <MapPin size={14} /> {t('Residential Address')}
                  </label>
                  <textarea 
                    name="address"
                    value={profileData.address}
                    onChange={handleTextChange}
                    rows="3"
                    placeholder={t('Enter full residential address')}
                    className="w-full bg-gray-50 border-none rounded-2xl py-3.5 px-4 outline-none focus:ring-2 ring-gold/20 resize-none"
                  />
                </div>

                {/* Notes / Remarks */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                    <FileText size={14} /> {t('Notes / Remarks')}
                  </label>
                  <textarea 
                    name="remarks"
                    value={profileData.remarks}
                    onChange={handleTextChange}
                    rows="2"
                    placeholder={t('Any administrator notes...')}
                    className="w-full bg-gray-50 border-none rounded-2xl py-3.5 px-4 outline-none focus:ring-2 ring-gold/20 resize-none"
                  />
                </div>
              </div>
            )}

            {/* STEP 2: KYC File Upload Section */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="p-4 bg-gold/5 rounded-2xl border border-gold/10 flex items-center gap-3">
                  <Shield className="text-gold shrink-0" size={24} />
                  <div>
                    <h4 className="text-sm font-black text-gray-900">{t('Walk-in Customer ID Created')}</h4>
                    <p className="text-xs text-gray-500">ID: <span className="font-bold text-gold">{createdCustomer?.customerCode}</span> • {createdCustomer?.firstName} {createdCustomer?.lastName}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Aadhaar Front */}
                  <div className="p-5 bg-gray-50 rounded-3xl border border-dashed border-gray-200 text-center relative">
                    <Upload className="mx-auto text-gray-400 mb-2" size={24} />
                    <p className="text-xs font-bold">{t('Aadhaar Card Front')}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{files.kycAadharFront ? files.kycAadharFront.name : t('JPEG, PNG, or PDF')}</p>
                    <input 
                      type="file" 
                      onChange={(e) => handleFileChange(e, 'kycAadharFront')}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    {files.kycAadharFront && (
                      <button onClick={() => removeFile('kycAadharFront')} className="absolute top-2 right-2 p-1.5 bg-red-100 text-red-600 rounded-full hover:scale-105 transition-all"><X size={12} /></button>
                    )}
                  </div>

                  {/* Aadhaar Back */}
                  <div className="p-5 bg-gray-50 rounded-3xl border border-dashed border-gray-200 text-center relative">
                    <Upload className="mx-auto text-gray-400 mb-2" size={24} />
                    <p className="text-xs font-bold">{t('Aadhaar Card Back')}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{files.kycAadharBack ? files.kycAadharBack.name : t('JPEG, PNG, or PDF')}</p>
                    <input 
                      type="file" 
                      onChange={(e) => handleFileChange(e, 'kycAadharBack')}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    {files.kycAadharBack && (
                      <button onClick={() => removeFile('kycAadharBack')} className="absolute top-2 right-2 p-1.5 bg-red-100 text-red-600 rounded-full hover:scale-105 transition-all"><X size={12} /></button>
                    )}
                  </div>

                  {/* PAN Card */}
                  <div className="p-5 bg-gray-50 rounded-3xl border border-dashed border-gray-200 text-center relative">
                    <Upload className="mx-auto text-gray-400 mb-2" size={24} />
                    <p className="text-xs font-bold">{t('PAN Card')}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{files.kycPanCard ? files.kycPanCard.name : t('JPEG, PNG, or PDF')}</p>
                    <input 
                      type="file" 
                      onChange={(e) => handleFileChange(e, 'kycPanCard')}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    {files.kycPanCard && (
                      <button onClick={() => removeFile('kycPanCard')} className="absolute top-2 right-2 p-1.5 bg-red-100 text-red-600 rounded-full hover:scale-105 transition-all"><X size={12} /></button>
                    )}
                  </div>

                  {/* Customer Photo */}
                  <div className="p-5 bg-gray-50 rounded-3xl border border-dashed border-gray-200 text-center relative">
                    <Camera className="mx-auto text-gray-400 mb-2" size={24} />
                    <p className="text-xs font-bold">{t('Customer Photo')}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{files.photo ? files.photo.name : t('Upload customer profile photo')}</p>
                    <input 
                      type="file" 
                      onChange={(e) => handleFileChange(e, 'photo')}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    {files.photo && (
                      <button onClick={() => removeFile('photo')} className="absolute top-2 right-2 p-1.5 bg-red-100 text-red-600 rounded-full hover:scale-105 transition-all"><X size={12} /></button>
                    )}
                  </div>

                  {/* Signature */}
                  <div className="p-5 bg-gray-50 rounded-3xl border border-dashed border-gray-200 text-center relative">
                    <Upload className="mx-auto text-gray-400 mb-2" size={24} />
                    <p className="text-xs font-bold">{t('Digital Signature Scan')}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{files.signature ? files.signature.name : t('Scan or copy of signature')}</p>
                    <input 
                      type="file" 
                      onChange={(e) => handleFileChange(e, 'signature')}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    {files.signature && (
                      <button onClick={() => removeFile('signature')} className="absolute top-2 right-2 p-1.5 bg-red-100 text-red-600 rounded-full hover:scale-105 transition-all"><X size={12} /></button>
                    )}
                  </div>

                  {/* Jewelry Photos */}
                  <div className="p-5 bg-gray-50 rounded-3xl border border-dashed border-gray-200 text-center relative">
                    <Upload className="mx-auto text-gray-400 mb-2" size={24} />
                    <p className="text-xs font-bold">{t('Jewelry Photos')}</p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {files.jewelPhotos.length > 0 ? `${files.jewelPhotos.length} files selected` : t('Upload ornament/jewelry photos')}
                    </p>
                    <input 
                      type="file" 
                      multiple
                      onChange={(e) => handleFileChange(e, 'jewelPhotos', true)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    {files.jewelPhotos.length > 0 && (
                      <button onClick={() => setFiles(prev => ({ ...prev, jewelPhotos: [] }))} className="absolute top-2 right-2 p-1.5 bg-red-100 text-red-600 rounded-full hover:scale-105 transition-all"><X size={12} /></button>
                    )}
                  </div>

                  {/* Supporting Documents */}
                  <div className="md:col-span-2 p-5 bg-gray-50 rounded-3xl border border-dashed border-gray-200 text-center relative">
                    <Upload className="mx-auto text-gray-400 mb-2" size={24} />
                    <p className="text-xs font-bold">{t('Supporting Documents')}</p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {files.kycSupportingDocs.length > 0 ? `${files.kycSupportingDocs.length} files selected` : t('Upload any other bills or proof files')}
                    </p>
                    <input 
                      type="file" 
                      multiple
                      onChange={(e) => handleFileChange(e, 'kycSupportingDocs', true)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    {files.kycSupportingDocs.length > 0 && (
                      <button onClick={() => setFiles(prev => ({ ...prev, kycSupportingDocs: [] }))} className="absolute top-2 right-2 p-1.5 bg-red-100 text-red-600 rounded-full hover:scale-105 transition-all"><X size={12} /></button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Compliance & Status Selection */}
            {step === 3 && (
              <div className="space-y-8 text-center py-6 max-w-md mx-auto">
                <div className="w-16 h-16 bg-green-500/10 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{t('Documents Saved Successfully!')}</h3>
                  <p className="text-sm text-gray-500 mt-2">{t('Select the KYC compliance verification status below to finalize this walk-in customer creation.')}</p>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4">
                  {/* Verified Button */}
                  <button 
                    onClick={() => handleVerifyKyc('VERIFIED')}
                    className="p-5 bg-green-50 hover:bg-green-100 text-green-700 rounded-2xl border border-green-200 flex flex-col items-center gap-2 hover:scale-[1.03] transition-all font-bold"
                  >
                    <CheckCircle size={24} />
                    <span className="text-xs">{t('Verify Now')}</span>
                  </button>

                  {/* Pending Button */}
                  <button 
                    onClick={() => handleVerifyKyc('PENDING')}
                    className="p-5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-2xl border border-amber-200 flex flex-col items-center gap-2 hover:scale-[1.03] transition-all font-bold"
                  >
                    <Shield size={24} />
                    <span className="text-xs">{t('Keep Pending')}</span>
                  </button>

                  {/* Rejected Button */}
                  <button 
                    onClick={() => handleVerifyKyc('REJECTED')}
                    className="p-5 bg-red-50 hover:bg-red-100 text-red-700 rounded-2xl border border-red-200 flex flex-col items-center gap-2 hover:scale-[1.03] transition-all font-bold"
                  >
                    <AlertCircle size={24} />
                    <span className="text-xs">{t('Reject KYC')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Action Bar */}
          <div className="p-6 bg-gray-50 dark:bg-dark-card border-t border-gray-100 dark:border-dark-border flex justify-end gap-4 shrink-0">
            {step === 1 && (
              <button 
                onClick={handleRegisterProfile}
                disabled={loading}
                className="btn-gold flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <>{t('Save & Continue')} <ArrowRight size={18} /></>}
              </button>
            )}

            {step === 2 && (
              <button 
                onClick={handleUploadKyc}
                disabled={loading}
                className="btn-gold flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <>{t('Upload Documents')} <ArrowRight size={18} /></>}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default WalkInCustomerModal;
