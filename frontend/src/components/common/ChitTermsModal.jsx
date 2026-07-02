import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';

const ChitTermsModal = ({ isOpen, onClose, onAccept }) => {
  const [language, setLanguage] = useState('en');

  const terms = {
    en: [
      "Small savings scheme duration is 20 months and there is no draw system.",
      "Money must be paid by the 10th of every month.",
      "Even if the small savings amount is not paid correctly or stopped due to inability to pay, money will not be given in between. At the end of the 20th month, you can get jewelry for the amount you paid.",
      "Under no circumstances will the installment amount be refunded in cash.",
      "At the end of the 20th month, along with a one-month bonus amount, gold jewelry (or) silver articles can be received at the prevailing market price of that day.",
      "Jewelry will be made to order only within a specified number of days."
    ],
    ta: [
      "சிறு சேமிப்பு திட்டம் காலம் 20 மாதம் மற்றும் குலுக்கல் முறை கிடையாது.",
      "பிரதி மாதம் 10ம் தேதிக்குள் பணம் கட்ட வேண்டும்.",
      "சிறுசேமிப்பு தொகை சரியாக கட்டாவிட்டாலும் கட்டஇயலாமல் நிறுத்தினாலும் இடையில் பணம் தரமாட்டாது 20 வது மாதம் முடிவில் நீங்கள் கட்டிய பணத்திற்கு நகையாக பெற்றுக்கொள்ளலாம்.",
      "எக்காரணம் கொண்டும் தவணை தொகை ரொக்கமாக திருப்பிதரப்படமாட்டாது.",
      "20வது மாதம் முடிவில் ஒரு மாதம் ஊக்கத் தொகையுடன் அன்றைய மார்க்கெட் விலைக்கே தங்க நகைகள் (அல்லது) வெள்ளி பொருட்களாக பெற்றுக் கொள்ளலாம்.",
      "நகைகள் ஆர்டரின் முறையில் மட்டுமே குறிப்பிட்ட நாட்களுக்குள் செய்துதரப்படும்."
    ]
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose} 
            className="absolute inset-0 bg-black/80 backdrop-blur-md" 
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }} 
            animate={{ scale: 1, opacity: 1, y: 0 }} 
            exit={{ scale: 0.9, opacity: 0, y: 20 }} 
            className="relative w-full max-w-2xl bg-[#0f172a] border border-[#1e293b] rounded-[2.5rem] overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-6 md:p-8 bg-gradient-to-r from-yellow-400 to-yellow-500 flex justify-between items-center text-black flex-shrink-0">
              <div>
                <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight">Terms and Conditions</h3>
                <p className="text-black/60 text-[10px] md:text-xs font-bold uppercase tracking-widest mt-1">நிபந்தனைகள்</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex bg-black/10 rounded-lg p-1">
                  <button 
                    onClick={() => setLanguage('en')}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${language === 'en' ? 'bg-white text-black shadow-sm' : 'text-black/60 hover:text-black'}`}
                  >
                    English
                  </button>
                  <button 
                    onClick={() => setLanguage('ta')}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${language === 'ta' ? 'bg-white text-black shadow-sm' : 'text-black/60 hover:text-black'}`}
                  >
                    தமிழ்
                  </button>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-black/10 rounded-full transition-all">
                  <X size={24} />
                </button>
              </div>
            </div>
            
            <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-grow">
              <ul className="space-y-4">
                {terms[language].map((term, index) => (
                  <li key={index} className="flex gap-4 items-start bg-[#1e293b]/50 p-4 rounded-2xl border border-[#334155]/50">
                    <div className="w-6 h-6 rounded-full bg-yellow-400/10 text-yellow-400 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-black">
                      {index + 1}
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">{term}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 md:p-8 border-t border-[#1e293b] bg-[#0f172a] flex gap-4 flex-shrink-0">
              <button 
                onClick={onClose}
                className="flex-1 py-4 bg-[#1e293b]/50 border border-[#334155] text-white rounded-xl font-bold hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  onAccept();
                  onClose();
                }}
                className="flex-1 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black rounded-xl font-black flex items-center justify-center gap-2 shadow-xl shadow-yellow-400/20 hover:scale-[1.02] transition-all uppercase tracking-widest text-sm"
              >
                <Check size={18} strokeWidth={3} /> I Agree
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ChitTermsModal;
