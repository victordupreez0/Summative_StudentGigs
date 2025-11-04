import { useState, useContext, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useModal } from "@/components/ui/modal";
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
  const auth = useContext(AuthContext);
  const { showAlert, ModalComponent } = useModal();

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
      (async () => {
        await showAlert({
          title: 'Required Field',
          message: 'Business name is required for employer accounts',
          type: 'error'
        });
      })();
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
          await showAlert({
            title: 'Signup Failed',
            message: data.error || data.message || 'Signup failed',
            type: 'error'
          });
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
        await showAlert({
          title: 'Network Error',
          message: 'Unable to connect to the server. Please try again.',
          type: 'error'
        });
      }
    })();
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
  <Navbar />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card className="shadow-sm border-gray-200 bg-white">
            <CardHeader className="text-center">
              <CardTitle className="text-xl font-semibold text-gray-900">Create your account</CardTitle>
              <p className="text-gray-600 text-sm">Join StudentGigs to find work or hire talent</p>
            </CardHeader>
            
            <CardContent className="space-y-6">


              {/* Signup Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-900 mb-1">
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
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-900 mb-1">
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
                  <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-1">
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
                  <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-1">
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
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-600"
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
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Profile picture (optional)
                  </label>
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center text-white font-semibold text-lg"
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
                          className="cursor-pointer border-gray-300 text-gray-700 hover:bg-gray-50"
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
                  <label className="block text-sm font-medium text-gray-900 mb-3">
                    I want to: <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setUserType("hire")}
                      className={`p-6 border-2 rounded-lg transition-all duration-200 ${
                        userType === "hire" 
                          ? "border-purple-600 bg-purple-50 shadow-sm" 
                          : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                      }`}
                    >
                      <Briefcase className={`w-10 h-10 mx-auto mb-3 ${
                        userType === "hire" ? "text-purple-600" : "text-gray-400"
                      }`} />
                      <div className={`text-base font-medium mb-1 ${
                        userType === "hire" ? "text-gray-900" : "text-gray-700"
                      }`}>
                        Hire for a project
                      </div>
                      <div className="text-xs text-gray-500">Post jobs & find talent</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserType("work")}
                      className={`p-6 border-2 rounded-lg transition-all duration-200 ${
                        userType === "work" 
                          ? "border-purple-600 bg-purple-50 shadow-sm" 
                          : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                      }`}
                    >
                      <User className={`w-10 h-10 mx-auto mb-3 ${
                        userType === "work" ? "text-purple-600" : "text-gray-400"
                      }`} />
                      <div className={`text-base font-medium mb-1 ${
                        userType === "work" ? "text-gray-900" : "text-gray-700"
                      }`}>
                        Work as a student
                      </div>
                      <div className="text-xs text-gray-500">Outsource work to students & earn money</div>
                    </button>
                  </div>
                  {!userType && (
                    <p className="text-xs text-red-500 mt-2">Please select how you want to use StudentGigs</p>
                  )}
                </div>

                {/* Business Name Field - Only for Employers */}
                {userType === "hire" && (
                  <div>
                    <label htmlFor="businessName" className="block text-sm font-medium text-gray-900 mb-1">
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
                  <label htmlFor="terms" className="text-sm text-gray-900">
                    I agree to the{" "}
                    <Link to="/terms" className="text-purple-600 hover:text-purple-700 hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link to="/privacy" className="text-purple-600 hover:text-purple-700 hover:underline">
                      Privacy Policy
                    </Link>
                    .
                  </label>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white" 
                  size="lg"
                  disabled={!agreeToTerms || !userType}
                >
                  Create my account
                </Button>
              </form>

              <div className="text-center">
                <span className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link to="/login" className="text-purple-600 hover:text-purple-700 hover:underline font-medium">
                    Log in
                  </Link>
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
      <ModalComponent />
    </div>
  );
};

export default Signup;