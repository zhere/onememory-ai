<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          会话详情
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          查看会话的完整执行流程和详细信息
        </p>
      </div>
      <div class="flex items-center space-x-2">
        <button
          @click="$router.back()"
          class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-150"
        >
          返回列表
        </button>
        <button
          @click="replaySession"
          class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-150"
        >
          <Play class="inline-block mr-2 w-4 h-4" /> 回放会话
        </button>
      </div>
    </div>

    <!-- 会话基本信息 -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div>
          <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">会话ID</h3>
          <p class="text-sm font-medium text-gray-900 dark:text-white">{{ session.id }}</p>
        </div>
        <div>
          <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Agent ID</h3>
          <p class="text-sm font-medium text-gray-900 dark:text-white">{{ session.agentId }}</p>
        </div>
        <div>
          <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">项目名称</h3>
          <p class="text-sm font-medium text-gray-900 dark:text-white">{{ session.projectName }}</p>
        </div>
        <div>
          <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">状态</h3>
          <Badge :class="sessionStatusClass">
            {{ session.status }}
          </Badge>
        </div>
        <div>
          <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">开始时间</h3>
          <p class="text-sm text-gray-900 dark:text-white">{{ session.startTime }}</p>
        </div>
        <div>
          <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">结束时间</h3>
          <p class="text-sm text-gray-900 dark:text-white">{{ session.endTime || '-' }}</p>
        </div>
        <div>
          <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">执行时长</h3>
          <p class="text-sm text-gray-900 dark:text-white">{{ session.duration || '-' }}</p>
        </div>
        <div>
          <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">任务数量</h3>
          <p class="text-sm font-medium text-gray-900 dark:text-white">{{ session.tasks.length }}</p>
        </div>
      </div>
    </div>

    <!-- 会话上下文 -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">会话上下文</h3>
      <div class="bg-gray-50 dark:bg-gray-750 p-4 rounded-lg">
        <p class="text-sm text-gray-900 dark:text-white whitespace-pre-line">{{ session.context }}</p>
      </div>
    </div>

    <!-- 会话任务流程 -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white">会话任务流程</h3>
        <div class="flex items-center space-x-2">
          <span class="text-sm text-gray-500 dark:text-gray-400">任务总数:</span>
          <span class="text-sm font-medium text-gray-900 dark:text-white">{{ session.tasks.length }}</span>
        </div>
      </div>

      <!-- 任务流程时间线 -->
      <div class="relative">
        <!-- 时间线轴线 -->
        <div class="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>

        <!-- 任务列表 -->
        <div class="space-y-6">
          <div 
            v-for="(task, index) in session.tasks" 
            :key="task.id"
            class="relative pl-12"
          >
            <!-- 时间线节点 -->
            <div :class="[
              'absolute left-0 top-1.5 w-6 h-6 rounded-full flex items-center justify-center z-10',
              task.status === 'completed' ? 'bg-green-500' :
              task.status === 'in_progress' ? 'bg-blue-500' :
              task.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
            ]">
              <div class="w-2 h-2 rounded-full bg-white"></div>
            </div>

            <!-- 任务卡片 -->
            <div :class="[
              'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm',
              task.status === 'completed' ? 'border-l-4 border-green-500' :
              task.status === 'in_progress' ? 'border-l-4 border-blue-500' :
              task.status === 'failed' ? 'border-l-4 border-red-500' : 'border-l-4 border-yellow-500'
            ]">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <h4 class="text-sm font-medium text-gray-900 dark:text-white">{{ task.name }}</h4>
                  <Badge :class="taskPriorityClass(task.priority)">
                    {{ task.priority }}
                  </Badge>
                </div>
                <div class="flex items-center space-x-2">
                  <Badge variant="outline" class="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                    {{ task.agentId }}
                  </Badge>
                  <Badge :class="taskStatusClass(task.status)">
                    {{ task.statusText }}
                  </Badge>
                </div>
              </div>

              <div class="mt-2 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div>
                  <span class="text-gray-500 dark:text-gray-400">开始时间:</span> {{ task.startTime || '-' }}
                </div>
                <div>
                  <span class="text-gray-500 dark:text-gray-400">结束时间:</span> {{ task.endTime || '-' }}
                </div>
                <div>
                  <span class="text-gray-500 dark:text-gray-400">执行时长:</span> {{ task.duration || '-' }}
                </div>
              </div>

              <div class="mt-2">
                <span class="text-gray-500 dark:text-gray-400 text-sm">工具:</span> 
                <span class="text-sm font-medium text-gray-900 dark:text-white">{{ task.toolName }}</span>
              </div>

              <div v-if="task.description" class="mt-2">
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ task.description }}</p>
              </div>

              <!-- 任务进度 -->
              <div v-if="task.status === 'in_progress'" class="mt-3">
                <div class="flex items-center justify-between text-xs mb-1">
                  <span class="text-gray-500 dark:text-gray-400">执行进度</span>
                  <span class="text-gray-900 dark:text-white">{{ task.progress }}%</span>
                </div>
                <Progress :value="task.progress" class="h-2" />
              </div>

              <!-- 任务结果 -->
              <div v-if="task.result" class="mt-3">
                <details class="text-sm">
                  <summary class="text-blue-600 dark:text-blue-400 cursor-pointer">查看结果</summary>
                  <div class="mt-1 p-2 bg-gray-50 dark:bg-gray-750 rounded text-gray-900 dark:text-white overflow-x-auto">
                    {{ task.result }}
                  </div>
                </details>
              </div>

              <!-- 任务错误 -->
              <div v-if="task.error" class="mt-3 p-2 bg-red-50 dark:bg-red-900/20 rounded border-l-4 border-red-500">
                <p class="text-sm text-red-600 dark:text-red-400">{{ task.error }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 工具调用日志 -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white">工具调用日志</h3>
        <div class="flex items-center space-x-2">
          <span class="text-sm text-gray-500 dark:text-gray-400">调用次数:</span>
          <span class="text-sm font-medium text-gray-900 dark:text-white">{{ session.toolCalls.length }}</span>
        </div>
      </div>

      <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-3 max-h-60 overflow-y-auto">
        <div v-for="call in session.toolCalls" :key="call.id" class="mb-3 pb-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
          <div class="flex items-start space-x-3">
            <div class="flex-shrink-0 mt-1">
              <div :class="[
                'w-3 h-3 rounded-full',
                call.status === 'completed' ? 'bg-green-500' :
                call.status === 'in_progress' ? 'bg-blue-500' : 'bg-red-500'
              ]" />
            </div>
            <div class="flex-1">
              <div class="flex flex-wrap items-center gap-2">
                <span class="text-sm font-medium text-gray-900 dark:text-white">{{ call.toolName }}</span>
                <span class="text-xs text-gray-500 dark:text-gray-400">{{ call.timestamp }}</span>
                <Badge :class="call.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                         call.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                         'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'">
                  {{ call.status === 'completed' ? '完成' : call.status === 'in_progress' ? '进行中' : '失败' }}
                </Badge>
              </div>
              <div class="mt-1 flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
                <div>
                  <Clock class="inline-block w-3 h-3 mr-1" /> {{ call.executionTime }}ms
                </div>
                <div>
                  <span class="text-gray-500 dark:text-gray-400">任务ID:</span> {{ call.taskId }}
                </div>
              </div>
              <div v-if="call.context" class="mt-1 text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-750 p-1.5 rounded">
                <span class="font-medium">上下文:</span> {{ call.context }}
              </div>
              <div v-if="call.inputParams" class="mt-1">
                <details class="text-xs">
                  <summary class="text-blue-600 dark:text-blue-400 cursor-pointer">输入参数</summary>
                  <div class="mt-1 p-2 bg-gray-50 dark:bg-gray-750 rounded text-gray-900 dark:text-white overflow-x-auto">
                    {{ call.inputParams }}
                  </div>
                </details>
              </div>
              <div v-if="call.outputResult" class="mt-1">
                <details class="text-xs">
                  <summary class="text-blue-600 dark:text-blue-400 cursor-pointer">输出结果</summary>
                  <div class="mt-1 p-2 bg-gray-50 dark:bg-gray-750 rounded text-gray-900 dark:text-white overflow-x-auto">
                    {{ call.outputResult }}
                  </div>
                </details>
              </div>
              <div v-if="call.error" class="mt-1 text-xs text-red-500 dark:text-red-400">
                <span class="font-medium">错误:</span> {{ call.error }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 回放控制 -->
    <div v-if="isReplaying" class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white">会话回放</h3>
        <div class="flex items-center space-x-2">
          <button
            @click="toggleReplay"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-150"
          >
            <span v-if="isPlaying"><Pause class="inline-block mr-2 w-4 h-4" /> 暂停</span>
            <span v-else><Play class="inline-block mr-2 w-4 h-4" /> 播放</span>
          </button>
          <button
            @click="resetReplay"
            class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-150"
          >
            <RefreshCw class="inline-block mr-2 w-4 h-4" /> 重置
          </button>
        </div>
      </div>

      <div class="bg-gray-50 dark:bg-gray-750 rounded-lg p-4">
        <div class="mb-4">
          <div class="flex items-center justify-between mb-1">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">回放进度</span>
            <span class="text-sm text-gray-500 dark:text-gray-400">{{ replayProgress }}%</span>
          </div>
          <Progress :value="replayProgress" class="h-2" />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">当前任务</h4>
            <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
              <p v-if="currentReplayTask" class="text-sm text-gray-900 dark:text-white">{{ currentReplayTask.name }}</p>
              <p v-else class="text-sm text-gray-500 dark:text-gray-400">等待开始</p>
            </div>
          </div>
          <div>
            <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">执行状态</h4>
            <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
              <Badge :class="currentReplayStatusClass">
                {{ currentReplayStatus }}
              </Badge>
            </div>
          </div>
          <div>
            <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">执行时间</h4>
            <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
              <p class="text-sm text-gray-900 dark:text-white">{{ currentReplayTime }}s / {{ totalReplayTime }}s</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { 
  Play, 
  RefreshCw, 
  Pause 
} from 'lucide-vue-next'
import Badge from '@/components/ui/Badge.vue'
import Progress from '@/components/ui/Progress.vue'

// 定义会话数据结构
interface SessionTask {
  id: number
  name: string
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  statusText: string
  priority: number
  toolName: string
  startTime?: string
  endTime?: string
  duration?: string
  progress: number
  result?: string
  error?: string
  agentId: string
}

interface SessionToolCall {
  id: number
  toolName: string
  status: 'completed' | 'failed' | 'in_progress'
  executionTime: number
  timestamp: string
  taskId: number
  context?: string
  inputParams?: string
  outputResult?: string
  error?: string
}

interface Session {
  id: string
  name: string
  agentId: string
  projectId: string
  projectName: string
  status: string
  startTime: string
  endTime?: string
  duration?: string
  context: string
  tasks: SessionTask[]
  toolCalls: SessionToolCall[]
}

// 获取路由参数
const route = useRoute()
const sessionId = computed(() => route.params.id as string)

// 会话数据
const session = ref<Session>({
  id: sessionId.value,
  name: `会话 ${sessionId.value}`,
  agentId: 'agent-sales-001',
  projectId: '1',
  projectName: 'AI客服助手',
  status: '已完成',
  startTime: '2024-01-15 14:30:00',
  endTime: '2024-01-15 14:30:32',
  duration: '32秒',
  context: '销售数据分析任务：分析过去一个月的销售数据，生成可视化报告并发送给销售团队',
  tasks: [
    {
      id: 1,
      name: '获取销售数据',
      description: '从数据库获取过去一个月的销售数据',
      status: 'completed',
      statusText: '已完成',
      priority: 1,
      toolName: '数据库查询工具',
      startTime: '14:30:00',
      endTime: '14:30:06',
      duration: '6秒',
      progress: 100,
      result: '成功获取10,245条销售记录',
      agentId: 'agent-sales-001'
    },
    {
      id: 2,
      name: '数据清洗',
      description: '清洗和预处理销售数据',
      status: 'completed',
      statusText: '已完成',
      priority: 2,
      toolName: '数据清洗工具',
      startTime: '14:30:07',
      endTime: '14:30:15',
      duration: '8秒',
      progress: 100,
      result: '成功清洗98%的数据，移除了156条无效记录',
      agentId: 'agent-sales-001'
    },
    {
      id: 3,
      name: '生成可视化报告',
      description: '基于清洗后的数据生成可视化报告',
      status: 'completed',
      statusText: '已完成',
      priority: 3,
      toolName: '报告生成工具',
      startTime: '14:30:16',
      endTime: '14:30:28',
      duration: '12秒',
      progress: 100,
      result: '成功生成包含7个图表的销售分析报告',
      agentId: 'agent-sales-001'
    },
    {
      id: 4,
      name: '发送报告',
      description: '将生成的报告发送给销售团队',
      status: 'completed',
      statusText: '已完成',
      priority: 4,
      toolName: '邮件发送工具',
      startTime: '14:30:29',
      endTime: '14:30:32',
      duration: '3秒',
      progress: 100,
      result: '报告已成功发送给销售团队的15位成员',
      agentId: 'agent-sales-001'
    }
  ],
  toolCalls: [
    {
      id: 1,
      toolName: '数据库查询工具',
      status: 'completed',
      executionTime: 125,
      timestamp: '14:30:00',
      taskId: 1,
      context: '销售数据分析任务',
      inputParams: '{"query": "SELECT * FROM sales WHERE date >= DATE_SUB(NOW(), INTERVAL 1 MONTH)"}',
      outputResult: '{"count": 10245, "data": [...]}'
    },
    {
      id: 2,
      toolName: '数据清洗工具',
      status: 'completed',
      executionTime: 250,
      timestamp: '14:30:07',
      taskId: 2,
      context: '销售数据分析任务',
      inputParams: '{"data": [...]}',
      outputResult: '{"cleanedCount": 10089, "removedCount": 156}'
    },
    {
      id: 3,
      toolName: '报告生成工具',
      status: 'completed',
      executionTime: 500,
      timestamp: '14:30:15',
      taskId: 3,
      context: '销售数据分析任务',
      inputParams: '{"cleanedData": [...]}',
      outputResult: '{"reportId": "report-20240115-001", "charts": 7}'
    },
    {
      id: 4,
      toolName: '邮件发送工具',
      status: 'completed',
      executionTime: 85,
      timestamp: '14:30:28',
      taskId: 4,
      context: '销售数据分析任务',
      inputParams: '{"reportId": "report-20240115-001", "recipients": [...]}',
      outputResult: '{"sent": 15, "failed": 0}'
    }
  ]
})

// 会话状态样式
const sessionStatusClass = computed(() => {
  const status = session.value.status
  if (status === '已完成') return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
  if (status === '进行中') return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
  if (status === '已失败') return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
  return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
})

// 任务优先级样式
const taskPriorityClass = (priority: number) => {
  if (priority === 1) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
  if (priority === 2) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
  if (priority === 3) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
  return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
}

// 任务状态样式
const taskStatusClass = (status: string) => {
  if (status === 'completed') return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
  if (status === 'in_progress') return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
  if (status === 'failed') return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
  return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
}

// 会话回放相关
const isReplaying = ref(false)
const isPlaying = ref(false)
const replayProgress = ref(0)
const totalReplayTime = ref(32)
const currentReplayTime = ref(0)
const currentReplayStatus = ref('等待开始')
const currentReplayTask = ref<SessionTask | null>(null)
const replayInterval = ref<number | null>(null)

// 当前回放状态样式
const currentReplayStatusClass = computed(() => {
  const status = currentReplayStatus.value
  if (status === '执行中') return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
  if (status === '已完成') return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
  if (status === '已失败') return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
  return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
})

// 开始回放会话
const replaySession = () => {
  isReplaying.value = true
  isPlaying.value = true
  startReplay()
}

// 开始回放
const startReplay = () => {
  if (replayInterval.value) return
  
  let currentTaskIndex = 0
  let currentTime = 0
  
  currentReplayStatus.value = '执行中'
  
  replayInterval.value = window.setInterval(() => {
    currentTime++
    currentReplayTime.value = currentTime
    replayProgress.value = Math.round((currentTime / totalReplayTime.value) * 100)
    
    // 更新当前任务
    if (currentTaskIndex < session.value.tasks.length) {
      const task = session.value.tasks[currentTaskIndex]
      const taskDuration = parseInt(task.duration || '0')
      const taskStartTime = parseInt(task.startTime?.split(':')[2] || '0')
      
      if (currentTime >= taskStartTime) {
        currentReplayTask.value = task
        
        // 模拟任务执行
        if (currentTime === taskStartTime) {
          task.status = 'in_progress'
          task.statusText = '进行中'
        } else if (currentTime >= taskStartTime + taskDuration) {
          task.status = 'completed'
          task.statusText = '已完成'
          currentTaskIndex++
        }
      }
    }
    
    // 回放结束
    if (currentTime >= totalReplayTime.value) {
      stopReplay()
      currentReplayStatus.value = '已完成'
      currentReplayTask.value = null
    }
  }, 1000)
}

// 停止回放
const stopReplay = () => {
  if (replayInterval.value) {
    clearInterval(replayInterval.value)
    replayInterval.value = null
  }
}

// 切换回放状态
const toggleReplay = () => {
  if (isPlaying.value) {
    stopReplay()
    currentReplayStatus.value = '暂停'
  } else {
    startReplay()
    currentReplayStatus.value = '执行中'
  }
  isPlaying.value = !isPlaying.value
}

// 重置回放
const resetReplay = () => {
  stopReplay()
  isPlaying.value = false
  replayProgress.value = 0
  currentReplayTime.value = 0
  currentReplayStatus.value = '等待开始'
  currentReplayTask.value = null
  
  // 重置任务状态
  session.value.tasks.forEach(task => {
    task.status = 'pending'
    task.statusText = '待处理'
  })
}

// 组件挂载时获取会话数据
onMounted(() => {
  // 这里可以添加从API获取会话数据的逻辑
  console.log('加载会话数据:', sessionId.value)
})
</script>
