
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useProjectStore } from './project'

export interface SegmentationConfig {
  id: string
  projectId: string
  enabled: boolean
  strategy: "semantic" | "fixed" | "adaptive" | "hybrid"
  maxChunkSize: number
  minChunkSize: number
  overlapSize: number
  semanticThreshold: number
  preserveStructure: boolean
  splitOnSentences: boolean
  splitOnParagraphs: boolean
  customDelimiters: string[]
  languageModel: string
  embeddingModel: string
}

const initialConfigs: SegmentationConfig[] = [
  {
    id: 'config-1',
    projectId: 'project-1',
    enabled: true,
    strategy: "semantic",
    maxChunkSize: 1000,
    minChunkSize: 100,
    overlapSize: 50,
    semanticThreshold: 0.7,
    preserveStructure: true,
    splitOnSentences: true,
    splitOnParagraphs: true,
    customDelimiters: ["\\n\\n", "\\n", "。", "！", "？"],
    languageModel: "gpt-3.5-turbo",
    embeddingModel: "text-embedding-ada-002"
  }
]

export const useSegmentationConfigStore = defineStore('segmentationConfig', () => {
  const projectStore = useProjectStore()
  const configs = ref<SegmentationConfig[]>(initialConfigs)

  const selectedProjectId = computed(() => projectStore.selectedProjectId)

  const getConfigByProjectId = (projectId: string | null) => {
    return computed(() => {
      if (!projectId) {
        return null
      }
      return configs.value.find(c => c.projectId === projectId)
    })
  }

  const updateConfig = (projectId: string, updates: Partial<Omit<SegmentationConfig, 'id' | 'projectId'>>) => {
    const index = configs.value.findIndex(c => c.projectId === projectId)
    if (index !== -1) {
      configs.value[index] = { ...configs.value[index], ...updates }
    }
  }

  const createConfigForProject = (projectId: string) => {
    const defaultConfig: Omit<SegmentationConfig, 'id' | 'projectId'> = {
      enabled: true,
      strategy: "semantic",
      maxChunkSize: 1000,
      minChunkSize: 100,
      overlapSize: 50,
      semanticThreshold: 0.7,
      preserveStructure: true,
      splitOnSentences: true,
      splitOnParagraphs: true,
      customDelimiters: ["\\n\\n", "\\n", "。", "！", "？"],
      languageModel: "gpt-3.5-turbo",
      embeddingModel: "text-embedding-ada-002"
    };
    
    const newConfig: SegmentationConfig = {
      id: `config-${Date.now()}`,
      projectId,
      ...defaultConfig
    };

    configs.value.push(newConfig);
  }

  return {
    configs,
    selectedProjectId,
    getConfigByProjectId,
    updateConfig,
    createConfigForProject
  }
})
