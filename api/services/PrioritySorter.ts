import { Message, MemoryChunk } from '../../shared/types';

export interface PriorityItem {
  id: string;
  content: string;
  priority: number;
  type: 'message' | 'memory' | 'context';
  metadata: {
    timestamp?: Date;
    importance?: number;
    relevance?: number;
    tokenCount: number;
    userId?: string;
    conversationId?: string;
    [key: string]: any;
  };
}

export interface PriorityConfig {
  timeDecayFactor: number; // How much priority decreases over time
  relevanceWeight: number; // Weight for relevance scoring
  importanceWeight: number; // Weight for importance scoring
  recencyWeight: number; // Weight for recency scoring
  tokenEfficiencyWeight: number; // Weight for token efficiency
  maxItems: number; // Maximum items to return
  minPriority: number; // Minimum priority threshold
}

export class PrioritySorter {
  private defaultConfig: PriorityConfig = {
    timeDecayFactor: 0.1,
    relevanceWeight: 0.4,
    importanceWeight: 0.3,
    recencyWeight: 0.2,
    tokenEfficiencyWeight: 0.1,
    maxItems: 50,
    minPriority: 0.1,
  };

  constructor(private config: Partial<PriorityConfig> = {}) {
    this.config = { ...this.defaultConfig, ...config };
  }

  /**
   * Sort messages by priority for context optimization
   */
  sortMessagesByPriority(
    messages: Message[],
    currentQuery?: string,
    config?: Partial<PriorityConfig>
  ): PriorityItem[] {
    const sortConfig = { ...this.config, ...config };
    
    const priorityItems: PriorityItem[] = messages.map((message, index) => {
      const priority = this.calculateMessagePriority(message, index, messages, currentQuery, sortConfig);
      
      return {
        id: message.id || `msg_${index}`,
        content: message.content,
        priority,
        type: 'message',
        metadata: {
          timestamp: message.createdAt,
          importance: this.calculateMessageImportance(message),
          relevance: currentQuery ? this.calculateRelevance(message.content, currentQuery) : 0.5,
          tokenCount: this.estimateTokenCount(message.content),
          userId: message.userId,
          conversationId: message.conversationId,
          role: message.role,
          originalIndex: index,
        },
      };
    });

    return this.sortAndFilter(priorityItems, sortConfig);
  }

  /**
   * Sort memory chunks by priority for retrieval
   */
  sortMemoriesByPriority(
    memories: MemoryChunk[],
    query: string,
    config?: Partial<PriorityConfig>
  ): PriorityItem[] {
    const sortConfig = { ...this.config, ...config };
    
    const priorityItems: PriorityItem[] = memories.map((memory, index) => {
      const priority = this.calculateMemoryPriority(memory, query, sortConfig);
      
      return {
        id: memory.id,
        content: memory.content,
        priority,
        type: 'memory',
        metadata: {
          timestamp: memory.createdAt,
          importance: memory.importance || 0.5,
          relevance: memory.similarity || this.calculateRelevance(memory.content, query),
          tokenCount: this.estimateTokenCount(memory.content),
          userId: memory.userId,
          conversationId: memory.conversationId,
          chunkIndex: memory.chunkIndex,
          source: memory.source,
        },
      };
    });

    return this.sortAndFilter(priorityItems, sortConfig);
  }

  /**
   * Sort mixed content (messages + memories) by priority
   */
  sortMixedContentByPriority(
    messages: Message[],
    memories: MemoryChunk[],
    query: string,
    config?: Partial<PriorityConfig>
  ): PriorityItem[] {
    const sortConfig = { ...this.config, ...config };
    
    const messagePriorities = this.sortMessagesByPriority(messages, query, sortConfig);
    const memoryPriorities = this.sortMemoriesByPriority(memories, query, sortConfig);
    
    const allItems = [...messagePriorities, ...memoryPriorities];
    
    return this.sortAndFilter(allItems, sortConfig);
  }

  /**
   * Optimize content selection based on token budget
   */
  optimizeContentSelection(
    items: PriorityItem[],
    tokenBudget: number,
    preserveTypes?: Array<'message' | 'memory' | 'context'>
  ): PriorityItem[] {
    // Sort by priority first
    const sortedItems = [...items].sort((a, b) => b.priority - a.priority);
    
    const selectedItems: PriorityItem[] = [];
    let usedTokens = 0;
    
    // First pass: preserve required types
    if (preserveTypes) {
      for (const item of sortedItems) {
        if (preserveTypes.includes(item.type) && usedTokens + item.metadata.tokenCount <= tokenBudget) {
          selectedItems.push(item);
          usedTokens += item.metadata.tokenCount;
        }
      }
    }
    
    // Second pass: add remaining items by priority
    for (const item of sortedItems) {
      if (!selectedItems.includes(item) && usedTokens + item.metadata.tokenCount <= tokenBudget) {
        selectedItems.push(item);
        usedTokens += item.metadata.tokenCount;
      }
    }
    
    return selectedItems.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Calculate dynamic priority weights based on context
   */
  calculateDynamicWeights(
    items: PriorityItem[],
    context: {
      queryType?: 'factual' | 'conversational' | 'creative' | 'analytical';
      timeRange?: 'recent' | 'historical' | 'mixed';
      contentType?: 'technical' | 'general' | 'personal';
    }
  ): PriorityConfig {
    const baseConfig = { ...this.config };
    
    // Adjust weights based on query type
    switch (context.queryType) {
      case 'factual':
        baseConfig.relevanceWeight = 0.5;
        baseConfig.importanceWeight = 0.3;
        baseConfig.recencyWeight = 0.1;
        baseConfig.tokenEfficiencyWeight = 0.1;
        break;
      case 'conversational':
        baseConfig.relevanceWeight = 0.3;
        baseConfig.importanceWeight = 0.2;
        baseConfig.recencyWeight = 0.4;
        baseConfig.tokenEfficiencyWeight = 0.1;
        break;
      case 'creative':
        baseConfig.relevanceWeight = 0.2;
        baseConfig.importanceWeight = 0.4;
        baseConfig.recencyWeight = 0.2;
        baseConfig.tokenEfficiencyWeight = 0.2;
        break;
      case 'analytical':
        baseConfig.relevanceWeight = 0.4;
        baseConfig.importanceWeight = 0.4;
        baseConfig.recencyWeight = 0.1;
        baseConfig.tokenEfficiencyWeight = 0.1;
        break;
    }
    
    // Adjust based on time range
    switch (context.timeRange) {
      case 'recent':
        baseConfig.recencyWeight *= 1.5;
        baseConfig.timeDecayFactor *= 0.5;
        break;
      case 'historical':
        baseConfig.recencyWeight *= 0.5;
        baseConfig.importanceWeight *= 1.3;
        break;
    }
    
    return baseConfig;
  }

  private calculateMessagePriority(
    message: Message,
    index: number,
    allMessages: Message[],
    query?: string,
    config: PriorityConfig = this.config
  ): number {
    const importance = this.calculateMessageImportance(message);
    const relevance = query ? this.calculateRelevance(message.content, query) : 0.5;
    const recency = this.calculateRecencyScore(message.createdAt, config.timeDecayFactor);
    const tokenEfficiency = this.calculateTokenEfficiency(message.content);
    
    const priority = 
      (importance * config.importanceWeight) +
      (relevance * config.relevanceWeight) +
      (recency * config.recencyWeight) +
      (tokenEfficiency * config.tokenEfficiencyWeight);
    
    return Math.max(0, Math.min(1, priority));
  }

  private calculateMemoryPriority(
    memory: MemoryChunk,
    query: string,
    config: PriorityConfig = this.config
  ): number {
    const importance = memory.importance || 0.5;
    const relevance = memory.similarity || this.calculateRelevance(memory.content, query);
    const recency = this.calculateRecencyScore(memory.createdAt, config.timeDecayFactor);
    const tokenEfficiency = this.calculateTokenEfficiency(memory.content);
    
    const priority = 
      (importance * config.importanceWeight) +
      (relevance * config.relevanceWeight) +
      (recency * config.recencyWeight) +
      (tokenEfficiency * config.tokenEfficiencyWeight);
    
    return Math.max(0, Math.min(1, priority));
  }

  private calculateMessageImportance(message: Message): number {
    let importance = 0.5; // Base importance
    
    // System messages are highly important
    if (message.role === 'system') {
      importance = 0.9;
    }
    
    // Assistant messages with function calls are important
    if (message.role === 'assistant' && message.functionCall) {
      importance += 0.2;
    }
    
    // Messages with questions are more important
    if (message.content.includes('?')) {
      importance += 0.1;
    }
    
    // Messages with code or technical content
    if (/```|`[^`]+`|\b(function|class|import|export)\b/.test(message.content)) {
      importance += 0.15;
    }
    
    // Longer messages might be more important (up to a point)
    const wordCount = message.content.split(/\s+/).length;
    if (wordCount > 20 && wordCount < 200) {
      importance += 0.1;
    }
    
    return Math.max(0, Math.min(1, importance));
  }

  private calculateRelevance(content: string, query: string): number {
    if (!query || !content) return 0;
    
    const queryWords = query.toLowerCase().split(/\s+/);
    const contentWords = content.toLowerCase().split(/\s+/);
    
    let matches = 0;
    let totalWords = queryWords.length;
    
    for (const queryWord of queryWords) {
      if (contentWords.some(contentWord => 
        contentWord.includes(queryWord) || queryWord.includes(contentWord)
      )) {
        matches++;
      }
    }
    
    // Basic relevance score
    let relevance = matches / totalWords;
    
    // Boost for exact phrase matches
    if (content.toLowerCase().includes(query.toLowerCase())) {
      relevance += 0.3;
    }
    
    return Math.max(0, Math.min(1, relevance));
  }

  private calculateRecencyScore(timestamp?: Date, decayFactor: number = 0.1): number {
    if (!timestamp) return 0.5;
    
    const now = new Date();
    const ageInHours = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60);
    
    // Exponential decay: score = e^(-decayFactor * age)
    const recencyScore = Math.exp(-decayFactor * ageInHours);
    
    return Math.max(0, Math.min(1, recencyScore));
  }

  private calculateTokenEfficiency(content: string): number {
    const tokenCount = this.estimateTokenCount(content);
    const wordCount = content.split(/\s+/).length;
    
    if (wordCount === 0) return 0;
    
    // Higher efficiency for content with more information per token
    const wordsPerToken = wordCount / tokenCount;
    const efficiency = Math.min(1, wordsPerToken / 0.75); // Normalize around 0.75 words per token
    
    return efficiency;
  }

  private estimateTokenCount(text: string): number {
    if (!text) return 0;
    
    // Simple token estimation
    const words = text.split(/\s+/).filter(word => word.length > 0);
    return Math.ceil(words.length * 1.3);
  }

  private sortAndFilter(items: PriorityItem[], config: PriorityConfig): PriorityItem[] {
    return items
      .filter(item => item.priority >= config.minPriority)
      .sort((a, b) => b.priority - a.priority)
      .slice(0, config.maxItems);
  }

  /**
   * Analyze priority distribution for debugging
   */
  analyzePriorityDistribution(items: PriorityItem[]): {
    averagePriority: number;
    priorityDistribution: { high: number; medium: number; low: number };
    typeDistribution: Record<string, number>;
    tokenDistribution: { total: number; average: number; max: number; min: number };
  } {
    if (items.length === 0) {
      return {
        averagePriority: 0,
        priorityDistribution: { high: 0, medium: 0, low: 0 },
        typeDistribution: {},
        tokenDistribution: { total: 0, average: 0, max: 0, min: 0 },
      };
    }
    
    const priorities = items.map(item => item.priority);
    const tokenCounts = items.map(item => item.metadata.tokenCount);
    
    const averagePriority = priorities.reduce((sum, p) => sum + p, 0) / priorities.length;
    
    const priorityDistribution = {
      high: items.filter(item => item.priority >= 0.7).length,
      medium: items.filter(item => item.priority >= 0.4 && item.priority < 0.7).length,
      low: items.filter(item => item.priority < 0.4).length,
    };
    
    const typeDistribution: Record<string, number> = {};
    items.forEach(item => {
      typeDistribution[item.type] = (typeDistribution[item.type] || 0) + 1;
    });
    
    const tokenDistribution = {
      total: tokenCounts.reduce((sum, count) => sum + count, 0),
      average: tokenCounts.reduce((sum, count) => sum + count, 0) / tokenCounts.length,
      max: Math.max(...tokenCounts),
      min: Math.min(...tokenCounts),
    };
    
    return {
      averagePriority,
      priorityDistribution,
      typeDistribution,
      tokenDistribution,
    };
  }

  /**
   * Health check for the priority sorter
   */
  healthCheck(): { status: 'healthy' | 'degraded' | 'unhealthy'; details: any } {
    try {
      // Test basic functionality
      const testItems: PriorityItem[] = [
        {
          id: 'test1',
          content: 'Test content 1',
          priority: 0.8,
          type: 'message',
          metadata: { tokenCount: 10 },
        },
        {
          id: 'test2',
          content: 'Test content 2',
          priority: 0.6,
          type: 'memory',
          metadata: { tokenCount: 15 },
        },
      ];
      
      const sorted = this.sortAndFilter(testItems, this.config);
      const analysis = this.analyzePriorityDistribution(sorted);
      
      if (sorted.length === 2 && sorted[0].priority >= sorted[1].priority) {
        return {
          status: 'healthy',
          details: {
            configLoaded: true,
            sortingWorking: true,
            analysisWorking: true,
            testResults: analysis,
          },
        };
      } else {
        return {
          status: 'degraded',
          details: {
            configLoaded: true,
            sortingWorking: false,
            analysisWorking: true,
            error: 'Sorting not working correctly',
          },
        };
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          configLoaded: !!this.config,
        },
      };
    }
  }
}