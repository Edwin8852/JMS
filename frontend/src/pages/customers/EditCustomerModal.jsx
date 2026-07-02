import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Phone, Mail, MapPin, Hash, CreditCard, Save } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { updateCustomer } from '../../store/slices/customerSlice';
import { toast } from 'react-toastify';

const editSchema = z.object({
  firstName: z.string().min(2, 'First name is required (min 2 chars)'),
  lastName: z.string().optional(),
  mobileNumber: z.string().regex(/^[0-9]{10}$/, 'Mobile must be exactly 10 digits'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  aadharNumber: z.string().regex(/^[0-9]{12}$/, 'Aadhaar must be exactly 12 digits').optional().or(z.literal('')),
  panNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format (ABCDE1234F)').optional().or(z.literal('')),
});

const EditCustomerModal = ({ isOpen, onClose, customer }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.customers);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(editSchema) });

  useEffect(() => {
    if (customer) {
      reset({
        firstName: customer.firstName || '',
        lastName: customer.lastName || '',
        mobileNumber: customer.mobileNumber || '',
        email: customer.email || '',
        address: customer.address || '',
        city: customer.city || '',
        state: customer.state || '',
        pincode: customer.pincode || '',
        aadharNumber: customer.aadharNumber || '',
        panNumber: customer.panNumber || '',
      });
    }
  }, [customer, reset]);

  const onSubmit = async (data) => {
    try {
      await dispatch(updateCustomer({ id: customer.id, data })).unwrap();
      toast.success('Customer updated successfully!');
      onClose();
    } catch (error) {
      toast.error(error || 'Failed to update customer');
    }
  };

  const Field = ({ label, icon: Icon, children, error, colSpan }) => (
    <div className={`space-y-2 ${colSpan ? 'md:col-span-2' : ''}`}>
      <label className="text-sm font-bold flex items-center gap-2">
        <Icon size={16} className="text-gold" /> {label}
      </label>
      {children}
      {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
    </div>
  );

  const inputClass = (hasError) =>
    `w-full bg-gray-50 dark:bg-dark-card border ${hasError ? 'border-red-500' : 'border-transparent'} focus:border-gold rounded-2xl py-3 px-4 outline-none transition-all`;

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
            <div className="p-8 border-b border-gray-100 dark:border-dark-border flex items-center justify-between bg-gold-gradient">
              <div className="text-white">
                <h2 className="text-2xl font-bold">Edit Customer</h2>
                <p className="text-white/80 text-sm">
                  Editing: {customer?.firstName} {customer?.lastName} · {customer?.customerCode}
                </p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="First Name *" icon={User} error={errors.firstName?.message}>
                  <input {...register('firstName')} className={inputClass(errors.firstName)} placeholder="First name" />
                </Field>

                <Field label="Last Name" icon={User} error={errors.lastName?.message}>
                  <input {...register('lastName')} className={inputClass(false)} placeholder="Last name" />
                </Field>

                <Field label="Mobile Number *" icon={Phone} error={errors.mobileNumber?.message}>
                  <input
                    {...register('mobileNumber')}
                    maxLength={10}
                    onInput={(e) => { e.target.value = e.target.value.replace(/[^0-9]/g, ''); }}
                    className={inputClass(errors.mobileNumber)}
                    placeholder="10-digit mobile number"
                  />
                </Field>

                <Field label="Email Address" icon={Mail} error={errors.email?.message}>
                  <input {...register('email')} className={inputClass(errors.email)} placeholder="Email address" />
                </Field>

                <Field label="Aadhaar Number" icon={Hash} error={errors.aadharNumber?.message}>
                  <input
                    {...register('aadharNumber')}
                    maxLength={12}
                    onInput={(e) => { e.target.value = e.target.value.replace(/[^0-9]/g, ''); }}
                    className={inputClass(errors.aadharNumber)}
                    placeholder="12-digit Aadhaar"
                  />
                </Field>

                <Field label="PAN Number" icon={CreditCard} error={errors.panNumber?.message}>
                  <input
                    {...register('panNumber')}
                    maxLength={10}
                    onInput={(e) => { e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); }}
                    className={`${inputClass(errors.panNumber)} uppercase`}
                    placeholder="ABCDE1234F"
                  />
                </Field>

                <Field label="Full Address" icon={MapPin} colSpan>
                  <textarea
                    {...register('address')}
                    rows={3}
                    className={inputClass(false) + ' resize-none'}
                    placeholder="Residential address"
                  />
                </Field>

                <Field label="City" icon={MapPin}>
                  <input {...register('city')} className={inputClass(false)} placeholder="City" />
                </Field>

                <Field label="Pincode" icon={MapPin}>
                  <input {...register('pincode')} className={inputClass(false)} placeholder="6-digit Pincode" />
                </Field>
              </div>

              <div className="mt-8 flex gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-4 border border-gray-200 dark:border-dark-border rounded-2xl font-bold hover:bg-gray-50 dark:hover:bg-dark-card transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-4 bg-gold-gradient text-white rounded-2xl font-bold shadow-lg shadow-gold/20 hover:shadow-gold/40 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default EditCustomerModal;
