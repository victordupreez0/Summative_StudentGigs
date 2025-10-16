import React from 'react';

export const Input = ({ className = '', type = 'text', ...props }) => (
  <input 
    type={type}
    className={`
      w-full px-4 py-2.5 
      bg-white border border-slate-300 rounded-lg
      text-slate-900 text-sm
      placeholder:text-slate-400
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
      transition-all duration-200
      disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed
      hover:border-slate-400
      ${className}
    `} 
    {...props} 
  />
);

export default Input;
