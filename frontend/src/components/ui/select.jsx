import React from 'react';

export const Select = ({ children, className = '', value, onValueChange, ...props }) => (
  <select
    className={`border rounded px-2 py-1 ${className}`}
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
