import { Search, Bell, Mail, User, Settings, LogOut, LayoutDashboard, MessageSquare, AlertCircle, AlertTriangle } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserAvatar } from "@/components/UserAvatar";
import { NotificationDropdown } from "@/components/NotificationDropdown";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useContext, useState, useEffect } from 'react'
import AuthContext from '@/context/AuthContext'
import API_BASE from '@/config/api'

export const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate()
  const { user, logout, token } = useContext(AuthContext)
  const [recentMessages, setRecentMessages] = useState([])
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [navSearchQuery, setNavSearchQuery] = useState("")
  
  const isActive = (path) => {
    try {
      return location?.pathname === path || location?.pathname?.startsWith(path + '/');
    } catch (e) {
      return false;
    }
  };

  const handleNavSearch = (e) => {
    e.preventDefault();
    if (navSearchQuery.trim()) {
      navigate(`/browse-jobs?search=${encodeURIComponent(navSearchQuery.trim())}`);
      setNavSearchQuery("");
    }
  };

  // Fetch recent messages
  useEffect(() => {
    if (user) {
      fetchRecentMessages();
    }
  }, [user]);

  const fetchRecentMessages = async () => {
    setLoadingMessages(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoadingMessages(false);
        return;
      }
      
      const res = await fetch(`${API_BASE}/api/messages/conversations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) {
        console.error('Failed to fetch conversations');
        setLoadingMessages(false);
        return;
      }
      
      const data = await res.json();
      // Get only the 5 most recent conversations
      setRecentMessages(data.slice(0, 5));
      setLoadingMessages(false);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setLoadingMessages(false);
    }
  };

  const getMessagePreview = (message) => {
    if (!message) return 'No messages yet';
    // Backend returns last_message as a string, not an object
    const preview = typeof message === 'string' ? message : (message.content || '');
    return preview.length > 50 ? preview.substring(0, 50) + '...' : preview;
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };
  
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        {/* Demo Warning Banner and Logo Container */}
        <div className="flex items-center">
          {/* Demo Warning Banner - positioned much farther left */}
          <Link 
            to="/demo-disclaimer" 
            className="hidden lg:flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-lg hover:border-amber-400 transition-all duration-300 shadow-sm hover:shadow-md group -ml-16 mr-16"
          >
            <AlertTriangle className="w-5 h-5 text-amber-600 animate-pulse flex-shrink-0" />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-amber-800 group-hover:text-amber-900 leading-tight">
                Demo App
              </span>
              <span className="text-xs text-amber-700 group-hover:text-amber-800 leading-tight">
                click here
              </span>
            </div>
          </Link>
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <img 
              src="/logo.png" 
              alt="StudentGigs Logo" 
              className="h-10 w-auto transition-transform duration-200 group-hover:scale-105"
            />
          </Link>
        </div>
        
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
          {user && (
            <Link 
              to={user.userType === 'employer' ? '/employer-dashboard' : '/student-dashboard'} 
              className={`text-sm font-medium transition-all duration-300 ${
                isActive('/student-dashboard') || isActive('/employer-dashboard')
                  ? 'text-gray-900' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Dashboard
            </Link>
          )}
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
          <form onSubmit={handleNavSearch} className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <Input 
              placeholder="Search jobs..." 
              className="pl-11 py-2.5 bg-gray-50 border-gray-200 text-sm"
              value={navSearchQuery}
              onChange={(e) => setNavSearchQuery(e.target.value)}
            />
          </form>
        </div>
        
        {/* Right side actions */}
        <div className="flex items-center gap-4">
          {/* Show notifications and messages only when user is logged in */}
          {user && (
            <>
              {/* Notifications Dropdown */}
              <NotificationDropdown user={user} token={token} />
              
              {/* Messages Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button 
                    className={`w-10 h-10 p-0 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors ${
                      isActive('/messages') ? 'bg-gray-100' : ''
                    }`}
                  >
                    <Mail className="w-5 h-5" style={{ stroke: '#374151', strokeWidth: 2 }} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>
                    <div className="flex items-center justify-between">
                      <span>Recent Messages</span>
                      <button 
                        onClick={() => navigate('/messages')}
                        className="text-xs text-purple-600 hover:text-purple-700 font-normal"
                      >
                        View all
                      </button>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {loadingMessages ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                      Loading messages...
                    </div>
                  ) : recentMessages.length === 0 ? (
                    <div className="p-4 text-center">
                      <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-500">No messages yet</p>
                    </div>
                  ) : (
                    recentMessages.map((conversation) => (
                      <DropdownMenuItem 
                        key={conversation.id}
                        onClick={() => navigate('/messages')}
                        className="cursor-pointer p-3 hover:bg-gray-50"
                      >
                        <div className="flex items-start gap-3 w-full">
                          <UserAvatar 
                            user={{ 
                              name: conversation.other_user_name,
                              userType: conversation.other_user_type || 'student'
                            }} 
                            userId={conversation.other_user_id}
                            size="sm"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {conversation.other_user_name}
                              </p>
                              <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                                {getTimeAgo(conversation.last_message_time || conversation.updated_at)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 truncate">
                              {getMessagePreview(conversation.last_message)}
                            </p>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
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
                {user.isAdmin && (
                  <DropdownMenuItem onClick={() => navigate('/admin')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Admin Panel</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/feedback')}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  <span>Send Feedback</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/report-error')}>
                  <AlertCircle className="mr-2 h-4 w-4" />
                  <span>Report an Error</span>
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