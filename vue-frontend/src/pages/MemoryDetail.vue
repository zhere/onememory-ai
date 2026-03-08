<template>
  <div class="space-y-6">
    <!-- 页面标题和返回按钮 -->
    <div class="flex items-center space-x-4">
      <button 
        @click="handleBack"
        class="flex items-center space-x-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <ChevronLeft class="h-4 w-4" />
        <span>返回列表</span>
      </button>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">记忆详情</h1>
      <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', getTypeColor(memory?.type || '')]">
        {{ getTypeText(memory?.type || '') }}
      </span>
    </div>

    <!-- 记忆基本信息和元数据 -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- 记忆内容 -->
        <div class="lg:col-span-2">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">{{ memory?.summary }}</h2>
          <div class="prose dark:prose-invert max-w-none">
            <p class="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{{ memory?.content }}</p>
          </div>
          
          <!-- 标签 -->
          <div class="mt-4">
            <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">标签</h3>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="(tag, index) in memory?.tags || []"
                :key="index"
                class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              >
                <Tag class="w-2 h-2 mr-1" />{{ tag }}
              </span>
            </div>
          </div>
        </div>
        
        <!-- 记忆元数据 -->
        <div class="space-y-4">
          <!-- 记忆属性 -->
          <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">记忆属性</h3>
            <div class="space-y-3">
              <div>
                <p class="text-xs text-gray-500 dark:text-gray-400">相关性</p>
                <p class="text-sm font-medium text-gray-900 dark:text-white">{{ ((memory?.relevanceScore || 0) * 100).toFixed(1) }}%</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 dark:text-gray-400">访问次数</p>
                <p class="text-sm font-medium text-gray-900 dark:text-white">{{ memory?.accessCount || 0 }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 dark:text-gray-400">大小</p>
                <p class="text-sm font-medium text-gray-900 dark:text-white">{{ formatSize(memory?.size || 0) }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 dark:text-gray-400">所属项目</p>
                <p class="text-sm font-medium text-gray-900 dark:text-white">{{ memory?.project }}</p>
              </div>
            </div>
          </div>
          
          <!-- 时间信息 -->
          <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">时间信息</h3>
            <div class="space-y-3">
              <div>
                <p class="text-xs text-gray-500 dark:text-gray-400">创建时间</p>
                <p class="text-sm font-medium text-gray-900 dark:text-white">{{ formatDate(memory?.createdAt || '') }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 dark:text-gray-400">最后访问</p>
                <p class="text-sm font-medium text-gray-900 dark:text-white">{{ formatDate(memory?.lastAccessed || '') }}</p>
              </div>
            </div>
          </div>
          
          <!-- 上下文信息 -->
          <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">上下文信息</h3>
            <div class="space-y-3">
              <div>
                <p class="text-xs text-gray-500 dark:text-gray-400">情感状态</p>
                <p class="text-sm font-medium text-gray-900 dark:text-white">{{ memory?.context?.emotion || '未知' }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 dark:text-gray-400">对话意图</p>
                <p class="text-sm font-medium text-gray-900 dark:text-white">{{ memory?.context?.intent || '未知' }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 dark:text-gray-400">参与者</p>
                <p class="text-sm font-medium text-gray-900 dark:text-white">{{ memory?.context?.participants?.join(', ') || '未知' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 记忆与知识图谱关联 -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">知识图谱关联</h2>
        <router-link
          to="/knowledge-graph"
          class="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center space-x-1"
        >
          <span>查看完整知识图谱</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </router-link>
      </div>
      
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- 知识图谱视图 -->
        <div class="lg:col-span-2 space-y-4">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">记忆关联图谱</h3>
            <router-link
              to="/knowledge-graph"
              class="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
            >
              查看完整知识图谱
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </router-link>
          </div>
          <div class="h-96 border rounded-lg bg-gray-50 dark:bg-gray-900">
            <GraphDisplay 
              :graph-data="memoryGraphData"
              :selected-memory-ids="[memoryId]"
              :highlighted-node-ids="highlightedNodeIds"
              @on-node-click="handleNodeClick"
            />
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            展示当前记忆在知识图谱中的位置和关联关系
          </p>
        </div>
        
        <!-- 记忆关联信息 -->
        <div class="space-y-4">
          <!-- 关联实体 -->
          <div>
            <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">关联实体</h3>
            <div v-if="relatedEntities.length === 0" class="text-center py-4 text-gray-500">
              暂无关联实体
            </div>
            <div v-else class="space-y-2">
              <div 
                v-for="entity in relatedEntities" 
                :key="entity.id" 
                class="flex items-center justify-between p-2 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <div class="flex items-center space-x-2">
                  <div 
                    class="w-2 h-2 rounded-full" 
                    :style="{ backgroundColor: getEntityColor(entity.type) }"
                  ></div>
                  <span class="text-sm font-medium">{{ entity.name }}</span>
                </div>
                <span class="text-xs text-gray-500">{{ entity.type }}</span>
              </div>
            </div>
          </div>
          
          <!-- 关联关系 -->
          <div>
            <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">关联关系</h3>
            <div v-if="relatedRelations.length === 0" class="text-center py-4 text-gray-500">
              暂无关联关系
            </div>
            <div v-else class="space-y-2">
              <div 
                v-for="relation in relatedRelations" 
                :key="relation.id" 
                class="p-2 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <div class="text-sm">
                  <span class="font-medium">{{ relation.source }}</span>
                  <span class="mx-1 text-gray-500">→</span>
                  <span class="text-blue-600">{{ relation.type }}</span>
                  <span class="mx-1 text-gray-500">→</span>
                  <span class="font-medium">{{ relation.target }}</span>
                </div>
                <div class="text-xs text-gray-500 mt-1">
                  置信度: {{ (relation.confidence * 100).toFixed(0) }}%
                </div>
              </div>
            </div>
          </div>
          
          <!-- 相关记忆 -->
          <div>
            <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">相关记忆</h3>
            <div v-if="relatedMemories.length === 0" class="text-center py-4 text-gray-500">
              暂无相关记忆
            </div>
            <div v-else class="space-y-2">
              <div 
                v-for="mem in relatedMemories" 
                :key="mem.id" 
                class="p-2 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                @click="$router.push({ path: `/memory/${mem.id}`, query: { project: memory?.value?.project } })"
              >
                <div class="text-sm font-medium truncate">{{ mem.summary }}</div>
                <div class="text-xs text-gray-500 mt-1">{{ formatDate(mem.createdAt) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 记忆合成与推理 -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">记忆合成与推理</h2>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- 时序实体 -->
        <div>
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-3">时序实体</h3>
          <div v-if="temporalEntities.length === 0" class="text-center py-8 text-gray-500">
            暂无时序实体数据
          </div>
          <div v-else class="space-y-3">
            <div 
              v-for="entity in temporalEntities" 
              :key="entity.id" 
              class="flex items-start space-x-3 p-3 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 cursor-pointer"
              @click="handleTemporalEntityClick(entity)"
            >
              <div class="flex-shrink-0">
                <Calendar class="w-5 h-5 text-blue-600" />
              </div>
              <div class="flex-1">
                <div class="font-medium">{{ entity.name }}</div>
                <div class="text-sm text-gray-500">{{ entity.type }} | {{ formatDate(entity.timestamp) }}</div>
                <div class="mt-1 text-sm">
                  {{ entity.description }}
                </div>
                <div class="mt-2 flex items-center space-x-2">
                  <span class="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
                    置信度: {{ (entity.confidence * 100).toFixed(1) }}%
                  </span>
                  <span class="text-xs text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">
                    在知识图谱中查看
                  </span>
                </div>
              </div>
            </div>
            <div class="text-sm text-gray-500 dark:text-gray-400 mt-4">
              时序实体作为特殊节点存储在知识图谱中，通过时间属性和时间关系（如"发生在"、"之前"、"之后"）连接，形成时序知识图谱。
            </div>
          </div>
        </div>
        
        <!-- 关系推理 -->
        <div>
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-3">关系推理</h3>
          <div v-if="relationInferences.length === 0" class="text-center py-8 text-gray-500">
            暂无关系推理数据
          </div>
          <div v-else class="space-y-3">
            <div 
              v-for="relation in relationInferences" 
              :key="relation.id" 
              class="p-3 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 cursor-pointer"
              @click="handleRelationClick(relation)"
            >
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <div class="flex items-center space-x-2 mb-2">
                    <span class="font-medium">{{ relation.sourceEntity }}</span>
                    <span class="text-blue-600">{{ relation.relationType }}</span>
                    <span class="font-medium">{{ relation.targetEntity }}</span>
                  </div>
                  <div class="text-sm mb-2">{{ relation.description }}</div>
                  <div class="text-sm text-gray-500">
                    <div class="flex items-center space-x-4">
                      <span class="flex items-center">
                        <BarChart3 class="w-3 h-3 mr-1" />
                        置信度: {{ (relation.confidence * 100).toFixed(1) }}%
                      </span>
                      <span class="flex items-center">
                        <Zap class="w-3 h-3 mr-1" />
                        方法: {{ relation.inferenceMethod }}
                      </span>
                      <span :class="[
                        'flex items-center',
                        getValidationStatusColor(relation.metadata.validationStatus)
                      ]">
                        <CheckCircle class="w-3 h-3 mr-1" />
                        {{ relation.metadata.validationStatus }}
                      </span>
                    </div>
                  </div>
                  
                  <!-- 证据信息 -->
                  <div class="mt-2 text-xs">
                    <div class="font-medium mb-1">支持证据:</div>
                    <div class="space-y-1">
                      <div 
                        v-for="(evidence, index) in relation.evidence" 
                        :key="index"
                        class="flex items-start space-x-2"
                      >
                        <CheckCircle class="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{{ evidence }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- 元数据信息 -->
              <div class="mt-2 text-xs text-gray-500 flex justify-between">
                <span>推理时间: {{ formatDate(relation.metadata.inferredAt) }}</span>
                <span>关系强度: {{ relation.metadata.strength }}</span>
              </div>
            </div>
            <div class="text-sm text-gray-500 dark:text-gray-400 mt-4">
              关系推理基于知识图谱中的现有关系进行逻辑推导，可发现时序实体之间的因果关系、演化关系等，例如从"技术A出现"和"技术B随后兴起"推导出"技术A影响了技术B"。推理结果丰富了知识图谱，帮助构建更完整的知识体系。
            </div>
          </div>
        </div>
      </div>
      
      <!-- 时序关系时间轴 -->
      <div class="mt-6">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-3">时序关系时间轴</h3>
        <div v-if="temporalEntities.length === 0" class="text-center py-8 text-gray-500">
          暂无时序实体数据
        </div>
        <div v-else class="relative">
          <!-- 时间轴线 -->
          <div class="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
          
          <!-- 时序事件 -->
          <div class="space-y-8">
            <div 
              v-for="(entity, index) in sortedTemporalEntities" 
              :key="entity.id" 
              class="relative pl-12"
            >
              <!-- 时间节点 -->
              <div class="absolute left-0 top-0 w-8 h-8 rounded-full bg-blue-500 dark:bg-blue-600 flex items-center justify-center text-white font-medium">
                {{ index + 1 }}
              </div>
              
              <!-- 事件内容 -->
              <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div class="flex justify-between items-start mb-2">
                  <h4 class="font-medium">{{ entity.name }}</h4>
                  <span class="text-sm text-gray-500">{{ formatDate(entity.timestamp) }}</span>
                </div>
                <div class="text-sm mb-3">{{ entity.description }}</div>
                
                <!-- 相关关系 -->
                <div v-if="getRelatedRelations(entity.id).length > 0" class="space-y-2">
                  <div class="text-xs font-medium text-gray-500">相关关系:</div>
                  <div 
                    v-for="relation in getRelatedRelations(entity.id)" 
                    :key="relation.id"
                    class="flex items-center space-x-2 text-sm"
                  >
                    <span class="text-blue-600 dark:text-blue-400">{{ relation.relationType }}</span>
                    <span>
                      {{ relation.sourceEntity === entity.name ? relation.targetEntity : relation.sourceEntity }}
                    </span>
                    <span class="text-xs text-gray-500">({{ (relation.confidence * 100).toFixed(0) }}%)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 记忆合成 -->
      <div class="mt-6">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-3">记忆合成</h3>
        <div v-if="!memorySynthesis" class="text-center py-8 text-gray-500">
          暂无记忆合成数据
        </div>
        <div v-else class="space-y-3">
          <div 
            class="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-md cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-200"
            @click="handleMemorySynthesisClick()"
          >
            <div class="font-medium mb-1">合成摘要</div>
            <div class="text-sm">{{ memorySynthesis.summary }}</div>
          </div>
          <div 
            class="p-4 border rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
            @click="handleMemorySynthesisClick()"
          >
            <div class="font-medium mb-1">合成内容</div>
            <div class="text-sm whitespace-pre-wrap">{{ memorySynthesis.content }}</div>
          </div>
          <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
            <div class="font-medium mb-2">相关记忆</div>
            <div class="flex flex-wrap gap-2">
              <span 
                v-for="mem in memorySynthesis.relatedMemories" 
                :key="mem.id" 
                class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                @click="$router.push({ path: `/memory/${mem.id}`, query: { project: memory?.value?.project } })"
              >
                {{ mem.summary }}
              </span>
            </div>
          </div>
          <div 
            class="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-md cursor-pointer hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-all duration-200"
            @click="handleMemorySynthesisClick()"
          >
            <div class="font-medium mb-2">合成说明</div>
            <div class="text-sm text-gray-600 dark:text-gray-300">
              记忆合成利用知识图谱的关联关系和时序实体的时间信息，将多个相关记忆片段合成为完整的知识内容。
              合成过程依赖图谱中的关系和时序信息，将分散记忆按逻辑和时间顺序整合，保留关键信息并消除冗余。
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ChevronLeft, Tag, Calendar, BarChart3, Zap, CheckCircle } from 'lucide-vue-next'
import GraphDisplay from '../components/GraphDisplay.vue'

// 路由和导航
const route = useRoute()
const router = useRouter()
const memoryId = computed(() => route.params.id as string)
const project = computed(() => route.query.project as string)

// 状态管理
const memory = ref<any>(null)
const highlightedNodeIds = ref<string[]>([])

// 模拟数据 - 知识图谱关联
const relatedEntities = ref([
  {
    id: 'ent1',
    name: 'AI',
    type: 'technology',
    confidence: 0.95
  },
  {
    id: 'ent2',
    name: '机器学习',
    type: 'technology',
    confidence: 0.92
  },
  {
    id: 'ent3',
    name: '模型训练',
    type: 'technology',
    confidence: 0.88
  },
  {
    id: 'ent4',
    name: '数据预处理',
    type: 'technology',
    confidence: 0.90
  }
])

const relatedRelations = ref([
  {
    id: 'rel1',
    source: 'AI',
    target: '机器学习',
    type: '包含',
    description: 'AI包含机器学习',
    confidence: 0.98
  },
  {
    id: 'rel2',
    source: '机器学习',
    target: '模型训练',
    type: '包含',
    description: '机器学习包含模型训练',
    confidence: 0.95
  },
  {
    id: 'rel3',
    source: '模型训练',
    target: '数据预处理',
    type: '包含',
    description: '模型训练包含数据预处理',
    confidence: 0.92
  }
])

const relatedMemories = ref([
  {
    id: '2',
    summary: '深度学习模型部署策略文档',
    createdAt: '2024-01-14T09:15:00Z'
  },
  {
    id: '3',
    summary: '系统性能优化建议',
    createdAt: '2024-01-13T16:45:00Z'
  }
])

// 模拟数据 - 时序实体
const temporalEntities = ref([
  {
    id: memoryId.value,
    name: 'AI模型训练咨询',
    type: 'event',
    timestamp: '2024-01-15T10:30:00Z',
    description: '用户与AI助手之间关于AI模型训练最佳实践的对话',
    confidence: 0.95
  },
  {
    id: `${memoryId.value}_data_prep`,
    name: '数据预处理讨论',
    type: 'event',
    timestamp: '2024-01-15T10:32:00Z',
    description: '讨论了AI模型训练中的数据预处理步骤和最佳实践',
    confidence: 0.92
  },
  {
    id: `${memoryId.value}_model_selection`,
    name: '模型选择讨论',
    type: 'event',
    timestamp: '2024-01-15T10:35:00Z',
    description: '讨论了AI模型训练中的模型选择策略和考虑因素',
    confidence: 0.90
  },
  {
    id: `${memoryId.value}_hyperparameter`,
    name: '超参数调优讨论',
    type: 'event',
    timestamp: '2024-01-15T10:38:00Z',
    description: '讨论了AI模型训练中的超参数调优方法和技巧',
    confidence: 0.88
  }
])

// 模拟数据 - 关系推理
const relationInferences = ref([
  {
    id: 'rel1',
    sourceEntity: 'AI模型训练咨询',
    targetEntity: '数据预处理讨论',
    relationType: '包含',
    project: 'AI客服助手',
    confidence: 0.98,
    inferenceMethod: '时序分析',
    description: 'AI模型训练咨询包含数据预处理讨论',
    evidence: [
      '对话记录显示AI模型训练咨询涵盖了数据预处理内容',
      '时序分析显示数据预处理讨论是AI模型训练咨询的一部分'
    ],
    metadata: {
      inferredAt: '2024-01-15T10:35:00Z',
      lastValidated: '2024-01-15T11:00:00Z',
      validationStatus: 'confirmed',
      strength: 'strong'
    }
  },
  {
    id: 'rel2',
    sourceEntity: '数据预处理讨论',
    targetEntity: '模型选择讨论',
    relationType: '发生在之前',
    project: 'AI客服助手',
    confidence: 1.0,
    inferenceMethod: '时间戳分析',
    description: '数据预处理讨论发生在模型选择讨论之前',
    evidence: [
      '数据预处理讨论时间戳: 2024-01-15T10:32:00Z',
      '模型选择讨论时间戳: 2024-01-15T10:35:00Z'
    ],
    metadata: {
      inferredAt: '2024-01-15T10:40:00Z',
      lastValidated: '2024-01-15T11:00:00Z',
      validationStatus: 'confirmed',
      strength: 'strong'
    }
  },
  {
    id: 'rel3',
    sourceEntity: '模型选择讨论',
    targetEntity: '超参数调优讨论',
    relationType: '发生在之前',
    project: 'AI客服助手',
    confidence: 1.0,
    inferenceMethod: '时间戳分析',
    description: '模型选择讨论发生在超参数调优讨论之前',
    evidence: [
      '模型选择讨论时间戳: 2024-01-15T10:35:00Z',
      '超参数调优讨论时间戳: 2024-01-15T10:38:00Z'
    ],
    metadata: {
      inferredAt: '2024-01-15T10:42:00Z',
      lastValidated: '2024-01-15T11:00:00Z',
      validationStatus: 'confirmed',
      strength: 'strong'
    }
  },
  {
    id: 'rel4',
    sourceEntity: '数据预处理讨论',
    targetEntity: '超参数调优讨论',
    relationType: '影响',
    project: 'AI客服助手',
    confidence: 0.85,
    inferenceMethod: '因果推理',
    description: '数据预处理讨论的内容影响了后续的超参数调优讨论',
    evidence: [
      '数据预处理讨论中提到的特征工程影响了超参数选择',
      '超参数调优讨论中引用了数据预处理的结果'
    ],
    metadata: {
      inferredAt: '2024-01-15T11:00:00Z',
      lastValidated: '2024-01-15T12:00:00Z',
      validationStatus: 'pending',
      strength: 'medium'
    }
  },
  {
    id: 'rel5',
    sourceEntity: 'AI模型训练咨询',
    targetEntity: 'AI模型训练最佳实践',
    relationType: '产生',
    project: 'AI客服助手',
    confidence: 0.92,
    inferenceMethod: '知识合成',
    description: 'AI模型训练咨询产生了AI模型训练最佳实践知识',
    evidence: [
      '咨询内容涵盖了AI模型训练的关键步骤',
      '合成记忆中包含了从咨询中提取的最佳实践'
    ],
    metadata: {
      inferredAt: '2024-01-15T12:00:00Z',
      lastValidated: '2024-01-15T13:00:00Z',
      validationStatus: 'confirmed',
      strength: 'strong'
    }
  }
])

// 模拟数据 - 记忆合成
const memorySynthesis = ref({
  id: 'synth1',
  summary: 'AI模型训练最佳实践综合分析',
  content: '综合多个记忆片段，AI模型训练最佳实践包括数据预处理、模型选择和超参数调优等关键步骤。这些步骤相互关联，共同影响模型的最终性能。数据预处理确保输入数据的质量，模型选择决定了模型的架构，超参数调优则优化模型的性能。',
  relatedMemories: [
    { id: '1', summary: 'AI模型训练最佳实践咨询' },
    { id: '2', summary: '深度学习模型部署策略文档' }
  ]
})

// 格式化函数
const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const formatDate = (dateString: string): string => {
  if (!dateString) return ''
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

const getEntityColor = (type: string): string => {
  const colorMap: Record<string, string> = {
    'person': '#3B82F6',
    'project': '#10B981',
    'technology': '#F59E0B',
    'location': '#EF4444',
    'event': '#8B5CF6',
    'concept': '#06B6D4'
  }
  return colorMap[type] || '#6B7280'
}

const getValidationStatusColor = (status: string): string => {
  switch (status) {
    case "confirmed": return "text-green-600 dark:text-green-400";
    case "pending": return "text-yellow-600 dark:text-yellow-400";
    case "needs_review": return "text-orange-600 dark:text-orange-400";
    case "rejected": return "text-red-600 dark:text-red-400";
    default: return "text-gray-600 dark:text-gray-400";
  }
}

// 记忆相关图谱数据
const memoryGraphData = computed(() => {
  // 这里应该根据记忆ID获取相关的图谱数据
  // 使用与知识图谱页面一致的数据格式和生成逻辑
  const nodes = [
    {
      id: `memory_concept_${memoryId.value}`,
      label: memory.value?.summary || '记忆概念',
      type: 'memory_concept' as 'memory_concept',
      memoryIds: [memoryId.value],
      confidence: memory.value?.relevanceScore || 0.5
    },
    ...relatedEntities.value.map((entity, index) => ({
      id: `entity_${entity.id || index}`,
      label: entity.name,
      type: entity.type as 'technology' | 'person' | 'project' | 'location' | 'event' | 'concept',
      memoryIds: [memoryId.value],
      confidence: entity.confidence || 0.9
    }))
  ]
  
  const edges = relatedRelations.value.map((relation, index) => ({
    source: `memory_concept_${memoryId.value}`,
    target: `entity_${relation.target || index}`,
    type: relation.type,
    confidence: relation.confidence || 0.9
  }))
  
  return { nodes, links: edges }
})

// 计算属性：按时间排序的时序实体
const sortedTemporalEntities = computed(() => {
  return [...temporalEntities.value].sort((a, b) => {
    return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  })
})

// 获取与特定实体相关的关系
const getRelatedRelations = (entityId: string) => {
  const entityName = temporalEntities.value.find(e => e.id === entityId)?.name || ''
  return relationInferences.value.filter(relation => {
    return relation.sourceEntity === entityName || relation.targetEntity === entityName
  })
}

// 方法
const handleBack = () => {
  // 返回记忆列表页面，携带项目信息
  router.push({
    path: '/memory',
    query: {
      project: memory.value?.project
    }
  })
}

const handleNodeClick = (nodeId: string) => {
  highlightedNodeIds.value = [nodeId]
}

const handleTemporalEntityClick = (entity: any) => {
  // 跳转到独立的时序实体页面
  router.push({
    path: '/temporal-entities',
    query: {
      project: memory.value?.project
    }
  })
}

const handleRelationClick = (relation: any) => {
  // 跳转到独立的关系推理页面
  router.push({
    path: '/relation-inference',
    query: {
      project: memory.value?.project
    }
  })
}

const handleMemorySynthesisClick = () => {
  // 跳转到独立的记忆合成页面
  router.push({
    path: '/memory-synthesis',
    query: {
      project: memory.value?.project
    }
  })
}

const fetchMemoryDetail = () => {
  // 这里应该根据memoryId从API获取记忆详情
  // 现在使用模拟数据
  memory.value = {
    id: memoryId.value,
    content: "用户询问关于AI模型训练的最佳实践，包括数据预处理、模型选择和超参数调优等方面的详细信息。",
    summary: "AI模型训练最佳实践咨询",
    tags: ["AI", "机器学习", "训练", "最佳实践"],
    project: "AI客服助手",
    createdAt: "2024-01-15T10:30:00Z",
    lastAccessed: "2024-01-16T14:20:00Z",
    accessCount: 15,
    relevanceScore: 0.92,
    type: "conversation",
    size: 1024,
    context: {
      emotion: 'neutral',
      intent: 'information_request',
      participants: ['user', 'assistant']
    }
  }
}

// 初始化
onMounted(() => {
  fetchMemoryDetail()
})
</script>