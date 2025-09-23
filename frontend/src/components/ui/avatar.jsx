import React from 'react';

export const Avatar = ({ children, className = '' }) => (
  <div className={`inline-flex items-center justify-center rounded-full overflow-hidden ${className}`}>{children}</div>
);

export const AvatarImage = ({ src, alt }) => <img src={src} alt={alt} className="block w-full h-full object-cover" />;
export const AvatarFallback = ({ children }) => <div className="flex items-center justify-center w-full h-full">{children}</div>;

export default Avatar;
