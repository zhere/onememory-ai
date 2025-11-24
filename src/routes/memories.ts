import { Router } from 'express';
import { MemoryManager } from '../services/MemoryManager';
import { authenticateApiKey, optionalAuth } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { AppError } from '../middleware/errorHandler';

const router = Router();
const memoryManager = new MemoryManager();

// Initialize memory manager
memoryManager.initialize().catch(console.error);

/**
 * GET /api/v1/memories
 * Retrieve memories with optional filtering
 */
router.get('/', optionalAuth, asyncHandler(async (req, res) => {
  const {
    query,
    userId,
    projectId,
    conversationId,
    limit = 20,
    offset = 0,
    minSimilarity = 0.5,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  try {
    let memories;
    
    if (query) {
      // Search memories by query
      memories = await memoryManager.searchMemories({
        query: query as string,
        userId: userId as string,
        projectId: projectId as string,
        limit: parseInt(limit as string),
        minSimilarity: parseFloat(minSimilarity as string),
      });
    } else {
      // Get memories with filters
      const options = {
        userId: userId as string,
        projectId: projectId as string,
        conversationId: conversationId as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc',
      };
      
      // For now, return empty array - implement database query later
      memories = [];
    }

    res.json({
      memories,
      total: memories.length,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });
  } catch (error) {
    throw new AppError('Failed to retrieve memories', 500);
  }
}));

/**
 * POST /api/v1/memories
 * Store a new memory
 */
router.post('/', authenticateApiKey, asyncHandler(async (req, res) => {
  const {
    content,
    userId,
    projectId,
    conversationId,
    source,
    metadata = {},
  } = req.body;

  if (!content || !userId) {
    throw new AppError('Content and userId are required', 400);
  }

  try {
    const memory = await memoryManager.storeMemory({
      content,
      userId,
      projectId,
      conversationId,
      source: source || 'api',
      metadata,
    });

    res.status(201).json({
      success: true,
      memory,
    });
  } catch (error) {
    throw new AppError('Failed to store memory', 500);
  }
}));

/**
 * POST /api/v1/memories/conversation
 * Store an entire conversation
 */
router.post('/conversation', authenticateApiKey, asyncHandler(async (req, res) => {
  const {
    messages,
    userId,
    projectId,
    conversationId,
    metadata = {},
  } = req.body;

  if (!messages || !Array.isArray(messages) || !userId) {
    throw new AppError('Messages array and userId are required', 400);
  }

  try {
    await memoryManager.storeConversation({
      messages,
      userId,
      projectId,
      conversationId,
      metadata,
    });

    res.json({
      success: true,
      message: 'Conversation stored successfully',
      messagesProcessed: messages.length,
    });
  } catch (error) {
    throw new AppError('Failed to store conversation', 500);
  }
}));

/**
 * GET /api/v1/memories/:id
 * Retrieve a specific memory
 */
router.get('/:id', optionalAuth, asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    // For now, return a placeholder - implement database query later
    const memory = {
      id,
      content: 'Sample memory content',
      userId: 'user123',
      createdAt: new Date(),
    };

    res.json({ memory });
  } catch (error) {
    throw new AppError('Memory not found', 404);
  }
}));

/**
 * PUT /api/v1/memories/:id
 * Update a memory
 */
router.put('/:id', authenticateApiKey, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { content, metadata } = req.body;

  if (!content) {
    throw new AppError('Content is required', 400);
  }

  try {
    // For now, return success - implement database update later
    res.json({
      success: true,
      message: 'Memory updated successfully',
    });
  } catch (error) {
    throw new AppError('Failed to update memory', 500);
  }
}));

/**
 * DELETE /api/v1/memories/:id
 * Delete a specific memory
 */
router.delete('/:id', authenticateApiKey, asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    await memoryManager.deleteMemory(id);
    
    res.json({
      success: true,
      message: 'Memory deleted successfully',
    });
  } catch (error) {
    throw new AppError('Failed to delete memory', 500);
  }
}));

/**
 * DELETE /api/v1/memories/session/:sessionId
 * Delete all memories for a session
 */
router.delete('/session/:sessionId', authenticateApiKey, asyncHandler(async (req, res) => {
  const { sessionId } = req.params;

  try {
    await memoryManager.deleteSessionMemories(sessionId);
    
    res.json({
      success: true,
      message: 'Session memories deleted successfully',
    });
  } catch (error) {
    throw new AppError('Failed to delete session memories', 500);
  }
}));

/**
 * DELETE /api/v1/memories/project/:projectId
 * Delete all memories for a project
 */
router.delete('/project/:projectId', authenticateApiKey, asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  try {
    await memoryManager.deleteProjectMemories(projectId);
    
    res.json({
      success: true,
      message: 'Project memories deleted successfully',
    });
  } catch (error) {
    throw new AppError('Failed to delete project memories', 500);
  }
}));

/**
 * GET /api/v1/memories/stats
 * Get memory statistics
 */
router.get('/stats', authenticateApiKey, asyncHandler(async (req, res) => {
  const { userId, projectId } = req.query;

  try {
    const stats = await memoryManager.getMemoryStats({
      userId: userId as string,
      projectId: projectId as string,
    });

    res.json({ stats });
  } catch (error) {
    throw new AppError('Failed to get memory statistics', 500);
  }
}));

/**
 * POST /api/v1/memories/optimize
 * Optimize memory storage
 */
router.post('/optimize', authenticateApiKey, asyncHandler(async (req, res) => {
  const { userId, projectId, strategy = 'similarity' } = req.body;

  try {
    const result = await memoryManager.optimizeMemories({
      userId,
      projectId,
      strategy,
    });

    res.json({
      success: true,
      optimization: result,
    });
  } catch (error) {
    throw new AppError('Failed to optimize memories', 500);
  }
}));

/**
 * POST /api/v1/memories/export
 * Export memories
 */
router.post('/export', authenticateApiKey, asyncHandler(async (req, res) => {
  const { userId, projectId, format = 'json' } = req.body;

  try {
    const exportData = await memoryManager.exportMemories({
      userId,
      projectId,
      format,
    });

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="memories_${Date.now()}.json"`);
    res.json(exportData);
  } catch (error) {
    throw new AppError('Failed to export memories', 500);
  }
}));

/**
 * POST /api/v1/memories/import
 * Import memories
 */
router.post('/import', authenticateApiKey, asyncHandler(async (req, res) => {
  const { data, userId, projectId } = req.body;

  if (!data || !userId) {
    throw new AppError('Data and userId are required', 400);
  }

  try {
    const result = await memoryManager.importMemories({
      data,
      userId,
      projectId,
    });

    res.json({
      success: true,
      imported: result,
    });
  } catch (error) {
    throw new AppError('Failed to import memories', 500);
  }
}));

/**
 * GET /api/v1/memories/health
 * Health check for memory service
 */
router.get('/health', asyncHandler(async (req, res) => {
  try {
    const health = await memoryManager.healthCheck();
    
    res.json({
      status: health.status,
      details: health.details,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: 'Memory service health check failed',
      timestamp: new Date().toISOString(),
    });
  }
}));

export default router;