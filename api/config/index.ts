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
    url: process.env.DATABASE_URL || 'postgresql://username:password@localhost:5432/supermemory',
    maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '10'),
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    ttl: parseInt(process.env.CACHE_TTL || '3600'),
  },
  pinecone: {
    apiKey: process.env.PINECONE_API_KEY || '',
    environment: process.env.PINECONE_ENVIRONMENT || '',
    indexName: process.env.PINECONE_INDEX_NAME || 'supermemory-vectors',
  },
  llm: {
    openaiApiKey: process.env.OPENAI_API_KEY,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    googleApiKey: process.env.GOOGLE_API_KEY,
  },
  security: {
    jwtSecret: process.env.JWT_SECRET || 'supermemory_jwt_secret_key_development',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  },
  zep: {
    apiKey: process.env.ZEP_API_KEY || '',
    baseUrl: process.env.ZEP_BASE_URL || 'https://api.getzep.com',
    timeout: parseInt(process.env.ZEP_TIMEOUT || '30000'),
    projectId: process.env.ZEP_PROJECT_ID,
  },
};

export const memoryConfig: MemoryConfig = {
  defaultMaxChunkSize: parseInt(process.env.DEFAULT_MAX_CHUNK_SIZE || '512'),
  defaultOverlapSize: parseInt(process.env.DEFAULT_OVERLAP_SIZE || '50'),
  defaultSimilarityThreshold: parseFloat(process.env.DEFAULT_SIMILARITY_THRESHOLD || '0.7'),
  defaultMaxContextTokens: parseInt(process.env.DEFAULT_MAX_CONTEXT_TOKENS || '4096'),
  embeddingModel: process.env.EMBEDDING_MODEL || 'text-embedding-3-small',
  embeddingDimensions: parseInt(process.env.EMBEDDING_DIMENSIONS || '1536'),
  memoryCacheSize: parseInt(process.env.MEMORY_CACHE_SIZE || '1000'),
  maxChunkSize: parseInt(process.env.DEFAULT_MAX_CHUNK_SIZE || '512'),
  overlapSize: parseInt(process.env.DEFAULT_OVERLAP_SIZE || '50'),
};

export const serverConfig: ServerConfig = {
  port: parseInt(process.env.PORT || '3001'),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
};

// Validation function
export function validateConfig(): void {
  const requiredEnvVars = [
    'DATABASE_URL',
    'REDIS_URL',
    'JWT_SECRET',
  ];

  const missingVars = requiredEnvVars.filter(varName => !(process.env[varName] || ''));
  
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