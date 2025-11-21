import { useState, useEffect, useCallback } from 'react';

interface KnowledgeGraphFilters {
  selectedProject: string;
  searchQuery: string;
  selectedEntityType: string;
  minConfidence: number;
  timeRange: {
    start: string;
    end: string;
  } | null;
}

interface KnowledgeGraphState {
  filters: KnowledgeGraphFilters;
  lastVisitedPage: string;
  cache: Record<string, any>;
}

const DEFAULT_FILTERS: KnowledgeGraphFilters = {
  selectedProject: 'all',
  searchQuery: '',
  selectedEntityType: 'all',
  minConfidence: 0.5,
  timeRange: null
};

const DEFAULT_STATE: KnowledgeGraphState = {
  filters: DEFAULT_FILTERS,
  lastVisitedPage: '/knowledge-graph',
  cache: {}
};

const STORAGE_KEY = 'knowledge-graph-state';

export function useKnowledgeGraphState() {
  const [state, setState] = useState<KnowledgeGraphState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...DEFAULT_STATE, ...JSON.parse(saved) } : DEFAULT_STATE;
    } catch {
      return DEFAULT_STATE;
    }
  });

  // 保存状态到 localStorage
  const saveState = useCallback((newState: Partial<KnowledgeGraphState>) => {
    setState(prevState => {
      const updatedState = { ...prevState, ...newState };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedState));
      } catch (error) {
        console.warn('Failed to save knowledge graph state:', error);
      }
      return updatedState;
    });
  }, []);

  // 更新筛选器
  const updateFilters = useCallback((filters: Partial<KnowledgeGraphFilters>) => {
    saveState({
      filters: { ...state.filters, ...filters }
    });
  }, [state.filters, saveState]);

  // 重置筛选器
  const resetFilters = useCallback(() => {
    saveState({
      filters: DEFAULT_FILTERS
    });
  }, [saveState]);

  // 设置项目
  const setSelectedProject = useCallback((project: string) => {
    updateFilters({ selectedProject: project });
  }, [updateFilters]);

  // 设置搜索查询
  const setSearchQuery = useCallback((query: string) => {
    updateFilters({ searchQuery: query });
  }, [updateFilters]);

  // 设置实体类型
  const setSelectedEntityType = useCallback((entityType: string) => {
    updateFilters({ selectedEntityType: entityType });
  }, [updateFilters]);

  // 设置最小置信度
  const setMinConfidence = useCallback((confidence: number) => {
    updateFilters({ minConfidence: confidence });
  }, [updateFilters]);

  // 设置时间范围
  const setTimeRange = useCallback((timeRange: KnowledgeGraphFilters['timeRange']) => {
    updateFilters({ timeRange });
  }, [updateFilters]);

  // 更新最后访问的页面
  const setLastVisitedPage = useCallback((page: string) => {
    saveState({ lastVisitedPage: page });
  }, [saveState]);

  // 缓存数据
  const setCacheData = useCallback((key: string, data: any) => {
    saveState({
      cache: { ...state.cache, [key]: data }
    });
  }, [state.cache, saveState]);

  // 获取缓存数据
  const getCacheData = useCallback((key: string) => {
    return state.cache[key];
  }, [state.cache]);

  // 清除缓存
  const clearCache = useCallback((key?: string) => {
    if (key) {
      const newCache = { ...state.cache };
      delete newCache[key];
      saveState({ cache: newCache });
    } else {
      saveState({ cache: {} });
    }
  }, [state.cache, saveState]);

  // 获取项目相关的缓存键
  const getProjectCacheKey = useCallback((baseKey: string) => {
    return `${baseKey}_${state.filters.selectedProject}`;
  }, [state.filters.selectedProject]);

  // 项目切换时清除相关缓存
  useEffect(() => {
    const projectCacheKeys = Object.keys(state.cache).filter(key => 
      key.includes('_') && key.split('_').pop() !== state.filters.selectedProject
    );
    
    if (projectCacheKeys.length > 0) {
      const newCache = { ...state.cache };
      projectCacheKeys.forEach(key => delete newCache[key]);
      saveState({ cache: newCache });
    }
  }, [state.filters.selectedProject, state.cache, saveState]);

  return {
    // 状态
    filters: state.filters,
    lastVisitedPage: state.lastVisitedPage,
    
    // 筛选器操作
    updateFilters,
    resetFilters,
    setSelectedProject,
    setSearchQuery,
    setSelectedEntityType,
    setMinConfidence,
    setTimeRange,
    
    // 导航操作
    setLastVisitedPage,
    
    // 缓存操作
    setCacheData,
    getCacheData,
    clearCache,
    getProjectCacheKey,
    
    // 便捷方法
    isProjectSelected: state.filters.selectedProject !== 'all',
    hasActiveFilters: (
      state.filters.searchQuery !== '' ||
      state.filters.selectedEntityType !== 'all' ||
      state.filters.minConfidence !== 0.5 ||
      state.filters.timeRange !== null
    )
  };
}

// 项目数据类型
export interface Project {
  id: string;
  name: string;
  description: string;
  status: "active" | "inactive" | "maintenance";
}

// 统一的项目数据
export const mockProjects: Project[] = [
  { id: "1", name: "AI客服助手", description: "智能客服系统", status: "active" },
  { id: "2", name: "内容生成器", description: "AI内容创作工具", status: "active" },
  { id: "3", name: "数据分析平台", description: "企业数据分析", status: "maintenance" }
];

// 获取项目显示名称
export function getProjectDisplayName(projectId: string): string {
  if (projectId === 'all') return '所有项目';
  const project = mockProjects.find(p => p.name === projectId);
  return project ? project.name : projectId;
}