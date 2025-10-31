import React from 'react';

export const Button = ({ children, asChild, variant = 'default', size = 'default', className = '', ...rest }) => {
  // Base styles - modern and sleek
  const base = 'inline-flex items-center justify-center font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.01] active:scale-[0.99]';
  
  // Variant styles - vibrant modern colors with gradients
  const variants = {
    default: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl focus:ring-indigo-500',
    primary: 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-700 hover:via-purple-700 hover:to-indigo-800 text-white shadow-xl hover:shadow-2xl focus:ring-purple-500',
    secondary: 'bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl focus:ring-sky-500',
    outline: 'bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-300 hover:border-indigo-500 hover:text-indigo-600 shadow-md hover:shadow-lg focus:ring-indigo-500',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 hover:text-gray-900 focus:ring-gray-500',
    danger: 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl focus:ring-red-500',
    success: 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl focus:ring-emerald-500',
  };
  
  // Size styles - modern and comfortable
  const sizes = {
    sm: 'text-xs px-4 py-2 rounded-xl font-semibold',
    default: 'text-sm px-6 py-3 rounded-xl',
    lg: 'text-base px-8 py-3.5 rounded-xl',
    xl: 'text-lg px-10 py-4 rounded-2xl',
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
