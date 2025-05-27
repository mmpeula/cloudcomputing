import express from 'express'
import sql from 'mssql'
import poolPromise from '../db.js'
import jwt from 'jsonwebtoken'

const router = express.Router()

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (!token) return res.sendStatus(401)
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403)
    req.user = user
    next()
  })
}

router.post('/activities', verifyToken, async (req, res) => {
  const { id, name, description, price, location, max_participants, start_date, image_url } = req.body
  const userId = req.user.id
  try {
    const pool = await poolPromise
    if (id) {
      const result = await pool.request()
        .input('id', sql.Int, id)
        .input('user_id', sql.Int, userId)
        .input('name', sql.NVarChar, name)
        .input('description', sql.NVarChar, description)
        .input('price', sql.Decimal(10, 2), price)
        .input('location', sql.NVarChar, location)
        .input('max_participants', sql.Int, max_participants)
        .input('start_date', sql.Date, start_date)
        .input('image_url', sql.NVarChar, image_url)
        .query(`
          UPDATE Activities SET
            name=@name,
            description=@description,
            price=@price,
            location=@location,
            max_participants=@max_participants,
            start_date=@start_date,
            image_url=@image_url
          WHERE id=@id AND user_id=@user_id
        `)
      if (result.rowsAffected[0] === 0) return res.status(404).json({ message: 'Activity not found or not authorized' })
      return res.status(200).json({ message: 'Activity updated successfully' })
    } else {
      await pool.request()
        .input('user_id', sql.Int, userId)
        .input('name', sql.NVarChar, name)
        .input('description', sql.NVarChar, description)
        .input('price', sql.Decimal(10, 2), price)
        .input('location', sql.NVarChar, location)
        .input('max_participants', sql.Int, max_participants)
        .input('start_date', sql.Date, start_date)
        .input('image_url', sql.NVarChar, image_url)
        .query(`
          INSERT INTO Activities(user_id,name,description,price,location,max_participants,start_date,image_url)
          VALUES(@user_id,@name,@description,@price,@location,@max_participants,@start_date,@image_url)
        `)
      return res.status(201).json({ message: 'Activity created' })
    }
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

router.get('/my-activities', verifyToken, async (req, res) => {
  const userId = req.user.id
  try {
    const pool = await poolPromise
    const result = await pool.request()
      .input('user_id', sql.Int, userId)
      .query(`
        SELECT a.*,
          (SELECT COUNT(*) FROM Registrations r WHERE r.activity_id=a.id) AS current_participants
        FROM Activities a
        WHERE a.user_id=@user_id
      `)
    res.json(result.recordset)
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

router.get('/recommendations', async (_req, res) => {
  try {
    const pool = await poolPromise
    const result = await pool.request().query(`
      SELECT TOP 3
        a.id,
        a.name AS title,
        a.price,
        FORMAT(a.start_date,'dd MMM yyyy') + ', ' + CAST(a.max_participants AS VARCHAR) + ' people' AS date,
        CAST(a.max_participants-ISNULL((SELECT COUNT(*) FROM Registrations r WHERE r.activity_id=a.id),0) AS VARCHAR)+' slots available' AS available,
        a.image_url AS image,
        (SELECT COUNT(*) FROM Registrations r WHERE r.activity_id=a.id) AS current_participants,
        a.max_participants
      FROM Activities a
      ORDER BY NEWID()
    `)
    res.status(200).json(result.recordset)
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

router.delete('/activities/:id', verifyToken, async (req, res) => {
  const userId = req.user.id
  const activityId = parseInt(req.params.id)
  try {
    const pool = await poolPromise
    const result = await pool.request()
      .input('id', sql.Int, activityId)
      .input('user_id', sql.Int, userId)
      .query('DELETE FROM Activities WHERE id=@id AND user_id=@user_id')
    if (result.rowsAffected[0] === 0) return res.status(404).json({ message: 'Activity not found or not authorized' })
    res.status(200).json({ message: 'Activity deleted successfully' })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

router.put('/activities/:id', verifyToken, async (req, res) => {
  const userId = req.user.id
  const activityId = parseInt(req.params.id)
  const { name, description, price, location, max_participants, start_date, image_url } = req.body
  try {
    const pool = await poolPromise
    const result = await pool.request()
      .input('id', sql.Int, activityId)
      .input('user_id', sql.Int, userId)
      .input('name', sql.NVarChar, name)
      .input('description', sql.NVarChar, description)
      .input('price', sql.Decimal(10, 2), price)
      .input('location', sql.NVarChar, location)
      .input('max_participants', sql.Int, max_participants)
      .input('start_date', sql.Date, start_date)
      .input('image_url', sql.NVarChar, image_url)
      .query(`
        UPDATE Activities SET
          name=@name,
          description=@description,
          price=@price,
          location=@location,
          max_participants=@max_participants,
          start_date=@start_date,
          image_url=@image_url
        WHERE id=@id AND user_id=@user_id
      `)
    if (result.rowsAffected[0] === 0) return res.status(404).json({ message: 'Activity not found or not authorized' })
    res.status(200).json({ message: 'Activity updated successfully' })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

router.get('/my-registrations', verifyToken, async (req, res) => {
  const userId = req.user.id
  try {
    const pool = await poolPromise
    const result = await pool.request()
      .input('user_id', sql.Int, userId)
      .query(`
        SELECT a.*,
          (SELECT COUNT(*) FROM Registrations r WHERE r.activity_id=a.id) AS current_participants
        FROM Activities a
        INNER JOIN Registrations r ON r.activity_id=a.id
        WHERE r.user_id=@user_id
      `)
    res.status(200).json(result.recordset)
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

router.post('/activities/:id/register', verifyToken, async (req, res) => {
  const userId = req.user.id
  const activityId = parseInt(req.params.id)
  try {
    const pool = await poolPromise
    const check = await pool.request()
      .input('activity_id', sql.Int, activityId)
      .query(`
        SELECT max_participants,
               (SELECT COUNT(*) FROM Registrations WHERE activity_id=@activity_id) AS registered
        FROM Activities WHERE id=@activity_id
      `)
    const activity = check.recordset[0]
    if (!activity) return res.status(404).json({ message: 'Activity not found' })
    if (activity.registered >= activity.max_participants) return res.status(400).json({ message: 'No available slots' })
    await pool.request()
      .input('user_id', sql.Int, userId)
      .input('activity_id', sql.Int, activityId)
      .query('INSERT INTO Registrations(user_id,activity_id) VALUES(@user_id,@activity_id)')
    res.status(201).json({ message: 'Successfully registered' })
  } catch (err) {
    if (err.number === 2627) res.status(409).json({ message: 'Already registered for this activity' })
    else res.status(500).json({ message: 'Server error' })
  }
})

router.delete('/activities/:id/unregister', verifyToken, async (req, res) => {
  const userId = req.user.id
  const activityId = parseInt(req.params.id)
  try {
    const pool = await poolPromise
    const result = await pool.request()
      .input('user_id', sql.Int, userId)
      .input('activity_id', sql.Int, activityId)
      .query('DELETE FROM Registrations WHERE user_id=@user_id AND activity_id=@activity_id')
    if (result.rowsAffected[0] === 0) return res.status(404).json({ message: 'You are not registered in this activity' })
    res.status(200).json({ message: 'Successfully unregistered' })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

router.get('/search', async (req, res) => {
  const q = req.query.q
  if (!q || q.trim() === '') return res.status(400).json({ message: 'Search query is required' })
  try {
    const pool = await poolPromise
    const result = await pool.request()
      .input('q', sql.NVarChar, `%${q}%`)
      .query(`
        SELECT a.id,
               a.name AS title,
               a.price,
               FORMAT(a.start_date,'dd MMM yyyy') + ', ' + CAST(a.max_participants AS VARCHAR) + ' people' AS date,
               CAST(a.max_participants-ISNULL(rc.count,0) AS VARCHAR)+' slots available' AS available,
               a.image_url AS image,
               ISNULL(rc.count,0) AS current_participants,
               a.max_participants
        FROM Activities a
        LEFT JOIN (
          SELECT activity_id, COUNT(*) AS count FROM Registrations GROUP BY activity_id
        ) rc ON rc.activity_id=a.id
        WHERE a.name LIKE @q OR a.description LIKE @q OR a.location LIKE @q
        ORDER BY a.start_date ASC
      `)
    res.status(200).json(result.recordset)
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

export default router
