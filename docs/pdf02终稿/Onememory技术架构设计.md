# Onememory 技术架构设计

## 1. 架构设计

### 1.1 整体架构概述

Onememory 是一个基于时序记忆架构的智能记忆系统，通过RAG（Retrieval-Augmented Generation）技术增强，实现多源知识的智能融合检索。系统采用**双引擎架构**，将时序记忆与外部知识库无缝融合，为用户提供更加智能和个性化的交互体验。

RAG技术作为Onememory的核心增强模块，深度集成到记忆检索流程中，形成智能融合检索能力，大幅提升回答的准确性和全面性。

```mermaid
graph TD
    A[用户请求] --> B[API网关]
    B --> C[认证服务]
    C --> D[Onememory核心服务]
    
    D --> E[时序记忆引擎]
    D --> F[RAG增强引擎]
    D --> G[上下文优化器]
    
    E --> H[Zep Graphiti]
    E --> I[记忆向量库]
    
    F --> J[知识源管理]
    F --> K[融合检索引擎]
    F --> L[外部知识库]
    
    K --> M[Elasticsearch]
    K --> N[Chroma DB]
    K --> O[Weaviate]
    K --> P[本地文件]
    
    G --> Q[OpenAI API]
    Q --> R[用户响应]
    
    style D fill:#f9f,stroke:#333,stroke-width:4px
    style E fill:#bbf,stroke:#333,stroke-width:2px
    style F fill:#bfb,stroke:#333,stroke-width:2px
```

### 1.2 核心功能流程

#### 1.2.1 智能聊天流程

```mermaid
sequenceDiagram
    participant 用户
    participant API
    participant 融合引擎
    participant 记忆引擎
    participant RAG引擎
    participant LLM
    
    用户->>API: 发送聊天请求
    API->>融合引擎: 解析请求参数
    
    par 并行检索
        融合引擎->>记忆引擎: 检索相关记忆
        融合引擎->>RAG引擎: 检索外部知识
    end
    
    记忆引擎-->>融合引擎: 返回记忆结果
    RAG引擎-->>融合引擎: 返回知识结果
    
    融合引擎->>融合引擎: 智能融合排序
    融合引擎->>LLM: 发送优化上下文
    LLM-->>融合引擎: 生成响应
    融合引擎-->>API: 返回增强响应
    API-->>用户: 返回最终结果
```

#### 1.2.2 记忆存储流程

```mermaid
sequenceDiagram
    participant 用户
    participant API
    participant 分段服务
    participant 向量服务
    participant 记忆服务
    participant 图谱引擎
    
    用户->>API: 发送对话内容
    API->>分段服务: 智能分段处理
    分段服务->>向量服务: 生成向量表示
    向量服务-->>分段服务: 返回向量
    分段服务-->>API: 返回分段结果
    
    API->>记忆服务: 存储记忆片段
    记忆服务->>图谱引擎: 构建关系图谱
    图谱引擎->>图谱引擎: 时序关系推理
    图谱引擎-->>记忆服务: 更新关系
    记忆服务-->>API: 存储完成
    API-->>用户: 确认存储
```

### 1.3 RAG增强功能

#### 1.3.1 融合检索策略

Onememory的RAG功能不是独立系统，而是深度集成到记忆检索中的增强模块：

**智能融合算法**

```typescript
interface FusionStrategy {
  memoryWeight: number;      // 记忆权重 (0.6-0.8)
  ragWeight: number;         // RAG权重 (0.2-0.4)
  timeDecay: number;         // 时间衰减因子
  relevanceBoost: number;    // 相关性提升
}
```

**检索流程**

1. **查询理解**: 分析用户意图和查询类型
2. **并行检索**: 同时搜索记忆库和外部知识库
3. **结果融合**: 基于权重和时效性智能融合
4. **质量评估**: 评估融合结果的相关性
5. **上下文优化**: 动态调整上下文长度和质量

#### 1.3.2 知识源管理

**支持的源类型**

* **Elasticsearch**: 企业文档和日志

* **Chroma DB**: 向量化的知识库

* **Weaviate**: 语义知识图谱

* **本地文件**: Markdown、PDF、TXT等

* **API接口**: 第三方知识服务

**配置管理**

```typescript
interface KnowledgeSource {
  id: string;
  name: string;
  type: 'elasticsearch' | 'chroma' | 'weaviate' | 'local' | 'api';
  config: {
    endpoint: string;
    credentials: object;
    index?: string;
    collection?: string;
  };
  priority: number;      // 1-10，影响融合权重
  enabled: boolean;
  lastSync: Date;
}
```

## 2. 技术描述

### 2.1 核心技术栈

Onememory基于以下核心技术栈构建：

* **前端**: React + TypeScript + Tailwind CSS + Vite

* **后端**: Node.js + Express + TypeScript

* **数据库**: PostgreSQL + Redis + 向量数据库

* **嵌入服务**: OpenAI text-embedding-3-small

* **AI模型**: OpenAI GPT系列

* **部署**: Docker + Docker Compose

#### 2.1.1 双引擎架构

**时序记忆引擎**: 基于Zep Graphiti的时序记忆管理，提供记忆连贯性和时序推理能力

**RAG增强引擎**: 深度集成的外部知识检索，支持多源知识融合

**上下文优化器**: 智能排序和Token优化，提升响应质量

### 2.2 Zep时序记忆架构

Onememory采用**Zep Graphiti时序知识图谱**，构建智能记忆系统：

**核心功能**

* **时序实体管理**: 自动提取和跟踪实体的时间演化

* **动态关系推理**: 基于时间序列的关系强度计算

* **跨会话记忆合成**: 智能合并多会话信息，保持长期上下文连贯性

**架构优势**

* **卓越性能**: 在DMR和LongMemEval基准测试中表现优异

* **时序感知**: 原生支持时间维度的记忆管理

* **动态整合**: 实时整合多源知识，减少冗余检索

* **成本优化**: 降低Token使用量和延迟

### 2.3 RAG增强引擎

RAG增强引擎深度集成到系统的检索流程中：

**融合检索引擎核心**

* **智能融合算法**: 基于语义相似度和时序关联的混合检索策略

* **并行检索优化**: 同时搜索时序记忆库和外部知识库

* **质量评估体系**: 多维度相关性评分和时效性评估

**多源知识适配器**

* **支持的知识源类型**: Elasticsearch、Chroma DB、Weaviate、本地文件系统、外部API接口

* **统一接入层**: 标准化的知识源配置接口

**知识源管理器**

* **生命周期管理**: 知识源的注册、更新、删除操作

* **优先级和权重系统**: 可配置的知识源优先级和动态权重调整

## 3. 路由定义

### 3.1 核心代理API

#### 3.1.1 智能聊天接口

```http
POST /api/v1/chat
Content-Type: application/json
Authorization: Bearer your-api-key

{
  "message": "如何优化数据库性能？",
  "sessionId": "session_123",
  "includeMemory": true,
  "includeRag": true
}
```

响应示例:

```json
{
  "choices": [{
    "message": {
      "role": "assistant",
      "content": "基于您的历史学习和外部知识库，我为您找到了相关内容..."
    }
  }],
  "metadata": {
    "memoryUsed": true,
    "ragUsed": true,
    "sourcesUsed": ["memory", "docs", "wiki"],
    "contextSources": [
      {"type": "memory", "source": "历史对话", "score": 0.95},
      {"type": "rag", "source": "技术文档", "score": 0.87}
    ]
  }
}
```

### 3.2 知识管理接口

#### 3.2.1 添加知识源

```http
POST /api/v1/knowledge/sources
Content-Type: application/json

{
  "name": "技术文档库",
  "type": "elasticsearch",
  "config": {
    "endpoint": "http://localhost:9200",
    "index": "tech_docs",
    "apiKey": "xxx"
  },
  "priority": 8
}
```

#### 3.2.2 检索知识

```http
POST /api/v1/knowledge/search
Content-Type: application/json

{
  "query": "机器学习算法",
  "sources": ["tech_docs", "wiki"],
  "limit": 10,
  "includeMemory": true
}
```

### 3.3 记忆管理接口

#### 3.3.1 存储记忆

```http
POST /api/v1/memory/store
Content-Type: application/json

{
  "sessionId": "session_123",
  "content": "用户提到正在学习机器学习",
  "metadata": {
    "type": "learning",
    "topic": "机器学习"
  }
}
```

#### 3.3.2 检索记忆

```http
POST /api/v1/memory/retrieve
Content-Type: application/json

{
  "query": "机器学习",
  "sessionId": "session_123",
  "limit": 5
}
```

### 4.2 Zep时序记忆管理API详细示例

#### 4.2.1 时序实体管理API示例

**获取实体时间线**

```http
GET /v1/memory/entities/timeline?entity_id=user_zhang_san
Authorization: Bearer your-api-key
```

响应示例:

```json
{
  "entity": {
    "id": "user_zhang_san",
    "type": "person",
    "name": "张三",
    "current_state": {
      "role": "高级产品经理",
      "company": "科技公司",
      "skills": ["AI", "产品设计", "用户体验", "机器学习"]
    }
  },
  "timeline": [
    {
      "timestamp": "2024-01-15T10:30:00Z",
      "event_type": "role_change",
      "description": "晋升为高级产品经理",
      "confidence": 0.95
    },
    {
      "timestamp": "2024-01-14T15:20:00Z",
      "event_type": "skill_acquisition",
      "description": "学习机器学习技能",
      "confidence": 0.88
    }
  ],
  "relationships": [
    {
      "target_entity": "ai_project",
      "relation_type": "manages",
      "strength": 0.9,
      "temporal_pattern": "increasing"
    }
  ]
}
```

**跟踪实体变化**

```http
PUT /v1/memory/entities/track
Content-Type: application/json
Authorization: Bearer your-api-key

{
  "entity_id": "user_zhang_san",
  "changes": {
    "role": "高级产品经理",
    "new_skills": ["数据分析"],
    "project_involvement": "AI产品开发"
  },
  "timestamp": "2024-01-15T11:00:00Z",
  "confidence": 0.92
}
```

#### 4.2.2 动态关系推理API示例

**推理新关系**

```http
POST /v1/memory/relationships/infer
Content-Type: application/json
Authorization: Bearer your-api-key

{
  "context": {
    "conversation_id": "conv_123",
    "new_message": "我们讨论的AI项目预算是多少？"
  },
  "inference_params": {
    "temporal_window": "7d",
    "confidence_threshold": 0.7,
    "max_relationships": 10
  }
}
```

响应示例:

```json
{
  "inferred_relationships": [
    {
      "source_entity": "user_zhang_san",
      "target_entity": "ai_project_budget",
      "relation_type": "inquires_about",
      "confidence": 0.92,
      "temporal_context": "2024-01-15T09:15:00Z",
      "supporting_evidence": [
        "直接询问预算信息",
        "历史上多次关注成本问题"
      ]
    },
    {
      "source_entity": "ai_project",
      "target_entity": "budget_constraint",
      "relation_type": "has_constraint",
      "confidence": 0.85,
      "temporal_context": "2024-01-15T09:20:00Z",
      "causal_chain": ["项目需求", "资源限制", "预算约束"]
    }
  ],
  "temporal_patterns": {
    "budget_discussions": {
      "frequency": "weekly",
      "trend": "increasing",
      "peak_times": ["Monday morning", "Friday afternoon"]
    }
  }
}
```

#### 4.2.3 跨会话记忆合成API示例

**合成会话信息**

```http
POST /v1/memory/cross-session/synthesize
Content-Type: application/json
Authorization: Bearer your-api-key

{
  "query": "AI项目的技术选型讨论",
  "synthesis_params": {
    "session_count": 5,
    "time_window": "30d",
    "coherence_threshold": 0.8,
    "include_temporal_evolution": true
  }
}
```

响应示例:

```json
{
  "synthesized_memory": {
    "topic": "AI项目技术选型",
    "evolution_timeline": [
      {
        "phase": "初期探索",
        "timeframe": "2024-01-01 to 2024-01-07",
        "key_decisions": [
          "考虑多种架构方案",
          "评估Transformer vs CNN"
        ],
        "confidence": 0.89
      },
      {
        "phase": "方案确定",
        "timeframe": "2024-01-08 to 2024-01-15",
        "key_decisions": [
          "选择Transformer架构",
          "确定使用预训练模型"
        ],
        "confidence": 0.94
      }
    ],
    "cross_session_insights": {
      "consistent_preferences": [
        "偏好开源解决方案",
        "重视性能和成本平衡"
      ],
      "evolving_requirements": [
        "从通用性转向专业化",
        "增加对实时性的要求"
      ]
    },
    "temporal_relationships": [
      {
        "entity1": "Transformer",
        "entity2": "performance_requirement",
        "relation_evolution": "strengthening",
        "confidence_trend": "increasing"
      }
    ]
  }
}
```

#### 4.2.4 性能优化API示例

**获取性能指标**

```http
GET /v1/performance/metrics
Authorization: Bearer your-api-key
```

响应示例:

```json
{
  "current_metrics": {
    "avg_response_time_ms": 150,
    "memory_usage_percent": 65,
    "cache_hit_rate": 0.85,
    "cost_per_query": 0.032,
    "throughput_qps": 120
  },
  "optimization_status": {
    "auto_tuning_enabled": true,
    "last_optimization": "2024-01-15T08:00:00Z",
    "next_optimization": "2024-01-15T20:00:00Z"
  },
  "recommendations": [
    {
      "type": "cache_optimization",
      "description": "增加缓存大小可提升15%性能",
      "impact": "medium",
      "effort": "low"
    }
  ]
}
```

### 4.3 RAG知识库融合API

#### 4.3.1 知识源管理API

**获取所有知识源**

```http
GET /v1/rag-knowledge/sources
Authorization: Bearer your-api-key
```

响应示例:

```json
{
  "success": true,
  "data": [
    {
      "id": "rag-001",
      "name": "企业文档库",
      "type": "elasticsearch",
      "status": "connected",
      "config": {
        "url": "https://es.example.com:9200",
        "index": "company_docs",
        "apiKey": "***"
      },
      "documentCount": 15420,
      "lastSync": "2024-01-15T10:30:00Z",
      "createdAt": "2024-01-01T00:00:00Z"
    },
    {
      "id": "rag-002",
      "name": "技术知识库",
      "type": "chroma",
      "status": "connected",
      "config": {
        "url": "http://chroma.example.com:8000",
        "collection": "tech_knowledge"
      },
      "documentCount": 8750,
      "lastSync": "2024-01-15T09:45:00Z",
      "createdAt": "2024-01-05T00:00:00Z"
    }
  ]
}
```

**添加知识源**

```http
POST /v1/rag-knowledge/sources
Authorization: Bearer your-api-key
Content-Type: application/json
```

请求参数:

| 参数名    | 参数类型   | 是否必需 | 描述                                                              |
| ------ | ------ | ---- | --------------------------------------------------------------- |
| name   | string | true | 知识源名称                                                           |
| type   | string | true | 知识源类型 (elasticsearch/chroma/weaviate/local\_files/database/api) |
| config | object | true | 知识源配置信息                                                         |

请求示例:

```json
{
  "name": "新文档库",
  "type": "elasticsearch",
  "config": {
    "url": "https://new-es.example.com:9200",
    "index": "new_docs",
    "apiKey": "your-api-key"
  }
}
```

**更新知识源**

```http
PUT /v1/rag-knowledge/sources/{sourceId}
Authorization: Bearer your-api-key
Content-Type: application/json
```

**删除知识源**

```http
DELETE /v1/rag-knowledge/sources/{sourceId}
Authorization: Bearer your-api-key
```

**测试知识源连接**

```http
POST /v1/rag-knowledge/sources/{sourceId}/test
Authorization: Bearer your-api-key
```

响应示例:

```json
{
  "success": true,
  "connected": true,
  "latency_ms": 45,
  "document_count": 15420,
  "last_test": "2024-01-15T11:00:00Z"
}
```

#### 4.3.2 融合搜索API

**执行融合搜索**

```http
POST /v1/rag-knowledge/search
Authorization: Bearer your-api-key
Content-Type: application/json
```

请求参数:

| 参数名             | 参数类型    | 是否必需  | 描述                |
| --------------- | ------- | ----- | ----------------- |
| query           | string  | true  | 搜索查询              |
| sources         | array   | false | 指定搜索的知识源ID列表      |
| limit           | number  | false | 返回结果数量限制 (默认10)   |
| threshold       | number  | false | 相似度阈值 (默认0.7)     |
| includeMetadata | boolean | false | 是否包含元数据 (默认false) |
| timeRange       | object  | false | 时间范围过滤            |

请求示例:

```json
{
  "query": "如何优化数据库性能",
  "sources": ["rag-001", "rag-002"],
  "limit": 15,
  "threshold": 0.75,
  "includeMetadata": true,
  "timeRange": {
    "start": "2024-01-01T00:00:00Z",
    "end": "2024-01-15T23:59:59Z"
  }
}
```

响应示例:

```json
{
  "success": true,
  "data": {
    "OnememoryResults": [
      {
        "id": "mem-001",
        "content": "之前讨论过数据库索引优化...",
        "score": 0.92,
        "source": "Onememory",
        "timestamp": "2024-01-10T14:30:00Z",
        "fusionScore": 0.95
      }
    ],
    "ragResults": [
      {
        "id": "doc-001",
        "content": "数据库性能优化最佳实践包括...",
        "score": 0.88,
        "source": "rag-001",
        "metadata": {
          "title": "数据库优化指南",
          "author": "技术团队",
          "category": "数据库"
        },
        "timestamp": "2024-01-05T10:00:00Z",
        "fusionScore": 0.89
      }
    ],
    "fusedResults": [
      {
        "id": "mem-001",
        "content": "之前讨论过数据库索引优化...",
        "score": 0.92,
        "source": "Onememory",
        "fusionScore": 0.95,
        "timestamp": "2024-01-10T14:30:00Z"
      },
      {
        "id": "doc-001",
        "content": "数据库性能优化最佳实践包括...",
        "score": 0.88,
        "source": "rag-001",
        "fusionScore": 0.89,
        "timestamp": "2024-01-05T10:00:00Z"
      }
    ],
    "searchMetrics": {
      "totalResults": 2,
      "searchTime_ms": 125,
      "sourcesSearched": ["Onememory", "rag-001", "rag-002"],
      "cacheHit": false
    }
  }
}
```

#### 4.3.3 增强聊天API

**增强聊天完成 (集成RAG)**

```http
POST /v1/chat/completions
Authorization: Bearer your-api-key
Content-Type: application/json
```

扩展的请求参数:

| 参数名        | 参数类型    | 是否必需  | 描述                 |
| ---------- | ------- | ----- | ------------------ |
| model      | string  | true  | LLM模型名称            |
| messages   | array   | true  | 对话消息数组             |
| useRAG     | boolean | false | 是否启用RAG融合 (默认true) |
| ragSources | array   | false | 指定使用的RAG知识源        |
| ragConfig  | object  | false | RAG配置参数            |

请求示例:

```json
{
  "model": "gpt-4",
  "messages": [
    {"role": "user", "content": "如何提升系统性能？"}
  ],
  "useRAG": true,
  "ragSources": ["rag-001", "rag-002"],
  "ragConfig": {
    "threshold": 0.75,
    "maxResults": 10,
    "includeMetadata": true
  },
  "memory_config": {
    "enable_memory": true,
    "temporal_graph": {
      "enabled": true,
      "time_window": "7d"
    }
  }
}
```

响应示例:

```json
{
  "id": "chatcmpl-rag123",
  "object": "chat.completion",
  "created": 1705312800,
  "model": "gpt-4",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "基于您的历史讨论和企业知识库，系统性能提升可以从以下几个方面入手..."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 280,
    "completion_tokens": 150,
    "total_tokens": 430,
    "memory_tokens": 80,
    "rag_tokens": 50
  },
  "memory_info": {
    "temporal_graph_updated": true,
    "entities_tracked": 5,
    "relationships_inferred": 3
  },
  "rag_info": {
    "sources_searched": ["Onememory", "rag-001", "rag-002"],
    "results_found": 8,
    "fusion_applied": true,
    "search_time_ms": 125
  }
}
```

**测试RAG功能**

```http
POST /v1/chat/test-rag
Authorization: Bearer your-api-key
Content-Type: application/json
```

请求示例:

```json
{
  "query": "测试查询",
  "sources": ["rag-001"]
}
```

响应示例:

```json
{
  "success": true,
  "data": {
    "query": "测试查询",
    "results": [
      {
        "id": "test-001",
        "content": "测试内容...",
        "score": 0.85,
        "source": "rag-001"
      }
    ],
    "performance": {
      "search_time_ms": 45,
      "total_results": 1
    }
  }
}
```

## 5. 服务器架构图

```mermaid
graph TD
    A[负载均衡器] --> B[API网关集群]
    B --> C[认证服务]
    B --> D[代理服务集群]
    
    D --> E[记忆检索服务]
    D --> F[上下文处理服务]
    D --> G[LLM调用服务]
    
    E --> H[向量搜索集群]
    F --> I[缓存集群]
    G --> J[外部LLM APIs]
    
    D --> K[异步任务队列]
    K --> L[记忆更新服务]
    L --> M[数据库集群]

    subgraph "入口层"
        A
        B
    end
    
    subgraph "服务层"
        C
        D
        E
        F
        G
    end
    
    subgraph "数据层"
        H
        I
        J
        K
        L
        M
    end
    
    style A fill:#f9f,stroke:#333,stroke-width:2px
    style B fill:#bbf,stroke:#333,stroke-width:2px
    style C fill:#bfb,stroke:#333,stroke-width:2px
    style D fill:#f96,stroke:#333,stroke-width:2px
    style E fill:#9f9,stroke:#333,stroke-width:2px
    style F fill:#99f,stroke:#333,stroke-width:2px
    style G fill:#f99,stroke:#333,stroke-width:2px
    style H fill:#ff9,stroke:#333,stroke-width:2px
    style I fill:#9ff,stroke:#333,stroke-width:2px
    style J fill:#f9f,stroke:#333,stroke-width:2px
    style K fill:#96f,stroke:#333,stroke-width:2px
    style L fill:#6f9,stroke:#333,stroke-width:2px
    style M fill:#f69,stroke:#333,stroke-width:2px
```

## 6. 前端架构设计

### 6.1 前端技术架构

#### 6.1.1 技术栈选择
系统前端采用现代化的React技术栈：

**核心技术**:
- **React 18**: 函数组件与Hooks架构
- **TypeScript**: 类型安全的开发体验
- **Vite**: 快速的构建工具与开发服务器
- **Tailwind CSS**: 实用优先的CSS框架
- **Zustand**: 轻量级状态管理库

**路由与导航**:
- **React Router v6**: 声明式路由管理
- **动态路由**: 支持参数化路由和嵌套路由
- **路由守卫**: 权限验证和访问控制

**UI组件架构**:
- **组件化设计**: 可复用的UI组件库
- **响应式布局**: 移动端优先的设计理念
- **无障碍访问**: 符合WCAG标准的可访问性

#### 6.1.2 状态管理架构

**Zustand状态管理**:
```typescript
// RAG状态管理接口
interface RAGState {
  // 知识源管理
  knowledgeSources: RAGKnowledgeSource[];
  selectedSources: string[];
  
  // 搜索配置
  fusionStrategy: FusionStrategy;
  searchQuery: string;
  
  // 搜索结果
  searchResults: RAGSearchResult[];
  searchLoading: boolean;
  searchError: string | null;
  
  // UI状态
  showAdvancedSettings: boolean;
  selectedProjectId: string;
  
  // 操作方法
  setKnowledgeSources: (sources: RAGKnowledgeSource[]) => void;
  addKnowledgeSource: (source: RAGKnowledgeSource) => void;
  updateKnowledgeSource: (id: string, updates: Partial<RAGKnowledgeSource>) => void;
  removeKnowledgeSource: (id: string) => void;
  
  // 搜索相关方法
  performSearch: (query?: string) => Promise<void>;
  refreshResults: () => Promise<void>;
  applyPresetStrategy: (preset: StrategyPreset) => void;
}
```

**状态持久化**:
- **localStorage集成**: 关键状态持久化存储
- **状态恢复**: 页面刷新后自动恢复状态
- **状态同步**: 多标签页状态同步机制

**状态分层**:
- **全局状态**: 应用级别的共享状态
- **局部状态**: 组件内部的私有状态
- **派生状态**: 基于其他状态计算得出的状态

### 6.2 前端架构组件

#### 6.2.1 页面组件架构

**知识源管理页面 (RAGKnowledgeSources)**:
```typescript
// 页面结构
const RAGKnowledgeSources: React.FC = () => {
  // 状态管理
  const { knowledgeSources, selectedProjectId, setSelectedProjectId } = useRAGStore();
  
  // 本地状态
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<KnowledgeSource | null>(null);
  
  // 表单状态
  const [formData, setFormData] = useState({
    name: '',
    type: 'elasticsearch',
    config: {},
    priority: 5,
    enabled: true,
    projectId: selectedProjectId
  });
  
  return (
    <div className="container mx-auto p-6">
      {/* 页面头部 */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">知识源管理</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          添加知识源
        </Button>
      </div>
      
      {/* 项目筛选 */}
      <ProjectFilter 
        selectedProjectId={selectedProjectId}
        onProjectChange={setSelectedProjectId}
      />
      
      {/* 统计卡片 */}
      <StatisticsCards sources={filteredSources} />
      
      {/* 知识源列表 */}
      <KnowledgeSourceList 
        sources={filteredSources}
        onEdit={setEditingSource}
        onDelete={handleDeleteSource}
      />
      
      {/* 添加/编辑对话框 */}
      <SourceDialog
        open={isAddDialogOpen || !!editingSource}
        onClose={handleCloseDialog}
        source={editingSource}
        onSave={handleSaveSource}
      />
    </div>
  );
};
```

**融合搜索配置页面 (FusionSearchConfig)**:
```typescript
// 配置页面结构
const FusionSearchConfig: React.FC = () => {
  const { fusionStrategy, setFusionStrategy, showAdvancedSettings } = useRAGStore();
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">融合搜索配置</h1>
      
      {/* 基础配置 */}
      <BasicConfig 
        strategy={fusionStrategy}
        onStrategyChange={setFusionStrategy}
      />
      
      {/* 高级设置 */}
      {showAdvancedSettings && (
        <AdvancedConfig 
          strategy={fusionStrategy}
          onStrategyChange={setFusionStrategy}
        />
      )}
      
      {/* 预设策略 */}
      <PresetStrategies 
        onApplyPreset={handleApplyPreset}
      />
      
      {/* 搜索结果预览 */}
      <SearchPreview 
        strategy={fusionStrategy}
      />
    </div>
  );
};
```

#### 6.2.2 核心组件设计

**通用组件架构**:
```typescript
// 可复用的UI组件
interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  onChange?: (value: any) => void;
  disabled?: boolean;
}

// 表单组件
const FormInput: React.FC<FormInputProps> = ({ label, value, onChange, ...props }) => {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <input 
        className="form-input"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        {...props}
      />
    </div>
  );
};

// 卡片组件
const Card: React.FC<CardProps> = ({ title, children, actions }) => {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">{title}</h3>
        {actions && <div className="card-actions">{actions}</div>}
      </div>
      <div className="card-body">{children}</div>
    </div>
  );
};
```

**业务组件架构**:
```typescript
// 知识源卡片组件
const KnowledgeSourceCard: React.FC<{ source: KnowledgeSource }> = ({ source }) => {
  const statusColors = {
    connected: 'text-green-600',
    disconnected: 'text-red-600',
    testing: 'text-yellow-600'
  };
  
  return (
    <Card 
      title={source.name}
      actions={
        <div className="flex gap-2">
          <Button variant="ghost" size="sm">编辑</Button>
          <Button variant="ghost" size="sm" className="text-red-600">删除</Button>
        </div>
      }
    >
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">类型:</span>
          <Badge>{source.type}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">状态:</span>
          <span className={`text-sm ${statusColors[source.status]}`}>
            {source.status}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">文档数:</span>
          <span className="text-sm">{source.documentCount}</span>
        </div>
      </div>
    </Card>
  );
};
```

### 6.3 数据流与状态管理

#### 6.3.1 组件数据流

**单向数据流**:
```typescript
// 父组件传递数据
const ParentComponent: React.FC = () => {
  const [data, setData] = useState([]);
  
  return (
    <ChildComponent 
      data={data}
      onDataChange={setData}
    />
  );
};

// 子组件接收并处理数据
const ChildComponent: React.FC<ChildProps> = ({ data, onDataChange }) => {
  const handleUpdate = (newData) => {
    onDataChange?.(newData);
  };
  
  return (
    <div>
      {data.map(item => (
        <ItemComponent 
          key={item.id}
          item={item}
          onUpdate={handleUpdate}
        />
      ))}
    </div>
  );
};
```

**状态提升模式**:
```typescript
// 共享状态管理
const SharedStateManager: React.FC = () => {
  const [sharedState, setSharedState] = useState({});
  
  return (
    <>
      <ComponentA 
        state={sharedState}
        setState={setSharedState}
      />
      <ComponentB 
        state={sharedState}
        setState={setSharedState}
      />
    </>
  );
};
```

#### 6.3.2 异步数据管理

**异步操作处理**:
```typescript
// 异步数据获取
const useAsyncData = (fetchFunction) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFunction(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchFunction]);
  
  return { data, loading, error, execute };
};

// 使用示例
const MyComponent: React.FC = () => {
  const { data, loading, error, execute } = useAsyncData(fetchKnowledgeSources);
  
  useEffect(() => {
    execute();
  }, [execute]);
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return <DataDisplay data={data} />;
};
```

### 6.5 新功能架构设计

#### 6.5.1 Token管理系统架构

**Token管理流程图**
```mermaid
sequenceDiagram
    participant 用户
    participant Token管理界面
    participant Token验证服务
    participant 权限管理系统
    participant 使用统计服务
    
    用户->>Token管理界面: 创建新Token
    Token管理界面->>Token验证服务: 验证用户权限
    Token验证服务->>权限管理系统: 检查权限级别
    权限管理系统-->>Token验证服务: 返回权限结果
    Token验证服务-->>Token管理界面: 验证通过
    Token管理界面->>Token验证服务: 生成Token
    Token验证服务-->>Token管理界面: 返回Token信息
    Token管理界面-->>用户: 显示Token详情
    
    用户->>Token管理界面: 使用Token调用API
    Token管理界面->>Token验证服务: 验证Token有效性
    Token验证服务->>使用统计服务: 记录使用情况
    使用统计服务-->>Token验证服务: 更新统计信息
    Token验证服务-->>用户: 返回API响应
```

**Token管理架构图**
```mermaid
graph TD
    A[Token管理界面] --> B[Token创建服务]
    A --> C[Token验证服务]
    A --> D[Token使用统计]
    
    B --> E[权限验证]
    B --> F[Token生成器]
    B --> G[Token存储]
    
    C --> H[Token解析]
    C --> I[有效期检查]
    C --> J[权限检查]
    
    D --> K[使用计数器]
    D --> L[调用频率统计]
    D --> M[使用日志记录]
    
    E --> N[用户权限系统]
    F --> O[加密服务]
    G --> P[Token数据库]
    
    style A fill:#e1f5fe
    style C fill:#f3e5f5
    style D fill:#e8f5e8
```

#### 6.5.2 分段配置系统架构

**文本分段处理流程图**
```mermaid
sequenceDiagram
    participant 配置界面
    participant 分段引擎
    participant 语义分析器
    participant 向量生成器
    participant 存储服务
    
    配置界面->>分段引擎: 提交分段配置
    分段引擎->>分段引擎: 验证配置参数
    分段引擎->>语义分析器: 分析文本结构
    语义分析器-->>分段引擎: 返回语义边界
    
    alt 语义分段策略
        分段引擎->>语义分析器: 计算语义相似度
        语义分析器-->>分段引擎: 返回分段建议
    else 固定大小策略
        分段引擎->>分段引擎: 按配置大小分段
    else 混合策略
        分段引擎->>语义分析器: 语义边界检测
        分段引擎->>分段引擎: 应用大小限制
    end
    
    分段引擎->>向量生成器: 生成段向量
    向量生成器-->>分段引擎: 返回向量表示
    分段引擎->>存储服务: 存储分段结果
    存储服务-->>配置界面: 确认存储完成
```

**分段配置架构图**
```mermaid
graph TD
    A[分段配置界面] --> B[配置验证服务]
    A --> C[分段策略引擎]
    A --> D[配置存储服务]
    
    C --> E[语义分析模块]
    C --> F[固定大小模块]
    C --> G[混合策略模块]
    C --> H[自适应模块]
    
    E --> I[语义相似度计算]
    E --> J[句子边界检测]
    E --> K[段落结构分析]
    
    F --> L[字符计数器]
    F --> M[标记计数器]
    F --> N[大小限制检查]
    
    G --> O[策略组合器]
    G --> P[优先级判断]
    G --> Q[冲突解决器]
    
    style A fill:#fff3e0
    style C fill:#e3f2fd
    style E fill:#f3e5f5
    style F fill:#e8f5e8
    style G fill:#fce4ec
```

#### 6.5.3 知识图谱可视化架构

**知识图谱渲染流程图**
```mermaid
sequenceDiagram
    participant 可视化界面
    participant 图谱数据服务
    participant 布局计算引擎
    participant 渲染引擎
    participant 交互处理器
    
    可视化界面->>图谱数据服务: 请求图谱数据
    图谱数据服务->>图谱数据服务: 查询实体和关系
    图谱数据服务-->>可视化界面: 返回图谱结构
    
    可视化界面->>布局计算引擎: 计算节点位置
    布局计算引擎->>布局计算引擎: 应用力导向算法
    布局计算引擎->>布局计算引擎: 优化布局密度
    布局计算引擎-->>可视化界面: 返回节点坐标
    
    可视化界面->>渲染引擎: 渲染图谱元素
    渲染引擎->>渲染引擎: 绘制节点
    渲染引擎->>渲染引擎: 绘制关系连线
    渲染引擎->>渲染引擎: 应用样式主题
    渲染引擎-->>可视化界面: 完成渲染
    
    用户->>交互处理器: 点击/拖拽操作
    交互处理器->>可视化界面: 更新视图状态
```

**知识图谱可视化架构图**
```mermaid
graph TD
    A[图谱可视化界面] --> B[数据获取服务]
    A --> C[布局计算引擎]
    A --> D[图形渲染引擎]
    A --> E[交互处理服务]
    
    B --> F[实体查询服务]
    B --> G[关系查询服务]
    B --> H[时序数据服务]
    
    C --> I[力导向布局]
    C --> J[层次布局]
    C --> K[圆形布局]
    C --> L[自定义布局]
    
    D --> M[SVG渲染器]
    D --> N[Canvas渲染器]
    D --> O[WebGL渲染器]
    
    E --> P[节点交互]
    E --> Q[关系交互]
    E --> R[视图控制]
    E --> S[动画效果]
    
    style A fill:#e8f5e8
    style C fill:#e3f2fd
    style D fill:#fff3e0
    style E fill:#f3e5f5
```

#### 6.5.4 记忆合成引擎架构

**跨会话记忆合成流程图**
```mermaid
sequenceDiagram
    participant 合成请求器
    participant 会话分析器
    participant 主题聚类器
    participant 冲突检测器
    participant 记忆生成器
    participant 存储服务
    
    合成请求器->>会话分析器: 请求合成记忆
    会话分析器->>会话分析器: 收集相关会话
    会话分析器->>会话分析器: 提取关键信息
    会话分析器-->>主题聚类器: 传递信息片段
    
    主题聚类器->>主题聚类器: 识别主题模式
    主题聚类器->>主题聚类器: 计算主题相关性
    主题聚类器-->>冲突检测器: 传递聚类结果
    
    冲突检测器->>冲突检测器: 检测信息冲突
    冲突检测器->>冲突检测器: 评估冲突严重性
    alt 存在冲突
        冲突检测器->>冲突检测器: 应用冲突解决策略
    end
    冲突检测器-->>记忆生成器: 传递清理后的信息
    
    记忆生成器->>记忆生成器: 生成合成记忆
    记忆生成器->>存储服务: 存储合成结果
    存储服务-->>合成请求器: 返回合成记忆
```

**记忆合成引擎架构图**
```mermaid
graph TD
    A[记忆合成请求] --> B[会话数据收集器]
    A --> C[主题分析引擎]
    A --> D[合成处理器]
    
    B --> E[会话历史查询]
    B --> F[时间窗口过滤]
    B --> G[相关性评分]
    
    C --> H[主题提取器]
    C --> I[聚类分析器]
    C --> J[重要性评估]
    
    D --> K[冲突检测器]
    D --> L[信息融合器]
    D --> M[记忆生成器]
    
    K --> N[矛盾识别]
    K --> O[重复检测]
    K --> P[时效性检查]
    
    L --> Q[信息合并]
    L --> R[权重计算]
    L --> S[置信度评估]
    
    style A fill:#fce4ec
    style C fill:#e3f2fd
    style D fill:#e8f5e8
```

#### 6.5.5 时序实体管理架构

**实体时间演化跟踪流程图**
```mermaid
sequenceDiagram
    participant 实体跟踪器
    participant 变化检测器
    participant 状态管理器
    participant 时间线生成器
    participant 演化分析器
    
    实体跟踪器->>变化检测器: 监控实体变化
    变化检测器->>变化检测器: 对比当前与历史状态
    alt 检测到变化
        变化检测器->>状态管理器: 记录状态变化
        状态管理器->>状态管理器: 验证变化有效性
        状态管理器->>时间线生成器: 更新时间线
    end
    
    时间线生成器->>时间线生成器: 构建时间序列
    时间线生成器->>演化分析器: 分析演化模式
    
    演化分析器->>演化分析器: 识别演化趋势
    演化分析器->>演化分析器: 预测未来状态
    演化分析器-->>实体跟踪器: 返回演化分析
```

**时序实体管理架构图**
```mermaid
graph TD
    A[实体状态变化] --> B[变化检测引擎]
    A --> C[状态记录服务]
    A --> D[时间线管理器]
    
    B --> E[属性对比器]
    B --> F[关系变化检测]
    B --> G[重要性评分]
    
    C --> H[状态版本控制]
    C --> I[历史状态存储]
    C --> J[状态快照生成]
    
    D --> K[时间序列构建]
    D --> L[演化模式识别]
    D --> M[趋势预测引擎]
    
    L --> N[周期性模式]
    L --> O[趋势性模式]
    L --> P[突发性模式]
    
    M --> Q[线性预测]
    M --> R[非线性预测]
    M --> S[机器学习预测]
    
    style A fill:#fff3e0
    style B fill:#e3f2fd
    style D fill:#e8f5e8
```

#### 6.5.6 关系推理引擎架构

**多维度关系推理流程图**
```mermaid
sequenceDiagram
    participant 推理请求器
    participant 直接推理器
    participant 间接推理器
    participant 时序推理器
    participant 因果推理器
    participant 结果整合器
    
    推理请求器->>直接推理器: 请求关系推理
    直接推理器->>直接推理器: 分析直接关系
    直接推理器-->>间接推理器: 传递推理基础
    
    间接推理器->>间接推理器: 寻找间接路径
    间接推理器->>间接推理器: 计算路径强度
    间接推理器-->>时序推理器: 传递路径信息
    
    时序推理器->>时序推理器: 分析时间先后关系
    时序推理器->>时序推理器: 识别时序模式
    时序推理器-->>因果推理器: 传递时序信息
    
    因果推理器->>因果推理器: 评估因果关系
    因果推理器->>因果推理器: 计算因果强度
    因果推理器-->>结果整合器: 传递推理结果
    
    结果整合器->>结果整合器: 整合多维推理
    结果整合器-->>推理请求器: 返回综合推理
```

**关系推理引擎架构图**
```mermaid
graph TD
    A[关系推理请求] --> B[直接关系推理]
    A --> C[间接关系推理]
    A --> D[时序关系推理]
    A --> E[因果关系推理]
    
    B --> F[直接关系识别]
    B --> G[关系强度计算]
    B --> H[关系类型分类]
    
    C --> I[路径发现算法]
    C --> J[路径强度计算]
    C --> K[多跳推理]
    
    D --> L[时间窗口分析]
    D --> M[时序模式识别]
    D --> N[演化趋势分析]
    
    E --> O[因果图构建]
    E --> P[因果强度评估]
    E --> Q[反事实推理]
    
    B --> R[结果整合器]
    C --> R
    D --> R
    E --> R
    
    style A fill:#f3e5f5
    style R fill:#e8f5e8
```

### 6.6 性能优化策略

#### 6.6.1 组件性能优化

**React.memo优化**:
```typescript
// 防止不必要的重渲染
const ExpensiveComponent = React.memo(({ data, onUpdate }) => {
  // 复杂计算或渲染逻辑
  return (
    <div>
      {/* 组件内容 */}
    </div>
  );
}, (prevProps, nextProps) => {
  // 自定义比较函数
  return prevProps.data.id === nextProps.data.id;
});
```

**useMemo和useCallback优化**:
```typescript
// 计算结果缓存
const ExpensiveComponent: React.FC = ({ items, filter }) => {
  const filteredItems = useMemo(() => {
    return items.filter(item => item.category === filter);
  }, [items, filter]);
  
  const handleItemClick = useCallback((item) => {
    // 处理点击事件
    console.log('Item clicked:', item);
  }, []);
  
  return (
    <div>
      {filteredItems.map(item => (
        <Item 
          key={item.id}
          item={item}
          onClick={handleItemClick}
        />
      ))}
    </div>
  );
};
```

#### 6.6.2 虚拟滚动优化

**大数据列表优化**:
```typescript
// 虚拟滚动实现
const VirtualList: React.FC<{ items: any[] }> = ({ items }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
  
  const itemHeight = 60;
  const containerHeight = 400;
  const visibleItemCount = Math.ceil(containerHeight / itemHeight);
  
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    const start = Math.floor(scrollTop / itemHeight);
    const end = start + visibleItemCount;
    
    setVisibleRange({ start, end });
  };
  
  const visibleItems = items.slice(visibleRange.start, visibleRange.end);
  
  return (
    <div 
      ref={containerRef}
      className="virtual-list-container"
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={handleScroll}
    >
      <div style={{ height: items.length * itemHeight }}>
        {visibleItems.map((item, index) => (
          <div 
            key={item.id}
            style={{
              position: 'absolute',
              top: (visibleRange.start + index) * itemHeight,
              height: itemHeight
            }}
          >
            {item.content}
          </div>
        ))}
      </div>
    </div>
  );
};
```

### 6.7 错误处理与监控

#### 6.7.1 错误边界处理

**错误边界组件**:
```typescript
class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // 发送错误报告到监控系统
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>出错了</h2>
          <details>
            <summary>错误详情</summary>
            <pre>{this.state.error?.stack}</pre>
          </details>
          <button onClick={() => this.setState({ hasError: false })}>
            重试
          </button>
        </div>
      );
    }
  
    return this.props.children;
  }
}
```

#### 6.7.2 前端监控集成

**性能监控**:
```typescript
// 性能指标收集
const collectPerformanceMetrics = () => {
  const navigation = performance.getEntriesByType('navigation')[0];
  const paint = performance.getEntriesByType('paint');
  
  return {
    navigationTiming: {
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      totalTime: navigation.loadEventEnd - navigation.fetchStart
    },
    paintTiming: {
      firstPaint: paint.find(entry => entry.name === 'first-paint')?.startTime,
      firstContentfulPaint: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime
    }
  };
};

// 错误监控
window.addEventListener('error', (event) => {
  const errorInfo = {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    timestamp: new Date().toISOString()
  };
  
  // 发送到监控系统
  sendToMonitoring('error', errorInfo);
});
```

---

**总结**: Onememory前端架构采用现代化的React技术栈，通过组件化设计、状态管理优化、性能提升策略和完善的错误处理机制，为用户提供了流畅、可靠的RAG知识源管理和融合搜索配置体验。架构设计充分考虑了可扩展性、可维护性和用户体验，为系统的长期发展奠定了坚实基础。

    subgraph "服务层"
        C
        D
        E
        F
        G
        L
    end

    subgraph "数据层"
        H
        I
        M
    end

    subgraph "队列层"
        K
    end
```

## 6.18 数据模型

### 6.18.1 数据模型定义

#### 6.18.1.1 核心实体关系图

```mermaid
erDiagram
    USER ||--o{ PROJECT : owns
    PROJECT ||--o{ CONVERSATION : contains
    CONVERSATION ||--o{ MESSAGE : includes
    MESSAGE ||--o{ MEMORY_CHUNK : generates
    PROJECT ||--o{ API_KEY : has
    PROJECT ||--o{ SEGMENTATION_CONFIG : configures
    PROJECT ||--o{ TOKEN_CONFIG : configures
    USER ||--o{ USAGE_LOG : generates
    USER ||--o{ TOKEN_USAGE_LOG : generates
    
    MEMORY_CHUNK ||--o{ TEMPORAL_ENTITY : "extracted from"
    TEMPORAL_ENTITY ||--o{ TEMPORAL_RELATION : "connected by"
    TEMPORAL_ENTITY }o--o{ GRAPHITI_GRAPH : "part of"
    GRAPHITI_GRAPH ||--o{ TEMPORAL_EVOLUTION : "evolves through"
    TEMPORAL_ENTITY ||--o{ ENTITY_TIMELINE : "has timeline"
    TEMPORAL_RELATION ||--o{ RELATION_TIMELINE : "has timeline"
    
    PROJECT ||--o{ RAG_KNOWLEDGE_SOURCE : configures
    RAG_KNOWLEDGE_SOURCE ||--o{ RAG_SEARCH_LOG : generates
    RAG_KNOWLEDGE_SOURCE ||--o{ RAG_SYNC_LOG : tracks
    MESSAGE ||--o{ RAG_SEARCH_RESULT : enhances
    RAG_SEARCH_RESULT }o--|| RAG_KNOWLEDGE_SOURCE : "sourced from"

    USER {
        uuid id PK
        string email
        string password_hash
        string name
        string plan
        timestamp created_at
        timestamp updated_at
    }
    
    PROJECT {
        uuid id PK
        uuid user_id FK
        string name
        string description
        json config
        string status
        timestamp created_at
        timestamp updated_at
    }
    
    CONVERSATION {
        uuid id PK
        uuid project_id FK
        string session_id
        json metadata
        timestamp created_at
        timestamp updated_at
    }
    
    MESSAGE {
        uuid id PK
        uuid conversation_id FK
        string role
        text content
        json metadata
        integer token_count
        timestamp created_at
    }
    
    MEMORY_CHUNK {
        uuid id PK
        uuid message_id FK
        text content
        vector embedding
        float relevance_score
        string chunk_type
        integer chunk_index
        json metadata
        timestamp created_at
    }
    
    TEMPORAL_ENTITY {
        uuid id PK
        uuid memory_chunk_id FK
        string entity_type
        string entity_name
        json entity_attributes
        vector entity_embedding
        float importance_score
        timestamp first_seen
        timestamp last_updated
        json temporal_context
        string entity_status
        timestamp created_at
        timestamp updated_at
    }
    
    TEMPORAL_RELATION {
        uuid id PK
        uuid source_entity_id FK
        uuid target_entity_id FK
        string relation_type
        float relation_strength
        json relation_metadata
        timestamp relation_start
        timestamp relation_end
        string relation_status
        float confidence_score
        timestamp created_at
        timestamp updated_at
    }
    
    GRAPHITI_GRAPH {
        uuid id PK
        uuid project_id FK
        string graph_name
        json temporal_structure
        integer entity_count
        integer relation_count
        timestamp temporal_window_start
        timestamp temporal_window_end
        json synthesis_metadata
        timestamp last_evolved
        timestamp created_at
        timestamp updated_at
    }
    
    TEMPORAL_EVOLUTION {
        uuid id PK
        uuid graph_id FK
        string evolution_type
        json before_state
        json after_state
        string evolution_reason
        timestamp evolution_time
        float confidence_score
        timestamp created_at
    }
    
    ENTITY_TIMELINE {
        uuid id PK
        uuid entity_id FK
        json timeline_events
        timestamp timeline_start
        timestamp timeline_end
        json evolution_pattern
        timestamp created_at
        timestamp updated_at
    }
    
    RELATION_TIMELINE {
        uuid id PK
        uuid relation_id FK
        json timeline_events
        timestamp timeline_start
        timestamp timeline_end
        json strength_evolution
        timestamp created_at
        timestamp updated_at
    }
    
    SEGMENTATION_CONFIG {
        uuid id PK
        uuid project_id FK
        integer max_chunk_size
        integer overlap_size
        string segmentation_strategy
        json embedding_config
        float similarity_threshold
        json weights_config
        timestamp created_at
        timestamp updated_at
    }
    
    TOKEN_CONFIG {
        uuid id PK
        uuid project_id FK
        integer max_context_tokens
        integer reserved_tokens
        json compression_config
        json priority_weights
        boolean auto_optimization
        timestamp created_at
        timestamp updated_at
    }
    
    TOKEN_USAGE_LOG {
        uuid id PK
        uuid user_id FK
        uuid project_id FK
        uuid conversation_id FK
        integer input_tokens
        integer output_tokens
        integer memory_tokens
        integer compressed_tokens
        float compression_ratio
        string optimization_strategy
        timestamp created_at
    }
    
    API_KEY {
        uuid id PK
        uuid project_id FK
        string key_hash
        string name
        json permissions
        timestamp expires_at
        timestamp created_at
    }
    
    USAGE_LOG {
        uuid id PK
        uuid user_id FK
        uuid project_id FK
        string endpoint
        integer tokens_used
        float cost
        timestamp created_at
    }
    
    RAG_KNOWLEDGE_SOURCE {
        uuid id PK
        uuid project_id FK
        string name
        string source_type
        json config
        string status
        integer document_count
        timestamp last_sync
        json sync_config
        json search_config
        timestamp created_at
        timestamp updated_at
    }
    
    RAG_SEARCH_LOG {
        uuid id PK
        uuid source_id FK
        uuid message_id FK
        string query
        json search_params
        integer results_count
        float search_time_ms
        json performance_metrics
        timestamp created_at
    }
    
    RAG_SYNC_LOG {
        uuid id PK
        uuid source_id FK
        string sync_type
        string sync_status
        integer documents_processed
        integer documents_added
        integer documents_updated
        integer documents_deleted
        json sync_metadata
        string error_message
        timestamp sync_start
        timestamp sync_end
        timestamp created_at
    }
    
    RAG_SEARCH_RESULT {
        uuid id PK
        uuid message_id FK
        uuid source_id FK
        string result_id
        text content
        float score
        float fusion_score
        json metadata
        string result_type
        timestamp result_timestamp
        timestamp created_at
    }
```

### 6.18.2 数据定义语言

**用户表 (users)**

```sql
-- 创建用户表
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    plan VARCHAR(20) DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_plan ON users(plan);
```

**项目表 (projects)**

```sql
-- 创建项目表
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    config JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'deleted')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
```

**对话表 (conversations)**

```sql
-- 创建对话表
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    session_id VARCHAR(255) NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_conversations_project_id ON conversations(project_id);
CREATE INDEX idx_conversations_session_id ON conversations(session_id);
CREATE INDEX idx_conversations_created_at ON conversations(created_at DESC);
```

**消息表 (messages)**

```sql
-- 创建消息表
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    token_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_token_count ON messages(token_count);
```

**记忆块表 (memory\_chunks)**

```sql
-- 创建记忆块表
CREATE TABLE memory_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    embedding VECTOR(1536), -- 使用pgvector扩展
    relevance_score FLOAT DEFAULT 0.0,
    chunk_type VARCHAR(50) DEFAULT 'semantic' CHECK (chunk_type IN ('semantic', 'paragraph', 'fixed', 'sliding')),
    chunk_index INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建向量索引
CREATE INDEX idx_memory_chunks_embedding ON memory_chunks USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_memory_chunks_message_id ON memory_chunks(message_id);
CREATE INDEX idx_memory_chunks_relevance_score ON memory_chunks(relevance_score DESC);
CREATE INDEX idx_memory_chunks_chunk_type ON memory_chunks(chunk_type);
CREATE INDEX idx_memory_chunks_chunk_index ON memory_chunks(chunk_index);
```

**分段配置表 (segmentation\_configs)**

```sql
-- 创建分段配置表
CREATE TABLE segmentation_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    max_chunk_size INTEGER DEFAULT 512,
    overlap_size INTEGER DEFAULT 50,
    segmentation_strategy VARCHAR(50) DEFAULT 'semantic' CHECK (segmentation_strategy IN ('semantic', 'paragraph', 'fixed', 'sliding', 'hybrid')),
    embedding_config JSONB DEFAULT '{"model": "text-embedding-3-small", "dimensions": 1536}',
    similarity_threshold FLOAT DEFAULT 0.7,
    weights_config JSONB DEFAULT '{"semantic": 0.4, "temporal": 0.3, "importance": 0.2, "position": 0.1}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_segmentation_configs_project_id ON segmentation_configs(project_id);
CREATE UNIQUE INDEX idx_segmentation_configs_project_unique ON segmentation_configs(project_id);
```

**Token配置表 (token\_configs)**

```sql
-- 创建Token配置表
CREATE TABLE token_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    max_context_tokens INTEGER DEFAULT 4096,
    reserved_tokens INTEGER DEFAULT 1000,
    compression_config JSONB DEFAULT '{"enable_compression": true, "compression_ratio": 0.7, "summary_model": "gpt-3.5-turbo"}',
    priority_weights JSONB DEFAULT '{"temporal": 0.3, "relevance": 0.4, "importance": 0.2, "user_preference": 0.1}',
    auto_optimization BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_token_configs_project_id ON token_configs(project_id);
CREATE UNIQUE INDEX idx_token_configs_project_unique ON token_configs(project_id);
```

**Token使用日志表 (token\_usage\_logs)**

```sql
-- 创建Token使用日志表
CREATE TABLE token_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
    input_tokens INTEGER DEFAULT 0,
    output_tokens INTEGER DEFAULT 0,
    memory_tokens INTEGER DEFAULT 0,
    compressed_tokens INTEGER DEFAULT 0,
    compression_ratio FLOAT DEFAULT 1.0,
    optimization_strategy VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_token_usage_logs_user_id ON token_usage_logs(user_id);
CREATE INDEX idx_token_usage_logs_project_id ON token_usage_logs(project_id);
CREATE INDEX idx_token_usage_logs_conversation_id ON token_usage_logs(conversation_id);
CREATE INDEX idx_token_usage_logs_created_at ON token_usage_logs(created_at DESC);

-- 创建分区表（按月分区）
CREATE TABLE token_usage_logs_y2024m01 PARTITION OF token_usage_logs
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

**API密钥表 (api\_keys)**

```sql
-- 创建API密钥表
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    key_hash VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    permissions JSONB DEFAULT '{}',
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_api_keys_project_id ON api_keys(project_id);
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);
```

**使用日志表 (usage\_logs)**

```sql
-- 创建使用日志表
CREATE TABLE usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    endpoint VARCHAR(255) NOT NULL,
    tokens_used INTEGER DEFAULT 0,
    cost FLOAT DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX idx_usage_logs_project_id ON usage_logs(project_id);
CREATE INDEX idx_usage_logs_endpoint ON usage_logs(endpoint);
CREATE INDEX idx_usage_logs_created_at ON usage_logs(created_at DESC);
```

#### 6.18.2.1 Mem0记忆架构数据表

**记忆实体表 (memory\_entities)**

```sql
-- 创建记忆实体表
CREATE TABLE memory_entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    memory_chunk_id UUID NOT NULL REFERENCES memory_chunks(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('person', 'organization', 'location', 'concept', 'event', 'topic')),
    entity_name VARCHAR(255) NOT NULL,
    entity_attributes JSONB DEFAULT '{}',
    entity_embedding VECTOR(1536),
    importance_score FLOAT DEFAULT 0.5,
    confidence_score FLOAT DEFAULT 0.8,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_memory_entities_chunk_id ON memory_entities(memory_chunk_id);
CREATE INDEX idx_memory_entities_type ON memory_entities(entity_type);
CREATE INDEX idx_memory_entities_name ON memory_entities(entity_name);
CREATE INDEX idx_memory_entities_embedding ON memory_entities USING ivfflat (entity_embedding vector_cosine_ops);
CREATE INDEX idx_memory_entities_importance ON memory_entities(importance_score DESC);
```

**记忆关系表 (memory\_relations)**

```sql
-- 创建记忆关系表
CREATE TABLE memory_relations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_entity_id UUID NOT NULL REFERENCES memory_entities(id) ON DELETE CASCADE,
    target_entity_id UUID NOT NULL REFERENCES memory_entities(id) ON DELETE CASCADE,
    relation_type VARCHAR(50) NOT NULL CHECK (relation_type IN ('related_to', 'part_of', 'causes', 'caused_by', 'similar_to', 'opposite_to', 'precedes', 'follows')),
    relation_strength FLOAT DEFAULT 0.5,
    relation_metadata JSONB DEFAULT '{}',
    temporal_validity JSONB DEFAULT '{"start": null, "end": null}',
    confidence_score FLOAT DEFAULT 0.8,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_memory_relations_source ON memory_relations(source_entity_id);
CREATE INDEX idx_memory_relations_target ON memory_relations(target_entity_id);
CREATE INDEX idx_memory_relations_type ON memory_relations(relation_type);
CREATE INDEX idx_memory_relations_strength ON memory_relations(relation_strength DESC);
CREATE INDEX idx_memory_relations_created_at ON memory_relations(created_at DESC);
-- 防止重复关系
CREATE UNIQUE INDEX idx_memory_relations_unique ON memory_relations(source_entity_id, target_entity_id, relation_type);
```

**知识图谱表 (knowledge\_graphs)**

```sql
-- 创建知识图谱表
CREATE TABLE knowledge_graphs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    graph_name VARCHAR(100) NOT NULL,
    graph_version INTEGER DEFAULT 1,
    graph_structure JSONB DEFAULT '{}',
    entity_count INTEGER DEFAULT 0,
    relation_count INTEGER DEFAULT 0,
    evolution_config JSONB DEFAULT '{"auto_evolve": true, "evolution_threshold": 0.7}',
    last_evolved TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_knowledge_graphs_project_id ON knowledge_graphs(project_id);
CREATE UNIQUE INDEX idx_knowledge_graphs_project_unique ON knowledge_graphs(project_id);
CREATE INDEX idx_knowledge_graphs_version ON knowledge_graphs(graph_version);
```

**图谱演化日志表 (graph\_evolution\_logs)**

```sql
-- 创建图谱演化日志表
CREATE TABLE graph_evolution_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    graph_id UUID NOT NULL REFERENCES knowledge_graphs(id) ON DELETE CASCADE,
    evolution_type VARCHAR(50) NOT NULL CHECK (evolution_type IN ('entity_added', 'entity_removed', 'relation_added', 'relation_removed', 'entity_updated', 'relation_updated', 'graph_restructured')),
    before_state JSONB,
    after_state JSONB,
    evolution_reason TEXT,
    impact_score FLOAT DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_graph_evolution_logs_graph_id ON graph_evolution_logs(graph_id);
CREATE INDEX idx_graph_evolution_logs_type ON graph_evolution_logs(evolution_type);
CREATE INDEX idx_graph_evolution_logs_created_at ON graph_evolution_logs(created_at DESC);
CREATE INDEX idx_graph_evolution_logs_impact ON graph_evolution_logs(impact_score DESC);
```

**初始化数据**

```sql
-- 插入示例用户
INSERT INTO users (email, password_hash, name, plan) VALUES
('admin@Onememory.ai', '$2b$10$example_hash', 'Admin User', 'enterprise'),
('demo@example.com', '$2b$10$example_hash', 'Demo User', 'pro');

-- 插入示例项目
INSERT INTO projects (user_id, name, description, config) VALUES
((SELECT id FROM users WHERE email = 'demo@example.com'), 
 'Demo Chat Bot', 
 'A demonstration chatbot with memory capabilities',
 '{"model": "gpt-4", "memory_depth": 10, "temperature": 0.7}');

-- 插入默认分段配置
INSERT INTO segmentation_configs (project_id, max_chunk_size, overlap_size, segmentation_strategy, similarity_threshold) VALUES
((SELECT id FROM projects WHERE name = 'Demo Chat Bot'),
 512, 50, 'semantic', 0.7);

-- 插入默认Token配置
INSERT INTO token_configs (project_id, max_context_tokens, reserved_tokens, auto_optimization) VALUES
((SELECT id FROM projects WHERE name = 'Demo Chat Bot'),
 4096, 1000, true);

-- 插入示例API密钥
INSERT INTO api_keys (project_id, key_hash, name, permissions) VALUES
((SELECT id FROM projects WHERE name = 'Demo Chat Bot'),
 '$2b$10$demo_api_key_hash',
 'Demo API Key',
 '{"read": true, "write": true, "admin": false}');
```

#### 6.18.2.2 RAG知识库融合数据表

**RAG知识源表 (rag\_knowledge\_sources)**

```sql
-- 创建RAG知识源表
CREATE TABLE rag_knowledge_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    source_type VARCHAR(50) NOT NULL CHECK (source_type IN ('elasticsearch', 'chroma', 'weaviate', 'local_files', 'database', 'api')),
    config JSONB NOT NULL DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'error', 'syncing')),
    document_count INTEGER DEFAULT 0,
    last_sync TIMESTAMP WITH TIME ZONE,
    sync_config JSONB DEFAULT '{"auto_sync": false, "sync_interval": "1h", "batch_size": 100}',
    search_config JSONB DEFAULT '{"max_results": 10, "threshold": 0.7, "boost_factor": 1.0}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_rag_knowledge_sources_project_id ON rag_knowledge_sources(project_id);
CREATE INDEX idx_rag_knowledge_sources_type ON rag_knowledge_sources(source_type);
CREATE INDEX idx_rag_knowledge_sources_status ON rag_knowledge_sources(status);
CREATE INDEX idx_rag_knowledge_sources_last_sync ON rag_knowledge_sources(last_sync DESC);
```

**RAG搜索日志表 (rag\_search\_logs)**

```sql
-- 创建RAG搜索日志表
CREATE TABLE rag_search_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID NOT NULL REFERENCES rag_knowledge_sources(id) ON DELETE CASCADE,
    message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
    query TEXT NOT NULL,
    search_params JSONB DEFAULT '{}',
    results_count INTEGER DEFAULT 0,
    search_time_ms FLOAT DEFAULT 0.0,
    performance_metrics JSONB DEFAULT '{}',
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_rag_search_logs_source_id ON rag_search_logs(source_id);
CREATE INDEX idx_rag_search_logs_message_id ON rag_search_logs(message_id);
CREATE INDEX idx_rag_search_logs_created_at ON rag_search_logs(created_at DESC);
CREATE INDEX idx_rag_search_logs_search_time ON rag_search_logs(search_time_ms);
CREATE INDEX idx_rag_search_logs_results_count ON rag_search_logs(results_count DESC);

-- 创建分区表（按月分区）
CREATE TABLE rag_search_logs_y2024m01 PARTITION OF rag_search_logs
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

**RAG同步日志表 (rag\_sync\_logs)**

```sql
-- 创建RAG同步日志表
CREATE TABLE rag_sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID NOT NULL REFERENCES rag_knowledge_sources(id) ON DELETE CASCADE,
    sync_type VARCHAR(50) NOT NULL CHECK (sync_type IN ('full', 'incremental', 'manual', 'scheduled')),
    sync_status VARCHAR(20) NOT NULL CHECK (sync_status IN ('running', 'completed', 'failed', 'cancelled')),
    documents_processed INTEGER DEFAULT 0,
    documents_added INTEGER DEFAULT 0,
    documents_updated INTEGER DEFAULT 0,
    documents_deleted INTEGER DEFAULT 0,
    sync_metadata JSONB DEFAULT '{}',
    error_message TEXT,
    sync_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sync_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_rag_sync_logs_source_id ON rag_sync_logs(source_id);
CREATE INDEX idx_rag_sync_logs_sync_type ON rag_sync_logs(sync_type);
CREATE INDEX idx_rag_sync_logs_sync_status ON rag_sync_logs(sync_status);
CREATE INDEX idx_rag_sync_logs_sync_start ON rag_sync_logs(sync_start DESC);
CREATE INDEX idx_rag_sync_logs_documents_processed ON rag_sync_logs(documents_processed DESC);
```

**RAG搜索结果表 (rag\_search\_results)**

```sql
-- 创建RAG搜索结果表
CREATE TABLE rag_search_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    source_id UUID NOT NULL REFERENCES rag_knowledge_sources(id) ON DELETE CASCADE,
    result_id VARCHAR(255) NOT NULL, -- 外部系统中的文档ID
    content TEXT NOT NULL,
    score FLOAT NOT NULL DEFAULT 0.0,
    fusion_score FLOAT NOT NULL DEFAULT 0.0,
    metadata JSONB DEFAULT '{}',
    result_type VARCHAR(50) DEFAULT 'document' CHECK (result_type IN ('document', 'chunk', 'entity', 'relation')),
    result_timestamp TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_rag_search_results_message_id ON rag_search_results(message_id);
CREATE INDEX idx_rag_search_results_source_id ON rag_search_results(source_id);
CREATE INDEX idx_rag_search_results_score ON rag_search_results(score DESC);
CREATE INDEX idx_rag_search_results_fusion_score ON rag_search_results(fusion_score DESC);
CREATE INDEX idx_rag_search_results_result_type ON rag_search_results(result_type);
CREATE INDEX idx_rag_search_results_created_at ON rag_search_results(created_at DESC);
-- 复合索引用于融合搜索
CREATE INDEX idx_rag_search_results_message_fusion ON rag_search_results(message_id, fusion_score DESC);
```

**RAG知识源连接测试表 (rag\_connection\_tests)**

```sql
-- 创建RAG知识源连接测试表
CREATE TABLE rag_connection_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID NOT NULL REFERENCES rag_knowledge_sources(id) ON DELETE CASCADE,
    test_type VARCHAR(50) NOT NULL CHECK (test_type IN ('manual', 'scheduled', 'health_check')),
    test_status VARCHAR(20) NOT NULL CHECK (test_status IN ('success', 'failed', 'timeout')),
    latency_ms FLOAT,
    document_count INTEGER,
    error_message TEXT,
    test_metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_rag_connection_tests_source_id ON rag_connection_tests(source_id);
CREATE INDEX idx_rag_connection_tests_test_status ON rag_connection_tests(test_status);
CREATE INDEX idx_rag_connection_tests_created_at ON rag_connection_tests(created_at DESC);
CREATE INDEX idx_rag_connection_tests_latency ON rag_connection_tests(latency_ms);
```

**RAG融合配置表 (rag\_fusion\_configs)**

```sql
-- 创建RAG融合配置表
CREATE TABLE rag_fusion_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    fusion_strategy VARCHAR(50) DEFAULT 'weighted_score' CHECK (fusion_strategy IN ('weighted_score', 'rank_fusion', 'semantic_fusion', 'temporal_fusion')),
    weight_config JSONB DEFAULT '{"Onememory": 0.6, "rag": 0.4}',
    threshold_config JSONB DEFAULT '{"min_score": 0.3, "fusion_threshold": 0.5}',
    ranking_config JSONB DEFAULT '{"max_results": 20, "diversity_factor": 0.2}',
    temporal_config JSONB DEFAULT '{"time_decay": 0.1, "recency_boost": 1.2}',
    enable_caching BOOLEAN DEFAULT true,
    cache_ttl_seconds INTEGER DEFAULT 3600,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_rag_fusion_configs_project_id ON rag_fusion_configs(project_id);
CREATE UNIQUE INDEX idx_rag_fusion_configs_project_unique ON rag_fusion_configs(project_id);
```

**初始化RAG相关数据**

```sql
-- 插入示例RAG知识源
INSERT INTO rag_knowledge_sources (project_id, name, source_type, config, status, search_config) VALUES
((SELECT id FROM projects WHERE name = 'Demo Chat Bot'),
 '企业文档库',
 'elasticsearch',
 '{"url": "http://localhost:9200", "index": "company_docs", "auth": {"type": "basic", "username": "elastic", "password": "changeme"}}',
 'disconnected',
 '{"max_results": 15, "threshold": 0.75, "boost_factor": 1.2}'),
((SELECT id FROM projects WHERE name = 'Demo Chat Bot'),
 '技术知识库',
 'chroma',
 '{"url": "http://localhost:8000", "collection": "tech_knowledge", "auth": {"type": "none"}}',
 'disconnected',
 '{"max_results": 10, "threshold": 0.7, "boost_factor": 1.0}');

-- 插入默认RAG融合配置
INSERT INTO rag_fusion_configs (project_id, fusion_strategy, weight_config, threshold_config) VALUES
((SELECT id FROM projects WHERE name = 'Demo Chat Bot'),
 'weighted_score',
 '{"Onememory": 0.65, "rag": 0.35}',
 '{"min_score": 0.3, "fusion_threshold": 0.5}');
```

### 6.19 数据流设计

#### 6.19.1 用户请求数据流

```mermaid
sequenceDiagram
    participant U as 用户
    participant API as API网关
    participant Auth as 认证服务
    participant Proxy as 代理服务
    participant Memory as 记忆服务
    participant Graph as 知识图谱引擎
    participant LLM as LLM服务
    participant DB as 数据库

    U->>API: 发送请求
    API->>Auth: 验证API密钥
    Auth-->>API: 返回用户信息
    API->>Proxy: 转发请求
    Proxy->>Memory: 检索相关记忆
    Memory->>Graph: 查询知识图谱
    Graph->>DB: 查询实体和关系
    DB-->>Graph: 返回图谱数据
    Graph-->>Memory: 返回关联记忆
    Memory-->>Proxy: 返回增强上下文
    Proxy->>LLM: 发送增强请求
    LLM-->>Proxy: 返回响应
    Proxy-->>API: 返回结果
    API-->>U: 返回响应
```

#### 6.19.2 记忆存储数据流

```mermaid
sequenceDiagram
    participant Proxy as 代理服务
    participant Seg as 分段服务
    participant Vec as 向量服务
    participant Memory as 记忆服务
    participant Graph as 知识图谱引擎
    participant Analyzer as 关系分析器
    participant Builder as 语义构建器
    participant DB as 数据库

    Proxy->>Seg: 发送新对话
    Seg->>Seg: 智能分段
    Seg->>Vec: 生成向量
    Vec-->>Seg: 返回向量
    Seg->>Memory: 存储记忆片段
    Memory->>Graph: 提取实体和关系
    Graph->>Analyzer: 分析关系
    Analyzer->>Builder: 构建语义连接
    Builder->>DB: 存储实体和关系
    DB-->>Builder: 确认存储
    Builder-->>Graph: 返回构建结果
    Graph-->>Memory: 返回图谱更新
    Memory-->>Seg: 返回存储结果
    Seg-->>Proxy: 返回确认
```

#### 6.19.3 知识图谱演化数据流

```mermaid
sequenceDiagram
    participant Memory as 记忆服务
    participant Graph as 知识图谱引擎
    participant Analyzer as 关系分析器
    participant Evolution as 演化处理器
    participant Insight as 洞察生成器
    participant DB as 数据库

    Memory->>Graph: 新记忆片段
    Graph->>Analyzer: 分析实体关系
    Analyzer->>Analyzer: 计算关系强度
    Analyzer->>Evolution: 触发演化
    Evolution->>Evolution: 评估演化条件
    Evolution->>DB: 查询历史状态
    DB-->>Evolution: 返回历史数据
    Evolution->>Insight: 生成洞察
    Insight->>Insight: 识别模式
    Insight->>DB: 更新图谱结构
    DB-->>Insight: 确认更新
    Insight-->>Evolution: 返回洞察结果
    Evolution-->>Graph: 返回演化完成
    Graph-->>Memory: 返回图谱状态
```

### 6.20 部署架构

#### 6.20.1 容器化部署

```yaml
# docker-compose.yml
version: '3.8'

services:
  api-gateway:
    build: ./services/api-gateway
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
    depends_on:
      - redis
      - postgres
      - neo4j

  proxy-service:
    build: ./services/proxy
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@postgres:5432/Onememory
      - REDIS_URL=redis://redis:6379
      - NEO4J_URL=bolt://neo4j:7687
    depends_on:
      - postgres
      - redis
      - qdrant
      - neo4j

  memory-service:
    build: ./services/memory
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@postgres:5432/Onememory
      - VECTOR_DB_URL=http://qdrant:6333
      - NEO4J_URL=bolt://neo4j:7687
    depends_on:
      - postgres
      - qdrant
      - neo4j

  segmentation-service:
    build: ./services/segmentation
    ports:
      - "3002:3002"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@postgres:5432/Onememory

  token-service:
    build: ./services/token
    ports:
      - "3003:3003"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@postgres:5432/Onememory

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=Onememory
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./sql/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  qdrant:
    image: qdrant/qdrant:latest
    ports:
      - "6333:6333"
      - "6334:6334"
    volumes:
      - qdrant_data:/qdrant/storage

  neo4j:
    image: neo4j:5.15
    ports:
      - "7474:7474"
      - "7687:7687"
    environment:
      - NEO4J_AUTH=neo4j/password
      - NEO4J_PLUGINS='["apoc", "graph-data-science"]'
      - NEO4J_dbms_security_procedures_unrestricted=gds.*,apoc.*
      - NEO4J_dbms_security_procedures_allowlist=gds.*,apoc.*
    volumes:
      - neo4j_data:/data
      - neo4j_logs:/logs
      - neo4j_import:/var/lib/neo4j/import
      - neo4j_plugins:/plugins

volumes:
  postgres_data:
  redis_data:
  qdrant_data:
  neo4j_data:
  neo4j_logs:
  neo4j_import:
  neo4j_plugins:
```

### 6.21 性能优化

#### 6.21.1 数据库优化

* **关系型数据库优化**

  * 为常用查询字段建立复合索引

  * 使用部分索引优化特定查询

  * 定期分析和优化查询计划

  * 连接池配置优化

* **图数据库优化**

  * 为实体和关系创建复合索引

  * 使用标签和属性索引

  * 优化图查询模式

  * 内存配置调优

* **分区策略**

  * 按时间分区大表（如消息表、使用日志表）

  * 按用户ID分区记忆数据

  * 分区表自动维护

  * 图数据库分层存储

* **缓存策略**

  * Redis缓存热点数据

  * 查询结果缓存

  * 向量检索结果缓存

  * 图结构缓存

#### 6.21.2 向量检索优化

* **索引优化**

  * 使用HNSW算法进行近似最近邻搜索

  * 多层级索引结构

  * 动态索引更新

  * 实体嵌入向量优化

* **量化优化**

  * 向量量化减少存储空间

  * 乘积量化提高检索速度

  * 二进制量化优化内存使用

  * 关系向量压缩

* **并行化**

  * 多线程向量检索

  * 分布式向量搜索

  * GPU加速计算

  * 图算法并行化

#### 6.21.3 知识图谱优化

* **图结构优化**

  * 实体去重和合并

  * 关系权重动态调整

  * 图分区减少查询范围

  * 层级化图组织

* **查询优化**

  * Cypher查询优化

  * 模式匹配索引

  * 图算法缓存

  * 预计算路径

* **演化优化**

  * 增量式图更新

  * 批量关系处理

  * 异步图演化

  * 内存中图构建

#### 6.21.4 系统优化

* **负载均衡**

  * Nginx反向代理

  * 多实例服务部署

  * 动态负载分发

  * 图数据库集群

* **异步处理**

  * 消息队列处理耗时操作

  * 异步记忆存储

  * 批量处理优化

  * 图演化异步处理

* **CDN加速**

  * 静态资源CDN分发

  * API响应缓存

  * 全球节点部署

  * 图数据缓存同步

### 6.22 安全设计

#### 6.22.1 认证与授权

* **JWT Token认证**

  * 短期访问令牌

  * 长期刷新令牌

  * 令牌撤销机制

* **API密钥管理**

  * 密钥哈希存储

  * 细粒度权限控制

  * 密钥轮换策略

* **多因素认证**

  * 可选MFA支持

  * 生物识别集成

  * 设备信任管理

#### 6.22.2 数据安全

* **数据加密**

  * 传输层TLS 1.3

  * 静态数据AES-256加密

  * 敏感字段额外加密

* **隐私保护**

  * 数据脱敏处理

  * 匿名化存储

  * GDPR合规设计

* **访问控制**

  * 基于角色的访问控制(RBAC)

  * 属性基访问控制(ABAC)

  * 动态权限评估

#### 6.22.3 系统安全

* **网络安全**

  * WAF防护

  * DDoS缓解

  * 网络隔离

* **应用安全**

  * SQL注入防护

  * XSS防护

  * CSRF防护

* **监控与审计**

  * 安全事件监控

  * 访问日志审计

  * 异常行为检测

### 6.14 监控与运维

#### 6.14.1 系统监控

* **基础设施监控**

  * CPU/内存/磁盘监控

  * 网络流量监控

  * 服务健康检查

* **应用性能监控**

  * API响应时间

  * 错误率统计

  * 业务指标监控

* **数据库监控**

  * 查询性能监控

  * 连接池状态

  * 索引使用情况

#### 6.14.2 日志管理

* **结构化日志**

  * JSON格式日志

  * 分布式链路追踪

  * 错误堆栈收集

* **日志聚合**

  * ELK Stack集成

  * 实时日志分析

  * 日志压缩归档

* **告警机制**

  * 多级别告警策略

  * 智能告警降噪

  * 告警自动恢复

#### 6.14.3 运维自动化

* **CI/CD流程**

  * 自动化构建部署

  * 蓝绿部署策略

  * 回滚机制

* **配置管理**

  * 集中配置中心

  * 配置版本控制

  * 动态配置更新

* **容量规划**

  * 自动扩缩容

  * 资源预测分析

  * 成本优化建议

### 6.15 扩展性设计

#### 6.15.1 水平扩展

* **微服务架构**

  * 服务解耦设计

  * 独立部署扩展

  * 服务发现机制

* **数据库分片**

  * 用户级分片策略

  * 地理位置分片

  * 读写分离

* **缓存集群**

  * Redis Cluster

  * 缓存分区策略

  * 热点数据分布

#### 6.15.2 垂直扩展

* **资源优化**

  * 内存使用优化

  * CPU密集型任务优化

  * I/O性能调优

* **算法优化**

  * 时间复杂度优化

  * 空间复杂度优化

  * 并行算法设计

#### 6.15.3 功能扩展

* **插件架构**

  * 动态插件加载

  * 插件生命周期管理

  * 插件间通信

* **API扩展**

  * GraphQL API

  * Webhook支持

  * 自定义端点

* **集成能力**

  * 第三方系统集成

  * 数据导入导出

  * 标准协议支持

### 6.16 高可用设计

#### 6.16.1 故障转移

* **主备切换**

  * 自动故障检测

  * 快速主备切换

  * 数据一致性保证

* **多活架构**

  * 异地多活部署

  * 数据同步机制

  * 流量调度策略

* **降级策略**

  * 服务降级机制

  * 熔断保护

  * 限流策略

#### 6.16.2 数据备份

* **备份策略**

  * 全量备份

  * 增量备份

  * 差异备份

* **恢复机制**

  * 点时间恢复

  * 灾难恢复

  * 数据一致性校验

* **备份验证**

  * 定期恢复测试

  * 备份完整性检查

  * 恢复时间评估

#### 6.16.3 容灾设计

* **地理容灾**

  * 多地域部署

  * 跨地域复制

  * 地域级故障切换

* **数据容灾**

  * 数据冗余存储

  * 跨区域备份

  * 数据一致性协议

* **网络容灾**

  * 多线路接入

  * 网络故障切换

  * CDN容灾备份

### 6.17 成本优化

#### 6.17.1 资源成本

* **计算资源优化**

  * 按需计算资源

  * 预留实例策略

  * 竞价实例使用

* **存储成本优化**

  * 数据分层存储

  * 冷热数据分离

  * 数据压缩策略

* **网络成本优化**

  * CDN流量优化

  * 跨区域流量调度

  * 带宽利用率提升

#### 6.17.2 运营成本

* **自动化运维**

  * 自动化部署

  * 自动化监控

  * 自动化故障处理

* **资源调度**

  * 智能资源分配

  * 负载均衡优化

  * 能效比优化

* **成本监控**

  * 实时成本监控

  * 成本趋势分析

  * 成本优化建议

#### 6.17.3 技术成本

* **开源技术**

  * 开源组件优先

  * 自主可控技术

  * 技术债务管理

* **标准化**

  * 技术标准统一

  * 组件标准化

  * 流程标准化

* **效率提升**

  * 开发效率优化

  * 测试效率提升

  * 部署效率改进

