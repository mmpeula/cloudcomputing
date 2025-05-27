import React, { useEffect, useState } from 'react'
import '../userdashboard.css'
import '../myregistrations.css'

function MyRegistrations() {
  const [activities, setActivities] = useState([])
  const [message, setMessage] = useState('')
  const [page, setPage] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [modalContent, setModalContent] = useState('')
  const [calendarSynced, setCalendarSynced] = useState(false)
  const pageSize = 3

  useEffect(() => {
    const alreadySynced = localStorage.getItem('calendarSynced') === 'true'
    setCalendarSynced(alreadySynced)
    const fetchData = async () => {
      try {
        const res = await fetch('http://localhost:4000/api/my-registrations', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
        const data = await res.json()
        if (res.ok) setActivities(data)
        else setMessage(data.message || 'Failed to load registrations')
      } catch { setMessage('Error loading registrations') }
    }
    fetchData()
  }, [])

  const handleBack = () => { window.location.href = '/user' }
  const handleUnregister = async id => {
    if (!window.confirm('Are you sure you want to unregister from this activity?')) return
    try {
      const res = await fetch(`http://localhost:4000/api/activities/${id}/unregister`, { method: 'DELETE', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      const data = await res.json()
      if (res.ok) { setActivities(p => p.filter(a => a.id !== id)); setMessage('✅ Unregistered successfully') }
      else setMessage(`❌ ${data.message}`)
    } catch { setMessage('❌ Error unregistering') }
  }
  const handleGoogleAuth = () => { window.location.href = 'http://localhost:4000/api/google-auth' }
  const handleAddToCalendar = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/calendar/add-events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ activities }) })
      const data = await res.json()
      if (res.ok) { setModalContent('✅ Events were successfully added to your Google Calendar.'); setCalendarSynced(true); localStorage.setItem('calendarSynced', 'true') }
      else setModalContent(`❌ ${data.error}`)
    } catch { setModalContent('❌ Failed to sync with Google Calendar') }
    finally { setShowModal(true) }
  }

  const formatDate = d => new Date(d).toLocaleDateString('es-ES')
  const formatPrice = v => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(parseFloat(v))

  const totalPages = Math.ceil(activities.length / pageSize)
  const paginatedActivities = activities.slice(page * pageSize, (page + 1) * pageSize)

  return (
    <div className="dashboard">
      <div className="header">
        <h2>My Bookings</h2>
        <button className="button-exit" onClick={handleBack}>Back to Dashboard</button>
      </div>

      <div className="sync-buttons">
        <button className="button-exit" onClick={handleGoogleAuth}>🔗 Sync with Google Calendar</button>
        {activities.length > 0 && !calendarSynced && <button className="button-edit" onClick={handleAddToCalendar}>📅 Add Activities to Google Calendar</button>}
      </div>

      {message && <div className={`status-message ${message.startsWith('✅') ? 'success' : 'error'}`}>{message}</div>}

      <div className="activities-list">
        {paginatedActivities.map((act, i) => (
          <div className="activity-card" key={i}>
            <img src={act.image_url} alt={act.name} onError={e => { e.target.onerror = null; e.target.src = '/default-image.png' }} />
            <h3>{act.name}</h3>
            <p>{act.description}</p>
            <p><strong>Date:</strong> {formatDate(act.start_date)}</p>
            <p><strong>Location:</strong> {act.location}</p>
            <p><strong>Price:</strong> {formatPrice(act.price)}</p>
            <p><strong>Slots:</strong> {act.current_participants}/{act.max_participants}</p>
            <button className="button-delete" onClick={() => handleUnregister(act.id)}>Unregister</button>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button className="button-edit" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>⬅ Prev</button>
          <span className="pagination-info">Page {page + 1} of {totalPages}</span>
          <button className="button-edit" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}>Next ➡</button>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p>{modalContent}</p>
            <button className="button-edit" onClick={() => setShowModal(false)}>OK</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyRegistrations
