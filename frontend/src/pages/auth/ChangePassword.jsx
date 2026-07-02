import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Lock, Loader2, ShieldCheck, ArrowRight } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../api/axios';

const schema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const ChangePassword = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = React.useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post('/auth/change-password', { newPassword: data.newPassword });
      toast.success('Password updated successfully! Please login again.');
      // Logout and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gold/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-gold/10 rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[450px] z-10"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gold rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-gold">
            <ShieldCheck className="text-black" size={32} />
          </div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">Security Update</h1>
          <p className="text-gray-400 mt-2">Please set a new password for your account</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[32px] border border-white/10 shadow-2xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="text-sm font-medium text-gray-300 block mb-2">New Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-gold" size={20} />
                <input 
                  {...register('newPassword')}
                  type="password" 
                  placeholder="Enter new password"
                  className="w-full bg-white/5 border border-white/10 focus:border-gold rounded-2xl py-4 pl-12 pr-4 text-white outline-none transition-all"
                />
              </div>
              {errors.newPassword && <p className="text-red-400 text-xs mt-2 ml-1">{errors.newPassword.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 block mb-2">Confirm Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-gold" size={20} />
                <input 
                  {...register('confirmPassword')}
                  type="password" 
                  placeholder="Confirm new password"
                  className="w-full bg-white/5 border border-white/10 focus:border-gold rounded-2xl py-4 pl-12 pr-4 text-white outline-none transition-all"
                />
              </div>
              {errors.confirmPassword && <p className="text-red-400 text-xs mt-2 ml-1">{errors.confirmPassword.message}</p>}
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full btn-gold py-4 rounded-2xl flex items-center justify-center gap-2 text-lg disabled:opacity-50 font-bold"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <span>Update Password</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ChangePassword;
