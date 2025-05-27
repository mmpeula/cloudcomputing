import React, { useEffect, useState } from 'react'
import '../organizerdashboard.css'

function OrganizerDashboard() {
  const [activities, setActivities] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState('')
  const [editActivity, setEditActivity] = useState(null)
  const [editForm, setEditForm] = useState(null)
  const [currentPage, setCurrentPage] = useState(0)
  const itemsPerPage = 3
  const [imageFile, setImageFile] = useState(null)
  const [editImageFile, setEditImageFile] = useState(null)

  const [newActivity, setNewActivity] = useState({
    name: '',
    description: '',
    price: '',
    location: '',
    max_participants: '',
    start_date: '',
    image_url: ''
  })

  const token = localStorage.getItem('token')

  const handleExit = () => { window.location.href = '/' }
  const goToCalendar = () => { window.location.href = '/mycalendar' }

  const fetchActivities = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/my-activities', { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setActivities(data)
    } catch { setMessage('❌ Failed to load activities') }
  }

  useEffect(() => { fetchActivities() }, [])

  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(''), 3000)
      return () => clearTimeout(t)
    }
  }, [message])

  const uploadImage = async file => {
    if (!file) return ''
    const form = new FormData()
    form.append('image', file)
    const res = await fetch('http://localhost:4000/api/upload', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form })
    const data = await res.json()
    return data.url
  }

  const handleCreate = async e => {
    e.preventDefault()
    setMessage('')
    try {
      const imgUrl = imageFile ? await uploadImage(imageFile) : newActivity.image_url
      const res = await fetch('http://localhost:4000/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...newActivity, image_url: imgUrl })
      })
      const data = await res.json()
      if (res.status === 201) {
        setMessage('✅ Activity created successfully')
        const created = { ...newActivity, image_url: imgUrl, current_participants: 0 }
        setActivities([created, ...activities])
        setNewActivity({ name: '', description: '', price: '', location: '', max_participants: '', start_date: '', image_url: '' })
        setImageFile(null)
        setShowForm(false)
      } else { setMessage(`❌ ${data?.message || 'Creation failed'}`) }
    } catch { setMessage('❌ Error creating activity') }
  }

  const handleDelete = async id => {
    try {
      const res = await fetch(`http://localhost:4000/api/activities/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) { setActivities(p => p.filter(a => a.id !== id)); setMessage('✅ Activity deleted') }
      else { const d = await res.json(); setMessage(`❌ ${d.message || 'Failed to delete'}`) }
    } catch { setMessage('❌ Error deleting activity') }
  }

  const handleEdit = act => {
    setEditActivity(act)
    setEditForm({
      name: act.name,
      description: act.description,
      price: act.price,
      location: act.location,
      max_participants: act.max_participants,
      start_date: act.start_date.split('T')[0],
      image_url: act.image_url
    })
    setEditImageFile(null)
    setShowForm(false)
  }

  const handleUpdate = async e => {
    e.preventDefault()
    try {
      const imgUrl = editImageFile ? await uploadImage(editImageFile) : editForm.image_url
      const res = await fetch(`http://localhost:4000/api/activities/${editActivity.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...editForm, image_url: imgUrl })
      })
      const d = await res.json()
      if (res.ok) {
        setMessage('✅ Activity updated')
        setActivities(p => p.map(a => a.id === editActivity.id ? { ...a, ...editForm, image_url: imgUrl } : a))
        setEditActivity(null)
      } else { setMessage(`❌ ${d.message || 'Update failed'}`) }
    } catch { setMessage('❌ Error updating activity') }
  }

  const formatPrice = v => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(v)
  const formatDate = d => new Date(d).toLocaleDateString('es-ES')

  const startIndex = currentPage * itemsPerPage
  const paginatedActivities = activities.slice(startIndex, startIndex + itemsPerPage)
  const totalPages = Math.ceil(activities.length / itemsPerPage)

  return (
    <div className="dashboard">
      <div className="header">
        <button className="button-edit" onClick={goToCalendar}>Calendar</button>
        <h2>My Announcements</h2>
        <button className="button-exit" onClick={handleExit}>Exit</button>
      </div>

      {message && <div className="feedback-message" style={{ marginBottom: '1rem', color: message.startsWith('✅') ? 'green' : 'crimson', fontWeight: 'bold', textAlign: 'center' }}>{message}</div>}

      <div className="activities-list">
        {paginatedActivities.map((act, i) => (
          <div className="activity-card animate" key={i}>
            <img src={act.image_url} alt={act.name} onError={e => { e.target.onerror = null; e.target.src = '/default-image.png' }} />
            <h3>{act.name}</h3>
            <p>{act.description}</p>
            <p><strong>Location:</strong> {act.location}</p>
            <p><strong>Date:</strong> {formatDate(act.start_date)}</p>
            <p><strong>Price:</strong> {formatPrice(act.price)}</p>
            <p><strong>Participants:</strong> {act.current_participants}/{act.max_participants}</p>
            <div className="activity-actions">
              <button className="button-edit" onClick={() => handleEdit(act)}>Edit</button>
              <button className="button-delete" onClick={() => handleDelete(act.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div style={{ textAlign: 'center', margin: '1.5rem 0' }}>
          <button className="button-edit" onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0}>⬅ Prev</button>
          <span style={{ margin: '0 1rem', fontWeight: 'bold' }}>Page {currentPage + 1} of {totalPages}</span>
          <button className="button-edit" onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))} disabled={currentPage >= totalPages - 1}>Next ➡</button>
        </div>
      )}

      {editActivity && (
        <form className="activity-form" onSubmit={handleUpdate}>
          <input type="text" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} required />
          <textarea value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} required />
          <input type="number" value={editForm.price} onChange={e => setEditForm({ ...editForm, price: e.target.value })} required />
          <input type="text" value={editForm.location} onChange={e => setEditForm({ ...editForm, location: e.target.value })} required />
          <input type="number" value={editForm.max_participants} onChange={e => setEditForm({ ...editForm, max_participants: e.target.value })} required />
          <input type="date" value={editForm.start_date} onChange={e => setEditForm({ ...editForm, start_date: e.target.value })} required />
          <input type="url" value={editForm.image_url} onChange={e => setEditForm({ ...editForm, image_url: e.target.value })} />
          <input type="file" accept="image/*" onChange={e => setEditImageFile(e.target.files[0])} />
          <button type="submit" className="button-submit">Update</button>
          <button type="button" className="button-delete" onClick={() => setEditActivity(null)}>Cancel</button>
        </form>
      )}

      {showForm && !editActivity && (
        <form className="activity-form" onSubmit={handleCreate}>
          <input type="text" placeholder="Name" required value={newActivity.name} onChange={e => setNewActivity({ ...newActivity, name: e.target.value })} />
          <textarea placeholder="Description" required value={newActivity.description} onChange={e => setNewActivity({ ...newActivity, description: e.target.value })} />
          <input type="number" placeholder="Price" required value={newActivity.price} onChange={e => setNewActivity({ ...newActivity, price: e.target.value })} />
          <input type="text" placeholder="Location" required value={newActivity.location} onChange={e => setNewActivity({ ...newActivity, location: e.target.value })} />
          <input type="number" placeholder="Max Participants" required value={newActivity.max_participants} onChange={e => setNewActivity({ ...newActivity, max_participants: e.target.value })} />
          <input type="date" required value={newActivity.start_date} onChange={e => setNewActivity({ ...newActivity, start_date: e.target.value })} />
          <input type="url" placeholder="Image URL (optional)" value={newActivity.image_url} onChange={e => setNewActivity({ ...newActivity, image_url: e.target.value })} />
          <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} />
          <button className="button-submit" type="submit">Create</button>
        </form>
      )}

      {!showForm && !editActivity && <button className="button-create" onClick={() => setShowForm(true)}>Create New Activity</button>}
    </div>
  )
}

export default OrganizerDashboard
