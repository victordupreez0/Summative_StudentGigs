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
              {/* Social Login Buttons */}
              <div className="space-y-3">
                <Button variant="outline" className="w-full text-gray-700" type="button">
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">or</span>
                </div>
              </div>

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
      {ModalComponent}
    </div>
  );
};

export default Login;