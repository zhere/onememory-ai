import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { memoriesApi } from '@/lib/api'

export interface Memory {
  id: string
  content: string
  summary: string
  tags: string[]
  project: string
  projectId: string
  createdAt: string
  lastAccessed: string
  accessCount: number
  relevanceScore: number
  type: "conversation" | "document" | "context" | "knowledge"
  size: number
  importance: "low" | "medium" | "high"
}

// 为不同项目模拟一些初始记忆数据，与React项目保持一致
const initialMemories: Memory[] = [
  {
    id: "1",
    content: "用户询问关于AI模型训练的最佳实践，包括数据预处理、模型选择和超参数调优等方面的详细信息。",
    summary: "AI模型训练最佳实践咨询",
    tags: ["AI", "机器学习", "训练", "最佳实践"],
    project: "AI客服助手",
    projectId: "1",
    createdAt: "2024-01-15T10:30:00Z",
    lastAccessed: "2024-01-16T14:20:00Z",
    accessCount: 15,
    relevanceScore: 0.92,
    type: "conversation",
    size: 1024,
    importance: "high"
  },
  {
    id: "2",
    content: "技术文档：深度学习模型的部署策略，包括模型优化、推理加速和资源管理等关键技术点。",
    summary: "深度学习模型部署策略文档",
    tags: ["深度学习", "部署", "优化", "推理"],
    project: "内容生成器",
    projectId: "2",
    createdAt: "2024-01-14T09:15:00Z",
    lastAccessed: "2024-01-16T11:45:00Z",
    accessCount: 8,
    relevanceScore: 0.87,
    type: "document",
    size: 2048,
    importance: "medium"
  },
  {
    id: "3",
    content: "用户反馈：系统响应速度需要优化，建议增加缓存机制和异步处理能力。",
    summary: "系统性能优化建议",
    tags: ["性能", "优化", "缓存", "异步"],
    project: "数据分析平台",
    projectId: "3",
    createdAt: "2024-01-13T16:45:00Z",
    lastAccessed: "2024-01-15T13:30:00Z",
    accessCount: 12,
    relevanceScore: 0.78,
    type: "context",
    size: 512,
    importance: "high"
  },
  {
    id: "4",
    content: "数据预处理的关键步骤包括：数据清洗、特征提取、归一化和分割训练测试集。每个步骤都对模型性能有重要影响。",
    summary: "数据预处理关键步骤详解",
    tags: ["数据预处理", "特征工程", "机器学习"],
    project: "AI客服助手",
    projectId: "1",
    createdAt: "2024-01-12T10:00:00Z",
    lastAccessed: "2024-01-15T10:30:00Z",
    accessCount: 10,
    relevanceScore: 0.85,
    type: "document",
    size: 800,
    importance: "medium"
  },
  {
    id: "5",
    content: "超参数调优方法：网格搜索、随机搜索和贝叶斯优化的比较。贝叶斯优化在高维空间中表现最佳。",
    summary: "超参数调优方法比较",
    tags: ["超参数调优", "模型优化", "机器学习"],
    project: "AI客服助手",
    projectId: "1",
    createdAt: "2024-01-11T14:00:00Z",
    lastAccessed: "2024-01-14T16:30:00Z",
    accessCount: 7,
    relevanceScore: 0.80,
    type: "document",
    size: 650,
    importance: "medium"
  },
  {
    id: "6",
    content: "模型部署时需要考虑的因素：硬件资源、延迟要求、可扩展性和监控需求。容器化部署是当前的最佳实践。",
    summary: "模型部署最佳实践",
    tags: ["模型部署", "容器化", "MLOps"],
    project: "内容生成器",
    projectId: "2",
    createdAt: "2024-01-10T09:00:00Z",
    lastAccessed: "2024-01-15T14:30:00Z",
    accessCount: 9,
    relevanceScore: 0.83,
    type: "document",
    size: 950,
    importance: "high"
  },
  {
    id: "7",
    content: "推理加速技术：模型剪枝、量化和知识蒸馏。这些技术可以显著减少模型大小和推理时间。",
    summary: "推理加速技术详解",
    tags: ["推理加速", "模型优化", "量化"],
    project: "内容生成器",
    projectId: "2",
    createdAt: "2024-01-09T14:00:00Z",
    lastAccessed: "2024-01-14T16:30:00Z",
    accessCount: 6,
    relevanceScore: 0.79,
    type: "document",
    size: 750,
    importance: "medium"
  },
  {
    id: "8",
    content: "缓存机制设计原则：缓存一致性、失效策略和预热机制。合理的缓存设计可以将系统响应时间降低90%以上。",
    summary: "缓存机制设计原则",
    tags: ["缓存", "性能优化", "系统设计"],
    project: "数据分析平台",
    projectId: "3",
    createdAt: "2024-01-08T16:45:00Z",
    lastAccessed: "2024-01-13T13:30:00Z",
    accessCount: 11,
    relevanceScore: 0.86,
    type: "document",
    size: 850,
    importance: "high"
  },
  {
    id: "9",
    content: "异步处理框架：Celery、Redis Queue和Apache Kafka的比较。Kafka在处理高吞吐量数据流时表现最佳。",
    summary: "异步处理框架比较",
    tags: ["异步处理", "消息队列", "分布式系统"],
    project: "数据分析平台",
    projectId: "3",
    createdAt: "2024-01-07T14:00:00Z",
    lastAccessed: "2024-01-12T16:30:00Z",
    accessCount: 8,
    relevanceScore: 0.81,
    type: "document",
    size: 700,
    importance: "medium"
  },
  {
    id: "10",
    content: "用户询问如何评估模型的性能指标，包括准确率、召回率、F1值和AUC-ROC曲线等。",
    summary: "模型性能指标咨询",
    tags: ["模型评估", "性能指标", "机器学习"],
    project: "AI客服助手",
    projectId: "1",
    createdAt: "2024-01-06T10:30:00Z",
    lastAccessed: "2024-01-11T14:20:00Z",
    accessCount: 13,
    relevanceScore: 0.88,
    type: "conversation",
    size: 900,
    importance: "high"
  },
  {
    id: "11",
    content: "系统监控方案：Prometheus + Grafana的部署和配置。实时监控可以帮助及时发现和解决系统问题。",
    summary: "系统监控方案设计",
    tags: ["监控", "Prometheus", "Grafana", "DevOps"],
    project: "数据分析平台",
    projectId: "3",
    createdAt: "2024-01-05T16:45:00Z",
    lastAccessed: "2024-01-10T13:30:00Z",
    accessCount: 9,
    relevanceScore: 0.82,
    type: "document",
    size: 1000,
    importance: "medium"
  },
  {
    id: "12",
    content: "内容生成模型：GPT、BERT和T5的比较。GPT在生成类任务中表现最佳，BERT适合理解类任务。",
    summary: "内容生成模型比较",
    tags: ["内容生成", "GPT", "BERT", "NLP"],
    project: "内容生成器",
    projectId: "2",
    createdAt: "2024-01-04T10:00:00Z",
    lastAccessed: "2024-01-09T14:20:00Z",
    accessCount: 12,
    relevanceScore: 0.89,
    type: "document",
    size: 950,
    importance: "high"
  }
]

export const useMemoryStore = defineStore('memory', () => {
  const memories = ref<Memory[]>(initialMemories)

  const getMemoriesByProjectId = (projectId: string) => {
    return computed(() => memories.value.filter(m => m.projectId === projectId))
  }

  const getMemoryById = (id: string) => {
    return memories.value.find(m => m.id === id)
  }

  const addMemory = (memory: Omit<Memory, 'id' | 'createdAt'>) => {
    const newMemory: Memory = {
      ...memory,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
    }
    memories.value.unshift(newMemory)
    return newMemory
  }

  const updateMemory = (id: string, updates: Partial<Omit<Memory, 'id' | 'projectId' | 'createdAt'>>) => {
    const index = memories.value.findIndex(m => m.id === id)
    if (index !== -1) {
      memories.value[index] = { ...memories.value[index], ...updates }
    }
  }

  const removeMemory = (id: string) => {
    memories.value = memories.value.filter(m => m.id !== id)
  }

  // 批量删除记忆
  const removeMemories = (ids: string[]) => {
    memories.value = memories.value.filter(m => !ids.includes(m.id))
  }

  // 获取记忆统计信息
  const getMemoryStats = (projectId?: string) => {
    const filteredMemories = projectId 
      ? memories.value.filter(m => m.projectId === projectId)
      : memories.value
    
    return {
      totalCount: filteredMemories.length,
      totalSize: filteredMemories.reduce((sum, m) => sum + (m.content.length), 0),
      averageRelevance: filteredMemories.length > 0 
        ? filteredMemories.reduce((sum, m) => sum + (m.importance === 'high' ? 0.8 : m.importance === 'medium' ? 0.5 : 0.2), 0) / filteredMemories.length
        : 0,
      totalAccessCount: 0
    }
  }

  // 获取项目列表
  const getProjects = () => {
    return Array.from(new Set(memories.value.map(m => m.project)))
  }

  // 获取记忆重要性列表
  const getImportanceLevels = () => {
    return ['low', 'medium', 'high']
  }

  // 高级搜索和过滤功能
  const searchMemories = (
    projectId: string,
    searchTerm: string = '',
    filters: {
      importance?: string[],
      tags?: string[],
      dateFrom?: string,
      dateTo?: string
    } = {},
    sortBy: 'createdAt' | 'importance' = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc'
  ) => {
    let filteredMemories = memories.value.filter(m => m.projectId === projectId)
    
    // 应用搜索词过滤
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filteredMemories = filteredMemories.filter(m => 
        m.content.toLowerCase().includes(term) || 
        m.summary.toLowerCase().includes(term) ||
        m.tags.some(tag => tag.toLowerCase().includes(term))
      )
    }
    
    // 应用重要性过滤
    if (filters.importance && filters.importance.length > 0) {
      filteredMemories = filteredMemories.filter(m => filters.importance!.includes(m.importance))
    }
    
    // 应用标签过滤
    if (filters.tags && filters.tags.length > 0) {
      filteredMemories = filteredMemories.filter(m => 
        filters.tags!.some(tag => m.tags.includes(tag))
      )
    }
    
    // 应用日期范围过滤
    if (filters.dateFrom) {
      filteredMemories = filteredMemories.filter(m => m.createdAt >= filters.dateFrom!)
    }
    
    if (filters.dateTo) {
      filteredMemories = filteredMemories.filter(m => m.createdAt <= filters.dateTo!)
    }
    
    // 应用排序
    filteredMemories.sort((a, b) => {
      let aValue, bValue
      switch (sortBy) {
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime()
          bValue = new Date(b.createdAt).getTime()
          break
        case 'importance':
          const importanceOrder = { 'low': 1, 'medium': 2, 'high': 3 }
          aValue = importanceOrder[a.importance]
          bValue = importanceOrder[b.importance]
          break
        default:
          aValue = new Date(a.createdAt).getTime()
          bValue = new Date(b.createdAt).getTime()
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
    
    return filteredMemories
  }

    // 导出记忆数据
  const exportMemories = async (projectId?: string) => {
    try {
      // 创建要导出的数据副本
      const exportData = memories.value.map(memory => ({
        id: memory.id,
        content: memory.content,
        summary: memory.summary,
        tags: memory.tags,
        project: memory.project,
        createdAt: memory.createdAt,
        importance: memory.importance,
        projectId: memory.projectId
      }))

      // 如果指定了项目ID，只导出该项目的记忆
      const filteredData = projectId 
        ? exportData.filter(memory => memory.projectId === projectId)
        : exportData

      // 创建Blob并下载
      const blob = new Blob([JSON.stringify(filteredData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `memories-${projectId || 'all'}-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
      
      return { success: true, count: filteredData.length }
    } catch (error) {
      console.error('导出记忆失败:', error)
      return { success: false, error: error instanceof Error ? error.message : '未知错误' }
    }
  }

  // 导入记忆数据
  const importMemories = async (file: File, projectId?: string) => {
    try {
      // 读取文件内容
      const fileContent = await file.text()
      const importData = JSON.parse(fileContent)

      // 验证数据格式
      if (!Array.isArray(importData)) {
        throw new Error('文件格式不正确，请确保是记忆数据的JSON数组')
      }

      // 调用API导入数据
      const response = await memoriesApi.import({
        data: importData,
        userId: 'current-user', // 实际应用中应该从认证状态获取
        projectId
      })

      if (response.data) {
        // 更新本地状态
        const newMemories = importData.map((item: any, index: number) => ({
          id: item.id || `imported-${Date.now()}-${index}`,
          content: item.content || item.summary || '导入的记忆内容',
          summary: item.summary || item.content?.substring(0, 50) + '...' || '导入的记忆',
          tags: item.tags || ['导入'],
          project: item.project || '默认项目',
          projectId: item.projectId || projectId || 'default-project',
          createdAt: item.createdAt || new Date().toISOString(),
          lastAccessed: item.lastAccessed || new Date().toISOString(),
          accessCount: item.accessCount || 0,
          relevanceScore: item.relevanceScore || 0.5,
          type: item.type || 'document',
          size: item.size || JSON.stringify(item).length,
          importance: item.importance || 'medium'
        }))

        // 添加新记忆到现有记忆列表的开头
        memories.value.unshift(...newMemories)
        
        return { success: true, count: newMemories.length }
      } else {
        throw new Error('导入失败，请检查数据格式')
      }
    } catch (error) {
      console.error('导入记忆失败:', error)
      if (error instanceof SyntaxError) {
        throw new Error('文件格式错误，请确保是有效的JSON文件')
      } else {
        throw error
      }
    }
  }

  return {
    memories,
    getMemoriesByProjectId,
    addMemory,
    updateMemory,
    removeMemory,
    removeMemories,
    getMemoryStats,
    getProjects,
    getImportanceLevels,
    searchMemories,
    exportMemories,
    importMemories
  }
})
