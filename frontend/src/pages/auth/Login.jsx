import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { 
  Mail, Lock, Eye, EyeOff, 
  ShieldCheck, BarChart3, Settings, IndianRupee, 
  Shield
} from 'lucide-react';
import { toast } from 'react-toastify';

// Import New Premium Assets
import loginHeroBg from '../../assets/login_hero_bg.png';
import sdrsLogoSeal from '../../assets/sdrs_logo_seal.png';

const loginSchema = z.object({
  identifier: z.string().min(1, { message: "Email or Username is required" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  useEffect(() => {
    document.title = "Login | SDRS Gold Finance";
  }, []);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur'
  });

  const onSubmit = async (data) => {
    try {
      const identifier = data.identifier.trim();
      console.log("[Login] Submit Clicked. Identifier:", identifier);
      const loginData = { password: data.password };
      
      // Smart Identifier Detection
      if (identifier.includes('@')) {
        loginData.email = identifier;
      } else if (/^[A-Z]{2}-\d+$/.test(identifier) || /^[A-Z]\d+$/.test(identifier)) {
        // Matches GL-1001 or similar customer code patterns
        loginData.customerCode = identifier;
      } else {
        loginData.mobile = identifier;
      }

      const result = await dispatch(login(loginData));
      
      if (login.fulfilled.match(result)) {
        const user = result.payload.user;
        const role = (user.role || 'CUSTOMER').toUpperCase();
        
        console.log(`[Login] Success! User ID: ${user.id} | Role: ${role}`);
        toast.success(`Welcome back, ${user.firstName}!`);
        
        // Robust Redirection
        setTimeout(() => {
          if (role === 'SUPER_ADMIN') {
            navigate('/super-admin/dashboard');
          } else if (role === 'ADMIN') {
            navigate('/admin/dashboard');
          } else {
            // Default to Customer Dashboard
            navigate('/customer/dashboard');
          }
        }, 500);
      } else {
        const errorMessage = result.payload || 'Invalid credentials. Please try again.';
        console.error("[Login] Auth Failed:", errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("[Login] Unexpected Exception:", error);
      toast.error('An unexpected error occurred. Please check your connection.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-0 font-sans overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative w-full max-w-[1200px] min-h-[750px] flex flex-col lg:flex-row bg-black rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.9)] border border-white/5 overflow-hidden m-4 lg:m-0"
      >
        {/* Left Section - Hero Branding */}
        <div className="hidden lg:flex lg:w-[50%] relative flex-col justify-between p-16 overflow-hidden">
          {/* New Premium Background Image */}
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-[10s] ease-linear hover:scale-110" 
            style={{ backgroundImage: `url(${loginHeroBg})` }} 
          />
          {/* Overlay to ensure text readability */}
          <div className="absolute inset-0 z-0 bg-gradient-to-br from-black/80 via-black/40 to-transparent" />
          
          <div className="relative z-10 flex flex-col items-center text-center h-full">
            {/* New Gold Seal Logo */}
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="relative w-48 h-48 mb-8"
            >
              <img src={sdrsLogoSeal} alt="SDRS Gold Seal" className="w-full h-full object-contain drop-shadow-[0_0_35px_rgba(212,175,55,0.6)]" />
            </motion.div>

            <div className="space-y-2">
              <h1 className="text-4xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-b from-[#F5E6AD] to-[#D4AF37] tracking-[0.15em] uppercase">
                SDRS GOLD
              </h1>
              <div className="flex items-center justify-center gap-4">
                <div className="h-[1px] w-10 bg-gold/30" />
                <span className="text-xl font-display tracking-[0.4em] text-white font-medium uppercase">FINANCE</span>
                <div className="h-[1px] w-10 bg-gold/30" />
              </div>
              <p className="text-xs tracking-[0.5em] text-gold/60 uppercase mt-2 font-bold">JEWELLERY ERP</p>
            </div>
            
            <div className="mt-12 space-y-4">
              <h2 className="text-4xl font-display font-bold text-white leading-tight">
                Manage. Monitor. <span className="text-gold">Grow.</span>
              </h2>
              <p className="text-gray-300 text-sm leading-relaxed max-w-sm mx-auto opacity-90 font-medium">
                A complete ERP solution for jewellery business management and growth.
              </p>
            </div>

            {/* Premium Feature Icons Grid */}
            <div className="grid grid-cols-4 gap-4 w-full mt-auto pt-12">
              {[
                { icon: ShieldCheck, label: "Secure & Reliable" },
                { icon: BarChart3, label: "Real-time Analytics" },
                { icon: Settings, label: "Streamline Operations" },
                { icon: IndianRupee, label: "Maximize Profitability" }
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all cursor-default group">
                  <div className="p-3 rounded-xl bg-gold/10 group-hover:bg-gold/20 transition-colors">
                    <item.icon className="text-gold" size={24} />
                  </div>
                  <span className="text-[8px] uppercase tracking-wider text-gray-300 font-black leading-tight text-center">{item.label}</span>
                </div>
              ))}
            </div>

            <div className="mt-12 flex items-center justify-center gap-3 text-gray-400 text-[11px] font-bold opacity-70">
               <Shield size={14} className="text-gold" />
               <span className="uppercase tracking-[0.25em]">Trusted by 1000+ Jewellery Businesses</span>
            </div>
          </div>
        </div>

        {/* Right Section - Login Form Card */}
        <div className="w-full lg:w-[50%] bg-white flex flex-col p-10 lg:p-24 justify-center items-center relative overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="max-w-md w-full relative z-10">
            <div className="text-center mb-14">
              <h3 className="text-5xl font-display font-bold text-gray-900 mb-3 tracking-tight">Welcome Back!</h3>
              <p className="text-gray-500 font-medium">Sign in to continue to your account</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
              <div className="space-y-1">
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gold transition-colors">
                    <Mail size={22} />
                  </div>
                  <input 
                    {...register('identifier')}
                    type="text" 
                    placeholder="Email or Username" 
                    className="w-full h-16 bg-gray-50 border-2 border-gray-100 focus:border-gold/30 focus:bg-white focus:ring-4 focus:ring-gold/5 rounded-2xl pl-14 pr-4 text-gray-900 font-medium outline-none transition-all placeholder:text-gray-400 text-lg shadow-sm"
                  />
                </div>
                {errors.identifier && <p className="text-red-500 text-xs mt-1 ml-2 font-bold">{errors.identifier.message}</p>}
              </div>

              <div className="space-y-1">
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gold transition-colors">
                    <Lock size={22} />
                  </div>
                  <input 
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'} 
                    placeholder="Password" 
                    className="w-full h-16 bg-gray-50 border-2 border-gray-100 focus:border-gold/30 focus:bg-white focus:ring-4 focus:ring-gold/5 rounded-2xl pl-14 pr-14 text-gray-900 font-medium outline-none transition-all placeholder:text-gray-400 text-lg shadow-sm"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gold transition-colors"
                  >
                    {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1 ml-2 font-bold">{errors.password.message}</p>}
              </div>

              <div className="flex justify-end pt-1">
                <button type="button" className="text-sm font-bold text-gold-dark hover:text-gold transition-colors underline-offset-4 hover:underline">
                  Forgot Password?
                </button>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="group w-full h-16 bg-gradient-to-r from-[#8B4513] to-[#D2691E] hover:from-[#723A0F] hover:to-[#B35919] text-white rounded-2xl flex items-center justify-center gap-4 text-xl font-bold shadow-2xl shadow-brown/30 transition-all active:scale-[0.98] disabled:opacity-70 mt-4 overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                {loading ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Lock size={22} />}
                <span className="relative z-10">Login</span>
              </button>
            </form>

            <div className="mt-20 flex flex-col items-center">
              <div className="w-full h-[1px] bg-gray-100 mb-10" />
              <div className="flex items-center gap-3 py-3 px-6 rounded-full bg-gold/5 border border-gold/10">
                <ShieldCheck size={20} className="text-gold" />
                <span className="text-sm text-gray-600 font-medium tracking-tight">Your data is <span className="text-gold-dark font-black">100% secure</span> with us</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
