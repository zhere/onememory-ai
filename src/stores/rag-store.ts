import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// RAG知识源接口
interface RAGKnowledgeSource {
  id: string;
  name: string;
  type: string;
  config: Record<string, any>;
  priority: number;
  enabled: boolean;
  projectId: string;
  projectName?: string;
  lastSync?: string;
  documentCount?: number;
  status?: 'connected' | 'disconnected' | 'testing';
}

// 融合搜索策略接口
interface FusionStrategy {
  memoryWeight: number;
  ragWeight: number;
  timeDecay: number;
  relevanceBoost: number;
  maxResults: number;
  threshold: number;
}

// RAG搜索结果接口
interface RAGSearchResult {
  id: string;
  type: 'memory' | 'knowledge';
  content: string;
  score: number;
  source: string;
  metadata: {
    originalScore: number;
    fusionWeight: number;
    timestamp: Date;
    confidence: number;
    relevance: number;
    freshness: number;
  };
  highlights?: string[];
  relatedResults?: RAGSearchResult[];
}

// RAG状态接口
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
  
  // 方法
  setKnowledgeSources: (sources: RAGKnowledgeSource[]) => void;
  addKnowledgeSource: (source: RAGKnowledgeSource) => void;
  updateKnowledgeSource: (id: string, updates: Partial<RAGKnowledgeSource>) => void;
  removeKnowledgeSource: (id: string) => void;
  setSelectedSources: (sources: string[]) => void;
  toggleSourceSelection: (sourceId: string) => void;
  
  setFusionStrategy: (strategy: Partial<FusionStrategy>) => void;
  setSearchQuery: (query: string) => void;
  
  setSearchResults: (results: RAGSearchResult[]) => void;
  setSearchLoading: (loading: boolean) => void;
  setSearchError: (error: string | null) => void;
  
  setShowAdvancedSettings: (show: boolean) => void;
  setSelectedProjectId: (projectId: string) => void;
  
  // 搜索方法
  performSearch: (query?: string) => Promise<void>;
  refreshResults: () => Promise<void>;
  
  // 预设策略
  applyPresetStrategy: (preset: 'balanced' | 'memory-focused' | 'knowledge-focused' | 'recent') => void;
  
  // 重置方法
  resetSearch: () => void;
  resetAll: () => void;
}

// 默认融合策略
const defaultFusionStrategy: FusionStrategy = {
  memoryWeight: 0.7,
  ragWeight: 0.3,
  timeDecay: 0.1,
  relevanceBoost: 0.2,
  maxResults: 10,
  threshold: 0.7
};

// 预设策略配置
const presetStrategies = {
  balanced: { memoryWeight: 0.6, ragWeight: 0.4, timeDecay: 0.15, relevanceBoost: 0.2 },
  'memory-focused': { memoryWeight: 0.8, ragWeight: 0.2, timeDecay: 0.1, relevanceBoost: 0.15 },
  'knowledge-focused': { memoryWeight: 0.3, ragWeight: 0.7, timeDecay: 0.2, relevanceBoost: 0.25 },
  recent: { memoryWeight: 0.5, ragWeight: 0.5, timeDecay: 0.3, relevanceBoost: 0.3 }
};

// 创建RAG状态存储
export const useRAGStore = create<RAGState>()(
  persist(
    (set, get) => ({
      // 初始状态
      knowledgeSources: [],
      selectedSources: [],
      fusionStrategy: defaultFusionStrategy,
      searchQuery: '',
      searchResults: [],
      searchLoading: false,
      searchError: null,
      showAdvancedSettings: false,
      selectedProjectId: 'default',

      // 知识源管理方法
      setKnowledgeSources: (sources) => set({ knowledgeSources: sources }),
      
      addKnowledgeSource: (source) => set((state) => ({
        knowledgeSources: [...state.knowledgeSources, source]
      })),
      
      updateKnowledgeSource: (id, updates) => set((state) => ({
        knowledgeSources: state.knowledgeSources.map(source =>
          source.id === id ? { ...source, ...updates } : source
        )
      })),
      
      removeKnowledgeSource: (id) => set((state) => ({
        knowledgeSources: state.knowledgeSources.filter(source => source.id !== id),
        selectedSources: state.selectedSources.filter(sourceId => sourceId !== id)
      })),
      
      setSelectedSources: (sources) => set({ selectedSources: sources }),
      
      toggleSourceSelection: (sourceId) => set((state) => {
        const isSelected = state.selectedSources.includes(sourceId);
        return {
          selectedSources: isSelected
            ? state.selectedSources.filter(id => id !== sourceId)
            : [...state.selectedSources, sourceId]
        };
      }),

      // 搜索配置方法
      setFusionStrategy: (strategy) => set((state) => ({
        fusionStrategy: { ...state.fusionStrategy, ...strategy }
      })),
      
      setSearchQuery: (query) => set({ searchQuery: query }),

      // 搜索结果方法
      setSearchResults: (results) => set({ searchResults: results }),
      
      setSearchLoading: (loading) => set({ searchLoading: loading }),
      
      setSearchError: (error) => set({ searchError: error }),

      // UI状态方法
      setShowAdvancedSettings: (show) => set({ showAdvancedSettings: show }),
      
      setSelectedProjectId: (projectId) => set({ selectedProjectId: projectId }),

      // 搜索执行方法
      performSearch: async (query?: string) => {
        const state = get();
        const searchQuery = query || state.searchQuery;
        
        if (!searchQuery.trim()) {
          set({ searchError: '请输入搜索查询' });
          return;
        }

        set({ searchLoading: true, searchError: null });

        try {
          const response = await fetch('/api/v1/rag-knowledge/search', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              query: searchQuery,
              projectId: state.selectedProjectId,
              sources: state.selectedSources,
              limit: state.fusionStrategy.maxResults,
              threshold: state.fusionStrategy.threshold,
              fusionStrategy: {
                memoryWeight: state.fusionStrategy.memoryWeight,
                ragWeight: state.fusionStrategy.ragWeight,
                timeDecay: state.fusionStrategy.timeDecay,
                relevanceBoost: state.fusionStrategy.relevanceBoost
              },
              includeMetadata: true
            })
          });

          const data = await response.json();
          
          if (data.success) {
            set({ 
              searchResults: data.data.fusedResults || [],
              searchQuery: searchQuery
            });
          } else {
            set({ searchError: data.error || '搜索失败' });
          }
        } catch (error) {
          set({ searchError: '搜索请求失败' });
        } finally {
          set({ searchLoading: false });
        }
      },

      refreshResults: async () => {
        const state = get();
        if (state.searchQuery) {
          await get().performSearch(state.searchQuery);
        }
      },

      // 预设策略方法
      applyPresetStrategy: (preset) => {
        const presetConfig = presetStrategies[preset];
        if (presetConfig) {
          set((state) => ({
            fusionStrategy: { ...state.fusionStrategy, ...presetConfig }
          }));
        }
      },

      // 重置方法
      resetSearch: () => set({ 
        searchResults: [], 
        searchQuery: '', 
        searchError: null 
      }),
      
      resetAll: () => set({
        knowledgeSources: [],
        selectedSources: [],
        fusionStrategy: defaultFusionStrategy,
        searchQuery: '',
        searchResults: [],
        searchLoading: false,
        searchError: null,
        showAdvancedSettings: false,
        selectedProjectId: 'default'
      })
    }),
    {
      name: 'rag-store',
      partialize: (state) => ({
        // 只持久化配置相关的状态
        fusionStrategy: state.fusionStrategy,
        selectedSources: state.selectedSources,
        showAdvancedSettings: state.showAdvancedSettings,
        selectedProjectId: state.selectedProjectId
      })
    }
  )
);

// 选择器函数
export const useRAGKnowledgeSources = () => useRAGStore(state => state.knowledgeSources);
export const useSelectedSources = () => useRAGStore(state => state.selectedSources);
export const useFusionStrategy = () => useRAGStore(state => state.fusionStrategy);
export const useSearchResults = () => useRAGStore(state => state.searchResults);
export const useSearchLoading = () => useRAGStore(state => state.searchLoading);
export const useSearchError = () => useRAGStore(state => state.searchError);
export const useRAGUIState = () => useRAGStore(state => ({
  showAdvancedSettings: state.showAdvancedSettings,
  selectedProjectId: state.selectedProjectId
}));

// 操作方法导出
export const {
  setKnowledgeSources,
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
  setSelectedProjectId,
  performSearch,
  refreshResults,
  applyPresetStrategy,
  resetSearch,
  resetAll
} = useRAGStore.getState();