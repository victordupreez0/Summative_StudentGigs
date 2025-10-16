import React from 'react';

export const Button = ({ children, asChild, variant = 'default', size = 'default', className = '', ...rest }) => {
  // Base styles - professional and refined
  const base = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  // Variant styles - professional business colors
  const variants = {
    default: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md focus:ring-blue-500',
    primary: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg focus:ring-blue-500',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200 shadow-sm hover:shadow focus:ring-slate-500',
    outline: 'bg-transparent hover:bg-slate-50 text-slate-700 border-2 border-slate-300 hover:border-slate-400 focus:ring-slate-500',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-700 focus:ring-slate-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow-md focus:ring-red-500',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow-md focus:ring-emerald-500',
  };
  
  // Size styles - comfortable and professional
  const sizes = {
    sm: 'text-xs px-3 py-1.5 rounded-md',
    default: 'text-sm px-4 py-2.5 rounded-lg',
    lg: 'text-base px-6 py-3 rounded-lg',
    xl: 'text-lg px-8 py-4 rounded-xl',
  };
  
  const variantClass = variants[variant] || variants.default;
  const sizeClass = sizes[size] || sizes.default;
  
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, { 
      className: `${base} ${variantClass} ${sizeClass} ${className}`, 
      ...rest 
    });
  }
  
  return (
    <button className={`${base} ${variantClass} ${sizeClass} ${className}`} {...rest}>
      {children}
    </button>
  );
};

export default Button;
