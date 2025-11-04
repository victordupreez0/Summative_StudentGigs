import { useState, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useModal } from "@/components/ui/modal";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Eye, EyeOff } from "lucide-react";
import AuthContext from '@/context/AuthContext'
import API_BASE from '@/config/api'

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const auth = useContext(AuthContext);
  const { showAlert, ModalComponent } = useModal();

  const handleSubmit = (e) => {
    e.preventDefault();
  (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) {
          await showAlert({
            title: 'Login Failed',
            message: data.error || data.message || 'Login failed',
            type: 'error'
          });
          return;
        }
        // use AuthContext to set token/user
        await auth.login({ token: data.token, user: { id: data.id, name: data.name, email: data.email, userType: data.userType } })
        
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
              <CardTitle className="text-xl font-semibold text-gray-900">Log in to StudentGigs</CardTitle>
              <p className="text-gray-600 text-sm">Find gigs or hire students for your projects</p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-1">
                    Email or Username
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email or username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-900">
                      Password
                    </label>
                    <Link to="/forgot-password" className="text-sm text-purple-600 hover:text-purple-700 hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
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

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(!!checked)}
                  />
                  <label htmlFor="remember" className="text-sm text-gray-900">
                    Remember me
                  </label>
                </div>

                <Button type="submit" className="w-full bg-gray-900 hover:bg-gray-800 text-white" size="lg">
                  Log in
                </Button>
              </form>

              <div className="text-center">
                <span className="text-sm text-gray-600">
                  Don't have an account?{" "}
                  <Link to="/signup" className="text-purple-600 hover:text-purple-700 hover:underline font-medium">
                    Sign up
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

export default Login;