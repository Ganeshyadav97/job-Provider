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
      const res = await axios.get(`https://job-poster-1.onrender.com/company/getapplication/${id}`, {
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
        `https://job-poster-1.onrender.com/company/status/${appId}`,
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
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        Applicant: {app.user?.email || "N/A"}
                      </h3>
                      <p className="text-gray-600 mt-1">
                        Status: <span className={`font-medium ${getStatusColor(app.status)}`}>
                          {getStatusDisplay(app.status)}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Show buttons only for "Applied" status (assuming that's pending) */}
                  {!app.hideButtons && app.status && app.status.toLowerCase() === "applied" && (
                    <div className="flex space-x-4 mt-4">
                      <button
                        onClick={() => updateStatus(app._id, "Accepted")}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors duration-200"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => updateStatus(app._id, "Rejected")}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors duration-200"
                      >
                        Reject
                      </button>
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
