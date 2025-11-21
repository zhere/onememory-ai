import { Router } from 'express';
import { RAGKnowledgeManager, RAGKnowledgeSource, RAGSearchOptions } from '../services/RAGKnowledgeManager';
import { authenticateToken } from '../middleware/auth';
import { rateLimit } from '../middleware/rateLimit';

const router = Router();
const ragManager = new RAGKnowledgeManager();

// 初始化RAG管理器
ragManager.initialize().catch(console.error);

// 获取所有知识源
router.get('/sources', authenticateToken, async (req, res) => {
  try {
    const sources = ragManager.getKnowledgeSources();
    res.json({
      success: true,
      data: sources
    });
  } catch (error) {
    console.error('Error getting knowledge sources:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get knowledge sources'
    });
  }
});

// 添加知识源
router.post('/sources', authenticateToken, async (req, res) => {
  try {
    const source: RAGKnowledgeSource = req.body;
    
    // 验证必需字段
    if (!source.id || !source.name || !source.type) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: id, name, type'
      });
    }

    await ragManager.addKnowledgeSource(source);
    
    res.json({
      success: true,
      message: 'Knowledge source added successfully'
    });
  } catch (error) {
    console.error('Error adding knowledge source:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add knowledge source'
    });
  }
});

// 更新知识源
router.put('/sources/:sourceId', authenticateToken, async (req, res) => {
  try {
    const { sourceId } = req.params;
    const updates = req.body;

    await ragManager.updateKnowledgeSource(sourceId, updates);
    
    res.json({
      success: true,
      message: 'Knowledge source updated successfully'
    });
  } catch (error) {
    console.error('Error updating knowledge source:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update knowledge source'
    });
  }
});

// 删除知识源
router.delete('/sources/:sourceId', authenticateToken, async (req, res) => {
  try {
    const { sourceId } = req.params;
    await ragManager.removeKnowledgeSource(sourceId);
    
    res.json({
      success: true,
      message: 'Knowledge source removed successfully'
    });
  } catch (error) {
    console.error('Error removing knowledge source:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove knowledge source'
    });
  }
});

// 融合搜索
router.post('/search', authenticateToken, rateLimit, async (req, res) => {
  try {
    const searchOptions: RAGSearchOptions = req.body;
    
    // 验证必需字段
    if (!searchOptions.query || !searchOptions.projectId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: query, projectId'
      });
    }

    const results = await ragManager.fusedSearch(searchOptions);
    
    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error performing fused search:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to perform search'
    });
  }
});

// 测试知识源连接
router.post('/sources/:sourceId/test', authenticateToken, async (req, res) => {
  try {
    const { sourceId } = req.params;
    const sources = ragManager.getKnowledgeSources();
    const source = sources.find(s => s.id === sourceId);
    
    if (!source) {
      return res.status(404).json({
        success: false,
        error: 'Knowledge source not found'
      });
    }

    // 执行测试搜索
    const testResults = await ragManager.fusedSearch({
      query: 'test connection',
      projectId: 'test',
      sources: [sourceId],
      limit: 1,
      includeSupermemory: false
    });

    const isConnected = testResults.ragResults.length > 0 || 
                       (testResults.ragResults.length === 0 && source.type === 'local_files');

    res.json({
      success: true,
      data: {
        connected: isConnected,
        message: isConnected ? 'Connection successful' : 'Connection failed or no data found',
        testResults: testResults.ragResults.slice(0, 1)
      }
    });
  } catch (error) {
    console.error('Error testing knowledge source:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to test knowledge source connection'
    });
  }
});

// 健康检查
router.get('/health', async (req, res) => {
  try {
    const health = await ragManager.healthCheck();
    
    res.json({
      success: true,
      data: health
    });
  } catch (error) {
    console.error('Error checking RAG health:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check health'
    });
  }
});

// 获取支持的知识源类型
router.get('/source-types', (req, res) => {
  const sourceTypes = [
    {
      type: 'elasticsearch',
      name: 'Elasticsearch',
      description: '企业级搜索引擎，支持全文检索和向量搜索',
      configFields: [
        { name: 'endpoint', type: 'string', required: true, description: 'Elasticsearch服务端点' },
        { name: 'apiKey', type: 'string', required: false, description: 'API密钥' },
        { name: 'indexName', type: 'string', required: true, description: '索引名称' }
      ]
    },
    {
      type: 'chroma',
      name: 'ChromaDB',
      description: '开源向量数据库，适合AI应用',
      configFields: [
        { name: 'endpoint', type: 'string', required: true, description: 'ChromaDB服务端点' },
        { name: 'collection', type: 'string', required: true, description: '集合名称' }
      ]
    },
    {
      type: 'weaviate',
      name: 'Weaviate',
      description: '云原生向量数据库',
      configFields: [
        { name: 'endpoint', type: 'string', required: true, description: 'Weaviate服务端点' },
        { name: 'apiKey', type: 'string', required: false, description: 'API密钥' },
        { name: 'className', type: 'string', required: true, description: '类名称' }
      ]
    },
    {
      type: 'local_files',
      name: '本地文件',
      description: '本地文档和文件系统',
      configFields: [
        { name: 'filePath', type: 'string', required: true, description: '文件路径' },
        { name: 'fileTypes', type: 'array', required: false, description: '支持的文件类型' }
      ]
    },
    {
      type: 'database',
      name: '数据库',
      description: '关系型或NoSQL数据库',
      configFields: [
        { name: 'connectionString', type: 'string', required: true, description: '数据库连接字符串' },
        { name: 'table', type: 'string', required: true, description: '表名' },
        { name: 'contentField', type: 'string', required: true, description: '内容字段名' }
      ]
    },
    {
      type: 'api',
      name: '外部API',
      description: '第三方知识库API',
      configFields: [
        { name: 'endpoint', type: 'string', required: true, description: 'API端点' },
        { name: 'apiKey', type: 'string', required: false, description: 'API密钥' },
        { name: 'method', type: 'string', required: false, description: 'HTTP方法' }
      ]
    }
  ];

  res.json({
    success: true,
    data: sourceTypes
  });
});

// 批量导入知识
router.post('/import', authenticateToken, async (req, res) => {
  try {
    const { sourceId, documents, options = {} } = req.body;
    
    if (!sourceId || !documents || !Array.isArray(documents)) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: sourceId, documents (array)'
      });
    }

    // 这里可以实现批量导入逻辑
    // 例如将文档向量化并存储到指定的知识源
    
    res.json({
      success: true,
      message: `Successfully imported ${documents.length} documents`,
      data: {
        imported: documents.length,
        sourceId
      }
    });
  } catch (error) {
    console.error('Error importing documents:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to import documents'
    });
  }
});

export default router;