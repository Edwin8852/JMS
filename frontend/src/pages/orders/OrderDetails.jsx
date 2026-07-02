import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingBag, Scale, Hash, User, Phone, Mail, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { fetchOrderById } from '../../store/slices/jewelryOrderSlice';
import api from '../../api/axios';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const dispatch = useDispatch();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const action = await dispatch(fetchOrderById(id));
        if (fetchOrderById.fulfilled.match(action)) {
          setOrder(action.payload);
        } else {
          setError(action.payload || 'Order Details unavailable or failed to load.');
        }
      } catch (err) {
        setError('Order Details unavailable or failed to load.');
      } finally {
        setLoading(false);
      }
    };
    loadOrder();
  }, [id, dispatch]);

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto flex justify-center py-20">
        <p className="text-gold animate-pulse font-black uppercase tracking-widest">{t('Loading order details...')}</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gold transition-colors font-bold text-sm uppercase tracking-widest">
          <ArrowLeft size={16} /> {t('Back')}
        </button>
        <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-3xl p-10 text-center">
          <p className="text-gray-500 font-bold uppercase tracking-widest">{t(error || 'Order Details Not Available')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gold transition-colors font-bold text-sm uppercase tracking-widest mb-6">
        <ArrowLeft size={16} /> {t('Back to Orders')}
      </button>

      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-gray-200 dark:border-dark-border pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
             <ShoppingBag className="text-gold" size={28} /> {t('Order')} <span className="text-gold">{t('Details')}</span>
          </h1>
          <p className="text-gray-500 font-bold text-sm mt-1 uppercase flex items-center gap-2">
            <Hash size={14}/> {order.orderNumber}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
           <span className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest border 
            ${order.status === 'DELIVERED' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
              order.status === 'CANCELLED' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
              'bg-blue-500/10 text-blue-500 border-blue-500/20'}`}>
             {t(order.status)}
           </span>
           <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border 
            ${order.paymentStatus === 'PAID' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
              order.paymentStatus === 'PENDING_CASH_COLLECTION' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 
              'bg-gray-500/10 text-gray-500 border-gray-500/20'}`}>
             {t(order.paymentStatus || 'PENDING')} ({t(order.paymentMethod || 'CASH')})
           </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-3xl p-6">
             <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2"><User size={16} className="text-gold"/> {t('Customer Information')}</h3>
             <div className="space-y-4">
                <div>
                  <p className="text-[10px] text-gray-600 font-bold uppercase">{t('Name')}</p>
                  <p className="text-gray-900 dark:text-white font-bold">{order.customer?.firstName} {order.customer?.lastName}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-gray-600 font-bold uppercase">{t('Phone')}</p>
                    <p className="text-gray-700 dark:text-gray-300 flex items-center gap-1"><Phone size={12}/> {order.customer?.mobile || 'N/A'}</p>
                  </div>
                  {order.customer?.email && (
                    <div>
                      <p className="text-[10px] text-gray-600 font-bold uppercase">{t('Email')}</p>
                      <p className="text-gray-700 dark:text-gray-300 flex items-center gap-1"><Mail size={12}/> {order.customer?.email}</p>
                    </div>
                  )}
                </div>
             </div>
          </div>

          {/* Specifications */}
          <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-3xl p-6">
             <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2"><ShoppingBag size={16} className="text-gold"/> {t('Jewelry Specifications')}</h3>
             <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-gray-600 font-bold uppercase">{t('Ornament Type')}</p>
                    <p className="text-gray-900 dark:text-white font-black">{order.ornamentType}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-600 font-bold uppercase">{t('Purity')}</p>
                    <p className="text-gold font-black">{order.purity}</p>
                  </div>
                </div>
                <div className="border-t border-gray-100 dark:border-dark-border pt-4">
                  <div>
                    <p className="text-[10px] text-gray-600 font-bold uppercase">{t('Gross Weight')}</p>
                    <p className="text-gray-700 dark:text-gray-300 flex items-center gap-1"><Scale size={14}/> {order.grossWeight}g</p>
                  </div>
                </div>
                {order.remarks && (
                  <div className="border-t border-gray-100 dark:border-dark-border pt-4">
                    <p className="text-[10px] text-gray-600 font-bold uppercase">{t('Remarks')}</p>
                    <p className="text-gray-700 dark:text-gray-300 text-sm mt-1">{order.remarks}</p>
                  </div>
                )}
                {(order.imageUrl || order.image) && (
                  <div className="border-t border-gray-100 dark:border-dark-border pt-4 mt-4">
                    <p className="text-[10px] text-gray-600 font-bold uppercase mb-2">{t('Order Image')}</p>
                    <div className="w-full h-48 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 dark:border-dark-border">
                       <img 
                         src={order.imageUrl || order.image} 
                         alt={order.ornamentType || 'Order Image'} 
                         className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                         onError={(e) => {
                           e.target.onerror = null;
                           e.target.src = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300' fill='%23f3f4f6'%3E%3Crect width='400' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-size='20' text-anchor='middle' alignment-baseline='middle' font-family='sans-serif' fill='%239ca3af'%3ENo Image Available%3C/text%3E%3C/svg%3E";
                         }}
                       />
                    </div>
                  </div>
                )}
             </div>
          </div>
        </motion.div>

        {/* Billing Details */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-6">
           <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-3xl p-6">
             <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2"><Hash size={16} className="text-gold"/> {t('Billing Details')}</h3>
             
             <div className="space-y-3 font-medium text-sm">
                <div className="flex justify-between border-b border-gray-100 dark:border-dark-border pb-3">
                   <span className="text-gray-600 dark:text-gray-400">{t('Gold Value')}</span>
                   <span className="text-gray-900 dark:text-white">₹{parseFloat(order.grossWeight * order.goldRate).toFixed(2)}</span>
                </div>

                <div className="flex justify-between border-b border-gray-100 dark:border-dark-border pb-3">
                   <span className="text-gray-600 dark:text-gray-400">{t('Wastage Amount')} ({order.wastagePercent}%)</span>
                   <span className="text-gray-900 dark:text-white">₹{order.wastageAmount}</span>
                </div>

                <div className="flex justify-between border-b border-gray-100 dark:border-dark-border pb-3">
                   <span className="text-gray-600 dark:text-gray-400">{t('Making Charge Amount')} (₹{order.makingChargePerGram}/g)</span>
                   <span className="text-gray-900 dark:text-white">₹{order.makingChargeAmount}</span>
                </div>

                <div className="flex justify-between border-b border-gray-100 dark:border-dark-border pb-3">
                   <span className="text-gray-600 dark:text-gray-400">
                     {t('GST Breakdown')}<br/>
                     <span className="text-[10px] text-gray-500">Gold GST @ 3% + Making GST @ 5%</span>
                   </span>
                   <span className="text-gold font-bold">₹{order.totalGST}</span>
                </div>

                <div className="flex justify-between border-b border-gray-100 dark:border-dark-border pb-3">
                   <span className="text-gray-600 dark:text-gray-400">{t('Advance Paid')} <span className="text-[10px] ml-1 text-green-500 font-bold">(70%)</span></span>
                   <span className="text-green-500 font-bold">₹{order.advanceAmount}</span>
                </div>
                
                <div className="flex justify-between pb-1">
                   <span className="text-gray-600 dark:text-gray-400">{t('Balance Pending')} <span className="text-[10px] ml-1 text-red-500 font-bold">(30%)</span></span>
                   <span className="text-red-500 font-bold">₹{order.balanceAmount}</span>
                </div>
             </div>
           </div>
        </motion.div>

        {/* Grand Total */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="md:col-span-1 lg:col-span-2 bg-gray-50 dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-3xl p-6">
           <div className="flex flex-col md:flex-row justify-between items-center bg-gold-gradient rounded-2xl p-6 shadow-xl shadow-gold/20">
             <div>
               <p className="text-black/70 font-black text-xs uppercase tracking-widest">{t('Final Amount')}</p>
               <h2 className="text-3xl font-black text-black mt-1">₹{parseFloat(order.finalAmount).toLocaleString()}</h2>
             </div>
             <div className="mt-4 md:mt-0 text-right">
               {order.deliveryDate && (
                 <>
                   <p className="text-black/70 font-bold text-[10px] uppercase">{t('Delivery Date')}</p>
                   <p className="text-black font-black flex items-center justify-end gap-1 mb-2">
                     <Clock size={16}/> {new Date(order.deliveryDate).toLocaleDateString()}
                   </p>
                 </>
               )}
               <p className="text-black/70 font-bold text-[10px] uppercase">{t('Generated On')}</p>
               <p className="text-black/80 font-black flex items-center justify-end gap-1 text-xs">
                 <Clock size={12}/> {new Date(order.createdAt).toLocaleDateString()}
               </p>
             </div>
           </div>
        </motion.div>

        {/* Audit Trail */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="md:col-span-1 lg:col-span-2">
           <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-3xl p-6">
             <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2"><User size={16} className="text-gold"/> {t('Audit & Tracking')}</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600 dark:text-gray-400">
               <div>
                 <p className="text-[10px] font-bold uppercase">{t('Created By')}</p>
                 <p className="text-gray-900 dark:text-white font-medium">{order.createdBy ? t('System User ID: ') + order.createdBy : t('N/A (Legacy)')}</p>
               </div>
               <div>
                 <p className="text-[10px] font-bold uppercase">{t('Status Changed By')}</p>
                 <p className="text-gray-900 dark:text-white font-medium">{order.statusChangedBy ? t('System User ID: ') + order.statusChangedBy : t('N/A')}</p>
                 {order.statusUpdatedAt && <p className="text-xs">{new Date(order.statusUpdatedAt).toLocaleString()}</p>}
               </div>
               <div>
                 <p className="text-[10px] font-bold uppercase">{t('Payment Confirmed By')}</p>
                 <p className="text-gray-900 dark:text-white font-medium">{order.paymentConfirmedBy ? t('System User ID: ') + order.paymentConfirmedBy : t('N/A')}</p>
                 {order.paymentUpdatedAt && <p className="text-xs">{new Date(order.paymentUpdatedAt).toLocaleString()}</p>}
               </div>
             </div>
           </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderDetails;
