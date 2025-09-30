import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Users, Clock, DollarSign, Eye, Save, UserPlus, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useContext } from 'react'
import AuthContext from '@/context/AuthContext'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000'

const PostJob = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [projectType, setProjectType] = useState("");
  const [projectLength, setProjectLength] = useState("");
  const [jobCategory, setJobCategory] = useState("");
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [educationLevels, setEducationLevels] = useState([]);

  const steps = [
    { number: 1, title: "Basics", active: currentStep >= 1, completed: currentStep > 1 },
    { number: 2, title: "Details", active: currentStep >= 2, completed: currentStep > 2 },
    { number: 3, title: "Expertise", active: currentStep >= 3, completed: currentStep > 3 },
    { number: 4, title: "Budget", active: currentStep >= 4, completed: currentStep > 4 },
    { number: 5, title: "Review", active: currentStep >= 5, completed: false },
  ];

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleEducationChange = (level, checked) => {
    if (checked) {
      setEducationLevels([...educationLevels, level]);
    } else {
      setEducationLevels(educationLevels.filter(l => l !== level));
    }
  };

  const nextStep = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="min-h-screen bg-background">
  <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/dashboard">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Post a Job</h1>
              <div className="flex items-center gap-4 mt-2">
                <Button variant="ghost" size="sm">
                  <Save className="w-4 h-4 mr-2" />
                  Save as Draft
                </Button>
                <Button variant="ghost" size="sm">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite collaborators
                </Button>
                <Button variant="ghost" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
              </div>
            </div>
          </div>
          <PostButton
            disabled={currentStep < 5}
            currentStep={currentStep}
            job={{ jobTitle, jobDescription, projectType, projectLength, jobCategory, tags, educationLevels }}
          />
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  step.completed 
                    ? 'bg-primary border-primary text-primary-foreground' 
                    : step.active 
                      ? 'border-primary text-primary bg-primary/10' 
                      : 'border-border text-muted-foreground'
                }`}>
                  {step.completed ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    step.number
                  )}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  step.active ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div className={`mx-4 flex-1 h-0.5 ${
                    step.completed ? 'bg-primary' : 'bg-border'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <Progress value={(currentStep / 5) * 100} className="w-full" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  {currentStep === 1 && "Tell us about your job"}
                  {currentStep === 2 && "Job Details"}
                  {currentStep === 3 && "Required Expertise"}
                  {currentStep === 4 && "Budget & Timeline"}
                  {currentStep === 5 && "Review Your Job Post"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Step 1: Basics */}
                {currentStep === 1 && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Job Title
                      </label>
                      <Input
                        placeholder="Example: Mobile App Developer for Student Project"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        This helps attract the right students to your job post
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Job Description
                      </label>
                      <Textarea
                        placeholder="Describe your job in detail. Include any requirements, expectations, and what success looks like.

Be clear about deliverables, timeline, and what you're looking for in an applicant"
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        rows={8}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Be clear about deliverables, timeline, and what you're looking for in an applicant
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Project Type
                        </label>
                        <Select value={projectType} onValueChange={setProjectType}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select project type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="one-time">One-time project</SelectItem>
                            <SelectItem value="ongoing">Ongoing work</SelectItem>
                            <SelectItem value="internship">Internship</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Project Length
                        </label>
                        <Select value={projectLength} onValueChange={setProjectLength}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select length" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1-week">Less than 1 week</SelectItem>
                            <SelectItem value="1-month">1-3 months</SelectItem>
                            <SelectItem value="3-month">3-6 months</SelectItem>
                            <SelectItem value="6-month">More than 6 months</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Job Category
                      </label>
                      <Select value={jobCategory} onValueChange={setJobCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="web-development">Web, Mobile & Software Development</SelectItem>
                          <SelectItem value="content-writing">Content Writing</SelectItem>
                          <SelectItem value="data-analysis">Data Analysis</SelectItem>
                          <SelectItem value="graphic-design">Graphic Design</SelectItem>
                          <SelectItem value="marketing">Marketing & Sales</SelectItem>
                          <SelectItem value="research">Research & Analysis</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Tags
                      </label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                            {tag} ×
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a tag and press enter..."
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addTag()}
                        />
                        <Button type="button" onClick={addTag}>Add</Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Add tags to help students find your job
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-3">
                        Required Education Level
                      </label>
                      <div className="space-y-3">
                        {['High School', 'Associate', 'Bachelor\'s', 'Master\'s'].map((level) => (
                          <div key={level} className="flex items-center space-x-2">
                            <Checkbox
                              id={level}
                              checked={educationLevels.includes(level)}
                              onCheckedChange={(checked) => handleEducationChange(level, !!checked)}
                            />
                            <label htmlFor={level} className="text-sm text-foreground">
                              {level}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Step 2: Details */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <p className="text-muted-foreground">Additional job details and requirements will be configured here.</p>
                    {/* Placeholder for step 2 content */}
                  </div>
                )}

                {/* Step 3: Expertise */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <p className="text-muted-foreground">Required skills and expertise will be configured here.</p>
                    {/* Placeholder for step 3 content */}
                  </div>
                )}

                {/* Step 4: Budget */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <p className="text-muted-foreground">Budget and payment details will be configured here.</p>
                    {/* Placeholder for step 4 content */}
                  </div>
                )}

                {/* Step 5: Review */}
                {currentStep === 5 && (
                  <div className="space-y-6">
                    <p className="text-muted-foreground">Review your job post before publishing.</p>
                    {/* Placeholder for step 5 content */}
                  </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between pt-6 border-t">
                  <Button 
                    variant="outline" 
                    onClick={prevStep}
                    disabled={currentStep === 1}
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={nextStep}
                    disabled={currentStep === 5}
                  >
                    {currentStep === 4 ? 'Next: Review' : 'Next: Job Details'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                    💡
                  </div>
                  Tips for attracting great student talent
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                    Be specific about your project requirements and deadlines
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                    Mention if the work can be done remotely or needs to be on-campus
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                    Include any learning opportunities or academic benefits
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                    Be clear about compensation, course credit, or other benefits
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                    Consider flexible schedules to accommodate class schedules
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Help us improve the job posting experience.
                </p>
                <Button variant="outline" size="sm">
                  Leave Feedback
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

function PostButton({ disabled, currentStep, job }){
  const { token } = useContext(AuthContext)
  const handlePost = async () => {
    if (disabled) return
    // basic payload
    const payload = {
      title: job.jobTitle,
      description: job.jobDescription,
      projectType: job.projectType,
      projectLength: job.projectLength,
      category: job.jobCategory,
      tags: job.tags,
      educationLevels: job.educationLevels,
    }
    try{
      const res = await fetch(`${API_BASE}/api/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (!res.ok) return alert(data.error || 'Could not post job')
      alert('Job posted — id: ' + data.id)
      window.location.href = '/dashboard'
    }catch(e){
      console.error(e)
      alert('Network error')
    }
  }

  return (
    <Button size="lg" disabled={disabled} onClick={handlePost}>
      {currentStep < 5 ? 'Review and Post' : 'Post Job'}
    </Button>
  )
}

export default PostJob;
