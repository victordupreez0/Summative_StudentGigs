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
  MessageSquare
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import AuthContext from '@/context/AuthContext';
import API_BASE from '@/config/api';

const MyJobs = () => {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const { showAlert, ModalComponent } = useModal();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, active, completed, completion_pending

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
      <div className="border-b border-gray-200">
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-8 h-16">
            <Link 
              to="/browse-jobs" 
              className="text-sm font-medium text-muted-foreground hover:text-primary py-2"
            >
              Browse Jobs
            </Link>
            <Link 
              to="/open-jobs" 
              className="text-sm font-medium text-muted-foreground hover:text-primary py-2"
            >
              Open Jobs
            </Link>
            <Link 
              to="/student-dashboard" 
              className="text-sm font-medium text-muted-foreground hover:text-primary py-5"
            >
              Dashboard
            </Link>
            <Link 
              to="/my-jobs" 
              className="text-sm font-medium text-primary border-b-2 border-primary py-5"
            >
              My Jobs
            </Link>
            <Link 
              to="/applications" 
              className="text-sm font-medium text-muted-foreground hover:text-primary py-5"
            >
              Applications
            </Link>
            <Link 
              to="/applicants" 
              className="text-sm font-medium text-muted-foreground hover:text-primary py-5"
            >
              Applicants
            </Link>
            <Link 
              to="/messages" 
              className="text-sm font-medium text-muted-foreground hover:text-primary py-5"
            >
              Messages
            </Link>
            <Link 
              to="/profile" 
              className="text-sm font-medium text-muted-foreground hover:text-primary py-5"
            >
              Profile
            </Link>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Jobs</h1>
          <p className="text-muted-foreground">
            Jobs where your application has been accepted
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Jobs</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Active Jobs</p>
                  <p className="text-3xl font-bold">{stats.active}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Pending Completion</p>
                  <p className="text-3xl font-bold">{stats.completionPending}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Completed</p>
                  <p className="text-3xl font-bold">{stats.completed}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Tabs */}
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

        {/* Jobs List */}
        {loading ? (
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
        )}
      </div>

      <Footer />
      <ModalComponent />
    </div>
  );
};

export default MyJobs;
