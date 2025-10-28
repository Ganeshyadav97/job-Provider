import React, { useEffect, useState } from 'react';
import axios from 'axios';

const UserDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  // Fetch all jobs
  const fetchJobs = async () => {
    try {
      const res = await axios.get('https://job-poster-1.onrender.com/user/getjobs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJobs(res.data);
    } catch (err) {
      setMessage('Error fetching jobs');
    }
  };

  // Fetch applications of logged-in user
  const fetchApplications = async () => {
    try {
<<<<<<< HEAD
      const res = await axios.get('http://localhost:5000/applications', {
=======
      const res = await axios.get('https://job-poster-1.onrender.com/user/applications', {
>>>>>>> 080b6b7be41490bf9b91a47bb8c4a430405876cd
        headers: { Authorization: `Bearer ${token}` },
      });
      setApplications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!token) {
      setMessage('Please login first');
      setLoading(false);
      return;
    }

    const loadData = async () => {
      await fetchJobs();
      await fetchApplications();
      setLoading(false);
    };

    loadData();
  }, []);

  const handleApply = async (jobId) => {
    try {
      const res = await axios.post(
        `http://localhost:5000/user/apply/${jobId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(res.data.message);
      await fetchApplications(); // refresh applied jobs
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error applying for job');
    }
  };

  const hasApplied = (jobId) => {
    return applications.some((app) => app.job._id === jobId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
          <h1 className="text-4xl font-bold text-center">User Dashboard</h1>
          <p className="text-center mt-2 text-blue-100">Explore jobs and track your applications</p>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Message */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.includes('Error') || message.includes('Please login')
                ? 'bg-red-50 border border-red-200 text-red-700'
                : 'bg-green-50 border border-green-200 text-green-700'
            }`}>
              {message}
            </div>
          )}

          {/* Available Jobs Section */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Available Jobs</h2>
            {jobs.length === 0 ? (
              <p className="text-gray-600">No jobs available at the moment.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.map((job) => (
                  <div
                    key={job._id}
                    className="bg-gray-50 border border-gray-200 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{job.title}</h3>
                    <p className="text-gray-600 mb-4">{job.description}</p>
                    <div className="text-sm text-gray-500 mb-4">
                      <p><strong>Company:</strong> {job.company?.name || 'N/A'}</p>
                      <p><strong>Location:</strong> {job.company?.location || 'N/A'}</p>
                    </div>
                    <button
                      onClick={() => handleApply(job._id)}
                      disabled={hasApplied(job._id)}
                      className={`w-full py-2 px-4 rounded-lg font-medium transition-colors duration-200 ${
                        hasApplied(job._id)
                          ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {hasApplied(job._id) ? 'Already Applied' : 'Apply Now'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* My Applications Section */}
          <section>
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">My Applications</h2>
            {applications.length === 0 ? (
              <p className="text-gray-600">You haven't applied to any jobs yet. Start exploring!</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {applications.map((app) => (
                  <div
                    key={app._id}
                    className="bg-gray-50 border border-gray-200 p-6 rounded-lg shadow-sm"
                  >
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{app.job.title}</h3>
                    <p className="text-gray-600 mb-2"><strong>Company:</strong> {app.job.company?.name || 'N/A'}</p>
                    <p className="text-sm">
                      <strong>Status:</strong>{" "}
                      <span className={`font-medium ${
                        app.status === 'Accepted'
                          ? 'text-green-600'
                          : app.status === 'Rejected'
                          ? 'text-red-600'
                          : 'text-yellow-600'
                      }`}>
                        {app.status || 'Pending'}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
