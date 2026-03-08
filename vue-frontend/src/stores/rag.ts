import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useProjectStore } from './project'

// RAG知识源接口
export interface RAGKnowledgeSource {
  id: string
  projectId: string
  name: string
  type: 'elasticsearch' | 'chroma' | 'weaviate' | 'local_files' | 'api' | 'file' | 'web' | 'database'
  config: Record<string, any>
  status: 'connected' | 'disconnected' | 'testing'
  enabled: boolean
  priority: number
  documentCount?: number
  lastSync?: string
  projectName?: string
}

// 融合搜索策略接口
export interface FusionStrategy {
  memoryWeight: number
  ragWeight: number
  timeDecay: number
  relevanceBoost: number
  maxResults: number
  threshold: number
}

// RAG搜索结果接口
export interface RAGSearchResult {
  id: string
  type: 'memory' | 'knowledge'
  content: string
  score: number
  source: string
  metadata: {
    originalScore: number
    fusionWeight: number
    timestamp: Date
    confidence: number
    relevance: number
    freshness: number
  }
  highlights?: string[]
  relatedResults?: RAGSearchResult[]
}

const initialKnowledgeSources: RAGKnowledgeSource[] = [
  {
    id: '1',
    name: 'Elasticsearch测试源',
    type: 'elasticsearch',
    config: { host: 'localhost:9200', index: 'test' },
    priority: 8,
    enabled: true,
    projectId: '1',
    projectName: 'AI客服助手',
    status: 'connected',
    documentCount: 1250,
    lastSync: new Date().toISOString()
  },
  {
    id: '2',
    name: 'ChromaDB向量化存储',
    type: 'chroma',
    config: { host: 'localhost:8000', collection: 'memories' },
    priority: 6,
    enabled: true,
    projectId: '2',
    projectName: '内容生成器',
    status: 'disconnected',
    documentCount: 0
  }
]

// 默认融合策略
const defaultFusionStrategy: FusionStrategy = {
  memoryWeight: 0.7,
  ragWeight: 0.3,
  timeDecay: 0.1,
  relevanceBoost: 0.2,
  maxResults: 10,
  threshold: 0.7
}

// 预设策略配置
const presetStrategies = {
  balanced: { memoryWeight: 0.6, ragWeight: 0.4, timeDecay: 0.15, relevanceBoost: 0.2 },
  'memory-focused': { memoryWeight: 0.8, ragWeight: 0.2, timeDecay: 0.1, relevanceBoost: 0.15 },
  'knowledge-focused': { memoryWeight: 0.3, ragWeight: 0.7, timeDecay: 0.2, relevanceBoost: 0.25 },
  recent: { memoryWeight: 0.5, ragWeight: 0.5, timeDecay: 0.3, relevanceBoost: 0.3 }
}

export const useRAGStore = defineStore('rag', () => {
  const projectStore = useProjectStore()
  const knowledgeSources = ref<RAGKnowledgeSource[]>(initialKnowledgeSources)
  const searchResults = ref<RAGSearchResult[]>([])
  const selectedSources = ref<string[]>([])
  const fusionStrategy = ref<FusionStrategy>(defaultFusionStrategy)
  const searchQuery = ref('')
  const searchLoading = ref(false)
  const searchError = ref<string | null>(null)
  const showAdvancedSettings = ref(false)

  const selectedProjectId = computed(() => projectStore.selectedProjectId)

  const addKnowledgeSource = (source: RAGKnowledgeSource) => {
    knowledgeSources.value.push(source)
  }

  const updateKnowledgeSource = (id: string, updates: Partial<RAGKnowledgeSource>) => {
    const index = knowledgeSources.value.findIndex(s => s.id === id)
    if (index !== -1) {
      knowledgeSources.value[index] = { ...knowledgeSources.value[index], ...updates }
    }
  }

  const removeKnowledgeSource = (id: string) => {
    knowledgeSources.value = knowledgeSources.value.filter(s => s.id !== id)
  }

  // 新增的方法
  const setSelectedSources = (sources: string[]) => {
    selectedSources.value = sources
  }

  const toggleSourceSelection = (sourceId: string) => {
    const index = selectedSources.value.indexOf(sourceId)
    if (index !== -1) {
      selectedSources.value.splice(index, 1)
    } else {
      selectedSources.value.push(sourceId)
    }
  }

  const setFusionStrategy = (strategy: Partial<FusionStrategy>) => {
    fusionStrategy.value = { ...fusionStrategy.value, ...strategy }
  }

  const setSearchQuery = (query: string) => {
    searchQuery.value = query
  }

  const setSearchResults = (results: RAGSearchResult[]) => {
    searchResults.value = results
  }

  const setSearchLoading = (loading: boolean) => {
    searchLoading.value = loading
  }

  const setSearchError = (error: string | null) => {
    searchError.value = error
  }

  const setShowAdvancedSettings = (show: boolean) => {
    showAdvancedSettings.value = show
  }

  const applyPresetStrategy = (preset: keyof typeof presetStrategies) => {
    const presetConfig = presetStrategies[preset]
    if (presetConfig) {
      fusionStrategy.value = { ...fusionStrategy.value, ...presetConfig }
    }
  }

  const resetSearch = () => {
    searchResults.value = []
    searchQuery.value = ''
    searchError.value = null
  }

  const performSearch = async (query?: string) => {
    const searchQueryValue = query || searchQuery.value
    
    if (!searchQueryValue.trim()) {
      searchError.value = '请输入搜索查询'
      return
    }

    searchLoading.value = true
    searchError.value = null

    try {
      const response = await fetch('/api/v1/rag-knowledge/search', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: searchQueryValue,
          projectId: selectedProjectId.value,
          sources: selectedSources.value,
          limit: fusionStrategy.value.maxResults,
          threshold: fusionStrategy.value.threshold,
          fusionStrategy: {
            memoryWeight: fusionStrategy.value.memoryWeight,
            ragWeight: fusionStrategy.value.ragWeight,
            timeDecay: fusionStrategy.value.timeDecay,
            relevanceBoost: fusionStrategy.value.relevanceBoost
          },
          includeMetadata: true
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setSearchResults(data.data.fusedResults || [])
        setSearchQuery(searchQueryValue)
      } else {
        setSearchError(data.error || '搜索失败')
      }
    } catch (error) {
      setSearchError('搜索请求失败')
    } finally {
      searchLoading.value = false
    }
  }

  const refreshResults = async () => {
    if (searchQuery.value) {
      await performSearch(searchQuery.value)
    }
  }

  return {
    knowledgeSources,
    searchResults,
    selectedSources,
    fusionStrategy,
    searchQuery,
    searchLoading,
    searchError,
    showAdvancedSettings,
    selectedProjectId,
    addKnowledgeSource,
    updateKnowledgeSource,
    removeKnowledgeSource,
    setSelectedSources,
    toggleSourceSelection,
    setFusionStrategy,
    setSearchQuery,
    setSearchResults,
    setSearchLoading,
    setSearchError,
    setShowAdvancedSettings,
    applyPresetStrategy,
    resetSearch,
    performSearch,
    refreshResults
  }
})
