import { useState, useEffect, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Search, 
  Filter, 
  Clock, 
  DollarSign, 
  Briefcase,
  Send,
  FileText,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import AuthContext from '@/context/AuthContext';
import API_BASE from '@/config/api';

const Applications = () => {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, accepted, rejected

  useEffect(() => {
    if (!user || !token) {
      navigate('/login');
      return;
    }
    fetchApplications();
  }, [user, token, navigate]);

  const fetchApplications = async () => {
    try {
      console.log('Fetching applications from:', `${API_BASE}/api/applications/my-applications`);
      console.log('Token:', token ? 'Present' : 'Missing');
      
      const res = await fetch(`${API_BASE}/api/applications/my-applications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Response status:', res.status);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('Failed to fetch applications:', errorData);
        return;
      }
      
      const data = await res.json();
      console.log('Applications fetched:', data.length, 'applications');
      console.log('Applications data:', data);
      setApplications(data);
    } catch (err) {
      console.error('Failed to load applications', err);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawApplication = async (applicationId) => {
    if (!confirm('Are you sure you want to withdraw this application? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/applications/${applicationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        alert('Application withdrawn successfully');
        // Refresh the applications list
        fetchApplications();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to withdraw application');
      }
    } catch (err) {
      console.error('Error withdrawing application:', err);
      alert('Network error. Please try again.');
    }
  };

  const handleViewJobDetails = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'accepted':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'accepted':
        return 'success';
      case 'rejected':
        return 'outline';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Pending Review';
      case 'accepted':
        return 'Accepted';
      case 'rejected':
        return 'Not Selected';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-gray-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Secondary Navigation */}
      <div className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-8 h-16">
            <Link 
              to="/browse-jobs" 
              className="text-sm font-medium text-gray-600 hover:text-gray-900 py-5"
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
              to="/student-dashboard" 
              className="text-sm font-medium text-gray-600 hover:text-gray-900 py-5"
            >
              Dashboard
            </Link>
            <Link 
              to="/my-jobs" 
              className="text-sm font-medium text-gray-600 hover:text-gray-900 py-5"
            >
              My Jobs
            </Link>
            <Link 
              to="/applications" 
              className="text-sm font-medium text-gray-900 border-b-2 border-purple-600 py-2"
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
              className="text-sm font-medium text-gray-600 hover:text-gray-900 py-5"
            >
              Profile
            </Link>
          </nav>
        </div>
      </div>
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-gray-900">My Applications</h1>
            <p className="text-gray-600">
              Track all your job applications in one place
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Send className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
                  <p className="text-sm text-gray-600">Total Applications</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {applications.filter(a => a.status === 'pending').length}
                  </p>
                  <p className="text-sm text-gray-600">Pending Review</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {applications.filter(a => a.status === 'accepted').length}
                  </p>
                  <p className="text-sm text-gray-600">Accepted</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {applications.filter(a => a.status === 'rejected').length}
                  </p>
                  <p className="text-sm text-gray-600">Not Selected</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
              className={filter === 'all' ? 'bg-gray-900 hover:bg-gray-800' : ''}
            >
              All ({applications.length})
            </Button>
            <Button
              variant={filter === 'pending' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('pending')}
              className={filter === 'pending' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
            >
              Pending ({applications.filter(a => a.status === 'pending').length})
            </Button>
            <Button
              variant={filter === 'accepted' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('accepted')}
              className={filter === 'accepted' ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              Accepted ({applications.filter(a => a.status === 'accepted').length})
            </Button>
            <Button
              variant={filter === 'rejected' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('rejected')}
              className={filter === 'rejected' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              Not Selected ({applications.filter(a => a.status === 'rejected').length})
            </Button>
          </div>
        </div>

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <Card className="border-gray-200 bg-white">
            <CardContent className="py-16 text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2 text-gray-900">
                {filter === 'all' ? 'No applications yet' : `No ${filter} applications`}
              </h3>
              <p className="text-gray-600 mb-6">
                {filter === 'all' 
                  ? 'Start applying to jobs to see them here' 
                  : `You don't have any ${filter} applications`}
              </p>
              <Button asChild className="bg-gray-900 hover:bg-gray-800">
                <Link to="/browse-jobs">Browse Jobs</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((application) => (
              <Card key={application.id} className="overflow-hidden border-gray-200 bg-white hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-2">
                        <div className="mt-1">
                          {getStatusIcon(application.status)}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 mb-1">{application.job_title}</h3>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              Applied {new Date(application.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </div>
                            {application.category && (
                              <div className="flex items-center gap-1">
                                <Briefcase className="w-4 h-4" />
                                {application.category}
                              </div>
                            )}
                          </div>
                        </div>
                        <Badge 
                          variant={getStatusVariant(application.status)}
                          className={
                            application.status === 'pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' :
                            application.status === 'accepted' ? 'bg-green-100 text-green-700 border-green-300' :
                            application.status === 'rejected' ? 'bg-red-100 text-red-700 border-red-300' :
                            ''
                          }
                        >
                          {getStatusText(application.status)}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Application Details */}
                  {application.cover_letter && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
                      <h4 className="font-semibold text-sm mb-2 text-gray-900">Your Proposal</h4>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {application.cover_letter}
                      </p>
                    </div>
                  )}

                  {/* Job Description */}
                  {application.description && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-sm mb-2 text-gray-900">Job Description</h4>
                      <p className="text-sm text-gray-700">
                        {application.description}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t border-gray-200">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-gray-700"
                      onClick={() => handleViewJobDetails(application.job_id)}
                    >
                      View Job Details
                    </Button>
                    {application.status === 'accepted' && (
                      <Button size="sm" className="bg-gray-900 hover:bg-gray-800">
                        Message Employer
                      </Button>
                    )}
                    {application.status === 'pending' && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600 border-red-300 hover:bg-red-50"
                        onClick={() => handleWithdrawApplication(application.id)}
                      >
                        Withdraw Application
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Applications;
