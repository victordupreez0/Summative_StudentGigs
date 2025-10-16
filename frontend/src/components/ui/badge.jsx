import React from 'react';

export const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-slate-100 text-slate-700 border border-slate-200',
    primary: 'bg-blue-100 text-blue-700 border border-blue-200',
    success: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-100 text-amber-700 border border-amber-200',
    danger: 'bg-red-100 text-red-700 border border-red-200',
    secondary: 'bg-purple-100 text-purple-700 border border-purple-200',
  };
  
  const variantClass = variants[variant] || variants.default;
  
  return (
    <span className={`
      inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
      ${variantClass}
      ${className}
    `}>
      {children}
    </span>
  );
};

export default Badge;
