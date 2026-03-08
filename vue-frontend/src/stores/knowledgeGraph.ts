import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Node {
  id: string
  name: string
  type: string
  group: number
  description?: string
  confidence: number
  createdAt: string
  updatedAt: string
  properties?: Record<string, any>
}

export interface Link {
  id: string
  source: string
  target: string
  type: string
  weight?: number
  confidence: number
  createdAt: string
  description?: string
  direction?: 'uni' | 'bi'
}

export interface KnowledgeGraph {
  projectId: string
  nodes: Node[]
  links: Link[]
}

export interface GraphFilterOptions {
  nodeTypes?: string[]
  linkTypes?: string[]
  searchText?: string
  minWeight?: number
}

// 模拟不同项目的知识图谱数据，与React项目保持一致
const initialGraphs: KnowledgeGraph[] = [
  {
    projectId: '1',
    nodes: [
      // 技术实体
      { 
        id: '1', 
        name: 'AI模型训练', 
        type: 'technology', 
        group: 1,
        description: '机器学习模型训练相关技术',
        confidence: 0.92,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-16T14:20:00Z'
      },
      { 
        id: '2', 
        name: '深度学习', 
        type: 'technology', 
        group: 1,
        description: '深度神经网络技术',
        confidence: 0.87,
        createdAt: '2024-01-14T09:15:00Z',
        updatedAt: '2024-01-16T11:45:00Z'
      },
      { 
        id: '3', 
        name: '性能优化', 
        type: 'technology', 
        group: 1,
        description: '系统性能优化技术',
        confidence: 0.78,
        createdAt: '2024-01-13T16:45:00Z',
        updatedAt: '2024-01-15T13:30:00Z'
      },
      { 
        id: '4', 
        name: '数据预处理', 
        type: 'technology', 
        group: 1,
        description: '机器学习数据预处理技术',
        confidence: 0.85,
        createdAt: '2024-01-12T10:00:00Z',
        updatedAt: '2024-01-15T12:30:00Z'
      },
      { 
        id: '5', 
        name: '超参数调优', 
        type: 'technology', 
        group: 1,
        description: '机器学习模型超参数调优技术',
        confidence: 0.80,
        createdAt: '2024-01-11T14:00:00Z',
        updatedAt: '2024-01-14T16:30:00Z'
      },
      { 
        id: '6', 
        name: '模型评估', 
        type: 'technology', 
        group: 1,
        description: '机器学习模型评估技术',
        confidence: 0.88,
        createdAt: '2024-01-10T10:00:00Z',
        updatedAt: '2024-01-13T14:20:00Z'
      },
      { 
        id: '7', 
        name: '特征工程', 
        type: 'technology', 
        group: 1,
        description: '机器学习特征工程技术',
        confidence: 0.83,
        createdAt: '2024-01-09T14:00:00Z',
        updatedAt: '2024-01-12T16:30:00Z'
      },
      // 时序实体
      { 
        id: 'event_1', 
        name: '模型训练事件', 
        type: 'event', 
        group: 3,
        description: 'AI模型训练过程中的关键事件',
        confidence: 0.90,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T12:30:00Z',
        timestamp: '2024-01-15T10:30:00Z'
      },
      { 
        id: 'event_2', 
        name: '数据预处理完成', 
        type: 'event', 
        group: 3,
        description: '数据预处理阶段完成事件',
        confidence: 0.85,
        createdAt: '2024-01-12T10:00:00Z',
        updatedAt: '2024-01-12T10:00:00Z',
        timestamp: '2024-01-12T10:00:00Z'
      },
      { 
        id: 'temporal_1', 
        name: '模型迭代版本1', 
        type: 'temporal', 
        group: 3,
        description: 'AI模型的第一个迭代版本',
        confidence: 0.87,
        createdAt: '2024-01-16T10:00:00Z',
        updatedAt: '2024-01-16T14:20:00Z',
        timestamp: '2024-01-16T10:00:00Z'
      },
      // 记忆合成实体
      { 
        id: 'synth_1', 
        name: 'AI训练最佳实践合成', 
        type: 'memory_synthesis', 
        group: 4,
        description: 'AI模型训练最佳实践的合成结果',
        confidence: 0.95,
        createdAt: '2024-01-17T09:00:00Z',
        updatedAt: '2024-01-17T09:00:00Z'
      }
    ],
    links: [
      // 技术关系
      { 
        id: '1',
        source: '1', 
        target: '2', 
        type: 'relates_to',
        description: 'AI模型训练与深度学习相关',
        weight: 0.8,
        confidence: 0.85,
        createdAt: '2024-01-15T10:30:00Z'
      },
      { 
        id: '2',
        source: '2', 
        target: '3', 
        type: 'requires',
        description: '深度学习需要性能优化',
        weight: 0.7,
        confidence: 0.75,
        createdAt: '2024-01-14T09:15:00Z'
      },
      { 
        id: '3',
        source: '1', 
        target: '4', 
        type: 'requires',
        description: 'AI模型训练需要数据预处理',
        weight: 0.85,
        confidence: 0.90,
        createdAt: '2024-01-15T10:30:00Z'
      },
      { 
        id: '4',
        source: '1', 
        target: '5', 
        type: 'requires',
        description: 'AI模型训练需要超参数调优',
        weight: 0.75,
        confidence: 0.80,
        createdAt: '2024-01-15T10:30:00Z'
      },
      { 
        id: '5',
        source: '4', 
        target: '5', 
        type: 'relates_to',
        description: '数据预处理与超参数调优相关',
        weight: 0.6,
        confidence: 0.70,
        createdAt: '2024-01-14T14:00:00Z'
      },
      { 
        id: '6',
        source: '1', 
        target: '6', 
        type: 'requires',
        description: 'AI模型训练需要模型评估',
        weight: 0.8,
        confidence: 0.88,
        createdAt: '2024-01-15T10:30:00Z'
      },
      { 
        id: '7',
        source: '4', 
        target: '7', 
        type: 'includes',
        description: '数据预处理包括特征工程',
        weight: 0.85,
        confidence: 0.92,
        createdAt: '2024-01-12T10:00:00Z'
      },
      // 时序关系
      { 
        id: 'event_rel_1',
        source: 'event_2', 
        target: 'event_1', 
        type: 'precedes',
        description: '数据预处理完成发生在模型训练事件之前',
        weight: 0.9,
        confidence: 0.95,
        createdAt: '2024-01-15T10:30:00Z'
      },
      { 
        id: 'event_rel_2',
        source: 'event_1', 
        target: 'temporal_1', 
        type: 'results_in',
        description: '模型训练事件产生模型迭代版本1',
        weight: 0.85,
        confidence: 0.90,
        createdAt: '2024-01-16T14:20:00Z'
      },
      // 记忆合成关系
      { 
        id: 'synth_rel_1',
        source: '1', 
        target: 'synth_1', 
        type: 'contributes_to',
        description: 'AI模型训练知识贡献给记忆合成',
        weight: 0.9,
        confidence: 0.95,
        createdAt: '2024-01-17T09:00:00Z'
      },
      { 
        id: 'synth_rel_2',
        source: '4', 
        target: 'synth_1', 
        type: 'contributes_to',
        description: '数据预处理知识贡献给记忆合成',
        weight: 0.85,
        confidence: 0.90,
        createdAt: '2024-01-17T09:00:00Z'
      },
      { 
        id: 'synth_rel_3',
        source: '5', 
        target: 'synth_1', 
        type: 'contributes_to',
        description: '超参数调优知识贡献给记忆合成',
        weight: 0.8,
        confidence: 0.85,
        createdAt: '2024-01-17T09:00:00Z'
      }
    ]
  },
  {
    projectId: '2',
    nodes: [
      // 技术实体
      { 
        id: '1', 
        name: '深度学习', 
        type: 'technology', 
        group: 1,
        description: '深度神经网络技术',
        confidence: 0.87,
        createdAt: '2024-01-14T09:15:00Z',
        updatedAt: '2024-01-16T11:45:00Z'
      },
      { 
        id: '2', 
        name: '模型部署', 
        type: 'technology', 
        group: 1,
        description: '机器学习模型部署技术',
        confidence: 0.85,
        createdAt: '2024-01-13T10:00:00Z',
        updatedAt: '2024-01-15T14:30:00Z'
      },
      { 
        id: '3', 
        name: '推理加速', 
        type: 'technology', 
        group: 1,
        description: '机器学习模型推理加速技术',
        confidence: 0.82,
        createdAt: '2024-01-12T14:00:00Z',
        updatedAt: '2024-01-14T16:30:00Z'
      },
      { 
        id: '4', 
        name: '资源管理', 
        type: 'technology', 
        group: 1,
        description: '机器学习资源管理技术',
        confidence: 0.78,
        createdAt: '2024-01-11T10:00:00Z',
        updatedAt: '2024-01-13T12:30:00Z'
      },
      { 
        id: '5', 
        name: '容器化', 
        type: 'technology', 
        group: 1,
        description: '容器化部署技术',
        confidence: 0.89,
        createdAt: '2024-01-10T09:00:00Z',
        updatedAt: '2024-01-15T14:30:00Z'
      },
      { 
        id: '6', 
        name: 'MLOps', 
        type: 'technology', 
        group: 1,
        description: '机器学习运维技术',
        confidence: 0.86,
        createdAt: '2024-01-09T14:00:00Z',
        updatedAt: '2024-01-14T16:30:00Z'
      },
      // 时序实体
      { 
        id: 'event_1', 
        name: '模型部署事件', 
        type: 'event', 
        group: 3,
        description: '模型部署过程中的关键事件',
        confidence: 0.90,
        createdAt: '2024-01-15T14:30:00Z',
        updatedAt: '2024-01-15T14:30:00Z',
        timestamp: '2024-01-15T14:30:00Z'
      },
      { 
        id: 'temporal_1', 
        name: '部署版本v1.0', 
        type: 'temporal', 
        group: 3,
        description: '模型部署的第一个版本',
        confidence: 0.92,
        createdAt: '2024-01-15T14:30:00Z',
        updatedAt: '2024-01-15T14:30:00Z',
        timestamp: '2024-01-15T14:30:00Z'
      },
      // 记忆合成实体
      { 
        id: 'synth_1', 
        name: '模型部署最佳实践合成', 
        type: 'memory_synthesis', 
        group: 4,
        description: '模型部署最佳实践的合成结果',
        confidence: 0.93,
        createdAt: '2024-01-16T10:00:00Z',
        updatedAt: '2024-01-16T10:00:00Z'
      }
    ],
    links: [
      // 技术关系
      { 
        id: '1',
        source: '1', 
        target: '2', 
        type: 'relates_to',
        description: '深度学习与模型部署相关',
        weight: 0.8,
        confidence: 0.85,
        createdAt: '2024-01-14T09:15:00Z'
      },
      { 
        id: '2',
        source: '2', 
        target: '3', 
        type: 'requires',
        description: '模型部署需要推理加速',
        weight: 0.85,
        confidence: 0.90,
        createdAt: '2024-01-13T10:00:00Z'
      },
      { 
        id: '3',
        source: '2', 
        target: '4', 
        type: 'requires',
        description: '模型部署需要资源管理',
        weight: 0.75,
        confidence: 0.80,
        createdAt: '2024-01-13T10:00:00Z'
      },
      { 
        id: '4',
        source: '3', 
        target: '4', 
        type: 'relates_to',
        description: '推理加速与资源管理相关',
        weight: 0.7,
        confidence: 0.75,
        createdAt: '2024-01-12T14:00:00Z'
      },
      { 
        id: '5',
        source: '2', 
        target: '5', 
        type: 'uses',
        description: '模型部署使用容器化技术',
        weight: 0.9,
        confidence: 0.95,
        createdAt: '2024-01-15T14:30:00Z'
      },
      { 
        id: '6',
        source: '2', 
        target: '6', 
        type: 'part_of',
        description: '模型部署是MLOps的一部分',
        weight: 0.85,
        confidence: 0.90,
        createdAt: '2024-01-14T16:30:00Z'
      },
      // 时序关系
      { 
        id: 'event_rel_1',
        source: 'event_1', 
        target: 'temporal_1', 
        type: 'results_in',
        description: '模型部署事件产生部署版本v1.0',
        weight: 0.9,
        confidence: 0.95,
        createdAt: '2024-01-15T14:30:00Z'
      },
      // 记忆合成关系
      { 
        id: 'synth_rel_1',
        source: '2', 
        target: 'synth_1', 
        type: 'contributes_to',
        description: '模型部署知识贡献给记忆合成',
        weight: 0.9,
        confidence: 0.95,
        createdAt: '2024-01-16T10:00:00Z'
      },
      { 
        id: 'synth_rel_2',
        source: '5', 
        target: 'synth_1', 
        type: 'contributes_to',
        description: '容器化知识贡献给记忆合成',
        weight: 0.85,
        confidence: 0.90,
        createdAt: '2024-01-16T10:00:00Z'
      }
    ]
  },
  {
    projectId: '3',
    nodes: [
      // 技术实体
      { 
        id: '1', 
        name: '系统性能', 
        type: 'technology', 
        group: 1,
        description: '系统性能优化技术',
        confidence: 0.88,
        createdAt: '2024-01-13T16:45:00Z',
        updatedAt: '2024-01-15T13:30:00Z'
      },
      { 
        id: '2', 
        name: '缓存机制', 
        type: 'technology', 
        group: 1,
        description: '系统缓存优化技术',
        confidence: 0.85,
        createdAt: '2024-01-12T14:00:00Z',
        updatedAt: '2024-01-14T16:30:00Z'
      },
      { 
        id: '3', 
        name: '异步处理', 
        type: 'technology', 
        group: 1,
        description: '系统异步处理技术',
        confidence: 0.82,
        createdAt: '2024-01-11T10:00:00Z',
        updatedAt: '2024-01-13T12:30:00Z'
      },
      { 
        id: '4', 
        name: '监控', 
        type: 'technology', 
        group: 1,
        description: '系统监控技术',
        confidence: 0.87,
        createdAt: '2024-01-10T16:45:00Z',
        updatedAt: '2024-01-15T13:30:00Z'
      },
      { 
        id: '5', 
        name: '分布式系统', 
        type: 'technology', 
        group: 1,
        description: '分布式系统技术',
        confidence: 0.84,
        createdAt: '2024-01-09T14:00:00Z',
        updatedAt: '2024-01-12T16:30:00Z'
      },
      // 时序实体
      { 
        id: 'event_1', 
        name: '性能优化事件', 
        type: 'event', 
        group: 3,
        description: '系统性能优化过程中的关键事件',
        confidence: 0.88,
        createdAt: '2024-01-15T13:30:00Z',
        updatedAt: '2024-01-15T13:30:00Z',
        timestamp: '2024-01-15T13:30:00Z'
      },
      { 
        id: 'temporal_1', 
        name: '性能版本v2.0', 
        type: 'temporal', 
        group: 3,
        description: '系统性能优化后的版本',
        confidence: 0.93,
        createdAt: '2024-01-15T13:30:00Z',
        updatedAt: '2024-01-15T13:30:00Z',
        timestamp: '2024-01-15T13:30:00Z'
      },
      // 记忆合成实体
      { 
        id: 'synth_1', 
        name: '系统性能优化最佳实践合成', 
        type: 'memory_synthesis', 
        group: 4,
        description: '系统性能优化最佳实践的合成结果',
        confidence: 0.91,
        createdAt: '2024-01-16T09:00:00Z',
        updatedAt: '2024-01-16T09:00:00Z'
      }
    ],
    links: [
      // 技术关系
      { 
        id: '1',
        source: '1', 
        target: '2', 
        type: 'requires',
        description: '系统性能优化需要缓存机制',
        weight: 0.85,
        confidence: 0.90,
        createdAt: '2024-01-13T16:45:00Z'
      },
      { 
        id: '2',
        source: '1', 
        target: '3', 
        type: 'requires',
        description: '系统性能优化需要异步处理',
        weight: 0.8,
        confidence: 0.85,
        createdAt: '2024-01-13T16:45:00Z'
      },
      { 
        id: '3',
        source: '2', 
        target: '3', 
        type: 'relates_to',
        description: '缓存机制与异步处理相关',
        weight: 0.7,
        confidence: 0.75,
        createdAt: '2024-01-12T14:00:00Z'
      },
      { 
        id: '4',
        source: '1', 
        target: '4', 
        type: 'requires',
        description: '系统性能优化需要监控',
        weight: 0.85,
        confidence: 0.90,
        createdAt: '2024-01-13T16:45:00Z'
      },
      { 
        id: '5',
        source: '3', 
        target: '5', 
        type: 'part_of',
        description: '异步处理是分布式系统的一部分',
        weight: 0.8,
        confidence: 0.85,
        createdAt: '2024-01-11T10:00:00Z'
      },
      // 时序关系
      { 
        id: 'event_rel_1',
        source: 'event_1', 
        target: 'temporal_1', 
        type: 'results_in',
        description: '性能优化事件产生性能版本v2.0',
        weight: 0.9,
        confidence: 0.95,
        createdAt: '2024-01-15T13:30:00Z'
      },
      // 记忆合成关系
      { 
        id: 'synth_rel_1',
        source: '1', 
        target: 'synth_1', 
        type: 'contributes_to',
        description: '系统性能知识贡献给记忆合成',
        weight: 0.88,
        confidence: 0.93,
        createdAt: '2024-01-16T09:00:00Z'
      },
      { 
        id: 'synth_rel_2',
        source: '2', 
        target: 'synth_1', 
        type: 'contributes_to',
        description: '缓存机制知识贡献给记忆合成',
        weight: 0.83,
        confidence: 0.88,
        createdAt: '2024-01-16T09:00:00Z'
      },
      { 
        id: 'synth_rel_3',
        source: '3', 
        target: 'synth_1', 
        type: 'contributes_to',
        description: '异步处理知识贡献给记忆合成',
        weight: 0.80,
        confidence: 0.85,
        createdAt: '2024-01-16T09:00:00Z'
      }
    ]
  },
  {
    projectId: '4',
    nodes: [
      // 项目实体
      { 
        id: '1', 
        name: 'AI客服助手', 
        type: 'project', 
        group: 2,
        description: '智能客服系统项目',
        confidence: 0.95,
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-16T14:20:00Z'
      },
      { 
        id: '2', 
        name: '内容生成器', 
        type: 'project', 
        group: 2,
        description: 'AI内容创作工具项目',
        confidence: 0.93,
        createdAt: '2024-01-02T10:00:00Z',
        updatedAt: '2024-01-15T14:20:00Z'
      },
      { 
        id: '3', 
        name: '数据分析平台', 
        type: 'project', 
        group: 2,
        description: '企业数据分析平台项目',
        confidence: 0.91,
        createdAt: '2024-01-03T10:00:00Z',
        updatedAt: '2024-01-14T14:20:00Z'
      },
      { 
        id: '4', 
        name: '智能推荐系统', 
        type: 'project', 
        group: 2,
        description: '智能推荐系统项目',
        confidence: 0.90,
        createdAt: '2024-01-04T10:00:00Z',
        updatedAt: '2024-01-13T14:20:00Z'
      },
      // 技术实体
      { 
        id: '5', 
        name: 'NLP', 
        type: 'technology', 
        group: 1,
        description: '自然语言处理技术',
        confidence: 0.92,
        createdAt: '2024-01-05T10:00:00Z',
        updatedAt: '2024-01-16T14:20:00Z'
      },
      { 
        id: '6', 
        name: '机器学习', 
        type: 'technology', 
        group: 1,
        description: '机器学习技术',
        confidence: 0.94,
        createdAt: '2024-01-06T10:00:00Z',
        updatedAt: '2024-01-16T14:20:00Z'
      },
      // 记忆合成实体
      { 
        id: 'synth_1', 
        name: '项目技术整合合成', 
        type: 'memory_synthesis', 
        group: 4,
        description: '跨项目技术整合的记忆合成结果',
        confidence: 0.92,
        createdAt: '2024-01-17T10:00:00Z',
        updatedAt: '2024-01-17T10:00:00Z'
      }
    ],
    links: [
      // 项目关系
      { 
        id: '1',
        source: '1', 
        target: '2', 
        type: 'relates_to',
        description: 'AI客服助手与内容生成器相关',
        weight: 0.7,
        confidence: 0.75,
        createdAt: '2024-01-10T10:30:00Z'
      },
      { 
        id: '2',
        source: '2', 
        target: '3', 
        type: 'relates_to',
        description: '内容生成器与数据分析平台相关',
        weight: 0.65,
        confidence: 0.70,
        createdAt: '2024-01-11T10:30:00Z'
      },
      { 
        id: '3',
        source: '3', 
        target: '4', 
        type: 'relates_to',
        description: '数据分析平台与智能推荐系统相关',
        weight: 0.8,
        confidence: 0.85,
        createdAt: '2024-01-12T10:30:00Z'
      },
      // 技术与项目关系
      { 
        id: '4',
        source: '1', 
        target: '5', 
        type: 'uses',
        description: 'AI客服助手使用NLP技术',
        weight: 0.9,
        confidence: 0.95,
        createdAt: '2024-01-05T10:00:00Z'
      },
      { 
        id: '5',
        source: '2', 
        target: '5', 
        type: 'uses',
        description: '内容生成器使用NLP技术',
        weight: 0.85,
        confidence: 0.90,
        createdAt: '2024-01-05T10:00:00Z'
      },
      { 
        id: '6',
        source: '3', 
        target: '6', 
        type: 'uses',
        description: '数据分析平台使用机器学习技术',
        weight: 0.88,
        confidence: 0.92,
        createdAt: '2024-01-06T10:00:00Z'
      },
      { 
        id: '7',
        source: '4', 
        target: '6', 
        type: 'uses',
        description: '智能推荐系统使用机器学习技术',
        weight: 0.9,
        confidence: 0.95,
        createdAt: '2024-01-06T10:00:00Z'
      },
      // 记忆合成关系
      { 
        id: 'synth_rel_1',
        source: '1', 
        target: 'synth_1', 
        type: 'contributes_to',
        description: 'AI客服助手项目知识贡献给记忆合成',
        weight: 0.85,
        confidence: 0.90,
        createdAt: '2024-01-17T10:00:00Z'
      },
      { 
        id: 'synth_rel_2',
        source: '2', 
        target: 'synth_1', 
        type: 'contributes_to',
        description: '内容生成器项目知识贡献给记忆合成',
        weight: 0.82,
        confidence: 0.87,
        createdAt: '2024-01-17T10:00:00Z'
      },
      { 
        id: 'synth_rel_3',
        source: '3', 
        target: 'synth_1', 
        type: 'contributes_to',
        description: '数据分析平台项目知识贡献给记忆合成',
        weight: 0.80,
        confidence: 0.85,
        createdAt: '2024-01-17T10:00:00Z'
      },
      { 
        id: 'synth_rel_4',
        source: '4', 
        target: 'synth_1', 
        type: 'contributes_to',
        description: '智能推荐系统项目知识贡献给记忆合成',
        weight: 0.78,
        confidence: 0.83,
        createdAt: '2024-01-17T10:00:00Z'
      }
    ]
  }
]

export const useKnowledgeGraphStore = defineStore('knowledgeGraph', () => {
  const graphs = ref<KnowledgeGraph[]>(initialGraphs)

  const getGraphByProjectId = (projectId: string) => {
    return computed(() => {
      const graph = graphs.value.find(g => g.projectId === projectId)
      if (graph) {
        return { nodes: graph.nodes, links: graph.links }
      } 
      return { nodes: [], links: [] } // 如果找不到项目，返回空图
    })
  }

  // 过滤和搜索图谱数据
  const filterGraph = (projectId: string, options: GraphFilterOptions = {}) => {
    const graph = graphs.value.find(g => g.projectId === projectId)
    if (!graph) return { nodes: [], links: [] }

    let filteredNodes = [...graph.nodes]
    let filteredLinks = [...graph.links]

    // 根据节点类型过滤
    if (options.nodeTypes && options.nodeTypes.length > 0) {
      filteredNodes = filteredNodes.filter(node => options.nodeTypes!.includes(node.type))
    }

    // 根据链接类型过滤
    if (options.linkTypes && options.linkTypes.length > 0) {
      filteredLinks = filteredLinks.filter(link => options.linkTypes!.includes(link.type))
    }

    // 根据搜索词过滤
    if (options.searchText) {
      const term = options.searchText.toLowerCase()
      filteredNodes = filteredNodes.filter(node => 
        node.name.toLowerCase().includes(term) || 
        (node.description && node.description.toLowerCase().includes(term)) ||
        (node.properties && Object.values(node.properties).some(val => 
          val && val.toString().toLowerCase().includes(term)
        ))
      )
    }

    // 根据权重过滤
    if (options.minWeight !== undefined) {
      filteredLinks = filteredLinks.filter(link => 
        link.weight === undefined || link.weight >= options.minWeight!
      )
    }

    // 只保留有关联的节点
    const linkedNodeIds = new Set([
      ...filteredLinks.map(l => l.source),
      ...filteredLinks.map(l => l.target)
    ])
    
    filteredNodes = filteredNodes.filter(node => linkedNodeIds.has(node.id))

    return { nodes: filteredNodes, links: filteredLinks }
  }

  // 获取项目中的所有节点类型
  const getNodeTypes = (projectId: string) => {
    const graph = graphs.value.find(g => g.projectId === projectId)
    if (!graph) return []
    return Array.from(new Set(graph.nodes.map(n => n.type)))
  }

  // 获取项目中的所有链接类型
  const getLinkTypes = (projectId: string) => {
    const graph = graphs.value.find(g => g.projectId === projectId)
    if (!graph) return []
    return Array.from(new Set(graph.links.map(l => l.type)))
  }

  // 添加节点
  const addNode = (projectId: string, node: Omit<Node, 'id'> & { id?: string }) => {
    const graphIndex = graphs.value.findIndex(g => g.projectId === projectId)
    if (graphIndex === -1) return

    const newNode: Node = {
      id: node.id || `node-${Date.now()}`,
      ...node
    }

    graphs.value[graphIndex].nodes.push(newNode)
  }

  // 添加链接
  const addLink = (projectId: string, link: Omit<Link, 'source' | 'target'> & { source: string, target: string }) => {
    const graphIndex = graphs.value.findIndex(g => g.projectId === projectId)
    if (graphIndex === -1) return

    // 检查节点是否存在
    const graph = graphs.value[graphIndex]
    const sourceExists = graph.nodes.some(n => n.id === link.source)
    const targetExists = graph.nodes.some(n => n.id === link.target)
    
    if (!sourceExists || !targetExists) return

    const newLink: Link = {
      ...link
    }

    graphs.value[graphIndex].links.push(newLink)
  }

  return {
    graphs,
    getGraphByProjectId,
    filterGraph,
    getNodeTypes,
    getLinkTypes,
    addNode,
    addLink
  }
})
