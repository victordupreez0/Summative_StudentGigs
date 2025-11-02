import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserAvatar } from "@/components/UserAvatar";
import { useModal } from "@/components/ui/modal";
import { 
  Briefcase, 
  Users, 
  Calendar,
  DollarSign,
  Clock,
  MapPin,
  Star,
  MessageSquare,
  UserPlus,
  BarChart3,
  Settings,
  Eye
} from "lucide-react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
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
    return () => { mounted = false };
  }, [token]);

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

  const stats = [
    {
      title: "Applications",
      value: "32",
      icon: Users,
      color: "text-gray-600"
    },
    {
      title: "Active jobs",
      value: activeJobs.length.toString(),
      icon: Briefcase,
      color: "text-gray-600"
    },
    {
      title: "Interviews",
      value: "18",
      icon: Calendar,
      color: "text-purple-600"
    },
    {
      title: "Hires",
      value: "5",
      icon: Star,
      color: "text-amber-500"
    }
  ];

  const recentApplicants = [
    {
      name: "Emma Wilson",
      position: "Frontend Developer",
      university: "Computer Science, Stanford",
      skills: ["React", "JS"],
      appliedTime: "2 hours ago",
      status: "New",
      avatar: "/avatars/emma.jpg"
    },
    {
      name: "Jason Park", 
      position: "UI/UX Designer",
      university: "Design, RSD",
      skills: ["Figma", "UI"],
      appliedTime: "1 day ago", 
      status: "Shortlisted",
      avatar: "/avatars/jason.jpg"
    },
    {
      name: "Sophia Rodriguez",
      position: "Content Writer",
      university: "Journalism, NYU",
      skills: ["SEO", "Copy"],
      appliedTime: "3 days ago",
      status: "Interview",
      avatar: "/avatars/sophia.jpg"
    }
  ];

  const teamMembers = [
    {
      name: "Michael Johnson",
      role: "Admin",
      status: "online",
      avatar: "/avatars/michael.jpg"
    },
    {
      name: "Sarah Williams", 
      role: "Recruiter",
      status: "online",
      avatar: "/avatars/sarah.jpg"
    },
    {
      name: "David Chen",
      role: "Hiring Manager",
      status: "online", 
      avatar: "/avatars/david.jpg"
    }
  ];

  const upcomingInterviews = [
    {
      name: "Interview with Sophia",
      position: "Content Writer position",
      time: "3:00 PM - 4:00 PM",
      type: "Today",
      avatar: "/avatars/sophia.jpg"
    },
    {
      name: "Interview with Jason",
      position: "UI/UX Designer position", 
      time: "1:00 AM - 12:00 PM",
      type: "Tomorrow",
      avatar: "/avatars/jason.jpg"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
  <Navbar />
      
      {/* Secondary Navigation */}
      <div className="border-b border-gray-200">
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-8 h-16">
            <Link 
              to="/browse-jobs" 
              className="text-sm font-medium text-muted-foreground hover:text-primary py-5"
            >
              Browse Jobs
            </Link>
            <Link 
              to="/open-jobs" 
              className="text-sm font-medium text-gray-600 hover:text-gray-900 py-5"
            >
              Open Jobs
            </Link>
            <Link 
              to="/employer-dashboard" 
              className="text-sm font-medium text-gray-900 border-b-2 border-purple-600 py-2"
            >
              Dashboard
            </Link>
            <Link 
              to="/applicants" 
              className="text-sm font-medium text-gray-600 hover:text-gray-900 py-5"
            >
              Applicants
            </Link>
            <Link 
              to="/messages" 
              className="text-sm font-medium text-gray-600 hover:text-gray-900 py-5"
            >
              Messages
            </Link>
            <Link 
              to="/profile" 
              className="text-sm font-medium text-gray-600 hover:text-gray-900 py-5"
            >
              Profile
            </Link>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section - Employer */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <UserAvatar user={user} size="lg" />
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                Welcome back, {user?.name || 'User'} 👋
              </h1>
              <p className="text-gray-600">{user?.businessName || 'Your Business'} • Employer Account</p>
            </div>
          </div>

          <div className="bg-gradient-hero rounded-lg p-6 text-primary-foreground">
            <div className="flex flex-col lg:flex-row items-center justify-between">
              <div className="mb-4 lg:mb-0">
                <h2 className="text-xl font-semibold mb-2">Find talented students for your projects</h2>
                <p className="text-charcoal">
                  Post jobs, review applications, and hire the best students for your team.
                </p>
              </div>
              <div className="flex gap-3">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white" asChild>
                  <Link to="/post-job">+ Post a Job</Link>
                </Button>
                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900" asChild>
                  <Link to="/browse-talent">
                    <Users className="w-4 h-4 mr-2" />
                    Browse Students
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} hover={true} className="border-gray-200 bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

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
                    <p className="text-2xl font-bold text-primary">32</p>
                    <p className="text-sm text-muted-foreground">Applications</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">3</p>
                    <p className="text-sm text-muted-foreground">Active jobs</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">18</p>
                    <p className="text-sm text-muted-foreground">Interviews</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">5</p>
                    <p className="text-sm text-muted-foreground">Hires</p>
                  </div>
                </div>
                <Button variant="link" size="sm" className="w-full mt-4">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View detailed analytics
                </Button>
              </CardContent>
            </Card>

            {/* Team Members */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Team members</CardTitle>
                <Button size="icon" variant="ghost">
                  <UserPlus className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {teamMembers.map((member, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.role}</p>
                        </div>
                      </div>
                      <Button size="icon" variant="ghost">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="w-full mt-4">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite team member
                </Button>
              </CardContent>
            </Card>

            {/* Upcoming Interviews */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming interviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingInterviews.map((interview, index) => (
                    <div key={index} className="border-l-4 border-primary pl-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-primary-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{interview.name}</p>
                          <p className="text-xs text-muted-foreground">{interview.position}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{interview.time}</span>
                          </div>
                        </div>
                        <Badge variant={interview.type === 'Today' ? 'default' : 'secondary'} className="text-xs">
                          {interview.type}
                        </Badge>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline">Join call</Button>
                        <Button size="sm">Reschedule</Button>
                      </div>
                    </div>
                  ))}
                </div>
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

      <Footer />
      {ModalComponent}
    </div>
  );
};

export default EmployerDashboard;