import React from 'react';

export const Button = ({ children, asChild, variant, size, className = '', ...rest }) => {
  const base = 'inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium';
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, { className: `${base} ${className}`, ...rest });
  }
  return (
    <button className={`${base} ${className}`} {...rest}>
      {children}
    </button>
  );
};

export default Button;
