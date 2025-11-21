import { Router } from 'express';
import { authenticateApiKey } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { AppError } from '../middleware/errorHandler';
import { DatabaseService } from '../services/DatabaseService';
import crypto from 'crypto';

const router = Router();
const db = new DatabaseService();

// Initialize database service
db.initialize().catch(console.error);

/**
 * GET /api/v1/tokens
 * Get all API tokens for a user/project
 */
router.get('/', authenticateApiKey, asyncHandler(async (req, res) => {
  const { userId, projectId, limit = 20, offset = 0 } = req.query;

  if (!userId) {
    throw new AppError('userId is required', 400);
  }

  try {
    let query = `
      SELECT 
        id, name, permissions, created_at, last_used_at, 
        expires_at, usage_count, rate_limit, is_active,
        SUBSTRING(api_key, 1, 8) || '...' as masked_key
      FROM api_keys 
      WHERE user_id = $1
    `;
    
    const params: any[] = [userId];
    let paramIndex = 2;

    if (projectId) {
      query += ` AND project_id = $${paramIndex}`;
      params.push(projectId);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit as string), parseInt(offset as string));

    const tokens = await db.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM api_keys WHERE user_id = $1';
    const countParams = [userId];
    
    if (projectId) {
      countQuery += ' AND project_id = $2';
      countParams.push(projectId as string);
    }

    const totalResult = await db.query(countQuery, countParams);
    const total = parseInt(totalResult.rows[0].count);

    res.json({
      tokens: tokens.rows,
      total,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });
  } catch (error) {
    console.error('Error fetching tokens:', error);
    throw new AppError('Failed to fetch tokens', 500);
  }
}));

/**
 * POST /api/v1/tokens
 * Create a new API token
 */
router.post('/', authenticateApiKey, asyncHandler(async (req, res) => {
  const { 
    name, 
    permissions = ['read'], 
    userId, 
    projectId,
    expiresIn = '1y',
    rateLimit = 1000 
  } = req.body;

  if (!name || !userId) {
    throw new AppError('Name and userId are required', 400);
  }

  try {
    // Generate API key
    const apiKey = 'sk-' + crypto.randomBytes(32).toString('hex');
    
    // Calculate expiration date
    let expiresAt = null;
    if (expiresIn !== 'never') {
      const now = new Date();
      if (expiresIn === '1d') {
        expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      } else if (expiresIn === '1w') {
        expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      } else if (expiresIn === '1m') {
        expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      } else if (expiresIn === '1y') {
        expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
      }
    }

    const query = `
      INSERT INTO api_keys (
        name, api_key, permissions, user_id, project_id, 
        expires_at, rate_limit, is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, name, permissions, created_at, expires_at, rate_limit, is_active
    `;
    
    const result = await db.query(query, [
      name, 
      apiKey, 
      JSON.stringify(permissions), 
      userId, 
      projectId || null,
      expiresAt,
      rateLimit,
      true
    ]);
    
    const token = result.rows[0];

    res.status(201).json({
      success: true,
      token: {
        ...token,
        api_key: apiKey, // Return full key only on creation
      },
      message: 'API token created successfully. Please save this key as it will not be shown again.',
    });
  } catch (error) {
    console.error('Error creating token:', error);
    if (error.code === '23505') { // Unique constraint violation
      throw new AppError('Token name already exists', 409);
    }
    throw new AppError('Failed to create token', 500);
  }
}));

/**
 * PUT /api/v1/tokens/:id
 * Update an API token
 */
router.put('/:id', authenticateApiKey, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, permissions, rateLimit, isActive, userId } = req.body;

  if (!userId) {
    throw new AppError('userId is required', 400);
  }

  try {
    // Check if token exists and belongs to user
    const checkQuery = 'SELECT id FROM api_keys WHERE id = $1 AND user_id = $2';
    const checkResult = await db.query(checkQuery, [id, userId]);
    
    if (checkResult.rows.length === 0) {
      throw new AppError('Token not found', 404);
    }

    const updateFields = [];
    const params = [];
    let paramIndex = 1;

    if (name !== undefined) {
      updateFields.push(`name = $${paramIndex}`);
      params.push(name);
      paramIndex++;
    }

    if (permissions !== undefined) {
      updateFields.push(`permissions = $${paramIndex}`);
      params.push(JSON.stringify(permissions));
      paramIndex++;
    }

    if (rateLimit !== undefined) {
      updateFields.push(`rate_limit = $${paramIndex}`);
      params.push(rateLimit);
      paramIndex++;
    }

    if (isActive !== undefined) {
      updateFields.push(`is_active = $${paramIndex}`);
      params.push(isActive);
      paramIndex++;
    }

    updateFields.push(`updated_at = NOW()`);
    params.push(id);

    const query = `
      UPDATE api_keys 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, name, permissions, created_at, updated_at, expires_at, rate_limit, is_active
    `;

    const result = await db.query(query, params);
    const token = result.rows[0];

    res.json({
      success: true,
      token,
      message: 'Token updated successfully',
    });
  } catch (error) {
    console.error('Error updating token:', error);
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to update token', 500);
  }
}));

/**
 * DELETE /api/v1/tokens/:id
 * Delete an API token
 */
router.delete('/:id', authenticateApiKey, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId } = req.query;

  if (!userId) {
    throw new AppError('userId is required', 400);
  }

  try {
    const query = 'DELETE FROM api_keys WHERE id = $1 AND user_id = $2 RETURNING id';
    const result = await db.query(query, [id, userId]);
    
    if (result.rows.length === 0) {
      throw new AppError('Token not found', 404);
    }

    res.json({
      success: true,
      message: 'Token deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting token:', error);
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to delete token', 500);
  }
}));

/**
 * POST /api/v1/tokens/:id/regenerate
 * Regenerate an API token
 */
router.post('/:id/regenerate', authenticateApiKey, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  if (!userId) {
    throw new AppError('userId is required', 400);
  }

  try {
    // Check if token exists and belongs to user
    const checkQuery = 'SELECT id FROM api_keys WHERE id = $1 AND user_id = $2';
    const checkResult = await db.query(checkQuery, [id, userId]);
    
    if (checkResult.rows.length === 0) {
      throw new AppError('Token not found', 404);
    }

    // Generate new API key
    const newApiKey = 'sk-' + crypto.randomBytes(32).toString('hex');

    const query = `
      UPDATE api_keys 
      SET api_key = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, name, permissions, created_at, updated_at, expires_at, rate_limit, is_active
    `;

    const result = await db.query(query, [newApiKey, id]);
    const token = result.rows[0];

    res.json({
      success: true,
      token: {
        ...token,
        api_key: newApiKey, // Return new key
      },
      message: 'Token regenerated successfully. Please save this key as it will not be shown again.',
    });
  } catch (error) {
    console.error('Error regenerating token:', error);
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to regenerate token', 500);
  }
}));

/**
 * GET /api/v1/tokens/:id/usage
 * Get token usage statistics
 */
router.get('/:id/usage', authenticateApiKey, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId, days = 30 } = req.query;

  if (!userId) {
    throw new AppError('userId is required', 400);
  }

  try {
    // Check if token exists and belongs to user
    const checkQuery = 'SELECT id, usage_count, rate_limit FROM api_keys WHERE id = $1 AND user_id = $2';
    const checkResult = await db.query(checkQuery, [id, userId]);
    
    if (checkResult.rows.length === 0) {
      throw new AppError('Token not found', 404);
    }

    const token = checkResult.rows[0];

    // For now, return mock usage data
    // In a real implementation, you would query usage logs
    const usageData = {
      totalRequests: token.usage_count || 0,
      rateLimit: token.rate_limit,
      dailyUsage: Array.from({ length: parseInt(days as string) }, (_, i) => ({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        requests: Math.floor(Math.random() * 100),
      })).reverse(),
    };

    res.json({
      usage: usageData,
    });
  } catch (error) {
    console.error('Error fetching token usage:', error);
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to fetch token usage', 500);
  }
}));

export default router;