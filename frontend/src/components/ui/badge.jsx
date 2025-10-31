import React from 'react';

export const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border border-gray-300 shadow-sm',
    primary: 'bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border border-indigo-300 shadow-sm',
    success: 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 border border-emerald-300 shadow-sm',
    warning: 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 border border-amber-300 shadow-sm',
    danger: 'bg-gradient-to-r from-red-100 to-pink-100 text-red-700 border border-red-300 shadow-sm',
    secondary: 'bg-gradient-to-r from-purple-100 to-fuchsia-100 text-purple-700 border border-purple-300 shadow-sm',
  };
  
  const variantClass = variants[variant] || variants.default;
  
  return (
    <span className={`
      inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-semibold
      transition-all duration-300 hover:scale-[1.02]
      ${variantClass}
      ${className}
    `}>
      {children}
    </span>
  );
};

export default Badge;
