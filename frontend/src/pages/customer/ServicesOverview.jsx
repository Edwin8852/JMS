import React from 'react';
import { motion } from 'framer-motion';
import { Gem, Coins, CreditCard, ArrowRight, ShieldCheck, Zap, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const ServicesOverview = () => {
  const services = [
    {
      id: 'loan',
      title: 'Gold Loan',
      description: 'Get instant cash against your gold ornaments with minimal documentation and competitive interest rates.',
      icon: Gem,
      color: 'gold',
      features: ['Instant Approval', 'High LTV Ratio', 'Secure Storage'],
      link: '/customer/services/loan'
    },
    {
      id: 'chit',
      title: 'Chit Fund',
      description: 'Join our trusted chit schemes to save monthly and get a chance to win the bid amount early for your needs.',
      icon: Coins,
      color: 'blue',
      features: ['Guaranteed Returns', 'Low Commission', 'Multiple Schemes'],
      link: '/customer/services/chit-schemes'
    },
    {
      id: 'order',
      title: 'Jewelry Order',
      description: 'Custom design and order premium jewelry items. Track your order from design to delivery.',
      icon: CreditCard,
      color: 'purple',
      features: ['Custom Designs', 'BIS Hallmarked', 'Doorstep Delivery'],
      link: '/customer/services/order'
    }
  ];

  return (
    <div className="space-y-12 pb-20">
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h1 className="text-4xl font-display font-bold">Our Services</h1>
        <p className="text-gray-500 text-lg">Choose the service that best fits your financial goals. All our services are secured and transparent.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {services.map((service, index) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 dark:from-dark-surface dark:to-dark-card rounded-[3rem] -z-10 shadow-xl group-hover:shadow-2xl transition-all border border-gray-100 dark:border-dark-border" />
            
            <div className="p-10 flex flex-col h-full">
              <div className={`w-16 h-16 bg-${service.color === 'gold' ? 'gold' : service.color + '-500'}/10 rounded-3xl flex items-center justify-center text-${service.color === 'gold' ? 'gold' : service.color + '-500'} mb-8 group-hover:scale-110 transition-transform`}>
                <service.icon size={32} />
              </div>

              <h3 className="text-2xl font-bold mb-4">{service.title}</h3>
              <p className="text-gray-500 mb-8 flex-grow">{service.description}</p>

              <div className="space-y-3 mb-10">
                {service.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm font-bold text-gray-700">
                    <ShieldCheck size={16} className={`text-${service.color === 'gold' ? 'gold' : service.color + '-500'}`} />
                    {feature}
                  </div>
                ))}
              </div>

              <Link 
                to={service.link}
                className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
                  service.color === 'gold' 
                  ? 'bg-gold-gradient text-white shadow-gold/20 hover:shadow-gold/40' 
                  : `bg-${service.color}-500 text-white shadow-${service.color}-500/20 hover:shadow-${service.color}-500/40`
                }`}
              >
                Select {service.title} <ArrowRight size={18} />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Trust Banner */}
      <div className="bg-black text-white p-12 rounded-[3rem] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 blur-[100px] rounded-full" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex gap-6 items-center">
            <div className="w-16 h-16 bg-gold/20 rounded-2xl flex items-center justify-center text-gold">
                <Zap size={32} />
            </div>
            <div>
                <h4 className="text-2xl font-bold">Fast & Secure Processing</h4>
                <p className="text-gray-400 mt-1">Our AI-driven system ensures your requests are processed within minutes.</p>
            </div>
          </div>
          <div className="flex -space-x-4">
              {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-12 h-12 rounded-full border-2 border-black bg-gray-800 flex items-center justify-center overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="user" />
                  </div>
              ))}
              <div className="w-12 h-12 rounded-full border-2 border-black bg-gold flex items-center justify-center text-black font-bold text-xs">
                  +1k
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesOverview;
