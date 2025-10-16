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
        
        {/* Navigation - Professional Typography */}
        <nav className="hidden md:flex items-center gap-10">
          <Link 
            to="/browse-jobs" 
            className={`text-sm font-medium transition-all duration-200 ${
              isActive('/browse-jobs') 
                ? 'text-blue-600 border-b-2 border-blue-600 pb-1' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Find Work
          </Link>
          <Link 
            to="/post-job" 
            className={`text-sm font-medium transition-all duration-200 ${
              isActive('/post-job') 
                ? 'text-blue-600 border-b-2 border-blue-600 pb-1' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Post a Job
          </Link>
          <Link 
            to="/browse-talent" 
            className={`text-sm font-medium transition-all duration-200 ${
              isActive('/browse-talent') 
                ? 'text-blue-600 border-b-2 border-blue-600 pb-1' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Browse Talent
          </Link>
          <Link 
            to="/resources" 
            className={`text-sm font-medium transition-all duration-200 ${
              isActive('/resources') 
                ? 'text-blue-600 border-b-2 border-blue-600 pb-1' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Resources
          </Link>
        </nav>
        
        {/* Search - Professional Input */}
        <div className="hidden lg:flex items-center gap-2 flex-1 max-w-md mx-12">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search jobs..." 
              className="pl-11 bg-slate-50 border-slate-200"
            />
          </div>
        </div>
        
        {/* Right side actions */}
        <div className="flex items-center gap-3">
          {/* Notifications - Professional Icon Buttons */}
          <Button variant="ghost" size="default" className="w-10 h-10 p-0 rounded-full hover:bg-slate-100">
            <Bell className="w-5 h-5 text-slate-600" />
          </Button>
          
          {/* Messages */}
          <Button variant="ghost" size="default" className="w-10 h-10 p-0 rounded-full hover:bg-slate-100">
            <Mail className="w-5 h-5 text-slate-600" />
          </Button>
          
          {/* User Avatar */}
          {user && (
            <UserAvatar 
              user={user} 
              className="border-2 border-slate-200 cursor-pointer hover:border-blue-400 transition-colors" 
              size="md"
              onClick={() => navigate('/dashboard')}
            />
          )}
          
          {!user && (
            <Avatar className="w-10 h-10 border-2 border-slate-200">
              <AvatarImage src="/avatars/user.jpg" />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-medium">?</AvatarFallback>
            </Avatar>
          )}
          
          {/* Auth buttons - Professional Styling */}
          <div className="hidden md:flex items-center gap-3 ml-2">
            {!user ? (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Log in</Link>
                </Button>
                <Button variant="primary" asChild>
                  <Link to="/signup">Sign up</Link>
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => { logout(); navigate('/login') }}>
                  Logout
                </Button>
                <Button variant="ghost" onClick={() => { navigate('/dashboard') }}>
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