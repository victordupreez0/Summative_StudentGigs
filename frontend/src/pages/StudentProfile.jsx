import { useState, useEffect, useContext, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import AuthContext from "@/context/AuthContext";
import API_BASE from "@/config/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
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
  Clock,
  Loader2,
  MessageCircle,
  Copy,
  Check
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const StudentProfile = () => {
  const { userId } = useParams();
  const { user, refreshUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const [userType, setUserType] = useState(null);
  
  // Modal states
  const [showWorkModal, setShowWorkModal] = useState(false);
  const [showEducationModal, setShowEducationModal] = useState(false);
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);
  const [showBioModal, setShowBioModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  
  // Form data states
  const [workForm, setWorkForm] = useState({
    title: "", company: "", location: "", startDate: "", endDate: "", current: false, description: ""
  });
  const [educationForm, setEducationForm] = useState({
    school: "", degree: "", fieldOfStudy: "", startDate: "", endDate: "", current: false, description: ""
  });
  const [skillForm, setSkillForm] = useState({ name: "", level: "Beginner" });
  const [languageForm, setLanguageForm] = useState({ language: "", proficiency: "Basic" });
  const [portfolioForm, setPortfolioForm] = useState({
    title: "", description: "", link: "", startDate: "", endDate: "", technologies: ""
  });
  const [certForm, setCertForm] = useState({
    name: "", issuer: "", issueDate: "", expiryDate: "", credentialId: ""
  });
  const [bioForm, setBioForm] = useState({ bio: "" });
  const [phoneForm, setPhoneForm] = useState({ phone: "" });
  const [photoForm, setPhotoForm] = useState({ 
    photoUrl: "", 
    uploadMethod: "url", // "url" or "file"
    uploading: false,
    previewUrl: ""
  });
  
  // Profile data state
  const [profileData, setProfileData] = useState({
    // Basic Info
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    avatar: "",
    avatarColor: "#1e40af",
    
    // Education
    education: [],
    
    // Work Experience
    workExperience: [],
    
    // Skills
    skills: [],
    
    // Languages
    languages: [],
    
    // Portfolio/Projects
    portfolio: [],
    
    // Completed Jobs (from platform)
    completedJobs: [],
    
    // Certifications
    certifications: [],
    
    // Social Links
    socialLinks: {
      github: "",
      linkedin: "",
      portfolio: "",
      twitter: ""
    },
    
    // Availability
    availability: {
      hoursPerWeek: "",
      startDate: "",
      workType: []
    }
  });

  // Statistics
  const [stats, setStats] = useState({
    totalJobs: 0,
    completedJobs: 0,
    totalEarnings: 0,
    averageRating: 0,
    profileViews: 0,
    responseRate: 0
  });

  // Determine if viewing own profile - memoize to prevent infinite loops
  const isOwnProfile = useMemo(() => {
    return !userId || (user && parseInt(userId) === parseInt(user.id));
  }, [userId, user?.id]);
  
  const targetUserId = userId || user?.id;

  // Check if the logged-in user is an employer viewing their own profile
  useEffect(() => {
    if (isOwnProfile && user?.userType === 'employer') {
      setUserType('employer');
      setLoading(false);
    }
  }, [isOwnProfile, user]);

  useEffect(() => {
    // Skip fetching if already determined to be employer viewing own profile
    if (isOwnProfile && user?.userType === 'employer') {
      return;
    }

    const fetchProfile = async () => {
      if (!targetUserId) {
        setError("User ID not found");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const response = await fetch(`${API_BASE}/api/profiles/${targetUserId}`, {
          headers
        });

        if (!response.ok) {
          throw new Error("Failed to fetch profile");
        }

        const data = await response.json();
        
        // Check if this is an employer account
        if (data.user.userType === 'employer') {
          setUserType('employer');
          setLoading(false);
          return;
        }
        
        setUserType('student');
        
        // Parse name from the user data
        const nameParts = data.user.name.split(' ');
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(' ') || "";
        
        // Parse JSON fields if they come as strings
        const parseJsonField = (field) => {
          if (!field) return [];
          if (typeof field === 'string') {
            try {
              return JSON.parse(field);
            } catch (e) {
              return [];
            }
          }
          return Array.isArray(field) ? field : [];
        };

        const parseSocialLinks = (field) => {
          if (!field) return { github: "", linkedin: "", portfolio: "", twitter: "" };
          if (typeof field === 'string') {
            try {
              return JSON.parse(field);
            } catch (e) {
              return { github: "", linkedin: "", portfolio: "", twitter: "" };
            }
          }
          return field;
        };

        const parseAvailability = (field) => {
          if (!field) return { hoursPerWeek: "", startDate: "", workType: [] };
          if (typeof field === 'string') {
            try {
              return JSON.parse(field);
            } catch (e) {
              return { hoursPerWeek: "", startDate: "", workType: [] };
            }
          }
          return field;
        };

        // Map API response to component state
        setProfileData({
          firstName,
          lastName,
          email: data.user.email,
          phone: data.profile?.phone || "",
          location: data.profile?.location || "",
          bio: data.profile?.bio || "",
          avatar: data.user.profilePicture || "",
          avatarColor: data.user.avatarColor || "#1e40af",
          education: parseJsonField(data.profile?.education),
          workExperience: parseJsonField(data.profile?.work_experience),
          skills: parseJsonField(data.profile?.skills),
          languages: parseJsonField(data.profile?.languages),
          portfolio: parseJsonField(data.profile?.portfolio),
          completedJobs: [], // TODO: Fetch from completed applications
          certifications: parseJsonField(data.profile?.certifications),
          socialLinks: parseSocialLinks(data.profile?.social_links),
          availability: parseAvailability(data.profile?.availability)
        });

        console.log('Profile loaded. Avatar:', data.user.profilePicture ? 'Yes' : 'No');

        setStats({
          totalJobs: data.stats?.totalJobs || 0,
          completedJobs: data.stats?.totalCompletedJobs || 0,
          totalEarnings: data.stats?.totalEarnings || 0,
          averageRating: data.stats?.averageRating || 0,
          profileViews: data.profile?.profile_views || 0,
          responseRate: 0 // TODO: Calculate based on messages
        });

        // Track profile view if viewing someone else's profile
        if (!isOwnProfile) {
          fetch(`${API_BASE}/api/profiles/${targetUserId}/view`, {
            method: 'POST',
            headers
          }).catch(err => console.error("Failed to track view:", err));
        }

        setError(null);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [targetUserId, user?.userType]); // Removed isOwnProfile - it's derived from targetUserId

  // Helper function to auto-save profile changes
  const autoSaveProfile = async (updatedProfileData) => {
    try {
      const token = localStorage.getItem("token");
      const payload = {
        bio: updatedProfileData.bio,
        phone: updatedProfileData.phone,
        location: updatedProfileData.location,
        education: updatedProfileData.education,
        work_experience: updatedProfileData.workExperience,
        skills: updatedProfileData.skills,
        languages: updatedProfileData.languages,
        portfolio: updatedProfileData.portfolio,
        certifications: updatedProfileData.certifications,
        social_links: updatedProfileData.socialLinks,
        availability: updatedProfileData.availability
      };
      
      const response = await fetch(`${API_BASE}/api/profiles/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Auto-save error:', errorData);
        throw new Error(errorData.error || "Failed to auto-save");
      }
      
      console.log('Auto-saved successfully');
      return true;
    } catch (err) {
      console.error("Error auto-saving:", err);
      setErrorMessage("Changes added but failed to save to server");
      setShowErrorModal(true);
      return false;
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      
      const payload = {
        bio: profileData.bio,
        phone: profileData.phone,
        location: profileData.location,
        education: profileData.education,
        work_experience: profileData.workExperience,
        skills: profileData.skills,
        languages: profileData.languages,
        portfolio: profileData.portfolio,
        certifications: profileData.certifications,
        social_links: profileData.socialLinks,
        availability: profileData.availability
      };
      
      console.log('=== SAVING PROFILE ===');
      console.log('Bio:', payload.bio?.substring(0, 50));
      console.log('Work Experience:', payload.work_experience);
      console.log('Skills:', payload.skills);
      console.log('Full payload:', payload);
      
      const response = await fetch(`${API_BASE}/api/profiles/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Save error:', errorData);
        throw new Error(errorData.error || "Failed to update profile");
      }

      const result = await response.json();
      console.log('Save successful:', result);

      // Refetch the profile to ensure we have the latest data
      const profileResponse = await fetch(`${API_BASE}/api/profiles/${targetUserId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (profileResponse.ok) {
        const data = await profileResponse.json();
        console.log('Refetched profile, bio:', data.profile.bio);
        
        // Update profileData with the fresh data from server
        const parseJsonField = (field) => {
          if (!field) return [];
          if (typeof field === 'string') {
            try {
              return JSON.parse(field);
            } catch (e) {
              return [];
            }
          }
          return Array.isArray(field) ? field : [];
        };

        const parseSocialLinks = (field) => {
          if (!field) return { github: "", linkedin: "", portfolio: "", twitter: "" };
          if (typeof field === 'string') {
            try {
              return JSON.parse(field);
            } catch (e) {
              return { github: "", linkedin: "", portfolio: "", twitter: "" };
            }
          }
          return field;
        };

        const parseAvailability = (field) => {
          if (!field) return { workType: [], availability: [], hoursPerWeek: "" };
          if (typeof field === 'string') {
            try {
              return JSON.parse(field);
            } catch (e) {
              return { workType: [], availability: [], hoursPerWeek: "" };
            }
          }
          return field;
        };

        const nameParts = data.user.name.split(' ');
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(' ') || "";

        setProfileData({
          firstName,
          lastName,
          email: data.user.email,
          bio: data.profile.bio || "",
          phone: data.profile.phone || "",
          location: data.profile.location || "",
          avatar: data.user.profilePicture || "",
          avatarColor: data.user.avatarColor || "#1e40af",
          education: parseJsonField(data.profile.education),
          workExperience: parseJsonField(data.profile.work_experience),
          skills: parseJsonField(data.profile.skills),
          languages: parseJsonField(data.profile.languages),
          portfolio: parseJsonField(data.profile.portfolio),
          certifications: parseJsonField(data.profile.certifications),
          socialLinks: parseSocialLinks(data.profile.social_links),
          availability: parseAvailability(data.profile.availability),
          completedJobs: data.profile.completed_jobs || []
        });
      }

      setIsEditing(false);
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Error updating profile:", err);
      setErrorMessage(err.message || "Failed to save profile changes");
      setShowErrorModal(true);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // TODO: Revert changes
  };

  // Handle message button click
  const handleSendMessage = () => {
    if (!user) {
      // If not logged in, redirect to login
      navigate('/login');
      return;
    }
    // Navigate to messages page with the userId as a parameter
    navigate(`/messages?userId=${targetUserId}`);
  };

  // Handle share profile - copy link to clipboard
  const [copied, setCopied] = useState(false);
  const handleShareProfile = async () => {
    const profileUrl = `https://studentgigs.xyz/student-profile/${targetUserId}`;
    
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setSuccessMessage('Profile link copied to clipboard!');
      setShowSuccessModal(true);
      
      // Reset copied state after 3 seconds
      setTimeout(() => {
        setCopied(false);
      }, 3000);
    } catch (err) {
      console.error('Failed to copy:', err);
      setErrorMessage('Failed to copy link to clipboard');
      setShowErrorModal(true);
    }
  };

  // Confirmation helper
  const showConfirmation = (message, action) => {
    setConfirmMessage(message);
    setConfirmAction(() => action);
    setShowConfirmModal(true);
  };

  const handleConfirm = () => {
    if (confirmAction) {
      confirmAction();
    }
    setShowConfirmModal(false);
    setConfirmAction(null);
  };

  // Work Experience handlers
  const openWorkModal = (index = null) => {
    if (index !== null) {
      setWorkForm(profileData.workExperience[index]);
      setEditingIndex(index);
    } else {
      setWorkForm({ title: "", company: "", location: "", startDate: "", endDate: "", current: false, description: "" });
      setEditingIndex(null);
    }
    setShowWorkModal(true);
  };

  const saveWork = async () => {
    const newWork = { ...workForm, id: editingIndex !== null ? profileData.workExperience[editingIndex].id : Date.now() };
    let updated;
    if (editingIndex !== null) {
      updated = [...profileData.workExperience];
      updated[editingIndex] = newWork;
    } else {
      updated = [...profileData.workExperience, newWork];
    }
    
    const updatedProfileData = { ...profileData, workExperience: updated };
    setProfileData(updatedProfileData);
    setShowWorkModal(false);
    
    // Auto-save to database
    await autoSaveProfile(updatedProfileData);
  };

  const deleteWork = (index) => {
    showConfirmation("Are you sure you want to delete this work experience?", () => {
      const updated = profileData.workExperience.filter((_, i) => i !== index);
      setProfileData({ ...profileData, workExperience: updated });
    });
  };

  // Education handlers
  const openEducationModal = (index = null) => {
    if (index !== null) {
      setEducationForm(profileData.education[index]);
      setEditingIndex(index);
    } else {
      setEducationForm({ school: "", degree: "", fieldOfStudy: "", startDate: "", endDate: "", current: false, description: "" });
      setEditingIndex(null);
    }
    setShowEducationModal(true);
  };

  const saveEducation = async () => {
    const newEdu = { ...educationForm, id: editingIndex !== null ? profileData.education[editingIndex].id : Date.now() };
    let updated;
    if (editingIndex !== null) {
      updated = [...profileData.education];
      updated[editingIndex] = newEdu;
    } else {
      updated = [...profileData.education, newEdu];
    }
    const updatedProfileData = { ...profileData, education: updated };
    setProfileData(updatedProfileData);
    setShowEducationModal(false);
    await autoSaveProfile(updatedProfileData);
  };

  const deleteEducation = async (index) => {
    showConfirmation("Are you sure you want to delete this education entry?", async () => {
      const updated = profileData.education.filter((_, i) => i !== index);
      const updatedProfileData = { ...profileData, education: updated };
      setProfileData(updatedProfileData);
      await autoSaveProfile(updatedProfileData);
    });
  };

  // Skills handlers
  const openSkillModal = (index = null) => {
    if (index !== null) {
      setSkillForm(profileData.skills[index]);
      setEditingIndex(index);
    } else {
      setSkillForm({ name: "", level: "Beginner" });
      setEditingIndex(null);
    }
    setShowSkillModal(true);
  };

  const saveSkill = async () => {
    const newSkill = { ...skillForm, id: editingIndex !== null ? profileData.skills[editingIndex].id : Date.now() };
    let updated;
    if (editingIndex !== null) {
      updated = [...profileData.skills];
      updated[editingIndex] = newSkill;
    } else {
      updated = [...profileData.skills, newSkill];
    }
    const updatedProfileData = { ...profileData, skills: updated };
    setProfileData(updatedProfileData);
    setShowSkillModal(false);
    await autoSaveProfile(updatedProfileData);
  };

  const deleteSkill = async (index) => {
    showConfirmation("Are you sure you want to delete this skill?", async () => {
      const updated = profileData.skills.filter((_, i) => i !== index);
      const updatedProfileData = { ...profileData, skills: updated };
      setProfileData(updatedProfileData);
      await autoSaveProfile(updatedProfileData);
    });
  };

  // Language handlers
  const openLanguageModal = (index = null) => {
    if (index !== null) {
      setLanguageForm(profileData.languages[index]);
      setEditingIndex(index);
    } else {
      setLanguageForm({ language: "", proficiency: "Basic" });
      setEditingIndex(null);
    }
    setShowLanguageModal(true);
  };

  const saveLanguage = async () => {
    const newLang = { ...languageForm, id: editingIndex !== null ? profileData.languages[editingIndex].id : Date.now() };
    let updated;
    if (editingIndex !== null) {
      updated = [...profileData.languages];
      updated[editingIndex] = newLang;
    } else {
      updated = [...profileData.languages, newLang];
    }
    const updatedProfileData = { ...profileData, languages: updated };
    setProfileData(updatedProfileData);
    setShowLanguageModal(false);
    await autoSaveProfile(updatedProfileData);
  };

  const deleteLanguage = async (index) => {
    showConfirmation("Are you sure you want to delete this language?", async () => {
      const updated = profileData.languages.filter((_, i) => i !== index);
      const updatedProfileData = { ...profileData, languages: updated };
      setProfileData(updatedProfileData);
      await autoSaveProfile(updatedProfileData);
    });
  };

  // Portfolio handlers
  const openPortfolioModal = (index = null) => {
    if (index !== null) {
      const proj = profileData.portfolio[index];
      setPortfolioForm({ ...proj, technologies: proj.technologies?.join(", ") || "" });
      setEditingIndex(index);
    } else {
      setPortfolioForm({ title: "", description: "", link: "", startDate: "", endDate: "", technologies: "" });
      setEditingIndex(null);
    }
    setShowPortfolioModal(true);
  };

  const savePortfolio = async () => {
    const techArray = portfolioForm.technologies.split(",").map(t => t.trim()).filter(t => t);
    const newProj = { 
      ...portfolioForm, 
      technologies: techArray,
      id: editingIndex !== null ? profileData.portfolio[editingIndex].id : Date.now() 
    };
    let updated;
    if (editingIndex !== null) {
      updated = [...profileData.portfolio];
      updated[editingIndex] = newProj;
    } else {
      updated = [...profileData.portfolio, newProj];
    }
    const updatedProfileData = { ...profileData, portfolio: updated };
    setProfileData(updatedProfileData);
    setShowPortfolioModal(false);
    await autoSaveProfile(updatedProfileData);
  };

  const deletePortfolio = async (index) => {
    showConfirmation("Are you sure you want to delete this project?", async () => {
      const updated = profileData.portfolio.filter((_, i) => i !== index);
      const updatedProfileData = { ...profileData, portfolio: updated };
      setProfileData(updatedProfileData);
      await autoSaveProfile(updatedProfileData);
    });
  };

  // Certification handlers
  const openCertModal = (index = null) => {
    if (index !== null) {
      setCertForm(profileData.certifications[index]);
      setEditingIndex(index);
    } else {
      setCertForm({ name: "", issuer: "", issueDate: "", expiryDate: "", credentialId: "" });
      setEditingIndex(null);
    }
    setShowCertModal(true);
  };

  const saveCert = async () => {
    const newCert = { ...certForm, id: editingIndex !== null ? profileData.certifications[editingIndex].id : Date.now() };
    let updated;
    if (editingIndex !== null) {
      updated = [...profileData.certifications];
      updated[editingIndex] = newCert;
    } else {
      updated = [...profileData.certifications, newCert];
    }
    const updatedProfileData = { ...profileData, certifications: updated };
    setProfileData(updatedProfileData);
    setShowCertModal(false);
    await autoSaveProfile(updatedProfileData);
  };

  const deleteCert = async (index) => {
    showConfirmation("Are you sure you want to delete this certification?", async () => {
      const updated = profileData.certifications.filter((_, i) => i !== index);
      const updatedProfileData = { ...profileData, certifications: updated };
      setProfileData(updatedProfileData);
      await autoSaveProfile(updatedProfileData);
    });
  };

  // Bio handlers
  const openBioModal = () => {
    setBioForm({ bio: profileData.bio || "" });
    setShowBioModal(true);
  };

  const saveBio = async () => {
    console.log('Saving bio to state:', bioForm.bio);
    const updatedProfileData = { ...profileData, bio: bioForm.bio };
    setProfileData(updatedProfileData);
    setShowBioModal(false);

    // Save to database immediately
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/api/profiles/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          bio: bioForm.bio,
          phone: profileData.phone,
          location: profileData.location,
          education: profileData.education,
          work_experience: profileData.workExperience,
          skills: profileData.skills,
          languages: profileData.languages,
          portfolio: profileData.portfolio,
          certifications: profileData.certifications,
          social_links: profileData.socialLinks,
          availability: profileData.availability
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Save error:', errorData);
        throw new Error(errorData.error || "Failed to update bio");
      }

      console.log('Bio saved successfully to database');
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Error saving bio:", err);
      setErrorMessage(err.message || "Failed to save bio");
      setShowErrorModal(true);
    }
  };

  // Phone handlers
  const openPhoneModal = () => {
    setPhoneForm({ phone: profileData.phone || "" });
    setShowPhoneModal(true);
  };

  const savePhone = async () => {
    console.log('Saving phone to state:', phoneForm.phone);
    const updatedProfileData = { ...profileData, phone: phoneForm.phone };
    setProfileData(updatedProfileData);
    setShowPhoneModal(false);

    // Save to database immediately
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/api/profiles/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          bio: profileData.bio,
          phone: phoneForm.phone,
          location: profileData.location,
          education: profileData.education,
          work_experience: profileData.workExperience,
          skills: profileData.skills,
          languages: profileData.languages,
          portfolio: profileData.portfolio,
          certifications: profileData.certifications,
          social_links: profileData.socialLinks,
          availability: profileData.availability
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Save error:', errorData);
        throw new Error(errorData.error || "Failed to update phone");
      }

      console.log('Phone saved successfully to database');
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Error saving phone:", err);
      setErrorMessage(err.message || "Failed to save phone");
      setShowErrorModal(true);
    }
  };

  const savePhoto = async () => {
    const photoToSave = photoForm.uploadMethod === "file" ? photoForm.previewUrl : photoForm.photoUrl;
    
    if (!photoToSave) {
      setErrorMessage("Please provide a photo URL or upload a file");
      setShowErrorModal(true);
      return;
    }

    console.log('Saving photo:', photoToSave.substring(0, 100) + '...');
    setPhotoForm({ ...photoForm, uploading: true });

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/api/profiles/me/photo`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          profilePicture: photoToSave
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile picture");
      }

      const result = await response.json();
      console.log('Photo save result:', result);
      
      // Update local state with new profile picture
      setProfileData({ ...profileData, avatar: photoToSave });
      console.log('Updated profileData.avatar to:', photoToSave.substring(0, 100) + '...');
      
      // Refresh user context so the photo shows everywhere (navbar, etc.)
      if (refreshUser) {
        await refreshUser();
        console.log('User context refreshed');
      }
      
      // Close modal and reset form
      setShowPhotoModal(false);
      setPhotoForm({ 
        photoUrl: "", 
        uploadMethod: "url",
        uploading: false,
        previewUrl: ""
      });
      
      setSuccessMessage("Profile picture updated successfully!");
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Error saving photo:", err);
      setErrorMessage(err.message || "Failed to save profile picture");
      setShowErrorModal(true);
      setPhotoForm({ ...photoForm, uploading: false });
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage("Please upload a valid image file (JPG, PNG, GIF, or WebP)");
      setShowErrorModal(true);
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      setErrorMessage("File size must be less than 5MB");
      setShowErrorModal(true);
      return;
    }

    // Convert to base64 with compression
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Resize to max 800x800
        let width = img.width;
        let height = img.height;
        const maxDimension = 800;
        
        if (width > height && width > maxDimension) {
          height = (height / width) * maxDimension;
          width = maxDimension;
        } else if (height > maxDimension) {
          width = (width / height) * maxDimension;
          height = maxDimension;
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        // Compress to JPEG at 80% quality
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
        
        console.log('Original:', Math.round(file.size/1024), 'KB, Compressed:', Math.round(compressedBase64.length/1024), 'KB');
        
        setPhotoForm({
          ...photoForm,
          photoUrl: compressedBase64,
          previewUrl: compressedBase64,
          uploadMethod: "file"
        });
      };
      img.src = reader.result;
    };
    reader.onerror = () => {
      setErrorMessage("Failed to read file");
      setShowErrorModal(true);
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error: {error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Show coming soon message for employer accounts
  if (userType === 'employer') {
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
                to="/employer-dashboard" 
                className="text-sm font-medium text-gray-600 hover:text-gray-900 py-5"
              >
                Dashboard
              </Link>
              <Link 
                to="/open-jobs" 
                className="text-sm font-medium text-gray-600 hover:text-gray-900 py-5"
              >
                Open Jobs
              </Link>
              <Link 
                to="/applicants" 
                className="text-sm font-medium text-gray-600 hover:text-gray-900 py-5"
              >
                Applicants
              </Link>
              <Link 
                to="/messages" 
                className="text-sm font-medium text-gray-600 hover:text-gray-900 py-5"
              >
                Messages
              </Link>
              <Link 
                to="/profile" 
                className="text-sm font-medium text-gray-900 border-b-2 border-purple-600 py-2"
              >
                Profile
              </Link>
            </nav>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-16">
          <Card className="border-gray-200 bg-white">
            <CardContent className="p-12 text-center">
              <div className="mb-6">
                <User className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Employer Profile</h1>
                <p className="text-xl text-gray-600 mb-8">Employer account editing coming soon</p>
              </div>
              <div className="max-w-md mx-auto text-left space-y-4">
                <p className="text-gray-600">
                  We're currently working on employer profile features. Soon you'll be able to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Edit your company information</li>
                  <li>Upload company logo and branding</li>
                  <li>Add company description and culture details</li>
                  <li>Showcase your team and office locations</li>
                  <li>Highlight your company values and benefits</li>
                </ul>
              </div>
              <div className="mt-8 flex gap-4 justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/employer-dashboard')}
                >
                  Go to Dashboard
                </Button>
                <Button onClick={() => navigate('/post-job')}>
                  Post a Job
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Footer />
      </div>
    );
  }

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
              to="/student-dashboard" 
              className="text-sm font-medium text-gray-600 hover:text-gray-900 py-5"
            >
              Dashboard
            </Link>
            <Link 
              to="/open-jobs" 
              className="text-sm font-medium text-gray-600 hover:text-gray-900 py-5"
            >
              Open Jobs
            </Link>
            <Link 
              to="/applicants" 
              className="text-sm font-medium text-gray-600 hover:text-gray-900 py-5"
            >
              Applicants
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
              className="text-sm font-medium text-gray-900 border-b-2 border-purple-600 py-2"
            >
              Profile
            </Link>
          </nav>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-6">
              <div className="relative">
                <Avatar 
                  className="w-24 h-24 border-2 border-gray-200 shadow-sm bg-transparent"
                >
                  <AvatarImage src={profileData.avatar} />
                  <AvatarFallback 
                    className="text-white text-2xl font-medium"
                    style={{ backgroundColor: profileData.avatarColor }}
                  >
                    {profileData.firstName[0]}{profileData.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                {isOwnProfile && user && isEditing && (
                  <Button
                    size="sm"
                    className="absolute bottom-0 right-0 rounded-full w-10 h-10 p-0 shadow-md hover:shadow-lg transition-shadow z-20 bg-purple-600 hover:bg-purple-700 text-white"
                    onClick={() => {
                      console.log('Edit button clicked, opening photo modal');
                      setShowPhotoModal(true);
                    }}
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
                  {profileData.phone ? (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>{profileData.phone}</span>
                      {isEditing && isOwnProfile && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-7 px-2 border-gray-300 hover:bg-gray-100"
                          onClick={openPhoneModal}
                        >
                          <Edit2 className="w-3.5 h-3.5 mr-1" />
                          <span className="text-xs">Edit</span>
                        </Button>
                      )}
                    </div>
                  ) : (
                    isOwnProfile && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-7 text-xs"
                        onClick={openPhoneModal}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add Phone Number
                      </Button>
                    )
                  )}
                  {profileData.location && (
                    <div className="flex items-center gap-1">
                      {profileData.location}
                    </div>
                  )}
                </div>
                
                {profileData.bio ? (
                  <div className="flex items-start gap-2">
                    <p className="text-gray-700 max-w-2xl text-sm flex-1">
                      {profileData.bio}
                    </p>
                    {isEditing && isOwnProfile && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-7 px-2 border-gray-300 hover:bg-gray-100"
                        onClick={openBioModal}
                      >
                        <Edit2 className="w-3.5 h-3.5 mr-1" />
                        <span className="text-xs">Edit</span>
                      </Button>
                    )}
                  </div>
                ) : (
                  isOwnProfile && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="mb-4"
                      onClick={openBioModal}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Bio
                    </Button>
                  )
                )}
                
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
            
            {!loading && isOwnProfile && (
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
            )}
            
            {!loading && !isOwnProfile && (
              <div className="flex flex-col gap-2">
                <Button onClick={handleSendMessage} className="bg-purple-600 hover:bg-purple-700">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </div>
            )}
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
                  <p className="text-xl font-semibold text-gray-900">{stats.averageRating.toFixed(1)}</p>
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
                  {isOwnProfile && (
                    <Button size="sm" variant="ghost" onClick={() => openEducationModal()}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {profileData.education.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">
                    No education added yet.{isOwnProfile && " Click + to add."}
                  </p>
                ) : (
                  profileData.education.map((edu, index) => (
                      <div key={edu.id} className="relative border-l-2 border-gray-300 pl-6 pb-6 last:pb-0">
                        <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-gray-600 border-2 border-white" />
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-base">{edu.degree}</h3>
                            <p className="text-gray-600 text-sm">{edu.school}</p>
                            {edu.fieldOfStudy && <p className="text-gray-500 text-sm">{edu.fieldOfStudy}</p>}
                          </div>
                          {isEditing && (
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost" onClick={() => openEducationModal(index)}>
                                <Edit2 className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="ghost" className="text-red-600" onClick={() => deleteEducation(index)}>
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
                        </div>
                        {edu.description && <p className="text-gray-700">{edu.description}</p>}
                      </div>
                    ))
                  )}
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
                  {isOwnProfile && (
                    <Button size="sm" variant="ghost" onClick={() => openWorkModal()}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {profileData.workExperience.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">
                    No work experience added yet.{isOwnProfile && " Click + to add."}
                  </p>
                ) : (
                  profileData.workExperience.map((exp, index) => (
                    <div key={exp.id} className="relative border-l-2 border-gray-300 pl-6 pb-6 last:pb-0">
                      <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-gray-600 border-2 border-white" />
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-base">{exp.title}</h3>
                          <p className="text-gray-600 text-sm">{exp.company}</p>
                        </div>
                        {isEditing && (
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" onClick={() => openWorkModal(index)}>
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-red-600" onClick={() => deleteWork(index)}>
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
                  ))
                )}
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
                  {isOwnProfile && (
                    <Button size="sm" variant="ghost" onClick={() => openPortfolioModal()}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {profileData.portfolio.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">
                    No projects added yet.{isOwnProfile && " Click + to add."}
                  </p>
                ) : (
                  profileData.portfolio.map((project, index) => (
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
                            <Button size="sm" variant="ghost" onClick={() => openPortfolioModal(index)}>
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-red-600" onClick={() => deletePortfolio(index)}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                      <p className="text-gray-700 mb-3">{project.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {project.technologies && project.technologies.map((tech, idx) => (
                          <Badge key={idx} variant="secondary">{tech}</Badge>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Completed Jobs Section */}
            {profileData.completedJobs.length > 0 && (
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
            )}

            {/* Certifications Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base font-semibold">
                    <Award className="w-4 h-4 text-gray-600" />
                    Certifications
                  </CardTitle>
                  {isOwnProfile && (
                    <Button size="sm" variant="ghost" onClick={() => openCertModal()}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {profileData.certifications.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">
                    No certifications added yet.{isOwnProfile && " Click + to add."}
                  </p>
                ) : (
                  profileData.certifications.map((cert, index) => (
                    <div key={cert.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-sm">{cert.name}</h3>
                          <p className="text-gray-600 text-sm">{cert.issuer}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            Issued: {cert.issueDate} {cert.expiryDate && `| Expires: ${cert.expiryDate}`}
                          </p>
                          {cert.credentialId && (
                            <p className="text-xs text-gray-400 mt-1">
                              Credential ID: {cert.credentialId}
                            </p>
                          )}
                        </div>
                        {isEditing && (
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" onClick={() => openCertModal(index)}>
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-red-600" onClick={() => deleteCert(index)}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
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
                  {isOwnProfile && (
                    <Button size="sm" variant="ghost" onClick={() => openSkillModal()}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {profileData.skills.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-4">
                      No skills added yet.{isOwnProfile && " Click + to add."}
                    </p>
                  ) : (
                    profileData.skills.map((skill, index) => (
                      <div key={skill.id}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{skill.name}</span>
                          <div className="flex items-center gap-1">
                            <Badge variant="outline" className="text-xs">
                              {skill.level}
                            </Badge>
                            {isEditing && (
                              <>
                                <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => openSkillModal(index)}>
                                  <Edit2 className="w-3 h-3" />
                                </Button>
                                <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-red-600" onClick={() => deleteSkill(index)}>
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </>
                            )}
                          </div>
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
                    ))
                  )}
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
                  {isOwnProfile && (
                    <Button size="sm" variant="ghost" onClick={() => openLanguageModal()}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {profileData.languages.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-4">
                      No languages added yet.{isOwnProfile && " Click + to add."}
                    </p>
                  ) : (
                    profileData.languages.map((lang, index) => (
                      <div key={lang.id} className="flex items-center justify-between">
                        <span className="font-medium">{lang.language}</span>
                        <div className="flex items-center gap-1">
                          <Badge variant="secondary">{lang.proficiency}</Badge>
                          {isEditing && (
                            <>
                              <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => openLanguageModal(index)}>
                                <Edit2 className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-red-600" onClick={() => deleteLanguage(index)}>
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Availability Section */}
            {(profileData.availability.hoursPerWeek || profileData.availability.startDate || (profileData.availability.workType && profileData.availability.workType.length > 0)) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                    <Clock className="w-4 h-4 text-gray-600" />
                    Availability
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {profileData.availability.hoursPerWeek && (
                    <>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Hours per week</p>
                        <p className="font-semibold">{profileData.availability.hoursPerWeek} hours</p>
                      </div>
                      <Separator />
                    </>
                  )}
                  {profileData.availability.startDate && (
                    <>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Start date</p>
                        <p className="font-semibold">{profileData.availability.startDate}</p>
                      </div>
                      <Separator />
                    </>
                  )}
                  {profileData.availability.workType && profileData.availability.workType.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Work type</p>
                      <div className="flex flex-wrap gap-2">
                        {profileData.availability.workType.map((type, idx) => (
                          <Badge key={idx} variant="outline">{type}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            {!loading && isOwnProfile && (
              <Card className="bg-gray-50 border-gray-200">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full justify-start" variant="outline">
                    <FileText className="w-4 h-4 mr-2" />
                    Download Resume
                  </Button>
                  <Button className="w-full justify-start" variant="outline" onClick={handleShareProfile}>
                    {copied ? <Check className="w-4 h-4 mr-2 text-green-600" /> : <Copy className="w-4 h-4 mr-2" />}
                    {copied ? 'Link Copied!' : 'Share Profile'}
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Briefcase className="w-4 h-4 mr-2" />
                    Browse Jobs
                  </Button>
                </CardContent>
              </Card>
            )}
            
            {!loading && !isOwnProfile && (
              <Card className="bg-gray-50 border-gray-200">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full justify-start bg-purple-600 hover:bg-purple-700 text-white" onClick={handleSendMessage}>
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                  <Button className="w-full justify-start" variant="outline" onClick={handleShareProfile}>
                    {copied ? <Check className="w-4 h-4 mr-2 text-green-600" /> : <Copy className="w-4 h-4 mr-2" />}
                    {copied ? 'Link Copied!' : 'Share Profile'}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Work Experience Modal */}
      {showWorkModal && (
        <Modal isOpen={showWorkModal} onClose={() => setShowWorkModal(false)} title={editingIndex !== null ? "Edit Work Experience" : "Add Work Experience"}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Job Title *</label>
              <Input value={workForm.title} onChange={(e) => setWorkForm({...workForm, title: e.target.value})} placeholder="e.g. Software Engineer" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Company *</label>
              <Input value={workForm.company} onChange={(e) => setWorkForm({...workForm, company: e.target.value})} placeholder="e.g. Tech Corp" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Location *</label>
              <Input value={workForm.location} onChange={(e) => setWorkForm({...workForm, location: e.target.value})} placeholder="e.g. Remote, Cape Town" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Start Date *</label>
                <Input type="month" value={workForm.startDate} onChange={(e) => setWorkForm({...workForm, startDate: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Date</label>
                <Input type="month" value={workForm.endDate} onChange={(e) => setWorkForm({...workForm, endDate: e.target.value})} disabled={workForm.current} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox checked={workForm.current} onCheckedChange={(checked) => setWorkForm({...workForm, current: checked, endDate: checked ? "" : workForm.endDate})} />
              <label className="text-sm">I currently work here</label>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Textarea value={workForm.description} onChange={(e) => setWorkForm({...workForm, description: e.target.value})} placeholder="Describe your responsibilities and achievements..." rows={4} />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowWorkModal(false)}>Cancel</Button>
              <Button onClick={saveWork}>Save</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Education Modal */}
      {showEducationModal && (
        <Modal isOpen={showEducationModal} onClose={() => setShowEducationModal(false)} title={editingIndex !== null ? "Edit Education" : "Add Education"}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">School/University *</label>
              <Input value={educationForm.school} onChange={(e) => setEducationForm({...educationForm, school: e.target.value})} placeholder="e.g. University of Cape Town" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Degree *</label>
              <Input value={educationForm.degree} onChange={(e) => setEducationForm({...educationForm, degree: e.target.value})} placeholder="e.g. Bachelor's Degree" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Field of Study *</label>
              <Input value={educationForm.fieldOfStudy} onChange={(e) => setEducationForm({...educationForm, fieldOfStudy: e.target.value})} placeholder="e.g. Computer Science" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Start Date *</label>
                <Input type="month" value={educationForm.startDate} onChange={(e) => setEducationForm({...educationForm, startDate: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Date</label>
                <Input type="month" value={educationForm.endDate} onChange={(e) => setEducationForm({...educationForm, endDate: e.target.value})} disabled={educationForm.current} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox checked={educationForm.current} onCheckedChange={(checked) => setEducationForm({...educationForm, current: checked, endDate: checked ? "" : educationForm.endDate})} />
              <label className="text-sm">I currently study here</label>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Textarea value={educationForm.description} onChange={(e) => setEducationForm({...educationForm, description: e.target.value})} placeholder="Extra details..." rows={3} />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowEducationModal(false)}>Cancel</Button>
              <Button onClick={saveEducation}>Save</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Skill Modal */}
      {showSkillModal && (
        <Modal isOpen={showSkillModal} onClose={() => setShowSkillModal(false)} title={editingIndex !== null ? "Edit Skill" : "Add Skill"}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Skill Name *</label>
              <Input value={skillForm.name} onChange={(e) => setSkillForm({...skillForm, name: e.target.value})} placeholder="e.g. React, Python, Design" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Proficiency Level *</label>
              <select 
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={skillForm.level} 
                onChange={(e) => setSkillForm({...skillForm, level: e.target.value})}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowSkillModal(false)}>Cancel</Button>
              <Button onClick={saveSkill}>Save</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Language Modal */}
      {showLanguageModal && (
        <Modal isOpen={showLanguageModal} onClose={() => setShowLanguageModal(false)} title={editingIndex !== null ? "Edit Language" : "Add Language"}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Language *</label>
              <Input value={languageForm.language} onChange={(e) => setLanguageForm({...languageForm, language: e.target.value})} placeholder="e.g. English, Spanish" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Proficiency *</label>
              <select 
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={languageForm.proficiency} 
                onChange={(e) => setLanguageForm({...languageForm, proficiency: e.target.value})}
              >
                <option value="Basic">Basic</option>
                <option value="Conversational">Conversational</option>
                <option value="Fluent">Fluent</option>
                <option value="Native">Native</option>
              </select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowLanguageModal(false)}>Cancel</Button>
              <Button onClick={saveLanguage}>Save</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Portfolio Modal */}
      {showPortfolioModal && (
        <Modal isOpen={showPortfolioModal} onClose={() => setShowPortfolioModal(false)} title={editingIndex !== null ? "Edit Project" : "Add Project"}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Project Title *</label>
              <Input value={portfolioForm.title} onChange={(e) => setPortfolioForm({...portfolioForm, title: e.target.value})} placeholder="e.g. E-commerce Website" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description *</label>
              <Textarea value={portfolioForm.description} onChange={(e) => setPortfolioForm({...portfolioForm, description: e.target.value})} placeholder="Describe the project..." rows={3} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Project Link</label>
              <Input value={portfolioForm.link} onChange={(e) => setPortfolioForm({...portfolioForm, link: e.target.value})} placeholder="https://..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <Input type="month" value={portfolioForm.startDate} onChange={(e) => setPortfolioForm({...portfolioForm, startDate: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Date</label>
                <Input type="month" value={portfolioForm.endDate} onChange={(e) => setPortfolioForm({...portfolioForm, endDate: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Technologies</label>
              <Input value={portfolioForm.technologies} onChange={(e) => setPortfolioForm({...portfolioForm, technologies: e.target.value})} placeholder="e.g. React, Node.js, MongoDB (comma-separated)" />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowPortfolioModal(false)}>Cancel</Button>
              <Button onClick={savePortfolio}>Save</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Certification Modal */}
      {showCertModal && (
        <Modal isOpen={showCertModal} onClose={() => setShowCertModal(false)} title={editingIndex !== null ? "Edit Certification" : "Add Certification"}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Certification Name *</label>
              <Input value={certForm.name} onChange={(e) => setCertForm({...certForm, name: e.target.value})} placeholder="e.g. AWS Certified Developer" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Issuing Organization *</label>
              <Input value={certForm.issuer} onChange={(e) => setCertForm({...certForm, issuer: e.target.value})} placeholder="e.g. Amazon Web Services" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Issue Date *</label>
                <Input type="month" value={certForm.issueDate} onChange={(e) => setCertForm({...certForm, issueDate: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Expiry Date</label>
                <Input type="month" value={certForm.expiryDate} onChange={(e) => setCertForm({...certForm, expiryDate: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Credential ID</label>
              <Input value={certForm.credentialId} onChange={(e) => setCertForm({...certForm, credentialId: e.target.value})} placeholder="e.g. ABC123XYZ" />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowCertModal(false)}>Cancel</Button>
              <Button onClick={saveCert}>Save</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <Modal 
          isOpen={showSuccessModal} 
          onClose={() => setShowSuccessModal(false)} 
          title="Success!" 
          type="success"
        >
          <div className="space-y-4">
            <p className="text-gray-700">{successMessage || 'Your profile has been updated successfully!'}</p>
            <div className="flex justify-end">
              <Button onClick={() => setShowSuccessModal(false)}>OK</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <Modal 
          isOpen={showErrorModal} 
          onClose={() => setShowErrorModal(false)} 
          title="Error" 
          type="error"
        >
          <div className="space-y-4">
            <p className="text-gray-700">{errorMessage}</p>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowErrorModal(false)}>Close</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <Modal 
          isOpen={showConfirmModal} 
          onClose={() => setShowConfirmModal(false)} 
          title="Confirm Action" 
          type="alert"
        >
          <div className="space-y-4">
            <p className="text-gray-700">{confirmMessage}</p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowConfirmModal(false)}>Cancel</Button>
              <Button onClick={handleConfirm} className="bg-red-600 hover:bg-red-700">Delete</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Bio Modal */}
      {showBioModal && (
        <Modal 
          isOpen={showBioModal} 
          onClose={() => setShowBioModal(false)} 
          title="Edit Bio"
        >
          <div className="space-y-4">
            <Textarea 
              placeholder="Tell us about yourself..."
              value={bioForm.bio}
              onChange={(e) => setBioForm({ bio: e.target.value })}
              rows={5}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowBioModal(false)}>Cancel</Button>
              <Button onClick={saveBio}>Save</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Phone Modal */}
      {showPhoneModal && (
        <Modal 
          isOpen={showPhoneModal} 
          onClose={() => setShowPhoneModal(false)} 
          title="Edit Phone Number"
        >
          <div className="space-y-4">
            <Input 
              type="tel"
              placeholder="Enter your phone number"
              value={phoneForm.phone}
              onChange={(e) => setPhoneForm({ phone: e.target.value })}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowPhoneModal(false)}>Cancel</Button>
              <Button onClick={savePhone}>Save</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Profile Photo Modal */}
      {showPhotoModal && (
        <Modal 
          isOpen={showPhotoModal} 
          onClose={() => {
            setShowPhotoModal(false);
            setPhotoForm({ 
              photoUrl: "", 
              uploadMethod: "url",
              uploading: false,
              previewUrl: ""
            });
          }} 
          title="Update Profile Picture"
        >
          <div className="space-y-4">
            {/* Tab Selection */}
            <div className="flex gap-2 border-b border-gray-200">
              <button
                className={`px-4 py-2 font-medium text-sm transition-colors ${
                  photoForm.uploadMethod === "url"
                    ? "border-b-2 border-purple-600 text-purple-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                onClick={() => setPhotoForm({ 
                  ...photoForm, 
                  uploadMethod: "url",
                  previewUrl: ""
                })}
              >
                Enter URL
              </button>
              <button
                className={`px-4 py-2 font-medium text-sm transition-colors ${
                  photoForm.uploadMethod === "file"
                    ? "border-b-2 border-purple-600 text-purple-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                onClick={() => setPhotoForm({ 
                  ...photoForm, 
                  uploadMethod: "file",
                  photoUrl: ""
                })}
              >
                Upload File
              </button>
            </div>

            {/* URL Input */}
            {photoForm.uploadMethod === "url" && (
              <div className="space-y-3">
                <div className="text-sm text-gray-600">
                  Enter the URL of your profile picture. Supported formats: JPG, PNG, GIF, WebP
                </div>
                <Input 
                  type="url"
                  placeholder="https://example.com/your-photo.jpg"
                  value={photoForm.photoUrl}
                  onChange={(e) => setPhotoForm({ ...photoForm, photoUrl: e.target.value })}
                />
              </div>
            )}

            {/* File Upload */}
            {photoForm.uploadMethod === "file" && (
              <div className="space-y-3">
                <div className="text-sm text-gray-600">
                  Upload an image from your device. Max size: 5MB. Supported formats: JPG, PNG, GIF, WebP
                </div>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label
                    htmlFor="photo-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <User className="w-12 h-12 text-gray-400 mb-2" />
                    <span className="text-sm font-medium text-gray-700">
                      Click to upload image
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      JPG, PNG, GIF, or WebP (max 5MB)
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Preview */}
            {((photoForm.uploadMethod === "url" && photoForm.photoUrl) || 
              (photoForm.uploadMethod === "file" && photoForm.previewUrl)) && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium mb-3">Preview:</div>
                <div className="flex items-center gap-4">
                  <Avatar className="w-24 h-24 border-2 border-gray-200">
                    <AvatarImage 
                      src={photoForm.uploadMethod === "file" ? photoForm.previewUrl : photoForm.photoUrl} 
                    />
                    <AvatarFallback className="bg-gray-100 text-gray-700">
                      Preview
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-xs text-gray-600">
                    {photoForm.uploadMethod === "file" 
                      ? "Your uploaded image" 
                      : "Image from URL"}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 justify-end pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowPhotoModal(false);
                  setPhotoForm({ 
                    photoUrl: "", 
                    uploadMethod: "url",
                    uploading: false,
                    previewUrl: ""
                  });
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={savePhoto}
                disabled={
                  photoForm.uploading || 
                  (photoForm.uploadMethod === "url" && !photoForm.photoUrl) ||
                  (photoForm.uploadMethod === "file" && !photoForm.previewUrl)
                }
              >
                {photoForm.uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Save'
                )}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      <Footer />
    </div>
  );
};

export default StudentProfile;
