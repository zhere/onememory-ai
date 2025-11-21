import { Router } from 'express';
import { authenticateApiKey } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { AppError } from '../middleware/errorHandler';
import { ProxyServer } from '../services/ProxyServer';
import { MemoryManager } from '../services/MemoryManager';
import { DatabaseService } from '../services/DatabaseService';
import { RAGKnowledgeManager } from '../services/RAGKnowledgeManager';

const router = Router();
const proxyServer = new ProxyServer();
const memoryManager = new MemoryManager();
const db = new DatabaseService();

// Initialize services
Promise.all([
  proxyServer.initialize(),
  memoryManager.initialize(),
  db.initialize()
]).catch(console.error);

/**
 * POST /api/v1/chat/completions
 * Chat completions with memory integration
 */
router.post('/completions', authenticateApiKey, asyncHandler(async (req, res) => {
  const {
    messages,
    model = 'gpt-3.5-turbo',
    temperature = 0.7,
    max_tokens,
    stream = false,
    userId,
    projectId,
    conversationId,
    useMemory = true,
    memoryConfig = {}
  } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    throw new AppError('Messages array is required and cannot be empty', 400);
  }

  if (!userId) {
    throw new AppError('userId is required', 400);
  }

  try {
    // Prepare request for proxy server
    const proxyRequest = {
      messages,
      model,
      temperature,
      max_tokens,
      stream,
      user: userId,
      metadata: {
        projectId,
        conversationId,
        useMemory,
        memoryConfig,
      }
    };

    if (stream) {
      // Handle streaming response
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('Access-Control-Allow-Origin', '*');

      // Process streaming request through proxy server
      await proxyServer.handleStreamingRequest(proxyRequest, res);
    } else {
      // Handle regular response
      const response = await proxyServer.handleChatCompletion(proxyRequest);
      
      // Store conversation in memory if enabled
      if (useMemory && response.choices && response.choices.length > 0) {
        const assistantMessage = response.choices[0].message;
        const conversationMessages = [
          ...messages,
          assistantMessage
        ];

        await memoryManager.storeConversation({
          messages: conversationMessages,
          userId,
          projectId,
          conversationId: conversationId || `conv-${Date.now()}`,
          metadata: {
            model,
            temperature,
            timestamp: new Date().toISOString(),
          }
        });
      }

      res.json(response);
    }
  } catch (error) {
    console.error('Error in chat completion:', error);
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to process chat completion', 500);
  }
}));

/**
 * POST /api/v1/chat/conversations
 * Create a new conversation
 */
router.post('/conversations', authenticateApiKey, asyncHandler(async (req, res) => {
  const { title, userId, projectId, metadata = {} } = req.body;

  if (!userId) {
    throw new AppError('userId is required', 400);
  }

  try {
    const conversationId = `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const query = `
      INSERT INTO conversations (id, title, user_id, project_id, metadata, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING *
    `;
    
    const result = await db.query(query, [
      conversationId,
      title || 'New Conversation',
      userId,
      projectId || null,
      JSON.stringify(metadata)
    ]);
    
    const conversation = result.rows[0];

    res.status(201).json({
      success: true,
      conversation,
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw new AppError('Failed to create conversation', 500);
  }
}));

/**
 * GET /api/v1/chat/conversations
 * Get user's conversations
 */
router.get('/conversations', authenticateApiKey, asyncHandler(async (req, res) => {
  const { userId, projectId, limit = 20, offset = 0, search } = req.query;

  if (!userId) {
    throw new AppError('userId is required', 400);
  }

  try {
    let query = `
      SELECT 
        c.*,
        (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id) as message_count,
        (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message
      FROM conversations c
      WHERE c.user_id = $1
    `;
    
    const params: any[] = [userId];
    let paramIndex = 2;

    if (projectId) {
      query += ` AND c.project_id = $${paramIndex}`;
      params.push(projectId);
      paramIndex++;
    }

    if (search) {
      query += ` AND c.title ILIKE $${paramIndex}`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ` ORDER BY c.updated_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit as string), parseInt(offset as string));

    const conversations = await db.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM conversations WHERE user_id = $1';
    const countParams = [userId];
    
    if (projectId) {
      countQuery += ' AND project_id = $2';
      countParams.push(projectId as string);
    }

    const totalResult = await db.query(countQuery, countParams);
    const total = parseInt(totalResult.rows[0].count);

    res.json({
      conversations: conversations.rows,
      total,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw new AppError('Failed to fetch conversations', 500);
  }
}));

/**
 * GET /api/v1/chat/conversations/:id
 * Get a specific conversation with messages
 */
router.get('/conversations/:id', authenticateApiKey, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId } = req.query;

  if (!userId) {
    throw new AppError('userId is required', 400);
  }

  try {
    // Get conversation
    const conversationQuery = `
      SELECT * FROM conversations 
      WHERE id = $1 AND user_id = $2
    `;
    
    const conversationResult = await db.query(conversationQuery, [id, userId]);
    
    if (conversationResult.rows.length === 0) {
      throw new AppError('Conversation not found', 404);
    }

    const conversation = conversationResult.rows[0];

    // Get messages
    const messagesQuery = `
      SELECT * FROM messages 
      WHERE conversation_id = $1 
      ORDER BY created_at ASC
    `;
    
    const messagesResult = await db.query(messagesQuery, [id]);
    const messages = messagesResult.rows;

    res.json({
      conversation: {
        ...conversation,
        messages,
      },
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to fetch conversation', 500);
  }
}));

/**
 * PUT /api/v1/chat/conversations/:id
 * Update a conversation
 */
router.put('/conversations/:id', authenticateApiKey, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, metadata, userId } = req.body;

  if (!userId) {
    throw new AppError('userId is required', 400);
  }

  try {
    // Check if conversation exists and belongs to user
    const checkQuery = 'SELECT id FROM conversations WHERE id = $1 AND user_id = $2';
    const checkResult = await db.query(checkQuery, [id, userId]);
    
    if (checkResult.rows.length === 0) {
      throw new AppError('Conversation not found', 404);
    }

    const updateFields = [];
    const params = [];
    let paramIndex = 1;

    if (title !== undefined) {
      updateFields.push(`title = $${paramIndex}`);
      params.push(title);
      paramIndex++;
    }

    if (metadata !== undefined) {
      updateFields.push(`metadata = $${paramIndex}`);
      params.push(JSON.stringify(metadata));
      paramIndex++;
    }

    updateFields.push(`updated_at = NOW()`);
    params.push(id);

    const query = `
      UPDATE conversations 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await db.query(query, params);
    const conversation = result.rows[0];

    res.json({
      success: true,
      conversation,
    });
  } catch (error) {
    console.error('Error updating conversation:', error);
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to update conversation', 500);
  }
}));

/**
 * DELETE /api/v1/chat/conversations/:id
 * Delete a conversation
 */
router.delete('/conversations/:id', authenticateApiKey, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId } = req.query;

  if (!userId) {
    throw new AppError('userId is required', 400);
  }

  try {
    // Delete messages first (cascade)
    await db.query('DELETE FROM messages WHERE conversation_id = $1', [id]);
    
    // Delete conversation
    const query = 'DELETE FROM conversations WHERE id = $1 AND user_id = $2 RETURNING id';
    const result = await db.query(query, [id, userId]);
    
    if (result.rows.length === 0) {
      throw new AppError('Conversation not found', 404);
    }

    res.json({
      success: true,
      message: 'Conversation deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to delete conversation', 500);
  }
}));

/**
 * POST /api/v1/chat/conversations/:id/messages
 * Add a message to a conversation
 */
router.post('/conversations/:id/messages', authenticateApiKey, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role, content, metadata = {}, userId } = req.body;

  if (!role || !content || !userId) {
    throw new AppError('Role, content, and userId are required', 400);
  }

  try {
    // Check if conversation exists and belongs to user
    const checkQuery = 'SELECT id FROM conversations WHERE id = $1 AND user_id = $2';
    const checkResult = await db.query(checkQuery, [id, userId]);
    
    if (checkResult.rows.length === 0) {
      throw new AppError('Conversation not found', 404);
    }

    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const query = `
      INSERT INTO messages (id, conversation_id, role, content, metadata, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING *
    `;
    
    const result = await db.query(query, [
      messageId,
      id,
      role,
      content,
      JSON.stringify(metadata)
    ]);
    
    const message = result.rows[0];

    // Update conversation timestamp
    await db.query('UPDATE conversations SET updated_at = NOW() WHERE id = $1', [id]);

    res.status(201).json({
      success: true,
      message,
    });
  } catch (error) {
    console.error('Error adding message:', error);
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to add message', 500);
  }
}));

/**
 * GET /api/v1/chat/models
 * Get available chat models
 */
router.get('/models', asyncHandler(async (req, res) => {
  try {
    const models = await proxyServer.getAvailableModels();
    
    res.json({
      models,
      total: models.length,
    });
  } catch (error) {
    console.error('Error fetching models:', error);
    throw new AppError('Failed to fetch available models', 500);
  }
}));

export default router;