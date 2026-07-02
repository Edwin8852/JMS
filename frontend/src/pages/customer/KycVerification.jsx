import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  ShieldCheck, 
  Upload, 
  FileText, 
  User, 
  CreditCard, 
  CheckCircle, 
  AlertCircle,
  Clock,
  PenTool,
  Loader2,
  Eye,
  Download
} from 'lucide-react';
import { fetchKycStatus, submitKycDocs, resetKycState } from '../../store/slices/kycSlice';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const KycVerification = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { status, isVerified, loading, error, success, documents, customerData } = useSelector((state) => state.kyc);
  
  const baseUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
  
  const [formData, setFormData] = useState({
    aadharNumber: '',
    panNumber: ''
  });

  const [files, setFiles] = useState({
    kycAadharFront: null,
    kycAadharBack: null,
    kycPanCard: null
  });

  const [previews, setPreviews] = useState({});

  useEffect(() => {
    dispatch(fetchKycStatus());
  }, [dispatch]);

  // Pre-fill form and previews if they exist in state (e.g. on page refresh)
  useEffect(() => {
    if (customerData) {
      setFormData(prev => ({
        aadharNumber: customerData.aadharNumber || prev.aadharNumber,
        panNumber: customerData.panNumber || prev.panNumber
      }));
    }
    if (documents && Object.keys(documents).length > 0) {
      setPreviews(prev => ({
        ...prev,
        kycAadharFront: documents.aadharFront && !prev.kycAadharFront?.startsWith('data:') ? `${baseUrl}/${documents.aadharFront.replace(/\\/g, '/')}` : prev.kycAadharFront,
        kycAadharBack: documents.aadharBack && !prev.kycAadharBack?.startsWith('data:') ? `${baseUrl}/${documents.aadharBack.replace(/\\/g, '/')}` : prev.kycAadharBack,
        kycPanCard: documents.panCard && !prev.kycPanCard?.startsWith('data:') ? `${baseUrl}/${documents.panCard.replace(/\\/g, '/')}` : prev.kycPanCard,
      }));
    }
  }, [customerData, documents, baseUrl]);

  useEffect(() => {
    if (success) {
      toast.success(t('KYC Documents submitted successfully!'));
      dispatch(resetKycState());
    }
    if (error) {
      toast.error(error);
      dispatch(resetKycState());
    }
  }, [success, error, dispatch]);

  const handleFileChange = (e, key) => {
    const file = e.target.files[0];
    if (file) {
      setFiles(prev => ({ ...prev, [key]: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => ({ ...prev, [key]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('aadharNumber', formData.aadharNumber);
    data.append('panNumber', formData.panNumber);
    
    Object.keys(files).forEach(key => {
      if (files[key]) data.append(key, files[key]);
    });

    dispatch(submitKycDocs(data));
  };

  if (isVerified) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center space-y-8">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto text-white shadow-xl shadow-green-200"
        >
          <ShieldCheck size={48} />
        </motion.div>
        <div className="space-y-2">
          <h1 className="text-4xl font-display font-black">{t('KYC Fully Verified')}</h1>
          <p className="text-gray-500 text-lg">{t('Your identity has been successfully authenticated. You have full access to all gold finance services.')}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10">
           <div className="p-6 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center gap-3">
              <CheckCircle className="text-green-500" />
              <span className="font-bold text-sm">{t('Aadhaar Verified')}</span>
           </div>
           <div className="p-6 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center gap-3">
              <CheckCircle className="text-green-500" />
              <span className="font-bold text-sm">{t('PAN Verified')}</span>
           </div>
           <div className="p-6 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center gap-3">
              <CheckCircle className="text-green-500" />
              <span className="font-bold text-sm">{t('Biometrics Matched')}</span>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-10 space-y-12 pb-32">
      <div className="space-y-2 text-center">
        <h1 className="text-4xl font-display font-black tracking-tight">{t('Identity Verification')}</h1>
        <p className="text-gray-500 text-lg">{t('Upload your Aadhaar and PAN card documents to unlock gold loan services.')}</p>
      </div>

      {(status === 'PENDING' || Object.keys(documents || {}).length > 0) && (
        <div className="glass-card p-8 rounded-[3rem] space-y-6 bg-green-50/30 border border-green-100">
          <div className="flex items-center gap-4">
            <ShieldCheck className="text-green-500" size={32} />
            <div>
              <h2 className="text-2xl font-bold">{t('Uploaded Documents')}</h2>
              <p className="text-sm text-gray-500">{t('Your documents are pending verification.')}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: 'aadharFront', name: 'Aadhaar Front', type: 'ID Proof', path: documents?.aadharFront },
              { key: 'aadharBack', name: 'Aadhaar Back', type: 'ID Proof', path: documents?.aadharBack },
              { key: 'panCard', name: 'PAN Card', type: 'ID Proof', path: documents?.panCard },
              { key: 'addressProof', name: 'Address Proof', type: 'Address Proof', path: documents?.addressProof }
            ].map(doc => doc.path ? (
              <div key={doc.key} className="bg-white p-4 rounded-2xl flex items-center justify-between border border-gray-100 shadow-sm">
                <div>
                  <h4 className="font-bold text-sm">{t(doc.name)}</h4>
                  <p className="text-xs text-gray-400">{t(doc.type)} • {t('Pending Verification')}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{t('Uploaded:')} {new Date().toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                  <a href={`${baseUrl}/${doc.path.replace(/\\/g, '/')}`} target="_blank" rel="noreferrer" className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                    <Eye size={16} />
                  </a>
                  <a href={`${baseUrl}/${doc.path.replace(/\\/g, '/')}`} download className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                    <Download size={16} />
                  </a>
                </div>
              </div>
            ) : null)}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="space-y-10">
          {/* Document Section 1: Aadhaar */}
          <div className="glass-card p-10 rounded-[3rem] space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gold/10 rounded-2xl flex items-center justify-center text-gold">
                 <CreditCard size={24} />
              </div>
              <h3 className="text-2xl font-bold">{t('Aadhaar Card Details')}</h3>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-gray-400 tracking-widest px-1">{t('Aadhaar Number (12 Digits)')}</label>
                <input 
                  type="text"
                  maxLength="12"
                  required
                  placeholder="0000 0000 0000"
                  value={formData.aadharNumber}
                  onChange={(e) => setFormData({...formData, aadharNumber: e.target.value})}
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-gold rounded-2xl p-5 font-bold text-xl outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <label className="text-xs font-black uppercase text-gray-400 tracking-widest px-1">{t('Aadhaar Front')}</label>
                  <label className="relative cursor-pointer group">
                    <div className="w-full h-48 bg-gray-50 border-2 border-dashed border-gray-200 group-hover:border-gold rounded-[2rem] flex flex-col items-center justify-center gap-3 overflow-hidden transition-all">
                       {previews.kycAadharFront ? (
                         <img src={previews.kycAadharFront} className="w-full h-full object-cover" />
                       ) : (
                         <>
                           <Upload className="text-gray-300 group-hover:text-gold transition-colors" size={32} />
                           <span className="text-sm font-bold text-gray-400">{t('Click to upload Front')}</span>
                         </>
                       )}
                    </div>
                    <input type="file" className="hidden" onChange={(e) => handleFileChange(e, 'kycAadharFront')} required />
                  </label>
                </div>
                <div className="space-y-4">
                  <label className="text-xs font-black uppercase text-gray-400 tracking-widest px-1">{t('Aadhaar Back')}</label>
                  <label className="relative cursor-pointer group">
                    <div className="w-full h-48 bg-gray-50 border-2 border-dashed border-gray-200 group-hover:border-gold rounded-[2rem] flex flex-col items-center justify-center gap-3 overflow-hidden transition-all">
                       {previews.kycAadharBack ? (
                         <img src={previews.kycAadharBack} className="w-full h-full object-cover" />
                       ) : (
                         <>
                           <Upload className="text-gray-300 group-hover:text-gold transition-colors" size={32} />
                           <span className="text-sm font-bold text-gray-400">{t('Click to upload Back')}</span>
                         </>
                       )}
                    </div>
                    <input type="file" className="hidden" onChange={(e) => handleFileChange(e, 'kycAadharBack')} required />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Document Section 2: PAN Card */}
          <div className="glass-card p-10 rounded-[3rem] space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gold/10 rounded-2xl flex items-center justify-center text-gold">
                 <FileText size={24} />
              </div>
              <h3 className="text-2xl font-bold">{t('PAN Card Details')}</h3>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-gray-400 tracking-widest px-1">{t('PAN Number')}</label>
                <input 
                  type="text"
                  required
                  placeholder="ABCDE1234F"
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-gold rounded-2xl p-5 font-bold text-xl outline-none transition-all"
                  value={formData.panNumber}
                  onChange={(e) => setFormData({...formData, panNumber: e.target.value.toUpperCase()})}
                />
              </div>

              <div className="space-y-4">
                  <label className="text-xs font-black uppercase text-gray-400 tracking-widest px-1">{t('PAN Card Copy')}</label>
                  <label className="relative cursor-pointer group">
                    <div className="w-full h-64 bg-gray-50 border-2 border-dashed border-gray-200 group-hover:border-gold rounded-[2.5rem] flex flex-col items-center justify-center gap-3 overflow-hidden transition-all">
                       {previews.kycPanCard ? (
                         <img src={previews.kycPanCard} className="w-full h-full object-cover" />
                       ) : (
                         <>
                           <Upload className="text-gray-300 group-hover:text-gold transition-colors" size={40} />
                           <span className="text-sm font-bold text-gray-400">{t('Upload high-resolution PAN copy')}</span>
                         </>
                       )}
                    </div>
                    <input type="file" className="hidden" onChange={(e) => handleFileChange(e, 'kycPanCard')} required />
                  </label>
                </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 max-w-xl mx-auto">
          <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-2xl border border-yellow-100">
            <AlertCircle className="text-yellow-600 shrink-0" size={20} />
            <p className="text-xs text-yellow-800 font-medium leading-relaxed">
              {t('Ensure all documents are original copies and clearly readable. Blurry or cropped images will lead to immediate rejection.')}
            </p>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-gold text-black rounded-[2rem] font-black shadow-2xl shadow-gold/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 className="animate-spin" /> : <><ShieldCheck size={24} /> {t('Submit KYC Verification')}</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default KycVerification;
