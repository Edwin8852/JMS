import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyDocuments, uploadDocument } from '../../store/slices/documentSlice';
import { 
  FileText, 
  Upload, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  ShieldCheck,
  X,
  FileCheck
} from 'lucide-react';
import { toast } from 'react-toastify';

const KycCenter = () => {
  const dispatch = useDispatch();
  const { documents, loading } = useSelector((state) => state.documents);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [docType, setDocType] = useState('AADHAR');

  useEffect(() => {
    dispatch(fetchMyDocuments());
  }, [dispatch]);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return toast.error('Please select a file');

    const formData = new FormData();
    formData.append('document', selectedFile);
    formData.append('type', docType);

    try {
      await dispatch(uploadDocument(formData)).unwrap();
      toast.success('Document uploaded successfully!');
      setIsUploadModalOpen(false);
      setSelectedFile(null);
      dispatch(fetchMyDocuments());
    } catch (error) {
      toast.error(error || 'Upload failed');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'VERIFIED': return <span className="flex items-center gap-1 text-green-500 bg-green-500/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest"><CheckCircle size={12}/> Verified</span>;
      case 'PENDING': return <span className="flex items-center gap-1 text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest"><Clock size={12}/> Pending Review</span>;
      case 'REJECTED': return <span className="flex items-center gap-1 text-red-500 bg-red-500/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest"><AlertCircle size={12}/> Rejected</span>;
      default: return null;
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            KYC <span className="text-gold">Center</span> <ShieldCheck className="text-gold" size={32} />
          </h1>
          <p className="text-gray-500 mt-1 font-medium">Verify your identity to unlock higher loan limits and gold schemes</p>
        </motion.div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center gap-3 bg-gold-gradient text-black px-8 py-4 rounded-2xl font-black text-sm shadow-xl shadow-gold/20"
        >
          <Upload size={20} strokeWidth={3} />
          UPLOAD NEW DOCUMENT
        </motion.button>
      </div>

      {/* Verification Status Banner */}
      <div className="bg-dark-surface border border-dark-border rounded-[2.5rem] p-8 mb-12 flex items-center gap-8">
        <div className="w-20 h-20 bg-gold/10 rounded-3xl flex items-center justify-center text-gold">
          <FileCheck size={40} />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-black text-white mb-2">Compliance Rating</h2>
          <p className="text-gray-500 text-sm mb-4">Your account is currently in <span className="text-gold font-bold">Standard Verification</span> mode.</p>
          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden max-w-md">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(documents.filter(d => d.status === 'VERIFIED').length / 3) * 100}%` }}
              className="h-full bg-gold-gradient"
            />
          </div>
        </div>
        <div className="hidden md:block text-right">
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Verified Docs</p>
          <p className="text-3xl font-black text-white">{documents.filter(d => d.status === 'VERIFIED').length} <span className="text-gray-600 text-xl">/ 3</span></p>
        </div>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="h-64 bg-dark-card animate-pulse rounded-[2rem] border border-dark-border" />)
        ) : (
          documents.map((doc, idx) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-dark-surface border border-dark-border rounded-[2rem] p-6 hover:border-gold/30 transition-all group"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-dark-card rounded-xl flex items-center justify-center text-gold border border-dark-border group-hover:scale-110 transition-transform">
                  <FileText size={24} />
                </div>
                {getStatusBadge(doc.status)}
              </div>
              <h3 className="text-lg font-bold text-white mb-1 uppercase tracking-tight">{doc.type.replace('_', ' ')}</h3>
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-4">Uploaded: {new Date(doc.createdAt).toLocaleDateString()}</p>
              
              <a 
                href={`${import.meta.env.VITE_API_BASE_URL}${doc.fileUrl}`} 
                target="_blank" 
                rel="noreferrer"
                className="w-full py-3 bg-dark-card border border-dark-border text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-gold hover:text-black transition-all flex items-center justify-center gap-2"
              >
                View Document
              </a>
            </motion.div>
          ))
        )}
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsUploadModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }} 
              className="relative w-full max-w-lg bg-dark-surface border border-dark-border rounded-[2.5rem] overflow-hidden"
            >
              <div className="p-8 bg-gold-gradient flex justify-between items-center">
                <h3 className="text-2xl font-black text-black">Upload <span className="opacity-70">KYC</span></h3>
                <button onClick={() => setIsUploadModalOpen(false)} className="p-2 hover:bg-black/10 rounded-full text-black">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleUpload} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Document Type</label>
                  <select 
                    className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-4 text-white outline-none focus:border-gold"
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                  >
                    <option value="AADHAR">Aadhar Card</option>
                    <option value="PAN">PAN Card</option>
                    <option value="LOAN_AGREEMENT">Loan Agreement</option>
                    <option value="OTHER">Other Identification</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">File Selection</label>
                  <div className="relative h-40 bg-dark-card border-2 border-dashed border-dark-border rounded-2xl flex flex-col items-center justify-center gap-3 group hover:border-gold/50 transition-all cursor-pointer">
                    <input 
                      type="file" 
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Upload size={32} className="text-gray-600 group-hover:text-gold transition-colors" />
                    <p className="text-sm font-bold text-gray-400 group-hover:text-white transition-colors">
                      {selectedFile ? selectedFile.name : 'Click or Drag to Upload'}
                    </p>
                    <p className="text-[10px] text-gray-600 font-black uppercase">MAX 5MB (PDF, JPG, PNG)</p>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-5 bg-gold-gradient text-black font-black text-sm tracking-widest uppercase rounded-2xl shadow-xl shadow-gold/20 hover:scale-[1.02] transition-all disabled:opacity-50"
                >
                  {loading ? 'UPLOADING...' : 'SUBMIT FOR VERIFICATION'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default KycCenter;
