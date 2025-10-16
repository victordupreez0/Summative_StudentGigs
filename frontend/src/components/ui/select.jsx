import React from 'react';

export const Select = ({ children, className = '', value, onValueChange, ...props }) => (
  <select
    className={`
      w-full px-4 py-2.5
      bg-white border border-slate-300 rounded-lg
      text-slate-900 text-sm
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
      transition-all duration-200
      disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed
      hover:border-slate-400
      cursor-pointer
      ${className}
    `}
    value={value}
    onChange={(e) => onValueChange && onValueChange(e.target.value)}
    {...props}
  >
    {children}
  </select>
);

export const SelectContent = ({ children }) => <div>{children}</div>;
export const SelectItem = ({ children, value }) => <option value={value}>{children}</option>;
export const SelectTrigger = ({ children }) => <div>{children}</div>;
export const SelectValue = ({ placeholder }) => <option value="">{placeholder}</option>;

export default Select;
