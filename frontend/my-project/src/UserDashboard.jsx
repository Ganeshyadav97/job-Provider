import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const UserDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQueries = searchParams.getAll('search') || [];
  const searchQuery = searchQueries.join(" "); // Kept for some legacy checks if needed, but mostly using searchQueries now
  const locationParam = searchParams.get('location') || "";
  const typeParam = searchParams.get('employmentType') || "";
  const locationTypeParam = searchParams.get('locationType') || "";
  const [jobs, setJobs] = useState([]);
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [idCard, setIdCard] = useState(null);
  const [graduationYear, setGraduationYear] = useState('');
  const [uploading, setUploading] = useState(false);

  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole') || 'user';
  const BASE_URL = 'http://localhost:5000';

  // Derived state for locations moved to the top to avoid TDZ issues
  const uniqueLocations = [...new Set(jobs.flatMap(job => [job.company?.location, job.location]).filter(Boolean))].sort();

  // Fetch all jobs
  const fetchJobs = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/user/getjobs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Sort by recency (newest first)
      const sortedJobs = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setJobs(sortedJobs);
    } catch (err) {
      setMessage('Error fetching jobs');
    }
  };

  // Fetch applications of logged-in user
  const fetchApplications = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/user/applications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setApplications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch user profile for skills matching
  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
    } catch (err) {
      console.error("Failed to fetch profile", err);
    }
  };

  const handleIdUpload = async (e) => {
    e.preventDefault();
    if (!idCard || !graduationYear) {
      alert("Please select a file and enter graduation year");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('idCard', idCard);
    formData.append('graduationYear', graduationYear);

    try {
      const res = await axios.post(`${BASE_URL}/user/upload-id`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
      });
      alert(res.data.message);
      fetchProfile(); // Refresh user data
    } catch (err) {
      alert(err.response?.data?.message || "Error uploading ID");
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      setMessage('Please login first');
      setLoading(false);
      return;
    }

    const loadData = async () => {
      await Promise.all([fetchJobs(), fetchApplications(), fetchProfile()]);
      setLoading(false);
    };

    loadData();
  }, [token]);

  // Filtering logic
  const filteredJobs = jobs.filter(job => {
    // Universal search matches title/description/location/company/type/stipend
    const jobText = [
      job.title,
      job.description,
      job.company?.name,
      job.company?.location,
      job.location,
      job.employmentType,
      job.locationType,
      job.stipend,
      job.instructions
    ].filter(Boolean).join(" ").toLowerCase();
    
    const matchesSearch = searchQueries.length === 0 || searchQueries.every(q => jobText.includes(q.toLowerCase()));

    // Check Location filter (from URL)
    const matchesLocation = !locationParam || (job.company && job.company.location.toLowerCase().includes(locationParam.toLowerCase()));
    
    // Check Employment Type
    const matchesType = !typeParam || (job.employmentType && (
      job.employmentType.toLowerCase() === typeParam.toLowerCase() ||
      (typeParam.toLowerCase() === 'job' && job.employmentType.toLowerCase() === 'full-time') ||
      (typeParam.toLowerCase() === 'full-time' && job.employmentType.toLowerCase() === 'job')
    ));
    
    // Check Location Type (Remote/Office)
    const matchesLocType = !locationTypeParam || (job.locationType && job.locationType.toLowerCase() === locationTypeParam.toLowerCase());

    return matchesLocation && matchesSearch && matchesType && matchesLocType;
  });

  // Recommendation engine (matches user skills to job title/description)
  const getRecommendedJobs = () => {
    if (!user || !user.skills) return [];
    
    return jobs.filter(job => {
      const jobText = (job.title + " " + job.description + " " + (job.instructions || "")).toLowerCase();
      // Check if any of user's skills are mentioned in the job text
      return user.skills.some(skill => jobText.includes(skill.toLowerCase()));
    }).slice(0, 6); // Top 6 recommendations
  };

  const recommendedJobs = getRecommendedJobs();

  const hasApplied = (jobId) => {
    return applications.some((app) => app.job?._id === jobId);
  };

  const removeFilter = (key, value) => {
    const newParams = new URLSearchParams(location.search);
    if (key === 'search' && value) {
      // Remove only the specific search term
      const currentSearches = newParams.getAll('search');
      newParams.delete('search');
      currentSearches.forEach(s => {
        if (s !== value) newParams.append('search', s);
      });
    } else {
      newParams.delete(key);
    }
    const queryString = newParams.toString();
    navigate(`/${userRole}-dashboard${queryString ? '?' + queryString : ''}`);
  };

  const isFiltered = searchQueries.length > 0 || locationParam || typeParam || locationTypeParam;
  
  const activeFilters = [
    ...searchQueries.map(q => ({ key: 'search', subKey: q, label: q, active: true })),
    { key: 'location', label: locationParam, active: !!locationParam },
    { key: 'employmentType', label: typeParam, active: !!typeParam },
    { key: 'locationType', label: locationTypeParam, active: !!locationTypeParam },
  ].filter(f => f.active);

  // Recently Posted Jobs (Top 10)
  const recentJobs = [...jobs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center font-sans">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your personalized dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 font-sans">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Welcome Header */}
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 flex flex-col md:flex-row justify-between items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <span className="material-icons-outlined text-9xl">dashboard</span>
          </div>
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                Welcome back{user ? `, ${user.firstName}` : ''}! 🚀
              </h1>
              <p className="text-gray-500 mt-2 text-lg">Your next career move is just a click away.</p>
            </div>
          </div>
          <div className="mt-6 md:mt-0 flex gap-4">
            <div className="text-center px-6 py-3 bg-blue-50 rounded-xl border border-blue-100">
               <p className="text-blue-600 font-bold text-2xl">{applications.length}</p>
               <p className="text-blue-400 text-xs font-semibold uppercase">Applications</p>
            </div>
            <div className="text-center px-6 py-3 bg-green-50 rounded-xl border border-green-100">
               <p className="text-green-600 font-bold text-2xl">{user?.profileCompletion || 70}%</p>
               <p className="text-green-400 text-xs font-semibold uppercase">Profile</p>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">
            {message}
          </div>
        )}

        {/* Active Filters Section */}
        {isFiltered && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-in fade-in duration-300">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-bold text-gray-400 uppercase tracking-widest mr-2">Active Filters:</span>
                {activeFilters.map((filter, index) => (
                  <div key={`${filter.key}-${filter.subKey || index}`} className="flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full text-sm font-bold border border-blue-100 group shadow-sm transition-all hover:bg-blue-100">
                    <span className="capitalize">{filter.label}</span>
                    <button 
                      onClick={() => filter.onClear ? filter.onClear() : removeFilter(filter.key, filter.subKey)}
                      className="hover:bg-blue-200 rounded-full p-0.5 transition-colors leading-none ml-0.5"
                    >
                      <span className="material-icons-outlined text-sm">close</span>
                    </button>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => {
                  navigate(`/${userRole}-dashboard`);
                }}
                className="text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
              >
                Clear All
              </button>
            </div>
          </div>
        )}

        {/* Student Verification Section */}
        {!user?.isStudentVerified && !isFiltered && (
          <section className="bg-indigo-600 rounded-2xl shadow-lg p-8 text-white flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-4">Complete Your Verification 🎓</h2>
              <p className="text-indigo-100 mb-6 text-lg">
                To apply for premium job roles, you need to verify your student status. 
                Upload your Student ID card to unlock applications and reach 100% profile completion.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-indigo-200">
                  <span className="material-icons-outlined text-sm text-indigo-300">verified</span>
                  <span>Verify Name</span>
                </div>
                <div className="flex items-center gap-2 text-indigo-200">
                  <span className="material-icons-outlined text-sm text-indigo-300">verified</span>
                  <span>Verify Graduation Year</span>
                </div>
              </div>
            </div>
            
            <div className="w-full md:w-96 bg-white rounded-xl p-6 text-gray-800 shadow-xl">
              <form onSubmit={handleIdUpload} className="space-y-4">
                 <div>
                   <label className="block text-sm font-bold text-gray-600 mb-1">Graduation Year</label>
                   <input 
                    type="text" 
                    placeholder="e.g. 2025"
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(e.target.value)}
                    className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-bold text-gray-600 mb-1">Student ID Card (PDF/Image)</label>
                   <input 
                    type="file" 
                    onChange={(e) => setIdCard(e.target.files[0])}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    accept="image/*,application/pdf"
                    required
                   />
                 </div>
                 <button 
                  type="submit" 
                  disabled={uploading}
                  className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                 >
                   {uploading ? (
                     <>
                       <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                       Uploading...
                     </>
                   ) : "Verify & Unlock Applications"}
                 </button>
              </form>
            </div>
          </section>
        )}

        {/* Matching Roles / Filtered Jobs */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{isFiltered ? "Search Results" : "Available Roles"}</h2>
              <p className="text-gray-500 text-sm mt-1">
                {isFiltered ? `Found ${filteredJobs.length} roles matching your criteria` : `Showing ${filteredJobs.length} total roles`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest hidden sm:block">Filter by location:</span>
              <select 
                className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-600 shadow-sm"
                value={locationParam || ""}
                onChange={(e) => {
                  const newParams = new URLSearchParams(location.search);
                  if (e.target.value) {
                    newParams.set('location', e.target.value);
                  } else {
                    newParams.delete('location');
                  }
                  navigate(`/${userRole}-dashboard?${newParams.toString()}`);
                }}
              >
                <option value="">All Locations</option>
                {uniqueLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
              </select>
            </div>
          </div>

          {filteredJobs.length === 0 ? (
            <div className="bg-white rounded-2xl p-20 text-center border border-dashed border-gray-200">
               <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                 <span className="material-icons-outlined text-4xl">search_off</span>
               </div>
               <h3 className="text-xl font-bold text-gray-800">No matching jobs found</h3>
               <p className="text-gray-500 mt-2 max-w-sm mx-auto">Try adjusting your filters or search keywords to find more opportunities.</p>
               <button 
                 onClick={() => {
                   setSelectedLocation('');
                   navigate(`/${userRole}-dashboard`);
                 }}
                 className="mt-6 text-blue-600 font-bold hover:underline"
               >
                 View All Jobs
               </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map((job) => {
                const applied = hasApplied(job._id);
                const isClosed = job.status === "Closed" || (job.endDate && new Date() > new Date(job.endDate));
                
                return (
                  <div key={job._id} className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm hover:translate-y-[-4px] transition-all group">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex flex-col">
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors cursor-pointer" onClick={() => navigate(`/job/${job._id}`)}>{job.title}</h3>
                        <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold uppercase mt-1">
                          <span className="material-icons-outlined text-[10px]">business</span>
                          {job.company?.name || "Premium Company"}
                          <span className="mx-1">•</span>
                          <span className="material-icons-outlined text-[10px]">location_on</span>
                          {job.company?.location || job.location || "Remote"}
                        </div>
                      </div>
                      {isClosed && <span className="bg-red-50 text-red-500 text-[10px] font-bold px-2 py-0.5 rounded uppercase font-sans">Closed</span>}
                    </div>
                    <p className="text-gray-500 text-xs mb-4 line-clamp-2">{job.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      <div className="flex items-center text-xs font-semibold text-blue-500 bg-blue-50 px-2 py-1 rounded">
                        <span className="material-icons-outlined text-sm mr-1">work_outline</span>
                        {job.employmentType || "Internship"}
                      </div>
                      <div className="flex items-center text-xs font-semibold text-indigo-500 bg-indigo-50 px-2 py-1 rounded">
                        <span className="material-icons-outlined text-sm mr-1">location_on</span>
                        {job.locationType || "Office"}
                      </div>
                      {job.stipend && (
                        <div className="flex items-center text-xs font-semibold text-green-500 bg-green-50 px-2 py-1 rounded">
                          <span className="material-icons-outlined text-sm mr-1">payments</span>
                          {job.stipend}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => navigate(`/job/${job._id}`)}
                      className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all ${
                        applied 
                          ? 'bg-green-50 text-green-600 border border-green-100 cursor-default' 
                          : isClosed
                          ? 'bg-gray-100 text-gray-400'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'
                      }`}
                    >
                      {applied ? '✓ Application Submitted' : isClosed ? 'Details' : 'Explore Description'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Recently Posted Section (Visible if not filtering heavily) */}
        {!isFiltered && (
          <section className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                <span className="material-icons-outlined">new_releases</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Recently Posted</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {recentJobs.map((job) => (
                <div 
                  key={job._id} 
                  onClick={() => navigate(`/job/${job._id}`)}
                  className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 hover:bg-white hover:shadow-md hover:border-blue-100 transition-all cursor-pointer group"
                >
                  <h4 className="font-bold text-gray-800 text-sm truncate group-hover:text-blue-600Transition">{job.title}</h4>
                  <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-tight">{job.company?.name || "Premium Company"}</p>
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-[9px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded">{job.locationType || "Office"}</span>
                    <span className="text-[9px] text-gray-400">{new Date(job.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Recommended For You Section - Hide if filtered */}
        {recommendedJobs.length > 0 && !isFiltered && (
          <section>
            <div className="flex items-center gap-3 mb-6">
               <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                 <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
               </div>
               <h2 className="text-2xl font-bold text-gray-800">Recommended for You</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedJobs.map((job) => (
                <div key={job._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                   <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors cursor-pointer" onClick={() => navigate(`/job/${job._id}`)}>{job.title}</h3>
                   </div>
                   <p className="text-gray-500 text-sm line-clamp-2 mb-4">{job.description}</p>
                   <div className="flex flex-wrap items-center text-xs gap-3 mb-6">
                      <span className="flex items-center text-gray-400"><svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-10V4m0 10V4m-4 11h.01" /></svg> {job.company?.name}</span>
                      <span className="flex items-center text-gray-400"><svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg> {job.location || job.company?.location}</span>
                      <div className="flex gap-2 w-full mt-1">
                        <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-bold text-[10px] uppercase">{job.employmentType || "Internship"}</span>
                        <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded font-bold text-[10px] uppercase">{job.locationType || "Office"}</span>
                        {job.stipend && <span className="bg-green-50 text-green-600 px-2 py-0.5 rounded font-bold text-[10px] uppercase">₹ {job.stipend}</span>}
                      </div>
                   </div>
                   <button 
                      onClick={() => navigate(`/job/${job._id}`)}
                      className="w-full py-2.5 bg-blue-50 text-blue-600 rounded-xl font-semibold hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                   >
                    View & Apply
                   </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* My Applications Section (Horizontal List) */}
        <section className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
          <div className="flex justify-between items-center mb-8">
             <h2 className="text-2xl font-bold text-gray-800">My Applications</h2>
             <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full font-bold">{applications.length} Total</span>
          </div>

          {applications.length === 0 ? (
            <div className="text-center py-10 opacity-60">
               <p className="text-gray-500">You haven't applied to any roles yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {applications.map((app) => (
                <div key={app._id} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <h4 className="font-bold text-gray-800 truncate">{app.job?.title || 'Job Deleted'}</h4>
                  <p className="text-xs text-gray-400 mt-1">{app.job?.company?.name || 'N/A'}</p>
                  <div className="mt-4 flex justify-between items-center">
                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md ${
                      app.status === 'Accepted' ? 'bg-green-100 text-green-700' :
                      app.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {app.status || 'Applied'}
                    </span>
                    <span className="text-[10px] text-gray-300 font-medium">{new Date(app.appliedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default UserDashboard;
