import React from 'react';

const Input = React.forwardRef(({ label, error, icon: Icon, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">{label}</label>}
      <div className="relative group">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gold transition-colors">
            <Icon size={20} />
          </div>
        )}
        <input
          ref={ref}
          className={`w-full bg-white dark:bg-dark-surface border ${
            error ? 'border-red-500' : 'border-gray-200 dark:border-dark-border focus:border-gold'
          } rounded-2xl py-3.5 ${Icon ? 'pl-12' : 'px-4'} pr-4 outline-none transition-all shadow-sm focus:shadow-gold/10`}
          {...props}
        />
      </div>
      {error && <p className="text-red-500 text-xs mt-1.5 ml-1">{error}</p>}
    </div>
  );
});

export default Input;
