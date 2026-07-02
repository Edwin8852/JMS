import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Phone, Mail, MapPin, Hash, CreditCard, ShieldCheck } from 'lucide-react';

import { useDispatch, useSelector } from 'react-redux';
import { createCustomer } from '../../store/slices/customerSlice';
import { toast } from 'react-toastify';

const customerSchema = z.object({
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

const AddCustomerModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.customers);
  const [createdCredentials, setCreatedCredentials] = React.useState(null);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      mobileNumber: '',
      email: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      aadharNumber: '',
      panNumber: '',
    }
  });

  const onSubmit = async (data) => {
    try {
      const result = await dispatch(createCustomer(data)).unwrap();
      setCreatedCredentials(result.credentials);
      toast.success('Customer created and credentials generated!');
    } catch (error) {
      toast.error(error || 'Failed to add customer');
    }
  };

  const handleClose = () => {
    setCreatedCredentials(null);
    reset();
    onClose();
  };


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
                <h2 className="text-2xl font-bold">{createdCredentials ? 'Registration Successful' : 'Add New Customer'}</h2>
                <p className="text-white/80 text-sm">
                  {createdCredentials ? 'Customer has been registered successfully.' : 'Fill in the details to register a new customer.'}
                </p>
              </div>
              <button 
                onClick={handleClose}
                className="p-2 hover:bg-white/20 rounded-full text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {createdCredentials ? (
              <div className="p-12 text-center space-y-8">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600 shadow-lg shadow-green-200">
                  <ShieldCheck size={48} />
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold mb-2">Account Created!</h3>
                  <p className="text-gray-500">Credentials have been sent to the customer's email.</p>
                </div>

                <div className="bg-gray-50 dark:bg-dark-card p-6 rounded-3xl border border-gray-100 dark:border-dark-border space-y-4 max-w-sm mx-auto">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Customer ID:</span>
                    <span className="font-bold text-gold">{createdCredentials.customerCode}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Mobile/Login:</span>
                    <span className="font-bold">{createdCredentials.mobile}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Password:</span>
                    <span className="font-bold px-2 py-1 bg-white dark:bg-dark-surface rounded-lg border border-gray-200">{createdCredentials.password}</span>
                  </div>
                </div>

                <button
                  onClick={handleClose}
                  className="w-full py-4 bg-gold-gradient text-white rounded-2xl font-bold shadow-lg shadow-gold/20 hover:shadow-gold/40 transition-all"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="p-4 md:p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {/* ... rest of the form ... */}

                {/* First Name */}
                <div className="space-y-2">
                  <label className="text-sm font-bold flex items-center gap-2">
                    <User size={16} className="text-gold" /> First Name *
                  </label>
                  <input
                    {...register('firstName')}
                    className={`w-full bg-gray-50 dark:bg-dark-card border ${errors.firstName ? 'border-red-500' : 'border-transparent'} focus:border-gold rounded-2xl py-3 px-4 outline-none transition-all`}
                    placeholder="Enter first name"
                  />
                  {errors.firstName && <p className="text-red-500 text-xs font-medium">{errors.firstName.message}</p>}
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                  <label className="text-sm font-bold flex items-center gap-2">
                    <User size={16} className="text-gold" /> Last Name
                  </label>
                  <input
                    {...register('lastName')}
                    className="w-full bg-gray-50 dark:bg-dark-card border border-transparent focus:border-gold rounded-2xl py-3 px-4 outline-none transition-all"
                    placeholder="Enter last name"
                  />
                </div>

                {/* Mobile Number */}
                <div className="space-y-2">
                  <label className="text-sm font-bold flex items-center gap-2">
                    <Phone size={16} className="text-gold" /> Mobile Number *
                  </label>
                  <input
                    {...register('mobileNumber')}
                    maxLength={10}
                    onInput={(e) => { e.target.value = e.target.value.replace(/[^0-9]/g, ''); }}
                    className={`w-full bg-gray-50 dark:bg-dark-card border ${errors.mobileNumber ? 'border-red-500' : 'border-transparent'} focus:border-gold rounded-2xl py-3 px-4 outline-none transition-all`}
                    placeholder="Enter 10-digit mobile number"
                  />
                  {errors.mobileNumber && <p className="text-red-500 text-xs font-medium">{errors.mobileNumber.message}</p>}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-sm font-bold flex items-center gap-2">
                    <Mail size={16} className="text-gold" /> Email Address
                  </label>
                  <input
                    {...register('email')}
                    className={`w-full bg-gray-50 dark:bg-dark-card border ${errors.email ? 'border-red-500' : 'border-transparent'} focus:border-gold rounded-2xl py-3 px-4 outline-none transition-all`}
                    placeholder="Enter email address"
                  />
                  {errors.email && <p className="text-red-500 text-xs font-medium">{errors.email.message}</p>}
                </div>

                {/* Aadhar Number */}
                <div className="space-y-2">
                  <label className="text-sm font-bold flex items-center gap-2">
                    <Hash size={16} className="text-gold" /> Aadhar Number
                  </label>
                  <input
                    {...register('aadharNumber')}
                    maxLength={12}
                    onInput={(e) => { e.target.value = e.target.value.replace(/[^0-9]/g, ''); }}
                    className="w-full bg-gray-50 dark:bg-dark-card border border-transparent focus:border-gold rounded-2xl py-3 px-4 outline-none transition-all"
                    placeholder="Enter 12-digit Aadhaar"
                  />
                </div>

                {/* PAN Number */}
                <div className="space-y-2">
                  <label className="text-sm font-bold flex items-center gap-2">
                    <CreditCard size={16} className="text-gold" /> PAN Number
                  </label>
                  <input
                    {...register('panNumber')}
                    maxLength={10}
                    onInput={(e) => { e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); }}
                    className="w-full bg-gray-50 dark:bg-dark-card border border-transparent focus:border-gold rounded-2xl py-3 px-4 outline-none transition-all uppercase"
                    placeholder="ABCDE1234F"
                  />
                </div>

                {/* Address */}
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-bold flex items-center gap-2">
                    <MapPin size={16} className="text-gold" /> Full Address
                  </label>
                  <textarea
                    {...register('address')}
                    rows={3}
                    className="w-full bg-gray-50 dark:bg-dark-card border border-transparent focus:border-gold rounded-2xl py-3 px-4 outline-none transition-all resize-none"
                    placeholder="Enter residential address"
                  />
                </div>

                {/* City */}
                <div className="space-y-2">
                  <label className="text-sm font-bold">City</label>
                  <input
                    {...register('city')}
                    className="w-full bg-gray-50 dark:bg-dark-card border border-transparent focus:border-gold rounded-2xl py-3 px-4 outline-none transition-all"
                    placeholder="City"
                  />
                </div>

                {/* Pincode */}
                <div className="space-y-2">
                  <label className="text-sm font-bold">Pincode</label>
                  <input
                    {...register('pincode')}
                    className="w-full bg-gray-50 dark:bg-dark-card border border-transparent focus:border-gold rounded-2xl py-3 px-4 outline-none transition-all"
                    placeholder="6-digit Pincode"
                  />
                </div>
              </div>

              <div className="mt-10 flex gap-4">
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
                  className="flex-1 py-4 bg-gold-gradient text-white rounded-2xl font-bold shadow-lg shadow-gold/20 hover:shadow-gold/40 transition-all disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Register Customer'}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);
};

export default AddCustomerModal;

