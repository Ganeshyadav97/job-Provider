import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

// Helper to validate degree duration
const isValidDuration = (degree, startYear, endYear) => {
    if (!startYear || !endYear) return true; // Skip if years are missing
    
    const start = parseInt(startYear);
    const end = parseInt(endYear);
    if (isNaN(start) || isNaN(end) || start >= end) return false;
    
    const duration = end - start;
    const deg = (degree || "").toLowerCase();
    
    // Core duration rules
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
    
    // If degree is unknown or empty but years exist, assume standard 2-4
    return duration >= 2 && duration <= 5;
};

const SignUp = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    degree: "",
    stream: "",
    startYear: "",
    endYear: "",
    skills: "",
    github: "",
    portfolio: ""
  });
  const [preferences, setPreferences] = useState({
    employmentType: 'Both',
    locationType: 'Any'
  });
  const [resume, setResume] = useState(null);
  
  const [err, setErr] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

    const handleSignup = async () => {
    setErr("")
    
    // Client-side validation: Degree duration check
    if (formData.startYear && formData.endYear) {
      if (!isValidDuration(formData.degree, formData.startYear, formData.endYear)) {
          setErr(`Invalid graduation duration. The difference between Start Year (${formData.startYear}) and End Year (${formData.endYear}) is not mathematically valid for the specified degree (${formData.degree || 'provided course'}).`);
          return;
      }
    }
    
    setLoading(true)
    try {
      const data = new FormData();
      // append basic info
      Object.keys(formData).forEach(key => {
        if (key !== 'degree' && key !== 'stream' && key !== 'skills' && key !== 'startYear' && key !== 'endYear') {
          data.append(key, formData[key]);
        }
      });
      
      // format education
      if (formData.degree || formData.stream || formData.startYear || formData.endYear) {
        data.append("education", JSON.stringify([{ degree: formData.degree, stream: formData.stream, startYear: formData.startYear, endYear: formData.endYear }]));
      }

      // format skills
      if (formData.skills) {
        const skillArray = formData.skills.split(',').map(s => s.trim());
        data.append("skills", JSON.stringify(skillArray));
      }

      // append file
      if (resume) {
        data.append("resume", resume);
      }

      // format portfolioLinks
      data.append("portfolioLinks", JSON.stringify({
        github: formData.github,
        portfolio: formData.portfolio
      }));

      // append preferences
      data.append("preferences", JSON.stringify(preferences));

      await axios.post("http://localhost:5000/auth/user/signup", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      navigate('/login')
    } catch (err) {
      setErr(err.response?.data?.message || "Sign up failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white shadow-xl rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
          <h1 className="text-3xl font-bold text-center">Create Account</h1>
          <p className="text-center mt-2 text-blue-100">Join us today</p>
        </div>

        {/* Form */}
        <div className="p-8">
          <form onSubmit={(e) => { e.preventDefault(); handleSignup(); }} className="space-y-4">
            {/* Name Inputs */}
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input name="firstName" type="text" onChange={handleInputChange} className="w-full border border-gray-300 p-2 rounded-lg" />
              </div>
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input name="lastName" type="text" onChange={handleInputChange} className="w-full border border-gray-300 p-2 rounded-lg" />
              </div>
            </div>

            {/* Email & Phone */}
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                <input name="email" type="email" required onChange={handleInputChange} className="w-full border border-gray-300 p-2 rounded-lg" />
              </div>
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input name="phone" type="text" onChange={handleInputChange} className="w-full border border-gray-300 p-2 rounded-lg" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password <span className="text-red-500">*</span></label>
              <input name="password" type="password" required onChange={handleInputChange} className="w-full border border-gray-300 p-2 rounded-lg" />
            </div>

            {/* Education Details */}
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Degree (e.g. B.Tech)</label>
                <input name="degree" type="text" onChange={handleInputChange} className="w-full border border-gray-300 p-2 rounded-lg" />
              </div>
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Stream (e.g. CS)</label>
                <input name="stream" type="text" onChange={handleInputChange} className="w-full border border-gray-300 p-2 rounded-lg" />
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Year</label>
                <input name="startYear" type="text" placeholder="e.g. 2020" onChange={handleInputChange} className="w-full border border-gray-300 p-2 rounded-lg" />
              </div>
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">End Year (Graduation)</label>
                <input name="endYear" type="text" placeholder="e.g. 2024" onChange={handleInputChange} className="w-full border border-gray-300 p-2 rounded-lg" />
              </div>
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma separated)</label>
              <input name="skills" type="text" placeholder="React, Node.js, Python" onChange={handleInputChange} className="w-full border border-gray-300 p-2 rounded-lg" />
            </div>

            {/* Research Links */}
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">GitHub Profile Link</label>
                <input name="github" type="url" placeholder="https://github.com/..." onChange={handleInputChange} className="w-full border border-gray-300 p-2 rounded-lg" />
              </div>
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio Link</label>
                <input name="portfolio" type="url" placeholder="https://portfolio.com/..." onChange={handleInputChange} className="w-full border border-gray-300 p-2 rounded-lg" />
              </div>
            </div>

            {/* Preferences */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
              <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <span className="material-icons-outlined text-base">settings</span>
                Job Preferences
              </h3>
              <div className="flex gap-4 text-xs">
                <div className="flex-1">
                  <label className="block text-gray-500 mb-1">Employment</label>
                  <select 
                    value={preferences.employmentType}
                    onChange={(e) => setPreferences({...preferences, employmentType: e.target.value})}
                    className="w-full border-gray-200 rounded-md p-1.5 focus:ring-blue-500"
                  >
                    <option value="Both">Full-time & Intern</option>
                    <option value="Full-time">Full-time Only</option>
                    <option value="Internship">Internship Only</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-gray-500 mb-1">Location</label>
                  <select 
                    value={preferences.locationType}
                    onChange={(e) => setPreferences({...preferences, locationType: e.target.value})}
                    className="w-full border-gray-200 rounded-md p-1.5 focus:ring-blue-500"
                  >
                    <option value="Any">Any Location</option>
                    <option value="Remote">Remote Only</option>
                    <option value="Office">Office Only</option>
                    <option value="Hybrid">Hybrid Only</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Resume Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Resume (PDF/Image)</label>
              <input type="file" accept=".pdf,image/*" onChange={(e) => setResume(e.target.files[0])} className="w-full border border-gray-300 p-2 rounded-lg bg-gray-50" />
            </div>

            {/* Error Message */}
            {err && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {err}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing up...
                </>
              ) : (
                "Sign Up"
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <span
                className="font-medium text-blue-600 hover:text-blue-500 cursor-pointer"
                onClick={() => navigate('/login')}
              >
                Login
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUp
