import React, { useState, useEffect } from "react";
import axios from "axios";

const CompanyDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [activeTab, setActiveTab] = useState("post");
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  // Fetch company jobs
  const fetchJobs = async () => {
    try {
      const res = await axios.get("https://job-poster-1.onrender.com/company/jobs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJobs(res.data);
    } catch (err) {
      console.error("Failed to fetch jobs");
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Post job
  const handlePostJob = async () => {
    if (!title || !location || !description) return alert("Please fill all fields!");
    setLoading(true);
    try {
      await axios.post(
        "https://job-poster-1.onrender.com/company/post",
        { title, location, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTitle("");
      setLocation("");
      setDescription("");
      fetchJobs();
      alert("Job posted successfully!");
    } catch (err) {
      alert(`Failed to post job: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
                  <input
                    type="text"
                    placeholder="e.g., Software Engineer"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
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
              </div>
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
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
                      className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
                      onClick={() => (window.location.href = `/jobdetails/${job._id}`)}
                    >
                      <h3 className="font-bold text-lg text-gray-800 mb-2">{job.title}</h3>
                      <p className="text-gray-600">{job.location}</p>
                      <div className="mt-4 text-blue-600 font-medium">View Details →</div>
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
