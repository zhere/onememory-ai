<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          记忆管理
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          管理和优化 Onememory 的智能记忆系统
        </p>
      </div>
      <div class="flex items-center space-x-3">
        <router-link
          to="/knowledge-graph"
          class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          知识图谱
        </router-link>
        <button 
          @click="handleImportClick"
          :disabled="isImporting"
          class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {{ isImporting ? '导入中...' : '导入' }}
        </button>
        <input
          ref="fileInputRef"
          type="file"
          accept=".json"
          @change="handleFileChange"
          class="hidden"
        />
        <button
          v-if="selectedMemories.length > 0"
          @click="handleExportMemories"
          class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          导出 ({{ selectedMemories.length }})
        </button>
        <button
          v-if="selectedMemories.length > 0"
          @click="handleDeleteMemories"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          删除 ({{ selectedMemories.length }})
        </button>
      </div>
    </div>



    <!-- 统计信息 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      <div class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border-l-4 border-blue-500">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  总记忆数
                </dt>
                <dd class="text-lg font-bold text-gray-900 dark:text-white">
                  {{ memories.length }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border-l-4 border-green-500">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  平均相关性
                </dt>
                <dd class="text-lg font-bold text-gray-900 dark:text-white">
                  {{ (averageRelevance * 100).toFixed(1) }}%
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border-l-4 border-purple-500">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <Database class="h-6 w-6 text-purple-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  总大小
                </dt>
                <dd class="text-lg font-bold text-gray-900 dark:text-white">
                  {{ formatSize(totalSize) }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border-l-4 border-yellow-500">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  总访问次数
                </dt>
                <dd class="text-lg font-bold text-gray-900 dark:text-white">
                  {{ totalAccessCount }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <!-- 新增：知识图谱关联统计 -->
      <div class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border-l-4 border-indigo-500">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <Network class="h-6 w-6 text-indigo-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  关联实体数
                </dt>
                <dd class="text-lg font-bold text-gray-900 dark:text-white">
                  {{ totalEntities }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>



    <!-- 搜索和筛选 -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="md:col-span-2">
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索记忆内容、标签..."
              class="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <select
            v-model="selectedProject"
            class="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">所有项目</option>
            <option v-for="project in projects" :key="project" :value="project">{{ project }}</option>
          </select>
        </div>

        <div>
          <select
            v-model="selectedType"
            class="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">所有类型</option>
            <option v-for="type in types" :key="type" :value="type">{{ getTypeText(type) }}</option>
          </select>
        </div>
      </div>

      <div class="mt-4 flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <span class="text-sm text-gray-500 dark:text-gray-400">
            排序方式:
          </span>
          <select
            v-model="sortBy"
            class="text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="relevance">相关性</option>
            <option value="recent">最近访问</option>
            <option value="access">访问次数</option>
            <option value="size">大小</option>
          </select>
        </div>

        <div class="flex items-center space-x-2">
          <span class="text-sm text-gray-500 dark:text-gray-400">
            显示 {{ sortedMemories.length }} 条记忆
          </span>
          <button
            v-if="selectedMemories.length === 0"
            @click="selectAllMemories"
            class="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            全选
          </button>
          <button
            v-else
            @click="clearSelection"
            class="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
          >
            取消选择
          </button>
        </div>
      </div>
    </div>

    <!-- 简化的记忆列表 -->
    <div class="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
      <div v-if="sortedMemories.length === 0" class="text-center py-12">
        <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">没有找到记忆</h3>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {{ searchQuery || selectedProject !== "all" || selectedType !== "all" ? "尝试调整搜索条件或筛选器" : "系统中还没有记忆数据" }}
        </p>
      </div>
      
      <ul v-else class="divide-y divide-gray-200 dark:divide-gray-700">
        <li v-for="memory in sortedMemories" :key="memory.id">
          <div class="px-4 py-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-700">
            <div class="flex items-start space-x-4">
              <div class="flex-shrink-0 pt-1">
                <input
                  type="checkbox"
                  :checked="selectedMemories.includes(memory.id)"
                  @change="toggleMemorySelection(memory.id)"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              <div 
                class="flex-1 min-w-0 cursor-pointer rounded-md p-2 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:scale-[1.01]"
                @click="handleMemoryItemClick(memory)"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-2">
                    <p class="text-sm font-medium text-gray-900 dark:text-white">{{ memory.summary }}</p>
                    <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', getTypeColor(memory.type)]">{{ getTypeText(memory.type) }}</span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span class="text-sm text-gray-500 dark:text-gray-400">相关性: {{ (memory.relevanceScore * 100).toFixed(1) }}%</span>
                    <button 
                      class="p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600"
                      @click.stop="handleMemoryItemClick(memory)"
                    >
                      <Eye class="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p class="mt-1 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{{ memory.content }}</p>
                <div class="mt-2 flex items-center justify-between">
                  <div class="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                    <div>{{ formatDate(memory.createdAt) }}</div>
                    <div>{{ memory.accessCount }} 次访问</div>
                    <div>{{ formatSize(memory.size) }}</div>
                    <div>{{ memory.project }}</div>
                  </div>
                  <div class="flex items-center space-x-1">
                    <span
                      v-for="(tag, index) in memory.tags"
                      :key="index"
                      class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                    >
                      <Tag class="w-2 h-2 mr-1" />{{ tag }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>


  </div>
</template>

<script setup lang="ts">
// 导入组件
import { ref, computed } from 'vue'
import { useToast } from 'vue-toastification'
import { useRouter } from 'vue-router'
import { Database, Tag, Eye, Network } from 'lucide-vue-next'

// 记忆条目接口
interface MemoryEntry {
  id: string
  content: string
  summary: string
  tags: string[]
  project: string
  createdAt: string
  lastAccessed: string
  accessCount: number
  relevanceScore: number
  type: "conversation" | "document" | "context" | "knowledge"
  size: number
}

// 状态变量
const searchQuery = ref('')
const selectedProject = ref('all')
const selectedType = ref('all')
const sortBy = ref('relevance')
const selectedMemories = ref<string[]>([])
const memories = ref<MemoryEntry[]>([])
const isImporting = ref(false)
const fileInputRef = ref<HTMLInputElement>()

// 模拟数据
const mockMemories: MemoryEntry[] = [
  {
    id: "1",
    content: "用户询问关于AI模型训练的最佳实践，包括数据预处理、模型选择和超参数调优等方面的详细信息。",
    summary: "AI模型训练最佳实践咨询",
    tags: ["AI", "机器学习", "训练", "最佳实践"],
    project: "AI客服助手",
    createdAt: "2024-01-15T10:30:00Z",
    lastAccessed: "2024-01-16T14:20:00Z",
    accessCount: 15,
    relevanceScore: 0.92,
    type: "conversation",
    size: 1024
  },
  {
    id: "2",
    content: "技术文档：深度学习模型的部署策略，包括模型优化、推理加速和资源管理等关键技术点。",
    summary: "深度学习模型部署策略文档",
    tags: ["深度学习", "部署", "优化", "推理"],
    project: "内容生成器",
    createdAt: "2024-01-14T09:15:00Z",
    lastAccessed: "2024-01-16T11:45:00Z",
    accessCount: 8,
    relevanceScore: 0.87,
    type: "document",
    size: 2048
  },
  {
    id: "3",
    content: "用户反馈：系统响应速度需要优化，建议增加缓存机制和异步处理能力。",
    summary: "系统性能优化建议",
    tags: ["性能", "优化", "缓存", "异步"],
    project: "数据分析平台",
    createdAt: "2024-01-13T16:45:00Z",
    lastAccessed: "2024-01-15T13:30:00Z",
    accessCount: 12,
    relevanceScore: 0.78,
    type: "context",
    size: 512
  }
]

// 记忆选择功能
const toggleMemorySelection = (memoryId: string) => {
  if (selectedMemories.value.includes(memoryId)) {
    selectedMemories.value = selectedMemories.value.filter(id => id !== memoryId)
  } else {
    selectedMemories.value.push(memoryId)
  }
}

// 格式化函数
const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleString('zh-CN')
}

const getTypeColor = (type: string): string => {
  switch (type) {
    case 'conversation':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    case 'document':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case 'context':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    case 'knowledge':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
  }
}

const getTypeText = (type: string): string => {
  switch (type) {
    case 'conversation':
      return '对话'
    case 'document':
      return '文档'
    case 'context':
      return '上下文'
    case 'knowledge':
      return '知识'
    default:
      return '未知'
  }
}

// 动态生成项目列表
const projects = computed(() => {
  return Array.from(new Set(memories.value.map(m => m.project)))
})

// 记忆类型
const types = ref(["conversation", "document", "context", "knowledge"])

// 筛选后的记忆列表
const filteredMemories = computed(() => {
  return memories.value.filter(memory => {
    const matchesSearch = memory.content.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         memory.summary.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         memory.tags.some(tag => tag.toLowerCase().includes(searchQuery.value.toLowerCase()))
    const matchesProject = selectedProject.value === "all" || memory.project === selectedProject.value
    const matchesType = selectedType.value === "all" || memory.type === selectedType.value
    return matchesSearch && matchesProject && matchesType
  })
})

// 排序后的记忆列表
const sortedMemories = computed(() => {
  return [...filteredMemories.value].sort((a, b) => {
    switch (sortBy.value) {
      case 'relevance':
        return b.relevanceScore - a.relevanceScore
      case 'recent':
        return new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime()
      case 'access':
        return b.accessCount - a.accessCount
      case 'size':
        return b.size - a.size
      default:
        return 0
    }
  })
})

// 统计信息计算
const averageRelevance = computed(() => {
  if (memories.value.length === 0) return 0
  const total = memories.value.reduce((sum, memory) => sum + memory.relevanceScore, 0)
  return total / memories.value.length
})

const totalSize = computed(() => {
  return memories.value.reduce((sum, memory) => sum + memory.size, 0)
})

const totalAccessCount = computed(() => {
  return memories.value.reduce((sum, memory) => sum + memory.accessCount, 0)
})

// 新增：计算关联实体数量（基于标签去重）
const totalEntities = computed(() => {
  if (memories.value.length === 0) return 0
  // 将所有记忆的标签合并并去重，作为关联实体的近似统计
  const allTags = new Set<string>()
  memories.value.forEach(memory => {
    memory.tags.forEach(tag => allTags.add(tag))
  })
  return allTags.size
})

// 初始化toast实例
const toast = useToast()
const router = useRouter()

// 处理记忆项点击，跳转到详情页面
const handleMemoryItemClick = (memory: MemoryEntry) => {
  router.push(`/memory/${memory.id}`)
}

// 导入功能
const handleImportClick = () => {
  if (fileInputRef.value) {
    fileInputRef.value.click()
  }
}

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  isImporting.value = true
  
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string
      const importedMemories = JSON.parse(content)
      
      if (Array.isArray(importedMemories)) {
        // 验证导入的数据结构
        const validMemories = importedMemories.filter(memory => 
          memory.content || memory.summary
        )
        
        // 转换导入的数据格式
        const newMemories = validMemories.map((item: any, index: number) => ({
          id: `imported-${Date.now()}-${index}`,
          content: item.content || item.summary || '导入的记忆内容',
          summary: item.summary || item.content?.substring(0, 50) + '...' || '导入的记忆',
          tags: item.tags || ['导入'],
          project: item.project || selectedProject.value !== 'all' ? selectedProject.value : '默认项目',
          createdAt: item.createdAt || new Date().toISOString(),
          lastAccessed: new Date().toISOString(),
          accessCount: item.accessCount || 0,
          relevanceScore: item.relevanceScore || 0.5,
          type: (item.type || 'document') as any,
          size: item.size || JSON.stringify(item).length
        }))
        
        memories.value = [...newMemories, ...memories.value]
        toast.success(`成功导入 ${newMemories.length} 条记忆数据`)
      } else {
        toast.error('导入的文件格式不正确')
      }
    } catch (error) {
      console.error('导入失败:', error)
      toast.error('导入失败：文件格式错误')
    } finally {
      isImporting.value = false
      if (target) {
        target.value = ''
      }
    }
  }
  
  reader.readAsText(file)
}

// 导出功能
const handleExportMemories = () => {
  if (selectedMemories.value.length === 0) return
  
  const selected = memories.value.filter(memory => selectedMemories.value.includes(memory.id))
  const dataStr = JSON.stringify(selected, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  
  const link = document.createElement('a')
  link.href = URL.createObjectURL(dataBlob)
  link.download = `memories.json`
  link.click()
  
  toast.success(`成功导出 ${selectedMemories.value.length} 条记忆数据`)
}

// 删除功能
const handleDeleteMemories = () => {
  if (selectedMemories.value.length === 0) return
  
  const deleteCount = selectedMemories.value.length
  
  if (confirm(`确定要删除选中的 ${deleteCount} 条记忆吗？`)) {
    memories.value = memories.value.filter(memory => !selectedMemories.value.includes(memory.id))
    selectedMemories.value = []
    toast.success(`成功删除 ${deleteCount} 条记忆数据`)
  }
}

// 全选功能
const selectAllMemories = () => {
  selectedMemories.value = sortedMemories.value.map(memory => memory.id)
}

const clearSelection = () => {
  selectedMemories.value = []
}

// 初始化数据
memories.value = JSON.parse(JSON.stringify(mockMemories))
</script>