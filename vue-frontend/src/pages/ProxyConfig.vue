<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          代理配置
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          配置 Onememory 代理服务器的各项参数
        </p>
      </div>
      <div class="flex items-center space-x-3">
        <button
          @click="handleReset"
          class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
        >
          <RefreshCw class="w-4 h-4 mr-2" />
          重置
        </button>
        <button
          @click="handleSave"
          :disabled="isLoading"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <RefreshCw v-if="isLoading" class="w-4 h-4 mr-2 animate-spin" />
          <Save v-else class="w-4 h-4 mr-2" />
          保存配置
        </button>
      </div>
    </div>

    <!-- 状态指示器 -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
      <div class="flex items-center">
        <CheckCircle v-if="config.enabled" class="h-5 w-5 text-green-500 mr-2" />
        <AlertCircle v-else class="h-5 w-5 text-red-500 mr-2" />
        <span class="text-sm font-medium text-gray-900 dark:text-white">
          代理服务器状态: {{ config.enabled ? "运行中" : "已停用" }}
        </span>
        <span class="ml-4 text-sm text-gray-500 dark:text-gray-400">
          {{ config.host }}:{{ config.port }}
        </span>
      </div>
      <!-- 直接显示配置数据 -->
      <div class="mt-4 text-sm">
        <p>配置数据直接显示:</p>
        <ul>
          <li>启用状态: {{ config.enabled }}</li>
          <li>端口: {{ config.port }}</li>
          <li>主机: {{ config.host }}</li>
          <li>最大连接数: {{ config.maxConnections }}</li>
        </ul>
      </div>
    </div>



    <!-- 标签页 -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg">
      <div class="border-b border-gray-200 dark:border-gray-700">
        <nav class="-mb-px flex space-x-8 px-6">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'py-4 px-1 border-b-2 font-medium text-sm flex items-center',
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
            ]"
          >
            <component :is="tab.icon" class="w-4 h-4 mr-2" />
            {{ tab.name }}
          </button>
        </nav>
      </div>

      <div class="p-6">
        <!-- 基础配置 -->
        <div v-if="activeTab === 'general'" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                启用代理服务
              </label>
              <div class="flex items-center">
                <input
                  type="checkbox"
                  v-model="config.enabled"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span class="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  启用 Onememory 代理服务器
                </span>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                监听端口
              </label>
              <input
                type="number"
                v-model.number="config.port"
                class="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <div class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                值: {{ config.port }}
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                主机地址
              </label>
              <input
                type="text"
                v-model="config.host"
                class="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <div class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                值: {{ config.host }}
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                最大连接数
              </label>
              <input
                type="number"
                v-model.number="config.maxConnections"
                class="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <div class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                值: {{ config.maxConnections }}
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                超时时间 (毫秒)
              </label>
              <input
                type="number"
                v-model.number="config.timeout"
                class="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <div class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                值: {{ config.timeout }}
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                重试次数
              </label>
              <input
                type="number"
                v-model.number="config.retryAttempts"
                class="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <div class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                值: {{ config.retryAttempts }}
              </div>
            </div>
          </div>

          <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">速率限制</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  启用速率限制
                </label>
                <div class="flex items-center">
                  <input
                    type="checkbox"
                    v-model="config.rateLimiting.enabled"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                <div class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  值: {{ config.rateLimiting.enabled }}
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  每分钟请求数
                </label>
                <input
                  type="number"
                  v-model.number="config.rateLimiting.requestsPerMinute"
                  :disabled="!config.rateLimiting.enabled"
                  class="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                />
                <div class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  值: {{ config.rateLimiting.requestsPerMinute }}
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  突发限制
                </label>
                <input
                  type="number"
                  v-model.number="config.rateLimiting.burstLimit"
                  :disabled="!config.rateLimiting.enabled"
                  class="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                />
                <div class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  值: {{ config.rateLimiting.burstLimit }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- LLM 提供商配置 -->
        <div v-if="activeTab === 'providers'" class="space-y-6">
          <template v-for="(settings, provider) in config.llmProviders" :key="provider">
            <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-medium text-gray-900 dark:text-white capitalize">
                  {{ provider }}
                </h3>
                <div class="flex items-center">
                  <input
                    type="checkbox"
                    v-model="settings.enabled"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span class="ml-2 text-sm text-gray-600 dark:text-gray-400">启用</span>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    API Key
                  </label>
                  <input
                    type="password"
                    v-model="settings.apiKey"
                    :disabled="!settings.enabled"
                    placeholder="输入 API Key"
                    class="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                  />
                  <div class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    值: {{ settings.apiKey }}
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    模型
                  </label>
                  <input
                    type="text"
                    v-model="settings.model"
                    :disabled="!settings.enabled"
                    class="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                  />
                  <div class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    值: {{ settings.model }}
                  </div>
                </div>

                <template v-if="provider === 'openai'">
                  <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Base URL
                    </label>
                    <input
                      type="text"
                      v-model="(settings as typeof config.llmProviders.openai).baseUrl"
                      :disabled="!settings.enabled"
                      class="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                    />
                    <div class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    值: {{ provider === 'openai' ? (settings as typeof config.llmProviders.openai).baseUrl : '' }}
                  </div>
                  </div>
                </template>
              </div>
            </div>
          </template>
        </div>

        <!-- 安全设置 -->
        <div v-if="activeTab === 'security'" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                启用身份验证
              </label>
              <div class="flex items-center">
                <input
                  type="checkbox"
                  v-model="config.security.enableAuth"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span class="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  要求身份验证
                </span>
              </div>
              <div class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                值: {{ config.security.enableAuth }}
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                API Key 验证
              </label>
              <div class="flex items-center">
                <input
                  type="checkbox"
                  v-model="config.security.apiKeyRequired"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span class="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  要求 API Key
                </span>
              </div>
              <div class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                值: {{ config.security.apiKeyRequired }}
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              允许的来源 (CORS)
            </label>
            <textarea
              v-model="allowedOriginsText"
              rows="4"
              placeholder="每行一个域名&#10;例如:&#10;http://localhost:3000&#10;https://yourdomain.com"
              class="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            ></textarea>
            <div class="mt-1 text-sm text-gray-500 dark:text-gray-400">
              值: {{ allowedOriginsText }}
            </div>
          </div>
        </div>

        <!-- 记忆配置 -->
        <div v-if="activeTab === 'memory'" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                启用记忆功能
              </label>
              <div class="flex items-center">
                <input
                  type="checkbox"
                  v-model="config.memoryConfig.enabled"
                  class="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span class="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  启用智能记忆管理
                </span>
              </div>
              <div class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                值: {{ config.memoryConfig.enabled }}
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                最大记忆大小 (MB)
              </label>
              <input
                type="number"
                v-model.number="config.memoryConfig.maxMemorySize"
                :disabled="!config.memoryConfig.enabled"
                class="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
              />
              <div class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                值: {{ config.memoryConfig.maxMemorySize }}
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                压缩阈值 (%)
              </label>
              <input
                type="number"
                v-model.number="config.memoryConfig.compressionThreshold"
                :disabled="!config.memoryConfig.enabled"
                min="0"
                max="100"
                class="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
              />
              <div class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                值: {{ config.memoryConfig.compressionThreshold }}
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                保留天数
              </label>
              <input
                type="number"
                v-model.number="config.memoryConfig.retentionDays"
                :disabled="!config.memoryConfig.enabled"
                class="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
              />
              <div class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                值: {{ config.memoryConfig.retentionDays }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { 
  Save, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  Settings,
  Globe,
  Shield,
  Zap
} from 'lucide-vue-next'
import { useToast } from "vue-toastification";

interface ProxyConfig {
  enabled: boolean;
  port: number;
  host: string;
  maxConnections: number;
  timeout: number;
  retryAttempts: number;
  rateLimiting: {
    enabled: boolean;
    requestsPerMinute: number;
    burstLimit: number;
  };
  security: {
    enableAuth: boolean;
    apiKeyRequired: boolean;
    allowedOrigins: string[];
  };
  llmProviders: {
    openai: {
      enabled: boolean;
      apiKey: string;
      baseUrl: string;
      model: string;
    };
    anthropic: {
      enabled: boolean;
      apiKey: string;
      model: string;
    };
    gemini: {
      enabled: boolean;
      apiKey: string;
      model: string;
    };
  };
  memoryConfig: {
    enabled: boolean;
    maxMemorySize: number;
    compressionThreshold: number;
    retentionDays: number;
  };
}

const defaultConfig: ProxyConfig = {
  enabled: true,
  port: 8080,
  host: "localhost",
  maxConnections: 100,
  timeout: 30000,
  retryAttempts: 3,
  rateLimiting: {
    enabled: true,
    requestsPerMinute: 60,
    burstLimit: 10,
  },
  security: {
    enableAuth: true,
    apiKeyRequired: true,
    allowedOrigins: ["http://localhost:3000", "https://yourdomain.com"],
  },
  llmProviders: {
    openai: {
      enabled: true,
      apiKey: "",
      baseUrl: "https://api.openai.com/v1",
      model: "gpt-3.5-turbo",
    },
    anthropic: {
      enabled: false,
      apiKey: "",
      model: "claude-3-sonnet-20240229",
    },
    gemini: {
      enabled: false,
      apiKey: "",
      model: "gemini-pro",
    },
  },
  memoryConfig: {
    enabled: true,
    maxMemorySize: 1000,
    compressionThreshold: 80,
    retentionDays: 30,
  },
};

// 初始化配置数据，创建响应式对象
const config = reactive<ProxyConfig>({ ...defaultConfig });
const isLoading = ref(false);
const activeTab = ref("general");
const toast = useToast();

const tabs = [
  { id: "general", name: "基础配置", icon: Settings },
  { id: "providers", name: "LLM提供商", icon: Globe },
  { id: "security", name: "安全设置", icon: Shield },
  { id: "memory", name: "记忆配置", icon: Zap },
];

const allowedOriginsText = computed({
  get: () => config.security.allowedOrigins.join('\n'),
  set: (value: string) => {
    config.security.allowedOrigins = value.split('\n').filter(origin => origin.trim() !== '');
  }
});

const handleSave = async () => {
  isLoading.value = true;
  try {
    // 模拟保存配置
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success("配置已保存");
  } catch (error) {
    toast.error("保存失败");
  } finally {
    isLoading.value = false;
  }
};

const handleReset = () => {
  Object.assign(config, JSON.parse(JSON.stringify(defaultConfig)));
  toast.info("配置已重置");
};
</script>