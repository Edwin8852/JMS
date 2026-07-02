import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';

const ErrorPage = ({ title, message, code = "404", type = "error" }) => {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden text-center">
      {/* Background Glow */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] ${type === 'unauthorized' ? 'bg-red-500/10' : 'bg-gold/10'} rounded-full blur-[120px]`} />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md z-10"
      >
        <div className={`w-24 h-24 ${type === 'unauthorized' ? 'bg-red-500/10 text-red-500' : 'bg-gold/10 text-gold'} rounded-3xl flex items-center justify-center mx-auto mb-8`}>
          <ShieldAlert size={48} />
        </div>
        
        <h1 className="text-8xl font-display font-black text-white/10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 select-none">
          {code}
        </h1>

        <h2 className="text-4xl font-display font-bold text-white mb-4">{title}</h2>
        <p className="text-gray-400 mb-10 leading-relaxed">
          {message}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/login" className="btn-gold w-full sm:w-auto flex items-center justify-center gap-2">
            <ArrowLeft size={18} />
            Back to Login
          </Link>
          <Link to="/" className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white/5 text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2">
            <Home size={18} />
            Dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ErrorPage;
