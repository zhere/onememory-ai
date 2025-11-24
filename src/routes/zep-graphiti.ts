import { Router } from 'express';
import { ZepGraphitiManager } from '../services/ZepGraphitiManager';
import { authenticateApiKey, optionalAuth } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { AppError } from '../middleware/errorHandler';

const router = Router();
const zepGraphitiManager = new ZepGraphitiManager();

// Initialize Zep Graphiti manager
zepGraphitiManager.initialize().catch(console.error);

/**
 * GET /api/v1/zep-graphiti/entities
 * 获取时序实体列表
 */
router.get('/entities', optionalAuth, asyncHandler(async (req, res) => {
  const {
    userId,
    projectId,
    entityType,
    timeRange,
    limit = 50,
    offset = 0,
    sortBy = 'lastUpdated',
    sortOrder = 'desc',
  } = req.query;

  try {
    const entities = await zepGraphitiManager.getTemporalEntities({
      userId: userId as string,
      projectId: projectId as string,
      entityType: entityType as string,
      timeRange: timeRange ? JSON.parse(timeRange as string) : undefined,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc',
    });

    res.json({
      entities,
      total: entities.length,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });
  } catch (error) {
    throw new AppError('Failed to retrieve temporal entities', 500);
  }
}));

/**
 * POST /api/v1/zep-graphiti/entities
 * 创建或更新时序实体
 */
router.post('/entities', authenticateApiKey, asyncHandler(async (req, res) => {
  const {
    entityId,
    entityType,
    properties,
    userId,
    projectId,
    temporalContext,
    metadata = {},
  } = req.body;

  if (!entityId || !entityType || !userId) {
    throw new AppError('EntityId, entityType, and userId are required', 400);
  }

  try {
    const entity = await zepGraphitiManager.createOrUpdateEntity({
      entityId,
      entityType,
      properties,
      userId,
      projectId,
      temporalContext,
      metadata,
    });

    res.status(201).json({
      success: true,
      entity,
    });
  } catch (error) {
    throw new AppError('Failed to create or update entity', 500);
  }
}));

/**
 * GET /api/v1/zep-graphiti/entities/:entityId/timeline
 * 获取实体的时序演化轨迹
 */
router.get('/entities/:entityId/timeline', optionalAuth, asyncHandler(async (req, res) => {
  const { entityId } = req.params;
  const {
    userId,
    projectId,
    timeRange,
    granularity = 'day',
    includeRelations = false,
  } = req.query;

  try {
    const timeline = await zepGraphitiManager.getEntityTimeline({
      entityId,
      userId: userId as string,
      projectId: projectId as string,
      timeRange: timeRange ? JSON.parse(timeRange as string) : undefined,
      granularity: granularity as string,
      includeRelations: includeRelations === 'true',
    });

    res.json({
      entityId,
      timeline,
    });
  } catch (error) {
    throw new AppError('Failed to retrieve entity timeline', 500);
  }
}));

/**
 * GET /api/v1/zep-graphiti/relations
 * 获取动态关系列表
 */
router.get('/relations', optionalAuth, asyncHandler(async (req, res) => {
  const {
    userId,
    projectId,
    sourceEntityId,
    targetEntityId,
    relationType,
    strengthThreshold = 0.5,
    timeRange,
    limit = 50,
    offset = 0,
  } = req.query;

  try {
    const relations = await zepGraphitiManager.getDynamicRelations({
      userId: userId as string,
      projectId: projectId as string,
      sourceEntityId: sourceEntityId as string,
      targetEntityId: targetEntityId as string,
      relationType: relationType as string,
      strengthThreshold: parseFloat(strengthThreshold as string),
      timeRange: timeRange ? JSON.parse(timeRange as string) : undefined,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });

    res.json({
      relations,
      total: relations.length,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });
  } catch (error) {
    throw new AppError('Failed to retrieve dynamic relations', 500);
  }
}));

/**
 * POST /api/v1/zep-graphiti/relations/infer
 * 推理动态关系
 */
router.post('/relations/infer', authenticateApiKey, asyncHandler(async (req, res) => {
  const {
    sourceEntityId,
    targetEntityId,
    context,
    userId,
    projectId,
    temporalWindow,
    inferenceStrategy = 'semantic_similarity',
  } = req.body;

  if (!sourceEntityId || !targetEntityId || !userId) {
    throw new AppError('SourceEntityId, targetEntityId, and userId are required', 400);
  }

  try {
    const inferredRelations = await zepGraphitiManager.inferDynamicRelations({
      sourceEntityId,
      targetEntityId,
      context,
      userId,
      projectId,
      temporalWindow,
      inferenceStrategy,
    });

    res.json({
      success: true,
      inferredRelations,
    });
  } catch (error) {
    throw new AppError('Failed to infer dynamic relations', 500);
  }
}));

/**
 * GET /api/v1/zep-graphiti/graph/traverse
 * 时序图谱遍历查询
 */
router.get('/graph/traverse', optionalAuth, asyncHandler(async (req, res) => {
  const {
    startEntityId,
    endEntityId,
    maxDepth = 3,
    relationTypes,
    temporalConstraints,
    userId,
    projectId,
    algorithm = 'temporal_bfs',
  } = req.query;

  if (!startEntityId || !userId) {
    throw new AppError('StartEntityId and userId are required', 400);
  }

  try {
    const traversalResult = await zepGraphitiManager.traverseTemporalGraph({
      startEntityId: startEntityId as string,
      endEntityId: endEntityId as string,
      maxDepth: parseInt(maxDepth as string),
      relationTypes: relationTypes ? (relationTypes as string).split(',') : undefined,
      temporalConstraints: temporalConstraints ? JSON.parse(temporalConstraints as string) : undefined,
      userId: userId as string,
      projectId: projectId as string,
      algorithm: algorithm as string,
    });

    res.json({
      traversalResult,
    });
  } catch (error) {
    throw new AppError('Failed to traverse temporal graph', 500);
  }
}));

/**
 * POST /api/v1/zep-graphiti/memories/synthesize
 * 跨会话记忆合成
 */
router.post('/memories/synthesize', authenticateApiKey, asyncHandler(async (req, res) => {
  const {
    sessionIds,
    userId,
    projectId,
    synthesisStrategy = 'temporal_coherence',
    timeWindow,
    conflictResolution = 'latest_wins',
  } = req.body;

  if (!sessionIds || !Array.isArray(sessionIds) || !userId) {
    throw new AppError('SessionIds (array) and userId are required', 400);
  }

  try {
    const synthesizedMemories = await zepGraphitiManager.synthesizeCrossSessionMemories({
      sessionIds,
      userId,
      projectId,
      synthesisStrategy,
      timeWindow,
      conflictResolution,
    });

    res.json({
      success: true,
      synthesizedMemories,
    });
  } catch (error) {
    throw new AppError('Failed to synthesize cross-session memories', 500);
  }
}));

/**
 * POST /api/v1/zep-graphiti/deduplication
 * 智能去重处理
 */
router.post('/deduplication', authenticateApiKey, asyncHandler(async (req, res) => {
  const {
    userId,
    projectId,
    deduplicationStrategy = 'semantic_temporal',
    similarityThreshold = 0.85,
    temporalWindow,
    dryRun = false,
  } = req.body;

  if (!userId) {
    throw new AppError('UserId is required', 400);
  }

  try {
    const deduplicationResult = await zepGraphitiManager.performIntelligentDeduplication({
      userId,
      projectId,
      deduplicationStrategy,
      similarityThreshold,
      temporalWindow,
      dryRun,
    });

    res.json({
      success: true,
      deduplicationResult,
    });
  } catch (error) {
    throw new AppError('Failed to perform intelligent deduplication', 500);
  }
}));

/**
 * GET /api/v1/zep-graphiti/optimization/suggestions
 * 获取时序感知优化建议
 */
router.get('/optimization/suggestions', authenticateApiKey, asyncHandler(async (req, res) => {
  const {
    userId,
    projectId,
    optimizationType = 'all',
    analysisDepth = 'standard',
  } = req.query;

  if (!userId) {
    throw new AppError('UserId is required', 400);
  }

  try {
    const suggestions = await zepGraphitiManager.getTemporalOptimizationSuggestions({
      userId: userId as string,
      projectId: projectId as string,
      optimizationType: optimizationType as string,
      analysisDepth: analysisDepth as string,
    });

    res.json({
      suggestions,
    });
  } catch (error) {
    throw new AppError('Failed to get temporal optimization suggestions', 500);
  }
}));

/**
 * GET /api/v1/zep-graphiti/health
 * Zep Graphiti健康检查
 */
router.get('/health', asyncHandler(async (req, res) => {
  try {
    const healthStatus = await zepGraphitiManager.healthCheck();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: healthStatus,
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}));

export default router;