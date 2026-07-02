import React, { useState, useEffect } from 'react';
import { formatCurrencyInput, parseCurrency } from '../../utils/currencyFormat';

const CurrencyInput = React.forwardRef(({ value, onChange, onBlur, ...props }, ref) => {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    // Sync external value to local formatted display state
    if (value !== undefined && value !== null && value !== '') {
      const parsedCurrent = parseCurrency(displayValue);
      // Prevent overwriting if the logical value is the same (keeps decimal points while typing)
      if (parseFloat(value) !== parsedCurrent && String(value) !== displayValue) {
        setDisplayValue(formatCurrencyInput(value));
      }
    } else {
      setDisplayValue('');
    }
  }, [value]);

  const handleChange = (e) => {
    const rawVal = e.target.value;
    
    // Prevent negative signs or alphabetical characters entirely
    if (!/^[0-9.,]*$/.test(rawVal)) {
      return;
    }

    const formatted = formatCurrencyInput(rawVal);
    setDisplayValue(formatted);

    if (onChange) {
      const parsed = parseCurrency(formatted);
      // Emit synthetic event backward with raw number
      onChange({
        ...e,
        target: {
          ...e.target,
          name: props.name,
          value: parsed === '' ? '' : parsed
        }
      });
    }
  };

  const handleBlur = (e) => {
    // Clean up trailing decimals on blur (e.g., "1,000." -> "1,000")
    const parsed = parseCurrency(displayValue);
    if (parsed !== '') {
      setDisplayValue(formatCurrencyInput(parsed));
    } else {
      setDisplayValue('');
    }

    if (onBlur) {
      onBlur(e);
    }
  };

  return (
    <div className="w-full">
      {props.label && <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">{props.label}</label>}
      <div className="relative group">
        {props.icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gold transition-colors">
            <props.icon size={20} />
          </div>
        )}
        <input
          ref={ref}
          type="text"
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          {...props}
          className={props.className || `w-full bg-white dark:bg-dark-surface border ${
            props.error ? 'border-red-500' : 'border-gray-200 dark:border-dark-border focus:border-gold'
          } rounded-2xl py-3.5 ${props.icon ? 'pl-12' : 'px-4'} pr-4 outline-none transition-all shadow-sm focus:shadow-gold/10`}
          // Force text input to support commas and remove native number validation warnings
          min={undefined}
          max={undefined}
          step={undefined}
          label={undefined}
          error={undefined}
          icon={undefined}
        />
      </div>
      {props.error && <p className="text-red-500 text-xs mt-1.5 ml-1">{props.error}</p>}
    </div>
  );
});

CurrencyInput.displayName = 'CurrencyInput';
export default CurrencyInput;
