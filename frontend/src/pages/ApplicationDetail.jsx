import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useModal } from "@/components/ui/modal";
import { 
  ArrowLeft,
  Mail,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  ExternalLink,
  CheckCircle,
  XCircle,
  User,
  Briefcase,
  MapPin,
  Link as LinkIcon
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import AuthContext from '@/context/AuthContext';
import API_BASE from '@/config/api';

const ApplicationDetail = () => {
  const { applicationId } = useParams();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const { showAlert, ModalComponent } = useModal();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchApplicationDetail();
  }, [applicationId, token]);

  const fetchApplicationDetail = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/applications/${applicationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) {
        if (res.status === 404) {
          await showAlert({
            title: 'Application Not Found',
            message: 'The application you are looking for does not exist or has been removed.',
            type: 'error'
          });
          navigate('/applicants');
          return;
        }
        if (res.status === 403) {
          await showAlert({
            title: 'Access Denied',
            message: 'You do not have permission to view this application.',
            type: 'error'
          });
          navigate('/applicants');
          return;
        }
        throw new Error('Failed to fetch application');
      }
      
      const data = await res.json();
      setApplication(data);
    } catch (err) {
      console.error('Failed to load application', err);
      await showAlert({
        title: 'Error',
        message: 'Failed to load application details. Please try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (newStatus) => {
    const statusLabels = {
      'accepted': 'accept',
      'rejected': 'reject'
    };

    const confirmed = await showAlert({
      title: `${statusLabels[newStatus].charAt(0).toUpperCase() + statusLabels[newStatus].slice(1)} Application`,
      message: `Are you sure you want to ${statusLabels[newStatus]} this application from ${application.name}?`,
      type: 'confirm'
    });

    if (!confirmed) return;

    setUpdating(true);
    try {
      const res = await fetch(`${API_BASE}/api/applications/${applicationId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) {
        throw new Error('Failed to update status');
      }

      await showAlert({
        title: 'Success',
        message: `Application ${statusLabels[newStatus]}ed successfully.`,
        type: 'success'
      });

      // Refresh application data
      fetchApplicationDetail();
    } catch (err) {
      console.error('Failed to update status', err);
      await showAlert({
        title: 'Error',
        message: 'Failed to update application status. Please try again.',
        type: 'error'
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleMessageApplicant = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Create or get conversation with the student
      const res = await fetch(`${API_BASE}/api/messages/conversations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          otherUserId: application.user_id,
          jobId: application.job_id
        })
      });

      if (!res.ok) {
        throw new Error('Failed to create conversation');
      }

      // Navigate to messages page
      navigate('/messages');
    } catch (error) {
      console.error('Error creating conversation:', error);
      await showAlert({
        title: 'Error',
        message: 'Failed to start conversation. Please try again.',
        type: 'error'
      });
    }
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const statusMap = {
    'pending': { 
      label: 'Pending Review', 
      color: 'bg-blue-100 text-blue-700 border-blue-200',
      icon: Clock 
    },
    'accepted': { 
      label: 'Accepted', 
      color: 'bg-green-100 text-green-700 border-green-200',
      icon: CheckCircle 
    },
    'rejected': { 
      label: 'Rejected', 
      color: 'bg-gray-100 text-gray-700 border-gray-200',
      icon: XCircle 
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading application details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-gray-600">Application not found</p>
            <Button className="mt-4" onClick={() => navigate('/applicants')}>
              Back to Applicants
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const statusInfo = statusMap[application.status];
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/applicants')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Applicants
        </Button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-6">
              {/* Applicant Avatar */}
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl flex-shrink-0"
                style={{ 
                  backgroundColor: application.profile_picture 
                    ? 'transparent' 
                    : (application.avatar_color || '#6366f1') 
                }}
              >
                {application.profile_picture ? (
                  <img 
                    src={application.profile_picture} 
                    alt={application.name} 
                    className="w-full h-full rounded-full object-cover" 
                  />
                ) : (
                  (application.name?.charAt(0) || 'U').toUpperCase()
                )}
              </div>

              {/* Applicant Info */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {application.name}
                </h1>
                <div className="flex items-center gap-4 text-gray-600 mb-3">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <a href={`mailto:${application.email}`} className="hover:text-purple-600">
                      {application.email}
                    </a>
                  </div>
                </div>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${statusInfo.color}`}>
                  <StatusIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">{statusInfo.label}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {application.status === 'pending' && (
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => updateApplicationStatus('rejected')}
                  disabled={updating}
                  className="border-red-200 text-red-700 hover:bg-red-50"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() => updateApplicationStatus('accepted')}
                  disabled={updating}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Accept
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Applied For */}
            <Card className="border-gray-200 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Applied Position
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {application.job_title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <Badge variant="outline">{application.category}</Badge>
                    <Badge variant="outline">{application.project_type}</Badge>
                  </div>
                </div>
                {application.job_description && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">{application.job_description}</p>
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => navigate(`/jobs/${application.job_id}`)}
                >
                  View Full Job Posting
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Cover Letter */}
            {application.cover_letter && (
              <Card className="border-gray-200 bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Cover Letter
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {application.cover_letter}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Motivation (if different from cover letter) */}
            {application.motivation && application.motivation !== application.cover_letter && (
              <Card className="border-gray-200 bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Motivation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {application.motivation}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Additional Documents */}
            {(application.resume_url || application.portfolio_url) && (
              <Card className="border-gray-200 bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LinkIcon className="w-5 h-5" />
                    Additional Materials
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {application.resume_url && (
                      <a
                        href={application.resume_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Resume / CV</p>
                            <p className="text-sm text-gray-500">View applicant's resume</p>
                          </div>
                        </div>
                        <ExternalLink className="w-5 h-5 text-gray-400" />
                      </a>
                    )}
                    
                    {application.portfolio_url && (
                      <a
                        href={application.portfolio_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Briefcase className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Portfolio</p>
                            <p className="text-sm text-gray-500">View applicant's portfolio</p>
                          </div>
                        </div>
                        <ExternalLink className="w-5 h-5 text-gray-400" />
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Application Details */}
            <Card className="border-gray-200 bg-white">
              <CardHeader>
                <CardTitle>Application Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">Submitted</span>
                  </div>
                  <p className="text-sm text-gray-900 ml-6">
                    {formatDate(application.created_at)}
                  </p>
                  <p className="text-xs text-gray-500 ml-6 mt-1">
                    ({getTimeAgo(application.created_at)})
                  </p>
                </div>

                {application.availability && (
                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">Availability</span>
                    </div>
                    <p className="text-sm text-gray-900 ml-6">
                      {application.availability}
                    </p>
                  </div>
                )}

                {application.expected_rate && (
                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-medium">Expected Rate</span>
                    </div>
                    <p className="text-sm text-gray-900 ml-6">
                      {application.expected_rate}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-gray-200 bg-white">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleMessageApplicant}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Message Applicant
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    // TODO: Add schedule interview functionality
                    showAlert({
                      title: 'Coming Soon',
                      message: 'Interview scheduling functionality will be added soon.',
                      type: 'info'
                    });
                  }}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Interview
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate(`/jobs/${application.job_id}`)}
                >
                  <Briefcase className="w-4 h-4 mr-2" />
                  View Job Posting
                </Button>

                {application.status === 'pending' && (
                  <>
                    <Button
                      className="w-full justify-start bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => updateApplicationStatus('accepted')}
                      disabled={updating}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Accept Application
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="w-full justify-start border-red-200 text-red-700 hover:bg-red-50"
                      onClick={() => updateApplicationStatus('rejected')}
                      disabled={updating}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject Application
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Student Profile Note */}
            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-purple-900 mb-1">
                      Want to learn more?
                    </p>
                    <p className="text-sm text-purple-700 mb-3">
                      View the student's full profile to see their experience, education, and portfolio.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-purple-300 text-purple-700 hover:bg-purple-100"
                      onClick={() => navigate(`/student-profile/${application.user_id}`)}
                    >
                      View Full Profile
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
      <ModalComponent />
    </div>
  );
};

export default ApplicationDetail;
