import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllDocuments, verifyDocument } from '../../store/slices/documentSlice';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Eye,
  Clock,
  ExternalLink,
  X
} from 'lucide-react';
import { toast } from 'react-toastify';

const KycVerification = () => {
  const dispatch = useDispatch();
  const { documents, loading } = useSelector((state) => state.documents);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    dispatch(fetchAllDocuments());
  }, [dispatch]);

  const handleVerify = async (status) => {
    try {
      await dispatch(verifyDocument({ id: selectedDoc.id, status, remarks })).unwrap();
      toast.success(`Document marked as ${status}`);
      setSelectedDoc(null);
      setRemarks('');
      dispatch(fetchAllDocuments());
    } catch (error) {
      toast.error(error || 'Verification failed');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'VERIFIED': return 'text-green-500 bg-green-500/10';
      case 'PENDING': return 'text-amber-500 bg-amber-500/10';
      case 'REJECTED': return 'text-red-500 bg-red-500/10';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="w-full px-4 md:px-6 py-6 md:py-8">
      <div className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">KYC <span className="text-gold">Verification</span></h1>
          <p className="text-gray-500 font-medium text-sm mt-1">Review and verify customer identity documents for compliance</p>
        </div>
        <div className="bg-gold/10 border border-gold/20 px-4 py-3 rounded-2xl flex items-center gap-3 self-start sm:self-auto">
          <Clock className="text-gold" size={20} />
          <span className="text-white font-black text-xs uppercase tracking-widest">
            {documents.filter(d => d.status === 'PENDING').length} Pending Requests
          </span>
        </div>
      </div>

      <div className="bg-dark-surface border border-dark-border rounded-[2.5rem] overflow-hidden">
        <div className="p-8 border-b border-dark-border flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="Search by customer name or ID..."
              className="w-full bg-dark-card border border-dark-border rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:border-gold outline-none transition-all"
            />
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-3 bg-dark-card border border-dark-border text-gray-400 rounded-xl flex items-center gap-2 hover:text-gold transition-all">
              <Filter size={18} /> Filter
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[640px]">
            <thead>
              <tr className="border-b border-dark-border bg-dark-card/30">
                <th className="px-8 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Customer</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Document Type</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Date Uploaded</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Status</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border/50">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-gold/5 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gold/10 text-gold rounded-lg flex items-center justify-center font-bold uppercase">
                        {doc.customer?.firstName?.[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{doc.customer?.firstName} {doc.customer?.lastName}</p>
                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">{doc.customer?.customerCode}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-gray-500" />
                      <span className="text-sm font-medium text-white uppercase">{doc.type.replace('_', ' ')}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-xs text-gray-400 font-bold">{new Date(doc.createdAt).toLocaleDateString()}</p>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${getStatusColor(doc.status)}`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <button 
                      onClick={() => setSelectedDoc(doc)}
                      className="p-2 bg-gold/10 text-gold hover:bg-gold hover:text-black rounded-lg transition-all"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Verification Modal */}
      <AnimatePresence>
        {selectedDoc && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedDoc(null)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }} 
              className="relative w-full max-w-4xl bg-dark-surface border border-dark-border rounded-[2.5rem] overflow-hidden overflow-y-auto max-h-[90vh]"
            >
              <div className="p-8 border-b border-dark-border flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gold-gradient rounded-xl flex items-center justify-center text-black font-black">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">Review Document</h3>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">{selectedDoc.customer?.firstName} {selectedDoc.customer?.lastName} • {selectedDoc.type}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedDoc(null)} className="p-2 hover:bg-dark-card rounded-full text-gray-500">
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* File Preview */}
                <div className="p-6 md:p-8 bg-dark-card/50 lg:border-r border-dark-border flex flex-col" style={{height: '50vh', minHeight: '250px'}}>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Document Preview</p>
                  <div className="flex-1 bg-black rounded-2xl overflow-hidden relative group">
                    <iframe 
                      src={`${import.meta.env.VITE_API_BASE_URL}${selectedDoc.fileUrl}`} 
                      className="w-full h-full border-none"
                      title="Document Preview"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                       <a 
                        href={`${import.meta.env.VITE_API_BASE_URL}${selectedDoc.fileUrl}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="bg-white text-black px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 pointer-events-auto"
                      >
                        <ExternalLink size={16} /> Open Full View
                      </a>
                    </div>
                  </div>
                </div>

                {/* Verification Actions */}
                <div className="p-8 flex flex-col justify-between">
                  <div className="space-y-6">
                    <div className="p-6 bg-dark-card border border-dark-border rounded-2xl">
                      <h4 className="text-white font-bold mb-2">Customer Details</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-500 uppercase font-black">Full Name</span>
                          <span className="text-xs text-white font-bold">{selectedDoc.customer?.firstName} {selectedDoc.customer?.lastName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-500 uppercase font-black">Customer ID</span>
                          <span className="text-xs text-gold font-bold">{selectedDoc.customer?.customerCode}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Verification Remarks</label>
                      <textarea 
                        rows="4"
                        className="w-full bg-dark-card border border-dark-border rounded-2xl px-6 py-6 text-white outline-none focus:border-gold resize-none"
                        placeholder="Add internal notes or rejection reason..."
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                      ></textarea>
                    </div>
                  </div>

                  <div className="flex gap-4 mt-8">
                    <button 
                      onClick={() => handleVerify('REJECTED')}
                      className="flex-1 py-4 bg-red-500/10 text-red-500 border border-red-500/20 font-black text-xs tracking-widest uppercase rounded-2xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      <XCircle size={18} /> REJECT DOCUMENT
                    </button>
                    <button 
                      onClick={() => handleVerify('VERIFIED')}
                      className="flex-1 py-4 bg-green-500/10 text-green-500 border border-green-500/20 font-black text-xs tracking-widest uppercase rounded-2xl hover:bg-green-500 hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={18} /> VERIFY DOCUMENT
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default KycVerification;
