<template>
  <div class="h-full flex flex-col">
    <!-- 标题和导航 -->
    <div class="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div class="px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <Book class="h-6 w-6 text-blue-600" />
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
              API 文档
            </h1>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-500 dark:text-gray-400">
              API 版本: v1.0
            </span>
            <div class="flex items-center space-x-1">
              <div class="w-2 h-2 bg-green-500 rounded-full"></div>
              <span class="text-sm text-gray-600 dark:text-gray-400">
                服务正常
              </span>
            </div>
          </div>
        </div>
        
        <nav class="mt-4">
          <div class="flex space-x-8">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="[
                'py-2 px-1 border-b-2 font-medium text-sm',
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              ]"
            >
              {{ tab.label }}
            </button>
          </div>
        </nav>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="flex-1 overflow-hidden">
      <!-- 概览 -->
      <div v-if="activeTab === 'overview'" class="p-6 overflow-y-auto h-full">
        <div class="space-y-6">
          <div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Onememory API 文档
            </h2>
            <p class="text-gray-600 dark:text-gray-400 text-lg">
              Onememory提供强大的RESTful API，让您可以轻松集成智能记忆功能到您的应用中。
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <div class="flex items-center mb-4">
                <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <Globe class="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 class="ml-3 text-lg font-medium text-gray-900 dark:text-white">
                  RESTful API
                </h3>
              </div>
              <p class="text-gray-600 dark:text-gray-400">
                标准的REST API设计，支持JSON格式，易于集成和使用。
              </p>
            </div>

            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <div class="flex items-center mb-4">
                <div class="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <Key class="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <h3 class="ml-3 text-lg font-medium text-gray-900 dark:text-white">
                  安全认证
                </h3>
              </div>
              <p class="text-gray-600 dark:text-gray-400">
                基于API密钥的安全认证机制，保护您的数据和服务。
              </p>
            </div>

            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <div class="flex items-center mb-4">
                <div class="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <Code class="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 class="ml-3 text-lg font-medium text-gray-900 dark:text-white">
                  多语言SDK
                </h3>
              </div>
              <p class="text-gray-600 dark:text-gray-400">
                提供多种编程语言的SDK，快速开始您的开发工作。
              </p>
            </div>
          </div>

          <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <div class="flex items-start">
              <Info class="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div class="ml-3">
                <h3 class="text-sm font-medium text-blue-800 dark:text-blue-200">
                  开始使用
                </h3>
                <div class="mt-2 text-sm text-blue-700 dark:text-blue-300">
                  <p>
                    要开始使用Onememory API，您需要：
                  </p>
                  <ul class="mt-2 list-disc list-inside space-y-1">
                    <li>创建一个Onememory账户</li>
                    <li>在控制台中生成API密钥</li>
                    <li>查看快速开始指南</li>
                    <li>尝试您的第一个API调用</li>
                  </ul>
                </div>
                <div class="mt-4">
                  <button
                    @click="activeTab = 'quickstart'"
                    class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 dark:text-blue-200 bg-blue-100 dark:bg-blue-800 hover:bg-blue-200 dark:hover:bg-blue-700"
                  >
                    查看快速开始
                    <ExternalLink class="ml-2 h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
              主要功能
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="flex items-start space-x-3" v-for="feature in features" :key="feature.title">
                <CheckCircle class="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 class="font-medium text-gray-900 dark:text-white">{{ feature.title }}</h4>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    {{ feature.description }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 端点列表 -->
      <div v-else-if="activeTab === 'endpoints'" class="flex h-full">
        <!-- 左侧端点列表 -->
        <div class="w-80 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div class="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">
              API 端点
            </h3>
          </div>
          <div class="overflow-y-auto">
            <button
              v-for="endpoint in apiEndpoints"
              :key="endpoint.id"
              @click="selectedEndpoint = endpoint.id"
              :class="[
                'w-full text-left p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700',
                selectedEndpoint === endpoint.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              ]"
            >
              <div class="flex items-center space-x-2 mb-2">
                <span :class="getMethodColor(endpoint.method)">
                  {{ endpoint.method }}
                </span>
                <code class="text-sm text-gray-600 dark:text-gray-400">
                  {{ endpoint.path }}
                </code>
              </div>
              <div class="text-sm font-medium text-gray-900 dark:text-white">
                {{ endpoint.title }}
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {{ endpoint.description }}
              </div>
            </button>
          </div>
        </div>

        <!-- 右侧端点详情 -->
        <div class="flex-1 overflow-y-auto">
          <div v-if="currentEndpoint" class="p-6">
            <div class="mb-6">
              <div class="flex items-center space-x-3 mb-4">
                <span :class="getMethodColor(currentEndpoint.method)">
                  {{ currentEndpoint.method }}
                </span>
                <code class="text-lg font-mono text-gray-900 dark:text-white">
                  {{ currentEndpoint.path }}
                </code>
              </div>
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {{ currentEndpoint.title }}
              </h2>
              <p class="text-gray-600 dark:text-gray-400">
                {{ currentEndpoint.description }}
              </p>
            </div>

            <!-- 参数 -->
            <div v-if="currentEndpoint.parameters" class="mb-6">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-3">
                请求参数
              </h3>
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead class="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        参数名
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        类型
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        必需
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        描述
                      </th>
                    </tr>
                  </thead>
                  <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    <tr v-for="param in currentEndpoint.parameters" :key="param.name">
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-white">
                        {{ param.name }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {{ param.type }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span v-if="param.required" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          必需
                        </span>
                        <span v-else class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                          可选
                        </span>
                      </td>
                      <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {{ param.description }}
                        <div v-if="param.example" class="mt-1">
                          <code class="text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">
                            示例: {{ param.example }}
                          </code>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- 请求体 -->
            <div v-if="currentEndpoint.requestBody" class="mb-6">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-3">
                请求体
              </h3>
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {{ currentEndpoint.requestBody.description }}
              </p>
              <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                    示例请求体
                  </span>
                  <button
                    @click="copyToClipboard(currentEndpoint.requestBody.example)"
                    class="p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    <Copy class="h-4 w-4" />
                  </button>
                </div>
                <pre class="text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
                  <code>{{ currentEndpoint.requestBody.example }}</code>
                </pre>
              </div>
            </div>

            <!-- 响应 -->
            <div class="mb-6">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-3">
                响应
              </h3>
              <div class="space-y-4">
                <div v-for="response in currentEndpoint.responses" :key="response.status" class="border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div class="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <div class="flex items-center justify-between">
                      <span :class="getStatusColor(response.status)">
                        {{ response.status }} - {{ response.description }}
                      </span>
                      <button
                        @click="copyToClipboard(response.example)"
                        class="p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600"
                      >
                        <Copy class="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div class="p-4">
                    <pre class="text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
                      <code>{{ response.example }}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            <!-- 示例代码 -->
            <div class="mb-6">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-3">
                示例代码
              </h3>
              <div class="bg-gray-900 rounded-lg p-4">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-medium text-gray-300">
                    cURL
                  </span>
                  <button
                    @click="copyToClipboard(currentEndpoint.example.request)"
                    class="p-1 rounded-md text-gray-400 hover:text-gray-300"
                  >
                    <Copy class="h-4 w-4" />
                  </button>
                </div>
                <pre class="text-sm text-green-400 overflow-x-auto">
                  <code>{{ currentEndpoint.example.request }}</code>
                </pre>
              </div>
            </div>

            <!-- API测试 -->
            <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                  API 测试
                </h3>
                <button
                  @click="testEndpoint"
                  class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Play class="mr-2 h-4 w-4" />
                  发送请求
                </button>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <label class="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    v-model="useMock"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span class="text-sm text-gray-700 dark:text-gray-300">使用模拟数据</span>
                </label>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">API Base URL</label>
                  <input
                    type="text"
                    v-model="apiBaseUrl"
                    placeholder="http://localhost:3001"
                    class="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">API Key</label>
                  <input
                    type="text"
                    v-model="apiKey"
                    placeholder="sk-xxxx..."
                    class="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              
              <div v-if="testResponse" class="mt-4">
                <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  响应结果
                </h4>
                <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <pre class="text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
                    <code>{{ testResponse }}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 快速开始 -->
      <div v-else-if="activeTab === 'quickstart'" class="p-6 overflow-y-auto h-full">
        <div class="max-w-4xl">
          <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
            <pre class="text-sm text-gray-800 dark:text-gray-200 overflow-x-auto whitespace-pre-wrap">
              {{ quickStartGuide }}
            </pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  Book, Code, Copy, Play, Globe, Key, CheckCircle, Info, ExternalLink
} from 'lucide-vue-next'

// 定义接口
interface ApiEndpoint {
  id: string;
  method: string;
  path: string;
  title: string;
  description: string;
  parameters?: Parameter[];
  requestBody?: RequestBody;
  responses: Response[];
  example: {
    request: string;
    response: string;
  };
}

interface Parameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
  example?: string;
}

interface RequestBody {
  type: string;
  description: string;
  schema: any;
  example: string;
}

interface Response {
  status: number;
  description: string;
  example: string;
}

interface Feature {
  title: string;
  description: string;
}

interface Tab {
  id: string;
  label: string;
}

// 模拟数据
const apiEndpoints: ApiEndpoint[] = [
  {
    id: "chat-completion",
    method: "POST",
    path: "/api/v1/chat/completions",
    title: "聊天补全",
    description: "发送聊天消息并获取AI回复，支持上下文记忆",
    parameters: [
      {
        name: "Authorization",
        type: "string",
        required: true,
        description: "Bearer token，格式：Bearer sk-xxx",
        example: "Bearer sk-proj-abc123..."
      }
    ],
    requestBody: {
      type: "application/json",
      description: "聊天请求参数",
      schema: {
        type: "object",
        properties: {
          model: { type: "string", description: "模型名称" },
          messages: { type: "array", description: "消息列表" },
          temperature: { type: "number", description: "温度参数" },
          max_tokens: { type: "number", description: "最大token数" },
          stream: { type: "boolean", description: "是否流式返回" }
        }
      },
      example: `{
  "model": "gpt-4",
  "messages": [
    {
      "role": "user",
      "content": "你好，请介绍一下Onememory系统"
    }
  ],
  "temperature": 0.7,
  "max_tokens": 1000,
  "stream": false
}`
    },
    responses: [
      {
        status: 200,
        description: "成功返回AI回复",
        example: `{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "created": 1677652288,
  "model": "gpt-4",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Onememory是一个智能记忆代理系统..."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 20,
    "completion_tokens": 100,
    "total_tokens": 120
  }
}`
      },
      {
        status: 401,
        description: "认证失败",
        example: `{
  "error": {
    "message": "Invalid API key",
    "type": "authentication_error",
    "code": "invalid_api_key"
  }
}`
      }
    ],
    example: {
      request: `curl -X POST "https://api.supermemory.ai/v1/chat/completions" \\n  -H "Authorization: Bearer sk-proj-abc123..." \\n  -H "Content-Type: application/json" \\n  -d '{\n    "model": "gpt-4",\n    "messages": [\n      {\n        "role": "user",\n        "content": "你好"\n      }\n    ]\n  }'`,
      response: `{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "created": 1677652288,
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "你好！我是Onememory AI助手..."
      }
    }
  ]
}`
    }
  },
  {
    id: "memory-search",
    method: "GET",
    path: "/api/v1/memory/search",
    title: "记忆搜索",
    description: "搜索相关的历史记忆内容",
    parameters: [
      {
        name: "q",
        type: "string",
        required: true,
        description: "搜索查询",
        example: "机器学习"
      },
      {
        name: "limit",
        type: "number",
        required: false,
        description: "返回结果数量限制",
        example: "10"
      },
      {
        name: "threshold",
        type: "number",
        required: false,
        description: "相似度阈值",
        example: "0.7"
      }
    ],
    responses: [
      {
        status: 200,
        description: "成功返回搜索结果",
        example: `{
  "memories": [
    {
      "id": "mem_123",
      "content": "机器学习是人工智能的一个分支...",
      "similarity": 0.95,
      "timestamp": "2024-01-15T10:30:00Z",
      "metadata": {
        "source": "conversation",
        "project": "AI学习助手"
      }
    }
  ],
  "total": 1
}`
      }
    ],
    example: {
      request: `curl -X GET "https://api.supermemory.ai/v1/memory/search?q=机器学习&limit=10" \\n  -H "Authorization: Bearer sk-proj-abc123..."`,
      response: `{
  "memories": [
    {
      "id": "mem_123",
      "content": "机器学习是人工智能的一个分支...",
      "similarity": 0.95
    }
  ]
}`
    }
  },
  {
    id: "memory-create",
    method: "POST",
    path: "/api/v1/memory",
    title: "创建记忆",
    description: "手动创建新的记忆条目",
    requestBody: {
      type: "application/json",
      description: "记忆创建参数",
      schema: {
        type: "object",
        properties: {
          content: { type: "string", description: "记忆内容" },
          metadata: { type: "object", description: "元数据" },
          project: { type: "string", description: "关联项目" }
        }
      },
      example: `{
  "content": "用户喜欢使用深度学习解决图像识别问题",
  "metadata": {
    "category": "preference",
    "importance": "high"
  },
  "project": "AI助手"
}`
    },
    responses: [
      {
        status: 201,
        description: "成功创建记忆",
        example: `{
  "id": "mem_456",
  "content": "用户喜欢使用深度学习解决图像识别问题",
  "created_at": "2024-01-16T14:20:00Z",
  "project": "AI助手"
}`
      }
    ],
    example: {
      request: `curl -X POST "https://api.supermemory.ai/v1/memory" \\n  -H "Authorization: Bearer sk-proj-abc123..." \\n  -H "Content-Type: application/json" \\n  -d '{\n    "content": "用户偏好信息",\n    "project": "AI助手"\n  }'`,
      response: `{
  "id": "mem_456",
  "content": "用户偏好信息",
  "created_at": "2024-01-16T14:20:00Z"
}`
    }
  },
  {
    id: "projects-list",
    method: "GET",
    path: "/api/v1/projects",
    title: "项目列表",
    description: "获取所有项目列表",
    parameters: [
      {
        name: "page",
        type: "number",
        required: false,
        description: "页码",
        example: "1"
      },
      {
        name: "limit",
        type: "number",
        required: false,
        description: "每页数量",
        example: "20"
      }
    ],
    responses: [
      {
        status: 200,
        description: "成功返回项目列表",
        example: `{
  "projects": [
    {
      "id": "proj_123",
      "name": "AI客服助手",
      "description": "智能客服系统",
      "status": "active",
      "created_at": "2024-01-10T09:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1
  }
}`
      }
    ],
    example: {
      request: `curl -X GET "https://api.supermemory.ai/v1/projects" \\n  -H "Authorization: Bearer sk-proj-abc123..."`,
      response: `{
  "projects": [
    {
      "id": "proj_123",
      "name": "AI客服助手",
      "status": "active"
    }
  ]
}`
    }
  }
];

const quickStartGuide = `# Onememory API 快速开始

## 1. 获取API密钥

首先，您需要在控制台中创建一个API密钥：

1. 登录Onememory控制台
2. 进入"Token管理"页面
3. 点击"创建Token"
4. 选择适当的权限
5. 复制生成的API密钥

## 2. 基础认证

所有API请求都需要在请求头中包含认证信息：

\`\`\`
Authorization: Bearer YOUR_API_KEY
\`\`\`

## 3. 基础URL

所有API请求的基础URL为：

\`\`\`
https://api.supermemory.ai
\`\`\`

## 4. 第一个API调用

让我们发送一个简单的聊天请求：

\`\`\`bash
curl -X POST "https://api.supermemory.ai/v1/chat/completions" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4",
    "messages": [
      {
        "role": "user",
        "content": "Hello, Onememory!"
      }
    ]
  }'
\`\`\`

## 5. 错误处理

API使用标准HTTP状态码。常见错误：

- \`400\` - 请求参数错误
- \`401\` - 认证失败
- \`403\` - 权限不足
- \`429\` - 请求频率超限
- \`500\` - 服务器内部错误

## 6. 速率限制

API有以下速率限制：

- 免费用户：100请求/分钟
- 付费用户：1000请求/分钟
- 企业用户：自定义限制

## 7. SDK和库

我们提供多种语言的SDK：

- JavaScript/TypeScript
- Python
- Go
- Java

更多信息请查看我们的GitHub仓库。
`;

const features: Feature[] = [
  { title: "智能聊天", description: "支持上下文记忆的AI聊天功能" },
  { title: "记忆管理", description: "创建、搜索和管理记忆内容" },
  { title: "项目管理", description: "组织和管理不同的AI项目" },
  { title: "实时分析", description: "获取使用统计和性能指标" }
];

const tabs: Tab[] = [
  { id: "overview", label: "概览" },
  { id: "endpoints", label: "API端点" },
  { id: "quickstart", label: "快速开始" }
];

// 响应式数据
const activeTab = ref<string>("overview")
const selectedEndpoint = ref<string>(apiEndpoints[0].id)
const useMock = ref<boolean>(true)
const apiBaseUrl = ref<string>("https://api.supermemory.ai")
const apiKey = ref<string>("")
const testResponse = ref<string>("")

// 计算属性
const currentEndpoint = computed(() => {
  return apiEndpoints.find(ep => ep.id === selectedEndpoint.value)
})

// 方法
const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text)
  alert("已复制到剪贴板")
}

const getMethodColor = (method: string) => {
  const methodColorMap: Record<string, string> = {
    GET: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    POST: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    PUT: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    DELETE: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
  }
  return `px-2 py-1 text-xs font-medium rounded ${methodColorMap[method.toUpperCase()] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"}`
}

const getStatusColor = (status: number) => {
  if (status >= 200 && status < 300) {
    return "text-green-600 dark:text-green-400"
  } else if (status >= 400 && status < 500) {
    return "text-yellow-600 dark:text-yellow-400"
  } else if (status >= 500) {
    return "text-red-600 dark:text-red-400"
  }
  return "text-gray-600 dark:text-gray-400"
}

const testEndpoint = async () => {
  if (!currentEndpoint.value) return

  testResponse.value = "正在发送请求..."

  try {
    // 模拟API请求延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 返回模拟响应
    const mockResponses: Record<string, string> = {
      "chat-completion": `{
  "id": "chatcmpl-test-123",
  "object": "chat.completion",
  "created": ${Date.now() / 1000},
  "model": "gpt-4",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "你好！我是Onememory AI助手，很高兴为您服务。"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 20,
    "total_tokens": 30
  }
}`,
      "memory-search": `{
  "memories": [
    {
      "id": "mem_test_123",
      "content": "机器学习是人工智能的一个分支，专注于开发能够从数据中学习的算法。",
      "similarity": 0.95,
      "timestamp": "${new Date().toISOString()}",
      "metadata": {
        "source": "conversation",
        "project": "AI学习助手"
      }
    }
  ],
  "total": 1
}`,
      "memory-create": `{
  "id": "mem_test_456",
  "content": "用户偏好信息",
  "created_at": "${new Date().toISOString()}",
  "project": "AI助手"
}`,
      "projects-list": `{
  "projects": [
    {
      "id": "proj_test_123",
      "name": "AI客服助手",
      "description": "智能客服系统",
      "status": "active",
      "created_at": "${new Date().toISOString()}"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1
  }
}`
    }
    
    testResponse.value = mockResponses[currentEndpoint.value.id] || JSON.stringify({ message: "未支持的端点" }, null, 2)
    alert("请求发送成功")
  } catch (err: any) {
    testResponse.value = `请求失败: ${err?.message || String(err)}`
    alert("请求失败")
  }
}
</script>