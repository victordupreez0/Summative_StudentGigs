import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * UserAvatar component - Displays user profile picture or colored avatar with initials
 * @param {Object} user - User object with profilePicture, avatarColor, and name
 * @param {string|number} userId - Optional user ID to make avatar clickable and navigate to profile
 * @param {string} className - Additional CSS classes for the avatar container
 * @param {string} size - Size preset: 'sm', 'md', 'lg', 'xl' (default: 'md')
 * @param {function} onClick - Optional click handler (overrides default navigation)
 * @param {boolean} clickable - If true, shows pointer cursor even without userId or onClick
 */
export const UserAvatar = ({ user, userId, className = '', size = 'md', onClick, clickable = false }) => {
  const navigate = useNavigate();
  
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-20 h-20 text-2xl'
  };

  const sizeClass = sizeClasses[size] || sizeClasses.md;
  const initials = user?.name?.charAt(0)?.toUpperCase() || 'U';
  
  // Only show background color if no profile picture
  const hasProfilePicture = user?.profilePicture && user.profilePicture.trim() !== '';
  const bgColor = hasProfilePicture ? 'transparent' : (user?.avatarColor || '#1e40af');

  // Determine if avatar should be clickable
  const isClickable = onClick || userId || clickable;
  const cursorClass = isClickable ? 'cursor-pointer hover:opacity-80 transition-opacity' : '';

  // Handle click - use custom onClick or navigate to profile
  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    } else if (userId) {
      e.stopPropagation();
      navigate(`/student-profile/${userId}`);
    }
  };

  return (
    <div 
      className={`rounded-full flex items-center justify-center overflow-hidden ${sizeClass} ${cursorClass} ${className}`}
      style={{ backgroundColor: bgColor }}
      onClick={isClickable ? handleClick : undefined}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
    >
      {hasProfilePicture ? (
        <img 
          src={user.profilePicture} 
          alt={user.name || 'User'} 
          className="w-full h-full object-cover" 
        />
      ) : (
        <span className="text-white font-bold">{initials}</span>
      )}
    </div>
  );
};

export default UserAvatar;
