<template>
  <div class="p-6 space-y-6">
    <!-- 页面标题和操作按钮 -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">跨会话记忆合成</h1>
        <p class="mt-2 text-gray-600">
          智能整合多个会话的记忆，发现模式和洞察，生成综合性知识
        </p>
      </div>
      <div class="flex items-center space-x-4">
        <button 
          @click="refreshData" 
          class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center"
        >
          <RefreshCw class="h-4 w-4 mr-2" />
          刷新
        </button>
        <button 
          @click="startSynthesis" 
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
        >
          <Merge class="h-4 w-4 mr-2" />
          开始合成
        </button>
      </div>
    </div>

    <!-- 项目选择和筛选控制 -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium mb-2">项目选择</label>
          <select v-model="selectedProject" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="all">所有项目</option>
            <option v-for="project in mockProjects" :key="project.id" :value="project.name">
              {{ project.name }}
            </option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-2">搜索</label>
          <div class="relative">
            <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              v-model="searchQuery"
              placeholder="搜索记忆内容..."
              class="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-2">合成方法</label>
          <select v-model="selectedMethod" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="all">所有方法</option>
            <option value="temporal_clustering">时序聚类</option>
            <option value="semantic_clustering">语义聚类</option>
            <option value="hybrid_approach">混合方法</option>
          </select>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-5 gap-6">
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center">
          <Merge class="h-8 w-8 text-blue-600" />
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">
              {{ selectedProject === 'all' ? '总合成数' : `${selectedProject} 合成数` }}
            </p>
            <p class="text-2xl font-bold">{{ filteredStats.totalSyntheses }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center">
          <Clock class="h-8 w-8 text-indigo-600" />
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">合成任务</p>
            <p class="text-2xl font-bold">{{ filteredStats.totalJobs }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center">
          <Brain class="h-8 w-8 text-purple-600" />
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">合成记忆</p>
            <p class="text-2xl font-bold">{{ filteredStats.totalMemories }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center">
          <TrendingUp class="h-8 w-8 text-green-600" />
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">发现模式</p>
            <p class="text-2xl font-bold">{{ filteredStats.totalPatterns }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center">
          <Zap class="h-8 w-8 text-orange-600" />
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">生成洞察</p>
            <p class="text-2xl font-bold">{{ filteredStats.totalInsights }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 - 标签页 -->
    <div>
      <!-- 标签页导航 -->
      <div class="flex border-b mb-6">
        <button 
          v-for="tab in tabs" 
          :key="tab.value" 
          :class="[
            'px-5 py-2 mr-2 font-medium',
            activeTab === tab.value 
              ? 'border-b-2 border-blue-600 text-blue-600' 
              : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700'
          ]"
          @click="activeTab = tab.value"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- 记忆合成标签页 -->
      <div v-if="activeTab === 'synthesis'" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- 合成参数和任务 -->
        <div class="lg:col-span-1 space-y-6">
          <!-- 合成参数 -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 class="text-lg font-semibold mb-4 flex items-center">
              <Settings class="h-5 w-5 mr-2" />
              合成参数
            </h2>
            <div class="space-y-4">
              <div>
                <label class="text-sm font-medium">最小置信度</label>
                <div class="flex items-center space-x-2 mt-1">
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    v-model="minConfidence"
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span class="text-sm text-gray-600">
                    {{ (minConfidence * 100).toFixed(0) }}%
                  </span>
                </div>
              </div>
              
              <div>
                <label class="text-sm font-medium">合成方法</label>
                <select 
                  v-model="selectedMethod" 
                  class="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="temporal_clustering">时序聚类</option>
                  <option value="semantic_clustering">语义聚类</option>
                  <option value="hybrid_approach">混合方法</option>
                </select>
              </div>
              
              <button 
                @click="startSynthesis" 
                class="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
              >
                <Play class="h-4 w-4 mr-2" />
                启动新合成任务
              </button>
            </div>
          </div>

          <!-- 合成任务 -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 class="text-lg font-semibold mb-4">合成任务</h2>
            <div class="space-y-3">
              <div 
                v-for="job in filteredJobs" 
                :key="job.id" 
                class="border rounded-lg p-3"
              >
                <div class="flex justify-between items-center mb-2">
                  <div class="flex items-center space-x-2">
                    <span 
                      :class="[
                        'px-2 py-1 rounded text-xs font-medium',
                        getJobStatusColor(job.status)
                      ]"
                    >
                      {{ job.status }}
                    </span>
                    <span class="text-sm font-medium">{{ job.name }}</span>
                  </div>
                  <span class="text-xs text-gray-500">
                    {{ formatDate(job.startTime) }}
                  </span>
                </div>
                
                <div class="text-xs text-gray-500 mb-2">
                  项目: {{ job.project }} | 方法: {{ job.parameters.synthesisMethod }}
                </div>
                
                <div v-if="job.status === 'running'" class="mb-2">
                  <div class="flex justify-between text-xs mb-1">
                    <span>进度</span>
                    <span>{{ job.progress }}%</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      class="bg-blue-600 h-2 rounded-full" 
                      :style="{ width: `${job.progress}%` }"
                    ></div>
                  </div>
                </div>
                
                <div v-if="job.results" class="text-xs space-y-1">
                  <div class="flex justify-between">
                    <span>合成记忆:</span>
                    <span class="font-medium">{{ job.results.synthesizedMemories }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>发现模式:</span>
                    <span class="font-medium">{{ job.results.discoveredPatterns }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>生成洞察:</span>
                    <span class="font-medium">{{ job.results.generatedInsights }}</span>
                  </div>
                </div>
              </div>
              
              <div v-if="synthesisJobs.length === 0" class="text-center py-4 text-gray-500 text-sm">
                暂无合成任务
              </div>
            </div>
          </div>
        </div>

        <!-- 合成结果列表 -->
        <div class="lg:col-span-2 space-y-6">
          <!-- 合成结果过滤 -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 class="text-lg font-semibold mb-4 flex items-center">
              <Filter class="h-5 w-5 mr-2" />
              合成结果过滤
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="relative">
                <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  v-model="searchQuery"
                  placeholder="搜索合成内容..."
                  class="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <select 
                v-model="selectedMethod" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">所有合成方法</option>
                <option value="temporal_clustering">时序聚类</option>
                <option value="semantic_clustering">语义聚类</option>
                <option value="hybrid_approach">混合方法</option>
              </select>
            </div>
          </div>

          <!-- 合成结果列表 -->
          <div class="space-y-4">
            <div 
              v-for="synthesis in filteredSyntheses" 
              :key="synthesis.id"
              :class="[
                'bg-white rounded-lg shadow-sm border border-gray-200 cursor-pointer transition-shadow',
                'hover:shadow-md'
              ]"
              @click="selectSynthesis(synthesis)"
            >
              <div class="p-6">
                <div class="flex justify-between items-start mb-4">
                  <div>
                    <h3 class="text-lg font-semibold">合成结果 #{{ synthesis.id }}</h3>
                    <p class="text-sm text-gray-500 mt-1">
                      项目: {{ synthesis.project }} • {{ synthesis.metadata.totalSessions }} 个会话 • {{ synthesis.metadata.totalMemories }} 条记忆
                    </p>
                  </div>
                  <span class="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                    {{ synthesis.metadata.synthesisMethod }}
                  </span>
                </div>
                
                <div class="grid grid-cols-3 gap-4 mb-4">
                  <div class="text-center">
                    <div class="text-2xl font-bold text-blue-600">
                      {{ synthesis.synthesizedMemories.length }}
                    </div>
                    <div class="text-xs text-gray-500">合成记忆</div>
                  </div>
                  <div class="text-center">
                    <div class="text-2xl font-bold text-green-600">
                      {{ synthesis.patterns.length }}
                    </div>
                    <div class="text-xs text-gray-500">发现模式</div>
                  </div>
                  <div class="text-center">
                    <div class="text-2xl font-bold text-purple-600">
                      {{ synthesis.insights.length }}
                    </div>
                    <div class="text-xs text-gray-500">生成洞察</div>
                  </div>
                </div>
                
                <div class="text-sm text-gray-500">
                  创建时间: {{ formatDate(synthesis.metadata.createdAt) }} | 
                  最后更新: {{ formatDate(synthesis.metadata.lastUpdated) }}
                </div>
              </div>
            </div>
            
            <div v-if="filteredSyntheses.length === 0" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
              <p class="text-gray-500">没有找到匹配的合成结果</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 合成任务标签页 -->
      <div v-else-if="activeTab === 'jobs'" class="space-y-6">
        <!-- 合成任务列表 -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 class="text-lg font-semibold mb-4 flex items-center">
            <Clock class="h-5 w-5 mr-2" />
            合成任务列表
          </h2>
          <div class="space-y-4">
            <div 
              v-for="job in synthesisJobs" 
              :key="job.id" 
              class="border rounded-lg p-4"
            >
              <div class="flex justify-between items-start mb-2">
                <div>
                  <h3 class="font-medium">{{ job.name }}</h3>
                  <p class="text-sm text-gray-500">项目: {{ job.project }}</p>
                </div>
                <span 
                  :class="[
                    'px-2 py-1 rounded text-xs font-medium',
                    job.status === 'completed' ? 'bg-green-100 text-green-800' :
                    job.status === 'running' ? 'bg-blue-100 text-blue-800' :
                    job.status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                  ]"
                >
                  {{ job.status === 'pending' ? '等待中' :
                     job.status === 'running' ? '运行中' :
                     job.status === 'completed' ? '已完成' : '失败' }}
                </span>
              </div>
              
              <div v-if="job.status === 'running'" class="mb-2">
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    class="bg-blue-600 h-2 rounded-full" 
                    :style="{ width: `${job.progress}%` }"
                  ></div>
                </div>
                <p class="text-xs text-gray-500 mt-1">
                  进度: {{ job.progress }}%
                </p>
              </div>
              
              <div class="text-xs text-gray-500">
                开始时间: {{ formatDate(job.startTime) }}
                <span v-if="job.endTime"> | 结束时间: {{ formatDate(job.endTime) }}</span>
              </div>
              
              <div v-if="job.results" class="mt-3 grid grid-cols-3 gap-2 text-xs">
                <div>合成记忆: {{ job.results.synthesizedMemories }}</div>
                <div>发现模式: {{ job.results.discoveredPatterns }}</div>
                <div>生成洞察: {{ job.results.generatedInsights }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- RAG知识库标签页 -->
      <div v-else-if="activeTab === 'rag'" class="space-y-6">
        <!-- 知识库统计 -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-semibold flex items-center">
              <Database class="h-5 w-5 mr-2" />
              RAG知识库管理
            </h2>
            <button 
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus class="h-4 w-4 mr-2" />
              添加知识源
            </button>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-600">
                {{ ragSources.length }}
              </div>
              <div class="text-xs text-gray-500">总知识源</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-green-600">
                {{ ragSources.filter(s => s.status === 'connected').length }}
              </div>
              <div class="text-xs text-gray-500">已连接</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-red-600">
                {{ ragSources.filter(s => s.status === 'error').length }}
              </div>
              <div class="text-xs text-gray-500">错误</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-purple-600">
                {{ ragSources.reduce((sum, s) => sum + (s.metadata.documentCount || 0), 0) }}
              </div>
              <div class="text-xs text-gray-500">总文档数</div>
            </div>
          </div>
        </div>

        <!-- 知识源列表 -->
        <div class="space-y-4">
          <div 
            v-for="source in ragSources" 
            :key="source.id"
            class="bg-white rounded-lg shadow-sm border border-gray-200"
          >
            <div class="p-6">
              <div class="flex justify-between items-start mb-4">
                <div>
                  <h3 class="text-lg font-semibold flex items-center">
                    <Database class="h-5 w-5 mr-2" />
                    {{ source.name }}
                  </h3>
                  <p class="text-sm text-gray-500 mt-1">
                    类型: {{ source.type }} • 
                    {{ source.metadata.documentCount ? `${source.metadata.documentCount} 个文档` : '未知文档数' }}
                  </p>
                </div>
                <div class="flex items-center space-x-2">
                  <span 
                    :class="[
                      'px-2 py-1 rounded text-xs font-medium flex items-center',
                      source.status === 'connected' ? 'bg-green-100 text-green-800' :
                      source.status === 'disconnected' ? 'bg-gray-100 text-gray-800' : 'bg-red-100 text-red-800'
                    ]"
                  >
                    <span v-if="source.status === 'connected'" class="mr-1">
                      <CheckCircle class="h-3 w-3" />
                    </span>
                    <span v-else-if="source.status === 'disconnected'" class="mr-1">
                      <XCircle class="h-3 w-3" />
                    </span>
                    <span v-else class="mr-1">
                      <AlertCircle class="h-3 w-3" />
                    </span>
                    {{ source.status }}
                  </span>
                  <button class="p-1 border border-gray-300 rounded hover:bg-gray-50">
                    <ExternalLink class="h-4 w-4 text-gray-600" />
                  </button>
                  <button class="p-1 border border-gray-300 rounded hover:bg-gray-50">
                    <Edit class="h-4 w-4 text-gray-600" />
                  </button>
                  <button class="p-1 border border-gray-300 rounded hover:bg-gray-50">
                    <Trash2 class="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              </div>
              
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span class="font-medium">连接地址:</span>
                  <div class="text-gray-500">{{ source.config.url || '未配置' }}</div>
                </div>
                <div>
                  <span class="font-medium">索引/集合:</span>
                  <div class="text-gray-500">
                    {{ source.config.index || source.config.collection || '未配置' }}
                  </div>
                </div>
                <div>
                  <span class="font-medium">创建时间:</span>
                  <div class="text-gray-500">{{ formatDate(source.metadata.createdAt) }}</div>
                </div>
                <div>
                  <span class="font-medium">最后同步:</span>
                  <div class="text-gray-500">
                    {{ source.metadata.lastSync ? formatDate(source.metadata.lastSync) : '从未同步' }}
                  </div>
                </div>
              </div>
              
              <div v-if="source.status === 'error' && source.metadata.errorMessage" class="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                <div class="flex items-center">
                  <AlertCircle class="h-4 w-4 text-red-600 mr-2" />
                  <span class="text-sm text-red-800">错误信息:</span>
                </div>
                <div class="text-sm text-red-700 mt-1">{{ source.metadata.errorMessage }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 合成详情 -->
    <div v-if="selectedSynthesis" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-semibold">合成详情 #{{ selectedSynthesis.id }}</h2>
        <button 
          class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          @click="selectedSynthesis = null"
        >
          关闭
        </button>
      </div>
      
      <!-- 详情标签页 -->
      <div class="border-b mb-4">
        <button 
          v-for="detailTab in detailTabs" 
          :key="detailTab.value"
          :class="[
            'px-5 py-2 mr-2 font-medium',
            activeDetailTab === detailTab.value 
              ? 'border-b-2 border-blue-600 text-blue-600' 
              : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700'
          ]"
          @click="activeDetailTab = detailTab.value"
        >
          {{ detailTab.label }}
        </button>
      </div>
      
      <!-- 合成记忆 -->
      <div v-if="activeDetailTab === 'memories'" class="space-y-4">
        <div 
          v-for="memory in selectedSynthesis.synthesizedMemories" 
          :key="memory.id"
          class="border rounded-lg p-4"
        >
          <div class="flex justify-between items-start mb-2">
            <span 
              :class="[
                'px-2 py-1 rounded text-xs font-medium',
                getConfidenceColor(memory.confidence)
              ]"
            >
              置信度: {{ (memory.confidence * 100).toFixed(1) }}%
            </span>
            <span class="text-xs text-gray-500">
              {{ formatDuration(memory.temporalContext.duration) }}
            </span>
          </div>
          <p class="text-sm mb-2">{{ memory.content }}</p>
          <div class="text-xs text-gray-500">
            来源会话: {{ memory.sources.join(', ') }}
          </div>
        </div>
      </div>
      
      <!-- 发现模式 -->
      <div v-if="activeDetailTab === 'patterns'" class="space-y-4">
        <div 
          v-for="pattern in selectedSynthesis.patterns" 
          :key="pattern.id"
          class="border rounded-lg p-4"
        >
          <div class="flex justify-between items-start mb-2">
            <span class="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium">
              {{ pattern.type }}
            </span>
            <div class="text-xs text-gray-500">
              频率: {{ (pattern.frequency * 100).toFixed(1) }}% | 
              重要性: {{ (pattern.significance * 100).toFixed(1) }}%
            </div>
          </div>
          <p class="text-sm">{{ pattern.description }}</p>
        </div>
      </div>
      
      <!-- 生成洞察 -->
      <div v-if="activeDetailTab === 'insights'" class="space-y-4">
        <div 
          v-for="insight in selectedSynthesis.insights" 
          :key="insight.id"
          class="border rounded-lg p-4"
        >
          <div class="flex justify-between items-start mb-2">
            <span class="px-2 py-1 border border-gray-300 text-gray-800 rounded text-xs font-medium">
              {{ insight.category }}
            </span>
            <div class="text-xs text-gray-500">
              置信度: {{ (insight.confidence * 100).toFixed(1) }}% | 
              影响力: {{ (insight.impact * 100).toFixed(1) }}%
            </div>
          </div>
          <p class="text-sm">{{ insight.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  Merge,
  Brain,
  Clock,
  Search,
  Filter,
  RefreshCw,
  Play,
  Settings,
  TrendingUp,
  Zap,
  Database,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink
} from 'lucide-vue-next'

// 定义接口
interface Project {
  id: string;
  name: string;
  description: string;
  status: "active" | "inactive" | "maintenance";
}

interface MemorySynthesis {
  id: string;
  project: string;
  sessionIds: string[];
  synthesizedMemories: {
    id: string;
    content: string;
    confidence: number;
    sources: string[];
    temporalContext: {
      startTime: string;
      endTime: string;
      duration: number;
    };
  }[];
  patterns: {
    id: string;
    type: string;
    description: string;
    frequency: number;
    significance: number;
  }[];
  insights: {
    id: string;
    category: string;
    description: string;
    confidence: number;
    impact: number;
  }[];
  metadata: {
    createdAt: string;
    lastUpdated: string;
    totalSessions: number;
    totalMemories: number;
    synthesisMethod: string;
  };
}

interface SynthesisJob {
  id: string;
  name: string;
  project: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  startTime: string;
  endTime?: string;
  parameters: {
    sessionIds: string[];
    timeRange: {
      start: string;
      end: string;
    };
    synthesisMethod: string;
    minConfidence: number;
  };
  results?: {
    synthesizedMemories: number;
    discoveredPatterns: number;
    generatedInsights: number;
  };
}

interface RAGKnowledgeSource {
  id: string;
  name: string;
  type: 'elasticsearch' | 'chroma' | 'weaviate' | 'local_files' | 'database' | 'api';
  status: 'connected' | 'disconnected' | 'error';
  config: {
    url?: string;
    apiKey?: string;
    index?: string;
    collection?: string;
    database?: string;
    table?: string;
    path?: string;
    extensions?: string[];
    [key: string]: any;
  };
  metadata: {
    createdAt: string;
    lastUpdated: string;
    lastSync?: string;
    documentCount?: number;
    errorMessage?: string;
  };
}

// 模拟数据
const mockProjects: Project[] = [
  { id: "1", name: "AI客服助手", description: "智能客服系统", status: "active" },
  { id: "2", name: "内容生成器", description: "AI内容创作工具", status: "active" },
  { id: "3", name: "数据分析平台", description: "企业数据分析", status: "maintenance" }
];

// 模拟合成数据
const mockSyntheses: MemorySynthesis[] = [
  {
    id: '1',
    project: 'AI客服助手',
    sessionIds: ['session-1', 'session-2', 'session-3'],
    synthesizedMemories: [
      {
        id: 'mem-1',
        content: '用户对机器学习项目表现出持续的兴趣，特别是在自然语言处理方面',
        confidence: 0.85,
        sources: ['session-1', 'session-2'],
        temporalContext: {
          startTime: new Date(Date.now() - 86400000 * 7).toISOString(),
          endTime: new Date(Date.now() - 86400000 * 2).toISOString(),
          duration: 432000000
        }
      },
      {
        id: 'mem-2',
        content: '用户在讨论技术架构时倾向于关注可扩展性和性能优化',
        confidence: 0.78,
        sources: ['session-2', 'session-3'],
        temporalContext: {
          startTime: new Date(Date.now() - 86400000 * 5).toISOString(),
          endTime: new Date(Date.now() - 86400000 * 1).toISOString(),
          duration: 345600000
        }
      }
    ],
    patterns: [
      {
        id: 'pattern-1',
        type: 'temporal',
        description: '用户通常在工作日的下午进行技术讨论',
        frequency: 0.75,
        significance: 0.68
      },
      {
        id: 'pattern-2',
        type: 'topical',
        description: '技术讨论经常伴随着架构设计和性能优化的话题',
        frequency: 0.82,
        significance: 0.73
      }
    ],
    insights: [
      {
        id: 'insight-1',
        category: 'preference',
        description: '用户偏好实用性强的技术解决方案',
        confidence: 0.79,
        impact: 0.85
      },
      {
        id: 'insight-2',
        category: 'behavior',
        description: '用户在技术决策时会考虑长期维护成本',
        confidence: 0.72,
        impact: 0.78
      }
    ],
    metadata: {
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      lastUpdated: new Date(Date.now() - 1800000).toISOString(),
      totalSessions: 3,
      totalMemories: 15,
      synthesisMethod: 'temporal_clustering'
    }
  }
];

// 模拟合成任务
const mockSynthesisJobs: SynthesisJob[] = [
  {
    id: '1',
    name: '客服对话记忆合成',
    project: 'AI客服助手',
    status: 'completed',
    progress: 100,
    startTime: new Date(Date.now() - 3600000).toISOString(),
    endTime: new Date(Date.now() - 3000000).toISOString(),
    parameters: {
      sessionIds: ['session-1', 'session-2', 'session-3'],
      timeRange: {
        start: new Date(Date.now() - 86400000 * 7).toISOString(),
        end: new Date().toISOString()
      },
      synthesisMethod: 'temporal_clustering',
      minConfidence: 0.6
    },
    results: {
      synthesizedMemories: 8,
      discoveredPatterns: 5,
      generatedInsights: 3
    }
  },
  {
    id: '2',
    name: '内容生成模式分析',
    project: '内容生成器',
    status: 'running',
    progress: 45,
    startTime: new Date(Date.now() - 1800000).toISOString(),
    parameters: {
      sessionIds: ['session-4', 'session-5'],
      timeRange: {
        start: new Date(Date.now() - 86400000 * 3).toISOString(),
        end: new Date().toISOString()
      },
      synthesisMethod: 'semantic_clustering',
      minConfidence: 0.7
    }
  }
];

// 模拟RAG知识源
const mockRAGSources: RAGKnowledgeSource[] = [
  {
    id: 'rag-1',
    name: '企业知识库',
    type: 'elasticsearch',
    status: 'connected',
    config: {
      url: 'https://elasticsearch.company.com',
      index: 'knowledge_base',
      apiKey: '***'
    },
    metadata: {
      createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
      lastUpdated: new Date(Date.now() - 3600000).toISOString(),
      lastSync: new Date(Date.now() - 1800000).toISOString(),
      documentCount: 15420
    }
  },
  {
    id: 'rag-2',
    name: '技术文档库',
    type: 'chroma',
    status: 'connected',
    config: {
      url: 'http://chroma.internal:8000',
      collection: 'tech_docs'
    },
    metadata: {
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      lastUpdated: new Date(Date.now() - 7200000).toISOString(),
      lastSync: new Date(Date.now() - 900000).toISOString(),
      documentCount: 8750
    }
  },
  {
    id: 'rag-3',
    name: '本地文件库',
    type: 'local_files',
    status: 'error',
    config: {
      path: '/data/documents',
      extensions: ['.pdf', '.docx', '.txt']
    },
    metadata: {
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      lastUpdated: new Date(Date.now() - 14400000).toISOString(),
      errorMessage: '无法访问指定路径'
    }
  }
];

// 路由和响应式数据
const route = useRoute()
const activeTab = ref('synthesis')
const selectedProject = ref('all')
const searchQuery = ref('')
const selectedMethod = ref('all')
const minConfidence = ref(0.6)
const syntheses = ref<MemorySynthesis[]>(mockSyntheses)
const selectedSynthesis = ref<MemorySynthesis | null>(null)
const synthesisJobs = ref<SynthesisJob[]>(mockSynthesisJobs)
const ragSources = ref<RAGKnowledgeSource[]>(mockRAGSources)
const activeDetailTab = ref('memories')

// 从路由查询参数获取项目信息
onMounted(() => {
  if (route.query.project) {
    selectedProject.value = route.query.project as string
  }
})

// 标签页数据
const tabs = [
  { value: 'synthesis', label: '记忆合成' },
  { value: 'jobs', label: '合成任务' },
  { value: 'rag', label: 'RAG知识库' }
]

const detailTabs = [
  { value: 'memories', label: '合成记忆' },
  { value: 'patterns', label: '发现模式' },
  { value: 'insights', label: '生成洞察' }
]

// 计算属性
const filteredSyntheses = computed(() => {
  return syntheses.value.filter(synthesis => {
    const projectMatch = selectedProject.value === 'all' || synthesis.project === selectedProject.value
    const methodMatch = selectedMethod.value === 'all' || synthesis.metadata.synthesisMethod === selectedMethod.value
    const searchMatch = searchQuery.value === '' || 
      synthesis.synthesizedMemories.some(memory =>
        memory.content.toLowerCase().includes(searchQuery.value.toLowerCase())
      ) || synthesis.patterns.some(pattern =>
        pattern.description.toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    
    return projectMatch && methodMatch && searchMatch
  })
})

const filteredJobs = computed(() => {
  return synthesisJobs.value.filter(job => {
    return selectedProject.value === 'all' || job.project === selectedProject.value
  })
})

const filteredStats = computed(() => {
  const filteredSynthesesCount = filteredSyntheses.value.length
  const filteredJobsCount = filteredJobs.value.length
  
  const totalMemories = filteredSyntheses.value.reduce((sum, synthesis) => 
    sum + synthesis.synthesizedMemories.length, 0)
  const totalPatterns = filteredSyntheses.value.reduce((sum, synthesis) => 
    sum + synthesis.patterns.length, 0)
  const totalInsights = filteredSyntheses.value.reduce((sum, synthesis) => 
    sum + synthesis.insights.length, 0)

  return {
    totalSyntheses: filteredSynthesesCount,
    totalJobs: filteredJobsCount,
    totalMemories,
    totalPatterns,
    totalInsights
  }
})

// 方法
const refreshData = () => {
  console.log('刷新数据')
}

const startSynthesis = () => {
  // 模拟启动合成任务
  const newJob: SynthesisJob = {
    id: `job-${Date.now()}`,
    name: '新合成任务',
    project: selectedProject.value === 'all' ? '默认项目' : selectedProject.value,
    status: 'running',
    progress: 0,
    startTime: new Date().toISOString(),
    parameters: {
      sessionIds: ['all'],
      timeRange: {
        start: new Date(Date.now() - 86400000 * 7).toISOString(),
        end: new Date().toISOString()
      },
      synthesisMethod: 'temporal_clustering',
      minConfidence: minConfidence.value
    }
  }
  synthesisJobs.value.unshift(newJob)
}

const selectSynthesis = (synthesis: MemorySynthesis) => {
  selectedSynthesis.value = synthesis
  activeDetailTab.value = 'memories'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString()
}

const formatDuration = (milliseconds: number) => {
  const hours = Math.floor(milliseconds / (1000 * 60 * 60))
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60))
  return `${hours}小时${minutes}分钟`
}

const getConfidenceColor = (confidence: number) => {
  if (confidence < 0.5) return 'bg-red-100 text-red-800'
  if (confidence < 0.8) return 'bg-yellow-100 text-yellow-800'
  return 'bg-green-100 text-green-800'
}

const getJobStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    'pending': 'bg-gray-100 text-gray-800',
    'running': 'bg-blue-100 text-blue-800',
    'completed': 'bg-green-100 text-green-800',
    'failed': 'bg-red-100 text-red-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}
</script>