import axios from 'axios';
import { Response } from 'express';
import { ChatCompletionRequest, ChatCompletionResponse } from '../../shared/types';
import { config } from '../config';

interface StreamingCallbacks {
  onComplete?: (fullResponse: string) => Promise<void>;
  onError?: (error: any) => void;
}

export class LLMAdapter {
  private openaiBaseUrl = 'https://api.openai.com/v1';
  private anthropicBaseUrl = 'https://api.anthropic.com/v1';
  private googleBaseUrl = 'https://generativelanguage.googleapis.com/v1beta';

  async forwardRequest(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const provider = this.detectProvider(request.model);
    
    switch (provider) {
      case 'openai':
        return this.forwardToOpenAI(request);
      case 'anthropic':
        return this.forwardToAnthropic(request);
      case 'google':
        return this.forwardToGoogle(request);
      default:
        throw new Error(`Unsupported model: ${request.model}`);
    }
  }

  async forwardStreamingRequest(
    request: ChatCompletionRequest,
    res: Response,
    callbacks: StreamingCallbacks = {}
  ): Promise<void> {
    const provider = this.detectProvider(request.model);
    
    switch (provider) {
      case 'openai':
        return this.streamFromOpenAI(request, res, callbacks);
      case 'anthropic':
        return this.streamFromAnthropic(request, res, callbacks);
      case 'google':
        return this.streamFromGoogle(request, res, callbacks);
      default:
        throw new Error(`Unsupported model for streaming: ${request.model}`);
    }
  }

  private detectProvider(model: string): 'openai' | 'anthropic' | 'google' {
    if (model.startsWith('gpt-') || model.startsWith('text-') || model.startsWith('davinci')) {
      return 'openai';
    }
    if (model.startsWith('claude-')) {
      return 'anthropic';
    }
    if (model.startsWith('gemini-') || model.startsWith('palm-')) {
      return 'google';
    }
    
    // Default to OpenAI for unknown models
    return 'openai';
  }

  private async forwardToOpenAI(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    if (!config.llm.openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const response = await axios.post(
        `${this.openaiBaseUrl}/chat/completions`,
        {
          model: request.model,
          messages: request.messages,
          temperature: request.temperature,
          max_tokens: request.maxTokens,
          stream: false,
        },
        {
          headers: {
            'Authorization': `Bearer ${config.llm.openaiApiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return this.normalizeOpenAIResponse(response.data);
    } catch (error: any) {
      console.error('OpenAI API error:', error.response?.data || error.message);
      throw error;
    }
  }

  private async forwardToAnthropic(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    if (!config.llm.anthropicApiKey) {
      throw new Error('Anthropic API key not configured');
    }

    try {
      // Convert OpenAI format to Anthropic format
      const anthropicMessages = this.convertToAnthropicFormat(request.messages);
      
      const response = await axios.post(
        `${this.anthropicBaseUrl}/messages`,
        {
          model: request.model,
          messages: anthropicMessages.messages,
          system: anthropicMessages.system,
          max_tokens: request.maxTokens || 4096,
          temperature: request.temperature,
        },
        {
          headers: {
            'x-api-key': config.llm.anthropicApiKey,
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01',
          },
        }
      );

      return this.normalizeAnthropicResponse(response.data, request.model);
    } catch (error: any) {
      console.error('Anthropic API error:', error.response?.data || error.message);
      throw error;
    }
  }

  private async forwardToGoogle(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    if (!config.llm.googleApiKey) {
      throw new Error('Google API key not configured');
    }

    try {
      // Convert OpenAI format to Google format
      const googleRequest = this.convertToGoogleFormat(request);
      
      const response = await axios.post(
        `${this.googleBaseUrl}/models/${request.model}:generateContent?key=${config.llm.googleApiKey}`,
        googleRequest,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      return this.normalizeGoogleResponse(response.data, request.model);
    } catch (error: any) {
      console.error('Google API error:', error.response?.data || error.message);
      throw error;
    }
  }

  private async streamFromOpenAI(
    request: ChatCompletionRequest,
    res: Response,
    callbacks: StreamingCallbacks
  ): Promise<void> {
    if (!config.llm.openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const response = await axios.post(
        `${this.openaiBaseUrl}/chat/completions`,
        {
          model: request.model,
          messages: request.messages,
          temperature: request.temperature,
          max_tokens: request.maxTokens,
          stream: true,
        },
        {
          headers: {
            'Authorization': `Bearer ${config.llm.openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          responseType: 'stream',
        }
      );

      let fullResponse = '';

      response.data.on('data', (chunk: Buffer) => {
        const lines = chunk.toString().split('\n').filter(line => line.trim());
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              res.write('data: [DONE]\n\n');
              if (callbacks.onComplete) {
                callbacks.onComplete(fullResponse);
              }
              res.end();
              return;
            }
            
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                fullResponse += content;
              }
              res.write(`data: ${data}\n\n`);
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      });

      response.data.on('error', (error: any) => {
        console.error('OpenAI streaming error:', error);
        if (callbacks.onError) {
          callbacks.onError(error);
        }
        res.end();
      });
    } catch (error: any) {
      console.error('OpenAI streaming setup error:', error);
      throw error;
    }
  }

  private async streamFromAnthropic(
    request: ChatCompletionRequest,
    res: Response,
    callbacks: StreamingCallbacks
  ): Promise<void> {
    // Anthropic streaming implementation would go here
    // For now, fall back to non-streaming
    const response = await this.forwardToAnthropic(request);
    res.write(`data: ${JSON.stringify(response)}\n\n`);
    res.write('data: [DONE]\n\n');
    
    if (callbacks.onComplete) {
      await callbacks.onComplete(response.choices[0].message.content);
    }
    
    res.end();
  }

  private async streamFromGoogle(
    request: ChatCompletionRequest,
    res: Response,
    callbacks: StreamingCallbacks
  ): Promise<void> {
    // Google streaming implementation would go here
    // For now, fall back to non-streaming
    const response = await this.forwardToGoogle(request);
    res.write(`data: ${JSON.stringify(response)}\n\n`);
    res.write('data: [DONE]\n\n');
    
    if (callbacks.onComplete) {
      await callbacks.onComplete(response.choices[0].message.content);
    }
    
    res.end();
  }

  private normalizeOpenAIResponse(data: any): ChatCompletionResponse {
    return {
      id: data.id,
      object: data.object,
      created: data.created,
      model: data.model,
      choices: data.choices,
      usage: data.usage,
      memoryInfo: {
        memoriesUsed: 0,
        contextOptimized: false,
        sessionId: '',
      },
    };
  }

  private normalizeAnthropicResponse(data: any, model: string): ChatCompletionResponse {
    return {
      id: data.id || `chatcmpl-${Date.now()}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model,
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: data.content[0]?.text || '',
          },
          finishReason: data.stop_reason || 'stop',
        },
      ],
      usage: {
        promptTokens: data.usage?.input_tokens || 0,
        completionTokens: data.usage?.output_tokens || 0,
        totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
      },
      memoryInfo: {
        memoriesUsed: 0,
        contextOptimized: false,
        sessionId: '',
      },
    };
  }

  private normalizeGoogleResponse(data: any, model: string): ChatCompletionResponse {
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    return {
      id: `chatcmpl-${Date.now()}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model,
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content,
          },
          finishReason: 'stop',
        },
      ],
      usage: {
        promptTokens: data.usageMetadata?.promptTokenCount || 0,
        completionTokens: data.usageMetadata?.candidatesTokenCount || 0,
        totalTokens: data.usageMetadata?.totalTokenCount || 0,
      },
      memoryInfo: {
        memoriesUsed: 0,
        contextOptimized: false,
        sessionId: '',
      },
    };
  }

  private convertToAnthropicFormat(messages: any[]) {
    const systemMessages = messages.filter(m => m.role === 'system');
    const conversationMessages = messages.filter(m => m.role !== 'system');
    
    return {
      system: systemMessages.map(m => m.content).join('\n'),
      messages: conversationMessages,
    };
  }

  private convertToGoogleFormat(request: ChatCompletionRequest) {
    const contents = request.messages.map(message => ({
      role: message.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: message.content }],
    }));

    return {
      contents,
      generationConfig: {
        temperature: request.temperature,
        maxOutputTokens: request.maxTokens,
      },
    };
  }

  async healthCheck(): Promise<boolean> {
    try {
      // Check if at least one LLM provider is configured
      const hasProvider = config.llm.openaiApiKey || config.llm.anthropicApiKey || config.llm.googleApiKey;
      return !!hasProvider;
    } catch (error) {
      console.error('LLM adapter health check failed:', error);
      return false;
    }
  }
}