import React from 'react';

export const Badge = ({ children, variant, className = '' }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${className}`}>{children}</span>
);

export default Badge;
