import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSchemes, enrollSubscriber } from '../../store/slices/chitFundSlice';
import { Coins, Users, Calendar, ArrowRight, ShieldCheck, Loader2, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ChitTermsModal from '../../components/common/ChitTermsModal';
const ChitServiceSelection = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { schemes, loading } = useSelector((state) => state.chitFund);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchSchemes());
  }, [dispatch]);

  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [selectedSchemeForJoin, setSelectedSchemeForJoin] = useState(null);

  const handleInitiateJoin = (schemeId) => {
    setSelectedSchemeForJoin(schemeId);
    setIsTermsModalOpen(true);
  };

  const handleConfirmJoin = async () => {
    if (!selectedSchemeForJoin) return;
    try {
      // Find the customerId from the user object (stored in auth state)
      const customerId = user?.customer?.id;
      
      if (!customerId) {
          toast.error("Customer profile not found. Please complete your KYC.");
          return;
      }

      await dispatch(enrollSubscriber({ schemeId: selectedSchemeForJoin, customerId })).unwrap();
      toast.success('Successfully joined the chit scheme!');
      navigate('/customer/dashboard');
    } catch (error) {
      toast.error(error || 'Failed to join scheme');
    } finally {
      setSelectedSchemeForJoin(null);
    }
  };

  // Safe mapping for active schemes
  const activeSchemes = Array.isArray(schemes) ? schemes : [];

  const schemeAmounts = [2000, 4000, 6000, 8000, 10000];

  return (
    <div className="space-y-10 pb-20">
      <div className="flex items-center gap-4">
          <Link to="/customer/services" className="p-2 hover:bg-gray-100 rounded-full transition-all">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-4xl font-display font-bold">Chit Fund Schemes</h1>
            <p className="text-gray-500 text-lg">Invest monthly and grow your savings with our trusted chit plans.</p>
          </div>
      </div>

      {/* Always-visible Scheme Plans Reference Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[2rem] overflow-hidden shadow-2xl shadow-yellow-500/10 border border-yellow-400/20"
        style={{ background: 'linear-gradient(135deg, #7B1A1A 0%, #9B2222 50%, #7B1A1A 100%)' }}
      >
        {/* Header */}
        <div className="px-6 py-5 text-center border-b border-yellow-400/30">
          <p className="text-yellow-300 font-black text-base md:text-lg leading-relaxed">
            நீங்கள் செலுத்தும் ஒவ்வொரு தவணையும் தங்கமாக மாறுகிறது
          </p>
          <p className="text-yellow-200/70 text-xs mt-1 font-medium">
            Every installment you pay turns into Gold
          </p>
        </div>

        {/* Table */}
        <div className="p-4 md:p-6">
          <div className="rounded-xl overflow-hidden border border-yellow-400/40">
            {/* Table Header */}
            <div className="grid grid-cols-2 bg-yellow-400/90 text-black">
              <div className="px-6 py-3 font-black text-sm text-center border-r border-yellow-500">
                <p>மாத தவணை தொகை</p>
                <p className="text-[10px] font-bold opacity-70">Monthly Amount</p>
              </div>
              <div className="px-6 py-3 font-black text-sm text-center">
                <p>மாதங்கள்</p>
                <p className="text-[10px] font-bold opacity-70">Months</p>
              </div>
            </div>

            {/* Table Rows */}
            {schemeAmounts.map((amount, index) => (
              <div
                key={amount}
                className={`grid grid-cols-2 border-t border-yellow-400/20 ${
                  index % 2 === 0 ? 'bg-yellow-400/10' : 'bg-yellow-400/5'
                }`}
              >
                <div className="px-6 py-4 flex items-center justify-center gap-2 border-r border-yellow-400/20">
                  <span className="text-yellow-300 font-black text-lg">₹</span>
                  <span className="text-white font-black text-xl">{amount.toLocaleString()}</span>
                </div>
                <div className="px-6 py-4 flex items-center justify-center">
                  <span className="text-white font-black text-xl">20</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <div className="px-6 pb-5 text-center">
          <p className="text-yellow-200/60 text-xs font-medium">
            நிபந்தனைகள் பொருந்தும் &nbsp;•&nbsp; Terms & Conditions Apply
          </p>
        </div>
      </motion.div>

      {loading && activeSchemes.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin text-gold" size={48} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activeSchemes.length > 0 ? activeSchemes.map((scheme, index) => (
            <motion.div
              key={scheme?.id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card overflow-hidden group"
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className={`px-4 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${
                    scheme?.status === 'ACTIVE' ? 'bg-green-100 text-green-600' : 'bg-gold/10 text-gold'
                  }`}>
                    {scheme?.status || "PENDING"}
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Monthly Pay</p>
                    <p className="text-2xl font-black text-gold">₹{parseFloat(scheme?.monthlyInstallment || 0).toLocaleString()}</p>
                  </div>
                </div>

                <h3 className="text-2xl font-bold mb-4">{scheme?.schemeName || "Unknown Scheme"}</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="p-4 bg-gray-50 rounded-2xl">
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Total Value</p>
                    <p className="text-lg font-bold">₹{parseFloat(scheme?.totalAmount || 0).toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl">
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Duration</p>
                    <p className="text-lg font-bold">{scheme?.durationMonths || 0} Mo</p>
                  </div>
                </div>

                <div className="space-y-4 mb-10">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 flex items-center gap-2 font-medium">
                      <Users size={16} className="text-gold" /> Subscribers
                    </span>
                    <span className="font-bold">{scheme?.currentSubscribers || 0} / {scheme?.maxSubscribers || 0}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${((scheme?.currentSubscribers || 0) / (scheme?.maxSubscribers || 1)) * 100}%` }}
                      className="h-full bg-gold-gradient"
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 flex items-center gap-2 font-medium">
                      <Calendar size={16} className="text-gold" /> Start Date
                    </span>
                    <span className="font-bold">
                      {scheme?.startDate ? new Date(scheme.startDate).toLocaleDateString() : "N/A"}
                    </span>
                  </div>
                </div>

                <button 
                  onClick={() => handleInitiateJoin(scheme?.id)}
                  disabled={scheme?.currentSubscribers >= scheme?.maxSubscribers}
                  className="w-full py-4 bg-gold-gradient text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-gold/20 hover:shadow-gold/40 transition-all disabled:opacity-50 disabled:grayscale"
                >
                  {scheme?.currentSubscribers >= scheme?.maxSubscribers ? 'Fully Subscribed' : <>Join This Scheme <ArrowRight size={18} /></>}
                </button>
              </div>
            </motion.div>
          )) : (
            <div className="col-span-full text-center py-20 bg-gray-50 rounded-[3rem]">
                <Coins size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-bold">No Active Schemes</h3>
                <p className="text-gray-500">Check back later for new chit fund opportunities.</p>
            </div>
          )}
        </div>
      )}

      <ChitTermsModal 
        isOpen={isTermsModalOpen}
        onClose={() => {
          setIsTermsModalOpen(false);
          setSelectedSchemeForJoin(null);
        }}
        onAccept={handleConfirmJoin}
      />
    </div>
  );
};

export default ChitServiceSelection;
