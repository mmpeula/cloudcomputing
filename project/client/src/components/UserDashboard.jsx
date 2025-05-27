import React, { useState, useEffect } from 'react'
import '../userdashboard.css'

function UserDashboard() {
  const [search, setSearch] = useState('')
  const [recommendations, setRecommendations] = useState([])
  const [message, setMessage] = useState('')

  useEffect(() => { fetchRecommendations() }, [])

  const fetchRecommendations = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/recommendations')
      const data = await res.json()
      setRecommendations(data)
    } catch { setRecommendations([]) }
  }

  const handleSearch = async () => {
    if (!search.trim()) return
    try {
      const res = await fetch(`http://localhost:4000/api/search?q=${encodeURIComponent(search)}`)
      const data = await res.json()
      setRecommendations(data)
    } catch { setRecommendations([]) }
  }

  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(''), 3000)
      return () => clearTimeout(t)
    }
  }, [message])

  const handleExit = () => { window.location.href = '/' }
  const goToBookings = () => { window.location.href = '/my-registrations' }

  const handleRegister = async id => {
    try {
      const res = await fetch(`http://localhost:4000/api/activities/${id}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      const data = await res.json()
      if (res.status === 201) { setMessage('✅ You successfully registered for the activity'); fetchRecommendations() }
      else { setMessage(`❌ ${data.message}`) }
    } catch { setMessage('❌ Registration failed') }
  }

  const formatPrice = v => {
    const n = parseFloat(v)
    if (Number.isNaN(n)) return '—'
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n)
  }

  return (
    <div className="dashboard">
      <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="button-create" onClick={goToBookings}>My Bookings</button>
        <h2 style={{ margin: 0 }}>Welcome to GERAT</h2>
        <button className="button-exit" onClick={handleExit}>Exit</button>
      </div>

      <div className="search-section">
        <h1><strong>Find your next activity</strong></h1>
        <p>Search low prices on tours, events and much more...</p>
        <div className="search-bar">
          <input type="text" placeholder="Search destinations or activities..." value={search} onChange={e => setSearch(e.target.value)} />
          <button onClick={handleSearch}>Search</button>
        </div>
      </div>

      {message && <div style={{ margin: '1rem auto', textAlign: 'center', color: message.startsWith('✅') ? 'green' : 'crimson', fontWeight: 'bold' }}>{message}</div>}

      <div className="recommendations">
        <h2>Recommendations for you</h2>
        <div className="activities-list">
          {recommendations.map((item, i) => (
            <div key={i} className="activity-card">
              <img src={item.current_participants >= item.max_participants ? '/completed.png' : item.image} alt={item.title} onError={e => { e.target.onerror = null; e.target.src = '/default-image.png' }} />
              <h3>{item.title}</h3>
              <p>{item.date}</p>
              <p>{formatPrice(item.price)}</p>
              <p><strong>{item.available}</strong></p>
              <button className="button-submit" onClick={() => handleRegister(item.id)}>Join</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default UserDashboard
