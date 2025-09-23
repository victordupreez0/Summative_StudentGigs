import React from 'react';

export const Progress = ({ value = 0, max = 100, className = '' }) => (
  <div className={`w-full bg-gray-200 rounded ${className}`}>
    <div className="bg-primary h-2 rounded" style={{ width: `${(value / max) * 100}%` }} />
  </div>
);

export default Progress;
