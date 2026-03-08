<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          任务监控
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          查看与监控当前项目的任务执行情况
        </p>
      </div>
      <div class="flex items-center space-x-2">
        <div class="flex items-center">
          <input
            type="checkbox"
            id="real-time-monitoring"
            v-model="isRealTimeMonitoringEnabled"
            class="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label for="real-time-monitoring" class="text-sm font-medium text-gray-700 dark:text-gray-300">
            实时监控
          </label>
        </div>
        <button
          @click="refreshTasks"
          class="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-150 text-sm flex items-center"
        >
          <RefreshCw class="w-3 h-3 mr-1" />
          刷新
        </button>
      </div>
    </div>

    <!-- 项目上下文 -->
    <div v-if="selectedProject" class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span class="text-white font-medium text-sm">{{ selectedProject.name.charAt(0) }}</span>
          </div>
        </div>
        <div class="ml-4">
          <h3 class="text-sm font-medium text-gray-900 dark:text-white">{{ selectedProject.name }}</h3>
          <p class="text-xs text-gray-500 dark:text-gray-400">{{ selectedProject.description }}</p>
          <div class="mt-1 flex items-center text-xs text-gray-500 dark:text-gray-400 space-x-4">
            <div class="flex items-center">
              <span :class="['ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', getStatusColor(selectedProject.status)]">
                {{ getStatusText(selectedProject.status) }}
              </span>
            </div>
            <div class="flex items-center">
              <Activity class="w-3 h-3 mr-1" />
              最后活动 {{ selectedProject.lastActivity }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 无项目提示 -->
    <div v-else class="bg-white dark:bg-gray-800 shadow rounded-lg p-6 text-center">
      <div class="mx-auto h-12 w-12 text-gray-400">
        <Folder class="h-12 w-12" />
      </div>
      <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">未选中项目</h3>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">请先在项目管理页面选择一个项目</p>
    </div>

    <!-- 项目任务列表 -->
    <div v-if="selectedProject" class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white">
          项目任务列表
        </h3>
        <div class="flex items-center space-x-2">
          <span class="text-sm text-gray-500 dark:text-gray-400">任务总数:</span>
          <span class="text-sm font-medium text-gray-900 dark:text-white">{{ filteredProjectTasks.length }}</span>
        </div>
      </div>
      
      <!-- 筛选功能 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            项目筛选
          </label>
          <select
            v-model="selectedProjectFilter"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
          >
            <option value="all">所有项目</option>
            <option v-for="project in projects" :key="project.id" :value="project.id">
              {{ project.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            会话ID
          </label>
          <input
            v-model="sessionFilter"
            type="text"
            placeholder="搜索会话ID..."
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
          />
        </div>
      </div>
      
      <!-- 任务状态统计 -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
          <div class="flex items-center space-x-2">
            <div class="w-3 h-3 rounded-full bg-blue-500"></div>
            <span class="text-sm font-medium text-blue-800 dark:text-blue-300">待处理</span>
          </div>
          <p class="mt-1 text-lg font-bold text-gray-900 dark:text-white">{{ pendingTasksCount }}</p>
        </div>
        <div class="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
          <div class="flex items-center space-x-2">
            <div class="w-3 h-3 rounded-full bg-purple-500"></div>
            <span class="text-sm font-medium text-purple-800 dark:text-purple-300">进行中</span>
          </div>
          <p class="mt-1 text-lg font-bold text-gray-900 dark:text-white">{{ inProgressTasksCount }}</p>
        </div>
        <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
          <div class="flex items-center space-x-2">
            <div class="w-3 h-3 rounded-full bg-green-500"></div>
            <span class="text-sm font-medium text-green-800 dark:text-green-300">已完成</span>
          </div>
          <p class="mt-1 text-lg font-bold text-gray-900 dark:text-white">{{ completedTasksCount }}</p>
        </div>
        <div class="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
          <div class="flex items-center space-x-2">
            <div class="w-3 h-3 rounded-full bg-red-500"></div>
            <span class="text-sm font-medium text-red-800 dark:text-red-300">已失败</span>
          </div>
          <p class="mt-1 text-lg font-bold text-gray-900 dark:text-white">{{ failedTasksCount }}</p>
        </div>
      </div>
      
      <!-- 任务列表 -->
      <div class="space-y-3">
        <div 
          v-for="task in filteredProjectTasks" 
          :key="task.id"
          class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750"
        >
          <div class="flex items-start justify-between">
            <div class="flex items-start space-x-3">
              <div class="flex-shrink-0 mt-1">
                <div :class="[
                  'w-3 h-3 rounded-full',
                  task.status === 'pending' ? 'bg-blue-500' :
                  task.status === 'in_progress' ? 'bg-purple-500' :
                  task.status === 'completed' ? 'bg-green-500' : 'bg-red-500'
                ]" />
              </div>
              <div class="flex-1">
                <div class="flex items-center justify-between">
                  <h5 class="text-sm font-medium text-gray-900 dark:text-white">{{ task.name }}</h5>
                  <div class="flex items-center space-x-2">
                    <Badge :class="taskPriorityClass(task.priority)">
                      {{ task.priority }}
                    </Badge>
                  </div>
                </div>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ task.description }}</p>
                <div class="mt-2 flex items-center flex-wrap gap-2">
                  <Badge variant="outline" class="text-xs">
                    <Clock class="w-3 h-3 mr-1" /> {{ task.estimatedTime }}s
                  </Badge>
                  <Badge variant="outline" class="text-xs">
                    <Wrench class="w-3 h-3 mr-1" /> {{ task.toolName }}
                  </Badge>
                  <RouterLink :to="`/session-detail/${task.sessionId}`" class="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-2 py-1 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors duration-150">
                    <span class="mr-1">Session:</span>{{ task.sessionId }}
                  </RouterLink>
                  <span class="text-xs text-gray-500 dark:text-gray-400">
                    {{ task.startTime || '-' }}
                  </span>
                </div>
                <!-- 任务上下文 -->
                <div v-if="task.context" class="mt-2 text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-750 p-2 rounded">
                  <span class="font-medium">上下文:</span> {{ task.context }}
                </div>
              </div>
            </div>
          </div>
          
          <!-- 任务进度 -->
          <div v-if="task.status === 'in_progress'" class="mt-3">
            <div class="flex items-center justify-between text-xs mb-1">
              <span class="text-gray-500 dark:text-gray-400">执行进度</span>
              <span class="text-gray-900 dark:text-white">{{ task.progress }}%</span>
            </div>
            <Progress :value="task.progress" class="h-1.5" />
          </div>
          
          <!-- 任务结果 -->
          <div v-if="task.status === 'completed' || task.status === 'failed'" class="mt-3">
            <div class="text-xs text-gray-500 dark:text-gray-400">
              {{ task.status === 'completed' ? '执行成功' : '执行失败' }} · {{ task.endTime }}
            </div>
            <div v-if="task.result" class="mt-1 text-xs text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-750 p-2 rounded">
              {{ task.result }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- 无任务提示 -->
      <div v-if="filteredProjectTasks.length === 0" class="text-center py-8">
        <div class="mx-auto h-12 w-12 text-gray-400">
          <ListTodo class="h-12 w-12" />
        </div>
        <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">暂无任务</h3>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">该项目还没有创建任何任务</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useProjectStore } from '@/stores/project'
import { RouterLink } from 'vue-router'
import {
  Activity,
  Clock,
  Folder,
  ListTodo,
  RefreshCw,
  Wrench
} from 'lucide-vue-next'
import Badge from '@/components/ui/Badge.vue'
import Progress from '@/components/ui/Progress.vue'

// 使用项目store
const projectStore = useProjectStore()
const { projects, selectedProjectId, selectedProject } = storeToRefs(projectStore)

// 筛选变量
const selectedProjectFilter = ref('all')
const sessionFilter = ref('')

// 实时监控相关
const isRealTimeMonitoringEnabled = ref(true)
const monitoringInterval = ref<number | null>(null)
const lastUpdateTime = ref(new Date().toLocaleTimeString())

// 项目任务数据结构
interface ProjectTask {
  id: number
  name: string
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  priority: number
  estimatedTime: number
  progress: number
  toolName: string
  startTime?: string
  endTime?: string
  result?: string
  projectId: string
  sessionId: string
  context?: string
}

// 模拟项目任务数据
const projectTasks = ref<ProjectTask[]>([
  {
    id: 1,
    name: '获取销售数据',
    description: '从数据库获取过去一个月的销售数据',
    status: 'completed',
    priority: 1,
    estimatedTime: 5,
    progress: 100,
    toolName: '数据库查询工具',
    startTime: '14:30:00',
    endTime: '14:30:06',
    result: '成功获取10,245条销售记录',
    projectId: '1',
    sessionId: 'session-20240115-001',
    context: '销售数据分析任务'
  },
  {
    id: 2,
    name: '数据清洗',
    description: '清洗和预处理销售数据',
    status: 'completed',
    priority: 2,
    estimatedTime: 8,
    progress: 100,
    toolName: '数据清洗工具',
    startTime: '14:30:07',
    endTime: '14:30:15',
    result: '成功清洗98%的数据，移除了156条无效记录',
    projectId: '1',
    sessionId: 'session-20240115-001',
    context: '销售数据分析任务'
  },
  {
    id: 3,
    name: '生成可视化报告',
    description: '基于清洗后的数据生成可视化报告',
    status: 'completed',
    priority: 3,
    estimatedTime: 12,
    progress: 100,
    toolName: '报告生成工具',
    startTime: '14:30:16',
    endTime: '14:30:28',
    result: '成功生成包含7个图表的销售分析报告',
    projectId: '1',
    sessionId: 'session-20240115-001',
    context: '销售数据分析任务'
  },
  {
    id: 4,
    name: '发送报告',
    description: '将生成的报告发送给销售团队',
    status: 'completed',
    priority: 4,
    estimatedTime: 3,
    progress: 100,
    toolName: '邮件发送工具',
    startTime: '14:30:29',
    endTime: '14:30:32',
    result: '报告已成功发送给销售团队的15位成员',
    projectId: '1',
    sessionId: 'session-20240115-001',
    context: '销售数据分析任务'
  },
  {
    id: 5,
    name: '内容生成',
    description: '为新产品生成营销文案',
    status: 'in_progress',
    priority: 1,
    estimatedTime: 15,
    progress: 65,
    toolName: '文本生成工具',
    startTime: '14:45:00',
    projectId: '2',
    sessionId: 'session-20240115-002',
    context: '新产品营销任务'
  },
  {
    id: 6,
    name: '数据分析',
    description: '分析用户行为数据',
    status: 'pending',
    priority: 2,
    estimatedTime: 10,
    progress: 0,
    toolName: '数据分析工具',
    projectId: '2',
    sessionId: 'session-20240115-002',
    context: '新产品营销任务'
  },
  {
    id: 7,
    name: '模型训练',
    description: '训练新的机器学习模型',
    status: 'failed',
    priority: 1,
    estimatedTime: 60,
    progress: 45,
    toolName: '模型训练工具',
    startTime: '13:20:00',
    endTime: '13:47:30',
    result: '训练失败：内存不足',
    projectId: '3',
    sessionId: 'session-20240115-003',
    context: '机器学习模型训练任务'
  },
  {
    id: 8,
    name: '用户反馈分析',
    description: '分析用户反馈数据',
    status: 'completed',
    priority: 2,
    estimatedTime: 12,
    progress: 100,
    toolName: '文本分析工具',
    startTime: '10:15:00',
    endTime: '10:27:00',
    result: '成功分析1,234条用户反馈，提取关键主题5个',
    projectId: '1',
    sessionId: 'session-20240114-001',
    context: '用户反馈分析任务'
  }
])

// 过滤出当前选中项目的任务
const filteredProjectTasks = computed(() => {
  let filtered = projectTasks.value
  
  // 项目筛选
  if (selectedProjectFilter.value !== 'all') {
    filtered = filtered.filter(task => task.projectId === selectedProjectFilter.value)
  } else if (selectedProjectId.value) {
    // 默认显示当前选中项目的任务
    filtered = filtered.filter(task => task.projectId === selectedProjectId.value)
  }
  
  // 会话ID筛选
  if (sessionFilter.value) {
    filtered = filtered.filter(task => task.sessionId.includes(sessionFilter.value))
  }
  
  return filtered
})

// 待处理任务数量
const pendingTasksCount = computed(() => {
  return filteredProjectTasks.value.filter(task => task.status === 'pending').length
})

// 进行中任务数量
const inProgressTasksCount = computed(() => {
  return filteredProjectTasks.value.filter(task => task.status === 'in_progress').length
})

// 已完成任务数量
const completedTasksCount = computed(() => {
  return filteredProjectTasks.value.filter(task => task.status === 'completed').length
})

// 已失败任务数量
const failedTasksCount = computed(() => {
  return filteredProjectTasks.value.filter(task => task.status === 'failed').length
})

// 任务优先级样式
const taskPriorityClass = (priority: number) => {
  if (priority === 1) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
  if (priority === 2) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
  if (priority === 3) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
  return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
}

// 获取项目状态颜色
const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    case "inactive":
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
    case "maintenance":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
  }
}

// 刷新任务
const refreshTasks = () => {
  updateTaskStatuses()
  lastUpdateTime.value = new Date().toLocaleTimeString()
}

// 模拟实时更新任务状态和进度
const updateTaskStatuses = () => {
  projectTasks.value.forEach(task => {
    // 处理进行中的任务，更新进度
    if (task.status === 'in_progress') {
      // 随机增加进度（1-5%）
      const progressIncrease = Math.floor(Math.random() * 5) + 1
      task.progress = Math.min(100, task.progress + progressIncrease)
      
      // 如果进度达到100%，标记为完成
      if (task.progress >= 100) {
        task.status = 'completed'
        task.endTime = new Date().toLocaleTimeString()
        task.result = `任务已完成，耗时 ${Math.floor(Math.random() * 10) + 5} 秒`
      }
    }
    // 处理待处理的任务，随机开始执行
    else if (task.status === 'pending') {
      // 10%的概率开始执行
      if (Math.random() < 0.1) {
        task.status = 'in_progress'
        task.startTime = new Date().toLocaleTimeString()
      }
    }
  })
}

// 启动监控定时器
const startMonitoring = () => {
  if (monitoringInterval.value) return
  
  // 每秒更新一次任务状态
  monitoringInterval.value = window.setInterval(() => {
    updateTaskStatuses()
    lastUpdateTime.value = new Date().toLocaleTimeString()
  }, 1000) as unknown as number
}

// 停止监控定时器
const stopMonitoring = () => {
  if (monitoringInterval.value) {
    clearInterval(monitoringInterval.value)
    monitoringInterval.value = null
  }
}

// 监听实时监控开关变化
isRealTimeMonitoringEnabled.value && startMonitoring()

// 生命周期钩子
onMounted(() => {
  if (isRealTimeMonitoringEnabled.value) {
    startMonitoring()
  }
})

onUnmounted(() => {
  stopMonitoring()
})

// 监听实时监控开关变化
const handleRealTimeToggle = () => {
  if (isRealTimeMonitoringEnabled.value) {
    startMonitoring()
  } else {
    stopMonitoring()
  }
}

// 监听开关变化
const unwatch = watch(isRealTimeMonitoringEnabled, handleRealTimeToggle)

// 组件卸载时取消监听
onUnmounted(() => {
  unwatch()
})

// 获取项目状态文本
const getStatusText = (status: string) => {
  switch (status) {
    case "active":
      return "运行中"
    case "inactive":
      return "已停用"
    case "maintenance":
      return "维护中"
    default:
      return "未知"
  }
}
</script>
