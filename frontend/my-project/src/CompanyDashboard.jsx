import React, { useState, useEffect } from "react";
import axios from "axios";

const CompanyDashboard = () => {
  const [jobs, setJobs] = useState([]);
  // Post Job State
  const [title, setTitle] = useState("");
  const [roleCompanyName, setRoleCompanyName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [vacantSlots, setVacantSlots] = useState("");
  const [maxApplicants, setMaxApplicants] = useState("");
  const [employmentType, setEmploymentType] = useState("Internship");
  const [locationType, setLocationType] = useState("Office");
  const [stipend, setStipend] = useState("");
  const [githubRequired, setGithubRequired] = useState(false);
  const [portfolioRequired, setPortfolioRequired] = useState(false);

  const [activeTab, setActiveTab] = useState("post");
  const [loading, setLoading] = useState(true);
  const [editingJobId, setEditingJobId] = useState(null);
  const [editingFields, setEditingFields] = useState({ endDate: "", vacantSlots: "" });
  const token = localStorage.getItem("token");

  // Fetch company jobs
  const fetchJobs = async () => {
    try {
      const res = await axios.get("http://localhost:5000/company/jobs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJobs(res.data);
    } catch (err) {
      console.error("Failed to fetch jobs");
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await axios.get("http://localhost:5000/company/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data) {
        setRoleCompanyName(res.data.name || "");
        setLocation(res.data.location || "");
      }
    } catch (err) {
      console.error("Failed to fetch profile");
    }
  };

  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchJobs(), fetchProfile()]);
      setLoading(false);
    };
    init();
  }, []);

  // Post job
  const handlePostJob = async () => {
    if (!title || !description || !startDate || !endDate || !vacantSlots) {
       return alert("Please fill all required fields (Title, Description, Dates, Slots)!");
    }
    
    setLoading(true);
    try {
      const payload = {
      title,
      roleCompanyName,
      location,
      description,
      instructions,
      startDate,
      endDate,
      vacantSlots: parseInt(vacantSlots) || 1,
      maxApplicants: maxApplicants ? parseInt(maxApplicants) : null,
      employmentType,
      locationType,
      stipend,
      githubRequired,
      portfolioRequired,
    };

      await axios.post(
        "http://localhost:5000/company/post",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Reset Form
      setTitle(""); setRoleCompanyName(""); setLocation(""); setDescription(""); setInstructions("");
      setStartDate(""); setEndDate(""); setVacantSlots(""); setMaxApplicants("");
      setStipend(""); setGithubRequired(false); setPortfolioRequired(false);
      
      fetchJobs();
      alert("Job posted successfully!");
      setActiveTab("jobs");
    } catch (err) {
      alert(`Failed to post job: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Toggle Job Status (Open/Closed)
  const toggleJobStatus = async (jobId, currentStatus) => {
    try {
      const newStatus = currentStatus === "Open" ? "Closed" : "Open";
      await axios.put(
        `http://localhost:5000/company/update/${jobId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Update local state without re-fetching all jobs
      setJobs(jobs.map(job => 
        job._id === jobId ? { ...job, status: newStatus } : job
      ));
    } catch (err) {
      console.error("Failed to update job status", err);
      alert("Failed to update job status.");
    }
  };

  // Update Job Details (Extend date / Change slots)
  const handleUpdateJob = async (jobId) => {
    try {
      await axios.put(
        `http://localhost:5000/company/update/${jobId}`,
        editingFields,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setJobs(jobs.map(job => 
        job._id === jobId ? { ...job, ...editingFields } : job
      ));
      setEditingJobId(null);
      alert("Job updated successfully!");
    } catch (err) {
      console.error("Failed to update job", err);
      alert("Failed to update job.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 relative">
          <div className="absolute left-6 top-1/2 -translate-y-1/2">
          </div>
          <h1 className="text-4xl font-bold text-center">Company Dashboard</h1>
          <p className="text-center mt-2 text-blue-100">Manage your job postings and company details</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center bg-gray-100 p-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab("post")}
              className={`px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
                activeTab === "post"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white text-gray-700 hover:bg-gray-200"
              }`}
            >
              Post Job
            </button>
            <button
              onClick={() => setActiveTab("jobs")}
              className={`px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
                activeTab === "jobs"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white text-gray-700 hover:bg-gray-200"
              }`}
            >
              Jobs Posted
            </button>
            <button
              onClick={() => setActiveTab("contact")}
              className={`px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
                activeTab === "contact"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white text-gray-700 hover:bg-gray-200"
              }`}
            >
              Contact Details
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Post Job Section */}
          {activeTab === "post" && (
            <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">Post a New Job</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Job Title / Role Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Software Engineer"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Name (Override)</label>
                  <input
                    type="text"
                    placeholder="e.g., Acme Corp (Leave blank for default)"
                    value={roleCompanyName}
                    onChange={(e) => setRoleCompanyName(e.target.value)}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    placeholder="e.g., New York, NY"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Employment Type</label>
                  <select
                    value={employmentType}
                    onChange={(e) => setEmploymentType(e.target.value)}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Internship">Internship</option>
                    <option value="Job">Job Opportunity</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location Type</label>
                  <select
                    value={locationType}
                    onChange={(e) => setLocationType(e.target.value)}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Office">Office / In-person</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stipend / Salary</label>
                  <input
                    type="text"
                    placeholder="e.g., 10,000 /month or 5 LPA"
                    value={stipend}
                    onChange={(e) => setStipend(e.target.value)}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={githubRequired}
                    onChange={(e) => setGithubRequired(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">GitHub Profile Required</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={portfolioRequired}
                    onChange={(e) => setPortfolioRequired(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Portfolio Link Required</span>
                </label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Instructions for Applicants</label>
                  <input
                    type="text"
                    placeholder="e.g., Include portfolio link, state availability"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vacant Slots</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Number of interns needed"
                    value={vacantSlots}
                    onChange={(e) => setVacantSlots(e.target.value)}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date (Application Deadline)</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Applicants (Optional)</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Close role after N applicants"
                    value={maxApplicants}
                    onChange={(e) => setMaxApplicants(e.target.value)}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Description</label>
                <textarea
                  placeholder="Describe the job responsibilities, requirements, and benefits..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handlePostJob}
                disabled={loading}
                className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Posting..." : "Post Job"}
              </button>
            </div>
          )}

          {/* Jobs Posted Section */}
          {activeTab === "jobs" && (
            <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">Jobs Posted</h2>
              {jobs.length === 0 ? (
                <p className="text-gray-600">No jobs posted yet. Start by posting your first job!</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {jobs.map((job) => (
                    <div
                      key={job._id}
                      className="bg-white border border-gray-200 p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between"
                    >
                      <div className="cursor-pointer mb-4" onClick={() => (window.location.href = `/jobdetails/${job._id}`)}>
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-lg text-gray-800">{job.title}</h3>
                            {job.roleCompanyName && (
                              <p className="text-sm font-semibold text-blue-600">at {job.roleCompanyName}</p>
                            )}
                          </div>
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${job.status === 'Closed' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                            {job.status || 'Open'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-gray-600 text-sm">{job.location}</p>
                          <span className="text-gray-300">•</span>
                          <span className="text-blue-600 text-xs font-semibold">{job.employmentType || "Internship"}</span>
                          <span className="text-gray-300">•</span>
                          <span className="text-indigo-600 text-xs font-semibold">{job.locationType || "Office"}</span>
                        </div>
                        {job.stipend && (
                          <p className="text-green-600 text-xs font-bold mt-1">Stipend: {job.stipend}</p>
                        )}
                        
                        <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                          <div><span className="font-medium">Starts:</span> {job.startDate ? new Date(job.startDate).toLocaleDateString() : 'N/A'}</div>
                          
                          {editingJobId === job._id ? (
                            <div className="flex flex-col">
                              <span className="font-medium text-blue-600">Deadline:</span>
                              <input 
                                type="date" 
                                value={editingFields.endDate}
                                onChange={(e) => setEditingFields({...editingFields, endDate: e.target.value})}
                                className="border border-blue-300 rounded px-1 mt-1"
                              />
                            </div>
                          ) : (
                            <div><span className="font-medium">Ends:</span> {job.endDate ? new Date(job.endDate).toLocaleDateString() : 'N/A'}</div>
                          )}

                          {editingJobId === job._id ? (
                            <div className="flex flex-col">
                              <span className="font-medium text-blue-600">Slots:</span>
                              <input 
                                type="number" 
                                value={editingFields.vacantSlots}
                                onChange={(e) => setEditingFields({...editingFields, vacantSlots: e.target.value})}
                                className="border border-blue-300 rounded px-1 mt-1 w-16"
                              />
                            </div>
                          ) : (
                            <div><span className="font-medium">Slots:</span> {job.vacantSlots}</div>
                          )}

                          <div><span className="font-medium">Applied:</span> {job.appliedCount || 0} {job.maxApplicants ? `/ ${job.maxApplicants}` : ''}</div>
                        </div>
                        
                        <div className="mt-4 text-blue-600 font-medium text-sm hover:underline">View Details & Applicants →</div>
                      </div>

                      <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                        {editingJobId === job._id ? (
                          <>
                            <button
                              onClick={() => handleUpdateJob(job._id)}
                              className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingJobId(null)}
                              className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-medium text-sm hover:bg-gray-300 transition-colors"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingJobId(job._id);
                                setEditingFields({ 
                                  endDate: job.endDate ? job.endDate.split('T')[0] : "", 
                                  vacantSlots: job.vacantSlots || 1 
                                });
                              }}
                              className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium text-sm hover:bg-gray-200 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleJobStatus(job._id, job.status || 'Open');
                              }}
                              className={`flex-1 py-2 rounded-lg font-medium text-sm transition-colors duration-200 ${
                                job.status === 'Closed'
                                  ? 'bg-green-500 hover:bg-green-600 text-white'
                                  : 'bg-red-500 hover:bg-red-600 text-white'
                              }`}
                            >
                              {job.status === 'Closed' ? 'Reopen' : 'Close'}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Contact Details Section */}
          {activeTab === "contact" && (
            <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">Contact Details</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <span className="font-medium text-gray-700 w-20">Email:</span>
                  <span className="text-gray-600">support@yourcompany.com</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium text-gray-700 w-20">Phone:</span>
                  <span className="text-gray-600">+91-9876543210</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;
