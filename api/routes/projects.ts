import { Router } from 'express';
import { authenticateApiKey } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { AppError } from '../middleware/errorHandler';
import { DatabaseService } from '../services/DatabaseService';

const router = Router();
const db = new DatabaseService();

// Initialize database service
db.initialize().catch(console.error);

/**
 * GET /api/v1/projects
 * Get all projects for a user
 */
router.get('/', authenticateApiKey, asyncHandler(async (req, res) => {
  const { userId, limit = 20, offset = 0, search } = req.query;

  if (!userId) {
    throw new AppError('userId is required', 400);
  }

  try {
    let query = `
      SELECT 
        id, name, description, settings, 
        created_at, updated_at, user_id,
        (SELECT COUNT(*) FROM conversations WHERE project_id = projects.id) as conversation_count,
        (SELECT COUNT(*) FROM messages WHERE conversation_id IN 
          (SELECT id FROM conversations WHERE project_id = projects.id)) as message_count
      FROM projects 
      WHERE user_id = $1
    `;
    
    const params: any[] = [userId];
    let paramIndex = 2;

    if (search) {
      query += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ` ORDER BY updated_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit as string), parseInt(offset as string));

    const projects = await db.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM projects WHERE user_id = $1';
    const countParams = [userId];
    
    if (search) {
      countQuery += ' AND (name ILIKE $2 OR description ILIKE $2)';
      countParams.push(`%${search}%`);
    }

    const totalResult = await db.query(countQuery, countParams);
    const total = parseInt(totalResult.rows[0].count);

    res.json({
      projects: projects.rows,
      total,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw new AppError('Failed to fetch projects', 500);
  }
}));

/**
 * POST /api/v1/projects
 * Create a new project
 */
router.post('/', authenticateApiKey, asyncHandler(async (req, res) => {
  const { name, description, userId, settings = {} } = req.body;

  if (!name || !userId) {
    throw new AppError('Name and userId are required', 400);
  }

  try {
    const query = `
      INSERT INTO projects (name, description, user_id, settings)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const result = await db.query(query, [name, description, userId, JSON.stringify(settings)]);
    const project = result.rows[0];

    res.status(201).json({
      success: true,
      project,
    });
  } catch (error) {
    console.error('Error creating project:', error);
    if (error.code === '23505') { // Unique constraint violation
      throw new AppError('Project name already exists', 409);
    }
    throw new AppError('Failed to create project', 500);
  }
}));

/**
 * GET /api/v1/projects/:id
 * Get a specific project
 */
router.get('/:id', authenticateApiKey, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId } = req.query;

  if (!userId) {
    throw new AppError('userId is required', 400);
  }

  try {
    const query = `
      SELECT 
        p.*,
        (SELECT COUNT(*) FROM conversations WHERE project_id = p.id) as conversation_count,
        (SELECT COUNT(*) FROM messages WHERE conversation_id IN 
          (SELECT id FROM conversations WHERE project_id = p.id)) as message_count,
        (SELECT COUNT(*) FROM api_keys WHERE project_id = p.id) as api_key_count
      FROM projects p
      WHERE p.id = $1 AND p.user_id = $2
    `;
    
    const result = await db.query(query, [id, userId]);
    
    if (result.rows.length === 0) {
      throw new AppError('Project not found', 404);
    }

    const project = result.rows[0];

    res.json({ project });
  } catch (error) {
    console.error('Error fetching project:', error);
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to fetch project', 500);
  }
}));

/**
 * PUT /api/v1/projects/:id
 * Update a project
 */
router.put('/:id', authenticateApiKey, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, settings, userId } = req.body;

  if (!userId) {
    throw new AppError('userId is required', 400);
  }

  try {
    // Check if project exists and belongs to user
    const checkQuery = 'SELECT id FROM projects WHERE id = $1 AND user_id = $2';
    const checkResult = await db.query(checkQuery, [id, userId]);
    
    if (checkResult.rows.length === 0) {
      throw new AppError('Project not found', 404);
    }

    const updateFields = [];
    const params = [];
    let paramIndex = 1;

    if (name !== undefined) {
      updateFields.push(`name = $${paramIndex}`);
      params.push(name);
      paramIndex++;
    }

    if (description !== undefined) {
      updateFields.push(`description = $${paramIndex}`);
      params.push(description);
      paramIndex++;
    }

    if (settings !== undefined) {
      updateFields.push(`settings = $${paramIndex}`);
      params.push(JSON.stringify(settings));
      paramIndex++;
    }

    updateFields.push(`updated_at = NOW()`);
    params.push(id);

    const query = `
      UPDATE projects 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await db.query(query, params);
    const project = result.rows[0];

    res.json({
      success: true,
      project,
    });
  } catch (error) {
    console.error('Error updating project:', error);
    if (error instanceof AppError) throw error;
    if (error.code === '23505') {
      throw new AppError('Project name already exists', 409);
    }
    throw new AppError('Failed to update project', 500);
  }
}));

/**
 * DELETE /api/v1/projects/:id
 * Delete a project
 */
router.delete('/:id', authenticateApiKey, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  if (!userId) {
    throw new AppError('userId is required', 400);
  }

  try {
    // Check if project exists and belongs to user
    const checkQuery = 'SELECT id FROM projects WHERE id = $1 AND user_id = $2';
    const checkResult = await db.query(checkQuery, [id, userId]);
    
    if (checkResult.rows.length === 0) {
      throw new AppError('Project not found', 404);
    }

    // Delete project (cascade will handle related records)
    const deleteQuery = 'DELETE FROM projects WHERE id = $1 AND user_id = $2';
    await db.query(deleteQuery, [id, userId]);

    res.json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to delete project', 500);
  }
}));

/**
 * GET /api/v1/projects/:id/conversations
 * Get conversations for a project
 */
router.get('/:id/conversations', authenticateApiKey, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId, limit = 20, offset = 0 } = req.query;

  if (!userId) {
    throw new AppError('userId is required', 400);
  }

  try {
    // Check if project exists and belongs to user
    const checkQuery = 'SELECT id FROM projects WHERE id = $1 AND user_id = $2';
    const checkResult = await db.query(checkQuery, [id, userId]);
    
    if (checkResult.rows.length === 0) {
      throw new AppError('Project not found', 404);
    }

    const query = `
      SELECT 
        c.*,
        (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id) as message_count,
        (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message
      FROM conversations c
      WHERE c.project_id = $1
      ORDER BY c.updated_at DESC
      LIMIT $2 OFFSET $3
    `;

    const conversations = await db.query(query, [id, parseInt(limit as string), parseInt(offset as string)]);

    // Get total count
    const countQuery = 'SELECT COUNT(*) FROM conversations WHERE project_id = $1';
    const totalResult = await db.query(countQuery, [id]);
    const total = parseInt(totalResult.rows[0].count);

    res.json({
      conversations: conversations.rows,
      total,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to fetch conversations', 500);
  }
}));

/**
 * GET /api/v1/projects/:id/api-keys
 * Get API keys for a project
 */
router.get('/:id/api-keys', authenticateApiKey, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId } = req.query;

  if (!userId) {
    throw new AppError('userId is required', 400);
  }

  try {
    // Check if project exists and belongs to user
    const checkQuery = 'SELECT id FROM projects WHERE id = $1 AND user_id = $2';
    const checkResult = await db.query(checkQuery, [id, userId]);
    
    if (checkResult.rows.length === 0) {
      throw new AppError('Project not found', 404);
    }

    const query = `
      SELECT 
        id, name, key_prefix, permissions, is_active,
        created_at, last_used_at, expires_at
      FROM api_keys
      WHERE project_id = $1
      ORDER BY created_at DESC
    `;

    const apiKeys = await db.query(query, [id]);

    res.json({
      apiKeys: apiKeys.rows,
    });
  } catch (error) {
    console.error('Error fetching API keys:', error);
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to fetch API keys', 500);
  }
}));

/**
 * POST /api/v1/projects/:id/api-keys
 * Create a new API key for a project
 */
router.post('/:id/api-keys', authenticateApiKey, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, permissions = ['read'], expiresIn, userId } = req.body;

  if (!name || !userId) {
    throw new AppError('Name and userId are required', 400);
  }

  try {
    // Check if project exists and belongs to user
    const checkQuery = 'SELECT id FROM projects WHERE id = $1 AND user_id = $2';
    const checkResult = await db.query(checkQuery, [id, userId]);
    
    if (checkResult.rows.length === 0) {
      throw new AppError('Project not found', 404);
    }

    // Generate API key
    const keyValue = `sk-${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    const keyPrefix = keyValue.substring(0, 12) + '...';
    
    let expiresAt = null;
    if (expiresIn) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(expiresIn));
    }

    const query = `
      INSERT INTO api_keys (project_id, name, key_hash, key_prefix, permissions, expires_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, name, key_prefix, permissions, is_active, created_at, expires_at
    `;

    // In production, hash the key properly
    const keyHash = Buffer.from(keyValue).toString('base64');

    const result = await db.query(query, [
      id, name, keyHash, keyPrefix, JSON.stringify(permissions), expiresAt
    ]);

    const apiKey = result.rows[0];

    res.status(201).json({
      success: true,
      apiKey: {
        ...apiKey,
        key: keyValue, // Only return the full key once
      },
    });
  } catch (error) {
    console.error('Error creating API key:', error);
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to create API key', 500);
  }
}));

/**
 * GET /api/v1/projects/:id/stats
 * Get project statistics
 */
router.get('/:id/stats', authenticateApiKey, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId, period = '7d' } = req.query;

  if (!userId) {
    throw new AppError('userId is required', 400);
  }

  try {
    // Check if project exists and belongs to user
    const checkQuery = 'SELECT id FROM projects WHERE id = $1 AND user_id = $2';
    const checkResult = await db.query(checkQuery, [id, userId]);
    
    if (checkResult.rows.length === 0) {
      throw new AppError('Project not found', 404);
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '1d':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    // Get various statistics
    const statsQueries = await Promise.all([
      // Total conversations
      db.query('SELECT COUNT(*) as count FROM conversations WHERE project_id = $1', [id]),
      
      // Total messages
      db.query(`
        SELECT COUNT(*) as count 
        FROM messages m 
        JOIN conversations c ON m.conversation_id = c.id 
        WHERE c.project_id = $1
      `, [id]),
      
      // Messages in period
      db.query(`
        SELECT COUNT(*) as count 
        FROM messages m 
        JOIN conversations c ON m.conversation_id = c.id 
        WHERE c.project_id = $1 AND m.created_at >= $2
      `, [id, startDate]),
      
      // Token usage in period
      db.query(`
        SELECT 
          COALESCE(SUM(input_tokens), 0) as input_tokens,
          COALESCE(SUM(output_tokens), 0) as output_tokens,
          COALESCE(SUM(total_cost), 0) as total_cost
        FROM token_usage_logs 
        WHERE project_id = $1 AND created_at >= $2
      `, [id, startDate]),
    ]);

    const stats = {
      totalConversations: parseInt(statsQueries[0].rows[0].count),
      totalMessages: parseInt(statsQueries[1].rows[0].count),
      messagesInPeriod: parseInt(statsQueries[2].rows[0].count),
      tokenUsage: {
        inputTokens: parseInt(statsQueries[3].rows[0].input_tokens || 0),
        outputTokens: parseInt(statsQueries[3].rows[0].output_tokens || 0),
        totalCost: parseFloat(statsQueries[3].rows[0].total_cost || 0),
      },
      period,
    };

    res.json({ stats });
  } catch (error) {
    console.error('Error fetching project stats:', error);
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to fetch project statistics', 500);
  }
}));

export default router;