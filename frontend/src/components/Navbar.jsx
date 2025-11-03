import { Search, Bell, Mail, User, Settings, LogOut, LayoutDashboard } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserAvatar } from "@/components/UserAvatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <img 
            src="/logo.png" 
            alt="StudentGigs Logo" 
            className="h-12 w-auto transition-transform duration-200 group-hover:scale-105"
          />
        </Link>
        
        {/* Navigation - Modern Typography with Better Spacing */}
        <nav className="hidden md:flex items-center gap-8">
          <Link 
            to="/browse-jobs" 
            className={`text-sm font-medium transition-all duration-300 ${
              isActive('/browse-jobs') 
                ? 'text-gray-900' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Find Work
          </Link>
          <Link 
            to="/post-job" 
            className={`text-sm font-medium transition-all duration-300 ${
              isActive('/post-job') 
                ? 'text-gray-900' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Post a Job
          </Link>
          <Link 
            to="/browse-talent" 
            className={`text-sm font-medium transition-all duration-300 ${
              isActive('/browse-talent') 
                ? 'text-gray-900' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Browse Talent
          </Link>
          <Link 
            to="/resources" 
            className={`text-sm font-medium transition-all duration-300 ${
              isActive('/resources') 
                ? 'text-gray-900' 
                : 'text-gray-600 hover:text-gray-900'
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
          {/* Show notifications and messages only when user is logged in */}
          {user && (
            <>
              {/* Notifications - Larger Modern Icon Buttons */}
              <button className="w-10 h-10 p-0 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors">
                <Bell className="w-5 h-5" style={{ stroke: '#374151', strokeWidth: 2 }} />
              </button>
              
              {/* Messages */}
              <button 
                onClick={() => navigate('/messages')}
                className={`w-10 h-10 p-0 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors ${
                  isActive('/messages') ? 'bg-gray-100' : ''
                }`}
              >
                <Mail className="w-5 h-5" style={{ stroke: '#374151', strokeWidth: 2 }} />
              </button>
            </>
          )}
          
          {/* User Avatar with Dropdown */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="cursor-pointer">
                  <UserAvatar 
                    user={user} 
                    className="border-2 border-gray-200 hover:border-gray-400 transition-all shadow-sm" 
                    size="md"
                  />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/student-profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { logout(); navigate('/login') }}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          {/* Auth buttons - Modern Styling */}
          {!user && (
            <div className="hidden md:flex items-center gap-3 ml-2">
              <Button variant="ghost" asChild className="font-medium">
                <Link to="/login">Log in</Link>
              </Button>
              <Button asChild className="bg-gray-900 hover:bg-gray-800 shadow-sm">
                <Link to="/signup">Sign up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};