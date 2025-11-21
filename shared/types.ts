// Shared types for Supermemory system

export interface User {
  id: string;
  email: string;
  name: string;
  plan: 'free' | 'pro' | 'enterprise';
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  description?: string;
  config: Record<string, any>;
  status: 'active' | 'paused' | 'deleted';
  createdAt: Date;
  updatedAt: Date;
}

export interface Conversation {
  id: string;
  projectId: string;
  sessionId: string;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata: Record<string, any>;
  tokenCount: number;
  createdAt: Date;
}

export interface MemoryChunk {
  id: string;
  messageId: string;
  content: string;
  embedding: number[];
  relevanceScore: number;
  chunkType: 'semantic' | 'paragraph' | 'fixed' | 'sliding';
  chunkIndex: number;
  metadata: Record<string, any>;
  createdAt: Date;
}

export interface SegmentationConfig {
  id: string;
  projectId: string;
  maxChunkSize: number;
  overlapSize: number;
  segmentationStrategy: 'semantic' | 'paragraph' | 'fixed' | 'sliding' | 'hybrid';
  embeddingConfig: {
    model: string;
    dimensions: number;
  };
  similarityThreshold: number;
  weightsConfig: {
    semantic: number;
    temporal: number;
    importance: number;
    position: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface TokenConfig {
  id: string;
  projectId: string;
  maxContextTokens: number;
  reservedTokens: number;
  compressionConfig: {
    enableCompression: boolean;
    compressionRatio: number;
    summaryModel: string;
  };
  priorityWeights: {
    temporal: number;
    relevance: number;
    importance: number;
    userPreference: number;
  };
  autoOptimization: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TokenUsageLog {
  id: string;
  userId: string;
  projectId?: string;
  conversationId?: string;
  inputTokens: number;
  outputTokens: number;
  memoryTokens: number;
  compressedTokens: number;
  compressionRatio: number;
  optimizationStrategy?: string;
  createdAt: Date;
}

export interface ApiKey {
  id: string;
  projectId: string;
  keyHash: string;
  name: string;
  permissions: Record<string, boolean>;
  expiresAt?: Date;
  createdAt: Date;
}

export interface UsageLog {
  id: string;
  userId: string;
  projectId?: string;
  endpoint: string;
  tokensUsed: number;
  cost: number;
  createdAt: Date;
}

// API Request/Response types
export interface ChatCompletionRequest {
  model: string;
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  memoryConfig?: {
    enableMemory: boolean;
    memoryDepth: number;
    relevanceThreshold: number;
  };
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: 'assistant';
      content: string;
    };
    finishReason: string;
  }>;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  memoryInfo: {
    memoriesUsed: number;
    contextOptimized: boolean;
    sessionId: string;
  };
}

// Text Segmentation types
export interface TextSegment {
  content: string;
  index: number;
  type: string;
  metadata: {
    startPosition: number;
    endPosition: number;
    tokenCount: number;
    importance: number;
  };
}

export interface SegmentationOptions {
  maxChunkSize: number;
  overlapSize: number;
  strategy: 'semantic' | 'paragraph' | 'fixed' | 'sliding' | 'hybrid';
  preserveBoundaries: boolean;
}

// Vector Database types
export interface VectorSearchOptions {
  projectId?: string;
  sessionId?: string;
  limit?: number;
  threshold?: number;
  filters?: Record<string, any>;
}

export interface VectorSearchResult {
  id: string;
  content: string;
  embedding: number[];
  score: number;
  metadata: Record<string, any>;
}

// Priority Sorting types
export interface ContentItem {
  id: string;
  content: string;
  timestamp: Date;
  relevanceScore: number;
  importanceScore: number;
  userInteractionScore: number;
  tokenCount: number;
  metadata: Record<string, any>;
}

export interface PriorityWeights {
  temporal: number;
  relevance: number;
  importance: number;
  userPreference: number;
}

// Error types
export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

// Configuration types
export interface SystemConfig {
  database: {
    url: string;
    maxConnections: number;
  };
  redis: {
    url: string;
    ttl: number;
  };
  pinecone: {
    apiKey: string;
    environment: string;
    indexName: string;
  };
  llm: {
    openaiApiKey?: string;
    anthropicApiKey?: string;
    googleApiKey?: string;
  };
  security: {
    jwtSecret: string;
    jwtExpiresIn: string;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
}