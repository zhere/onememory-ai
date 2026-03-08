<template>
  <div class="space-y-6 p-6">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">融合搜索配置</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">
          配置记忆与知识库的融合搜索策略
        </p>
      </div>
    </div>

    <!-- 搜索配置 -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">搜索参数</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">最大结果数</label>
          <input 
            type="number" 
            :value="fusionStrategy.maxResults" 
            @input="updateMaxResults"
            class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="1" 
            max="50"
          >
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">相似度阈值</label>
          <input 
            type="range" 
            :value="fusionStrategy.threshold" 
            @input="updateThreshold"
            min="0" 
            max="1" 
            step="0.05"
            class="w-full"
          >
          <div class="flex justify-between text-xs text-gray-500 mt-1">
            <span>0%</span>
            <span>{{ Math.round(fusionStrategy.threshold * 100) }}%</span>
            <span>100%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 权重配置 -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">融合权重配置</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">记忆权重: {{ fusionStrategy.memoryWeight.toFixed(2) }}</label>
          <input 
            type="range" 
            :value="fusionStrategy.memoryWeight" 
            @input="updateMemoryWeight"
            min="0" 
            max="1" 
            step="0.05"
            class="w-full"
          >
          <div class="flex justify-between text-xs text-gray-500 mt-1">
            <span>0%</span>
            <span>{{ Math.round(fusionStrategy.memoryWeight * 100) }}%</span>
            <span>100%</span>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">知识库权重: {{ fusionStrategy.ragWeight.toFixed(2) }}</label>
          <input 
            type="range" 
            :value="fusionStrategy.ragWeight" 
            @input="updateRagWeight"
            min="0" 
            max="1" 
            step="0.05"
            class="w-full"
          >
          <div class="flex justify-between text-xs text-gray-500 mt-1">
            <span>0%</span>
            <span>{{ Math.round(fusionStrategy.ragWeight * 100) }}%</span>
            <span>100%</span>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">时间衰减因子: {{ fusionStrategy.timeDecay.toFixed(2) }}</label>
          <input 
            type="range" 
            :value="fusionStrategy.timeDecay" 
            @input="updateTimeDecay"
            min="0" 
            max="1" 
            step="0.05"
            class="w-full"
          >
          <div class="flex justify-between text-xs text-gray-500 mt-1">
            <span>0%</span>
            <span>{{ Math.round(fusionStrategy.timeDecay * 100) }}%</span>
            <span>100%</span>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">相关性提升: {{ fusionStrategy.relevanceBoost.toFixed(2) }}</label>
          <input 
            type="range" 
            :value="fusionStrategy.relevanceBoost" 
            @input="updateRelevanceBoost"
            min="0" 
            max="1" 
            step="0.05"
            class="w-full"
          >
          <div class="flex justify-between text-xs text-gray-500 mt-1">
            <span>0%</span>
            <span>{{ Math.round(fusionStrategy.relevanceBoost * 100) }}%</span>
            <span>100%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 预设策略 -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">快速策略</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          @click="applyPreset('balanced')"
          class="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          平衡模式
        </button>
        <button
          @click="applyPreset('memory-focused')"
          class="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          记忆优先
        </button>
        <button
          @click="applyPreset('knowledge-focused')"
          class="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          知识优先
        </button>
        <button
          @click="applyPreset('recent')"
          class="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          最近优先
        </button>
      </div>
    </div>

    <!-- 数据源配置 -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">数据源配置</h2>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div 
          v-for="source in knowledgeSources" 
          :key="source.id"
          class="border border-gray-200 rounded-lg p-4"
        >
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center space-x-2">
              <input 
                type="checkbox" 
                :checked="isSelected(source.id)"
                @change="toggleSource(source.id)"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              >
              <span class="text-sm font-medium text-gray-900">{{ source.name }}</span>
            </div>
            <span class="text-xs text-gray-500" v-if="source.documentCount">
              {{ source.documentCount }}条记录
            </span>
          </div>
          <div class="text-xs text-gray-500">
            类型: {{ getSourceTypeName(source.type) }}
          </div>
          <div class="flex items-center mt-2">
            <div class="w-2 h-2 rounded-full mr-2" :class="getStatusColor(source.status)"></div>
            <span class="text-xs">{{ getStatusText(source.status) }}</span>
          </div>
        </div>
      </div>
      
      <div class="mt-6 flex justify-end space-x-3">
        <button 
          @click="handleResetConfig"
          class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
        >
          重置配置
        </button>
        <button 
          @click="handleSaveConfig"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          保存配置
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRAGStore } from '../stores/rag'

const ragStore = useRAGStore()

// Computed properties
const knowledgeSources = computed(() => ragStore.knowledgeSources)
const fusionStrategy = computed(() => ragStore.fusionStrategy)
const selectedSources = computed(() => ragStore.selectedSources)

// Methods
const updateMaxResults = (event) => {
  const target = event.target
  ragStore.setFusionStrategy({ maxResults: parseInt(target.value) || 10 })
}

const updateThreshold = (event) => {
  const target = event.target
  ragStore.setFusionStrategy({ threshold: parseFloat(target.value) || 0.7 })
}

const updateMemoryWeight = (event) => {
  const target = event.target
  const weight = parseFloat(target.value) || 0.7
  ragStore.setFusionStrategy({ 
    memoryWeight: weight,
    ragWeight: 1 - weight
  })
}

const updateRagWeight = (event) => {
  const target = event.target
  const weight = parseFloat(target.value) || 0.3
  ragStore.setFusionStrategy({ 
    ragWeight: weight,
    memoryWeight: 1 - weight
  })
}

const updateTimeDecay = (event) => {
  const target = event.target
  ragStore.setFusionStrategy({ timeDecay: parseFloat(target.value) || 0.1 })
}

const updateRelevanceBoost = (event) => {
  const target = event.target
  ragStore.setFusionStrategy({ relevanceBoost: parseFloat(target.value) || 0.2 })
}

const applyPreset = (preset) => {
  ragStore.applyPresetStrategy(preset)
}

const isSelected = (sourceId) => {
  return selectedSources.value.includes(sourceId)
}

const toggleSource = (sourceId) => {
  ragStore.toggleSourceSelection(sourceId)
}

const getSourceTypeName = (type) => {
  const typeMap = {
    'file': '文件',
    'web': '网页',
    'database': '数据库'
  }
  return typeMap[type] || type
}

const getStatusText = (status) => {
  const statusMap = {
    'connected': '已连接',
    'disconnected': '已断开',
    'testing': '测试中'
  }
  return statusMap[status] || status
}

const getStatusColor = (status) => {
  const colorMap = {
    'connected': 'bg-green-500',
    'disconnected': 'bg-red-500',
    'testing': 'bg-yellow-500'
  }
  return colorMap[status] || 'bg-gray-500'
}

const handleResetConfig = () => {
  if (confirm('确定要重置所有配置吗？')) {
    ragStore.resetSearch()
    // 重置其他配置为默认值
    ragStore.setFusionStrategy({
      memoryWeight: 0.7,
      ragWeight: 0.3,
      timeDecay: 0.1,
      relevanceBoost: 0.2,
      maxResults: 10,
      threshold: 0.7
    })
  }
}

const handleSaveConfig = () => {
  // 在实际应用中，这里会保存配置到服务器
  alert('配置已保存')
}
</script>