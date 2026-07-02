import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders, createOrder, updateOrder, deleteOrder } from '../../store/slices/jewelryOrderSlice';
import { fetchCustomers } from '../../store/slices/customerSlice';
import { fetchLiveRates } from '../../store/slices/liveRateSlice';
import { 
  ShoppingBag, Plus, Trash2, Edit, ChevronRight, Hash, Scale, X
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import CurrencyInput from '../../components/ui/CurrencyInput';

const ORNAMENT_TYPES = [
  'Necklace', 'Bangles', 'Ring', 'Chain', 'Bracelet', 
  'Earrings', 'Pendant', 'Anklet', 'Nose Pin', 'Custom Design'
];

const ORDER_STATUSES = [
  'DRAFT', 'PENDING_ADVANCE', 'ADVANCE_PAID', 
  'IN_PRODUCTION', 'READY_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'
];

const OrderList = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  
  const { orders, loading } = useSelector((state) => state.jewelryOrders);
  const { customers } = useSelector((state) => state.customers);
  const { rates } = useSelector((state) => state.liveRate);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    customerId: '',
    ornamentType: 'Necklace',
    purity: '22K',
    grossWeight: '',
    goldRate: '',
    wastagePercent: '',
    wastageAmount: '0.00',
    makingChargePerGram: '',
    makingChargeAmount: '0.00',
    totalGST: '0.00',
    finalAmount: '0.00',
    advanceAmount: '0.00',
    balanceAmount: '0.00',
    status: 'DRAFT',
    paymentMethod: 'CASH',
    paymentStatus: 'PENDING',
    deliveryDate: '',
    remarks: '',
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    dispatch(fetchCustomers());
    dispatch(fetchLiveRates());
  }, [dispatch]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      dispatch(fetchOrders(searchTerm ? { search: searchTerm } : {}));
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, dispatch]);

  const calculateBilling = (updates) => {
    const current = { ...formData, ...updates };
    const safeParse = (val) => {
      const num = parseFloat(val);
      return isNaN(num) || num < 0 ? 0 : num;
    };

    const gw = safeParse(current.grossWeight);
    const rate = safeParse(current.goldRate);
    const wp = safeParse(current.wastagePercent);
    const makeRate = updates?.makingChargePerGram !== undefined ? safeParse(updates.makingChargePerGram) : (safeParse(current.makingChargePerGram) || 800);

    const goldVal = gw * rate;
    const wa = (goldVal * wp) / 100;
    const ma = gw * makeRate;

    const subTotal = goldVal + wa + ma;
    const goldGst = (goldVal + wa) * 0.03;
    const makeGst = ma * 0.05;
    const totGst = goldGst + makeGst;

    const finalAmt = subTotal + totGst;
    const advance = finalAmt * 0.70;
    const balance = finalAmt - advance;

    setFormData({
      ...current,
      makingChargePerGram: makeRate,
      wastageAmount: wa.toFixed(2),
      makingChargeAmount: ma.toFixed(2),
      totalGST: totGst.toFixed(2),
      finalAmount: finalAmt.toFixed(2),
      advanceAmount: advance.toFixed(2),
      balanceAmount: balance.toFixed(2)
    });
  };

  const handlePurityChange = (purityValue) => {
    let rate = formData.goldRate;
    if (purityValue === '22K' && rates?.gold22k) rate = rates.gold22k;
    if (purityValue === '18K' && rates?.gold18k) rate = rates.gold18k;
    if (purityValue === '24K' && rates?.gold24k) rate = rates.gold24k;
    calculateBilling({ purity: purityValue, goldRate: rate });
  };

  const handleChange = (field, value) => {
    calculateBilling({ [field]: value });
  };

  const openNewOrder = () => {
    setEditingOrder(null);
    setFormData({
      customerId: '', customerDisplay: '', ornamentType: 'Necklace', purity: '22K', grossWeight: '',
      goldRate: rates?.gold22k || '', wastagePercent: '', wastageAmount: '0.00',
      makingChargePerGram: '800', makingChargeAmount: '0.00', totalGST: '0.00',
      finalAmount: '0.00', advanceAmount: '0.00', balanceAmount: '0.00',
      status: 'DRAFT', deliveryDate: '', remarks: ''
    });
    setIsModalOpen(true);
  };

  const openEditOrder = (order) => {
    if (order.status === 'DELIVERED') {
      toast.warning(t('Cannot edit delivered orders.'));
      return;
    }
    setEditingOrder(order);
    setFormData({
      customerId: order.customerId,
      customerDisplay: order.customer ? `${order.customer.firstName} ${order.customer.lastName} - ${order.customer.mobileNumber || order.customer.mobile}` : '',
      ornamentType: order.ornamentType,
      purity: order.purity,
      grossWeight: order.grossWeight,
      goldRate: order.goldRate,
      wastagePercent: order.wastagePercent,
      wastageAmount: order.wastageAmount,
      makingChargePerGram: order.makingChargePerGram,
      makingChargeAmount: order.makingChargeAmount,
      totalGST: order.totalGST,
      finalAmount: order.finalAmount,
      advanceAmount: order.advanceAmount,
      balanceAmount: order.balanceAmount,
      status: order.status,
      paymentMethod: order.paymentMethod || 'CASH',
      paymentStatus: order.paymentStatus || 'PENDING',
      deliveryDate: order.deliveryDate || '',
      remarks: order.remarks || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (orderId) => {
    if (window.confirm(t('Are you sure you want to cancel this order? This will soft delete it.'))) {
      try {
        await dispatch(deleteOrder(orderId)).unwrap();
        toast.info(t('Order cancelled successfully.'));
      } catch (err) {
        toast.error(err || 'Delete failed.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const payload = { ...formData };
      delete payload.customerDisplay;
      if (payload.deliveryDate === '') payload.deliveryDate = null;
      if (payload.remarks === '') payload.remarks = null;

      if (editingOrder) {
        await dispatch(updateOrder({ id: editingOrder.id, data: payload })).unwrap();
        toast.success(t('Order updated successfully!'));
      } else {
        await dispatch(createOrder(payload)).unwrap();
        toast.success(t('Jewelry order placed successfully!'));
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error(error || t('Failed to process order'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = filterStatus === 'ALL' || o.status === filterStatus;
    return matchesStatus;
  });

  return (
    <div className="w-full px-4 md:px-6 py-6 md:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white uppercase">
            {t('Jewelry')} <span className="text-gold">{t('Orders')}</span> <ShoppingBag className="inline-block mb-1 text-gold" size={28}/>
          </h1>
          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">{t('Manage jewelry creation lifecycle')}</p>
        </motion.div>
        
        <button
          onClick={openNewOrder}
          className="bg-gold-gradient text-black px-6 py-3 rounded-2xl font-black text-sm shadow-xl flex items-center justify-center gap-2 hover:scale-105 transition-all"
        >
          <Plus size={18} strokeWidth={3} /> {t('CREATE ORDER')}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <input 
          type="text" 
          placeholder={t('Search by Order Number or Customer...')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-dark-card border border-dark-border rounded-xl px-4 py-3 text-sm text-white"
        />
        <select 
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="md:w-48 bg-dark-card border border-dark-border rounded-xl px-4 py-3 text-sm text-white"
        >
          <option value="ALL">{t('All Status')}</option>
          {ORDER_STATUSES.map(s => <option key={s} value={s}>{t(s)}</option>)}
        </select>
      </div>

      {/* Orders List */}
      <div className="bg-dark-surface border border-dark-border rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
             <thead>
               <tr className="bg-dark-card border-b border-dark-border">
                 <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase">{t('Order')}</th>
                 <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase">{t('Customer')}</th>
                 <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase">{t('Details')}</th>
                 <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase">{t('Amount')}</th>
                 <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase">{t('Status')}</th>
                 <th className="px-6 py-5 text-right text-[10px] font-black text-gray-500 uppercase">{t('Actions')}</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-dark-border/50">
               {loading ? (
                 <tr><td colSpan="6" className="p-10 text-center text-gold animate-pulse font-black uppercase text-xs">{t('Loading orders...')}</td></tr>
               ) : filteredOrders.length === 0 ? (
                 <tr><td colSpan="6" className="p-10 text-center text-gray-500 font-bold uppercase text-xs">{t('No Orders Found')}</td></tr>
               ) : (
                 filteredOrders.map((order, idx) => (
                   <motion.tr 
                     key={order.id}
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: idx * 0.05 }}
                     className="hover:bg-gold/5 transition-colors"
                   >
                     <td className="px-6 py-4">
                       <p className="text-white font-black text-sm">{order.ornamentType}</p>
                       <p className="text-[10px] text-gray-500 font-bold flex items-center gap-1"><Hash size={10}/> {order.orderNumber}</p>
                     </td>
                     <td className="px-6 py-4">
                       <p className="text-white font-bold text-sm">{order.customer?.firstName} {order.customer?.lastName}</p>
                       <p className="text-[10px] text-gray-400">{order.customer?.mobileNumber || order.customer?.mobile}</p>
                     </td>
                     <td className="px-6 py-4">
                       <p className="text-xs text-gray-300 font-medium">{order.grossWeight}g - {order.purity}</p>
                     </td>
                     <td className="px-6 py-4">
                       <p className="text-gold font-black text-sm">₹{parseFloat(order.finalAmount).toLocaleString()}</p>
                       <p className="text-[10px] text-green-500">Adv: ₹{parseFloat(order.advanceAmount).toLocaleString()}</p>
                     </td>
                     <td className="px-6 py-4">
                       <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border 
                         ${order.status === 'DELIVERED' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                           order.status === 'CANCELLED' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                           'bg-blue-500/10 text-blue-500 border-blue-500/20'}`}>
                         {t(order.status)}
                       </span>
                     </td>
                     <td className="px-6 py-4 text-right space-x-2">
                       <button onClick={() => openEditOrder(order)} className="p-2 text-gray-400 hover:text-white transition-colors" title="Edit">
                         <Edit size={16} />
                       </button>
                       <button onClick={() => handleDelete(order.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Cancel Order">
                         <Trash2 size={16} />
                       </button>
                       <button onClick={() => navigate(`/admin/jewelry-orders/${order.id}`)} className="p-2 text-gold hover:text-white transition-colors" title="View Details">
                         <ChevronRight size={18} />
                       </button>
                     </td>
                   </motion.tr>
                 ))
               )}
             </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.95, opacity: 0, y: 10 }} 
              className="relative w-full max-w-4xl bg-dark-surface border border-dark-border rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-6 bg-dark-card border-b border-dark-border flex justify-between items-center shrink-0">
                <h3 className="text-xl font-black text-white uppercase tracking-tight">
                  {editingOrder ? t('Edit Order') : t('Create Jewelry Order')}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white transition-colors"><X size={24}/></button>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                <form id="order-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Row 1 */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase">{t('Customer')} *</label>
                    <input 
                      required 
                      disabled={!!editingOrder} 
                      type="text"
                      list="customer-list"
                      placeholder={t('Search by Name or Mobile...')}
                      className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-3 text-white text-sm" 
                      value={formData.customerDisplay !== undefined ? formData.customerDisplay : (customers.find(c => c.id === formData.customerId) ? `${customers.find(c => c.id === formData.customerId).firstName} ${customers.find(c => c.id === formData.customerId).lastName} - ${customers.find(c => c.id === formData.customerId).mobileNumber || customers.find(c => c.id === formData.customerId).mobile}` : '')}
                      onChange={e => {
                        const val = e.target.value;
                        const match = customers.find(c => `${c.firstName} ${c.lastName} - ${c.mobileNumber || c.mobile}` === val);
                        setFormData({ ...formData, customerId: match ? match.id : '', customerDisplay: val });
                      }}
                    />
                    <datalist id="customer-list">
                      {customers.map(c => <option key={c.id} value={`${c.firstName} ${c.lastName} - ${c.mobileNumber || c.mobile}`} />)}
                    </datalist>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase">{t('Ornament Type')} *</label>
                    <select required className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-3 text-white text-sm" value={formData.ornamentType} onChange={e => handleChange('ornamentType', e.target.value)}>
                      {ORNAMENT_TYPES.map(o => <option key={o} value={o}>{t(o)}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase">{t('Purity')} *</label>
                    <select className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-3 text-white text-sm" value={formData.purity} onChange={e => handlePurityChange(e.target.value)}>
                      <option value="24K">24K</option>
                      <option value="22K">22K</option>
                      <option value="18K">18K</option>
                    </select>
                  </div>

                  {/* Row 2 */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase">{t('Gross Weight (g)')} *</label>
                    <input required type="number" step="0.001" min="0" className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-3 text-white text-sm" value={formData.grossWeight} onChange={e => handleChange('grossWeight', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase">{t('Gold Rate (₹/g)')} *</label>
                    <CurrencyInput required className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-3 text-white text-sm" value={formData.goldRate} onChange={e => handleChange('goldRate', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase">{t('Wastage (%)')} *</label>
                    <input required type="number" step="0.01" min="0" className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-3 text-white text-sm" value={formData.wastagePercent} onChange={e => handleChange('wastagePercent', e.target.value)} />
                  </div>

                  {/* Row 3 */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase">{t('Making Charge (₹/g)')} *</label>
                    <CurrencyInput required className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-3 text-white text-sm" value={formData.makingChargePerGram} onChange={e => handleChange('makingChargePerGram', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase">{t('Delivery Date')}</label>
                    <input type="date" className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-3 text-white text-sm [color-scheme:dark]" value={formData.deliveryDate} onChange={e => handleChange('deliveryDate', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase">{t('Status')}</label>
                    <select className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-3 text-white text-sm" value={formData.status} onChange={e => handleChange('status', e.target.value)} disabled={!editingOrder}>
                      {ORDER_STATUSES.map(s => <option key={s} value={s}>{t(s)}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase">{t('Payment Method')}</label>
                    <select className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-3 text-white text-sm" value={formData.paymentMethod} onChange={e => handleChange('paymentMethod', e.target.value)}>
                      <option value="CASH">Cash</option>
                      <option value="ONLINE">Online</option>
                      <option value="CARD">Card</option>
                      <option value="BANK_TRANSFER">Bank Transfer</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase">{t('Payment Status')}</label>
                    <select className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-3 text-white text-sm" value={formData.paymentStatus} onChange={e => handleChange('paymentStatus', e.target.value)}>
                      <option value="PENDING">Pending</option>
                      <option value="PENDING_CASH_COLLECTION">Pending Cash Collection</option>
                      <option value="ADVANCE_PAID">Advance Paid</option>
                      <option value="PAID">Fully Paid</option>
                    </select>
                  </div>

                  {formData.paymentMethod === 'CASH' && (
                    <div className="md:col-span-3 bg-red-900/20 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm font-bold flex items-center gap-2">
                      ⚠️ {t('Cash payment must be collected directly at the shop. Please visit the showroom to complete the payment.')}
                    </div>
                  )}

                  {/* Row 4 (Full Width) */}
                  <div className="md:col-span-3 space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase">{t('Remarks')}</label>
                    <textarea rows="2" className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-3 text-white text-sm" value={formData.remarks} onChange={e => handleChange('remarks', e.target.value)}></textarea>
                  </div>

                  {/* Calculated Results Box */}
                  <div className="md:col-span-3 bg-dark-card border border-dark-border rounded-2xl p-5 mt-2">
                     <h4 className="text-xs font-black text-gold uppercase tracking-widest mb-4">{t('Billing Summary')}</h4>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-medium text-gray-300">
                        <div><span className="block text-gray-500 font-bold mb-1 uppercase">{t('Wastage')}</span> ₹{formData.wastageAmount}</div>
                        <div><span className="block text-gray-500 font-bold mb-1 uppercase">{t('Making')}</span> ₹{formData.makingChargeAmount}</div>
                        <div><span className="block text-gray-500 font-bold mb-1 uppercase">{t('GST')}</span> ₹{formData.totalGST}</div>
                        <div><span className="block text-gold font-bold mb-1 uppercase">{t('Final Amt')}</span> <span className="text-sm font-black text-white">₹{formData.finalAmount}</span></div>
                        <div className="md:col-span-2 pt-2 border-t border-dark-border mt-2 text-green-400"><span className="uppercase text-[10px] tracking-wider text-green-500">{t('Advance (70%)')}</span> <br/> ₹{formData.advanceAmount}</div>
                        <div className="md:col-span-2 pt-2 border-t border-dark-border mt-2 text-red-400"><span className="uppercase text-[10px] tracking-wider text-red-500">{t('Balance (30%)')}</span> <br/> ₹{formData.balanceAmount}</div>
                     </div>
                  </div>
                </form>
              </div>

              <div className="p-6 bg-dark-card border-t border-dark-border shrink-0">
                <button type="submit" form="order-form" disabled={isSubmitting} className="w-full bg-gold-gradient text-black py-4 rounded-xl font-black text-sm tracking-widest uppercase hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
                  {isSubmitting ? t('PROCESSING...') : (editingOrder ? t('UPDATE ORDER') : t('CONFIRM & CREATE ORDER'))}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrderList;
