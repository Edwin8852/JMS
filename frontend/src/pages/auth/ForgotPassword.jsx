import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Mail, ChevronLeft, Lock, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';

const forgotSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

const ForgotPassword = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Forgot Password | SDRS Gold Finance";
  }, []);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(forgotSchema)
  });

  const onSubmit = async (data) => {
    toast.success("Password reset link sent to your email!");
    setTimeout(() => navigate('/login'), 2000);
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Lighting */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-gold/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-gold/5 rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-md z-10"
      >
        <div className="bg-white/5 backdrop-blur-2xl p-8 lg:p-12 rounded-[40px] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-gold/30 to-gold/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-gold/20 shadow-gold">
              <Lock className="text-gold" size={32} />
            </div>
            <h1 className="text-3xl font-display font-bold text-white mb-2">Forgot Password</h1>
            <p className="text-gray-400">Enter your registered email and we'll send you a reset link.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-gold transition-colors" size={20} />
                <input 
                  {...register('email')}
                  type="email" 
                  placeholder="Enter your email"
                  className="w-full bg-white/5 border border-white/10 focus:border-gold rounded-2xl py-4 pl-12 pr-4 text-white outline-none transition-all"
                />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-2 ml-1 font-medium">{errors.email.message}</p>}
            </div>

            <button 
              type="submit" 
              className="w-full bg-gold-gradient text-white py-4 rounded-2xl font-bold text-lg shadow-gold-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Send Reset Link
            </button>
          </form>

          <button 
            onClick={() => navigate('/login')}
            className="w-full mt-6 flex items-center justify-center gap-2 text-gray-400 hover:text-gold transition-colors font-medium"
          >
            <ChevronLeft size={20} />
            Back to Login
          </button>
        </div>

        {/* Security Footer */}
        <div className="mt-8 flex items-center justify-center gap-2 text-gray-500 text-xs tracking-widest uppercase">
          <ShieldCheck size={14} className="text-gold" />
          Enterprise Secure Access
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
