<template>
  <div class="space-y-6 p-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Token管理
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          管理API访问令牌和权限控制
        </p>
      </div>
      <button
        @click="showCreateModal = true"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <Plus class="w-4 h-4 mr-2" />
        创建Token
      </button>
    </div>

    <!-- 统计信息 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <Key class="h-6 w-6 text-blue-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  总Token数
                </dt>
                <dd class="text-lg font-medium text-gray-900 dark:text-white">
                  {{ tokens.length }}
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
                  活跃Token
                </dt>
                <dd class="text-lg font-medium text-gray-900 dark:text-white">
                  {{ tokens.filter(token => token.isActive).length }}
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
              <AlertTriangle class="h-6 w-6 text-yellow-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  即将过期
                </dt>
                <dd class="text-lg font-medium text-gray-900 dark:text-white">
                  {{ tokens.filter(token => isTokenExpiringSoon(token.expiresAt)).length }}
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
              <Shield class="h-6 w-6 text-purple-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  总使用次数
                </dt>
                <dd class="text-lg font-medium text-gray-900 dark:text-white">
                  {{ tokens.reduce((sum, token) => sum + token.usageCount, 0).toLocaleString() }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Token列表 -->
    <div class="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
      <ul class="divide-y divide-gray-200 dark:divide-gray-700">
        <li v-for="token in tokens" :key="token.id">
          <div class="px-4 py-4 sm:px-6">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4">
                <div :class="`w-3 h-3 rounded-full ${!token.isActive ? 'bg-gray-400' : isTokenExpired(token.expiresAt) ? 'bg-red-500' : isTokenExpiringSoon(token.expiresAt) ? 'bg-yellow-500' : 'bg-green-500'}`" />
                <div>
                  <div class="flex items-center space-x-2">
                    <p class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ token.name }}
                    </p>
                    <span v-if="isTokenExpired(token.expiresAt)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                      已过期
                    </span>
                    <span v-else-if="isTokenExpiringSoon(token.expiresAt)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                      即将过期
                    </span>
                  </div>
                  <div class="mt-1 flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                    <div class="flex items-center">
                      <Calendar class="w-3 h-3 mr-1" />
                      创建于 {{ formatDate(token.createdAt) }}
                    </div>
                    <div class="flex items-center">
                      <Activity class="w-3 h-3 mr-1" />
                      {{ token.lastUsed === '从未使用' ? '从未使用' : `最后使用 ${formatDate(token.lastUsed)}` }}
                    </div>
                    <div>
                      项目: {{ token.project }}
                    </div>
                  </div>
                </div>
              </div>

              <div class="flex items-center space-x-2">
                <div class="text-right">
                  <div class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ token.usageCount.toLocaleString() }} 次使用
                  </div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    限制: {{ token.rateLimit }}/分钟
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-3">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <span class="text-sm text-gray-500 dark:text-gray-400">Token:</span>
                  <code class="text-sm font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {{ visibleTokens.has(token.id) ? token.token : maskToken(token.token) }}
                  </code>
                  <button
                    @click="toggleTokenVisibility(token.id)"
                    class="p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    <component :is="visibleTokens.has(token.id) ? EyeOff : Eye" class="w-4 h-4" />
                  </button>
                  <button
                    @click="copyToClipboard(token.token)"
                    class="p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    <Copy class="w-4 h-4" />
                  </button>
                </div>

                <div class="flex items-center space-x-2">
                  <button
                    @click="handleToggleToken(token.id)"
                    :class="`px-3 py-1 text-xs font-medium rounded-md ${token.isActive ? 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800' : 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800'}`"
                  >
                    {{ token.isActive ? '禁用' : '启用' }}
                  </button>
                  <button class="p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600">
                    <Edit class="w-4 h-4" />
                  </button>
                  <button
                    @click="handleDeleteToken(token.id)"
                    class="p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div class="mt-2 flex items-center space-x-1">
                <span class="text-sm text-gray-500 dark:text-gray-400">权限:</span>
                <span
                  v-for="permission in token.permissions"
                  :key="permission"
                  :class="`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPermissionColor(permission)}`"
                >
                  {{ getPermissionText(permission) }}
                </span>
              </div>

              <div v-if="token.expiresAt" class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                过期时间: {{ formatDate(token.expiresAt) }}
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>

    <!-- 创建Token模态框 -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
            创建新Token
          </h3>
          <form @submit.prevent="handleCreateToken" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Token名称
              </label>
              <input
                type="text"
                v-model="newToken.name"
                class="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="输入Token名称"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                权限
              </label>
              <div class="space-y-2">
                <div v-for="permission in permissions" :key="permission.id" class="flex items-start">
                  <input
                    type="checkbox"
                    :checked="newToken.permissions.includes(permission.id)"
                    @change="(e) => updatePermissions(permission.id, (e.target as HTMLInputElement).checked)"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5"
                  />
                  <div class="ml-2">
                    <span class="text-sm text-gray-900 dark:text-white">
                      {{ permission.name }}
                    </span>
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                      {{ permission.description }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                关联项目
              </label>
              <select
                v-model="newToken.project"
                class="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">选择项目</option>
                <option v-for="project in projects" :key="project" :value="project">
                  {{ project }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                速率限制 (请求/分钟)
              </label>
              <input
                type="number"
                v-model.number="newToken.rateLimit"
                min="1"
                max="10000"
                class="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                过期时间 (可选)
              </label>
              <input
                type="datetime-local"
                v-model="newToken.expiresAt"
                class="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div class="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                @click="showCreateModal = false"
                class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-md"
              >
                取消
              </button>
              <button
                type="submit"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
              >
                创建Token
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Plus,
  Key,
  Copy,
  Eye,
  EyeOff,
  Trash2,
  Edit,
  Calendar,
  Activity,
  Shield,
  AlertTriangle
} from 'lucide-vue-next'

interface ApiToken {
  id: string
  name: string
  token: string
  permissions: string[]
  createdAt: string
  lastUsed: string
  expiresAt: string | null
  isActive: boolean
  usageCount: number
  rateLimit: number
  project: string
}

const mockTokens: ApiToken[] = [
  {
    id: "1",
    name: "生产环境主Token",
    token: "sk-proj-abc123def456ghi789jkl012mno345pqr678stu901vwx234yz",
    permissions: ["read", "write", "admin"],
    createdAt: "2024-01-15T10:30:00Z",
    lastUsed: "2024-01-16T14:20:00Z",
    expiresAt: "2024-12-31T23:59:59Z",
    isActive: true,
    usageCount: 1250,
    rateLimit: 1000,
    project: "AI客服助手"
  },
  {
    id: "2",
    name: "开发环境Token",
    token: "sk-dev-xyz789abc123def456ghi789jkl012mno345pqr678stu",
    permissions: ["read", "write"],
    createdAt: "2024-01-10T09:15:00Z",
    lastUsed: "2024-01-16T11:45:00Z",
    expiresAt: null,
    isActive: true,
    usageCount: 450,
    rateLimit: 500,
    project: "内容生成器"
  },
  {
    id: "3",
    name: "只读Token",
    token: "sk-readonly-mno345pqr678stu901vwx234yz567abc123def456",
    permissions: ["read"],
    createdAt: "2024-01-05T16:45:00Z",
    lastUsed: "2024-01-14T13:30:00Z",
    expiresAt: "2024-06-30T23:59:59Z",
    isActive: false,
    usageCount: 89,
    rateLimit: 100,
    project: "数据分析平台"
  }
]

const tokens = ref<ApiToken[]>(mockTokens)
const showCreateModal = ref(false)
const visibleTokens = ref(new Set<string>())

const newToken = ref({
  name: "",
  permissions: [] as string[],
  expiresAt: "",
  rateLimit: 1000,
  project: ""
})

const permissions = [
  { id: "read", name: "读取", description: "查看数据和配置" },
  { id: "write", name: "写入", description: "创建和修改数据" },
  { id: "admin", name: "管理", description: "完全管理权限" }
]

const projects = computed(() => Array.from(new Set(tokens.value.map(t => t.project))))

const toggleTokenVisibility = (tokenId: string) => {
  visibleTokens.value = new Set(visibleTokens.value)
  if (visibleTokens.value.has(tokenId)) {
    visibleTokens.value.delete(tokenId)
  } else {
    visibleTokens.value.add(tokenId)
  }
}

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text)
  // 使用alert代替toast，因为Vue项目中可能没有toast库
  alert("Token已复制到剪贴板")
}

const maskToken = (token: string) => {
  if (token.length <= 8) return token
  return token.substring(0, 8) + "..." + token.substring(token.length - 8)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

const getPermissionColor = (permission: string) => {
  switch (permission) {
    case "read":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    case "write":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
    case "admin":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
  }
}

const getPermissionText = (permission: string) => {
  const perm = permissions.find(p => p.id === permission)
  return perm ? perm.name : permission
}

const isTokenExpired = (expiresAt: string | null) => {
  if (!expiresAt) return false
  return new Date(expiresAt) < new Date()
}

const isTokenExpiringSoon = (expiresAt: string | null) => {
  if (!expiresAt) return false
  const expiry = new Date(expiresAt)
  const now = new Date()
  const daysUntilExpiry = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  return daysUntilExpiry <= 30 && daysUntilExpiry > 0
}

const updatePermissions = (permissionId: string, isChecked: boolean) => {
  if (isChecked) {
    newToken.value.permissions = [...newToken.value.permissions, permissionId]
  } else {
    newToken.value.permissions = newToken.value.permissions.filter(p => p !== permissionId)
  }
}

const handleCreateToken = () => {
  if (!newToken.value.name.trim()) {
    alert("请输入Token名称")
    return
  }
  if (newToken.value.permissions.length === 0) {
    alert("请选择至少一个权限")
    return
  }

  const token: ApiToken = {
    id: Date.now().toString(),
    name: newToken.value.name,
    token: `sk-proj-${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
    permissions: newToken.value.permissions,
    createdAt: new Date().toISOString(),
    lastUsed: "从未使用",
    expiresAt: newToken.value.expiresAt || null,
    isActive: true,
    usageCount: 0,
    rateLimit: newToken.value.rateLimit,
    project: newToken.value.project || "未分配"
  }

  tokens.value = [token, ...tokens.value]
  newToken.value = {
    name: "",
    permissions: [],
    expiresAt: "",
    rateLimit: 1000,
    project: ""
  }
  showCreateModal.value = false
  alert("Token创建成功")
}

const handleDeleteToken = (tokenId: string) => {
  tokens.value = tokens.value.filter(t => t.id !== tokenId)
  alert("Token已删除")
}

const handleToggleToken = (tokenId: string) => {
  tokens.value = tokens.value.map(t => 
    t.id === tokenId ? { ...t, isActive: !t.isActive } : t
  )
  const token = tokens.value.find(t => t.id === tokenId)
  alert(`Token已${token?.isActive ? '禁用' : '启用'}`)
}
</script>