import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const UserJobView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [user, setUser] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/user/job/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setJob(res.data);
      } catch (err) {
        console.error("Failed to fetch job details", err);
      } finally {
        setLoading(false);
      }
    };
    
    const fetchProfile = async () => {
      try {
        const res = await axios.get("http://localhost:5000/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        console.error("Failed to fetch profile", err);
      }
    };

    fetchJobDetails();
    fetchProfile();
  }, [id, token]);

  const handleApply = async () => {
    setApplying(true);
    try {
      const res = await axios.post(
        `http://localhost:5000/user/apply/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.message || "Applied successfully!");
      navigate("/user-dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to apply");
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-800">Job Not Found</h2>
        <button onClick={() => navigate("/user-dashboard")} className="mt-4 text-blue-600 hover:underline">
          Return to Dashboard
        </button>
      </div>
    );
  }

  const isClosed = job.status === "Closed" || (job.endDate && new Date() > new Date(job.endDate));

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-8">
          <button 
            onClick={() => navigate("/user-dashboard")}
            className="text-blue-100 hover:text-white mb-6 flex items-center text-sm font-medium transition-colors"
          >
            ← Back to Dashboard
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-extrabold">{job.title}</h1>
              <p className="text-xl mt-2 text-blue-100 font-medium">{job.roleCompanyName || job.company?.name || "Unknown Company"}</p>
              <div className="flex items-center mt-4 text-blue-50 text-sm space-x-6">
                 <span className="flex items-center"><svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg> {job.location || job.company?.location}</span>
                 {job.company?.email && <span className="flex items-center"><svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> {job.company.email}</span>}
              </div>
            </div>
            {/* Status & Type Badges */}
            <div className="flex flex-col items-end gap-2">
              <span className={`px-4 py-1.5 font-bold rounded-full text-sm shadow-sm ${isClosed ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                  {isClosed ? 'Closed' : 'Accepting Applications'}
              </span>
              <div className="flex gap-2">
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-xs font-bold uppercase">{job.employmentType || "Internship"}</span>
                <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg text-xs font-bold uppercase">{job.locationType || "Office"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-8">
          
          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 p-6 bg-gray-50 rounded-xl border border-gray-100">
             <div>
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Start Date</p>
                <p className="font-bold text-gray-800 mt-1">{job.startDate ? new Date(job.startDate).toLocaleDateString() : 'N/A'}</p>
             </div>
             <div>
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Deadline</p>
                <p className="font-bold text-gray-800 mt-1">{job.endDate ? new Date(job.endDate).toLocaleDateString() : 'N/A'}</p>
             </div>
             <div>
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Vacant Slots</p>
                <p className="font-bold text-gray-800 mt-1">{job.vacantSlots || 'N/A'}</p>
             </div>
             <div>
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Applicants</p>
                <p className="font-bold text-gray-800 mt-1">{job.appliedCount || 0} {job.maxApplicants ? `/ ${job.maxApplicants}` : ''}</p>
             </div>
             {job.stipend && (
               <div>
                  <p className="text-green-600 text-xs font-semibold uppercase tracking-wider">Stipend</p>
                  <p className="font-extrabold text-green-700 mt-1">{job.stipend}</p>
               </div>
             )}
          </div>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Job Description</h2>
              <div className="prose text-gray-700 max-w-none whitespace-pre-wrap">
                {job.description}
              </div>
            </section>

            {job.instructions && (
              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Applicant Instructions</h2>
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                   <p className="text-blue-900 whitespace-pre-wrap">{job.instructions}</p>
                </div>
              </section>
            )}

            {(job.githubRequired || job.portfolioRequired) && (
              <section className="bg-amber-50 border border-amber-100 p-6 rounded-2xl">
                <h3 className="text-amber-800 font-bold flex items-center gap-2 mb-3">
                  <span className="material-icons-outlined">info</span>
                  Preparation Required
                </h3>
                <p className="text-amber-700 text-sm mb-4">The employer has requested the following links for this application. Ensure they are present in your profile settings.</p>
                <div className="flex gap-4">
                  {job.githubRequired && (
                    <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs">
                      <span className="material-icons-outlined text-base">link</span>
                      GitHub Profile
                    </div>
                  )}
                  {job.portfolioRequired && (
                    <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs">
                      <span className="material-icons-outlined text-base">link</span>
                      Portfolio Website
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>

          <div className="mt-12 pt-6 border-t border-gray-200 flex flex-col items-end gap-4">
            {!user?.isStudentVerified && (
              <div className="text-red-500 font-semibold text-sm bg-red-50 px-4 py-3 rounded-xl border border-red-100 flex flex-col sm:flex-row items-center justify-between gap-4 w-full shadow-sm">
                <div className="flex items-center gap-2 text-center sm:text-left">
                  <span className="material-icons-outlined text-base animate-pulse">warning</span>
                  Student ID verification required to apply for roles.
                </div>
                <button 
                  onClick={() => navigate("/user-dashboard")}
                  className="px-4 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all text-xs font-bold shadow-md shadow-red-200 flex items-center gap-1 shrink-0 whitespace-nowrap"
                >
                  Verify Now <span className="material-icons-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            )}
            <button
              onClick={handleApply}
              disabled={isClosed || applying || !user?.isStudentVerified}
              className={`px-10 py-4 text-lg font-bold rounded-xl shadow-md transition-all duration-200 ${
                isClosed || applying || !user?.isStudentVerified
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5"
              }`}
            >
              {applying ? "Submitting..." : isClosed ? "Applications Closed" : "Apply Now"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserJobView;
