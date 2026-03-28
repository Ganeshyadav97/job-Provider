import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Helper to validate degree duration
const isValidDuration = (degree, startYear, endYear) => {
    if (!startYear || !endYear) return true;
    
    const start = parseInt(startYear);
    const end = parseInt(endYear);
    if (isNaN(start) || isNaN(end) || start >= end) return false;
    
    const duration = end - start;
    const deg = (degree || "").toLowerCase();
    
    if (deg.includes("b.tech") || deg.includes("b.e") || deg.includes("bachelor of engineering") || deg.includes("bachelor of technology")) {
        return duration === 4;
    }
    if (deg.includes("m.tech") || deg.includes("m.e") || deg.includes("mba") || deg.includes("m.sc") || deg.includes("ma") || deg.includes("m.com") || deg.includes("intermediate") || deg.includes("12th") || deg.includes("pu")) {
        return duration === 2;
    }
    if (deg.includes("b.sc") || deg.includes("b.com") || deg.includes("bba") || deg.includes("bca") || deg.includes("ba")) {
        return duration === 3;
    }
    if (deg.includes("phd") || deg.includes("doctorate")) {
        return duration >= 3 && duration <= 7;
    }
    
    return duration >= 2 && duration <= 5;
};

const EditProfile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    location: "",
    skills: "",
    github: "",
    linkedin: "",
    portfolio: "",
    degree: "",
    stream: "",
    startYear: "",
    endYear: ""
  });
  const [resume, setResume] = useState(null);
  const [resumeUrl, setResumeUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("http://localhost:5000/user/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const user = res.data;
        setFormData({
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          phone: user.phone || "",
          location: user.location || "",
          skills: user.skills ? user.skills.join(", ") : "",
          github: user.portfolioLinks?.github || "",
          linkedin: user.portfolioLinks?.linkedin || "",
          portfolio: user.portfolioLinks?.portfolio || "",
          degree: user.education && user.education.length > 0 ? user.education[0].degree || "" : "",
          stream: user.education && user.education.length > 0 ? user.education[0].stream || "" : "",
          startYear: user.education && user.education.length > 0 ? user.education[0].startYear || "" : "",
          endYear: user.education && user.education.length > 0 ? user.education[0].endYear || "" : ""
        });
        setResumeUrl(user.resumeUrl || "");
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setResume(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.startYear && formData.endYear) {
      if (!isValidDuration(formData.degree, formData.startYear, formData.endYear)) {
          alert(`Invalid graduation duration. The difference between Start Year (${formData.startYear}) and End Year (${formData.endYear}) is not mathematically valid for the specified degree (${formData.degree || 'provided course'}).`);
          return;
      }
    }
    
    setSaving(true);
    try {
      const data = new FormData();
      data.append("firstName", formData.firstName);
      data.append("lastName", formData.lastName);
      data.append("phone", formData.phone);
      data.append("location", formData.location);
      data.append("skills", JSON.stringify(formData.skills.split(",").map(s => s.trim()).filter(s => s !== "")));
      data.append("portfolioLinks", JSON.stringify({
        github: formData.github,
        linkedin: formData.linkedin,
        portfolio: formData.portfolio
      }));
      if (formData.degree || formData.stream || formData.startYear || formData.endYear) {
        data.append("education", JSON.stringify([{ degree: formData.degree, stream: formData.stream, startYear: formData.startYear, endYear: formData.endYear }]));
      }
      
      if (resume) {
        data.append("resume", resume);
      }

      await axios.put("http://localhost:5000/user/update-profile", data, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });
      alert("Profile updated successfully!");
      navigate("/user-dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white">
          <h1 className="text-3xl font-extrabold">Edit Profile</h1>
          <p className="text-blue-100 mt-2">Update your personal information, profesional links, and resume</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">First Name</label>
              <input 
                name="firstName" 
                value={formData.firstName} 
                onChange={handleInputChange} 
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Last Name</label>
              <input 
                name="lastName" 
                value={formData.lastName} 
                onChange={handleInputChange} 
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
              <input 
                name="phone" 
                value={formData.phone} 
                onChange={handleInputChange} 
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Location</label>
              <input 
                name="location" 
                value={formData.location} 
                onChange={handleInputChange} 
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Degree</label>
              <input 
                name="degree" 
                value={formData.degree} 
                onChange={handleInputChange} 
                placeholder="e.g. B.Tech"
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Stream</label>
              <input 
                name="stream" 
                value={formData.stream} 
                onChange={handleInputChange} 
                placeholder="e.g. Computer Science"
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Start Year</label>
              <input 
                name="startYear" 
                value={formData.startYear} 
                onChange={handleInputChange} 
                placeholder="e.g. 2020"
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">End Year (Graduation)</label>
              <input 
                name="endYear" 
                value={formData.endYear} 
                onChange={handleInputChange} 
                placeholder="e.g. 2024"
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Skills (Comma separated)</label>
            <textarea 
              name="skills" 
              value={formData.skills} 
              onChange={handleInputChange} 
              rows="3"
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none font-sans"
              placeholder="e.g. React, Node.js, Python, CSS"
            />
          </div>

          <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
            <label className="block text-sm font-bold text-gray-700 mb-2">Resume (PDF/Image)</label>
            <div className="flex flex-col gap-3">
              <input 
                type="file" 
                onChange={handleFileChange}
                accept=".pdf,image/*"
                className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
              />
              {resumeUrl && (
                <div className="flex items-center gap-2 text-blue-600 text-xs font-semibold">
                  <span className="material-icons-outlined text-sm">check_circle</span>
                  <a href={`http://localhost:5000${resumeUrl}`} target="_blank" rel="noreferrer" className="hover:underline">
                    View Current Resume
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Professional Links</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">GitHub URL</label>
                <input 
                  name="github" 
                  value={formData.github} 
                  onChange={handleInputChange} 
                  type="url"
                  className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">LinkedIn URL</label>
                <input 
                  name="linkedin" 
                  value={formData.linkedin} 
                  onChange={handleInputChange} 
                  type="url"
                  className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Portfolio URL</label>
                <input 
                  name="portfolio" 
                  value={formData.portfolio} 
                  onChange={handleInputChange} 
                  type="url"
                  className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <button 
              type="button" 
              onClick={() => navigate("/user-dashboard")}
              className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all font-sans"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={saving}
              className="flex-1 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 font-sans"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                  Saving...
                </>
              ) : "Update Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
