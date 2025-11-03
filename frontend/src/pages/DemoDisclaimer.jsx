import { AlertTriangle, ArrowLeft, ShieldAlert, XCircle, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DemoDisclaimer = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex flex-col">
      {/* Simple Header for Demo Disclaimer */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <img 
              src="/logo.png" 
              alt="StudentGigs Logo" 
              className="h-10 w-auto transition-transform duration-200 group-hover:scale-105"
            />
          </Link>
          <Link to="/">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              Back to Home
            </Button>
          </Link>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link to="/" className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>

          {/* Main Warning Card */}
          <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg mb-8">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-500 rounded-lg">
                  <AlertTriangle className="w-8 h-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
                    Important: Demo Application Notice
                  </CardTitle>
                  <p className="text-lg text-gray-700">
                    Please read this carefully before using this platform
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Key Warning Points */}
              <div className="bg-white rounded-lg p-6 space-y-4 border-2 border-amber-300">
                <div className="flex items-start gap-3">
                  <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Non-Functional Demo</h3>
                    <p className="text-gray-700">
                      This is a <strong>demonstration application</strong> created for portfolio and testing purposes only. 
                      It is <strong>NOT</strong> a real job platform and should not be used for actual employment purposes.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">No Real Jobs</h3>
                    <p className="text-gray-700">
                      All job listings displayed on this platform are <strong>fictional</strong> and for demonstration purposes only. 
                      They do not represent real employment opportunities. Do not apply expecting genuine job placements.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <ShieldAlert className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">No Payments Should Be Made</h3>
                    <p className="text-gray-700">
                      <strong>DO NOT make any payments</strong> for jobs listed on this platform. This is a demo site only. 
                      Any request for payment should be considered fraudulent and reported immediately.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Info className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Testing & Development Purpose</h3>
                    <p className="text-gray-700">
                      This platform was developed to showcase web development skills and demonstrate the functionality 
                      of a job marketplace application. All features are for demonstration and testing purposes only.
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-3 text-xl">What This Means for Users</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-1">•</span>
                    <span>Feel free to explore all features and functionality of the platform</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-1">•</span>
                    <span>You may create test accounts and interact with demo content</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-1">•</span>
                    <span>Do not share real personal information or sensitive data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-1">•</span>
                    <span>Any data entered may be visible to other demo users</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-1">•</span>
                    <span>This platform may be reset or taken offline at any time</span>
                  </li>
                </ul>
              </div>

              {/* Legal Disclaimer */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-300">
                <h3 className="font-bold text-gray-900 mb-3 text-xl">Legal Disclaimer</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  By using this demonstration platform, you acknowledge and agree that:
                </p>
                <ul className="mt-3 space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="mt-1">1.</span>
                    <span>This is a non-commercial demonstration project with no real business operations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1">2.</span>
                    <span>No employment contracts, agreements, or obligations are created through this platform</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1">3.</span>
                    <span>The developers and operators of this platform bear no responsibility for any misunderstandings regarding its demo nature</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1">4.</span>
                    <span>You will not use this platform for any real commercial or employment purposes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1">5.</span>
                    <span>You understand that any "transactions" or "applications" are purely simulated</span>
                  </li>
                </ul>
              </div>

              {/* Contact Info (Optional) */}
              <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
                <h3 className="font-bold text-gray-900 mb-2">Questions or Concerns?</h3>
                <p className="text-gray-700">
                  If you have any questions about this demo platform or would like to report any issues, 
                  please use the feedback or error reporting features within the application.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-4">
            <Link to="/">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 text-lg">
                I Understand - Continue to Demo
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-6">
        <div className="container mx-auto px-6 text-center text-sm text-gray-600">
          <p>StudentGigs Demo Application © 2025</p>
        </div>
      </footer>
    </div>
  );
};

export default DemoDisclaimer;
