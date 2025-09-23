import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
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
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const StudentDashboard = () => {
  const stats = [
    {
      title: "Profile Views",
      value: "28",
      change: "12% from last week",
      icon: Eye,
      color: "text-blue-600"
    },
    {
      title: "Applications", 
      value: "5",
      change: "3 awaiting response",
      icon: Send,
      color: "text-green-600"
    },
    {
      title: "Saved Jobs",
      value: "12", 
      change: "2 closing soon",
      icon: Bookmark,
      color: "text-yellow-600"
    },
    {
      title: "Earnings",
      value: "$240",
      change: "This month",
      icon: DollarSign,
      color: "text-purple-600"
    }
  ];

  const recommendedJobs = [
    {
      title: "UI/UX Design for Student App",
      company: "TechUniversity",
      budget: "$150-200 (Fixed Price)",
      posted: "Posted 2 days ago",
      tags: ["UI Design", "Figma", "Mobile App"],
      level: "Intermediate"
    },
    {
      title: "Content Writing for Academic Blog", 
      company: "EduPublishers",
      budget: "$20/hour (Est. 10 hours)",
      posted: "Posted 1 day ago",
      tags: ["Content Writing", "SEO", "Education"],
      level: "Entry Level"
    },
    {
      title: "Web Development for Student Club",
      company: "BusinessClub",
      budget: "$300-400 (Fixed Price)", 
      posted: "Posted 3 days ago",
      tags: ["WordPress", "HTML/CSS", "JavaScript"],
      level: "Intermediate"
    }
  ];

  const recentActivity = [
    {
      type: "application",
      message: "You applied for Web Development for Student Club",
      time: "1 hour ago",
      icon: Send,
      color: "text-blue-600"
    },
    {
      type: "acceptance",
      message: "Your application for Social Media Assistant was accepted",
      time: "Yesterday", 
      icon: CheckCircle,
      color: "text-green-600"
    },
    {
      type: "review",
      message: "You received a 5-star review from CompuTech",
      time: "2 days ago",
      icon: Star,
      color: "text-yellow-600"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
  <Navbar />
      
      {/* Secondary Navigation */}
      <div className="bg-background-section border-b border-border">
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-8 h-12">
            <Link 
              to="/browse-jobs" 
              className="text-sm font-medium text-muted-foreground hover:text-primary pb-3"
            >
              Browse Jobs
            </Link>
            <Link 
              to="/dashboard" 
              className="text-sm font-medium text-primary border-b-2 border-primary pb-3"
            >
              Dashboard
            </Link>
            <Link 
              to="/my-jobs" 
              className="text-sm font-medium text-muted-foreground hover:text-primary pb-3"
            >
              My Jobs
            </Link>
            <Link 
              to="/applications" 
              className="text-sm font-medium text-muted-foreground hover:text-primary pb-3"
            >
              Applications
            </Link>
            <Link 
              to="/messages" 
              className="text-sm font-medium text-muted-foreground hover:text-primary pb-3"
            >
              Messages
            </Link>
            <Link 
              to="/profile" 
              className="text-sm font-medium text-muted-foreground hover:text-primary pb-3"
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
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-full bg-background-gray flex items-center justify-center`}>
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
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recommended Jobs</CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Sort by:</span>
                  <Button variant="outline" size="sm">
                    Relevance ▽
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {recommendedJobs.map((job, index) => (
                    <div key={index} className="border-b border-border last:border-0 pb-6 last:pb-0">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-foreground hover:text-primary cursor-pointer">
                          {job.title}
                        </h3>
                        <Button variant="ghost" size="icon">
                          <Bookmark className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{job.company}</p>
                      <p className="text-sm font-medium text-foreground mb-3">{job.budget}</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {job.tags.map((tag, tagIndex) => (
                          <Badge key={tagIndex} variant="secondary">{tag}</Badge>
                        ))}
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{job.level}</span>
                          <span>{job.posted}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Save</Button>
                          <Button size="sm">Apply Now</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-center mt-6">
                  <Button variant="outline" asChild>
                    <Link to="/browse-jobs">View all</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full bg-background-gray flex items-center justify-center flex-shrink-0`}>
                        <activity.icon className={`w-4 h-4 ${activity.color}`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-foreground">{activity.message}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
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
            <Card className="bg-gradient-hero text-primary-foreground">
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <Avatar className="w-20 h-20 mx-auto mb-4 border-4 border-primary-foreground/20">
                    <AvatarImage src="/avatars/student.jpg" />
                    <AvatarFallback className="text-primary bg-primary-foreground">AJ</AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-bold">Alex Johnson</h3>
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
            <Card>
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
                  <Link to="/profile">
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