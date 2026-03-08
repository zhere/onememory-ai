<template>
  <header class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
    <div class="flex items-center justify-between px-6 py-4">
      <!-- 左侧：移动端菜单按钮和搜索框 -->
      <div class="flex items-center">
        <button @click="handleMenuToggle" class="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700">
          <Menu class="h-5 w-5" />
        </button>
        <div class="ml-4 md:ml-0 relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search class="h-4 w-4 text-gray-400" />
          </div>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索项目、配置..."
            class="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>

      <div class="flex items-center space-x-4">
        <button
          @click="toggleTheme"
          class="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <Sun v-if="isDark" class="h-5 w-5" />
          <Moon v-else class="h-5 w-5" />
        </button>

                <Popover class="relative">
          <PopoverButton class="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative">
            <Bell class="h-5 w-5" />
            <span class="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-400"></span>
          </PopoverButton>

          <transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="translate-y-1 opacity-0"
            enter-to-class="translate-y-0 opacity-100"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="translate-y-0 opacity-100"
            leave-to-class="translate-y-1 opacity-0"
          >
            <PopoverPanel class="absolute z-10 right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
              <div class="p-4">
                <h3 class="text-lg font-medium text-gray-900 dark:text-white">通知</h3>
              </div>
              <ul class="divide-y divide-gray-200 dark:divide-gray-700">
                <li class="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <p class="text-sm text-gray-800 dark:text-gray-200">项目 "AI客服助手" 已成功部署。</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">5分钟前</p>
                </li>
                <li class="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <p class="text-sm text-gray-800 dark:text-gray-200">您的API密钥即将过期。</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">1小时前</p>
                </li>
              </ul>
              <div class="p-2 text-center">
                <a href="#" class="text-sm text-blue-600 dark:text-blue-400 hover:underline">查看所有通知</a>
              </div>
            </PopoverPanel>
          </transition>
        </Popover>

        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <User class="w-4 h-4 text-white" />
          </div>
          <div class="hidden md:block">
            <div class="text-sm font-medium text-gray-900 dark:text-white">
              管理员
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400">
              admin@supermemory.ai
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Bell, Search, Moon, Sun, Menu, User } from 'lucide-vue-next'
import { useThemeStore } from '@/stores/theme'
import { useSidebarStore } from '@/stores/sidebar'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'

const searchQuery = ref('')
const { isDark, toggleTheme } = useThemeStore()
const { toggleSidebar } = useSidebarStore()

const handleMenuToggle = () => {
  toggleSidebar()
}

const handleNotifications = () => {
  console.log('显示通知')
  alert('功能待实现：显示通知')
}
</script>