import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Search, 
  Filter, 
  User, 
  CreditCard, 
  FileText,
  Loader2,
  ExternalLink,
  ChevronRight,
  Clock,
  Mail
} from 'lucide-react';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const BACKEND_URL = (import.meta.env.VITE_API_URL || 'https://jms-vpf1.onrender.com/api').replace('/api', '');

const AdminKycManagement = () => {
  const { t } = useTranslation();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedKyc, setSelectedKyc] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('PENDING');
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    fetchKycList();
  }, []);

  const fetchKycList = async () => {
    setLoading(true);
    try {
      const response = await api.get('/customers');
      // Filter for those who have submitted some KYC info
      setCustomers(response.data.data);
    } catch (err) {
      toast.error('Failed to fetch KYC queue');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/kyc/${id}/approve`);
      toast.success('KYC Approved Successfully');
      setSelectedKyc(null);
      fetchKycList();
    } catch (err) {
      toast.error('Approval failed');
    }
  };

  const handleReject = async (id, reason) => {
    try {
      await api.put(`/kyc/${id}/reject`, { reason });
      toast.success('KYC Rejected');
      setSelectedKyc(null);
      fetchKycList();
    } catch (err) {
      toast.error('Rejection failed');
    }
  };

  const handleSendReminder = async (customerId) => {
    try {
      await api.post('/notification', {
        customerId: customerId,
        type: 'KYC_UPLOAD_REQUEST',
        message: 'Action Required: Please log in to your portal and upload your Aadhaar Card and PAN Card to complete your KYC verification.'
      });
      toast.success('KYC Upload Request sent to customer successfully.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send upload request');
    }
  };

  const filteredCustomers = customers.filter(c => 
    (c.kycStatus === filter || filter === 'ALL') &&
    (c.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.customerCode?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const hasMissingDocs = selectedKyc ? (
    !selectedKyc.kycDocuments || 
    !selectedKyc.kycDocuments.aadharFront || 
    !selectedKyc.kycDocuments.aadharBack || 
    !selectedKyc.kycDocuments.panCard
  ) : false;

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-display font-black tracking-tight text-gray-900">{t('KYC Compliance Queue')}</h1>
          <p className="text-gray-500 mt-1 font-medium">{t('Verify customer identities and approve document submissions.')}</p>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder={t('Search Customer ID...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl font-bold focus:border-gold outline-none shadow-sm transition-all w-64"
              />
           </div>
           <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm">
             {['PENDING', 'VERIFIED', 'REJECTED'].map((f) => (
               <button 
                 key={f}
                 onClick={() => setFilter(f)}
                 className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${filter === f ? 'bg-black text-white' : 'text-gray-400 hover:text-black'}`}
               >
                 {t(f)}
               </button>
             ))}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-gold" size={40} /></div>
        ) : filteredCustomers.length > 0 ? filteredCustomers.map((cust) => (
          <motion.div 
            layout
            key={cust.id}
            className="glass-card p-6 rounded-[2.5rem] flex flex-col lg:flex-row items-center justify-between gap-8 border border-transparent hover:border-gold/20 hover:shadow-2xl transition-all"
          >
             <div className="flex items-center gap-6 w-full lg:w-auto">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 flex items-center justify-center text-gray-300">
                   {cust.photo ? <img src={`${BACKEND_URL}/${cust.photo}`} className="w-full h-full object-cover" /> : <User size={32} />}
                </div>
                <div className="space-y-1">
                   <h4 className="font-black text-xl text-gray-900">{cust.firstName} {cust.lastName}</h4>
                   <div className="flex items-center gap-3 text-sm text-gray-500 font-bold uppercase tracking-widest text-[10px]">
                      <span>{t('ID:')} {cust.customerCode}</span>
                      <span className={`px-2 py-0.5 rounded-full ${cust.kycStatus === 'VERIFIED' ? 'bg-green-50 text-green-600' : cust.kycStatus === 'PENDING' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}>
                         {t(cust.kycStatus)}
                      </span>
                   </div>
                </div>
             </div>

             <div className="grid grid-cols-2 md:grid-cols-3 gap-8 w-full lg:w-auto px-8 py-4 bg-gray-50 rounded-[2rem]">
                <div>
                   <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">{t('Aadhaar')}</p>
                   <p className="font-bold">{cust.aadharNumber || t('Not Provided')}</p>
                </div>
                <div>
                   <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">{t('PAN Card')}</p>
                   <p className="font-bold uppercase">{cust.panNumber || t('Not Provided')}</p>
                </div>
                <div>
                   <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">{t('Mobile')}</p>
                   <p className="font-bold">{cust.mobileNumber}</p>
                </div>
             </div>

             <button 
               onClick={() => setSelectedKyc(cust)}
               className="w-full lg:w-auto px-8 py-4 bg-black text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-gold hover:text-black transition-all"
             >
                <Eye size={18} /> {t('Review Documents')}
             </button>
          </motion.div>
        )) : (
          <div className="glass-card p-20 rounded-[3rem] text-center space-y-6">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
              <CheckCircle size={40} />
            </div>
            <div className="space-y-2">
              <h4 className="text-xl font-bold text-gray-900">Queue is Clear</h4>
              <p className="text-gray-500">No {filter.toLowerCase()} KYC requests found.</p>
            </div>
          </div>
        )}
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {selectedKyc && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedKyc(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
             <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }} className="relative w-full max-w-6xl bg-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-10">
                   <div className="space-y-1">
                      <h3 className="text-3xl font-display font-black">KYC Review: {selectedKyc.firstName}</h3>
                      <p className="text-gray-500">Verify documents against provided identity numbers.</p>
                   </div>
                   <button onClick={() => setSelectedKyc(null)} className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-all"><XCircle size={24} /></button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                   <div className="space-y-8">
                      <div className="p-5 md:p-8 bg-gray-50 rounded-[1.5rem] md:rounded-[2.5rem] space-y-6">
                         <h4 className="font-black flex items-center gap-2 uppercase text-xs tracking-widest text-gray-400 border-b border-gray-200 pb-4"><User size={16} /> Personal Metadata</h4>
                         <div className="grid grid-cols-2 gap-8">
                            <div><p className="text-[10px] font-black text-gray-400 uppercase mb-1">Full Name</p><p className="font-bold">{selectedKyc.firstName} {selectedKyc.lastName}</p></div>
                            <div><p className="text-[10px] font-black text-gray-400 uppercase mb-1">Mobile Number</p><p className="font-bold">{selectedKyc.mobileNumber}</p></div>
                            <div><p className="text-[10px] font-black text-gray-400 uppercase mb-1">Aadhaar ID</p><p className="font-bold">{selectedKyc.aadharNumber}</p></div>
                            <div><p className="text-[10px] font-black text-gray-400 uppercase mb-1">PAN ID</p><p className="font-bold uppercase">{selectedKyc.panNumber}</p></div>
                         </div>
                      </div>

                      <div className="space-y-6">
                         <h4 className="font-black flex items-center gap-2 uppercase text-xs tracking-widest text-gray-400 border-b border-gray-200 pb-4"><FileText size={16} /> Uploaded Evidence</h4>
                         <div className="grid grid-cols-2 gap-6">
                            {[
                               { label: 'Aadhar Front', path: selectedKyc.kycDocuments?.aadharFront },
                               { label: 'Aadhar Back', path: selectedKyc.kycDocuments?.aadharBack },
                               { label: 'PAN Card', path: selectedKyc.kycDocuments?.panCard }
                            ].map((doc, idx) => (
                               <div key={idx} className="space-y-3">
                                  <p className="text-[10px] font-black text-gray-400 uppercase px-2">{doc.label}</p>
                                  <div className="w-full h-40 bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 group relative">
                                     {doc.path ? (
                                       <>
                                         <img src={`${BACKEND_URL}/${doc.path}`} className="w-full h-full object-cover" />
                                         <button 
                                           onClick={(e) => { e.preventDefault(); setPreviewImage(`${BACKEND_URL}/${doc.path}`); }}
                                           className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-white w-full h-full"
                                         >
                                           <Eye size={32} />
                                         </button>
                                       </>
                                     ) : (
                                       <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold text-[10px]">NO UPLOAD</div>
                                     )}
                                  </div>
                               </div>
                            ))}
                         </div>
                      </div>
                   </div>

                   <div className="space-y-8 flex flex-col justify-between">
                      <div className="p-6 md:p-8 bg-gray-900 text-white rounded-[2rem] md:rounded-[3rem] space-y-6 shadow-2xl relative overflow-hidden">
                         <h4 className="font-black text-gold uppercase text-[10px] tracking-widest">Verification Status</h4>
                         <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center">
                               {selectedKyc.kycStatus === 'VERIFIED' ? <CheckCircle className="text-green-500" size={32} /> : <Clock className="text-gold" size={32} />}
                            </div>
                            <div>
                               <p className="font-black text-2xl uppercase">{selectedKyc.kycStatus}</p>
                               <p className="text-gray-400 text-sm">{selectedKyc.isKycVerified ? 'Identity Authenticated' : 'Awaiting Compliance Review'}</p>
                            </div>
                         </div>
                         <div className="pt-6 border-t border-white/5 space-y-2">
                            <p className="text-xs font-bold text-gray-400">Compliance Notes:</p>
                            <p className="text-sm italic">{selectedKyc.remarks || 'No remarks recorded yet.'}</p>
                         </div>
                         <div className="absolute -right-20 -top-20 w-64 h-64 bg-gold/10 rounded-full blur-[100px]" />
                      </div>

                      {hasMissingDocs && (
                         <div className="p-6 bg-blue-50 border border-blue-100 rounded-3xl space-y-2">
                            <h4 className="font-black text-blue-800 uppercase text-xs tracking-widest flex items-center gap-2">
                               <ShieldAlert size={16} /> Documents Missing
                            </h4>
                            <p className="text-xs text-blue-700 font-medium">
                               This customer has not uploaded all required Aadhaar and PAN documents. You can send a request to prompt them to upload.
                            </p>
                         </div>
                      )}

                      <div className="grid grid-cols-1 gap-4">
                         {selectedKyc.kycStatus === 'PENDING' && (
                           <>
                              {hasMissingDocs && (
                                 <button 
                                   onClick={() => handleSendReminder(selectedKyc.id)}
                                   className="w-full py-4 md:py-6 bg-blue-600 text-white rounded-2xl md:rounded-3xl font-black shadow-xl shadow-blue-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                                 >
                                    <Mail size={24} /> Request KYC Upload
                                 </button>
                              )}
                              <button 
                                onClick={() => handleApprove(selectedKyc.id)}
                                className="w-full py-4 md:py-6 bg-gold text-black rounded-2xl md:rounded-3xl font-black shadow-xl shadow-gold/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                              >
                                 <CheckCircle size={24} /> Verify & Approve Identity
                              </button>
                              <button 
                                onClick={() => handleReject(selectedKyc.id, 'Documents unclear or inconsistent')}
                                className="w-full py-4 md:py-6 bg-red-50 text-red-600 rounded-2xl md:rounded-3xl font-bold hover:bg-red-100 transition-all flex items-center justify-center gap-3"
                              >
                                 <XCircle size={20} /> Reject Submission
                              </button>
                           </>
                         )}
                         <button onClick={() => setSelectedKyc(null)} className="w-full py-4 md:py-6 bg-gray-100 text-gray-600 rounded-2xl md:rounded-3xl font-bold hover:bg-gray-200 transition-all">Close Review</button>
                      </div>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Image Preview Lightbox */}
      <AnimatePresence>
        {previewImage && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setPreviewImage(null)} 
              className="absolute inset-0 bg-black/90 backdrop-blur-md cursor-zoom-out" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.9 }} 
              className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-center z-10 pointer-events-none"
            >
              <img 
                src={previewImage} 
                className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl pointer-events-auto" 
                alt="Document Preview"
              />
              <button 
                onClick={() => setPreviewImage(null)}
                className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-all pointer-events-auto"
              >
                <XCircle size={32} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminKycManagement;
