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
  Eye,
  Edit,
  Trash2,
  Plus
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import AuthContext from '@/context/AuthContext';
import API_BASE from '@/config/api';

const OpenJobs = () => {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const { showAlert, showConfirm, ModalComponent } = useModal();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);

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

  const getApplicantCount = (jobId) => {
    return applications.filter(app => app.job_id === jobId).length;
  };

  const handleDeleteJob = async (jobId) => {
    const confirmed = await showConfirm({
      title: 'Delete Job',
      message: 'Are you sure you want to delete this job posting?',
      type: 'error'
    });

    if (!confirmed) return;
    
    try {
      const res = await fetch(`${API_BASE}/api/jobs/${jobId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        setJobs(jobs.filter(job => job.id !== jobId));
        await showAlert({
          title: 'Success',
          message: 'Job deleted successfully',
          type: 'success'
        });
      } else {
        await showAlert({
          title: 'Error',
          message: 'Failed to delete job',
          type: 'error'
        });
      }
    } catch (err) {
      console.error('Failed to delete job', err);
      await showAlert({
        title: 'Network Error',
        message: 'Unable to connect to the server. Please try again.',
        type: 'error'
      });
    }
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
              className="text-sm font-medium text-primary border-b-2 border-primary py-2"
            >
              Open Jobs
            </Link>
            {user?.userType === 'employer' ? (
              <>
                <Link 
                  to="/employer-dashboard" 
                  className="text-sm font-medium text-muted-foreground hover:text-primary py-5"
                >
                  Dashboard
                </Link>
                <Link 
                  to="/applicants" 
                  className="text-sm font-medium text-muted-foreground hover:text-primary py-5"
                >
                  Applicants
                </Link>
              </>
            ) : (
              <>
                <Link 
                  to="/student-dashboard" 
                  className="text-sm font-medium text-muted-foreground hover:text-primary py-5"
                >
                  Dashboard
                </Link>
                <Link 
                  to="/my-jobs" 
                  className="text-sm font-medium text-muted-foreground hover:text-primary py-5"
                >
                  My Jobs
                </Link>
                <Link 
                  to="/applications" 
                  className="text-sm font-medium text-muted-foreground hover:text-primary py-5"
                >
                  Applications
                </Link>
              </>
            )}
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Open Jobs</h1>
            <p className="text-muted-foreground">
              Manage your job postings and track applications
            </p>
          </div>
          <Button asChild size="lg" className="gap-2">
            <Link to="/post-job">
              <Plus className="w-4 h-4" />
              Post New Job
            </Link>
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Jobs</p>
                  <p className="text-3xl font-bold">{jobs.length}</p>
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
                  <p className="text-sm text-muted-foreground mb-1">Total Applications</p>
                  <p className="text-3xl font-bold">{applications.length}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Avg Applications</p>
                  <p className="text-3xl font-bold">
                    {jobs.length > 0 ? Math.round(applications.length / jobs.length) : 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Jobs List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your jobs...</p>
          </div>
        ) : jobs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No jobs posted yet</h3>
              <p className="text-muted-foreground mb-6">
                Start by posting your first job to attract talented students
              </p>
              <Button asChild>
                <Link to="/post-job">Post Your First Job</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold">{job.title}</h3>
                        <Badge variant="secondary">
                          {job.projectType || 'Remote'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{job.location || 'Remote'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{job.projectLength || 'Flexible'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Posted {getTimeAgo(job.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>{getApplicantCount(job.id)} applicants</span>
                        </div>
                      </div>
                      
                      <p className="text-muted-foreground mb-4 line-clamp-2">
                        {job.description}
                      </p>
                      
                      {job.tags && job.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {job.tags.map((tag, index) => (
                            <Badge key={index} variant="outline">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => navigate(`/jobs/${job.id}`)}
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => navigate(`/jobs/${job.id}/edit`)}
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="gap-2"
                        onClick={() => handleDeleteJob(job.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
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
      {ModalComponent}
    </div>
  );
};

export default OpenJobs;
