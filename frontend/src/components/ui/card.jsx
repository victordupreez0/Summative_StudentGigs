import React from 'react';

export const Card = ({ children, className = '', hover = false }) => (
  <div className={`
    bg-white rounded-2xl shadow-lg border border-gray-100
    backdrop-blur-sm backdrop-filter
    ${hover ? 'transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:border-indigo-200' : ''}
    ${className}
  `}>
    {children}
  </div>
);

export const CardHeader = ({ children, className = '' }) => (
  <div className={`px-8 py-5 border-b border-gray-100 ${className}`}>
    {children}
  </div>
);

export const CardContent = ({ children, className = '' }) => (
  <div className={`p-8 ${className}`}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-2xl font-bold text-gray-900 tracking-tight ${className}`}>
    {children}
  </h3>
);

export const CardDescription = ({ children, className = '' }) => (
  <p className={`text-sm text-gray-600 mt-2 leading-relaxed ${className}`}>
    {children}
  </p>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`px-8 py-5 bg-gradient-to-r from-gray-50 to-indigo-50/30 border-t border-gray-100 rounded-b-2xl ${className}`}>
    {children}
  </div>
);

export default Card;
