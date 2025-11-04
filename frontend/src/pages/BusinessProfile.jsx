import { useState, useEffect, useContext, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AuthContext from "@/context/AuthContext";
import API_BASE from "@/config/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  Building2,
  Mail,
  MapPin,
  Calendar,
  Briefcase,
  Users,
  Star,
  TrendingUp,
  Globe,
  Linkedin,
  MessageCircle,
  ExternalLink,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  Award,
  Target,
  Loader2,
  AlertCircle,
  Plus,
  Edit,
  Settings,
  BarChart3,
  Eye
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { SecondaryNav } from "@/components/SecondaryNav";
import { Footer } from "@/components/Footer";

const BusinessProfile = () => {
  const { userId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Profile data state
  const [profileData, setProfileData] = useState({
    businessName: "",
    ownerName: "",
    email: "",
    location: "",
    description: "",
    avatar: "",
    avatarColor: "#1e40af",
    industry: "",
    companySize: "",
    founded: "",
    website: "",
    socialLinks: {
      linkedin: "",
      twitter: "",
      website: ""
    }
  });

  // Statistics
  const [stats, setStats] = useState({
    totalJobsPosted: 0,
    activeJobs: 0,
    completedJobs: 0,
    totalHires: 0,
    averageRating: 0,
    responseRate: 0,
    profileViews: 0
  });

  // Posted jobs
  const [postedJobs, setPostedJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  // Reviews/ratings
  const [reviews, setReviews] = useState([]);

  // Determine if viewing own profile
  const isOwnProfile = useMemo(() => {
    return !userId || (user && parseInt(userId) === parseInt(user.id));
  }, [userId, user?.id]);
  
  const targetUserId = userId || user?.id;

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!targetUserId) {
        setError("User ID not found");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // Fetch user data
        const response = await fetch(`${API_BASE}/api/profiles/${targetUserId}`, {
          headers
        });

        if (!response.ok) {
          throw new Error("Failed to fetch profile");
        }

        const data = await response.json();
        
        // Check if this is an employer account
        if (data.user.userType !== 'employer') {
          // Redirect to student profile
          navigate(`/profile/${targetUserId}`);
          return;
        }

        // Map API response to component state
        setProfileData({
          businessName: data.user.businessName || "Business Name",
          ownerName: data.user.name,
          email: data.user.email,
          location: data.profile?.location || "",
          description: data.profile?.bio || "",
          avatar: data.user.profilePicture || "",
          avatarColor: data.user.avatarColor || "#1e40af",
          industry: data.profile?.industry || "",
          companySize: data.profile?.companySize || "",
          founded: data.profile?.founded || "",
          website: data.profile?.website || "",
          socialLinks: {
            linkedin: data.profile?.social_links?.linkedin || "",
            twitter: data.profile?.social_links?.twitter || "",
            website: data.profile?.social_links?.website || ""
          }
        });

        setStats({
          totalJobsPosted: data.stats?.totalJobsPosted || 0,
          activeJobs: data.stats?.activeJobs || 0,
          completedJobs: data.stats?.completedJobs || 0,
          totalHires: data.stats?.totalHires || 0,
          averageRating: data.stats?.averageRating || 0,
          responseRate: data.stats?.responseRate || 0,
          profileViews: data.profile?.profile_views || 0
        });

        setError(null);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [targetUserId, navigate]);

  // Fetch posted jobs
  useEffect(() => {
    const fetchJobs = async () => {
      if (!targetUserId) return;

      try {
        setLoadingJobs(true);
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const response = await fetch(`${API_BASE}/api/jobs?employer=${targetUserId}`, {
          headers
        });

        if (response.ok) {
          const data = await response.json();
          setPostedJobs(data.filter(job => job.status === 'open').slice(0, 3));
        }
      } catch (err) {
        console.error("Error fetching jobs:", err);
      } finally {
        setLoadingJobs(false);
      }
    };

    if (!loading) {
      fetchJobs();
    }
  }, [targetUserId, loading]);

  // Helper function to get initials
  const getInitials = (name) => {
    if (!name) return "B";
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <Navbar />
        <SecondaryNav />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <Navbar />
        <SecondaryNav />
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Profile</h2>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={() => navigate('/dashboard')}>
                  Return to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <SecondaryNav />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section - Compact Style */}
        <Card className="mb-6 overflow-hidden">
          {/* Cover Image/Banner - Smaller */}
          <div className="h-24 sm:h-32 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
          
          {/* Profile Info */}
          <CardContent className="pt-0 pb-6 px-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end -mt-12 sm:-mt-16 mb-4">
              <Avatar className="w-24 h-24 sm:w-28 sm:h-28 border-4 border-white shadow-xl">
                {profileData.avatar ? (
                  <AvatarImage src={profileData.avatar} alt={profileData.businessName} />
                ) : (
                  <AvatarFallback 
                    style={{ backgroundColor: profileData.avatarColor }}
                    className="text-white text-2xl sm:text-3xl font-bold"
                  >
                    {getInitials(profileData.businessName)}
                  </AvatarFallback>
                )}
              </Avatar>
              
              <div className="flex-1 mt-4 sm:mt-0 sm:ml-6 w-full">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                      {profileData.businessName}
                    </h1>
                    <p className="text-gray-600 flex items-center mb-2">
                      <Building2 className="w-4 h-4 mr-2" />
                      {profileData.ownerName}
                    </p>
                    {profileData.location && (
                      <p className="text-gray-500 flex items-center text-sm">
                        <MapPin className="w-4 h-4 mr-1" />
                        {profileData.location}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    {!isOwnProfile && (
                      <Button 
                        onClick={() => navigate('/messages')}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Message
                      </Button>
                    )}
                    {isOwnProfile && (
                      <Button 
                        variant="outline"
                        onClick={() => {
                          // TODO: Implement edit functionality
                          alert("Edit profile functionality coming soon!");
                        }}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats - More Compact */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
              <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                <div className="text-xl sm:text-2xl font-bold text-blue-600">{stats.totalJobsPosted}</div>
                <div className="text-xs sm:text-sm text-gray-600">Jobs Posted</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg border border-green-100">
                <div className="text-xl sm:text-2xl font-bold text-green-600">{stats.activeJobs}</div>
                <div className="text-xs sm:text-sm text-gray-600">Active Jobs</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-100">
                <div className="text-xl sm:text-2xl font-bold text-purple-600">{stats.totalHires}</div>
                <div className="text-xs sm:text-sm text-gray-600">Total Hires</div>
              </div>
              <div className="text-center p-3 bg-amber-50 rounded-lg border border-amber-100">
                <div className="text-xl sm:text-2xl font-bold text-amber-600">
                  {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "N/A"}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Rating</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="w-5 h-5 mr-2" />
                  About
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profileData.description ? (
                  <p className="text-gray-700 whitespace-pre-wrap">{profileData.description}</p>
                ) : (
                  <p className="text-gray-400 italic">No description provided.</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Job Postings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Briefcase className="w-5 h-5 mr-2" />
                    Recent Job Postings
                  </div>
                  {postedJobs.length > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate('/browse-jobs')}
                    >
                      View All
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingJobs ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
                    <p className="text-gray-600 text-sm">Loading jobs...</p>
                  </div>
                ) : postedJobs.length > 0 ? (
                  <div className="space-y-4">
                    {postedJobs.map((job) => (
                      <div 
                        key={job.id}
                        className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                        onClick={() => navigate(`/jobs/${job.id}`)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-900 flex-1">{job.title}</h3>
                          <Badge variant="outline" className="ml-2">
                            {job.status}
                          </Badge>
                        </div>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {job.description}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                          {job.budgetType === 'hourly' && job.hourlyRateMin && (
                            <span className="flex items-center">
                              <DollarSign className="w-4 h-4 mr-1" />
                              {formatCurrency(job.hourlyRateMin)} - {formatCurrency(job.hourlyRateMax)}/hr
                            </span>
                          )}
                          {job.budgetType === 'fixed' && job.fixedBudget && (
                            <span className="flex items-center">
                              <DollarSign className="w-4 h-4 mr-1" />
                              {formatCurrency(job.fixedBudget)}
                            </span>
                          )}
                          {job.projectLength && (
                            <span className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {job.projectLength}
                            </span>
                          )}
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatDate(job.created_at)}
                          </span>
                        </div>
                        {job.tags && job.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {job.tags.slice(0, 3).map((tag, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {job.tags.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{job.tags.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No active job postings</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Reviews Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="w-5 h-5 mr-2" />
                  Reviews & Ratings
                </CardTitle>
              </CardHeader>
              <CardContent>
                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review, idx) => (
                      <div key={idx} className="pb-4 border-b border-gray-200 last:border-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-gray-900">{review.authorName}</p>
                            <div className="flex items-center mt-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating
                                      ? "fill-amber-400 text-amber-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <span className="text-sm text-gray-500">
                            {formatDate(review.date)}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No reviews yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions - Only for own profile */}
            {isOwnProfile && (
              <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Settings className="w-5 h-5 mr-2 text-purple-600" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white justify-start"
                    onClick={() => navigate('/post-job')}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Post New Job
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start border-purple-200 hover:bg-purple-50"
                    onClick={() => navigate('/applicants')}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Review Applications
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start border-purple-200 hover:bg-purple-50"
                    onClick={() => navigate('/my-jobs')}
                  >
                    <Briefcase className="w-4 h-4 mr-2" />
                    Manage Jobs
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start border-purple-200 hover:bg-purple-50"
                    onClick={() => navigate('/messages')}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Messages
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start border-purple-200 hover:bg-purple-50"
                    onClick={() => navigate('/employer-dashboard')}
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Dashboard
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start border-purple-200 hover:bg-purple-50"
                    onClick={() => {
                      // TODO: Implement edit functionality
                      alert("Edit profile functionality coming soon!");
                    }}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start">
                  <Mail className="w-5 h-5 mr-3 text-gray-400 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-sm text-gray-900 break-all">{profileData.email}</p>
                  </div>
                </div>
                
                {profileData.location && (
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 mr-3 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="text-sm text-gray-900">{profileData.location}</p>
                    </div>
                  </div>
                )}

                {profileData.website && (
                  <div className="flex items-start">
                    <Globe className="w-5 h-5 mr-3 text-gray-400 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-500">Website</p>
                      <a 
                        href={profileData.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline flex items-center break-all"
                      >
                        {profileData.website}
                        <ExternalLink className="w-3 h-3 ml-1 flex-shrink-0" />
                      </a>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Company Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Company Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {profileData.industry && (
                  <div className="flex items-start">
                    <Target className="w-5 h-5 mr-3 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Industry</p>
                      <p className="text-sm text-gray-900">{profileData.industry}</p>
                    </div>
                  </div>
                )}

                {profileData.companySize && (
                  <div className="flex items-start">
                    <Users className="w-5 h-5 mr-3 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Company Size</p>
                      <p className="text-sm text-gray-900">{profileData.companySize}</p>
                    </div>
                  </div>
                )}

                {profileData.founded && (
                  <div className="flex items-start">
                    <Calendar className="w-5 h-5 mr-3 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Founded</p>
                      <p className="text-sm text-gray-900">{profileData.founded}</p>
                    </div>
                  </div>
                )}

                {!profileData.industry && !profileData.companySize && !profileData.founded && (
                  <p className="text-sm text-gray-400 italic">No company details provided</p>
                )}
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Profile Views</span>
                  <span className="font-semibold text-gray-900">{stats.profileViews}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Completed Jobs</span>
                  <span className="font-semibold text-gray-900">{stats.completedJobs}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Response Rate</span>
                  <span className="font-semibold text-gray-900">
                    {stats.responseRate > 0 ? `${stats.responseRate}%` : "N/A"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Social Links */}
            {(profileData.socialLinks.linkedin || profileData.socialLinks.twitter) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Social Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {profileData.socialLinks.linkedin && (
                    <a
                      href={profileData.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:underline"
                    >
                      <Linkedin className="w-5 h-5 mr-2" />
                      LinkedIn
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  )}
                  {profileData.socialLinks.twitter && (
                    <a
                      href={profileData.socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:underline"
                    >
                      <Globe className="w-5 h-5 mr-2" />
                      Twitter
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BusinessProfile;
