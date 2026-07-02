export const formatCurrencyInput = (val) => {
  if (val === undefined || val === null || val === '') return '';
  
  // Convert to string and remove everything except digits and dots (prevent negative and alphabetic)
  let cleanVal = String(val).replace(/[^0-9.]/g, '');
  
  // Ensure only one dot exists
  const parts = cleanVal.split('.');
  if (parts.length > 2) {
    cleanVal = parts[0] + '.' + parts.slice(1).join('');
  }

  if (!cleanVal) return '';

  const [intPart, decPart] = cleanVal.split('.');
  
  let formattedInt = '';
  if (intPart) {
    // Parse to int to remove leading zeros, then format to Indian locale
    formattedInt = parseInt(intPart, 10).toLocaleString('en-IN');
  } else if (cleanVal.startsWith('.')) {
    formattedInt = '0';
  }

  if (decPart !== undefined) {
    // Limit decimals to 2 places maximum
    return `${formattedInt}.${decPart.slice(0, 2)}`;
  }
  
  return formattedInt;
};

export const parseCurrency = (val) => {
  if (val === undefined || val === null || val === '') return '';
  // Remove formatting commas
  const cleaned = String(val).replace(/,/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? '' : parsed;
};
