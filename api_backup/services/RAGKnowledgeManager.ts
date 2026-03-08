import { MemoryChunk, VectorSearchResult } from '../../shared/types';
import { EmbeddingService } from './EmbeddingService';
import { VectorDatabase } from './VectorDatabase';
import { MemoryManager } from './MemoryManager';

export interface RAGKnowledgeSource {
  id: string;
  name: string;
  type: 'elasticsearch' | 'chroma' | 'weaviate' | 'local_files' | 'database' | 'api';
  config: {
    endpoint?: string;
    apiKey?: string;
    indexName?: string;
    database?: string;
    collection?: string;
    filePath?: string;
    [key: string]: any;
  };
  enabled: boolean;
  priority: number; // 1-10, 10 being highest priority
  metadata?: Record<string, any>;
}

export interface RAGSearchOptions {
  query: string;
  projectId: string;
  sources?: string[]; // Specific source IDs to search
  limit?: number;
  threshold?: number;
  includeSupermemory?: boolean; // Whether to include Supermemory results
  fusionStrategy?: 'weighted' | 'ranked' | 'hybrid';
}

export interface RAGSearchResult {
  id: string;
  content: string;
  score: number;
  source: string;
  sourceType: string;
  metadata: Record<string, any>;
  timestamp?: Date;
}

export interface FusedSearchResult {
  supermemoryResults: MemoryChunk[];
  ragResults: RAGSearchResult[];
  fusedResults: Array<{
    content: string;
    score: number;
    source: 'supermemory' | 'rag';
    sourceId: string;
    metadata: Record<string, any>;
  }>;
  totalResults: number;
}

export class RAGKnowledgeManager {
  private embeddingService: EmbeddingService;
  private vectorDatabase: VectorDatabase;
  private memoryManager: MemoryManager;
  private knowledgeSources: Map<string, RAGKnowledgeSource> = new Map();
  private isInitialized = false;

  constructor() {
    this.embeddingService = new EmbeddingService();
    this.vectorDatabase = new VectorDatabase();
    this.memoryManager = new MemoryManager();
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await Promise.all([
        this.embeddingService.initialize(),
        this.vectorDatabase.initialize(),
        this.memoryManager.initialize(),
      ]);

      // Load configured knowledge sources
      await this.loadKnowledgeSources();
      
      this.isInitialized = true;
      console.log('✅ RAG Knowledge Manager initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize RAG Knowledge Manager:', error);
      throw error;
    }
  }

  // 配置管理
  async addKnowledgeSource(source: RAGKnowledgeSource): Promise<void> {
    this.knowledgeSources.set(source.id, source);
    await this.saveKnowledgeSources();
    console.log(`✅ Added knowledge source: ${source.name}`);
  }

  async removeKnowledgeSource(sourceId: string): Promise<void> {
    this.knowledgeSources.delete(sourceId);
    await this.saveKnowledgeSources();
    console.log(`✅ Removed knowledge source: ${sourceId}`);
  }

  async updateKnowledgeSource(sourceId: string, updates: Partial<RAGKnowledgeSource>): Promise<void> {
    const source = this.knowledgeSources.get(sourceId);
    if (!source) {
      throw new Error(`Knowledge source not found: ${sourceId}`);
    }

    const updatedSource = { ...source, ...updates };
    this.knowledgeSources.set(sourceId, updatedSource);
    await this.saveKnowledgeSources();
    console.log(`✅ Updated knowledge source: ${sourceId}`);
  }

  getKnowledgeSources(): RAGKnowledgeSource[] {
    return Array.from(this.knowledgeSources.values());
  }

  // 融合搜索
  async fusedSearch(options: RAGSearchOptions): Promise<FusedSearchResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const {
      query,
      projectId,
      sources,
      limit = 10,
      threshold = 0.7,
      includeSupermemory = true,
      fusionStrategy = 'hybrid'
    } = options;

    // 并行搜索Supermemory和RAG知识库
    const [supermemoryResults, ragResults] = await Promise.all([
      includeSupermemory ? this.searchSupermemory(query, projectId, limit, threshold) : Promise.resolve([]),
      this.searchRAGSources(query, sources, limit, threshold)
    ]);

    // 融合结果
    const fusedResults = this.fuseResults(supermemoryResults, ragResults, fusionStrategy, limit);

    return {
      supermemoryResults,
      ragResults,
      fusedResults,
      totalResults: fusedResults.length
    };
  }

  // 搜索Supermemory
  private async searchSupermemory(
    query: string,
    projectId: string,
    limit: number,
    threshold: number
  ): Promise<MemoryChunk[]> {
    try {
      return await this.memoryManager.retrieveRelevantMemories({
        projectId,
        query,
        limit,
        threshold
      });
    } catch (error) {
      console.error('Error searching Supermemory:', error);
      return [];
    }
  }

  // 搜索RAG知识源
  private async searchRAGSources(
    query: string,
    sourceIds?: string[],
    limit: number = 10,
    threshold: number = 0.7
  ): Promise<RAGSearchResult[]> {
    const sourcesToSearch = sourceIds 
      ? sourceIds.map(id => this.knowledgeSources.get(id)).filter(Boolean) as RAGKnowledgeSource[]
      : Array.from(this.knowledgeSources.values()).filter(source => source.enabled);

    const searchPromises = sourcesToSearch.map(source => 
      this.searchSingleRAGSource(query, source, limit, threshold)
    );

    const results = await Promise.allSettled(searchPromises);
    
    return results
      .filter((result): result is PromiseFulfilledResult<RAGSearchResult[]> => result.status === 'fulfilled')
      .flatMap(result => result.value)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  // 搜索单个RAG知识源
  private async searchSingleRAGSource(
    query: string,
    source: RAGKnowledgeSource,
    limit: number,
    threshold: number
  ): Promise<RAGSearchResult[]> {
    try {
      switch (source.type) {
        case 'elasticsearch':
          return await this.searchElasticsearch(query, source, limit, threshold);
        case 'chroma':
          return await this.searchChroma(query, source, limit, threshold);
        case 'weaviate':
          return await this.searchWeaviate(query, source, limit, threshold);
        case 'local_files':
          return await this.searchLocalFiles(query, source, limit, threshold);
        case 'database':
          return await this.searchDatabase(query, source, limit, threshold);
        case 'api':
          return await this.searchAPI(query, source, limit, threshold);
        default:
          console.warn(`Unsupported source type: ${source.type}`);
          return [];
      }
    } catch (error) {
      console.error(`Error searching source ${source.name}:`, error);
      return [];
    }
  }

  // Elasticsearch搜索实现
  private async searchElasticsearch(
    query: string,
    source: RAGKnowledgeSource,
    limit: number,
    threshold: number
  ): Promise<RAGSearchResult[]> {
    // 这里实现Elasticsearch搜索逻辑
    // 可以使用@elastic/elasticsearch客户端
    const { endpoint, apiKey, indexName } = source.config;
    
    // 示例实现（需要安装@elastic/elasticsearch）
    try {
      const response = await fetch(`${endpoint}/${indexName}/_search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `ApiKey ${apiKey}`
        },
        body: JSON.stringify({
          query: {
            multi_match: {
              query,
              fields: ['content', 'title', 'description']
            }
          },
          size: limit,
          min_score: threshold
        })
      });

      const data = await response.json();
      
      return data.hits?.hits?.map((hit: any) => ({
        id: hit._id,
        content: hit._source.content || hit._source.text,
        score: hit._score / 10, // Normalize to 0-1
        source: source.name,
        sourceType: source.type,
        metadata: {
          ...hit._source,
          index: indexName
        }
      })) || [];
    } catch (error) {
      console.error(`Elasticsearch search error for ${source.name}:`, error);
      return [];
    }
  }

  // Chroma搜索实现
  private async searchChroma(
    query: string,
    source: RAGKnowledgeSource,
    limit: number,
    threshold: number
  ): Promise<RAGSearchResult[]> {
    const { endpoint, collection } = source.config;
    
    try {
      // 生成查询向量
      const embedding = await this.embeddingService.generateEmbedding(query);
      
      const response = await fetch(`${endpoint}/api/v1/collections/${collection}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query_embeddings: [embedding.embedding],
          n_results: limit,
          include: ['documents', 'metadatas', 'distances']
        })
      });

      const data = await response.json();
      
      return data.documents?.[0]?.map((doc: string, index: number) => ({
        id: data.ids?.[0]?.[index] || `chroma_${index}`,
        content: doc,
        score: 1 - (data.distances?.[0]?.[index] || 1), // Convert distance to similarity
        source: source.name,
        sourceType: source.type,
        metadata: data.metadatas?.[0]?.[index] || {}
      })).filter((result: any) => result.score >= threshold) || [];
    } catch (error) {
      console.error(`Chroma search error for ${source.name}:`, error);
      return [];
    }
  }

  // Weaviate搜索实现
  private async searchWeaviate(
    query: string,
    source: RAGKnowledgeSource,
    limit: number,
    threshold: number
  ): Promise<RAGSearchResult[]> {
    // 实现Weaviate搜索逻辑
    return [];
  }

  // 本地文件搜索实现
  private async searchLocalFiles(
    query: string,
    source: RAGKnowledgeSource,
    limit: number,
    threshold: number
  ): Promise<RAGSearchResult[]> {
    // 实现本地文件搜索逻辑
    return [];
  }

  // 数据库搜索实现
  private async searchDatabase(
    query: string,
    source: RAGKnowledgeSource,
    limit: number,
    threshold: number
  ): Promise<RAGSearchResult[]> {
    // 实现数据库搜索逻辑
    return [];
  }

  // API搜索实现
  private async searchAPI(
    query: string,
    source: RAGKnowledgeSource,
    limit: number,
    threshold: number
  ): Promise<RAGSearchResult[]> {
    // 实现API搜索逻辑
    return [];
  }

  // 结果融合
  private fuseResults(
    supermemoryResults: MemoryChunk[],
    ragResults: RAGSearchResult[],
    strategy: 'weighted' | 'ranked' | 'hybrid',
    limit: number
  ): Array<{
    content: string;
    score: number;
    source: 'supermemory' | 'rag';
    sourceId: string;
    metadata: Record<string, any>;
  }> {
    const allResults: Array<{
      content: string;
      score: number;
      source: 'supermemory' | 'rag';
      sourceId: string;
      metadata: Record<string, any>;
    }> = [];

    // 添加Supermemory结果
    supermemoryResults.forEach(result => {
      allResults.push({
        content: result.content,
        score: result.relevanceScore || 0.5,
        source: 'supermemory',
        sourceId: result.id,
        metadata: {
          projectId: result.projectId,
          sessionId: result.sessionId,
          timestamp: result.timestamp
        }
      });
    });

    // 添加RAG结果
    ragResults.forEach(result => {
      allResults.push({
        content: result.content,
        score: result.score,
        source: 'rag',
        sourceId: result.id,
        metadata: {
          ...result.metadata,
          ragSource: result.source,
          ragSourceType: result.sourceType
        }
      });
    });

    // 根据策略排序和融合
    switch (strategy) {
      case 'weighted':
        // 给Supermemory结果更高权重（因为更相关）
        allResults.forEach(result => {
          if (result.source === 'supermemory') {
            result.score *= 1.2;
          }
        });
        break;
      case 'ranked':
        // 保持原始分数
        break;
      case 'hybrid':
        // 混合策略：平衡新近性和相关性
        allResults.forEach(result => {
          if (result.source === 'supermemory') {
            result.score *= 1.1; // 轻微提升Supermemory权重
          }
        });
        break;
    }

    return allResults
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  // 持久化配置
  private async loadKnowledgeSources(): Promise<void> {
    // 从配置文件或数据库加载知识源配置
    // 这里可以实现从JSON文件、数据库或环境变量加载
  }

  private async saveKnowledgeSources(): Promise<void> {
    // 保存知识源配置到持久化存储
  }

  // 健康检查
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    sources: Array<{
      id: string;
      name: string;
      status: 'online' | 'offline' | 'error';
      lastChecked: Date;
    }>;
  }> {
    const sourceStatuses = await Promise.allSettled(
      Array.from(this.knowledgeSources.values()).map(async source => {
        try {
          // 简单的健康检查
          await this.searchSingleRAGSource('test', source, 1, 0.5);
          return {
            id: source.id,
            name: source.name,
            status: 'online' as const,
            lastChecked: new Date()
          };
        } catch (error) {
          return {
            id: source.id,
            name: source.name,
            status: 'error' as const,
            lastChecked: new Date()
          };
        }
      })
    );

    const sources = sourceStatuses.map(result => 
      result.status === 'fulfilled' ? result.value : {
        id: 'unknown',
        name: 'unknown',
        status: 'error' as const,
        lastChecked: new Date()
      }
    );

    const onlineCount = sources.filter(s => s.status === 'online').length;
    const totalCount = sources.length;

    let status: 'healthy' | 'degraded' | 'unhealthy';
    if (onlineCount === totalCount) {
      status = 'healthy';
    } else if (onlineCount > 0) {
      status = 'degraded';
    } else {
      status = 'unhealthy';
    }

    return { status, sources };
  }
}