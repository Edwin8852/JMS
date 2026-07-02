import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addStock, fetchDashboardStats } from '../../store/slices/inventorySlice';
import { toast } from 'react-toastify';
import { PackagePlus } from 'lucide-react';
import { motion } from 'framer-motion';

const StockEntry = () => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    itemName: '22K Gold',
    purity: '22K',
    unit: 'Gram',
    quantity: '',
    transactionType: 'STOCK_IN',
    remarks: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(addStock(formData)).unwrap();
      toast.success('Stock updated successfully!');
      dispatch(fetchDashboardStats());
      setFormData({ ...formData, quantity: '', remarks: '' });
    } catch (err) {
      toast.error(err || 'Failed to add stock');
    }
  };

  return (
    <div className="w-full px-4 md:px-6 py-6 md:py-8 space-y-6">
      <h1 className="text-2xl md:text-4xl font-black text-black uppercase tracking-tight flex items-center gap-3 mb-8">
        <PackagePlus className="text-gold" size={32} /> Stock <span className="text-gold">Entry</span>
      </h1>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-dark-surface border border-dark-border rounded-3xl p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Item Name</label>
              <select className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-3 text-white text-sm"
                value={formData.itemName}
                onChange={e => setFormData({ ...formData, itemName: e.target.value })}
              >
                <option value="24K Gold">24K Gold</option>
                <option value="22K Gold">22K Gold</option>
                <option value="18K Gold">18K Gold</option>
                <option value="Silver">Silver</option>
                <option value="Diamond">Diamond</option>
                <option value="Precious Stone">Precious Stone</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Purity</label>
              <select className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-3 text-white text-sm"
                value={formData.purity}
                onChange={e => setFormData({ ...formData, purity: e.target.value })}
              >
                <option value="24K">24K</option>
                <option value="22K">22K</option>
                <option value="18K">18K</option>
                <option value="Silver">Silver</option>
                <option value="Stone">Stone</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Quantity</label>
              <input required type="number" step="0.001" min="0" className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-3 text-white text-sm" 
                value={formData.quantity}
                onChange={e => setFormData({ ...formData, quantity: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Unit</label>
              <select className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-3 text-white text-sm"
                value={formData.unit}
                onChange={e => setFormData({ ...formData, unit: e.target.value })}
              >
                <option value="Gram">Gram</option>
                <option value="Kg">Kg</option>
                <option value="Piece">Piece</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Transaction Type</label>
              <select className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-3 text-white text-sm"
                value={formData.transactionType}
                onChange={e => setFormData({ ...formData, transactionType: e.target.value })}
              >
                <option value="STOCK_IN">Stock In</option>
                <option value="ADJUSTMENT">Adjustment</option>
              </select>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Remarks</label>
              <textarea rows="2" className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-3 text-white text-sm" 
                value={formData.remarks}
                onChange={e => setFormData({ ...formData, remarks: e.target.value })}
              ></textarea>
            </div>
          </div>

          <button type="submit" className="w-full bg-gold-gradient text-black font-black uppercase tracking-widest py-4 rounded-xl hover:opacity-90 transition-opacity">
            Confirm Stock Update
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default StockEntry;
