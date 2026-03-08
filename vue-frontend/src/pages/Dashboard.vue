<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          仪表板
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Onememory 系统概览和实时监控
        </p>
      </div>
      <div class="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
        <Clock class="w-4 h-4" />
        <span>最后更新: {{ currentTime }}</span>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <Database class="h-6 w-6 text-blue-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  总项目数
                </dt>
                <dd class="text-lg font-medium text-gray-900 dark:text-white">
                  {{ stats.totalProjects }}
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
              <Users class="h-6 w-6 text-green-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  活跃连接
                </dt>
                <dd class="text-lg font-medium text-gray-900 dark:text-white">
                  {{ stats.activeConnections }}
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
              <Brain class="h-6 w-6 text-purple-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  记忆条目
                </dt>
                <dd class="text-lg font-medium text-gray-900 dark:text-white">
                  {{ stats.memoryEntries.toLocaleString() }}
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
              <Zap class="h-6 w-6 text-yellow-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  今日请求
                </dt>
                <dd class="text-lg font-medium text-gray-900 dark:text-white">
                  {{ stats.requestsToday.toLocaleString() }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 请求趋势图 -->
      <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">
            请求趋势
          </h3>
          <TrendingUp class="h-5 w-5 text-green-500" />
        </div>
        <div class="h-64">
          <v-chart class="chart" :option="lineChartOption" autoresize />
        </div>
      </div>

      <!-- 记忆使用情况 -->
      <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">
            记忆使用情况
          </h3>
          <Brain class="h-5 w-5 text-purple-500" />
        </div>
        <div class="h-64">
          <v-chart class="chart" :option="barChartOption" autoresize />
        </div>
      </div>
    </div>

    <!-- 系统状态和最近活动 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 系统状态 -->
      <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
          系统状态
        </h3>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <Server class="h-5 w-5 text-green-500 mr-2" />
              <span class="text-sm text-gray-600 dark:text-gray-300">系统运行时间</span>
            </div>
            <span class="text-sm font-medium text-green-600">{{ stats.systemUptime }}</span>
          </div>
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <Activity class="h-5 w-5 text-blue-500 mr-2" />
              <span class="text-sm text-gray-600 dark:text-gray-300">平均响应时间</span>
            </div>
            <span class="text-sm font-medium text-blue-600">{{ stats.avgResponseTime }}ms</span>
          </div>
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <Database class="h-5 w-5 text-purple-500 mr-2" />
              <span class="text-sm text-gray-600 dark:text-gray-300">数据库状态</span>
            </div>
            <span class="text-sm font-medium text-green-600">正常</span>
          </div>
        </div>
      </div>

      <!-- 最近活动 -->
      <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
          最近活动
        </h3>
        <div class="space-y-3">
          <div v-for="activity in recentActivity" :key="activity.id" class="flex items-center space-x-3">
            <div :class="[
              'w-2 h-2 rounded-full',
              activity.type === 'create' ? 'bg-green-500' :
              activity.type === 'update' ? 'bg-blue-500' :
              activity.type === 'optimize' ? 'bg-purple-500' :
              'bg-yellow-500'
            ]" />
            <div class="flex-1 min-w-0">
              <p class="text-sm text-gray-900 dark:text-white">
                <span class="font-medium">{{ activity.action }}</span>
                <span class="text-gray-500 dark:text-gray-400"> - {{ activity.project }}</span>
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">{{ activity.time }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { 
  Activity, 
  Users, 
  Database, 
  Zap, 
  TrendingUp, 
  Clock,
  Server,
  Brain
} from 'lucide-vue-next'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from 'echarts/components'
import VChart from 'vue-echarts'

use([
  CanvasRenderer,
  LineChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
])

// 模拟数据
const statsData = [
  { name: "00:00", requests: 120, memory: 85 },
  { name: "04:00", requests: 98, memory: 78 },
  { name: "08:00", requests: 180, memory: 92 },
  { name: "12:00", requests: 250, memory: 95 },
  { name: "16:00", requests: 320, memory: 88 },
  { name: "20:00", requests: 280, memory: 90 },
]

const memoryUsageData = [
  { name: "项目A", usage: 45 },
  { name: "项目B", usage: 32 },
  { name: "项目C", usage: 28 },
  { name: "项目D", usage: 15 },
]

// 图表配置
const lineChartOption = ref({
  grid: { top: 8, right: 8, bottom: 24, left: 36 },
  xAxis: {
    type: 'category',
    data: statsData.map(item => item.name),
    axisLine: {
      lineStyle: {
        color: '#e5e7eb'
      }
    },
    axisTick: {
      show: false
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
    }
  },
  series: [
    {
      data: statsData.map(item => item.requests),
      type: 'line',
      smooth: true,
      lineStyle: {
        color: '#3B82F6',
        width: 2,
      },
      itemStyle: {
        color: '#3B82F6',
      },
      symbol: 'circle',
      symbolSize: 6,
    },
  ],
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderColor: '#e5e7eb',
    borderWidth: 1,
    textStyle: {
      color: '#1f2937'
    }
  },
})

const barChartOption = ref({
  grid: { top: 8, right: 8, bottom: 24, left: 36 },
  xAxis: {
    type: 'category',
    data: memoryUsageData.map(item => item.name),
    axisLine: {
      lineStyle: {
        color: '#e5e7eb'
      }
    },
    axisTick: {
      show: false
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
    }
  },
  series: [
    {
      data: memoryUsageData.map(item => item.usage),
      type: 'bar',
      itemStyle: {
        color: '#8B5CF6',
      },
      barWidth: '60%'
    },
  ],
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderColor: '#e5e7eb',
    borderWidth: 1,
    textStyle: {
      color: '#1f2937'
    }
  },
})

const stats = reactive({
  totalProjects: 12,
  activeConnections: 45,
  memoryEntries: 1250,
  requestsToday: 3420,
  avgResponseTime: 125,
  systemUptime: "99.9%"
})

const recentActivity = reactive([
  { id: 1, action: "新建项目", project: "AI助手项目", time: "2分钟前", type: "create" },
  { id: 2, action: "更新配置", project: "数据分析项目", time: "5分钟前", type: "update" },
  { id: 3, action: "记忆优化", project: "客服机器人", time: "10分钟前", type: "optimize" },
  { id: 4, action: "Token刷新", project: "内容生成器", time: "15分钟前", type: "token" },
])

const currentTime = ref(new Date().toLocaleTimeString())
let timer: number | null = null

onMounted(() => {
  timer = window.setInterval(() => {
    currentTime.value = new Date().toLocaleTimeString()
  }, 1000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>