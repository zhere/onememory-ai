/**
 * local server entry file, for local development
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config, serverConfig, validateConfig } from './config';
import { globalErrorHandler, notFoundHandler, errorLogger } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimit';
import { ProxyServer } from './services/ProxyServer';
import { authenticateApiKey, optionalAuth } from './middleware/auth';
import { databaseService } from './services/InMemoryDatabaseService';

// API routes will be handled by the backend services directly

// Validate configuration on startup
validateConfig();

// Initialize in-memory database for local development
databaseService.initialize().catch(error => {
  console.error('Failed to initialize database:', error);
  process.exit(1);
});

const app = express();
const proxyServer = new ProxyServer();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: serverConfig.corsOrigin,
  credentials: true,
}));

// Rate limiting
app.use(rateLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Error logging middleware
app.use(errorLogger);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const healthStatus = await proxyServer.healthCheck();
    res.json({
      status: healthStatus.status,
      timestamp: new Date().toISOString(),
      services: healthStatus.services,
      version: '1.0.0',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
    });
  }
});

// OpenAI-compatible chat completions endpoint
app.post('/v1/chat/completions', authenticateApiKey, async (req, res) => {
  if (req.body.stream) {
    await proxyServer.handleStreamingCompletion(req, res);
  } else {
    await proxyServer.handleChatCompletion(req, res);
  }
});

// Alternative endpoint for direct API access
app.post('/api/v1/chat/completions', authenticateApiKey, async (req, res) => {
  if (req.body.stream) {
    await proxyServer.handleStreamingCompletion(req, res);
  } else {
    await proxyServer.handleChatCompletion(req, res);
  }
});

// API Routes are being refactored - endpoints temporarily disabled

// Token usage and analytics endpoints
app.get('/api/v1/usage', authenticateApiKey, (req, res) => {
  // TODO: Implement usage analytics
  res.json({ usage: { totalTokens: 0, cost: 0 } });
});

app.get('/api/v1/analytics', authenticateApiKey, (req, res) => {
  // TODO: Implement analytics
  res.json({ analytics: {} });
});

// Token Config endpoints
app.get('/api/v1/token-config/:projectId', authenticateApiKey, async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const tokenConfig = await databaseService.getTokenConfigByProjectId(projectId);
    res.json({ tokenConfig });
  } catch (error) {
    next(error);
  }
});

app.post('/api/v1/token-config', authenticateApiKey, async (req, res, next) => {
  try {
    const tokenConfig = await databaseService.createTokenConfig(req.body);
    res.status(201).json({ tokenConfig });
  } catch (error) {
    next(error);
  }
});

app.put('/api/v1/token-config/:id', authenticateApiKey, async (req, res, next) => {
  try {
    const { id } = req.params;
    const tokenConfig = await databaseService.updateTokenConfig(id, req.body);
    if (!tokenConfig) {
      return res.status(404).json({ error: 'Token config not found' });
    }
    res.json({ tokenConfig });
  } catch (error) {
    next(error);
  }
});

app.delete('/api/v1/token-config/:id', authenticateApiKey, async (req, res, next) => {
  try {
    const { id } = req.params;
    const success = await databaseService.deleteTokenConfig(id);
    if (!success) {
      return res.status(404).json({ error: 'Token config not found' });
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Error handling
app.use(notFoundHandler);
app.use(globalErrorHandler);

/**
 * start server with port
 */
const PORT = process.env.PORT || 3001;

const server = app.listen(serverConfig.port, () => {
  console.log(`🚀 Supermemory server running on port ${serverConfig.port}`);
  console.log(`📊 Environment: ${serverConfig.nodeEnv}`);
  console.log(`🔗 CORS origin: ${serverConfig.corsOrigin}`);
  console.log(`💾 Database: ${config.database.url.split('@')[1] || 'Not configured'}`);
  console.log(`🧠 Vector DB: ${config.pinecone.indexName || 'Not configured'}`);
  console.log(`🤖 LLM providers: ${Object.entries(config.llm).filter(([_, key]) => key).map(([name]) => name).join(', ') || 'None configured'}`);
});

/**
 * close server
 */
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;