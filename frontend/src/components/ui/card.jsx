import React from 'react';

export const Card = ({ children, className = '', hover = false }) => (
  <div className={`
    bg-white rounded-xl shadow-sm border border-slate-200
    ${hover ? 'transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-slate-300' : ''}
    ${className}
  `}>
    {children}
  </div>
);

export const CardHeader = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-b border-slate-100 ${className}`}>
    {children}
  </div>
);

export const CardContent = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-xl font-semibold text-slate-900 tracking-tight ${className}`}>
    {children}
  </h3>
);

export const CardDescription = ({ children, className = '' }) => (
  <p className={`text-sm text-slate-600 mt-1.5 leading-relaxed ${className}`}>
    {children}
  </p>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`px-6 py-4 bg-slate-50 border-t border-slate-100 rounded-b-xl ${className}`}>
    {children}
  </div>
);

export default Card;
