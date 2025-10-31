import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  GraduationCap,
  Award,
  Globe,
  Github,
  Linkedin,
  FileText,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  ExternalLink,
  Star,
  Languages,
  CheckCircle,
  DollarSign,
  Clock
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const StudentProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  
  // Profile data state
  const [profileData, setProfileData] = useState({
    // Basic Info
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@student.com",
    phone: "+1 234 567 8900",
    location: "New York, NY",
    bio: "Passionate computer science student with a keen interest in web development and machine learning. Looking for opportunities to apply my skills in real-world projects.",
    avatar: "",
    
    // Education
    education: [
      {
        id: 1,
        institution: "Massachusetts Institute of Technology",
        degree: "Bachelor of Science in Computer Science",
        startDate: "2022-09",
        endDate: "2026-05",
        current: true,
        gpa: "3.8",
        description: "Focus on Software Engineering and AI"
      }
    ],
    
    // Work Experience
    workExperience: [
      {
        id: 1,
        title: "Frontend Developer Intern",
        company: "Tech Startup Inc.",
        location: "Boston, MA",
        startDate: "2024-06",
        endDate: "2024-08",
        current: false,
        description: "Developed responsive web applications using React and TypeScript. Collaborated with design team to implement new UI features."
      }
    ],
    
    // Skills
    skills: [
      { id: 1, name: "JavaScript", level: "Advanced", category: "Programming" },
      { id: 2, name: "React", level: "Advanced", category: "Framework" },
      { id: 3, name: "Node.js", level: "Intermediate", category: "Backend" },
      { id: 4, name: "Python", level: "Intermediate", category: "Programming" },
      { id: 5, name: "SQL", level: "Intermediate", category: "Database" },
      { id: 6, name: "Git", level: "Advanced", category: "Tools" }
    ],
    
    // Languages
    languages: [
      { id: 1, language: "English", proficiency: "Native" },
      { id: 2, language: "Spanish", proficiency: "Fluent" },
      { id: 3, language: "French", proficiency: "Intermediate" }
    ],
    
    // Portfolio/Projects
    portfolio: [
      {
        id: 1,
        title: "E-commerce Platform",
        description: "Built a full-stack e-commerce application with React, Node.js, and PostgreSQL",
        technologies: ["React", "Node.js", "PostgreSQL", "Stripe"],
        link: "https://github.com/johndoe/ecommerce",
        image: "",
        startDate: "2024-01",
        endDate: "2024-04"
      },
      {
        id: 2,
        title: "Machine Learning Image Classifier",
        description: "Developed an image classification model using TensorFlow achieving 94% accuracy",
        technologies: ["Python", "TensorFlow", "OpenCV"],
        link: "https://github.com/johndoe/ml-classifier",
        image: "",
        startDate: "2023-09",
        endDate: "2023-12"
      }
    ],
    
    // Completed Jobs (from platform)
    completedJobs: [
      {
        id: 1,
        title: "Website Redesign",
        employer: "Local Coffee Shop",
        completedDate: "2024-09-15",
        earnings: 500,
        rating: 5,
        review: "Excellent work! Very professional and delivered on time."
      },
      {
        id: 2,
        title: "Social Media Graphics",
        employer: "Fitness Studio",
        completedDate: "2024-08-20",
        earnings: 250,
        rating: 4.5,
        review: "Great designs, quick turnaround."
      }
    ],
    
    // Certifications
    certifications: [
      {
        id: 1,
        name: "AWS Certified Developer",
        issuer: "Amazon Web Services",
        issueDate: "2024-03",
        expiryDate: "2027-03",
        credentialId: "AWS-123456"
      }
    ],
    
    // Social Links
    socialLinks: {
      github: "https://github.com/johndoe",
      linkedin: "https://linkedin.com/in/johndoe",
      portfolio: "https://johndoe.dev",
      twitter: ""
    },
    
    // Availability
    availability: {
      hoursPerWeek: "15-20",
      startDate: "Immediately",
      workType: ["Remote", "On-site"]
    }
  });

  // Statistics
  const stats = {
    totalJobs: 12,
    completedJobs: 2,
    totalEarnings: 750,
    averageRating: 4.8,
    profileViews: 156,
    responseRate: 95
  };

  const handleSave = () => {
    setIsEditing(false);
    // TODO: API call to save profile data
  };

  const handleCancel = () => {
    setIsEditing(false);
    // TODO: Revert changes
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-6">
              <div className="relative">
                <Avatar className="w-24 h-24 border-2 border-gray-200 shadow-sm">
                  <AvatarImage src={profileData.avatar} />
                  <AvatarFallback className="bg-gray-100 text-gray-700 text-2xl font-medium">
                    {profileData.firstName[0]}{profileData.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button
                    size="sm"
                    className="absolute bottom-0 right-0 rounded-full w-10 h-10 p-0"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-semibold text-gray-900">
                    {profileData.firstName} {profileData.lastName}
                  </h1>
                  <Badge variant="secondary" className="bg-green-50 text-green-700 border border-green-200">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                </div>
                
                <div className="flex flex-wrap gap-4 text-sm mb-4 text-gray-600">
                  <div className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {profileData.email}
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {profileData.phone}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {profileData.location}
                  </div>
                </div>
                
                <p className="text-gray-700 max-w-2xl text-sm">
                  {profileData.bio}
                </p>
                
                {/* Social Links */}
                <div className="flex gap-3 mt-4">
                  {profileData.socialLinks.github && (
                    <a href={profileData.socialLinks.github} target="_blank" rel="noopener noreferrer" 
                       className="text-gray-600 hover:text-gray-900 transition">
                      <Github className="w-5 h-5" />
                    </a>
                  )}
                  {profileData.socialLinks.linkedin && (
                    <a href={profileData.socialLinks.linkedin} target="_blank" rel="noopener noreferrer"
                       className="text-gray-600 hover:text-gray-900 transition">
                      <Linkedin className="w-5 h-5" />
                    </a>
                  )}
                  {profileData.socialLinks.portfolio && (
                    <a href={profileData.socialLinks.portfolio} target="_blank" rel="noopener noreferrer"
                       className="text-gray-600 hover:text-gray-900 transition">
                      <Globe className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} variant="outline" className="border-gray-300">
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button onClick={handleSave} className="bg-gray-900 hover:bg-gray-800">
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button onClick={handleCancel} variant="outline" className="border-gray-300">
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <Card className="hover:shadow-sm transition border-gray-200">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Total Jobs</p>
                  <p className="text-xl font-semibold text-gray-900">{stats.totalJobs}</p>
                </div>
                <Briefcase className="w-7 h-7 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-sm transition border-gray-200">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Completed</p>
                  <p className="text-xl font-semibold text-gray-900">{stats.completedJobs}</p>
                </div>
                <CheckCircle className="w-7 h-7 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-sm transition border-gray-200">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Earnings</p>
                  <p className="text-xl font-semibold text-gray-900">${stats.totalEarnings}</p>
                </div>
                <DollarSign className="w-7 h-7 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-sm transition border-gray-200">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Rating</p>
                  <p className="text-xl font-semibold text-gray-900">{stats.averageRating}</p>
                </div>
                <Star className="w-7 h-7 text-amber-400 fill-amber-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-sm transition border-gray-200">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Profile Views</p>
                  <p className="text-xl font-semibold text-gray-900">{stats.profileViews}</p>
                </div>
                <User className="w-7 h-7 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-sm transition border-gray-200">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Response Rate</p>
                  <p className="text-xl font-semibold text-gray-900">{stats.responseRate}%</p>
                </div>
                <Clock className="w-7 h-7 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Education Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base font-semibold">
                    <GraduationCap className="w-4 h-4 text-gray-600" />
                    Education
                  </CardTitle>
                  {isEditing && (
                    <Button size="sm" variant="ghost">
                      <Plus className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {profileData.education.map((edu) => (
                  <div key={edu.id} className="relative border-l-2 border-gray-300 pl-6 pb-6 last:pb-0">
                    <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-gray-600 border-2 border-white" />
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-base">{edu.degree}</h3>
                        <p className="text-gray-600 text-sm">{edu.institution}</p>
                      </div>
                      {isEditing && (
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost">
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-red-600">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {edu.startDate} - {edu.current ? "Present" : edu.endDate}
                      </span>
                      {edu.gpa && <span>GPA: {edu.gpa}</span>}
                    </div>
                    {edu.description && <p className="text-gray-700">{edu.description}</p>}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Work Experience Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base font-semibold">
                    <Briefcase className="w-4 h-4 text-gray-600" />
                    Work Experience
                  </CardTitle>
                  {isEditing && (
                    <Button size="sm" variant="ghost">
                      <Plus className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {profileData.workExperience.map((exp) => (
                  <div key={exp.id} className="relative border-l-2 border-gray-300 pl-6 pb-6 last:pb-0">
                    <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-gray-600 border-2 border-white" />
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-base">{exp.title}</h3>
                        <p className="text-gray-600 text-sm">{exp.company}</p>
                      </div>
                      {isEditing && (
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost">
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-red-600">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {exp.location}
                      </span>
                    </div>
                    <p className="text-gray-700">{exp.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Portfolio/Projects Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base font-semibold">
                    <FileText className="w-4 h-4 text-gray-600" />
                    Portfolio & Projects
                  </CardTitle>
                  {isEditing && (
                    <Button size="sm" variant="ghost">
                      <Plus className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {profileData.portfolio.map((project) => (
                  <div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-base flex items-center gap-2">
                          {project.title}
                          {project.link && (
                            <a href={project.link} target="_blank" rel="noopener noreferrer"
                               className="text-gray-600 hover:text-gray-900">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {project.startDate} - {project.endDate}
                        </p>
                      </div>
                      {isEditing && (
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost">
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-red-600">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <p className="text-gray-700 mb-3">{project.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech, idx) => (
                        <Badge key={idx} variant="secondary">{tech}</Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Completed Jobs Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <CheckCircle className="w-4 h-4 text-gray-600" />
                  Completed Jobs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profileData.completedJobs.map((job) => (
                  <div key={job.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-sm">{job.title}</h3>
                        <p className="text-sm text-gray-600">{job.employer}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">${job.earnings}</p>
                        <div className="flex items-center gap-1 text-amber-500">
                          <Star className="w-4 h-4 fill-amber-500" />
                          <span className="text-sm font-semibold">{job.rating}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">
                      Completed on {new Date(job.completedDate).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                    {job.review && (
                      <div className="bg-gray-50 rounded p-3 mt-2">
                        <p className="text-sm italic text-gray-700">"{job.review}"</p>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Certifications Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base font-semibold">
                    <Award className="w-4 h-4 text-gray-600" />
                    Certifications
                  </CardTitle>
                  {isEditing && (
                    <Button size="sm" variant="ghost">
                      <Plus className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {profileData.certifications.map((cert) => (
                  <div key={cert.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-sm">{cert.name}</h3>
                        <p className="text-gray-600 text-sm">{cert.issuer}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Issued: {cert.issueDate} | Expires: {cert.expiryDate}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Credential ID: {cert.credentialId}
                        </p>
                      </div>
                      {isEditing && (
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost">
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-red-600">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            
            {/* Skills Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                    <Award className="w-4 h-4 text-gray-600" />
                    Skills
                  </CardTitle>
                  {isEditing && (
                    <Button size="sm" variant="ghost">
                      <Plus className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {profileData.skills.map((skill) => (
                    <div key={skill.id}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{skill.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {skill.level}
                        </Badge>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            skill.level === 'Advanced' ? 'bg-gray-700 w-full' :
                            skill.level === 'Intermediate' ? 'bg-gray-600 w-2/3' :
                            'bg-gray-500 w-1/3'
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Languages Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                    <Languages className="w-4 h-4 text-gray-600" />
                    Languages
                  </CardTitle>
                  {isEditing && (
                    <Button size="sm" variant="ghost">
                      <Plus className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {profileData.languages.map((lang) => (
                    <div key={lang.id} className="flex items-center justify-between">
                      <span className="font-medium">{lang.language}</span>
                      <Badge variant="secondary">{lang.proficiency}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Availability Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <Clock className="w-4 h-4 text-gray-600" />
                  Availability
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Hours per week</p>
                  <p className="font-semibold">{profileData.availability.hoursPerWeek} hours</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-gray-600 mb-1">Start date</p>
                  <p className="font-semibold">{profileData.availability.startDate}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-gray-600 mb-2">Work type</p>
                  <div className="flex flex-wrap gap-2">
                    {profileData.availability.workType.map((type, idx) => (
                      <Badge key={idx} variant="outline">{type}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-gray-50 border-gray-200">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Download Resume
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Globe className="w-4 h-4 mr-2" />
                  Share Profile
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Browse Jobs
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

export default StudentProfile;
