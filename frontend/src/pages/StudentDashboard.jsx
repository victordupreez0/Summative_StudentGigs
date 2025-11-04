import { useState, useEffect, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { UserAvatar } from "@/components/UserAvatar";
import { useModal } from "@/components/ui/modal";
import Modal from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { 
  Eye, 
  Send, 
  Bookmark, 
  Briefcase,
  DollarSign, 
  Star, 
  Clock,
  MapPin,
  Users,
  TrendingUp,
  Calendar,
  CheckCircle,
  Upload,
  RotateCcw
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import AuthContext from '@/context/AuthContext';
import API_BASE from '@/config/api';

const StudentDashboard = () => {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const { showAlert, ModalComponent } = useModal();
  
  console.log('StudentDashboard rendering, user:', user ? 'logged in' : 'not logged in');
  
  // Helper function to format experience level
  const formatExperienceLevel = (level) => {
    const levels = {
      'entry': 'Entry Level',
      'intermediate': 'Intermediate',
      'expert': 'Expert',
      'beginner': 'Beginner',
      'advanced': 'Advanced'
    };
    return levels[level?.toLowerCase()] || level;
  };

  // Helper function to format weekly hours
  const formatWeeklyHours = (hours) => {
    if (!hours) return '';
    const hourMap = {
      'less-10': 'Less than 10 hours/week',
      '10-20': '10-20 hours/week',
      '20-30': '20-30 hours/week',
      '30-40': '30-40 hours/week',
      '40+': '40+ hours/week',
      'full-time': 'Full-time',
      'part-time': 'Part-time'
    };
    return hourMap[hours] || hours;
  };

  // Helper function to calculate profile completion
  const calculateProfileCompletion = (profile) => {
    if (!profile) return { percentage: 20, completed: ['Basic Information'], pending: ['Complete Bio', 'Add Education', 'Add Skills', 'Upload Portfolio'] };
    
    const steps = [
      { name: 'Basic Information', completed: true, key: 'basic' }, // Always true if user exists
      { name: 'Bio', completed: !!profile.bio, key: 'bio' },
      { name: 'Education', completed: Array.isArray(profile.education) && profile.education.length > 0, key: 'education' },
      { name: 'Skills', completed: Array.isArray(profile.skills) && profile.skills.length > 0, key: 'skills' },
      { name: 'Work Experience', completed: Array.isArray(profile.work_experience) && profile.work_experience.length > 0, key: 'experience' },
      { name: 'Portfolio', completed: Array.isArray(profile.portfolio) && profile.portfolio.length > 0, key: 'portfolio' },
      { name: 'Availability', completed: profile.availability && Object.keys(profile.availability).length > 0, key: 'availability' },
    ];
    
    const completedSteps = steps.filter(s => s.completed);
    const pendingSteps = steps.filter(s => !s.completed);
    const percentage = Math.round((completedSteps.length / steps.length) * 100);
    
    return {
      percentage,
      completed: completedSteps.map(s => s.name),
      pending: pendingSteps.map(s => s.name)
    };
  };

  const [recommendedJobs, setRecommendedJobs] = useState([])
  const [savedJobIds, setSavedJobIds] = useState(new Set())
  const [recentActivity, setRecentActivity] = useState([])
  const [loadingActivity, setLoadingActivity] = useState(false)
  const [profileData, setProfileData] = useState(null)
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [upcomingInterviews, setUpcomingInterviews] = useState([])
  const [loadingInterviews, setLoadingInterviews] = useState(true)
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [rescheduleData, setRescheduleData] = useState({
    scheduledDate: '',
    scheduledTime: '',
    meetingLink: '',
    notes: ''
  });
  
  // Stats state
  const [stats, setStats] = useState([
    {
      title: "Profile Views",
      value: "0",
      change: "Loading...",
      icon: Eye,
      color: "text-gray-600",
      link: "/student-profile"
    },
    {
      title: "Applications", 
      value: "0",
      change: "Loading...",
      icon: Send,
      color: "text-gray-600",
      link: "/applications"
    },
    {
      title: "Saved Jobs",
      value: "0", 
      change: "Loading...",
      icon: Bookmark,
      color: "text-gray-600",
      link: "/browse-jobs?filter=saved"
    },
    {
      title: "Open Jobs",
      value: "0",
      change: "Loading...",
      icon: Briefcase,
      color: "text-purple-600",
      link: "/open-jobs"
    }
  ]);

  // Fetch profile data for profile views
  useEffect(() => {
    if (!user || !token) return;
    
    let mounted = true;
    setLoadingProfile(true);
    
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/profile/me/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!res.ok) {
          setLoadingProfile(false);
          return;
        }
        
        const data = await res.json();
        if (!mounted) return;
        
        setProfileData(data);
        setLoadingProfile(false);
      } catch (e) {
        console.error('Failed to load profile data', e);
        setLoadingProfile(false);
      }
    })();
    
    return () => { mounted = false };
  }, [user, token]);

  // Fetch stats data
  useEffect(() => {
    if (!user || !token) {
      // Set default stats for non-logged in users
      setStats([
        {
          title: "Profile Views",
          value: "0",
          change: "Login to view",
          icon: Eye,
          color: "text-gray-600",
          link: "/student-profile"
        },
        {
          title: "Applications", 
          value: "0",
          change: "Login to view",
          icon: Send,
          color: "text-gray-600",
          link: "/applications"
        },
        {
          title: "Saved Jobs",
          value: "0", 
          change: "Login to view",
          icon: Bookmark,
          color: "text-gray-600",
          link: "/browse-jobs?filter=saved"
        },
        {
          title: "Open Jobs",
          value: "0",
          change: "Loading...",
          icon: Briefcase,
          color: "text-purple-600",
          link: "/open-jobs"
        }
      ]);
      return;
    }
    
    let mounted = true;
    
    (async () => {
      try {
        // Fetch applications count
        let applicationsCount = 0;
        let awaitingResponse = 0;
        try {
          const appsRes = await fetch(`${API_BASE}/api/applications/my-applications`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (appsRes.ok) {
            const appsData = await appsRes.json();
            applicationsCount = appsData.length;
            awaitingResponse = appsData.filter(app => app.status === 'pending').length;
          }
        } catch (e) {
          console.error('Failed to fetch applications:', e);
        }
        
        // Fetch saved jobs count
        let savedJobsCount = 0;
        let closingSoon = 0;
        try {
          const savedRes = await fetch(`${API_BASE}/api/jobs/saved`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (savedRes.ok) {
            const savedData = await savedRes.json();
            savedJobsCount = savedData.length;
            // Count jobs closing within 7 days
            const now = new Date();
            const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            closingSoon = savedData.filter(job => {
              if (job.deadline) {
                const deadline = new Date(job.deadline);
                return deadline <= sevenDaysFromNow && deadline > now;
              }
              return false;
            }).length;
          }
        } catch (e) {
          console.error('Failed to fetch saved jobs:', e);
        }
        
        // Fetch open jobs count (all available jobs)
        let openJobsCount = 0;
        try {
          const jobsRes = await fetch(`${API_BASE}/api/jobs`);
          if (jobsRes.ok) {
            const jobsData = await jobsRes.json();
            openJobsCount = jobsData.filter(job => job.status === 'open').length;
          }
        } catch (e) {
          console.error('Failed to fetch open jobs:', e);
        }
        
        // Get profile views from profile data
        const profileViews = profileData?.profile?.profile_views || 0;
        
        if (!mounted) return;
        
        setStats([
          {
            title: "Profile Views",
            value: profileViews.toString(),
            change: "Last 30 days",
            icon: Eye,
            color: "text-gray-600",
            link: "/student-profile"
          },
          {
            title: "Applications", 
            value: applicationsCount.toString(),
            change: awaitingResponse > 0 ? `${awaitingResponse} awaiting response` : "All reviewed",
            icon: Send,
            color: "text-gray-600",
            link: "/applications"
          },
          {
            title: "Saved Jobs",
            value: savedJobsCount.toString(), 
            change: closingSoon > 0 ? `${closingSoon} closing soon` : "No urgent deadlines",
            icon: Bookmark,
            color: "text-gray-600",
            link: "/browse-jobs?filter=saved"
          },
          {
            title: "Open Jobs",
            value: openJobsCount.toString(),
            change: "Available now",
            icon: Briefcase,
            color: "text-purple-600",
            link: "/open-jobs"
          }
        ]);
      } catch (e) {
        console.error('Failed to load stats', e);
        // Set default values on error
        if (!mounted) return;
        setStats([
          {
            title: "Profile Views",
            value: "0",
            change: "Error loading",
            icon: Eye,
            color: "text-gray-600",
            link: "/student-profile"
          },
          {
            title: "Applications", 
            value: "0",
            change: "Error loading",
            icon: Send,
            color: "text-gray-600",
            link: "/applications"
          },
          {
            title: "Saved Jobs",
            value: "0", 
            change: "Error loading",
            icon: Bookmark,
            color: "text-gray-600",
            link: "/browse-jobs?filter=saved"
          },
          {
            title: "Open Jobs",
            value: "0",
            change: "Error loading",
            icon: Briefcase,
            color: "text-purple-600",
            link: "/open-jobs"
          }
        ]);
      }
    })();
    
    return () => { mounted = false };
  }, [user, token, profileData]);

  // Fetch recent notifications for activity feed
  useEffect(() => {
    if (!user || !token) return;
    
    let mounted = true;
    setLoadingActivity(true);
    
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/notifications?limit=5`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!res.ok) {
          setLoadingActivity(false);
          return;
        }
        
        const data = await res.json();
        if (!mounted) return;
        
        // Map notifications to activity format
        const activities = data.map(notif => {
          let icon = Send;
          let color = 'text-gray-600';
          
          switch (notif.type) {
            case 'application_accepted':
              icon = CheckCircle;
              color = 'text-purple-600';
              break;
            case 'application_rejected':
              icon = Send;
              color = 'text-gray-600';
              break;
            case 'new_application':
              icon = Send;
              color = 'text-blue-600';
              break;
            case 'job_completed':
              icon = CheckCircle;
              color = 'text-green-600';
              break;
            case 'job_status_changed':
              icon = Clock;
              color = 'text-amber-600';
              break;
            default:
              icon = Send;
              color = 'text-gray-600';
          }
          
          // Calculate time ago
          const date = new Date(notif.created_at);
          const now = new Date();
          const diffMs = now - date;
          const diffMins = Math.floor(diffMs / (1000 * 60));
          const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
          const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
          
          let timeAgo;
          if (diffMins < 1) timeAgo = 'Just now';
          else if (diffMins < 60) timeAgo = `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
          else if (diffHours < 24) timeAgo = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
          else if (diffDays === 1) timeAgo = 'Yesterday';
          else if (diffDays < 7) timeAgo = `${diffDays} days ago`;
          else timeAgo = date.toLocaleDateString();
          
          return {
            type: notif.type,
            message: notif.message,
            time: timeAgo,
            icon: icon,
            color: color
          };
        });
        
        setRecentActivity(activities);
        setLoadingActivity(false);
      } catch (e) {
        console.error('Failed to load recent activity', e);
        setLoadingActivity(false);
      }
    })();
    
    return () => { mounted = false };
  }, [user, token]);

  // Fetch upcoming interviews
  useEffect(() => {
    if (!user || !token) return;
    
    let mounted = true;
    setLoadingInterviews(true);
    
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/interviews/upcoming?userType=student`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!res.ok) {
          setLoadingInterviews(false);
          return;
        }
        
        const data = await res.json();
        if (!mounted) return;
        
        setUpcomingInterviews(data.interviews || []);
        setLoadingInterviews(false);
      } catch (e) {
        console.error('Failed to load interviews', e);
        setLoadingInterviews(false);
      }
    })();
    
    return () => { mounted = false };
  }, [user, token]);

  const getInterviewDate = (scheduledDate) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const interviewDate = new Date(scheduledDate);
    
    if (interviewDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (interviewDate.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return interviewDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const formatInterviewTime = (scheduledTime) => {
    // Convert 24hr time to 12hr format
    const [hours, minutes] = scheduledTime.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const isInterviewPast = (scheduledDate, scheduledTime) => {
    const now = new Date();
    // Parse the date properly - it comes as ISO string from backend
    const dateOnly = scheduledDate.split('T')[0]; // Get YYYY-MM-DD
    const interviewDateTime = new Date(`${dateOnly}T${scheduledTime}`);
    return interviewDateTime < now;
  };

  const handleReschedule = (interview) => {
    setSelectedInterview(interview);
    setRescheduleData({
      scheduledDate: interview.scheduled_date?.split('T')[0] || '',
      scheduledTime: interview.scheduled_time || '',
      meetingLink: interview.meeting_link || '',
      notes: interview.notes || ''
    });
    setShowRescheduleModal(true);
  };

  const handleRescheduleSubmit = async () => {
    if (!selectedInterview || !rescheduleData.scheduledDate || !rescheduleData.scheduledTime) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/interviews/${selectedInterview.id}/reschedule`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(rescheduleData)
      });

      if (!res.ok) throw new Error('Failed to reschedule');

      setShowRescheduleModal(false);
      // Refresh interviews
      window.location.reload();
    } catch (error) {
      console.error('Error rescheduling interview:', error);
    }
  };

  const handleCompleteInterview = async (interviewId) => {
    if (!confirm('Mark this interview as completed?')) return;

    try {
      const res = await fetch(`${API_BASE}/api/interviews/${interviewId}/complete`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error('Failed to complete interview');

      // Refresh interviews
      window.location.reload();
    } catch (error) {
      console.error('Error completing interview:', error);
    }
  };

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch(`${API_BASE}/api/jobs`)
        if (!res.ok) return
        const data = await res.json()
        if (!mounted) return
        data.sort((a,b) => new Date(b.created_at) - new Date(a.created_at))
        setRecommendedJobs(data.slice(0,3))
      } catch (e) {
        console.error('Failed to load recommended jobs', e)
      }
    })()
    return () => { mounted = false }
  }, [])

  // Fetch saved jobs to check which are saved
  useEffect(() => {
    if (!user || !token) return;
    
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/jobs/saved`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        const savedIds = new Set(data.map(job => job.id));
        setSavedJobIds(savedIds);
      } catch (e) {
        console.error('Failed to load saved jobs', e);
      }
    })();
    return () => { mounted = false };
  }, [user, token]);

  const handleSaveJob = async (e, jobId) => {
    e.stopPropagation();
    
    if (!user || !token) {
      await showAlert({
        title: 'Login Required',
        message: 'Please log in to save jobs',
        type: 'info'
      });
      return;
    }

    const isSaved = savedJobIds.has(jobId);

    try {
      const res = await fetch(`${API_BASE}/api/jobs/${jobId}/save`, {
        method: isSaved ? 'DELETE' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        throw new Error('Failed to save/unsave job');
      }

      // Update local state
      const newSavedIds = new Set(savedJobIds);
      if (isSaved) {
        newSavedIds.delete(jobId);
      } else {
        newSavedIds.add(jobId);
      }
      setSavedJobIds(newSavedIds);

      await showAlert({
        title: 'Success',
        message: isSaved ? 'Job removed from saved jobs' : 'Job saved successfully',
        type: 'success'
      });
    } catch (error) {
      console.error('Error saving/unsaving job:', error);
      await showAlert({
        title: 'Error',
        message: 'Failed to save job. Please try again.',
        type: 'error'
      });
    }
  };

  const handleApplyClick = async (jobId) => {
    if (!user) {
      await showAlert({
        title: 'Login Required',
        message: 'Please log in to apply for jobs',
        type: 'info'
      });
      return;
    }
    navigate(`/jobs/${jobId}/apply`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
  <Navbar />
      
      {/* Secondary Navigation */}
      <div className="border-b border-gray-200">
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-8 h-16">
            <Link 
              to="/browse-jobs" 
              className="text-sm font-medium text-gray-600 hover:text-gray-900 py-5"
            >
              Browse Jobs
            </Link>
            <Link 
              to="/student-dashboard" 
              className="text-sm font-medium text-gray-900 border-b-2 border-purple-600 py-2"
            >
              Dashboard
            </Link>
            <Link 
              to="/open-jobs" 
              className="text-sm font-medium text-gray-600 hover:text-gray-900 py-5"
            >
              Open Jobs
            </Link>
            <Link 
              to="/applicants" 
              className="text-sm font-medium text-gray-600 hover:text-gray-900 py-5"
            >
              Applicants
            </Link>
            <Link 
              to="/my-jobs" 
              className="text-sm font-medium text-gray-600 hover:text-gray-900 py-2"
            >
              My Jobs
            </Link>
            <Link 
              to="/applications" 
              className="text-sm font-medium text-gray-600 hover:text-gray-900 py-5"
            >
              Applications
            </Link>
            <Link 
              to="/messages" 
              className="text-sm font-medium text-gray-600 hover:text-gray-900 py-5"
            >
              Messages
            </Link>
            <Link 
              to="/student-profile" 
              className="text-sm font-medium text-gray-600 hover:text-gray-900 py-2"
            >
              Profile
            </Link>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card 
              key={index} 
              hover={true} 
              className="border-gray-200 bg-white cursor-pointer transition-all hover:shadow-lg"
              onClick={() => navigate(stat.link)}
            >
              <CardContent className="p-3 sm:p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{stat.title}</p>
                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-1 truncate">{stat.change}</p>
                  </div>
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 ml-2`}>
                    <stat.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recommended Jobs */}
            <Card hover={true} className="border-gray-200 bg-white">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-gray-900">Recommended Jobs for Students</CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Sort by:</span>
                  <Button variant="outline" size="sm" className="border-gray-300 text-gray-700">
                    Relevance ▽
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 sm:space-y-6">
                  {recommendedJobs.map((job) => (
                    <Card 
                      key={job.id} 
                      className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => navigate(`/jobs/${job.id}`)}
                    >
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                          {/* Company Icon/Avatar */}
                          <div className="flex-shrink-0">
                            <UserAvatar
                              user={{
                                name: job.poster_business_name || job.poster_name || 'User',
                                profilePicture: job.poster_profile_picture,
                                avatarColor: job.poster_avatar_color
                              }}
                              size="lg"
                            />
                          </div>

                          <div className="flex-1 w-full min-w-0">
                            <div className="flex flex-col sm:flex-row justify-between items-start mb-2 gap-2">
                              <div className="min-w-0 flex-1">
                                <h3 className="text-base sm:text-lg font-semibold text-foreground hover:text-primary break-words">
                                  {job.title}
                                </h3>
                                <p className="text-sm text-muted-foreground break-words">
                                  {job.poster_business_name || job.poster_name || `User ${job.user_id}`}
                                </p>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={(e) => handleSaveJob(e, job.id)}
                                className={`flex-shrink-0 ${savedJobIds.has(job.id) ? 'text-primary' : ''}`}
                              >
                                <Bookmark className={`w-5 h-5 ${savedJobIds.has(job.id) ? 'fill-current' : ''}`} />
                              </Button>
                            </div>

                            {/* Student vs Business Badge */}
                            <div className="flex flex-wrap gap-2 mb-3">
                              <Badge variant={job.poster_type === 'employer' ? 'default' : 'secondary'}>
                                {job.poster_type === 'employer' ? '🏢 Business' : '🎓 Student'} Job
                              </Badge>
                              {job.category && <Badge variant="outline">{job.category}</Badge>}
                              {job.projectType && <Badge variant="outline">{job.projectType}</Badge>}
                            </div>

                            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground mb-3">
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                <span className="truncate">{job.workLocation || 'Remote'}</span>
                              </div>
                              {job.budgetType === 'hourly' && job.hourlyRateMin && (
                                <div className="flex items-center gap-1">
                                  <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                  <span className="whitespace-nowrap">${job.hourlyRateMin}-${job.hourlyRateMax}/hr</span>
                                </div>
                              )}
                              {job.budgetType === 'fixed' && job.fixedBudget && (
                                <div className="flex items-center gap-1">
                                  <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                  <span className="whitespace-nowrap">${job.fixedBudget}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                <span className="whitespace-nowrap">{job.created_at ? new Date(job.created_at).toLocaleDateString() : ''}</span>
                              </div>
                            </div>

                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2 break-words">
                              {job.description}
                            </p>

                            <div className="flex flex-wrap gap-2 mb-4">
                              {(job.requiredSkills || job.tags || []).slice(0, 5).map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>

                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-muted-foreground">
                                {job.experienceLevel && <span className="whitespace-nowrap">{formatExperienceLevel(job.experienceLevel)}</span>}
                                {job.weeklyHours && <span className="whitespace-nowrap">{formatWeeklyHours(job.weeklyHours)}</span>}
                              </div>
                              <div className="flex gap-2 w-full sm:w-auto">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/jobs/${job.id}`);
                                  }}
                                  className="flex-1 sm:flex-initial text-xs sm:text-sm"
                                >
                                  View Details
                                </Button>
                                <Button 
                                  size="sm" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleApplyClick(job.id);
                                  }}
                                  className="flex-1 sm:flex-initial text-xs sm:text-sm"
                                >
                                  Apply Now
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div className="text-center mt-6">
                  <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50" asChild>
                    <Link to="/browse-jobs">View all</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card hover={true} className="border-gray-200 bg-white">
              <CardHeader>
                <CardTitle className="text-gray-900">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingActivity ? (
                  <div className="py-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-500">Loading activity...</p>
                  </div>
                ) : recentActivity.length === 0 ? (
                  <div className="py-8 text-center">
                    <Clock className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm text-gray-500">No recent activity</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0`}>
                          <activity.icon className={`w-4 h-4 ${activity.color}`} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{activity.message}</p>
                          <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {recentActivity.length > 0 && (
                  <div className="text-center mt-6">
                    <Button variant="link">View all activity</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Card */}
            <Card className="bg-gradient-hero text-primary-foreground" hover={true}>
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <UserAvatar 
                    user={user} 
                    userId={user?.id}
                    size="xl"
                    className="mx-auto mb-4 border-4 border-primary-foreground/20"
                  />
                  <h3 className="text-xl font-bold">{user?.name || 'Student'}</h3>
                  <p className="text-primary-foreground/80">
                    {profileData?.profile?.education?.[0]?.degree || 'Student'}
                    {profileData?.profile?.education?.[0]?.field && ` • ${profileData.profile.education[0].field}`}
                  </p>
                  {profileData?.stats?.totalCompletedJobs > 0 && (
                    <div className="flex items-center justify-center gap-1 mt-2">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{profileData.stats.averageRating || '5.0'}</span>
                      <span className="text-primary-foreground/80 ml-1">
                        • {profileData.stats.totalCompletedJobs} jobs completed
                      </span>
                    </div>
                  )}
                </div>
                <Button variant="accent" className="w-full mb-4" asChild>
                  <Link to="/student-profile">
                    {loadingProfile ? 'Loading...' : 'Complete Profile'}
                  </Link>
                </Button>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Profile Completion</span>
                    <span className="font-semibold">
                      {calculateProfileCompletion(profileData?.profile).percentage}%
                    </span>
                  </div>
                  <Progress 
                    value={calculateProfileCompletion(profileData?.profile).percentage} 
                    className="bg-primary-foreground/20" 
                  />
                  
                  <div className="space-y-2 text-sm">
                    {calculateProfileCompletion(profileData?.profile).completed.slice(0, 2).map((step, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span>{step}</span>
                      </div>
                    ))}
                    {calculateProfileCompletion(profileData?.profile).pending.slice(0, 2).map((step, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full border-2 border-primary-foreground/40" />
                        <span className="text-primary-foreground/70">Add {step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card hover={true}>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/browse-jobs">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Browse New Jobs
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/student-profile">
                    <Upload className="w-4 h-4 mr-2" />
                    Update Portfolio
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/messages">
                    <Users className="w-4 h-4 mr-2" />
                    Check Messages
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Upcoming Interviews */}
            <Card hover={true} className="border-gray-200 bg-white">
              <CardHeader>
                <CardTitle className="text-gray-900">Upcoming Interviews</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingInterviews ? (
                  <div className="py-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-500">Loading...</p>
                  </div>
                ) : upcomingInterviews.length === 0 ? (
                  <div className="py-8 text-center">
                    <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm text-gray-500">No upcoming interviews</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingInterviews.map((interview) => {
                      const isPast = isInterviewPast(interview.scheduled_date, interview.scheduled_time);
                      const dateLabel = getInterviewDate(interview.scheduled_date);
                      const isJobOwner = user && interview.employer_id == user.id;
                      
                      return (
                      <div key={interview.id} className={`border-l-4 ${isPast ? 'border-gray-400' : 'border-purple-600'} pl-3 py-2`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{interview.job_title}</p>
                            <p className="text-xs text-gray-600 truncate">
                              {interview.employer_business || interview.employer_name}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                              <Clock className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-500">
                                {dateLabel} • {formatInterviewTime(interview.scheduled_time)}
                              </span>
                            </div>
                          </div>
                          <Badge 
                            variant={isPast ? 'destructive' : (dateLabel === 'Today' ? 'default' : 'secondary')} 
                            className="text-xs flex-shrink-0"
                          >
                            {isPast ? 'Late' : dateLabel}
                          </Badge>
                        </div>
                        <div className="flex gap-2 mt-2">
                          {interview.meeting_link && (
                            <Button 
                              size="sm" 
                              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                              onClick={() => {
                                const link = interview.meeting_link.startsWith('http') 
                                  ? interview.meeting_link 
                                  : `https://${interview.meeting_link}`;
                                window.open(link, '_blank');
                              }}
                            >
                              Join
                            </Button>
                          )}
                          {isJobOwner && (
                            <>
                              <Button 
                                size="sm"
                                variant="outline"
                                onClick={() => handleReschedule(interview)}
                                className="border-orange-500 text-orange-600 hover:bg-orange-50"
                              >
                                <RotateCcw className="w-3 h-3 mr-1" />
                                Reschedule
                              </Button>
                              <Button 
                                size="sm"
                                variant="outline"
                                onClick={() => handleCompleteInterview(interview.id)}
                                className="border-green-600 text-green-600 hover:bg-green-50"
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Complete
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Reschedule Interview Modal */}
      <Modal
        isOpen={showRescheduleModal}
        onClose={() => setShowRescheduleModal(false)}
        title="Reschedule Interview"
        footer={
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowRescheduleModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRescheduleSubmit}
              className="flex-1"
            >
              Reschedule
            </Button>
          </div>
        }
      >
        <form className="space-y-4">
          <div>
            <label htmlFor="reschedule-date" className="block text-sm font-medium text-gray-700 mb-1">
              Interview Date *
            </label>
            <Input
              id="reschedule-date"
              type="date"
              value={rescheduleData.scheduledDate}
              onChange={(e) => setRescheduleData({...rescheduleData, scheduledDate: e.target.value})}
              required
            />
          </div>

          <div>
            <label htmlFor="reschedule-time" className="block text-sm font-medium text-gray-700 mb-1">
              Interview Time *
            </label>
            <Input
              id="reschedule-time"
              type="time"
              value={rescheduleData.scheduledTime}
              onChange={(e) => setRescheduleData({...rescheduleData, scheduledTime: e.target.value})}
              required
            />
          </div>

          <div>
            <label htmlFor="reschedule-link" className="block text-sm font-medium text-gray-700 mb-1">
              Meeting Link
            </label>
            <Input
              id="reschedule-link"
              type="url"
              placeholder="https://zoom.us/j/..."
              value={rescheduleData.meetingLink}
              onChange={(e) => setRescheduleData({...rescheduleData, meetingLink: e.target.value})}
            />
          </div>

          <div>
            <label htmlFor="reschedule-notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              id="reschedule-notes"
              placeholder="Reason for rescheduling..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={rescheduleData.notes}
              onChange={(e) => setRescheduleData({...rescheduleData, notes: e.target.value})}
            />
          </div>
        </form>
      </Modal>

      <Footer />
      <ModalComponent />
    </div>
  );
};

export default StudentDashboard;