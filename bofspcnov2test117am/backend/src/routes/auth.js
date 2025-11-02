import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { users } from '../data/mockData.js'

const router = express.Router()

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' })
    }

    // Find user
    const user = users.find((u) => u.username === username)
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    )

    // Return user data without password
    const { password: _, ...userData } = user

    res.json({
      user: userData,
      token,
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Verify token endpoint
router.get('/verify', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key'
    )

    const user = users.find((u) => u.id === decoded.id)
    if (!user) {
      return res.status(401).json({ error: 'User not found' })
    }

    const { password: _, ...userData } = user

    res.json({ user: userData })
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' })
  }
})

// Get all users (for user management - quality engineer only)
router.get('/users', (req, res) => {
  try {
    const usersWithoutPasswords = users.map(({ password, ...user }) => user)
    res.json(usersWithoutPasswords)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
