import React from 'react';

export const Avatar = ({ children, className = '', style = {} }) => (
  <div className={`relative inline-flex items-center justify-center rounded-full overflow-hidden bg-transparent ${className}`} style={style}>{children}</div>
);

export const AvatarImage = ({ src, alt }) => {
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState(false);
  
  if (!src || src.includes('/avatars/') || error) return null;
  
  return (
    <img 
      src={src} 
      alt={alt} 
      className="block w-full h-full object-cover absolute inset-0 z-10" 
      onLoad={() => setLoaded(true)}
      onError={() => setError(true)}
      style={{ display: loaded ? 'block' : 'none' }}
    />
  );
};

export const AvatarFallback = ({ children, className = '', style = {} }) => (
  <div className={`flex items-center justify-center w-full h-full absolute inset-0 ${className}`} style={style}>
    {children}
  </div>
);

export default Avatar;
