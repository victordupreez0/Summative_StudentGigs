import { useState, useEffect, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserAvatar } from "@/components/UserAvatar";
import { Modal } from "@/components/ui/modal";
import { Star, Code, PenTool, BarChart3, Palette, Search, Users, DollarSign, ArrowRight, MapPin, Clock, Bookmark } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import AuthContext from '@/context/AuthContext';
import API_BASE from '@/config/api';

const Landing = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({
    "Web Development": 0,
    "Content Writing": 0,
    "Data Analysis": 0,
    "Graphic Design": 0
  });

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

  const categories = [
    {
      icon: Code,
      title: "Web Development",
      description: "Website creation, coding, debugging and maintenance",
      categoryKey: "Web Development",
      color: "text-gray-700"
    },
    {
      icon: PenTool,
      title: "Content Writing", 
      description: "Blog posts, articles, copywriting and proofreading",
      categoryKey: "Content Writing",
      color: "text-gray-700"
    },
    {
      icon: BarChart3,
      title: "Data Analysis",
      description: "Statistical analysis, data visualization and reporting", 
      categoryKey: "Data Analysis",
      color: "text-gray-700"
    },
    {
      icon: Palette,
      title: "Graphic Design",
      description: "Logos, illustrations, UI/UX design and branding",
      categoryKey: "Graphic Design",
      color: "text-gray-700"
    }
  ];

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch(`${API_BASE}/api/jobs`)
        if (!res.ok) return
        const data = await res.json()
        if (!mounted) return
        // sort newest first by created_at and keep as-is
        data.sort((a,b) => new Date(b.created_at) - new Date(a.created_at))
        setJobs(data)
        
        // Count jobs by category
        const counts = {
          "Web Development": 0,
          "Content Writing": 0,
          "Data Analysis": 0,
          "Graphic Design": 0
        };
        
        data.forEach(job => {
          const category = job.category;
          if (category === "web-development") counts["Web Development"]++;
          else if (category === "content-writing") counts["Content Writing"]++;
          else if (category === "data-analysis") counts["Data Analysis"]++;
          else if (category === "graphic-design") counts["Graphic Design"]++;
        });
        
        setCategoryCounts(counts);
      } catch (e) {
        console.error('Failed to load recent jobs', e)
      }
    })()
    return () => { mounted = false }
  }, [])

  // Fetch reviews on page load
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/reviews`);
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        setTestimonials(data);
      } catch (e) {
        console.error('Failed to load reviews', e);
      }
    })();
    return () => { mounted = false };
  }, []);

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

  const [testimonials, setTestimonials] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    name: '',
    title: '',
    content: '',
    rating: 5
  });

  const handleLeaveReviewClick = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Auto-fill name and title from user data
    setReviewForm({
      name: user.name || user.username || '',
      title: user.role || 'User',
      content: '',
      rating: 5
    });
    setShowReviewModal(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('Please log in to submit a review.');
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_BASE}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reviewForm)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Server error:', errorData);
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const newReview = await response.json();
      setTestimonials([newReview, ...testimonials]);
      setShowReviewModal(false);
      setReviewForm({
        name: '',
        title: '',
        content: '',
        rating: 5
      });
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error submitting review:', error);
      alert(`Failed to submit review: ${error.message}`);
    }
  };

  const handleReviewFormChange = (e) => {
    const { name, value } = e.target;
    setReviewForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
  <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gray-50 border-b border-gray-200">
        <div className="container mx-auto px-4 py-12 sm:py-16 lg:py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-gray-900 leading-tight">
              Find the perfect student talent for your projects
            </h1>
            <p className="text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 text-gray-600 px-4">
              Connect with skilled students for your short-term projects, research assistance, or part-time roles.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <Button className="text-white shadow-lg font-semibold w-full sm:w-auto" size="lg" asChild>
                <Link to="/post-job">Post a Job</Link>
              </Button>
              <Button variant="outline" size="lg" className="border-gray-300 text-gray-700 hover:bg-gray-50 w-full sm:w-auto" asChild>
                <Link to="/browse-jobs">Find Work</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Popular Categories</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {categories.map((category, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer group border-gray-200 bg-white">
                <CardContent className="p-4 sm:p-6 text-center">
                  <div className="mb-3 sm:mb-4">
                    <category.icon className={`w-10 h-10 sm:w-12 sm:h-12 mx-auto ${category.color}`} />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">{category.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{category.description}</p>
                  <p className="text-purple-600 text-sm font-medium">
                    {categoryCounts[category.categoryKey] || 0} job{categoryCounts[category.categoryKey] !== 1 ? 's' : ''} available
                  </p>
                  <Button variant="link" className="mt-2 text-gray-700 hover:text-purple-600 text-sm">
                    View Jobs <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}

      {/* How It Works */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-7 h-7 sm:w-8 sm:h-8 text-purple-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Create Your Profile</h3>
              <p className="text-sm sm:text-base text-gray-600 px-4">
                Sign up and create a detailed profile showcasing your skills, education and experience to stand out to potential employers.
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-7 h-7 sm:w-8 sm:h-8 text-purple-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Find Opportunities</h3>
              <p className="text-sm sm:text-base text-gray-600 px-4">
                Browse through available jobs that match your interests, or post your own job if you're looking for student talent.
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-7 h-7 sm:w-8 sm:h-8 text-purple-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Collaborate & Earn</h3>
              <p className="text-sm sm:text-base text-gray-600 px-4">
                Connect with employers, complete projects, build your portfolio, and earn money while gaining valuable professional experience.
              </p>
            </div>
          </div>
          <div className="text-center mt-8">
            <Button className="bg-gray-900 hover:bg-gray-800 text-white w-full sm:w-auto" size="lg" asChild>
              <Link to="/signup">Get Started Today</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Recent Jobs */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Recent Jobs</h2>
            <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 w-full sm:w-auto" asChild>
              <Link to="/browse-jobs">View All Jobs</Link>
            </Button>
          </div>
          <div className="space-y-4 sm:space-y-6">
            {jobs.slice(0, 5).map((job) => (
              <Card 
                key={job.id} 
                className="hover:shadow-md transition-shadow cursor-pointer border-gray-200 bg-white"
                onClick={() => window.location.href = `/jobs/${job.id}`}
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                    {/* Company Icon/Avatar */}
                    <div className="flex-shrink-0">
                      <UserAvatar
                        user={{
                          name: job.poster_business_name || job.poster_name || 'User',
                          profilePicture: job.poster_profile_picture,
                          avatarColor: job.poster_avatar_color
                        }}
                        size="lg"
                      />
                    </div>

                    <div className="flex-1 w-full min-w-0">
                      <div className="flex flex-col sm:flex-row justify-between items-start mb-2 gap-2">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base sm:text-lg font-semibold text-foreground hover:text-primary break-words">
                            {job.title}
                          </h3>
                          <p className="text-sm text-muted-foreground break-words">
                            {job.poster_business_name || job.poster_name || `User ${job.user_id}`}
                          </p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={(e) => e.stopPropagation()}
                          className="flex-shrink-0"
                        >
                          <Bookmark className="w-5 h-5" />
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

                      <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="truncate">{job.workLocation || 'Remote'}</span>
                        </div>
                        {job.budgetType === 'hourly' && job.hourlyRateMin && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span className="whitespace-nowrap">${job.hourlyRateMin}-${job.hourlyRateMax}/hr</span>
                          </div>
                        )}
                        {job.budgetType === 'fixed' && job.fixedBudget && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span className="whitespace-nowrap">${job.fixedBudget}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="whitespace-nowrap">{job.created_at ? new Date(job.created_at).toLocaleDateString() : ''}</span>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2 break-words">
                        {job.description}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {(job.requiredSkills || job.tags || []).slice(0, 5).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-muted-foreground">
                          {job.experienceLevel && <span className="whitespace-nowrap">{formatExperienceLevel(job.experienceLevel)}</span>}
                          {job.weeklyHours && <span className="whitespace-nowrap">{formatWeeklyHours(job.weeklyHours)}</span>}
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.location.href = `/jobs/${job.id}`;
                            }}
                            className="flex-1 sm:flex-initial text-xs sm:text-sm"
                          >
                            View Details
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={(e) => {
                              e.stopPropagation();
                              window.location.href = `/jobs/${job.id}/apply`;
                            }}
                            className="flex-1 sm:flex-initial text-xs sm:text-sm"
                          >
                            Apply Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-6 sm:mt-8">
            <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 w-full sm:w-auto" asChild>
              <Link to="/browse-jobs">View All Jobs</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Top Rated Students */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Top Rated Students</h2>
            <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 w-full sm:w-auto" asChild>
              <Link to="/browse-talent">View All Students</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {students.map((student, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow border-gray-200 bg-white">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center mb-4">
                    <Avatar className="w-10 h-10 sm:w-12 sm:h-12 mr-3 border border-gray-200 flex-shrink-0">
                      <AvatarImage src={student.avatar} />
                      <AvatarFallback className="bg-gray-100 text-gray-700 text-sm">{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{student.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">{student.title}</p>
                    </div>
                    <div className="ml-2 flex items-center flex-shrink-0">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400 mr-1" />
                      <span className="text-sm font-medium text-gray-900">{student.rating}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">{student.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {student.skills.map((skill, skillIndex) => (
                      <Badge key={skillIndex} variant="outline" className="border-gray-300 text-gray-700 text-xs">{skill}</Badge>
                    ))}
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-xs sm:text-sm text-gray-600 truncate">{student.jobs} jobs completed</span>
                    <Button size="sm" variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 text-xs flex-shrink-0">View Profile</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              {testimonials.length === 0 ? "No reviews yet, be the first!" : "What People Are Saying"}
            </h2>
            <Button 
              onClick={handleLeaveReviewClick}
              className="mt-4 w-full sm:w-auto"
            >
              Leave a Review
            </Button>
          </div>
          {testimonials.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="border-gray-200 bg-white">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center mb-3 sm:mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 break-words">"{testimonial.content}"</p>
                    <div className="flex items-center">
                      <div className="mr-3 flex-shrink-0">
                        <UserAvatar 
                          user={{
                            name: testimonial.name,
                            profilePicture: testimonial.avatar
                          }}
                          size="sm"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">{testimonial.name}</p>
                        <p className="text-xs sm:text-sm text-gray-600 truncate">{testimonial.title}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Review Modal */}
      <Modal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        title="Leave a Review"
        footer={
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowReviewModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleReviewSubmit}
              className="flex-1"
              disabled={!reviewForm.name || !reviewForm.title || !reviewForm.content}
            >
              Submit Review
            </Button>
          </div>
        }
      >
        <form onSubmit={handleReviewSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Your Name
            </label>
            <Input
              id="name"
              name="name"
              value={reviewForm.name}
              onChange={handleReviewFormChange}
              placeholder="John Doe"
              required
              readOnly={!!user}
              className={user ? "bg-gray-50" : ""}
            />
          </div>
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Your Title/Role
            </label>
            <Input
              id="title"
              name="title"
              value={reviewForm.title}
              onChange={handleReviewFormChange}
              placeholder="e.g., Student, Employer, Freelancer"
              required
              readOnly={!!user}
              className={user ? "bg-gray-50" : ""}
            />
          </div>
          <div>
            <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">
              Rating
            </label>
            <select
              id="rating"
              name="rating"
              value={reviewForm.rating}
              onChange={handleReviewFormChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={5}>5 Stars - Excellent</option>
              <option value={4}>4 Stars - Very Good</option>
              <option value={3}>3 Stars - Good</option>
              <option value={2}>2 Stars - Fair</option>
              <option value={1}>1 Star - Poor</option>
            </select>
          </div>
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              Your Review
            </label>
            <textarea
              id="content"
              name="content"
              value={reviewForm.content}
              onChange={handleReviewFormChange}
              placeholder="Share your experience with StudentGigs..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </form>
      </Modal>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Thank You!"
        type="success"
        footer={
          <Button
            onClick={() => setShowSuccessModal(false)}
            className="w-full"
          >
            Close
          </Button>
        }
      >
        <p className="text-gray-700">
          Thank you for your review! Your feedback helps make StudentGigs better for everyone.
        </p>
      </Modal>

      <Footer />
    </div>
  );
};

export default Landing;