import { useState } from "react";
import { 
  Code, 
  Copy, 
  Play, 
  Book, 
  Key, 
  Globe,
  CheckCircle,
  AlertCircle,
  Info,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import { getApiClient, getApiConfig, setApiConfig } from "@/lib/api";

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
      request: `curl -X POST "https://api.supermemory.ai/v1/chat/completions" \\
  -H "Authorization: Bearer sk-proj-abc123..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-4",
    "messages": [
      {
        "role": "user",
        "content": "你好"
      }
    ]
  }'`,
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
      request: `curl -X GET "https://api.supermemory.ai/v1/memory/search?q=机器学习&limit=10" \\
  -H "Authorization: Bearer sk-proj-abc123..."`,
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
      request: `curl -X POST "https://api.supermemory.ai/v1/memory" \\
  -H "Authorization: Bearer sk-proj-abc123..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "content": "用户偏好信息",
    "project": "AI助手"
  }'`,
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
      request: `curl -X GET "https://api.supermemory.ai/v1/projects" \\
  -H "Authorization: Bearer sk-proj-abc123..."`,
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
curl -X POST "https://api.supermemory.ai/v1/chat/completions" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
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

export default function ApiDocs() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>(apiEndpoints[0].id);
  const [activeTab, setActiveTab] = useState<"overview" | "endpoints" | "quickstart">("overview");
  const [testRequest, setTestRequest] = useState("");
  const [testResponse, setTestResponse] = useState("");
  const [useMock, setUseMock] = useState<boolean>(getApiConfig().useMock);
  const [apiBaseUrl, setApiBaseUrl] = useState<string>(getApiConfig().baseUrl);
  const [apiKey, setApiKey] = useState<string>(getApiConfig().apiKey);

  const currentEndpoint = apiEndpoints.find(ep => ep.id === selectedEndpoint);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("已复制到剪贴板");
  };

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case "GET":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "POST":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "PUT":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "DELETE":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) {
      return "text-green-600 dark:text-green-400";
    } else if (status >= 400 && status < 500) {
      return "text-yellow-600 dark:text-yellow-400";
    } else if (status >= 500) {
      return "text-red-600 dark:text-red-400";
    }
    return "text-gray-600 dark:text-gray-400";
  };

  const testEndpoint = async () => {
    if (!currentEndpoint) return;

    setTestResponse("正在发送请求...");

    try {
      const client = getApiClient();
      let result: any;

      switch (currentEndpoint.id) {
        case "chat-completion": {
          const body = {
            model: "gpt-4",
            messages: [{ role: "user", content: "你好" }],
            temperature: 0.7,
            max_tokens: 1000,
            stream: false,
          };
          result = await client.chatCompletions(body);
          break;
        }
        case "memory-search": {
          result = await client.memorySearch({ q: "机器学习", limit: 10 });
          break;
        }
        case "memory-create": {
          result = await client.memoryCreate({ content: "用户偏好信息", project: "AI助手" });
          break;
        }
        case "projects-list": {
          result = await client.projectsList({ page: 1, limit: 20 });
          break;
        }
        default: {
          result = { message: "未支持的端点" };
        }
      }

      setTestResponse(JSON.stringify(result, null, 2));
      toast.success("请求发送成功");
    } catch (err: any) {
      setTestResponse(`请求失败: ${err?.message || String(err)}`);
      toast.error("请求失败");
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Onememory API 文档
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Onememory提供强大的RESTful API，让您可以轻松集成智能记忆功能到您的应用中。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="ml-3 text-lg font-medium text-gray-900 dark:text-white">
              RESTful API
            </h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            标准的REST API设计，支持JSON格式，易于集成和使用。
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <Key className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="ml-3 text-lg font-medium text-gray-900 dark:text-white">
              安全认证
            </h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            基于API密钥的安全认证机制，保护您的数据和服务。
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <Code className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="ml-3 text-lg font-medium text-gray-900 dark:text-white">
              多语言SDK
            </h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            提供多种编程语言的SDK，快速开始您的开发工作。
          </p>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <div className="flex items-start">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
              开始使用
            </h3>
            <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
              <p>
                要开始使用Onememory API，您需要：
              </p>
              <ul className="mt-2 list-disc list-inside space-y-1">
                <li>创建一个Onememory账户</li>
                <li>在控制台中生成API密钥</li>
                <li>查看快速开始指南</li>
                <li>尝试您的第一个API调用</li>
              </ul>
            </div>
            <div className="mt-4">
              <button
                onClick={() => setActiveTab("quickstart")}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 dark:text-blue-200 bg-blue-100 dark:bg-blue-800 hover:bg-blue-200 dark:hover:bg-blue-700"
              >
                查看快速开始
                <ExternalLink className="ml-2 w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          主要功能
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">智能聊天</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                支持上下文记忆的AI聊天功能
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">记忆管理</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                创建、搜索和管理记忆内容
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">项目管理</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                组织和管理不同的AI项目
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">实时分析</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                获取使用统计和性能指标
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEndpoints = () => (
    <div className="flex h-full">
      {/* 端点列表 */}
      <div className="w-80 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            API 端点
          </h3>
        </div>
        <div className="overflow-y-auto">
          {apiEndpoints.map((endpoint) => (
            <button
              key={endpoint.id}
              onClick={() => setSelectedEndpoint(endpoint.id)}
              className={`w-full text-left p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                selectedEndpoint === endpoint.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
            >
              <div className="flex items-center space-x-2 mb-2">
                <span className={`px-2 py-1 text-xs font-medium rounded ${getMethodColor(endpoint.method)}`}>
                  {endpoint.method}
                </span>
                <code className="text-sm text-gray-600 dark:text-gray-400">
                  {endpoint.path}
                </code>
              </div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {endpoint.title}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {endpoint.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 端点详情 */}
      <div className="flex-1 overflow-y-auto">
        {currentEndpoint && (
          <div className="p-6">
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-4">
                <span className={`px-3 py-1 text-sm font-medium rounded ${getMethodColor(currentEndpoint.method)}`}>
                  {currentEndpoint.method}
                </span>
                <code className="text-lg font-mono text-gray-900 dark:text-white">
                  {currentEndpoint.path}
                </code>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {currentEndpoint.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {currentEndpoint.description}
              </p>
            </div>

            {/* 参数 */}
            {currentEndpoint.parameters && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  请求参数
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          参数名
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          类型
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          必需
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          描述
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      {currentEndpoint.parameters.map((param) => (
                        <tr key={param.name}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-white">
                            {param.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {param.type}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {param.required ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                必需
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                                可选
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {param.description}
                            {param.example && (
                              <div className="mt-1">
                                <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">
                                  示例: {param.example}
                                </code>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 请求体 */}
            {currentEndpoint.requestBody && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  请求体
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {currentEndpoint.requestBody.description}
                </p>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      示例请求体
                    </span>
                    <button
                      onClick={() => copyToClipboard(currentEndpoint.requestBody!.example)}
                      className="p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <pre className="text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
                    <code>{currentEndpoint.requestBody.example}</code>
                  </pre>
                </div>
              </div>
            )}

            {/* 响应 */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                响应
              </h3>
              <div className="space-y-4">
                {currentEndpoint.responses.map((response) => (
                  <div key={response.status} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-medium ${getStatusColor(response.status)}`}>
                          {response.status} - {response.description}
                        </span>
                        <button
                          onClick={() => copyToClipboard(response.example)}
                          className="p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      <pre className="text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
                        <code>{response.example}</code>
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 示例代码 */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                示例代码
              </h3>
              <div className="bg-gray-900 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-300">
                    cURL
                  </span>
                  <button
                    onClick={() => copyToClipboard(currentEndpoint.example.request)}
                    className="p-1 rounded-md text-gray-400 hover:text-gray-300"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <pre className="text-sm text-green-400 overflow-x-auto">
                  <code>{currentEndpoint.example.request}</code>
                </pre>
              </div>
            </div>

            {/* API测试 */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  API 测试
                </h3>
                <button
                  onClick={testEndpoint}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Play className="w-4 h-4 mr-2" />
                  发送请求
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={useMock}
                    onChange={(e) => {
                      setUseMock(e.target.checked);
                      setApiConfig({ useMock: e.target.checked });
                      toast.success(e.target.checked ? "已切换为Mock模式" : "已切换为真实请求模式");
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">使用模拟数据</span>
                </label>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">API Base URL</label>
                  <input
                    type="text"
                    value={apiBaseUrl}
                    onChange={(e) => setApiBaseUrl(e.target.value)}
                    onBlur={() => { setApiConfig({ baseUrl: apiBaseUrl }); toast.success("已保存Base URL"); }}
                    placeholder="http://localhost:3001"
                    className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">API Key</label>
                  <input
                    type="text"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    onBlur={() => { setApiConfig({ apiKey }); toast.success("已保存API Key"); }}
                    placeholder="sk-xxxx..."
                    className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              
              {testResponse && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    响应结果
                  </h4>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <pre className="text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
                      <code>{testResponse}</code>
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderQuickStart = () => (
    <div className="max-w-4xl">
      <div className="prose dark:prose-invert max-w-none">
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
          <pre className="text-sm text-gray-800 dark:text-gray-200 overflow-x-auto whitespace-pre-wrap">
            {quickStartGuide}
          </pre>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      {/* 标题和导航 */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Book className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                API 文档
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                API 版本: v1.0
              </span>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  服务正常
                </span>
              </div>
            </div>
          </div>
          
          <nav className="mt-4">
            <div className="flex space-x-8">
              {[
                { id: "overview", label: "概览" },
                { id: "endpoints", label: "API端点" },
                { id: "quickstart", label: "快速开始" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </nav>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "overview" && (
          <div className="p-6 overflow-y-auto h-full">
            {renderOverview()}
          </div>
        )}
        {activeTab === "endpoints" && renderEndpoints()}
        {activeTab === "quickstart" && (
          <div className="p-6 overflow-y-auto h-full">
            {renderQuickStart()}
          </div>
        )}
      </div>
    </div>
  );
}