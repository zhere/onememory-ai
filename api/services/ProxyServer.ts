import { Request, Response } from 'express';
import axios from 'axios';
import { ChatCompletionRequest, ChatCompletionResponse, ApiError } from '../../shared/types';
import { MemoryManager } from './MemoryManager';
import { TokenCounter } from './TokenCounter';
import { ContextOptimizer } from './ContextOptimizer';
import { LLMAdapter } from './LLMAdapter';
import { config } from '../config';

export class ProxyServer {
  private memoryManager: MemoryManager;
  private tokenCounter: TokenCounter;
  private contextOptimizer: ContextOptimizer;
  private llmAdapter: LLMAdapter;

  constructor() {
    this.memoryManager = new MemoryManager();
    this.tokenCounter = new TokenCounter();
    this.contextOptimizer = new ContextOptimizer();
    this.llmAdapter = new LLMAdapter();
  }

  async handleChatCompletion(req: Request, res: Response): Promise<void> {
    try {
      const requestBody: ChatCompletionRequest = req.body;
      const projectId = (req as any).project?.id || 'default';
      const sessionId = this.generateSessionId(req);

      // Validate request
      this.validateChatRequest(requestBody);

      // Extract conversation context
      const userMessage = requestBody.messages[requestBody.messages.length - 1];
      const conversationHistory = requestBody.messages.slice(0, -1);

      // Retrieve relevant memories
      const relevantMemories = await this.memoryManager.retrieveRelevantMemories({
        projectId,
        sessionId,
        query: userMessage.content,
        limit: 10,
        threshold: requestBody.memoryConfig?.relevanceThreshold || 0.7,
      });

      // Count tokens for context optimization
      const baseTokens = this.tokenCounter.countTokens(requestBody.messages);
      const memoryTokens = this.tokenCounter.countTokens(relevantMemories.map(m => ({ role: 'system', content: m.content })));

      // Optimize context if needed
      const optimizedContext = await this.contextOptimizer.optimizeContext({
        messages: requestBody.messages,
        memories: relevantMemories,
        maxTokens: requestBody.maxTokens || 4096,
        model: requestBody.model,
      });

      // Prepare enhanced request
      const enhancedRequest: ChatCompletionRequest = {
        ...requestBody,
        messages: optimizedContext.messages,
      };

      // Forward to appropriate LLM
      const response = await this.llmAdapter.forwardRequest(enhancedRequest);

      // Store conversation in memory
      await this.memoryManager.storeConversation({
        projectId,
        sessionId,
        userMessage: userMessage.content,
        assistantMessage: response.choices[0].message.content,
        metadata: {
          model: requestBody.model,
          tokenUsage: response.usage,
          memoriesUsed: relevantMemories.length,
          contextOptimized: optimizedContext.wasOptimized,
        },
      });

      // Enhance response with memory info
      const enhancedResponse: ChatCompletionResponse = {
        ...response,
        memoryInfo: {
          memoriesUsed: relevantMemories.length,
          contextOptimized: optimizedContext.wasOptimized,
          sessionId,
        },
      };

      res.json(enhancedResponse);
    } catch (error) {
      console.error('Proxy error:', error);
      this.handleProxyError(error, res);
    }
  }

  async handleStreamingCompletion(req: Request, res: Response): Promise<void> {
    try {
      const requestBody: ChatCompletionRequest = req.body;
      const projectId = (req as any).project?.id || 'default';
      const sessionId = this.generateSessionId(req);

      // Validate request
      this.validateChatRequest(requestBody);

      // Set up streaming headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('Access-Control-Allow-Origin', '*');

      // Process similar to regular completion but stream response
      const userMessage = requestBody.messages[requestBody.messages.length - 1];
      
      const relevantMemories = await this.memoryManager.retrieveRelevantMemories({
        projectId,
        sessionId,
        query: userMessage.content,
        limit: 10,
        threshold: requestBody.memoryConfig?.relevanceThreshold || 0.7,
      });

      const optimizedContext = await this.contextOptimizer.optimizeContext({
        messages: requestBody.messages,
        memories: relevantMemories,
        maxTokens: requestBody.maxTokens || 4096,
        model: requestBody.model,
      });

      const enhancedRequest: ChatCompletionRequest = {
        ...requestBody,
        messages: optimizedContext.messages,
        stream: true,
      };

      // Stream response from LLM
      await this.llmAdapter.forwardStreamingRequest(enhancedRequest, res, {
        onComplete: async (fullResponse: string) => {
          // Store conversation after streaming completes
          await this.memoryManager.storeConversation({
            projectId,
            sessionId,
            userMessage: userMessage.content,
            assistantMessage: fullResponse,
            metadata: {
              model: requestBody.model,
              memoriesUsed: relevantMemories.length,
              contextOptimized: optimizedContext.wasOptimized,
              streaming: true,
            },
          });
        },
      });
    } catch (error) {
      console.error('Streaming proxy error:', error);
      res.write(`data: ${JSON.stringify({ error: 'Streaming failed' })}\n\n`);
      res.end();
    }
  }

  private validateChatRequest(request: ChatCompletionRequest): void {
    if (!request.model) {
      throw new Error('Model is required');
    }

    if (!request.messages || !Array.isArray(request.messages) || request.messages.length === 0) {
      throw new Error('Messages array is required and cannot be empty');
    }

    const lastMessage = request.messages[request.messages.length - 1];
    if (lastMessage.role !== 'user') {
      throw new Error('Last message must be from user');
    }

    // Validate message structure
    for (const message of request.messages) {
      if (!message.role || !message.content) {
        throw new Error('Each message must have role and content');
      }
      if (!['user', 'assistant', 'system'].includes(message.role)) {
        throw new Error('Invalid message role');
      }
    }
  }

  private generateSessionId(req: Request): string {
    // Generate session ID based on request headers or create new one
    const sessionHeader = req.headers['x-session-id'] as string;
    if (sessionHeader) {
      return sessionHeader;
    }

    // Generate new session ID
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private handleProxyError(error: any, res: Response): void {
    let statusCode = 500;
    let apiError: ApiError = {
      code: 'PROXY_ERROR',
      message: 'Internal proxy error',
    };

    if (error.response) {
      // Error from upstream LLM API
      statusCode = error.response.status;
      apiError = {
        code: 'UPSTREAM_ERROR',
        message: error.response.data?.error?.message || 'Upstream API error',
        details: error.response.data,
      };
    } else if (error.message) {
      // Validation or other known errors
      statusCode = 400;
      apiError = {
        code: 'VALIDATION_ERROR',
        message: error.message,
      };
    }

    res.status(statusCode).json({ error: apiError });
  }

  async healthCheck(): Promise<{ status: string; services: Record<string, boolean> }> {
    const services = {
      memory: await this.memoryManager.healthCheck(),
      llm: await this.llmAdapter.healthCheck(),
      tokenCounter: this.tokenCounter.healthCheck(),
      contextOptimizer: this.contextOptimizer.healthCheck(),
    };

    const allHealthy = Object.values(services).every(status => status);

    return {
      status: allHealthy ? 'healthy' : 'degraded',
      services,
    };
  }
}