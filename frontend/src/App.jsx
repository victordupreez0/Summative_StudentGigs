import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import BrowseJobs from './pages/BrowseJobs';
import PostJob from './pages/PostJob.jsx';
import JobDetails from './pages/JobDetails';
import ApplyJob from './pages/ApplyJob';
import StudentDashboard from './pages/StudentDashboard';
import StudentProfile from './pages/StudentProfile';
import EmployerDashboard from './pages/EmployerDashboard.jsx';
import Dashboard from './pages/Dashboard';
import Applications from './pages/Applications';
import Applicants from './pages/Applicants';
import ApplicationDetail from './pages/ApplicationDetail';
import OpenJobs from './pages/OpenJobs';
import Messages from './pages/Messages';
import NotFound from './pages/NotFound';
import '@radix-ui/themes/styles.css';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected routes: require login */}
        <Route path="/browse-jobs" element={<ProtectedRoute><BrowseJobs /></ProtectedRoute>} />
        <Route path="/open-jobs" element={<ProtectedRoute><OpenJobs /></ProtectedRoute>} />
        <Route path="/post-job" element={<ProtectedRoute><PostJob /></ProtectedRoute>} />
        <Route path="/jobs/:jobId" element={<ProtectedRoute><JobDetails /></ProtectedRoute>} />
        <Route path="/jobs/:jobId/apply" element={<ProtectedRoute><ApplyJob /></ProtectedRoute>} />
        <Route path="/jobs/:jobId/edit" element={<ProtectedRoute><PostJob /></ProtectedRoute>} />
        <Route path="/applications" element={<ProtectedRoute><Applications /></ProtectedRoute>} />
        <Route path="/applicants" element={<ProtectedRoute><Applicants /></ProtectedRoute>} />
        <Route path="/applications/:applicationId" element={<ProtectedRoute><ApplicationDetail /></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
        
        {/* Dashboard routes - smart routing based on user type */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/student-dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
        <Route path="/student-profile" element={<ProtectedRoute><StudentProfile /></ProtectedRoute>} />
        <Route path="/employer-dashboard" element={<ProtectedRoute><EmployerDashboard /></ProtectedRoute>} />

        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<ProtectedRoute><NotFound /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default App;