import { Search, Bell, Mail } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserAvatar } from "@/components/UserAvatar";
import { useContext } from 'react'
import AuthContext from '@/context/AuthContext'

export const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate()
  const { user, logout } = useContext(AuthContext)
  const isActive = (path) => {
    try {
      return location?.pathname === path || location?.pathname?.startsWith(path + '/');
    } catch (e) {
      return false;
    }
  };
  
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo - Professional Design */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-200">
            <span className="text-white font-bold text-lg">SG</span>
          </div>
          <span className="text-2xl font-bold text-slate-900 tracking-tight">StudentGigs</span>
        </Link>
        
        {/* Navigation - Modern Typography with Better Spacing */}
        <nav className="hidden md:flex items-center gap-8">
          <Link 
            to="/browse-jobs" 
            className={`text-sm font-semibold transition-all duration-300 ${
              isActive('/browse-jobs') 
                ? 'text-indigo-600 border-b-2 border-indigo-600 pb-1' 
                : 'text-gray-600 hover:text-indigo-600'
            }`}
          >
            Find Work
          </Link>
          <Link 
            to="/post-job" 
            className={`text-sm font-semibold transition-all duration-300 ${
              isActive('/post-job') 
                ? 'text-indigo-600 border-b-2 border-indigo-600 pb-1' 
                : 'text-gray-600 hover:text-indigo-600'
            }`}
          >
            Post a Job
          </Link>
          {user && user.userType === 'student' && (
            <Link 
              to="/applications" 
              className={`text-sm font-semibold transition-all duration-300 ${
                isActive('/applications') 
                  ? 'text-indigo-600 border-b-2 border-indigo-600 pb-1' 
                  : 'text-gray-600 hover:text-indigo-600'
              }`}
            >
              My Applications
            </Link>
          )}
          <Link 
            to="/browse-talent" 
            className={`text-sm font-semibold transition-all duration-300 ${
              isActive('/browse-talent') 
                ? 'text-indigo-600 border-b-2 border-indigo-600 pb-1' 
                : 'text-gray-600 hover:text-indigo-600'
            }`}
          >
            Browse Talent
          </Link>
          <Link 
            to="/resources" 
            className={`text-sm font-semibold transition-all duration-300 ${
              isActive('/resources') 
                ? 'text-indigo-600 border-b-2 border-indigo-600 pb-1' 
                : 'text-gray-600 hover:text-indigo-600'
            }`}
          >
            Resources
          </Link>
        </nav>
        
        {/* Search - Compact Modern Input */}
        <div className="hidden lg:flex items-center gap-2 flex-1 max-w-xs">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search jobs..." 
              className="pl-11 py-2.5 bg-gray-50 border-gray-200 text-sm"
            />
          </div>
        </div>
        
        {/* Right side actions */}
        <div className="flex items-center gap-4">
          {/* Notifications - Larger Modern Icon Buttons */}
          <Button variant="ghost" size="default" className="w-11 h-11 p-0 rounded-xl hover:bg-indigo-50 hover:scale-110">
            <Bell className="w-6 h-6 text-gray-600 hover:text-indigo-600" />
          </Button>
          
          {/* Messages */}
          <Button variant="ghost" size="default" className="w-11 h-11 p-0 rounded-xl hover:bg-indigo-50 hover:scale-110">
            <Mail className="w-6 h-6 text-gray-600 hover:text-indigo-600" />
          </Button>
          
          {/* User Avatar */}
          {user && (
            <UserAvatar 
              user={user} 
              className="border-2 border-indigo-200 cursor-pointer hover:border-indigo-400 transition-all hover:scale-110 shadow-md" 
              size="md"
              onClick={() => navigate('/dashboard')}
            />
          )}
          
          {!user && (
            <Avatar className="w-11 h-11 border-2 border-gray-200 shadow-md">
              <AvatarImage src="/avatars/user.jpg" />
              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold">?</AvatarFallback>
            </Avatar>
          )}
          
          {/* Auth buttons - Modern Styling */}
          <div className="hidden md:flex items-center gap-3 ml-2">
            {!user ? (
              <>
                <Button variant="ghost" asChild className="font-semibold">
                  <Link to="/login">Log in</Link>
                </Button>
                <Button variant="primary" asChild className="shadow-lg">
                  <Link to="/signup">Sign up</Link>
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => { logout(); navigate('/login') }} className="font-semibold">
                  Logout
                </Button>
                <Button variant="outline" onClick={() => { navigate('/dashboard') }} className="font-semibold">
                  {user.name}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};