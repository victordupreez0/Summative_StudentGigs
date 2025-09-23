import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Briefcase, 
  Users, 
  Calendar,
  DollarSign,
  Clock,
  MapPin,
  Star,
  MessageSquare,
  UserPlus,
  BarChart3,
  Settings,
  Eye
} from "lucide-react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const EmployerDashboard = () => {
  const stats = [
    {
      title: "Applications",
      value: "32",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Active jobs",
      value: "3",
      icon: Briefcase,
      color: "text-green-600"
    },
    {
      title: "Interviews",
      value: "18",
      icon: Calendar,
      color: "text-purple-600"
    },
    {
      title: "Hires",
      value: "5",
      icon: Star,
      color: "text-yellow-600"
    }
  ];

  const activeJobs = [
    {
      title: "Frontend Developer (React)",
      type: "Remote",
      duration: "Part-time",
      budget: "$20-30/hr",
      applicants: 12,
      posted: "Posted 2 days ago",
      tags: ["React", "JavaScript", "CSS"]
    },
    {
      title: "UI/UX Designer", 
      type: "Hybrid",
      duration: "Project-based",
      budget: "$500-1000",
      applicants: 8,
      posted: "Posted 5 days ago",
      tags: ["Figma", "UI Design", "Prototyping"]
    },
    {
      title: "Content Writer",
      type: "Remote",
      duration: "Freelance", 
      budget: "$15-25/hr",
      applicants: 15,
      posted: "Posted 1 week ago",
      tags: ["Copywriting", "SEO", "Marketing"]
    }
  ];

  const recentApplicants = [
    {
      name: "Emma Wilson",
      position: "Frontend Developer",
      university: "Computer Science, Stanford",
      skills: ["React", "JS"],
      appliedTime: "2 hours ago",
      status: "New",
      avatar: "/avatars/emma.jpg"
    },
    {
      name: "Jason Park", 
      position: "UI/UX Designer",
      university: "Design, RSD",
      skills: ["Figma", "UI"],
      appliedTime: "1 day ago", 
      status: "Shortlisted",
      avatar: "/avatars/jason.jpg"
    },
    {
      name: "Sophia Rodriguez",
      position: "Content Writer",
      university: "Journalism, NYU",
      skills: ["SEO", "Copy"],
      appliedTime: "3 days ago",
      status: "Interview",
      avatar: "/avatars/sophia.jpg"
    }
  ];

  const teamMembers = [
    {
      name: "Michael Johnson",
      role: "Admin",
      status: "online",
      avatar: "/avatars/michael.jpg"
    },
    {
      name: "Sarah Williams", 
      role: "Recruiter",
      status: "online",
      avatar: "/avatars/sarah.jpg"
    },
    {
      name: "David Chen",
      role: "Hiring Manager",
      status: "online", 
      avatar: "/avatars/david.jpg"
    }
  ];

  const upcomingInterviews = [
    {
      name: "Interview with Sophia",
      position: "Content Writer position",
      time: "3:00 PM - 4:00 PM",
      type: "Today",
      avatar: "/avatars/sophia.jpg"
    },
    {
      name: "Interview with Jason",
      position: "UI/UX Designer position", 
      time: "1:00 AM - 12:00 PM",
      type: "Tomorrow",
      avatar: "/avatars/jason.jpg"
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
              to="/open-jobs" 
              className="text-sm font-medium text-muted-foreground hover:text-primary pb-3"
            >
              Open Jobs
            </Link>
            <Link 
              to="/employer-dashboard" 
              className="text-sm font-medium text-primary border-b-2 border-primary pb-3"
            >
              Dashboard
            </Link>
            <Link 
              to="/applicants" 
              className="text-sm font-medium text-muted-foreground hover:text-primary pb-3"
            >
              Applicants
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
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">BT</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                Welcome, Michael 👋
              </h1>
              <p className="text-muted-foreground">BusinessTech Workspace</p>
            </div>
          </div>

          <div className="bg-gradient-hero rounded-lg p-6 text-primary-foreground">
            <div className="flex flex-col lg:flex-row items-center justify-between">
              <div className="mb-4 lg:mb-0">
                <h2 className="text-xl font-semibold mb-2">Find talented students for your projects</h2>
                <p className="text-primary-foreground/90">
                  Post jobs, review applications, and hire the best students for your team.
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="accent" asChild>
                  <Link to="/post-job">+ Post a job</Link>
                </Button>
                <Button variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                  <Users className="w-4 h-4 mr-2" />
                  Browse students
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
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
            {/* Active Jobs */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Active jobs
                  <Badge variant="secondary">3</Badge>
                </CardTitle>
                <Link to="/jobs" className="text-primary hover:underline text-sm">View all</Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {activeJobs.map((job, index) => (
                    <div key={index} className="border-b border-border last:border-0 pb-6 last:pb-0">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-foreground">{job.title}</h3>
                        <span className="text-sm text-muted-foreground">{job.posted}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <span>{job.type}</span>
                        <span>{job.duration}</span>
                        <span>{job.budget}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {job.tags.map((tag, tagIndex) => (
                          <Badge key={tagIndex} variant="outline">{tag}</Badge>
                        ))}
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Users className="w-4 h-4" />
                          {job.applicants} applicants
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Save</Button>
                          <Button size="sm">Apply Now</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Applicants */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  Recent applicants
                  <Badge variant="secondary">12 new</Badge>
                </CardTitle>
                <Link to="/applicants" className="text-primary hover:underline text-sm">View all</Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentApplicants.map((applicant, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={applicant.avatar} />
                          <AvatarFallback>{applicant.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{applicant.name}</p>
                          <p className="text-sm text-muted-foreground">{applicant.position}</p>
                          <div className="flex gap-2 mt-1">
                            {applicant.skills.map((skill, skillIndex) => (
                              <Badge key={skillIndex} variant="outline" className="text-xs">{skill}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant={applicant.status === 'New' ? 'default' : applicant.status === 'Interview' ? 'secondary' : 'outline'}
                          className="mb-1"
                        >
                          {applicant.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground">{applicant.appliedTime}</p>
                        <div className="flex gap-1 mt-2">
                          <Button size="sm" variant="outline">Review</Button>
                          {applicant.status === 'Interview' && (
                            <Button size="sm">Schedule</Button>
                          )}
                          {applicant.status === 'Shortlisted' && (
                            <Button size="sm">Message</Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Monthly Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-primary">32</p>
                    <p className="text-sm text-muted-foreground">Applications</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">3</p>
                    <p className="text-sm text-muted-foreground">Active jobs</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">18</p>
                    <p className="text-sm text-muted-foreground">Interviews</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">5</p>
                    <p className="text-sm text-muted-foreground">Hires</p>
                  </div>
                </div>
                <Button variant="link" size="sm" className="w-full mt-4">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View detailed analytics
                </Button>
              </CardContent>
            </Card>

            {/* Team Members */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Team members</CardTitle>
                <Button size="icon" variant="ghost">
                  <UserPlus className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {teamMembers.map((member, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.role}</p>
                        </div>
                      </div>
                      <Button size="icon" variant="ghost">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="w-full mt-4">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite team member
                </Button>
              </CardContent>
            </Card>

            {/* Upcoming Interviews */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming interviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingInterviews.map((interview, index) => (
                    <div key={index} className="border-l-4 border-primary pl-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-primary-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{interview.name}</p>
                          <p className="text-xs text-muted-foreground">{interview.position}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{interview.time}</span>
                          </div>
                        </div>
                        <Badge variant={interview.type === 'Today' ? 'default' : 'secondary'} className="text-xs">
                          {interview.type}
                        </Badge>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline">Join call</Button>
                        <Button size="sm">Reschedule</Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="link" size="sm" className="w-full mt-4">
                  View details
                </Button>
                <Button variant="link" size="sm" className="w-full">
                  Reschedule
                </Button>
              </CardContent>
            </Card>

            {/* Ready to find more talent */}
            <Card>
              <CardHeader>
                <CardTitle>Ready to find more talent?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Post a new job to reach thousands of qualified students.
                </p>
                <Button className="w-full" asChild>
                  <Link to="/post-job">+ Post a new job</Link>
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

export default EmployerDashboard;