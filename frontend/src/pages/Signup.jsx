import { useState, useContext, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Eye, EyeOff, Briefcase, User, Upload } from "lucide-react";
import AuthContext from '@/context/AuthContext'
import API_BASE from '@/config/api'

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState(null);
  const [businessName, setBusinessName] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [avatarColor, setAvatarColor] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const auth = useContext(AuthContext)

  // Generate random pastel color on mount
  useEffect(() => {
    const pastelColors = ['#A8E6CF', '#C4A8E6', '#FFB6D9', '#A8D8EA']; // green, purple, pink, blue
    const randomColor = pastelColors[Math.floor(Math.random() * pastelColors.length)];
    setAvatarColor(randomColor);
  }, []);

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate business name for employers
    if (userType === 'hire' && !businessName.trim()) {
      alert('Business name is required for employer accounts');
      return;
    }
    // Call backend signup
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            firstName, 
            lastName, 
            email, 
            password, 
            userType,
            businessName: userType === 'hire' ? businessName : null,
            profilePicture: profilePreview, // Send base64 encoded image
            avatarColor
          })
        });
        const data = await res.json();
        if (!res.ok) {
          alert(data.error || data.message || 'Signup failed');
          return;
        }
  await auth.login({ 
    token: data.token, 
    user: { 
      id: data.id, 
      name: data.name, 
      email: data.email, 
      userType: data.userType,
      businessName: data.businessName,
      profilePicture: data.profilePicture,
      avatarColor: data.avatarColor
    } 
  })
        
        // Redirect to dashboard which will route based on user type
        window.location.href = '/dashboard';
      } catch (err) {
        console.error(err);
        alert('Network error');
      }
    })();
  };
  
  return (
    <div className="min-h-screen bg-background">
  <Navbar />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Create your account</CardTitle>
              <p className="text-muted-foreground">Join StudentGigs to find work or hire talent</p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Social Login Buttons */}
              <div className="space-y-3">
                <Button variant="social" className="w-full" type="button">
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </Button>
                
                <Button variant="social" className="w-full" type="button">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  Continue with Apple
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">or</span>
                </div>
              </div>

              {/* Signup Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-foreground mb-1">
                      First name
                    </label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="First name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-foreground mb-1">
                      Last name
                    </label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
                    Password (8+ characters)
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Profile Picture Upload */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Profile picture (optional)
                  </label>
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl"
                      style={{ backgroundColor: profilePreview ? 'transparent' : avatarColor }}
                    >
                      {profilePreview ? (
                        <img src={profilePreview} alt="Profile" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || '?'
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        id="profilePicture"
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePictureChange}
                        className="hidden"
                      />
                      <label htmlFor="profilePicture">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="cursor-pointer"
                          onClick={() => document.getElementById('profilePicture').click()}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Upload image
                        </Button>
                      </label>
                    </div>
                  </div>
                </div>

                {/* User Type Selection - More Prominent */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">
                    I want to: <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setUserType("hire")}
                      className={`p-6 border-2 rounded-xl transition-all duration-200 ${
                        userType === "hire" 
                          ? "border-blue-600 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg scale-105" 
                          : "border-slate-300 hover:border-blue-400 hover:bg-slate-50"
                      }`}
                    >
                      <Briefcase className={`w-10 h-10 mx-auto mb-3 ${
                        userType === "hire" ? "text-blue-600" : "text-slate-400"
                      }`} />
                      <div className={`text-base font-semibold mb-1 ${
                        userType === "hire" ? "text-blue-900" : "text-slate-700"
                      }`}>
                        Hire for a project
                      </div>
                      <div className="text-xs text-slate-500">Post jobs & find talent</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserType("work")}
                      className={`p-6 border-2 rounded-xl transition-all duration-200 ${
                        userType === "work" 
                          ? "border-purple-600 bg-gradient-to-br from-purple-50 to-purple-100 shadow-lg scale-105" 
                          : "border-slate-300 hover:border-purple-400 hover:bg-slate-50"
                      }`}
                    >
                      <User className={`w-10 h-10 mx-auto mb-3 ${
                        userType === "work" ? "text-purple-600" : "text-slate-400"
                      }`} />
                      <div className={`text-base font-semibold mb-1 ${
                        userType === "work" ? "text-purple-900" : "text-slate-700"
                      }`}>
                        Work as a student
                      </div>
                      <div className="text-xs text-slate-500">Find jobs & earn money</div>
                    </button>
                  </div>
                  {!userType && (
                    <p className="text-xs text-red-500 mt-2">Please select how you want to use StudentGigs</p>
                  )}
                </div>

                {/* Business Name Field - Only for Employers */}
                {userType === "hire" && (
                  <div>
                    <label htmlFor="businessName" className="block text-sm font-medium text-foreground mb-1">
                      Business name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="businessName"
                      type="text"
                      placeholder="Your company or business name"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      required={userType === "hire"}
                    />
                  </div>
                )}

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={agreeToTerms}
                    onCheckedChange={(checked) => setAgreeToTerms(!!checked)}
                    className="mt-1"
                  />
                  <label htmlFor="terms" className="text-sm text-foreground">
                    I agree to the{" "}
                    <Link to="/terms" className="text-primary hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link to="/privacy" className="text-primary hover:underline">
                      Privacy Policy
                    </Link>
                    .
                  </label>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  variant="accent"
                  disabled={!agreeToTerms || !userType}
                >
                  Create my account
                </Button>
              </form>

              <div className="text-center">
                <span className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link to="/login" className="text-primary hover:underline font-medium">
                    Log in
                  </Link>
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Signup;