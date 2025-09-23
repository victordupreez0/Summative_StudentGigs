import React from 'react';

export const Input = ({ className = '', ...props }) => (
  <input className={`border rounded px-2 py-1 ${className}`} {...props} />
);

export default Input;
