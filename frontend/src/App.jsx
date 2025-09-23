import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import BrowseJobs from './pages/BrowseJobs';
import PostJob from './pages/PostJob.jsx';
import StudentDashboard from './pages/StudentDashboard';
import EmployerDashboard from './pages/EmployerDashboard.jsx';
import NotFound from './pages/NotFound';
import '@radix-ui/themes/styles.css';

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/browse-jobs" element={<BrowseJobs />} />
      <Route path="/post-job" element={<PostJob />} />
      <Route path="/dashboard" element={<StudentDashboard />} />
      <Route path="/employer-dashboard" element={<EmployerDashboard />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

export default App;