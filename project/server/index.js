import express from 'express'
import mssql from 'mssql'
import bodyParser from 'body-parser'
import cors from 'cors'
import dotenv from 'dotenv'
import session from 'express-session'
import { google } from 'googleapis'
import authRoutes from './routes/auth.js'
import activitiesRoutes from './routes/activities.js'
import uploadRoute from './uploadRoute.js'

dotenv.config()

const required = ['DB_SERVER', 'DB_USER', 'DB_PASSWORD', 'DB_DATABASE', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET']
const missing = required.filter(k => !process.env[k])
if (missing.length) {
  console.error(`Missing variables in .env → ${missing.join(', ')}`)
  process.exit(1)
}

const sqlConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: { encrypt: process.env.DB_ENCRYPT === 'true', trustServerCertificate: false }
}

const poolPromise = mssql.connect(sqlConfig).then(pool => {
  console.log('✅ Connected to SQL Server')
  return pool
}).catch(err => {
  console.error('🚫 Error connecting to SQL Server:', err.message)
  process.exit(1)
})

const app = express()

app.use(cors({ origin: 'http://localhost:5176', credentials: true }))
app.use(bodyParser.json())
app.use(session({ secret: 'gerat-secret', resave: false, saveUninitialized: true, cookie: { secure: false } }))
app.use('/uploads', express.static('uploads'))

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const REDIRECT_URI = 'http://localhost:4000/api/google-callback'
const SCOPES = ['https://www.googleapis.com/auth/calendar.events']

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)

app.get('/api/google-auth', (req, res) => {
  const url = oauth2Client.generateAuthUrl({ access_type: 'offline', scope: SCOPES, prompt: 'consent' })
  res.redirect(url)
})

app.get('/api/google-callback', async (req, res) => {
  try {
    const { code } = req.query
    const { tokens } = await oauth2Client.getToken(code)
    req.session.tokens = tokens
    res.redirect('http://localhost:5176/my-registrations')
  } catch (err) {
    console.error('❌ Google callback error:', err.message)
    res.status(500).send('Authentication failed.')
  }
})

app.post('/api/calendar/add-events', async (req, res) => {
  if (!req.session.tokens) return res.status(401).json({ error: 'Not authenticated' })
  const { activities } = req.body
  const auth = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)
  auth.setCredentials(req.session.tokens)
  const calendar = google.calendar({ version: 'v3', auth })
  try {
    for (const act of activities) {
      const startDate = new Date(act.start_date)
      const endDate = new Date(startDate.getTime() + 3600000)
      await calendar.events.insert({
        calendarId: 'primary',
        requestBody: {
          summary: act.name,
          description: act.description,
          location: act.location,
          start: { dateTime: startDate.toISOString(), timeZone: 'Europe/Madrid' },
          end: { dateTime: endDate.toISOString(), timeZone: 'Europe/Madrid' }
        }
      })
    }
    res.json({ success: true })
  } catch (err) {
    console.error('❌ Calendar insert error:', err.message)
    res.status(500).json({ error: 'Failed to add events', details: err.message })
  }
})

app.use('/api', authRoutes)
app.use('/api', activitiesRoutes)
app.use(uploadRoute)

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

const PORT = process.env.PORT || 4000
app.listen(PORT, async () => {
  try {
    await poolPromise
    console.log(`🚀 API listening on http://localhost:${PORT}`)
  } catch (err) {
    console.error('❌ Could not connect to the database:', err.message)
    process.exit(1)
  }
})

export default poolPromise
