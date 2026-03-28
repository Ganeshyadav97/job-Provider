import React from 'react'
import {BrowserRouter as Router,Route,Routes} from'react-router-dom'
import Login from './Login'
import SignUp from './SignUp'
import AdminDashboard from './AdminDashboard'
import CompanyDashboard from './CompanyDashboard'
import UserDashboard from './UserDashboard'
import JobDetails from './JobDetails'
import UserJobView from './UserJobView'
import EditProfile from './EditProfile'
import Navbar from './Navbar'

function App(){
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path='/signup' element={<SignUp/>}/>
        
        <Route path='/login' element={<Login/>}/>
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/company-dashboard" element={<CompanyDashboard />} />
        <Route path="/jobdetails/:id" element={<JobDetails />} />
        <Route path="/job/:id" element={<UserJobView />} />
        <Route path='/user-dashboard' element={<UserDashboard/>}/>
        <Route path='/edit-profile' element={<EditProfile/>}/>
        
        <Route path='/' element={<Login/>}/>
      </Routes>
    </Router>
  )
}

export default App