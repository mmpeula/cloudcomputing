import express from 'express'
import multer from 'multer'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'

const router = express.Router()

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => cb(null, uuidv4() + path.extname(file.originalname))
})

const upload = multer({ storage })

router.post('/api/upload', upload.single('image'), (req, res) => {
  const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
  res.status(201).json({ url })
})

export default router
