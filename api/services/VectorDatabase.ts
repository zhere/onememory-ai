import { Pinecone } from '@pinecone-database/pinecone';
import { VectorSearchOptions, VectorSearchResult } from '../../shared/types';
import { config } from '../config';

interface VectorRecord {
  id: string;
  values: number[];
  metadata: {
    content: string;
    projectId: string;
    sessionId?: string;
    messageId?: string;
    chunkIndex?: number;
    timestamp: string;
    tokenCount: number;
    importance: number;
    [key: string]: any;
  };
}

export class VectorDatabase {
  private pinecone: Pinecone | null = null;
  private indexName: string;
  private isInitialized = false;

  constructor() {
    this.indexName = config.pinecone.indexName;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      if (!config.pinecone.apiKey) {
        console.warn('Pinecone API key not configured, vector search will be disabled');
        return;
      }

      this.pinecone = new Pinecone({
        apiKey: config.pinecone.apiKey,
      });

      // Test connection
      await this.pinecone.listIndexes();
      this.isInitialized = true;
      console.log('✅ Vector database initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize vector database:', error);
      throw error;
    }
  }

  async upsertVectors(vectors: VectorRecord[]): Promise<void> {
    if (!this.isInitialized || !this.pinecone) {
      throw new Error('Vector database not initialized');
    }

    try {
      const index = this.pinecone.index(this.indexName);
      
      // Batch upsert in chunks of 100
      const batchSize = 100;
      for (let i = 0; i < vectors.length; i += batchSize) {
        const batch = vectors.slice(i, i + batchSize);
        await index.upsert(batch);
      }

      console.log(`✅ Upserted ${vectors.length} vectors to index ${this.indexName}`);
    } catch (error) {
      console.error('❌ Failed to upsert vectors:', error);
      throw error;
    }
  }

  async searchSimilar(
    queryVector: number[],
    options: VectorSearchOptions = {}
  ): Promise<VectorSearchResult[]> {
    if (!this.isInitialized || !this.pinecone) {
      console.warn('Vector database not initialized, returning empty results');
      return [];
    }

    try {
      const {
        projectId,
        sessionId,
        limit = 10,
        threshold = 0.7,
        filters = {},
      } = options;

      const index = this.pinecone.index(this.indexName);
      
      // Build filter
      const filter: Record<string, any> = { ...filters };
      if (projectId) {
        filter.projectId = projectId;
      }
      if (sessionId) {
        filter.sessionId = sessionId;
      }

      const queryRequest = {
        vector: queryVector,
        topK: limit,
        includeMetadata: true,
        includeValues: true,
        filter: Object.keys(filter).length > 0 ? filter : undefined,
      };

      const queryResponse = await index.query(queryRequest);
      
      // Convert to VectorSearchResult format
      const results: VectorSearchResult[] = queryResponse.matches
        ?.filter(match => (match.score || 0) >= threshold)
        .map(match => ({
          id: match.id || '',
          content: match.metadata?.content as string || '',
          embedding: match.values || [],
          score: match.score || 0,
          metadata: match.metadata || {},
        })) || [];

      return results;
    } catch (error) {
      console.error('❌ Failed to search vectors:', error);
      return [];
    }
  }

  async deleteVectors(ids: string[]): Promise<void> {
    if (!this.isInitialized || !this.pinecone) {
      throw new Error('Vector database not initialized');
    }

    try {
      const index = this.pinecone.index(this.indexName);
      await index.deleteMany(ids);
      console.log(`✅ Deleted ${ids.length} vectors from index ${this.indexName}`);
    } catch (error) {
      console.error('❌ Failed to delete vectors:', error);
      throw error;
    }
  }

  async deleteByFilter(filter: Record<string, any>): Promise<void> {
    if (!this.isInitialized || !this.pinecone) {
      throw new Error('Vector database not initialized');
    }

    try {
      const index = this.pinecone.index(this.indexName);
      await index.deleteMany(filter);
      console.log(`✅ Deleted vectors matching filter from index ${this.indexName}`);
    } catch (error) {
      console.error('❌ Failed to delete vectors by filter:', error);
      throw error;
    }
  }

  async getStats(): Promise<{
    totalVectors: number;
    dimension: number;
    indexFullness: number;
  }> {
    if (!this.isInitialized || !this.pinecone) {
      return { totalVectors: 0, dimension: 0, indexFullness: 0 };
    }

    try {
      const index = this.pinecone.index(this.indexName);
      const stats = await index.describeIndexStats();
      
      return {
        totalVectors: stats.totalVectorCount || 0,
        dimension: stats.dimension || 0,
        indexFullness: stats.indexFullness || 0,
      };
    } catch (error) {
      console.error('❌ Failed to get index stats:', error);
      return { totalVectors: 0, dimension: 0, indexFullness: 0 };
    }
  }

  async createIndex(dimension: number = 1536): Promise<void> {
    if (!this.pinecone) {
      throw new Error('Pinecone client not initialized');
    }

    try {
      await this.pinecone.createIndex({
        name: this.indexName,
        dimension,
        metric: 'cosine',
        spec: {
          serverless: {
            cloud: 'aws',
            region: 'us-east-1',
          },
        },
      });

      console.log(`✅ Created index ${this.indexName} with dimension ${dimension}`);
    } catch (error) {
      console.error('❌ Failed to create index:', error);
      throw error;
    }
  }

  async deleteIndex(): Promise<void> {
    if (!this.pinecone) {
      throw new Error('Pinecone client not initialized');
    }

    try {
      await this.pinecone.deleteIndex(this.indexName);
      console.log(`✅ Deleted index ${this.indexName}`);
    } catch (error) {
      console.error('❌ Failed to delete index:', error);
      throw error;
    }
  }

  async listIndexes(): Promise<string[]> {
    if (!this.pinecone) {
      throw new Error('Pinecone client not initialized');
    }

    try {
      const response = await this.pinecone.listIndexes();
      return response.indexes?.map(index => index.name || '') || [];
    } catch (error) {
      console.error('❌ Failed to list indexes:', error);
      return [];
    }
  }

  // Utility methods for vector operations
  cosineSimilarity(vectorA: number[], vectorB: number[]): number {
    if (vectorA.length !== vectorB.length) {
      throw new Error('Vectors must have the same dimension');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vectorA.length; i++) {
      dotProduct += vectorA[i] * vectorB[i];
      normA += vectorA[i] * vectorA[i];
      normB += vectorB[i] * vectorB[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (normA * normB);
  }

  normalizeVector(vector: number[]): number[] {
    const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    if (norm === 0) return vector;
    return vector.map(val => val / norm);
  }

  // Batch operations
  async batchUpsert(
    vectors: VectorRecord[],
    batchSize: number = 100,
    onProgress?: (processed: number, total: number) => void
  ): Promise<void> {
    for (let i = 0; i < vectors.length; i += batchSize) {
      const batch = vectors.slice(i, i + batchSize);
      await this.upsertVectors(batch);
      
      if (onProgress) {
        onProgress(Math.min(i + batchSize, vectors.length), vectors.length);
      }
    }
  }

  async batchSearch(
    queries: Array<{ vector: number[]; options?: VectorSearchOptions }>,
    concurrency: number = 5
  ): Promise<VectorSearchResult[][]> {
    const results: VectorSearchResult[][] = [];
    
    for (let i = 0; i < queries.length; i += concurrency) {
      const batch = queries.slice(i, i + concurrency);
      const batchPromises = batch.map(query => 
        this.searchSimilar(query.vector, query.options)
      );
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }
    
    return results;
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      if (!this.pinecone) {
        return false;
      }

      // Try to get index stats as a health check
      await this.getStats();
      return true;
    } catch (error) {
      console.error('Vector database health check failed:', error);
      return false;
    }
  }

  // Cleanup and maintenance
  async cleanup(olderThanDays: number = 30): Promise<void> {
    if (!this.isInitialized || !this.pinecone) {
      throw new Error('Vector database not initialized');
    }

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
      
      await this.deleteByFilter({
        timestamp: { $lt: cutoffDate.toISOString() },
      });
      
      console.log(`✅ Cleaned up vectors older than ${olderThanDays} days`);
    } catch (error) {
      console.error('❌ Failed to cleanup old vectors:', error);
      throw error;
    }
  }

  // Export/Import functionality
  async exportVectors(
    filter: Record<string, any> = {},
    limit: number = 10000
  ): Promise<VectorRecord[]> {
    // Note: Pinecone doesn't support direct export, this would need to be implemented
    // by querying with dummy vectors and collecting results
    console.warn('Vector export not implemented - Pinecone limitation');
    return [];
  }

  async importVectors(vectors: VectorRecord[]): Promise<void> {
    await this.batchUpsert(vectors, 100, (processed, total) => {
      console.log(`Import progress: ${processed}/${total} vectors`);
    });
  }
}