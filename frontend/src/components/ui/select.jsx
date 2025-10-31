import React from 'react';

export const Select = ({ children, className = '', value, onValueChange, ...props }) => (
  <select
    className={`
      w-full px-5 py-3
      bg-white border-2 border-gray-200 rounded-xl
      text-gray-900 text-sm font-medium
      focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
      transition-all duration-300
      disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
      hover:border-gray-300 hover:shadow-md
      cursor-pointer shadow-sm
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
