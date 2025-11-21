import dotenv from 'dotenv';

dotenv.config();

export interface DatabaseConfig {
  url: string;
  maxConnections: number;
}

export interface RedisConfig {
  url: string;
  ttl: number;
}

export interface PineconeConfig {
  apiKey: string;
  environment: string;
  indexName: string;
}

export interface LLMConfig {
  openaiApiKey?: string;
  anthropicApiKey?: string;
  googleApiKey?: string;
}

export interface SecurityConfig {
  jwtSecret: string;
  jwtExpiresIn: string;
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export interface ZepConfig {
  apiKey: string;
  baseUrl: string;
  timeout: number;
  projectId?: string;
}

export interface SystemConfig {
  database: DatabaseConfig;
  redis: RedisConfig;
  pinecone: PineconeConfig;
  llm: LLMConfig;
  security: SecurityConfig;
  rateLimit: RateLimitConfig;
  zep: ZepConfig;
}

export interface MemoryConfig {
  defaultMaxChunkSize: number;
  defaultOverlapSize: number;
  defaultSimilarityThreshold: number;
  defaultMaxContextTokens: number;
  embeddingModel: string;
  embeddingDimensions: number;
  memoryCacheSize: number;
  maxChunkSize: number;
  overlapSize: number;
}

export interface ServerConfig {
  port: number;
  nodeEnv: string;
  corsOrigin: string;
}

export const config: SystemConfig = {
  database: {
    url: getEnvVar('DATABASE_URL', 'postgresql://username:password@localhost:5432/supermemory'),
    maxConnections: parseInt(getEnvVar('DB_MAX_CONNECTIONS', '10')),
  },
  redis: {
    url: getEnvVar('REDIS_URL', 'redis://localhost:6379'),
    ttl: parseInt(getEnvVar('CACHE_TTL', '3600')),
  },
  pinecone: {
    apiKey: getEnvVar('PINECONE_API_KEY', ''),
    environment: getEnvVar('PINECONE_ENVIRONMENT', ''),
    indexName: getEnvVar('PINECONE_INDEX_NAME', 'supermemory-vectors'),
  },
  llm: {
    openaiApiKey: process.env.OPENAI_API_KEY,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    googleApiKey: process.env.GOOGLE_API_KEY,
  },
  security: {
    jwtSecret: getEnvVar('JWT_SECRET', 'supermemory_jwt_secret_key_development'),
    jwtExpiresIn: getEnvVar('JWT_EXPIRES_IN', '7d'),
  },
  rateLimit: {
    windowMs: parseInt(getEnvVar('RATE_LIMIT_WINDOW_MS', '900000')),
    maxRequests: parseInt(getEnvVar('RATE_LIMIT_MAX_REQUESTS', '100')),
  },
  zep: {
    apiKey: getEnvVar('ZEP_API_KEY', ''),
    baseUrl: getEnvVar('ZEP_BASE_URL', 'https://api.getzep.com'),
    timeout: parseInt(getEnvVar('ZEP_TIMEOUT', '30000')),
    projectId: process.env.ZEP_PROJECT_ID,
  },
};

// Helper function to safely get environment variables
function getEnvVar(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

export const memoryConfig: MemoryConfig = {
  defaultMaxChunkSize: parseInt(getEnvVar('DEFAULT_MAX_CHUNK_SIZE', '512')),
  defaultOverlapSize: parseInt(getEnvVar('DEFAULT_OVERLAP_SIZE', '50')),
  defaultSimilarityThreshold: parseFloat(getEnvVar('DEFAULT_SIMILARITY_THRESHOLD', '0.7')),
  defaultMaxContextTokens: parseInt(getEnvVar('DEFAULT_MAX_CONTEXT_TOKENS', '4096')),
  embeddingModel: getEnvVar('EMBEDDING_MODEL', 'text-embedding-3-small'),
  embeddingDimensions: parseInt(getEnvVar('EMBEDDING_DIMENSIONS', '1536')),
  memoryCacheSize: parseInt(getEnvVar('MEMORY_CACHE_SIZE', '1000')),
  maxChunkSize: parseInt(getEnvVar('DEFAULT_MAX_CHUNK_SIZE', '512')),
  overlapSize: parseInt(getEnvVar('DEFAULT_OVERLAP_SIZE', '50')),
};

export const serverConfig: ServerConfig = {
  port: parseInt(getEnvVar('PORT', '3001')),
  nodeEnv: getEnvVar('NODE_ENV', 'development'),
  corsOrigin: getEnvVar('CORS_ORIGIN', 'http://localhost:5173'),
};

// Validation function
export function validateConfig(): void {
  const requiredEnvVars = [
    'DATABASE_URL',
    'REDIS_URL',
    'JWT_SECRET',
  ];

  const missingVars = requiredEnvVars.filter(varName => !getEnvVar(varName, ''));
  
  if (missingVars.length > 0) {
    console.warn(`Warning: Missing environment variables: ${missingVars.join(', ')}`);
    console.warn('Using default values. Please configure these for production.');
  }

  // Validate Pinecone configuration if API key is provided
  if (config.pinecone.apiKey && !config.pinecone.environment) {
    throw new Error('PINECONE_ENVIRONMENT is required when PINECONE_API_KEY is provided');
  }

  // Validate at least one LLM API key is provided
  const hasLLMKey = config.llm.openaiApiKey || config.llm.anthropicApiKey || config.llm.googleApiKey;
  if (!hasLLMKey) {
    console.warn('Warning: No LLM API keys configured. Please set at least one of: OPENAI_API_KEY, ANTHROPIC_API_KEY, GOOGLE_API_KEY');
  }
}

export default config;