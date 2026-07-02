import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSubscriberDetails, enrollSubscriber, collectPayment, conductAuction, fetchAuctions } from '../../store/slices/chitFundSlice';
import { fetchCustomers } from '../../store/slices/customerSlice';
import { 
  ArrowLeft, 
  Users, 
  UserPlus, 
  Search, 
  Calendar, 
  DollarSign, 
  Clock, 
  ChevronRight,
  CreditCard,
  AlertTriangle,
  Loader2,
  Gavel,
  Trophy,
  Activity,
  Send,
  X
} from 'lucide-react';
import { toast } from 'react-toastify';
import ChitTermsModal from '../../components/common/ChitTermsModal';
import CurrencyInput from '../../components/ui/CurrencyInput';

const SchemeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { schemes, loading: chitLoading } = useSelector((state) => state.chitFund);
  const { customers, loading: customerLoading } = useSelector((state) => state.customers);
  const scheme = schemes?.find(s => s.id === id);

  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [selectedCustomerForEnroll, setSelectedCustomerForEnroll] = useState(null);
  const [isAuctionModalOpen, setIsAuctionModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('subscribers'); // 'subscribers' or 'auctions'
  const [searchTerm, setSearchTerm] = useState('');
  const [auctionHistory, setAuctionHistory] = useState([]);
  
  // Auction Form State
  const [auctionForm, setAuctionForm] = useState({
    winnerSubscriberId: '',
    bidAmount: ''
  });

  useEffect(() => {
    dispatch(fetchCustomers());
    if (id) {
      dispatch(fetchAuctions(id)).unwrap().then(setAuctionHistory);
    }
  }, [dispatch, id]);

  const handleInitiateEnroll = (customerId) => {
    setSelectedCustomerForEnroll(customerId);
    setIsTermsModalOpen(true);
  };

  const handleEnroll = async () => {
    if (!selectedCustomerForEnroll) return;
    try {
      await dispatch(enrollSubscriber({ schemeId: id, customerId: selectedCustomerForEnroll })).unwrap();
      toast.success('Subscriber enrolled successfully!');
      setIsEnrollModalOpen(false);
    } catch (error) {
      toast.error(error || 'Enrollment failed');
    } finally {
      setSelectedCustomerForEnroll(null);
    }
  };

  const handleConductAuction = async (e) => {
    e.preventDefault();
    try {
      await dispatch(conductAuction({ 
        schemeId: id, 
        ...auctionForm 
      })).unwrap();
      toast.success('Auction conducted and dividends distributed!');
      setIsAuctionModalOpen(false);
      setAuctionForm({ winnerSubscriberId: '', bidAmount: '' });
      dispatch(fetchAuctions(id)).unwrap().then(setAuctionHistory);
    } catch (error) {
      toast.error(error || 'Auction failed');
    }
  };

  if (chitLoading && !scheme) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-gold" size={48} />
      </div>
    );
  }

  if (!scheme) {
    return (
      <div className="p-8 text-center bg-dark-surface border border-dark-border rounded-3xl m-8">
        <AlertTriangle className="mx-auto text-gold mb-4" size={48} />
        <h2 className="text-2xl font-black text-white mb-2">Scheme Not Found</h2>
        <p className="text-gray-500 mb-6">The chit fund scheme you are looking for does not exist or has been removed.</p>
        <button onClick={() => navigate('/admin/chit-fund')} className="px-6 py-2 bg-gold/10 text-gold rounded-xl font-bold">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6 md:mb-8">
        <button onClick={() => navigate('/admin/chit-fund')} className="p-3 bg-dark-card rounded-xl text-gray-400 hover:text-gold transition-all self-start md:self-auto flex-shrink-0">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">{scheme?.schemeName || "Unknown Scheme"}</h1>
          <p className="text-gray-600 font-medium text-sm md:text-base">Scheme ID: {scheme?.id?.substring(0, 8) || "N/A"}...</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Scheme Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-dark-surface border border-dark-border rounded-[2.5rem] p-6 md:p-8">
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6">Financial Overview</h3>
            <div className="space-y-6">
              <div>
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Total Chit Value</p>
                <p className="text-2xl md:text-3xl font-black text-gold">₹{parseFloat(scheme?.totalAmount || 0).toLocaleString()}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Installment</p>
                  <p className="text-lg font-bold text-white">₹{parseFloat(scheme?.monthlyInstallment || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Duration</p>
                  <p className="text-lg font-bold text-white">{scheme?.durationMonths || 0} Months</p>
                </div>
              </div>
              <div className="pt-6 border-t border-dark-border">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-gray-400">Subscription Progress</span>
                  <span className="text-xs font-black text-gold">{scheme?.currentSubscribers || 0} / {scheme?.maxSubscribers || 0}</span>
                </div>
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${((scheme?.currentSubscribers || 0) / (scheme?.maxSubscribers || 1)) * 100}%` }}
                    className="h-full bg-gold-gradient"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setIsEnrollModalOpen(true)}
              disabled={scheme?.currentSubscribers >= scheme?.maxSubscribers}
              className="w-full py-4 bg-white/5 border border-white/10 text-white font-black text-sm tracking-widest uppercase rounded-2xl flex items-center justify-center gap-3 disabled:opacity-50 transition-all hover:bg-white/10"
            >
              <UserPlus size={20} /> ENROLL SUBSCRIBER
            </button>

            <button
              onClick={() => setIsAuctionModalOpen(true)}
              disabled={scheme?.currentSubscribers < scheme?.maxSubscribers}
              className="w-full py-4 bg-gold-gradient text-black font-black text-sm tracking-widest uppercase rounded-2xl shadow-xl shadow-gold/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale transition-all"
            >
              <Gavel size={20} strokeWidth={3} /> {scheme?.currentSubscribers < scheme?.maxSubscribers ? 'WAIT FOR FULL ENROLLMENT' : 'CONDUCT MONTHLY AUCTION'}
            </button>
          </div>
        </div>

        {/* Right Column: Dynamic Content Tabs */}
        <div className="lg:col-span-2">
          <div className="bg-dark-surface border border-dark-border rounded-[2.5rem] overflow-hidden">
            <div className="flex border-b border-dark-border">
              <button 
                onClick={() => setActiveTab('subscribers')}
                className={`flex-1 py-6 text-xs font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'subscribers' ? 'text-gold bg-gold/5 border-b-2 border-gold' : 'text-gray-500 hover:text-gray-300'}`}
              >
                Subscribers ({scheme?.currentSubscribers || 0})
              </button>
              <button 
                onClick={() => setActiveTab('auctions')}
                className={`flex-1 py-6 text-xs font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'auctions' ? 'text-gold bg-gold/5 border-b-2 border-gold' : 'text-gray-500 hover:text-gray-300'}`}
              >
                Auction History ({auctionHistory.length})
              </button>
            </div>

            {activeTab === 'subscribers' ? (
              <>
                <div className="p-8 border-b border-dark-border flex justify-between items-center">
                  <h3 className="text-xl font-black text-white">Active Members</h3>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input 
                      type="text" 
                      placeholder="Search subscribers..."
                      className="bg-dark-card border border-dark-border rounded-xl pl-12 pr-4 py-2 text-sm text-white focus:border-gold outline-none transition-all w-64"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[700px]">
                    <thead>
                      <tr className="border-b border-dark-border">
                        <th className="px-8 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Ticket</th>
                        <th className="px-8 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Customer</th>
                        <th className="px-8 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Status</th>
                        <th className="px-8 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Paid</th>
                        <th className="px-8 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-border/50">
                      {!scheme?.subscribers || scheme.subscribers.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-8 py-12 text-center text-gray-500 font-medium italic">No subscribers yet</td>
                        </tr>
                      ) : (
                        scheme.subscribers
                          .filter(s => s.customer?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()))
                          .map((sub) => (
                          <tr key={sub?.id} className="hover:bg-gold/5 transition-colors group">
                            <td className="px-8 py-5">
                              <span className="w-8 h-8 rounded-lg bg-dark-card flex items-center justify-center text-gold font-bold border border-dark-border">
                                #{sub?.ticketNumber || "0"}
                              </span>
                            </td>
                            <td className="px-8 py-5">
                              <div>
                                <p className="text-sm font-bold text-white">{sub?.customer?.firstName || "N/A"} {sub?.customer?.lastName || ""}</p>
                                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{sub?.customer?.customerCode}</p>
                              </div>
                            </td>
                            <td className="px-8 py-5">
                              <span className={`px-2 py-1 text-[10px] font-black rounded-md uppercase tracking-widest ${
                                sub?.status === 'ACTIVE' ? 'bg-gold/10 text-gold' : 'bg-gray-500/10 text-gray-500'
                              }`}>
                                {sub?.status || "UNKNOWN"}
                              </span>
                            </td>
                            <td className="px-8 py-5 text-sm font-bold text-white">₹{parseFloat(sub?.totalPaid || 0).toLocaleString()}</td>
                            <td className="px-8 py-5">
                              <button 
                                onClick={() => navigate(`/admin/chit-fund/subscriber/${sub?.id}`)}
                                className="p-2 text-gray-500 hover:text-gold transition-colors"
                              >
                                <ChevronRight size={20} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="p-8 space-y-4">
                {auctionHistory.length === 0 ? (
                  <div className="p-20 text-center flex flex-col items-center">
                    <Activity size={48} className="text-gray-700 mb-4" />
                    <p className="text-gray-500 font-medium italic">No auctions conducted yet. The first auction will start after all subscribers are enrolled.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {auctionHistory.map((auction, idx) => (
                      <div key={auction.id} className="p-6 bg-dark-card border border-dark-border rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-6">
                          <div className="w-12 h-12 bg-gold/10 text-gold rounded-xl flex items-center justify-center font-black">
                            {auction.monthNumber}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Trophy size={16} className="text-gold" />
                              <h4 className="text-white font-bold">{auction.winner?.customer?.firstName} {auction.winner?.customer?.lastName}</h4>
                            </div>
                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
                              Auction Date: {new Date(auction.auctionDate).toLocaleDateString()} • Month {auction.monthNumber}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-8">
                          <div className="text-right">
                            <p className="text-[10px] text-gray-500 font-black uppercase mb-1">Prize Amount</p>
                            <p className="text-lg font-black text-white">₹{parseFloat(auction.prizeAmount).toLocaleString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-gold font-black uppercase mb-1">Dividend/Member</p>
                            <p className="text-lg font-black text-gold">₹{(parseFloat(auction.dividendAmount) / scheme.maxSubscribers).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enroll Modal */}
      <AnimatePresence>
        {isEnrollModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEnrollModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-lg bg-dark-surface border border-dark-border rounded-[2.5rem] overflow-hidden overflow-y-auto max-h-[90vh]">
              <div className="p-6 bg-gold-gradient flex justify-between items-center text-black">
                <h3 className="text-xl font-black uppercase tracking-tight">Enroll Subscriber</h3>
                <button onClick={() => setIsEnrollModalOpen(false)} className="p-2 hover:bg-black/10 rounded-full transition-all">
                  <ArrowLeft className="rotate-180" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input 
                    type="text" 
                    placeholder="Search by name or mobile..." 
                    className="w-full bg-dark-card border border-dark-border rounded-xl pl-12 pr-4 py-3 text-white outline-none focus:border-gold"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="max-h-64 overflow-y-auto space-y-2 custom-scrollbar pr-2">
                  {customerLoading ? (
                    <div className="py-8 text-center text-gray-500">
                      <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                      Loading customers...
                    </div>
                  ) : customers?.filter(c => 
                    c.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    c.mobileNumber?.includes(searchTerm)
                  ).length > 0 ? (
                    customers?.filter(c => 
                      c.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      c.mobileNumber?.includes(searchTerm)
                    ).map(customer => (
                      <div key={customer?.id} className="p-4 bg-dark-card border border-dark-border rounded-xl flex justify-between items-center group hover:border-gold transition-all">
                        <div>
                          <p className="text-sm font-bold text-white">{customer?.firstName} {customer?.lastName}</p>
                          <p className="text-xs text-gray-500">{customer?.mobileNumber}</p>
                        </div>
                        <button onClick={() => handleInitiateEnroll(customer?.id)} className="px-4 py-2 bg-gold/10 text-gold text-xs font-black rounded-lg group-hover:bg-gold group-hover:text-black transition-all">
                          ENROLL
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-gray-500 text-sm">
                      No customers found matching "{searchTerm}"
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Auction Modal */}
      <AnimatePresence>
        {isAuctionModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAuctionModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-lg bg-dark-surface border border-dark-border rounded-[2.5rem] overflow-hidden overflow-y-auto max-h-[90vh]">
              <div className="p-8 bg-gold-gradient flex justify-between items-center text-black">
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tight">Conduct Auction</h3>
                  <p className="text-black/60 text-[10px] font-bold uppercase tracking-widest">Month {auctionHistory.length + 1} of {scheme.durationMonths}</p>
                </div>
                <button onClick={() => setIsAuctionModalOpen(false)} className="p-2 hover:bg-black/10 rounded-full transition-all">
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleConductAuction} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Select Winner</label>
                  <select 
                    required
                    className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-4 text-white outline-none focus:border-gold"
                    value={auctionForm.winnerSubscriberId}
                    onChange={(e) => setAuctionForm({...auctionForm, winnerSubscriberId: e.target.value})}
                  >
                    <option value="">Choose the winning member...</option>
                    {scheme.subscribers
                      ?.filter(sub => !auctionHistory.some(a => a.winnerSubscriberId === sub.id))
                      .map(sub => (
                        <option key={sub.id} value={sub.id}>
                          Ticket #{sub.ticketNumber} - {sub.customer?.firstName} {sub.customer?.lastName}
                        </option>
                      ))
                    }
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Bid Amount (Discount)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gold font-bold">₹</span>
                    <CurrencyInput 
                      required
                      className="w-full bg-dark-card border border-dark-border rounded-xl pl-10 pr-4 py-4 text-white outline-none focus:border-gold"
                      placeholder="Enter discount amount"
                      value={auctionForm.bidAmount}
                      onChange={(e) => setAuctionForm({...auctionForm, bidAmount: e.target.value})}
                    />
                  </div>
                  <p className="text-[10px] text-gray-600 italic">This amount will be deducted from the total chit value.</p>
                </div>

                {auctionForm.bidAmount && (
                  <div className="p-6 bg-gold/5 border border-gold/20 rounded-2xl space-y-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Prize Amount:</span>
                      <span className="text-white font-bold">₹{(parseFloat(scheme.totalAmount) - parseFloat(auctionForm.bidAmount || 0)).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Foreman Commission (5%):</span>
                      <span className="text-white font-bold">₹{(parseFloat(scheme.totalAmount) * 0.05).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs border-t border-gold/10 pt-2">
                      <span className="text-gold font-black uppercase tracking-widest">Dividend per Member:</span>
                      <span className="text-gold font-black">
                        ₹{((parseFloat(auctionForm.bidAmount || 0) - (parseFloat(scheme.totalAmount) * 0.05)) / scheme.maxSubscribers).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

                <button 
                  type="submit" 
                  className="w-full py-5 bg-gold-gradient text-black font-black text-sm tracking-widest uppercase rounded-2xl shadow-xl shadow-gold/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                >
                  <Send size={18} strokeWidth={3} /> FINALIZE AUCTION
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ChitTermsModal 
        isOpen={isTermsModalOpen}
        onClose={() => {
          setIsTermsModalOpen(false);
          setSelectedCustomerForEnroll(null);
        }}
        onAccept={handleEnroll}
      />
    </div>
  );
};

export default SchemeDetails;
