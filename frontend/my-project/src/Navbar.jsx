import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const profileRef = useRef(null);
  const dropdownRef = useRef(null);

  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");
  const role = userRole || "user";
  const isAuthPage = location.pathname === "/login" || location.pathname === "/signup" || location.pathname === "/";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    // Trap back-gesture / side-drag to prevent accidental logout
    const handlePopState = (event) => {
      if (token && !isAuthPage) {
        // Push state back to stay on page and show alert
        window.history.pushState(null, "", window.location.href);
        setShowLogoutModal(true);
      }
    };

    if (token && !isAuthPage) {
      window.addEventListener("popstate", handlePopState);
      // Initial push to enable the trap
      window.history.pushState(null, "", window.location.href);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [token, isAuthPage]);

  const handleLogout = () => {
    setIsProfileOpen(false);
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    setShowLogoutModal(false);
    navigate("/login");
  };

  const [search, setSearch] = useState("");


  const navItems = [
    { 
      label: "Internships", 
      options: [
        { label: "Work from Home", params: "locationType=Remote&employmentType=Internship" },
        { label: "Internship in Bangalore", params: "location=Bangalore&employmentType=Internship" },
        { label: "Internship in Delhi", params: "location=Delhi&employmentType=Internship" },
        { label: "Internship in Hyderabad", params: "location=Hyderabad&employmentType=Internship" },
        { label: "Internship in Mumbai", params: "location=Mumbai&employmentType=Internship" },
        { label: "View all internships", params: "employmentType=Internship" }
      ] 
    },
    { 
      label: "Jobs", 
      options: [
        { label: "Job Opportunities", params: "employmentType=Job" },
        { label: "Fresher Jobs", params: "search=Fresher" },
        { label: "Remote Jobs", params: "locationType=Remote" },
        { label: "View all jobs", params: "employmentType=Job" }
      ] 
    },
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (search.trim()) {
      const newParams = new URLSearchParams(location.search);
      // Only add if not already present to avoid duplicates
      const existingSearches = newParams.getAll('search').map(s => s.toLowerCase());
      if (!existingSearches.includes(search.trim().toLowerCase())) {
        newParams.append('search', search.trim());
        navigate(`/${role}-dashboard?${newParams.toString()}`);
      }
      setSearch("");
    }
  };

  // No longer syncing search input with URL as we use multiple tags
  
  const toggleDropdown = (label) => {
    setActiveDropdown(activeDropdown === label ? null : label);
    setIsProfileOpen(false);
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
    setActiveDropdown(null);
  };

  const getMergedPath = (newParamsStr) => {
    const currentParams = new URLSearchParams(location.search);
    const incomingParams = new URLSearchParams(newParamsStr);
    for (const [key, value] of incomingParams.entries()) {
      currentParams.set(key, value);
    }
    return `/${role}-dashboard?${currentParams.toString()}`;
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm font-sans">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className={`flex h-16 items-center ${isAuthPage ? 'justify-center' : 'justify-between'}`}>

          {/* Left Side: Logo & Main Nav */}
          <div className="flex items-center gap-6">
            <Link to={token && role ? `/${role}-dashboard` : "/"} className="flex items-center gap-2 shrink-0">
              <div className="bg-blue-600 p-1.5 rounded-lg shadow-sm">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-800 tracking-tight hidden sm:block">RecruitX</span>
            </Link>

            {/* Desktop Nav Items */}
            {!isAuthPage && role === 'user' && (
              <div className="hidden md:flex items-center gap-4" ref={dropdownRef}>
                {navItems.map((item) => (
                  <div key={item.label} className="relative">
                    <button
                      onClick={() => toggleDropdown(item.label)}
                      className="flex items-center gap-1 text-gray-700 hover:text-blue-600 font-bold text-[13px] py-5 transition-colors outline-none shrink-0"
                    >
                      {item.label}
                      <svg className={`w-3 h-3 text-gray-400 transition-transform ${activeDropdown === item.label ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Dropdown Menu */}
                    {activeDropdown === item.label && (
                      <div className="absolute top-full left-0 w-64 bg-white shadow-2xl rounded-b-xl border border-gray-50 py-3 z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="px-5 pb-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 mb-2">
                           Explore {item.label}
                        </div>
                        {item.options.map((opt) => (
                          <Link
                            key={opt.label}
                            to={getMergedPath(opt.params)}
                            onClick={() => setActiveDropdown(null)}
                            className="block w-full text-left px-5 py-2.5 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors font-medium border-0"
                          >
                            {opt.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Search Bar */}
            {!isAuthPage && role === 'user' && (
              <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center bg-gray-50 border border-gray-100 rounded-full px-4 py-1.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-200 transition-all w-48 lg:w-64 xl:w-80 ml-2 group">
                <span className="material-icons-outlined text-gray-400 text-lg mr-2 group-focus-within:text-blue-500">search</span>
                <input 
                  type="text" 
                  placeholder="Search..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-transparent border-none outline-none text-sm text-gray-600 placeholder:text-gray-400 w-full"
                />
                {search && (
                  <button 
                    type="button"
                    onClick={() => setSearch('')}
                    className="flex items-center justify-center p-0.5 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <span className="material-icons-outlined text-sm text-gray-400">close</span>
                  </button>
                )}
              </form>
            )}
          </div>

          {/* Right Side: Profile */}
          {!isAuthPage && (
            <div className="flex items-center gap-6">
              {token ? (
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={toggleProfile}
                    className="flex items-center gap-2 group focus:outline-none"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold border border-blue-100 group-hover:bg-blue-100 transition-all font-sans">
                      {role?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <svg className={`w-3 h-3 text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Profile Dropdown */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-3 w-64 bg-white shadow-2xl rounded-2xl border border-gray-100 overflow-hidden z-[110] animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="p-4 bg-gray-50/50 border-b border-gray-100 text-center">
                         <div className="text-sm font-bold text-gray-800 uppercase tracking-tight">Active Portal</div>
                         <div className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-bold">Role: {role}</div>
                      </div>
                      <div className="py-2 font-sans">
                        <Link to={`/${role}-dashboard`} className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors" onClick={() => setIsProfileOpen(false)}>
                          <span className="material-icons-outlined text-gray-400 text-lg">home</span> Home
                        </Link>
                        {role === "user" && (
                          <Link to="/edit-profile" className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors border-t border-gray-50 mt-1" onClick={() => setIsProfileOpen(false)}>
                            <span className="material-icons-outlined text-gray-400 text-lg">edit</span> Edit Profile
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left mt-1 border-t border-gray-50"
                        >
                          <span className="material-icons-outlined text-red-400 text-lg">logout</span> Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link to="/login" className="text-sm font-bold text-blue-600 hover:text-blue-700 px-4 py-2">Login</Link>
                  <Link to="/signup" className="text-sm font-bold bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 shadow-md transition-all">Register</Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Logout Confirmation Card (Alert) */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 border border-red-50 animate-in zoom-in-95 duration-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="material-icons-outlined text-4xl">logout</span>
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Logout</h2>
              <p className="text-gray-500 mb-8 font-sans">Are you sure you want to logout? You'll need to sign in again to access your dashboard.</p>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl transition-all border border-gray-100"
                >
                  CANCEL
                </button>
                <button 
                  onClick={confirmLogout}
                  className="flex-1 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl shadow-lg shadow-red-200 transition-all active:scale-[0.98]"
                >
                  YES
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
