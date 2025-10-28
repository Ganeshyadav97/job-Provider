import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [role, setRole] = useState('user'); // user or company
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [location, setLocation] = useState('');
  const [err, setErr] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleCreate = async () => {
    try {
      setErr('');
      setSuccess('');

      let payload;
      if (role === 'user') {
        payload = { email, password };
      } else {
        // company requires name, email, password, location
        if (!companyName || !location) {
          setErr('Please provide company name and location');
          return;
        }
        payload = { name: companyName, email, password, location };
        console.log(payload);
      }

      await axios.post(`https://job-poster-1.onrender.com/admin/create${role}`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      setSuccess(`${role === 'user' ? 'User' : 'Company'} account created successfully!`);
      // reset fields
      setEmail('');
      setPassword('');
      setCompanyName('');
      setLocation('');
      navigate('/login');
    } catch (error) {
      setErr(error.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-center text-4xl font-extrabold text-gray-900">
            Admin Dashboard
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Create new user or company accounts
          </p>
        </div>
        <div className="bg-white py-8 px-6 shadow-lg rounded-lg border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            {role === 'user' ? 'Create User Account' : 'Create Company Account'}
          </h2>

          {err && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
              {err}
            </div>
          )}
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-md">
              {success}
            </div>
          )}

          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleCreate(); }}>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Account Type
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="user">Create User</option>
                <option value="company">Create Company</option>
              </select>
            </div>

            {role === 'company' && (
              <>
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                    Company Name
                  </label>
                  <input
                    id="companyName"
                    type="text"
                    placeholder="Enter company name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                    Location
                  </label>
                  <input
                    id="location"
                    type="text"
                    placeholder="Enter location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  />
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
              >
                Create Account
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
