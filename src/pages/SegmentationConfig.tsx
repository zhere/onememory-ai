import { useState } from "react";
import { Save, RefreshCw, Play, Scissors, FileText, Settings } from "lucide-react";
import { toast } from "sonner";

interface SegmentationConfig {
  enabled: boolean;
  strategy: "semantic" | "fixed" | "adaptive" | "hybrid";
  maxChunkSize: number;
  minChunkSize: number;
  overlapSize: number;
  semanticThreshold: number;
  preserveStructure: boolean;
  splitOnSentences: boolean;
  splitOnParagraphs: boolean;
  customDelimiters: string[];
  languageModel: string;
  embeddingModel: string;
}

const defaultConfig: SegmentationConfig = {
  enabled: true,
  strategy: "semantic",
  maxChunkSize: 1000,
  minChunkSize: 100,
  overlapSize: 50,
  semanticThreshold: 0.7,
  preserveStructure: true,
  splitOnSentences: true,
  splitOnParagraphs: true,
  customDelimiters: ["\\n\\n", "\\n", "。", "！", "？"],
  languageModel: "gpt-3.5-turbo",
  embeddingModel: "text-embedding-ada-002"
};

export default function SegmentationConfig() {
  const [config, setConfig] = useState<SegmentationConfig>(defaultConfig);
  const [isLoading, setIsLoading] = useState(false);
  const [testText, setTestText] = useState("");
  const [testResult, setTestResult] = useState<string[]>([]);
  const [showTest, setShowTest] = useState(false);

  const updateConfig = (key: keyof SegmentationConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("分段配置已保存");
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

  const handleTest = async () => {
    if (!testText.trim()) {
      toast.error("请输入测试文本");
      return;
    }

    setIsLoading(true);
    try {
      // 模拟分段测试
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 简单的分段模拟
      const chunks = testText.split(/[。！？\n\n]/).filter(chunk => chunk.trim().length > 0);
      setTestResult(chunks.map(chunk => chunk.trim()));
      setShowTest(true);
      toast.success("分段测试完成");
    } catch (error) {
      toast.error("测试失败");
    } finally {
      setIsLoading(false);
    }
  };

  const getStrategyDescription = (strategy: string) => {
    switch (strategy) {
      case "semantic":
        return "基于语义相似性进行智能分段，保持内容的逻辑连贯性";
      case "fixed":
        return "按固定字符数进行分段，简单快速但可能破坏语义";
      case "adaptive":
        return "根据内容结构自适应调整分段大小";
      case "hybrid":
        return "结合多种策略，在语义和结构之间找到平衡";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            智能分段配置
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            配置文本智能分段策略和参数
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 配置面板 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 基础设置 */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Settings className="h-5 w-5 text-blue-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                基础设置
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.enabled}
                    onChange={(e) => updateConfig('enabled', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    启用智能分段
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  分段策略
                </label>
                <select
                  value={config.strategy}
                  onChange={(e) => updateConfig('strategy', e.target.value)}
                  disabled={!config.enabled}
                  className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                >
                  <option value="semantic">语义分段</option>
                  <option value="fixed">固定长度</option>
                  <option value="adaptive">自适应</option>
                  <option value="hybrid">混合策略</option>
                </select>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {getStrategyDescription(config.strategy)}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    最大分段长度
                  </label>
                  <input
                    type="number"
                    value={config.maxChunkSize}
                    onChange={(e) => updateConfig('maxChunkSize', parseInt(e.target.value))}
                    disabled={!config.enabled}
                    min="100"
                    max="5000"
                    className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    最小分段长度
                  </label>
                  <input
                    type="number"
                    value={config.minChunkSize}
                    onChange={(e) => updateConfig('minChunkSize', parseInt(e.target.value))}
                    disabled={!config.enabled}
                    min="10"
                    max="1000"
                    className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    重叠长度
                  </label>
                  <input
                    type="number"
                    value={config.overlapSize}
                    onChange={(e) => updateConfig('overlapSize', parseInt(e.target.value))}
                    disabled={!config.enabled}
                    min="0"
                    max="200"
                    className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                  />
                </div>
              </div>

              {config.strategy === "semantic" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    语义相似性阈值 ({config.semanticThreshold})
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.1"
                    value={config.semanticThreshold}
                    onChange={(e) => updateConfig('semanticThreshold', parseFloat(e.target.value))}
                    disabled={!config.enabled}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>低相似性</span>
                    <span>高相似性</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 高级设置 */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Scissors className="h-5 w-5 text-purple-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                高级设置
              </h3>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.preserveStructure}
                      onChange={(e) => updateConfig('preserveStructure', e.target.checked)}
                      disabled={!config.enabled}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      保持文档结构
                    </span>
                  </label>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.splitOnSentences}
                      onChange={(e) => updateConfig('splitOnSentences', e.target.checked)}
                      disabled={!config.enabled}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      按句子分割
                    </span>
                  </label>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.splitOnParagraphs}
                      onChange={(e) => updateConfig('splitOnParagraphs', e.target.checked)}
                      disabled={!config.enabled}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      按段落分割
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  自定义分隔符
                </label>
                <textarea
                  rows={3}
                  value={config.customDelimiters.join('\n')}
                  onChange={(e) => updateConfig('customDelimiters', e.target.value.split('\n').filter(Boolean))}
                  disabled={!config.enabled}
                  placeholder="每行一个分隔符&#10;例如：\\n\\n, 。, ！, ？"
                  className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    语言模型
                  </label>
                  <select
                    value={config.languageModel}
                    onChange={(e) => updateConfig('languageModel', e.target.value)}
                    disabled={!config.enabled}
                    className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                  >
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                    <option value="gpt-4">GPT-4</option>
                    <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                    <option value="gemini-pro">Gemini Pro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    嵌入模型
                  </label>
                  <select
                    value={config.embeddingModel}
                    onChange={(e) => updateConfig('embeddingModel', e.target.value)}
                    disabled={!config.enabled}
                    className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                  >
                    <option value="text-embedding-ada-002">OpenAI Ada-002</option>
                    <option value="text-embedding-3-small">OpenAI Embedding-3-Small</option>
                    <option value="text-embedding-3-large">OpenAI Embedding-3-Large</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 测试面板 */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="flex items-center mb-4">
              <FileText className="h-5 w-5 text-green-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                分段测试
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  测试文本
                </label>
                <textarea
                  rows={8}
                  value={testText}
                  onChange={(e) => setTestText(e.target.value)}
                  placeholder="输入要测试分段的文本..."
                  className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <button
                onClick={handleTest}
                disabled={isLoading || !testText.trim()}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 mr-2" />
                )}
                运行测试
              </button>
            </div>
          </div>

          {/* 测试结果 */}
          {showTest && testResult.length > 0 && (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                分段结果 ({testResult.length} 个分段)
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {testResult.map((chunk, index) => (
                  <div
                    key={index}
                    className="p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-700"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        分段 {index + 1}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {chunk.length} 字符
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {chunk}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}