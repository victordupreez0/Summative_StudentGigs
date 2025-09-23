import React from 'react';

export const Checkbox = ({ className = '', checked, onCheckedChange, id, ...props }) => {
  const handleChange = (e) => {
    if (typeof onCheckedChange === 'function') onCheckedChange(e.target.checked);
  };
  return (
    <input
      id={id}
      type="checkbox"
      className={`form-checkbox ${className}`}
      checked={checked}
      onChange={handleChange}
      {...props}
    />
  );
};

export default Checkbox;
