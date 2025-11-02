import { useState, useEffect, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { UserAvatar } from "@/components/UserAvatar";
import { 
  Eye, 
  Send, 
  Bookmark, 
  DollarSign, 
  Star, 
  Clock,
  MapPin,
  Users,
  TrendingUp,
  Calendar,
  CheckCircle,
  Upload
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import AuthContext from '@/context/AuthContext';
import API_BASE from '@/config/api';

const StudentDashboard = () => {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const stats = [
    {
      title: "Profile Views",
      value: "28",
      change: "12% from last week",
      icon: Eye,
      color: "text-gray-600"
    },
    {
      title: "Applications", 
      value: "5",
      change: "3 awaiting response",
      icon: Send,
      color: "text-gray-600"
    },
    {
      title: "Saved Jobs",
      value: "12", 
      change: "2 closing soon",
      icon: Bookmark,
      color: "text-gray-600"
    },
    {
      title: "Earnings",
      value: "$240",
      change: "This month",
      icon: DollarSign,
      color: "text-purple-600"
    }
  ];

  const [recommendedJobs, setRecommendedJobs] = useState([])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch(`${API_BASE}/api/jobs`)
        if (!res.ok) return
        const data = await res.json()
        if (!mounted) return
        data.sort((a,b) => new Date(b.created_at) - new Date(a.created_at))
        setRecommendedJobs(data.slice(0,3))
      } catch (e) {
        console.error('Failed to load recommended jobs', e)
      }
    })()
    return () => { mounted = false }
  }, [])

  const handleApplyClick = (jobId) => {
    if (!user) {
      alert('Please log in to apply for jobs');
      return;
    }
    navigate(`/jobs/${jobId}/apply`);
  };

  const recentActivity = [
    {
      type: "application",
      message: "You applied for Web Development for Student Club",
      time: "1 hour ago",
      icon: Send,
      color: "text-gray-600"
    },
    {
      type: "acceptance",
      message: "Your application for Social Media Assistant was accepted",
      time: "Yesterday", 
      icon: CheckCircle,
      color: "text-purple-600"
    },
    {
      type: "review",
      message: "You received a 5-star review from CompuTech",
      time: "2 days ago",
      icon: Star,
      color: "text-amber-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
  <Navbar />
      
      {/* Secondary Navigation */}
      <div className="border-b border-gray-200">
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
              className="text-sm font-medium text-gray-900 border-b-2 border-purple-600 py-2"
            >
              Dashboard
            </Link>
            <Link 
              to="/my-jobs" 
              className="text-sm font-medium text-gray-600 hover:text-gray-900 py-2"
            >
              My Jobs
            </Link>
            <Link 
              to="/applications" 
              className="text-sm font-medium text-gray-600 hover:text-gray-900 py-5"
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
              className="text-sm font-medium text-gray-600 hover:text-gray-900 py-2"
            >
              Profile
            </Link>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} hover={true} className="border-gray-200 bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recommended Jobs */}
            <Card hover={true} className="border-gray-200 bg-white">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-gray-900">Recommended Jobs for Students</CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Sort by:</span>
                  <Button variant="outline" size="sm" className="border-gray-300 text-gray-700">
                    Relevance ▽
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {recommendedJobs.map((job) => (
                    <div key={job.id} className="border-b border-gray-200 last:border-0 pb-6 last:pb-0">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900 hover:text-purple-600 cursor-pointer">
                          {job.title}
                        </h3>
                        <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900">
                          <Bookmark className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{job.user_id ? `Posted by employer` : ''}</p>
                      <p className="text-sm font-medium text-gray-900 mb-3">{job.projectLength || ''}</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {(job.tags || []).map((tag, tagIndex) => (
                          <Badge key={tagIndex} variant="secondary" className="bg-gray-100 text-gray-700 border-gray-200">{tag}</Badge>
                        ))}
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>{(job.education_levels && job.education_levels[0]) || ''}</span>
                          <span>{job.created_at ? new Date(job.created_at).toLocaleDateString() : ''}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-50">Save</Button>
                          <Button size="sm" className="bg-gray-900 hover:bg-gray-800 text-white" onClick={() => handleApplyClick(job.id)}>Apply Now</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-center mt-6">
                  <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50" asChild>
                    <Link to="/browse-jobs">View all</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card hover={true} className="border-gray-200 bg-white">
              <CardHeader>
                <CardTitle className="text-gray-900">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0`}>
                        <activity.icon className={`w-4 h-4 ${activity.color}`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{activity.message}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-center mt-6">
                  <Button variant="link">View all activity</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Card */}
            <Card className="bg-gradient-hero text-primary-foreground" hover={true}>
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <UserAvatar 
                    user={user} 
                    size="xl"
                    className="mx-auto mb-4 border-4 border-primary-foreground/20"
                  />
                  <h3 className="text-xl font-bold">{user?.name || 'Student'}</h3>
                  <p className="text-primary-foreground/80">Computer Science Student</p>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">4.8</span>
                    <span className="text-primary-foreground/80 ml-1">Boston, MA</span>
                  </div>
                </div>
                <Button variant="accent" className="w-full mb-4">
                  Complete Profile
                </Button>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Profile Completion</span>
                    <span className="font-semibold">65%</span>
                  </div>
                  <Progress value={65} className="bg-primary-foreground/20" />
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>Basic Information</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>Education Details</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-primary-foreground/40" />
                      <span className="text-primary-foreground/70">Upload Portfolio</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-primary-foreground/40" />
                      <span className="text-primary-foreground/70">Add Skills Assessment</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card hover={true}>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/browse-jobs">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Browse New Jobs
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/student-profile">
                    <Upload className="w-4 h-4 mr-2" />
                    Update Portfolio
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/messages">
                    <Users className="w-4 h-4 mr-2" />
                    Check Messages
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/calendar">
                    <Calendar className="w-4 h-4 mr-2" />
                    View Schedule
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default StudentDashboard;