/**
 * This is a user authentication API route demo.
 * Handle user registration, login, token management, etc.
 */
import { Router, type Request, type Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { DatabaseService } from '../services/DatabaseService'
import { asyncHandler } from '../middleware/errorHandler'
import { AppError } from '../middleware/errorHandler'
import { authenticateApiKey } from '../middleware/auth'

const router = Router()
const db = new DatabaseService()

// Initialize database service
db.initialize().catch(console.error)

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

/**
 * User Registration
 * POST /api/auth/register
 */
router.post('/register', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, password, name } = req.body

  if (!email || !password || !name) {
    throw new AppError('Email, password, and name are required', 400)
  }

  if (password.length < 6) {
    throw new AppError('Password must be at least 6 characters long', 400)
  }

  try {
    // Check if user already exists
    const existingUser = await db.query('SELECT id FROM users WHERE email = $1', [email])
    
    if (existingUser.rows.length > 0) {
      throw new AppError('User with this email already exists', 409)
    }

    // Hash password
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Create user
    const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const query = `
      INSERT INTO users (id, email, password_hash, name, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING id, email, name, created_at
    `
    
    const result = await db.query(query, [userId, email, hashedPassword, name])
    const user = result.rows[0]

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    )

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.created_at,
      },
      token,
    })
  } catch (error) {
    console.error('Registration error:', error)
    if (error instanceof AppError) throw error
    throw new AppError('Failed to register user', 500)
  }
}))

/**
 * User Login
 * POST /api/auth/login
 */
router.post('/login', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body

  if (!email || !password) {
    throw new AppError('Email and password are required', 400)
  }

  try {
    // Find user by email
    const query = 'SELECT id, email, password_hash, name, created_at FROM users WHERE email = $1'
    const result = await db.query(query, [email])
    
    if (result.rows.length === 0) {
      throw new AppError('Invalid email or password', 401)
    }

    const user = result.rows[0]

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash)
    
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401)
    }

    // Update last login
    await db.query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id])

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    )

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.created_at,
      },
      token,
    })
  } catch (error) {
    console.error('Login error:', error)
    if (error instanceof AppError) throw error
    throw new AppError('Failed to login', 500)
  }
}))

/**
 * User Logout
 * POST /api/auth/logout
 */
router.post('/logout', authenticateApiKey, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  // In a real implementation, you might want to blacklist the token
  // For now, we'll just return a success response
  res.json({
    success: true,
    message: 'Logout successful',
  })
}))

/**
 * Get Current User
 * GET /api/auth/me
 */
router.get('/me', authenticateApiKey, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.query

  if (!userId) {
    throw new AppError('User not authenticated', 401)
  }

  try {
    const query = `
      SELECT 
        id, email, name, created_at, last_login_at,
        (SELECT COUNT(*) FROM projects WHERE user_id = users.id) as project_count,
        (SELECT COUNT(*) FROM api_keys WHERE user_id = users.id) as api_key_count
      FROM users 
      WHERE id = $1
    `
    
    const result = await db.query(query, [userId])
    
    if (result.rows.length === 0) {
      throw new AppError('User not found', 404)
    }

    const user = result.rows[0]

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.created_at,
        lastLoginAt: user.last_login_at,
        projectCount: user.project_count,
        apiKeyCount: user.api_key_count,
      },
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    if (error instanceof AppError) throw error
    throw new AppError('Failed to fetch user information', 500)
  }
}))

/**
 * Update User Profile
 * PUT /api/auth/profile
 */
router.put('/profile', authenticateApiKey, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { name, email, userId } = req.body

  if (!userId) {
    throw new AppError('User not authenticated', 401)
  }

  try {
    const updateFields = []
    const params = []
    let paramIndex = 1

    if (name !== undefined) {
      updateFields.push(`name = $${paramIndex}`)
      params.push(name)
      paramIndex++
    }

    if (email !== undefined) {
      // Check if email is already taken by another user
      const existingUser = await db.query('SELECT id FROM users WHERE email = $1 AND id != $2', [email, userId])
      
      if (existingUser.rows.length > 0) {
        throw new AppError('Email is already taken', 409)
      }

      updateFields.push(`email = $${paramIndex}`)
      params.push(email)
      paramIndex++
    }

    if (updateFields.length === 0) {
      throw new AppError('No fields to update', 400)
    }

    updateFields.push(`updated_at = NOW()`)
    params.push(userId)

    const query = `
      UPDATE users 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, email, name, updated_at
    `

    const result = await db.query(query, params)
    const user = result.rows[0]

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user,
    })
  } catch (error) {
    console.error('Error updating profile:', error)
    if (error instanceof AppError) throw error
    throw new AppError('Failed to update profile', 500)
  }
}))

/**
 * Change Password
 * PUT /api/auth/password
 */
router.put('/password', authenticateApiKey, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { currentPassword, newPassword, userId } = req.body

  if (!currentPassword || !newPassword || !userId) {
    throw new AppError('Current password, new password, and userId are required', 400)
  }

  if (newPassword.length < 6) {
    throw new AppError('New password must be at least 6 characters long', 400)
  }

  try {
    // Get current password hash
    const query = 'SELECT password_hash FROM users WHERE id = $1'
    const result = await db.query(query, [userId])
    
    if (result.rows.length === 0) {
      throw new AppError('User not found', 404)
    }

    const user = result.rows[0]

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash)
    
    if (!isCurrentPasswordValid) {
      throw new AppError('Current password is incorrect', 401)
    }

    // Hash new password
    const saltRounds = 10
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds)

    // Update password
    await db.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [hashedNewPassword, userId]
    )

    res.json({
      success: true,
      message: 'Password changed successfully',
    })
  } catch (error) {
    console.error('Error changing password:', error)
    if (error instanceof AppError) throw error
    throw new AppError('Failed to change password', 500)
  }
}))

/**
 * Refresh Token
 * POST /api/auth/refresh
 */
router.post('/refresh', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { token } = req.body

  if (!token) {
    throw new AppError('Token is required', 400)
  }

  try {
    // Verify the existing token
    const decoded = jwt.verify(token, JWT_SECRET) as any
    
    // Generate new token
    const newToken = jwt.sign(
      { userId: decoded.userId, email: decoded.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    )

    res.json({
      success: true,
      token: newToken,
    })
  } catch (error) {
    console.error('Token refresh error:', error)
    throw new AppError('Invalid or expired token', 401)
  }
}))

export default router
