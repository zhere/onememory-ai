<template>
  <div class="p-6 space-y-6">
    <!-- 页面标题和操作按钮 -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">RAG知识源管理</h1>
        <p class="mt-2 text-gray-600">
          管理外部知识库，增强记忆系统的检索能力
        </p>
      </div>
      <div class="flex items-center space-x-4">
        <select v-model="selectedProjectId" class="w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="default">所有项目</option>
          <option v-for="project in projects" :key="project.id" :value="project.id">
            {{ project.name }}
          </option>
        </select>
        <button 
          @click="openAddDialog" 
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus class="h-4 w-4 mr-2" />
          添加知识源
        </button>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex justify-between items-center mb-2">
          <h3 class="text-sm font-medium text-gray-500">总知识源</h3>
          <Database class="h-4 w-4 text-gray-500" />
        </div>
        <p class="text-2xl font-bold">{{ filteredSources.length }}</p>
      </div>
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex justify-between items-center mb-2">
          <h3 class="text-sm font-medium text-gray-500">启用中</h3>
          <CheckCircle class="h-4 w-4 text-green-500" />
        </div>
        <p class="text-2xl font-bold">{{ filteredSources.filter(s => s.enabled).length }}</p>
      </div>
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex justify-between items-center mb-2">
          <h3 class="text-sm font-medium text-gray-500">文档总数</h3>
          <FileText class="h-4 w-4 text-gray-500" />
        </div>
        <p class="text-2xl font-bold">{{ filteredSources.reduce((sum, s) => sum + (s.documentCount || 0), 0) }}</p>
      </div>
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex justify-between items-center mb-2">
          <h3 class="text-sm font-medium text-gray-500">已连接</h3>
          <div class="h-4 w-4 bg-green-500 rounded-full" />
        </div>
        <p class="text-2xl font-bold">{{ filteredSources.filter(s => s.status === 'connected').length }}</p>
      </div>
    </div>

    <!-- 知识源列表 -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 class="text-lg font-semibold mb-4">知识源列表</h2>
      <p class="text-sm text-gray-600 mb-6">配置和管理您的外部知识库连接</p>
      
      <div class="space-y-4">
        <div 
          v-for="source in filteredSources" 
          :key="source.id" 
          class="flex items-center justify-between p-4 border rounded-lg"
        >
          <div class="flex items-center space-x-4">
            <div class="p-2 bg-gray-100 rounded-lg">
              <component :is="getSourceIcon(source.type)" class="h-4 w-4" />
            </div>
            <div>
              <div class="flex items-center space-x-2">
                <h3 class="font-medium">{{ source.name }}</h3>
                <span class="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">{{ source.type }}</span>
                <span v-if="source.projectName" class="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">{{ source.projectName }}</span>
                <span 
                  :class="[
                    'px-2 py-1 rounded text-xs',
                    source.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  ]"
                >
                  {{ source.enabled ? '启用' : '禁用' }}
                </span>
              </div>
              <div class="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                <span>优先级: {{ source.priority }}/10</span>
                <span v-if="source.documentCount">{{ source.documentCount }} 文档</span>
                <span v-if="source.lastSync">最后同步: {{ formatDate(source.lastSync) }}</span>
              </div>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <span 
              :class="[
                'px-2 py-1 rounded text-xs font-medium',
                source.status === 'connected' ? 'bg-green-100 text-green-800' :
                source.status === 'disconnected' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              ]"
            >
              <component 
                v-if="source.status === 'connected'" 
                :is="CheckCircle" 
                class="inline-block h-3 w-3 mr-1" 
              />
              <component 
                v-else-if="source.status === 'disconnected'" 
                :is="XCircle" 
                class="inline-block h-3 w-3 mr-1" 
              />
              <component 
                v-else 
                :is="Loader2" 
                class="inline-block h-3 w-3 mr-1 animate-spin" 
              />
              {{ source.status }}
            </span>
            <button 
              @click="testConnection(source.id)" 
              class="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
              :disabled="testingSources.has(source.id)"
            >
              <TestTube class="h-4 w-4" />
            </button>
            <button 
              @click="openEditDialog(source)" 
              class="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <Edit class="h-4 w-4" />
            </button>
            <button 
              @click="deleteSource(source.id)" 
              class="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <Trash2 class="h-4 w-4" />
            </button>
          </div>
        </div>
        <div v-if="filteredSources.length === 0" class="text-center py-8 text-gray-500">
          <AlertCircle class="h-8 w-8 mx-auto mb-2" />
          <p>暂无知识源，点击上方"添加知识源"按钮开始配置</p>
        </div>
      </div>
    </div>

    <!-- 添加/编辑对话框 -->
    <div v-if="isDialogOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <h2 class="text-xl font-semibold mb-4">{{ isEditing ? '编辑知识源' : '添加知识源' }}</h2>
          <p class="text-sm text-gray-600 mb-6">配置外部知识库连接信息</p>
          
          <form @submit.prevent="saveSource" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="name" class="block text-sm font-medium mb-2">名称 *</label>
                <input
                  id="name"
                  v-model="formData.name"
                  type="text"
                  required
                  placeholder="例如：技术文档库"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label for="project" class="block text-sm font-medium mb-2">关联项目 *</label>
                <select
                  id="project"
                  v-model="formData.projectId"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option v-for="project in projects" :key="project.id" :value="project.id">
                    {{ project.name }}
                  </option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="type" class="block text-sm font-medium mb-2">类型 *</label>
                <select
                  id="type"
                  v-model="formData.type"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  @change="resetConfig"
                >
                  <option v-for="type in sourceTypes" :key="type.type" :value="type.type">
                    <div class="flex items-center space-x-2">
                      <component :is="getSourceIcon(type.type)" class="h-4 w-4" />
                      <span>{{ type.name }}</span>
                    </div>
                  </option>
                </select>
              </div>
              <div>
                <label for="priority" class="block text-sm font-medium mb-2">优先级</label>
                <input
                  id="priority"
                  v-model.number="formData.priority"
                  type="number"
                  min="1"
                  max="10"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div class="flex items-center">
                <input
                  id="enabled"
                  v-model="formData.enabled"
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label for="enabled" class="ml-2 text-sm font-medium">启用</label>
              </div>
            </div>

            <!-- 配置字段 -->
            <div v-if="currentSourceType" class="space-y-4 p-4 border rounded-lg">
              <h4 class="font-medium">{{ currentSourceType.name }} 配置</h4>
              <p class="text-sm text-gray-600">{{ currentSourceType.description }}</p>
              <div v-for="field in currentSourceType.configFields" :key="field.name" class="space-y-2">
                <label :for="field.name" class="block text-sm font-medium">
                  {{ field.name }} <span v-if="field.required" class="text-red-500">*</span>
                </label>
                <input
                  :id="field.name"
                  v-model="formData.config[field.name]"
                  :type="field.type"
                  :required="field.required"
                  :placeholder="field.description"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p class="text-xs text-gray-500">{{ field.description }}</p>
              </div>
            </div>

            <!-- 对话框按钮 -->
            <div class="flex justify-end space-x-2 mt-6">
              <button 
                @click="closeDialog" 
                type="button"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                取消
              </button>
              <button 
                type="submit"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                {{ isEditing ? '更新' : '添加' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, markRaw } from 'vue'
import { storeToRefs } from 'pinia'
import { useRAGStore, RAGKnowledgeSource } from '@/stores/rag'
import { useProjectStore } from '@/stores/project'

// 图标组件
import { 
  Plus,
  Edit,
  Trash2,
  TestTube,
  Database,
  FileText,
  Cloud,
  HardDrive,
  Globe,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-vue-next'

const ragStore = useRAGStore()
const projectStore = useProjectStore()

const { knowledgeSources } = storeToRefs(ragStore)
const { addKnowledgeSource, updateKnowledgeSource, removeKnowledgeSource } = ragStore

// 项目数据
const projects = computed(() => projectStore.projects || [
  { id: '1', name: 'AI客服助手', description: '智能客服系统', status: 'active' },
  { id: '2', name: '内容生成器', description: 'AI内容创作工具', status: 'active' }
])

// 对话框状态
const isDialogOpen = ref(false)
const isEditing = ref(false)
const testingSources = ref(new Set<string>())

// 表单数据
const formData = ref({
  id: '',
  name: '',
  type: 'elasticsearch',
  priority: 5,
  enabled: true,
  projectId: projects.value[0]?.id || '',
  config: {} as Record<string, any>
})

// 知识源类型配置
interface SourceType {
  type: string;
  name: string;
  description: string;
  configFields: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
  }>;
}

const sourceTypes: SourceType[] = [
  {
    type: 'elasticsearch',
    name: 'Elasticsearch',
    description: '分布式搜索和分析引擎',
    configFields: [
      { name: 'host', type: 'string', required: true, description: 'Elasticsearch主机地址' },
      { name: 'index', type: 'string', required: true, description: '索引名称' },
      { name: 'username', type: 'string', required: false, description: '用户名' },
      { name: 'password', type: 'password', required: false, description: '密码' }
    ]
  },
  {
    type: 'chroma',
    name: 'ChromaDB',
    description: '向量数据库',
    configFields: [
      { name: 'host', type: 'string', required: true, description: 'ChromaDB主机地址' },
      { name: 'collection', type: 'string', required: true, description: '集合名称' }
    ]
  },
  {
    type: 'weaviate',
    name: 'Weaviate',
    description: '向量搜索引擎',
    configFields: [
      { name: 'host', type: 'string', required: true, description: 'Weaviate主机地址' },
      { name: 'class', type: 'string', required: true, description: '类名称' }
    ]
  },
  {
    type: 'local_files',
    name: '本地文件',
    description: '本地文件系统',
    configFields: [
      { name: 'path', type: 'string', required: true, description: '文件路径' }
    ]
  },
  {
    type: 'api',
    name: 'API接口',
    description: 'REST API接口',
    configFields: [
      { name: 'url', type: 'string', required: true, description: 'API地址' },
      { name: 'headers', type: 'string', required: false, description: '请求头(JSON格式)' }
    ]
  }
]

// 根据选中的项目过滤知识源
const selectedProjectId = ref('default')
const filteredSources = computed(() => {
  return knowledgeSources.value.filter(source => {
    if (selectedProjectId.value === 'default') {
      return true
    }
    return source.projectId === selectedProjectId.value
  })
})

// 获取当前选中的源类型
const currentSourceType = computed(() => {
  return sourceTypes.find(type => type.type === formData.value.type)
})

// 获取知识源图标
const getSourceIcon = (type: string) => {
  switch (type) {
    case 'elasticsearch':
      return markRaw(Database)
    case 'chroma':
    case 'weaviate':
      return markRaw(Cloud)
    case 'local_files':
      return markRaw(HardDrive)
    case 'api':
      return markRaw(Globe)
    default:
      return markRaw(FileText)
  }
}

// 格式化日期
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

// 打开添加对话框
const openAddDialog = () => {
  isEditing.value = false
  formData.value = {
    id: `rag-${Date.now()}`,
    name: '',
    type: 'elasticsearch',
    priority: 5,
    enabled: true,
    projectId: selectedProjectId.value === 'default' ? projects.value[0]?.id || '' : selectedProjectId.value,
    config: {}
  }
  isDialogOpen.value = true
}

// 打开编辑对话框
const openEditDialog = (source: RAGKnowledgeSource) => {
  isEditing.value = true
  formData.value = {
    id: source.id,
    name: source.name,
    type: source.type,
    priority: source.priority || 5,
    enabled: source.enabled || true,
    projectId: source.projectId,
    config: { ...source.config }
  }
  isDialogOpen.value = true
}

// 关闭对话框
const closeDialog = () => {
  isDialogOpen.value = false
  isEditing.value = false
}

// 重置配置
const resetConfig = () => {
  formData.value.config = {}
}

// 保存知识源
const saveSource = () => {
  if (!formData.value.name.trim()) {
    alert('请输入知识源名称')
    return
  }

  const sourceData: RAGKnowledgeSource = {
    id: formData.value.id,
    projectId: formData.value.projectId,
    name: formData.value.name,
    type: formData.value.type as any,
    config: formData.value.config,
    status: 'disconnected',
    enabled: formData.value.enabled,
    priority: formData.value.priority
  }

  if (isEditing.value) {
    updateKnowledgeSource(formData.value.id, sourceData)
  } else {
    addKnowledgeSource(sourceData)
  }

  closeDialog()
}

// 删除知识源
const deleteSource = (id: string) => {
  if (confirm('确定要删除这个知识源吗？')) {
    removeKnowledgeSource(id)
  }
}

// 测试连接
const testConnection = async (sourceId: string) => {
  testingSources.value.add(sourceId)
  try {
    // 模拟测试连接
    await new Promise(resolve => setTimeout(resolve, 1500))
    // 更新知识源状态
    const sourceIndex = knowledgeSources.value.findIndex(s => s.id === sourceId)
    if (sourceIndex !== -1) {
      updateKnowledgeSource(sourceId, { status: 'connected' })
    }
  } catch (error) {
    console.error('连接测试失败:', error)
    const sourceIndex = knowledgeSources.value.findIndex(s => s.id === sourceId)
    if (sourceIndex !== -1) {
      updateKnowledgeSource(sourceId, { status: 'disconnected' })
    }
  } finally {
    testingSources.value.delete(sourceId)
  }
}
</script>