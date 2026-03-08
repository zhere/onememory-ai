<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          智能分段配置
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          配置文本智能分段策略和参数
        </p>
      </div>
      <div class="flex items-center space-x-3">
        <button
          @click="handleReset"
          class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
        >
          <RefreshCw class="w-4 h-4 mr-2" />
          重置
        </button>
        <button
          @click="handleSave"
          :disabled="isLoading || !config"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <Save v-if="!isLoading" class="w-4 h-4 mr-2" />
          <RefreshCw v-else class="w-4 h-4 mr-2 animate-spin" />
          保存配置
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- 配置面板 -->
      <div class="lg:col-span-2 space-y-6">
        <!-- 模块选择 -->
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div class="flex items-center mb-4">
            <Layers class="h-5 w-5 text-indigo-500 mr-2" />
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">
              模块配置选择
            </h3>
          </div>
          
          <div class="flex flex-wrap gap-2 mb-4">
            <button 
              v-for="module in modules" 
              :key="module.key"
              @click="selectedModule = module.key"
              :class="[
                'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                selectedModule === module.key 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              ]"
            >
              {{ module.label }}
            </button>
          </div>
          
          <div class="text-sm text-gray-500 dark:text-gray-400 mb-4">
            选择要配置的模块，不同模块可以有不同的分段策略
          </div>
        </div>
        
        <!-- 场景预设 -->
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div class="flex items-center mb-4">
            <LayoutGrid class="h-5 w-5 text-purple-500 mr-2" />
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">
              场景预设
            </h3>
          </div>
          
          <div class="flex flex-wrap gap-2">
            <button 
              v-for="scenario in scenarios" 
              :key="scenario.key"
              @click="applyScenario(scenario.key)"
              :class="[
                'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              ]"
            >
              {{ scenario.label }}
            </button>
          </div>
          
          <div class="text-sm text-gray-500 dark:text-gray-400 mt-2">
            快速应用预设场景配置，适用于常见文本类型
          </div>
        </div>
        
        <!-- 基础设置 -->
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div class="flex items-center mb-4">
            <Settings class="h-5 w-5 text-blue-500 mr-2" />
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">
              {{ modules.find(m => m.key === selectedModule)?.label }} 模块配置
            </h3>
          </div>

          <div class="space-y-4">
            <div>
              <label class="flex items-center">
                <input
                  type="checkbox"
                  v-model="config.enabled"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  启用智能分段
                </span>
              </label>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                分段策略
              </label>
              <select
                v-model="config.strategy"
                :disabled="!config.enabled"
                class="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
              >
                <option value="semantic">语义分段</option>
                <option value="fixed">固定长度</option>
                <option value="adaptive">自适应</option>
                <option value="hybrid">混合策略</option>
              </select>
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {{ getStrategyDescription(config.strategy) }}
              </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  最大分段长度
                </label>
                <input
                  type="number"
                  v-model.number="config.maxChunkSize"
                  :disabled="!config.enabled"
                  min="100"
                  max="5000"
                  class="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  最小分段长度
                </label>
                <input
                  type="number"
                  v-model.number="config.minChunkSize"
                  :disabled="!config.enabled"
                  min="10"
                  max="1000"
                  class="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  重叠长度
                </label>
                <input
                  type="number"
                  v-model.number="config.overlapSize"
                  :disabled="!config.enabled"
                  min="0"
                  max="200"
                  class="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                />
              </div>
            </div>

            <div v-if="config.strategy === 'semantic'">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                语义相似性阈值 ({{ config.semanticThreshold }})
              </label>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.1"
                v-model.number="config.semanticThreshold"
                :disabled="!config.enabled"
                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>低相似性</span>
                <span>高相似性</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 高级设置 -->
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div class="flex items-center mb-4">
            <Scissors class="h-5 w-5 text-purple-500 mr-2" />
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">
              高级设置
            </h3>
          </div>

          <div class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="flex items-center">
                  <input
                    type="checkbox"
                    v-model="config.preserveStructure"
                    :disabled="!config.enabled"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    保持文档结构
                  </span>
                </label>
              </div>

              <div>
                <label class="flex items-center">
                  <input
                    type="checkbox"
                    v-model="config.splitOnSentences"
                    :disabled="!config.enabled"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    按句子分割
                  </span>
                </label>
              </div>

              <div>
                <label class="flex items-center">
                  <input
                    type="checkbox"
                    v-model="config.splitOnParagraphs"
                    :disabled="!config.enabled"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    按段落分割
                  </span>
                </label>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                自定义分隔符
              </label>
              <textarea
                  rows="3"
                  v-model="customDelimitersText"
                  :disabled="!config.enabled"
                  placeholder="每行一个分隔符&#10;例如：\\n\\n, 。, ！, ？"
                  class="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  语言模型
                </label>
                <select
                  v-model="config.languageModel"
                  :disabled="!config.enabled"
                  class="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                >
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  <option value="gpt-4">GPT-4</option>
                  <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                  <option value="gemini-pro">Gemini Pro</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  嵌入模型
                </label>
                <select
                  v-model="config.embeddingModel"
                  :disabled="!config.enabled"
                  class="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                >
                  <option value="text-embedding-ada-002">OpenAI Ada-002</option>
                  <option value="text-embedding-3-small">OpenAI Embedding-3-Small</option>
                  <option value="text-embedding-3-large">OpenAI Embedding-3-Large</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 测试面板 -->
      <div class="space-y-6">
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div class="flex items-center mb-4">
            <FileText class="h-5 w-5 text-green-500 mr-2" />
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">
              分段测试
            </h3>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                测试文本
              </label>
              <textarea
                rows="8"
                v-model="testText"
                placeholder="输入要测试分段的文本..."
                class="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <button
              @click="handleTest"
              :disabled="isLoading || !testText.trim()"
              class="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              <Play v-if="!isLoading" class="w-4 h-4 mr-2" />
              <RefreshCw v-else class="w-4 h-4 mr-2 animate-spin" />
              运行测试
            </button>
          </div>
        </div>

        <!-- 测试结果 -->
        <div v-if="showTest && testResult.length > 0" class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
            分段结果 ({{ testResult.length }} 个分段)
          </h3>
          <div class="space-y-3 max-h-96 overflow-y-auto">
            <div
              v-for="(chunk, index) in testResult"
              :key="index"
              class="p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-700"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-medium text-gray-500 dark:text-gray-400">
                  分段 {{ index + 1 }}
                </span>
                <span class="text-xs text-gray-500 dark:text-gray-400">
                  {{ chunk.length }} 字符
                </span>
              </div>
              <p class="text-sm text-gray-700 dark:text-gray-300">
                {{ chunk }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { Save, RefreshCw, Play, Scissors, FileText, Settings, Layers, LayoutGrid } from 'lucide-vue-next'
import { useProjectStore } from '@/stores/project'
import { useSegmentationConfigStore, type SegmentationConfig } from '@/stores/segmentationConfig'

const projectStore = useProjectStore()
const { selectedProjectId } = storeToRefs(projectStore)

const segmentationConfigStore = useSegmentationConfigStore()
const { updateConfig, createConfigForProject } = segmentationConfigStore

// 模块定义
const modules = [
  { key: 'memory', label: '记忆模块' },
  { key: 'rag', label: 'RAG模块' },
  { key: 'context', label: '上下文模块' },
  { key: 'token', label: 'Token模块' }
]

// 场景预设
const scenarios = [
  { key: 'longDocument', label: '长文档' },
  { key: 'shortConversation', label: '短对话' },
  { key: 'codeSnippets', label: '代码片段' }
]

// 选中的模块
const selectedModule = ref('memory')

// 模块特定配置
const moduleConfigs = ref({
  memory: {
    enabled: true,
    strategy: "semantic",
    maxChunkSize: 512,
    minChunkSize: 100,
    overlapSize: 50,
    semanticThreshold: 0.7,
    preserveStructure: true,
    splitOnSentences: true,
    splitOnParagraphs: true,
    customDelimiters: ["\\n\\n", "\\n", "。", "！", "？"],
    languageModel: "gpt-3.5-turbo",
    embeddingModel: "text-embedding-ada-002"
  },
  rag: {
    enabled: true,
    strategy: "hybrid",
    maxChunkSize: 1500,
    minChunkSize: 200,
    overlapSize: 100,
    semanticThreshold: 0.7,
    preserveStructure: true,
    splitOnSentences: true,
    splitOnParagraphs: true,
    customDelimiters: ["\\n\\n", "\\n", "。", "！", "？"],
    languageModel: "gpt-3.5-turbo",
    embeddingModel: "text-embedding-3-small"
  },
  context: {
    enabled: true,
    strategy: "semantic",
    maxChunkSize: 2048,
    minChunkSize: 500,
    overlapSize: 200,
    semanticThreshold: 0.8,
    preserveStructure: true,
    splitOnSentences: true,
    splitOnParagraphs: true,
    customDelimiters: ["\\n\\n", "\\n", "。", "！", "？"],
    languageModel: "gpt-4",
    embeddingModel: "text-embedding-3-small"
  },
  token: {
    enabled: true,
    strategy: "fixed",
    maxChunkSize: 1024,
    minChunkSize: 200,
    overlapSize: 100,
    semanticThreshold: 0.7,
    preserveStructure: false,
    splitOnSentences: false,
    splitOnParagraphs: false,
    customDelimiters: ["\\n\\n", "\\n"],
    languageModel: "gpt-3.5-turbo",
    embeddingModel: "text-embedding-ada-002"
  }
})

// 当前配置（根据选中的模块动态计算）
const config = computed(() => {
  return moduleConfigs.value[selectedModule.value as keyof typeof moduleConfigs.value]
})

// 场景预设配置
const scenarioConfigs = {
  longDocument: {
    strategy: "hybrid",
    maxChunkSize: 2000,
    minChunkSize: 500,
    overlapSize: 200,
    semanticThreshold: 0.7,
    preserveStructure: true,
    splitOnSentences: true,
    splitOnParagraphs: true
  },
  shortConversation: {
    strategy: "semantic",
    maxChunkSize: 256,
    minChunkSize: 50,
    overlapSize: 50,
    semanticThreshold: 0.8,
    preserveStructure: true,
    splitOnSentences: true,
    splitOnParagraphs: false
  },
  codeSnippets: {
    strategy: "fixed",
    maxChunkSize: 1000,
    minChunkSize: 200,
    overlapSize: 50,
    semanticThreshold: 0.7,
    preserveStructure: true,
    splitOnSentences: false,
    splitOnParagraphs: false
  }
}

// 应用场景预设
const applyScenario = (scenarioKey: string) => {
  const scenarioConfig = scenarioConfigs[scenarioKey as keyof typeof scenarioConfigs]
  if (scenarioConfig) {
    const currentConfig = moduleConfigs.value[selectedModule.value as keyof typeof moduleConfigs.value]
    Object.assign(currentConfig, scenarioConfig)
  }
}

watch(selectedProjectId, (newProjectId) => {
  if (newProjectId) {
    const existingConfig = segmentationConfigStore.configs.find(c => c.projectId === newProjectId)
    if (existingConfig) {
      // 为所有模块设置相同的配置（向后兼容）
      Object.keys(moduleConfigs.value).forEach(moduleKey => {
        moduleConfigs.value[moduleKey as keyof typeof moduleConfigs.value] = {
          ...existingConfig,
          id: existingConfig.id,
          projectId: existingConfig.projectId
        }
      })
    } else {
      createConfigForProject(newProjectId)
      const newConfig = segmentationConfigStore.configs.find(c => c.projectId === newProjectId)
      if (newConfig) {
        // 为所有模块设置相同的配置（向后兼容）
        Object.keys(moduleConfigs.value).forEach(moduleKey => {
          moduleConfigs.value[moduleKey as keyof typeof moduleConfigs.value] = {
            ...newConfig,
            id: newConfig.id,
            projectId: newConfig.projectId
          }
        })
      }
    }
  }
}, { immediate: true })

const isLoading = ref(false)
const testText = ref("")
const testResult = ref<string[]>([])
const showTest = ref(false)

const customDelimitersText = computed({
  get: () => config.value?.customDelimiters.join('\n') || '',
  set: (value: string) => {
    if (config.value) {
      config.value.customDelimiters = value.split('\n').filter(Boolean)
    }
  }
})

const getStrategyDescription = (strategy: string) => {
  switch (strategy) {
    case "semantic":
      return "基于语义相似性进行智能分段，保持内容的逻辑连贯性"
    case "fixed":
      return "按固定字符数进行分段，简单快速但可能破坏语义"
    case "adaptive":
      return "根据内容结构自适应调整分段大小"
    case "hybrid":
      return "结合多种策略，在语义和结构之间找到平衡"
    default:
      return ""
  }
}

const handleSave = async () => {
  if (!config.value || !selectedProjectId.value) return
  isLoading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 保存当前选中模块的配置（向后兼容）
    const { id, projectId, ...updates } = config.value
    updateConfig(selectedProjectId.value, updates)
    
    // 控制台记录所有模块的配置（用于调试）
    console.log("所有模块配置:", JSON.stringify(moduleConfigs.value, null, 2))
    console.log(`✅ ${modules.find(m => m.key === selectedModule.value)?.label} 配置已保存`)
  } catch (error) {
    console.error("保存失败")
  } finally {
    isLoading.value = false
  }
}

const handleReset = () => {
  // 重置所有模块的配置
  const defaultConfigs = {
    memory: {
      enabled: true,
      strategy: "semantic",
      maxChunkSize: 512,
      minChunkSize: 100,
      overlapSize: 50,
      semanticThreshold: 0.7,
      preserveStructure: true,
      splitOnSentences: true,
      splitOnParagraphs: true,
      customDelimiters: ["\\n\\n", "\\n", "。", "！", "？"],
      languageModel: "gpt-3.5-turbo",
      embeddingModel: "text-embedding-ada-002"
    },
    rag: {
      enabled: true,
      strategy: "hybrid",
      maxChunkSize: 1500,
      minChunkSize: 200,
      overlapSize: 100,
      semanticThreshold: 0.7,
      preserveStructure: true,
      splitOnSentences: true,
      splitOnParagraphs: true,
      customDelimiters: ["\\n\\n", "\\n", "。", "！", "？"],
      languageModel: "gpt-3.5-turbo",
      embeddingModel: "text-embedding-3-small"
    },
    context: {
      enabled: true,
      strategy: "semantic",
      maxChunkSize: 2048,
      minChunkSize: 500,
      overlapSize: 200,
      semanticThreshold: 0.8,
      preserveStructure: true,
      splitOnSentences: true,
      splitOnParagraphs: true,
      customDelimiters: ["\\n\\n", "\\n", "。", "！", "？"],
      languageModel: "gpt-4",
      embeddingModel: "text-embedding-3-small"
    },
    token: {
      enabled: true,
      strategy: "fixed",
      maxChunkSize: 1024,
      minChunkSize: 200,
      overlapSize: 100,
      semanticThreshold: 0.7,
      preserveStructure: false,
      splitOnSentences: false,
      splitOnParagraphs: false,
      customDelimiters: ["\\n\\n", "\\n"],
      languageModel: "gpt-3.5-turbo",
      embeddingModel: "text-embedding-ada-002"
    }
  }
  
  Object.assign(moduleConfigs.value, defaultConfigs)
  console.log("✅ 所有模块配置已重置")
}

const handleTest = async () => {
  if (!testText.value.trim()) {
    console.error("请输入测试文本")
    return
  }

  isLoading.value = true
  try {
    // 模拟分段测试
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // 简单的分段模拟
    const chunks = testText.value.split(/[。！？\n\n]/).filter(chunk => chunk.trim().length > 0)
    testResult.value = chunks.map(chunk => chunk.trim())
    showTest.value = true
    console.log("分段测试完成")
  } catch (error) {
    console.error("测试失败")
  } finally {
    isLoading.value = false
  }
}
</script>
