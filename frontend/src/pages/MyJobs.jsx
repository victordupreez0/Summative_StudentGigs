import { useState, useEffect, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useModal } from "@/components/ui/modal";
import { 
  Briefcase, 
  Users, 
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Building,
  AlertCircle,
  CheckCircle,
  Eye,
  MessageSquare,
  Bookmark
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { SecondaryNav } from "@/components/SecondaryNav";
import { Footer } from "@/components/Footer";
import { UserAvatar } from "@/components/UserAvatar";
import AuthContext from '@/context/AuthContext';
import API_BASE from '@/config/api';

const MyJobs = () => {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const { showAlert, ModalComponent } = useModal();
  const [jobs, setJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, active, completed, completion_pending
  const [activeTab, setActiveTab] = useState('accepted'); // accepted or saved

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

  useEffect(() => {
    let mounted = true;
    
    const fetchMyAcceptedJobs = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/applications/my-accepted-jobs`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!res.ok) {
          console.error('Failed to fetch jobs');
          if (mounted) setJobs([]);
          return;
        }
        
        const data = await res.json();
        if (mounted) {
          setJobs(data);
        }
      } catch (err) {
        console.error('Failed to load jobs', err);
        if (mounted) setJobs([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchMyAcceptedJobs();
    return () => { mounted = false };
  }, [token]);

  // Fetch saved jobs
  useEffect(() => {
    let mounted = true;
    
    const fetchSavedJobs = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/jobs/saved`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!res.ok) {
          console.error('Failed to fetch saved jobs');
          if (mounted) setSavedJobs([]);
          return;
        }
        
        const data = await res.json();
        if (mounted) {
          setSavedJobs(data);
        }
      } catch (err) {
        console.error('Failed to load saved jobs', err);
        if (mounted) setSavedJobs([]);
      }
    };

    if (activeTab === 'saved') {
      fetchSavedJobs();
    }
    return () => { mounted = false };
  }, [token, activeTab]);

  const handleUnsaveJob = async (jobId) => {
    try {
      const res = await fetch(`${API_BASE}/api/jobs/${jobId}/save`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        throw new Error('Failed to unsave job');
      }

      // Remove from local state
      setSavedJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));

      await showAlert({
        title: 'Success',
        message: 'Job removed from saved jobs',
        type: 'success'
      });
    } catch (error) {
      console.error('Error unsaving job:', error);
      await showAlert({
        title: 'Error',
        message: 'Failed to remove job. Please try again.',
        type: 'error'
      });
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

  const getJobStatusBadge = (job) => {
    if (job.has_completion_request > 0) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
          <AlertCircle className="w-3 h-3 mr-1" />
          Completion Pending
        </Badge>
      );
    }
    
    switch (job.job_status) {
      case 'completed':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-300">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-300">
            <Clock className="w-3 h-3 mr-1" />
            In Progress
          </Badge>
        );
      default:
        return (
          <Badge className="bg-purple-100 text-purple-800 border-purple-300">
            Active
          </Badge>
        );
    }
  };

  const getBudgetDisplay = (job) => {
    if (job.budgetType === 'hourly' && job.hourlyRateMin && job.hourlyRateMax) {
      return `$${job.hourlyRateMin}-$${job.hourlyRateMax}/hr`;
    } else if (job.budgetType === 'fixed' && job.fixedBudget) {
      return `$${job.fixedBudget} fixed`;
    }
    return 'Budget TBD';
  };

  const filteredJobs = jobs.filter(job => {
    if (filter === 'all') return true;
    if (filter === 'active') return job.job_status === 'open';
    if (filter === 'completed') return job.job_status === 'completed';
    if (filter === 'completion_pending') return job.has_completion_request > 0;
    return true;
  });

  const stats = {
    total: jobs.length,
    active: jobs.filter(j => j.job_status === 'open').length,
    completed: jobs.filter(j => j.job_status === 'completed').length,
    completionPending: jobs.filter(j => j.has_completion_request > 0).length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Secondary Navigation */}
      <SecondaryNav />

      <div className="container mx-auto px-4 py-8">
        {/* Header with Tabs */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Jobs</h1>
          <p className="text-muted-foreground mb-4">
            {activeTab === 'accepted' ? 'Jobs where your application has been accepted' : 'Jobs you have saved for later'}
          </p>
          
          {/* Tab Switcher */}
          <div className="flex gap-2">
            <Button
              variant="ghost"
              className={`rounded-none ${activeTab === 'accepted' ? 'text-primary' : 'border-transparent'}`}
              onClick={() => setActiveTab('accepted')}
            >
              <Briefcase className="w-4 h-4 mr-2" />
              Accepted Jobs
            </Button>
            <Button
              variant="ghost"
              className={`rounded-none ${activeTab === 'saved' ? 'border-primary text-primary' : 'border-transparent'}`}
              onClick={() => setActiveTab('saved')}
            >
              <Bookmark className="w-4 h-4 mr-2" />
              Saved Jobs ({savedJobs.length})
            </Button>
          </div>
        </div>

        {/* Stats Overview - Only show for accepted jobs */}
        {activeTab === 'accepted' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-8">
          <Card>
            <CardContent className="pt-3 sm:pt-4 md:pt-6 px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1 truncate">Total Jobs</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold">{stats.total}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                  <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-3 sm:pt-4 md:pt-6 px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1 truncate">Active Jobs</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold">{stats.active}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-3 sm:pt-4 md:pt-6 px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1 truncate">Pending Completion</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold">{stats.completionPending}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                  <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-3 sm:pt-4 md:pt-6 px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1 truncate">Completed</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold">{stats.completed}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        )}

        {/* Filter Tabs - Only show for accepted jobs */}
        {activeTab === 'accepted' && (
        <div className="flex gap-2 mb-6">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All ({stats.total})
          </Button>
          <Button
            variant={filter === 'active' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('active')}
          >
            Active ({stats.active})
          </Button>
          <Button
            variant={filter === 'completion_pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('completion_pending')}
          >
            Pending Completion ({stats.completionPending})
          </Button>
          <Button
            variant={filter === 'completed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('completed')}
          >
            Completed ({stats.completed})
          </Button>
        </div>
        )}

        {/* Jobs List */}
        {activeTab === 'accepted' ? (
        loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your jobs...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {filter === 'all' ? 'No accepted jobs yet' : `No ${filter.replace('_', ' ')} jobs`}
              </h3>
              <p className="text-muted-foreground mb-6">
                {filter === 'all' 
                  ? 'Jobs where your application has been accepted will appear here'
                  : 'Try changing the filter to see other jobs'
                }
              </p>
              {filter === 'all' && (
                <Button asChild>
                  <Link to="/browse-jobs">Browse Jobs</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <Card key={job.job_id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold">{job.title}</h3>
                        {getJobStatusBadge(job)}
                        {job.projectType && (
                          <Badge variant="secondary">
                            {job.projectType}
                          </Badge>
                        )}
                      </div>
                      
                      {/* Employer Info */}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <Building className="w-4 h-4" />
                        <span className="font-medium">
                          {job.employer_business_name || job.employer_name}
                        </span>
                      </div>

                      {/* Completion Request Alert */}
                      {job.has_completion_request > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-yellow-900">
                                Completion Request Received
                              </p>
                              <p className="text-xs text-yellow-700 mt-1">
                                The employer has marked this job as completed. Please review and confirm in messages.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-4">
                        {job.workLocation && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{job.workLocation}</span>
                          </div>
                        )}
                        {job.projectLength && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{job.projectLength}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          <span>{getBudgetDisplay(job)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Accepted {getTimeAgo(job.applied_at)}</span>
                        </div>
                      </div>
                      
                      <p className="text-muted-foreground mb-4 line-clamp-2">
                        {job.description}
                      </p>
                      
                      {job.category && (
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">
                            {job.category}
                          </Badge>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => navigate(`/jobs/${job.job_id}`)}
                      >
                        <Eye className="w-4 h-4" />
                        View Job
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        className="gap-2"
                        onClick={() => navigate('/messages')}
                      >
                        <MessageSquare className="w-4 h-4" />
                        Message
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
        ) : (
          /* Saved Jobs Section */
          savedJobs.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Bookmark className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No saved jobs yet</h3>
                <p className="text-muted-foreground mb-6">
                  Browse jobs and click the bookmark icon to save them for later
                </p>
                <Button onClick={() => navigate('/browse-jobs')}>
                  Browse Jobs
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {savedJobs.map((job) => (
                <Card 
                  key={job.id} 
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/jobs/${job.id}`)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
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

                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-lg font-semibold text-foreground hover:text-primary">
                              {job.title}
                            </h3>
                            <p className="text-muted-foreground">
                              {job.poster_business_name || job.poster_name || `User ${job.user_id}`}
                            </p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUnsaveJob(job.id);
                            }}
                            className="text-primary"
                          >
                            <Bookmark className="w-5 h-5 fill-current" />
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

                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {job.workLocation || 'Remote'}
                          </div>
                          {job.budgetType === 'hourly' && job.hourlyRateMin && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              ${job.hourlyRateMin}-${job.hourlyRateMax}/hr
                            </div>
                          )}
                          {job.budgetType === 'fixed' && job.fixedBudget && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              ${job.fixedBudget}
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {job.created_at ? new Date(job.created_at).toLocaleDateString() : ''}
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {job.description}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {(job.requiredSkills || job.tags || []).slice(0, 5).map((tag, index) => (
                            <Badge key={index} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            {job.experienceLevel && <span>{formatExperienceLevel(job.experienceLevel)}</span>}
                            {job.weeklyHours && <span>{formatWeeklyHours(job.weeklyHours)}</span>}
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/jobs/${job.id}`);
                              }}
                            >
                              View Details
                            </Button>
                            <Button 
                              size="sm" 
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/jobs/${job.id}/apply`);
                              }}
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
          )
        )}
      </div>

      <Footer />
      <ModalComponent />
    </div>
  );
};

export default MyJobs;
