import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sql from 'mssql';
import poolPromise from '../db.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  const { email, password, name, role } = req.body;

  if (!email || !password || !name || !role) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  try {
    const pool = await poolPromise;
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.request()
      .input('email', sql.NVarChar, email)
      .input('password', sql.NVarChar, hashedPassword)
      .input('name', sql.NVarChar, name)
      .input('role', sql.NVarChar, role)
      .query('INSERT INTO Users (email, password, name, role) VALUES (@email, @password, @name, @role)');

    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    if (err.number === 2627) {
      res.status(409).json({ message: 'User already exists' });
    } else {
      console.error('Register error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: 'Missing fields' });

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT * FROM Users WHERE email = @email');

    const user = result.recordset[0];

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      role: user.role
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
