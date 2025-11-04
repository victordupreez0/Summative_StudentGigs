import React from 'react';

export const Textarea = ({ className = '', ...props }) => (
  <textarea 
    className={`
      w-full px-5 py-3
      bg-white border-2 border-gray-200 rounded-xl
      text-gray-900 text-base font-medium
      placeholder:text-gray-400
      focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
      transition-all duration-300
      disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
      hover:border-gray-300 hover:shadow-md
      resize-vertical
      min-h-[120px]
      shadow-sm
      ${className}
    `} 
    {...props} 
  />
);

export default Textarea;
