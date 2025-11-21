import { MemoryManager } from './MemoryManager';
import { RAGKnowledgeManager } from './RAGKnowledgeManager';
import { ContextOptimizer } from './ContextOptimizer';
import { TokenCounter } from './TokenCounter';
import { VectorSearchResult } from '../../shared/types';

export interface EnhancedChatRequest {
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  model?: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  projectId: string;
  sessionId?: string;
  useMemory?: boolean;
  useRAG?: boolean;
  ragOptions?: {
    sources?: string[];
    threshold?: number;
    limit?: number;
    fusionStrategy?: 'weighted' | 'ranked' | 'hybrid';
  };
  contextOptions?: {
    maxTokens?: number;
    includeHistory?: boolean;
    prioritizeRecent?: boolean;
  };
}

export interface EnhancedChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  metadata?: {
    memoryUsed: boolean;
    ragUsed: boolean;
    sourcesUsed: string[];
    contextSources: Array<{
      type: 'memory' | 'rag';
      source: string;
      score: number;
    }>;
  };
}

export class EnhancedChatService {
  private memoryManager: MemoryManager;
  private ragKnowledgeManager: RAGKnowledgeManager;
  private contextOptimizer: ContextOptimizer;
  private tokenCounter: TokenCounter;
  private initialized = false;

  constructor() {
    this.memoryManager = new MemoryManager();
    this.ragKnowledgeManager = new RAGKnowledgeManager();
    this.contextOptimizer = new ContextOptimizer();
    this.tokenCounter = new TokenCounter();
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    await Promise.all([
      this.memoryManager.initialize(),
      this.ragKnowledgeManager.initialize()
    ]);
    
    this.initialized = true;
  }

  /**
   * 处理聊天请求
   */
  async processChat(request: EnhancedChatRequest): Promise<EnhancedChatResponse> {
    if (!this.initialized) {
      throw new Error('Enhanced Chat Service not initialized');
    }

    const startTime = Date.now();
    let memoryResults: VectorSearchResult[] = [];
    let ragResults: any[] = [];

    try {
      // 1. 获取最后一条用户消息作为查询
      const lastUserMessage = request.messages
        .filter(msg => msg.role === 'user')
        .pop();
      
      if (!lastUserMessage) {
        throw new Error('No user message found');
      }

      const query = lastUserMessage.content;

      // 2. 并行检索记忆和RAG知识
      const retrievalPromises: Promise<any>[] = [];

      if (request.useMemory) {
        retrievalPromises.push(
          this.memoryManager.searchMemories(query, {
            projectId: request.projectId,
            sessionId: request.sessionId,
            limit: 5,
            threshold: 0.7
          }).then(results => ({ type: 'memory', results }))
        );
      }

      if (request.useRAG && request.ragOptions) {
        retrievalPromises.push(
          this.ragKnowledgeManager.fusedSearch(query, request.ragOptions)
            .then(results => ({ type: 'rag', results }))
        );
      }

      const retrievalResults = await Promise.all(retrievalPromises);
      
      // 3. 分离结果
      for (const result of retrievalResults) {
        if (result.type === 'memory') {
          memoryResults = result.results;
        } else if (result.type === 'rag') {
          ragResults = result.results.results || [];
        }
      }

      // 4. 上下文优化
      let optimizedContext: any = { messages: request.messages };
      
      if (request.useContextOptimization) {
        optimizedContext = await this.contextOptimizer.optimizeContext({
          messages: request.messages,
          memories: memoryResults,
          maxTokens: request.contextOptions?.maxTokens || 4000,
          model: request.model || 'gpt-3.5-turbo'
        });
      }

      // 5. 调用OpenAI API
      const openaiResponse = await this.callOpenAI({
        messages: optimizedContext.messages,
        model: request.model || 'gpt-3.5-turbo',
        temperature: request.temperature,
        max_tokens: request.maxTokens
      });

      // 6. 存储对话（如果启用记忆）
      if (request.useMemory && openaiResponse.choices[0]?.message) {
        await this.memoryManager.storeConversation({
          projectId: request.projectId,
          sessionId: request.sessionId || `session_${Date.now()}`,
          messages: [
            lastUserMessage,
            openaiResponse.choices[0].message
          ]
        });
      }

      // 7. 构建响应
      const response: EnhancedChatResponse = {
        ...openaiResponse,
        metadata: {
          processingTime: Date.now() - startTime,
          memoryResults: memoryResults.length,
          ragResults: ragResults.length,
          contextOptimized: request.useContextOptimization || false,
          sources: [
            ...memoryResults.map(m => ({ type: 'memory', id: m.id, score: m.score })),
            ...ragResults.map(r => ({ type: 'rag', id: r.id, score: r.score, source: r.source }))
          ]
        }
      };

      return response;

    } catch (error) {
      console.error('Enhanced chat processing error:', error);
      throw new Error(`Failed to process chat: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 调用OpenAI API
   */
  private async callOpenAI(params: {
    messages: any[];
    model: string;
    temperature?: number;
    max_tokens?: number;
  }): Promise<any> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    return response.json();
  }

  async getAvailableModels(): Promise<string[]> {
    return [
      'gpt-3.5-turbo',
      'gpt-4',
      'gpt-4-turbo-preview',
      'gpt-4o',
      'gpt-4o-mini'
    ];
  }

  async healthCheck(): Promise<{ status: string; details: any }> {
    try {
      const checks = await Promise.allSettled([
        this.memoryManager.healthCheck(),
        this.ragKnowledgeManager.healthCheck()
      ]);

      const results = {
        memoryManager: checks[0].status === 'fulfilled' ? checks[0].value : { status: 'error', error: checks[0].reason },
        ragKnowledgeManager: checks[1].status === 'fulfilled' ? checks[1].value : { status: 'error', error: checks[1].reason }
      };

      const allHealthy = Object.values(results).every(
        result => result.status === 'healthy' || result.status === 'ok'
      );

      return {
        status: allHealthy ? 'healthy' : 'degraded',
        details: {
          initialized: this.initialized,
          services: results,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      };
    }
  }
}