<template>
  <div class="p-6">
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">融合搜索结果</h1>
      <p class="text-gray-600 dark:text-gray-400 mt-1">
        显示记忆与知识库融合搜索的结果
      </p>
    </div>

    <!-- 搜索框 -->
    <div class="mb-6">
      <div class="relative">
        <input
          v-model="searchQuery"
          @keyup.enter="performSearch"
          type="text"
          placeholder="输入搜索关键词..."
          class="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
        />
        <SearchIcon class="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
        <button
          @click="performSearch"
          class="absolute right-2 top-1.5 px-4 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          搜索
        </button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>

    <!-- 搜索结果 -->
    <div v-else-if="searchResults.length > 0">
      <div class="mb-4 flex justify-between items-center">
        <p class="text-gray-600 dark:text-gray-400">
          找到 {{ searchResults.length }} 条结果
        </p>
        <div class="flex space-x-2">
          <select
            v-model="sortBy"
            class="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          >
            <option value="score">按相关性排序</option>
            <option value="date">按时间排序</option>
          </select>
        </div>
      </div>

      <div class="space-y-4">
        <div
          v-for="(result, index) in sortedResults"
          :key="index"
          class="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700"
        >
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {{ result.title || '无标题' }}
              </h3>
              <p class="text-gray-700 dark:text-gray-300 mb-3">
                {{ truncateText(result.content, 200) }}
              </p>
              <div class="flex flex-wrap gap-2 mb-3">
                <span
                  v-if="result.sourceType"
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                >
                  {{ getSourceTypeName(result.sourceType) }}
                </span>
                <span
                  v-if="result.projectName"
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                >
                  {{ result.projectName }}
                </span>
              </div>
            </div>
            <div class="ml-4 text-right">
              <div
                class="text-sm font-medium"
                :class="getScoreColor(result.score)"
              >
                {{ (result.score * 100).toFixed(1) }}%
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {{ formatDate(result.timestamp) }}
              </div>
            </div>
          </div>
          <div class="mt-3 flex justify-between items-center">
            <div class="text-sm text-gray-500 dark:text-gray-400">
              <span v-if="result.source">来源: {{ result.source }}</span>
            </div>
            <button
              @click="viewDetail(result)"
              class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
            >
              查看详情
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 无结果 -->
    <div v-else class="text-center py-12">
      <SearchSlashIcon class="mx-auto h-12 w-12 text-gray-400" />
      <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">未找到结果</h3>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        尝试调整搜索关键词或检查数据源配置
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRAGStore } from '../stores/rag'
import { SearchIcon, SearchSlashIcon } from 'lucide-vue-next'

const ragStore = useRAGStore()

// Reactive data
const searchQuery = ref('')
const isLoading = ref(false)
const sortBy = ref('score')

// Computed properties
const searchResults = computed(() => ragStore.searchResults)

const sortedResults = computed(() => {
  if (sortBy.value === 'date') {
    return [...searchResults.value].sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    )
  }
  return [...searchResults.value].sort((a, b) => b.score - a.score)
})

// Methods
const performSearch = async () => {
  if (!searchQuery.value.trim()) return
  
  isLoading.value = true
  try {
    await ragStore.performSearch(searchQuery.value)
  } finally {
    isLoading.value = false
  }
}

const truncateText = (text, maxLength) => {
  if (!text) return ''
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

const getSourceTypeName = (type) => {
  const typeMap = {
    'memory': '记忆',
    'file': '文件',
    'web': '网页',
    'database': '数据库'
  }
  return typeMap[type] || type
}

const getScoreColor = (score) => {
  if (score >= 0.8) return 'text-green-600 dark:text-green-400'
  if (score >= 0.6) return 'text-blue-600 dark:text-blue-400'
  if (score >= 0.4) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-red-600 dark:text-red-400'
}

const formatDate = (timestamp) => {
  if (!timestamp) return ''
  return new Date(timestamp).toLocaleDateString('zh-CN')
}

const viewDetail = (result) => {
  // 在实际应用中，这里会导航到详情页面
  alert(`查看详情: ${result.title || result.content.substring(0, 30)}...`)
}

// 初始化时执行一次搜索（如果store中有结果）
onMounted(() => {
  if (searchResults.value.length > 0) {
    // 如果已经有搜索结果，则不需要重新搜索
    return
  }
})
</script>