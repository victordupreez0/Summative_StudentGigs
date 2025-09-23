import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, MapPin, Clock, DollarSign, Users, Bookmark } from "lucide-react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const BrowseJobs = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");

  const jobs = [
    {
      id: 1,
      title: "Web Development for Student Portal",
      company: "University of Technology",
      location: "Remote",
      type: "Part-time",
      budget: "$25-35/hr",
      budgetDetail: "Est. Budget: $1,500",
      timePosted: "Posted 2 days ago",
      description: "Looking for a student developer to build a responsive web portal for our university department. The portal will allow students to access course materials, submit assignments, and track their progress.",
      tags: ["React", "Node.js", "MongoDB"],
      applicants: 8,
      level: "Intermediate",
      duration: "2 months",
      companyLogo: "/avatars/university.jpg"
    },
    {
      id: 2,
      title: "Content Writing for Academic Blog", 
      company: "Professor Johnson",
      location: "Remote",
      type: "Freelance",
      budget: "$20/hr",
      budgetDetail: "Est. Budget: $800",
      timePosted: "Posted 1 week ago",
      description: "Seeking a student with strong research and writing skills to create content for an academic blog focused on environmental science. Topics will include climate change, sustainability, and conservation efforts.",
      tags: ["Content Writing", "Research", "SEO"],
      applicants: 5,
      level: "Entry Level",
      duration: "3 months",
      companyLogo: "/avatars/professor.jpg"
    },
    {
      id: 3,
      title: "Data Analysis for Research Project",
      company: "Smith Research Lab",
      location: "On-site (Boston)",
      type: "Part-time",
      budget: "$30-40/hr", 
      budgetDetail: "Est. Budget: $2,000",
      timePosted: "Posted 3 days ago",
      description: "We are looking for a student with strong data analysis skills to help with our ongoing research project. The ideal candidate will have experience with statistical analysis, data visualization, and report writing.",
      tags: ["Python", "R", "Statistics"],
      applicants: 12,
      level: "Advanced",
      duration: "4 months",
      companyLogo: "/avatars/research.jpg"
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
              className="text-sm font-medium text-primary border-b-2 border-primary pb-3"
            >
              Browse Jobs
            </Link>
            <Link 
              to="/dashboard" 
              className="text-sm font-medium text-muted-foreground hover:text-primary pb-3"
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
            <div className="ml-auto">
              <Button asChild>
                <Link to="/post-job">+ Post a Job</Link>
              </Button>
            </div>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search Section */}
        <div className="bg-background-section rounded-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search for jobs, skills, or keywords"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <Button size="lg" className="h-12 px-8">
              Search
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-80">
            <div className="space-y-6">
              {/* Filter Header */}
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">Filters:</h3>
                <Filter className="w-5 h-5 text-muted-foreground" />
              </div>

              {/* Job Type Filter */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Job Type</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="freelance">Freelance</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Pay Rate Filter */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Pay Rate</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="All Rates" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Rates</SelectItem>
                    <SelectItem value="10-20">$10-20/hr</SelectItem>
                    <SelectItem value="20-30">$20-30/hr</SelectItem>
                    <SelectItem value="30-50">$30-50/hr</SelectItem>
                    <SelectItem value="50+">$50+/hr</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Experience Level Filter */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Experience Level</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="All Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="entry">Entry Level</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Duration Filter */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Duration</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="All Durations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Durations</SelectItem>
                    <SelectItem value="1-week">Less than 1 week</SelectItem>
                    <SelectItem value="1-month">1-3 months</SelectItem>
                    <SelectItem value="3-month">3-6 months</SelectItem>
                    <SelectItem value="6-month">6+ months</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* More Filters Button */}
              <Button variant="outline" className="w-full">
                More Filters ≡
              </Button>
            </div>
          </div>

          {/* Job Listings */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Recommended Jobs</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Sort by:</span>
                <Select defaultValue="relevance">
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="pay-high">Pay: High to Low</SelectItem>
                    <SelectItem value="pay-low">Pay: Low to High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-6">
              {jobs.map((job) => (
                <Card key={job.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Company Icon/Avatar */}
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <span className="text-primary font-semibold text-lg">
                            {job.company.charAt(0)}
                          </span>
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-lg font-semibold text-foreground hover:text-primary cursor-pointer">
                              {job.title}
                            </h3>
                            <p className="text-muted-foreground">{job.company}</p>
                          </div>
                          <Button variant="ghost" size="icon">
                            <Bookmark className="w-5 h-5" />
                          </Button>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {job.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {job.budget}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {job.duration}
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground mb-4">
                          {job.description}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {job.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{job.budgetDetail}</span>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {job.applicants} applicants
                            </div>
                            <span>{job.timePosted}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">Save</Button>
                            <Button size="sm">Apply Now</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Load More */}
            <div className="text-center mt-8">
              <Button variant="outline">Load More Jobs</Button>
            </div>
          </div>
        </div>

        {/* Hiring CTA Section */}
        <div className="mt-16 bg-gradient-hero rounded-lg p-8 text-center text-primary-foreground">
          <h3 className="text-2xl font-bold mb-4">Are you looking to hire students?</h3>
          <p className="text-lg mb-6 text-primary-foreground/90">
            Post a job and reach thousands of talented students ready to work on your projects.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="accent" size="lg" asChild>
              <Link to="/post-job">Post a Job</Link>
            </Button>
            <Button variant="outline" size="lg" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
              Learn More
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BrowseJobs;