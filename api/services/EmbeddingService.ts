import OpenAI from 'openai';
import { config, memoryConfig } from '../config';

export interface EmbeddingResult {
  embedding: number[];
  tokenCount: number;
  model: string;
}

export class EmbeddingService {
  private openai: OpenAI | null = null;
  private isInitialized = false;

  constructor() {}

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      if (!config.llm.openaiApiKey) {
        console.warn('OpenAI API key not configured, embedding service will be disabled');
        return;
      }

      this.openai = new OpenAI({
        apiKey: config.llm.openaiApiKey,
      });

      // Test the connection
      await this.openai.models.list();
      this.isInitialized = true;
      console.log('✅ Embedding service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize embedding service:', error);
      throw error;
    }
  }

  async generateEmbedding(text: string, model?: string): Promise<EmbeddingResult> {
    if (!this.isInitialized || !this.openai) {
      throw new Error('Embedding service not initialized');
    }

    try {
      const embeddingModel = model || memoryConfig.embeddingModel;
      
      const response = await this.openai.embeddings.create({
        model: embeddingModel,
        input: text,
        dimensions: memoryConfig.embeddingDimensions,
      });

      const embedding = response.data[0].embedding;
      const tokenCount = response.usage.total_tokens;

      return {
        embedding,
        tokenCount,
        model: embeddingModel,
      };
    } catch (error) {
      console.error('❌ Failed to generate embedding:', error);
      throw error;
    }
  }

  async generateBatchEmbeddings(
    texts: string[],
    model?: string
  ): Promise<EmbeddingResult[]> {
    if (!this.isInitialized || !this.openai) {
      throw new Error('Embedding service not initialized');
    }

    try {
      const embeddingModel = model || memoryConfig.embeddingModel;
      const batchSize = 100; // OpenAI batch limit
      const results: EmbeddingResult[] = [];

      for (let i = 0; i < texts.length; i += batchSize) {
        const batch = texts.slice(i, i + batchSize);
        
        const response = await this.openai.embeddings.create({
          model: embeddingModel,
          input: batch,
          dimensions: memoryConfig.embeddingDimensions,
        });

        const batchResults = response.data.map((item, index) => ({
          embedding: item.embedding,
          tokenCount: Math.round(response.usage.total_tokens / batch.length), // Approximate
          model: embeddingModel,
        }));

        results.push(...batchResults);
      }

      return results;
    } catch (error) {
      console.error('❌ Failed to generate batch embeddings:', error);
      throw error;
    }
  }

  calculateSimilarity(embedding1: number[], embedding2: number[]): number {
    if (embedding1.length !== embedding2.length) {
      throw new Error('Embeddings must have the same dimension');
    }

    // Calculate cosine similarity
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      norm1 += embedding1[i] * embedding1[i];
      norm2 += embedding2[i] * embedding2[i];
    }

    const similarity = dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
    return similarity;
  }

  async healthCheck(): Promise<boolean> {
    try {
      if (!this.isInitialized || !this.openai) {
        return false;
      }

      // Test with a simple embedding
      await this.generateEmbedding('health check');
      return true;
    } catch (error) {
      console.error('Embedding service health check failed:', error);
      return false;
    }
  }

  getEmbeddingDimensions(): number {
    return memoryConfig.embeddingDimensions;
  }

  getSupportedModels(): string[] {
    return [
      'text-embedding-3-small',
      'text-embedding-3-large',
      'text-embedding-ada-002',
    ];
  }
}