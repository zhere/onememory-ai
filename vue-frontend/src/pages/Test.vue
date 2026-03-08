<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="p-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">Vue迁移测试</h1>
      <p class="text-gray-600 dark:text-gray-300 mb-6">前端代码已成功迁移到Vue 3</p>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 class="text-lg font-semibold mb-2">组件迁移</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">所有页面组件已迁移完成</p>
        </div>
        
        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 class="text-lg font-semibold mb-2">状态管理</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">Pinia状态管理已配置</p>
        </div>
        
        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 class="text-lg font-semibold mb-2">路由配置</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">Vue Router已设置完成</p>
        </div>
      </div>
      
      <div class="mt-8 space-y-6">
        <!-- 主题切换测试 -->
        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 class="text-lg font-semibold mb-4">主题管理测试</h3>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <span>当前主题: <span class="font-mono">{{ themeStore.isDark ? '暗色' : '亮色' }}</span></span>
              <button 
                @click="toggleTheme" 
                class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                切换主题
              </button>
            </div>
          </div>
        </div>

        <!-- RAG搜索测试 -->
        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 class="text-lg font-semibold mb-4">RAG搜索测试</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2">搜索查询:</label>
              <input 
                v-model="testQuery" 
                type="text" 
                placeholder="输入测试搜索词..."
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
            </div>
            <div class="flex space-x-2">
              <button 
                @click="testSearch" 
                :disabled="!testQuery.trim() || ragStore.searchLoading"
                class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 transition-colors"
              >
                {{ ragStore.searchLoading ? '搜索中...' : '测试搜索' }}
              </button>
              <button 
                @click="clearSearch" 
                class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                清除结果
              </button>
            </div>
            
            <!-- 搜索结果状态 -->
            <div v-if="ragStore.searchError" class="p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded">
              错误: {{ ragStore.searchError }}
            </div>
            
            <div v-if="ragStore.searchResults.length > 0" class="p-3 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded">
              找到 {{ ragStore.searchResults.length }} 个结果
            </div>
            
            <div v-if="ragStore.searchQuery && !ragStore.searchLoading && ragStore.searchResults.length === 0" class="p-3 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded">
              未找到结果
            </div>
          </div>
        </div>

        <!-- 导航链接 -->
        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 class="text-lg font-semibold mb-4">页面导航</h3>
          <div class="flex flex-wrap gap-2">
            <router-link to="/dashboard" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
              仪表板
            </router-link>
            <router-link to="/projects" class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors">
              项目管理
            </router-link>
            <router-link to="/memory" class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors">
              记忆管理
            </router-link>
            <router-link to="/rag-knowledge" class="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors">
              RAG知识源
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useThemeStore } from '@/stores/theme'
import { useRAGStore } from '@/stores/rag'
import { ref } from 'vue'

const themeStore = useThemeStore()
const ragStore = useRAGStore()

const testQuery = ref('')

const toggleTheme = () => {
  themeStore.toggleTheme()
}

const testSearch = async () => {
  if (testQuery.value.trim()) {
    await ragStore.performSearch(testQuery.value)
  }
}

const clearSearch = () => {
  ragStore.resetSearch()
  testQuery.value = ''
}
</script>