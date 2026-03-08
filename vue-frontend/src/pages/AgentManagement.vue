<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Agent 管理
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          管理和配置系统中的智能Agent
        </p>
      </div>
      <button
        @click="openCreateDialog"
        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-150 flex items-center"
      >
        <Plus class="w-4 h-4 mr-1" />
        创建Agent
      </button>
    </div>

    <!-- 搜索和筛选 -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
      <div class="flex items-center space-x-4">
        <div class="relative w-full max-w-md">
          <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索Agent..."
            class="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <select
          v-model="statusFilter"
          class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="all">全部状态</option>
          <option value="active">活跃</option>
          <option value="inactive">非活跃</option>
        </select>
      </div>
    </div>

    <!-- Agent列表 -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-750">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                ID
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                名称
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                描述
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                状态
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                创建时间
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="agent in filteredAgents" :key="agent.id" class="hover:bg-gray-50 dark:hover:bg-gray-750">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ agent.id }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                    <Brain class="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ agent.name }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                {{ agent.description || '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <Badge :class="agent.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'">
                  {{ agent.status === 'active' ? '活跃' : '非活跃' }}
                </Badge>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ formatDate(agent.createdAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end space-x-2">
                  <button
                    @click="toggleAgentStatus(agent)"
                    :class="[
                      'px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-150',
                      agent.status === 'active' 
                        ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:hover:bg-yellow-800' 
                        : 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800'
                    ]"
                  >
                    {{ agent.status === 'active' ? '停用' : '激活' }}
                  </button>
                  <button
                    @click="openEditDialog(agent)"
                    class="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors duration-150 text-sm font-medium dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800"
                  >
                    编辑
                  </button>
                  <button
                    @click="openDeleteDialog(agent)"
                    class="px-3 py-1.5 bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors duration-150 text-sm font-medium dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
                  >
                    删除
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- 空状态 -->
      <div v-if="filteredAgents.length === 0" class="px-6 py-12 text-center">
        <Brain class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
          没有找到Agent
        </h3>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          点击"创建Agent"按钮开始添加Agent
        </p>
      </div>
    </div>

    <!-- 创建/编辑Agent对话框 -->
    <Dialog :is-open="isDialogOpen" @close="closeDialog">
      <template #title>
        {{ isEditing ? '编辑Agent' : '创建Agent' }}
      </template>
      <template #content>
        <form @submit.prevent="saveAgent">
          <div class="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            <!-- 基本信息 -->
            <div>
              <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">基本信息</h3>
              <div class="space-y-3">
                <div>
                  <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    名称 *
                  </label>
                  <input
                    type="text"
                    id="name"
                    v-model="formData.name"
                    required
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Agent名称"
                  />
                </div>
                <div>
                  <label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    描述
                  </label>
                  <textarea
                    id="description"
                    v-model="formData.description"
                    rows="3"
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Agent描述"
                  ></textarea>
                </div>
                <div>
                  <label for="type" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Agent类型 *
                  </label>
                  <select
                    id="type"
                    v-model="formData.type"
                    required
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="general">通用型</option>
                    <option value="sales">销售型</option>
                    <option value="support">客服型</option>
                    <option value="analytics">分析型</option>
                    <option value="content">内容生成型</option>
                    <option value="development">开发型</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- 模型配置 -->
            <div>
              <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">模型配置</h3>
              <div class="space-y-3">
                <div>
                  <label for="model" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    模型名称 *
                  </label>
                  <select
                    id="model"
                    v-model="formData.model"
                    required
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="gpt-4">GPT-4</option>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                    <option value="claude-3-opus">Claude 3 Opus</option>
                    <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                    <option value="gemini-pro">Gemini Pro</option>
                    <option value="llama-3-70b">Llama 3 70B</option>
                  </select>
                </div>
                <div>
                  <label for="systemPrompt" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    系统提示词 *
                  </label>
                  <textarea
                    id="systemPrompt"
                    v-model="formData.systemPrompt"
                    rows="4"
                    required
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
                    placeholder="你是一个专业的..."
                  ></textarea>
                </div>
              </div>
            </div>

            <!-- 功能配置 -->
            <div>
              <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">功能配置</h3>
              <div class="space-y-3">
                <div class="flex items-center">
                  <input
                    type="checkbox"
                    id="memoryEnabled"
                    v-model="formData.memoryEnabled"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label for="memoryEnabled" class="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    启用记忆功能
                  </label>
                </div>
                <div>
                  <label for="timeout" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    超时设置 (秒)
                  </label>
                  <input
                    type="number"
                    id="timeout"
                    v-model="formData.timeout"
                    min="1"
                    max="3600"
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="300"
                  />
                </div>
                <div>
                  <label for="retryPolicy" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    重试策略
                  </label>
                  <select
                    id="retryPolicy"
                    v-model="formData.retryPolicy"
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="none">不重试</option>
                    <option value="retry_once">重试一次</option>
                    <option value="retry_multiple">多次重试</option>
                  </select>
                </div>
                <div>
                  <label for="logLevel" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    日志级别
                  </label>
                  <select
                    id="logLevel"
                    v-model="formData.logLevel"
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="error">错误</option>
                    <option value="warn">警告</option>
                    <option value="info">信息</option>
                    <option value="debug">调试</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- 工具权限 -->
            <div>
              <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">工具权限</h3>
              <div class="space-y-2">
                <div class="flex items-center">
                  <input
                    type="checkbox"
                    id="tool-db"
                    value="database-query"
                    v-model="formData.tools"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label for="tool-db" class="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    数据库查询工具
                  </label>
                </div>
                <div class="flex items-center">
                  <input
                    type="checkbox"
                    id="tool-data-clean" value="data-cleaning"
                    v-model="formData.tools"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label for="tool-data-clean" class="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    数据清洗工具
                  </label>
                </div>
                <div class="flex items-center">
                  <input
                    type="checkbox"
                    id="tool-report" value="report-generation"
                    v-model="formData.tools"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label for="tool-report" class="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    报告生成工具
                  </label>
                </div>
                <div class="flex items-center">
                  <input
                    type="checkbox"
                    id="tool-email" value="email-send"
                    v-model="formData.tools"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label for="tool-email" class="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    邮件发送工具
                  </label>
                </div>
                <div class="flex items-center">
                  <input
                    type="checkbox"
                    id="tool-text-gen" value="text-generation"
                    v-model="formData.tools"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label for="tool-text-gen" class="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    文本生成工具
                  </label>
                </div>
              </div>
            </div>

            <!-- 状态设置 -->
            <div>
              <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">状态设置</h3>
              <div>
                <label for="status" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  状态
                </label>
                <select
                  id="status"
                  v-model="formData.status"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="active">活跃</option>
                  <option value="inactive">非活跃</option>
                </select>
              </div>
            </div>
          </div>
        </form>
      </template>
      <template #footer>
        <button
          type="button"
          @click="closeDialog"
          class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-150"
        >
          取消
        </button>
        <button
          type="button"
          @click="saveAgent"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-150"
        >
          {{ isEditing ? '保存' : '创建' }}
        </button>
      </template>
    </Dialog>

    <!-- 删除确认对话框 -->
    <Dialog :is-open="isDeleteDialogOpen" @close="closeDeleteDialog">
      <template #title>
        确认删除
      </template>
      <template #content>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          你确定要删除Agent <span class="font-medium text-gray-900 dark:text-white">{{ selectedAgentForDelete?.name }}</span> 吗？
          此操作不可撤销。
        </p>
      </template>
      <template #footer>
        <button
          @click="closeDeleteDialog"
          class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-150"
        >
          取消
        </button>
        <button
          @click="deleteAgent"
          class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-150"
        >
          删除
        </button>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Brain, Plus, Search } from 'lucide-vue-next'
import { Agent, agentsApi } from '@/lib/api'
import Badge from '@/components/ui/Badge.vue'
import Dialog from '@/components/ui/Dialog.vue'

// 搜索和筛选
const searchQuery = ref('')
const statusFilter = ref('all')

// 对话框状态
const isDialogOpen = ref(false)
const isDeleteDialogOpen = ref(false)
const isEditing = ref(false)

// 表单数据
const formData = ref({
  name: '',
  description: '',
  type: 'general',
  model: 'gpt-4',
  systemPrompt: '',
  tools: [] as string[],
  memoryEnabled: true,
  status: 'active' as 'active' | 'inactive',
  timeout: 300,
  retryPolicy: 'retry_once' as 'none' | 'retry_once' | 'retry_multiple',
  logLevel: 'info' as 'error' | 'warn' | 'info' | 'debug'
})

// 选中的Agent
const selectedAgentForDelete = ref<Agent | null>(null)
const selectedAgentForEdit = ref<Agent | null>(null)

// 模拟Agent数据
const agents = ref<Agent[]>([
  {
    id: 'agent-sales-001',
    name: '销售数据分析Agent',
    description: '用于销售数据分析和报告生成的智能Agent',
    type: 'analytics',
    model: 'gpt-4',
    systemPrompt: '你是一个专业的销售数据分析专家，擅长分析销售数据并生成详细报告。',
    tools: ['database-query', 'report-generation', 'data-cleaning'],
    memoryEnabled: true,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    timeout: 300,
    retryPolicy: 'retry_once',
    logLevel: 'info'
  },
  {
    id: 'agent-content-001',
    name: '内容生成Agent',
    description: '用于生成营销文案和内容的智能Agent',
    type: 'content',
    model: 'gpt-3.5-turbo',
    systemPrompt: '你是一个专业的内容创作者，擅长生成高质量的营销文案和文章。',
    tools: ['text-generation'],
    memoryEnabled: true,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    timeout: 240,
    retryPolicy: 'retry_once',
    logLevel: 'info'
  },
  {
    id: 'agent-ml-001',
    name: '机器学习Agent',
    description: '用于训练和部署机器学习模型的智能Agent',
    type: 'development',
    model: 'claude-3-sonnet',
    systemPrompt: '你是一个专业的机器学习工程师，擅长训练和部署机器学习模型。',
    tools: [],
    memoryEnabled: false,
    status: 'inactive',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    timeout: 600,
    retryPolicy: 'retry_multiple',
    logLevel: 'debug'
  },
  {
    id: 'agent-support-001',
    name: '客户支持Agent',
    description: '用于处理客户支持请求的智能Agent',
    type: 'support',
    model: 'gpt-4',
    systemPrompt: '你是一个专业的客户支持代表，擅长处理各种客户问题和请求。',
    tools: ['email-send'],
    memoryEnabled: true,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    timeout: 180,
    retryPolicy: 'retry_once',
    logLevel: 'info'
  }
])

// 过滤后的Agent列表
const filteredAgents = computed(() => {
  return agents.value.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                         agent.description?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         agent.id.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesStatus = statusFilter.value === 'all' || agent.status === statusFilter.value
    return matchesSearch && matchesStatus
  })
})

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString()
}

// 打开创建对话框
const openCreateDialog = () => {
  isEditing.value = false
  formData.value = {
    name: '',
    description: '',
    status: 'active'
  }
  isDialogOpen.value = true
}

// 打开编辑对话框
const openEditDialog = (agent: Agent) => {
  isEditing.value = true
  selectedAgentForEdit.value = agent
  formData.value = {
    name: agent.name,
    description: agent.description || '',
    status: agent.status
  }
  isDialogOpen.value = true
}

// 打开删除对话框
const openDeleteDialog = (agent: Agent) => {
  selectedAgentForDelete.value = agent
  isDeleteDialogOpen.value = true
}

// 关闭对话框
const closeDialog = () => {
  isDialogOpen.value = false
  selectedAgentForEdit.value = null
}

// 关闭删除对话框
const closeDeleteDialog = () => {
  isDeleteDialogOpen.value = false
  selectedAgentForDelete.value = null
}

// 保存Agent
const saveAgent = () => {
  if (isEditing.value && selectedAgentForEdit.value) {
    // 更新Agent
    const updatedAgent = {
      ...selectedAgentForEdit.value,
      ...formData.value,
      updatedAt: new Date().toISOString()
    }
    const index = agents.value.findIndex(a => a.id === selectedAgentForEdit.value?.id)
    if (index !== -1) {
      agents.value[index] = updatedAgent
    }
    // 实际项目中这里会调用API更新Agent
    // await agentsApi.update(selectedAgentForEdit.value.id, formData.value)
  } else {
    // 创建新Agent
    const newAgent: Agent = {
      id: `agent-${Date.now().toString().slice(-6)}`,
      ...formData.value,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    agents.value.unshift(newAgent)
    // 实际项目中这里会调用API创建Agent
    // await agentsApi.create(formData.value)
  }
  closeDialog()
}

// 删除Agent
const deleteAgent = () => {
  if (selectedAgentForDelete.value) {
    const index = agents.value.findIndex(a => a.id === selectedAgentForDelete.value?.id)
    if (index !== -1) {
      agents.value.splice(index, 1)
    }
    // 实际项目中这里会调用API删除Agent
    // await agentsApi.delete(selectedAgentForDelete.value.id)
  }
  closeDeleteDialog()
}

// 切换Agent状态
const toggleAgentStatus = (agent: Agent) => {
  const newStatus = agent.status === 'active' ? 'inactive' : 'active'
  const updatedAgent = {
    ...agent,
    status: newStatus,
    updatedAt: new Date().toISOString()
  }
  const index = agents.value.findIndex(a => a.id === agent.id)
  if (index !== -1) {
    agents.value[index] = updatedAgent
  }
  // 实际项目中这里会调用API更新Agent状态
  // await agentsApi.updateStatus(agent.id, newStatus)
}

// 组件挂载时加载数据
onMounted(() => {
  // 实际项目中这里会调用API获取Agent列表
  // const response = await agentsApi.getAll()
  // agents.value = response.data
})
</script>