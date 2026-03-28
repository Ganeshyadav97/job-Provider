import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { FaUserShield, FaBuilding, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa'

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

const AdminDashboard = () => {
  const [tab, setTab] = useState('user')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const navigate = useNavigate()

  // User State
  const [userForm, setUserForm] = useState({
    firstName: "", lastName: "", email: "", password: "", phone: "", degree: "", stream: "", startYear: "", endYear: "", skills: ""
  });
  const [resume, setResume] = useState(null);

  // Company State
  const [companyForm, setCompanyForm] = useState({
    name: "", location: "", email: "", password: "", industry: "", website: "", description: "", logoUrl: "", foundedYear: "", companySize: ""
  });

  const handleUserChange = (e) => setUserForm({ ...userForm, [e.target.name]: e.target.value });
  const handleCompanyChange = (e) => setCompanyForm({ ...companyForm, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Client-side validation: Degree duration check for user creation
    if (tab === 'user' && userForm.startYear && userForm.endYear) {
      if (!isValidDuration(userForm.degree, userForm.startYear, userForm.endYear)) {
          setMessage({ type: 'error', text: `Invalid graduation duration. The difference between Start Year (${userForm.startYear}) and End Year (${userForm.endYear}) is not mathematically valid for the specified degree (${userForm.degree || 'provided course'}).` });
          return;
      }
    }
    
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      let dataPayload;
      let headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };

      if (tab === 'user') {
        const formData = new FormData();
        Object.keys(userForm).forEach(key => {
          if (key !== 'degree' && key !== 'stream' && key !== 'startYear' && key !== 'endYear' && key !== 'skills') formData.append(key, userForm[key]);
        });
        if (userForm.degree || userForm.stream || userForm.startYear || userForm.endYear) formData.append("education", JSON.stringify([{ degree: userForm.degree, stream: userForm.stream, startYear: userForm.startYear, endYear: userForm.endYear }]));
        if (userForm.skills) formData.append("skills", JSON.stringify(userForm.skills.split(',').map(s => s.trim())));
        if (resume) formData.append("resume", resume);
        
        dataPayload = formData;
        headers["Content-Type"] = "multipart/form-data";
      } else {
        dataPayload = companyForm;
        headers["Content-Type"] = "application/json";
      }

      await axios.post(
        `http://localhost:5000/admin/create${tab}`,
        dataPayload,
        { headers }
      )

      setMessage({ type: 'success', text: `${tab === 'user' ? 'User' : 'Company'} account created successfully!` })

      // Reset
      setUserForm({ firstName: "", lastName: "", email: "", password: "", phone: "", degree: "", stream: "", startYear: "", endYear: "", skills: "" });
      setCompanyForm({ name: "", location: "", email: "", password: "", industry: "", website: "", description: "", logoUrl: "", foundedYear: "", companySize: "" });
      setResume(null);

    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setMessage({ type: 'error', text: error.response.data.message });
      } else {
        setMessage({ type: 'error', text: 'Something went wrong!' });
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4 py-10">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
        {/* Header */}
        <div className="relative">
          <div className="absolute left-0 top-0">
          </div>
          <div className="text-center mb-8">
            <FaUserShield className="text-indigo-600 text-4xl mx-auto mb-2 font-bold" />
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-500 mt-1">
              Create and manage user or company accounts
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex mb-6">
          <button
            onClick={() => setTab('user')}
            className={`w-1/2 py-2 font-medium rounded-l-lg transition-all ${
              tab === 'user'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            User Account
          </button>
          <button
            onClick={() => setTab('company')}
            className={`w-1/2 py-2 font-medium rounded-r-lg transition-all ${
              tab === 'company'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Company Account
          </button>
        </div>

        {/* Alerts */}
        {message.text && (
          <div
            className={`flex items-center gap-2 mb-4 p-3 rounded-md text-sm ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {message.type === 'success' ? (
              <FaCheckCircle className="text-green-600" />
            ) : (
              <FaExclamationCircle className="text-red-600" />
            )}
            {message.text}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {tab === 'company' ? (
            <>
              {/* Company Form Fields */}
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-gray-700">Company Name *</label>
                  <input type="text" name="name" value={companyForm.name} onChange={handleCompanyChange} className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2" required />
                </div>
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-gray-700">Location *</label>
                  <input type="text" name="location" value={companyForm.location} onChange={handleCompanyChange} className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2" required />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-gray-700">Email *</label>
                  <input type="email" name="email" value={companyForm.email} onChange={handleCompanyChange} className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2" required />
                </div>
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-gray-700">Password *</label>
                  <input type="password" name="password" value={companyForm.password} onChange={handleCompanyChange} className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2" required />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-gray-700">Industry</label>
                  <input type="text" name="industry" value={companyForm.industry} onChange={handleCompanyChange} className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-gray-700">Company Size</label>
                  <input type="text" name="companySize" value={companyForm.companySize} placeholder="e.g. 50-200" onChange={handleCompanyChange} className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* User Form Fields */}
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <input type="text" name="firstName" value={userForm.firstName} onChange={handleUserChange} className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input type="text" name="lastName" value={userForm.lastName} onChange={handleUserChange} className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-gray-700">Email *</label>
                  <input type="email" name="email" value={userForm.email} onChange={handleUserChange} className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2" required />
                </div>
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-gray-700">Password *</label>
                  <input type="password" name="password" value={userForm.password} onChange={handleUserChange} className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2" required />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-gray-700">Degree</label>
                  <input type="text" name="degree" value={userForm.degree} placeholder="e.g. B.Tech" onChange={handleUserChange} className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-gray-700">Stream</label>
                  <input type="text" name="stream" value={userForm.stream} placeholder="e.g. CS" onChange={handleUserChange} className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-gray-700">Start Year</label>
                  <input type="text" name="startYear" value={userForm.startYear} placeholder="e.g. 2020" onChange={handleUserChange} className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-gray-700">End Year</label>
                  <input type="text" name="endYear" value={userForm.endYear} placeholder="e.g. 2024" onChange={handleUserChange} className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Skills (comma separated)</label>
                <input type="text" name="skills" value={userForm.skills} placeholder="React, Node.js" onChange={handleUserChange} className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Resume File</label>
                <input type="file" accept=".pdf,image/*" onChange={(e) => setResume(e.target.files[0])} className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50" />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition duration-150 ease-in-out disabled:opacity-60"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                Creating Account...
              </>
            ) : (
              `Create ${tab === 'user' ? 'User' : 'Company'}`
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AdminDashboard
