import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { rateLimit } from '../middleware/rateLimit';
import { EnhancedChatService, EnhancedChatRequest } from '../services/EnhancedChatService';

const router = Router();
const chatService = new EnhancedChatService();

// 初始化聊天服务
chatService.initialize().catch(console.error);

// 增强聊天完成接口
router.post('/completions', authenticateToken, rateLimit, async (req, res) => {
  try {
    const chatRequest: EnhancedChatRequest = req.body;
    
    // 验证必需字段
    if (!chatRequest.messages || !Array.isArray(chatRequest.messages) || chatRequest.messages.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Messages array is required and cannot be empty'
      });
    }

    if (!chatRequest.projectId) {
      return res.status(400).json({
        success: false,
        error: 'projectId is required'
      });
    }

    // 处理聊天请求
    const response = await chatService.processChat(chatRequest);
    
    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Enhanced chat error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process chat request'
    });
  }
});

// 获取可用模型
router.get('/models', async (req, res) => {
  try {
    const models = await chatService.getAvailableModels();
    
    res.json({
      success: true,
      data: models
    });
  } catch (error) {
    console.error('Error getting models:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get available models'
    });
  }
});

// 健康检查
router.get('/health', async (req, res) => {
  try {
    const health = await chatService.healthCheck();
    
    res.json({
      success: true,
      data: health
    });
  } catch (error) {
    console.error('Enhanced chat health check error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check service health'
    });
  }
});

// 聊天配置接口
router.get('/config', authenticateToken, async (req, res) => {
  try {
    const config = {
      supportedModels: await chatService.getAvailableModels(),
      features: {
        memory: true,
        rag: true,
        streaming: false, // 暂时不支持
        contextOptimization: true
      },
      limits: {
        maxTokens: 4096,
        maxContextTokens: 4000,
        maxMessages: 50
      },
      ragOptions: {
        supportedSources: ['elasticsearch', 'chroma', 'weaviate', 'local_files', 'database', 'api'],
        fusionStrategies: ['weighted', 'ranked', 'hybrid'],
        defaultThreshold: 0.7,
        defaultLimit: 5
      }
    };

    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Error getting chat config:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get chat configuration'
    });
  }
});

// 测试RAG融合功能
router.post('/test-rag', authenticateToken, async (req, res) => {
  try {
    const { query, projectId, ragOptions = {} } = req.body;
    
    if (!query || !projectId) {
      return res.status(400).json({
        success: false,
        error: 'query and projectId are required'
      });
    }

    // 创建测试聊天请求
    const testRequest: EnhancedChatRequest = {
      messages: [
        {
          role: 'user',
          content: query
        }
      ],
      projectId,
      useMemory: true,
      useRAG: true,
      ragOptions: {
        threshold: 0.5,
        limit: 3,
        fusionStrategy: 'hybrid',
        ...ragOptions
      }
    };

    const response = await chatService.processChat(testRequest);
    
    res.json({
      success: true,
      data: {
        response: response.choices[0]?.message?.content || '',
        metadata: response.metadata,
        usage: response.usage
      }
    });
  } catch (error) {
    console.error('RAG test error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to test RAG functionality'
    });
  }
});

export default router;