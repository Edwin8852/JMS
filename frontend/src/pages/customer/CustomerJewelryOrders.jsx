import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLiveRates } from '../../store/slices/liveRateSlice';
import { createOrder, fetchOrders } from '../../store/slices/jewelryOrderSlice';
import { 
  ShoppingBag, 
  Search,
  Gem,
  CheckCircle,
  X,
  CreditCard,
  Scale,
  ChevronRight
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

const API_BASE = (import.meta.env.VITE_API_URL || 'https://jms-vpf1.onrender.com/api').replace(/\/api$/, '');

const FALLBACK_IMAGE = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300' fill='%23f3f4f6'%3E%3Crect width='400' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-size='20' text-anchor='middle' alignment-baseline='middle' font-family='sans-serif' fill='%239ca3af'%3ESDRS Jewellery%3C/text%3E%3C/svg%3E";

const handleImageError = (e) => {
  e.target.onerror = null;
  e.target.src = FALLBACK_IMAGE;
};

const PRODUCTS = [
  { id: 1, name: 'Bridal Gold Necklace', category: 'Necklace', baseWeight: 40, icon: Gem, image: `${API_BASE}/uploads/orders/necklace.jpg` },
  { id: 2, name: 'Diamond Studded Ring', category: 'Ring', baseWeight: 5, icon: Gem, image: `${API_BASE}/uploads/orders/ring.jpg` },
  { id: 3, name: 'Traditional Gold Bangles (Set of 4)', category: 'Bangle', baseWeight: 30, icon: Gem, image: `${API_BASE}/uploads/orders/bangles.jpg` },
  { id: 4, name: 'Elegant Drop Earrings', category: 'Earrings', baseWeight: 12, icon: Gem, image: `${API_BASE}/uploads/orders/earrings.jpg` },
  { id: 5, name: 'Gold Chain (24 inch)', category: 'Chain', baseWeight: 20, icon: Gem, image: `${API_BASE}/uploads/orders/chain.jpg` },
  { id: 6, name: 'Antique Temple Pendant', category: 'Pendant', baseWeight: 25, icon: Gem, image: `${API_BASE}/uploads/orders/pendant.jpg` },
];

const CustomerJewelryOrders = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { rates: liveRates, loading: rateLoading } = useSelector((state) => state.liveRate);
  const { orders, loading: ordersLoading } = useSelector((state) => state.jewelryOrders);
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('CATALOG'); // 'CATALOG' | 'MY_ORDERS'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  const [formData, setFormData] = useState({
    weight: '',
    purity: '22K',
    goldRateAtPurchase: '',
    totalAmount: ''
  });

  useEffect(() => {
    dispatch(fetchLiveRates());
    if (user?.id) {
      dispatch(fetchOrders({ customerId: user.id }));
    }
  }, [dispatch, user?.id]);

  const handleOpenModal = (product) => {
    setSelectedProduct(product);
    const initialRate = liveRates?.gold22k || 0;
    const initialWeight = product.baseWeight;
    const initialTotal = (parseFloat(initialWeight) * parseFloat(initialRate)).toFixed(2);
    
    setFormData({
      weight: initialWeight,
      purity: '22K',
      goldRateAtPurchase: initialRate,
      totalAmount: initialTotal
    });
  };

  const handlePurityChange = (purityValue) => {
    let rate = formData.goldRateAtPurchase;
    if (purityValue === '22K' && liveRates?.gold22k) rate = liveRates.gold22k;
    if (purityValue === '18K' && liveRates?.gold18k) rate = liveRates.gold18k;
    if (purityValue === '24K' && liveRates?.gold24k) rate = liveRates.gold24k;
    
    const calcTotal = formData.weight && rate ? (parseFloat(formData.weight) * parseFloat(rate)).toFixed(2) : formData.totalAmount;

    setFormData({ 
      ...formData, 
      purity: purityValue, 
      goldRateAtPurchase: rate,
      totalAmount: calcTotal
    });
  };

  const handleWeightChange = (newWeight) => {
    const calcTotal = newWeight && formData.goldRateAtPurchase 
      ? (parseFloat(newWeight) * parseFloat(formData.goldRateAtPurchase)).toFixed(2) 
      : 0;
    setFormData({ ...formData, weight: newWeight, totalAmount: calcTotal });
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!user?.id) {
      toast.error('User session not found.');
      return;
    }
    
    try {
      // Find the actual customer ID if the user object has it, otherwise fallback to user.id
      const actualCustomerId = user?.customer?.id || user?.id;
      
      const payload = { 
        customerId: actualCustomerId,
        ornamentType: selectedProduct.name,
        purity: formData.purity,
        grossWeight: parseFloat(formData.weight),
        goldRate: parseFloat(formData.goldRateAtPurchase),
        finalAmount: parseFloat(formData.totalAmount)
      };
      
      await dispatch(createOrder(payload)).unwrap();
      toast.success(t('Your jewelry order has been placed successfully!'));
      setSelectedProduct(null);
    } catch (error) {
      toast.error(error || t('Failed to place order.'));
    }
  };

  const filteredProducts = PRODUCTS.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.category.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-black text-gray-900 dark:text-white flex items-center gap-3">
            {t('Jewelry Catalog')} <ShoppingBag className="text-purple-500" size={32} />
          </h1>
          <p className="text-gray-500 mt-2 text-sm md:text-base">
            {t('Browse and order premium custom jewelry designs at live market rates.')}
          </p>
        </div>
        
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder={t('Search products...')} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all font-medium text-gray-700 dark:text-gray-200"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 dark:border-dark-border mt-6">
        <button 
          className={`pb-4 px-6 font-bold text-sm md:text-base transition-all ${activeTab === 'CATALOG' ? 'border-b-2 border-purple-500 text-purple-600' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          onClick={() => setActiveTab('CATALOG')}
        >
          {t('Jewelry Catalog')}
        </button>
        <button 
          className={`pb-4 px-6 font-bold text-sm md:text-base transition-all ${activeTab === 'MY_ORDERS' ? 'border-b-2 border-purple-500 text-purple-600' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          onClick={() => setActiveTab('MY_ORDERS')}
        >
          {t('My Orders')}
        </button>
      </div>

      {activeTab === 'CATALOG' ? (
        <>
          {/* Catalog Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {filteredProducts.map((product, idx) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="group glass-card rounded-[2.5rem] overflow-hidden border border-gray-100 dark:border-dark-border hover:shadow-2xl hover:shadow-purple-500/20 transition-all cursor-pointer bg-white dark:bg-dark-surface"
            onClick={() => handleOpenModal(product)}
          >
            <div className="h-48 md:h-56 overflow-hidden relative">
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors z-10" />
              <img 
                src={product.image} 
                alt={product.name} 
                loading="lazy"
                onError={handleImageError}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase text-purple-600 shadow-lg">
                {product.category}
              </div>
            </div>
            
            <div className="p-6 md:p-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">{product.name}</h3>
              <p className="text-sm text-gray-500 mb-6 flex items-center gap-2">
                <Scale size={16} /> {t('Base Weight')}: {product.baseWeight}g
              </p>
              
              <button 
                onClick={(e) => { e.stopPropagation(); handleOpenModal(product); }}
                className="w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 bg-purple-500/10 text-purple-600 hover:bg-purple-500 hover:text-white transition-all"
              >
                {t('Customize & Order')} <CreditCard size={18} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-20">
          <ShoppingBag className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={64} />
          <h3 className="text-xl font-bold text-gray-400">{t('No jewelry found.')}</h3>
        </div>
      )}
        </>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {ordersLoading ? (
            <div className="col-span-full py-20 text-center text-purple-500 font-black tracking-widest uppercase animate-pulse">
              {t('Loading your orders...')}
            </div>
          ) : orders.length === 0 ? (
            <div className="col-span-full text-center py-20">
              <ShoppingBag className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={64} />
              <h3 className="text-xl font-bold text-gray-400">{t('You have no placed orders.')}</h3>
              <button 
                onClick={() => setActiveTab('CATALOG')} 
                className="mt-4 px-6 py-2 bg-purple-50 text-purple-600 font-bold rounded-xl"
              >
                {t('Browse Catalog')}
              </button>
            </div>
          ) : (
            orders.map((order) => (
              <motion.div key={order.id} className="glass-card p-4 md:p-6 rounded-3xl flex flex-col sm:flex-row gap-6 border border-gray-100 dark:border-dark-border bg-white dark:bg-dark-surface hover:shadow-xl transition-all">
                <div className="w-full sm:w-32 h-48 sm:h-32 rounded-2xl overflow-hidden shrink-0 bg-gray-50 border border-gray-100 dark:border-dark-border">
                  <img 
                    src={order.imageUrl || order.image || `${API_BASE}/uploads/orders/${order.ornamentType?.toLowerCase().replace(/\s+/g, '-') || 'default'}.jpg`}
                    alt={order.ornamentType}
                    loading="lazy"
                    onError={handleImageError}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="flex-1 flex flex-col">
                  <h3 className="font-bold text-lg md:text-xl text-gray-900 dark:text-white mb-1 line-clamp-1">{order.ornamentType}</h3>
                  <p className="text-xs md:text-sm text-gray-500 mb-2 font-medium">{order.purity} Gold • {order.grossWeight}g</p>
                  <p className="font-black text-purple-600 text-lg md:text-xl mb-4">₹{parseFloat(order.finalAmount || 0).toLocaleString()}</p>
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50 dark:border-dark-border">
                    <span className="px-3 py-1 bg-gray-50 dark:bg-dark-bg text-gray-600 dark:text-gray-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-gray-100 dark:border-dark-border shadow-sm">
                      {t(order.status)}
                    </span>
                    <button 
                      onClick={() => navigate(`/customer/services/order/${order.id}`)}
                      className="text-purple-500 font-bold text-xs md:text-sm flex items-center gap-1 hover:text-purple-600 hover:gap-2 transition-all"
                    >
                      {t('View Details')} <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Order Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedProduct(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }} 
              className="relative w-full max-w-2xl bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-gray-100 dark:border-dark-border flex justify-between items-center bg-gray-50 dark:bg-dark-card">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center text-purple-600">
                      <ShoppingBag size={24} />
                   </div>
                   <div>
                     <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{t('Place Order')}</h3>
                     <p className="text-sm text-gray-500 font-medium">{selectedProduct.name}</p>
                   </div>
                </div>
                <button onClick={() => setSelectedProduct(null)} className="p-2 hover:bg-gray-200 dark:hover:bg-dark-border rounded-full text-gray-500 transition-colors">
                   <X />
                </button>
              </div>

              <form onSubmit={handleSubmitOrder} className="p-6 md:p-8 space-y-6">
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest">{t('Custom Weight (g)')}</label>
                    <input 
                      required 
                      type="number" 
                      step="0.01" 
                      className="w-full bg-gray-50 dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-2xl px-6 py-4 text-gray-900 dark:text-white outline-none focus:border-purple-500 font-medium" 
                      value={formData.weight} 
                      onChange={e => handleWeightChange(e.target.value)} 
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest">{t('Purity Level')}</label>
                    <select 
                      className="w-full bg-gray-50 dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-2xl px-6 py-4 text-gray-900 dark:text-white outline-none focus:border-purple-500 font-medium cursor-pointer" 
                      value={formData.purity} 
                      onChange={e => handlePurityChange(e.target.value)}
                    >
                      <option value="22K">22K Gold</option>
                      <option value="18K">18K Gold</option>
                      <option value="24K">24K Gold</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest">{t('Live Rate Applied')}</label>
                    <div className="w-full bg-gray-100 dark:bg-dark-border rounded-2xl px-6 py-4 text-gray-600 dark:text-gray-300 font-black">
                       ₹ {formData.goldRateAtPurchase} /g
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest">{t('Estimated Bill Amount')}</label>
                    <div className="w-full bg-purple-500/10 border border-purple-500/20 rounded-2xl px-6 py-4 text-purple-600 font-black text-lg">
                       ₹ {formData.totalAmount ? Number(formData.totalAmount).toLocaleString() : '0'}
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <button type="submit" className="w-full py-5 bg-purple-500 hover:bg-purple-600 text-white font-black text-sm tracking-widest uppercase rounded-2xl shadow-xl shadow-purple-500/30 transition-all flex items-center justify-center gap-2">
                    {t('Confirm Order Request')} <CheckCircle size={20} />
                  </button>
                  <p className="text-center text-xs text-gray-400 mt-4">
                    {t('*Our executive will contact you to finalize design and payment details.')}
                  </p>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomerJewelryOrders;
