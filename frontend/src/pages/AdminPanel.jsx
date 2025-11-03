import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '@/context/AuthContext';
import API_BASE from '@/config/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/Navbar';

export default function AdminPanel() {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [errorReports, setErrorReports] = useState([]);
  const [activities, setActivities] = useState([]);
  
  // Check if user is admin
  useEffect(() => {
    if (!user?.isAdmin) {
      navigate('/');
    }
  }, [user, navigate]);

  // Fetch data based on active tab
  useEffect(() => {
    if (!token || !user?.isAdmin) return;
    fetchData();
  }, [activeTab, token, user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      if (activeTab === 'overview') {
        const [statsRes, activitiesRes] = await Promise.all([
          fetch(`${API_BASE}/api/admin/stats`, { headers }),
          fetch(`${API_BASE}/api/admin/activities?limit=10`, { headers })
        ]);
        
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }
        
        if (activitiesRes.ok) {
          const activitiesData = await activitiesRes.json();
          setActivities(activitiesData.activities || []);
        }
      } else if (activeTab === 'users') {
        const res = await fetch(`${API_BASE}/api/admin/users?limit=100`, { headers });
        if (res.ok) {
          const data = await res.json();
          setUsers(data.users || []);
        }
      } else if (activeTab === 'jobs') {
        const res = await fetch(`${API_BASE}/api/admin/jobs?limit=100`, { headers });
        if (res.ok) {
          const data = await res.json();
          setJobs(data.jobs || []);
        }
      } else if (activeTab === 'applications') {
        const res = await fetch(`${API_BASE}/api/admin/applications?limit=100`, { headers });
        if (res.ok) {
          const data = await res.json();
          setApplications(data.applications || []);
        }
      } else if (activeTab === 'feedback') {
        const res = await fetch(`${API_BASE}/api/admin/feedback?limit=100`, { headers });
        if (res.ok) {
          const data = await res.json();
          setFeedback(data.feedback || []);
        }
      } else if (activeTab === 'errors') {
        const res = await fetch(`${API_BASE}/api/admin/error-reports?limit=100`, { headers });
        if (res.ok) {
          const data = await res.json();
          setErrorReports(data.errorReports || []);
        }
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFeedbackStatus = async (id, status, notes = '') => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/feedback/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status, adminNotes: notes })
      });

      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Error updating feedback:', err);
    }
  };

  const handleUpdateErrorReportStatus = async (id, status, severity, notes = '') => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/error-reports/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status, severity, adminNotes: notes })
      });

      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Error updating error report:', err);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  };

  const handleDeleteJob = async (id) => {
    if (!confirm('Are you sure you want to delete this job? This action cannot be undone.')) return;
    
    try {
      const res = await fetch(`${API_BASE}/api/admin/jobs/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Error deleting job:', err);
    }
  };

  if (!user?.isAdmin) {
    return null;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-gray-600 mt-1">Manage users, jobs, applications, feedback, and system health</p>
          </div>
        </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'users', label: 'Users' },
              { id: 'jobs', label: 'Jobs' },
              { id: 'applications', label: 'Applications' },
              { id: 'feedback', label: 'Feedback' },
              { id: 'errors', label: 'Error Reports' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && <OverviewTab stats={stats} activities={activities} />}
            {activeTab === 'users' && <UsersTab users={users} onDelete={handleDeleteUser} />}
            {activeTab === 'jobs' && <JobsTab jobs={jobs} onDelete={handleDeleteJob} />}
            {activeTab === 'applications' && <ApplicationsTab applications={applications} />}
            {activeTab === 'feedback' && (
              <FeedbackTab feedback={feedback} onUpdateStatus={handleUpdateFeedbackStatus} />
            )}
            {activeTab === 'errors' && (
              <ErrorReportsTab errorReports={errorReports} onUpdateStatus={handleUpdateErrorReportStatus} />
            )}
          </>
        )}
      </div>
      </div>
    </>
  );
}

// Overview Tab Component
function OverviewTab({ stats, activities }) {
  if (!stats) return <div>Loading statistics...</div>;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.users?.total || 0}
          subtitle={`${stats.users?.newLast30Days || 0} new this month`}
          color="blue"
        />
        <StatCard
          title="Total Jobs"
          value={stats.jobs?.total || 0}
          subtitle={`${stats.jobs?.byStatus?.find(s => s.status === 'open')?.count || 0} open`}
          color="green"
        />
        <StatCard
          title="Applications"
          value={stats.applications?.total || 0}
          subtitle={`${stats.applications?.byStatus?.find(s => s.status === 'pending')?.count || 0} pending`}
          color="purple"
        />
        <StatCard
          title="Feedback"
          value={stats.feedback?.total || 0}
          subtitle={`${stats.errorReports?.total || 0} error reports`}
          color="yellow"
        />
      </div>

      {/* User Types */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">User Distribution</h2>
        <div className="grid grid-cols-2 gap-4">
          {stats.users?.byType?.map(type => (
            <div key={type.user_type} className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 capitalize">{type.user_type}s</p>
              <p className="text-2xl font-bold">{type.count}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Job Status Distribution */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Job Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {stats.jobs?.byStatus?.map(status => (
            <div key={status.status} className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 capitalize">{status.status.replace('_', ' ')}</p>
              <p className="text-2xl font-bold">{status.count}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Error Reports by Severity */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Error Reports by Severity</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.errorReports?.bySeverity?.map(sev => (
            <div key={sev.severity} className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 capitalize">{sev.severity}</p>
              <p className="text-2xl font-bold">{sev.count}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Activities */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Recent Activities</h2>
        <div className="space-y-3">
          {activities.map((activity, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="font-medium capitalize">{activity.activity_type?.replace('_', ' ')}</p>
                <p className="text-sm text-gray-600">
                  {activity.name || activity.user_name || activity.student_name || activity.title || activity.subject}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(activity.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, subtitle, color }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    yellow: 'bg-yellow-50 text-yellow-600'
  };

  return (
    <Card className={`p-6 ${colorClasses[color]}`}>
      <h3 className="text-sm font-medium opacity-80">{title}</h3>
      <p className="text-3xl font-bold mt-2">{value}</p>
      <p className="text-sm mt-1 opacity-80">{subtitle}</p>
    </Card>
  );
}

// Users Tab Component
function UsersTab({ users, onDelete }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || user.user_type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 min-w-[200px] px-4 py-2 border rounded-lg"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">All Types</option>
            <option value="student">Students</option>
            <option value="employer">Employers</option>
          </select>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Business</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admin</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={user.user_type === 'employer' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}>
                      {user.user_type}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{user.business_name || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.is_admin ? <Badge className="bg-red-100 text-red-800">Admin</Badge> : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Button
                      onClick={() => onDelete(user.id)}
                      className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1"
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <p className="text-sm text-gray-600">Showing {filteredUsers.length} of {users.length} users</p>
    </div>
  );
}

// Jobs Tab Component
function JobsTab({ jobs, onDelete }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || job.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 min-w-[200px] px-4 py-2 border rounded-lg"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </Card>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredJobs.map(job => (
          <Card key={job.id} className="p-6">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-bold">{job.title}</h3>
              <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              By: {job.employer_name} ({job.business_name || job.employer_email})
            </p>
            <p className="text-sm text-gray-600 mb-2">Category: {job.category}</p>
            <p className="text-sm text-gray-600 mb-3">
              Applications: {job.application_count || 0}
            </p>
            <p className="text-xs text-gray-500 mb-3">
              Posted: {new Date(job.created_at).toLocaleDateString()}
            </p>
            <Button
              onClick={() => onDelete(job.id)}
              className="bg-red-500 hover:bg-red-600 text-white text-sm w-full"
            >
              Delete Job
            </Button>
          </Card>
        ))}
      </div>

      <p className="text-sm text-gray-600">Showing {filteredJobs.length} of {jobs.length} jobs</p>
    </div>
  );
}

// Applications Tab Component
function ApplicationsTab({ applications }) {
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredApplications = applications.filter(app => 
    filterStatus === 'all' || app.status === filterStatus
  );

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="p-4">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
        </select>
      </Card>

      {/* Applications Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applied</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredApplications.map(app => (
                <tr key={app.id}>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium">{app.job_title}</p>
                      <p className="text-xs text-gray-500">{app.job_category}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium">{app.student_name}</p>
                      <p className="text-xs text-gray-500">{app.student_email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium">{app.employer_name}</p>
                      <p className="text-xs text-gray-500">{app.business_name || app.employer_email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge className={getStatusColor(app.status)}>{app.status}</Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(app.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <p className="text-sm text-gray-600">Showing {filteredApplications.length} of {applications.length} applications</p>
    </div>
  );
}

// Feedback Tab Component
function FeedbackTab({ feedback, onUpdateStatus }) {
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredFeedback = feedback.filter(f => 
    filterStatus === 'all' || f.status === filterStatus
  );

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="p-4">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="all">All Status</option>
          <option value="new">New</option>
          <option value="reviewed">Reviewed</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
      </Card>

      {/* Feedback List */}
      <div className="space-y-4">
        {filteredFeedback.map(item => (
          <Card key={item.id} className="p-6">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold">{item.subject}</h3>
                  <Badge className={getCategoryColor(item.category)}>{item.category}</Badge>
                  <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                  {item.rating && <span className="text-yellow-500">{'⭐'.repeat(item.rating)}</span>}
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  From: {item.user_name || item.name} ({item.user_email || item.email})
                </p>
                <p className="text-sm text-gray-700 mb-3">{item.message}</p>
                {item.admin_notes && (
                  <div className="bg-gray-50 p-3 rounded-lg mb-3">
                    <p className="text-sm font-medium text-gray-700">Admin Notes:</p>
                    <p className="text-sm text-gray-600">{item.admin_notes}</p>
                  </div>
                )}
                <p className="text-xs text-gray-500">
                  Submitted: {new Date(item.created_at).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button
                onClick={() => onUpdateStatus(item.id, 'reviewed')}
                className="bg-blue-500 hover:bg-blue-600 text-white text-sm"
                disabled={item.status === 'reviewed'}
              >
                Mark Reviewed
              </Button>
              <Button
                onClick={() => onUpdateStatus(item.id, 'in_progress')}
                className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm"
                disabled={item.status === 'in_progress'}
              >
                In Progress
              </Button>
              <Button
                onClick={() => onUpdateStatus(item.id, 'resolved')}
                className="bg-green-500 hover:bg-green-600 text-white text-sm"
                disabled={item.status === 'resolved'}
              >
                Resolve
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <p className="text-sm text-gray-600">Showing {filteredFeedback.length} of {feedback.length} feedback items</p>
    </div>
  );
}

// Error Reports Tab Component
function ErrorReportsTab({ errorReports, onUpdateStatus }) {
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');

  const filteredReports = errorReports.filter(report => {
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
    const matchesSeverity = filterSeverity === 'all' || report.severity === filterSeverity;
    return matchesStatus && matchesSeverity;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="p-4">
        <div className="flex gap-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="investigating">Investigating</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="wont_fix">Won't Fix</option>
          </select>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">All Severity</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </Card>

      {/* Error Reports List */}
      <div className="space-y-4">
        {filteredReports.map(report => (
          <Card key={report.id} className="p-6">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold">{report.subject}</h3>
                  <Badge className={getErrorTypeColor(report.error_type)}>{report.error_type}</Badge>
                  <Badge className={getSeverityColor(report.severity)}>{report.severity}</Badge>
                  <Badge className={getStatusColor(report.status)}>{report.status}</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  From: {report.user_name || report.name} ({report.user_email || report.email})
                </p>
                <p className="text-sm text-gray-700 mb-2">{report.description}</p>
                
                {report.page_url && (
                  <p className="text-xs text-gray-600 mb-1">
                    <span className="font-medium">Page:</span> {report.page_url}
                  </p>
                )}
                
                {report.steps_to_reproduce && (
                  <div className="bg-gray-50 p-3 rounded-lg mb-2">
                    <p className="text-sm font-medium text-gray-700">Steps to Reproduce:</p>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{report.steps_to_reproduce}</p>
                  </div>
                )}
                
                {(report.expected_behavior || report.actual_behavior) && (
                  <div className="grid grid-cols-2 gap-3 mb-2">
                    {report.expected_behavior && (
                      <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-green-700">Expected:</p>
                        <p className="text-sm text-gray-600">{report.expected_behavior}</p>
                      </div>
                    )}
                    {report.actual_behavior && (
                      <div className="bg-red-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-red-700">Actual:</p>
                        <p className="text-sm text-gray-600">{report.actual_behavior}</p>
                      </div>
                    )}
                  </div>
                )}
                
                {report.admin_notes && (
                  <div className="bg-blue-50 p-3 rounded-lg mb-2">
                    <p className="text-sm font-medium text-blue-700">Admin Notes:</p>
                    <p className="text-sm text-gray-600">{report.admin_notes}</p>
                  </div>
                )}
                
                <p className="text-xs text-gray-500">
                  Reported: {new Date(report.created_at).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button
                onClick={() => onUpdateStatus(report.id, 'investigating', report.severity)}
                className="bg-blue-500 hover:bg-blue-600 text-white text-sm"
                disabled={report.status === 'investigating'}
              >
                Investigate
              </Button>
              <Button
                onClick={() => onUpdateStatus(report.id, 'in_progress', report.severity)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm"
                disabled={report.status === 'in_progress'}
              >
                In Progress
              </Button>
              <Button
                onClick={() => onUpdateStatus(report.id, 'resolved', report.severity)}
                className="bg-green-500 hover:bg-green-600 text-white text-sm"
                disabled={report.status === 'resolved'}
              >
                Resolve
              </Button>
              <Button
                onClick={() => onUpdateStatus(report.id, 'wont_fix', report.severity)}
                className="bg-gray-500 hover:bg-gray-600 text-white text-sm"
                disabled={report.status === 'wont_fix'}
              >
                Won't Fix
              </Button>
              {report.severity !== 'critical' && (
                <Button
                  onClick={() => onUpdateStatus(report.id, report.status, 'critical')}
                  className="bg-red-500 hover:bg-red-600 text-white text-sm ml-auto"
                >
                  Mark Critical
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      <p className="text-sm text-gray-600">Showing {filteredReports.length} of {errorReports.length} error reports</p>
    </div>
  );
}

// Helper functions for badge colors
function getStatusColor(status) {
  const colors = {
    draft: 'bg-gray-100 text-gray-800',
    open: 'bg-green-100 text-green-800',
    in_progress: 'bg-blue-100 text-blue-800',
    pending: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    completed: 'bg-purple-100 text-purple-800',
    new: 'bg-blue-100 text-blue-800',
    reviewed: 'bg-indigo-100 text-indigo-800',
    resolved: 'bg-green-100 text-green-800',
    investigating: 'bg-yellow-100 text-yellow-800',
    wont_fix: 'bg-gray-100 text-gray-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

function getCategoryColor(category) {
  const colors = {
    feature_request: 'bg-blue-100 text-blue-800',
    improvement: 'bg-green-100 text-green-800',
    compliment: 'bg-purple-100 text-purple-800',
    other: 'bg-gray-100 text-gray-800'
  };
  return colors[category] || 'bg-gray-100 text-gray-800';
}

function getErrorTypeColor(type) {
  const colors = {
    bug: 'bg-red-100 text-red-800',
    crash: 'bg-red-100 text-red-800',
    performance: 'bg-orange-100 text-orange-800',
    ui_issue: 'bg-blue-100 text-blue-800',
    other: 'bg-gray-100 text-gray-800'
  };
  return colors[type] || 'bg-gray-100 text-gray-800';
}

function getSeverityColor(severity) {
  const colors = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800'
  };
  return colors[severity] || 'bg-gray-100 text-gray-800';
}
