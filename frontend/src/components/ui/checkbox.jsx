import React from 'react';

export const Checkbox = ({ className = '', checked, onCheckedChange, id, ...props }) => {
  const handleChange = (e) => {
    if (typeof onCheckedChange === 'function') onCheckedChange(e.target.checked);
  };
  return (
    <input
      id={id}
      type="checkbox"
      className={`
        w-5 h-5 rounded-lg border-2 border-gray-300
        text-indigo-600 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
        transition-all duration-300 cursor-pointer
        hover:border-indigo-400 hover:scale-110
        checked:bg-gradient-to-br checked:from-indigo-600 checked:to-purple-600
        ${className}
      `}
      checked={checked}
      onChange={handleChange}
      {...props}
    />
  );
};

export default Checkbox;
