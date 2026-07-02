import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Phone, Mail, MapPin, Hash, CreditCard, ShieldCheck, Calendar, RefreshCcw, Briefcase, FileText } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { resendCustomerCredentials } from '../../store/slices/customerSlice';
import { toast } from 'react-toastify';

const CustomerDetailsModal = ({ isOpen, onClose, customer, onEdit, onDelete }) => {
  const dispatch = useDispatch();
  const [isResending, setIsResending] = useState(false);

  if (!customer) return null;

  const handleResendCredentials = async () => {
    if (!window.confirm(`Are you sure you want to reset and resend credentials for ${customer.firstName}?`)) return;
    
    setIsResending(true);
    try {
      const result = await dispatch(resendCustomerCredentials(customer.id)).unwrap();
      
      // Flat response: { success, emailSent, message }
      if (result.emailSent) {
        toast.success(result.message || 'Credentials reset and email sent successfully!');
      } else {
        toast.warn(result.message || 'Credentials reset successfully, but email delivery failed.');
      }
    } catch (error) {
      toast.error(error || 'Failed to resend credentials');
    } finally {
      setIsResending(false);
    }
  };


  const detailItem = (icon, label, value) => (
    <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-dark-card rounded-2xl border border-transparent hover:border-gold/20 transition-all">
      <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-0.5">{label}</p>
        <p className="text-gray-900 dark:text-white font-medium">{value || 'N/A'}</p>
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl bg-white dark:bg-dark-surface rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-8 border-b border-gray-100 dark:border-dark-border flex items-center justify-between bg-gold-gradient relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
              <div className="text-white relative z-10">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white text-2xl font-bold border border-white/30">
                    {customer.firstName?.[0]}{customer.lastName?.[0]}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{customer.firstName} {customer.lastName}</h2>
                    <p className="text-white/80 text-sm">Customer ID: {customer.customerCode}</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full text-white transition-colors relative z-10"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {detailItem(<User size={20} />, "Customer Type", customer.customerType || 'REGISTERED')}
                {detailItem(<Mail size={20} />, "Email Address", customer.email)}
                {detailItem(<Phone size={20} />, "Mobile Number", customer.mobileNumber)}
                {customer.alternativeNumber && detailItem(<Phone size={20} />, "Alternative Number", customer.alternativeNumber)}
                {detailItem(<Hash size={20} />, "Aadhar Number", customer.aadharNumber)}
                {customer.panNumber && detailItem(<CreditCard size={20} />, "PAN Number", customer.panNumber)}
                {customer.gender && detailItem(<User size={20} />, "Gender", customer.gender)}
                {customer.occupation && detailItem(<Briefcase size={20} />, "Occupation", customer.occupation)}
                {detailItem(<Calendar size={20} />, "Registration Date", new Date(customer.createdAt).toLocaleDateString())}
                {detailItem(<ShieldCheck size={20} />, "KYC Status", customer.kycStatus)}
                
                <div className="md:col-span-2">
                  {detailItem(<MapPin size={20} />, "Residential Address", 
                    `${customer.address || ''} ${customer.city || ''} ${customer.state || ''} ${customer.pincode || ''}`.trim()
                  )}
                </div>

                {customer.remarks && (
                  <div className="md:col-span-2">
                    {detailItem(<FileText size={20} />, "Admin Notes / Remarks", customer.remarks)}
                  </div>
                )}
              </div>

              {/* Status Badges */}
              <div className="mt-8 pt-8 border-t border-gray-100 dark:border-dark-border flex flex-wrap gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-600 rounded-xl text-xs font-bold">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  ACCOUNT ACTIVE
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-gold/10 text-gold rounded-xl text-xs font-bold">
                  <ShieldCheck size={14} />
                  KYC VERIFIED
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-gray-50 dark:bg-dark-card flex flex-wrap justify-end gap-4">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl font-bold text-sm hover:bg-gray-50 transition-all"
              >
                Close
              </button>
              <button
                onClick={onDelete}
                className="px-6 py-3 border border-red-500 text-red-500 rounded-xl font-bold text-sm hover:bg-red-500 hover:text-white transition-all flex items-center gap-2"
              >
                Delete
              </button>
              <button
                onClick={handleResendCredentials}
                disabled={isResending}
                className="px-6 py-3 border border-gold text-gold rounded-xl font-bold text-sm hover:bg-gold hover:text-white transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isResending ? (
                  <RefreshCcw size={18} className="animate-spin" />
                ) : (
                  <RefreshCcw size={18} />
                )}
                Resend Credentials
              </button>
              <button
                onClick={onEdit}
                className="px-6 py-3 bg-gold-gradient text-white rounded-xl font-bold text-sm shadow-lg shadow-gold/20 hover:scale-[1.02] transition-all"
              >
                Edit Details
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CustomerDetailsModal;
