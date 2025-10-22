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

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

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
      const res = await fetch(`${API_BASE}/api/applications/my-applications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) {
        console.error('Failed to fetch applications');
        return;
      }
      
      const data = await res.json();
      setApplications(data);
    } catch (err) {
      console.error('Failed to load applications', err);
    } finally {
      setLoading(false);
    }
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
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Header */}
      <div className="bg-gradient-hero text-primary-foreground">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="ghost" 
              size="icon"
              className="text-primary-foreground hover:bg-primary-foreground/20"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold mb-2">My Applications</h1>
              <p className="text-primary-foreground/90">
                Track all your job applications in one place
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Send className="w-8 h-8" />
                <div>
                  <p className="text-2xl font-bold">{applications.length}</p>
                  <p className="text-sm text-primary-foreground/80">Total Applications</p>
                </div>
              </div>
            </div>
            <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-8 h-8 text-yellow-400" />
                <div>
                  <p className="text-2xl font-bold">
                    {applications.filter(a => a.status === 'pending').length}
                  </p>
                  <p className="text-sm text-primary-foreground/80">Pending Review</p>
                </div>
              </div>
            </div>
            <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-2xl font-bold">
                    {applications.filter(a => a.status === 'accepted').length}
                  </p>
                  <p className="text-sm text-primary-foreground/80">Accepted</p>
                </div>
              </div>
            </div>
            <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3">
                <XCircle className="w-8 h-8 text-red-400" />
                <div>
                  <p className="text-2xl font-bold">
                    {applications.filter(a => a.status === 'rejected').length}
                  </p>
                  <p className="text-sm text-primary-foreground/80">Not Selected</p>
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
              variant={filter === 'all' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All ({applications.length})
            </Button>
            <Button
              variant={filter === 'pending' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter('pending')}
            >
              Pending ({applications.filter(a => a.status === 'pending').length})
            </Button>
            <Button
              variant={filter === 'accepted' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter('accepted')}
            >
              Accepted ({applications.filter(a => a.status === 'accepted').length})
            </Button>
            <Button
              variant={filter === 'rejected' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter('rejected')}
            >
              Not Selected ({applications.filter(a => a.status === 'rejected').length})
            </Button>
          </div>
        </div>

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold mb-2">
                {filter === 'all' ? 'No applications yet' : `No ${filter} applications`}
              </h3>
              <p className="text-muted-foreground mb-6">
                {filter === 'all' 
                  ? 'Start applying to jobs to see them here' 
                  : `You don't have any ${filter} applications`}
              </p>
              <Button asChild>
                <Link to="/browse-jobs">Browse Jobs</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((application) => (
              <Card key={application.id} hover={true} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(application.status)}
                        <h3 className="text-xl font-semibold">{application.job_title}</h3>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Applied {new Date(application.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                        <div className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          {application.category || 'General'}
                        </div>
                      </div>
                      <Badge variant={getStatusVariant(application.status)}>
                        {getStatusText(application.status)}
                      </Badge>
                    </div>
                  </div>

                  {/* Application Details */}
                  {application.cover_letter && (
                    <div className="bg-slate-50 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold text-sm mb-2">Your Proposal</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {application.cover_letter}
                      </p>
                    </div>
                  )}

                  {/* Job Description */}
                  {application.description && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-sm mb-2">Job Description</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {application.description}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button variant="outline" size="sm">
                      View Job Details
                    </Button>
                    {application.status === 'accepted' && (
                      <Button size="sm">
                        Message Employer
                      </Button>
                    )}
                    {application.status === 'pending' && (
                      <Button variant="outline" size="sm">
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
