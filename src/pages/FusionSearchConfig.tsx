import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Settings, 
  Database, 
  Brain,
  Filter,
  BarChart3,
  Clock,
  Zap,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface FusionStrategy {
  memoryWeight: number;
  ragWeight: number;
  timeDecay: number;
  relevanceBoost: number;
  maxResults: number;
  threshold: number;
}

interface KnowledgeSource {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
}

interface SearchResult {
  id: string;
  type: 'memory' | 'knowledge';
  content: string;
  score: number;
  source: string;
  metadata: {
    originalScore: number;
    fusionWeight: number;
    timestamp: Date;
    confidence: number;
  };
}

export default function FusionSearchConfig() {
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [strategy, setStrategy] = useState<FusionStrategy>({
    memoryWeight: 0.7,
    ragWeight: 0.3,
    timeDecay: 0.1,
    relevanceBoost: 0.2,
    maxResults: 10,
    threshold: 0.7
  });
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [projectId, setProjectId] = useState('default');

  // 获取可用知识源
  const fetchSources = async () => {
    try {
      const response = await fetch('/api/v1/rag-knowledge/sources', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setSources(data.data.filter((source: KnowledgeSource) => source.enabled));
      }
    } catch (error) {
      toast.error('获取知识源失败');
    }
  };

  useEffect(() => {
    fetchSources();
  }, []);

  // 执行融合搜索
  const performSearch = async () => {
    if (!query.trim()) {
      toast.error('请输入搜索查询');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/v1/rag-knowledge/search', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query,
          projectId,
          sources: selectedSources,
          limit: strategy.maxResults,
          threshold: strategy.threshold,
          fusionStrategy: {
            memoryWeight: strategy.memoryWeight,
            ragWeight: strategy.ragWeight,
            timeDecay: strategy.timeDecay,
            relevanceBoost: strategy.relevanceBoost
          },
          includeMetadata: true
        })
      });

      const data = await response.json();
      if (data.success) {
        setSearchResults(data.data.fusedResults || []);
        toast.success(`找到 ${data.data.fusedResults?.length || 0} 个结果`);
      } else {
        toast.error(data.error || '搜索失败');
      }
    } catch (error) {
      toast.error('搜索失败');
    } finally {
      setLoading(false);
    }
  };

  // 快速预设策略
  const applyPreset = (preset: string) => {
    switch (preset) {
      case 'balanced':
        setStrategy(prev => ({ ...prev, memoryWeight: 0.6, ragWeight: 0.4 }));
        break;
      case 'memory-focused':
        setStrategy(prev => ({ ...prev, memoryWeight: 0.8, ragWeight: 0.2 }));
        break;
      case 'knowledge-focused':
        setStrategy(prev => ({ ...prev, memoryWeight: 0.3, ragWeight: 0.7 }));
        break;
      case 'recent':
        setStrategy(prev => ({ ...prev, timeDecay: 0.3, relevanceBoost: 0.3 }));
        break;
    }
    toast.success(`已应用${preset}策略`);
  };

  // 获取结果类型颜色
  const getResultTypeColor = (type: string) => {
    return type === 'memory' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
  };

  // 获取分数颜色
  const getScoreColor = (score: number) => {
    if (score >= 0.9) return 'text-green-600';
    if (score >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">融合搜索配置</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            智能融合时序记忆与外部知识，提供精准搜索结果
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <Settings className="h-4 w-4 mr-2" />
          {showAdvanced ? '隐藏高级' : '高级设置'}
        </Button>
      </div>

      {/* 搜索输入区域 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="h-5 w-5 mr-2" />
            融合搜索
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex space-x-2">
              <div className="flex-1">
                <textarea
                  placeholder="输入您的搜索查询..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full min-h-[80px] p-3 border rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) {
                      performSearch();
                    }
                  }}
                />
                <p className="text-xs text-gray-500 mt-1">按 Ctrl+Enter 快速搜索</p>
              </div>
              <Button 
                onClick={performSearch} 
                disabled={loading}
                className="px-6"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                搜索
              </Button>
            </div>

            {/* 项目选择 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">项目</label>
                <Select value={projectId} onValueChange={setProjectId}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择项目" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">默认项目</SelectItem>
                    <SelectItem value="project1">项目 1</SelectItem>
                    <SelectItem value="project2">项目 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">结果数量</label>
                <Input
                  type="number"
                  min="1"
                  max="50"
                  value={strategy.maxResults}
                  onChange={(e) => setStrategy(prev => ({ 
                    ...prev, maxResults: parseInt(e.target.value) 
                  }))}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 预设策略 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="h-5 w-5 mr-2" />
            快速策略
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant="outline"
              onClick={() => applyPreset('balanced')}
              className="justify-start"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              平衡模式
            </Button>
            <Button
              variant="outline"
              onClick={() => applyPreset('memory-focused')}
              className="justify-start"
            >
              <Brain className="h-4 w-4 mr-2" />
              记忆优先
            </Button>
            <Button
              variant="outline"
              onClick={() => applyPreset('knowledge-focused')}
              className="justify-start"
            >
              <Database className="h-4 w-4 mr-2" />
              知识优先
            </Button>
            <Button
              variant="outline"
              onClick={() => applyPreset('recent')}
              className="justify-start"
            >
              <Clock className="h-4 w-4 mr-2" />
              最新优先
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 高级设置 */}
      {showAdvanced && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              高级融合设置
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* 权重配置 */}
              <div>
                <h4 className="font-medium mb-4">融合权重</h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium">记忆权重</label>
                      <span className="text-sm text-gray-500">{strategy.memoryWeight}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={strategy.memoryWeight}
                      onChange={(e) => setStrategy(prev => ({ 
                        ...prev, memoryWeight: parseFloat(e.target.value) 
                      }))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium">知识权重</label>
                      <span className="text-sm text-gray-500">{strategy.ragWeight}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={strategy.ragWeight}
                      onChange={(e) => setStrategy(prev => ({ 
                        ...prev, ragWeight: parseFloat(e.target.value) 
                      }))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* 时间衰减和相关性提升 */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium">时间衰减</label>
                    <span className="text-sm text-gray-500">{strategy.timeDecay}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={strategy.timeDecay}
                    onChange={(e) => setStrategy(prev => ({ 
                      ...prev, timeDecay: parseFloat(e.target.value) 
                    }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <p className="text-xs text-gray-500 mt-1">影响结果的时效性权重</p>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium">相关性提升</label>
                    <span className="text-sm text-gray-500">{strategy.relevanceBoost}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={strategy.relevanceBoost}
                    onChange={(e) => setStrategy(prev => ({ 
                      ...prev, relevanceBoost: parseFloat(e.target.value) 
                    }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <p className="text-xs text-gray-500 mt-1">提升高相关性结果的权重</p>
                </div>
              </div>

              {/* 阈值设置 */}
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium">相似度阈值</label>
                  <span className="text-sm text-gray-500">{strategy.threshold}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={strategy.threshold}
                  onChange={(e) => setStrategy(prev => ({ 
                    ...prev, threshold: parseFloat(e.target.value) 
                  }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <p className="text-xs text-gray-500 mt-1">低于此阈值的结果将被过滤</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 知识源选择 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="h-5 w-5 mr-2" />
            知识源选择
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sources.map((source) => (
              <div key={source.id} className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id={`source-${source.id}`}
                  checked={selectedSources.includes(source.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedSources(prev => [...prev, source.id]);
                    } else {
                      setSelectedSources(prev => prev.filter(id => id !== source.id));
                    }
                  }}
                  className="rounded border-gray-300"
                />
                <label htmlFor={`source-${source.id}`} className="flex-1 cursor-pointer">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{source.name}</span>
                    <Badge variant="outline">{source.type}</Badge>
                  </div>
                </label>
              </div>
            ))}
            {sources.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                暂无可用知识源，请先配置知识源
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 搜索结果 */}
      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>搜索结果</span>
              <Badge variant="secondary">{searchResults.length} 个结果</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {searchResults.map((result, index) => (
                <div key={result.id} className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Badge className={getResultTypeColor(result.type)}>
                        {result.type === 'memory' ? '记忆' : '知识'}
                      </Badge>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {result.source}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-bold ${getScoreColor(result.score)}`}>
                        {result.score.toFixed(3)}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        #{index + 1}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-gray-800 dark:text-gray-200 mb-2 leading-relaxed">
                    {result.content}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-4">
                      <span>原始分数: {result.metadata.originalScore.toFixed(3)}</span>
                      <span>融合权重: {result.metadata.fusionWeight.toFixed(3)}</span>
                    </div>
                    <span>
                      {new Date(result.metadata.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}