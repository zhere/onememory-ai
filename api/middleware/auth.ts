import { Request, Response, NextFunction } from 'express';
import { DatabaseService } from '../services/DatabaseService';
import { AppError } from './errorHandler';

const db = new DatabaseService();

// Initialize database service
db.initialize().catch(console.error);

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    projectId?: string;
    permissions: string[];
  };
  apiKey?: {
    id: string;
    projectId: string;
    permissions: string[];
  };
}

/**
 * Extract API key from request headers
 */
function extractApiKey(req: Request): string | null {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Also check for API key in query params (for development)
  if (req.query.api_key) {
    return req.query.api_key as string;
  }
  
  return null;
}

/**
 * Validate API key and get associated project/user info
 */
async function validateApiKey(apiKey: string): Promise<{
  id: string;
  projectId: string;
  userId: string;
  permissions: string[];
  isActive: boolean;
  expiresAt?: Date;
} | null> {
  try {
    // In production, hash the API key and compare with stored hash
    const keyHash = Buffer.from(apiKey).toString('base64');
    
    const query = `
      SELECT 
        ak.id,
        ak.project_id,
        ak.permissions,
        ak.is_active,
        ak.expires_at,
        p.user_id
      FROM api_keys ak
      JOIN projects p ON ak.project_id = p.id
      WHERE ak.key_hash = $1 AND ak.is_active = true
    `;
    
    const result = await db.query(query, [keyHash]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const apiKeyData = result.rows[0];
    
    // Check if API key is expired
    if (apiKeyData.expires_at && new Date() > new Date(apiKeyData.expires_at)) {
      return null;
    }
    
    // Update last used timestamp
    await db.query(
      'UPDATE api_keys SET last_used_at = NOW() WHERE id = $1',
      [apiKeyData.id]
    );
    
    return {
      id: apiKeyData.id,
      projectId: apiKeyData.project_id,
      userId: apiKeyData.user_id,
      permissions: JSON.parse(apiKeyData.permissions || '["read"]'),
      isActive: apiKeyData.is_active,
      expiresAt: apiKeyData.expires_at,
    };
  } catch (error) {
    console.error('Error validating API key:', error);
    return null;
  }
}

/**
 * Middleware to authenticate API key (required)
 */
export const authenticateApiKey = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const apiKey = extractApiKey(req);
    
    if (!apiKey) {
      throw new AppError('API key is required', 401);
    }
    
    const apiKeyData = await validateApiKey(apiKey);
    
    if (!apiKeyData) {
      throw new AppError('Invalid or expired API key', 401);
    }
    
    // Attach API key info to request
    req.apiKey = {
      id: apiKeyData.id,
      projectId: apiKeyData.projectId,
      permissions: apiKeyData.permissions,
    };
    
    // Also attach user info for convenience
    req.user = {
      id: apiKeyData.userId,
      projectId: apiKeyData.projectId,
      permissions: apiKeyData.permissions,
    };
    
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware for optional authentication
 */
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const apiKey = extractApiKey(req);
    
    if (apiKey) {
      const apiKeyData = await validateApiKey(apiKey);
      
      if (apiKeyData) {
        req.apiKey = {
          id: apiKeyData.id,
          projectId: apiKeyData.projectId,
          permissions: apiKeyData.permissions,
        };
        
        req.user = {
          id: apiKeyData.userId,
          projectId: apiKeyData.projectId,
          permissions: apiKeyData.permissions,
        };
      }
    }
    
    next();
  } catch (error) {
    // For optional auth, continue even if authentication fails
    next();
  }
};

/**
 * Middleware to check specific permissions
 */
export const requirePermission = (permission: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.apiKey || !req.apiKey.permissions.includes(permission)) {
      throw new AppError(`Permission '${permission}' is required`, 403);
    }
    next();
  };
};

/**
 * Middleware to check if user owns the resource
 */
export const requireOwnership = (resourceType: 'project' | 'conversation' | 'memory') => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }
      
      const resourceId = req.params.id || req.body.projectId || req.query.projectId;
      
      if (!resourceId) {
        throw new AppError('Resource ID is required', 400);
      }
      
      let query: string;
      let params: any[];
      
      switch (resourceType) {
        case 'project':
          query = 'SELECT user_id FROM projects WHERE id = $1';
          params = [resourceId];
          break;
        case 'conversation':
          query = `
            SELECT p.user_id 
            FROM conversations c 
            JOIN projects p ON c.project_id = p.id 
            WHERE c.id = $1
          `;
          params = [resourceId];
          break;
        case 'memory':
          // For memory, we'll check based on user_id directly
          query = 'SELECT user_id FROM memories WHERE id = $1';
          params = [resourceId];
          break;
        default:
          throw new AppError('Invalid resource type', 400);
      }
      
      const result = await db.query(query, params);
      
      if (result.rows.length === 0) {
        throw new AppError('Resource not found', 404);
      }
      
      if (result.rows[0].user_id !== req.user.id) {
        throw new AppError('Access denied: You do not own this resource', 403);
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware for rate limiting based on API key
 */
export const rateLimitByApiKey = (maxRequests: number, windowMs: number) => {
  const requestCounts = new Map<string, { count: number; resetTime: number }>();
  
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const apiKeyId = req.apiKey?.id;
    
    if (!apiKeyId) {
      throw new AppError('API key required for rate limiting', 401);
    }
    
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean up old entries
    for (const [key, data] of requestCounts.entries()) {
      if (data.resetTime < windowStart) {
        requestCounts.delete(key);
      }
    }
    
    const current = requestCounts.get(apiKeyId) || { count: 0, resetTime: now + windowMs };
    
    if (current.resetTime < now) {
      // Reset window
      current.count = 0;
      current.resetTime = now + windowMs;
    }
    
    current.count++;
    requestCounts.set(apiKeyId, current);
    
    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - current.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(current.resetTime / 1000));
    
    if (current.count > maxRequests) {
      throw new AppError('Rate limit exceeded', 429);
    }
    
    next();
  };
};

/**
 * Middleware to validate project access
 */
export const validateProjectAccess = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const projectId = req.params.projectId || req.body.projectId || req.query.projectId;
    
    if (!projectId) {
      return next(); // Skip validation if no project ID
    }
    
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }
    
    // Check if user has access to the project
    const query = 'SELECT id FROM projects WHERE id = $1 AND user_id = $2';
    const result = await db.query(query, [projectId, req.user.id]);
    
    if (result.rows.length === 0) {
      throw new AppError('Project not found or access denied', 404);
    }
    
    next();
  } catch (error) {
    next(error);
  }
};