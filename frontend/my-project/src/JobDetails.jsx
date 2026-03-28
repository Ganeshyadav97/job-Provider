import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const JobDetails = () => {
  const { id } = useParams();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  // Fetch all applications for this job
  const fetchApplications = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/company/getapplication/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setApplications(res.data);
    } catch (err) {
      console.error("Failed to fetch applications");
    } finally {
      setLoading(false);
    }
  };

  // Handle accept or reject
  const updateStatus = async (appId, status) => {
    try {
      await axios.put(
        `http://localhost:5000/company/status/${appId}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // ✅ Update locally — hide buttons after accept/reject
      setApplications((prev) =>
        prev.map((app) =>
          app._id === appId ? { ...app, status, hideButtons: true } : app
        )
      );
    } catch (err) {
      console.error("Failed to update status");
    }
  };

  // Helper to normalize status for display
  const getStatusDisplay = (status) => {
    if (!status) return "Pending";
    const lower = status.toLowerCase();
    if (lower === "accepted") return "Accepted";
    if (lower === "rejected") return "Rejected";
    if (lower === "applied") return "Applied";
    return status;
  };

  // Helper to get status color
  const getStatusColor = (status) => {
    const lower = status?.toLowerCase();
    if (lower === "accepted") return "text-green-600";
    if (lower === "rejected") return "text-red-600";
    return "text-yellow-600"; // For "Applied" or "Pending"
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
          <h1 className="text-3xl font-bold text-center">Job Applications</h1>
          <p className="text-center mt-2 text-blue-100">Review and manage applications for this position</p>
        </div>

        {/* Content */}
        <div className="p-8">
          {loading ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading applications...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-600 text-lg">No applications received yet.</p>
              <p className="text-gray-500 mt-2">Applications will appear here once candidates apply.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {applications.map((app) => (
                <div
                  key={app._id}
                  className="bg-gray-50 border border-gray-200 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">
                        {app.user?.firstName} {app.user?.lastName} <span className="text-sm font-normal text-gray-500">({app.user?.email})</span>
                      </h3>
                      <div className="text-gray-600 mt-2 space-y-1 text-sm">
                        <p><span className="font-semibold px-2">Phone:</span> {app.user?.phone || 'N/A'}</p>
                        <p><span className="font-semibold px-2">Location:</span> {app.user?.location || 'N/A'}</p>
                        <p>
                          <span className="font-semibold px-2">Status:</span>
                          <span className={`font-medium ${getStatusColor(app.status)}`}>
                            {getStatusDisplay(app.status)}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Show buttons only for "Applied" status */}
                    {!app.hideButtons && app.status && app.status.toLowerCase() === "applied" && (
                      <div className="flex space-x-3 mt-4 md:mt-0">
                        <button
                          onClick={() => updateStatus(app._id, "Accepted")}
                          className="bg-green-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors shadow-sm"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => updateStatus(app._id, "Rejected")}
                          className="bg-red-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors shadow-sm"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Deep Applicant Profile Output */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-200 pt-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Education</h4>
                      {app.user?.education && app.user.education.length > 0 ? (
                        <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                          {app.user.education.map((edu, idx) => (
                            <li key={idx}>
                              <strong>{edu.degree}</strong> in {edu.stream}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-500 italic">No education listed</p>
                      )}
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Technical Skills</h4>
                      {app.user?.skills && app.user.skills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {app.user.skills.map((skill, idx) => (
                            <span key={idx} className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                              {skill}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">No skills listed</p>
                      )}
                    </div>
                  </div>

                  {app.user?.resumeUrl && (
                     <div className="mt-6">
                       <a 
                          href={`http://localhost:5000${app.user.resumeUrl}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                       >
                         <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                         Download Applicant Resume
                       </a>
                     </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
