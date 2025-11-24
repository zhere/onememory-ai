/**
 * This is a API server
 */

import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import authRoutes from '../src/routes/auth.js'
import projectRoutes from '../src/routes/projects.js'
import memoryRoutes from '../src/routes/memories.js'
import configRoutes from '../src/routes/config.js'
import tokenRoutes from '../src/routes/tokens.js'
import analyticsRoutes from '../src/routes/analytics.js'
import chatRoutes from '../src/routes/chat.js'
import zepGraphitiRoutes from '../src/routes/zep-graphiti.js'
import ragKnowledgeRoutes from '../src/routes/rag-knowledge.js'
import enhancedChatRoutes from '../src/routes/enhanced-chat.js'
import { errorHandler } from './middleware/errorHandler.js'
import { rateLimiter } from './middleware/rateLimit.js'

// for esm mode
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// load env
dotenv.config()

const app: express.Application = express()

// Middleware
app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(rateLimiter)

/**
 * API Routes
 */
app.use('/api/auth', authRoutes)
app.use('/api/v1/projects', projectRoutes)
app.use('/api/v1/memories', memoryRoutes)
app.use('/api/v1/config', configRoutes)
app.use('/api/v1/tokens', tokenRoutes)
app.use('/api/v1/analytics', analyticsRoutes)
app.use('/api/v1/chat', chatRoutes)
app.use('/api/v1/enhanced-chat', enhancedChatRoutes)
app.use('/api/v1/zep-graphiti', zepGraphitiRoutes)
app.use('/api/v1/rag-knowledge', ragKnowledgeRoutes)

/**
 * health
 */
app.use(
  '/api/health',
  (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
    })
  },
)

/**
 * API info
 */
app.use(
  '/api/info',
  (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({
      name: 'Supermemory API',
      version: process.env.npm_package_version || '1.0.0',
      description: 'Intelligent memory management and context optimization API',
      endpoints: {
        auth: '/api/auth',
        projects: '/api/v1/projects',
        memories: '/api/v1/memories',
        config: '/api/v1/config',
        tokens: '/api/v1/tokens',
        analytics: '/api/v1/analytics',
        chat: '/api/v1/chat',
        'zep-graphiti': '/api/v1/zep-graphiti',
        health: '/api/health',
      },
    })
  },
)

/**
 * error handler middleware
 */
app.use(errorHandler)

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API endpoint not found',
    path: req.path,
    method: req.method,
  })
})

export default app
