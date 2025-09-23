import React from 'react';

export const Textarea = ({ className = '', ...props }) => (
  <textarea className={`border rounded px-2 py-1 ${className}`} {...props} />
);

export default Textarea;
