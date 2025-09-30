import { Search, Bell, Mail } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
    <header className="bg-white border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-button rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">SG</span>
          </div>
          <span className="text-xl font-bold text-foreground">StudentGigs</span>
        </Link>
        
        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link 
            to="/browse-jobs" 
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive('/browse-jobs') ? 'text-primary border-b-2 border-primary pb-2' : 'text-muted-foreground'
            }`}
          >
            Find Work
          </Link>
          <Link 
            to="/post-job" 
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive('/post-job') ? 'text-primary border-b-2 border-primary pb-2' : 'text-muted-foreground'
            }`}
          >
            Post a Job
          </Link>
          <Link 
            to="/browse-talent" 
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive('/browse-talent') ? 'text-primary border-b-2 border-primary pb-2' : 'text-muted-foreground'
            }`}
          >
            Browse Talent
          </Link>
          <Link 
            to="/resources" 
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive('/resources') ? 'text-primary border-b-2 border-primary pb-2' : 'text-muted-foreground'
            }`}
          >
            Resources
          </Link>
        </nav>
        
        {/* Search */}
        <div className="hidden lg:flex items-center gap-2 flex-1 max-w-md mx-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search jobs..." 
              className="pl-10 bg-background-gray border-border"
            />
          </div>
        </div>
        
        {/* Right side actions */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <Button variant="ghost" size="icon">
            <Bell className="w-5 h-5" />
          </Button>
          
          {/* Messages */}
          <Button variant="ghost" size="icon">
            <Mail className="w-5 h-5" />
          </Button>
          
          {/* User Avatar */}
          <Avatar className="w-8 h-8">
            <AvatarImage src="/avatars/user.jpg" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          
          {/* Auth buttons */}
          <div className="hidden md:flex items-center gap-2">
            {!user ? (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Log in</Link>
                </Button>
                <Button variant="default" asChild>
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