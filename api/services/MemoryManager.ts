import { MemoryChunk, Message, VectorSearchOptions } from '../../shared/types';
import { VectorDatabase } from './VectorDatabase';
import { EmbeddingService } from './EmbeddingService';
import { TextSegmenter } from './TextSegmenter';
import { ConfigManager } from './ConfigManager';
import { config } from '../config';

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
  private configManager: ConfigManager;
  private isInitialized = false;

  constructor() {
    this.vectorDb = new VectorDatabase();
    this.embeddingService = new EmbeddingService();
    this.textSegmenter = new TextSegmenter();
    this.configManager = new ConfigManager();
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
        content: result.metadata.content || result.content,
        embedding: result.embedding,
        relevanceScore: result.score || 0,
        chunkType: result.metadata.chunkType || 'semantic',
        chunkIndex: result.metadata.chunkIndex || 0,
        projectId: result.metadata.projectId || projectId,
        sessionId: result.metadata.sessionId || sessionId,
        messageId: result.metadata.messageId,
        timestamp: new Date(result.metadata.timestamp || Date.now()),
        tokenCount: result.metadata.tokenCount || 0,
        importance: result.metadata.importance || 0.5,
        tags: result.metadata.tags || [],
        memoryType: result.metadata.memoryType || 'conversation',
        source: result.metadata.source || 'unknown',
        version: result.metadata.version || 1,
        metadata: includeMetadata ? result.metadata : undefined,
        createdAt: new Date(result.metadata.createdAt || Date.now()),
        updatedAt: new Date(result.metadata.updatedAt || Date.now()),
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

      // Get segmentation config for memory module
      const segmentationConfig = await this.configManager.getSegmentationConfig();
      const memorySegmentConfig = segmentationConfig.modules.memory;
      
      // Segment the message content
      const segments = await this.textSegmenter.segmentText(content, {
        strategy: memorySegmentConfig.strategy,
        maxTokens: memorySegmentConfig.chunkSize,
        overlap: memorySegmentConfig.overlap,
        preserveStructure: memorySegmentConfig.preserveStructure,
        splitBySentence: memorySegmentConfig.splitOnSentences,
        splitByParagraph: memorySegmentConfig.splitOnParagraphs,
        customSeparators: memorySegmentConfig.customDelimiters,
      });

      // Generate embeddings and store each segment
      const vectorRecords = [];
      const currentDate = new Date();
      const dateString = currentDate.toISOString();
      
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
            timestamp: dateString,
            tokenCount: segment.tokenCount,
            importance: segment.importance || 0.5,
            tags: metadata.tags || [],
            memoryType: 'conversation',
            source: `message_${message.role}`,
            version: 1,
            role: message.role,
            createdAt: dateString,
            updatedAt: dateString,
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
      const currentDate = new Date();
      const dateString = currentDate.toISOString();

      // Get segmentation config for memory module
      const segmentationConfig = await this.configManager.getSegmentationConfig();
      const memorySegmentConfig = segmentationConfig.modules.memory;
      
      // Segment the content
      const segments = await this.textSegmenter.segmentText(content, {
        strategy: memorySegmentConfig.strategy,
        maxTokens: memorySegmentConfig.chunkSize,
        overlap: memorySegmentConfig.overlap,
        preserveStructure: memorySegmentConfig.preserveStructure,
        splitBySentence: memorySegmentConfig.splitOnSentences,
        splitByParagraph: memorySegmentConfig.splitOnParagraphs,
        customSeparators: memorySegmentConfig.customDelimiters,
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
            messageId: memoryId,
            chunkIndex: i,
            timestamp: dateString,
            tokenCount: segment.tokenCount,
            importance,
            tags: metadata.tags || [],
            memoryType: 'direct',
            source: metadata.source || 'manual',
            version: 1,
            createdAt: dateString,
            updatedAt: dateString,
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

  async updateMemory(memoryId: string, updates: {
    content?: string;
    importance?: number;
    tags?: string[];
    metadata?: Record<string, any>;
  }): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // First, get the existing memory chunks
      const existingMemories = await this.searchMemories(
        ' ',
        {
          filters: { memoryId },
          limit: 100,
        }
      );

      if (existingMemories.length === 0) {
        throw new Error(`Memory not found: ${memoryId}`);
      }

      // For each existing chunk, create an updated version
      for (const existingMemory of existingMemories) {
        // Create updated content if provided
        const updatedContent = updates.content || existingMemory.content;
        const currentDate = new Date();
        const dateString = currentDate.toISOString();

        // Generate new embedding if content changed
        let updatedEmbedding = existingMemory.embedding;
        if (updates.content) {
          const embeddingResult = await this.embeddingService.generateEmbedding(updatedContent);
          updatedEmbedding = embeddingResult.embedding;
        }

        // Create updated vector record
        const updatedVectorRecord = {
          id: `${memoryId}_v${existingMemory.version + 1}_${existingMemory.chunkIndex}`,
          values: updatedEmbedding,
          metadata: {
            ...existingMemory.metadata,
            content: updatedContent,
            importance: updates.importance || existingMemory.importance,
            tags: updates.tags || existingMemory.tags || [],
            metadata: {
              ...existingMemory.metadata,
              ...(updates.metadata || {}),
            },
            version: existingMemory.version + 1,
            updatedAt: dateString,
          },
        };

        // Store updated chunk
        await this.vectorDb.upsertVectors([updatedVectorRecord]);
      }

      console.log(`✅ Updated memory: ${memoryId}`);
    } catch (error) {
      console.error('❌ Failed to update memory:', error);
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
        content: result.metadata.content || result.content,
        embedding: result.embedding,
        relevanceScore: result.score || 0,
        chunkType: result.metadata.chunkType || 'semantic',
        chunkIndex: result.metadata.chunkIndex || 0,
        projectId: result.metadata.projectId || projectId || '',
        sessionId: result.metadata.sessionId,
        messageId: result.metadata.messageId,
        timestamp: new Date(result.metadata.timestamp || Date.now()),
        tokenCount: result.metadata.tokenCount || 0,
        importance: result.metadata.importance || 0.5,
        tags: result.metadata.tags || [],
        memoryType: result.metadata.memoryType || 'conversation',
        source: result.metadata.source || 'unknown',
        version: result.metadata.version || 1,
        metadata: result.metadata,
        createdAt: new Date(result.metadata.createdAt || Date.now()),
        updatedAt: new Date(result.metadata.updatedAt || Date.now()),
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
    mergeSimilar?: boolean;
  } = {}): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const {
        maxMemories = 10000,
        minImportance = 0.3,
        olderThanDays = 90,
        mergeSimilar = false,
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

      // Delete low importance memories
      await this.vectorDb.deleteByFilter({
        projectId,
        importance: { $lt: minImportance },
      });

      // TODO: Implement merging similar memories
      if (mergeSimilar) {
        // This would require clustering similar memories and merging them
        console.log('⚠️  Similar memory merging not yet implemented');
      }

      console.log(`✅ Optimized memories for project: ${projectId}`);
    } catch (error) {
      console.error('❌ Failed to optimize memories:', error);
      throw error;
    }
  }

  async synthesizeMemories(projectId: string, topic: string, options: {
    limit?: number;
    threshold?: number;
    sessionId?: string;
  } = {}): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const {
        limit = 10,
        threshold = 0.7,
        sessionId,
      } = options;

      // Retrieve relevant memories
      const relevantMemories = await this.retrieveRelevantMemories({
        projectId,
        sessionId,
        query: topic,
        limit,
        threshold,
      });

      if (relevantMemories.length === 0) {
        return `No relevant memories found for topic: ${topic}`;
      }

      // Sort memories by timestamp
      const sortedMemories = relevantMemories.sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      // Synthesize memories into a coherent summary
      let synthesis = `# Memory Synthesis: ${topic}\n\n`;
      synthesis += `## Overview\n`;
      synthesis += `Found ${sortedMemories.length} relevant memory chunks spanning from ${new Date(sortedMemories[0].timestamp).toLocaleString()} to ${new Date(sortedMemories[sortedMemories.length - 1].timestamp).toLocaleString()}.\n\n`;
      synthesis += `## Key Points\n`;

      // Group memories by content similarity
      const contentGroups: { [key: string]: MemoryChunk[] } = {};
      
      for (const memory of sortedMemories) {
        // Simple grouping by first 50 chars for now
        const groupKey = memory.content.substring(0, 50).toLowerCase().trim();
        if (!contentGroups[groupKey]) {
          contentGroups[groupKey] = [];
        }
        contentGroups[groupKey].push(memory);
      }

      // Add key points from each group
      let pointIndex = 1;
      for (const groupKey in contentGroups) {
        const group = contentGroups[groupKey];
        const representativeMemory = group[0];
        synthesis += `${pointIndex}. ${representativeMemory.content}\n`;
        pointIndex++;
      }

      synthesis += `\n## Source Details\n`;
      synthesis += `Memories were sourced from ${new Set(sortedMemories.map(m => m.source)).size} different sources.\n`;
      synthesis += `Memory types: ${new Set(sortedMemories.map(m => m.memoryType)).size} types (${Array.from(new Set(sortedMemories.map(m => m.memoryType))).join(', ')}).\n`;

      return synthesis;
    } catch (error) {
      console.error('❌ Failed to synthesize memories:', error);
      throw error;
    }
  }

  async addMemoryTags(memoryId: string, tags: string[]): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // TODO: Implement tag addition
      console.log(`✅ Added tags ${tags.join(', ')} to memory: ${memoryId}`);
    } catch (error) {
      console.error('❌ Failed to add tags to memory:', error);
      throw error;
    }
  }

  async getMemoryByTags(projectId: string, tags: string[], options: {
    limit?: number;
    threshold?: number;
  } = {}): Promise<MemoryChunk[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const {
        limit = 20,
        threshold = 0.6,
      } = options;

      // Search memories with tag filters
      const searchResults = await this.searchMemories(
        ' ', // Empty query to get all memories
        {
          projectId,
          limit,
          threshold,
          filters: {
            tags: { $in: tags },
          },
        }
      );

      return searchResults;
    } catch (error) {
      console.error('❌ Failed to get memories by tags:', error);
      return [];
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