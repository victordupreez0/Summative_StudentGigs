import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { UserAvatar } from "@/components/UserAvatar";
import { Modal } from "@/components/ui/modal";
import { 
  Users, 
  Search, 
  Filter,
  Calendar,
  Briefcase,
  Mail,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  BarChart3,
  Video
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { SecondaryNav } from "@/components/SecondaryNav";
import { Footer } from "@/components/Footer";
import AuthContext from '@/context/AuthContext';
import API_BASE from '@/config/api';

const Applicants = () => {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Interview scheduling modal state
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [interviewData, setInterviewData] = useState({
    scheduledDate: '',
    scheduledTime: '',
    meetingLink: '',
    notes: ''
  });
  const [schedulingInterview, setSchedulingInterview] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, [token]);

  useEffect(() => {
    filterApplications();
  }, [applications, searchQuery, statusFilter]);

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
      setApplications(data);
    } catch (err) {
      console.error('Failed to load applications', err);
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = [...applications];

    // Filter by search query (name, email, or job title)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(app => 
        app.name?.toLowerCase().includes(query) ||
        app.email?.toLowerCase().includes(query) ||
        app.job_title?.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    setFilteredApplications(filtered);
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

  const handleMessageApplicant = async (application) => {
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
      alert('Failed to start conversation. Please try again.');
    }
  };

  const handleScheduleInterview = (application) => {
    setSelectedApplication(application);
    setShowInterviewModal(true);
    // Reset form
    setInterviewData({
      scheduledDate: '',
      scheduledTime: '',
      meetingLink: '',
      notes: ''
    });
  };

  const handleInterviewSubmit = async () => {
    if (!interviewData.scheduledDate || !interviewData.scheduledTime) {
      alert('Please provide date and time for the interview');
      return;
    }

    try {
      setSchedulingInterview(true);
      
      const res = await fetch(`${API_BASE}/api/interviews/schedule`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          applicationId: selectedApplication.id,
          scheduledDate: interviewData.scheduledDate,
          scheduledTime: interviewData.scheduledTime,
          meetingLink: interviewData.meetingLink,
          notes: interviewData.notes
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to schedule interview');
      }

      alert('Interview scheduled successfully!');
      setShowInterviewModal(false);
      setSelectedApplication(null);
    } catch (error) {
      console.error('Error scheduling interview:', error);
      alert(error.message || 'Failed to schedule interview. Please try again.');
    } finally {
      setSchedulingInterview(false);
    }
  };

  const statusMap = {
    'pending': { label: 'New', variant: 'default', color: 'bg-blue-100 text-blue-700', icon: Clock },
    'accepted': { label: 'Accepted', variant: 'success', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    'rejected': { label: 'Rejected', variant: 'secondary', color: 'bg-gray-100 text-gray-700', icon: XCircle }
  };

  // Calculate stats
  const stats = {
    total: applications.length,
    new: applications.filter(a => a.status === 'pending').length,
    accepted: applications.filter(a => a.status === 'accepted').length,
    rejected: applications.filter(a => a.status === 'rejected').length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Secondary Navigation */}
      <SecondaryNav />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Applicants</h1>
          <p className="text-gray-600">Manage and review all applications for your job postings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-8">
          <Card className="border-gray-200 bg-white">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Applications</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 ml-2">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 bg-white">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">New Applications</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">{stats.new}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0 ml-2">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 bg-white">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Accepted</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">{stats.accepted}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 ml-2">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 bg-white">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Rejected</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">{stats.rejected}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 ml-2">
                  <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6 border-gray-200 bg-white">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search by name, email, or job title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Status Filter */}
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === "all" ? "default" : "outline"}
                  onClick={() => setStatusFilter("all")}
                  size="sm"
                >
                  All ({stats.total})
                </Button>
                <Button
                  variant={statusFilter === "pending" ? "default" : "outline"}
                  onClick={() => setStatusFilter("pending")}
                  size="sm"
                >
                  New ({stats.new})
                </Button>
                <Button
                  variant={statusFilter === "accepted" ? "default" : "outline"}
                  onClick={() => setStatusFilter("accepted")}
                  size="sm"
                >
                  Accepted ({stats.accepted})
                </Button>
                <Button
                  variant={statusFilter === "rejected" ? "default" : "outline"}
                  onClick={() => setStatusFilter("rejected")}
                  size="sm"
                >
                  Rejected ({stats.rejected})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Applications List */}
        <Card className="border-gray-200 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Applications
              <Badge variant="secondary" className="ml-2">
                {filteredApplications.length} {filteredApplications.length === 1 ? 'result' : 'results'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading applications...</p>
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
                <h3 className="text-lg font-semibold mb-2 text-gray-900">
                  {searchQuery || statusFilter !== "all" ? "No matching applications" : "No applications yet"}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery || statusFilter !== "all" 
                    ? "Try adjusting your search or filters" 
                    : "Applications will appear here when students apply to your jobs"}
                </p>
                {(searchQuery || statusFilter !== "all") && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchQuery("");
                      setStatusFilter("all");
                    }}
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredApplications.map((application) => {
                  const statusInfo = statusMap[application.status];
                  const StatusIcon = statusInfo.icon;
                  
                  return (
                    <div 
                      key={application.id} 
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow bg-white"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          {/* Avatar */}
                          <UserAvatar 
                            user={{
                              name: application.name,
                              profilePicture: application.profile_picture,
                              avatarColor: application.avatar_color
                            }}
                            userId={application.user_id}
                            size="lg"
                          />

                          {/* Applicant Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-semibold text-lg text-gray-900">
                                  {application.name}
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                  <Mail className="w-4 h-4" />
                                  {application.email}
                                </div>
                              </div>
                            </div>

                            {/* Job Applied For */}
                            <div className="flex items-center gap-2 mt-3 mb-3">
                              <Briefcase className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-700">
                                Applied for: <span className="font-medium">{application.job_title}</span>
                              </span>
                            </div>

                            {/* Application Date */}
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Calendar className="w-4 h-4" />
                              Applied {getTimeAgo(application.created_at)}
                            </div>

                            {/* Cover Letter Preview */}
                            {application.cover_letter && (
                              <div className="mt-3 p-3 bg-gray-50 rounded-md">
                                <p className="text-sm text-gray-700 line-clamp-2">
                                  {application.cover_letter}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Status and Actions */}
                        <div className="flex flex-col items-end gap-3 ml-4">
                          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${statusInfo.color}`}>
                            <StatusIcon className="w-4 h-4" />
                            <span className="text-sm font-medium">{statusInfo.label}</span>
                          </div>

                          <div className="flex gap-2">
                            {application.status === 'accepted' && (
                              <Button
                                onClick={() => handleScheduleInterview(application)}
                                size="sm"
                                variant="outline"
                                className="text-purple-700 border-purple-300 hover:bg-purple-50"
                              >
                                <Video className="w-4 h-4 mr-2" />
                                Schedule
                              </Button>
                            )}
                            <Button
                              onClick={() => handleMessageApplicant(application)}
                              size="sm"
                              variant="outline"
                              className="text-gray-700"
                            >
                              <Mail className="w-4 h-4 mr-2" />
                              Message
                            </Button>
                            <Button
                              onClick={() => navigate(`/applications/${application.id}`)}
                              size="sm"
                              className="bg-purple-600 hover:bg-purple-700 text-white"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Review
                            </Button>
                          </div>
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

      {/* Schedule Interview Modal */}
      <Modal
        isOpen={showInterviewModal}
        onClose={() => setShowInterviewModal(false)}
        title="Schedule Interview"
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Schedule an interview with <span className="font-semibold">{selectedApplication?.name}</span> for the position: <span className="font-semibold">{selectedApplication?.job_title}</span>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={interviewData.scheduledDate}
              onChange={(e) => setInterviewData({ ...interviewData, scheduledDate: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time <span className="text-red-500">*</span>
            </label>
            <Input
              type="time"
              value={interviewData.scheduledTime}
              onChange={(e) => setInterviewData({ ...interviewData, scheduledTime: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Google Meet Link
            </label>
            <Input
              type="url"
              placeholder="https://meet.google.com/xxx-xxxx-xxx"
              value={interviewData.meetingLink}
              onChange={(e) => setInterviewData({ ...interviewData, meetingLink: e.target.value })}
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter your Google Meet link or any other video conferencing link
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows={3}
              placeholder="Add any additional notes or instructions for the interview..."
              value={interviewData.notes}
              onChange={(e) => setInterviewData({ ...interviewData, notes: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowInterviewModal(false)}
              disabled={schedulingInterview}
            >
              Cancel
            </Button>
            <Button
              onClick={handleInterviewSubmit}
              disabled={schedulingInterview || !interviewData.scheduledDate || !interviewData.scheduledTime}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {schedulingInterview ? 'Scheduling...' : 'Schedule Interview'}
            </Button>
          </div>
        </div>
      </Modal>

      <Footer />
    </div>
  );
};

export default Applicants;
