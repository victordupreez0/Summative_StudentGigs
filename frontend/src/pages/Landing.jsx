import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Code, PenTool, BarChart3, Palette, Search, Users, DollarSign, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const Landing = () => {
  const categories = [
    {
      icon: Code,
      title: "Web Development",
      description: "Website creation, coding, debugging and maintenance",
      jobs: "246 jobs available",
      color: "text-blue-600"
    },
    {
      icon: PenTool,
      title: "Content Writing", 
      description: "Blog posts, articles, copywriting and proofreading",
      jobs: "189 jobs available",
      color: "text-green-600"
    },
    {
      icon: BarChart3,
      title: "Data Analysis",
      description: "Statistical analysis, data visualization and reporting", 
      jobs: "156 jobs available",
      color: "text-purple-600"
    },
    {
      icon: Palette,
      title: "Graphic Design",
      description: "Logos, illustrations, UI/UX design and branding",
      jobs: "178 jobs available", 
      color: "text-pink-600"
    }
  ];

  const recentJobs = [
    {
      title: "Frontend Web Developer for Student Portal",
      company: "University of Technology",
      type: "Remote",
      level: "Intermediate",
      duration: "2 months",
      budget: "$30-50/hr",
      tags: ["React", "JavaScript", "Tailwind CSS"],
      applicants: 8,
      timePosted: "Posted 2 days ago"
    },
    {
      title: "Research Assistant for Marketing Project", 
      company: "Market Research Lab",
      type: "Remote",
      level: "Entry Level", 
      duration: "3 months",
      budget: "$15-25/hr",
      tags: ["Market Research", "Data Analysis", "Excel"],
      applicants: 15,
      timePosted: "Posted 1 day ago"
    },
    {
      title: "Content Writer for Education Blog",
      company: "EduPublishers",
      type: "Remote",
      level: "Beginner",
      duration: "Ongoing",
      budget: "$20 per article",
      tags: ["Content Writing", "SEO", "Research"],
      applicants: 12,
      timePosted: "Posted 3 days ago"
    }
  ];

  const students = [
    {
      name: "Sarah Johnson",
      title: "UI/UX Designer",
      rating: 4.9,
      avatar: "/avatars/sarah.jpg",
      skills: ["Figma", "Adobe XD", "Prototyping"],
      description: "Computer Science student with 2 years of experience in UI/UX design. Passionate about creating intuitive user interfaces.",
      jobs: 75
    },
    {
      name: "Michael Chen",
      title: "Full Stack Developer", 
      rating: 4.8,
      avatar: "/avatars/michael.jpg",
      skills: ["React", "Node.js", "MongoDB"],
      description: "Software Engineering student specializing in web development. Experienced in building responsive and scalable applications.",
      jobs: 43
    },
    {
      name: "Emily Rodriguez",
      title: "Content Writer",
      rating: 4.7,
      avatar: "/avatars/emily.jpg", 
      skills: ["Copywriting", "SEO", "Editing"],
      description: "Journalism student with a knack for storytelling. Specializes in creating engaging content for blogs and social media.",
      jobs: 89
    }
  ];

  const testimonials = [
    {
      name: "David Wilson",
      title: "Startup Founder",
      content: "StudentGigs helped me find amazing student talent that bring fresh perspectives and skills to our projects. The platform is easy to use and the quality of applicants is consistently high.",
      avatar: "/avatars/david.jpg",
      rating: 5
    },
    {
      name: "Jessica Taylor",
      title: "Marketing Manager, Student", 
      content: "As a student, finding flexible work was challenging until I discovered StudentGigs. I've completed multiple projects that have enhanced my portfolio and helped me apply classroom knowledge to real-world situations.",
      avatar: "/avatars/jessica.jpg",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-background">
  <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-hero text-primary-foreground">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              Find the perfect student talent for your projects
            </h1>
            <p className="text-xl mb-8 text-primary-foreground/90">
              Connect with skilled students for your short-term projects, research assistance, or part-time roles.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="accent" size="lg" asChild>
                <Link to="/post-job">Post a Job</Link>
              </Button>
              <Button variant="outline" size="lg" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild>
                <Link to="/browse-jobs">Find Work</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-16 bg-background-section">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Popular Categories</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer group">
                <CardContent className="p-6 text-center">
                  <div className="mb-4">
                    <category.icon className={`w-12 h-12 mx-auto ${category.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{category.title}</h3>
                  <p className="text-muted-foreground text-sm mb-3">{category.description}</p>
                  <p className="text-primary text-sm font-medium">{category.jobs}</p>
                  <Button variant="link" className="mt-2 group-hover:text-primary">
                    View Jobs <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">How It Works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Create Your Profile</h3>
              <p className="text-muted-foreground">
                Sign up and create a detailed profile showcasing your skills, education and experience to stand out to potential employers.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Find Opportunities</h3>
              <p className="text-muted-foreground">
                Browse through available jobs that match your interests, or post your own job if you're looking for student talent.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Collaborate & Earn</h3>
              <p className="text-muted-foreground">
                Connect with employers, complete projects, build your portfolio, and earn money while gaining valuable professional experience.
              </p>
            </div>
          </div>
          <div className="text-center mt-8">
            <Button size="lg" asChild>
              <Link to="/signup">Get Started Today</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Recent Jobs */}
      <section className="py-16 bg-background-section">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-foreground">Recent Jobs</h2>
            <div className="flex items-center gap-4">
              <Button variant="outline">
                Filter <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
              <Button variant="outline">Most Recent</Button>
            </div>
          </div>
          <div className="space-y-6">
            {recentJobs.map((job, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-foreground hover:text-primary cursor-pointer">
                          {job.title}
                        </h3>
                        <Button variant="outline" size="sm">Save</Button>
                      </div>
                      <p className="text-muted-foreground mb-2">{job.company} • {job.type}</p>
                      <p className="text-sm text-muted-foreground mb-3">Looking for experienced developer to create a modern student portal interface.</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {job.tags.map((tag, tagIndex) => (
                          <Badge key={tagIndex} variant="secondary">{tag}</Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{job.budget}</span>
                        <span>{job.level}</span>
                        <span>{job.duration}</span>
                        <span>{job.applicants} applicants</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button size="sm">Apply Now</Button>
                      <p className="text-xs text-muted-foreground text-center">{job.timePosted}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button variant="outline" asChild>
              <Link to="/browse-jobs">View All Jobs</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Top Rated Students */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-foreground">Top Rated Students</h2>
            <Button variant="outline" asChild>
              <Link to="/browse-talent">View All Students</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {students.map((student, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <Avatar className="w-12 h-12 mr-3">
                      <AvatarImage src={student.avatar} />
                      <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-foreground">{student.name}</h3>
                      <p className="text-sm text-muted-foreground">{student.title}</p>
                    </div>
                    <div className="ml-auto flex items-center">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                      <span className="text-sm font-medium">{student.rating}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{student.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {student.skills.map((skill, skillIndex) => (
                      <Badge key={skillIndex} variant="outline">{skill}</Badge>
                    ))}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{student.jobs} jobs completed</span>
                    <Button size="sm" variant="outline">View Profile</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-background-section">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">What People Are Saying</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">"{testimonial.content}"</p>
                  <div className="flex items-center">
                    <Avatar className="w-10 h-10 mr-3">
                      <AvatarImage src={testimonial.avatar} />
                      <AvatarFallback>{testimonial.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-foreground">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;