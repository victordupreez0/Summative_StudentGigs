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
import API_BASE from '@/config/api'

const PostJob = () => {
  const [currentStep, setCurrentStep] = useState(1);
  
  // Step 1: Basics
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [projectType, setProjectType] = useState("");
  const [projectLength, setProjectLength] = useState("");
  const [jobCategory, setJobCategory] = useState("");
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [educationLevels, setEducationLevels] = useState([]);

  // Step 2: Details
  const [workLocation, setWorkLocation] = useState("");
  const [studentCount, setStudentCount] = useState("");
  const [weeklyHours, setWeeklyHours] = useState("");
  const [startDate, setStartDate] = useState("");
  const [attachments, setAttachments] = useState([]);

  // Step 3: Expertise
  const [experienceLevel, setExperienceLevel] = useState("");
  const [requiredSkills, setRequiredSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");
  const [preferredMajors, setPreferredMajors] = useState([]);
  const [languages, setLanguages] = useState([]);

  // Step 4: Budget
  const [budgetType, setBudgetType] = useState("hourly");
  const [hourlyRateMin, setHourlyRateMin] = useState("");
  const [hourlyRateMax, setHourlyRateMax] = useState("");
  const [fixedBudget, setFixedBudget] = useState("");
  const [paymentSchedule, setPaymentSchedule] = useState("");

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

  const addSkill = () => {
    if (newSkill.trim() && !requiredSkills.includes(newSkill.trim())) {
      setRequiredSkills([...requiredSkills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove) => {
    setRequiredSkills(requiredSkills.filter(skill => skill !== skillToRemove));
  };

  const handleEducationChange = (level, checked) => {
    if (checked) {
      setEducationLevels([...educationLevels, level]);
    } else {
      setEducationLevels(educationLevels.filter(l => l !== level));
    }
  };

  const handleLanguageChange = (language, checked) => {
    if (checked) {
      setLanguages([...languages, language]);
    } else {
      setLanguages(languages.filter(l => l !== language));
    }
  };

  const handleMajorChange = (major, checked) => {
    if (checked) {
      setPreferredMajors([...preferredMajors, major]);
    } else {
      setPreferredMajors(preferredMajors.filter(m => m !== major));
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
            job={{ 
              jobTitle, 
              jobDescription, 
              projectType, 
              projectLength, 
              jobCategory, 
              tags, 
              educationLevels,
              workLocation,
              studentCount,
              weeklyHours,
              startDate,
              experienceLevel,
              requiredSkills,
              preferredMajors,
              languages,
              budgetType,
              hourlyRateMin,
              hourlyRateMax,
              fixedBudget,
              paymentSchedule
            }}
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
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Work Location
                      </label>
                      <Select value={workLocation} onValueChange={setWorkLocation}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select work location" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="remote">100% Remote</SelectItem>
                          <SelectItem value="hybrid">Hybrid (Remote & On-site)</SelectItem>
                          <SelectItem value="onsite">On-site</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1">
                        Remote work increases your pool of qualified students
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Number of Students Needed
                        </label>
                        <Select value={studentCount} onValueChange={setStudentCount}>
                          <SelectTrigger>
                            <SelectValue placeholder="How many?" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 student</SelectItem>
                            <SelectItem value="2-3">2-3 students</SelectItem>
                            <SelectItem value="4-5">4-5 students</SelectItem>
                            <SelectItem value="6+">More than 5 students</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Weekly Time Commitment
                        </label>
                        <Select value={weeklyHours} onValueChange={setWeeklyHours}>
                          <SelectTrigger>
                            <SelectValue placeholder="Hours per week" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="less-10">Less than 10 hrs/week</SelectItem>
                            <SelectItem value="10-20">10-20 hrs/week</SelectItem>
                            <SelectItem value="20-30">20-30 hrs/week</SelectItem>
                            <SelectItem value="30+">More than 30 hrs/week</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Preferred Start Date
                      </label>
                      <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        When would you like the student to start?
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Additional Requirements (Optional)
                      </label>
                      <Textarea
                        placeholder="Any specific requirements not covered above? e.g., need access to specific software, must attend weekly meetings on campus, etc."
                        rows={4}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Attachments (Optional)
                      </label>
                      <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            📎
                          </div>
                          <p className="text-sm font-medium">Upload project files or documents</p>
                          <p className="text-xs text-muted-foreground">PDF, DOC, or images up to 10MB</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Expertise */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Experience Level Required
                      </label>
                      <div className="space-y-3">
                        {[
                          { value: 'entry', label: 'Entry Level', desc: 'New students or those with limited experience' },
                          { value: 'intermediate', label: 'Intermediate', desc: 'Students with some relevant coursework or projects' },
                          { value: 'advanced', label: 'Advanced', desc: 'Students with significant experience or specialized skills' }
                        ].map((level) => (
                          <div
                            key={level.value}
                            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                              experienceLevel === level.value 
                                ? 'border-primary bg-primary/5' 
                                : 'border-border hover:border-primary/50'
                            }`}
                            onClick={() => setExperienceLevel(level.value)}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center ${
                                experienceLevel === level.value 
                                  ? 'border-primary bg-primary' 
                                  : 'border-border'
                              }`}>
                                {experienceLevel === level.value && (
                                  <div className="w-2 h-2 bg-white rounded-full" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-foreground">{level.label}</p>
                                <p className="text-sm text-muted-foreground">{level.desc}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Required Skills
                      </label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {requiredSkills.map((skill) => (
                          <Badge key={skill} variant="secondary" className="cursor-pointer" onClick={() => removeSkill(skill)}>
                            {skill} ×
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="e.g., Python, React, Data Analysis..."
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                        />
                        <Button type="button" onClick={addSkill}>Add</Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Add 3-5 key skills that are essential for this role
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-3">
                        Preferred Majors (Optional)
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                          'Computer Science',
                          'Business',
                          'Engineering',
                          'Marketing',
                          'Design',
                          'Data Science',
                          'Communications',
                          'Mathematics'
                        ].map((major) => (
                          <div key={major} className="flex items-center space-x-2">
                            <Checkbox
                              id={major}
                              checked={preferredMajors.includes(major)}
                              onCheckedChange={(checked) => handleMajorChange(major, !!checked)}
                            />
                            <label htmlFor={major} className="text-sm text-foreground">
                              {major}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-3">
                        Language Requirements
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {['English', 'Spanish', 'Mandarin', 'French', 'German', 'Other'].map((language) => (
                          <div key={language} className="flex items-center space-x-2">
                            <Checkbox
                              id={language}
                              checked={languages.includes(language)}
                              onCheckedChange={(checked) => handleLanguageChange(language, !!checked)}
                            />
                            <label htmlFor={language} className="text-sm text-foreground">
                              {language}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Budget */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-3">
                        How would you like to pay?
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div
                          className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                            budgetType === 'hourly' 
                              ? 'border-primary bg-primary/5' 
                              : 'border-border hover:border-primary/50'
                          }`}
                          onClick={() => setBudgetType('hourly')}
                        >
                          <div className="flex items-start gap-3">
                            <Clock className="w-5 h-5 text-primary mt-1" />
                            <div>
                              <p className="font-semibold text-foreground mb-1">Hourly Rate</p>
                              <p className="text-sm text-muted-foreground">
                                Best for ongoing work with flexible hours
                              </p>
                            </div>
                          </div>
                        </div>

                        <div
                          className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                            budgetType === 'fixed' 
                              ? 'border-primary bg-primary/5' 
                              : 'border-border hover:border-primary/50'
                          }`}
                          onClick={() => setBudgetType('fixed')}
                        >
                          <div className="flex items-start gap-3">
                            <DollarSign className="w-5 h-5 text-primary mt-1" />
                            <div>
                              <p className="font-semibold text-foreground mb-1">Fixed Price</p>
                              <p className="text-sm text-muted-foreground">
                                Best for one-time projects with clear deliverables
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {budgetType === 'hourly' && (
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Hourly Rate Range
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs text-muted-foreground mb-1">
                              Minimum ($/hr)
                            </label>
                            <Input
                              type="number"
                              placeholder="15"
                              value={hourlyRateMin}
                              onChange={(e) => setHourlyRateMin(e.target.value)}
                              min="0"
                              step="0.50"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-muted-foreground mb-1">
                              Maximum ($/hr)
                            </label>
                            <Input
                              type="number"
                              placeholder="30"
                              value={hourlyRateMax}
                              onChange={(e) => setHourlyRateMax(e.target.value)}
                              min="0"
                              step="0.50"
                            />
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          💡 Average student hourly rate is $15-25/hr depending on skills and experience
                        </p>
                      </div>
                    )}

                    {budgetType === 'fixed' && (
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Project Budget
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            $
                          </span>
                          <Input
                            type="number"
                            placeholder="500"
                            value={fixedBudget}
                            onChange={(e) => setFixedBudget(e.target.value)}
                            min="0"
                            className="pl-7"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Set a budget for the entire project
                        </p>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Payment Schedule
                      </label>
                      <Select value={paymentSchedule} onValueChange={setPaymentSchedule}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment schedule" />
                        </SelectTrigger>
                        <SelectContent>
                          {budgetType === 'hourly' ? (
                            <>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                            </>
                          ) : (
                            <>
                              <SelectItem value="upfront">100% upfront</SelectItem>
                              <SelectItem value="milestone">By milestone</SelectItem>
                              <SelectItem value="completion">Upon completion</SelectItem>
                              <SelectItem value="split">50% upfront, 50% on completion</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex gap-3">
                        <div className="text-2xl">ℹ️</div>
                        <div>
                          <p className="font-medium text-foreground mb-1">Budget Tips</p>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Consider the student's skill level when setting rates</li>
                            <li>• Entry-level students: $12-18/hr</li>
                            <li>• Intermediate students: $18-25/hr</li>
                            <li>• Advanced students: $25-40/hr</li>
                            <li>• Include a small buffer for revisions or adjustments</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 5: Review */}
                {currentStep === 5 && (
                  <div className="space-y-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                      <div className="flex gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-green-900">Ready to post!</p>
                          <p className="text-sm text-green-700">Review your job post below before publishing</p>
                        </div>
                      </div>
                    </div>

                    {/* Job Preview */}
                    <div className="border rounded-lg p-6 bg-white">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-2xl font-bold text-foreground mb-2">{jobTitle || 'Untitled Job'}</h3>
                          <div className="flex flex-wrap gap-2 mb-3">
                            <Badge variant="secondary">{projectType || 'Not specified'}</Badge>
                            <Badge variant="secondary">{jobCategory || 'No category'}</Badge>
                            <Badge variant="outline">{workLocation || 'Location TBD'}</Badge>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setCurrentStep(1)}>
                          Edit
                        </Button>
                      </div>

                      <div className="space-y-6">
                        {/* Description */}
                        <div>
                          <h4 className="font-semibold text-foreground mb-2">Job Description</h4>
                          <p className="text-muted-foreground whitespace-pre-wrap">
                            {jobDescription || 'No description provided'}
                          </p>
                        </div>

                        {/* Project Details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 border-y">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Project Length</p>
                            <p className="font-medium">{projectLength || 'Not specified'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Time Commitment</p>
                            <p className="font-medium">{weeklyHours || 'Not specified'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Students Needed</p>
                            <p className="font-medium">{studentCount || 'Not specified'}</p>
                          </div>
                        </div>

                        {/* Budget */}
                        <div>
                          <h4 className="font-semibold text-foreground mb-2">Budget</h4>
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-green-600" />
                            {budgetType === 'hourly' ? (
                              <p className="text-lg font-medium">
                                ${hourlyRateMin || '0'} - ${hourlyRateMax || '0'} /hr
                              </p>
                            ) : (
                              <p className="text-lg font-medium">
                                ${fixedBudget || '0'} (Fixed Price)
                              </p>
                            )}
                          </div>
                          {paymentSchedule && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Payment: {paymentSchedule}
                            </p>
                          )}
                        </div>

                        {/* Skills & Requirements */}
                        <div>
                          <h4 className="font-semibold text-foreground mb-2">Required Skills</h4>
                          <div className="flex flex-wrap gap-2">
                            {requiredSkills.length > 0 ? (
                              requiredSkills.map((skill) => (
                                <Badge key={skill} variant="secondary">{skill}</Badge>
                              ))
                            ) : (
                              <p className="text-muted-foreground text-sm">No skills specified</p>
                            )}
                          </div>
                        </div>

                        {experienceLevel && (
                          <div>
                            <h4 className="font-semibold text-foreground mb-2">Experience Level</h4>
                            <p className="text-muted-foreground capitalize">{experienceLevel}</p>
                          </div>
                        )}

                        {educationLevels.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-foreground mb-2">Education Level</h4>
                            <div className="flex flex-wrap gap-2">
                              {educationLevels.map((level) => (
                                <Badge key={level} variant="outline">{level}</Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {preferredMajors.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-foreground mb-2">Preferred Majors</h4>
                            <div className="flex flex-wrap gap-2">
                              {preferredMajors.map((major) => (
                                <Badge key={major} variant="outline">{major}</Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {languages.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-foreground mb-2">Languages</h4>
                            <div className="flex flex-wrap gap-2">
                              {languages.map((lang) => (
                                <Badge key={lang} variant="outline">{lang}</Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {tags.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-foreground mb-2">Tags</h4>
                            <div className="flex flex-wrap gap-2">
                              {tags.map((tag) => (
                                <Badge key={tag}>{tag}</Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {startDate && (
                          <div>
                            <h4 className="font-semibold text-foreground mb-2">Start Date</h4>
                            <p className="text-muted-foreground">{new Date(startDate).toLocaleDateString()}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Visibility Settings */}
                    <div className="border rounded-lg p-6">
                      <h4 className="font-semibold text-foreground mb-4">Job Visibility</h4>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="public" defaultChecked />
                          <label htmlFor="public" className="text-sm">
                            Make this job public (visible to all students)
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="featured" />
                          <label htmlFor="featured" className="text-sm">
                            Feature this job (appears at the top of search results)
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="notifications" defaultChecked />
                          <label htmlFor="notifications" className="text-sm">
                            Send me email notifications for applications
                          </label>
                        </div>
                      </div>
                    </div>
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
                    {currentStep === 1 && 'Next: Details'}
                    {currentStep === 2 && 'Next: Expertise'}
                    {currentStep === 3 && 'Next: Budget'}
                    {currentStep === 4 && 'Next: Review'}
                    {currentStep === 5 && 'Reviewed'}
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
    // comprehensive payload
    const payload = {
      title: job.jobTitle,
      description: job.jobDescription,
      projectType: job.projectType,
      projectLength: job.projectLength,
      category: job.jobCategory,
      tags: job.tags,
      educationLevels: job.educationLevels,
      workLocation: job.workLocation,
      studentCount: job.studentCount,
      weeklyHours: job.weeklyHours,
      startDate: job.startDate,
      experienceLevel: job.experienceLevel,
      requiredSkills: job.requiredSkills,
      preferredMajors: job.preferredMajors,
      languages: job.languages,
      budgetType: job.budgetType,
      hourlyRateMin: job.hourlyRateMin,
      hourlyRateMax: job.hourlyRateMax,
      fixedBudget: job.fixedBudget,
      paymentSchedule: job.paymentSchedule
    }
    try{
      const res = await fetch(`${API_BASE}/api/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (!res.ok) return alert(data.error || 'Could not post job')
      alert('Job posted successfully! Job ID: ' + data.id)
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
