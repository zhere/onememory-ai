<template>
  <!-- 移动端遮罩层 -->
  <div v-if="isOpen" class="fixed inset-0 z-40 md:hidden">
    <div class="fixed inset-0 bg-gray-600 bg-opacity-75" @click="closeSidebar" />
    <div class="fixed inset-y-0 left-0 flex max-w-full">
      <div class="w-64">
        <div class="flex flex-col h-full pt-5 bg-white dark:bg-gray-800 overflow-y-auto border-r border-gray-200 dark:border-gray-700">
          <!-- 移动端关闭按钮 -->
          <div class="absolute top-4 right-4 md:hidden">
            <button
              @click.stop="closeSidebar"
              class="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X class="h-6 w-6" />
            </button>
          </div>
          
          <div class="flex items-center flex-shrink-0 px-4">
            <div class="flex items-center">
              <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Brain class="w-5 h-5 text-white" />
              </div>
              <h1 class="ml-3 text-xl font-bold text-gray-900 dark:text-white">
                Onememory
              </h1>
            </div>
          </div>
          <div class="mt-8 flex-grow flex flex-col">
            <nav class="flex-1 px-2 pb-4 space-y-1">
              <template v-for="item in navigationGroups" :key="item.name">
                <div v-if="isGroup(item)">
                  <button
                    @click="toggleGroup(item.name)"
                    class="group flex items-center w-full px-2 py-2 text-sm font-medium rounded-md transition-colors duration-150 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                  >
                    <ChevronDown v-if="expandedGroups.has(item.name)" class="mr-3 flex-shrink-0 h-4 w-4" />
                    <ChevronRight v-else class="mr-3 flex-shrink-0 h-4 w-4" />
                    <Network v-if="item.name === '知识图谱'" class="mr-2 flex-shrink-0 h-5 w-5" />
                    <Search v-else-if="item.name === 'RAG功能'" class="mr-2 flex-shrink-0 h-5 w-5" />
                    <Network v-else class="mr-2 flex-shrink-0 h-5 w-5" />
                    <span class="flex-1 text-left">{{ item.name }}</span>
                    <div v-if="item.name === 'RAG功能'" class="flex space-x-1">
                      <span class="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded-full">
                        {{ knowledgeSources.length }}
                      </span>
                      <span v-if="searchResults.length > 0" class="bg-green-100 text-green-800 text-xs px-1.5 py-0.5 rounded-full">
                        {{ searchResults.length }}
                      </span>
                    </div>
                  </button>
                  <div v-if="expandedGroups.has(item.name)" class="ml-6 mt-1 space-y-1">
                    <RouterLink
                      v-for="subItem in item.items"
                      :key="subItem.name"
                      :to="subItem.href"
                      :class="getNavLinkClasses(subItem.href)"
                      @click="handleNavClick"
                    >
                      <component :is="subItem.icon" class="mr-3 flex-shrink-0 h-4 w-4" />
                      {{ subItem.name }}
                    </RouterLink>
                  </div>
                </div>
                <RouterLink
                  v-else
                  :to="item.href"
                  :class="getNavLinkClasses(item.href)"
                  @click="handleNavClick"
                >
                  <component :is="item.icon" class="mr-3 flex-shrink-0 h-5 w-5" />
                  {{ item.name }}
                </RouterLink>
              </template>
            </nav>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 桌面端侧边栏 - 始终显示 -->
  <div class="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 md:z-30 md:w-64">
    <div class="flex flex-col flex-grow pt-5 bg-white dark:bg-gray-800 overflow-y-auto border-r border-gray-200 dark:border-gray-700 h-full">
      <div class="flex items-center flex-shrink-0 px-4">
        <div class="flex items-center">
          <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Brain class="w-5 h-5 text-white" />
          </div>
          <h1 class="ml-3 text-xl font-bold text-gray-900 dark:text-white">
            Onememory
          </h1>
        </div>
      </div>
      <div class="mt-8 flex-grow flex flex-col">
        <nav class="flex-1 px-2 pb-4 space-y-1">
          <template v-for="item in navigationGroups" :key="item.name">
            <div v-if="isGroup(item)">
              <button
                @click="toggleGroup(item.name)"
                class="group flex items-center w-full px-2 py-2 text-sm font-medium rounded-md transition-colors duration-150 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
              >
                <ChevronDown v-if="expandedGroups.has(item.name)" class="mr-3 flex-shrink-0 h-4 w-4" />
                <ChevronRight v-else class="mr-3 flex-shrink-0 h-4 w-4" />
                <Network v-if="item.name === '知识图谱'" class="mr-2 flex-shrink-0 h-5 w-5" />
                <Search v-else-if="item.name === 'RAG功能'" class="mr-2 flex-shrink-0 h-5 w-5" />
                <Network v-else class="mr-2 flex-shrink-0 h-5 w-5" />
                <span class="flex-1 text-left">{{ item.name }}</span>
                <div v-if="item.name === 'RAG功能'" class="flex space-x-1">
                  <span class="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded-full">
                    {{ knowledgeSources.length }}
                  </span>
                  <span v-if="searchResults.length > 0" class="bg-green-100 text-green-800 text-xs px-1.5 py-0.5 rounded-full">
                    {{ searchResults.length }}
                  </span>
                </div>
              </button>
              <div v-if="expandedGroups.has(item.name)" class="ml-6 mt-1 space-y-1">
                <RouterLink
                  v-for="subItem in item.items"
                  :key="subItem.name"
                  :to="subItem.href"
                  :class="getNavLinkClasses(subItem.href)"
                  @click="handleNavClick"
                >
                  <component :is="subItem.icon" class="mr-3 flex-shrink-0 h-4 w-4" />
                  {{ subItem.name }}
                </RouterLink>
              </div>
            </div>
            <RouterLink
              v-else
              :to="item.href"
              :class="getNavLinkClasses(item.href)"
              @click="handleNavClick"
            >
              <component :is="item.icon" class="mr-3 flex-shrink-0 h-5 w-5" />
              {{ item.name }}
            </RouterLink>
          </template>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps } from 'vue'
import { useRoute } from 'vue-router'
import { 
  LayoutDashboard, 
  FolderOpen, 
  Settings, 
  Database, 
  Scissors, 
  Key, 
  BarChart3, 
  FileText,
  Brain,
  Network,
  Clock,
  GitBranch,
  Merge,
  ChevronDown,
  ChevronRight,
  Search,
  BookOpen,
  X,
  CheckSquare,
  Wrench,
  Activity,
  PlayCircle
} from 'lucide-vue-next'
import { useRAGStore } from '@/stores/rag'
import { useSidebarStore } from '@/stores/sidebar'
import { storeToRefs } from 'pinia'

defineProps<{ isOpen: boolean }>()

interface NavigationItem {
  name: string
  href: string
  icon: any
}

interface NavigationGroup {
  name: string
  items: NavigationItem[]
}

const navigationGroups: (NavigationItem | NavigationGroup)[] = [
  { name: "仪表板", href: "/dashboard", icon: LayoutDashboard },
  { name: "项目管理", href: "/projects", icon: FolderOpen },
  { name: "代理配置", href: "/proxy-config", icon: Settings },
  {
    name: "任务管理",
    items: [
      { name: "任务监控", href: "/task-planning", icon: CheckSquare },
      { name: "工具管理", href: "/tool-management", icon: Wrench },
    ]
  },
  {
    name: "知识图谱",
    items: [
      { name: "图谱总览", href: "/knowledge-graph", icon: Network },
      { name: "时序实体", href: "/temporal-entities", icon: Clock },
      { name: "关系推理", href: "/relation-inference", icon: GitBranch },
      { name: "记忆合成", href: "/memory-synthesis", icon: Merge },
    ]
  },
  {
    name: "RAG功能",
    items: [
      { name: "知识源管理", href: "/rag-knowledge-sources", icon: BookOpen },
      { name: "融合搜索配置", href: "/fusion-search-config", icon: Search },
      { name: "融合搜索结果", href: "/fusion-search-results", icon: Search },
    ]
  },
  { name: "记忆管理", href: "/memory", icon: Brain },
  { name: "分段配置", href: "/segmentation-config", icon: Scissors },
  { name: "Token管理", href: "/token-management", icon: Key },
  { name: "数据分析", href: "/analytics", icon: BarChart3 },
  { name: "API文档", href: "/api-docs", icon: FileText },
  { name: "系统设置", href: "/settings", icon: Database },
]

const expandedGroups = ref<Set<string>>(new Set(["知识图谱", "RAG功能", "任务管理"]))
const route = useRoute()
const ragStore = useRAGStore()
const { knowledgeSources, searchResults } = storeToRefs(ragStore)
const { closeSidebar } = useSidebarStore()

function isGroup(item: NavigationItem | NavigationGroup): item is NavigationGroup {
  return 'items' in item
}

function toggleGroup(groupName: string) {
  if (expandedGroups.value.has(groupName)) {
    expandedGroups.value.delete(groupName)
  } else {
    expandedGroups.value.add(groupName)
  }
}

function getNavLinkClasses(href: string) {
  const isActive = route.path === href
  return [
    'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-150',
    isActive
      ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
  ].join(' ')
}

function handleNavClick() {
  // 在移动端点击导航项时关闭侧边栏
  if (window.innerWidth < 768) {
    closeSidebar()
  }
}
</script>