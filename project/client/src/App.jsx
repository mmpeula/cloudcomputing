import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LoginRegister from './components/LoginRegister'
import UserDashboard from './components/UserDashboard'
import OrganizerDashboard from './components/OrganizerDashboard'
import MyRegistrations from './components/MyRegistrations'
import MyCalendar from './components/MyCalendar'

function App() {
  const [redirectPath, setRedirectPath] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')
    if (token && role === 'manager') setRedirectPath('/organizer')
    else if (token && role === 'user') setRedirectPath('/user')
  }, [])

  return (
    <Router>
      <Routes>
        <Route path="/" element={redirectPath ? <Navigate to={redirectPath} /> : <LoginRegister />} />
        <Route path="/user" element={<UserDashboard />} />
        <Route path="/organizer" element={<OrganizerDashboard />} />
        <Route path="/my-registrations" element={<MyRegistrations />} />
        <Route path="/mycalendar" element={<MyCalendar />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  )
}

export default App
