<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Agent 性能分析
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          分析不同 Agent 的执行效率和成功率
        </p>
      </div>
      <div class="flex items-center space-x-2">
        <select
          v-model="timeRange"
          class="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 text-sm"
        >
          <option value="today">今日</option>
          <option value="week">本周</option>
          <option value="month">本月</option>
          <option value="all">全部</option>
        </select>
      </div>
    </div>

    <!-- 性能概览 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <Brain class="h-6 w-6 text-blue-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Agent 总数
                </dt>
                <dd class="text-lg font-medium text-gray-900 dark:text-white">
                  {{ agents.length }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <Activity class="h-6 w-6 text-green-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  总任务数
                </dt>
                <dd class="text-lg font-medium text-gray-900 dark:text-white">
                  {{ totalTasks }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <CheckCircle class="h-6 w-6 text-green-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  平均成功率
                </dt>
                <dd class="text-lg font-medium text-gray-900 dark:text-white">
                  {{ averageSuccessRate }}%
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <Clock class="h-6 w-6 text-purple-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  平均执行时间
                </dt>
                <dd class="text-lg font-medium text-gray-900 dark:text-white">
                  {{ averageExecutionTime }}ms
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Agent 性能对比图表 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 成功率对比 -->
      <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">
            Agent 成功率对比
          </h3>
        </div>
        <div class="h-80">
          <v-chart class="chart" :option="successRateChartOption" autoresize />
        </div>
      </div>

      <!-- 执行时间对比 -->
      <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">
            Agent 执行时间对比
          </h3>
        </div>
        <div class="h-80">
          <v-chart class="chart" :option="executionTimeChartOption" autoresize />
        </div>
      </div>
    </div>

    <!-- Agent 列表 -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white">
          Agent 性能详情
        </h3>
        <div class="relative w-64">
          <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索 Agent..."
            class="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
          />
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-750">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Agent ID
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                任务数
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                成功率
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                平均执行时间
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                平均优先级
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                最近活跃
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                状态
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr 
              v-for="agent in filteredAgents" 
              :key="agent.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-750"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                    <Brain class="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ agent.id }}
                    </div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">
                      {{ agent.name }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ agent.taskCount }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div 
                      class="bg-green-500 h-2.5 rounded-full" 
                      :style="{ width: `${agent.successRate}%` }"
                    ></div>
                  </div>
                  <span class="ml-2 text-sm text-gray-900 dark:text-white">{{ agent.successRate }}%</span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ agent.avgExecutionTime }}ms
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <Badge :class="agentPriorityClass(agent.avgPriority)">
                  {{ agent.avgPriority.toFixed(1) }}
                </Badge>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ agent.lastActive }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <Badge :class="agent.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'">
                  {{ agent.status === 'active' ? '活跃' : '非活跃' }}
                </Badge>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 工具使用情况 -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white">
          Agent 工具使用情况
        </h3>
      </div>
      <div class="h-80">
        <v-chart class="chart" :option="toolUsageChartOption" autoresize />
      </div>
    </div>

    <!-- 告警设置 -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white">
          告警设置
        </h3>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">成功率告警阈值</h4>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-700 dark:text-gray-300">最低成功率</span>
              <div class="flex items-center space-x-2">
                <input
                  v-model="alertThreshold.successRate"
                  type="number"
                  min="0"
                  max="100"
                  class="w-20 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                />
                <span class="text-sm text-gray-500 dark:text-gray-400">%</span>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-700 dark:text-gray-300">连续失败次数</span>
              <div class="flex items-center space-x-2">
                <input
                  v-model="alertThreshold.failureCount"
                  type="number"
                  min="1"
                  class="w-20 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                />
                <span class="text-sm text-gray-500 dark:text-gray-400">次</span>
              </div>
            </div>
          </div>
        </div>
        <div>
          <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">执行时间告警阈值</h4>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-700 dark:text-gray-300">最长执行时间</span>
              <div class="flex items-center space-x-2">
                <input
                  v-model="alertThreshold.maxExecutionTime"
                  type="number"
                  min="0"
                  class="w-20 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                />
                <span class="text-sm text-gray-500 dark:text-gray-400">ms</span>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-700 dark:text-gray-300">平均执行时间</span>
              <div class="flex items-center space-x-2">
                <input
                  v-model="alertThreshold.avgExecutionTime"
                  type="number"
                  min="0"
                  class="w-20 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                />
                <span class="text-sm text-gray-500 dark:text-gray-400">ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="mt-4 flex justify-end">
        <button
          @click="saveAlertSettings"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-150"
        >
          保存告警设置
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  Brain, 
  CheckCircle, 
  Clock, 
  Activity, 
  Search 
} from 'lucide-vue-next'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, LineChart, PieChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, LegendComponent, GridComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import Badge from '@/components/ui/Badge.vue'

use([CanvasRenderer, BarChart, LineChart, PieChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent])

// 搜索查询
const searchQuery = ref('')
const timeRange = ref('all')

// Agent 数据结构
interface Agent {
  id: string
  name: string
  taskCount: number
  successRate: number
  avgExecutionTime: number
  avgPriority: number
  lastActive: string
  status: 'active' | 'inactive'
}

// 告警阈值配置
const alertThreshold = ref({
  successRate: 70,
  failureCount: 3,
  maxExecutionTime: 5000,
  avgExecutionTime: 2000
})

// 模拟 Agent 数据
const agents = ref<Agent[]>([
  {
    id: 'agent-sales-001',
    name: '销售数据分析 Agent',
    taskCount: 128,
    successRate: 98,
    avgExecutionTime: 185,
    avgPriority: 1.5,
    lastActive: '2分钟前',
    status: 'active'
  },
  {
    id: 'agent-content-001',
    name: '内容生成 Agent',
    taskCount: 96,
    successRate: 94,
    avgExecutionTime: 210,
    avgPriority: 2.0,
    lastActive: '15分钟前',
    status: 'active'
  },
  {
    id: 'agent-ml-001',
    name: '机器学习 Agent',
    taskCount: 42,
    successRate: 75,
    avgExecutionTime: 3600,
    avgPriority: 1.2,
    lastActive: '1小时前',
    status: 'active'
  },
  {
    id: 'agent-support-001',
    name: '客户支持 Agent',
    taskCount: 215,
    successRate: 96,
    avgExecutionTime: 150,
    avgPriority: 2.5,
    lastActive: '5分钟前',
    status: 'active'
  },
  {
    id: 'agent-research-001',
    name: '市场研究 Agent',
    taskCount: 78,
    successRate: 89,
    avgExecutionTime: 280,
    avgPriority: 1.8,
    lastActive: '30分钟前',
    status: 'active'
  }
])

// 过滤后的 Agent 列表
const filteredAgents = computed(() => {
  if (!searchQuery.value) return agents.value
  const query = searchQuery.value.toLowerCase()
  return agents.value.filter(agent => 
    agent.id.toLowerCase().includes(query) || 
    agent.name.toLowerCase().includes(query)
  )
})

// 总任务数
const totalTasks = computed(() => {
  return agents.value.reduce((sum, agent) => sum + agent.taskCount, 0)
})

// 平均成功率
const averageSuccessRate = computed(() => {
  const sum = agents.value.reduce((acc, agent) => acc + agent.successRate, 0)
  return Math.round(sum / agents.value.length)
})

// 平均执行时间
const averageExecutionTime = computed(() => {
  const sum = agents.value.reduce((acc, agent) => acc + agent.avgExecutionTime, 0)
  return Math.round(sum / agents.value.length)
})

// Agent 优先级样式
const agentPriorityClass = (priority: number) => {
  if (priority < 1.5) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
  if (priority < 2.0) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
  if (priority < 2.5) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
  return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
}

// 成功率对比图表配置
const successRateChartOption = computed(() => {
  return {
    grid: { top: 8, right: 8, bottom: 30, left: 70 },
    xAxis: {
      type: 'category',
      data: agents.value.map(agent => agent.id),
      axisLine: {
        lineStyle: {
          color: '#e5e7eb'
        }
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      splitLine: {
        lineStyle: {
          color: '#f3f4f6',
          type: 'dashed'
        }
      },
      axisLabel: {
        formatter: '{value}%'
      }
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: {
        color: '#1f2937'
      }
    },
    series: [
      {
        name: '成功率',
        data: agents.value.map(agent => agent.successRate),
        type: 'bar',
        itemStyle: {
          color: '#3B82F6'
        },
        barWidth: '60%'
      }
    ]
  }
})

// 执行时间对比图表配置
const executionTimeChartOption = computed(() => {
  return {
    grid: { top: 8, right: 8, bottom: 30, left: 70 },
    xAxis: {
      type: 'category',
      data: agents.value.map(agent => agent.id),
      axisLine: {
        lineStyle: {
          color: '#e5e7eb'
        }
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      splitLine: {
        lineStyle: {
          color: '#f3f4f6',
          type: 'dashed'
        }
      },
      axisLabel: {
        formatter: '{value}ms'
      }
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: {
        color: '#1f2937'
      }
    },
    series: [
      {
        name: '平均执行时间',
        data: agents.value.map(agent => agent.avgExecutionTime),
        type: 'bar',
        itemStyle: {
          color: '#10B981'
        },
        barWidth: '60%'
      }
    ]
  }
})

// 工具使用情况图表配置
const toolUsageChartOption = computed(() => {
  return {
    grid: { top: 40, right: 8, bottom: 8, left: 8 },
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: {
        color: '#1f2937'
      },
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'horizontal',
      bottom: 0,
      data: ['数据库查询工具', '数据清洗工具', '报告生成工具', '邮件发送工具', '文本生成工具', '数据分析工具', '模型训练工具']
    },
    series: [
      {
        name: '工具使用情况',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 125, name: '数据库查询工具' },
          { value: 98, name: '数据清洗工具' },
          { value: 76, name: '报告生成工具' },
          { value: 142, name: '邮件发送工具' },
          { value: 23, name: '文本生成工具' },
          { value: 18, name: '数据分析工具' },
          { value: 5, name: '模型训练工具' }
        ]
      }
    ]
  }
})

// 保存告警设置
const saveAlertSettings = () => {
  // 这里可以添加保存告警设置的逻辑
  console.log('保存告警设置:', alertThreshold.value)
  alert('告警设置已保存')
}

// 组件挂载
onMounted(() => {
  console.log('Agent 性能分析页面已加载')
})
</script>
