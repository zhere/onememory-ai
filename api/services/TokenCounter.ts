import { Message, TokenUsageLog } from '../../shared/types';

export class TokenCounter {
  private modelTokenLimits: Record<string, number> = {
    'gpt-4': 8192,
    'gpt-4-32k': 32768,
    'gpt-4-turbo': 128000,
    'gpt-3.5-turbo': 4096,
    'gpt-3.5-turbo-16k': 16384,
    'claude-3-opus': 200000,
    'claude-3-sonnet': 200000,
    'claude-3-haiku': 200000,
    'claude-2': 100000,
    'gemini-pro': 32768,
    'gemini-pro-vision': 16384,
  };

  private averageTokensPerChar = 0.25; // Rough approximation

  countTokens(messages: Array<{ role: string; content: string }>): number {
    let totalTokens = 0;

    for (const message of messages) {
      // Base tokens for message structure
      totalTokens += 4; // role, content, name, function_call overhead
      
      // Content tokens (approximation)
      totalTokens += this.estimateTokensFromText(message.content);
      
      // Role tokens
      totalTokens += this.estimateTokensFromText(message.role);
    }

    // Add overhead for conversation structure
    totalTokens += 2;

    return Math.ceil(totalTokens);
  }

  countSingleMessageTokens(content: string): number {
    return this.estimateTokensFromText(content);
  }

  getModelTokenLimit(model: string): number {
    return this.modelTokenLimits[model] || 4096;
  }

  calculateRemainingTokens(
    messages: Array<{ role: string; content: string }>,
    model: string,
    reservedTokens: number = 500
  ): number {
    const usedTokens = this.countTokens(messages);
    const modelLimit = this.getModelTokenLimit(model);
    return Math.max(0, modelLimit - usedTokens - reservedTokens);
  }

  estimateResponseTokens(
    messages: Array<{ role: string; content: string }>,
    model: string,
    maxTokens?: number
  ): number {
    const modelLimit = this.getModelTokenLimit(model);
    const usedTokens = this.countTokens(messages);
    const availableTokens = modelLimit - usedTokens;
    
    if (maxTokens) {
      return Math.min(maxTokens, availableTokens);
    }
    
    // Default to 25% of available tokens for response
    return Math.floor(availableTokens * 0.25);
  }

  analyzeTokenDistribution(messages: Array<{ role: string; content: string }>) {
    const distribution = {
      total: 0,
      byRole: {} as Record<string, number>,
      byMessage: [] as Array<{ index: number; role: string; tokens: number; content: string }>,
      overhead: 0,
    };

    messages.forEach((message, index) => {
      const messageTokens = this.estimateTokensFromText(message.content);
      const roleTokens = this.estimateTokensFromText(message.role);
      const messageOverhead = 4;
      
      const totalMessageTokens = messageTokens + roleTokens + messageOverhead;
      
      distribution.total += totalMessageTokens;
      distribution.byRole[message.role] = (distribution.byRole[message.role] || 0) + totalMessageTokens;
      distribution.byMessage.push({
        index,
        role: message.role,
        tokens: totalMessageTokens,
        content: message.content.substring(0, 100) + (message.content.length > 100 ? '...' : ''),
      });
      distribution.overhead += messageOverhead;
    });

    // Add conversation overhead
    distribution.overhead += 2;
    distribution.total += 2;

    return distribution;
  }

  optimizeTokenUsage(
    messages: Array<{ role: string; content: string }>,
    targetTokens: number,
    preserveRecent: number = 2
  ): Array<{ role: string; content: string }> {
    const currentTokens = this.countTokens(messages);
    
    if (currentTokens <= targetTokens) {
      return messages;
    }

    // Always preserve system messages and recent messages
    const systemMessages = messages.filter(m => m.role === 'system');
    const recentMessages = messages.slice(-preserveRecent);
    const middleMessages = messages.slice(systemMessages.length, -preserveRecent);

    let optimizedMessages = [...systemMessages, ...recentMessages];
    let currentOptimizedTokens = this.countTokens(optimizedMessages);

    // Add middle messages from most recent backwards until we hit the limit
    for (let i = middleMessages.length - 1; i >= 0; i--) {
      const testMessages = [...systemMessages, ...middleMessages.slice(i), ...recentMessages];
      const testTokens = this.countTokens(testMessages);
      
      if (testTokens <= targetTokens) {
        optimizedMessages = testMessages;
        currentOptimizedTokens = testTokens;
      } else {
        break;
      }
    }

    return optimizedMessages;
  }

  createTokenUsageLog(
    userId: string,
    projectId: string,
    conversationId: string,
    inputTokens: number,
    outputTokens: number,
    memoryTokens: number = 0,
    compressionRatio: number = 1.0,
    optimizationStrategy?: string
  ): TokenUsageLog {
    return {
      id: `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      projectId,
      conversationId,
      inputTokens,
      outputTokens,
      memoryTokens,
      compressedTokens: Math.floor(memoryTokens * compressionRatio),
      compressionRatio,
      optimizationStrategy,
      createdAt: new Date(),
    };
  }

  calculateTokenCost(
    inputTokens: number,
    outputTokens: number,
    model: string
  ): number {
    // Token pricing (per 1K tokens) - these are example prices
    const pricing: Record<string, { input: number; output: number }> = {
      'gpt-4': { input: 0.03, output: 0.06 },
      'gpt-4-32k': { input: 0.06, output: 0.12 },
      'gpt-4-turbo': { input: 0.01, output: 0.03 },
      'gpt-3.5-turbo': { input: 0.0015, output: 0.002 },
      'gpt-3.5-turbo-16k': { input: 0.003, output: 0.004 },
      'claude-3-opus': { input: 0.015, output: 0.075 },
      'claude-3-sonnet': { input: 0.003, output: 0.015 },
      'claude-3-haiku': { input: 0.00025, output: 0.00125 },
      'gemini-pro': { input: 0.0005, output: 0.0015 },
    };

    const modelPricing = pricing[model] || { input: 0.001, output: 0.002 };
    
    const inputCost = (inputTokens / 1000) * modelPricing.input;
    const outputCost = (outputTokens / 1000) * modelPricing.output;
    
    return inputCost + outputCost;
  }

  private estimateTokensFromText(text: string): number {
    if (!text) return 0;
    
    // More sophisticated token estimation
    // This is a simplified version - in production, you'd use tiktoken or similar
    
    // Count words and characters
    const words = text.split(/\s+/).filter(word => word.length > 0);
    const chars = text.length;
    
    // Estimate based on multiple factors
    const wordBasedEstimate = words.length * 1.3; // Average 1.3 tokens per word
    const charBasedEstimate = chars * this.averageTokensPerChar;
    
    // Use the higher estimate to be conservative
    return Math.ceil(Math.max(wordBasedEstimate, charBasedEstimate));
  }

  healthCheck(): boolean {
    try {
      // Test basic functionality
      const testMessages = [
        { role: 'user', content: 'Hello, how are you?' },
        { role: 'assistant', content: 'I am doing well, thank you!' },
      ];
      
      const tokens = this.countTokens(testMessages);
      return tokens > 0 && tokens < 1000; // Sanity check
    } catch (error) {
      console.error('Token counter health check failed:', error);
      return false;
    }
  }

  // Batch processing for multiple conversations
  batchCountTokens(
    conversations: Array<Array<{ role: string; content: string }>>
  ): Array<{ tokens: number; distribution: any }> {
    return conversations.map(messages => ({
      tokens: this.countTokens(messages),
      distribution: this.analyzeTokenDistribution(messages),
    }));
  }

  // Get token statistics for a project
  getTokenStatistics(tokenLogs: TokenUsageLog[]) {
    const stats = {
      totalInputTokens: 0,
      totalOutputTokens: 0,
      totalMemoryTokens: 0,
      totalCost: 0,
      averageCompressionRatio: 0,
      conversationCount: tokenLogs.length,
      modelUsage: {} as Record<string, number>,
    };

    tokenLogs.forEach(log => {
      stats.totalInputTokens += log.inputTokens;
      stats.totalOutputTokens += log.outputTokens;
      stats.totalMemoryTokens += log.memoryTokens;
      stats.averageCompressionRatio += log.compressionRatio;
    });

    if (tokenLogs.length > 0) {
      stats.averageCompressionRatio /= tokenLogs.length;
    }

    return stats;
  }
}