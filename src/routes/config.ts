import { Router } from 'express';
import { authenticateApiKey, optionalAuth } from '../../api/middleware/auth';
import { asyncHandler } from '../../api/middleware/errorHandler';
import { AppError } from '../../api/middleware/errorHandler';
import { ConfigManager } from '../../api/services/ConfigManager';

const router = Router();
const configManager = new ConfigManager();

/**
 * GET /api/v1/config
 * Get system configuration
 */
router.get('/', optionalAuth, asyncHandler(async (req, res) => {
  const { section, userId, projectId } = req.query;

  try {
    let config;

    if (section) {
      // Get specific configuration section
      config = await configManager.getConfig(section as string, {
        userId: userId as string,
        projectId: projectId as string,
      });
    } else {
      // Get all public configuration
      config = await configManager.getAllConfig({
        userId: userId as string,
        projectId: projectId as string,
        includeSecrets: false,
      });
    }

    res.json({
      config,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching configuration:', error);
    throw new AppError('Failed to fetch configuration', 500);
  }
}));

/**
 * PUT /api/v1/config
 * Update system configuration
 */
router.put('/', authenticateApiKey, asyncHandler(async (req, res) => {
  const { section, config, userId, projectId } = req.body;

  if (!section || !config) {
    throw new AppError('Section and config are required', 400);
  }

  try {
    const updatedConfig = await configManager.updateConfig(section, config, {
      userId,
      projectId,
    });

    res.json({
      success: true,
      config: updatedConfig,
      message: 'Configuration updated successfully',
    });
  } catch (error) {
    console.error('Error updating configuration:', error);
    throw new AppError('Failed to update configuration', 500);
  }
}));

/**
 * GET /api/v1/config/llm
 * Get LLM provider configurations
 */
router.get('/llm', optionalAuth, asyncHandler(async (req, res) => {
  const { userId, projectId } = req.query;

  try {
    const llmConfig = await configManager.getLLMConfig({
      userId: userId as string,
      projectId: projectId as string,
    });

    res.json({
      providers: llmConfig.providers,
      defaultProvider: llmConfig.defaultProvider,
      models: llmConfig.models,
    });
  } catch (error) {
    console.error('Error fetching LLM configuration:', error);
    throw new AppError('Failed to fetch LLM configuration', 500);
  }
}));

/**
 * PUT /api/v1/config/llm
 * Update LLM provider configuration
 */
router.put('/llm', authenticateApiKey, asyncHandler(async (req, res) => {
  const { provider, config, userId, projectId } = req.body;

  if (!provider || !config) {
    throw new AppError('Provider and config are required', 400);
  }

  try {
    const updatedConfig = await configManager.updateLLMConfig(provider, config, {
      userId,
      projectId,
    });

    res.json({
      success: true,
      provider,
      config: updatedConfig,
      message: 'LLM configuration updated successfully',
    });
  } catch (error) {
    console.error('Error updating LLM configuration:', error);
    throw new AppError('Failed to update LLM configuration', 500);
  }
}));

/**
 * GET /api/v1/config/segmentation
 * Get text segmentation configuration
 */
router.get('/segmentation', optionalAuth, asyncHandler(async (req, res) => {
  const { userId, projectId } = req.query;

  try {
    const segmentationConfig = await configManager.getSegmentationConfig({
      userId: userId as string,
      projectId: projectId as string,
    });

    res.json({
      strategy: segmentationConfig.strategy,
      chunkSize: segmentationConfig.chunkSize,
      overlap: segmentationConfig.overlap,
      separators: segmentationConfig.separators,
      minChunkSize: segmentationConfig.minChunkSize,
      maxChunkSize: segmentationConfig.maxChunkSize,
    });
  } catch (error) {
    console.error('Error fetching segmentation configuration:', error);
    throw new AppError('Failed to fetch segmentation configuration', 500);
  }
}));

/**
 * PUT /api/v1/config/segmentation
 * Update text segmentation configuration
 */
router.put('/segmentation', authenticateApiKey, asyncHandler(async (req, res) => {
  const { 
    strategy, 
    chunkSize, 
    overlap, 
    separators, 
    minChunkSize, 
    maxChunkSize,
    userId,
    projectId 
  } = req.body;

  try {
    const config = {
      strategy,
      chunkSize,
      overlap,
      separators,
      minChunkSize,
      maxChunkSize,
    };

    const updatedConfig = await configManager.updateSegmentationConfig(config, {
      userId,
      projectId,
    });

    res.json({
      success: true,
      config: updatedConfig,
      message: 'Segmentation configuration updated successfully',
    });
  } catch (error) {
    console.error('Error updating segmentation configuration:', error);
    throw new AppError('Failed to update segmentation configuration', 500);
  }
}));

/**
 * GET /api/v1/config/memory
 * Get memory management configuration
 */
router.get('/memory', optionalAuth, asyncHandler(async (req, res) => {
  const { userId, projectId } = req.query;

  try {
    const memoryConfig = await configManager.getMemoryConfig({
      userId: userId as string,
      projectId: projectId as string,
    });

    res.json({
      maxMemories: memoryConfig.maxMemories,
      similarityThreshold: memoryConfig.similarityThreshold,
      retentionDays: memoryConfig.retentionDays,
      compressionEnabled: memoryConfig.compressionEnabled,
      autoOptimization: memoryConfig.autoOptimization,
    });
  } catch (error) {
    console.error('Error fetching memory configuration:', error);
    throw new AppError('Failed to fetch memory configuration', 500);
  }
}));

/**
 * PUT /api/v1/config/memory
 * Update memory management configuration
 */
router.put('/memory', authenticateApiKey, asyncHandler(async (req, res) => {
  const { 
    maxMemories,
    similarityThreshold,
    retentionDays,
    compressionEnabled,
    autoOptimization,
    userId,
    projectId 
  } = req.body;

  try {
    const config = {
      maxMemories,
      similarityThreshold,
      retentionDays,
      compressionEnabled,
      autoOptimization,
    };

    const updatedConfig = await configManager.updateMemoryConfig(config, {
      userId,
      projectId,
    });

    res.json({
      success: true,
      config: updatedConfig,
      message: 'Memory configuration updated successfully',
    });
  } catch (error) {
    console.error('Error updating memory configuration:', error);
    throw new AppError('Failed to update memory configuration', 500);
  }
}));

/**
 * GET /api/v1/config/proxy
 * Get proxy configuration
 */
router.get('/proxy', optionalAuth, asyncHandler(async (req, res) => {
  const { userId, projectId } = req.query;

  try {
    const proxyConfig = await configManager.getProxyConfig({
      userId: userId as string,
      projectId: projectId as string,
    });

    res.json({
      enabled: proxyConfig.enabled,
      targetUrl: proxyConfig.targetUrl,
      timeout: proxyConfig.timeout,
      retries: proxyConfig.retries,
      rateLimit: proxyConfig.rateLimit,
      caching: proxyConfig.caching,
    });
  } catch (error) {
    console.error('Error fetching proxy configuration:', error);
    throw new AppError('Failed to fetch proxy configuration', 500);
  }
}));

/**
 * PUT /api/v1/config/proxy
 * Update proxy configuration
 */
router.put('/proxy', authenticateApiKey, asyncHandler(async (req, res) => {
  const { 
    enabled,
    targetUrl,
    timeout,
    retries,
    rateLimit,
    caching,
    userId,
    projectId 
  } = req.body;

  try {
    const config = {
      enabled,
      targetUrl,
      timeout,
      retries,
      rateLimit,
      caching,
    };

    const updatedConfig = await configManager.updateProxyConfig(config, {
      userId,
      projectId,
    });

    res.json({
      success: true,
      config: updatedConfig,
      message: 'Proxy configuration updated successfully',
    });
  } catch (error) {
    console.error('Error updating proxy configuration:', error);
    throw new AppError('Failed to update proxy configuration', 500);
  }
}));

/**
 * GET /api/v1/config/vector-db
 * Get vector database configuration
 */
router.get('/vector-db', optionalAuth, asyncHandler(async (req, res) => {
  const { userId, projectId } = req.query;

  try {
    const vectorDbConfig = await configManager.getVectorDbConfig({
      userId: userId as string,
      projectId: projectId as string,
    });

    res.json({
      provider: vectorDbConfig.provider,
      dimensions: vectorDbConfig.dimensions,
      indexType: vectorDbConfig.indexType,
      similarityMetric: vectorDbConfig.similarityMetric,
      batchSize: vectorDbConfig.batchSize,
    });
  } catch (error) {
    console.error('Error fetching vector database configuration:', error);
    throw new AppError('Failed to fetch vector database configuration', 500);
  }
}));

/**
 * PUT /api/v1/config/vector-db
 * Update vector database configuration
 */
router.put('/vector-db', authenticateApiKey, asyncHandler(async (req, res) => {
  const { 
    provider,
    dimensions,
    indexType,
    similarityMetric,
    batchSize,
    userId,
    projectId 
  } = req.body;

  try {
    const config = {
      provider,
      dimensions,
      indexType,
      similarityMetric,
      batchSize,
    };

    const updatedConfig = await configManager.updateVectorDbConfig(config, {
      userId,
      projectId,
    });

    res.json({
      success: true,
      config: updatedConfig,
      message: 'Vector database configuration updated successfully',
    });
  } catch (error) {
    console.error('Error updating vector database configuration:', error);
    throw new AppError('Failed to update vector database configuration', 500);
  }
}));

/**
 * POST /api/v1/config/validate
 * Validate configuration
 */
router.post('/validate', authenticateApiKey, asyncHandler(async (req, res) => {
  const { section, config } = req.body;

  if (!section || !config) {
    throw new AppError('Section and config are required', 400);
  }

  try {
    const validation = await configManager.validateConfig(section, config);

    res.json({
      valid: validation.valid,
      errors: validation.errors,
      warnings: validation.warnings,
    });
  } catch (error) {
    console.error('Error validating configuration:', error);
    throw new AppError('Failed to validate configuration', 500);
  }
}));

/**
 * POST /api/v1/config/reset
 * Reset configuration to defaults
 */
router.post('/reset', authenticateApiKey, asyncHandler(async (req, res) => {
  const { section, userId, projectId } = req.body;

  try {
    const resetConfig = await configManager.resetConfig(section, {
      userId,
      projectId,
    });

    res.json({
      success: true,
      config: resetConfig,
      message: 'Configuration reset to defaults successfully',
    });
  } catch (error) {
    console.error('Error resetting configuration:', error);
    throw new AppError('Failed to reset configuration', 500);
  }
}));

/**
 * GET /api/v1/config/export
 * Export configuration
 */
router.get('/export', authenticateApiKey, asyncHandler(async (req, res) => {
  const { userId, projectId, includeSecrets = false } = req.query;

  try {
    const exportData = await configManager.exportConfig({
      userId: userId as string,
      projectId: projectId as string,
      includeSecrets: includeSecrets === 'true',
    });

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="config_${Date.now()}.json"`);
    res.json(exportData);
  } catch (error) {
    console.error('Error exporting configuration:', error);
    throw new AppError('Failed to export configuration', 500);
  }
}));

/**
 * POST /api/v1/config/import
 * Import configuration
 */
router.post('/import', authenticateApiKey, asyncHandler(async (req, res) => {
  const { config, userId, projectId, overwrite = false } = req.body;

  if (!config) {
    throw new AppError('Configuration data is required', 400);
  }

  try {
    const result = await configManager.importConfig(config, {
      userId,
      projectId,
      overwrite,
    });

    res.json({
      success: true,
      imported: result.imported,
      skipped: result.skipped,
      errors: result.errors,
      message: 'Configuration imported successfully',
    });
  } catch (error) {
    console.error('Error importing configuration:', error);
    throw new AppError('Failed to import configuration', 500);
  }
}));

/**
 * GET /api/v1/config/health
 * Health check for configuration service
 */
router.get('/health', asyncHandler(async (req, res) => {
  try {
    const health = await configManager.healthCheck();
    
    res.json({
      status: health.status,
      details: health.details,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: 'Configuration service health check failed',
      timestamp: new Date().toISOString(),
    });
  }
}));

export default router;