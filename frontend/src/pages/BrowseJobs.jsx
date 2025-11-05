import { useState, useEffect, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserAvatar } from "@/components/UserAvatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useModal } from "@/components/ui/modal";
import { Search, Filter, MapPin, Clock, DollarSign, Users, Bookmark } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { SecondaryNav } from "@/components/SecondaryNav";
import { Footer } from "@/components/Footer";
import SEO from "@/components/SEO";
import AuthContext from '@/context/AuthContext';
import API_BASE from '@/config/api';

const BrowseJobs = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { showAlert, ModalComponent } = useModal();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || "");
  const [jobs, setJobs] = useState([])
  const [savedJobIds, setSavedJobIds] = useState(new Set())
  const [jobType, setJobType] = useState("all");
  const [category, setCategory] = useState("all");
  const [payRate, setPayRate] = useState("all");
  const [experienceLevel, setExperienceLevel] = useState("all");
  const [duration, setDuration] = useState("all");
  const [sortBy, setSortBy] = useState("relevance");

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

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch(`${API_BASE}/api/jobs`)
        if (!res.ok) return
        const data = await res.json()
        if (!mounted) return
        setJobs(data)
      } catch (e) {
        console.error('Failed to load jobs', e)
      }
    })()
    return () => { mounted = false }
  }, [])

  // Update search query when URL params change
  useEffect(() => {
    const searchParam = searchParams.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [searchParams]);

  // Filter and sort jobs
  const filteredJobs = jobs.filter((job) => {
    // Search query filter (title, description, category, required skills)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = job.title?.toLowerCase().includes(query);
      const matchesDescription = job.description?.toLowerCase().includes(query);
      const matchesCategory = job.category?.toLowerCase().includes(query);
      const matchesSkills = job.required_skills?.toLowerCase().includes(query);
      
      if (!matchesTitle && !matchesDescription && !matchesCategory && !matchesSkills) {
        return false;
      }
    }

    // Job type filter
    if (jobType !== "all" && job.project_type) {
      if (job.project_type.toLowerCase() !== jobType.toLowerCase()) {
        return false;
      }
    }

    // Category filter
    if (category !== "all" && job.category) {
      if (job.category.toLowerCase() !== category.toLowerCase()) {
        return false;
      }
    }

    // Pay rate filter
    if (payRate !== "all") {
      const rate = job.hourly_rate_min || 0;
      switch (payRate) {
        case "10-20":
          if (rate < 10 || rate > 20) return false;
          break;
        case "20-30":
          if (rate < 20 || rate > 30) return false;
          break;
        case "30-50":
          if (rate < 30 || rate > 50) return false;
          break;
        case "50+":
          if (rate < 50) return false;
          break;
      }
    }

    // Experience level filter
    if (experienceLevel !== "all" && job.experience_level) {
      if (job.experience_level.toLowerCase() !== experienceLevel.toLowerCase()) {
        return false;
      }
    }

    // Duration filter
    if (duration !== "all" && job.project_length) {
      const length = job.project_length.toLowerCase();
      switch (duration) {
        case "1-week":
          if (!length.includes("week") && !length.includes("less")) return false;
          break;
        case "1-month":
          if (!length.includes("1-3 months") && !length.includes("month")) return false;
          break;
        case "3-month":
          if (!length.includes("3-6 months")) return false;
          break;
        case "6-month":
          if (!length.includes("6+ months") && !length.includes("ongoing")) return false;
          break;
      }
    }

    return true;
  });

  // Sort jobs
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.created_at) - new Date(a.created_at);
      case "pay-high":
        return (b.hourly_rate_min || 0) - (a.hourly_rate_min || 0);
      case "pay-low":
        return (a.hourly_rate_min || 0) - (b.hourly_rate_min || 0);
      case "relevance":
      default:
        return 0;
    }
  });

  // Fetch saved jobs to check which are saved
  useEffect(() => {
    if (!user) return;
    
    let mounted = true;
    (async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const res = await fetch(`${API_BASE}/api/jobs/saved`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        const savedIds = new Set(data.map(job => job.id));
        setSavedJobIds(savedIds);
      } catch (e) {
        console.error('Failed to load saved jobs', e);
      }
    })();
    return () => { mounted = false };
  }, [user]);

  const handleSaveJob = async (e, jobId) => {
    e.stopPropagation();
    
    if (!user) {
      await showAlert({
        title: 'Login Required',
        message: 'Please log in to save jobs',
        type: 'info'
      });
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    const isSaved = savedJobIds.has(jobId);

    try {
      const res = await fetch(`${API_BASE}/api/jobs/${jobId}/save`, {
        method: isSaved ? 'DELETE' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        throw new Error('Failed to save/unsave job');
      }

      // Update local state
      const newSavedIds = new Set(savedJobIds);
      if (isSaved) {
        newSavedIds.delete(jobId);
      } else {
        newSavedIds.add(jobId);
      }
      setSavedJobIds(newSavedIds);

      await showAlert({
        title: 'Success',
        message: isSaved ? 'Job removed from saved jobs' : 'Job saved successfully',
        type: 'success'
      });
    } catch (error) {
      console.error('Error saving/unsaving job:', error);
      await showAlert({
        title: 'Error',
        message: 'Failed to save job. Please try again.',
        type: 'error'
      });
    }
  };

  const handleApplyClick = async (e, jobId) => {
    e.stopPropagation();
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

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title="Browse Student Jobs - Find Part-Time Work & Gigs | StudentGigs"
        description="Browse hundreds of student-friendly jobs, gigs, and part-time opportunities. Filter by category, pay rate, and experience level. Apply today and start earning while studying."
        keywords="browse student jobs, find part-time work, student gig opportunities, college job search, flexible employment, remote student work"
        canonicalUrl="https://studentgigs.com/browse-jobs"
      />
      <Navbar />
      <SecondaryNav />

      <div className="container mx-auto px-4 py-8">
        {/* Search Section */}
        <div className="bg-background-section rounded-lg p-6 mb-8">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search for jobs, skills, or keywords"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
                <label className="text-sm font-medium text-foreground mb-2 block">Project Type</label>
                <Select value={jobType} onValueChange={setJobType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="one-time">One-time project</SelectItem>
                    <SelectItem value="ongoing">Ongoing work</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Category</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="web-development">Web, Mobile & Software Dev</SelectItem>
                    <SelectItem value="content-writing">Content Writing</SelectItem>
                    <SelectItem value="data-analysis">Data Analysis</SelectItem>
                    <SelectItem value="graphic-design">Graphic Design</SelectItem>
                    <SelectItem value="marketing">Marketing & Sales</SelectItem>
                    <SelectItem value="research">Research & Analysis</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Pay Rate Filter */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Pay Rate</label>
                <Select value={payRate} onValueChange={setPayRate}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Rates" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Rates</SelectItem>
                    <SelectItem value="10-20">R180-360/hr</SelectItem>
                    <SelectItem value="20-30">R360-540/hr</SelectItem>
                    <SelectItem value="30-50">R540-900/hr</SelectItem>
                    <SelectItem value="50+">R900+/hr</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Experience Level Filter */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Experience Level</label>
                <Select value={experienceLevel} onValueChange={setExperienceLevel}>
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
                <label className="text-sm font-medium text-foreground mb-2 block">Project Length</label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Durations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Durations</SelectItem>
                    <SelectItem value="1-week">Less than 1 week</SelectItem>
                    <SelectItem value="1-month">1-3 months</SelectItem>
                    <SelectItem value="3-month">3-6 months</SelectItem>
                    <SelectItem value="6-month">More than 6 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters Button */}
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setSearchQuery("");
                  setJobType("all");
                  setCategory("all");
                  setPayRate("all");
                  setExperienceLevel("all");
                  setDuration("all");
                  setSortBy("relevance");
                }}
              >
                Clear All Filters
              </Button>
            </div>
          </div>

          {/* Job Listings */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {searchQuery ? `Search Results (${sortedJobs.length})` : `Recommended Jobs (${sortedJobs.length})`}
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Sort by:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
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
              {sortedJobs.length === 0 ? (
                <Card className="p-8">
                  <div className="text-center text-gray-500">
                    <p className="text-lg font-semibold mb-2">No jobs found</p>
                    <p>Try adjusting your search or filters</p>
                  </div>
                </Card>
              ) : (
                sortedJobs.map((job) => (
                <Card 
                  key={job.id} 
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => window.location.href = `/jobs/${job.id}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Company Icon/Avatar */}
                      <div className="flex-shrink-0">
                        <UserAvatar
                          user={{
                            name: job.poster_business_name || job.poster_name || 'User',
                            profilePicture: job.poster_profile_picture,
                            avatarColor: job.poster_avatar_color || '#1e40af',
                            userType: job.poster_type
                          }}
                          userId={job.user_id}
                          size="lg"
                        />
                      </div>

                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-lg font-semibold text-foreground hover:text-primary">
                              {job.title}
                            </h3>
                            <p className="text-muted-foreground">
                              {job.poster_business_name || job.poster_name || `User ${job.user_id}`}
                            </p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={(e) => handleSaveJob(e, job.id)}
                            className={savedJobIds.has(job.id) ? 'text-primary' : ''}
                          >
                            <Bookmark className={`w-5 h-5 ${savedJobIds.has(job.id) ? 'fill-current' : ''}`} />
                          </Button>
                        </div>

                        {/* Student vs Business Badge */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge variant={job.poster_type === 'employer' ? 'default' : 'secondary'}>
                            {job.poster_type === 'employer' ? '🏢 Business' : '🎓 Student'} Job
                          </Badge>
                          {job.category && <Badge variant="outline">{job.category}</Badge>}
                          {job.projectType && <Badge variant="outline">{job.projectType}</Badge>}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {job.workLocation || 'Remote'}
                          </div>
                          {job.budgetType === 'hourly' && job.hourlyRateMin && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              R{job.hourlyRateMin}-R{job.hourlyRateMax}/hr
                            </div>
                          )}
                          {job.budgetType === 'fixed' && job.fixedBudget && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              R{job.fixedBudget}
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {job.created_at ? new Date(job.created_at).toLocaleDateString() : ''}
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {job.description}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {(job.requiredSkills || job.tags || []).slice(0, 5).map((tag, index) => (
                            <Badge key={index} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            {job.experienceLevel && <span>{formatExperienceLevel(job.experienceLevel)}</span>}
                            {job.weeklyHours && <span>{formatWeeklyHours(job.weeklyHours)}</span>}
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.location.href = `/jobs/${job.id}`;
                              }}
                            >
                              View Details
                            </Button>
                            <Button 
                              size="sm" 
                              onClick={(e) => {
                                handleApplyClick(e, job.id);
                              }}
                            >
                              Apply Now
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
              )}
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
      <ModalComponent />
    </div>
  );
};

export default BrowseJobs;