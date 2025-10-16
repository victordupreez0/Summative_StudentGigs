import React from 'react';

/**
 * UserAvatar component - Displays user profile picture or colored avatar with initials
 * @param {Object} user - User object with profilePicture, avatarColor, and name
 * @param {string} className - Additional CSS classes for the avatar container
 * @param {string} size - Size preset: 'sm', 'md', 'lg', 'xl' (default: 'md')
 * @param {function} onClick - Optional click handler
 */
export const UserAvatar = ({ user, className = '', size = 'md', onClick }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-20 h-20 text-2xl'
  };

  const sizeClass = sizeClasses[size] || sizeClasses.md;
  const bgColor = user?.profilePicture ? 'transparent' : (user?.avatarColor || '#1e40af');
  const initials = user?.name?.charAt(0)?.toUpperCase() || 'U';

  return (
    <div 
      className={`rounded-full flex items-center justify-center text-white font-bold ${sizeClass} ${className}`}
      style={{ backgroundColor: bgColor }}
      onClick={onClick}
    >
      {user?.profilePicture ? (
        <img 
          src={user.profilePicture} 
          alt={user.name || 'User'} 
          className="w-full h-full rounded-full object-cover" 
        />
      ) : (
        initials
      )}
    </div>
  );
};

export default UserAvatar;
