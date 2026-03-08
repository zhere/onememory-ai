<template>
  <div class="space-y-6">
    <!-- 页面标题和项目选择 -->
    <div class="flex justify-between items-center flex-wrap gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">知识图谱</h1>
        <p class="mt-2 text-gray-600 dark:text-gray-400">
          结构化的知识表示框架，由实体（节点）和关系（边）组成，用于描述事物及其相互联系
        </p>
      </div>
      <div class="flex items-center space-x-4 flex-wrap gap-2">
        <router-link
          to="/memory"
          class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          记忆管理
        </router-link>
        <select v-model="selectedProject" class="w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="all">所有项目</option>
          <option v-for="project in projects" :key="project.id" :value="project.name">
            {{ project.name }}
          </option>
        </select>
        <button 
          @click="refreshGraph"
          class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center"
        >
          <RefreshCw class="h-4 w-4 mr-2" />
          刷新图谱
        </button>
      </div>
    </div>

    <!-- 主要布局：左右两栏 -->
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <!-- 左侧：主要内容区域 (占3份) -->
      <div class="lg:col-span-3 space-y-6">
        <!-- 搜索和筛选 -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="md:col-span-2">
              <div class="relative">
                <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  v-model="searchQuery"
                  placeholder="搜索实体、关系..."
                  class="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <select v-model="selectedEntityType" class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">所有类型</option>
              <option value="person">人员</option>
              <option value="project">项目</option>
              <option value="technology">技术</option>
              <option value="location">位置</option>
              <option value="event">事件</option>
            </select>
            
            <div class="flex items-center space-x-2">
              <span class="text-sm text-muted-foreground">置信度:</span>
              <input
                v-model="minConfidence"
                type="number"
                min="0"
                max="1"
                step="0.1"
                class="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <!-- 主要内容区域 -->
        <div class="w-full">
          <div v-if="selectedProject === 'all'" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-4">
            <div class="flex items-center text-yellow-600 dark:text-yellow-400">
              <AlertCircle class="h-5 w-5 mr-2" />
              <p class="text-sm">未选择项目，显示所有可用的知识图谱数据</p>
            </div>
          </div>
          <div v-else>
            <div class="grid grid-cols-6 gap-2 mb-4">
              <button 
                v-for="tab in tabs" 
                :key="tab.value"
                @click="selectedTab = tab.value"
                :class="[
                  'px-4 py-2 rounded-md transition-colors',
                  selectedTab === tab.value 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                ]"
              >
                {{ tab.label }}
              </button>
            </div>

            <!-- 图谱视图 -->
            <div v-if="selectedTab === 'graph'" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div class="flex justify-between items-center mb-4">
                <h2 class="text-lg font-semibold flex items-center">
                  <Network class="h-5 w-5 mr-2" />
                  整合知识图谱
                </h2>
              </div>
              <div class="h-[500px] border rounded-lg bg-gray-50 dark:bg-gray-900 relative">
                <div ref="graphContainer" class="graph-container w-full h-full min-h-[500px]"></div>
                <div v-if="filteredGraph.nodes.length === 0" class="absolute inset-0 flex items-center justify-center text-gray-500">
                  暂无符合条件的图谱数据
                </div>
              </div>
              <p class="mt-4 text-sm text-muted-foreground">
                整合了Zep Graphiti实体关系和记忆管理数据的知识图谱。<br>
                蓝色节点：Zep实体，绿色节点：记忆概念，橙色节点：记忆标签
              </p>
            </div>

            <!-- 实体列表 -->
            <div v-if="selectedTab === 'entities'" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 class="text-lg font-semibold mb-4">实体列表</h2>
              <div class="space-y-4">
                <div 
                  v-for="entity in filteredEntities" 
                  :key="entity.id" 
                  :class="[
                    'border rounded-lg p-4 transition-all duration-200',
                    'hover:bg-gray-50 dark:hover:bg-gray-800',
                    highlightedEntityId === entity.id ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700' : ''
                  ]"
                >
                  <div class="flex justify-between items-start">
                    <div class="flex-1">
                      <div class="flex items-center space-x-2">
                        <h3 class="font-semibold">{{ entity.name }}</h3>
                        <span class="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-sm">{{ entity.type }}</span>
                        <span class="px-2 py-1 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded text-sm">
                          置信度: {{ (entity.confidence * 100).toFixed(1) }}%
                        </span>
                      </div>
                      <p class="text-sm text-muted-foreground mt-1">{{ entity.description }}</p>
                      <div class="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                        <span>创建: {{ formatDate(entity.createdAt) }}</span>
                        <span>更新: {{ formatDate(entity.updatedAt) }}</span>
                      </div>
                    </div>
                    <button class="p-2 border border-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">
                      <Eye class="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 关系列表 -->
            <div v-if="selectedTab === 'relations'" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 class="text-lg font-semibold mb-4">关系列表</h2>
              <div class="space-y-4">
                <div 
                  v-for="relation in filteredRelations" 
                  :key="relation.id" 
                  :class="[
                    'border rounded-lg p-4 cursor-pointer transition-colors',
                    selectedRelation?.id === relation.id 
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  ]"
                  @click="selectRelation(relation)"
                >
                  <div class="flex justify-between items-start">
                    <div class="flex-1">
                      <div class="flex items-center space-x-2">
                        <span class="font-medium">{{ getEntityName(relation.source) }}</span>
                        <span class="text-muted-foreground">→</span>
                        <span class="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-sm">{{ relation.type }}</span>
                        <span class="text-muted-foreground">→</span>
                        <span class="font-medium">{{ getEntityName(relation.target) }}</span>
                        <span class="px-2 py-1 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded text-sm">
                          {{ (relation.confidence * 100).toFixed(1) }}%
                        </span>
                      </div>
                      <p class="text-sm text-muted-foreground mt-1">{{ relation.description }}</p>
                      <div class="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                        <span class="flex items-center">
                          <BarChart3 class="w-3 h-3 mr-1" />
                          置信度: {{ (relation.confidence * 100).toFixed(1) }}%
                        </span>
                        <span v-if="relation.inferenceMethod" class="flex items-center">
                          <Zap class="w-3 h-3 mr-1" />
                          方法: {{ relation.inferenceMethod }}
                        </span>
                        <span v-if="relation.metadata?.validationStatus" :class="[
                          'flex items-center',
                          getValidationStatusColor(relation.metadata.validationStatus)
                        ]">
                          <CheckCircle class="w-3 h-3 mr-1" />
                          {{ relation.metadata.validationStatus }}
                        </span>
                      </div>
                      
                      <!-- 证据信息 -->
                      <div v-if="relation.evidence && relation.evidence.length > 0" class="mt-2 text-xs">
                        <div class="font-medium mb-1">支持证据:</div>
                        <div class="space-y-1">
                          <div 
                            v-for="(evidence, index) in relation.evidence" 
                            :key="index"
                            class="flex items-start space-x-2"
                          >
                            <CheckCircle class="w-3 h-3 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                            <span>{{ evidence }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 时序实体 -->
            <div v-if="selectedTab === 'temporal-entities'" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 class="text-lg font-semibold mb-4">时序实体</h2>
              <div class="space-y-4">
                <div v-if="temporalEntities.length === 0" class="text-center py-8 text-gray-500">
                  暂无时序实体数据
                </div>
                <div 
                  v-for="entity in temporalEntities" 
                  :key="entity.id" 
                  class="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
                >
                  <div class="flex justify-between items-start">
                    <div class="flex-1">
                      <div class="flex items-center space-x-2">
                        <h3 class="font-semibold">{{ entity.name }}</h3>
                        <span class="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-sm">{{ entity.type }}</span>
                        <span class="px-2 py-1 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded text-sm">
                          置信度: {{ (entity.confidence * 100).toFixed(1) }}%
                        </span>
                      </div>
                      <p class="text-sm text-muted-foreground mt-1">{{ entity.description }}</p>
                      <div class="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                        <span>时间: {{ formatDate(entity.timestamp) }}</span>
                        <span>创建: {{ formatDate(entity.createdAt) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 记忆合成 -->
            <div v-if="selectedTab === 'memory-synthesis'" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 class="text-lg font-semibold mb-4">记忆合成</h2>
              <div class="space-y-4">
                <div v-if="memorySyntheses.length === 0" class="text-center py-8 text-gray-500">
                  暂无记忆合成数据
                </div>
                <div 
                  v-for="synthesis in memorySyntheses" 
                  :key="synthesis.id" 
                  class="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
                >
                  <div class="flex justify-between items-start">
                    <div class="flex-1">
                      <h3 class="font-semibold">{{ synthesis.summary }}</h3>
                      <p class="text-sm text-muted-foreground mt-1">{{ synthesis.content }}</p>
                      <div class="mt-3">
                        <p class="text-xs font-medium text-muted-foreground">相关记忆:</p>
                        <div class="flex flex-wrap gap-2 mt-1">
                          <span 
                            v-for="memory in synthesis.relatedMemories" 
                            :key="memory.id"
                            class="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-xs"
                          >
                            {{ memory.summary }}
                          </span>
                        </div>
                      </div>
                      <div class="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                        <span>创建: {{ formatDate(synthesis.createdAt) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 记忆列表 -->
            <div v-if="selectedTab === 'memories'" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 class="text-lg font-semibold mb-4">记忆列表</h2>
              <div class="space-y-4">
                <div 
                  v-for="memory in filteredMemories" 
                  :key="memory.id" 
                  @click="handleMemorySelect(memory.id)"
                  :class="[
                    'border rounded-lg p-4 cursor-pointer transition-colors',
                    highlightedMemoryIds.includes(memory.id) 
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  ]"
                >
                  <div class="flex justify-between items-start">
                    <div class="flex-1">
                      <div class="flex items-center space-x-2">
                        <h3 class="font-semibold">{{ memory.summary }}</h3>
                        <span class="px-2 py-1 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded text-sm" :class="`importance-${memory.importance}`">
                          {{ memory.importance === 'high' ? '高重要性' : memory.importance === 'medium' ? '中重要性' : '低重要性' }}
                        </span>
                      </div>
                      <p class="text-sm text-muted-foreground mt-1 line-clamp-2">{{ memory.content }}</p>
                      <div class="flex items-center justify-between mt-2">
                        <div class="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span class="flex items-center">
                            <Calendar class="w-3 h-3 mr-1" />
                            {{ formatDate(new Date(memory.createdAt)) }}
                          </span>
                          <span class="flex items-center">
                            <FolderSearch class="w-3 h-3 mr-1" />
                            {{ memory.project }}
                          </span>
                        </div>
                        <div class="flex items-center space-x-1">
                          <span v-for="tag in memory.tags" :key="tag" class="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-xs">
                            {{ tag }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：辅助功能区域 (占1份) -->
      <div class="space-y-6">
        <!-- 统计卡片 -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 class="text-lg font-semibold mb-4">知识图谱概览</h3>
          <div class="space-y-4">
            <div class="flex items-center p-3 rounded-md bg-gray-50 dark:bg-gray-900">
              <Network class="h-6 w-6 text-blue-600" />
              <div class="ml-3 flex-1">
                <p class="text-sm text-muted-foreground">实体数量</p>
                <p class="text-xl font-bold">{{ stats.totalEntities }}</p>
              </div>
            </div>
            
            <div class="flex items-center p-3 rounded-md bg-gray-50 dark:bg-gray-900">
              <BarChart3 class="h-6 w-6 text-green-600" />
              <div class="ml-3 flex-1">
                <p class="text-sm text-muted-foreground">关系数量</p>
                <p class="text-xl font-bold">{{ stats.totalRelations }}</p>
              </div>
            </div>
            
            <div class="flex items-center p-3 rounded-md bg-gray-50 dark:bg-gray-900">
              <Clock class="h-6 w-6 text-indigo-600" />
              <div class="ml-3 flex-1">
                <p class="text-sm text-muted-foreground">时序实体数</p>
                <p class="text-xl font-bold">{{ stats.totalTemporalEntities }}</p>
              </div>
            </div>
            
            <div class="flex items-center p-3 rounded-md bg-gray-50 dark:bg-gray-900">
              <Merge class="h-6 w-6 text-purple-600" />
              <div class="ml-3 flex-1">
                <p class="text-sm text-muted-foreground">记忆合成数</p>
                <p class="text-xl font-bold">{{ stats.totalMemorySyntheses }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 快速访问 -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 class="text-lg font-semibold mb-4">快速访问</h3>
          <div class="space-y-2">
            <button 
              v-for="tab in tabs" 
              :key="tab.value"
              @click="selectedTab = tab.value"
              class="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
            >
              <div class="flex items-center">
                <component :is="getTabIcon(tab.value)" class="h-5 w-5 mr-3 text-gray-600 dark:text-gray-400" />
                <span>{{ tab.label }}</span>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <!-- 项目信息 -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 class="text-lg font-semibold mb-4">当前项目</h3>
          <div class="p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
            <p class="text-sm text-muted-foreground">项目名称</p>
            <p class="text-lg font-medium mt-1">{{ selectedProject === 'all' ? '所有项目' : selectedProject }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import * as d3 from 'd3'
import { Network, Eye, AlertCircle, Search, RefreshCw, BarChart3, Brain, FolderSearch, Calendar, Tag, Zap, CheckCircle, Clock, Merge } from 'lucide-vue-next'
import { useProjectStore } from '@/stores/project'
import { useKnowledgeGraphStore } from '@/stores/knowledgeGraph'
import { useMemoryStore } from '@/stores/memory'

// 状态管理
const projectStore = useProjectStore()
const knowledgeGraphStore = useKnowledgeGraphStore()
const memoryStore = useMemoryStore()
const router = useRouter()
const route = useRoute()

// 响应式数据
const searchQuery = ref<string>('');
const selectedEntityType = ref<string>('all');
const selectedRelationType = ref<string>('all');
const selectedTag = ref<string>('all');
const importanceFilter = ref<string>('all');
const confidenceFilter = ref<number>(0);
const selectedTab = ref<string>('graph');
const highlightedMemoryIds = ref<string[]>([]);
// 新增：用于接收查询参数，高亮显示指定实体
const highlightedEntityId = ref<string | null>(null);
// 新增：选中的关系
const selectedRelation = ref<any>(null);

// 监听路由查询参数变化
watch(() => route.query, (newQuery) => {
  // 处理标签页切换
  if (newQuery.tab) {
    selectedTab.value = newQuery.tab as string;
  }
  
  // 处理实体类型筛选
  if (newQuery.entityType) {
    selectedEntityType.value = newQuery.entityType as string;
  }
  
  // 处理项目筛选
  if (newQuery.project) {
    selectedProject.value = newQuery.project as string;
  }
  
  // 处理实体高亮
  if (newQuery.highlightEntity) {
    highlightedEntityId.value = newQuery.highlightEntity as string;
  }
}, { immediate: true, deep: true })

// 项目选择，直接使用项目名称
const selectedProject = ref<string>('all');

// 新增：最小置信度筛选
const minConfidence = ref<number>(0);

// 标签页配置
const tabs = [
  { label: '图谱视图', value: 'graph' },
  { label: '实体列表', value: 'entities' },
  { label: '关系列表', value: 'relations' },
  { label: '时序实体', value: 'temporal-entities' },
  { label: '记忆合成', value: 'memory-synthesis' },
  { label: '记忆列表', value: 'memories' }
]

// 计算属性
const projects = computed(() => projectStore.projects)

// 获取知识图谱数据 - 不再使用，已被filteredGraph取代
const knowledgeGraph = computed(() => {
  const allNodes: any[] = []
  const allLinks: any[] = []
  
  // 获取所有项目的图谱数据
  projectStore.projects.forEach(project => {
    const graph = knowledgeGraphStore.getGraphByProjectId(project.id).value;
    allNodes.push(...graph.nodes.map(node => ({
      ...node,
      label: node.name,
      memoryIds: []
    })));
    allLinks.push(...graph.links.map(link => ({
      ...link
    })));
  });
  
  // 整合记忆管理的图谱数据
  memories.value.forEach(memory => {
    // 主概念节点
    const conceptNode = {
      id: `memory_concept_${memory.id}`,
      label: memory.summary,
      type: "memory_concept",
      memoryIds: [memory.id],
      confidence: memory.relevanceScore
    };
    allNodes.push(conceptNode);

    // 基于标签生成实体节点并连接到现有实体
    memory.tags.forEach((tag) => {
      const existingEntity = allNodes.find(e => 
        e.type === 'technology' && e.name.toLowerCase() === tag.toLowerCase()
      );
      
      if (existingEntity) {
        // 连接到现有实体
        allLinks.push({
          id: `link_${conceptNode.id}_${existingEntity.id}`,
          source: conceptNode.id,
          target: existingEntity.id,
          type: "relates_to",
          confidence: memory.relevanceScore,
          createdAt: memory.createdAt
        });
      } else {
        // 创建新的标签实体
        const tagNode = {
          id: `memory_tag_${memory.id}_${tag}`,
          label: tag,
          type: "memory_tag",
          memoryIds: [memory.id],
          confidence: memory.relevanceScore
        };
        allNodes.push(tagNode);
        
        allLinks.push({
          id: `link_${conceptNode.id}_${tagNode.id}`,
          source: conceptNode.id,
          target: tagNode.id,
          type: "tagged_with",
          confidence: memory.relevanceScore,
          createdAt: memory.createdAt
        });
      }
    });
  });
  
  return { nodes: allNodes, links: allLinks }
})

// 获取记忆数据
const memories = computed(() => {
  return memoryStore.memories
})

// 时序实体数据（从实体列表中筛选）
const temporalEntities = computed(() => {
  return entities.value.filter(entity => {
    const typeMatch = ['event', 'temporal'].includes(entity.type);
    const projectMatch = selectedProject.value === "all" || entity.project === selectedProject.value;
    const confidenceMatch = entity.confidence >= minConfidence.value;
    const searchMatch = searchQuery.value === "" || 
      entity.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      entity.description?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      entity.type.toLowerCase().includes(searchQuery.value.toLowerCase());
    
    return typeMatch && projectMatch && confidenceMatch && searchMatch;
  });
});

// 记忆合成数据（模拟数据，实际项目中应从API获取）
const memorySyntheses = computed(() => {
  // 模拟数据，实际项目中应从API获取
  return [
    {
      id: 'synth1',
      summary: 'AI模型训练最佳实践综合分析',
      content: '综合多个记忆片段，AI模型训练最佳实践包括数据预处理、模型选择和超参数调优等关键步骤。这些步骤相互关联，共同影响模型的最终性能。数据预处理确保输入数据的质量，模型选择决定了模型的架构，超参数调优则优化模型的性能。',
      relatedMemories: [
        { id: '1', summary: 'AI模型训练最佳实践咨询' },
        { id: '2', summary: '深度学习模型部署策略文档' }
      ],
      createdAt: '2024-01-15T12:00:00Z'
    },
    {
      id: 'synth2',
      summary: '模型部署与推理加速最佳实践',
      content: '综合分析表明，模型部署需要考虑推理加速、资源管理和容器化等关键因素。推理加速技术如模型剪枝、量化和知识蒸馏可以显著提升模型性能，而容器化部署则提供了更好的可扩展性和可维护性。',
      relatedMemories: [
        { id: '6', summary: '模型部署最佳实践' },
        { id: '7', summary: '推理加速技术详解' }
      ],
      createdAt: '2024-01-16T10:00:00Z'
    },
    {
      id: 'synth3',
      summary: '系统性能优化综合方案',
      content: '系统性能优化需要综合考虑缓存机制、异步处理和监控等方面。合理的缓存设计可以将响应时间降低90%以上，异步处理可以提高系统吞吐量，而实时监控则能帮助及时发现和解决性能问题。',
      relatedMemories: [
        { id: '3', summary: '系统性能优化建议' },
        { id: '8', summary: '缓存机制设计原则' },
        { id: '9', summary: '异步处理框架比较' }
      ],
      createdAt: '2024-01-17T09:00:00Z'
    },
    {
      id: 'synth4',
      summary: '跨项目技术整合方案',
      content: '通过整合多个项目的技术经验，我们发现NLP和机器学习是多个项目的核心技术栈。AI客服助手和内容生成器都依赖NLP技术，而数据分析平台和智能推荐系统则依赖机器学习技术。跨项目的技术整合可以促进知识共享和技术复用。',
      relatedMemories: [
        { id: '1', summary: 'AI模型训练最佳实践咨询' },
        { id: '2', summary: '深度学习模型部署策略文档' },
        { id: '3', summary: '系统性能优化建议' }
      ],
      createdAt: '2024-01-18T10:00:00Z'
    }
  ];
});

// 统计数据
const stats = computed(() => {
  // 直接使用已经计算好的过滤后数据，简化统计逻辑
  return {
    totalEntities: filteredEntities.value.length,
    totalRelations: filteredRelations.value.length,
    totalTemporalEntities: temporalEntities.value.length,
    totalMemorySyntheses: memorySyntheses.value.length
  };
});

// 实体和关系数据
const entities = computed(() => {
  let allEntities: any[] = [];
  
  // 获取所有项目的实体，并添加project字段（使用项目名称）
  knowledgeGraphStore.graphs.forEach(graph => {
    // 查找对应项目的名称
    const project = projectStore.projects.find(p => p.id === graph.projectId);
    const projectName = project ? project.name : graph.projectId;
    
    allEntities.push(...graph.nodes.map(node => ({
      ...node,
      project: projectName // 添加project字段，使用项目名称
    })));
  });
  
  return allEntities;
});

const relations = computed(() => {
  let allRelations: any[] = [];
  
  // 获取所有项目的关系，并添加project字段（使用项目名称）
  knowledgeGraphStore.graphs.forEach(graph => {
    // 查找对应项目的名称
    const project = projectStore.projects.find(p => p.id === graph.projectId);
    const projectName = project ? project.name : graph.projectId;
    
    allRelations.push(...graph.links.map(link => ({
      ...link,
      project: projectName // 添加project字段，使用项目名称
    })));
  });
  
  return allRelations;
});

// 过滤后的实体列表
const filteredEntities = computed(() => {
  // 根据实体类型、项目、置信度和搜索词过滤
  return entities.value.filter(entity => {
    // 实体类型匹配
    const typeMatch = selectedEntityType.value === "all" || entity.type === selectedEntityType.value;
    // 项目匹配
    const projectMatch = selectedProject.value === "all" || entity.project === selectedProject.value;
    // 置信度匹配
    const confidenceMatch = entity.confidence >= minConfidence.value;
    // 搜索词匹配
    const searchMatch = searchQuery.value === "" || 
      entity.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      entity.description?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      entity.type.toLowerCase().includes(searchQuery.value.toLowerCase());
    
    return typeMatch && projectMatch && confidenceMatch && searchMatch;
  });
})

// 过滤后的关系列表
const filteredRelations = computed(() => {
  return relations.value.filter(relation => {
    const sourceExists = filteredEntities.value.some(e => e.id === relation.source);
    const targetExists = filteredEntities.value.some(e => e.id === relation.target);
    const confidenceMatch = relation.confidence >= minConfidence.value;
    const searchMatch = searchQuery.value === "" || 
      relation.type.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      relation.description?.toLowerCase().includes(searchQuery.value.toLowerCase());
    
    return sourceExists && targetExists && confidenceMatch && searchMatch;
  });
})

// 过滤后的记忆列表
const filteredMemories = computed(() => {
  let filtered = memories.value.filter(memory => 
    selectedProject.value === "all" || memory.project === selectedProject.value
  );
  
  // 应用重要性过滤
  if (importanceFilter.value !== 'all') {
    filtered = filtered.filter(m => m.importance === importanceFilter.value);
  }
  
  // 应用标签过滤
  if (selectedTag.value !== 'all') {
    filtered = filtered.filter(m => m.tags.includes(selectedTag.value));
  }
  
  // 应用搜索过滤 - 确保与实体/关系搜索逻辑保持一致
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(m => 
      m.content.toLowerCase().includes(query) || 
      m.summary.toLowerCase().includes(query) ||
      m.tags.some(tag => tag.toLowerCase().includes(query)) ||
      m.project.toLowerCase().includes(query)
    );
  }
  
  return filtered;
})

// 过滤后的图谱数据
const filteredGraph = computed(() => {
  // 生成整合的图谱数据（与React版本一致）
  const nodes: any[] = [];
  const edges: any[] = [];

  // 添加Zep Graphiti实体节点
  filteredEntities.value.forEach(entity => {
    nodes.push({
      id: entity.id,
      label: entity.name,
      type: entity.type,
      confidence: entity.confidence,
      memoryIds: [],
      // 支持时间属性
      timestamp: entity.timestamp,
      // 支持时序实体类型
      isTemporal: ['event', 'temporal'].includes(entity.type)
    });
  });

  // 添加Zep Graphiti关系边
  filteredRelations.value.forEach(relation => {
    edges.push({
      source: relation.source,
      target: relation.target,
      type: relation.type,
      confidence: relation.confidence
    });
  });

  // 整合记忆管理的图谱数据
  filteredMemories.value.forEach((memory) => {
    // 主概念节点
    const conceptNode = {
      id: `memory_concept_${memory.id}`,
      label: memory.summary,
      type: "memory_concept",
      memoryIds: [memory.id],
      confidence: memory.relevanceScore,
      timestamp: memory.createdAt,
      isTemporal: false
    };
    nodes.push(conceptNode);

    // 基于标签生成实体节点并连接到现有实体
    memory.tags.forEach((tag) => {
      const existingEntity = filteredEntities.value.find(e => 
        e.name.toLowerCase() === tag.toLowerCase()
      );
      
      if (existingEntity) {
        // 连接到现有实体
        edges.push({
          source: conceptNode.id,
          target: existingEntity.id,
          type: "relates_to",
          confidence: memory.relevanceScore
        });
      } else {
        // 创建新的标签实体
        const tagNode = {
          id: `memory_tag_${memory.id}_${tag}`,
          label: tag,
          type: "memory_tag",
          memoryIds: [memory.id],
          confidence: memory.relevanceScore,
          isTemporal: false
        };
        nodes.push(tagNode);
        
        edges.push({
          source: conceptNode.id,
          target: tagNode.id,
          type: "tagged_with",
          confidence: memory.relevanceScore
        });
      }
    });

    // 模拟添加时序实体及其关系（实际项目中应从API获取）
    // 示例：为每个记忆添加一个相关的事件节点
    const eventNode = {
      id: `event_${memory.id}`,
      label: `${memory.summary} (事件)`,
      type: "event",
      memoryIds: [memory.id],
      confidence: 0.9,
      timestamp: memory.createdAt,
      isTemporal: true
    };
    nodes.push(eventNode);

    // 连接记忆概念和时序事件
    edges.push({
      source: conceptNode.id,
      target: eventNode.id,
      type: "包含事件",
      confidence: 0.95
    });
  });

  // 添加时间关系（简单示例：按时间顺序连接事件节点）
  // 实际项目中应根据timestamp属性建立"之前"、"之后"等关系
  const eventNodes = nodes.filter(node => node.isTemporal && node.type === 'event');
  if (eventNodes.length > 1) {
    // 按时间排序
    const sortedEvents = [...eventNodes].sort((a, b) => {
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });

    // 添加时间先后关系
    for (let i = 0; i < sortedEvents.length - 1; i++) {
      edges.push({
        source: sortedEvents[i].id,
        target: sortedEvents[i + 1].id,
        type: "发生在之前",
        confidence: 1.0
      });
    }
  }

  return { nodes, links: edges };
})

// D3图表相关变量
const graphContainer = ref<HTMLElement | null>(null)
let simulation: d3.Simulation<any, undefined> | null = null
let svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any> | null = null
let zoomBehavior: d3.ZoomBehavior<SVGSVGElement, unknown> | null = null

const groupColorScale = d3.scaleOrdinal<string>()
  .domain(['person', 'project', 'technology', 'location', 'memory_concept', 'memory_tag', 'event', 'concept'])
  .range(['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#8B5CF6', '#3B82F6'])

// 方法
const refreshGraph = () => {
  // 重新加载数据（这里只是模拟重新加载，实际项目中可能需要从API获取）
  // knowledgeGraphStore 和 memoryStore 的数据已经是响应式的，无需额外加载
  // 可以在这里添加数据刷新逻辑，比如从API重新获取数据
  console.log('刷新图谱数据')
}

const getEntityName = (entityId: string) => {
  // 从完整的实体列表中查找实体
  const entity = entities.value.find(n => n.id === entityId)
  return entity ? entity.name || entity.label || '未知实体' : '未知实体'
}

const getTabIcon = (tabValue: string) => {
  // 根据标签页值返回对应的图标组件
  switch (tabValue) {
    case 'graph':
      return Network
    case 'entities':
      return Brain
    case 'relations':
      return BarChart3
    case 'temporal-entities':
      return Clock
    case 'memory-synthesis':
      return Merge
    case 'memories':
      return FolderSearch
    default:
      return Network
  }
}

const handleMemorySelect = (memoryId: string) => {
  // 跳转到记忆详情页面，携带项目信息
  router.push({
    path: `/memory/${memoryId}`,
    query: {
      project: selectedProject.value
    }
  })
}

const selectRelation = (relation: any) => {
  selectedRelation.value = relation;
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

const formatDate = (date: Date | string) => {
  if (!date) return '未知'
  const d = new Date(date)
  return d.toLocaleDateString('zh-CN')
}

function renderGraph(graphData: { nodes: any[], links: any[] }) {
  // 确保graphContainer存在
  if (!graphContainer.value) {
    console.log('图表容器未找到')
    return
  }

  // 清除之前的内容
  d3.select(graphContainer.value).selectAll('*').remove()

  // 验证数据格式
  if (!graphData || !Array.isArray(graphData.nodes) || !Array.isArray(graphData.links)) {
    console.log('无效的图谱数据格式:', graphData)
    return
  }

  if (graphData.nodes.length === 0) {
    console.log('没有图谱数据可渲染')
    return // 如果没有数据，则不渲染
  }

  // 确保容器有正确的尺寸
  const containerRect = graphContainer.value.getBoundingClientRect()
  const width = containerRect.width > 0 ? containerRect.width : 800
  const height = containerRect.height > 0 ? containerRect.height : 600
  
  console.log('图表容器尺寸:', width, 'x', height)
  console.log('图谱数据:', graphData.nodes.length, '个节点,', graphData.links.length, '条连线')

  // 如果容器尺寸仍然为0，说明元素可能尚未完全渲染，延迟重试
  if (width === 0 || height === 0) {
    console.log('容器尺寸为0，延迟重试')
    setTimeout(() => {
      if (graphContainer.value) {
        const newRect = graphContainer.value.getBoundingClientRect()
        if (newRect.width > 0 && newRect.height > 0) {
          console.log('延迟重试成功，新容器尺寸:', newRect.width, 'x', newRect.height)
          renderGraph(graphData)
        } else {
          console.log('延迟重试失败，容器尺寸仍为0')
        }
      }
    }, 300)
    return
  }

  // 创建SVG容器
  const svgContainer = d3.select(graphContainer.value)
  const svgSelection = svgContainer.append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('class', 'w-full h-full')

  // 保存SVG引用用于后续操作
  svg = svgSelection as unknown as d3.Selection<SVGSVGElement, unknown, HTMLElement, any>
  
  // 添加缩放功能
  const g = svgSelection.append('g')
  
  zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.1, 4])
    .on('zoom', (event) => {
      g.attr('transform', event.transform)
    })

  svgSelection.call(zoomBehavior)

  // 创建力导向模拟
  simulation = d3.forceSimulation(graphData.nodes as d3.SimulationNodeDatum[])
    .force('link', d3.forceLink(graphData.links)
      .id((d: any) => d.id)
      .distance(100))
    .force('charge', d3.forceManyBody().strength(-300))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide().radius(30))

  // 添加箭头标记
  svgSelection.append('defs').selectAll('marker')
    .data(['link'])
    .enter().append('marker')
    .attr('id', 'arrow')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 25)
    .attr('refY', 0)
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M0,-5L10,0L0,5')
    .attr('fill', '#999')



  // 绘制连线
  const link = g.append('g')
    .selectAll('line')
    .data(graphData.links)
    .enter().append('line')
    .attr('stroke', '#999')
    .attr('stroke-opacity', 0.6)
    .attr('stroke-width', 2)
    .attr('marker-end', 'url(#arrow)')

  // 添加连线标签
  const linkLabel = g.append('g')
    .selectAll('text')
    .data(graphData.links)
    .enter().append('text')
    .attr('text-anchor', 'middle')
    .attr('font-size', '10px')
    .attr('fill', '#666')
    .text((d: any) => d.type)

  // 绘制节点
  const node = g.append('g')
    .selectAll('circle')
    .data(graphData.nodes)
    .enter().append('circle')
    .attr('r', (d: any) => {
      // 如果是高亮实体，放大显示
      if (d.id === highlightedEntityId.value) return 25
      if (d.type === 'memory_concept') return 12
      if (d.type === 'memory_tag') return 10
      return 15
    })
    .attr('fill', (d: any) => groupColorScale(d.type))
    .attr('stroke', (d: any) => {
      // 如果是高亮实体，添加特殊边框
      return d.id === highlightedEntityId.value ? '#F59E0B' : '#fff'
    })
    .attr('stroke-width', (d: any) => {
      // 如果是高亮实体，加粗边框
      return d.id === highlightedEntityId.value ? 4 : 2
    })
    .call(d3.drag<SVGCircleElement, any>()
      .on('start', (event, d) => {
        if (!event.active) simulation?.alphaTarget(0.3).restart()
        d.fx = d.x
        d.fy = d.y
      })
      .on('drag', (event, d) => {
        d.fx = event.x
        d.fy = event.y
      })
      .on('end', (event, d) => {
        if (!event.active) simulation?.alphaTarget(0)
        d.fx = null
        d.fy = null
      }))
    .on('mouseover', function(event, d: any) {
      d3.select(this).attr('r', (d: any) => {
        if (d.id === highlightedEntityId.value) return 30
        if (d.type === 'memory_concept') return 16
        if (d.type === 'memory_tag') return 14
        return 20
      })
      showTooltip(event, d)
    })
    .on('mouseout', function(event, d: any) {
      d3.select(this).attr('r', (d: any) => {
        if (d.id === highlightedEntityId.value) return 25
        if (d.type === 'memory_concept') return 12
        if (d.type === 'memory_tag') return 10
        return 15
      })
      hideTooltip()
    })

  // 添加节点标签
  const nodeLabel = g.append('g')
    .selectAll('text')
    .data(graphData.nodes)
    .enter().append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', '.35em')
    .attr('font-size', '12px')
    .attr('font-weight', 'bold')
    .attr('fill', '#fff')
    .text((d: any) => {
      const nodeName = d.name || d.label || '未知节点'
      return nodeName.length > 8 ? nodeName.substring(0, 8) + '...' : nodeName
    })

  // 添加工具提示
  const tooltip = d3.select('body').append('div')
    .attr('class', 'graph-tooltip')
    .style('position', 'absolute')
    .style('visibility', 'hidden')
    .style('background', 'rgba(0, 0, 0, 0.8)')
    .style('color', 'white')
    .style('padding', '8px')
    .style('border-radius', '4px')
    .style('font-size', '12px')
    .style('z-index', '1000')

  function showTooltip(event: any, d: any) {
    const nodeName = d.name || d.label || '未知节点'
    let tooltipContent = `<strong>${nodeName}</strong><br/>类型: ${d.type}`
    
    // 添加置信度信息（如果存在）
    if (d.confidence !== undefined) {
      tooltipContent += `<br/>置信度: ${(d.confidence * 100).toFixed(1)}%`
    }
    
    // 添加权重信息（如果存在）
    if (d.weight !== undefined) {
      tooltipContent += `<br/>权重: ${d.weight}`
    }
    
    // 添加描述信息（如果存在）
    if (d.description) {
      tooltipContent += `<br/>描述: ${d.description}`
    }
    
    tooltip.html(tooltipContent)
      .style('visibility', 'visible')
      .style('top', (event.pageY - 10) + 'px')
      .style('left', (event.pageX + 10) + 'px')
  }

  function hideTooltip() {
    tooltip.style('visibility', 'hidden')
  }

  // 更新位置
  simulation.on('tick', () => {
    link
      .attr('x1', (d: any) => d.source.x)
      .attr('y1', (d: any) => d.source.y)
      .attr('x2', (d: any) => d.target.x)
      .attr('y2', (d: any) => d.target.y)

    linkLabel
      .attr('x', (d: any) => (d.source.x + d.target.x) / 2)
      .attr('y', (d: any) => (d.source.y + d.target.y) / 2)

    node
      .attr('cx', (d: any) => d.x)
      .attr('cy', (d: any) => d.y)

    nodeLabel
      .attr('x', (d: any) => d.x)
      .attr('y', (d: any) => d.y)
  })
}

// 防抖函数
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: number | undefined;
  return function(this: any, ...args: Parameters<T>) {
    const context = this;
    clearTimeout(timeout);
    timeout = window.setTimeout(() => func.apply(context, args), wait);
  };
}

const debouncedRender = debounce(renderGraph, 300)

// 监听过滤后的图谱数据变化
watch(filteredGraph, (newGraphData) => {
  console.log('过滤后的图谱数据变化:', newGraphData)
  console.log('当前选中的项目:', selectedProject.value)
  console.log('projectStore.projects:', projectStore.projects)
  console.log('知识图谱数据:', knowledgeGraph.value)
  
  // 使用nextTick确保DOM已经更新
  nextTick(() => {
    // 添加延迟确保容器尺寸已计算
    setTimeout(() => {
      if (newGraphData && newGraphData.nodes && newGraphData.nodes.length > 0) {
        console.log('开始渲染图谱，节点数量:', newGraphData.nodes.length)
        renderGraph(newGraphData)
      } else {
        console.log('没有可渲染的图谱数据')
        console.log('newGraphData存在:', !!newGraphData)
        console.log('节点数量:', newGraphData?.nodes?.length || 0)
        // 清除图表容器
        if (graphContainer.value) {
          d3.select(graphContainer.value).selectAll('*').remove()
        }
      }
    }, 200)
  })
}, { immediate: true, deep: true })

// 监听标签页切换
watch(selectedTab, (newTab) => {
  if (newTab === 'graph') {
    // 当切换到图谱视图时，确保容器已正确渲染后再渲染图表
    nextTick(() => {
      // 增加延迟确保DOM完全渲染和容器尺寸已计算
      setTimeout(() => {
        // 检查容器是否存在
        if (graphContainer.value) {
          // 获取容器尺寸
          const rect = graphContainer.value.getBoundingClientRect()
          console.log('切换到图谱视图，容器尺寸:', rect.width, 'x', rect.height)
          
          // 如果容器尺寸为0，可能是因为元素尚未完全渲染
          if (rect.width > 0 && rect.height > 0) {
            if (filteredGraph.value && filteredGraph.value.nodes && filteredGraph.value.nodes.length > 0) {
              console.log('切换到图谱视图，重新渲染，节点数量:', filteredGraph.value.nodes.length)
              renderGraph(filteredGraph.value)
            }
          } else {
            // 如果容器尺寸为0，再次尝试
            setTimeout(() => {
              if (graphContainer.value && filteredGraph.value && filteredGraph.value.nodes && filteredGraph.value.nodes.length > 0) {
                const newRect = graphContainer.value.getBoundingClientRect()
                console.log('延迟重试，容器尺寸:', newRect.width, 'x', newRect.height)
                renderGraph(filteredGraph.value)
              }
            }, 300)
          }
        }
      }, 100)
    })
  }
})

// 组件挂载后初始化
onMounted(() => {
  console.log('知识图谱组件已挂载，数据已就绪')
  console.log('projectStore.projects:', projectStore.projects)
  console.log('selectedProject:', selectedProject.value)
  console.log('knowledgeGraphStore.graphs:', knowledgeGraphStore.graphs)
  
  // 确保组件挂载后能够正确渲染
  nextTick(() => {
    setTimeout(() => {
      if (filteredGraph.value && filteredGraph.value.nodes && filteredGraph.value.nodes.length > 0) {
        console.log('组件挂载后初始化渲染')
        renderGraph(filteredGraph.value)
      }
    }, 300)
  })
  
  // 监听窗口大小变化
  const handleResize = () => {
    if (selectedTab.value === 'graph' && graphContainer.value) {
      // 只有在当前标签页是图谱时才重新渲染
      debouncedRender(filteredGraph.value)
    }
  }
  
  window.addEventListener('resize', handleResize)
  
  // 保存处理函数引用，以便在卸载时移除
  ;(window as any).__knowledgeGraphResizeHandler = handleResize
})

// 组件卸载前清理
onUnmounted(() => {
  if (simulation) {
    simulation.stop()
  }
  
  // 移除窗口大小变化监听器
  if ((window as any).__knowledgeGraphResizeHandler) {
    window.removeEventListener('resize', (window as any).__knowledgeGraphResizeHandler)
    delete (window as any).__knowledgeGraphResizeHandler
  }
  
  // 清除工具提示
  d3.select('body').selectAll('.graph-tooltip').remove()
  
  // 清除SVG内容，防止内存泄漏
  if (graphContainer.value) {
    d3.select(graphContainer.value).selectAll('*').remove()
  }
  
  // 清除引用
  svg = null
  simulation = null
  zoomBehavior = null
})
</script>

<style scoped>
.graph-tooltip {
  pointer-events: none;
}

/* 确保图谱容器有正确的尺寸 */
.graph-container {
  width: 100%;
  height: 100%;
  min-height: 384px;
  position: relative;
}
</style>