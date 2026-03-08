import { VectorSearchResult, PriorityWeights, ContentItem, Message, MemoryChunk } from '../../shared/types';
import { TokenCounter } from './TokenCounter';
import { PrioritySorter, PriorityItem, PriorityConfig } from './PrioritySorter';

interface OptimizationOptions {
  messages: Array<{ role: string; content: string }>;
  memories: VectorSearchResult[];
  maxTokens: number;
  model: string;
  preserveSystemMessages?: boolean;
  preserveRecentMessages?: number;
  compressionRatio?: number;
}

interface OptimizationResult {
  messages: Array<{ role: string; content: string }>;
  wasOptimized: boolean;
  originalTokens: number;
  optimizedTokens: number;
  compressionRatio: number;
  strategy: string;
  memoriesIncluded: number;
}

export class ContextOptimizer {
  private tokenCounter: TokenCounter;
  private prioritySorter: PrioritySorter;
  private defaultWeights: PriorityWeights = {
    temporal: 0.3,
    relevance: 0.4,
    importance: 0.2,
    userPreference: 0.1,
  };

  constructor(priorityConfig?: Partial<PriorityConfig>) {
    this.tokenCounter = new TokenCounter();
    this.prioritySorter = new PrioritySorter(priorityConfig);
  }

  async optimizeContext(options: OptimizationOptions): Promise<OptimizationResult> {
    const {
      messages,
      memories,
      maxTokens,
      model,
      preserveSystemMessages = true,
      preserveRecentMessages = 2,
      compressionRatio = 0.7,
    } = options;

    const originalTokens = this.tokenCounter.countTokens(messages);
    const memoryTokens = this.tokenCounter.countTokens(
      memories.map(m => ({ role: 'system', content: m.content }))
    );
    const totalTokens = originalTokens + memoryTokens;

    // If we're within limits, no optimization needed
    if (totalTokens <= maxTokens) {
      const enhancedMessages = this.addMemoriesToContext(messages, memories);
      return {
        messages: enhancedMessages,
        wasOptimized: false,
        originalTokens: totalTokens,
        optimizedTokens: this.tokenCounter.countTokens(enhancedMessages),
        compressionRatio: 1.0,
        strategy: 'no_optimization',
        memoriesIncluded: memories.length,
      };
    }

    // Determine optimization strategy
    const strategy = this.selectOptimizationStrategy(totalTokens, maxTokens, messages, memories);
    
    let optimizedMessages: Array<{ role: string; content: string }>;
    let finalCompressionRatio = 1.0;
    let memoriesIncluded = memories.length;

    switch (strategy) {
      case 'memory_filtering':
        const filteredMemories = this.filterMemoriesByRelevance(memories, maxTokens - originalTokens);
        optimizedMessages = this.addMemoriesToContext(messages, filteredMemories);
        memoriesIncluded = filteredMemories.length;
        break;

      case 'conversation_truncation':
        const truncatedMessages = this.truncateConversation(messages, maxTokens - memoryTokens, preserveRecentMessages);
        optimizedMessages = this.addMemoriesToContext(truncatedMessages, memories);
        break;

      case 'hybrid_optimization':
        const hybridResult = this.hybridOptimization(messages, memories, maxTokens, preserveRecentMessages);
        optimizedMessages = hybridResult.messages;
        memoriesIncluded = hybridResult.memoriesIncluded;
        finalCompressionRatio = hybridResult.compressionRatio;
        break;

      case 'content_compression':
        const compressedResult = await this.compressContent(messages, memories, maxTokens, compressionRatio);
        optimizedMessages = compressedResult.messages;
        finalCompressionRatio = compressedResult.compressionRatio;
        memoriesIncluded = compressedResult.memoriesIncluded;
        break;

      default:
        // Fallback to simple truncation
        optimizedMessages = this.truncateConversation(messages, maxTokens, preserveRecentMessages);
        memoriesIncluded = 0;
    }

    const optimizedTokens = this.tokenCounter.countTokens(optimizedMessages);

    return {
      messages: optimizedMessages,
      wasOptimized: true,
      originalTokens: totalTokens,
      optimizedTokens,
      compressionRatio: finalCompressionRatio,
      strategy,
      memoriesIncluded,
    };
  }

  private selectOptimizationStrategy(
    totalTokens: number,
    maxTokens: number,
    messages: Array<{ role: string; content: string }>,
    memories: VectorSearchResult[]
  ): string {
    const overageRatio = totalTokens / maxTokens;
    const memoryRatio = memories.length > 0 ? 
      this.tokenCounter.countTokens(memories.map(m => ({ role: 'system', content: m.content }))) / totalTokens : 0;

    if (overageRatio < 1.2) {
      // Small overage - filter memories
      return 'memory_filtering';
    } else if (overageRatio < 1.5 && memoryRatio > 0.3) {
      // Moderate overage with significant memory usage - hybrid approach
      return 'hybrid_optimization';
    } else if (overageRatio < 2.0) {
      // Larger overage - truncate conversation
      return 'conversation_truncation';
    } else {
      // Significant overage - compress content
      return 'content_compression';
    }
  }

  private filterMemoriesByRelevance(
    memories: VectorSearchResult[],
    maxMemoryTokens: number
  ): VectorSearchResult[] {
    // Sort memories by relevance score
    const sortedMemories = [...memories].sort((a, b) => b.score - a.score);
    
    const filtered: VectorSearchResult[] = [];
    let currentTokens = 0;

    for (const memory of sortedMemories) {
      const memoryTokens = this.tokenCounter.countSingleMessageTokens(memory.content);
      
      if (currentTokens + memoryTokens <= maxMemoryTokens) {
        filtered.push(memory);
        currentTokens += memoryTokens;
      } else {
        break;
      }
    }

    return filtered;
  }

  private truncateConversation(
    messages: Array<{ role: string; content: string }>,
    maxTokens: number,
    preserveRecent: number
  ): Array<{ role: string; content: string }> {
    return this.tokenCounter.optimizeTokenUsage(messages, maxTokens, preserveRecent);
  }

  private hybridOptimization(
    messages: Array<{ role: string; content: string }>,
    memories: VectorSearchResult[],
    maxTokens: number,
    preserveRecent: number
  ): { messages: Array<{ role: string; content: string }>; memoriesIncluded: number; compressionRatio: number } {
    // Allocate tokens: 70% for conversation, 30% for memories
    const conversationTokens = Math.floor(maxTokens * 0.7);
    const memoryTokens = Math.floor(maxTokens * 0.3);

    // Optimize conversation
    const optimizedMessages = this.truncateConversation(messages, conversationTokens, preserveRecent);
    
    // Filter memories
    const filteredMemories = this.filterMemoriesByRelevance(memories, memoryTokens);
    
    // Combine
    const finalMessages = this.addMemoriesToContext(optimizedMessages, filteredMemories);

    return {
      messages: finalMessages,
      memoriesIncluded: filteredMemories.length,
      compressionRatio: filteredMemories.length / Math.max(memories.length, 1),
    };
  }

  private async compressContent(
    messages: Array<{ role: string; content: string }>,
    memories: VectorSearchResult[],
    maxTokens: number,
    targetCompressionRatio: number
  ): Promise<{ messages: Array<{ role: string; content: string }>; memoriesIncluded: number; compressionRatio: number }> {
    // For now, implement a simple compression by summarizing older messages
    // In a real implementation, you might use an LLM to summarize content
    
    const systemMessages = messages.filter(m => m.role === 'system');
    const conversationMessages = messages.filter(m => m.role !== 'system');
    
    // Keep recent messages, compress older ones
    const recentMessages = conversationMessages.slice(-4); // Keep last 4 messages
    const olderMessages = conversationMessages.slice(0, -4);
    
    // Simple compression: truncate older messages
    const compressedOlderMessages = olderMessages.map(msg => ({
      ...msg,
      content: msg.content.length > 200 ? 
        msg.content.substring(0, 200) + '...[compressed]' : 
        msg.content,
    }));

    const compressedMessages = [...systemMessages, ...compressedOlderMessages, ...recentMessages];
    
    // Filter memories to fit remaining space
    const conversationTokens = this.tokenCounter.countTokens(compressedMessages);
    const remainingTokens = maxTokens - conversationTokens;
    const filteredMemories = this.filterMemoriesByRelevance(memories, remainingTokens);
    
    const finalMessages = this.addMemoriesToContext(compressedMessages, filteredMemories);

    return {
      messages: finalMessages,
      memoriesIncluded: filteredMemories.length,
      compressionRatio: targetCompressionRatio,
    };
  }

  private addMemoriesToContext(
    messages: Array<{ role: string; content: string }>,
    memories: VectorSearchResult[]
  ): Array<{ role: string; content: string }> {
    if (memories.length === 0) {
      return messages;
    }

    // Find system messages and insert memories after them
    const systemMessages = messages.filter(m => m.role === 'system');
    const otherMessages = messages.filter(m => m.role !== 'system');

    // Create memory context
    const memoryContext = this.formatMemoriesAsContext(memories);
    const memoryMessage = {
      role: 'system',
      content: memoryContext,
    };

    return [...systemMessages, memoryMessage, ...otherMessages];
  }

  private formatMemoriesAsContext(memories: VectorSearchResult[]): string {
    if (memories.length === 0) {
      return '';
    }

    const formattedMemories = memories
      .sort((a, b) => b.score - a.score) // Sort by relevance
      .map((memory, index) => {
        const timestamp = memory.metadata?.timestamp ? 
          new Date(memory.metadata.timestamp).toLocaleString() : 
          'Unknown time';
        
        return `[Memory ${index + 1}] (Relevance: ${memory.score.toFixed(2)}, Time: ${timestamp})\n${memory.content}`;
      })
      .join('\n\n');

    return `Relevant conversation history and context:\n\n${formattedMemories}\n\nPlease use this context to provide more informed and personalized responses.`;
  }

  prioritizeContent(
    items: ContentItem[],
    weights: PriorityWeights = this.defaultWeights
  ): ContentItem[] {
    const now = new Date();
    
    return items
      .map(item => {
        // Calculate temporal score (more recent = higher score)
        const ageInHours = (now.getTime() - item.timestamp.getTime()) / (1000 * 60 * 60);
        const temporalScore = Math.exp(-ageInHours / 24); // Exponential decay over 24 hours
        
        // Calculate composite score
        const compositeScore = 
          weights.temporal * temporalScore +
          weights.relevance * item.relevanceScore +
          weights.importance * item.importanceScore +
          weights.userPreference * item.userInteractionScore;

        return {
          ...item,
          metadata: {
            ...item.metadata,
            compositeScore,
            temporalScore,
          },
        };
      })
      .sort((a, b) => (b.metadata.compositeScore || 0) - (a.metadata.compositeScore || 0));
  }

  calculateOptimalTokenAllocation(
    conversationLength: number,
    memoryCount: number,
    maxTokens: number,
    model: string
  ): { conversation: number; memory: number; response: number } {
    const modelLimit = this.tokenCounter.getModelTokenLimit(model);
    const effectiveLimit = Math.min(maxTokens, modelLimit);
    
    // Reserve tokens for response (25% of limit)
    const responseTokens = Math.floor(effectiveLimit * 0.25);
    const availableTokens = effectiveLimit - responseTokens;
    
    // Dynamic allocation based on content
    let conversationRatio = 0.7;
    let memoryRatio = 0.3;
    
    // Adjust ratios based on content characteristics
    if (memoryCount === 0) {
      conversationRatio = 1.0;
      memoryRatio = 0.0;
    } else if (conversationLength < 5) {
      // Short conversations - allocate more to memory
      conversationRatio = 0.5;
      memoryRatio = 0.5;
    } else if (memoryCount > 20) {
      // Many memories - allocate more to memory
      conversationRatio = 0.6;
      memoryRatio = 0.4;
    }
    
    return {
      conversation: Math.floor(availableTokens * conversationRatio),
      memory: Math.floor(availableTokens * memoryRatio),
      response: responseTokens,
    };
  }

  /**
   * Advanced optimization using PrioritySorter for intelligent content selection
   */
  async optimizeContextWithPriority(
    messages: Message[],
    memories: MemoryChunk[],
    query: string,
    maxTokens: number,
    context?: {
      queryType?: 'factual' | 'conversational' | 'creative' | 'analytical';
      timeRange?: 'recent' | 'historical' | 'mixed';
      contentType?: 'technical' | 'general' | 'personal';
    }
  ): Promise<OptimizationResult> {
    const originalTokens = this.tokenCounter.countTokens(
      messages.map(m => ({ role: m.role, content: m.content }))
    );
    const memoryTokens = this.tokenCounter.countTokens(
      memories.map(m => ({ role: 'system', content: m.content }))
    );
    const totalTokens = originalTokens + memoryTokens;

    if (totalTokens <= maxTokens) {
      // No optimization needed
      const enhancedMessages = this.addMemoriesToContextFromChunks(
        messages.map(m => ({ role: m.role, content: m.content })),
        memories
      );
      return {
        messages: enhancedMessages,
        wasOptimized: false,
        originalTokens: totalTokens,
        optimizedTokens: this.tokenCounter.countTokens(enhancedMessages),
        compressionRatio: 1.0,
        strategy: 'no_optimization',
        memoriesIncluded: memories.length,
      };
    }

    // Calculate dynamic weights based on context
    const priorityConfig = context ? 
      this.prioritySorter.calculateDynamicWeights([], context) : 
      undefined;

    // Sort messages and memories by priority
    const prioritizedMessages = this.prioritySorter.sortMessagesByPriority(messages, query, priorityConfig);
    const prioritizedMemories = this.prioritySorter.sortMemoriesByPriority(memories, query, priorityConfig);

    // Optimize content selection based on token budget
    const allPriorityItems = [...prioritizedMessages, ...prioritizedMemories];
    const selectedItems = this.prioritySorter.optimizeContentSelection(
      allPriorityItems,
      maxTokens,
      ['message'] // Preserve messages over memories when space is tight
    );

    // Separate selected messages and memories
    const selectedMessages = selectedItems
      .filter(item => item.type === 'message')
      .sort((a, b) => (a.metadata.originalIndex || 0) - (b.metadata.originalIndex || 0))
      .map(item => ({
        role: item.metadata.role || 'user',
        content: item.content,
      }));

    const selectedMemoryItems = selectedItems.filter(item => item.type === 'memory');
    const selectedMemoryChunks = selectedMemoryItems.map(item => {
      const originalMemory = memories.find(m => m.id === item.id);
      return originalMemory!;
    });

    // Combine optimized content
    const optimizedMessages = this.addMemoriesToContextFromChunks(selectedMessages, selectedMemoryChunks);
    const optimizedTokens = this.tokenCounter.countTokens(optimizedMessages);

    return {
      messages: optimizedMessages,
      wasOptimized: true,
      originalTokens: totalTokens,
      optimizedTokens,
      compressionRatio: selectedMemoryChunks.length / Math.max(memories.length, 1),
      strategy: 'priority_based_optimization',
      memoriesIncluded: selectedMemoryChunks.length,
    };
  }

  private addMemoriesToContextFromChunks(
    messages: Array<{ role: string; content: string }>,
    memories: MemoryChunk[]
  ): Array<{ role: string; content: string }> {
    if (memories.length === 0) {
      return messages;
    }

    // Find system messages and insert memories after them
    const systemMessages = messages.filter(m => m.role === 'system');
    const otherMessages = messages.filter(m => m.role !== 'system');

    // Create memory context from chunks
    const memoryContext = this.formatMemoryChunksAsContext(memories);
    const memoryMessage = {
      role: 'system',
      content: memoryContext,
    };

    return [...systemMessages, memoryMessage, ...otherMessages];
  }

  private formatMemoryChunksAsContext(memories: MemoryChunk[]): string {
    if (memories.length === 0) {
      return '';
    }

    const formattedMemories = memories
      .sort((a, b) => (b.similarity || 0) - (a.similarity || 0)) // Sort by relevance
      .map((memory, index) => {
        const timestamp = memory.createdAt ? 
          memory.createdAt.toLocaleString() : 
          'Unknown time';
        
        const relevance = memory.similarity ? memory.similarity.toFixed(2) : 'N/A';
        const importance = memory.importance ? memory.importance.toFixed(2) : 'N/A';
        
        return `[Memory ${index + 1}] (Relevance: ${relevance}, Importance: ${importance}, Time: ${timestamp})\n${memory.content}`;
      })
      .join('\n\n');

    return `Relevant conversation history and context:\n\n${formattedMemories}\n\nPlease use this context to provide more informed and personalized responses.`;
  }

  /**
   * Analyze optimization performance
   */
  analyzeOptimization(result: OptimizationResult): {
    tokenSavings: number;
    compressionEfficiency: number;
    strategyEffectiveness: string;
    recommendations: string[];
  } {
    const tokenSavings = result.originalTokens - result.optimizedTokens;
    const compressionEfficiency = tokenSavings / result.originalTokens;
    
    let strategyEffectiveness = 'good';
    const recommendations: string[] = [];
    
    if (compressionEfficiency < 0.1) {
      strategyEffectiveness = 'poor';
      recommendations.push('Consider more aggressive optimization strategies');
    } else if (compressionEfficiency > 0.5) {
      strategyEffectiveness = 'excellent';
      recommendations.push('Current optimization is highly effective');
    }
    
    if (result.memoriesIncluded === 0) {
      recommendations.push('No memories included - consider increasing memory token allocation');
    }
    
    if (result.compressionRatio < 0.3) {
      recommendations.push('Low memory retention - consider improving memory filtering');
    }
    
    return {
      tokenSavings,
      compressionEfficiency,
      strategyEffectiveness,
      recommendations,
    };
  }

  healthCheck(): boolean {
    try {
      // Test basic optimization functionality
      const testMessages = [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there!' },
      ];
      
      const testMemories: VectorSearchResult[] = [
        {
          id: 'test',
          content: 'Test memory',
          embedding: [],
          score: 0.8,
          metadata: {},
        },
      ];

      // Test token allocation calculation
      const allocation = this.calculateOptimalTokenAllocation(3, 1, 4096, 'gpt-3.5-turbo');
      
      // Test priority sorter health
      const priorityHealth = this.prioritySorter.healthCheck();
      
      return allocation.conversation > 0 && 
             allocation.memory > 0 && 
             allocation.response > 0 && 
             priorityHealth.status === 'healthy';
    } catch (error) {
      console.error('Context optimizer health check failed:', error);
      return false;
    }
  }
}