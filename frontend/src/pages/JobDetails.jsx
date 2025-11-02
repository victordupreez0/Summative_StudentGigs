import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useModal } from "@/components/ui/modal";
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  DollarSign, 
  Users,
  Calendar,
  Briefcase,
  Edit,
  Trash2
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import AuthContext from '@/context/AuthContext';
import API_BASE from '@/config/api';

const JobDetails = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useContext(AuthContext);
  const { showAlert, showConfirm, ModalComponent } = useModal();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    fetchJob();
    if (user && token) {
      fetchApplications();
    }
  }, [jobId, user, token]);

  const fetchJob = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/jobs/${jobId}`);
      if (!res.ok) {
        console.error('Failed to fetch job');
        return;
      }
      const data = await res.json();
      setJob(data);
    } catch (err) {
      console.error('Error fetching job:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/jobs/${jobId}/applications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
    }
  };

  const handleDelete = async () => {
    const confirmed = await showConfirm({
      title: 'Delete Job',
      message: 'Are you sure you want to delete this job? This action cannot be undone.',
      type: 'error'
    });

    if (!confirmed) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/jobs/${jobId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        await showAlert({
          title: 'Success',
          message: 'Job deleted successfully',
          type: 'success'
        });
        navigate('/dashboard');
      } else {
        const data = await res.json();
        await showAlert({
          title: 'Error',
          message: data.error || 'Failed to delete job',
          type: 'error'
        });
      }
    } catch (err) {
      console.error('Error deleting job:', err);
      await showAlert({
        title: 'Network Error',
        message: 'Unable to connect to the server. Please try again.',
        type: 'error'
      });
    }
  };

  const handleApply = async () => {
    if (!user) {
      await showAlert({
        title: 'Login Required',
        message: 'Please log in to apply for jobs',
        type: 'info'
      });
      return;
    }
    if (user.userType !== 'student') {
      await showAlert({
        title: 'Access Denied',
        message: 'Only students can apply for jobs',
        type: 'error'
      });
      return;
    }
    navigate(`/jobs/${jobId}/apply`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-gray-600">Loading...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-gray-900">Job not found</p>
          <Button asChild className="mt-4 bg-gray-900 hover:bg-gray-800">
            <Link to="/browse-jobs">Back to Jobs</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const isOwner = user && job.user_id === user.id;
  const isStudent = user && user.userType === 'student';
  const isEmployer = user && user.userType === 'employer';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          {isOwner && (
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link to={`/jobs/${jobId}/edit`}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Link>
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-3xl mb-2">{job.title}</CardTitle>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant={job.poster_type === 'employer' ? 'default' : 'secondary'}>
                        {job.poster_type === 'employer' ? 'Business' : 'Student'} Job
                      </Badge>
                      <Badge variant="outline">{job.category || 'General'}</Badge>
                      {job.projectType && <Badge variant="outline">{job.projectType}</Badge>}
                    </div>
                    <p className="text-muted-foreground">
                      Posted by {job.poster_business_name || job.poster_name}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Description */}
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Job Description</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{job.description}</p>
                  </div>

                  {/* Job Details */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-4 border-y">
                    {job.workLocation && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Location</p>
                          <p className="font-medium">{job.workLocation}</p>
                        </div>
                      </div>
                    )}
                    {job.projectLength && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Duration</p>
                          <p className="font-medium">{job.projectLength}</p>
                        </div>
                      </div>
                    )}
                    {job.weeklyHours && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Time Commitment</p>
                          <p className="font-medium">{job.weeklyHours}</p>
                        </div>
                      </div>
                    )}
                    {job.studentCount && (
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Positions</p>
                          <p className="font-medium">{job.studentCount}</p>
                        </div>
                      </div>
                    )}
                    {job.experienceLevel && (
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Level</p>
                          <p className="font-medium capitalize">{job.experienceLevel}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Skills */}
                  {job.requiredSkills && job.requiredSkills.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Required Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {job.requiredSkills.map((skill, idx) => (
                          <Badge key={idx} variant="secondary">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Education */}
                  {job.educationLevels && job.educationLevels.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Education Requirements</h3>
                      <div className="flex flex-wrap gap-2">
                        {job.educationLevels.map((level, idx) => (
                          <Badge key={idx} variant="outline">{level}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Majors */}
                  {job.preferredMajors && job.preferredMajors.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Preferred Majors</h3>
                      <div className="flex flex-wrap gap-2">
                        {job.preferredMajors.map((major, idx) => (
                          <Badge key={idx} variant="outline">{major}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Languages */}
                  {job.languages && job.languages.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Languages</h3>
                      <div className="flex flex-wrap gap-2">
                        {job.languages.map((lang, idx) => (
                          <Badge key={idx} variant="outline">{lang}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {job.tags && job.tags.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {job.tags.map((tag, idx) => (
                          <Badge key={idx}>{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Applications (for job owner) */}
            {isOwner && applications.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Applications ({applications.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {applications.map((app) => (
                      <div key={app.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold">{app.name}</p>
                            <p className="text-sm text-muted-foreground">{app.email}</p>
                            <p className="text-sm mt-2">{app.cover_letter}</p>
                          </div>
                          <Badge>{app.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Budget Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Compensation
                </CardTitle>
              </CardHeader>
              <CardContent>
                {job.budgetType === 'hourly' ? (
                  <div>
                    <p className="text-2xl font-bold">
                      ${job.hourlyRateMin} - ${job.hourlyRateMax}/hr
                    </p>
                    {job.paymentSchedule && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Paid {job.paymentSchedule}
                      </p>
                    )}
                  </div>
                ) : job.fixedBudget ? (
                  <div>
                    <p className="text-2xl font-bold">${job.fixedBudget}</p>
                    <p className="text-sm text-muted-foreground">Fixed Price</p>
                    {job.paymentSchedule && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Payment: {job.paymentSchedule}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Not specified</p>
                )}
              </CardContent>
            </Card>

            {/* Apply Button */}
            {isStudent && !isOwner && (
              <Card>
                <CardContent className="pt-6">
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleApply}
                  >
                    Apply Now
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Posted Date */}
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">
                  Posted {new Date(job.created_at).toLocaleDateString()}
                </p>
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

export default JobDetails;
