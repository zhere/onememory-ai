import { useState } from "react";
import { 
  Save, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  Settings,
  Globe,
  Shield,
  Zap
} from "lucide-react";
import { toast } from "sonner";

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

export default function ProxyConfig() {
  const [config, setConfig] = useState<ProxyConfig>(defaultConfig);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // 模拟保存配置
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("配置已保存");
    } catch (error) {
      toast.error("保存失败");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setConfig(defaultConfig);
    toast.info("配置已重置");
  };

  const updateConfig = (path: string, value: any) => {
    setConfig(prev => {
      const newConfig = { ...prev };
      const keys = path.split('.');
      let current: any = newConfig;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newConfig;
    });
  };

  const tabs = [
    { id: "general", name: "基础配置", icon: Settings },
    { id: "providers", name: "LLM提供商", icon: Globe },
    { id: "security", name: "安全设置", icon: Shield },
    { id: "memory", name: "记忆配置", icon: Zap },
  ];

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            代理配置
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            配置 Onememory 代理服务器的各项参数
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleReset}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            重置
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            保存配置
          </button>
        </div>
      </div>

      {/* 状态指示器 */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
        <div className="flex items-center">
          {config.enabled ? (
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          )}
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            代理服务器状态: {config.enabled ? "运行中" : "已停用"}
          </span>
          <span className="ml-4 text-sm text-gray-500 dark:text-gray-400">
            {config.host}:{config.port}
          </span>
        </div>
      </div>

      {/* 标签页 */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300"
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* 基础配置 */}
          {activeTab === "general" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    启用代理服务
                  </label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.enabled}
                      onChange={(e) => updateConfig('enabled', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                      启用 Onememory 代理服务器
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    监听端口
                  </label>
                  <input
                    type="number"
                    value={config.port}
                    onChange={(e) => updateConfig('port', parseInt(e.target.value))}
                    className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    主机地址
                  </label>
                  <input
                    type="text"
                    value={config.host}
                    onChange={(e) => updateConfig('host', e.target.value)}
                    className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    最大连接数
                  </label>
                  <input
                    type="number"
                    value={config.maxConnections}
                    onChange={(e) => updateConfig('maxConnections', parseInt(e.target.value))}
                    className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    超时时间 (毫秒)
                  </label>
                  <input
                    type="number"
                    value={config.timeout}
                    onChange={(e) => updateConfig('timeout', parseInt(e.target.value))}
                    className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    重试次数
                  </label>
                  <input
                    type="number"
                    value={config.retryAttempts}
                    onChange={(e) => updateConfig('retryAttempts', parseInt(e.target.value))}
                    className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* 速率限制 */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  速率限制
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      启用速率限制
                    </label>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.rateLimiting.enabled}
                        onChange={(e) => updateConfig('rateLimiting.enabled', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      每分钟请求数
                    </label>
                    <input
                      type="number"
                      value={config.rateLimiting.requestsPerMinute}
                      onChange={(e) => updateConfig('rateLimiting.requestsPerMinute', parseInt(e.target.value))}
                      disabled={!config.rateLimiting.enabled}
                      className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      突发限制
                    </label>
                    <input
                      type="number"
                      value={config.rateLimiting.burstLimit}
                      onChange={(e) => updateConfig('rateLimiting.burstLimit', parseInt(e.target.value))}
                      disabled={!config.rateLimiting.enabled}
                      className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* LLM提供商配置 */}
          {activeTab === "providers" && (
            <div className="space-y-6">
              {Object.entries(config.llmProviders).map(([provider, settings]) => (
                <div key={provider} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white capitalize">
                      {provider}
                    </h3>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.enabled}
                        onChange={(e) => updateConfig(`llmProviders.${provider}.enabled`, e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">启用</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        API Key
                      </label>
                      <input
                        type="password"
                        value={settings.apiKey}
                        onChange={(e) => updateConfig(`llmProviders.${provider}.apiKey`, e.target.value)}
                        disabled={!settings.enabled}
                        placeholder="输入 API Key"
                        className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        模型
                      </label>
                      <input
                        type="text"
                        value={settings.model}
                        onChange={(e) => updateConfig(`llmProviders.${provider}.model`, e.target.value)}
                        disabled={!settings.enabled}
                        className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                      />
                    </div>

                    {provider === 'openai' && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Base URL
                        </label>
                        <input
                          type="text"
                          value={(settings as any).baseUrl}
                          onChange={(e) => updateConfig(`llmProviders.${provider}.baseUrl`, e.target.value)}
                          disabled={!settings.enabled}
                          className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 安全设置 */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    启用身份验证
                  </label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.security.enableAuth}
                      onChange={(e) => updateConfig('security.enableAuth', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                      要求身份验证
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    API Key 验证
                  </label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.security.apiKeyRequired}
                      onChange={(e) => updateConfig('security.apiKeyRequired', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                      要求 API Key
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  允许的来源 (CORS)
                </label>
                <textarea
                  rows={4}
                  value={config.security.allowedOrigins.join('\n')}
                  onChange={(e) => updateConfig('security.allowedOrigins', e.target.value.split('\n').filter(Boolean))}
                  placeholder="每行一个域名&#10;例如:&#10;http://localhost:3000&#10;https://yourdomain.com"
                  className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* 记忆配置 */}
          {activeTab === "memory" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    启用记忆功能
                  </label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.memoryConfig.enabled}
                      onChange={(e) => updateConfig('memoryConfig.enabled', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                      启用智能记忆管理
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    最大记忆大小 (MB)
                  </label>
                  <input
                    type="number"
                    value={config.memoryConfig.maxMemorySize}
                    onChange={(e) => updateConfig('memoryConfig.maxMemorySize', parseInt(e.target.value))}
                    disabled={!config.memoryConfig.enabled}
                    className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    压缩阈值 (%)
                  </label>
                  <input
                    type="number"
                    value={config.memoryConfig.compressionThreshold}
                    onChange={(e) => updateConfig('memoryConfig.compressionThreshold', parseInt(e.target.value))}
                    disabled={!config.memoryConfig.enabled}
                    min="0"
                    max="100"
                    className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    保留天数
                  </label>
                  <input
                    type="number"
                    value={config.memoryConfig.retentionDays}
                    onChange={(e) => updateConfig('memoryConfig.retentionDays', parseInt(e.target.value))}
                    disabled={!config.memoryConfig.enabled}
                    className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}