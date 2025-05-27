import React, { useEffect, useState } from 'react'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  format,
  isSameMonth,
  isSameDay
} from 'date-fns'
import { es } from 'date-fns/locale'
import { useNavigate } from 'react-router-dom'
import '../organizerdashboard.css'
import '../userdashboard.css'
import '../mycalendar.css'

function MyCalendar() {
  const [activities, setActivities] = useState([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('http://localhost:4000/api/my-activities', {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        if (res.ok) setActivities(data)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [token])

  const activityMap = activities.reduce((acc, a) => {
    const k = format(new Date(a.start_date), 'yyyy-MM-dd')
    if (!acc[k]) acc[k] = []
    acc[k].push(a)
    return acc
  }, {})

  const renderHeader = () => (
    <div className="calendar-header">
      <button className="button-edit" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>⬅</button>
      <h2>{format(currentMonth, 'MMMM yyyy', { locale: es })}</h2>
      <button className="button-edit" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>➡</button>
    </div>
  )

  const renderDays = () => {
    const days = []
    for (let i = 0; i < 7; i++) {
      days.push(
        <div className="calendar-cell calendar-day-name" key={i}>
          {format(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), i), 'EEE', { locale: es })}
        </div>
      )
    }
    return <div className="calendar-row">{days}</div>
  }

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 })
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })
    const rows = []
    let day = startDate
    while (day <= endDate) {
      const cells = []
      for (let i = 0; i < 7; i++) {
        const formatted = format(day, 'd')
        const key = format(day, 'yyyy-MM-dd')
        const acts = activityMap[key] || []
        cells.push(
          <div
            className={`calendar-cell${!isSameMonth(day, monthStart) ? ' disabled' : ''}${acts.length ? ' has-activity' : ''}${isSameDay(day, new Date()) ? ' today' : ''}`}
            key={day}
          >
            <span className="calendar-number">{formatted}</span>
            {acts.map((a, idx) => (
              <span className="calendar-activity" key={idx}>{a.name}</span>
            ))}
          </div>
        )
        day = addDays(day, 1)
      }
      rows.push(<div className="calendar-row" key={day}>{cells}</div>)
    }
    return <div className="calendar-body">{rows}</div>
  }

  return (
    <div className="dashboard">
      <div className="header">
        <h2>MyCalendar</h2>
        <button className="button-exit" onClick={() => navigate(-1)}>Back to Manager</button>
      </div>
      <div className="calendar-container">
        {loading ? <p className="loading-text">Loading...</p> : (
          <>
            {renderHeader()}
            {renderDays()}
            {renderCells()}
          </>
        )}
      </div>
    </div>
  )
}

export default MyCalendar
