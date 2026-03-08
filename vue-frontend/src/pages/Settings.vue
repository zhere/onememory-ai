<template>
  <div class="flex h-full">
    <!-- 侧边栏导航 -->
    <div class="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <div class="p-4">
        <h1 class="text-lg font-medium text-gray-900 dark:text-white">系统设置</h1>
      </div>
      <nav class="mt-4">
        <button
          v-for="section in settingsSections"
          :key="section.id"
          @click="activeSection = section.id"
          :class="[
            'w-full text-left px-4 py-3 flex items-center space-x-3 transition-colors',
            activeSection === section.id
              ? 'bg-blue-50 dark:bg-blue-900/20 border-r-2 border-blue-500 text-blue-700 dark:text-blue-300'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
          ]"
        >
          <component :is="section.icon" class="h-5 w-5" />
          <div>
            <div class="text-sm font-medium">{{ section.title }}</div>
            <div class="text-xs text-gray-500 dark:text-gray-400">{{ section.description }}</div>
          </div>
        </button>
      </nav>
    </div>

    <!-- 主内容区 -->
    <div class="flex-1 overflow-auto">
      <div class="p-6">
        <div class="max-w-4xl">
          <!-- 常规设置 -->
          <div v-if="activeSection === 'general'" class="space-y-6">
            <div>
              <h2 class="text-lg font-medium text-gray-900 dark:text-white mb-4">系统配置</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">系统名称</label>
                  <input
                    v-model="settings.systemName"
                    type="text"
                    class="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">时区</label>
                  <select
                    v-model="settings.timezone"
                    class="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="Asia/Shanghai">Asia/Shanghai</option>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">America/New_York</option>
                    <option value="Europe/London">Europe/London</option>
                    <option value="Asia/Tokyo">Asia/Tokyo</option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">语言</label>
                  <select
                    v-model="settings.language"
                    class="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="zh-CN">简体中文</option>
                    <option value="en-US">English</option>
                    <option value="ja-JP">日本語</option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">日志级别</label>
                  <select
                    v-model="settings.logLevel"
                    class="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="debug">Debug</option>
                    <option value="info">Info</option>
                    <option value="warn">Warn</option>
                    <option value="error">Error</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div>
              <h2 class="text-lg font-medium text-gray-900 dark:text-white mb-4">请求配置</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">最大并发请求数</label>
                  <input
                    v-model.number="settings.maxConcurrentRequests"
                    type="number"
                    min="1"
                    max="1000"
                    class="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">请求超时 (毫秒)</label>
                  <input
                    v-model.number="settings.requestTimeout"
                    type="number"
                    min="1000"
                    max="60000"
                    class="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- 安全设置 -->
          <div v-if="activeSection === 'security'" class="space-y-6">
            <div>
              <h2 class="text-lg font-medium text-gray-900 dark:text-white mb-4">认证与授权</h2>
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div>
                    <label class="text-sm font-medium text-gray-700 dark:text-gray-300">启用身份验证</label>
                    <p class="text-sm text-gray-500 dark:text-gray-400">要求用户登录才能访问系统</p>
                  </div>
                  <input
                    v-model="settings.enableAuth"
                    type="checkbox"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                
                <div class="flex items-center justify-between">
                  <div>
                    <label class="text-sm font-medium text-gray-700 dark:text-gray-300">启用API密钥</label>
                    <p class="text-sm text-gray-500 dark:text-gray-400">API访问需要密钥验证</p>
                  </div>
                  <input
                    v-model="settings.requireApiKey"
                    type="checkbox"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                
                <div class="flex items-center justify-between">
                  <div>
                    <label class="text-sm font-medium text-gray-700 dark:text-gray-300">启用CORS</label>
                    <p class="text-sm text-gray-500 dark:text-gray-400">允许跨域请求</p>
                  </div>
                  <input
                    v-model="settings.enableCors"
                    type="checkbox"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                
                <div v-if="settings.enableCors" class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">允许的源</label>
                  <input
                    v-model="settings.allowedOrigins"
                    type="text"
                    placeholder="http://localhost:3000,https://example.com"
                    class="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <p class="text-xs text-gray-500 dark:text-gray-400">使用逗号分隔多个源</p>
                </div>
              </div>
            </div>
            
            <div>
              <h2 class="text-lg font-medium text-gray-900 dark:text-white mb-4">安全策略</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">最大登录尝试次数</label>
                  <input
                    v-model.number="settings.maxLoginAttempts"
                    type="number"
                    min="1"
                    max="10"
                    class="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">会话超时 (秒)</label>
                  <input
                    v-model.number="settings.sessionTimeout"
                    type="number"
                    min="300"
                    max="86400"
                    class="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- 通知设置 -->
          <div v-if="activeSection === 'notifications'" class="space-y-6">
            <div>
              <h2 class="text-lg font-medium text-gray-900 dark:text-white mb-4">通知渠道</h2>
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <Mail class="h-5 w-5 text-blue-500" />
                    <div>
                      <label class="text-sm font-medium text-gray-700 dark:text-gray-300">邮件通知</label>
                      <p class="text-sm text-gray-500 dark:text-gray-400">通过邮件接收通知</p>
                    </div>
                  </div>
                  <input
                    v-model="settings.enableEmailNotifications"
                    type="checkbox"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                
                <div v-if="settings.enableEmailNotifications" class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">邮件地址</label>
                  <input
                    v-model="settings.emailAddress"
                    type="email"
                    placeholder="admin@example.com"
                    class="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <Smartphone class="h-5 w-5 text-green-500" />
                    <div>
                      <label class="text-sm font-medium text-gray-700 dark:text-gray-300">短信通知</label>
                      <p class="text-sm text-gray-500 dark:text-gray-400">通过短信接收通知</p>
                    </div>
                  </div>
                  <input
                    v-model="settings.enableSmsNotifications"
                    type="checkbox"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                
                <div v-if="settings.enableSmsNotifications" class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">手机号码</label>
                  <input
                    v-model="settings.phoneNumber"
                    type="tel"
                    placeholder="+86 138 0013 8000"
                    class="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <h2 class="text-lg font-medium text-gray-900 dark:text-white mb-4">通知类型</h2>
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <AlertTriangle class="h-5 w-5 text-yellow-500" />
                    <div>
                      <label class="text-sm font-medium text-gray-700 dark:text-gray-300">错误通知</label>
                      <p class="text-sm text-gray-500 dark:text-gray-400">系统错误和异常通知</p>
                    </div>
                  </div>
                  <input
                    v-model="settings.notifyOnErrors"
                    type="checkbox"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <CheckCircle class="h-5 w-5 text-green-500" />
                    <div>
                      <label class="text-sm font-medium text-gray-700 dark:text-gray-300">高使用率通知</label>
                      <p class="text-sm text-gray-500 dark:text-gray-400">系统资源使用率过高时通知</p>
                    </div>
                  </div>
                  <input
                    v-model="settings.notifyOnHighUsage"
                    type="checkbox"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <Shield class="h-5 w-5 text-red-500" />
                    <div>
                      <label class="text-sm font-medium text-gray-700 dark:text-gray-300">安全事件通知</label>
                      <p class="text-sm text-gray-500 dark:text-gray-400">安全相关事件通知</p>
                    </div>
                  </div>
                  <input
                    v-model="settings.notifyOnSecurityEvents"
                    type="checkbox"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <h2 class="text-lg font-medium text-gray-900 dark:text-white mb-4">测试通知</h2>
              <button
                @click="handleTestNotification"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Bell class="h-4 w-4 mr-2" />
                发送测试通知
              </button>
            </div>
          </div>

          <!-- 外观设置 -->
          <div v-if="activeSection === 'appearance'" class="space-y-6">
            <div>
              <h2 class="text-lg font-medium text-gray-900 dark:text-white mb-4">主题设置</h2>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">主题模式</label>
                  <div class="grid grid-cols-3 gap-3">
                    <button
                      v-for="option in themeOptions"
                      :key="option.value"
                      @click="handleThemeChange(option.value)"
                      :class="[
                        'p-3 rounded-lg border-2 text-center transition-colors',
                        settings.theme === option.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      ]"
                    >
                      <div class="text-2xl mb-1">{{ option.icon }}</div>
                      <div class="text-sm font-medium text-gray-900 dark:text-white">{{ option.label }}</div>
                    </button>
                  </div>
                </div>
                
                <div class="flex items-center justify-between">
                  <div>
                    <label class="text-sm font-medium text-gray-700 dark:text-gray-300">紧凑模式</label>
                    <p class="text-sm text-gray-500 dark:text-gray-400">减少界面元素间距，显示更多内容</p>
                  </div>
                  <input
                    v-model="settings.compactMode"
                    type="checkbox"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                
                <div class="flex items-center justify-between">
                  <div>
                    <label class="text-sm font-medium text-gray-700 dark:text-gray-300">显示动画</label>
                    <p class="text-sm text-gray-500 dark:text-gray-400">启用界面过渡动画效果</p>
                  </div>
                  <input
                    v-model="settings.showAnimations"
                    type="checkbox"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- 数据库设置 -->
          <div v-if="activeSection === 'database'" class="space-y-6">
            <div>
              <h2 class="text-lg font-medium text-gray-900 dark:text-white mb-4">备份设置</h2>
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div>
                    <label class="text-sm font-medium text-gray-700 dark:text-gray-300">启用自动备份</label>
                    <p class="text-sm text-gray-500 dark:text-gray-400">定期自动备份数据库</p>
                  </div>
                  <input
                    v-model="settings.enableBackup"
                    type="checkbox"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                
                <div v-if="settings.enableBackup" class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">备份间隔 (小时)</label>
                    <input
                      v-model.number="settings.backupInterval"
                      type="number"
                      min="1"
                      max="168"
                      class="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">保留天数</label>
                    <input
                      v-model.number="settings.retentionDays"
                      type="number"
                      min="1"
                      max="365"
                      class="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                
                <div class="flex items-center justify-between">
                  <div>
                    <label class="text-sm font-medium text-gray-700 dark:text-gray-300">启用压缩</label>
                    <p class="text-sm text-gray-500 dark:text-gray-400">压缩备份文件以节省空间</p>
                  </div>
                  <input
                    v-model="settings.enableCompression"
                    type="checkbox"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div class="flex justify-end space-x-3">
              <button
                @click="handleReset"
                :disabled="resetStatus === 'resetting'"
                class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw class="mr-2 h-4 w-4" :class="{ 'animate-spin': resetStatus === 'resetting' }" />
                {{ resetStatus === 'resetting' ? '重置中...' : '重置' }}
              </button>
              <button
                @click="handleSave"
                :disabled="saveStatus === 'saving'"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save class="mr-2 h-4 w-4" :class="{ 'animate-spin': saveStatus === 'saving' }" />
                {{ saveStatus === 'saving' ? '保存中...' : saveStatus === 'saved' ? '已保存' : '保存设置' }}
              </button>
            </div>
          </div>

          <!-- 状态提示 -->
          <div v-if="saveStatus === 'saved'" class="mt-4 p-3 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-md">
            设置已成功保存！
          </div>
          <div v-if="saveStatus === 'error'" class="mt-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-md">
            保存失败，请重试
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { 
  Save, 
  RefreshCw, 
  Shield, 
  Bell, 
  Palette, 
  Database, 
  Globe,
  Mail,
  Smartphone,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-vue-next'

// 定义接口
interface SettingsSection {
  id: string;
  title: string;
  icon: any;
  description: string;
}

interface ThemeOption {
  value: string;
  label: string;
  icon: string;
}

// 主题选项
const themeOptions: ThemeOption[] = [
  { value: 'light', label: '浅色', icon: '☀️' },
  { value: 'dark', label: '深色', icon: '🌙' },
  { value: 'system', label: '跟随系统', icon: '💻' }
];

// 设置项配置
const settingsSections: SettingsSection[] = [
  {
    id: 'general',
    title: '常规设置',
    icon: Globe,
    description: '基本系统配置和偏好设置'
  },
  {
    id: 'security',
    title: '安全设置',
    icon: Shield,
    description: '安全策略和访问控制配置'
  },
  {
    id: 'notifications',
    title: '通知设置',
    icon: Bell,
    description: '系统通知和警报配置'
  },
  {
    id: 'appearance',
    title: '外观设置',
    icon: Palette,
    description: '界面主题和显示偏好'
  },
  {
    id: 'database',
    title: '数据库设置',
    icon: Database,
    description: '数据存储和备份配置'
  }
];

// 响应式数据
const activeSection = ref<string>('general');
const settings = reactive({
  // 常规设置
  systemName: "Onememory",
  timezone: "Asia/Shanghai",
  language: "zh-CN",
  logLevel: "info",
  maxConcurrentRequests: 100,
  requestTimeout: 30000,
  
  // 安全设置
  enableAuth: true,
  requireApiKey: true,
  enableRateLimit: true,
  maxLoginAttempts: 5,
  sessionTimeout: 3600,
  enableCors: true,
  allowedOrigins: "http://localhost:3000",
  
  // 通知设置
  enableEmailNotifications: true,
  enableSmsNotifications: false,
  notifyOnErrors: true,
  notifyOnHighUsage: true,
  notifyOnSecurityEvents: true,
  emailAddress: "admin@example.com",
  phoneNumber: "",
  
  // 外观设置
  theme: "system",
  compactMode: false,
  showAnimations: true,
  
  // 数据库设置
  enableBackup: true,
  backupInterval: 24,
  retentionDays: 30,
  enableCompression: true
});

const saveStatus = ref<'idle' | 'saving' | 'saved' | 'error'>('idle');
const resetStatus = ref<'idle' | 'resetting'>('idle');

// 方法实现
const handleSave = async () => {
  saveStatus.value = 'saving';
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log("设置已保存", settings);
    saveStatus.value = 'saved';
    // 3秒后重置状态
    setTimeout(() => {
      saveStatus.value = 'idle';
    }, 3000);
  } catch (error) {
    console.error("保存失败:", error);
    saveStatus.value = 'error';
    setTimeout(() => {
      saveStatus.value = 'idle';
    }, 3000);
  }
};

const handleReset = async () => {
  resetStatus.value = 'resetting';
  try {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    // 重置为默认设置
    Object.assign(settings, {
      systemName: "Onememory",
      timezone: "Asia/Shanghai",
      language: "zh-CN",
      logLevel: "info",
      maxConcurrentRequests: 100,
      requestTimeout: 30000,
      enableAuth: true,
      requireApiKey: true,
      enableRateLimit: true,
      maxLoginAttempts: 5,
      sessionTimeout: 3600,
      enableCors: true,
      allowedOrigins: "http://localhost:3000",
      enableEmailNotifications: true,
      enableSmsNotifications: false,
      notifyOnErrors: true,
      notifyOnHighUsage: true,
      notifyOnSecurityEvents: true,
      emailAddress: "admin@example.com",
      phoneNumber: "",
      theme: "system",
      compactMode: false,
      showAnimations: true,
      enableBackup: true,
      backupInterval: 24,
      retentionDays: 30,
      enableCompression: true
    });
    console.log("设置已重置为默认值");
  } finally {
    resetStatus.value = 'idle';
  }
};

// 主题切换处理
const handleThemeChange = (themeValue: string) => {
  settings.theme = themeValue;
  // 这里可以添加主题切换的实际逻辑，例如调用主题store
  console.log(`主题已切换为: ${themeValue}`);
};

// 测试通知处理
const handleTestNotification = () => {
  // 模拟发送测试通知
  console.log("发送测试通知");
  alert("测试通知已发送，您可以检查通知配置是否正确");
};
</script>