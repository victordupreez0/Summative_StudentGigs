import React from 'react';

export const Avatar = ({ children, className = '', style = {} }) => (
  <div className={`inline-flex items-center justify-center rounded-full overflow-hidden ${className}`} style={style}>{children}</div>
);

export const AvatarImage = ({ src, alt }) => {
  if (!src || src.includes('/avatars/')) return null; // Don't render broken/placeholder images
  return <img src={src} alt={alt} className="block w-full h-full object-cover" />;
};

export const AvatarFallback = ({ children, className = '', style = {} }) => (
  <div className={`flex items-center justify-center w-full h-full ${className}`} style={style}>
    {children}
  </div>
);

export default Avatar;
