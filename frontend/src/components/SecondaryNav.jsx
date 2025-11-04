import { useContext, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AuthContext from '@/context/AuthContext';

export const SecondaryNav = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const navRef = useRef(null);
  const SCROLL_STORAGE_KEY = 'secondaryNavScrollPosition';

  // Restore scroll position when component mounts
  useEffect(() => {
    if (navRef.current) {
      const savedScroll = sessionStorage.getItem(SCROLL_STORAGE_KEY);
      if (savedScroll) {
        navRef.current.scrollLeft = parseInt(savedScroll, 10);
      }
    }
  }, []);

  // Save scroll position when it changes
  const handleScroll = () => {
    if (navRef.current) {
      sessionStorage.setItem(SCROLL_STORAGE_KEY, navRef.current.scrollLeft.toString());
    }
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const getLinkClass = (path) => {
    return `text-xs sm:text-sm font-medium py-2 whitespace-nowrap ${
      isActive(path)
        ? 'text-gray-900 border-b-2 border-purple-600'
        : 'text-gray-600 hover:text-gray-900'
    }`;
  };

  return (
    <div className="border-b border-gray-200 bg-gray-50 overflow-x-auto" ref={navRef} onScroll={handleScroll}>
      <div className="container mx-auto px-4">
        <nav className="flex items-center gap-4 sm:gap-6 lg:gap-8 h-16 min-w-max sm:min-w-0">
          <Link to="/browse-jobs" className={getLinkClass('/browse-jobs')}>
            Browse Jobs
          </Link>
          <Link 
            to={user?.userType === 'employer' ? '/employer-dashboard' : '/student-dashboard'} 
            className={getLinkClass(user?.userType === 'employer' ? '/employer-dashboard' : '/student-dashboard')}
          >
            Dashboard
          </Link>
          <Link to="/open-jobs" className={getLinkClass('/open-jobs')}>
            Open Jobs
          </Link>
          <Link to="/applicants" className={getLinkClass('/applicants')}>
            Applicants
          </Link>
          {user?.userType === 'student' && (
            <>
              <Link to="/my-jobs" className={getLinkClass('/my-jobs')}>
                My Jobs
              </Link>
              <Link to="/applications" className={getLinkClass('/applications')}>
                Applications
              </Link>
            </>
          )}
          <Link to="/messages" className={getLinkClass('/messages')}>
            Messages
          </Link>
          <Link 
            to={user?.userType === 'employer' ? '/profile' : '/student-profile'} 
            className={getLinkClass(user?.userType === 'employer' ? '/profile' : '/student-profile')}
          >
            Profile
          </Link>
        </nav>
      </div>
    </div>
  );
};
