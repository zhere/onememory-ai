<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold">测试代理配置数据</h1>
    <div class="mt-4 bg-white shadow rounded-lg p-4">
      <h2 class="text-lg font-medium mb-2">直接访问默认配置</h2>
      <pre>{{ JSON.stringify(defaultConfig, null, 2) }}</pre>
    </div>
    
    <div class="mt-4 bg-white shadow rounded-lg p-4">
      <h2 class="text-lg font-medium mb-2">响应式配置数据</h2>
      <pre>{{ JSON.stringify(config, null, 2) }}</pre>
    </div>
    
    <div class="mt-4 bg-white shadow rounded-lg p-4">
      <h2 class="text-lg font-medium mb-2">配置数据直接显示</h2>
      <ul>
        <li>启用状态: {{ config.enabled }}</li>
        <li>端口: {{ config.port }}</li>
        <li>主机: {{ config.host }}</li>
        <li>最大连接数: {{ config.maxConnections }}</li>
        <li>超时时间: {{ config.timeout }}</li>
        <li>重试次数: {{ config.retryAttempts }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

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

const config = reactive<ProxyConfig>({ ...defaultConfig });
</script>