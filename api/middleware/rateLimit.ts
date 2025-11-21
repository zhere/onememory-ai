import rateLimit from 'express-rate-limit';
import { AppError } from './errorHandler';

// General API rate limiting
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: {
    success: false,
    error: 'Too many requests, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many requests, please try again later.',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: Math.round(req.rateLimit.resetTime / 1000),
    });
  },
});

// Stricter rate limiting for chat completions
export const chatRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 requests per minute
  message: {
    success: false,
    error: 'Too many chat requests, please try again later.',
    code: 'CHAT_RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many chat requests, please try again later.',
      code: 'CHAT_RATE_LIMIT_EXCEEDED',
      retryAfter: Math.round(req.rateLimit.resetTime / 1000),
    });
  },
});

// Rate limiting for memory operations
export const memoryRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: {
    success: false,
    error: 'Too many memory operations, please try again later.',
    code: 'MEMORY_RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many memory operations, please try again later.',
      code: 'MEMORY_RATE_LIMIT_EXCEEDED',
      retryAfter: Math.round(req.rateLimit.resetTime / 1000),
    });
  },
});

// Rate limiting for authentication endpoints
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 minutes
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again later.',
    code: 'AUTH_RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many authentication attempts, please try again later.',
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      retryAfter: Math.round(req.rateLimit.resetTime / 1000),
    });
  },
});

// Rate limiting for token operations
export const tokenRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: {
    success: false,
    error: 'Too many token operations, please try again later.',
    code: 'TOKEN_RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many token operations, please try again later.',
      code: 'TOKEN_RATE_LIMIT_EXCEEDED',
      retryAfter: Math.round(req.rateLimit.resetTime / 1000),
    });
  },
});

// Dynamic rate limiting based on user plan
export const createPlanBasedRateLimit = (
  freePlanLimit: number,
  proPlanLimit: number,
  enterpriseLimit: number
) => {
  return rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: (req: any) => {
      const userPlan = req.user?.plan || 'free';
      switch (userPlan) {
        case 'enterprise':
          return enterpriseLimit;
        case 'pro':
          return proPlanLimit;
        case 'free':
        default:
          return freePlanLimit;
      }
    },
    message: (req: any) => {
      const userPlan = req.user?.plan || 'free';
      return {
        success: false,
        error: `Rate limit exceeded for ${userPlan} plan. Consider upgrading for higher limits.`,
        code: 'PLAN_RATE_LIMIT_EXCEEDED',
      };
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      const userPlan = req.user?.plan || 'free';
      res.status(429).json({
        success: false,
        error: `Rate limit exceeded for ${userPlan} plan. Consider upgrading for higher limits.`,
        code: 'PLAN_RATE_LIMIT_EXCEEDED',
        retryAfter: Math.round(req.rateLimit.resetTime / 1000),
      });
    },
  });
};

// Export default rate limiter
export default rateLimiter;