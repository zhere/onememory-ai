<template>
  <div class="space-y-6">
    <!-- 页面标题和控制 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          数据分析
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          系统使用情况和性能指标分析
        </p>
      </div>
      <div class="flex items-center space-x-4">
        <select
          v-model="timeRange"
          class="border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="1d">今天</option>
          <option value="7d">7天</option>
          <option value="30d">30天</option>
          <option value="90d">90天</option>
        </select>
        <button @click="handleRefresh" :disabled="isRefreshing" class="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
          <RefreshCw :class="['w-4 h-4 mr-2', { 'animate-spin': isRefreshing }]" />
          {{ isRefreshing ? '正在刷新...' : '刷新' }}
        </button>
        <button @click="handleExport" class="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          <Download class="w-4 h-4 mr-2" />
          导出
        </button>
      </div>
    </div>

    <!-- 关键指标卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <Activity class="h-6 w-6 text-blue-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  总请求数
                </dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold text-gray-900 dark:text-white">
                    {{ formatNumber(10800) }}
                  </div>
                  <div class="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                    <TrendingUp class="w-4 h-4 mr-1" />
                    12.5%
                  </div>
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
              <Clock class="h-6 w-6 text-green-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  平均响应时间
                </dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold text-gray-900 dark:text-white">
                    165ms
                  </div>
                  <div class="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                    <TrendingDown class="w-4 h-4 mr-1" />
                    8.2%
                  </div>
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
              <Users class="h-6 w-6 text-purple-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  活跃项目
                </dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold text-gray-900 dark:text-white">
                    24
                  </div>
                  <div class="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                    <TrendingUp class="w-4 h-4 mr-1" />
                    4.2%
                  </div>
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
                  成功率
                </dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold text-gray-900 dark:text-white">
                    99.2%
                  </div>
                  <div class="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                    <TrendingUp class="w-4 h-4 mr-1" />
                    0.3%
                  </div>
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
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">
            请求趋势
          </h3>
          <select
            v-model="selectedMetric"
            class="text-sm border border-gray-300 dark:border-gray-600 rounded-md py-1 px-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="requests">请求量</option>
            <option value="response_time">响应时间</option>
            <option value="memory">内存使用</option>
            <option value="errors">错误率</option>
          </select>
        </div>
        <div class="w-full h-64 border rounded-lg p-2 bg-gray-50 dark:bg-gray-700">
          <div ref="requestTrendChartRef" class="w-full h-full"></div>
        </div>
      </div>

      <!-- 模型使用分布 -->
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
          模型使用分布
        </h3>
        <div class="w-full h-64 border rounded-lg p-2 bg-gray-50 dark:bg-gray-700">
          <div ref="modelUsageChartRef" class="w-full h-full"></div>
        </div>
      </div>

      <!-- 响应时间趋势 -->
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
          响应时间趋势
        </h3>
        <div class="w-full h-64 border rounded-lg p-2 bg-gray-50 dark:bg-gray-700">
          <div ref="responseTimeChartRef" class="w-full h-full"></div>
        </div>
      </div>

      <!-- 内存使用情况 -->
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
          内存使用情况
        </h3>
        <div class="w-full h-64 border rounded-lg p-2 bg-gray-50 dark:bg-gray-700">
          <div ref="memoryUsageChartRef" class="w-full h-full"></div>
        </div>
      </div>
    </div>

    <!-- 项目排行榜 -->
    <div class="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
      <div class="px-4 py-5 sm:px-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white">
          项目使用排行
        </h3>
        <p class="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
          按请求量排序的项目使用情况
        </p>
      </div>
      <ul class="divide-y divide-gray-200 dark:divide-gray-700">
        <li v-for="(project, index) in topProjectsData" :key="project.name">
          <div class="px-4 py-4 sm:px-6">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <span class="text-sm font-medium text-blue-600 dark:text-blue-200">
                      {{ index + 1 }}
                    </span>
                  </div>
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ project.name }}
                  </div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    {{ formatNumber(project.requests) }} 请求
                  </div>
                </div>
              </div>
              <div class="flex items-center">
                <div :class="['flex items-center text-sm font-medium', project.growth >= 0 ? 'text-green-600' : 'text-red-600']">
                  <TrendingUp v-if="project.growth >= 0" class="w-4 h-4 mr-1" />
                  <TrendingDown v-else class="w-4 h-4 mr-1" />
                  {{ Math.abs(project.growth) }}%
                </div>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>

    <!-- Export Dialog -->
    <Dialog :isOpen="isExportModalOpen" @close="closeExportModal">
      <template #title>导出数据</template>
      <template #content>
        <div>
          <label for="exportFormat" class="block text-sm font-medium text-gray-700 dark:text-gray-300">选择导出格式</label>
          <select id="exportFormat" v-model="exportFormat" class="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-white">
            <option value="csv">CSV</option>
            <option value="json">JSON</option>
            <option value="xlsx">Excel (XLSX)</option>
          </select>
        </div>
      </template>
      <template #footer>
        <button @click="closeExportModal" class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">取消</button>
        <button @click="confirmExport" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">确认导出</button>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Users, 
  Clock, 
  Zap,
  RefreshCw,
  Download
} from 'lucide-vue-next'
import * as echarts from 'echarts'
import Dialog from '@/components/ui/Dialog.vue'

const timeRange = ref("7d")
const isRefreshing = ref(false)
const isExportModalOpen = ref(false)
const exportFormat = ref('csv')
const selectedMetric = ref("requests")

// 图表容器引用
const requestTrendChartRef = ref<HTMLElement | null>(null)
const modelUsageChartRef = ref<HTMLElement | null>(null)
const responseTimeChartRef = ref<HTMLElement | null>(null)
const memoryUsageChartRef = ref<HTMLElement | null>(null)

// 图表实例
let requestTrendChart: echarts.ECharts | null = null
let modelUsageChart: echarts.ECharts | null = null
let responseTimeChart: echarts.ECharts | null = null
let memoryUsageChart: echarts.ECharts | null = null

// 模拟数据
const requestTrendData = [
  { date: "01-10", requests: 1200, success: 1150, errors: 50 },
  { date: "01-11", requests: 1350, success: 1300, errors: 50 },
  { date: "01-12", requests: 1100, success: 1080, errors: 20 },
  { date: "01-13", requests: 1450, success: 1400, errors: 50 },
  { date: "01-14", requests: 1600, success: 1550, errors: 50 },
  { date: "01-15", requests: 1800, success: 1750, errors: 50 },
  { date: "01-16", requests: 2100, success: 2050, errors: 50 }
]

const modelUsageData = [
  { name: "GPT-4", value: 45, color: "#3B82F6" },
  { name: "GPT-3.5", value: 30, color: "#10B981" },
  { name: "Claude", value: 15, color: "#F59E0B" },
  { name: "Gemini", value: 10, color: "#EF4444" }
]

const responseTimeData = [
  { time: "00:00", avgTime: 120, p95Time: 250 },
  { time: "04:00", avgTime: 110, p95Time: 230 },
  { time: "08:00", avgTime: 180, p95Time: 350 },
  { time: "12:00", avgTime: 220, p95Time: 450 },
  { time: "16:00", avgTime: 200, p95Time: 400 },
  { time: "20:00", avgTime: 150, p95Time: 300 },
  { time: "24:00", avgTime: 130, p95Time: 270 }
]

const memoryUsageData = [
  { date: "01-10", used: 2.1, total: 10 },
  { date: "01-11", used: 2.3, total: 10 },
  { date: "01-12", used: 2.0, total: 10 },
  { date: "01-13", used: 2.5, total: 10 },
  { date: "01-14", used: 2.8, total: 10 },
  { date: "01-15", used: 3.2, total: 10 },
  { date: "01-16", used: 3.5, total: 10 }
]

const topProjectsData = [
  { name: "AI客服助手", requests: 8500, growth: 12.5 },
  { name: "内容生成器", requests: 6200, growth: -3.2 },
  { name: "数据分析平台", requests: 4800, growth: 8.7 },
  { name: "智能翻译", requests: 3600, growth: 15.3 },
  { name: "代码助手", requests: 2900, growth: -1.8 }
]

const formatNumber = (num: number) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M"
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K"
  }
  return num.toString()
}

// 初始化图表
const initCharts = () => {
  console.log('开始初始化图表')
  console.log('requestTrendChartRef.value:', requestTrendChartRef.value)
  console.log('modelUsageChartRef.value:', modelUsageChartRef.value)
  console.log('responseTimeChartRef.value:', responseTimeChartRef.value)
  console.log('memoryUsageChartRef.value:', memoryUsageChartRef.value)
  
  // 请求趋势图 - 简化版本
  if (requestTrendChartRef.value) {
    console.log('初始化请求趋势图')
    requestTrendChart = echarts.init(requestTrendChartRef.value)
    console.log('requestTrendChart:', requestTrendChart)
    
    // 使用极简配置，确保图表能显示
    const simpleOption = {
      xAxis: {
        type: 'category',
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          data: [150, 230, 224, 218, 135, 147, 260],
          type: 'line'
        }
      ]
    }
    
    requestTrendChart.setOption(simpleOption)
  }

  // 模型使用分布 - 简化版本
  if (modelUsageChartRef.value) {
    console.log('初始化模型使用分布图')
    modelUsageChart = echarts.init(modelUsageChartRef.value)
    
    // 使用极简配置，确保图表能显示
    const simplePieOption = {
      tooltip: {
        trigger: 'item'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
      },
      series: [
        {
          name: '模型使用',
          type: 'pie',
          radius: '50%',
          data: [
            { value: 1048, name: 'GPT-4' },
            { value: 735, name: 'GPT-3.5' },
            { value: 580, name: 'Claude' },
            { value: 484, name: 'Gemini' },
          ],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    }
    
    modelUsageChart.setOption(simplePieOption)
  }

  // 响应时间趋势 - 简化版本
  if (responseTimeChartRef.value) {
    console.log('初始化响应时间趋势图')
    responseTimeChart = echarts.init(responseTimeChartRef.value)
    
    // 使用极简配置，确保图表能显示
    const simpleLineOption = {
      xAxis: {
        type: 'category',
        data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          data: [120, 110, 180, 220, 200, 150, 130],
          type: 'line',
          name: '平均响应时间 (ms)'
        }
      ]
    }
    
    responseTimeChart.setOption(simpleLineOption)
  }

  // 内存使用情况 - 简化版本
  if (memoryUsageChartRef.value) {
    console.log('初始化内存使用情况图')
    memoryUsageChart = echarts.init(memoryUsageChartRef.value)
    
    // 使用极简配置，确保图表能显示
    const simpleAreaOption = {
      xAxis: {
        type: 'category',
        data: ['01-10', '01-11', '01-12', '01-13', '01-14', '01-15', '01-16']
      },
      yAxis: {
        type: 'value',
        name: 'GB'
      },
      series: [
        {
          data: [2.1, 2.3, 2.0, 2.5, 2.8, 3.2, 3.5],
          type: 'line',
          name: '已使用',
          areaStyle: {}
        }
      ]
    }
    
    memoryUsageChart.setOption(simpleAreaOption)
  }
}

// 监听窗口大小变化，调整图表大小
const handleResize = () => {
  requestTrendChart?.resize()
  modelUsageChart?.resize()
  responseTimeChart?.resize()
  memoryUsageChart?.resize()
}

// 组件挂载时初始化图表
onMounted(() => {
  initCharts()
  window.addEventListener('resize', handleResize)
})

// 组件卸载时销毁图表
const cleanupCharts = () => {
  requestTrendChart?.dispose()
  modelUsageChart?.dispose()
  responseTimeChart?.dispose()
  memoryUsageChart?.dispose()
  window.removeEventListener('resize', handleResize)
}

// 刷新数据
const handleRefresh = () => {
  isRefreshing.value = true
  console.log('刷新数据')
  setTimeout(() => {
    // 在这里可以添加实际的数据刷新逻辑
    initCharts()
    isRefreshing.value = false
    alert('数据已刷新')
  }, 1500) // 模拟1.5秒的加载时间
}

const handleExport = () => {
  isExportModalOpen.value = true
}

const closeExportModal = () => {
  isExportModalOpen.value = false
}

const confirmExport = () => {
  console.log(`导出数据为 ${exportFormat.value} 格式`)
  // 在这里可以添加实际的导出逻辑
  alert(`正在导出为 ${exportFormat.value} 文件...`)
  closeExportModal()
}
</script>