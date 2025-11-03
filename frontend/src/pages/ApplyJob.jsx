import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useModal } from "@/components/ui/modal";
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  DollarSign, 
  Users,
  Calendar,
  Briefcase,
  FileText,
  ExternalLink,
  CheckCircle2
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { UserAvatar } from "@/components/UserAvatar";
import AuthContext from '@/context/AuthContext';
import API_BASE from '@/config/api';

const ApplyJob = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useContext(AuthContext);
  const { showAlert, ModalComponent } = useModal();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  
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
  
  // Application form state
  const [formData, setFormData] = useState({
    coverLetter: "",
    resumeUrl: "",
    portfolioUrl: "",
    availability: "",
    expectedRate: ""
  });

  useEffect(() => {
    if (!user || user.userType !== 'student') {
      (async () => {
        await showAlert({
          title: 'Access Denied',
          message: 'Only students can apply for jobs',
          type: 'error'
        });
        navigate('/browse-jobs');
      })();
      return;
    }
    fetchJob();
  }, [jobId, user, navigate]);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!token) {
      await showAlert({
        title: 'Login Required',
        message: 'Please log in to apply',
        type: 'info'
      });
      return;
    }

    setApplying(true);
    try {
      const res = await fetch(`${API_BASE}/api/applications/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        await showAlert({
          title: 'Success',
          message: 'Application submitted successfully!',
          type: 'success'
        });
        navigate('/applications');
      } else {
        await showAlert({
          title: 'Error',
          message: data.error || 'Failed to submit application',
          type: 'error'
        });
      }
    } catch (err) {
      console.error('Application error:', err);
      await showAlert({
        title: 'Network Error',
        message: 'Unable to connect to the server. Please try again.',
        type: 'error'
      });
    } finally {
      setApplying(false);
    }
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Application Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Apply for this position</CardTitle>
                <p className="text-muted-foreground">
                  Complete the form below to submit your application
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Cover Letter */}
                  <div>
                    <label htmlFor="coverLetter" className="block text-sm font-medium mb-2">
                      Cover Letter <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      id="coverLetter"
                      name="coverLetter"
                      placeholder="Tell the employer why you're interested in this position and what makes you a great fit..."
                      value={formData.coverLetter}
                      onChange={handleChange}
                      rows={6}
                      required
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Highlight your relevant skills and experience
                    </p>
                  </div>

                  {/* Resume URL */}
                  <div>
                    <label htmlFor="resumeUrl" className="block text-sm font-medium mb-2">
                      Resume/CV Link (Optional)
                    </label>
                    <Input
                      id="resumeUrl"
                      name="resumeUrl"
                      type="url"
                      placeholder="https://drive.google.com/... or https://linkedin.com/in/..."
                      value={formData.resumeUrl}
                      onChange={handleChange}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Provide a link to your resume (Google Drive, Dropbox, LinkedIn, etc.)
                    </p>
                  </div>

                  {/* Portfolio URL */}
                  <div>
                    <label htmlFor="portfolioUrl" className="block text-sm font-medium mb-2">
                      Portfolio/Website (Optional)
                    </label>
                    <Input
                      id="portfolioUrl"
                      name="portfolioUrl"
                      type="url"
                      placeholder="https://yourportfolio.com or https://github.com/yourusername"
                      value={formData.portfolioUrl}
                      onChange={handleChange}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Share your portfolio, GitHub, or personal website
                    </p>
                  </div>

                  {/* Availability */}
                  <div>
                    <label htmlFor="availability" className="block text-sm font-medium mb-2">
                      Availability <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="availability"
                      name="availability"
                      placeholder="e.g., Immediately, Starting next month, Weekends only, 20 hours/week"
                      value={formData.availability}
                      onChange={handleChange}
                      required
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      When are you available to start and how many hours can you commit?
                    </p>
                  </div>

                  {/* Expected Rate */}
                  <div>
                    <label htmlFor="expectedRate" className="block text-sm font-medium mb-2">
                      Expected Rate <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="expectedRate"
                      name="expectedRate"
                      placeholder="e.g., $25/hour, $500/project, Negotiable"
                      value={formData.expectedRate}
                      onChange={handleChange}
                      required
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Your desired compensation for this position
                    </p>
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-3 pt-4">
                    <Button 
                      type="button"
                      variant="outline" 
                      onClick={() => navigate(-1)}
                      disabled={applying}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      disabled={applying}
                      className="flex-1"
                    >
                      {applying ? 'Submitting...' : 'Submit Application'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Job Details Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">{job.title}</CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <UserAvatar
                    user={{
                      name: job.poster_business_name || job.poster_name || 'User',
                      profilePicture: job.poster_profile_picture,
                      avatarColor: job.poster_avatar_color
                    }}
                    size="sm"
                  />
                  <div>
                    <p className="font-medium text-foreground">
                      {job.poster_business_name || job.poster_name || `User ${job.user_id}`}
                    </p>
                    <Badge variant={job.poster_type === 'employer' ? 'default' : 'secondary'} className="text-xs">
                      {job.poster_type === 'employer' ? '🏢 Business' : '🎓 Student'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Job Details */}
                <div className="space-y-3 text-sm">
                  {job.workLocation && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Location</p>
                        <p className="text-muted-foreground">{job.workLocation}</p>
                      </div>
                    </div>
                  )}

                  {(job.budgetType === 'hourly' && job.hourlyRateMin) && (
                    <div className="flex items-start gap-2">
                      <DollarSign className="w-4 h-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Hourly Rate</p>
                        <p className="text-muted-foreground">
                          ${job.hourlyRateMin}-${job.hourlyRateMax}/hr
                        </p>
                      </div>
                    </div>
                  )}

                  {(job.budgetType === 'fixed' && job.fixedBudget) && (
                    <div className="flex items-start gap-2">
                      <DollarSign className="w-4 h-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Project Budget</p>
                        <p className="text-muted-foreground">${job.fixedBudget}</p>
                      </div>
                    </div>
                  )}

                  {job.projectType && (
                    <div className="flex items-start gap-2">
                      <Briefcase className="w-4 h-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Project Type</p>
                        <p className="text-muted-foreground">{job.projectType}</p>
                      </div>
                    </div>
                  )}

                  {job.projectLength && (
                    <div className="flex items-start gap-2">
                      <Clock className="w-4 h-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Duration</p>
                        <p className="text-muted-foreground">{job.projectLength}</p>
                      </div>
                    </div>
                  )}

                  {job.weeklyHours && (
                    <div className="flex items-start gap-2">
                      <Clock className="w-4 h-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Time Commitment</p>
                        <p className="text-muted-foreground">{formatWeeklyHours(job.weeklyHours)}</p>
                      </div>
                    </div>
                  )}

                  {job.experienceLevel && (
                    <div className="flex items-start gap-2">
                      <Users className="w-4 h-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Experience Level</p>
                        <p className="text-muted-foreground">{formatExperienceLevel(job.experienceLevel)}</p>
                      </div>
                    </div>
                  )}

                  {job.created_at && (
                    <div className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Posted</p>
                        <p className="text-muted-foreground">
                          {new Date(job.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* View Full Details Link */}
                <div className="pt-4 border-t">
                  <Button variant="outline" asChild className="w-full">
                    <Link to={`/jobs/${jobId}`}>
                      <FileText className="w-4 h-4 mr-2" />
                      View Full Job Details
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Application Tips Card */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  Application Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-blue-900">
                <p>✓ Customize your cover letter for this specific role</p>
                <p>✓ Make sure your resume link is accessible</p>
                <p>✓ Highlight relevant coursework and projects</p>
                <p>✓ Be specific about your availability</p>
                <p>✓ Proofread before submitting</p>
              </CardContent>
            </Card>

            {/* Required Skills */}
            {job.requiredSkills && job.requiredSkills.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Required Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {job.requiredSkills.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Footer />
      <ModalComponent />
    </div>
  );
};

export default ApplyJob;
