<template>
  <div class="p-6 space-y-6">
    <!-- 页面标题和项目选择 -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">时序实体</h1>
        <p class="mt-2 text-gray-600">
          管理和追踪实体的时间演化过程
        </p>
      </div>
      <div class="flex items-center space-x-4">
        <select v-model="selectedProject" class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="all">所有项目</option>
          <option v-for="project in projects" :key="project.id" :value="project.name">
            {{ project.name }}
          </option>
        </select>
        <button 
          @click="refreshData" 
          class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center"
        >
          <RefreshCw class="h-4 w-4 mr-2" />
          刷新数据
        </button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center">
          <Activity class="h-8 w-8 text-blue-600" />
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">总实体数</p>
            <p class="text-2xl font-bold">{{ stats.totalEntities }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center">
          <TrendingUp class="h-8 w-8 text-green-600" />
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">活跃实体</p>
            <p class="text-2xl font-bold">{{ stats.activeEntities }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center">
          <Clock class="h-8 w-8 text-orange-600" />
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">近期更新</p>
            <p class="text-2xl font-bold">{{ stats.recentUpdates }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center">
          <BarChart3 class="h-8 w-8 text-purple-600" />
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">平均置信度</p>
            <p class="text-2xl font-bold">{{ stats.avgConfidence }}%</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="md:col-span-1">
          <div class="relative">
            <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              v-model="searchQuery"
              placeholder="搜索实体..."
              class="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <select v-model="selectedEntityType" class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="all">实体类型</option>
          <option v-for="type in entityTypes" :key="type" :value="type">
            {{ type }}
          </option>
        </select>
        
        <select v-model="selectedTimeRange" class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="all">时间范围</option>
          <option value="week">最近一周</option>
          <option value="month">最近一月</option>
          <option value="quarter">最近三月</option>
        </select>
        
        <button 
          class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center"
        >
          <Filter class="h-4 w-4 mr-2" />
          高级筛选
        </button>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- 实体列表 -->
      <div class="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 class="text-lg font-semibold mb-4 flex items-center">
          <Activity class="h-5 w-5 mr-2" />
          时序实体列表
        </h2>
        <div class="space-y-4">
          <div 
            v-for="entity in filteredEntitiesByTime" 
            :key="entity.id" 
            :class="[
              'border rounded-lg p-4 cursor-pointer transition-colors',
              selectedEntity?.id === entity.id 
                ? 'bg-blue-50 border-blue-200' 
                : 'hover:bg-gray-50'
            ]"
            @click="selectEntity(entity)"
          >
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <div class="flex items-center space-x-2">
                  <h3 class="font-semibold">{{ entity.properties.name || entity.entityId }}</h3>
                  <span class="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">{{ entity.entityType }}</span>
                  <span class="px-2 py-1 border border-gray-300 text-gray-600 rounded text-xs">{{ entity.project }}</span>
                  <span class="px-2 py-1 border border-gray-300 text-gray-600 rounded text-xs">
                    {{ (entity.metadata.confidence * 100).toFixed(1) }}%
                  </span>
                </div>
                <div class="mt-2 text-sm text-gray-500">
                  <div class="flex items-center space-x-4">
                    <span class="flex items-center">
                      <Calendar class="w-3 h-3 mr-1" />
                      创建: {{ formatDate(entity.temporalContext.createdAt) }}
                    </span>
                    <span class="flex items-center">
                      <Clock class="w-3 h-3 mr-1" />
                      更新: {{ formatDate(entity.temporalContext.lastUpdated) }}
                    </span>
                    <span>更新次数: {{ entity.metadata.updateCount }}</span>
                  </div>
                </div>
                <div class="mt-2">
                  <div class="flex items-center space-x-2 text-xs">
                    <span class="text-gray-500">有效期:</span>
                    <span>{{ formatDate(entity.temporalContext.validFrom) }}</span>
                    <span>-</span>
                    <span>{{ entity.temporalContext.validTo ? formatDate(entity.temporalContext.validTo) : '持续有效' }}</span>
                  </div>
                </div>
              </div>
              <button class="p-2 border border-gray-300 rounded-md hover:bg-gray-50">
                <Eye class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 实体详情和时间线 -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 class="text-lg font-semibold mb-4 flex items-center">
          <Clock class="h-5 w-5 mr-2" />
          {{ selectedEntity ? '实体时间线' : '选择实体查看详情' }}
        </h2>
        
        <div v-if="selectedEntity" class="space-y-4">
          <!-- 实体基本信息 -->
          <div class="border-b pb-4">
            <h3 class="font-semibold text-lg">{{ selectedEntity.properties.name || selectedEntity.entityId }}</h3>
            <div class="mt-2 space-y-1 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-500">类型:</span>
                <span>{{ selectedEntity.entityType }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">项目:</span>
                <span>{{ selectedEntity.project }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">置信度:</span>
                <span>{{ (selectedEntity.metadata.confidence * 100).toFixed(1) }}%</span>
              </div>
            </div>
          </div>
          
          <!-- 属性变化图表 -->
          <div class="border-b pb-4">
            <h4 class="font-medium mb-2 flex items-center">
              <BarChart3 class="h-4 w-4 mr-2" />
              属性变化趋势
            </h4>
            <div ref="attributeChartRef" class="w-full h-64 border rounded-lg p-2"></div>
          </div>

          <!-- 属性信息 -->
          <div class="border-b pb-4">
            <h4 class="font-medium mb-2">当前属性</h4>
            <div class="space-y-1 text-sm">
              <div v-for="(value, key) in selectedEntity.properties" :key="key" class="flex justify-between">
                <span class="text-gray-500">{{ key }}:</span>
                <span class="text-right">{{ String(value) }}</span>
              </div>
            </div>
          </div>

          <!-- 时间线事件 -->
          <div>
            <h4 class="font-medium mb-2">变更历史</h4>
            <div class="space-y-3">
              <div 
                v-for="(event, index) in selectedEntityTimeline" 
                :key="index" 
                class="border-l-2 border-blue-200 pl-4 pb-3"
              >
                <div class="flex items-center space-x-2">
                  <span class="px-2 py-1 border border-gray-300 rounded text-xs text-gray-600">
                    {{ event.eventType }}
                  </span>
                  <span class="text-xs text-gray-500">
                    {{ formatDate(event.timestamp) }}
                  </span>
                </div>
                <p class="text-sm mt-1">{{ event.description }}</p>
                <div v-if="event.changes" class="mt-2 text-xs text-gray-500">
                  <div 
                    v-for="(change, key) in event.changes" 
                    :key="key"
                  >
                    <span v-if="change.from !== undefined && change.to !== undefined">
                      {{ key }}: {{ String(change.from) }} → {{ String(change.to) }}
                    </span>
                    <span v-else>
                      {{ key }}: {{ String(change) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else class="text-center text-gray-500 py-8">
          <Activity class="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>点击左侧实体查看详细的时间演化信息</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Activity, Clock, Search, RefreshCw, Calendar, Filter, TrendingUp, Eye, BarChart3 } from 'lucide-vue-next'
import { useProjectStore } from '@/stores/project'
import * as echarts from 'echarts'


// 定义接口
interface TemporalEntity {
  id: string;
  entityId: string;
  entityType: string;
  project: string;
  properties: Record<string, any>;
  temporalContext: {
    createdAt: string;
    lastUpdated: string;
    validFrom: string;
    validTo?: string;
  };
  metadata: {
    source: string;
    confidence: number;
    updateCount: number;
    [key: string]: any;
  };
}

interface TimelineEvent {
  timestamp: string;
  eventType: string;
  description: string;
  changes: Record<string, any>;
  metadata: Record<string, any>;
}

interface Timeline {
  id: string;
  entityId: string;
  project: string;
  events: TimelineEvent[];
}

// 状态管理
const projectStore = useProjectStore()

// 模拟数据
const mockEntities: TemporalEntity[] = [
  {
    id: "1",
    entityId: "user_001",
    entityType: "user",
    project: "AI客服助手",
    properties: {
      name: "张三",
      role: "产品经理",
      department: "产品部",
      level: "senior"
    },
    temporalContext: {
      createdAt: "2024-01-01T00:00:00Z",
      lastUpdated: "2024-01-15T10:30:00Z",
      validFrom: "2024-01-01T00:00:00Z"
    },
    metadata: {
      source: "user_management",
      confidence: 0.95,
      updateCount: 5
    }
  },
  {
    id: "2",
    entityId: "project_ai_assistant",
    entityType: "project",
    project: "AI客服助手",
    properties: {
      name: "AI智能客服系统",
      status: "active",
      priority: "high",
      budget: 500000,
      team_size: 8
    },
    temporalContext: {
      createdAt: "2024-01-01T00:00:00Z",
      lastUpdated: "2024-01-16T14:20:00Z",
      validFrom: "2024-01-01T00:00:00Z"
    },
    metadata: {
      source: "project_management",
      confidence: 0.98,
      updateCount: 12
    }
  },
  {
    id: "3",
    entityId: "model_gpt4",
    entityType: "ai_model",
    project: "内容生成器",
    properties: {
      name: "GPT-4 Turbo",
      version: "gpt-4-1106-preview",
      provider: "OpenAI",
      max_tokens: 128000,
      cost_per_1k_tokens: 0.01
    },
    temporalContext: {
      createdAt: "2024-01-05T00:00:00Z",
      lastUpdated: "2024-01-14T09:15:00Z",
      validFrom: "2024-01-05T00:00:00Z"
    },
    metadata: {
      source: "model_registry",
      confidence: 0.92,
      updateCount: 3
    }
  },
  {
    id: "4",
    entityId: "dataset_customer_feedback",
    entityType: "dataset",
    project: "数据分析平台",
    properties: {
      name: "客户反馈数据集",
      size: "2.5GB",
      records: 150000,
      format: "JSON",
      last_updated: "2024-01-13T16:45:00Z"
    },
    temporalContext: {
      createdAt: "2023-12-01T00:00:00Z",
      lastUpdated: "2024-01-13T16:45:00Z",
      validFrom: "2023-12-01T00:00:00Z"
    },
    metadata: {
      source: "data_warehouse",
      confidence: 0.88,
      updateCount: 25
    }
  }
]

const mockTimelines: Timeline[] = [
  {
    id: "1",
    entityId: "user_001",
    project: "AI客服助手",
    events: [
      {
        timestamp: "2024-01-01T00:00:00Z",
        eventType: "created",
        description: "用户账户创建",
        changes: {
          name: "张三",
          role: "初级产品经理",
          department: "产品部"
        },
        metadata: { source: "user_registration" }
      },
      {
        timestamp: "2024-01-10T09:00:00Z",
        eventType: "role_updated",
        description: "职位晋升",
        changes: {
          role: { from: "初级产品经理", to: "产品经理" },
          level: { from: "junior", to: "senior" }
        },
        metadata: { source: "hr_system", approver: "李四" }
      },
      {
        timestamp: "2024-01-15T10:30:00Z",
        eventType: "project_assigned",
        description: "分配到AI客服项目",
        changes: {
          projects: { added: ["AI客服助手"] }
        },
        metadata: { source: "project_management" }
      }
    ]
  },
  {
    id: "2",
    entityId: "project_ai_assistant",
    project: "AI客服助手",
    events: [
      {
        timestamp: "2024-01-01T00:00:00Z",
        eventType: "created",
        description: "项目立项",
        changes: {
          name: "AI智能客服系统",
          status: "planning",
          budget: 500000
        },
        metadata: { source: "project_initiation" }
      },
      {
        timestamp: "2024-01-05T14:00:00Z",
        eventType: "status_updated",
        description: "项目状态更新",
        changes: {
          status: { from: "planning", to: "active" },
          team_size: { from: 5, to: 8 }
        },
        metadata: { source: "project_management" }
      },
      {
        timestamp: "2024-01-16T14:20:00Z",
        eventType: "milestone_reached",
        description: "完成第一阶段开发",
        changes: {
          progress: { from: 30, to: 60 },
          priority: { from: "medium", to: "high" }
        },
        metadata: { source: "milestone_tracking" }
      }
    ]
  }
]

// 路由和响应式数据
const route = useRoute()
const selectedProject = ref<string>('all')
const searchQuery = ref<string>('')
const selectedEntityType = ref<string>('all')
const selectedTimeRange = ref<string>('all')
const entities = ref<TemporalEntity[]>(mockEntities)
const timelines = ref<Timeline[]>(mockTimelines)
const selectedEntity = ref<TemporalEntity | null>(null)

// 从路由查询参数获取项目信息
onMounted(() => {
  if (route.query.project) {
    selectedProject.value = route.query.project as string
  }
  initChart()
  window.addEventListener('resize', handleResize)
})

// 图表相关
const attributeChartRef = ref<HTMLElement | null>(null)
let attributeChart: echarts.ECharts | null = null

// 计算属性
const projects = computed(() => projectStore.projects)

const filteredEntities = computed(() => {
  return entities.value.filter(entity => {
    const projectMatch = selectedProject.value === "all" || entity.project === selectedProject.value;
    const typeMatch = selectedEntityType.value === "all" || entity.entityType === selectedEntityType.value;
    const searchMatch = searchQuery.value === "" || 
      (entity.properties.name?.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
       entity.entityId.toLowerCase().includes(searchQuery.value.toLowerCase()));
    return projectMatch && typeMatch && searchMatch;
  });
});

const filteredTimelines = computed(() => {
  return timelines.value.filter(timeline => 
    selectedProject.value === "all" || timeline.project === selectedProject.value
  );
});

const selectedEntityTimeline = computed(() => {
  const currentEntity = selectedEntity.value;
  if (!currentEntity) return [];
  const timeline = filteredTimelines.value.find(t => t.entityId === currentEntity.entityId);
  return timeline?.events || [];
});

const timeRangeFilter = computed(() => {
  const now = new Date();
  switch (selectedTimeRange.value) {
    case "week":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "month":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case "quarter":
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    default:
      return null;
  }
});

const filteredEntitiesByTime = computed(() => {
  if (!timeRangeFilter.value) return filteredEntities.value;
  const filterTime = timeRangeFilter.value;
  return filteredEntities.value.filter(entity => 
    new Date(entity.temporalContext.lastUpdated) >= filterTime
  );
});

const stats = computed(() => {
  return {
    totalEntities: filteredEntities.value.length,
    activeEntities: filteredEntities.value.filter(e => !e.temporalContext.validTo).length,
    recentUpdates: filteredEntities.value.filter(e => {
      const lastUpdate = new Date(e.temporalContext.lastUpdated);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return lastUpdate >= weekAgo;
    }).length,
    avgConfidence: filteredEntities.value.length > 0 
      ? (filteredEntities.value.reduce((sum, e) => sum + (e.metadata.confidence || 0), 0) / filteredEntities.value.length * 100).toFixed(1)
      : "0"
  };
});

const entityTypes = computed(() => {
  return [...new Set(entities.value.map(e => e.entityType))];
});

// 图表相关方法
const initChart = () => {
  if (attributeChartRef.value) {
    attributeChart = echarts.init(attributeChartRef.value)
    updateChart()
  }
}

const updateChart = () => {
  if (!attributeChart || !selectedEntity.value) return
  
  const entity = selectedEntity.value
  const entityTimeline = timelines.value.find(t => t.entityId === entity.entityId)
  
  if (!entityTimeline || entityTimeline.events.length === 0) {
    // 没有时间线数据时显示空图表
    attributeChart.setOption({
      tooltip: {
        trigger: 'axis'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: [],
        axisLabel: {
          rotate: 45
        }
      },
      yAxis: {
        type: 'value'
      },
      series: []
    })
    return
  }
  
  // 准备图表数据
  const timestamps = entityTimeline.events.map(event => {
    return new Date(event.timestamp).toLocaleDateString()
  })
  
  // 收集所有数值属性变化
  const numericProperties = new Set<string>()
  entityTimeline.events.forEach(event => {
    Object.keys(event.changes).forEach(key => {
      const change = event.changes[key]
      // 只处理数值属性
      if (typeof change === 'number' || 
          (typeof change === 'object' && change !== null && 
           ('from' in change || 'to' in change) && 
           (typeof change.from === 'number' || typeof change.to === 'number'))) {
        numericProperties.add(key)
      }
    })
  })
  
  // 如果没有数值属性，显示提示
  if (numericProperties.size === 0) {
    attributeChart.setOption({
      tooltip: {
        trigger: 'axis'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: timestamps,
        axisLabel: {
          rotate: 45
        }
      },
      yAxis: {
        type: 'value'
      },
      series: [],
      title: {
        text: '无数值属性变化数据',
        left: 'center',
        top: 'middle'
      }
    })
    return
  }
  
  // 生成属性变化数据
  const series = Array.from(numericProperties).map(prop => {
    const data: number[] = []
    
    entityTimeline.events.forEach(event => {
      let value = 0
      const change = event.changes[prop]
      
      if (typeof change === 'object' && change !== null) {
        // 处理对象形式的变化
        if ('to' in change && typeof change.to === 'number') {
          value = change.to
        } else if ('from' in change && typeof change.from === 'number') {
          value = change.from
        }
      } else if (typeof change === 'number') {
        // 处理直接数值
        value = change
      }
      
      data.push(value)
    })
    
    return {
      name: prop,
      type: 'line',
      data: data,
      smooth: true,
      emphasis: {
        focus: 'series'
      },
      areaStyle: {
        opacity: 0.3
      }
    }
  })
  
  // 设置图表选项
  attributeChart.setOption({
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        let result = params[0].axisValue + '<br/>'
        params.forEach((param: any) => {
          result += `${param.marker}${param.seriesName}: ${param.value}<br/>`
        })
        return result
      }
    },
    legend: {
      data: Array.from(numericProperties),
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: timestamps,
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: {
      type: 'value'
    },
    series: series
  })
}

const handleResize = () => {
  attributeChart?.resize()
}

const cleanupChart = () => {
  attributeChart?.dispose()
  window.removeEventListener('resize', handleResize)
}

// 监听selectedEntity变化，更新图表
const selectedEntityWatcher = computed(() => selectedEntity.value)

// 使用watch监听selectedEntity变化，更新图表
const unwatchSelectedEntity = watch(selectedEntityWatcher, () => {
  // 确保图表已初始化
  if (!attributeChart) {
    initChart()
  } else {
    updateChart()
  }
})

// 生命周期钩子
onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  cleanupChart()
  unwatchSelectedEntity()
})

// 方法
const refreshData = () => {
  // 模拟数据刷新
  console.log('刷新数据');
  updateChart()
};

const selectEntity = (entity: TemporalEntity) => {
  selectedEntity.value = entity;
  updateChart()
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString();
};
</script>