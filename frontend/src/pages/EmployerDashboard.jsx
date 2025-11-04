import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/UserAvatar";
import { useModal } from "@/components/ui/modal";
import Modal from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { 
  Briefcase, 
  Users, 
  Calendar,
  DollarSign,
  Clock,
  MapPin,
  Star,
  BarChart3,
  Eye,
  CheckCircle,
  RotateCcw,
  Plus,
  MessageSquare,
  FileText,
  Search,
  Bell,
  Settings,
  TrendingUp
} from "lucide-react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { SecondaryNav } from "@/components/SecondaryNav";
import { Footer } from "@/components/Footer";
import AuthContext from '@/context/AuthContext';
import API_BASE from '@/config/api';

const EmployerDashboard = () => {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const { showAlert, ModalComponent } = useModal();
  const [activeJobs, setActiveJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [upcomingInterviews, setUpcomingInterviews] = useState([]);
  const [loadingInterviews, setLoadingInterviews] = useState(true);
  const [stats, setStats] = useState({
    applications: 0,
    activeJobs: 0,
    interviews: 0,
    hires: 0,
    profileViews: 0
  });
  const [monthlyStats, setMonthlyStats] = useState({
    applications: 0,
    activeJobs: 0,
    interviews: 0,
    hires: 0,
    profileViews: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [rescheduleData, setRescheduleData] = useState({
    scheduledDate: '',
    scheduledTime: '',
    meetingLink: '',
    notes: ''
  });

  useEffect(() => {
    let mounted = true;
    
    const fetchMyJobs = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/jobs/my-jobs`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!res.ok) {
          console.error('Failed to fetch jobs');
          if (mounted) setActiveJobs([]);
          return;
        }
        
        const data = await res.json();
        if (mounted) {
          // Map backend data to frontend format
          const mappedJobs = data.map(job => ({
            id: job.id,
            title: job.title,
            type: job.projectType || 'Remote',
            duration: job.projectLength || 'Not specified',
            budget: '$20-30/hr', // TODO: Add budget field to database
            applicants: 0, // Will be updated when applications load
            posted: `Posted ${getTimeAgo(job.created_at)}`,
            tags: job.tags || []
          }));
          setActiveJobs(mappedJobs);
        }
      } catch (err) {
        console.error('Failed to load jobs', err);
        if (mounted) setActiveJobs([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    const fetchApplications = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/applications/my-jobs`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!res.ok) {
          console.error('Failed to fetch applications');
          return;
        }
        
        const data = await res.json();
        if (mounted) {
          setApplications(data);
          // Update job applicant counts
          const applicantCounts = {};
          data.forEach(app => {
            applicantCounts[app.job_id] = (applicantCounts[app.job_id] || 0) + 1;
          });
          setActiveJobs(prev => prev.map(job => ({
            ...job,
            applicants: applicantCounts[job.id] || 0
          })));
        }
      } catch (err) {
        console.error('Failed to load applications', err);
      }
    };

    fetchMyJobs();
    fetchApplications();
    fetchRecentActivity();
    fetchUpcomingInterviews();
    fetchEmployerStats();
    return () => { mounted = false };
  }, [token]);

  const fetchRecentActivity = async () => {
    setLoadingActivity(true);
    try {
      const res = await fetch(`${API_BASE}/api/notifications?limit=5`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) {
        console.error('Failed to fetch notifications');
        setLoadingActivity(false);
        return;
      }
      
      const data = await res.json();
      
      // Map notifications to activity format with proper icons
      const activities = data.map(notif => {
        let icon = UserPlus;
        let color = 'text-gray-600';
        
        switch (notif.type) {
          case 'new_application':
            icon = UserPlus;
            color = 'text-blue-600';
            break;
          case 'job_completed':
            icon = Star;
            color = 'text-green-600';
            break;
          case 'application_accepted':
            icon = Star;
            color = 'text-purple-600';
            break;
          default:
            icon = UserPlus;
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
    } catch (error) {
      console.error('Error fetching activity:', error);
      setLoadingActivity(false);
    }
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
  };

  const fetchEmployerStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/profile/employer/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) {
        console.error('Failed to fetch employer stats');
        return;
      }
      
      const data = await res.json();
      setStats({
        applications: data.overall.applications,
        activeJobs: data.overall.activeJobs,
        interviews: data.overall.interviews,
        hires: data.overall.hires,
        profileViews: data.overall.profileViews || 0
      });
      setMonthlyStats({
        applications: data.monthly.applications,
        activeJobs: data.monthly.activeJobs,
        interviews: data.monthly.interviews,
        hires: data.monthly.hires,
        profileViews: data.monthly.profileViews || 0
      });
      setLoadingStats(false);
    } catch (err) {
      console.error('Failed to load employer stats', err);
      setLoadingStats(false);
    }
  };

  const quickActions = [
    {
      title: "Profile Views",
      description: `${stats.profileViews || 0}`,
      icon: Eye,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      link: "/business-profile",
      primary: false
    },
    {
      title: "Review Applications",
      description: `${stats.applications} pending`,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      link: "/applicants",
      badge: stats.applications > 0 ? stats.applications : null
    },
    {
      title: "Manage Jobs",
      description: `${stats.activeJobs} active`,
      icon: Briefcase,
      color: "text-green-600",
      bgColor: "bg-green-50",
      link: "/my-jobs"
    },
    {
      title: "Schedule Interview",
      description: `${stats.interviews} scheduled`,
      icon: Calendar,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      link: "#interviews"
    },
    {
      title: "Messages",
      description: "Chat with applicants",
      icon: MessageSquare,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      link: "/messages"
    },
    {
      title: "View Profile",
      description: "Edit your business profile",
      icon: Eye,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      link: "/business-profile"
    }
  ];

  const fetchUpcomingInterviews = async () => {
    setLoadingInterviews(true);
    try {
      const res = await fetch(`${API_BASE}/api/interviews/upcoming?userType=employer`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) {
        console.error('Failed to fetch interviews');
        setUpcomingInterviews([]);
        return;
      }
      
      const data = await res.json();
      setUpcomingInterviews(data.interviews || []);
    } catch (err) {
      console.error('Failed to load interviews', err);
      setUpcomingInterviews([]);
    } finally {
      setLoadingInterviews(false);
    }
  };

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
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
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
      fetchUpcomingInterviews(); // Refresh the list
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

      fetchUpcomingInterviews(); // Refresh the list
    } catch (error) {
      console.error('Error completing interview:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
  <Navbar />
      
      {/* Secondary Navigation */}
      <SecondaryNav />

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards - Matching Student Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-8">
          {quickActions.slice(0, 4).map((action, index) => (
            <Card 
              key={index} 
              hover={true} 
              className="border-gray-200 bg-white cursor-pointer transition-all hover:shadow-lg"
              onClick={() => action.link.startsWith('#') ? document.querySelector(action.link)?.scrollIntoView({ behavior: 'smooth' }) : navigate(action.link)}
            >
              <CardContent className="p-3 sm:p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{action.title}</p>
                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">{action.description.split(' ')[0]}</p>
                    <p className="text-xs text-gray-500 mt-1 truncate">{action.description}</p>
                  </div>
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${action.bgColor} flex items-center justify-center flex-shrink-0 ml-2`}>
                    <action.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${action.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Welcome/Bio Section - Matching Student Dashboard Style */}
        <Card className="mb-8 border-gray-200 bg-white">
          <CardContent className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <UserAvatar user={user} userId={user?.id} size="lg" />
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  Welcome back, {user?.name || 'User'} 👋
                </h1>
                <p className="text-gray-600">
                  {user?.businessName || 'Your Business'} • Employer Account
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-100">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">
                    Find talented students for your projects
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Post jobs, review applications, and hire the best students for your team.
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white" asChild>
                    <Link to="/post-job">+ Post a Job</Link>
                  </Button>
                  <Button variant="outline" className="border-gray-300" asChild>
                    <Link to="/applicants">
                      <Users className="w-4 h-4 mr-2" />
                      View Applicants
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Active Jobs */}
            <Card hover={true} className="border-gray-200 bg-white">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Briefcase className="w-5 h-5" />
                  Active Jobs
                  <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-gray-200">{activeJobs.length}</Badge>
                </CardTitle>
                <Link to="/post-job" className="text-purple-600 hover:text-purple-700 hover:underline text-sm">Post new job</Link>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Loading your jobs...</p>
                  </div>
                ) : activeJobs.length === 0 ? (
                  <div className="text-center py-12">
                    <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2 text-gray-900">No active jobs yet</h3>
                    <p className="text-gray-600 mb-4">Start by posting your first job to find talented students.</p>
                    <Button className="bg-gray-900 hover:bg-gray-800 text-white" asChild>
                      <Link to="/post-job">+ Post Your First Job</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {activeJobs.map((job, index) => (
                      <div key={job.id || index} className="border-b border-border last:border-0 pb-6 last:pb-0">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-foreground">{job.title}</h3>
                          <span className="text-sm text-muted-foreground">{job.posted}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <span><MapPin className="w-4 h-4 inline mr-1" />{job.type}</span>
                          <span><Clock className="w-4 h-4 inline mr-1" />{job.duration}</span>
                          <span className="font-medium"><DollarSign className="w-4 h-4 inline mr-1" />{job.budget}</span>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {job.tags.map((tag, tagIndex) => (
                            <Badge key={tagIndex} variant="outline">{tag}</Badge>
                          ))}
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Users className="w-4 h-4" />
                            {job.applicants} applicants
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => window.location.href = `/jobs/${job.id}`}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => window.location.href = `/jobs/${job.id}/edit`}
                            >
                              Edit
                            </Button>
                            <Button size="sm">Review Applicants</Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Applicants */}
            <Card hover={true}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  Recent Applicants
                  <Badge variant="secondary">{applications.filter(a => a.status === 'pending').length} new</Badge>
                </CardTitle>
                <Link to="/applicants" className="text-primary hover:underline text-sm">View all</Link>
              </CardHeader>
              <CardContent>
                {applications.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No applications yet</p>
                    <p className="text-sm">Applications will appear here when students apply to your jobs</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applications.slice(0, 5).map((applicant) => {
                      const statusMap = {
                        'pending': 'New',
                        'accepted': 'Accepted',
                        'rejected': 'Rejected'
                      };
                      const statusVariant = {
                        'pending': 'default',
                        'accepted': 'success',
                        'rejected': 'secondary'
                      };
                      
                      return (
                        <div key={applicant.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                              style={{ backgroundColor: applicant.profile_picture ? 'transparent' : (applicant.avatar_color || '#1e40af') }}
                            >
                              {applicant.profile_picture ? (
                                <img src={applicant.profile_picture} alt={applicant.name} className="w-full h-full rounded-full object-cover" />
                              ) : (
                                (applicant.name?.charAt(0) || 'U').toUpperCase()
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{applicant.name}</p>
                              <p className="text-sm text-muted-foreground">{applicant.job_title}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Applied {new Date(applicant.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge 
                              variant={statusVariant[applicant.status]}
                              className="mb-1"
                            >
                              {statusMap[applicant.status]}
                            </Badge>
                            <div className="flex gap-1 mt-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => navigate(`/applications/${applicant.id}`)}
                              >
                                Review
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Monthly Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-primary">{monthlyStats.applications}</p>
                    <p className="text-sm text-muted-foreground">Applications</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">{monthlyStats.activeJobs}</p>
                    <p className="text-sm text-muted-foreground">Active jobs</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">{monthlyStats.interviews}</p>
                    <p className="text-sm text-muted-foreground">Interviews</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">{monthlyStats.hires}</p>
                    <p className="text-sm text-muted-foreground">Hires</p>
                  </div>
                </div>
                <Button 
                  variant="link" 
                  size="sm" 
                  className="w-full mt-4"
                  onClick={() => showAlert('Coming Soon', 'Detailed analytics will be available soon!')}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View detailed analytics
                </Button>
              </CardContent>
            </Card>

            {/* Team Members */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Team members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-400 opacity-50" />
                  <p className="text-sm text-muted-foreground font-medium">Coming Soon</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Team member management will be available soon
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Interviews */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming interviews</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingInterviews ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Loading interviews...</p>
                  </div>
                ) : upcomingInterviews.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-muted-foreground">No upcoming interviews scheduled</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingInterviews.map((interview) => {
                      const isPast = isInterviewPast(interview.scheduled_date, interview.scheduled_time);
                      const dateLabel = getInterviewDate(interview.scheduled_date);
                      const isEmployer = user && interview.employer_id === user.id;
                      
                      return (
                      <div key={interview.id} className={`border-l-4 ${isPast ? 'border-gray-400' : 'border-primary'} pl-4`}>
                        <div className="flex items-center gap-3">
                          <UserAvatar 
                            user={{
                              name: interview.student_name,
                              avatarColor: interview.student_avatar_color
                            }}
                            userId={interview.student_id}
                            size="sm"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">{interview.student_name}</p>
                            <p className="text-xs text-muted-foreground">{interview.job_title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Clock className="w-3 h-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {formatInterviewTime(interview.scheduled_time)}
                              </span>
                            </div>
                          </div>
                          <Badge variant={isPast ? 'destructive' : (dateLabel === 'Today' ? 'default' : 'secondary')} className="text-xs">
                            {isPast ? 'Late' : dateLabel}
                          </Badge>
                        </div>
                        <div className="flex gap-2 mt-3">
                          {interview.meeting_link && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                const link = interview.meeting_link.startsWith('http') 
                                  ? interview.meeting_link 
                                  : `https://${interview.meeting_link}`;
                                window.open(link, '_blank');
                              }}
                            >
                              Join call
                            </Button>
                          )}
                          {isEmployer && (
                            <>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleReschedule(interview)}
                              >
                                <RotateCcw className="w-3 h-3 mr-1" />
                                Reschedule
                              </Button>
                              <Button 
                                size="sm"
                                variant="outline"
                                onClick={() => handleCompleteInterview(interview.id)}
                                className="text-green-600 hover:text-green-700"
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

            {/* Ready to find more talent */}
            <Card>
              <CardHeader>
                <CardTitle>Ready to find more talent?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Post a new job to reach thousands of qualified students.
                </p>
                <Button className="w-full" asChild>
                  <Link to="/post-job">+ Post a new job</Link>
                </Button>
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

export default EmployerDashboard;