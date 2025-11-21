import { MemoryChunk, Message, VectorSearchOptions } from '../../shared/types';
import { VectorDatabase } from './VectorDatabase';
import { EmbeddingService } from './EmbeddingService';
import { TextSegmenter } from './TextSegmenter';
import { config, memoryConfig } from '../config';

interface RetrieveMemoriesOptions {
  projectId: string;
  sessionId?: string;
  query: string;
  limit?: number;
  threshold?: number;
  includeMetadata?: boolean;
}

interface StoreConversationOptions {
  projectId: string;
  sessionId: string;
  messages: Message[];
  metadata?: Record<string, any>;
}

interface StoreMemoryOptions {
  projectId: string;
  sessionId?: string;
  content: string;
  metadata?: Record<string, any>;
  importance?: number;
}

export class MemoryManager {
  private vectorDb: VectorDatabase;
  private embeddingService: EmbeddingService;
  private textSegmenter: TextSegmenter;
  private isInitialized = false;

  constructor() {
    this.vectorDb = new VectorDatabase();
    this.embeddingService = new EmbeddingService();
    this.textSegmenter = new TextSegmenter();
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await Promise.all([
        this.vectorDb.initialize(),
        this.embeddingService.initialize(),
      ]);

      this.isInitialized = true;
      console.log('✅ Memory manager initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize memory manager:', error);
      throw error;
    }
  }

  async retrieveRelevantMemories(options: RetrieveMemoriesOptions): Promise<MemoryChunk[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const {
        projectId,
        sessionId,
        query,
        limit = 10,
        threshold = 0.7,
        includeMetadata = true,
      } = options;

      // Generate embedding for the query
      const queryEmbedding = await this.embeddingService.generateEmbedding(query);

      // Search for similar vectors
      const searchOptions: VectorSearchOptions = {
        projectId,
        sessionId,
        limit,
        threshold,
      };

      const searchResults = await this.vectorDb.searchSimilar(
        queryEmbedding.embedding,
        searchOptions
      );

      // Convert search results to MemoryChunk format
      const memoryChunks: MemoryChunk[] = searchResults.map(result => ({
        id: result.id,
        content: result.content,
        embedding: result.embedding,
        projectId,
        sessionId: result.metadata.sessionId || sessionId,
        messageId: result.metadata.messageId,
        chunkIndex: result.metadata.chunkIndex || 0,
        timestamp: new Date(result.metadata.timestamp || Date.now()),
        tokenCount: result.metadata.tokenCount || 0,
        importance: result.metadata.importance || 0.5,
        metadata: includeMetadata ? result.metadata : undefined,
      }));

      console.log(`✅ Retrieved ${memoryChunks.length} relevant memories for query: "${query.substring(0, 50)}..."`);
      return memoryChunks;
    } catch (error) {
      console.error('❌ Failed to retrieve memories:', error);
      return [];
    }
  }

  async storeConversation(options: StoreConversationOptions): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const { projectId, sessionId, messages, metadata = {} } = options;

      // Process each message
      for (const message of messages) {
        await this.storeMessage({
          projectId,
          sessionId,
          message,
          metadata,
        });
      }

      console.log(`✅ Stored conversation with ${messages.length} messages for session ${sessionId}`);
    } catch (error) {
      console.error('❌ Failed to store conversation:', error);
      throw error;
    }
  }

  async storeMessage(options: {
    projectId: string;
    sessionId: string;
    message: Message;
    metadata?: Record<string, any>;
  }): Promise<void> {
    const { projectId, sessionId, message, metadata = {} } = options;

    try {
      // Skip storing system messages or empty content
      if (message.role === 'system' || !message.content?.trim()) {
        return;
      }

      const content = typeof message.content === 'string' 
        ? message.content 
        : JSON.stringify(message.content);

      // Segment the message content
      const segments = await this.textSegmenter.segmentText(content, {
        strategy: 'semantic',
        maxTokens: memoryConfig.maxChunkSize,
        overlap: memoryConfig.overlapSize,
      });

      // Generate embeddings and store each segment
      const vectorRecords = [];
      
      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        const embedding = await this.embeddingService.generateEmbedding(segment.content);
        
        const vectorRecord = {
          id: `${message.id || sessionId}_${i}`,
          values: embedding.embedding,
          metadata: {
            content: segment.content,
            projectId,
            sessionId,
            messageId: message.id,
            chunkIndex: i,
            timestamp: new Date().toISOString(),
            tokenCount: segment.tokenCount,
            importance: segment.importance || 0.5,
            role: message.role,
            ...metadata,
          },
        };

        vectorRecords.push(vectorRecord);
      }

      // Store in vector database
      if (vectorRecords.length > 0) {
        await this.vectorDb.upsertVectors(vectorRecords);
      }

      console.log(`✅ Stored message with ${segments.length} segments`);
    } catch (error) {
      console.error('❌ Failed to store message:', error);
      throw error;
    }
  }

  async storeMemory(options: StoreMemoryOptions): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const {
        projectId,
        sessionId,
        content,
        metadata = {},
        importance = 0.5,
      } = options;

      // Generate unique ID
      const memoryId = `memory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Segment the content
      const segments = await this.textSegmenter.segmentText(content, {
        strategy: 'semantic',
        maxTokens: memoryConfig.maxChunkSize,
        overlap: memoryConfig.overlapSize,
      });

      // Generate embeddings and store each segment
      const vectorRecords = [];
      
      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        const embedding = await this.embeddingService.generateEmbedding(segment.content);
        
        const vectorRecord = {
          id: `${memoryId}_${i}`,
          values: embedding.embedding,
          metadata: {
            content: segment.content,
            projectId,
            sessionId,
            memoryId,
            chunkIndex: i,
            timestamp: new Date().toISOString(),
            tokenCount: segment.tokenCount,
            importance,
            ...metadata,
          },
        };

        vectorRecords.push(vectorRecord);
      }

      // Store in vector database
      if (vectorRecords.length > 0) {
        await this.vectorDb.upsertVectors(vectorRecords);
      }

      console.log(`✅ Stored memory with ${segments.length} segments`);
      return memoryId;
    } catch (error) {
      console.error('❌ Failed to store memory:', error);
      throw error;
    }
  }

  async deleteMemory(memoryId: string): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Delete by filter (all chunks with this memoryId)
      await this.vectorDb.deleteByFilter({ memoryId });
      console.log(`✅ Deleted memory: ${memoryId}`);
    } catch (error) {
      console.error('❌ Failed to delete memory:', error);
      throw error;
    }
  }

  async deleteSessionMemories(sessionId: string): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      await this.vectorDb.deleteByFilter({ sessionId });
      console.log(`✅ Deleted all memories for session: ${sessionId}`);
    } catch (error) {
      console.error('❌ Failed to delete session memories:', error);
      throw error;
    }
  }

  async deleteProjectMemories(projectId: string): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      await this.vectorDb.deleteByFilter({ projectId });
      console.log(`✅ Deleted all memories for project: ${projectId}`);
    } catch (error) {
      console.error('❌ Failed to delete project memories:', error);
      throw error;
    }
  }

  async searchMemories(
    query: string,
    options: {
      projectId?: string;
      sessionId?: string;
      limit?: number;
      threshold?: number;
      filters?: Record<string, any>;
    } = {}
  ): Promise<MemoryChunk[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const {
        projectId,
        sessionId,
        limit = 20,
        threshold = 0.6,
        filters = {},
      } = options;

      // Generate embedding for the query
      const queryEmbedding = await this.embeddingService.generateEmbedding(query);

      // Search for similar vectors
      const searchOptions: VectorSearchOptions = {
        projectId,
        sessionId,
        limit,
        threshold,
        filters,
      };

      const searchResults = await this.vectorDb.searchSimilar(
        queryEmbedding.embedding,
        searchOptions
      );

      // Convert to MemoryChunk format
      const memoryChunks: MemoryChunk[] = searchResults.map(result => ({
        id: result.id,
        content: result.content,
        embedding: result.embedding,
        projectId: result.metadata.projectId || projectId || '',
        sessionId: result.metadata.sessionId,
        messageId: result.metadata.messageId,
        chunkIndex: result.metadata.chunkIndex || 0,
        timestamp: new Date(result.metadata.timestamp || Date.now()),
        tokenCount: result.metadata.tokenCount || 0,
        importance: result.metadata.importance || 0.5,
        metadata: result.metadata,
      }));

      return memoryChunks;
    } catch (error) {
      console.error('❌ Failed to search memories:', error);
      return [];
    }
  }

  async getMemoryStats(projectId?: string): Promise<{
    totalMemories: number;
    totalTokens: number;
    averageImportance: number;
    oldestMemory?: Date;
    newestMemory?: Date;
  }> {
    try {
      const stats = await this.vectorDb.getStats();
      
      // TODO: Implement more detailed stats by querying with filters
      // This would require additional Pinecone queries to get filtered stats
      
      return {
        totalMemories: stats.totalVectors,
        totalTokens: 0, // Would need to aggregate from metadata
        averageImportance: 0.5, // Would need to calculate from metadata
        oldestMemory: undefined,
        newestMemory: undefined,
      };
    } catch (error) {
      console.error('❌ Failed to get memory stats:', error);
      return {
        totalMemories: 0,
        totalTokens: 0,
        averageImportance: 0,
      };
    }
  }

  async optimizeMemories(projectId: string, options: {
    maxMemories?: number;
    minImportance?: number;
    olderThanDays?: number;
  } = {}): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const {
        maxMemories = 10000,
        minImportance = 0.3,
        olderThanDays = 90,
      } = options;

      // Delete old memories
      if (olderThanDays > 0) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
        
        await this.vectorDb.deleteByFilter({
          projectId,
          timestamp: { $lt: cutoffDate.toISOString() },
        });
      }

      // TODO: Implement more sophisticated optimization
      // - Delete low importance memories
      // - Merge similar memories
      // - Compress old memories

      console.log(`✅ Optimized memories for project: ${projectId}`);
    } catch (error) {
      console.error('❌ Failed to optimize memories:', error);
      throw error;
    }
  }

  async exportMemories(
    projectId: string,
    options: {
      sessionId?: string;
      format?: 'json' | 'csv';
      includeEmbeddings?: boolean;
    } = {}
  ): Promise<any[]> {
    try {
      // TODO: Implement memory export
      // This would require querying all memories for a project
      console.warn('Memory export not yet implemented');
      return [];
    } catch (error) {
      console.error('❌ Failed to export memories:', error);
      return [];
    }
  }

  async importMemories(
    projectId: string,
    memories: any[],
    options: {
      overwrite?: boolean;
      batchSize?: number;
    } = {}
  ): Promise<void> {
    try {
      const { overwrite = false, batchSize = 100 } = options;

      if (overwrite) {
        await this.deleteProjectMemories(projectId);
      }

      // Process memories in batches
      for (let i = 0; i < memories.length; i += batchSize) {
        const batch = memories.slice(i, i + batchSize);
        
        for (const memory of batch) {
          await this.storeMemory({
            projectId,
            sessionId: memory.sessionId,
            content: memory.content,
            metadata: memory.metadata,
            importance: memory.importance,
          });
        }
      }

      console.log(`✅ Imported ${memories.length} memories for project: ${projectId}`);
    } catch (error) {
      console.error('❌ Failed to import memories:', error);
      throw error;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Check all services
      const [vectorDbHealth, embeddingHealth] = await Promise.all([
        this.vectorDb.healthCheck(),
        this.embeddingService.healthCheck(),
      ]);

      return vectorDbHealth && embeddingHealth;
    } catch (error) {
      console.error('Memory manager health check failed:', error);
      return false;
    }
  }
}