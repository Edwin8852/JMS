import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSchemes, createScheme, updateScheme, deleteScheme } from '../../store/slices/chitFundSlice';
import { Plus, X, Calendar, DollarSign, Clock, Users, ArrowLeft, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import CurrencyInput from '../../components/ui/CurrencyInput';

const SchemeManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [activeTab, setActiveTab] = useState('active'); // 'active', 'history'
  const { schemes, loading } = useSelector((state) => state.chitFund);

  const [formData, setFormData] = useState({
    schemeName: '',
    totalAmount: '',
    monthlyInstallment: '',
    durationMonths: '',
    maxSubscribers: '',
    startDate: '',
    description: ''
  });

  useEffect(() => {
    dispatch(fetchSchemes());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditModalOpen && selectedScheme) {
        await dispatch(updateScheme({ id: selectedScheme.id, data: formData })).unwrap();
        toast.success('Chit Scheme updated successfully!');
        setIsEditModalOpen(false);
      } else {
        await dispatch(createScheme(formData)).unwrap();
        toast.success('Chit Scheme created successfully!');
        setIsModalOpen(false);
      }
      resetForm();
    } catch (error) {
      toast.error(error || `Failed to ${isEditModalOpen ? 'update' : 'create'} scheme`);
    }
  };

  const resetForm = () => {
    setFormData({
      schemeName: '',
      totalAmount: '',
      monthlyInstallment: '',
      durationMonths: '',
      maxSubscribers: '',
      startDate: '',
      description: ''
    });
    setSelectedScheme(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (e, scheme) => {
    e.stopPropagation();
    setSelectedScheme(scheme);
    setFormData({
      schemeName: scheme.schemeName,
      totalAmount: scheme.totalAmount,
      monthlyInstallment: scheme.monthlyInstallment,
      durationMonths: scheme.durationMonths,
      maxSubscribers: scheme.maxSubscribers,
      startDate: scheme.startDate ? new Date(scheme.startDate).toISOString().split('T')[0] : '',
      description: scheme.description || ''
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = async (e, scheme) => {
    e.stopPropagation();
    if (scheme.currentSubscribers > 0) {
      toast.error('Cannot delete scheme with enrolled subscribers');
      return;
    }
    if (window.confirm(`Are you sure you want to delete ${scheme.schemeName}?`)) {
      try {
        await dispatch(deleteScheme(scheme.id)).unwrap();
        toast.success('Scheme deleted successfully');
      } catch (error) {
        toast.error(error || 'Failed to delete scheme');
      }
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 md:mb-8 gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/chit-fund')}
            className="p-3 bg-dark-card hover:bg-gold/10 text-gray-400 hover:text-gold rounded-xl transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Scheme <span className="text-gold">Management</span></h1>
            <p className="text-gray-600 text-sm font-medium">Configure and launch new chit investment plans</p>
          </div>
        </div>
        <button
          onClick={openCreateModal}
          className="w-full sm:w-auto bg-gold-gradient text-black px-6 py-3 rounded-xl font-black text-xs tracking-widest uppercase flex items-center justify-center gap-2 shadow-lg shadow-gold/20 hover:scale-105 transition-all"
        >
          <Plus size={18} strokeWidth={3} /> Create New Scheme
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 md:gap-4 border-b border-gray-200 pb-4 mb-6">
        <button 
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 md:px-6 md:py-3 rounded-full text-xs md:text-sm font-black uppercase tracking-widest transition-all ${
            activeTab === 'active' ? 'bg-gold text-white shadow-lg shadow-gold/30' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          Active & Upcoming Schemes
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 md:px-6 md:py-3 rounded-full text-xs md:text-sm font-black uppercase tracking-widest transition-all ${
            activeTab === 'history' ? 'bg-gold text-white shadow-lg shadow-gold/30' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          Closed & Archived Schemes
        </button>
      </div>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {schemes.filter(s => activeTab === 'history' ? (s.status === 'COMPLETED' || s.status === 'CLOSED' || s.status === 'ARCHIVED' || s.status === 'CANCELLED') : (s.status === 'ACTIVE' || s.status === 'UPCOMING')).map((scheme) => (
          <motion.div
            key={scheme.id}
            layout
            onClick={() => navigate(`/admin/chit-fund/scheme/${scheme.id}`)}
            className="bg-dark-surface border border-dark-border rounded-[2rem] p-6 hover:border-gold/30 transition-all cursor-pointer relative group"
          >
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-bold text-white pr-20">{scheme.schemeName}</h3>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${
                scheme.status === 'ACTIVE' ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
                : scheme.status === 'UPCOMING' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
              }`}>
                {scheme.status}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="absolute top-6 right-24 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={(e) => openEditModal(e, scheme)}
                className="p-2 bg-dark-card rounded-full text-gray-400 hover:text-gold hover:bg-gold/10 transition-colors"
                title="Edit Scheme"
              >
                <Edit2 size={16} />
              </button>
              <button 
                onClick={(e) => handleDelete(e, scheme)}
                className="p-2 bg-dark-card rounded-full text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                title="Delete Scheme"
              >
                <Trash2 size={16} />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-3 bg-dark-card rounded-xl border border-dark-border">
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Total Value</p>
                <p className="text-lg font-bold text-gold">₹{parseFloat(scheme.totalAmount).toLocaleString()}</p>
              </div>
              <div className="p-3 bg-dark-card rounded-xl border border-dark-border">
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Installment</p>
                <p className="text-lg font-bold text-white">₹{parseFloat(scheme.monthlyInstallment).toLocaleString()}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Clock size={14} className="text-gold" />
                <span>Duration: <strong>{scheme.durationMonths} Months</strong></span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Users size={14} className="text-gold" />
                <span>Subscribers: <strong>{scheme.currentSubscribers} / {scheme.maxSubscribers}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Calendar size={14} className="text-gold" />
                <span>Start Date: <strong>{new Date(scheme.startDate).toLocaleDateString()}</strong></span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {(isModalOpen || isEditModalOpen) && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setIsModalOpen(false); setIsEditModalOpen(false); resetForm(); }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-dark-surface border border-dark-border rounded-[2.5rem] shadow-2xl overflow-hidden overflow-y-auto max-h-[90vh]"
            >
              <div className="p-8 border-b border-dark-border flex justify-between items-center bg-gold-gradient">
                <h2 className="text-2xl font-black text-black">
                  {isEditModalOpen ? 'Edit' : 'Create'} <span className="opacity-70">Scheme</span>
                </h2>
                <button onClick={() => { setIsModalOpen(false); setIsEditModalOpen(false); resetForm(); }} className="p-2 hover:bg-black/10 rounded-full text-black">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Scheme Name</label>
                    <input
                      required
                      type="text"
                      className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-3 text-white focus:border-gold outline-none transition-all"
                      placeholder="e.g. Diamond 5 Lakhs"
                      value={formData.schemeName}
                      onChange={(e) => setFormData({...formData, schemeName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Chit Amount (₹)</label>
                    <CurrencyInput
                      required
                      disabled={isEditModalOpen && selectedScheme?.currentSubscribers > 0}
                      className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-3 text-white focus:border-gold outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="5,00,000"
                      value={formData.totalAmount}
                      onChange={(e) => setFormData({...formData, totalAmount: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Monthly Installment (₹)</label>
                    <CurrencyInput
                      required
                      disabled={isEditModalOpen && selectedScheme?.currentSubscribers > 0}
                      className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-3 text-white focus:border-gold outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="10,000"
                      value={formData.monthlyInstallment}
                      onChange={(e) => setFormData({...formData, monthlyInstallment: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Duration (Months)</label>
                    <input
                      required
                      disabled={isEditModalOpen && selectedScheme?.currentSubscribers > 0}
                      type="number"
                      className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-3 text-white focus:border-gold outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="50"
                      value={formData.durationMonths}
                      onChange={(e) => setFormData({...formData, durationMonths: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Max Subscribers</label>
                    <input
                      required
                      disabled={isEditModalOpen && selectedScheme?.currentSubscribers > 0}
                      type="number"
                      className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-3 text-white focus:border-gold outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="50"
                      value={formData.maxSubscribers}
                      onChange={(e) => setFormData({...formData, maxSubscribers: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Start Date</label>
                    <input
                      required
                      disabled={isEditModalOpen && selectedScheme?.currentSubscribers > 0}
                      type="date"
                      className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-3 text-white focus:border-gold outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      value={formData.startDate}
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gold-gradient text-black font-black text-sm tracking-widest uppercase rounded-2xl shadow-xl shadow-gold/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                >
                  {loading ? 'Processing...' : (isEditModalOpen ? 'Save Changes' : 'Launch New Scheme')}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SchemeManagement;
