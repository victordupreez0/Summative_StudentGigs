import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and description */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-button rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">SG</span>
              </div>
              <span className="text-xl font-bold text-foreground">StudentGigs</span>
            </div>
            <p className="text-muted-foreground text-sm mb-4">
              Connecting students with flexible work opportunities that fit around their studies.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-primary">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>
          
          {/* For Students */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">For Students</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/browse-jobs" className="text-muted-foreground hover:text-primary">Find Work</Link></li>
              <li><Link to="/profile" className="text-muted-foreground hover:text-primary">Create Profile</Link></li>
              <li><Link to="/success-stories" className="text-muted-foreground hover:text-primary">Success Stories</Link></li>
              <li><Link to="/resources" className="text-muted-foreground hover:text-primary">Resources</Link></li>
              <li><Link to="/safety" className="text-muted-foreground hover:text-primary">Safety Tips</Link></li>
            </ul>
          </div>
          
          {/* For Hirers */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">For Hirers</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/post-job" className="text-muted-foreground hover:text-primary">Post a Job</Link></li>
              <li><Link to="/browse-talent" className="text-muted-foreground hover:text-primary">Browse Talent</Link></li>
              <li><Link to="/hiring-guides" className="text-muted-foreground hover:text-primary">Hiring Guides</Link></li>
              <li><Link to="/payment-options" className="text-muted-foreground hover:text-primary">Payment Options</Link></li>
              <li><Link to="/success-stories" className="text-muted-foreground hover:text-primary">Success Stories</Link></li>
            </ul>
          </div>
          
          {/* Support */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/help" className="text-muted-foreground hover:text-primary">Help Center</Link></li>
              <li><Link to="/trust-safety" className="text-muted-foreground hover:text-primary">Trust & Safety</Link></li>
              <li><Link to="/terms" className="text-muted-foreground hover:text-primary">Terms of Service</Link></li>
              <li><Link to="/privacy" className="text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
              <li><Link to="/contact" className="text-muted-foreground hover:text-primary">Contact Us</Link></li>
            </ul>
          </div>
        </div>
        
        {/* Bottom section */}
        <div className="mt-8 pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            © 2023 StudentGigs. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};